
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
    
    /**
     * While write or transfer data to the server, these operations will be blocked in
     * buffer. After period of time or specific number of operations, buffer will 
     * automatically flush and send these operations to server.
     * If RemoteFile.flush called, buffer will flush immediately.
     * @param {FileSystemClient} fileSystemClient 
     * @returns {Promise<number>} Number of flushed operations.
     */
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

    
    _pushOperationBuffer(list){
        RemoteFile.operationBuffer.push(list);
        if(RemoteFile.operationBuffer.length >= 250) this.flush();
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
        this._pushOperationBuffer([RemoteFile.OPERATION_READ_ALL, this._idBytes.slice()]);
    }
    _readRange(position, length){
        this._pushOperationBuffer([
            RemoteFile.OPERATION_READ_ALL,
            this._idBytes.slice(),
            longToByteArray(position),
            longToByteArray(length)
        ]);
    }

    _transferRange(destIdBytes, srcPosition, destPosition, length){
        this._pushOperationBuffer([
            RemoteFile.OPERATION_TRANSFER_RANGE,
            this._idBytes.slice(),
            destIdBytes,
            longToByteArray(srcPosition),
            longToByteArray(destPosition),
            longToByteArray(length)
        ]);
    }

    _writeAll(data){
        this._pushOperationBuffer([
            RemoteFile.OPERATION_OVERWRITE_ALL,
            this._idBytes.slice(),
            longToByteArray(data.byteLength),
            data
        ]);
    }
    _writeRange(position, data){
        this._pushOperationBuffer([
            RemoteFile.OPERATION_OVERWRITE_RANGE,
            this._idBytes.slice(),
            longToByteArray(position),
            longToByteArray(data.byteLength),
            data
        ]);
    }
    _appendAll(data){
        this._pushOperationBuffer([
            RemoteFile.OPERATION_APPEND,
            this._idBytes.slice(),
            longToByteArray(data.byteLength),
            data
        ]);
    }

     /**
     * Read a section of data and write it to other file.
     * @param {RemoteFile} destFile File to write.
     * @param {number} srcPosition Start position in file that is to be read.
     * @param {number} destPosition Position which data will be write, which in file that is to be write.
     * @param {number} length Length of data to be read and write.
     * @returns Length of bytes transferred.
     */
    transferTo(destFile, srcPosition, destPosition, length){
        this._transferRange(destFile._idBytes, srcPosition, destPosition, length);
        return this._futureData();
    }

    /**
     * Write a section of data that read from other file.
     * @param {RemoteFile} srcFile File to read.
     * @param {number} srcPosition Start position in file that is to be read.
     * @param {number} destPosition Position which data will be write, which in file that is to be write.
     * @param {number} length Length of data to be read and write.
     * @returns Length of bytes transferred.
     */
    transferFrom(srcFile, srcPosition, destPosition, length){
        srcFile._transferRange(this._idBytes, srcPosition, destPosition, length);
        return this._futureData();
    }

    /**
     * Read section of data from the file. If both position and length are null, then read entire file.
     * @param {number} position Position where data will be read.
     * @param {number} length Length of data to be read.
     * @returns {Promise<Uint8Array>}
     */
    read(position=null, length=null){
        if(position == null && length == null)
            this._readAll();
        else this._readRange(position, length);
        this.flush();
        return this._futureData();
    }

    /**
     * Write data to the file. If position not specified, then position will be zero.
     * @param {Uint8Array} data 
     * @param {number} position The number of bytes from the beginning of the file which data will be write. 
     * @returns {Promise<number>} Length of bytes written.
     */
    write(data, position=null){
        if(position == null)
            this._writeAll(data);
        else this._writeRange(position, data);
        return this._futureData();
    }

    /**
     * Write data to the end of file.
     * @param {Uint8Array} data
     * @returns {Promise<number>} Length of bytes written.
     */
    append(data){
        this._appendAll(data);
        return this._futureData();
    }

    /**
     * While write or transfer data to the server, these operations will be blocked in
     * buffer. After period of time or specific number of operations, buffer will 
     * automatically flush and send these operations to server.
     * If flush, close or read called, buffer will flush immediately.
     * 
     * @returns {Promise<number>} Number of flushed operations.
     */
    flush(){
        return RemoteFile.flush(this.fileSystemClient);
    }

    /**
     * Close RemoteFile.
     * @returns {Promise<null>}
     */
    close(){
        return this.fileSystemClient.closeFile(this);
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

    /**
     * Connect to server.
     * 
     * @param {string} host Host of server.
     * @param {string} token Token generated by server.
     * @param {boolean} secure If true, the data will be encrypted.
     * @returns {Promise<undefined>}
     */
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
    /**
     * Get current working directory.
     * @returns {Promise<string>}
     */
    cwd(){
        return this._send(FileSystemClient.CWD)
            .then(arr=>this._dec.decode(arr));
    }

    /**
     * Change current working directory.
     * @param {string} path Directory to change.
     * @returns {Promise<null>}
     */
    chdir(path){
        return this._send(FileSystemClient.CHDIR, this._enc.encode(path))
            .then(arr=>null);
    }

    /**
     * Directory listing.
     * @param {string} path Directory to list. If path is empty, then list current working directory.
     * @returns {Promise<RemoteFileAttribute[]>}
     */
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

    /**
     * Remove file or directory.
     * @param {string} path File or directory to remove.
     * @returns {Promise<null>}
     */
    remove(path){
        return this._send(FileSystemClient.REMOVE, this._enc.encode(path))
        .then(arr=>null);
    }

    /**
     * Remove directory recursively.
     * @param {string} path Directory to remove.
     * @returns {Promise<null>}
     */
    removeRecursively(path){
        return this._send(FileSystemClient.RMDIR, this._enc.encode(path))
        .then(arr=>null);
    }

    /**
     * Create directory.
     * @param {string} path Directory to create.
     * @returns {Promise<null>}
     */
    mkdir(path){
        return this._send(FileSystemClient.MKDIR, this._enc.encode(path))
        .then(arr=>null);
    }

    /**
     * Create file.
     * @param {string} path File to create.
     * @returns {Promise<null>}
     */
    createFile(path){
        return this._send(FileSystemClient.MKFILE, this._enc.encode(path))
        .then(arr=>null);
    }

    /**
     * Move file or directory.
     * @param {string} from Source path to move.
     * @param {string} to Destination path to move. 
     * @returns {Promise<null>}
     */
    move(from, to){
        return this._send(FileSystemClient.MOVE, this._enc.encode(from + "|" + to))
        .then(arr=>null);
    }

    /**
     * Get some attribute of file or directory, for example, is exists, is readable, etc.
     * @param {string} path Path of file.
     * @param {boolean} verbose If true, returns a verbose result. Default value is false.
     * @returns {Promise<RemoteFileAttribute>}
     */
    getFileState(path, verbose=false){
        var mode = verbose ?
             FileSystemClient.FILE_STATE : FileSystemClient.FILE_STATE_SIMPLE;
        return this._send(mode, path)
            .then(arr=>this._dec.decode(arr))
            .then(str=>JSON.parse(str))
            .then(list=>new RemoteFileAttribute(list));
        
    }

    /**
     * Open a file in server, and returns RemoteFile for operation,
     * @param {string} path File to open.
     * @param {number} mode Open mode defined in RemoteFile, OPEN_MODE_READ, OPEN_MODE_WRITE, etc.
     * @returns {Promise<RemoteFile>}
     */
    openFile(path, ...modes){
        var mode = 0;
        for(var m of modes) mode |= m;
        var futureId = this._send(FileSystemClient.OPEN_FILE, new Uint8Array([mode]), this._enc.encode(path))
        .then(arr=>this._dec.decode(arr));
        return futureId.then(id => {
            return new RemoteFile(id, this);
        });
    }

    /**
     * Close RemoteFile.
     * @param {RemoteFile} file File to close.
     * @returns {Promise<null>}
     */
    closeFile(file){
        RemoteFile.flush(this);
        return this._send(FileSystemClient.CLOSE_FILE, this._enc.encode(file.id))
        .then(arr=>null);
    }

    _fileOp(...payload){
        return this.connectContext.request([new Uint8Array([FileSystemClient.FILE_OP]), ...payload]);
    }

    /**
     * Download and save files from url.
     * @param  {...{fileName:string, url:string, opt?: {method:string, body:Uint8Array | string, headers:{[key:string]: string}}}} downloadOpts 
     * @returns {Promise<Promise<{url: string,fileName: string, contentLength:number}>[]>} Response list of downloaded files.
     */
    curl(...downloadOpts){
        var req = [];
        var requestNumbers = shortToByteArray(downloadOpts.length);
        req.push(requestNumbers);
        // var i=0;
        console.log(downloadOpts);
        for(var {fileName, url, opt} of downloadOpts){
            var fn = fileName;
            var opt = opt ?? getDefaultHttpRequest(url);
            var [headers, body] = buildHttpRequest(url, opt);

            var urlLen = shortToByteArray(url.length);
            var fnLen = shortToByteArray(fn.length);
            var bodyLen =  longToByteArray(opt.body?.length ?? 0);

            req.push(urlLen);
            req.push(this._enc.encode(url));
            req.push(fnLen);
            req.push(this._enc.encode(fn));
            req.push(bodyLen);
            req.push(this._enc.encode(headers));
            req.push(body);
            // i++;
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

    /**
     * Fetch url and get it's headers, body, etc.
     * @param {string} url 
     * @param {{method:string, body:Uint8Array | string, headers:{[key:string]: string}}} opt Information of headers and body.
     * @returns {Promise<{httpVersion:string, statusCode:number, reasonPhrase:string, headers:{[key:string]: string}, body:Uint8Array}>}
     */
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

    /**
     * Set read-only, last modified time, last access time and create time of file or directory.
     * @param {string} path 
     * @param {{readOnly?:boolean, lastModifiedTime?:number, lastAccessTime?:number, createTime?:number}} attr 
     * @returns {Promise<null>}
     */
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
