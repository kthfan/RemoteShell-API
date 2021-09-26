using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Security.AccessControl;
using System.Security.Principal;
using System.Text;
using System.Threading.Tasks;
using System.Net.Http.Headers;
using System.Net;
using System.Threading;

namespace RemoteShell
{
	class FileAttr
    {
		internal FileAttr() { }
		private readonly String[] attrs = new String[] {null, null, null, null, null, null, null, null, null, null};
		public void setExists(bool exists)
		{
			this.attrs[0] = exists ? "1" : "0";
		}
		public void setFileName(String name)
		{
			this.attrs[1] = "\"" + name + "\"";
		}
		public void setFileType(char fileType)
		{
			this.attrs[2] = "\"" + fileType + "\"";
		}
		public void setRWE(int rwe)
		{
			this.attrs[3] = rwe.ToString();
		}
		public void setSize(long size)
		{
			this.attrs[4] = size.ToString();
		}
		public void setOwner(String name)
		{
			this.attrs[5] = "\"" + name + "\"";
		}
		public void setHidden(bool isHidden)
		{
			this.attrs[6] = isHidden ? "1" : "0";
		}
		public void setCreationTime(long time)
		{
			this.attrs[7] = time.ToString();
		}
		public void setLastAccessTime(long time)
		{
			this.attrs[8] = time.ToString();
		}
		public void setLastModifiedTime(long time)
		{
			this.attrs[9] = time.ToString();
		}
		public String ToString()
		{
			String result = "[";
			if (this.attrs[0] == null) return "[]";
			else result += this.attrs[0];

			for (int i = 1; i < this.attrs.Length; i++)
			{
				if (this.attrs[i] == null) break;
				result += "," + this.attrs[i];
			}
			result += "]";
			return result.Replace("\\", "\\\\");
		}
		public static String arrayToString(FileAttr[] attrsArr)
		{
			String result = "[";
			if (attrsArr.Length > 0)
				result += attrsArr[0].ToString();
			for (int i = 1; i < attrsArr.Length; i++)
			{
				result += "," + attrsArr[i].ToString();
			}
			result += "]";
			return result;
		}
	}
	class FileResult
    {
		internal byte errorCode = 0;
		internal String message = "";
		internal Object payload = null;
		internal String strPayload = null;
		internal FileAttr attrPayload = null;
		internal FileAttr[] attrArrPayload = null;
		internal FileStream fsPayload = null;
		internal long longPayload = -1L;
		internal FileResult() { }
		internal FileResult(int errorCode, String message) : this((byte)errorCode, message) { }
		internal FileResult(byte errorCode, String message)
		{
			this.errorCode = errorCode;
			if (message.Trim() == "") message = "Unknown error.";
			this.message = message;
		}
		internal FileResult(int errorCode, String message, Object payload) : this(errorCode, message)
		{
			this.payload = payload;
		}
		internal FileResult(int errorCode, String message, String strPayload) : this(errorCode, message)
		{
			this.strPayload = strPayload;
		}
		internal FileResult(int errorCode, String message, FileAttr attrPayload) : this(errorCode, message)
		{
			this.attrPayload = attrPayload;
		}
		internal FileResult(int errorCode, String message, FileAttr[] attrArrPayload) : this(errorCode, message)
		{
			this.attrArrPayload = attrArrPayload;
		}
        internal FileResult(int errorCode, String message, FileStream fsPayload) : this(errorCode, message)
        {
            this.fsPayload = fsPayload;
        }
        internal FileResult(int errorCode, String message, long longPayload) : this(errorCode, message)
		{
			this.longPayload = longPayload;
		}

		public byte[] getBytes()
		{
			byte[] result = null;
			byte[] messageBytes = Encoding.UTF8.GetBytes(this.message);
			int messageLen = messageBytes.Length;
			byte[] messageLenBytes = FileSystemServer.getBytesFromShort((short)messageLen);
			byte[] data = new byte[0];
			int dataLen = 0;
			if (this.strPayload != null)
			{
				data = Encoding.UTF8.GetBytes(this.strPayload);
			}
			else if (this.attrPayload != null)
			{
				data = Encoding.UTF8.GetBytes(this.attrPayload.ToString());
			}
			else if (this.attrArrPayload != null)
			{
				data = Encoding.UTF8.GetBytes(FileAttr.arrayToString(this.attrArrPayload));
			}
			else if (this.longPayload != -1L)
			{
				data = FileSystemServer.getBytesFromLong(this.longPayload);
			}
			dataLen = data.Length;
			result = new byte[3 + messageLen + 8 + dataLen];

			result[0] = this.errorCode; // set error code

			// set message length
			result[1] = messageLenBytes[0];
			result[2] = messageLenBytes[1];

			Array.Copy(Encoding.UTF8.GetBytes(this.message), 0, result, 3, messageLen); // set message

			Array.Copy(FileSystemServer.getBytesFromLong(dataLen), 0, result, 3 + messageLen, 8); // set data length
			Array.Copy(data, 0, result, 3 + messageLen + 8, dataLen); // set data

			return result;
		}
	}
	class FileOperation
    {
		public readonly static String RESULT_OK = "OK.";
		public readonly static String RESULT_FAIL = "Fail.";
		public readonly static String RESULT_NOT_EXISTS = "File not exists.";
		public readonly static String RESULT_PERMISSION_DENIED = "Permission denied.";
		public readonly static String RESULT_INVALID_DIRECTORY = "Invalid directory name.";

		internal DateTime StartDateTime = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);

		private ISet<String> AllowedPath = new HashSet<String>();

		// switch to _cwd when doing operation, and switch back to initial directory when complete operation
		private String _cwd = Directory.GetCurrentDirectory();

		//private List<HttpWebRequest> _requestList = new List<HttpWebRequest>();

		//private ExecutorService executorService = Executors.newCachedThreadPool();
		//ReentrantLock curlLock = new ReentrantLock();

		public FileOperation()
		{
			this.AddAllowedPath("/");
		}
		public FileOperation(ICollection<String> allowedPath)
		{
			foreach (String path in allowedPath)
			{
				this.AddAllowedPath(path);
			}
		}

		// c# only, switch to _cwd when doing operation, and switch back to initial directory when complete operation.
		public void BeforeOperation()
        {
			String tmp = this._cwd;
			this._cwd = Directory.GetCurrentDirectory();
			Directory.SetCurrentDirectory(tmp);
		}
		public void AfterOperation()
		{
			String tmp = this._cwd;
			this._cwd = Directory.GetCurrentDirectory();
			Directory.SetCurrentDirectory(tmp);
		}

		public void AddAllowedPath(String path)
		{
			if (path.EndsWith("/"))
			{
				path = path.Substring(0, path.Length - 1);
			}
			path = path.Replace("\\\\", "/");
			this.AllowedPath.Add(path);
		}
		public void RemoveAllowedPath(String path)
		{
			if (path.EndsWith("/"))
			{
				path = path.Substring(0, path.Length - 1);
			}
			this.AllowedPath.Remove(path);
		}

		public bool IsPathAllow(String path)
		{
			String child = Path.GetFullPath(path);
			foreach (String allowed in this.AllowedPath)
			{
				String parent = Path.GetFullPath(allowed);
				if (child.StartsWith(parent)) return true;
			}
			return false;
		}

		public FileResult cwd()
		{
			return new FileResult(0, RESULT_OK, Directory.GetCurrentDirectory());
		}

		public FileResult chdir(String path)
		{

			path = Path.GetFullPath(path);

            try
            {
				if (!this.IsPathAllow(path)) return new FileResult(1, RESULT_PERMISSION_DENIED);
				Directory.SetCurrentDirectory(path);
			}
			catch (SystemException e)
            {
				return new FileResult(1, e.ToString());
			}
			return new FileResult(0, RESULT_OK);
		}

		public FileResult listdir()
		{
			return this.listdir(Directory.GetCurrentDirectory());
		}
		public FileResult listdir(String path)
		{
			path = Path.GetFullPath(path);

			List<FileAttr> list = new List<FileAttr>();
			try
            {
				FileAttributes attr = File.GetAttributes(path);

				if (!this.IsPathAllow(path)) return new FileResult(1, RESULT_PERMISSION_DENIED);
				
				DirectoryInfo d = new DirectoryInfo(path);
				FileInfo[] infos = d.GetFiles();
				DirectoryInfo[] dinfo = d.GetDirectories();
				infos.ToList().ForEach(info => list.Add(this.FileState(info.FullName).attrPayload));
				dinfo.ToList().ForEach(info => list.Add(this.FileState(info.FullName).attrPayload));
			}
			catch(SystemException e)
            {
				return new FileResult(1, e.ToString(), list.ToArray());
			}

			return new FileResult(0, RESULT_OK, list.ToArray());
		}

		public FileResult FileStateSimple(String path)
        {
			FileAttr attrs = new FileAttr();
            try
            {
				path = Path.GetFullPath(path);

				if (!this.IsPathAllow(path)) return new FileResult(1, RESULT_PERMISSION_DENIED);

				bool isExists = Directory.Exists(path) || File.Exists(path);

				attrs.setExists(isExists);

				if (!isExists) return new FileResult(0, RESULT_OK, attrs);

				FileAttributes attr = File.GetAttributes(path);

				bool isDir = attr.HasFlag(FileAttributes.Directory);
				isExists = isDir ? Directory.Exists(path) : File.Exists(path);

				int rwe = 0;
				char fileType = '-';

				
				

				attrs.setFileName(Path.GetFileName(path));

				if (isDir) fileType = 'd';
				else if (attr.HasFlag(FileAttributes.Normal)) fileType = '-';
				else if (attr.HasFlag(FileAttributes.ReparsePoint)) fileType = 'l';
				else fileType = '?';

				attrs.setFileType(fileType);
                if (isDir)
                {
					if(isExists)
                    {
						rwe += 4;
						rwe += 1;

						// Get the access rules of the specified files (user groups and user names that have access to the file)
						var rules = File.GetAccessControl(path).GetAccessRules(true, true, typeof(System.Security.Principal.SecurityIdentifier));

						// Get the identity of the current user and the groups that the user is in.
						var groups = WindowsIdentity.GetCurrent().Groups;
						string sidCurrentUser = WindowsIdentity.GetCurrent().User.Value;


						bool canWrite = ((attr & FileAttributes.ReadOnly) == 0) &&
						// Check if writing to the file is explicitly denied for this user or a group the user is in.
						!(rules.OfType<FileSystemAccessRule>().Any(r => (groups.Contains(r.IdentityReference) || r.IdentityReference.Value == sidCurrentUser) && r.AccessControlType == AccessControlType.Deny && (r.FileSystemRights & FileSystemRights.WriteData) == FileSystemRights.WriteData))
						// Check if writing is allowed
						&& rules.OfType<FileSystemAccessRule>().Any(r => (groups.Contains(r.IdentityReference) || r.IdentityReference.Value == sidCurrentUser) && r.AccessControlType == AccessControlType.Allow && (r.FileSystemRights & FileSystemRights.WriteData) == FileSystemRights.WriteData);

						if (canWrite) rwe += 2;
					}
					
				}
                else
                {
					try
					{
						using (var fs = File.Open(path, FileMode.Open))
						{
							if (File.Exists(path) && fs.CanRead) rwe += 4;
							if (File.Exists(path) && !attr.HasFlag(FileAttributes.ReadOnly) && fs.CanWrite) rwe += 2;
						}
					}
					catch (IOException e1)
					{
						if (File.Exists(path)) rwe += 4;
						if (File.Exists(path) && !attr.HasFlag(FileAttributes.ReadOnly)) rwe += 2;
						Console.WriteLine("Warning:FileOperation:FileStateSimple: Can not read permission of file.");
					}

					if (File.Exists(path) && Path.GetExtension(path) == ".exe") rwe += 1;
				}
                
				attrs.setRWE(rwe);
			}
			catch(SystemException e)
            {
				return new FileResult(1, e.ToString(), attrs);
			}

			
			return new FileResult(0, RESULT_OK, attrs);
		}
		public FileResult FileState(String path)
        {

			path = Path.GetFullPath(path);
			
			if (!this.IsPathAllow(path)) return new FileResult(1, RESULT_PERMISSION_DENIED);

			FileResult result = this.FileStateSimple(path);
			FileAttr attrs = result.attrPayload;

			try {

				bool isDir = File.GetAttributes(path).HasFlag(FileAttributes.Directory);
				if (isDir)
                {
					DirectoryInfo info = new DirectoryInfo(path);
					FileAttributes attr = info.Attributes;

					attrs.setSize(0);
					attrs.setOwner(Directory.GetAccessControl(path).GetOwner(typeof(NTAccount)).ToString());
					attrs.setHidden(attr.HasFlag(FileAttributes.Hidden));

					
						
					attrs.setCreationTime((long) (Directory.GetCreationTimeUtc(path) - StartDateTime).TotalMilliseconds);
					attrs.setLastAccessTime((long)(Directory.GetLastAccessTimeUtc(path) - StartDateTime).TotalMilliseconds);
					attrs.setLastModifiedTime((long)(Directory.GetLastWriteTimeUtc(path) - StartDateTime).TotalMilliseconds);
				}
                else
                {
					FileInfo info = new FileInfo(path);
					FileAttributes attr = info.Attributes;


					attrs.setSize(info.Length);
					attrs.setOwner(File.GetAccessControl(path).GetOwner(typeof(NTAccount)).ToString());
					attrs.setHidden(attr.HasFlag(FileAttributes.Hidden));

					attrs.setCreationTime((long)(File.GetCreationTimeUtc(path) - StartDateTime).TotalMilliseconds);
					attrs.setLastAccessTime((long)(File.GetLastAccessTimeUtc(path) - StartDateTime).TotalMilliseconds);
					attrs.setLastModifiedTime((long)(File.GetLastWriteTimeUtc(path) - StartDateTime).TotalMilliseconds);
				}
				
			} catch (SystemException e) {
				result.errorCode = 1;
				result.message = e.ToString();
			}
			return result;
        }

		public FileResult Remove(String path)
		{
			path = Path.GetFullPath(path);

			try
			{
				if (!this.IsPathAllow(path)) return new FileResult(1, RESULT_PERMISSION_DENIED);
				if (File.GetAttributes(path).HasFlag(FileAttributes.Directory)) Directory.Delete(path);
				else File.Delete(path);
				return new FileResult(0, RESULT_OK);
			}
			catch (SystemException e)
			{
				return new FileResult(1, e.ToString());
			}
		}

		public FileResult rmdir(String path)
		{
			path = Path.GetFullPath(path);

			FileResult result;
			try
			{
				if (!this.IsPathAllow(path)) return new FileResult(1, RESULT_PERMISSION_DENIED);
				DirectoryInfo dirInfo = new DirectoryInfo(path);
				foreach (var dir in dirInfo.EnumerateDirectories())
				{
					result = this.rmdir(dir.FullName);
					if (result.errorCode != 0) return result;
				}
				var files = dirInfo.GetFiles();
				foreach (var file in files)
				{
					file.Delete();
				}

				dirInfo.Delete(true);
			}
			catch (SystemException e)
			{
				return new FileResult(1, e.ToString());
			}
			return new FileResult(0, RESULT_OK);
		}

		public FileResult mkdir(String path)
		{
			path = Path.GetFullPath(path);

			try
			{
				if (!this.IsPathAllow(path)) return new FileResult(1, RESULT_PERMISSION_DENIED);
				Directory.CreateDirectory(path);
				return new FileResult(0, RESULT_OK);
			}
			catch (SystemException e)
			{
				return new FileResult(1, e.ToString());
			}
		}

		public FileResult mkfile(String path)
		{
			path = Path.GetFullPath(path);

			try
			{
				if (!this.IsPathAllow(path)) return new FileResult(1, RESULT_PERMISSION_DENIED);
				using (FileStream fs = File.Create(path)) {}
				return new FileResult(0, RESULT_OK);
			}
			catch (SystemException e)
			{
				return new FileResult(1, e.ToString());
			}
		}

		public FileResult Move(String from, String to)
		{
			from = Path.GetFullPath(from);
			to = Path.GetFullPath(to);

			try
			{
				bool isToExists = File.Exists(to) || Directory.Exists(to);
				bool isFromDir = File.GetAttributes(from).HasFlag(FileAttributes.Directory);
				bool isToDir = isToExists && File.GetAttributes(to).HasFlag(FileAttributes.Directory);
				if (!this.IsPathAllow(from)) return new FileResult(1, RESULT_PERMISSION_DENIED);
				if (!this.IsPathAllow(to)) return new FileResult(1, RESULT_PERMISSION_DENIED);
                if (isFromDir)
					if (isToDir)  Directory.Move(from, to + "\\" + Path.GetFileName(from));
					else Directory.Move(from, to);
				else
                {
					if(isToDir) File.Move(from, to + "\\" + Path.GetFileName(from));
					else File.Move(from, to);
                }
				return new FileResult(0, RESULT_OK);
			}
			catch (SystemException e)
			{
				return new FileResult(1, e.ToString());
			}
		}

		public FileResult OpenFile(String path, byte mode)
		{
			path = Path.GetFullPath(path);
			
			try
			{
				if (!this.IsPathAllow(path)) return new FileResult(1, RESULT_PERMISSION_DENIED);
				FileMode fileMode = FileMode.Open;
				FileAccess fileAccess = 0;
				FileStream fs = null;
				//FileShare fileShare = 0;

				if ((mode & FileSystemServer.OPEN_MODE_CREATE) != 0) fileMode = FileMode.CreateNew;
				if ((mode & FileSystemServer.OPEN_MODE_CREATE_IF_NOT_EXISTS) != 0) fileMode = FileMode.OpenOrCreate;
				if ((mode & FileSystemServer.OPEN_MODE_READ) != 0) fileAccess |= FileAccess.Read;
				if ((mode & FileSystemServer.OPEN_MODE_WRITE) != 0) fileAccess |= FileAccess.Write;
				if ((mode & FileSystemServer.OPEN_MODE_DELETE_ON_CLOSE) != 0)
                {
					if(!File.Exists(path))
                    {
						fs = File.Create(path, 4096, FileOptions.DeleteOnClose);
					}
                }
				if ((mode & FileSystemServer.OPEN_MODE_TRUNCATE_EXISTING) != 0) fileMode = FileMode.Truncate;
				if (fs == null) fs = File.Open(path, fileMode, fileAccess);
				return new FileResult(0, RESULT_OK, fs);
			}
			catch (IOException e)
			{
				return new FileResult(1, e.ToString());
			}
		}

		public FileResult CloseFile(FileStream fs)
		{
			fs.Close();
			return new FileResult(0, RESULT_OK);
		}

		internal static long CopyStream(Stream src, Stream dest, long srcOffset, long destOffset, long count)
		{
			byte[] buffer = new byte[32768];
			long total = 0;
			int read;
			if (srcOffset != 0) src.Position += srcOffset;
			if (destOffset != 0) dest.Position += destOffset;
			while (count > 0 &&
				   (read = src.Read(buffer, 0, (int)Math.Min(buffer.Length, count))) > 0)
			{
				total += read;
				dest.Write(buffer, 0, read);
				count -= read;
			}
			return total;
		}

		public void ReadAll(FileStream fc, Stream writer)
		{
			try
			{
				fc.Position = 0;
				fc.CopyTo(writer);
				byte[] result = new FileResult(0, RESULT_OK, fc.Length).getBytes();
				writer.Write(result, 0, result.Length);
			}
			catch (IOException e)
			{
				byte[] result = new FileResult(1, e.ToString(), 0L).getBytes();
				writer.Write(result, 0, result.Length);
			}
		}
		public void ReadRange(FileStream fc, Stream writer, long position, long length)
		{
			try
			{
				fc.Position = position;
				long readLen = FileOperation.CopyStream(fc, writer, 0, 0, (int)length);
				byte[] result = new FileResult(0, RESULT_OK, readLen).getBytes();
				writer.Write(result, 0, result.Length);
			}
			catch (IOException e)
			{
				byte[] result = new FileResult(1, e.ToString(), 0L).getBytes();
				writer.Write(result, 0, result.Length);
			}
		}
		public void WriteAll(FileStream fc, Stream writer, Stream reader, long length)
		{
			try
			{
				fc.Position = 0;
				long writtenLen = FileOperation.CopyStream(reader, fc, 0, 0, (int)length);
				byte[] result = new FileResult(0, RESULT_OK, writtenLen).getBytes();
				writer.Write(result, 0, result.Length);
			}
			catch (IOException e)
			{
				byte[] result = new FileResult(1, e.ToString(), 0L).getBytes();
				writer.Write(result, 0, result.Length);
			}
		}
		public void WriteRange(FileStream fc, Stream writer, Stream reader, long position, long length)
		{
			try
			{
				fc.Position = position;
				long writtenLen = FileOperation.CopyStream(reader, fc, 0, position, (int)length);
				byte[] result = new FileResult(0, RESULT_OK, writtenLen).getBytes();
				writer.Write(result, 0, result.Length);
			}
			catch (IOException e)
			{
				byte[] result = new FileResult(1, e.ToString(), 0L).getBytes();
				writer.Write(result, 0, result.Length);
			}
		}
		public void TransferRange(FileStream srcFc, FileStream destFc, Stream writer, long srcPosition, long destPosition, long length)
		{
			try
			{
				srcFc.Position = srcPosition;
				destFc.Position = destPosition;
				long transferredLen = FileOperation.CopyStream(srcFc, destFc, 0, 0, (int)length);
				byte[] result = new FileResult(0, RESULT_OK, transferredLen).getBytes();
				writer.Write(result, 0, result.Length);
			}
			catch (IOException e)
			{
				byte[] result = new FileResult(1, e.ToString(), 0L).getBytes();
				writer.Write(result, 0, result.Length);
			}
		}
		public void AppendAll(FileStream fc, Stream writer, Stream reader, long length)
		{

			try
			{
				fc.Position = fc.Length;
				long writtenLen = FileOperation.CopyStream(reader, fc, 0, 0, (int)length);
				byte[] result = new FileResult(0, RESULT_OK, writtenLen).getBytes();
				writer.Write(result, 0, result.Length);
			}
			catch (IOException e)
			{
				byte[] result = new FileResult(1, e.ToString(), 0L).getBytes();
				writer.Write(result, 0, result.Length);
			}
		}

		public void curl(Stream reader, Stream writer, HttpListenerRequest request, HttpListenerResponse response)
        {
            byte[] bufferShort = new byte[2];
            byte[] bufferLong = new byte[8];
            byte[] buffer;
            reader.Read(bufferShort, 0, 2);
            short requestNumbers = FileSystemServer.getShortFromBytes(bufferShort);
            List<Task<WebResponse>> taskList = new List<Task<WebResponse>>();
            List<String> urlList = new List<String>();
            List<String> fnList = new List<String>();
			List<String> originalFnList = new List<String>();
			for (short i = 0; i < requestNumbers; i++)
            {
                reader.Read(bufferShort, 0, 2);
                short urlLen = FileSystemServer.getShortFromBytes(bufferShort);
                buffer = new byte[urlLen];
                reader.Read(buffer, 0, urlLen);
                String url = Encoding.UTF8.GetString(buffer);
                reader.Read(bufferShort, 0, 2);
                short fnLen = FileSystemServer.getShortFromBytes(bufferShort);
                buffer = new byte[fnLen];
                reader.Read(buffer, 0, fnLen);
                String fn = Encoding.UTF8.GetString(buffer);
                reader.Read(bufferLong, 0, 8);
                long bodyLen = FileSystemServer.getLongFromBytes(bufferLong);


                Task<WebResponse> task = this._curl(url, Path.GetFullPath(fn), reader, writer, bodyLen, fn);
                if (task != null)
                {
                    urlList.Add(url);
                    fnList.Add(Path.GetFullPath(fn));
					originalFnList.Add(fn);
					taskList.Add(task);
                }
            }

            try
            {
                Task.WaitAll(taskList.ToArray());
                for (int i = 0; i < taskList.Count; i++)
                {
                    this._EndCurl((HttpWebResponse)taskList[i].Result, urlList[i], fnList[i], writer, originalFnList[i]);
                }
            }
            catch (AggregateException e)
            {
                Console.WriteLine("The following exceptions have been thrown by WaitAll(): (THIS WAS EXPECTED)");
                for (int j = 0; j < e.InnerExceptions.Count; j++)
                {
                    Console.WriteLine("\n-------------------------------------------------\n{0}", e.InnerExceptions[j].ToString());
                }
            }
            //this.SendCurlResult(writer, 0, RESULT_OK, urlList[0], fnList[0], 0L);
			request.InputStream.Close();
			response.OutputStream.Close();

		}
		private List<String[]> ReadHeaderField(Stream stream)
        {
			int bufferCursor = 0;
			byte[] buffer = new byte[2048];
			int lastByte = stream.ReadByte(), currentByte = stream.ReadByte();
			buffer[0] = (byte) lastByte;
			buffer[1] = (byte) currentByte;
			bufferCursor = 2;
			List<String> lineList = new List<String>();
			int lastCRLFIndex = 0;
			int i = 1;

			do
			{
				if (currentByte == 10 && lastByte == 13)
				{ // if requestData[i-1:i+1] = "\r\n"
					if (i - 1 == lastCRLFIndex)
					{ // if duplicate \r\n occur, then split headers and body
						lastCRLFIndex = i + 1;
						// body is lastCRLFIndex to requestData.length
						break;
					}
					lineList.Add(Encoding.UTF8.GetString(buffer, 0, bufferCursor - 2));
					bufferCursor = 0;
					lastCRLFIndex = i + 1;
				}
				lastByte = currentByte;
				currentByte = stream.ReadByte();
				buffer[bufferCursor] = (byte) currentByte;
				bufferCursor++;
				i++;
			} while (currentByte != -1);
			List<String[]> result = new List<String[]>();
			result.Add(lineList[0].Split(' '));
			for(int j=1; j< lineList.Count; j++)
            {
				String[] split = lineList[j].Split(':');
				if(split.Length > 2)
                {
					for(int k=2; k<split.Length; k++)
                    {
						split[1] += ":" + split[k];
					}
                }
				if (split.Length > 0) split[0] = split[0].Trim();
				if (split.Length > 1) split[1] = split[1].Trim();
				result.Add(split);
			}
			return result;
		}
		private void setHeaders(List<String[]> headers, HttpWebRequest httpRequest)
        {
			httpRequest.Method = headers[0][0];
			for (int i = 1; i < headers.Count; i++)
			{
                try
                {
					if (string.Equals(headers[i][0], "Host", StringComparison.OrdinalIgnoreCase))
					{
						httpRequest.Host = headers[i][1];

					}
					else if (string.Equals(headers[i][0], "Referer", StringComparison.OrdinalIgnoreCase))
					{
						httpRequest.Referer = headers[i][1];
					}
					else if (string.Equals(headers[i][0], "Accept", StringComparison.OrdinalIgnoreCase))
					{
						httpRequest.Accept = headers[i][1];
					}
					else if (string.Equals(headers[i][0], "User-Agent", StringComparison.OrdinalIgnoreCase))
					{
						httpRequest.UserAgent = headers[i][1];
					}
					else if (string.Equals(headers[i][0], "Content-Type", StringComparison.OrdinalIgnoreCase))
					{
						httpRequest.ContentType = headers[i][1];
					}
					else if (string.Equals(headers[i][0], "Content-Length", StringComparison.OrdinalIgnoreCase))
					{
						httpRequest.ContentLength = long.Parse(headers[i][1]);
					}
					else if (string.Equals(headers[i][0], "Date", StringComparison.OrdinalIgnoreCase))
					{
						httpRequest.Date = DateTime.ParseExact(headers[i][1],
							"ddd, dd MMM yyyy HH:mm:ss 'UTC'",
							System.Globalization.CultureInfo.InvariantCulture.DateTimeFormat,
							System.Globalization.DateTimeStyles.AssumeUniversal); ;
					}
					else if (string.Equals(headers[i][0], "If-Modified-Since", StringComparison.OrdinalIgnoreCase))
					{
						httpRequest.IfModifiedSince = DateTime.ParseExact(headers[i][1],
							"ddd, dd MMM yyyy HH:mm:ss 'UTC'",
							System.Globalization.CultureInfo.InvariantCulture.DateTimeFormat,
							System.Globalization.DateTimeStyles.AssumeUniversal); ;
					}
					else if (string.Equals(headers[i][0], "Connection", StringComparison.OrdinalIgnoreCase))
					{
						httpRequest.Connection = headers[i][1];
					}
					else if (string.Equals(headers[i][0], "Transfer-Encoding", StringComparison.OrdinalIgnoreCase))
					{
						httpRequest.TransferEncoding = headers[i][1];
					}
					else if (string.Equals(headers[i][0], "Transfer-Encoding", StringComparison.OrdinalIgnoreCase))
					{
						httpRequest.TransferEncoding = headers[i][1];
					}
					else if (string.Equals(headers[i][0], "Expect", StringComparison.OrdinalIgnoreCase))
					{
						httpRequest.Expect = headers[i][1];
					}
					else httpRequest.Headers.Add(headers[i][0], headers[i][1]);
				}
				catch(SystemException e)
                {
					Console.WriteLine("Exception occured in parse header: " + headers[i][0] +  " : " + headers[i][1]);
                }
			}
		}
		private void FlushStreamAsync(Stream stream, long length)
        {
			if (length != 0) FileOperation.CopyStream(stream, new MemoryStream(), 0, 0, length);
		}
		private Task<WebResponse> _curl(String url, String fn, Stream reader, Stream writer, long bodyLen, String orginalFn)
        {
			List<String[]> headers = this.ReadHeaderField(reader);
			HttpWebRequest httpRequest;
			bool isBodyFlushed = false;

			if (!this.IsPathAllow(fn))
			{
				this.FlushStreamAsync(reader, bodyLen);
				this.SendCurlResult(writer, 1, RESULT_PERMISSION_DENIED, url, orginalFn, 0L);
				return null;
			}
			try
			{
				httpRequest = (HttpWebRequest)WebRequest.Create(url);

				httpRequest.AutomaticDecompression = DecompressionMethods.GZip;
				httpRequest.ClientCertificates.Add(new System.Security.Cryptography.X509Certificates.X509Certificate());

				this.setHeaders(headers, httpRequest);

				if (bodyLen != 0) FileOperation.CopyStream(reader, httpRequest.GetRequestStream(), 0, 0, bodyLen);
				isBodyFlushed = true;

				//this._EndCurl((HttpWebResponse)httpRequest.GetResponse(), url, fn, writer);
				return httpRequest.GetResponseAsync();
			}
			catch (SystemException e)
			{
				if(!isBodyFlushed) this.FlushStreamAsync(reader, bodyLen);
				this.SendCurlResult(writer, 1, e.ToString(), url, orginalFn, 0L);
				return null;
			}
		}
		private void SendCurlResult(Stream writer, int errCode, String msg, String url, String fn, long contentLength)
		{
			lock(writer){
				byte[] buffer = new FileResult(errCode, msg, url).getBytes();
				writer.Write(buffer, 0, buffer.Length);
				buffer = Encoding.UTF8.GetBytes(fn);
				writer.Write(FileSystemServer.getBytesFromShort((short)buffer.Length), 0, 2);
				writer.Write(buffer, 0, buffer.Length);
				writer.Write(FileSystemServer.getBytesFromLong(contentLength), 0, 8);
			}
		}
		private void _EndCurl(HttpWebResponse httpResponse, String url, String fn, Stream writer, String originalFn)
        {
            try
            {
                using (FileStream fs = File.Open(fn, FileMode.CreateNew))
                {
                    httpResponse.GetResponseStream().CopyTo(fs);
                    this.SendCurlResult(writer, 0, RESULT_OK, url, originalFn, fs.Position);
                }
            }
			catch (SystemException e)
            {
				this.SendCurlResult(writer, 1, e.ToString(), url, originalFn, 0L);
			}
			httpResponse.Close();
		}

		public void Fetch(String url, Stream writer, Stream reader, long bodyLen)
        {
			long contentLength = 0L;
			List<String[]> headers = this.ReadHeaderField(reader);
			HttpWebRequest httpRequest;
			bool isBodyFlushed = false;

			try
            {
				httpRequest = (HttpWebRequest)WebRequest.Create(url);

				httpRequest.AutomaticDecompression = DecompressionMethods.GZip;
				httpRequest.ClientCertificates.Add(new System.Security.Cryptography.X509Certificates.X509Certificate());


				this.setHeaders(headers, httpRequest);


				if (bodyLen != 0) reader.CopyTo(httpRequest.GetRequestStream());
				isBodyFlushed = true;

				HttpWebResponse httpResponse = (HttpWebResponse)httpRequest.GetResponse();


				String head =
					$"HTTP/{httpResponse.ProtocolVersion.ToString()} {((int)httpResponse.StatusCode)} {httpResponse.StatusDescription}\r\n" +
					httpResponse.Headers.ToString();
				byte[] headByte = Encoding.UTF8.GetBytes(head);
				writer.Write(headByte, 0, headByte.Length);
				contentLength += headByte.Length;

				Stream responseStream = httpResponse.GetResponseStream();
				contentLength += FileOperation.CopyStream(responseStream, writer, 0, 0, long.MaxValue);

				byte[] result = new FileResult(0, RESULT_OK, contentLength).getBytes();
				writer.Write(result, 0, result.Length);
			}
			catch(SystemException e)
            {
				if (!isBodyFlushed) this.FlushStreamAsync(reader, bodyLen);
				byte[] result = new FileResult(1, e.ToString(), 0L).getBytes();
				writer.Write(result, 0, result.Length);
			}
		}

		public FileResult SetAttribute(String path, bool setReadOnly, bool readOnly, long lastModifiedTime, long lastAccessTime, long createTime, byte[] toSetTime)
        {
			path = Path.GetFullPath(path);

            try
            {
				
				if (setReadOnly)
				{
					if (readOnly) File.SetAttributes(path, File.GetAttributes(path) | FileAttributes.ReadOnly);
					else File.SetAttributes(path, File.GetAttributes(path) & ~FileAttributes.ReadOnly);
				}

				if (Directory.Exists(path))
                {
					if (toSetTime[0] == 1) Directory.SetLastWriteTimeUtc(path, StartDateTime.AddMilliseconds(lastModifiedTime).ToUniversalTime());
					if (toSetTime[1] == 1) Directory.SetLastAccessTimeUtc(path, StartDateTime.AddMilliseconds(lastAccessTime).ToUniversalTime());
					if (toSetTime[2] == 1) Directory.SetCreationTimeUtc(path, StartDateTime.AddMilliseconds(lastAccessTime).ToUniversalTime());
				}
                else
                {
					if (toSetTime[0] == 1) File.SetLastWriteTimeUtc(path, StartDateTime.AddMilliseconds(lastModifiedTime).ToUniversalTime());
					if (toSetTime[1] == 1) File.SetLastAccessTimeUtc(path, StartDateTime.AddMilliseconds(lastAccessTime).ToUniversalTime());
					if (toSetTime[2] == 1) File.SetCreationTimeUtc(path, StartDateTime.AddMilliseconds(lastAccessTime).ToUniversalTime());
				}
				return new FileResult(0, RESULT_OK);
			}
			catch(SystemException e)
            {
				return new FileResult(1, e.ToString());
			}
		}
	}
}
