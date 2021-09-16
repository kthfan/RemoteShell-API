# RemoteShell-API
Allow browser to access file system and fetch data without considering cors policy. 
## Usage:
### Connect to server:
```javascript
// new instance
var fileSystemClient = new FileSystemClient();

fileSystemClient.connect(
  "http://localhost:8080",                        // Host of server.
  "1M2Lq6j4NK-7qWa3BuE0GhigjszWY4Qfgg86DJQGQeI_", // Token generated by server.
  true                                            // Whether the connect will be encrypt, default is true.
).catch(e=>{
  // Exception thrown when connection fail.
  console.error(e);
});
```

### Basic Operation:

##### cwd() : Promise<string>
Get current working directory.
