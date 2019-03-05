package com.fanap.gameCenter.TIS.Network;

import com.fanap.gameCenter.TIS.Base.*;
import com.fanap.gameCenter.TIS.Share.*;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.*;
import java.lang.reflect.Array;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.*;
import java.util.concurrent.TimeUnit;

public class Network {

    private JSONObject dic;
    private String lang;
    private String appId;
    private String deviceId;
    private SocketInterface socket;
    private Parent parent;
    private boolean connectionState = false;
    private boolean isSocketOpen = false;
    private boolean isDeviceRegisterInPush = false;
    private boolean isServerRegisterInPush = false;
    private String chatServerName;
    private String gameCenterName;
    private Long peerId = null;
    private int reconnectTimeout;
    private int pushMessageTTL;
    private int activePeerRetryCount = 0;
    private int lastMessageId = 0;

    private HashMap<String, RequestCallback> ackCallback   = new HashMap<String, RequestCallback>();
    private HashMap<String, HashMap> eventCallback = new HashMap<String, HashMap>();
    private HashMap<String, HashMap> onceEventCallback = new HashMap<String, HashMap>();
    private ArrayList<JSONObject> pushSendDataQueue = new ArrayList<JSONObject>();

    private String registerDeviceInPushTimeoutId = null;
    private String registerPeerInGameCenterTimeoutId = null;
    private String registerServerInPushTimeoutId = null;
    private String activePeerInGameCenterTimeoutId = null;
    static Logger log = Logger.getLogger(Network.class);

    private int tps = 3;
    private int currentThroughput = 0;
    private long currentThrouputSec = TimeUnit.MILLISECONDS.toSeconds(System.currentTimeMillis());
    private List<HashMap> sendMessageQueue = new ArrayList<>();


    public Network(Parent parent, String appId, String deviceId, JSONObject dic, String lang) {

        eventCallback.put("connect", new HashMap<String,EventCallback>());
        eventCallback.put("disconnect", new HashMap<String,EventCallback>());
        eventCallback.put("reconnect", new HashMap<String,EventCallback>());
        eventCallback.put("message", new HashMap<String,EventCallback>());

        onceEventCallback.put("open", new HashMap<String,EventCallback>());

        this.parent = parent;
        this.appId = appId;
        this.deviceId = deviceId;
        this.dic = dic;
        this.lang = lang;
    }

    public void init(boolean isForChat) {
        log.info("INIT_NETWORK " + appId);
        reconnectTimeout = ConfigData.wsto;
        pushMessageTTL = ConfigData.pmttl;

        if (isForChat) {
            if (ConfigData.utc) {
                initTCPSocket(ConfigData.csat);
            } else {
                initWebSocket(ConfigData.csa);
            }
        } else {
            if (ConfigData.utc) {
                initTCPSocket(ConfigData.psat);
            } else {
                initWebSocket(ConfigData.psa);
            }
        }


    }

    private void onSocketOpen(SocketInterface socketInterface) throws Exception{
        log.info("initWebSocket_open " + appId + " ");
        isSocketOpen = true;
        socket = socketInterface;
        registerDeviceInPush(false);
        JSONObject data = new JSONObject();
        fireOnceEvents("open",data);
    }

    private void onSocketClose(int errorCode){
        log.info("initWebSocket_close " + appId + " " + errorCode);
        isSocketOpen = false;
        isDeviceRegisterInPush = false;
        if (connectionState) {
            connectionState = false;
            fireEvents("disconnect",new JSONObject());
        }

        clearAllTimeout();

        int timeout = (errorCode == 4002 || errorCode == 1005) ? 500 : reconnectTimeout;
        Util.setTimeout(new Util.SetTimeoutCallback() {
            @Override
            public void onDone() {
                socket.connect();
            }
        }, timeout);
    }

    private void onSocketMessage(JSONObject message) throws ServiceException{
//        log.info("onSocketMessage "  + message);
        AsyncResponse res = new AsyncResponse(message,this){};
        RequestCallback callback = null;
        try {
            int type = message.getInt("type");
            String senderMessageId = null;

            if (message.has("senderMessageId") && !message.isNull("senderMessageId")) {
                senderMessageId = message.get("senderMessageId").toString();
            }

            switch (type) {

                case 1 :

                    if (message.has("senderName") && message.getString("senderName").equals(chatServerName)) {
                        fireEvents("message",message, res);
                    } else {
                        activePeerInGameCenter();
                    }

                    break;

                case 2 :
                    handleDeviceRegisterMessage(message.getLong("content"));
                    break;

                case 3 :


                    if (senderMessageId != null) {
                        callback = ackCallback.get(senderMessageId);
                    }

                    if (senderMessageId != null && callback!= null) {

                        callback.onResult(new JSONObject(message.get("content").toString()));
                        ackCallback.remove(senderMessageId);
                    } else {
                        fireEvents("message",message);
                    }
                    break;

                case 4 :
                case 5 :
                    fireEvents("message",message,res);
                    break;


                case 6 :

                    callback = ackCallback.get(senderMessageId);
                    if (callback != null) {

                        callback.onResult(Util.createReturnData(false, "", 0, new JSONObject()));
                        ackCallback.remove(senderMessageId);
                    }


                    break;
            }

        } catch (Exception e) {
            throw new ServiceException(e);
        }
    }

    private void initWebSocket(String socketServerAddress){
        log.info("initWebSocket " + socketServerAddress + appId + " ");
        socket = new WebSocketHandler(socketServerAddress) {

            @Override
            public void onOpen(SocketInterface socketInterface) {
                try {
                    onSocketOpen(socketInterface);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

            @Override
            public void onMessage(JSONObject message) {
                try {
                    onSocketMessage(message);
                } catch (ServiceException e) {
                    e.printStackTrace();
                }

            }
            @Override
            public void onClose(int errorCode) {
                onSocketClose(errorCode);

            }
        };
    }

    private void initTCPSocket(String socketServerAddress){
        log.info("initTCPSocket " + socketServerAddress + appId + " ");
        socket = new TCPSocketHandler(socketServerAddress) {

            @Override
            public void onOpen(SocketInterface socketInterface) {
                try {
                    onSocketOpen(socketInterface);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

            @Override
            public void onMessage(JSONObject message) {
                try {
                    onSocketMessage(message);
                } catch (ServiceException e) {
                    e.printStackTrace();
                }

            }

            @Override
            public void onClose(int errorCode) {
                onSocketClose(errorCode);
            }
        };
    }


    private void registerDeviceInPush(boolean isRetry) throws Exception{
        log.info("registerDeviceInPush " + appId  + " " + isDeviceRegisterInPush);
        isDeviceRegisterInPush = false;
        JSONObject content = new JSONObject();
        content.put("appId", appId);
        content.put("deviceId", deviceId);

        if (peerId != null) {
            content.put("peerId", peerId);
            content.put("refresh", true);
        } else {
            if (!isRetry) {
                content.put("renew", true);
            }
        }

        socket.emit(2, content);

    }

    private void registerServerInPush() throws Exception{

        JSONObject content = new JSONObject();
        content.put("name", gameCenterName);
        socket.emit(1, content);
        registerServerInPushTimeoutId = Util.setTimeout(new Util.SetTimeoutCallback() {
            @Override
            public void onDone() {
                if (!isServerRegisterInPush) {
                    try {
                        registerServerInPush();
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }
        }, ConfigData.pcrit);

    }

    private void handleDeviceRegisterMessage(Long peerId) throws Exception {
        log.info("handleDeviceRegisterMessage "+ appId + " " +this.peerId + " " + peerId + " " + gameCenterName + " " + isServerRegisterInPush);
        if (isDeviceRegisterInPush) {
            return;
        }
        if (registerDeviceInPushTimeoutId != null) {

            Util.clearTimeout(registerDeviceInPushTimeoutId);
            registerDeviceInPushTimeoutId = null;
        }
        isDeviceRegisterInPush = true;

        if (gameCenterName != null) {
            if (this.peerId == null ||  !this.peerId.equals(peerId)) {
                this.peerId = peerId;
                registerPeerInGameCenter();
            } else {
                if (isServerRegisterInPush) {
                    connectionState = true;
                    pushSendDataQueueHandler();
                    JSONObject data = new JSONObject();
                    data.put("peerId", peerId);
                    fireEvents("reconnect",data);
                } else {
                    registerServerInPush();
                }

            }
        } else {
            this.peerId = peerId;
            registerPeerInGameCenter();
        }


    }

    private void registerPeerInGameCenter() {
        log.info("registerPeerInGameCenter_0 " +appId + " " + peerId);

        isServerRegisterInPush = false;
        parent.registerPeerId(this.peerId,new Network.HttpRequestCallback(){
            @Override
            public void onResult(JSONObject res){
                try {
                    if (res.getBoolean("hasError")) {

                        registerPeerInGameCenterTimeoutId = Util.setTimeout(new Util.SetTimeoutCallback() {
                            @Override
                            public void onDone() {
                                registerPeerInGameCenter();
                            }
                        },5000);
                    } else {
                        gameCenterName = res.getString("result");
                        registerServerInPush();
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        });

    }

    private void activePeerInGameCenter() {
        log.info("activePeerInGameCenter_0 " + appId + " " + peerId + " " + isServerRegisterInPush);
        if(isServerRegisterInPush || peerId == null) {
            return;
        }
        isServerRegisterInPush = true;

        parent.activatePeerId(peerId,new Network.HttpRequestCallback(){
            @Override
            public void onResult(JSONObject result) {
                try {
                    if (result.getBoolean("hasError")) {
                        isServerRegisterInPush = false;
                        activePeerInGameCenterTimeoutId = Util.setTimeout(new Util.SetTimeoutCallback() {
                            @Override
                            public void onDone() {
                                activePeerInGameCenter();
                            }
                        }, ConfigData.smit);
                    } else {
                        connectionState = true;
                        pushSendDataQueueHandler();
                        JSONObject data = new JSONObject();
                        data.put("peerId", peerId);
                        if (activePeerRetryCount == 0) {
                            fireEvents("connect",data);
                        } else {
                            fireEvents("reconnect",data);
                        }
                        activePeerRetryCount += 1;
                    }
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        });

    }

    private void pushSendDataQueueHandler() {

        try {
            for (JSONObject data : pushSendDataQueue) {
                pushSendMessage(data.getInt("type"),data.getJSONObject("content"));
            }

            pushSendDataQueue.clear();
        } catch (Exception e) {
            e.printStackTrace();
        }


    }

    private void clearAllTimeout() {

        if (registerDeviceInPushTimeoutId != null) {
            Util.clearTimeout(registerDeviceInPushTimeoutId);
            registerDeviceInPushTimeoutId = null;
        }

        if (registerServerInPushTimeoutId != null) {
            Util.clearTimeout(registerServerInPushTimeoutId);
            registerServerInPushTimeoutId = null;
        }

        if (activePeerInGameCenterTimeoutId != null) {
            Util.clearTimeout(activePeerInGameCenterTimeoutId);
            activePeerInGameCenterTimeoutId = null;
        }

        if (registerPeerInGameCenterTimeoutId != null) {
            Util.clearTimeout(registerPeerInGameCenterTimeoutId);
            registerPeerInGameCenterTimeoutId = null;
        }
    }

    private void _emit(JSONObject params, final RequestCallback callback) throws ServiceException{
        try {
            int type = params.getInt("type");
            JSONObject content;
            try {
                content = params.getJSONObject("content");
            } catch (Exception e) {// content is string
                content = new JSONObject(params.get("content").toString());
            }

            if (type == 4 || type == 5) {
                lastMessageId += 1;
                final String messageId = lastMessageId + "";
                ackCallback.put(messageId , callback);

                content.put("ttl", pushMessageTTL);
                content.put("messageId", lastMessageId);

                if (params.has("timeout") && !params.isNull("timeout")) {
                    Util.setTimeout(new Util.SetTimeoutCallback() {
                        @Override
                        public void onDone() {
                            RequestCallback callback = ackCallback.get(messageId);
                            if (callback != null) {
                                callback.onResult(Util.createServerReturnData(true, "Request Timeout", ErrorCodes.TIMEOUT, new JSONObject()));
                                ackCallback.remove(messageId);
                            }
                        }
                    }, params.getInt("timeout"));
                }
            }
            pushSendMessage(type, content);
        } catch (Exception e) {
            e.printStackTrace();
            throw new ServiceException(e);
        }
    }

    public void pushSendMessage(int type, JSONObject content) throws ServiceException{
        if (connectionState) {
            socket.emit(type, content);
        } else {
            JSONObject data = new JSONObject();
            try {
                data.put("type", type);
                data.put("content", content);
                pushSendDataQueue.add(data);
            } catch (Exception e) {
                throw new ServiceException(e);
            }

        }

    }

    private void fireEvents(String categoryName, JSONObject msg, AsyncResponse res) {
        HashMap events = eventCallback.get(categoryName);
        if (events != null) {
            for (Object key : events.keySet()) {
                EventCallback event = (EventCallback) events.get(key);
                event.onFire(msg,res);
            }
        }
    }

    private void fireEvents(String categoryName, JSONObject data) {

        HashMap events = eventCallback.get(categoryName);
        if (events != null) {
            for (Object key : events.keySet()) {
                EventCallback event = (EventCallback) events.get(key);
                event.onFire(data);
            }
        }
    }

    private void fireOnceEvents(String categoryName, JSONObject data) {

        HashMap events = onceEventCallback.get(categoryName);
        if (events != null) {
            for (Object key : events.keySet()) {
                EventCallback event = (EventCallback) events.get(key);
                event.onFire(data);
                events.remove(key);
            }
        }
    }

    public void postRequest(final JSONObject params, final HttpRequestCallback callback) {
        request(params, callback);
    }

    public void httpRequest(final JSONObject params, final HttpRequestCallback callback){
        request(params, callback);
    }

    public void onLogin(JSONObject userData) {

    }

    public void onLogout() {
        log.info("LOGOUT " + appId);
        peerId = null;
        isServerRegisterInPush = false;
        isDeviceRegisterInPush = false;
        activePeerRetryCount = 0;
        clearAllTimeout();
        socket.logout();
    }


    public void emit(JSONObject params, RequestCallback callback) throws ServiceException {

//        long sec = TimeUnit.MILLISECONDS.toSeconds(System.currentTimeMillis());
//        if (sec != currentThrouputSec ) {
//            currentThroughput = 1;
//            currentThrouputSec = sec;
//            _emit(params, callback);
//        } else {
//
//            if (currentThroughput < tps) {
//
//            }
//        }
        _emit(params, callback);

    }

    public String on(String eventName,EventCallback callback) throws ServiceException{

        try {
            HashMap<String,EventCallback> events = eventCallback.get(eventName);

            if (events != null) {

                String id = UUID.randomUUID().toString();

                events.put(id, callback);

                if (eventName.equals("connect") && connectionState) {
                    JSONObject data = new JSONObject();
                    data.put("peerId", peerId);
                    callback.onFire(data);
                }
                if (eventName.equals("open") && isSocketOpen) {
                    JSONObject data = new JSONObject();
                    callback.onFire(data);
                }
                return id;
            }
        } catch (Exception e) {
            throw new ServiceException(e);
        }


        return null;
    }

    public String once(String eventName,EventCallback callback) throws ServiceException{

        try {
            HashMap<String,EventCallback> events = onceEventCallback.get(eventName);

            if (events != null) {
                if (eventName.equals("connect") && connectionState) {
                    JSONObject data = new JSONObject();
                    data.put("peerId", peerId);
                    callback.onFire(data);
                    return null;
                }
                if (eventName.equals("open") && isSocketOpen) {
                    JSONObject data = new JSONObject();
                    callback.onFire(data);
                    return null;
                }
                String id = UUID.randomUUID().toString();

                events.put(id, callback);
                return id;
            }
        } catch (Exception e) {
            throw new ServiceException(e);
        }


        return null;
    }


    public boolean getSocketConnectionState() {
        return connectionState;
    }

    public Long getPeerId() {
        return peerId;
    }

    public boolean isSocketOpen() {
        return isSocketOpen;
    }

    public void setChatServerName(String serverName) {
        chatServerName = serverName;
    }

    public void reconnectSocket() {
        log.info("reconnectSocket " + appId + peerId);
        peerId = null;
        isServerRegisterInPush = false;
        isDeviceRegisterInPush = false;
        clearAllTimeout();
        socket.close();
    }


    public  static class HttpRequestCallback {
        public void onResult(JSONObject result){}
    }

    private static void request(final JSONObject params,final HttpRequestCallback callback) {
        Thread thread = new Thread() {
            public void run() {

                JSONObject returnData;
                int status = 0;

                try {
                    String charset = "UTF-8";
                    URL url = new URL(params.getString("url"));
                    HttpURLConnection httpConnection = (HttpURLConnection) url.openConnection();
                    httpConnection.setConnectTimeout(ConfigData.hrt);

                    String method = (params.has("method") &&
                            !params.isNull("method") &&
                            params.getString("method").equals("GET")) ? "GET" : "POST";

                    log.info("NETWORK_REQUEST_1 "+ ConfigData.hrt + " " + params);

                    if (params.has("headers") && !params.isNull("headers")) {
                        JSONObject headers = params.getJSONObject("headers");
                        for(Iterator<String> i = headers.keys(); i.hasNext(); ) {
                            String key = i.next();
                            httpConnection.setRequestProperty(key,headers.getString(key));
                        }

                        httpConnection.setUseCaches(false);
                        httpConnection.setDoOutput(true);
                        httpConnection.setDoInput(true);
                        httpConnection.setRequestMethod(method);
                        if (params.has("data") && !params.isNull("data")) {
                            OutputStream outputStreamWriter = httpConnection.getOutputStream();
                            outputStreamWriter.write(params.get("data").toString().getBytes("UTF-8"));
                            outputStreamWriter.flush();
                            outputStreamWriter.close();
                        }

                    } else {
                        httpConnection.setUseCaches(false);
                        if (method.equals("POST")) {
                            httpConnection.setDoOutput(true);
                        }
                        httpConnection.setDoInput(true);
                        httpConnection.setRequestMethod(method);
                        if (params.has("data") && !params.isNull("data")) {
                            JSONObject data = params.getJSONObject("data");
                            MultipartUtility multiPart = new MultipartUtility(httpConnection,charset);
                            for(Iterator<String> i = data.keys(); i.hasNext(); ) {
                                String item = i.next();

                                JSONArray array = data.optJSONArray(item);
                                if (array != null) {
                                    for (int j = 0; j < array.length(); j++) {
                                        multiPart.addFormField(item, array.get(j) + "");
                                    }
                                } else {
                                    multiPart.addFormField(item, data.get(item) + "");
                                }


                            }
                            multiPart.close();
                        }
                    }

                    status = httpConnection.getResponseCode();

                    returnData = new JSONObject();

                    if (status == HttpURLConnection.HTTP_OK) {

                        BufferedReader reader = new BufferedReader(new InputStreamReader(httpConnection.getInputStream()));


                        returnData.put("HasError", false);
                        returnData.put("ErrorMessage", "");
                        returnData.put("ErrorCode", 0);
                        returnData.put("Result", reader.readLine());

                        log.info("NETWORK_REQUEST_2 "  + returnData.toString() + " " + params);


                        httpConnection.disconnect();
                        reader.close();

                    } else {

                        returnData.put("HasError", true);
                        returnData.put("ErrorMessage", "request failed");
                        returnData.put("ErrorCode", ErrorCodes.REQUEST_FAILED);
                        returnData.put("Result", null);
                    }

                } catch (Exception e) {

                    e.printStackTrace();

                    returnData = new JSONObject();
                    try {

                        String message = e.getMessage();
                        if (message == null) {
                            message = "EXCEPTION IN REQUEST";
                        }
                        returnData.put("HasError", true);
                        returnData.put("ErrorMessage", message);
                        returnData.put("ErrorCode", ErrorCodes.EXCEPTION);
                        returnData.put("Result", null);
                    } catch (Exception e1) {
                        e1.printStackTrace();
                    }
                }

                log.info("NETWORK_REQUEST_3 "  + status + " -- " + returnData + " -- " + params);


                callback.onResult(returnData);

            }
        };
        thread.start();
    }

    private static class MultipartUtility{
        String newLine = "\n";
        String splitter = "--";
        String boundary = "----WebKitFormBoundary" +System.currentTimeMillis();
        PrintWriter writer;
        String charset;

        MultipartUtility(HttpURLConnection httpConnection,String charset) {
            try {
                httpConnection.setRequestProperty("Content-Type","multipart/form-data; boundary=" + boundary);
                OutputStream outputStream = httpConnection.getOutputStream();
                this.charset = charset;
                writer = new PrintWriter(new OutputStreamWriter(outputStream, charset),true);
                writer.append(newLine);
                writer.flush();
            } catch (Exception e) {
                e.printStackTrace();
            }

        }

        public void addFormField(String name,String value) {
            String str =
                    newLine +
                            splitter + boundary + newLine +
                            "Content-Disposition: form-data; name=\"" + name + "\"" + newLine  +
                            newLine +
                            value;
            writer.append(str);
            writer.flush();
//            System.out.println(str);
        }

        public void close() {

            String str =
                    newLine +
                            splitter +boundary + splitter;
            writer.append(str);
            writer.flush();
            writer.close();
//            System.out.println(str);
        }
    }

    public interface Parent {

        void registerPeerId(Long peerId, final Network.HttpRequestCallback res);
        void activatePeerId(Long peerId, final Network.HttpRequestCallback res) ;
    }

}
