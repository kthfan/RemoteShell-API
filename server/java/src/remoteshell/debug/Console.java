package remoteshell.debug;

import java.math.BigInteger;
import java.util.Arrays;

public class Console {
	private static Console _instance;


    public static Console getInstance(){
        if (Console._instance == null)
        {
        	Console._instance = new Console();
        }
        return Console._instance;
    }
    private void _ln() {
    	System.out.println("");
    }
    public void log(int[][] arrs) {
    	this._log(arrs); _ln();
    }
    public void log(String[] objArr) {
    	this._log(objArr); _ln();
    }
    public void log(char[] charArr) {
    	this._log(charArr); _ln();
    }
    public void log(int[] intArr) {
    	this._log(intArr); _ln();
    }
    public void log(byte[] bytes) {
    	this._log(bytes); _ln();
    }
    public void log(BigInteger[] bintArr) {
    	this._log(bintArr); _ln();
    }
    public void log(BigInteger bint) {
    	this._log(bint); _ln();
    }
    
    public void _log(int[][] arrs) {
    	String result = "[\n";
    	for(int i=0; i<arrs.length; i++) {
    		result += "  " + Arrays.toString(arrs[i]) + "\n";
    	}
    	result += "]";
    	System.out.print(result);
    }
    private void _log(String[] objArr) {
    	System.out.print(Arrays.toString(objArr));
    }
    private void _log(char[] charArr) {
    	System.out.print(Arrays.toString(charArr));
    }
    private void _log(int[] intArr) {
    	System.out.print(Arrays.toString(intArr));
    }
    private void _log(byte[] bytes) {
    	int[] printBytes = new int[bytes.length];
    	for(var i=0; i< bytes.length; i++)
    		printBytes[i] =  (bytes[i] & 0xff);
    	System.out.print(Arrays.toString(printBytes));
    }
    private void _log(BigInteger[] bintArr) {
		System.out.print("[");
		for(int i=0; i<bintArr.length-1; i++) {
			this._log(bintArr[i]);
			System.out.print(", ");
		}
		System.out.printf("%sn", bintArr[bintArr.length-1].toString());
		System.out.print("]");
		return;
    }
    private void _log(BigInteger bint) {
    	System.out.printf("%sn", bint.toString());
    }
    public void log(Object... objs) {
    	for(int j=0; j<objs.length; j++) {
    		Object obj = objs[j];
    		if(obj instanceof BigInteger[]) {
    			this._log((BigInteger[]) obj);
    		}else if(obj instanceof byte[]) {
    			this._log((byte[]) obj);
    		}else if(obj instanceof BigInteger){
    			this._log((BigInteger) obj);
    		}else {
    			System.out.print(obj);
    		}
    		System.out.print(" ");
    	}
    	System.out.print("\n");
    }
}
