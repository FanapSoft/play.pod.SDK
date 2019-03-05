package com.fanap.gameCenter.TIS.Share;

import android.util.Base64;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigInteger;
import java.net.URLEncoder;
import java.nio.charset.Charset;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Util {

    //    private static Handler handler = new Handler(Looper.getMainLooper());
//
//    public static Runnable setTimeout(final SetTimeoutCallback callback, int timeout) {
//        Runnable runnable = new Runnable() {
//            @Override
//            public void run() {
//                callback.onDone();
//            }
//        };
//        handler.postDelayed(runnable, timeout);
//
//        return runnable;
//    }
//
//    public static void clearTimeout(Runnable runnable) {
//        handler.removeCallbacks(runnable);
//    }
    private static HashMap<String, java.util.concurrent.ScheduledFuture> timeouts = new HashMap<>();
//    public static <T> java.util.concurrent.ScheduledFuture<T> setTimeout(final SetTimeoutCallback callback,final int delayMilliseconds) {
//        final java.util.concurrent.ScheduledExecutorService scheduler =
//                java.util.concurrent.Executors.newSingleThreadScheduledExecutor();
//
//        final String timeoutId = UUID.randomUUID().toString();
//
//        System.out.println("setTimeout_0 " + timeoutId + " " + delayMilliseconds);
//        final java.util.concurrent.ScheduledFuture<T> future = scheduler.schedule(
//                new java.util.concurrent.Callable<T>() {
//                    public T call() {
//                        System.out.println("setTimeout_1 " + timeoutId + " " + delayMilliseconds);
//                        callback.onDone();
//                        clearTimeout(timeoutId);
//                        return null;
//                    }
//                }, delayMilliseconds, java.util.concurrent.TimeUnit.MILLISECONDS);
//
//        timeouts.put(timeoutId, future);
//        return future;
//    }

    private static String _setTimeout(final SetTimeoutCallback callback,final long delayMilliseconds) {
        final java.util.concurrent.ScheduledExecutorService scheduler =
                java.util.concurrent.Executors.newSingleThreadScheduledExecutor();

        final String timeoutId = UUID.randomUUID().toString();

        final java.util.concurrent.ScheduledFuture future = scheduler.schedule(
                new java.util.concurrent.Callable() {
                    @Override
                    public Object call() throws Exception {
                        callback.onDone();
                        clearTimeout(timeoutId);
                        return null;
                    }

                }, delayMilliseconds, java.util.concurrent.TimeUnit.MILLISECONDS);

        timeouts.put(timeoutId, future);
        return timeoutId;
    }


    public static String setTimeout(final SetTimeoutCallback callback,final long delayMilliseconds) {
        return _setTimeout(callback, delayMilliseconds);
    }

    public static String setTimeout(final SetTimeoutCallback callback,final int delayMilliseconds) {
        return _setTimeout(callback, delayMilliseconds);
    }


    public static void clearTimeout(String timeoutId) {
        java.util.concurrent.ScheduledFuture future = timeouts.get(timeoutId);
        if (future != null) {
            future.cancel(true);
            timeouts.remove(timeoutId);
        }
    }

    public static Integer convertToRange(int value, int[] srcRange, int[] dstRange) {

        if (value > 0) {
            if (value < srcRange[0] || value > srcRange[1]) {
                return null;
            }
        }
        int srcMax = srcRange[1] - srcRange[0];
        int dstMax = dstRange[1] - dstRange[0];
        int adjValue = value - srcRange[0];
        return (adjValue * dstMax / srcMax) + dstRange[0];
    }

    public static boolean hasMajorConflict(String currentVersion, String lastVersion) {
        if (currentVersion != null && lastVersion != null) {
            return !(currentVersion.split("\\.")[0].equals(lastVersion.split("\\.")[0]));
        } else {
            return false;
        }
    }

    public interface SetTimeoutCallback {
        void onDone();
    }

    public static JSONObject ExceptionErrorData(Exception e) {
        JSONObject retData = new JSONObject();
        try {
            retData.put("hasError", true);
            retData.put("errorMessage", e.getMessage());
            retData.put("errorCode", ErrorCodes.EXCEPTION);
        } catch (JSONException ex) {
            ex.printStackTrace();
        }
        return retData;
    }

    public static JSONObject createReturnData(boolean hasError, String message, Integer errorCode, JSONObject result) {
        JSONObject retData = new JSONObject();

        try {
            retData.put("hasError", hasError);
            retData.put("errorMessage", message!= null ? message :"");
            retData.put("errorCode", errorCode!= null ? errorCode :0);
            retData.put("result", result);
        } catch (JSONException e) {
            e.printStackTrace();
        }

        return retData;
    }

    public static JSONObject createServerReturnData(boolean hasError, String message, Integer errorCode, Object result) {
        JSONObject retData = new JSONObject();

        try {
            retData.put("HasError", hasError);
            retData.put("ErrorMessage", message!= null ? message :"");
            retData.put("ErrorCode", errorCode!= null ? errorCode :0);
            retData.put("Result", result);
        } catch (JSONException e) {
            e.printStackTrace();
        }

        return retData;
    }

    public static JSONObject createReturnData(boolean hasError, String message, Integer errorCode, JSONArray result) {
        JSONObject retData = new JSONObject();

        try {
            retData.put("hasError", hasError);
            retData.put("errorMessage", message!= null ? message :"");
            retData.put("errorCode", errorCode!= null ? errorCode :0);
            retData.put("result", result);
        } catch (JSONException e) {
            e.printStackTrace();
        }

        return retData;
    }

    public static byte[] hexStringToByteArray(String s) {
        int len = s.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(s.charAt(i), 16) << 4)
                    + Character.digit(s.charAt(i+1), 16));
        }
        return data;
    }


    public static String AESEncrypt(String data,String key,String iv) throws ServiceException {
        try {
//            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
//            int blockSize = 128;
////            int blockSize = cipher.getBlockSize();
//
//            byte[] dataBytes = data.getBytes();
//            int plaintextLength = dataBytes.length;
////            if (plaintextLength % blockSize != 0) {
////                plaintextLength = plaintextLength + (blockSize - (plaintextLength % blockSize));
////            }
//
//            byte[] plaintext = new byte[plaintextLength];
//            System.arraycopy(dataBytes, 0, plaintext, 0, dataBytes.length);
//
//            SecretKeySpec keyspec = new SecretKeySpec(key.getBytes(Charset.forName("US-ASCII")), "AES");
////            IvParameterSpec ivspec = new IvParameterSpec(iv.getBytes(Charset.forName("US-ASCII")));
//            IvParameterSpec ivspec = new IvParameterSpec(Base64.decode(iv, 0));
//
//            cipher.init(Cipher.ENCRYPT_MODE, keyspec, ivspec);
//            byte[] encrypted = cipher.doFinal(plaintext);
//            String str = Base64.encodeToString(encrypted, Base64.DEFAULT);
////            String str = new sun.misc.BASE64Encoder().encode(encrypted);
//
//            return str;

            return encrypt(data, key, iv, "AES");
        } catch (Exception e) {
            throw new ServiceException(e);
        }
    }

    public static String DESEncrypt(String data,String key,String iv) throws ServiceException {
        try {
//            Cipher cipher = Cipher.getInstance("DES/CBC/PKCS5Padding");
//            int blockSize = 128;
////            int blockSize = cipher.getBlockSize();
//
//            byte[] dataBytes = data.getBytes();
//            int plaintextLength = dataBytes.length;
////            if (plaintextLength % blockSize != 0) {
////                plaintextLength = plaintextLength + (blockSize - (plaintextLength % blockSize));
////            }
//
//            byte[] plaintext = new byte[plaintextLength];
//            System.arraycopy(dataBytes, 0, plaintext, 0, dataBytes.length);
//
//            SecretKeySpec keyspec = new SecretKeySpec(key.getBytes(Charset.forName("US-ASCII")), "DES");
//            System.out.println("AAAAAAAAAAAAAAA " + data);
//            System.out.println("BBBBBBBBBBBBBBB " + iv + " " + key);
//            System.out.println("CCCCCCCCCCCCCCC " + Arrays.toString(iv.getBytes(Charset.forName("US-ASCII"))));
//            System.out.println("DDDDDDDDDDDDDDD " + Arrays.toString(plaintext));
//            System.out.println("FFFFFFFFFFFFFFFFF " + Arrays.toString(Base64.decode(iv, 0)));
//
////            IvParameterSpec ivspec = new IvParameterSpec(iv.getBytes(Charset.forName("US-ASCII")));
////            IvParameterSpec ivspec = new IvParameterSpec(Base64.decode(iv, 0));
//            IvParameterSpec ivspec = new IvParameterSpec(hexStringToByteArray(iv));
//
//
//            cipher.init(Cipher.ENCRYPT_MODE, keyspec, ivspec);
//            byte[] encrypted = cipher.doFinal(plaintext);
//            String str = Base64.encodeToString(encrypted, Base64.DEFAULT);
////            String str = new sun.misc.BASE64Encoder().encode(encrypted);
//
//            System.out.println("EEEEEEEEEEEEEEE " + str);
//
//            return str;
            return encrypt(data, key, iv, "DES");

        } catch (Exception e) {
            throw new ServiceException(e);
        }
    }

    private static String encrypt(String data,String key,String iv,String algorithm) throws ServiceException{
        try {

            Cipher cipher = Cipher.getInstance(algorithm + "/CBC/PKCS5Padding");
            int blockSize = 128;
//            int blockSize = cipher.getBlockSize();

            byte[] dataBytes = data.getBytes();
            int plaintextLength = dataBytes.length;
//            if (plaintextLength % blockSize != 0) {
//                plaintextLength = plaintextLength + (blockSize - (plaintextLength % blockSize));
//            }

            byte[] plaintext = new byte[plaintextLength];
            System.arraycopy(dataBytes, 0, plaintext, 0, dataBytes.length);

            SecretKeySpec keyspec = new SecretKeySpec(key.getBytes(Charset.forName("US-ASCII")), algorithm);
            System.out.println("AAAAAAAAAAAAAAA " + data);
            System.out.println("BBBBBBBBBBBBBBB " + algorithm + " " +  iv + " " + key);


//            IvParameterSpec ivspec = new IvParameterSpec(iv.getBytes(Charset.forName("US-ASCII")));
            IvParameterSpec ivspec = new IvParameterSpec(iv.getBytes("UTF-8"));
//            IvParameterSpec ivspec = new IvParameterSpec(Base64.decode(iv, Base64.DEFAULT));
//            IvParameterSpec ivspec = new IvParameterSpec(hexStringToByteArray(iv));


            cipher.init(Cipher.ENCRYPT_MODE, keyspec, ivspec);
            byte[] encrypted = cipher.doFinal(plaintext);
            String str = Base64.encodeToString(encrypted, Base64.DEFAULT);
//            String str = new String(encrypted);
//            str =  URLEncoder.encode(str, "UTF-8");
//            String str = new sun.misc.BASE64Encoder().encode(encrypted);

//            System.out.println("DDDDDDDDDDDDDDDDDDD " + str);

            return str;

        } catch (Exception e) {
            throw new ServiceException(e);
        }
    }


    public static JSONArray getQueryStringData(String url) throws ServiceException {

        try {
            JSONArray queryData = new JSONArray();
            final String regex = "\\?([^#]*)";

            final Pattern pattern = Pattern.compile(regex, Pattern.CASE_INSENSITIVE);
            final Matcher matcher = pattern.matcher(url);

            if (matcher.find()) {
                String data = matcher.group(1);

                String[] urlData = data.split("&");

                for (int i = 0; i < urlData.length; i++) {
                    if (urlData[i].length()>0) {
                        String query = urlData[i];

                        if(query != null && query.length()>0){
                            String[] qData = query.split("=");

                            if (qData.length == 2) {
                                JSONObject paramData = new JSONObject();
                                paramData.put("name", qData[0]);
                                paramData.put("value", qData[1]);
                            }
                        }
                    }
                }

            }
            return queryData;
        }catch (Exception e){
            throw new ServiceException(e);
        }

    }

    public static String AESDecrypt(String encrypted,String key,String iv) throws ServiceException {
        try
        {
//            byte[] encrypted1 = new BASE64Decoder().decodeBuffer(encrypted);
            byte[] encrypted1 = Base64.decode(encrypted, Base64.DEFAULT);

            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
            SecretKeySpec keyspec = new SecretKeySpec(key.getBytes(), "AES");
            IvParameterSpec ivspec = new IvParameterSpec(iv.getBytes());

            cipher.init(Cipher.DECRYPT_MODE, keyspec, ivspec);

            byte[] original = cipher.doFinal(encrypted1);
            String originalString = new String(original);
            return originalString;
        }
        catch (Exception e) {
            throw new ServiceException(e);
        }
    }

    public static String MD5(String s) {
        try {
//            MessageDigest digest = java.security.MessageDigest.getInstance("MD5");
//            digest.update(s.getBytes("UTF-8"));
//            byte messageDigest[] = digest.digest();
//
//            // Create Hex String
//            StringBuffer hexString = new StringBuffer();
//            for (int i=0; i<messageDigest.length; i++)
//                hexString.append(Integer.toHexString(0xFF & messageDigest[i]));
//
//            return hexString.toString();


            System.out.println("11111111111 " + s);
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] messageDigest = md.digest(s.getBytes("UTF-8"));
            BigInteger number = new BigInteger(1, messageDigest);
            String hashtext = number.toString(16);
            // Now we need to zero pad it if you actually want the full 32 chars.
            while (hashtext.length() < 32) {
                hashtext = "0" + hashtext;
            }

            System.out.println("22222222222 " + hashtext);
            return hashtext;

        } catch (Exception e) {
            e.printStackTrace();
        }

        return "";
    }
}
