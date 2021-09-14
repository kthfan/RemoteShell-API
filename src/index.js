

import {VerifyClient} from "./VerifyClient";
import {FileSystemClient} from "./FileSystemClient";
import {AesCtr} from "./crypto/AesCtr";

export var server = new FileSystemClient();

export function test(token, port="1234", secure){
     return server.connect("http://localhost:" + port, token, secure);
}

// export var server = new VerifyClient();

// export function test(token){
//     return server.establishSecureConnect("http://127.0.0.1:1234",token);
// }

// var key = new Uint8Array([204, 171, 202, 49, 237, 84, 29, 193, 22, 37, 95, 248, 33, 151, 185, 141, 218, 105, 41, 211, 118, 113, 104, 168, 178, 197, 85, 24, 75, 36, 241, 144]);
// // console.log(SHA256.getInstance().encode(key));
// var aesEnc = new AesCtr(key);
// var aesDec = new AesCtr(key);
// var data = new Uint8Array([110, 101, 119, 105, 100, 61, 73, 43, 54, 120, 100, 115, 80, 112, 51, 111, 104, 87, 114, 122, 71, 122, 102, 118, 109, 85, 70, 43, 48, 49, 86, 97, 69, 72, 53, 116, 109, 115, 105, 70, 120, 85, 79, 108, 49, 117, 122, 77, 48, 95, 13, 10, 105, 100, 61, 120, 117, 80, 103, 70, 53, 101, 71, 109, 66, 72, 54, 100, 106, 84, 51, 85, 47, 117, 106, 77, 69, 109, 76, 113, 78, 100, 118, 109, 43, 114, 116, 86, 116, 57, 85, 117, 65, 116, 82, 51, 97, 56, 95, 13, 10, 110, 111, 110, 101, 61]    );
// var encrypted = aesEnc.encrypt(data);
// var decrypted = aesDec.decrypt(encrypted);
// console.log(data, encrypted, decrypted);

// export function test(arr){
//     var rsa = new RSA();
//     arr = new Uint8Array(arr);
//     rsa.publicKey = arr;
//     console.log(arr);
//     console.log(rsa.publicKey, rsa._publicKey);
// } 