using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RemoteShell
{
    class AesInputStream : Stream
    {
        private AesCtr _aes;
        private Stream _stream;
        public AesInputStream(Stream stream, AesCtr aes)
        {
            this._aes = aes;
            this._stream = stream;
        }
        public Stream Stream
        {
            get => this._stream;
        }
        public AesCtr Aes
        {
            get => this._aes;
        }


        public override bool CanRead => this._stream.CanRead;

        public override bool CanSeek => this._stream.CanSeek;

        public override bool CanWrite => false;

        public override long Length => this._stream.Length;

        public override long Position { get => this._stream.Position; set { this._stream.Position = value; } }

        public override void Flush()
        {
            this._stream.Flush();
        }

        public override int Read(byte[] buffer, int offset, int count)
        {
            int result = this._stream.Read(buffer, offset, count);
            this._aes.decrypt(buffer, offset, result, false);
            return result;
        }

        public override long Seek(long offset, SeekOrigin origin)
        {
            return this._stream.Seek(offset, origin);
        }

        public override void SetLength(long value)
        {
            throw new NotSupportedException();
        }

        public override void Write(byte[] buffer, int offset, int count)
        {
            throw new NotSupportedException();
        }

        public static byte[] ReadRemaining(Stream stream)
        {
            using (MemoryStream memoryStream = new MemoryStream())
            {
                stream.CopyTo(memoryStream);
                return memoryStream.ToArray();
            }
        }
    }
}
