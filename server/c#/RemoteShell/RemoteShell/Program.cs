using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace RemoteShell
{
    class Program
    {
        static void Main(string[] args)
        {

            ISet<String> optSet =
            new HashSet<String>(new List<String>() {
                "-d", "-p", "-h", "-t", "--load-key-pair",
                "--directory", "--port", "--host", "--token",
                "--save-key-pair", "--help"
            });

            String token = null;
            String workingDir = Directory.GetCurrentDirectory();
            List<String> hostList = new List<String>();
            List<int> portList = new List<int>();

            byte[] pubkey = null;
            byte[] prikey = null;
           
            // exit after operation
            if (args.Length == 1)
            {
                if (Array.IndexOf(args, "--help") != -1)
                {
                    Program.help();
                }
                return;
            }

            int optIndex = 0;
            while (optIndex < args.Length)
            {
                String arg = args[optIndex];
                switch (arg)
                {
                    case "-t":
                    case "--token":
                        if (args.Length > optIndex + 1)
                            token = args[optIndex + 1];
                        optIndex++;
                        break;
                    case "-d":
                    case "--directory":
                        if (args.Length > optIndex + 1)
                            workingDir = args[optIndex + 1];
                        optIndex++;
                        break;
                    case "-p":
                    case "--port":
                        while (args.Length > optIndex + 1 && !optSet.Contains(args[optIndex + 1]))
                        {
                            portList.Add(int.Parse(args[optIndex + 1]));
                            optIndex++;
                        }
                        break;
                    case "-h":
                    case "--host":
                        while (args.Length > optIndex + 1 && !optSet.Contains(args[optIndex + 1]))
                        {
                            hostList.Add(args[optIndex + 1]);
                            optIndex++;
                        }
                        break;
                    case "--load-key-pair":
                        if (args.Length > optIndex + 2)
                        {
                            pubkey = Program.readFile(args[optIndex + 1]);
                            prikey = Program.readFile(args[optIndex + 2]);
                            optIndex += 2;
                        }
                        else
                        {
                            Console.WriteLine("Error: option --load-key-pair public-key-path private-key-path");
                        }
                        break;
                    case "--save-key-pair":
                        if (args.Length > optIndex + 2)
                        {
                            RSA rsa = new RSA();
                            try
                            {
                                rsa.generateKeyPair();
                            }
                            catch (Exception e)
                            {
                                Console.WriteLine(e);
                            }

                            pubkey = rsa.getPublicKey();
                            prikey = rsa.getPrivateKey();
                            Program.writeFile(args[optIndex + 1], pubkey);
                            Program.writeFile(args[optIndex + 2], prikey);
                            optIndex += 2;
                        }
                        else
                        {
                            Console.WriteLine("Error: option --save-key-pair public-key-path private-key-path");
                        }
                        break;
                    default:
                        break;
                }
                optIndex++;
            }


            if (portList.Count == 0) portList.Add(80);

            try
            {
                FileSystemServer server = new FileSystemServer(workingDir, token, hostList, portList);
                if (prikey != null) server.SetKeyPair(pubkey, prikey);
                Console.WriteLine("Your token is: " + server.Token);
                Console.WriteLine("Starting server...");
                server.Start();
                Console.WriteLine("Stopping server...");
            }
            catch (UnauthorizedAccessException e)
            {
                Console.WriteLine("Invalid path: " + workingDir);
            }
            catch (IOException e1)
            {
                Console.WriteLine(e1);
                Console.WriteLine("Unable to run server.");
            }
        }

        private static void help()
        {
            Console.WriteLine("Usage: remoteshell [OPTION]...");
            Console.WriteLine("  or java -jar remoteshell [OPTION]...");
            Console.WriteLine("Try \'remoteshell --help\' for more information.");
            Console.WriteLine("  {0,-16} {1}\n", "-t, --token", "Set token, which used to allow client to access the server.");
            Console.WriteLine("  {0,-16} {1}\n", "-h, --host", "Set allowed hosts. Allow server to send the Access-Control-Allow-Origin header. Default will be none.");
            Console.WriteLine("  {0,-16} {1}\n", "-p, --port", "Set listening ports, default will be 80.");
            Console.WriteLine("  {0,-16} {1}\n", "-d, --directory", "Set working directory.");
            Console.WriteLine("  {0,-16} {1}\n     public-key-path\n     private-key-path\n", "--load-key-pair", "Load public key and private key.");
            Console.WriteLine("  {0,-16} {1}\n     public-key-path\n     private-key-path\n", "--save-key-pair", "Save public key and private key.");
        }

        private static byte[] readFile(String fn)
        {
            byte[] result = null;
            fn = Path.GetFullPath(fn);
            using(FileStream fs = File.OpenRead(fn))
            {
                result = new byte[fs.Length];
                fs.Read(result, 0, result.Length);
            }
            return result;
        }
        private static bool writeFile(String fn, byte[] data)
        {
            fn = Path.GetFullPath(fn);
            try
            {
                using (FileStream fs = File.Open(fn, FileMode.CreateNew, FileAccess.Write))
                {
                    fs.Write(data, 0, data.Length);
                    return true;
                }
            }
            catch (SystemException e)
            {
                Console.WriteLine(e);
                return false;
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
