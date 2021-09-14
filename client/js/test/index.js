
import {FileSystemClient} from "../src/FileSystemClient";

export var server = new FileSystemClient();

export function test(token, port="1234", secure){
     return server.connect("http://localhost:" + port, token, secure);
}
