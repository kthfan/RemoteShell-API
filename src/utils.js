

export function fromQueryString(str){
    var result = {};
    var lineList = str.split("&");
    for(var line of lineList){
        var [name, value] = line.split("=");
        if(name != null) result[name] = value ?? "";
    }
    return result;
}
export function toQueryString(obj){
    var result = "";
    var arr = Object.entries(obj);
    var name, value;
    if(arr.length > 0){
        [name, value] = arr[0];
        result += name + "=" + value;
    }
    for(var i=1; i<arr.length; i++){
        [name, value] = arr[i];
        if(value==null || value === "") result += "&" + name;
        else  result += "&" + name + "=" + value;
    }
    return result;
}
export function joinHostQuery(host, queryString){
    if(!host.endsWith("/")) host += "/";
    if(!host.endsWith("?")) host += "?";
    return host + queryString;
}

export function buildHttpRequest(url, obj){
    var method = obj.method ?? "GET";
    var requestTarget = "/"+url.split("/").splice(3).join("/");
    var startLine = `${method} ${requestTarget} HTTP/2\r\n`;
    var headers = "";
    
    for(var [key, val] of Object.entries(obj.headers ?? {})){
        if(val instanceof Array){
            for(var v of val){
                headers += `${key}:${v}\r\n`;
            }
        }else headers += `${key}:${val}\r\n`;
    }

    var body = obj.body ?? "";
    return startLine + headers + "\r\n" + body;
}
export function parseHttpResponse(arr){
    var len = arr.length;
    var result = {
        httpVersion:null,
        statusCode:null,
        reasonPhrase:null,
        headers:{

        },
        body:null
    };
    const decoder = new TextDecoder();
    var lineList = [];
    var lastCRLFIndex = 0;
    for(var i=1; i<len; i++){
        if(arr[i] === 10 && arr[i-1] === 13){ // if requestData[i-1:i+1] = "\r\n"
            if(i-1 === lastCRLFIndex){// if duplicate \r\n occur, then split headers and body
                lastCRLFIndex = i+1;
				result.body =  arr.subarray(lastCRLFIndex, len);
				break;
            }
            var tmpBytes = arr.subarray(lastCRLFIndex, i-1);
            lineList.push(decoder.decode(tmpBytes));
            lastCRLFIndex = i+1;
        }
    }
    
    //parse start line
    var startLine = lineList.shift().split(" ");
    result.httpVersion = startLine[0].split("/")[1];
    result.statusCode = Number.parseInt(startLine[1]);
    result.reasonPhrase = startLine[2];
    //parse headers
    var headers = result.headers;
    for(var line of lineList){
        line = line.split(":");
        if(line.length === 2){
            var [key, val] = line;
            headers[key] = headers[key] ?? [];
            headers[key].push(val);
        }else if(line.length === 1){
            headers[line[0]] = headers[line[0]] ?? [];
        }
    }
    return result;
}
export function getDefaultHttpRequest(url){
    return {
        method: "GET",
        headers:{
            "Host": url.split("/")[2],
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "zh-TW,zh;q=0.8,en-US;q=0.5,en;q=0.3",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0"
        }
    };
}

export function byteArrayToLong(arr){
    return Number(new BigInt64Array(arr.slice().buffer)[0]);
}
export function longToByteArray(num){
    return new Uint8Array(new BigInt64Array([BigInt(num)]).buffer);
}
export function byteArrayToShort(arr){
    return new Uint16Array(arr.slice().buffer)[0];
}
export function shortToByteArray(num){
    return new Uint8Array(new Uint16Array([num]).buffer);
}
