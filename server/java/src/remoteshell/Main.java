package remoteshell;

import java.util.Arrays;
import java.util.List;
import java.util.ArrayList;
import java.util.Set;
import java.util.HashSet;
import java.io.UnsupportedEncodingException;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.charset.Charset;
import java.nio.file.Paths;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.security.AccessControlException;
import java.io.IOException;

public class Main{
    public static void main(String[] args) {
        final Set<String> optSet = 
            new HashSet<String>(Arrays.asList(
                "-d", "-p", "-h", "-t", "--load-key-pair",
                "--directory", "--port", "--host", "--token",
                "--save-key-pair", "--help"
            ));

        String token = null;
        String workingDir = System.getProperty("user.dir");
        List<String> hostList = new ArrayList<String>();
        List<Integer> portList = new ArrayList<Integer>();

        byte[] pubkey = null;
        byte[] prikey = null;

        // exit after operation
        if(args.length == 1){
            if(Arrays.binarySearch(args, "--help") != -1){
                help();
            }
            return;
        }
        

        int optIndex = 0;

        while(optIndex < args.length){
            String arg = args[optIndex];
            switch (arg) {
                case "-t":
                case "--token":
                if(args.length > optIndex + 1)
                    token = args[optIndex + 1];
                optIndex++;
                    break;
                case "-d":
                case "--directory":
                if(args.length > optIndex + 1)
                    workingDir = args[optIndex + 1];
                optIndex++;
                    break;
                case "-p":
                case "--port":
                while(args.length > optIndex + 1 && !optSet.contains(args[optIndex + 1])){
                    portList.add(Integer.valueOf(args[optIndex + 1]));
                    optIndex++;
                }
                    break;
                case "-h":
                case "--host":
                while(args.length > optIndex + 1 && !optSet.contains(args[optIndex + 1])){
                    hostList.add(args[optIndex + 1]);
                    optIndex++;
                }
                    break;
                case "--load-key-pair":
                if(args.length > optIndex + 2){
                    pubkey = readFile(args[optIndex+1]);
                    prikey = readFile(args[optIndex+2]);
                    optIndex += 2;
                }else{
                    System.out.println("Error: option --load-key-pair public-key-path private-key-path");
                }
                    break; 
                case "--save-key-pair":
                if(args.length > optIndex + 2){
                    RSA rsa = new RSA();
                    try {
                        rsa.generateKeyPair();
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                   
                    pubkey = rsa.getPublicKey();
                    prikey = rsa.getPrivateKey();
                    writeFile(args[optIndex+1], pubkey);
                    writeFile(args[optIndex+2], prikey);
                    optIndex += 2;
                }else{
                    System.out.println("Error: option --save-key-pair public-key-path private-key-path");
                }
                    break;
                default:
                    break;
            }
            optIndex++;
        }

        if(portList.isEmpty()) portList.add(80);

        try {
            FileSystemServer server = new FileSystemServer(workingDir, token, hostList, portList);
            if(prikey != null) server.setKeyPair(pubkey, prikey);
            System.out.println("Your token is: " + server.getToken());
            System.out.println("Starting server...");
            server.start();
            System.out.println("Stopping server...");
        } catch (AccessControlException e) {
            System.out.println("Invalid path: " + workingDir);
        } catch(IOException e1){
            e1.printStackTrace();
            System.out.println("Unable to run server.");
        }
    }

    private static void help(){
        System.out.println("Usage: remoteshell [OPTION]...");
        System.out.println("  or java -jar remoteshell [OPTION]...");
        System.out.println("Try \'remoteshell --help\' for more information.");
        System.out.format("  %-16s %s\n", "-t, --token", "Set token, which used to allow client to access the server.");
        System.out.format("  %-16s %s\n", "-h, --host", "Set allowed hosts. Allow server to send the Access-Control-Allow-Origin header. Default will be none.");
        System.out.format("  %-16s %s\n", "-p, --port", "Set listening ports, default will be 80.");
        System.out.format("  %-16s %s\n", "-d, --directory", "Set working directory.");
        System.out.format("  %-16s %s\n     public-key-path\n     private-key-path\n", "--load-key-pair", "Load public key and private key.");
        System.out.format("  %-16s %s\n     public-key-path\n     private-key-path\n", "--save-key-pair", "Save public key and private key.");
    }

    private static byte[] readFile(String fn){
        Path path = Paths.get(fn);
        try(FileChannel fc = FileChannel.open(path, StandardOpenOption.READ)) {
            ByteBuffer dst = ByteBuffer.allocate((int) fc.size());
            fc.read(dst);
            fc.close();
            return dst.array();
		} catch (IOException e) {
            return null;
		}
    }
    private static boolean writeFile(String fn, byte[] data){
        Path path = Paths.get(fn);
        try(FileChannel fc = FileChannel.open(path, StandardOpenOption.WRITE, StandardOpenOption.CREATE)) {
            ByteBuffer bb = ByteBuffer.wrap(data);
            fc.write(bb);
            fc.close();
            return true;
		} catch (IOException e) {
            return false;
		}
    }
}