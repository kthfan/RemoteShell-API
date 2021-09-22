using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Security.Cryptography;

namespace RemoteShelll
{
    class FileSystemServer : VerifyServer
    {
		private const byte CWD = 2;
		private const byte CHDIR = 3;
		private const byte LISTDIR = 4;
		private const byte REMOVE = 5;
		private const byte RMDIR = 6;
		private const byte MKDIR = 7;
		private const byte MKFILE = 8;
		private const byte MOVE = 9;
		private const byte OPEN_FILE = 10;
		private const byte CLOSE_FILE = 11;
		private const byte FILE_OP = 12;
		//	private const byte TERMINATE_SERVER = 13;
		private const byte FILE_STATE = 14;
		private const byte FILE_STATE_SIMPLE = 15;
		private const byte CURL = 16;
		private const byte FETCH = 17;
		private const byte SET_ATTRIBUTE = 18;

		internal const byte OPEN_MODE_READ = 1;
		internal const byte OPEN_MODE_WRITE = 2;
		//	internal const byte OPEN_MODE_APPEND = 4;
		internal const byte OPEN_MODE_CREATE = 8;
		internal const byte OPEN_MODE_CREATE_IF_NOT_EXISTS = 16;
		internal const byte OPEN_MODE_DELETE_ON_CLOSE = 32;
		internal const byte OPEN_MODE_TRUNCATE_EXISTING = 64;

		private const byte OPERATION_READ_ALL = 2;
		private const byte OPERATION_READ_RANGE = 3;
		private const byte OPERATION_OVERWRITE_ALL = 4;
		private const byte OPERATION_OVERWRITE_RANGE = 5;
		private const byte OPERATION_APPEND = 6;
		// private const byte OPERATION_TRANSFER_ALL = 7;
		private const byte OPERATION_TRANSFER_RANGE = 8;

		private FileOperation fileOperation;
		private Dictionary<String, FileStream> fileMap = new Dictionary<String, FileStream>();

		public static byte[] getBytesFromShort(short num)
		{
			byte[] result = new byte[2];
			for (int i = 0; i < result.Length; i++)
			{
				result[i] = (byte)(num & 0xff);
				num >>= 8;
			}
			return result;
		}
		public static short getShortFromBytes(byte[] bytes)
		{
			short result = 0;
			for (int i = 0; i < bytes.Length; i++)
			{
				result += (short) ((bytes[i] & 0xff) << (i << 3));
			}
			return result;
		}
		public static long getLongFromBytes(byte[] bytes)
		{
			long result = 0L;
			for (int i = 0; i < bytes.Length; i++)
			{
				result += (bytes[i] & 0xff) << (i << 3);
			}
			return result;
		}
		public static byte[] getBytesFromLong(long num)
		{
			byte[] result = new byte[8];
			for (int i = 0; i < result.Length; i++)
			{
				result[i] = (byte)(num & 0xffL);
				num >>= 8;
			}
			return result;
		}


		private String GenerateFileId()
		{
			String id = null;
			byte[] randBytes = new byte[32];
			RNGCryptoServiceProvider crypto = new RNGCryptoServiceProvider();
			do
			{
				crypto.GetBytes(randBytes);
				id = Convert.ToBase64String(randBytes);
				id = id.Replace("=", "_");
			} while (fileMap.ContainsKey(id));
			return id;
		}
		private String AddFileChannel(FileStream fs)
		{
			String id = this.GenerateFileId();
			this.fileMap.Add(id, fs);
			return id;
		}
		private FileStream RemoveFileChannel(String id)
		{
			FileStream result;
			this.fileMap.TryGetValue(id, out result);
			return result;
		}

		private void DoFileOperation(ConnectContext context)
		{
			Stream reader = context.getReader();
			Stream writer = context.getWriter();
			FileStream fileChannel;
			String id;
			byte[] idBytes;
			byte[] buffer = new byte[8];
			int idLen;
			int nextByte = reader.ReadByte();
			byte mode;
			long position, length, srcPosition, destPosition;
			while (nextByte != -1)
			{
				mode = (byte) nextByte;
				nextByte = reader.ReadByte();
				if (mode == 0 && nextByte == -1) break; // check is end of channel
				idLen = nextByte & 0xff;
				idBytes = new byte[idLen];
				reader.Read(idBytes, 0, idLen);
				id = Encoding.UTF8.GetString(idBytes);
				this.fileMap.TryGetValue(id, out fileChannel);
				writer.WriteByte(mode); // send mode first
				switch (mode)
				{
					case OPERATION_READ_ALL:
						this.fileOperation.ReadAll(fileChannel, writer);
						break;
					case OPERATION_READ_RANGE:
						reader.Read(buffer, 0, 8);
						position = FileSystemServer.getLongFromBytes(buffer);
						reader.Read(buffer, 0, 8);
						length = FileSystemServer.getLongFromBytes(buffer);
						this.fileOperation.ReadRange(fileChannel, writer, position, length);
						break;
					case OPERATION_OVERWRITE_ALL:
						reader.Read(buffer, 0, 8);
						length = FileSystemServer.getLongFromBytes(buffer);
						this.fileOperation.WriteAll(fileChannel, writer, reader, length);
						break;
					case OPERATION_OVERWRITE_RANGE:
						reader.Read(buffer, 0, 8);
						position = FileSystemServer.getLongFromBytes(buffer);
						reader.Read(buffer, 0, 8);
						length = FileSystemServer.getLongFromBytes(buffer);
						this.fileOperation.WriteRange(fileChannel, writer, reader, position, length);
						break;
					case OPERATION_APPEND:
						reader.Read(buffer, 0, 8);
						length = FileSystemServer.getLongFromBytes(buffer);
						this.fileOperation.AppendAll(fileChannel, writer, reader, length);
						break;
					case OPERATION_TRANSFER_RANGE:
						int destIdLen = reader.ReadByte() & 0xff;
						idBytes = new byte[destIdLen];
						String destId = Encoding.UTF8.GetString(idBytes);
						FileStream destFileChannel;
						this.fileMap.TryGetValue(destId, out destFileChannel);
						reader.Read(buffer, 0, 8);
						srcPosition = FileSystemServer.getLongFromBytes(buffer);
						reader.Read(buffer, 0, 8);
						destPosition = FileSystemServer.getLongFromBytes(buffer);
						reader.Read(buffer, 0, 8);
						length = FileSystemServer.getLongFromBytes(buffer);
						this.fileOperation.TransferRange(fileChannel, destFileChannel, writer, srcPosition, destPosition, length);
						break;
					default:
						Console.WriteLine("Error occurred in FileSystemServer.doFileOperation. Code: " + mode);
						break;
				}
			}

		}

		private byte[] ReadRemaining(Stream stream)
        {
			MemoryStream memoryReader = new MemoryStream();
			stream.CopyTo(memoryReader);
			memoryReader.Position = 0;
			return memoryReader.ToArray();
		}
        public override void OnRequest(ConnectContext context, HttpListenerRequest request, HttpListenerResponse response)
        {
			Stream reader = context.getReader();
			Stream writer = context.getWriter();
			byte code = (byte)reader.ReadByte();
			MemoryStream memoryReader;
			FileResult fileResult;
			switch (code)
			{
				case CWD:
					context.SetResponseData(fileOperation.cwd().getBytes());
					break;
				case CHDIR:
					context.SetResponseData(fileOperation.chdir(Encoding.UTF8.GetString(this.ReadRemaining(reader))).getBytes());
					break;
				case LISTDIR:
					memoryReader = new MemoryStream();
					reader.CopyTo(memoryReader);
					memoryReader.Position = 0;
					if (memoryReader.Position == memoryReader.Length) context.SetResponseData(fileOperation.listdir().getBytes());
					else
					{
						String body0 = Encoding.UTF8.GetString(memoryReader.ToArray());
						context.SetResponseData(fileOperation.listdir(body0).getBytes());
					}
					break;
				case REMOVE:
					context.SetResponseData(fileOperation.Remove(Encoding.UTF8.GetString(this.ReadRemaining(reader))).getBytes());
					break;
				case RMDIR:
					context.SetResponseData(fileOperation.rmdir(Encoding.UTF8.GetString(this.ReadRemaining(reader))).getBytes());
					break;
				case MKDIR:
					context.SetResponseData(fileOperation.mkdir(Encoding.UTF8.GetString(this.ReadRemaining(reader))).getBytes());
					break;
				case MKFILE:
					context.SetResponseData(fileOperation.mkfile(Encoding.UTF8.GetString(this.ReadRemaining(reader))).getBytes());
					break;
				case MOVE:
					String body = Encoding.UTF8.GetString(this.ReadRemaining(reader));
					int splitIndex = body.IndexOf("|");
					String fromFileName = body.Substring(0, splitIndex);
					String toFileName = body.Substring(splitIndex + 1, body.Length - splitIndex - 1);
					context.SetResponseData(fileOperation.Move(fromFileName, toFileName).getBytes());
					break;
                case OPEN_FILE:
					byte mode = (byte) reader.ReadByte();
					
                    fileResult = fileOperation.OpenFile(Encoding.UTF8.GetString(this.ReadRemaining(reader)), mode);
                    if (fileResult.errorCode != 0) context.SetResponseData(fileResult.getBytes());
                    else
                    {
						
						String id = this.AddFileChannel(fileResult.fsPayload);
                        fileResult.strPayload = id;
                        context.SetResponseData(fileResult.getBytes());
                    }
                    break;
                case CLOSE_FILE:
                    FileStream fc1 = this.RemoveFileChannel(Encoding.UTF8.GetString(this.ReadRemaining(reader)));
                    context.SetResponseData(fileOperation.CloseFile(fc1).getBytes());
                    break;
                case FILE_OP:
                    this.DoFileOperation(context);
                    break;
                case FILE_STATE:
                    context.SetResponseData(fileOperation.FileState(Encoding.UTF8.GetString(this.ReadRemaining(reader))).getBytes());
                    break;
                case FILE_STATE_SIMPLE:
                    context.SetResponseData(fileOperation.FileStateSimple(Encoding.UTF8.GetString(this.ReadRemaining(reader))).getBytes());
                    break;
                //case CURL:
                //	response.setAutoClose(false);
                //	response.sendHeader();
                //	fileOperation.curl(reader, writer, socket.getChannel());
                //	break;
                //case FETCH:
                //	response.sendHeader();
                //	short urlLen = FileSystemServer.getShortFromBytes(reader.nextBytes(2));
                //	String url = new String(reader.nextBytes(urlLen));
                //	long bodyLen = FileSystemServer.getLongFromBytes(reader.nextBytes(8));
                //	fileOperation.fetch(url, writer, reader, bodyLen);
                //	break;
                //case SET_ATTRIBUTE:
                //	short pathLen = FileSystemServer.getShortFromBytes(reader.nextBytes(2));
                //	String path = new String(reader.nextBytes(pathLen));
                //	boolean setReadOnly = reader.nextByte() == 1;
                //	boolean readOnly = reader.nextByte() == 1;
                //	byte[] toSetTime = reader.nextBytes(3);
                //	FileTime lastModifiedTime = null;
                //	FileTime lastAccessTime = null;
                //	FileTime createTime = null;
                //	if (toSetTime[0] == 1)
                //	{
                //		lastModifiedTime = FileTime.fromMillis(FileSystemServer.getLongFromBytes(reader.nextBytes(8)));
                //	}
                //	else reader.nextBytes(8);
                //	if (toSetTime[1] == 1)
                //	{
                //		lastAccessTime = FileTime.fromMillis(FileSystemServer.getLongFromBytes(reader.nextBytes(8)));
                //	}
                //	else reader.nextBytes(8);
                //	if (toSetTime[2] == 1)
                //	{
                //		createTime = FileTime.fromMillis(FileSystemServer.getLongFromBytes(reader.nextBytes(8)));
                //	}
                //	else reader.nextBytes(8);
                //	context.setResponseData(fileOperation.setAttribute(path, setReadOnly, readOnly, lastModifiedTime, lastAccessTime, createTime).getBytes());
                //	break;
                //case 0:
                //	response.sendHeader();
                //	fileOperation.test("", writer, reader);
                //	break;
                default:
					Console.WriteLine("Error occurred in FileSystemServer.onRequest. Code: " + code);
					break;
			}
		}

		public FileSystemServer() : this(null, null, null, null)
		{
		}
		public FileSystemServer(String workingDir, String token, ICollection<String> allowHosts, ICollection<int> ports) : base(token, allowHosts, ports)
		{
			if (workingDir == null) workingDir = Directory.GetCurrentDirectory();
			this.fileOperation = new FileOperation(new List<String>() { workingDir });
			FileResult fileResult = fileOperation.chdir(workingDir);
			if (fileResult.errorCode != 0)
				throw new UnauthorizedAccessException(fileResult.message);
		}
	}
}
