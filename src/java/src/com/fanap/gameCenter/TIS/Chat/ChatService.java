package com.fanap.gameCenter.TIS.Chat;

import com.fanap.gameCenter.TIS.Base.*;
import com.fanap.gameCenter.TIS.Network.Network;
import com.fanap.gameCenter.TIS.Service;
import com.fanap.gameCenter.TIS.Share.*;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Date;
import java.util.HashMap;
import java.util.UUID;

public class ChatService implements Network.Parent {
    private ChatService self;
    private JSONObject dic;
    private JSONObject userData;
    private int pushMessageTTL;
    private int connectionRetryIntervalTime;
    private int reconnectTimeout;
    private int lastMessageId = 1;
    private boolean isLogin = false;
    private boolean isRegisterInChatServer = false;
    private boolean isCheckLoginActionWithPeer = false;
    private String lang;
    private String appId;
    private Long peerId;
    private Long tempPeerId;
    private String deviceId;
    private String serverName;
    private Service service;
//    private ChatUI chatUi;
    private Network network;
    private JSONObject chatRequestUserIds = new JSONObject();
    private HashMap<String, HashMap> eventsCallback = new HashMap();
    private HashMap<String, MessageCallback> messagesCallback = new HashMap();

    String registerChatInPushTimeoutId;
    static Logger log = Logger.getLogger(ChatService.class);
    private JSONObject temporaryPeerData = new JSONObject();

    public ChatService(JSONObject params) {
        self = this;
        eventsCallback.put("serverRegister", new HashMap<String, EventCallback>());
        eventsCallback.put("message", new HashMap<String, EventCallback>());
        eventsCallback.put("forwardMessage", new HashMap<String, EventCallback>());
        eventsCallback.put("newThread", new HashMap<String, EventCallback>());
        eventsCallback.put("leaveThread", new HashMap<String, EventCallback>());
        eventsCallback.put("connect", new HashMap<String, EventCallback>());
        eventsCallback.put("disconnect", new HashMap<String, EventCallback>());
        eventsCallback.put("reconnect", new HashMap<String, EventCallback>());
        eventsCallback.put("deliver", new HashMap<String, EventCallback>());
        eventsCallback.put("seen", new HashMap<String, EventCallback>());
        eventsCallback.put("sent", new HashMap<String, EventCallback>());
        eventsCallback.put("login", new HashMap<String, EventCallback>());
        eventsCallback.put("logout", new HashMap<String, EventCallback>());
        eventsCallback.put("newParticipant", new HashMap<String, EventCallback>());


        try {
            this.appId = params.getString("appId")+ "_CHAT";
            this.dic = params.getJSONObject("dic");
            this.lang = params.getString("lang");
            this.deviceId = params.getString("deviceId");

            temporaryPeerData.put("peerId", null);
            temporaryPeerData.put("lastTime", 0);
            temporaryPeerData.put("deviceId",UUID.randomUUID().toString());
            temporaryPeerData.put("loadibng",false);


            service = (Service) params.get("service");

            pushMessageTTL = ConfigData.pmttl;
            connectionRetryIntervalTime = ConfigData.pcrit;
            reconnectTimeout = ConfigData.wsto;

            initServiceEvent();
            initNetwork();

        } catch (Exception e) {
            e.printStackTrace();
        }


    }


    private void initServiceEvent() {
        service.on("login", new EventCallback() {
            @Override
            public void onFire(JSONObject userData) {
                self.isLogin = true;
                self.userData = userData;
                self.peerId = network.getPeerId();
                loginActionWithPeer();
            }
        });

        service.on("logout", new EventCallback() {
            @Override
            public void onFire(JSONObject userData) {
                self.isLogin = false;
                self.peerId = null;
                if (self.registerChatInPushTimeoutId != null) {
                    Util.clearTimeout(self.registerChatInPushTimeoutId);
                }
                self.isRegisterInChatServer = false;
                self.userData = null;
                fireEvents("logout",new JSONObject());
            }
        });
    }

    private void fireEvents(String categoryName, JSONObject msg) {
        HashMap events = eventsCallback.get(categoryName);
        if (events != null) {
            for (Object key : events.keySet()) {
                EventCallback event = (EventCallback) events.get(key);
                event.onFire(msg);
            }
        }
    }

    private void request(RequestUrls.UrlData url, JSONObject data, final Network.HttpRequestCallback callback) {
        try {
            request(url,data,callback,null);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void request(RequestUrls.UrlData urlData, JSONObject data, final Network.HttpRequestCallback res,JSONObject setting) throws Exception {

        String uri;
        String url;


        if (setting != null && (setting.has("url") || setting.has("uri"))) {
            try {
                if (setting.has("url")) {
                    uri = setting.getString("url");
                } else {
                    uri = setting.getString("uri");
                }
            } catch (Exception e) {
                uri = urlData.uri;
            }

        } else {
            uri = urlData.uri;
        }

        if(urlData.hostName.equals("BAZITECH")){

            if (ConfigData.har) {
                asyncRequest(urlData, data, res, setting);
                return;
            } else {
                url = ConfigData.gca + uri;
            }
        } else {
            url = ConfigData.opsa + uri;
        }


        if (userData != null && userData.has("token")) {
            data.put("_token", userData.getString("token"));
            data.put("_token_issuer", userData.get("tokenIssuer"));
        }


        JSONObject requestData = new JSONObject();
        requestData.put("url", url);
        requestData.put("data", data);
        network.postRequest(requestData,new Network.HttpRequestCallback() {
            @Override
            public void onResult(JSONObject resultData) {
                try {

                    JSONObject result = resultData;
                    try {
                        if (!resultData.getBoolean("HasError")) {
                            result = new JSONObject(resultData.getString("Result"));
                        }
                    } catch (Exception e) {
                        e.printStackTrace();

                    }

                    JSONObject resData = new JSONObject();
                    resData.put("hasError", result.get("HasError"));
                    resData.put("errorMessage", result.get("ErrorMessage"));
                    resData.put("errorCode", result.get("ErrorCode"));

                    if (result.has("Result") && !result.isNull("Result")) {
                        resData.put("result", result.get("Result"));
                    }
                    res.onResult(resData);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        });
    }

    protected void getPeerIdFromHttpRequest(final RequestCallback callback) throws Exception {

        final Date currentTime = new Date();

        if (this.peerId  != null ||
                (temporaryPeerData.has("peerId") &&
                        temporaryPeerData.isNull("peerId") &&
                        (currentTime.getTime() - new Date(temporaryPeerData.getString("lastTime")).getTime())<5000)) {

            String peerId;

            if (this.peerId != null) {
                peerId = this.peerId.toString();
            } else {
                peerId = temporaryPeerData.getString("peerId");
            }
            JSONObject result = new JSONObject();
            result.put("peerId", peerId);
            callback.onResult(result);
        } else {

            if (!temporaryPeerData.getBoolean("isLoading")) {

                String action = "register";
                String url = ConfigData.aha + "/register/?action=register&deviceId=" + temporaryPeerData.getString("deviceId")+ "&appId=" + appId;

                JSONObject setting = new JSONObject();
                setting.put("method", "GET");

                httpRequest(url, null, new Network.HttpRequestCallback() {
                    @Override
                    public void onResult(JSONObject result) {
                        try {

                            temporaryPeerData.put("isLoading", false);

                            boolean hasError = result.getBoolean("HasError");
                            boolean success = false;
                            JSONObject res = null;
                            if (!hasError) {
                                res = new JSONObject(result.getString("Result"));
                                success = res.getBoolean("success");
                            }
                            if (success) {

                                JSONObject content = new JSONObject(res.getString("content"));
                                String peerId = content.getString("token");

                                temporaryPeerData.put("peerId", peerId);
                                temporaryPeerData.put("lastTime", currentTime);

                                JSONObject retData = new JSONObject();
                                retData.put("peerId", peerId);

                                try {
                                    callback.onResult(retData);
                                }catch (Exception e){
                                    e.printStackTrace();
                                }
                            } else {
                                Util.setTimeout(new Util.SetTimeoutCallback() {
                                    @Override
                                    public void onDone() {
                                        try {
                                            getPeerIdFromHttpRequest(callback);
                                        } catch (Exception e) {
                                            e.printStackTrace();
                                        }
                                    }
                                }, ConfigData.smit);
                            }

                        }catch (Exception e){
                            Util.setTimeout(new Util.SetTimeoutCallback() {
                                @Override
                                public void onDone() {
                                    try {
                                        getPeerIdFromHttpRequest(callback);
                                    } catch (Exception e) {
                                        e.printStackTrace();
                                    }
                                }
                            }, ConfigData.smit);
                        }
                    }
                }, setting);


            } else {
                Util.setTimeout(new Util.SetTimeoutCallback() {
                    @Override
                    public void onDone() {
                        try {
                            getPeerIdFromHttpRequest(callback);
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }
                }, ConfigData.smit);
            }
        }
    }

    protected void asyncRequest(final RequestUrls.UrlData urlData, final JSONObject data, final Network.HttpRequestCallback res, final JSONObject setting) throws Exception{

        getPeerIdFromHttpRequest(new RequestCallback() {
            @Override
            public void onResult(JSONObject result) {
                try {
                    String peerId = result.getString("peerId");
                    String uri;

                    if (urlData.uri != null) {
                        uri = urlData.uri;
                    } else {
                        uri = setting.getString("uri");
                    }

                    JSONArray parameters = new JSONArray();
                    JSONArray keys = data.names();

                    for (int i = 0; i < keys.length(); i++) {

                        JSONObject paramData = new JSONObject();
                        String keyName = keys.getString(i);
                        paramData.put("name", keyName);
                        paramData.put("value", data.get(keyName));

                        parameters.put(paramData);
                    }


                    if(setting != null && setting.has("parameters") && !setting.isNull("parameters")){

                        JSONArray params = setting.getJSONArray("parameters");

                        for (int i = 0; i < params.length(); i++) {
                            parameters.put(params.get(i));
                        }
                    }


                    JSONObject asyncData = new JSONObject();
                    JSONObject reqDataContent = new JSONObject();
                    JSONObject innerConternt = new JSONObject();


                    innerConternt.put("remoteAddr", null);
                    innerConternt.put("serverKey", 0);
                    innerConternt.put("oneTimeToken", null);
                    innerConternt.put("parameters", parameters);
                    innerConternt.put("msgType", 3);
                    innerConternt.put("uri", uri);



                    if (userData.has("token") && !userData.isNull("token")) {
                        innerConternt.put("token", userData.get("token"));
                        innerConternt.put("tokenIssuer", userData.get("tokenIssuer"));
                    }

                    innerConternt.put("messageId", 1001);
                    innerConternt.put("expireTime", 0);

                    reqDataContent.put("content", innerConternt.toString());
                    reqDataContent.put("messageId", 1001);
//                    reqDataContent.put("peerName", "245");
                    reqDataContent.put("priority", "1");

//                    JSONArray receivers = new JSONArray();
//                    receivers.put("1570893");
//                    reqDataContent.put("receivers", receivers);
                    reqDataContent.put("peerName", ConfigData.ahrrn);
                    reqDataContent.put("ttl", 0);

                    asyncData.put("content", reqDataContent.toString());
                    asyncData.put("trackerId", 1001);
                    asyncData.put("type", 3);


                    JSONObject set = setting;
                    if (set == null) {
                        set = new JSONObject();
                    }

//                    final String url = ConfigData.aha + "/srv?data=" + reqData.toString() + "&peerId=" + peerId;
//                    set.put("method", "GET");

                    JSONObject headers = new JSONObject();
                    headers.put("content-type", "application/x-www-form-urlencoded");
                    set.put("headers", headers);

                    final String url = ConfigData.aha + "/srv";
                    set.put("method", "POST");
                    String pData = "data=" + asyncData.toString() + "&peerId=" + peerId;

                    httpRequest(url, pData, new Network.HttpRequestCallback(){

                        @Override
                        public void onResult(JSONObject result){
                            JSONObject retData;

                            try {
                                boolean hasError = result.getBoolean("HasError");
                                if (!hasError) {
                                    JSONObject obj = new JSONObject(result.getString("Result"));

                                    retData = new JSONObject(obj.getString("content"));
                                } else {
                                    retData = result;
                                }

                            }catch (Exception e){
                                retData = new JSONObject();
                                try {
                                    retData.put("HasError", true);
                                    retData.put("ErrorMessage", e.getMessage());
                                    retData.put("ErrorCode",  ErrorCodes.EXCEPTION);
                                    retData.put("Result",  new JSONObject());
                                } catch (JSONException e1) {
                                    e1.printStackTrace();
                                }
                            }

                            if (res != null) {
                                res.onResult(retData);
                            }
                        }
                    }, set);



                }catch (Exception e){
                    e.printStackTrace();
                }
            }
        });
    }
    protected void httpRequest(String url,Object data,Network.HttpRequestCallback res,JSONObject setting) throws Exception{

        String method = "POST";

        if (setting != null && setting.has("method") && !setting.isNull("method") && setting.getString("method") == "GET") {
            method = "GET";
        }

        JSONObject requestData = new JSONObject();
        requestData.put("url", url);
        requestData.put("method", method);

        if (data != null) {
            requestData.put("data", data);
        }

        network.httpRequest(requestData,res);
    }

    private void initNetwork() throws ServiceException {
        log.info("CHAT_initNetwork " + appId + " " + deviceId);
        network = new Network(this, appId , deviceId,dic,lang);
        network.init(true);
        network.on("connect", new EventCallback() {
            @Override
            public void onFire(JSONObject params) {

                log.info("CHAT_SOCKET_CONNECT " + params);
                try {

                    peerId = params.getLong("peerId");
                    loginActionWithPeer();
                    JSONObject data = new JSONObject();
                    data.put("peerId", peerId);
                    fireEvents("connect",data);
                } catch (Exception e) {
                    e.printStackTrace();
                }

            }

        });

        network.on("disconnect", new EventCallback() {
            @Override
            public void onFire(JSONObject params) {
                log.info("CHAT_SOCKET_DISCONNECT" );
                tempPeerId = tempPeerId;
                tempPeerId = null;
                fireEvents("disconnect", params);
            }
        });

        network.on("reconnect", new EventCallback() {
            @Override
            public void onFire(JSONObject params) {
                log.info("CHAT_SOCKET_RECONNECT" );
                try {
                    Long peer = params.getLong("peerId");
                    if (isLogin && ( (peerId != null && ! (peerId.equals(peer))) || (tempPeerId != null && ! (tempPeerId.equals(peer))))) {
                        peerId = peer;// registerChatInGameCenter use __peerId
                        registerChatInGameCenter();
                    }
                    peerId = peer;
                    JSONObject data = new JSONObject();
                    data.put("peerId", peerId);
                    fireEvents("reconnect",data);
                } catch (Exception e) {
                    e.printStackTrace();
                }

            }
        });

        network.on("message", new EventCallback() {
            @Override
            public void onFire(JSONObject message, AsyncResponse res) {
                pushMessageHandler(message);
                res.call();
            }
        });
    }

    private void loginActionWithPeer() {

        log.info("CHAT_loginActionWithPeer " + peerId + " " + isLogin + " " + userData);
        if (!isCheckLoginActionWithPeer && peerId != null && isLogin) {
            registerChatInGameCenter();
            fireEvents("login",userData);
            isCheckLoginActionWithPeer = true;
        }

    }

    private JSONObject _chatRequest(JSONObject params,final RequestCallback   callback) throws ServiceException {



        JSONObject data = new JSONObject();
        JSONObject returnData = new JSONObject();
        try {
            String userId = params.get("userId").toString();
            chatRequestUserIds.put(userId,true);
            String uniqueId;
            if (params.has("uniqueId") && !params.isNull("uniqueId")) {
                uniqueId = params.getString("uniqueId");
            } else {
                uniqueId = userId + "_" + UUID.randomUUID().toString();
            }
            JSONArray array = new JSONArray();
            array.put(userId);
            data.put("_token", userData.getString("token"));
            data.put("_token_issuer", userData.get("tokenIssuer"));
            data.put("usersId", array.toString());

            data.put("uniqueId",uniqueId);
            returnData.put("uniqueId",uniqueId);


//            network.postRequest(RequestUrls.CHAT_REQUEST, data, new Network.HttpRequestCallback() {
//                @Override
//                public void onResult(JSONObject result) throws ServiceException{
//                    try {
//                        JSONObject res = new JSONObject();
//                        res.put("hasError", result.getBoolean("hasError"));
//                        res.put("errorMessage", result.getBoolean("hasError"));
//                        callback.onResult(res);
//                    } catch (Exception e) {
//                        throw new ServiceException(e);
//                    }
//
//                }
//            });

            request(RequestUrls.CHAT_REQUEST, data, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result) {
                    try {
                        callback.onResult(result);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }

                }
            });



        } catch (Exception e) {
            throw new ServiceException(e);
        }
        return returnData;
    }

    private JSONObject _sendMessage(JSONObject params, final MessageCallback messageCallback) throws ServiceException {

        JSONObject returnData = new JSONObject();
        try {
            String uniqueId;

            int chatMessageVOType = params.getInt("chatMessageVOType");

            if (params.has("uniqueId")) {
                if (chatMessageVOType == PushMessageVOTypes.FORWARD_MESSAGE) {
                    uniqueId = params.getJSONArray("uniqueId").toString();
                } else {
                    uniqueId = params.getString("uniqueId");
                }

            } else {
                uniqueId = UUID.randomUUID().toString();
            }
            JSONObject messageVO = new JSONObject();

            messageVO.put("type", chatMessageVOType);

            if (params.has("threadId")) {
                messageVO.put("subjectId", params.get("threadId").toString());
            }

            if (params.has("content")) {
                messageVO.put("content", params.getString("content"));
            }

            if (params.has("repliedTo")) {
                messageVO.put("repliedTo", params.get("repliedTo").toString());
            }

            if (params.has("metaData")) {
                messageVO.put("metadata", params.get("metaData").toString());
            }


            if (messageCallback != null) {

                messageVO.put("uniqueId", uniqueId);
                messagesCallback.put(uniqueId, messageCallback);
            }
            returnData.put("uniqueId", uniqueId);

            JSONObject content = new JSONObject();
            content.put("peerName", serverName);
            content.put("priority", ConfigData.cmp);
            content.put("content", messageVO.toString());

            JSONObject reqData = new JSONObject();
            reqData.put("type", (params.has("pushMsgType")) ? params.getInt("pushMsgType") : 3);
            reqData.put("content", content);

            if (params.has("timeout")) {
                reqData.put("timeout", params.get("timeout"));
            }
            log.info("CHAT_SEND_MESSAGE " + reqData);
            network.emit(
                    reqData,
                    new RequestCallback() {
                        @Override
                        public void onResult(JSONObject result) {
                            log.info("CHAT_SEND_MESSAGE_1 " + result);
                            if (messageCallback != null) {
                                messageCallback.onResult(result);
                            }

                        }
                    });

        } catch (Exception e) {
            e.printStackTrace();
        }

        return returnData;
    }

    private void registerChatInPushServer() {

        log.info("registerChatInPushServer");
        try {
            JSONObject content = new JSONObject();
            content.put("name", serverName);
            JSONObject reqData = new JSONObject();
            reqData.put("type", 1);
            reqData.put("content", content);
            network.emit(reqData,null);

            registerChatInPushTimeoutId = Util.setTimeout(new Util.SetTimeoutCallback() {
                @Override
                public void onDone() {
                    try {
                        if (!isRegisterInChatServer && userData.getBoolean("loginState")) {
                            registerChatInPushServer();
                        }
                    } catch (Exception e) {
                        e.printStackTrace();

                    }

                }
            }, ConfigData.smit);

        } catch (Exception e) {
            e.printStackTrace();

        }

    }

    private void registerChatInGameCenter() {
        log.info("CHAT_registerChatInGameCenter_0 " + peerId);
        try {
            JSONObject data = new JSONObject();
            data.put("peerId", peerId);

            request(RequestUrls.SET_CHAT_ID,data,new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result) {
                    log.info("CHAT_registerChatInGameCenter_1 " + result);
                    try {
                        boolean hasError = result.getBoolean("hasError");
                        int errorCode = result.getInt("errorCode");
                        if (!hasError) {
                            serverName = result.getJSONObject("result").getString("serverName");
                            network.setChatServerName(serverName);
                            registerChatInPushServer();

                        } else {
                            if (errorCode == ErrorCodes.REQUEST_FAILED) {
                                Util.setTimeout(new Util.SetTimeoutCallback() {
                                    @Override
                                    public void onDone() {
                                        registerChatInGameCenter();
                                    }
                                }, ConfigData.smit);
                            } else {
                                network.reconnectSocket();
                            }
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            });

        } catch (Exception e) {
            e.printStackTrace();
        }

    }

    private void pushMessageHandler(JSONObject message) {

        log.info("CHAT_pushMessageHandler " + message);
        try {
            int type = message.getInt("type");
            switch (type) {
                case 1:
                    log.info("CHAT_SERVER_REGISTER " + isRegisterInChatServer);
                    if (!isRegisterInChatServer) {
                        isRegisterInChatServer = true;
                        Util.setTimeout(new Util.SetTimeoutCallback() {
                            @Override
                            public void onDone() {
                                fireEvents("serverRegister", new JSONObject());
                            }
                        }, ConfigData.gtdt);
                    }
                    break;

                default:

                    chatServiceMsgHandler(new JSONObject(message.getString("content")));

            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void chatServiceMsgHandler(JSONObject params) {

        try {

            log.info("CHAT_ServiceMsgHandler " + params);
            String threadId = params.get("subjectId").toString();
            int type = params.getInt("type");
            String messageContent= params.getString("content");
            String uniqueId = params.has("uniqueId") ? params.getString("uniqueId") : null;
            MessageCallback messageCallback;
            JSONObject data;

            switch (type) {

                case PushMessageVOTypes.INVITATION:
                    log.info("CHAT_INVITATION");
                    JSONObject inviData = new JSONObject(messageContent);
                    inviData.put("requestId", uniqueId);
                    inviData.put("uniqueId", uniqueId);
                    createThread(inviData, true);

                    break;

                case PushMessageVOTypes.MESSAGE:
                    log.info("CHAT_MESSAGE");
                    chatMessageHandler(threadId,new JSONObject(messageContent));
                    break;

                case PushMessageVOTypes.DELIVERY:
                    log.info("CHAT_DELIVERY");
                    messageCallback = messagesCallback.get(uniqueId);
                    data = new JSONObject();
                    data.put("messageId", messageContent);
                    data.put("threadId", threadId);
                    data.put("uniqueId", uniqueId);

                    if (messageCallback != null) {
                        messageCallback.onDeliver(data);
                        messagesCallback.remove(messageContent);
                    }


                    fireEvents("deliver",data);
                    break;

                case PushMessageVOTypes.SEEN:
                    log.info("CHAT_SEEN");
                    messageCallback = messagesCallback.get(uniqueId);
                    data = new JSONObject();
                    data.put("messageId", messageContent);
                    data.put("threadId", threadId);
                    data.put("uniqueId", uniqueId);

                    if (messageCallback != null) {
                        messageCallback.onSeen(data);
                        messagesCallback.remove(messageContent);
                    }

                    fireEvents("seen",data);
                    break;

                case PushMessageVOTypes.SENT:
                    log.info("CHAT_SENT");
                    messageCallback = messagesCallback.get(uniqueId);
                    data = new JSONObject();
                    data.put("messageId", messageContent);
                    data.put("threadId", threadId);
                    data.put("uniqueId", uniqueId);

                    if (params.has("time") && !params.isNull("time")) {
                        data.put("time", params.get("time"));
                    }
                    if (params.has("repliedTo") && !params.isNull("repliedTo")) {
                        data.put("repliedTo", params.get("repliedTo").toString());
                    }

                    if (messageCallback != null) {
                        messageCallback.onSent(data);
                        messagesCallback.remove(messageContent);
                    }

                    fireEvents("sent",data);
                    break;
                case PushMessageVOTypes.GET_THREADS:
                    log.info("CHAT_GET_THREADS " + messageContent);
                    messageCallback = messagesCallback.get(uniqueId);
                    if (messageCallback != null) {
                        messageCallback.onResult(Util.createReturnData(false, "", 0, new JSONArray(messageContent)));
                        messagesCallback.remove(messageContent);
                    }

                    break;

                case PushMessageVOTypes.GET_HISTORY:
                    log.info("CHAT_GET_HISTORY");
                    messageCallback = messagesCallback.get(uniqueId);
                    if (messageCallback != null) {
                        messageCallback.onResult(Util.createReturnData(false, "", 0, new JSONArray(messageContent)));
                        messagesCallback.remove(messageContent);
                    }
                    break;

                case PushMessageVOTypes.PING:
                    log.info("CHAT_PING");
                    break;

                case PushMessageVOTypes.GET_STATUS:
                    log.info("CHAT_GET_STATUS");
                    break;

                case PushMessageVOTypes.ADD_PARTICIPANT:
                    log.info("CHAT_ADD_PARTICIPANT");
                    fireEvents("newParticipant",reformatThread(new JSONObject(messageContent)));
                    break;

                case PushMessageVOTypes.BLOCK:
                    log.info("CHAT_BLOCK");
                    break;

                case PushMessageVOTypes.UNBLOCK:
                    log.info("CHAT_UNBLOCK");
                    break;

                case PushMessageVOTypes.LEAVE_THREAD:
                    log.info("CHAT_LEAVE_THREAD");
                    messageCallback = messagesCallback.get(uniqueId);
                    if (messageCallback != null) {
                        messageCallback.onResult(Util.createReturnData(false, "", 0, new JSONArray(messageContent)));
                        messagesCallback.remove(messageContent);
                    } else {
                        JSONObject cData = new JSONObject();
                        cData.put("threadId", threadId);
                        cData.put("participant", new JSONObject(messageContent));
                        fireEvents("leaveThread",cData);
                    }

                    break;

                case PushMessageVOTypes.RENAME:
                    log.info("CHAT_RENAME");
                    break;

                case PushMessageVOTypes.GET_CONTACTS:
                    log.info("CHAT_GET_CONTACTS");
                    break;

                case PushMessageVOTypes.CHANGE_TYPE:
                    log.info("CHAT_CHANGE_TYPE");
                    break;

                case PushMessageVOTypes.REMOVE_PARTICIPANT:
                    log.info("CHAT_REMOVE_PARTICIPANT");
                    break;

                case PushMessageVOTypes.FORWARD_MESSAGE:
                    log.info("CHAT_FORWARD_MESSAGE");
                    chatForwardMessageHandler(threadId,new JSONObject(messageContent));
                    break;
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void chatMessageHandler(String threadId, JSONObject pushMessageVO) throws ServiceException{
        fireEvents("message", reformatForwardMessage(threadId, pushMessageVO));
    }

    private void chatForwardMessageHandler(String threadId, JSONObject pushMessageVO) throws ServiceException{
        fireEvents("forwardMessage", reformatMessage(threadId, pushMessageVO));
    }

    private String generateImageSrc(String imageId, Integer imageWidth, Integer imageHeight) {

        String src = ConfigData.isa + "/nzh/image/?imageId=" + imageId;

        if (imageWidth != null && imageWidth > 0) {
            src += ("&width=" + imageWidth);
        }

        if (imageHeight != null && imageHeight > 0) {
            src += ("&height=" + imageHeight);
        }

        return src;

    }

    private JSONObject reformatThread(JSONObject messageContent)  throws ServiceException{
        JSONObject threadData = new JSONObject();
        log.info("reformatThread_1 " + messageContent);
        try {
            String threadId = messageContent.get("id").toString();

            String partnerId = messageContent.get("partner").toString();
            boolean isGroup = messageContent.getBoolean("group");
            JSONObject participantThreadData = new JSONObject();

            JSONArray participantsData = new JSONArray();
            threadData.put("group", isGroup);
            threadData.put("title", messageContent.getString("title"));
            threadData.put("threadId", threadId);
            threadData.put("partnerId", partnerId);

            threadData.put("type", messageContent.get("type"));
            threadData.put("time", messageContent.get("time"));
            threadData.put("unreadCount", messageContent.get("unreadCount"));
            if (messageContent.has("lastMessage") && !messageContent.isNull("lastMessage")) {
                threadData.put("lastMessage", messageContent.get("lastMessage"));
            }
            if (messageContent.has("lastMessageId") && !messageContent.isNull("lastMessageId")) {
                threadData.put("lastSeenMessageId", messageContent.get("lastMessageId").toString());
            }

            if (messageContent.has("mute") && !messageContent.isNull("mute")) {
                threadData.put("mute", messageContent.get("mute"));
            }

            if (messageContent.has("image") && !messageContent.isNull("image")) {
                threadData.put("image", messageContent.get("image"));
            }
            threadData.put("partnerLastMessageId", messageContent.get("partnerLastMessageId"));
            threadData.put("partnerLastDeliveredMessageId", messageContent.get("partnerLastDeliveredMessageId").toString());

            if (messageContent.has("lastMessageVO") && !messageContent.isNull("lastMessageVO")) {

                try {
                    threadData.put("lastMessageVO", new JSONObject(messageContent.get("lastMessageVO").toString()));
                } catch (JSONException e) {
                    threadData.put("lastMessageVO", messageContent.get("lastMessageVO"));
                }

            }

            if (messageContent.has("participantCount") && !messageContent.isNull("participantCount")) {
                threadData.put("participantCount", messageContent.getLong("participantCount"));
            }

            if (messageContent.has("requestId") && !messageContent.isNull("requestId")) {
                threadData.put("requestId", messageContent.get("requestId").toString());
            }

            if (messageContent.has("uniqueId") && !messageContent.isNull("uniqueId")) {
                threadData.put("uniqueId", messageContent.getString("uniqueId"));
            }

            if (messageContent.has("participants") && !messageContent.isNull("participants")) {
                JSONArray participants = messageContent.getJSONArray("participants");
                for (int i = 0; i < participants.length(); i++) {
                    JSONObject participant = participants.getJSONObject(i);
                    String id = participant.get("id").toString();
                    if (userData.get("id").toString().equals(id)) {
                        JSONObject ownerData = new JSONObject();
                        ownerData.put("id", id);
                        ownerData.put("name", participant.getString("name"));
                        if (participant.has("image") && !participant.isNull("image")) {
                            ownerData.put("image", participant.getJSONObject("image"));
                        }
                        threadData.put("owner", ownerData);
                        continue;
                    } else {
                        if (!participantThreadData.has(id) && !isGroup) {

                            JSONObject pData = new JSONObject();
                            pData.put("threadId", threadId);
                            pData.put("activeMatchesCount", 1);
                            participantThreadData.put(id, pData);
                        }
                    }

                    JSONObject participantData = new JSONObject();
                    participantData.put("id", id);
                    participantData.put("name", participant.getString("name"));
                    if (participant.has("image") && !participant.isNull("image")) {
                        participantData.put("image", messageContent.getJSONObject("image"));
                    }
                    participantsData.put(participantData);
                }
            }

            threadData.put("participants", participantsData);

            return threadData;

        } catch (Exception e) {
            throw new ServiceException(e);
        }
    };

    private JSONObject createThread(JSONObject messageContent,Boolean addFromService) throws ServiceException {
        JSONObject threadData = reformatThread(messageContent);
        if (addFromService) {
            fireEvents("newThread",threadData);
        }

        return threadData;
    }

    private JSONObject reformatMessage(String threadId,JSONObject pushMessageVO) throws ServiceException {

        JSONObject messageData = new JSONObject();

        try {
            JSONObject participant = pushMessageVO.getJSONObject("participant");
            messageData.put("threadId", threadId);
            messageData.put("messageId", pushMessageVO.get("id").toString());
            messageData.put("participant", participant);
            messageData.put("message", pushMessageVO.get("message"));

            if (pushMessageVO.has("uniqueId") && !pushMessageVO.isNull("uniqueId")) {
                messageData.put("uniqueId", pushMessageVO.get("uniqueId"));
            }

            if (pushMessageVO.has("seen") && !pushMessageVO.isNull("seen")) {
                messageData.put("seen", pushMessageVO.get("seen"));
            }
            if (pushMessageVO.has("delivered") && !pushMessageVO.isNull("delivered")) {
                messageData.put("delivered", pushMessageVO.get("delivered"));
            }

//            if (pushMessageVO.has("repliedToMessageId") && !pushMessageVO.isNull("repliedToMessageId")) {
//                messageData.put("repliedToMessageId", pushMessageVO.get("repliedToMessageId").toString());
//            }
//
//            if (pushMessageVO.has("repliedToMessage") && !pushMessageVO.isNull("repliedToMessage")) {
//                messageData.put("repliedToMessage", pushMessageVO.get("repliedToMessage"));
//            }

            if (pushMessageVO.has("forwardInfo") && !pushMessageVO.isNull("forwardInfo")) {
                messageData.put("forwardInfo", pushMessageVO.get("forwardInfo"));
            }

            if (pushMessageVO.has("replyInfoVO") && !pushMessageVO.isNull("replyInfoVO")) {
                messageData.put("replyInfoVO", pushMessageVO.get("replyInfoVO"));
            }
            if (pushMessageVO.has("previousId") && !pushMessageVO.isNull("previousId")) {
                messageData.put("previousId", pushMessageVO.get("previousId").toString());
            }

            if (pushMessageVO.has("time") && !pushMessageVO.isNull("time")) {
                messageData.put("time", pushMessageVO.get("time"));
            }

            messageData.put("owner", participant.get("id").toString().equals(userData.get("id").toString()));

        } catch (Exception e) {
            throw new ServiceException(e);
        }

        return messageData;
    }

    private JSONObject reformatForwardMessage(String threadId,JSONObject pushMessageVO) throws ServiceException {

        JSONObject messageData = new JSONObject();

        try {
            JSONObject participant = pushMessageVO.getJSONObject("participant");
            messageData.put("threadId", threadId);
            messageData.put("messageId", pushMessageVO.get("id").toString());
            messageData.put("participant", participant);
            messageData.put("message", pushMessageVO.get("message"));

            if (pushMessageVO.has("uniqueId") && !pushMessageVO.isNull("uniqueId")) {
                messageData.put("uniqueId", pushMessageVO.get("uniqueId"));
            }

            if (pushMessageVO.has("forwardInfo") && !pushMessageVO.isNull("forwardInfo")) {
                messageData.put("forwardInfo", pushMessageVO.get("forwardInfo"));
            }

            if (pushMessageVO.has("conversation") && !pushMessageVO.isNull("conversation")) {
                messageData.put("conversation", pushMessageVO.get("conversation"));
            }

            if (pushMessageVO.has("replyInfoVO") && !pushMessageVO.isNull("replyInfoVO")) {
                messageData.put("replyInfoVO", pushMessageVO.get("replyInfoVO"));
            }
            if (pushMessageVO.has("previousId") && !pushMessageVO.isNull("previousId")) {
                messageData.put("previousId", pushMessageVO.get("previousId").toString());
            }

            if (pushMessageVO.has("time") && !pushMessageVO.isNull("time")) {
                messageData.put("time", pushMessageVO.get("time"));
            }

            messageData.put("owner", participant.get("id").toString().equals(userData.get("id").toString()));

        } catch (Exception e) {
            throw new ServiceException(e);
        }

        return messageData;
    }


    private JSONArray reformatMessageHistory(String threadId,JSONArray messages) throws ServiceException {
        JSONArray historyData = new JSONArray();
        try {
            for (int i = 0; i < messages.length(); i++) {
                historyData.put(reformatMessage(threadId,messages.getJSONObject(i)));
            }
        } catch (Exception e) {
            throw new ServiceException(e);
        }

        return historyData;
    }


    @Override
    public void registerPeerId(Long peerId, final Network.HttpRequestCallback res) {
        try {
            JSONObject sendData = new JSONObject();
            sendData.put("peerId", peerId);
            sendData.put("serviceVersion", Service.VERSION);
            sendData.put("deviceId", this.deviceId);
            sendData.put("type", 2);
            log.info("CHAT_registerPeerId_1 " + sendData);
            request(RequestUrls.CHAT_ASYNC_REGISTER, sendData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result){
                    log.info("CHAT_registerPeerId_2 " + result);
                    try {
                        boolean hasError = result.getBoolean("hasError");
                        int errorCode = result.getInt("errorCode");


                        JSONObject returnData = new JSONObject();
                        returnData.put("hasError", hasError);
                        returnData.put("errorCode", errorCode);
                        returnData.put("errorMessage", result.getString("errorMessage"));

                        if (hasError) {
                            switch (errorCode) {
//                                case 1110:
//                                    majorConflictAction();
//                                    break;
//
//                                case 1134:
//                                    network.onLogout(false);
//                                    break;

                                default:
                                    res.onResult(returnData);
                            }
                        } else {
                            returnData.put("result", result.getString("result"));
                            res.onResult(returnData);
                        }

                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            });

        } catch (Exception e) {
            e.printStackTrace();
        }

    }

    @Override
    public void activatePeerId(Long peerId, final Network.HttpRequestCallback res) {

        JSONObject requestData = new JSONObject();
        try {
            log.info("CHAT_activatePeerId_0 ");
            requestData.put("peerId", peerId);
            request(RequestUrls.CHAT_ACTIVE_PEER, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result){
                    log.info("CHAT_activatePeerId_1 " + result);
                    try {
                        JSONObject data;
                        boolean hasError = result.getBoolean("hasError");
                        if (hasError) {

                            switch (result.getInt("errorCode")) {


//                                case 1134:
//                                    network.onLogout(false);
//                                    break;
                                default:
                                    res.onResult(result);
                            }
                        } else {
                            data = new JSONObject();
                            data.put("hasError", false);
                            res.onResult(data);
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            });

        } catch (Exception e) {
            e.printStackTrace();
        }


    }

    /**
     *
     * <div style='width: 100%;text-align: right'> اعلام دریافت پیام </div>
     * @param params
     *      <ul>
     *          <li>{String} messageId شناسه پیام </li>
     *      </ul>
     *
     * @param callback
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void deliver(JSONObject params,final RequestCallback callback) throws ServiceException {

        try {
            JSONObject data = new JSONObject();
            data.put("chatMessageVOType", PushMessageVOTypes.DELIVERY);
            data.put("content", params.get("messageId").toString());
            data.put("pushMsgType", 4);
            if (params.has("timeout")) {
                data.put("timeout", params.get("timeout"));
            }
            _sendMessage(data,new MessageCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    if (callback != null) {
                        callback.onResult(Util.createReturnData(false, null, null, result));
                    }

                }
            });

        } catch (Exception e) {
            throw new ServiceException(e);
        }

    }

    /**
     * <div style='width: 100%;text-align: right'> اعلام دیده شدن پیام </div>
     * @param params
     *      <ul>
     *          <li>{String} messageId شناسه پیام </li>
     *      </ul>
     *
     * @param callback
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void seen(JSONObject params,final RequestCallback callback) throws ServiceException{
        try {
            JSONObject data = new JSONObject();
            data.put("chatMessageVOType", PushMessageVOTypes.SEEN);
            data.put("content", params.get("messageId").toString());
            data.put("pushMsgType", 4);
            if (params.has("timeout")) {
                data.put("timeout", params.get("timeout"));
            }
            _sendMessage(data,new MessageCallback() {
                @Override
                public void onResult(JSONObject result) {
                    if (callback != null) {
                        callback.onResult(Util.createReturnData(false, null, null, result));
                    }

                }
            });

        } catch (Exception e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'> اعلام دیده شدن پیام در گروه </div>
     *
     * @param params
     *      <ul>
     *          <li>{String} messageId شناسه پیام </li>
     *      </ul>
     *
     * @param callback
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *      </ul>
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void lastSeen(JSONObject params,final RequestCallback callback) throws ServiceException{
        try {
            JSONObject data = new JSONObject();
            data.put("chatMessageVOType", PushMessageVOTypes.LAST_SEEN_TYPE);
            data.put("content", params.get("messageId").toString());
            data.put("pushMsgType", 4);
            if (params.has("timeout")) {
                data.put("timeout", params.get("timeout"));
            }
            _sendMessage(data,new MessageCallback() {
                @Override
                public void onResult(JSONObject result) {
                    if (callback != null) {
                        callback.onResult(Util.createReturnData(false, null, null, result));
                    }

                }
            });

        } catch (Exception e) {
            throw new ServiceException(e);
        }
    }

    /**
     *
     * <div style='width: 100%;text-align: right'> درخواست ایجاد ترد جدید با یک کاربر </div>
     * @param params
     *      <ul>
     *          <li>{String} userId - شناسه کاربر</li>
     *          <li>{String} [uniqueId]</li>
     *          <li>{String} [addFromService]</li>
     *      </ul>
     *
     * @param callback
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *      </ul>
     * @return
     *      <ul>
     *          <li></li>
     *      </ul>
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public JSONObject chatRequest(final JSONObject params, final RequestCallback callback) throws ServiceException{
        return  _chatRequest(params,callback);
    }

    /**
     * <div style='width: 100%;text-align: right'>ارسال پیام </div>
     * @param params
     *  <ul>
     *      <li>{String} message  پیام ارسالی</li>
     *      <li>{String} threadId شناسه ترد</li>
     *      <li>{String} [repliedTo] شناسه پیامی که می خواهد به آن اشاره شود</li>
     *      <li>{String} [uniqueId] شناسه منحصر به فرد</li>
     *      <li>{String} [metaData] اطلاعات اضافی به همراه پیام فرد</li>
     *  </ul>
     *
     *
     *
     * @param messageCallback
     * fire events is
     *      <ul>
     *         <li>messageCallback.onSeen</li>
     *         <li>messageCallback.onDeliver</li>
     *         <li>messageCallback.onSent</li>
     *         <li>messageCallback.onResult</li>
     *      </ul>
     *
     * @return JSONObject
     *      <ul>
     *         <li>uniqueId </li>
     *      </ul>
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public JSONObject sendMessage(JSONObject params, MessageCallback messageCallback) throws ServiceException{

        JSONObject returnData;

        try {

            JSONObject data = new JSONObject();
            data.put("pushMsgType",4);
            data.put("chatMessageVOType", PushMessageVOTypes.MESSAGE);
            data.put("threadId", params.get("threadId").toString());
            if (params.has("uniqueId") && !params.isNull("uniqueId")) {
                data.put("uniqueId", params.getString("uniqueId"));
            }
            data.put("content", params.getString("message"));
            if (params.has("repliedTo")) {
                data.put("repliedTo", params.get("repliedTo").toString());
            }
            if (params.has("timeout")) {
                data.put("timeout", params.get("timeout"));
            }

            if (params.has("metaData")) {
                data.put("metaData", params.get("metaData"));
            }
            returnData = _sendMessage(data,messageCallback);

        } catch (Exception e) {
            throw new ServiceException(e);
        }

        return returnData;
    }

    /**
     * <div style='width: 100%;text-align: right'>ارسال پیام </div>
     * @param params
     *  <ul>
     *      <li>{String} threadId شناسه ترد</li>
     *      <li>{String} messagesId شناسه پیام</li>
     *      <li>{JSONArray} [uniqueId] شناسه منحصر به فرد</li>
     *  </ul>
     *
     * @param messageCallback
     * fire events is
     *      <ul>
     *         <li>messageCallback.onSeen</li>
     *         <li>messageCallback.onDeliver</li>
     *         <li>messageCallback.onSent</li>
     *         <li>messageCallback.onResult</li>
     *      </ul>
     *
     * @return
     *      <ul>
     *          <li></li>
     *      </ul>
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public JSONObject forwardMessage(JSONObject params, MessageCallback messageCallback) throws ServiceException {
        JSONObject returnData;
        try {

            JSONObject data = new JSONObject();
            data.put("pushMsgType",4);
            data.put("chatMessageVOType", PushMessageVOTypes.FORWARD_MESSAGE);
            data.put("threadId", params.get("threadId").toString());
            data.put("content", params.get("messagesId").toString());
            if (params.has("uniqueId") && !params.isNull("uniqueId")) {
                data.put("uniqueId", params.get("uniqueId"));
            }
            if (params.has("timeout")) {
                data.put("timeout", params.get("timeout"));
            }
            returnData = _sendMessage(data, messageCallback);

        } catch (Exception e) {
            throw new ServiceException(e);
        }

        return returnData;
    }

    /**
     * <div style='width: 100%;text-align: right'>  دریافت اطلاعات ترد </div>
     * @param params
     *  <ul>
     *      <li>{String} threadId</li>
     *      <li>{Integer} [size=50]</li>
     *      <li>{Integer} [offset=0]</li>
     *      <li>{Integer} [timeout]</li>
     *      <li>{String|Number} [firstMessageId]</li>
     *      <li>{String|Number} [lastMessageId]</li>
     *      <li>{String} [order] asc or desc</li>
     *  </ul>
     *
     * @param callback
     *      fire events is
     *      <ul>
     *         <li>messageCallback.onResult(JSONObject)
     *             <ul>
     *                 <li>{JSONObject} threads - key is thread id, and its value id thread data</li>
     *                 <li>{Boolean} hasNext</li>
     *                 <li>{String} nextOffset</li>
     *             </ul>
     *         </li>
     *      </ul>
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getThreadHistory(final JSONObject params, final RequestCallback callback) throws ServiceException {

        try {

            int size = 50;
            int offset = 0;
            JSONObject data = new JSONObject();
            final JSONObject content = new JSONObject();
            if (params != null) {
                if (params.has("count") && !params.isNull("count")) {
                    size = params.getInt("count");
                }

                if (params.has("size") && !params.isNull("size")) {
                    size = params.getInt("size");
                }
                if (params.has("offset") && !params.isNull("offset")) {
                    offset = params.getInt("offset");
                }

                if (params.has("firstMessageId") && !params.isNull("firstMessageId")) {
                    content.put("firstMessageId", params.get("firstMessageId"));
                }

                if (params.has("lastMessageId") && !params.isNull("lastMessageId")) {
                    content.put("lastMessageId", params.get("lastMessageId"));
                }
                if (params.has("order") && !params.isNull("order")) {
                    content.put("order", params.get("order"));
                }
                if (params.has("timeout")) {
                    data.put("timeout", params.get("timeout"));
                }

            }

            content.put("count", size);
            content.put("offset", offset);
            data.put("content", content);
            data.put("chatMessageVOType", PushMessageVOTypes.GET_HISTORY);
            data.put("threadId", params.get("threadId").toString());

            final int finalSize = size;
            final int finalOffset = offset;
            _sendMessage(data, new MessageCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    try {

                        boolean hasError = result.getBoolean("hasError");
                        JSONObject retData = new JSONObject();
                        retData.put("hasError", hasError);
                        retData.put("errorMessage", result.get("errorMessage"));
                        retData.put("errorCode", result.get("errorCode"));

                        if (!hasError) {
                            JSONArray messageContent = result.getJSONArray("result");
                            int msgLength = messageContent.length();
                            JSONObject returnData = new JSONObject();
                            returnData.put("hasNext", finalSize == msgLength && msgLength > 0);
                            returnData.put("nextOffset", finalOffset + msgLength);
                            returnData.put("history", reformatMessageHistory(params.get("threadId").toString(),messageContent));

                            retData.put("result", returnData);
                        }

                        callback.onResult(retData);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            });

        } catch (Exception e) {
            throw new ServiceException(e);
        }

    }

    /**
     * <div style='width: 100%;text-align: right'>  دریافت ترد های کاربر </div>
     * @param params
     *  <ul>
     *      <li>{Integer} [size=50]</li>
     *      <li>{Integer} [offset=0]</li>
     *      <li>{Boolean} [new]</li>
     *      <li>{String} [name]</li>
     *      <li>{JSONArray} [threadsId]</li>
     *      <li>{Boolean} [addFromService = true]</li>
     *  </ul>
     *
     * @param callback
     *      fire events is
     *      <ul>
     *         <li>messageCallback.onResult(JSONObject)
     *             <ul>
     *                 <li>{JSONObject} threads - key is thread id, and its value id thread data</li>
     *                 <li>{Boolean} hasNext</li>
     *                 <li>{String} nextOffset</li>
     *             </ul>
     *         </li>
     *      </ul>
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getThreads(final JSONObject params, final RequestCallback callback) throws ServiceException {
        try {
            log.info("getThreads_1 " + params);
            int size = 50;
            int offset = 0;
            final JSONObject content = new JSONObject();
            JSONObject data = new JSONObject();
            if (params != null) {
                if (params.has("count") && !params.isNull("count")) {
                    size = params.getInt("count");
                }

                if (params.has("size") && !params.isNull("size")) {
                    size = params.getInt("size");
                }
                if (params.has("offset") && !params.isNull("offset")) {
                    offset = params.getInt("offset");
                }

                if (params.has("name") && !params.isNull("name")) {
                    content.put("name", params.getString("name"));
                }
                if (params.has("new") && !params.isNull("new")) {
                    content.put("new", params.getBoolean("new"));
                }
                if (params.has("threadsId") && !params.isNull("threadsId")) {
                    content.put("threadIds", params.getJSONArray("threadsId"));
                }
                if (params.has("timeout")) {
                    data.put("timeout", params.get("timeout"));
                }
            }



            content.put("count", size);
            content.put("offset", offset);
            data.put("content", content);
            data.put("chatMessageVOType", PushMessageVOTypes.GET_THREADS);

            final int finalSize = size;
            final int finalOffset = offset;
            _sendMessage(data, new MessageCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    try {

                        boolean hasError = result.getBoolean("hasError");
                        JSONObject retData = new JSONObject();
                        retData.put("hasError", hasError);
                        retData.put("errorMessage", result.get("errorMessage"));
                        retData.put("errorCode", result.get("errorCode"));

                        if (!hasError) {
                            boolean addFromService = true;
                            JSONArray messageContent = result.getJSONArray("result");
                            int msgLength = messageContent.length();
                            JSONObject returnData = new JSONObject();
                            returnData.put("hasNext", finalSize == msgLength && msgLength > 0);
                            returnData.put("nextOffset", finalOffset + msgLength);
                            JSONArray threadsData = new JSONArray();
                            if (params != null && params.has("addFromService") && !params.isNull("addFromService")) {
                                addFromService = params.getBoolean("addFromService");
                            }

                            for (int i = 0; i < msgLength; i++) {
                                JSONObject threadData = createThread(messageContent.getJSONObject(i),addFromService);

                                threadsData.put(threadData);
                            }

                            returnData.put("threads", threadsData);

                            retData.put("result", returnData);
                        }


                        callback.onResult(retData);

                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            });

        } catch (Exception e) {
            throw new ServiceException(e);
        }

    }

    /**
     * <div style='width: 100%;text-align: right'> خاموش کردن یک ترد </div>
     * @param params
     *  <ul>
     *      <li>{Integer} threadId شناسه ترد</li>
     *  </ul>
     *
     * @param callback
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void muteThread(JSONObject params, final RequestCallback callback) throws ServiceException {
        try {
            JSONObject data = new JSONObject();
            data.put("chatMessageVOType", PushMessageVOTypes.MUTE_THREAD);
            data.put("threadId", params.get("threadId").toString());
            data.put("pushMsgType", 4);
            if (params.has("timeout")) {
                data.put("timeout", params.get("timeout"));
            }
            _sendMessage(data, new MessageCallback() {
                @Override
                public void onResult(JSONObject result) {
                    if (callback != null) {
                        callback.onResult(Util.createReturnData(false, null, null, result));
                    }

                }
            });
        } catch (Exception e) {
            throw new ServiceException(e);
        }

    }

    /**
     * <div style='width: 100%;text-align: right'> روشن کردن یک ترد </div>
     * @param params
     *  <ul>
     *      <li>{Integer} threadId شناسه ترد</li>
     *  </ul>
     *
     * @param callback
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *      </ul>
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void unMuteThread(JSONObject params, final RequestCallback callback) throws ServiceException {
        try {
            JSONObject data = new JSONObject();
            data.put("chatMessageVOType", PushMessageVOTypes.UNMUTE_THREAD);
            data.put("threadId", params.get("threadId").toString());
            data.put("pushMsgType", 4);
            if (params.has("timeout")) {
                data.put("timeout", params.get("timeout"));
            }
            _sendMessage(data, new MessageCallback() {
                @Override
                public void onResult(JSONObject result) {
                    if (callback != null) {
                        callback.onResult(Util.createReturnData(false, null, null, result));
                    }

                }
            });
        } catch (Exception e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'> ترک کردن ترد</div>
     * @param params
     *  <ul>
     *      <li>{Integer} threadId شناسه ترد</li>
     *  </ul>
     *
     * @param callback
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void leaveThread(JSONObject params, final RequestCallback callback) throws ServiceException {
        try {
            JSONObject data = new JSONObject();
            data.put("chatMessageVOType", PushMessageVOTypes.LEAVE_THREAD);
            data.put("threadId", params.get("threadId").toString());
            data.put("pushMsgType", 4);
            if (params.has("timeout")) {
                data.put("timeout", params.get("timeout"));
            }
            _sendMessage(data, new MessageCallback() {
                @Override
                public void onResult(JSONObject result) {
                    if (callback != null) {
                        callback.onResult(Util.createReturnData(false, null, null, result));
                    }

                }
            });
        } catch (Exception e) {
            throw new ServiceException(e);
        }

    }


    /**
     *<div style='width: 100%;text-align: right'> دریافت رخداد های موجود در سرویس</div>
     *
     * <pre>
     *
     *     <code style='float:right'>نمونه کد</code>
     *     <code>
     *
     *     //fire after receive new Thread
     *     String id = tis.on("newThread", new EventCallback(){
     *        { @code @Override}
     *         public void onFire() {
     *             System.out.println("newThread");
     *         }
     *     });
     *     System.out.println("UUID EVENT " + id);
     *     </code>
     * </pre>
     * @param eventName  نام رخداد
     * <ul>
     *      <li>"serverRegister" - بعد از کامل شدن اتصال به سرور چت این رویداد اتفاق می افتد</li>
     *      <li>"message" - بعد از دریافت پیام جدید این رویداد اتفاق می افتد
     *          <ul>
     *              <li>{String} threadId - شناسه ترد</li>
     *              <li>{String} messageId - شناسه پیام</li>
     *              <li>{JSONArray} message - پیام</li>
     *              <li>{JSONObject} participant - اطلاعات کاربر ارسال کننده پیام
     *                  <ul>
     *                      <li>{String} id - شناسه کاربر</li>
     *                      <li>{String} name - نام کاربر</li>
     *                      <li>{JSONObject} [image] - اطلاعات تصویر کاربر
     *                          <ul>
     *                              <li>{String} id - شناسه تصویر</li>
     *                              <li>{String} url - لینک تصویر</li>
     *                              <li>{Integer} width - رزولیشن افقی تصویر</li>
     *                              <li>{Integer} height - رزولیشن عمودی تصویر</li>
     *                          </ul>
     *                      </li>
     *                  </ul>
     *              </li>
     *          </ul>
     *      </li>
     *      <li>"newThread" - بعد از دریافت اطلاعات ترد این رویداد ایتفاق می افتد
     *          <ul>
     *               <li>{String} threadId - شناسه ترد</li>
     *               <li>{String} title - عنوان</li>
     *               <li>{String} [Image]
     *                   <ul>
     *                       <li>{String} id</li>
     *                       <li>{String} url</li>
     *                       <li>{Integer} width</li>
     *                       <li>{Integer} height</li>
     *                   </ul>
     *               </li>
     *               <li>{JSONArray} participants - اعضا
     *                   <ul>
     *                       <li>{String} id</li>
     *                       <li>{String} name</li>
     *                       <li>{JSONObject} [image]
     *                           <ul>
     *                               <li>{String} id</li>
     *                               <li>{String} url</li>
     *                               <li>{Integer} width</li>
     *                               <li>{Integer} height</li>
     *                           </ul>
     *                       </li>
     *                   </ul>
     *               </li>
     *          </ul>
     *      </li>
     *      <li>"connect" - بعد از وصل شدن به سرور ایسینک این رخداد اتفاق می افتد</li>
     *      <li>"disconnect" - بعد از قطع شدن به سرور ایسینک این رخداد اتفاق می افتد</li>
     *      <li>"reconnect" - بعد از وصل مجدد به سرور ایسینک این رخداد اتفاق می افتد</li>
     *      <li>"seen" - بعد از مشاهده پیام توسط کاربر این رویداد اتفاق می افتد
     *          <ul>
     *              <li>{String} messageId</li>
     *              <li>{Boolean} threadId</li>
     *          </ul>
     *      </li>
     *      <li>"deliver" - بعد از دریافت پیام توسط کاربر این رویداد اتفاق می افتد
     *          <ul>
     *              <li>{String} messageId</li>
     *              <li>{Boolean} threadId</li>
     *          </ul>
     *      </li>
     *      <li>"sent" - بعد از ارسال پیام به کاربر این رویداد اتفاق می افتد</li>
     *      <li>"login" - بعد از ورود به حساب کاربری این رخداد اتفاق می افتد</li>
     *      <li>"logout" - بعد از خروج به حساب کاربری این رخداد اتفاق می افتد</li>
     * </ul>
     *
     * @param callback متد اجرا شونده بعد از اتفاق افتادن رخداد مورد نظر
     *
     * @return  شناسه متد رخداد
     * */
    public String on(String eventName, EventCallback callback) {

        HashMap<String, EventCallback> events = eventsCallback.get(eventName);

        if (events != null) {

            String id = UUID.randomUUID().toString();

            events.put(id, callback);

            if (eventName.equals("login") && isLogin) {
                callback.onFire(userData);
            }

            if (eventName.equals("connect") && peerId  != null) {
                try {
                    JSONObject data = new JSONObject();
                    data.put("peerId", peerId);
                    callback.onFire(data);
                } catch (Exception e) {
                    e.printStackTrace();
                }

            }

            if (eventName.equals("serverRegister") && isRegisterInChatServer) {
                callback.onFire(userData);
            }

            return id;
        }

        return null;
    }


    public abstract static class MessageCallback {

        public void onSeen(JSONObject params) {}
        public void onDeliver(JSONObject params) {}
        public void onSent(JSONObject params) {}
        public void onResult(JSONObject result) {}
    }

}
