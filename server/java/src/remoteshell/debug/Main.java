package remoteshell.debug;

import java.io.IOException;

import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.UnknownHostException;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

public class Main {
	static Console console = Console.getInstance();
	public static void main(String[] args) throws Exception {

//		Path file = Paths.get("D:/kthfa/test/text.txt");
//		ByteBuffer bb = ByteBuffer.wrap(new byte[] {100,100,100,100,100,100,100,100,100,100,100,100});
//		try (FileChannel fileChannel = FileChannel.open(file, StandardOpenOption.READ)){
//			fileChannel.read(bb);
//			fileChannel.close();
//		} catch (IOException e) {
//			e.printStackTrace();
//		}
//		console.log(bb.position(), bb.limit(), bb.remaining());
//		bb.flip();
//		console.log(bb.position(), bb.limit(), bb.remaining());
//		try (FileChannel fileChannel = FileChannel.open(file, StandardOpenOption.WRITE)){
//			fileChannel.write(bb);
//			fileChannel.close();
//		} catch (IOException e) {
//			e.printStackTrace();
//		}
//		console.log(bb.position(), bb.limit(), bb.remaining());
		
//		ByteBuffer bb = ByteBuffer.allocate(8);
//		long num = 1125899906842656L;
//		bb.putLong(num);
//		bb.flip();
//		console.log(bb.array());
		
//		
//		FileSystemServer server = new FileSystemServer("D:\\kthfa\\test", null, Arrays.asList("127.0.0.1", "followjohn.epizy.com"), Arrays.asList(1234, 8080));
//
//		console.log(server.getToken());
//		server.start();
		
//		VerifyServer server = new VerifyServer(null, new HashSet<String>(Arrays.asList("127.0.0.1")), new HashSet<Integer>(Arrays.asList(1234, 8080))) {
//			@Override
//			void onRequest(ConnectContext context, Request request, Response response, Socket socket) {
//				console.log(context.getRequestData());
//				byte[] data = new byte[2048];
//				for(int i=0; i<2048; i++)
//					data[i] = 100;
//				context.setResponseData(data);
//				
////				context.setResponseData(new byte[] {1,2,3});\
//			}
//		};
////		
//		console.log(server.getToken());
//		server.start();

//		byte[] key = new byte[] {35,65,102,55,96,95,-11,0,-4,-98,-26,-81,-84,-7,20,-5,-2,-50,98,-104,23,93,74,-5,-117,-90,35,-101,-102,-29,117,0};
//		console.log(key);
//		AesCtr aesEnc = new AesCtr(key);
//		AesCtr aesDec = new AesCtr(key);
//		new HttpServer(new HashSet<Integer>(Arrays.asList(1234, 8080))) {
//			public void onRequest(Request request, Response response, Socket socket) {
//				response.setDuplicateHeader("Access-Control-Allow-Origin", "http://127.0.0.1");
//				response.setHeader("Content-Type", "text/html; charset=UTF-8");
				
//				console.log(aesDec.decrypt(request.getBody()));
//				byte[] data = new byte[2048];
//				for(int i=0; i<2048; i++)
//					data[i] = 100;
//				data = aesEnc.encrypt(data);
////				console.log("data:", data);
//				response.setBody(data);
//				int count;
//				if(request.getSessions() == null) {
//					count = 0;
//					response.setSession("count", String.valueOf(0));
//				}else {
//					count = Integer.valueOf(request.getSessions().getOrDefault("count", "0"));
//					response.setSession("count", String.valueOf(count+1));
//				}
//				if(count % 2 == 0) {
//					try {
//						Thread.currentThread();
//						Thread.sleep(100);
//						response.setBodyByText("EVEN count : " + count);
//					} catch (InterruptedException e) {
//						e.printStackTrace();
//					}
//				}else {
//					response.setBodyByText("ODD count : " + count);
//				}
////				console.log(request.getBodyText());
//				response.sendHeader();
//				response.sendBody();
//				response.getWriter().send("append data".getBytes());
//			}
//		}.start();
		
//		new EchoSocket().start();
//		InetAddress host = InetAddress.getByName(null);
//	      Selector selector = Selector.open();
//	      ServerSocketChannel serverSocketChannel =
//	         ServerSocketChannel.open();
//	      serverSocketChannel.configureBlocking(false);
//	      serverSocketChannel.bind(new InetSocketAddress(host, 1234));
//	      serverSocketChannel.register(selector, SelectionKey.OP_ACCEPT);
//	      SelectionKey key = null;
//	      while (true) {
//	         if (selector.select() <= 0)
//	            continue;
//	         Set<SelectionKey> selectedKeys = selector.selectedKeys();
//	         Iterator<SelectionKey> iterator = selectedKeys.iterator();
//	         while (iterator.hasNext()) {
//	            key = (SelectionKey) iterator.next();
//	            iterator.remove();
//	            if (key.isAcceptable()) {
//	               SocketChannel sc = serverSocketChannel.accept();
//	               sc.configureBlocking(false);
//	               sc.register(selector, SelectionKey.
//	                  OP_READ);
//	               System.out.println("Connection Accepted: "
//	                  + sc.getLocalAddress() + "n");
//	            }
//	            if (key.isReadable()) {
//	               SocketChannel sc = (SocketChannel) key.channel();
//	               ByteBuffer bb = ByteBuffer.allocate(1024);
//	               sc.read(bb);
//	               String result = new String(bb.array()).trim();
//	               System.out.println("Message received: "
//	                  + result
//	                  + " Message length= " + result.length());
//	               if (result.length() <= 0) {
//	                  sc.close();
//	                  System.out.println("Connection closed...");
//	                  System.out.println(
//	                     "Server will keep running. " +
//	                     "Try running another client to " +
//	                     "re-establish connection");
//	               }
//	            }
//	         }
//	      }
//		for(int i=8000;i<=9000;i++){
//            System.out.println("�˵�"+i);
//            if(isLocalPortUsing(i)){
//                System.out.println("�� "+i+" �w�Q�ϥ�");
//            }
//        }
//		Socket socket2 = new Socket();
//		socket2.connect(new InetSocketAddress("google.com", 80));
//		System.out.println(socket2.getLocalAddress());
//		try {
//			serverSocket = new TCPServerSocket();
//			console.log("bind");
//			serverSocket.bind(8080);
//			console.log("listen");
//			serverSocket.listen();
//			console.log("accept");
//			socket = serverSocket.accept();
//			console.log("recv");
////			for(int i=0; i<2; i++) {
////				Thread.sleep(3000);
////				console.log(new String(socket.recv(1024), StandardCharsets.UTF_8));
////			}
//			console.log(new String(socket.recv(1024), StandardCharsets.UTF_8));
//			console.log("recv end");
//		}catch(Exception e) {
//			e.printStackTrace();
//			serverSocket.close();
//			socket.close();
//		}
		
//		byte[] key = new byte[] {-52,-85,-54,49,-19,84,29,-63,22,37,95,-8,33,-105,-71,-115,-38,105,41,-45,118,113,104,-88,-78,-59,85,24,75,36,-15,-112};
//		byte[] key = new byte[] {35,65,102,55,96,95,-11,0,-4,-98,-26,-81,-84,-7,20,-5,-2,-50,98,-104,23,93,74,-5,-117,-90,35,-101,-102,-29,117,0};
////		console.log(SHA256.getInstance().encode(key));
//		AesCtr aesEnc = new AesCtr(key);
//		AesCtr aesDec = new AesCtr(key);
//		for(int i=0; i<10000; i++) {
//			byte[] data = new byte[] {100};
//			aesDec.decrypt(aesEnc.encrypt(data, 0, 1, false), 0, 1, false);
//			console.log(data[0]);
//		}
//		byte[] data = new byte[] {110, 101, 119, 105, 100, 61, 73, 43, 54, 120, 100, 115, 80, 112, 51, 111, 104, 87, 114, 122, 71, 122, 102, 118, 109, 85, 70, 43, 48, 49, 86, 97, 69, 72, 53, 116, 109, 115, 105, 70, 120, 85, 79, 108, 49, 117, 122, 77, 48, 95, 13, 10, 105, 100, 61, 120, 117, 80, 103, 70, 53, 101, 71, 109, 66, 72, 54, 100, 106, 84, 51, 85, 47, 117, 106, 77, 69, 109, 76, 113, 78, 100, 118, 109, 43, 114, 116, 86, 116, 57, 85, 117, 65, 116, 82, 51, 97, 56, 95, 13, 10, 110, 111, 110, 101, 61};
//		byte[] encrypted = aesEnc.encrypt(data);
//		byte[] decrypted = aesDec.decrypt(encrypted);
//        console.log(data);
//        console.log(encrypted );
//        console.log(decrypted);
//		RSA rsa = new RSA();
//        rsa.generateKeyPair(2024);
//        byte[] data = new byte[]{1,2,3,4,5,6,7,8,9,0,0,0};
//        byte[] encrypted = rsa.encrypt(data);
//        byte[] decrypted = rsa.decrypt(encrypted);
//        byte[] pubkey = rsa.getPublicKey();
//        console.log(pubkey);
//        rsa.setPublicKey(pubkey);
//        rsa.setPrivateKey(rsa.getPrivateKey());
//        encrypted = rsa.encrypt(data);
//        decrypted = rsa.decrypt(encrypted);
//        
//        console.log(decrypted);
//        console.log(rsa.checkKeyPairCorrectness());
	}

    /**
     * ���ե�����O�_�Q�ϥ�
     * @param port
     * @return
     */
    public static boolean isLocalPortUsing(int port){  
        boolean flag = true;  
        try {
            //�p�G�Ӱ��٦b�ϥΫh��^true,�_�h��^false,127.0.0.1�N������
            flag = isPortUsing("127.0.0.1", port);  
        } catch (Exception e) {  
        }  
        return flag;  
    }  
    /*** 
     * ���եD��Host��port��O�_�Q�ϥ�
     * @param host 
     * @param port 
     * @throws UnknownHostException  
     */ 
    public static boolean isPortUsing(String host,int port) throws UnknownHostException{  
        boolean flag = false;  
        InetAddress Address = InetAddress.getByName(host);  
        try {  
            ServerSocket socket = new ServerSocket(port);  //�إߤ@��Socket�s�u
            flag = true;  
        } catch (IOException e) {  
 
        }  
        return flag;  
    }  
}
//class EchoSocket{
//	public void start() throws IOException {
//		InetAddress host = InetAddress.getByName(null);
//		Selector selector = Selector.open();
//		List<ServerSocketChannel> serverSocketChannelList = new ArrayList<ServerSocketChannel>();
//		
//		ServerSocketChannel serverSocketChannel = ServerSocketChannel.open();
//		serverSocketChannel.configureBlocking(false);
//		serverSocketChannel.bind(new InetSocketAddress(host, 1234));
//		serverSocketChannel.register(selector, SelectionKey.OP_ACCEPT);
//		serverSocketChannelList.add(serverSocketChannel);
//		
//		SelectionKey key = null;
//		while (true) {
//			if (selector.select() <= 0)
//				continue;
//			Set<SelectionKey> selectedKeys = selector.selectedKeys();
//			Iterator<SelectionKey> iterator = selectedKeys.iterator();
//			while (iterator.hasNext()) {
//				key = (SelectionKey) iterator.next();
//	            iterator.remove();
//	            if (key.isAcceptable()) {
//	               SocketChannel sc = ((ServerSocketChannel) key.channel()).accept();
//	               sc.configureBlocking(false);
//	               sc.register(selector, SelectionKey.OP_READ);
//	               System.out.println("Connection Accepted: " + sc.getLocalAddress() + "n");
//	            }
//	            if (key.isReadable()) {
//	               SocketChannel sc = (SocketChannel) key.channel();
//	            
//	               if(!sc.isOpen() || !sc.isConnected()) {
//	            	   sc.close();
//	            	   continue;
//	               }
//	               try {
//	            	   ByteBuffer bb = ByteBuffer.allocate(1024);
//	            	   System.out.println("Read data: ");
////	            	   ByteIterator byteIter = new ByteIterator(sc);
////	            	   sc.read(bb);
//	            	   
//	            	   HttpServer.Request r = new HttpServer.Request();
//	            	   r.parseRequest(sc);
//	            	   if(r.getMethod() == null) sc.close();
//	            	   
//	            	   if(sc.isOpen() && sc.isConnected()) {
//	   					
////	            		   String result =  new String(r.getReader().getRemainingBytes());
//		            	   
////		            	   byteIter.getRemainingBytes();
//		            	   System.out.println(r.getBodyText());
//			               
//		            	   bb.flip();
//		            	   System.out.println("Write data.");
//		            	   String echoData = "HTTP/1.1 200 OK\r\n"
//			            	   		+ "content-type: text/html; charset=UTF-8\r\n\r\n"
//			            	   		+ "my data";
//		            	   
//		            	   sc.write(ByteBuffer.wrap(echoData.getBytes()));
//		   				}
//	            	   
//	            	   sc.close();
////		               if (result.length() == 0) {
////		                  sc.close();
////		                  System.out.println("Connection closed...");
////		                  System.out.println(
////		                     "Server will keep running. " +
////		                     "Try running another client to " +
////		                     "re-establish connection");
////		               }
//	               }catch(IOException e) {
//	            	   System.out.println(e.getMessage() + ": read fail.");
//	            	   sc.close();
//	               }
////	               sc.register(selector, SelectionKey.OP_WRITE);
//	            }
//			}
//		}
//	}
//}


