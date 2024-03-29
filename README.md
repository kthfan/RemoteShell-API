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
#### Current Directory
```javascript
// Get current working directory.
var cwd = await client.cwd(); 

// Change current working directory.
await client.chdir("/home/kthfan/test"); 
```
#### Directory Listing
```javascript
// Directory listing.
var attrList = await client.listdir("home/kthfan/test/dir1"); 
// List current directory.
attrList = await client.listdir(); 
```
#### Create File or Directory
```javascript
await client.mkdir("./dir2"); // Create directory.
await client.createFile("./dir2/temp.txt"); // Create file.
```
#### Move File or Directory
```javascript
await client.move(
  "./dir2/temp.txt", // Source path to move.
  "./dir1/temp.txt" // Destination path to move.
);
```
#### Remove File or Directory
```javascript
await client.remove("./dir2"); // Remove file or directory.
await client.removeRecursively("./dir1"); // Remove directory recursively.
```
#### Get File Information
```javascript
// Get some attribute of file or directory, for example, is exists, is readable, etc.
var attr = await client.getFileState(
  "/home/kthfan/test",
  true  // If true, returns a verbose result. Default value is false.
);
```
#### Set Attribute of File or Directory
```javascript
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
| :--- | :--- |
| RemoteFile.OPEN_MODE_READ | Open for read. |
| RemoteFile.OPEN_MODE_WRITE | Open for write. |
| RemoteFile.OPEN_MODE_CREATE | Create file, if the file is already exists, then throw the exception. |
| RemoteFile.OPEN_MODE_CREATE_IF_NOT_EXISTS | Create file if not exists, exception won't throw if the file is already exists. |
| RemoteFile.OPEN_MODE_DELETE_ON_CLOSE | When close the file, the file will be delete. |
| RemoteFile.TRUNCATE_EXISTING | The size of file will be truncated to 0. |

#### Open File
```javascript
var file1 = await client.openFile(
  "./file1.txt",
  RemoteFile.OPEN_MODE_CREATE,  RemoteFile.OPEN_MODE_READ, RemoteFile.OPEN_MODE_WRITE // Open Options
);
var file2 = await client.openFile(
  "./file2.txt",
  RemoteFile.OPEN_MODE_CREATE,  RemoteFile.OPEN_MODE_READ, RemoteFile.OPEN_MODE_WRITE // Open Options
);
```
Take file1.txt and file2.txt as examples to illustrate the effect of the following file operations. 
#### Write
```javascript
var encoder = new TextEncoder(); // Encode text into Uint8Array.

//Write data
file1.write(encoder.encode("12345")); // Content of ./file1.txt will be "12345"
```
| File Name | Content |
| :--- | :--- |
| file1.txt | 12345 |
| file2.txt |  |
```javascript
file1.write(
  encoder.encode("aaa"),
  1 // The number of bytes from the beginning of the file which data will be write. If not specified, then position will be zero.
); // Content of ./file1.txt will be "1aaa5"
```
| File Name | Content |
| :--- | :--- |
| file1.txt | 1aaa5 |
| file2.txt |  |
### Flush
While write or transfer data to the server, these operations will be blocked in
buffer. After period of time or specific number of operations, buffer will 
automatically flush and send these operations to server.

If flush, read or close called, buffer will flush immediately.
```javascript
file1.flush(); // Apply changes on server.
```
#### Append
```javascript
file1.append(encoder.encode("67")); // Content of ./file1.txt will be "1aaa567"
```
| File Name | Content |
| :--- | :--- |
| file1.txt | 1aaa567 |
| file2.txt |  |
#### Transfer data between files.
```javascript
file1.transferTo( // Read a section of data and write it to other file.
  file2,
  4, // srcPosition:  Start position in file that is to be read.
  0, // destPosition: Position which data will be write, which in file that is to be write.
  3  // length:       Length of data to be read and write.
); // Content of ./file2.txt will be "567"
```
| File Name | Content |
| :--- | :--- |
| file1.txt | 1aaa567 |
| file2.txt | 567 |
```javascript
file2.transferFrom( // Write a section of data that read from other file.
  file1,
  1, // srcPosition:  Start position in file that is to be read.
  2, // destPosition: Position which data will be write, which in file that is to be write.
  3 // length:       Length of data to be read and write.
); // Content of ./file2.txt will be "56aaa"
```
| File Name | Content |
| :--- | :--- |
| file1.txt | 1aaa567 |
| file2.txt | 56aaa |
#### Read
```javascript
var data = await file2.read(); // Read entire file, calling read will also invoke flush.
data = await file1.read(
  1, // Position where data will be read.
  4  // Length of data to be read.
); // data will be Uint8Array of "aaa".
```
#### Close file
```javascript
file1.close(); // Invoke flush, too.
client.closeFile(file2); // The same as file2.close()
```
### Download from url:
#### Download from url and save to files .
```javascript
Promise.all(client.curl(
  {
    fileName: "index.html", // File name to save downloaded.
    url: "http://localhost" // url to download
  },
  {
    fileName: "dog.png",
    url: "http://localhost/image.php",
    opt: { // optional
      method: "POST",
      body: '{"request": "dog"}',
      headers: {
        Accept: "image/webp,*/*"
      }
    }
  }
)).then(resultList => {
  resultList.forEach(result=>{
    console.log("File name:", result.fileName);
    console.log("URL:", result.url);
    console.log("Content Length:", result.contentLength); // Number of bytes written.
  });
});
```
#### Download from url and send to browser.
```javascript
// Fetch url and get it's headers, body, etc.
client.fetch(
  "http://localhost",
  { // optional
    headers: {
      Accept: "text/html"
    }
  }
).then(result => {
  console.log("Http Version:", result.httpVersion);
  console.log("Status Code:", result.statusCode);
  console.log("Reason Phrase:", result.reasonPhrase);
  console.log("Headers:", result.headers);
  console.log("Body:", body); // Uint8Array
});
```



