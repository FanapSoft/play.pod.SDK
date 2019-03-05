package com.fanap.gameCenter.TIS.Share;

import com.fanap.gameCenter.TIS.Base.RequestCallback;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Date;

public class EncryptHandshakeData {

    public Boolean updating = false;
    public Date updateTime = null;
    JSONArray callbackQueue = new JSONArray();

    public EncryptData encryptData = null;

    public EncryptHandshakeData(){

    }

    public static class EncryptData {
        public String initializationVector = null;
        public String algorithm = null;
        public String secretKey = null;

        public EncryptData(String iv, String algorithm, String secretKey) {
            this.initializationVector = iv;
            this.algorithm = algorithm;
            this.secretKey = secretKey;
        }

    }

    public void setEncryptData(String iv,String algorithm,String secretKey){
        if (encryptData == null) {
            encryptData = new EncryptData(iv,algorithm,secretKey);
        } else {
            encryptData.initializationVector = iv;
            encryptData.algorithm = algorithm;
            encryptData.secretKey = secretKey;
        }

        this.updateTime = new Date();
    }

    public void addCallbackQueue(RequestCallback callback){
        this.callbackQueue.put(callback);
    }

    public JSONObject getEncryptData () throws JSONException {

        JSONObject data = new JSONObject();
        data.put("initializationVector", encryptData.initializationVector);
        data.put("algorithm", encryptData.algorithm);
        data.put("secretKey", encryptData.secretKey);
        return data;
    }

    public void excuteQueue(JSONObject result) throws JSONException {
        for (int i = 0; i < callbackQueue.length(); i++) {
            RequestCallback callback = (RequestCallback) callbackQueue.get(i);
            callback.onResult(result);
        }
        callbackQueue = new JSONArray();
    }
}
