using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.IO;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace RemoteShell
{

    class ConnectContext
    {
        internal ConnectContext()
        {

        }
        public void resetContext()
        {
            this.AutoClose = true;
            this.responseData = new byte[0];
            this._isResponseDataEncrypted = false;
        }
        public void BeforeSend(HttpListenerResponse response)
        {
            if (this.isSecure() && !this._isResponseDataEncrypted)
            {
                this.aesEncrypt.encrypt(this.responseData, 0, this.responseData.Length, false);
                this._isResponseDataEncrypted = true;
            }

            response.OutputStream.Write(this.responseData, 0, this.responseData.Length);
            this.requestData = null;
        }
        public byte[] GetResponseData()
        {
            return this.responseData;
        }
        public void SetResponseData(byte[] responseData)
        {
            this.responseData = responseData;
        }
        public byte[] getRequestData()
        {
            if (this.requestData == null) this.requestData = AesInputStream.ReadRemaining(this.reader);
            return requestData;
        }
        public Stream getWriter()
        {
            return this.writer;
        }
        public Stream getReader()
        {
            return this.reader;
        }
        public bool isSecure()
        {
            return this._isSecure;
        }
        internal byte[] responseData = new byte[0];
        internal byte[] requestData;
        internal bool _isResponseDataEncrypted = false;
        internal bool _isSecure = false;
        //		private RSA rsa;
        internal AesCtr aesEncrypt;
        internal AesCtr aesDecrypt;
        internal Stream writer;
        internal Stream reader;
        internal bool AutoClose = true;
    }

    abstract class VerifyServer
    {

        private readonly static String QUERY_NAME_TOKEN = "token";
        private readonly static String QUERY_NAME_SECURE = "secure";
        private readonly static String QUERY_NAME_ESTABLISH = "establish";

        private HttpListener HttpServer;
        private bool KeepRunning = false;

        private ISet<String> AllowedHosts;
        private ISet<int> OpenPorts;
        private String _Token;

        private RSA EstablishRSA = new RSA();

        private Dictionary<String, ConnectContext> contextMap = new Dictionary<String, ConnectContext>();
        private Dictionary<String, List<ConnectContext>> contextByHostMap = new Dictionary<String, List<ConnectContext>>();

        public String Token
        {
            get => this._Token;
            set => this._Token = value;
        }

        public VerifyServer() : this(null, null, null)
        {
            
        }
        public VerifyServer(String token, ICollection<String> allowHosts, ICollection<int> ports)
        {
            if (token == null) token = this.GenerateToken();
            if (allowHosts == null) allowHosts = new HashSet<String>() { "*"};
            if (ports == null) ports = new HashSet<int>() { 80};
            this.AllowedHosts = new HashSet<String>(allowHosts);
            this.OpenPorts = new HashSet<int>(ports);
            this.Token = token;
        }

        private String GenerateSessionId()
        {
            String id = null;
            byte[] randBytes = new byte[32];
            RNGCryptoServiceProvider crypto = new RNGCryptoServiceProvider();
            do
            {
                crypto.GetBytes(randBytes);
                id = Convert.ToBase64String(randBytes);
                id = id.Replace("=", "_");
            } while (contextMap.ContainsKey(id));
            return id;
        }

        private String GenerateToken()
        {
            return this.GenerateToken(32);
        }
        private String GenerateToken(int length)
        {
            String token = null;
            byte[] randBytes = new byte[length];
            RNGCryptoServiceProvider crypto = new RNGCryptoServiceProvider();
            crypto.GetBytes(randBytes);
            token = Convert.ToBase64String(randBytes);
            token = token.Replace("=", "_");
            token = token.Replace("/", "-");
            return token;
        }

        private Dictionary<String, byte[]> SplitSecureData(byte[] bytes, int n)
        {
            Dictionary<String, byte[]> result = new Dictionary<String, byte[]>();
            int count = 0;
            int lastOffset = 0;
            int lastEqualOffset = 0;
            for (int i = 1; i < bytes.Length; i++)
            {
                if (bytes[i] == 61)
                { // "="
                    lastEqualOffset = i;
                }
                else if (bytes[i - 1] == 13 && bytes[i] == 10)
                { // "\r\n"
                    result.Add(
                            Encoding.UTF8.GetString(this.CopyOfRange(bytes, lastOffset, lastEqualOffset)),
                            this.CopyOfRange(bytes, lastEqualOffset + 1, i - 1)
                    );
                    count++;
                    lastOffset = i + 1;
                    if (count >= n) break;
                }
            }
            for (int i = lastOffset; i < bytes.Length; i++)
            {
                if (bytes[i] == 61)
                { // "="
                    lastEqualOffset = i;
                    result.Add(
                             Encoding.UTF8.GetString(this.CopyOfRange(bytes, lastOffset, lastEqualOffset)),
                            this.CopyOfRange(bytes, lastEqualOffset + 1, bytes.Length)
                    );
                    break;
                }
            }
            return result;
        }
        private byte[] JoinSecureData(String[] keys, String[] vals, byte[] data)
        {// [id, pubkey]  [fdkbcds]  pubkey
            int totalLen = data.Length + keys[keys.Length - 1].Length + 1;
            for (int i = 0; i < vals.Length; i++)
            {
                totalLen += keys[i].Length + vals[i].Length + 3;
            }
            byte[] result = new byte[totalLen];
            int offset = 0;
            for (int i = 0; i < vals.Length; i++)
            {
                String s = keys[i] + "=" + vals[i] + "\r\n";
                
                Array.Copy(Encoding.UTF8.GetBytes(s), 0, result, offset, s.Length);
                offset += s.Length;
            }
            String s1 = keys[keys.Length - 1] + "=";
            Array.Copy(Encoding.UTF8.GetBytes(s1), 0, result, offset, s1.Length);
            offset += s1.Length;
            Array.Copy(data, 0, result, offset, data.Length);
            return result;

        }

        private ConnectContext GuestContextByHost(HttpListenerRequest request, bool useSecure)
        {
            ConnectContext result = null;
            Stream reader = request.InputStream;
            
            int idLen = reader.ReadByte();
            byte[] rawId = this.GetBytesFromStream(reader, idLen);

            if (!useSecure)
            {
                this.contextMap.TryGetValue(Encoding.UTF8.GetString(rawId), out result);
                return result;
            }

            String[] hosts = request.Headers.GetValues("Host") ?? new string[]{"*"};
            String host = hosts[0];

            List<ConnectContext> contextList;
            
            contextByHostMap.TryGetValue(host, out contextList);
            if (contextList.Count == 1)
            {
                result = contextList.ElementAt(0);
            }
            else
            {
                foreach(ConnectContext context in contextList)
                {
                    if (!context.isSecure()) continue;
                    AesCtr aesDec = context.aesDecrypt.clone();
                    byte[] decryptedId = aesDec.decrypt(rawId, 0, idLen, true);

                    String id = Encoding.UTF8.GetString(decryptedId);
                    this.contextMap.TryGetValue(id, out result);
                    if (result == context) break;
                }
            }

            result.aesDecrypt.decrypt(rawId, 0, idLen, false); // must decrypt because aes ctr counter
            return result;
        }
        private void AddContextByHost(HttpListenerRequest request, ConnectContext context)
        {
            String[] hosts = request.Headers.GetValues("Host") ?? new string[] {"*"};
            String host = hosts[0];
            if (!contextByHostMap.ContainsKey(host))
            {
                contextByHostMap.Add(host, new List<ConnectContext>());
            }
            List<ConnectContext> list;
            contextByHostMap.TryGetValue(host, out list);
            list.Add(context);
        }

        private bool SetAllowAccessHost(HttpListenerRequest request, HttpListenerResponse response)
        {
            String[] originList = request.Headers.GetValues("Origin");
            String[][] splitList = originList.ToList().Select(o => o.Split('/')).ToArray();
            String origin;
            //special case
            foreach(string[] split in splitList)
            {
                
                if (split.Length == 1 && split[0] == "null")
                {
                    if (!this.AllowedHosts.Contains("null")) return false;
                    response.Headers.Add("Access-Control-Allow-Origin", "null");
                    return true;
                }
                else origin = split[2];

                if (this.AllowedHosts.Contains(origin) || this.AllowedHosts.Contains("*"))
                {
                    response.Headers.Add("Access-Control-Allow-Origin", "http://" + origin);
                    return true;
                }
            }
            
            return false;
        }

        private void EstablishSecureConnect(HttpListenerRequest request, HttpListenerResponse response)
        {
            byte[] binData = AesInputStream.ReadRemaining(request.InputStream);

            if (binData.Length == 0)
            {
                String id = this.GenerateSessionId();
                byte[] responseBytes;
                byte[] pubkey;
                ConnectContext context = new ConnectContext();
                context._isSecure = true;
                contextMap.Add(id, context);

                //			context.rsa = new RSA();
                //			context.rsa.generateKeyPair();
                pubkey = this.EstablishRSA.getPublicKey();

                responseBytes = this.JoinSecureData(new String[] { "id", "pubkey" }, new String[] { id }, pubkey);
                response.OutputStream.Write(responseBytes, 0, responseBytes.Length);
            }
            else if (binData.Length >= 3 && Encoding.UTF8.GetString(this.CopyOfRange(binData, 0, 3)) == "id=")
            {
                Dictionary<String, byte[]> aesMap = this.SplitSecureData(binData, 1);

                byte[] idBytes;
                aesMap.TryGetValue("id", out idBytes);
                String oldId = Encoding.UTF8.GetString(idBytes);
                String newId = this.GenerateSessionId();
                ConnectContext context;
                contextMap.TryGetValue(oldId, out context);
                contextMap.Remove(oldId);
                contextMap.Add(newId, context);

                byte[] aesKey;
                aesMap.TryGetValue("aesKey", out aesKey);

                aesKey = this.EstablishRSA.decrypt(aesKey);

                context.aesEncrypt = new AesCtr(aesKey);
                context.aesDecrypt = new AesCtr(aesKey);

                byte[] responseBytes = this.JoinSecureData(new String[] { "newid", "id", "none" }, new String[] { newId, oldId }, new byte[0]);

                responseBytes = context.aesEncrypt.encrypt(responseBytes);
                response.OutputStream.Write(responseBytes, 0, responseBytes.Length);

                this.AddContextByHost(request, context);
            }
        }
        private void EstablishNormalConnect(HttpListenerRequest request, HttpListenerResponse response)
        {
            String id = this.GenerateSessionId();
            byte[] responseBytes;
            ConnectContext context = new ConnectContext();
            contextMap.Add(id, context);
            responseBytes = this.JoinSecureData(new String[] { "id", "none" }, new String[] { id }, new byte[0]);
            response.OutputStream.Write(responseBytes, 0, responseBytes.Length);

            this.AddContextByHost(request, context);
        }

        private void VerifiedRequest(HttpListenerRequest request, HttpListenerResponse response, bool useSecure)
        {

            ConnectContext context = this.GuestContextByHost(request, useSecure);

            if (context.isSecure())
            {
                context.writer = new AesOutputStream(response.OutputStream, context.aesEncrypt);
                context.reader = new AesInputStream(request.InputStream, context.aesDecrypt);
            }
            else
            {
                context.writer = response.OutputStream;
                context.reader = request.InputStream;
            }

            context.resetContext();
            this.OnRequest(context, request, response);
            context.BeforeSend(response);

            if (context.AutoClose)
            {
                request.InputStream.Close();
                response.OutputStream.Close();
            }
        }

        public abstract void OnRequest(ConnectContext context, HttpListenerRequest request, HttpListenerResponse response);

        private void OnRequest(HttpListenerRequest request, HttpListenerResponse response)
        {
            NameValueCollection param = request.QueryString;

            if (this.SetAllowAccessHost(request, response) &&
                    param[QUERY_NAME_TOKEN] != null &&
                    param[QUERY_NAME_TOKEN].Replace(" ", "+") == this._Token)
            {
                // check parameters
                bool useSecure = false;
                bool isEstablish = false;
                if (param[QUERY_NAME_SECURE] != null)
                {
                    String secureVal = param[QUERY_NAME_SECURE];
                    useSecure = secureVal == "true" || secureVal == "";
                }
                if (param[QUERY_NAME_ESTABLISH] != null)
                {
                    String establishVal = param[QUERY_NAME_ESTABLISH];
                    isEstablish = establishVal == "true" || establishVal == "";
                }

                // establish or request
                if (isEstablish)
                {
                    if (useSecure) this.EstablishSecureConnect(request, response);
                    else this.EstablishNormalConnect(request, response);
                    request.InputStream.Close();
                    response.OutputStream.Close();
                }
                else
                {
                    this.VerifiedRequest(request, response, useSecure);
                }

            }
            else
            {
                response.StatusCode = 401;
                byte[] responseData = Encoding.UTF8.GetBytes("Invalid token.");
                response.OutputStream.Write(responseData, 0, responseData.Length);

                request.InputStream.Close();
                response.OutputStream.Close();
            }

        }

        public void Start()
        {
            if (this.EstablishRSA.getPublicKey() == null || this.EstablishRSA.getPrivateKey() == null)
            {
                this.EstablishRSA.generateKeyPair(2024);
            }
            this.HttpServer = new HttpListener();
            foreach(String _host in this.AllowedHosts)
            {
                String host = _host;
                // if host contain port
                if (host.IndexOf(":") != -1) host = host.Split(':')[0];
                foreach (int port in this.OpenPorts)
                {
                    this.HttpServer.Prefixes.Add("http://" + host + ":" + port + "/");
                }
            }
            this.HttpServer.Start();
            this.KeepRunning = true;
            while (this.KeepRunning)
            {
                this.HttpServer.BeginGetContext(new AsyncCallback(this.ListenerCallback), this.HttpServer).AsyncWaitHandle.WaitOne(2000, true);
                //HttpListenerContext httpContext = this.HttpServer.GetContext();
                //HttpListenerRequest request = httpContext.Request;
                //HttpListenerResponse response = httpContext.Response;

                //this.OnRequest(request, response);

            }
            this.HttpServer.Close();
        }
        private void ListenerCallback(IAsyncResult result)
        {
            HttpListener listener = (HttpListener)result.AsyncState;
            // close listener if server is closed
            if (!listener.IsListening)
            {
                this.Close();
                listener.Abort();
                listener.Close();
                return;
            }
            try
            {
                HttpListenerContext httpContext = listener.EndGetContext(result);
                HttpListenerRequest request = httpContext.Request;
                HttpListenerResponse response = httpContext.Response;

                this.OnRequest(request, response);
            }
            catch(HttpListenerException e)
            {
                Console.WriteLine("Http server might have been closed.");
            }
            
        }

        public void Close()
        {
            this.KeepRunning = false;
        }

        public void SetKeyPair(byte[] publicKey, byte[] privateKeys)
        {
            this.EstablishRSA.setPublicKey(publicKey);
            this.EstablishRSA.setPrivateKey(privateKeys);
        }


        private byte[] GetBytesFromStream(Stream stream, int length)
        {
            byte[] result = new byte[length];
            stream.Read(result, 0, length);
            return result;
        }
        private byte[] CopyOfRange(byte[] srcArr, int start, int end)
        {
            int len = end - start;
            byte[] result = new byte[len];
            Array.Copy(srcArr, start, result, 0, len);
            return result;
        }
    }
}
