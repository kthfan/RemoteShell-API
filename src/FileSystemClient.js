
import {VerifyClient} from "./VerifyClient";
import {
    buildHttpRequest,
    parseHttpResponse,
    getDefaultHttpRequest,
    byteArrayToLong, 
    longToByteArray, 
    byteArrayToShort, 
    shortToByteArray
} from "./utils";

export class RemoteFile{
    static OPEN_MODE_READ = 1;
    static OPEN_MODE_WRITE = 2;
    // static OPEN_MODE_APPEND = 4;
    static OPEN_MODE_CREATE = 8;
    static OPEN_MODE_CREATE_IF_NOT_EXISTS = 16;
    static OPEN_MODE_DELETE_ON_CLOSE = 32;
    static TRUNCATE_EXISTING = 64;
    
    static OPERATION_READ_ALL = 2;
    static OPERATION_READ_RANGE = 3;
    static OPERATION_OVERWRITE_ALL = 4;
    static OPERATION_OVERWRITE_RANGE = 5;
    static OPERATION_APPEND = 6;
    // static OPERATION_TRANSFER_ALL = 7;
    static OPERATION_TRANSFER_RANGE = 8;

    static operationBuffer = [];
    static resolveList = [];
    static rejectList = [];
    static flushTimeout = null;
    static isFlushed = true;

    static _enc = new TextEncoder();
    static _dec = new TextDecoder();

    id = null;
    _idBytes = null;
    fileSystemClient = null;
    
    static flush(fileSystemClient){
        if(RemoteFile.isFlushed === true) return;
        RemoteFile.isFlushed = true;
        clearTimeout(RemoteFile.flushTimeout);

        var payload = RemoteFile._compileOperation();
        return fileSystemClient._fileOp(...payload).then(arr => {
            var payloadList = RemoteFile._splitResponsePayload(arr);
            for(var i=0; i<RemoteFile.resolveList.length; i++){
                
                if(payloadList[i][0] === 0)
                    RemoteFile.resolveList[i](payloadList[i][2]);
                else
                    RemoteFile.rejectList[i](payloadList[i][1]);
            }
            RemoteFile.resolveList = [];
            RemoteFile.rejectList = [];

            return payloadList.length;
        });
    }
    static _compileOperation(){
        for(var op of RemoteFile.operationBuffer){
            op[0] = new Uint8Array([op[0]]);
        }
        var result = RemoteFile.operationBuffer.flat();
        RemoteFile.operationBuffer = [];
        return result;
    }
    static _splitResponsePayload(arr){
        var payloadList = [];
        var i=0;
        var mode;
        var payload;
        while(i<arr.byteLength){
            mode = arr[i++];
            switch(mode){
                case RemoteFile.OPERATION_READ_ALL: // should be end of list.
                case RemoteFile.OPERATION_READ_RANGE:
                    var readLen = byteArrayToLong(arr.subarray(arr.byteLength-8, arr.byteLength));
                    var readData =  arr.subarray(i, i + readLen);
                    i += readLen;

                    payload = FileSystemClient._solveFileResult(arr.subarray(i), true);
                    payload[2] = readData;
                    payloadList.push(payload);
                    // note that i is not yet reach arr.byteLength
                    return payloadList;
                case RemoteFile.OPERATION_OVERWRITE_ALL:
                case RemoteFile.OPERATION_OVERWRITE_RANGE:
                case RemoteFile.OPERATION_TRANSFER_RANGE:
                case RemoteFile.OPERATION_APPEND:
                    payload = FileSystemClient._solveFileResult(arr.subarray(i), true);
                    i += 2 + payload[1].length + 8;
                    payload[2] = byteArrayToLong(payload[2]);
                    payloadList.push(payload);
                    i += 8;
                    break;
                default:
                    throw ('invalid code: ' + mode);
                    break;
            }
        }
        return payloadList;
    }
    

    constructor(id, fileSystemClient){
        this.fileSystemClient = fileSystemClient;
        this.id = id;
        this._idBytes = RemoteFile._enc.encode(id);
        this._idBytes = new Uint8Array([this._idBytes.byteLength, ...this._idBytes]);
    }

    

    _futureData(){
        if(RemoteFile.isFlushed == true) {
            RemoteFile.flushTimeout = setTimeout(() => {
                this.flush();
            }, 200);
        }
        RemoteFile.isFlushed = false;
        return new Promise(function(resolve, reject){
            RemoteFile.resolveList.push(resolve);
            RemoteFile.rejectList.push(reject);
            
        });
    }

    _readAll(){

        RemoteFile.operationBuffer.push([RemoteFile.OPERATION_READ_ALL, this._idBytes.slice()]);
    }
    _readRange(position, length){
        RemoteFile.operationBuffer.push([
            RemoteFile.OPERATION_READ_ALL,
            this._idBytes.slice(),
            longToByteArray(position),
            longToByteArray(length)
        ]);
    }

    _transferRange(destIdBytes, srcPosition, destPosition, length){
        RemoteFile.operationBuffer.push([
            RemoteFile.OPERATION_TRANSFER_RANGE,
            this._idBytes.slice(),
            destIdBytes,
            longToByteArray(srcPosition),
            longToByteArray(destPosition),
            longToByteArray(length)
        ]);
    }

    _writeAll(data){
        RemoteFile.operationBuffer.push([
            RemoteFile.OPERATION_OVERWRITE_ALL,
            this._idBytes.slice(),
            longToByteArray(data.byteLength),
            data
        ]);
    }
    _writeRange(position, data){
        RemoteFile.operationBuffer.push([
            RemoteFile.OPERATION_OVERWRITE_RANGE,
            this._idBytes.slice(),
            longToByteArray(position),
            longToByteArray(data.byteLength),
            data
        ]);
    }
    _appendAll(data){
        RemoteFile.operationBuffer.push([
            RemoteFile.OPERATION_APPEND,
            this._idBytes.slice(),
            longToByteArray(data.byteLength),
            data
        ]);
    }

    transferTo(destFile, srcPosition, destPosition, length){
        this._transferRange(destFile._idBytes, srcPosition, destPosition, length);
        return this._futureData();
    }

    transferFrom(srcFile, srcPosition, destPosition, length){
        srcFile._transferRange(this._idBytes, srcPosition, destPosition, length);
        return this._futureData();
    }

    read(position=null, length=null){
        if(position == null && length == null)
            this._readAll();
        else this._readRange(position, length);
        this.flush();
        return this._futureData();
    }

    write(data, position=null){
        if(position == null)
            this._writeAll(data);
        else this._writeRange(position, data);
        return this._futureData();
    }
    append(data){
        this._appendAll(data);
        return this._futureData();
    }

    flush(){
        RemoteFile.flush(this.fileSystemClient );
    }

    close(){
        this.flush();
        this.fileSystemClient.closeFile(this);
    }
}

export class FileSystemClient{
    static CWD = 2;
    static CHDIR = 3;
    static LISTDIR = 4;
    static REMOVE = 5;
    static RMDIR = 6;
    static MKDIR = 7;
    static MKFILE = 8;
    static MOVE = 9;
    static OPEN_FILE = 10;
    static CLOSE_FILE = 11;
    static FILE_OP = 12;
    // static TERMINATE_SERVER = 13;
    static FILE_STATE = 14;
    static FILE_STATE_SIMPLE = 15;
    static CURL = 16;
    static FETCH = 17;
    static SET_ATTRIBUTE = 18;

    verifyClient = new VerifyClient();
    connectContext = null;
    _enc = new TextEncoder();
    _dec = new TextDecoder();
    constructor(){

    }

    connect(host, token, secure = true){
        if(secure){
            return this.verifyClient.establishSecureConnect(host, token)
            .then(context => {this.connectContext = context});
        }else{
            return this.verifyClient.establishNormalConnect(host, token)
            .then(context => {this.connectContext = context});
        }
        
    }

    static _solveFileResult(arr, suppress = false){
        var errorCode = arr[0];
        var messageLen = arr[1];
        var message = arr.subarray(2, 2 + messageLen);
        var payloadLen = byteArrayToLong(arr.subarray(2 + messageLen, 2 + messageLen + 8));
        var payload = arr.subarray(2 + messageLen + 8 , 2 + messageLen + 8 + payloadLen);

        message = RemoteFile._dec.decode(message);
        if(errorCode !== 0 && !suppress) throw message;
        return [errorCode, message, payload];
    }

    _parseFileAttr(list){
        return 
    }
    _send(code, ...body){
        var result;
        if(body.length == 0) 
            result = this.connectContext.request([new Uint8Array([code])]);
        else
            result = this.connectContext.request([new Uint8Array([code]), ...body]);
        return result.then(arr=>FileSystemClient._solveFileResult(arr)[2]);
    }
    cwd(){
        return this._send(FileSystemClient.CWD)
            .then(arr=>this._dec.decode(arr));
    }
    chdir(path){
        return this._send(FileSystemClient.CHDIR, this._enc.encode(path))
            .then(arr=>this._dec.decode(arr));
    }
    listdir(path=null){
        var result;
        if(path == null)
            result = this._send(FileSystemClient.LISTDIR);
        else 
            result = this._send(FileSystemClient.LISTDIR, this._enc.encode(path));
        return result
            .then(arr=>this._dec.decode(arr))
            .then(str=>JSON.parse(str))
            .then(arr=>arr.map(e=>new RemoteFileAttribute(e)));;
    }
    remove(path){
        return this._send(FileSystemClient.REMOVE, this._enc.encode(path))
        .then(arr=>this._dec.decode(arr));
    }
    removeRecursive(path){
        return this._send(FileSystemClient.RMDIR, this._enc.encode(path))
        .then(arr=>this._dec.decode(arr));
    }
    mkdir(path){
        return this._send(FileSystemClient.MKDIR, this._enc.encode(path))
        .then(arr=>this._dec.decode(arr));
    }
    createFile(path){
        return this._send(FileSystemClient.MKFILE, this._enc.encode(path))
        .then(arr=>this._dec.decode(arr));
    }
    move(from, to){
        return this._send(FileSystemClient.MOVE, this._enc.encode(from + "|" + to))
        .then(arr=>this._dec.decode(arr));
    }
    getFileState(path, verbose=false){
        var mode = verbose ?
             FileSystemClient.FILE_STATE : FileSystemClient.FILE_STATE_SIMPLE;
        return this._send(mode, path)
            .then(arr=>this._dec.decode(arr))
            .then(str=>JSON.parse(str))
            .then(list=>new RemoteFileAttribute(list));
        
    }
    openFile(path, mode){
        var futureId = this._send(FileSystemClient.OPEN_FILE, new Uint8Array([mode]), this._enc.encode(path))
        .then(arr=>this._dec.decode(arr));
        return futureId.then(id => {
            return new RemoteFile(id, this);
        });
    }
    closeFile(file){
        return this._send(FileSystemClient.CLOSE_FILE, this._enc.encode(file.id))
        .then(arr=>this._dec.decode(arr));
    }

    _fileOp(...payload){
        return this.connectContext.request([new Uint8Array([FileSystemClient.FILE_OP]), ...payload]);
    }

    curl(urlFileNamePairs, opts=[]){
        var req = [];
        var requestNumbers = shortToByteArray(Object.keys(urlFileNamePairs).length);
        req.push(requestNumbers);
        var i=0;
        for(var [url, fn] of Object.entries(urlFileNamePairs)){
            var opt = opts[i] ?? getDefaultHttpRequest(url);
            var headers = buildHttpRequest(url, opt);

            var urlLen = shortToByteArray(url.length);
            var fnLen = shortToByteArray(fn.length);
            var bodyLen =  longToByteArray(opt.body?.length ?? 0);

            req.push(urlLen);
            req.push(this._enc.encode(url));
            req.push(fnLen);
            req.push(this._enc.encode(fn));
            req.push(bodyLen);
            req.push(this._enc.encode(headers));
            i++;
        }
        
        return this.connectContext.request([
            new Uint8Array([FileSystemClient.CURL]),
            ...req
        ]).then(arr=>{
            var i=0;
            var result = [];
            while(i<arr.byteLength){
                result.push(new Promise((resolve, reject)=>{
                    var payload = FileSystemClient._solveFileResult(arr.subarray(i), true);
                    i += 2 + payload[1].length + 8 + payload[2].length;
                    var fnLen = byteArrayToShort(arr.subarray(i, i+2));
                    i += 2;
                    var fileName = arr.subarray(i, i+fnLen);
                    i += fnLen;
                    var contentLength = byteArrayToLong(arr.subarray(i, i+8));
                    i += 8;
                    if(payload[0] === 0)
                        resolve({
                            url: this._dec.decode(payload[2]),
                            fileName: this._dec.decode(fileName),
                            contentLength
                        });
                    else 
                        reject(payload[1]);
                }));
            }
            return result;
        });
    }
    fetch(url, opt=getDefaultHttpRequest(url)){
        var req = [];
        var headers = buildHttpRequest(url, opt);

        var urlLen = shortToByteArray(url.length);
        var bodyLen =  longToByteArray(opt.body?.length ?? 0);
        

        return this.connectContext.request([
            new Uint8Array([FileSystemClient.FETCH]),
            urlLen,
            this._enc.encode(url),
            bodyLen,
            this._enc.encode(headers)
        ]).then(arr=>{
            var contentLength = byteArrayToLong(arr.subarray(arr.byteLength-8, arr.byteLength));
            var payload = FileSystemClient._solveFileResult(arr.subarray(contentLength));
            var responseObj = parseHttpResponse(arr.subarray(0, contentLength));
            // var dblCRLF = 0;
            // var [i1, i2, i3, i4] = [arr[0], arr[1], arr[2], arr[3]];
            // for(var i = 3; i<arr.byteLength; i++){
            //     i4 = arr[i];
            //     if(i1 === 13 && i2 === 10 && i3 === 13 && i4 === 10) dblCRLF = i+1;
            //     [i1, i2, i3] = [i2, i3, i4];
            // }
            // var payload = FileSystemClient._solveFileResult(arr.subarray(dblCRLF + contentLength));
            return responseObj;
        });
    }
    setAttribute(path, attr={}){
        var readOnly = new Uint8Array(2);
        var toSetTime = new Uint8Array(3);
        var lastModifiedTime = new Uint8Array(8);
        var lastAccessTime = new Uint8Array(8);
        var createTime = new Uint8Array(8);
        if(attr.readOnly != null){
            readOnly[0] = 1; // to setReadOnly
            readOnly[1] = attr.readOnly ? 1 : 0;
        }
        if(attr.lastModifiedTime != null) {
            toSetTime[0] = 1;
            lastModifiedTime = longToByteArray(attr.lastModifiedTime);
        }
        if(attr.lastAccessTime != null) {
            toSetTime[1] = 1;
            lastAccessTime = longToByteArray(attr.lastAccessTime);
        }
        if(attr.createTime != null) {
            toSetTime[2] = 1;
            createTime = longToByteArray(attr.createTime);
        }
        return this._send(
            FileSystemClient.SET_ATTRIBUTE,
            shortToByteArray(path.length),
            this._enc.encode(path),
            readOnly,
            toSetTime,
            lastModifiedTime,
            lastAccessTime,
            createTime
        ).then(arr=>null);
    }
    test(path){
        return this._send(0, new Uint8Array([55,56,57]))
        .then(arr=>this._dec.decode(arr));
    }
}

class RemoteFileAttribute{
    _list;
    constructor(list = []){
        this._list = list.map(e => (e == null ? null : e));
    }
    get isExists(){
        return this._list[0] === 1;
    }
    get fileName(){
        return this._list[1];
    }
    get isDirectory(){
        return this._list[2] === "d";
    }
    get isRegularFile(){
        return this._list[2] === "-";
    }
    get isSymbolicLink(){
        return this._list[2] === "l";
    }
    get isReadable(){
        return (this._list[3] & 4) !== 0;
    }
    get isWritable(){
        return (this._list[3] & 2) !== 0;
    }
    get isExecutable(){
        return (this._list[3] & 1) !== 0;
    }
    get size(){
        return this._list[4];
    }
    get owner(){
        return this._list[5];
    }
    get isHidden(){
        return this._list[6] === 1;
    }
    get creationTime(){
        return this._list[7];
    }
    get lastAccessTime(){
        return this._list[8];
    }
    get lastModifiedTime(){
        return this._list[9];
    }
    toString(){
        var [r, w, x] = ['-', '-', '-'];
        if(this.isReadable) r = 'r';
        if(this.isWritable) w = 'w';
        if(this.isExecutable) x = 'x';
        var result = `${this._list[2]}${r}${w}${x}`;
        if(this.isExists === null || this.isExists === false)
            return result + "\r\nExists: false";
        result += "\r\nExists: true";
        if(this.fileName != null) result += `\r\nFile Name: ${this.fileName}`;
        if(this.size != null) result += `\r\nSize: ${this.size}`;
        if(this.owner != null) result += `\r\nOwner: ${this.owner}`;
        if(this.isHidden != null) result += `\r\nHidden: ${this.isHidden}`;
        if(this.creationTime != null) result += `\r\nCreation Time: ${new Date(this.creationTime).toString()}`;
        if(this.lastAccessTime != null) result += `\r\nLast Access Time: ${new Date(this.lastAccessTime).toString()}`;
        if(this.lastModifiedTime != null) result += `\r\nLast Modified Time: ${new Date(this.lastModifiedTime).toString()}`;
        return result;
    }
}
