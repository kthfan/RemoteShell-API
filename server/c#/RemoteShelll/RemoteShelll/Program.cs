using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace RemoteShelll
{
    class Program
    {
        static void Main(string[] args)
        {

            FileSystemServer server = new FileSystemServer(null, null, new List<String> { "localhost"}, new List<int>() { 1234});

            Console.WriteLine(server.Token);

            server.Start();

           

            Console.ReadKey();
        }
        class TestVerifyServer : VerifyServer
        {
            public TestVerifyServer(String token, ICollection<String> allowHosts, ICollection<int> ports) : base(token, allowHosts, ports) {}
            public override void OnRequest(ConnectContext context, HttpListenerRequest request, HttpListenerResponse response)
            {
                
            }
        }
        public static void printArray(byte[] arr)
        {
            Console.WriteLine("[");
            arr.ToList().ForEach(i => Console.Write(i.ToString() + ", "));
            Console.WriteLine("]");
        }
        public static void printArray(string[] arr)
        {
            Console.WriteLine("[");
            arr.ToList().ForEach(i => Console.Write(i + ", "));
            Console.WriteLine("]");
        }
    }
}
