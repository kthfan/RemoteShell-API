# RemoteShell-API
Allow browser to access file system and fetch data without considering cors policy. 
## Usage:
### Connect to server:
```javascript
// new instance
var client = new FileSystemClient();

client.connect(
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
var cwd = await client.cwd(); // Get current working directory.
await client.chdir("/home/kthfan/test"); // Change current working directory.

// Directory Listing.
var attrList = await client.listdir("home/kthfan/test/dir1"); // Directory listing.
attrList = await client.listdir(); // List current directory.

// Create File or Directory.
await client.mkdir("./dir2"); // Create directory.
await client.createFile("./dir2/temp.txt"); // Create file.

// Move File or Directory.
await client.move(
  "./dir2/temp.txt", // Source path to move.
  "./dir1/temp.txt" // Destination path to move.
);

// Remove File or Directory.
await client.remove("./dir2"); // Remove file or directory.
await client.removeRecursively("./dir1"); // Remove directory recursively.

// Get File Information
var attr = await client.getFileState( // Get some attribute of file or directory, for example, is exists, is readable, etc.
  "/home/kthfan/test",
  true                          // If true, returns a verbose result. Default value is false.
);

// Set Attribute of File or Directory
await client.setAttribute(
  "/home/kthfan/test",
  { // The attribute to set.
    readOnly: false,
    lastModifiedTime:　1631847618509,
    lastAccessTime: 1631847618509,
    createTime: 1631847618509
  }
);
```
### Read Write
#### Open Mode:
| Option | Description |
| :---: | :---: |
| RemoteFile.OPEN_MODE_READ | Open for read. |
| :---: | :---: |
| RemoteFile.OPEN_MODE_WRITE | Open for write. |
| :---: | :---: |
| RemoteFile.OPEN_MODE_CREATE | Create file, if the file is already exists, then throw the exception. |
| :---: | :---: |
| RemoteFile.OPEN_MODE_CREATE_IF_NOT_EXISTS | Create file if not exists, exception won't throw if the file is already exists. |
| :---: | :---: |
| RemoteFile.OPEN_MODE_DELETE_ON_CLOSE | When close the file, the file will be delete. |
| :---: | :---: |
| RemoteFile.TRUNCATE_EXISTING | The size of file will be truncated to 0. |
```javascript
var file1 = await client.openFile("./file1.txt");

```

