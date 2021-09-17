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
```javascript
// Current Directory.
var cwd = await fileSystemClient.cwd(); // Get current working directory.
await fileSystemClient.chdir("/home/kthfan/test"); // Change current working directory.

// Directory Listing.
var attrList = await fileSystemClient.listdir("home/kthfan/test/dir1"); // Directory listing.
attrList = await fileSystemClient.listdir(); // List current directory.

// Create File or Directory.
await fileSystemClient.mkdir("./dir2"); // Create directory.
await fileSystemClient.createFile("./dir2/temp.txt"); // Create file.

// Move file or directory.
await fileSystemClient.move(
  "./dir2/temp.txt", // Source path to move.
  "./dir1/temp.txt" // Destination path to move.
);
```

