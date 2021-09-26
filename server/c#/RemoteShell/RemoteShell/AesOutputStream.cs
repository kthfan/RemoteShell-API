using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RemoteShell
{
    class AesOutputStream : Stream
    {
        private AesCtr _aes;
        private Stream _stream;
        public AesOutputStream(Stream stream, AesCtr aes)
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


        public override bool CanRead => false;

        public override bool CanSeek => this._stream.CanSeek;

        public override bool CanWrite => this._stream.CanWrite;

        public override long Length => this._stream.Length;

        public override long Position { get => this._stream.Position; set {this._stream.Position = value; } }

        public override void Flush()
        {
            this._stream.Flush();
        }

        public override int Read(byte[] buffer, int offset, int count)
        {
            throw new NotSupportedException();
        }

        public override long Seek(long offset, SeekOrigin origin)
        {
            return this._stream.Seek(offset, origin);
        }

        public override void SetLength(long value)
        {
            this._stream.SetLength(value);
        }

        public override void Write(byte[] buffer, int offset, int count)
        {
            this._aes.encrypt(buffer, offset, count, false);
            this._stream.Write(buffer, offset, count);
        }
    }
}
