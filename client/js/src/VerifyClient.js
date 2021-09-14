
import {toQueryString, joinHostQuery} from "./utils";
import {RSA} from "./crypto/RSA";
import {AesCtr} from "./crypto/AesCtr";

export class ConnectContext{
    id = null;
    url = "";
    rsa = null;
    aesEncrypt = null;
    aesDecrypt = null;
    isSecure = false;
    _idBytes = null;
    _endEstablish(host="", token){
        var paramObj = {};
        paramObj[VerifyClient.QUERY_NAME_TOKEN] = token;
        paramObj[VerifyClient.QUERY_NAME_SECURE] = String(this.isSecure);
        paramObj[VerifyClient.QUERY_NAME_ESTABLISH] = "false";
        var queryString = toQueryString(paramObj);
        this.url = joinHostQuery(host, queryString);

        this._idBytes = new TextEncoder().encode(this.id);
    }

    request(bytesList, copyContent = false){
        var id = this._idBytes.slice();
        if(this.isSecure){
            id = this.aesEncrypt.encrypt(id, copyContent);
            for(var i=0; i<bytesList.length; i++){
                bytesList[i] = this.aesEncrypt.encrypt(bytesList[i], copyContent);
            }
        }
        var postBody = new Blob([new Uint8Array([id.length]), id, ...bytesList]);
        
        return fetch(this.url, {
            method: "POST",
            body: postBody,
            mode:"cors"
        }).then(r=>r.arrayBuffer()).then(buf=>new Uint8Array(buf))
        .then(arr=>{
            return this.isSecure ? this.aesDecrypt.decrypt(arr, false) : arr;
        });
        
    }
}

export class VerifyClient{
    static QUERY_NAME_TOKEN = "token";
	static QUERY_NAME_SECURE = "secure";
	static QUERY_NAME_ESTABLISH = "establish";

    _publicKey = null;
    contextMap = new Map();

    _splitSecureData(bytes, n) {
		var result = {};
		var count = 0;
		var lastOffset = 0;
		var lastEqualOffset = 0;
        const decoder = new TextDecoder();
		for(var i=1; i<bytes.length; i++) {
			if(bytes[i] == 61) { // "="
				lastEqualOffset = i;
			} else if(bytes[i-1] == 13 && bytes[i] == 10) { // "\r\n"
				result[decoder.decode(bytes.subarray(lastOffset, lastEqualOffset))]
					= decoder.decode(bytes.slice(lastEqualOffset+1, i-1));
				count++;
				lastOffset = i+1;
				if(count >= n) break;
			}
		}
		for(var i=lastOffset; i<bytes.length; i++) {
			if(bytes[i] == 61) { // "="
				lastEqualOffset = i;
                result[decoder.decode(bytes.subarray(lastOffset, lastEqualOffset))]
					= bytes.slice(lastEqualOffset+1, bytes.length);
				break;
			}
		}
		return result;
	}
	_joinSecureData(keys, vals, data) {// [id, pubkey]  [fdkbcds]  pubkey
        const encoder = new TextEncoder();
		var totalLen = data.length + keys[keys.length-1].length + 1;
		for(var i=0; i<vals.length; i++) {
			totalLen += keys[i].length + vals[i].length + 3;
		}
		var result = new Uint8Array(totalLen);
		var offset = 0;
		for(var i=0; i<vals.length; i++) {
			var s = keys[i] + "=" + vals[i] + "\r\n";
			result.set(encoder.encode(s), offset);
			offset += s.length;
		}
        var s = keys[keys.length-1] + "=";
		result.set(encoder.encode(s), offset);
		offset += s.length;
		result.set(data, offset);
		return result;
		
	}
    set publicKey(pubkey){
        this._publicKey = pubkey;
    }
    get publicKey(){
        return this._publicKey;
    }
    establishNormalConnect(host, token){
        var paramObj = {};
        paramObj[VerifyClient.QUERY_NAME_TOKEN] = token;
        paramObj[VerifyClient.QUERY_NAME_SECURE] = "false";
        paramObj[VerifyClient.QUERY_NAME_ESTABLISH] = "true";
        var queryString = toQueryString(paramObj);
        var context = new ConnectContext();
        return fetch(joinHostQuery(host, queryString), {mode:"cors"})
        .then(r=>{
            if(r.status != 200) throw `Status code: ${r.status} ${r.statusText}`;
            return r;
        })
        .then(r=>r.arrayBuffer()).then(buf=>new Uint8Array(buf))
        .then(arr => {
            var idMap = this._splitSecureData(arr, 1);
            context.id = idMap["id"];
            this.contextMap.set(context.id, context);
            context._endEstablish(host, token);
            return context;
        });
    }
    establishSecureConnect(host, token){
        var paramObj = {};
        paramObj[VerifyClient.QUERY_NAME_TOKEN] = token;
        paramObj[VerifyClient.QUERY_NAME_SECURE] = "true";
        paramObj[VerifyClient.QUERY_NAME_ESTABLISH] = "true";
        var queryString = toQueryString(paramObj);
        var context = new ConnectContext();
        return fetch(joinHostQuery(host, queryString), {mode:"cors"})
        .then(r=>{
            if(r.status != 200) throw `Status code: ${r.status} ${r.statusText}`;
            return r;
        })
        .then(r=>r.arrayBuffer()).then(buf=>new Uint8Array(buf))
        .then(arr=> this._splitSecureData(arr, 1))
        .then(rsaMap=>{

            context.isSecure = true;
            context.id = rsaMap["id"];
            
            var rsa =  new RSA();
            rsa.publicKey = rsaMap["pubkey"]; //id=[id]\r\npubkey=
            context.rsa = rsa;

            //check public key is correct if necessary
            if(this._publicKey != null){
                var pubkey =  rsa.publicKey;
                for(var i=0; i<this._publicKey.length; i++){
                    if(pubkey[i] !== this._publicKey[i]) 
                        throw "Public key unmatch.";
                }
            }
            

            var aesKey = crypto.getRandomValues(new Uint8Array(32));
            var aesEncrypt = new AesCtr(aesKey);
            var aesDecrypt = new AesCtr(aesKey);
            context.aesEncrypt = aesEncrypt;
            context.aesDecrypt = aesDecrypt;

            this.contextMap.set(context.id, context);

            var encryptedAesKey = rsa.encrypt(aesKey);
            return this._joinSecureData(["id", "aesKey"], [context.id], encryptedAesKey);
        })
        .then(key => fetch(joinHostQuery(host, queryString), {
            method: "POST",
            body: new Blob([key.buffer]) 
        })).then(r=>r.arrayBuffer()).then(buf=>new Uint8Array(buf))
        .then(arr=>context.aesDecrypt.decrypt(arr)).then(arr=>this._splitSecureData(arr, 2))
        .then(newIdMap=>{

            this.contextMap.delete(newIdMap["id"]);
            context.id = newIdMap["newid"];
            this.contextMap.set(newIdMap["newid"], context);
            context._endEstablish(host, token);
            return context;
        });
    }
}