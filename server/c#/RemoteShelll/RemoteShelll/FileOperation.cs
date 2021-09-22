﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.AccessControl;
using System.Security.Principal;
using System.Text;
using System.Threading.Tasks;

namespace RemoteShelll
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
			int messageLen = this.message.Length;
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
			result = new byte[2 + messageLen + 8 + dataLen];

			result[0] = this.errorCode; // set error code
			result[1] = (byte)this.message.Length; // set message length
			Array.Copy(Encoding.UTF8.GetBytes(this.message), 0, result, 2, messageLen); // set message

			Array.Copy(FileSystemServer.getBytesFromLong(dataLen), 0, result, 2 + messageLen, 8); // set data length
			Array.Copy(data, 0, result, 2 + messageLen + 8, dataLen); // set data

			return result;
		}
	}
	class FileOperation
    {
		public readonly static String RESULT_OK = "OK.";
		public readonly static String RESULT_FAIL = "Fail.";
		public readonly static String RESULT_NOT_EXISTS = "File not exists.";
		public readonly static String RESULT_PERMISSION_DENIED = "Permission denied.";
		private String _cwd;
		private ISet<String> AllowedPath = new HashSet<String>();

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

		private String GetParentPath(String path)
		{
			bool isDir = path.EndsWith("/");
			if (isDir) path = path.Substring(0, path.Length - 1);

			String[] splitPath = path.Split('/');
			int splitCount = splitPath.Length;

			String[] resultSplitPath = new string[splitCount - 1];
			Array.Copy(splitPath, 0, resultSplitPath, 0, splitCount - 1);
			return String.Join("/", resultSplitPath) + "/";
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
			

			//FileAttributes attr = File.GetAttributes(@path);
			
			//if (!this.IsPathAllow(path)) return new FileResult(1, RESULT_PERMISSION_DENIED);
			//if (!attr.HasFlag(FileAttributes.Directory)) return new FileResult(1, "Not a directory.");

			//this._cwd = path;
			////this._cwd = this._cwd.replaceAll("\\\\", "/");
			//if (!this._cwd.EndsWith("\\")) this._cwd += "\\";
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
				FileAttributes attr = File.GetAttributes(@path);

				if (!this.IsPathAllow(path)) return new FileResult(1, RESULT_PERMISSION_DENIED);
				if (!attr.HasFlag(FileAttributes.Directory)) return new FileResult(1, "Not a directory.");
				
				DirectoryInfo d = new DirectoryInfo(@path);
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

			//path = Path.GetFullPath(path);
			
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

					attrs.setCreationTime(Directory.GetCreationTime(path).Millisecond);
					attrs.setLastAccessTime(Directory.GetLastAccessTime(path).Millisecond);
					attrs.setLastModifiedTime(Directory.GetLastWriteTime(path).Millisecond);
				}
                else
                {
					FileInfo info = new FileInfo(path);
					FileAttributes attr = info.Attributes;


					attrs.setSize(info.Length);
					attrs.setOwner(File.GetAccessControl(path).GetOwner(typeof(NTAccount)).ToString());
					attrs.setHidden(attr.HasFlag(FileAttributes.Hidden));

					attrs.setCreationTime(File.GetCreationTime(path).Millisecond);
					attrs.setLastAccessTime(File.GetLastAccessTime(path).Millisecond);
					attrs.setLastModifiedTime(File.GetLastWriteTime(path).Millisecond);
				}
				
			} catch (SystemException e) {
				Console.WriteLine(e.ToString());
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

		internal static long CopyStream(Stream src, Stream dest, long srcOffset, long destOffset, int count)
		{
			byte[] buffer = new byte[32768];
			long total = 0;
			int read;
			if (srcOffset != 0) src.Position += srcOffset;
			if (destOffset != 0) dest.Position += destOffset;
			while (count > 0 &&
				   (read = src.Read(buffer, 0, Math.Min(buffer.Length, count))) > 0)
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
				long readLen = FileOperation.CopyStream(fc, writer, position, 0, (int)length);
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
				long transferredLen = FileOperation.CopyStream(srcFc, destFc, srcPosition, destPosition, (int)length);
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
				long writtenLen = FileOperation.CopyStream(reader, fc, 0, fc.Length, (int)length);
				byte[] result = new FileResult(0, RESULT_OK, writtenLen).getBytes();
				writer.Write(result, 0, result.Length);
			}
			catch (IOException e)
			{
				byte[] result = new FileResult(1, e.ToString(), 0L).getBytes();
				writer.Write(result, 0, result.Length);
			}
		}
	}
}
