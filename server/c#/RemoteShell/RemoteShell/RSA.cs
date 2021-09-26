using System;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace RemoteShell
{
    class RSA
    {
        public readonly static BigInteger[] FITST_PRIMES_LIST =
           new List<int> { 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997 }
                   .Select(n => new BigInteger(n)).ToArray();
        public readonly static int PADDING_K0 = 32;
        public readonly static int PADDING_K1 = 8;
        public readonly static int PADDING_N = 64;
        private readonly static RNGCryptoServiceProvider crypto = new RNGCryptoServiceProvider();

        private BigInteger[] _privateKey = null;
        private BigInteger[] _publicKey = null;

        public byte[] getPublicKey()
        {
            if (this._publicKey == null) return null;
            return this._serializeKey(this._publicKey);
        }
        public byte[] getPrivateKey()
        {
            if (this._privateKey == null) return null;
            BigInteger p = this._privateKey[2], q = this._privateKey[3], d = this._privateKey[0];
            return this._serializeKey(new BigInteger[] { p, q, d });
        }
        public void setPublicKey(byte[] pubkey)
        {
            this._publicKey = this._deserializeKey(pubkey);
        }

        public void setPrivateKey(byte[] prikey)
        {
            BigInteger p, q, d, dmp1, dmq1, coeff;
            BigInteger[] deserialized = this._deserializeKey(prikey);
            p = deserialized[0]; q = deserialized[1]; d = deserialized[2];
            BigInteger[] factors = this._factorPrivate(p, q, d);
            dmp1 = factors[0]; dmq1 = factors[1]; coeff = factors[2];
            BigInteger n = p*q;
            this._privateKey = new BigInteger[] { d, n, p, q, dmp1, dmq1, coeff };
        }

        public RSA generateKeyPair()
        {
            return this.generateKeyPair(2024);
        }
        public RSA generateKeyPair(int _bits)
        {
            return this.generateKeyPair(_bits, false);
        }
        public RSA generateKeyPair(bool checkCorrect)
        {
            return this.generateKeyPair(2024, false);
        }
        public RSA generateKeyPair(int _bits, bool checkCorrect)
        {
            BigInteger bits = new BigInteger(_bits);
            BigInteger p, q, n,
                    lambda_n, e, k, d, r,
                    dmp1, dmq1, coeff;
            BigInteger[] returnedList;
            
            returnedList = this._getTwoPrimes(_bits);
            p = returnedList[0]; q = returnedList[1];
            n = n = p * q;
            lambda_n = RSA.lcm(p - BigInteger.One, q - BigInteger.One);
            e = this._getE(lambda_n, p, q);
            returnedList = this._extendedEuclidean(lambda_n, e);
            k = returnedList[0]; d = returnedList[1]; r = returnedList[2];
            // if(r !== 1n) return generateKeyPair(bits); //throw 'extendedEuclidean fall.';
            if(!this._isKeyPairSafe(p, q, n, e, d, bits)) return this.generateKeyPair(_bits, checkCorrect); //throw 'the keypair are not safe.';
            returnedList = this._factorPrivate(p, q, d);

            dmp1 = returnedList[0]; dmq1 = returnedList[1]; coeff = returnedList[2];
        
            this._publicKey = new BigInteger[]{e, n};
            this._privateKey = new BigInteger[] { d, n, p, q, dmp1, dmq1, coeff };
            if(checkCorrect && !this.checkKeyPairCorrectness()) return this.generateKeyPair(_bits, checkCorrect); 
        
            return this;
        }

        public byte[] encrypt(byte[] M)
        {
            //        var [e, n] = this._publicKey;
            return this._encrypt(M, false, this._publicKey);
        }
        public byte[] decrypt(byte[] C)
        {
            return this._decrypt(C, true, this._privateKey);
        }

        public byte[] sign(byte[] M)
        {
            M = SHA256.Instance.Encode(M);
            return this._encrypt(M, true, this._privateKey);
        }
        public bool verify(byte[] S, byte[] M)
        {
            byte[] C = this._decrypt(S, false, this._publicKey);
            M = SHA256.Instance.Encode(M);
            for (int i = 0; i < M.Length; i++)
            {
                if (M[i] != C[i]) return false;
            }
            return true;
        }

        public bool checkKeyPairCorrectness()
        {
            return this.checkKeyPairCorrectness(1);
        }
        public bool checkKeyPairCorrectness(int iter)
        {
            byte[] data, encrypted, decrypted, signData;
            BigInteger randStart = BigInteger.One << 511;
            BigInteger randEnd = BigInteger.One << 512;
            for (int i = 0; i < iter; i++)
            {
                data = this._bint2arr(RSA.randint(randStart, randEnd));
                signData = this._bint2arr(RSA.randint(randStart, randEnd));
                encrypted = this.encrypt(data);
                decrypted = this.decrypt(encrypted);
                for (int j = 0; j < data.Length; j++)
                {
                    if (data[j] != decrypted[j]) return false;
                }
                if (!(this.verify(this.sign(data), data) && !this.verify(this.sign(signData), data))) return false;
            }
            return true;
        }

        private byte[] _encrypt(byte[] M, bool privateMod, BigInteger[] key)
        {
            byte[][] C;
            BigInteger n = key[1];
            // find log256(n)


            int ln2 = RSA.Log2(n);
            int ln256 = ln2 / 8;
            if ((ln2 & 0b111) != 0) ln256++;

            M = this._pkcs7pad(M);
            M = this._paddingSplit(M);

            byte[][] MM = this._splitByN(M, n);

            int _len;

            _len = MM.Length; C = new byte[_len][];
            for (int i = 0; i < _len; i++)
            {
                BigInteger m, c;
                m = this._arr2bint(MM[i]);
                c = privateMod ? this._chineseRemainder(m, key[2], key[3], key[4], key[5], key[6]) : RSA.modExp(m, key[0], key[1]);
                C[i] = this._bint2arr(c, ln256); // chunk size is ln256
            }

            return this._flatArray(C);
        }
        private byte[] _decrypt(byte[] C, bool privateMod, BigInteger[] key)
        {
            byte[][] MM;
            byte[] M;
            BigInteger n = key[1];
            int chunkSize;
            int _len;
            // find log256(n)
            int ln2 = RSA.Log2(n);;
            int ln256 = ln2 >> 3;
            if ((ln2 & 0b111) != 0) ln256++;
            chunkSize = ln256;

            byte[][] CC = this._splitByN(C, n, chunkSize);

            _len = CC.Length; MM = new byte[_len][];
            for (int i = 0; i < _len; i++)
            {
                BigInteger m, c;
                c = this._arr2bint(CC[i]);
                m = privateMod ? this._chineseRemainder(c, key[2], key[3], key[4], key[5], key[6]) : RSA.modExp(c, key[0], key[1]);
                MM[i] = this._bint2arr(m);
            }

            M = this._flatArray(MM);
            M = this._unpaddingSplit(M);
            M = this._pkcs7strip(M);
            return M;
        }

        private BigInteger[] _factorPrivate(BigInteger p, BigInteger q, BigInteger d)
        {
            BigInteger k, coeff, r, dmp1, dmq1;
            BigInteger[] returnedList = this._extendedEuclidean(p, q);
            k = returnedList[0]; coeff = returnedList[1]; r = returnedList[2];
            dmp1 = d % (p - BigInteger.One); dmq1 = d % (q - BigInteger.One);
            return new BigInteger[] { dmp1, dmq1, coeff };
        }

        /** modify from https://github.com/travist/jsencrypt*/
        private BigInteger _chineseRemainder(BigInteger x, BigInteger p, BigInteger q, BigInteger dmp1, BigInteger dmq1, BigInteger coeff)
        {
            // TODO: re-calculate any missing CRT params
            BigInteger xp = RSA.modExp(x % p, dmp1, p);
            BigInteger xq = RSA.modExp(x % q, dmq1, q);

            while (xp < xq)
            {
                xp += p;
            }
            return (((xp - xq) * coeff) % p) * q + xq;
        }

        private byte[][] _splitByN(byte[] arr, BigInteger n)
        {
            return this._splitByN(arr, n, -1);
        }
        private byte[][] _splitByN(byte[] arr, BigInteger n, int chunkSize)
        { // 0 <= m < n
            int x = RSA.Log2(n) - 1;

            if (n % (BigInteger.One << x) == BigInteger.Zero) x++;
            if (chunkSize == -1) chunkSize = x >> 3;//must less than n, hence can not + 1;
            int arrLength = arr.Length;
            int len = arrLength / chunkSize;
            if (arrLength % chunkSize != 0) len++;
            byte[][] result = new byte[len][];
            for (int i = 0; i < len; i++)
            {
                if ((i + 1) * chunkSize > arr.Length) result[i] = RSA.CopyOfRange(arr, i * chunkSize, arr.Length);
                else result[i] = RSA.CopyOfRange(arr, i * chunkSize, (i + 1) * chunkSize);

            }
            return result;
        }

        private byte[] _serializeKey(BigInteger[] k)
        {// k is array of bigint
            int chunkSize = RSA.PADDING_N;

            int nKeys = k.Length;
            int[] resLenArr = new int[nKeys];
            int totalLen = 0;
            byte[][] _arr = new byte[nKeys][];
            for (int i = 0; i < nKeys; i++)
            {
                byte[] _tmp;
                _tmp = this._bint2arr(k[i]);
                _tmp = this._pkcs7pad(_tmp);
                _tmp = this._paddingSplit(_tmp);
                _arr[i] = _tmp;
                totalLen += _tmp.Length;
                resLenArr[i] = _tmp.Length / chunkSize;
            }

            totalLen = totalLen + nKeys;
            byte[] resArr = new byte[totalLen]; //[e.length, e.arr, n.arr]

            int offset = 0;
            resArr[offset++] = (byte)nKeys;// set number of components
            for (int j = 0; j < nKeys - 1; j++)
            {// set length of key components
                resArr[offset++] = (byte)resLenArr[j];
            }
            for (int j = 0; j < nKeys; j++)
            {// set values to resArr
                byte[] _tmp = _arr[j];
                for (int _i = 0; _i < _tmp.Length; _i++)
                {
                    resArr[offset++] = _tmp[_i];
                }
            }
            return resArr;
        }
        private BigInteger[] _deserializeKey(byte[] k)
        {
            int chunkSize = RSA.PADDING_N;

            int offset = 0;
            int nKeys = k[offset++] & 0xff; // byte to integer
            short[] lenArr = new short[nKeys];
            int totalLen;
            int _tmp = 0;
            for (int i = 0; i < nKeys - 1; i++)
            {
                lenArr[i] = (short)(k[offset++] & 0xff);
                _tmp += lenArr[i];
            }
            totalLen = k.Length - offset;
            lenArr[nKeys - 1] = (short)(totalLen - _tmp);
            BigInteger[] resArr = new BigInteger[nKeys];
            for (int i = 0; i < nKeys; i++)
            {
                byte[] _k;
                int size = lenArr[i] * chunkSize;
                if (offset + size > k.Length) _k = RSA.CopyOfRange(k, offset, k.Length);
                else _k = RSA.CopyOfRange(k, offset, offset + size);

                _k = this._unpaddingSplit(_k);
                _k = this._pkcs7strip(_k);
                resArr[i] = this._arr2bint(_k);

                offset += size;
            }
            return resArr;
        }

        private byte[] _paddingSplit(byte[] message)
        {//split array to 24 length, because some array may to long.
            int n = RSA.PADDING_N, k0 = RSA.PADDING_K0, k1 = RSA.PADDING_K1;
            int inc = n - k0 - k1;

            int iter = message.Length / inc;
            if (message.Length % inc != 0) iter++;
            byte[][] result = new byte[iter][];
            for (int i = 0, offset = 0; i < iter; i++, offset += inc)
            {
                byte[] m = RSA.CopyOfRange(message, offset, offset + inc);
                //            if(m.length <= inc){
                //                m = this._paddingZeros(m, inc - m.length);
                //            }
                result[i] = this._padding(m);
            }
            return this._flatArray(result);
        }
        private byte[] _unpaddingSplit(byte[] message)
        {//
            int chunkSize = RSA.PADDING_N;
            if (message.Length % chunkSize != 0) message = this._paddingZeros(message, chunkSize - (message.Length % chunkSize)); //padding zeros

            int iter = message.Length / chunkSize;
            byte[][] result = new byte[iter][];
            for (int i = 0, offset = 0; i < iter; i++, offset += chunkSize)
            {
                byte[] R = RSA.CopyOfRange(message, offset, offset + chunkSize);
                result[i] = this._unpadding(R);
            }
            return this._flatArray(result);
        }

        private byte[] _pkcs7pad(byte[] data)
        {
            return this._pkcs7pad(data, RSA.PADDING_N - RSA.PADDING_K0 - RSA.PADDING_K1);
        }
        private byte[] _pkcs7pad(byte[] data, int n)
        {
            int padder = n - (data.Length % n);
            byte[] result = new byte[data.Length + padder];
            Array.Copy(data, 0, result, 0, data.Length);
            for (int i = data.Length; i < result.Length; i++)
            {
                result[i] = (byte)padder;
            }
            return result;
        }
        private byte[] _pkcs7strip(byte[] data)
        {
            int padder = data[data.Length - 1] & 0xff;
            int length = data.Length - padder;
            return RSA.CopyOfRange(data, 0, length);
        }
        private byte[] _padding(byte[] m)
        { //required length: n-k0-k1 = 24, output length: n = 64
            int n = RSA.PADDING_N, k0 = RSA.PADDING_K0, k1 = RSA.PADDING_K1;
            //        const [G, H] = [RSA.HASH_FUNCTION_G, RSA.HASH_FUNCTION_H];

            m = this._paddingZeros(m, k1); // padding k1 zeros
 
            byte[] r = new byte[k0]; RSA.crypto.GetBytes(r);
            byte[] X = this._xorArray(m, SHA256.Instance.Encode(r)); //assert X.length === n - k0;
            byte[] Y = this._xorArray(r, SHA256.Instance.Encode(X));

            return this._concatArray(X, Y);
        }
        private byte[] _unpadding(byte[] R)
        {//output length: 24
            int n = RSA.PADDING_N, k0 = RSA.PADDING_K0, k1 = RSA.PADDING_K1;
            //        const [G, H] = [RSA.HASH_FUNCTION_G, RSA.HASH_FUNCTION_H];

            //        var [X, Y] = [R.slice(0, n - k0), R.slice(n - k0, n)];
            byte[] X = RSA.CopyOfRange(R, 0, n - k0);
            byte[] Y = RSA.CopyOfRange(R, n - k0, n);
            byte[] r = this._xorArray(Y, SHA256.Instance.Encode(X));
            byte[] mZeros = this._xorArray(X, SHA256.Instance.Encode(r));
            return RSA.CopyOfRange(mZeros, 0, n - k0 - k1);
        }
        private byte[] _xorArray(byte[] a, byte[] b)
        {
            byte[] result = new byte[a.Length];
            for (int i = 0; i < a.Length; i++)
            {
                result[i] = (byte)(a[i] ^ b[i]);
            }
            return result;
        }
        private byte[] _paddingZeros(byte[] arr, int numOfZeros)
        {
            int len = arr.Length + numOfZeros;
            byte[] result = new byte[len];
            for (int i = 0; i < arr.Length; i++) result[i] = arr[i];
            for (int i = arr.Length; i < len; i++) result[i] = 0;
            return result;
        }
        private byte[] _flatArray(byte[][] arr)
        { // two dim array required
            int len = 0;
            for (int i = 0; i < arr.Length; i++)
            {
                len += arr[i].Length;
            }
            byte[] result = new byte[len];
            int offset = 0;
            for (int i = 0; i < arr.Length; i++)
            {
                for (int j = 0; j < arr[i].Length; j++)
                    result[offset++] = arr[i][j];
            }
            return result;
        }
        private byte[] _concatArray(byte[] A, byte[] B)
        {
            int al = A.Length, len = al + B.Length;
            byte[] result = new byte[len];
            for (int i = 0; i < al; i++) result[i] = A[i];
            for (int i = 0, j = al; j < len; i++, j++) result[j] = B[i];
            return result;
        }

        private BigInteger _arr2bint(byte[] arr)
        {
            int len = arr.Length;
            BigInteger bint = BigInteger.Zero;
            for (int i = 0; i < len; i++)
            {
                bint += new BigInteger(arr[i]) << (i << 3);
        }
            return bint;
        }
        private byte[] _bint2arr(BigInteger bint)
        {
            int ln2 = RSA.Log2(bint);
            int len = ln2 / 8;
            if ((ln2 & 0b111) != 0) len++;
            return this._bint2arr(bint, len);
        }
        private byte[] _bint2arr(BigInteger bint, int len)
        {
            byte[] buffer = new byte[len];
            for (int i = 0; i < len; i++)
            {
                buffer[i] = ((byte)(bint % new BigInteger(256)));
                bint >>= 8;
            }
            return buffer;
        }

        private bool _isKeyPairSafe(BigInteger p, BigInteger q, BigInteger n, BigInteger e, BigInteger d, BigInteger bits)
        {
            if (p < (q << 1) && p > q && d < (BigInteger.One << ((int)bits) / 4) / new BigInteger(3))  return false;
            return true;
        }

        private BigInteger[] _getTwoPrimes(int bits)
        {
            /** p - q should larger than 2n^{1/4}*/
            int pBits = bits >> 1;
            BigInteger[] range = new BigInteger[] { (BigInteger.One << (pBits - 1))+ BigInteger.One, (BigInteger.One << pBits) - BigInteger.One };
            BigInteger step = range [1] - range [0];
            BigInteger dist = BigInteger.One << ((bits>>2) + 2);
            return new BigInteger[]{this._generatePrimeNumberByProbability(range[1] + dist, range[1] + dist + step), this._generatePrimeNumberByProbability(range[0], range[1])};
        }

        /** modify from https://github.com/travist/jsencrypt*/
        private BigInteger _getLowLevelPrime(BigInteger n0, BigInteger n1)
        {
            BigInteger[] LOW_PRIME_LIST = RSA.FITST_PRIMES_LIST;
            int LOW_PRIME_LENGTH = LOW_PRIME_LIST.Length;
            BigInteger BIG_LOW_PRIME = RSA.FITST_PRIMES_LIST[LOW_PRIME_LENGTH - 1];
            BigInteger lplim = (BigInteger.One << 26) / BIG_LOW_PRIME + BigInteger.One;

            while (true)
            {
                // Obtain a random number
                BigInteger x = RSA.randint(n0, n1);
                if ((x & BigInteger.One) == BigInteger.Zero) x++;

                if (x < (BigInteger.One << 28) && x <= BIG_LOW_PRIME) { // check if x is prime that in list "LOW_PRIME_LIST"
                    for (int j = 1; j < LOW_PRIME_LENGTH; j++)
                    {// not including 2
                        if (x == LOW_PRIME_LIST[j])
                        {
                            return x;
                        }
                    }
                    continue;
                }

                var i = 1;
                var _notPrime = false;
                while (i < LOW_PRIME_LENGTH)
                {
                    BigInteger m = LOW_PRIME_LIST[i];
                    int j = i + 1;
                    while (j < LOW_PRIME_LENGTH && m < lplim)
                    {
                        m *= LOW_PRIME_LIST[j++];
                    }
                    m = x % m;
                    while (i < j)
                    {
                        if (m % LOW_PRIME_LIST[i++] == BigInteger.Zero) {
                            _notPrime = true;
                            break;
                        }
                    }
                    if (_notPrime) break;
                }
                if (_notPrime) continue;
                return x;
            }
        }
        /** modify from https://github.com/travist/jsencrypt*/
        private bool _MillerRabinPrimalityTest(BigInteger n)
        {
            BigInteger[] LOW_PRIME_LIST = RSA.FITST_PRIMES_LIST;
            int LOW_PRIME_LENGTH = LOW_PRIME_LIST.Length;
            BigInteger n1 = n - BigInteger.One;
            int t = 10;

            var k = 0;
            while (true)
            {
                if ((n1 & (BigInteger.One << k)) != BigInteger.Zero) break;
                k++;
            }

            if (k <= 0) {
                return false;
            }
            BigInteger r = n1 >> k;
            t = (t + 1) >> 1;
            if (t > LOW_PRIME_LENGTH)
            {
                t = LOW_PRIME_LENGTH;
            }
            int count = (int) RSA.randint(BigInteger.Zero, new BigInteger(LOW_PRIME_LENGTH));
            for (int i = 0; i < t; ++i, count = (count + 1) % LOW_PRIME_LENGTH)
            {
                // Pick bases at random, instead of starting at 2
                BigInteger a = LOW_PRIME_LIST[count];
                BigInteger y = RSA.modExp(a, r, n);
                if (y != BigInteger.One && y != n1) {
                    int j = 1;
                    while (j++ < k && y != n1)
                    {
                        y = y * y % n;
                        if (y == BigInteger.One) {
                            return false;
                        }
                    }
                    if (y != n1)
                    {
                        return false;
                    }
                }
            }
            return true;
        }

        private BigInteger[] _extendedEuclidean(BigInteger a, BigInteger b)
        {
            BigInteger old_s = BigInteger.One, s = BigInteger.Zero;
            BigInteger old_t = BigInteger.Zero, t = BigInteger.One;
            BigInteger old_r = a, r = b;
            if (b == BigInteger.Zero) return new BigInteger[] { BigInteger.One, BigInteger.Zero, a };
            else
            {
                while (r != BigInteger.Zero)
                {
                    BigInteger tmp;
                    BigInteger q = old_r / r;
                    tmp = r; r = old_r - q * r; old_r = tmp;
                    tmp = s; s = old_s - q * s; old_s = tmp;
                    tmp = t; t = old_t - q * t; old_t = tmp;
                }
            }
            if (old_t < BigInteger.Zero)
            {
                old_t = old_t % a;
                old_t += a;
            }
            return new BigInteger[] { old_s, old_t, old_r };
        }
        private BigInteger _generatePrimeNumberByProbability(BigInteger n0, BigInteger n1)
        {
            int maxIter = 10000;
            for(int i=0; i<maxIter; i++){
                BigInteger prime_candidate = this._getLowLevelPrime(n0, n1);
                if (!this._MillerRabinPrimalityTest(prime_candidate))
                    continue;
                else
                    return prime_candidate;
            }
            throw new Exception("can not find prime number");
        }

        private BigInteger _getE(BigInteger lambda_n, BigInteger p, BigInteger q)
        {
            BigInteger[] e_list1_pre = new BigInteger[] { new BigInteger(65537), new BigInteger(257), new BigInteger(17) };
            for (int i = 0; i < e_list1_pre.Length; i++)
            {
                BigInteger e0 = e_list1_pre[i];
                if (BigInteger.One < e0 && e0 < lambda_n && lambda_n % e0 != BigInteger.Zero/*since e is prime*/) return e0;
            }

            //method 2: use prime number.
            BigInteger a = RSA.gcd(p - BigInteger.One, q - BigInteger.One);
            BigInteger b = (p - BigInteger.One / a);
            BigInteger c = (q - BigInteger.One / a);
            var maxVal = a > b ? a : b;
            maxVal = maxVal > c ? maxVal : c;
            for (int i = 0; i < 100; i++)
            {
                var prime = this._getLowLevelPrime(new BigInteger(65536), maxVal);
                if (this._MillerRabinPrimalityTest(prime) && prime < lambda_n && lambda_n % prime != BigInteger.Zero/*since e is prime*/)
                    return prime;
            }
            //method 3:　force.
            BigInteger e = lambda_n - BigInteger.One;
            while (e > new BigInteger(65536))
            {
                if (RSA.gcd(e, lambda_n) == BigInteger.One){
                    return e;
                }
                e--;
            }

            throw new Exception("can not find e.");
        }

        public static BigInteger randint(BigInteger start, BigInteger end)
        {
            BigInteger range = end - start;
            int ln2 = RSA.Log2(range);
            int len = ln2 >> 3;
            if ((ln2 & 0b111) != 0) len++;

            byte[] randArr = new byte[len]; RSA.crypto.GetBytes(randArr);
            BigInteger bint = BigInteger.Zero;


            for (int i = 0; i < len; i++)
            {
                int intVal = randArr[i] & 0xff;
                bint += new BigInteger(intVal) << (i << 3);
            }
            bint = range * bint / (BigInteger.One << (len << 3)) +start;
            return bint;
        }
        public static BigInteger gcd(BigInteger a, BigInteger b)
        {//Greatest Common Divisor Generator (Euclidean Algorithm)
            BigInteger temp;
            while (b != BigInteger.Zero)
            {
                temp = b;
                b = a % b;
                a = temp;
            }
            return a;
        }
        public static BigInteger lcm(BigInteger a, BigInteger b)
        {
            return a * b / RSA.gcd(a, b);
        }
        public static BigInteger log(BigInteger n)
        {
            BigInteger _ln = new BigInteger(RSA.Log2(n) - 1);
            return (_ln << 16) / new BigInteger(94548);
        }
        public static BigInteger modExp(BigInteger x, BigInteger e, BigInteger m)
        {
            BigInteger X = x, E = e, Y = BigInteger.One;
            while (E > BigInteger.Zero)
            {
                if ((E & BigInteger.One) == BigInteger.Zero){
                    X = (X * X) % m;
                    E = E >> 1;
                }else
                {
                    Y = (X * Y) % m;
                    E = E - 1;
                }
            }
            return Y;
        }

        private static byte[] CopyOfRange(byte[] srcArr, int start, int end)
        {
            int len = end - start;
            byte[] result = new byte[len];
            Array.Copy(srcArr, start, result, 0, len);
            return result;
        }
        private static int Log2(BigInteger n) {
            int result = 0;

            while (n != 0)
            {
                n >>= 1;
                result++;
            }
            return result;
        }
    }
}
