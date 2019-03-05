/**
 * پکیج سرویس
 * */
package com.fanap.gameCenter.TIS;

import android.content.Context;
import android.net.Uri;
import android.provider.Settings;

//import com.fanap.gameCenter.TIS.Chat.ChatService;
import com.fanap.gameCenter.TIS.Base.*;
import com.fanap.gameCenter.TIS.Base.Game.MultiPlayer;
import com.fanap.gameCenter.TIS.Database.DBCallback;
import com.fanap.gameCenter.TIS.Database.Database;
import com.fanap.gameCenter.TIS.Network.Network;
import com.fanap.gameCenter.TIS.Share.*;
import com.fanap.gameCenter.TIS.Share.ServiceException;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.UUID;

//import org.apache.log4j.Logger;
import com.fanap.gameCenter.TIS.Share.Logger;


/**
 *
 *کلاس اصلی سرویس
 *
 * @see <a href="{@docRoot}/TISIntro/index.html" style='font-size: large;'>شروع کار با سرویس</a>
  */
public class Service implements Network.Parent /* extends android.app.Service*/ {

//    public static String serviceMode = ServiceModeTypes.RELEASEMODE;
    private String confStr = "{\"CONNECTINGTOPUSH\":{\"EN\":\"connecting to push\",\"FA\":\"در حال ارتباط با سرور لحظاتی دیگر امتحان کنید\"},\"GAME\":{\"EAndroid SQLiteN\":\"game\",\"FA\":\"بازی\"},\"CONNECTIONERROR\":{\"EN\":\" connection error\",\"FA\":\"خطا در برقراری ارتباط با سرور\"},\"NOTONLINE\":{\"EN\":\"you are not online.\",\"FA\":\"ارتباط شما با اینترنت برقرار نیست\"},\"NOTAUTHENTICATE\":{\"EN\":\"cannot authenticate user\",\"FA\":\"شماره تماس یا رمز عبور اشتباه می باشد\"},\"NOTIFREQUESTMATCH\":{\"EN\":\"request match.\",\"FA\":\" به شما درخواست بازی داده است. \"},\"MATCHREQUESTCANCELD\":{\"EN\":\"request match.\",\"FA\":\" به شما درخواست بازی داده است. \"},\"MATCHREQUESTVERSIONFAIL\":{\"EN\":\"request match.\",\"FA\":\"  به شما درخواست بازی داده است,ولی به دلیل عدم بروزرسانی برنامه شما ,درخواست کنسل گردید. \"},\"MATCHREQUEST\":{\"EN\":\"request match.\",\"FA\":\"درخواست بازی\"},\"MATCHREQUESTIN\":{\"EN\":\"request match in.\",\"FA\":\"درخواست بازی در \"},\"HASMAJORCONFLICT\":{\"EN\":\"major conflict.\",\"FA\":\"نسخه کنونی شما بروز نمی باشد. لطفا بازی خود را بروزرسانی کنید\"},\"UPDATE\":{\"EN\":\"update\",\"FA\":\"بروزرسانی\"},\"MATCHREQUESTS\":{\"EN\":\"match requests\",\"FA\":\"درخواست های بازی\"},\"MATCHREQUESTFROM\":{\"EN\":\"match requests from \",\"FA\":\"درخواست بازی از \"},\"HAVE\":{\"EN\":\"have\",\"FA\":\"داشته اید.\"},\"NEWVERSION\":{\"EN\":\"new version\",\"FA\":\"نسخه جدید\"},\"GAMEISRUN\":{\"EN\":\"you are plying game\",\"FA\":\"تا پایان مسابقه نمی توانید درخواست حریف بدهید.\"},\"MAXCONCURRENTREQUEST\":{\"EN\":\"request result to : \",\"FA\":\"حداکثر درخواست همزمان $VAR نفر میباشد\"},\"SHAREGAMEMESSAGE\":{\"EN\":\"hi,visit this link,$VAR\",\"FA\":\"از این بازی خیلی خوشم اومده! نصبش کن بیا بازی کنیم. منتظرتم.$VAR\"},\"SHARELEAGUEMESSAGE\":{\"EN\":\"hi,visit this link,$VAR\",\"FA\":\" این لیگ خیلی باحاله , یه نیگاه بهش بنداز\n$VAR\"},\"WAITFORPREVIOUSREQUEST\":{\"EN\":\"wait for previous request\",\"FA\":\"منتظر نتیجه درخواست قبلی بمانید\"},\"CAN_ACCEPT_MATCH_REQUEST_AFTER_MATCH\":{\"EN\":\"you can accept request after match\",\"FA\":\"بعداز مسابقه می توانید درخواست جدید را بپذیرید\"},\"CANTNOTREQUESTINPLAING\":{\"EN\":\"wait for previous request\",\"FA\":\"درخواست جدید در حین بازی مجاز نمی باشد\"},\"NOTOPPONENTFIND\":{\"EN\":\"not opponent find\",\"FA\":\"حریفی پیدا نشد\"},\"ADDMIN1PHONENUMBER\":{\"EN\":\"pleas add minimum one number\",\"FA\":\"حداقل یک شماره تماس را وارد نمایید\"},\"ERRORINPROCESS\":{\"EN\":\"error in operation\",\"FA\":\"خطایی در اجرای درخواست شما رخ داد\"},\"MATCHSTART\":{\"EN\":\"match started.\",\"FA\":\"شروع مسابقه\"},\"MATCHSTARTMESSAGE\":{\"EN\":\"your match started.\",\"FA\":\"مسابقه شما با $VAR شروع شده است\"},\"DOWNLOADINGNEWVERSION\":{\"EN\":\"downloading .\",\"FA\":\"در حال دریافت نسخه جدید \"}}";
    private String lang = "FA";
    private String appId = "GC_ANDROID";
    private String deviceId = null;
    /**
     * @deprecated
     * */
    public static String VERSION = "0.1.6";
    private int type = 2;
    private Network network;
    private JSONObject userData = new JSONObject();
    private JSONObject loginData;
    private JSONObject games = new JSONObject();
    private JSONObject dic;
    private HashMap<String, HashMap> eventCallback = new HashMap<String, HashMap>();
    private HashMap<String, MultiPlayer> activeMatch = new HashMap<String, MultiPlayer>();
    private HashMap<String, Boolean> gameCenterMessagesId = new HashMap<String, Boolean>();
    private HashMap<String, Boolean> currentRequestMatch = new HashMap<String, Boolean>();
    private HashMap<String, HashMap> activeMatchRequest = new HashMap<String, HashMap>();
    private HashMap<String, String> requestIdLeague = new HashMap<String, String>();
    private HashMap<String, MultiPlayer> activeMatches = new HashMap<String, MultiPlayer>();
    private HashMap quickMatchData = new HashMap();
    private Context context;
    private boolean isMultiTab = true;
    private boolean isCheckLoginActionWithPeer = false;
    private boolean autoMatchRequestAccept = false;
//    private ChatService chatService;
    private boolean chatServiceEnable = false;
    private Database database;
    private String dbName = "TIS_SERVICE";
//    private JSONObject encryptHandshakeData;
    private EncryptHandshakeData encryptHandshakeData = new EncryptHandshakeData();

    private int currentMatchRequestCount = 0;


    private boolean syncPeerWithToken = false;
    private boolean syncTokenWithPeer = false;
    private boolean peerAndTokenSync = false;

    private boolean isReady = false;

    private Integer tokenIssuer = null;

    private JSONObject temporaryPeerData = new JSONObject();

    static Logger log = Logger.getLogger(Service.class);

    private static Service service = null;

    /**
     * <div style='width: 100%;text-align: right'>کلاس اصلی برای استفاده از سرویس </div>
     *  <pre>
     *      <code>

     *        JSONObject params = new JSONObject();
     *        try {
     *
     *            JSONObject games = new JSONObject();
     *            JSONObject game = new JSONObject();
     *            game.put("callback", "com.myGame");
     *            games.put(gameId, game);
     *
     *            params.put("context", this.getBaseContext());// android application main activity Context
     *            params.put("version", gameVersion);
     *            params.put("games", games);// not necessary for game center application
     *
     *
     *            final Service tis = new Service(params);
     *
     *        } catch (JSONException e) {
     *            e.printStackTrace();
     *        }
     *      </code>
     *  </pre>
     * @param params
     * <ul>
     *     <li>{Context} context</li>
     * </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public Service(JSONObject params) throws ServiceException {

        if (service !=  null) {
            throw new ServiceException("service is init,get instance of it");
        }

        service = this;

        initialize(params);
    }

    public static Service getInstance(JSONObject params) throws ServiceException {

        if (service == null) {
            new Service(params);
        }

        return service;
    }

    public static Service getInstance() throws ServiceException {

        if (service == null) {
            throw new ServiceException("get instance with parameters");
        }

        return service;
    }

    private void initialize(JSONObject params)  throws ServiceException{
        try {

            temporaryPeerData.put("peerId", null);
            temporaryPeerData.put("lastTime", 0);
            temporaryPeerData.put("deviceId",UUID.randomUUID().toString());
            temporaryPeerData.put("isLoading",false);

            log.info("START_OF_SERVICE_1 " + params);
            this.dic = new JSONObject(confStr);

            if (params.has("deviceId") && !params.isNull("deviceId")) {
                deviceId = params.getString("context");
            } else {
                this.context = (Context) params.get("context");
            }
            if (params.has("serviceMode") && !params.isNull("serviceMode")) {
                String mode = params.getString("serviceMode");
                if (mode.equals(ServiceModeTypes.DEVELOPMODE_LOCAL) || mode.equals(ServiceModeTypes.DEVELOPMODE_ONLINE)) {
                    ConfigData.serviceMode = mode;
                    ConfigData.isLocal = true;
                    ConfigData.init(null);
                }
            } else {
                if (params.has("isLocal") && !params.isNull("isLocal")) {
                    ConfigData.isLocal = params.getBoolean("isLocal");
                    ConfigData.init(null);
                }
            }

            registerGame(params);


            if (params.has("loginData") && !params.isNull("loginData")) {
                loginData  = params.getJSONObject("loginData");
                log.info("loginData -- " + loginData);
            }
            init();
        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    private void init() throws ServiceException {
        log.info("INIT_SERVICE ");
        if (deviceId == null) {
            deviceId = Settings.Secure.getString(context.getContentResolver(), Settings.Secure.ANDROID_ID);
        }

        eventCallback.put("ready", new HashMap<String, EventCallback>());
        eventCallback.put("login", new HashMap<String, EventCallback>());
        eventCallback.put("guestLogin", new HashMap<String, EventCallback>());
        eventCallback.put("logout", new HashMap<String, EventCallback>());
        eventCallback.put("connect", new HashMap<String, EventCallback>());
        eventCallback.put("disconnect", new HashMap<String, EventCallback>());
        eventCallback.put("reconnect", new HashMap<String, EventCallback>());
        eventCallback.put("message", new HashMap<String, EventCallback>());
        eventCallback.put("defaultLeagueSubscribe", new HashMap<String, EventCallback>());

        eventCallback.put("buyPack", new HashMap<String, EventCallback>());
        eventCallback.put("creditChange", new HashMap<String, EventCallback>());
        eventCallback.put("matchRequestResponse", new HashMap<String, EventCallback>());
        eventCallback.put("profileChange", new HashMap<String, EventCallback>());


        eventCallback.put("newMatch", new HashMap<String, EventCallback>());
        eventCallback.put("matchReceiveData", new HashMap<String, EventCallback>());
        eventCallback.put("matchStart", new HashMap<String, EventCallback>());
        eventCallback.put("matchPause", new HashMap<String, EventCallback>());
        eventCallback.put("matchResume", new HashMap<String, EventCallback>());
        eventCallback.put("matchEnd", new HashMap<String, EventCallback>());
        eventCallback.put("matchLeave", new HashMap<String, EventCallback>());
        eventCallback.put("matchRequest", new HashMap<String, EventCallback>());



        HashMap leaguesQuickData = new HashMap();
        quickMatchData.put("leagues", leaguesQuickData);
        quickMatchData.put("requestCount", 0);

        initDatabase(new EventCallback() {
            @Override
            public void onFire(JSONObject params) {
                log.info("Database_Init");
                try {
                    initNetwork();
                    applyConfigData();
                } catch (ServiceException e) {
                    e.printStackTrace();
                }

            }
        });

    }

    private void initDatabase(final EventCallback callback) throws ServiceException {
        log.info("Database_Init_Started");
        try {
            JSONObject params = new JSONObject();
            params.put("name", dbName);
            params.put("version", 1);
            params.put("context", context);
            database = new Database(params, new DBCallback() {
                @Override
                public void onCreate(Database database) {
                    log.info("Database_Init_Started_onCreate_1");
                    try {
                        database.execSQL("CREATE TABLE config(id TEXT PRIMARY KEY,value TEXT)");
                    } catch (ServiceException e) {
                        log.info("Database_Init_Started_onCreate_2");
                        e.printStackTrace();
                    }
                    log.info("Database_Init_Started_onCreate_3");
                }
                @Override
                public void onUpgrade(Database database) {
                    log.info("Database_Init_Started_onUpgrade");
                }
                @Override
                public void onOpen(Database database) {
                    log.info("Database_Init_Started_onOpen_1 " + database);
                    callback.onFire(new JSONObject());
                }
            });
        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    private void initNetwork() throws ServiceException {

        log.info("initNetwork " + appId + " " + deviceId);
//        network = new Network(this, appId + UUID.randomUUID().toString(), deviceId, dic, lang);
        network = new Network(this, appId, deviceId, dic, lang);

        network.on("connect", new EventCallback() {
            @Override
            public void onFire(JSONObject params) {
                log.info("SOCKET_CONNECT " + params);
                try {
                    userData.put("peerId", params.get("peerId").toString());
                } catch (JSONException e) {
                    e.printStackTrace();
                }

                fireEvents("connect",params);
                loginActionWithPeer();
                checkPeerAndSocketSync();

                for (Object key : activeMatch.keySet()) {
                    activeMatch.get(key).onConnect();
                }
            }

        });

        network.on("disconnect", new EventCallback() {
            @Override
            public void onFire(JSONObject params) {
                log.info("SOCKET_DISCONNECT " + params);
                if (userData.has("peerId")) {
                    userData.remove("peerId");
                }
                fireEvents("disconnect",new JSONObject());
                for (Object key : activeMatch.keySet()) {
                    activeMatch.get(key).onDisconnect();
                }

            }
        });

        network.on("reconnect", new EventCallback() {
            @Override
            public void onFire(JSONObject params) {
                log.info("SOCKET_RECONNECT " + params);
                try {
                    userData.put("peerId", params.get("peerId").toString());
                    fireEvents("reconnect",params);
                    for (Object key : activeMatch.keySet()) {
                        activeMatch.get(key).onReconnect();
                    }
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        });

        network.on("message", new EventCallback() {
            @Override
            public void onFire(JSONObject message, AsyncResponse res) {
                handlePushMessageContent(message, res);
                fireEvents("message", message, res);
            }
        });
    }

    private void handlePushMessageContent(JSONObject params, AsyncResponse res) {
        log.info("handlePushMessageContent_1 " + params);
        try {
            JSONObject message = new JSONObject(params.getString("content"));
            String senderMessageId = params.get("senderMessageId").toString();

            int messageType = message.getInt("type");
            JSONObject data = new JSONObject(message.getString("content"));

            if (messageType == PushMessageContentTypes.DATA_PACK) {
                onReceiveDataPackAction(data, res);
            } else {
                if (gameCenterMessagesId.get(senderMessageId) == null) {
                    switch (messageType) {
                        case PushMessageContentTypes.REQUEST_ID_STATE:
                            log.info("REQUEST_ID_STATE " + data);
                            onReceiveRequestIdStateAction(data);
                            break;
                        case PushMessageContentTypes.MATCH_NEW:
                            log.info("MATCH_NEW " + data);
                            onReceiveNewMatchAction(data);
                            break;
                        case PushMessageContentTypes.MATCH_START:
                            log.info("MATCH_START " + data);
                            onReceiveStartMatchAction(data);
                            break;
                        case PushMessageContentTypes.MATCH_RESUME:
                            log.info("MATCH_RESUME " + data);
                            onReceiveResumeMachAction(data, false);
                            break;
                        case PushMessageContentTypes.MATCH_PAUSE:
                            log.info("MATCH_PAUSE " + data);
                            onReceivePauseMatchAction(data);
                            break;
                        case PushMessageContentTypes.MATCH_REQUEST:
                            log.info("MATCH_REQUEST " + data);
                            onReceiveRequestMatchAction(data, false);
                            break;
                        case PushMessageContentTypes.MATCH_RESULT:
                            log.info("MATCH_RESULT " + data);
                            onReceiveMatchResultAction(data);
                            break;
                        case PushMessageContentTypes.MESSAGE:
                            log.info("MESSAGE " + data);
                            onReceiveMessageAction(data);
                            break;
                        case PushMessageContentTypes.MATCH_RECONNECT:
                            log.info("MATCH_RECONNECT " + data);
                            onReceiveResumeMachAction(data, true);
                            break;
                        case PushMessageContentTypes.MATCH_LEAVE:
                            log.info("MATCH_LEAVE " + data);
                            onReceiveLeaveMachAction(data);
                            break;
                    }
                    gameCenterMessagesId.put(senderMessageId, true);
                    res.call();
                } else {
                    res.call();
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void onReceiveDataPackAction(JSONObject params, AsyncResponse res) {
        log.info("onReceiveDataPackAction_0 " + params);
        try {
            MultiPlayer game = activeMatch.get(params.get("matchId").toString());

            if (game != null) {
                game._onReceiveData(params,res);
            } else {
                log.info("onReceiveDataPackAction_1 ");
                res.call();
            }
            fireEvents("matchReceiveData",params);
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    private void onReceiveRequestIdStateAction(JSONObject params) {
        log.info("onReceiveRequestIdStateAction - 0 " + params);
        try {
            String message = "";
            int rejectReasonType = params.getInt("rejectReasonType");
            switch (rejectReasonType) {
                case MatchRequestRejectTypes.USER_NOT_ACCEPT:

                    if (params.has("rejectMessage") && !params.isNull("rejectMessage") && params.getString("rejectMessage").length() > 0) {
                        message = params.getString("rejectMessage");
                    } else {
                        message = MatchRequestRejectTypes.getMessage(MatchRequestRejectTypes.USER_NOT_ACCEPT, null);
                    }
                    break;

                case MatchRequestRejectTypes.APP_NOT_INSTALLED:
                    if (params.has("rejectMessage") && !params.isNull("rejectMessage") && params.getString("rejectMessage").length() > 0) {
                        message = params.getString("rejectMessage");
                    } else {
                        message = MatchRequestRejectTypes.getMessage(MatchRequestRejectTypes.APP_NOT_INSTALLED, null);
                    }
                    break;

                case MatchRequestRejectTypes.USER_VERSION_CONFLICT:
                    if (params.has("rejectMessage") && !params.isNull("rejectMessage") && params.getString("rejectMessage").length() > 0) {
                        message = params.getString("rejectMessage");
                    } else {
                        message = MatchRequestRejectTypes.getMessage(MatchRequestRejectTypes.USER_VERSION_CONFLICT, null);
                    }
                    break;

                case MatchRequestRejectTypes.USER_IS_BUSY:
                    if (params.has("rejectMessage") && !params.isNull("rejectMessage") && params.getString("rejectMessage").length() > 0) {
                        message = params.getString("rejectMessage");
                    } else {
                        message = MatchRequestRejectTypes.getMessage(MatchRequestRejectTypes.USER_IS_BUSY, null);
                    }
                    break;
            }
            log.info("onReceiveRequestIdStateAction - 1 " + message);
            String requestId = params.get("requestId").toString();
            boolean state = params.getBoolean("state");
            JSONObject uiData = new JSONObject();
            uiData.put("requestId", requestId);
            uiData.put("state", state);
            uiData.put("rejectMessage", message);

            String leagueId = params.get("leagueId").toString();

            HashMap leagueData = (HashMap) activeMatchRequest.get(leagueId);
            HashMap requestData = (HashMap) leagueData.get(requestId);
            log.info("onReceiveRequestIdStateAction - 2 " + requestData);
            if (requestData != null) {

                MatchRequestCallback res = (MatchRequestCallback) requestData.get("callback");
                JSONObject data = new JSONObject();
                data.put("requestId", requestId);
                if (state) {
                    res.onAccept(data);
                } else {
                    data.put("rejectMessage", message);
                    res.onReject(data);
                }
                log.info("onReceiveRequestIdStateAction - 3 " + state);
                Util.clearTimeout((String) requestData.get("timeoutId"));
                currentMatchRequestCount -= 1;
                leagueData.remove(requestId);
            }

        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    private void onReceiveNewMatchAction(JSONObject data) {

        try {

            if (!(userData.has("loginState") && userData.getBoolean("loginState"))) {
                return;
            }
            data.put("isMultiPlayer", true);
            newMatch(data);

        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    private void onReceiveStartMatchAction(JSONObject data) {
        try {
            String matchId = data.get("matchId").toString();

            if (activeMatch.get(matchId) != null) {
                activeMatch.get(matchId)._onStart(data);
            }
            fireEvents("matchStart",data);
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    private void onReceiveResumeMachAction(JSONObject data, Boolean isReconnect) {
        try {
            String matchId = data.get("matchId").toString();

            if (activeMatch.get(matchId) != null) {
                activeMatch.get(matchId)._onResume(data);
            }
            fireEvents("matchResume",data);
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    private void onReceivePauseMatchAction(JSONObject data) {
        try {
            String matchId = data.get("matchId").toString();

            if (activeMatch.get(matchId) != null) {
                activeMatch.get(matchId)._onPause(data);
            }
            fireEvents("matchPause",data);
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }


    private JSONObject ExceptionErrorData(Exception e) {
        return Util.ExceptionErrorData(e);
    }

    private void onReceiveRequestMatchAction(final JSONObject data, Boolean isFromNotification) {
        try {
            String requestId = data.get("requestId").toString();
            Boolean isRepeat = currentRequestMatch.get(requestId);
            String gameId = data.get("gameId").toString();
            String leagueId = data.get("gameId").toString();

            if (isRepeat != null || !userData.getBoolean("loginState")) {
                return;
            }
            currentRequestMatch.put(requestId, true);



            JSONObject content = new JSONObject();
            content.put("name", data.getString("name"));
            content.put("opponentId", data.get("opponentId").toString());
            content.put("gameName", data.getString("gameName"));
            content.put("leagueName", data.getString("leagueName"));
            content.put("requestId", requestId);
            content.put("packageName", data.getString("packageName"));
            content.put("version", data.getString("version"));
            content.put("platform", data.get("platform"));
            content.put("gameId", gameId);
            content.put("leagueId", leagueId);


            if (data.has("player1Image") && !data.isNull("player1Image")) {
                JSONObject image = data.getJSONObject("player1Image");
                image.put("id", image.get("id").toString());
                content.put("image", image);
            }

            if (data.has("player1ImageUrl") && !data.isNull("player1ImageUrl")) {
                content.put("imageUrl", data.get("player1ImageUrl"));
            }


            if (games.has(gameId)) {

                if (autoMatchRequestAccept) {
                    JSONObject requestData = new JSONObject();
                    requestData.put("requestId", requestId);
                    matchRequestResponse(requestData, null);
                    return;
                }

                boolean hasMajorConflict = hasMajorConflict(gameId, data.getString("version"));

                if (hasMajorConflict) {
                    JSONObject res = new JSONObject();
                    res.put("requestId", requestId);
                    res.put("rejectReasonType", MatchRequestRejectTypes.USER_VERSION_CONFLICT);
                    matchRequestResponse(res, null);
                    JSONObject gameData = games.getJSONObject(gameId);
                    if (gameData.has("info") && !gameData.isNull("info")) {
                        JSONObject info = gameData.getJSONObject("info");
                        info.put("lastVersion", data.getString("version"));
                    }
                    majorConflictAction();
                } else {
                    if (isMultiTab) {
                        fireEvents("matchRequest", content);
                    } else {
                        if (!isGameRun()) {
                            fireEvents("matchRequest", content);
                        }
                    }
                }
            } else {
                fireEvents("matchRequest", content);
            }

        } catch (JSONException e) {
            e.printStackTrace();
        }catch (ServiceException e) {
            e.printStackTrace();
        }
    }

    private boolean hasMajorConflict(String gameId, String version) {

        try {
            if (ConfigData.cmc) {
                log.info("hasMajorConflict " + gameId + " " + games.getJSONObject(gameId).getString("version") + " " + version);
                return Util.hasMajorConflict(games.getJSONObject(gameId).getString("version"), version);
            }
            return false;
        } catch (JSONException e) {
            e.printStackTrace();
            return false;
        }

    }

    private void onReceiveMatchResultAction(JSONObject data) {

        try {
            String matchId = data.get("matchId").toString();

            if (activeMatch.get(matchId) != null) {
                activeMatch.get(matchId)._onEnd(data);
            }
            fireEvents("matchEnd",data);
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    private void onReceiveMessageAction(JSONObject params) throws ServiceException{

        try {

            int type = params.getInt("type");
            JSONObject data = new JSONObject(params.getString("content"));

            switch (type) {
                case 1 :

                    JSONObject reqData = new JSONObject();
                    JSONObject content = new JSONObject();

                    content.put("title", data.getString("title"));
                    content.put("message", data.getString("msg"));
                    if (data.has("to") && !data.isNull("to")) {
                        content.put("timeout", data.get("to"));
                    }

                    if (data.has("imgLink") && !data.isNull("imgLink")) {
                        content.put("icon", data.get("imgLink"));
                    }

                    if (data.has("oAction") && !data.isNull("oAction")) {
                        content.put("operationAction", data.get("oAction"));
                    }
                    if (data.has("oContent") && !data.isNull("oContent")) {
                        content.put("operationContent", data.get("oContent"));
                    }
                    if (data.has("owc") && !data.isNull("owc")) {
                        content.put("webOperationContent", data.get("owc"));
                    }

//                    reqData.put("type",UIMessageTypes.NOTIFICATION);
//                    reqData.put("content",content);

                    fireEvents("message",content);

                    break;
                default:
                    log.info("onReceiveMessageAction_ " + "NOT SUPPORTED MESSAGE");
            }
        } catch (Exception e) {
            throw new ServiceException(e);
        }
    }

    private void onReceiveLeaveMachAction(JSONObject data) {
        try {
            String matchId = data.get("matchId").toString();

            if (activeMatch.get(matchId) != null) {
                activeMatch.get(matchId)._onLeave(data);
            }
            fireEvents("matchLeave",data);
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    private JSONObject reformatMultiPlayerMatchData(JSONObject matchData) {
        JSONObject data = new JSONObject();

        try {

            JSONObject ownData = new JSONObject();
            ownData.put("id", matchData.get("id").toString());
            ownData.put("name", matchData.getString("name"));
            ownData.put("applicant",matchData.getBoolean("applicant"));

            if (matchData.has("image") && !matchData.isNull("image")) {
                JSONObject image = matchData.getJSONObject("image");
                image.put("id", image.get("id").toString());
                ownData.put("image", image);
            }

            if (matchData.has("imageUrl") && !matchData.isNull("imageUrl")) {
                ownData.put("imageUrl", matchData.get("imageUrl"));
            }

            JSONObject opponent = matchData.getJSONObject("opponentData");
            JSONObject opponentData = new JSONObject();
            opponentData.put("id", opponent.get("id").toString());
            opponentData.put("name", opponent.getString("name"));
            opponentData.put("applicant",!matchData.getBoolean("applicant"));
            opponentData.put("peerId",opponent.get("sessionId").toString());

            if (opponent.has("image") && !opponent.isNull("image")) {
                JSONObject image = opponent.getJSONObject("image");
                image.put("id", image.get("id").toString());
                opponentData.put("image", image);
            }

            if (opponent.has("imageUrl") && !opponent.isNull("imageUrl")) {
                opponentData.put("imageUrl", opponent.get("imageUrl"));
            }

            data.put("matchId", matchData.get("matchId").toString());
            data.put("gameId", matchData.get("gameId").toString());
            data.put("leagueId", matchData.get("leagueId").toString());
            data.put("isQuick", matchData.getBoolean("isQuick"));
            data.put("isReload", false);
            data.put("leagueName", matchData.getString("leagueName"));
            data.put("gameName", matchData.getString("gameName"));
            data.put("platform", matchData.get("platform"));
            data.put("packageName", matchData.getString("packageName"));
            data.put("ownData", ownData);

            JSONArray opponents = new JSONArray();
            opponents.put(opponentData);
            data.put("opponentsData", opponents);
            data.put("isMultiPlayer", matchData.getBoolean("isMultiPlayer"));

            if (matchData.has("config") && !matchData.isNull("config")) {
                JSONObject cfg = new JSONObject(matchData.getString("config"));
                data.put("config", cfg);
            }

            if (matchData.has("webUrl") && !matchData.isNull("webUrl")) {
                data.put("webUrl", matchData.get("webUrl"));
            }

        } catch (JSONException e) {
            e.printStackTrace();
        }

        return data;
    }

    private void newMatch(JSONObject matchData) {
        log.info("newMatch_1 " + matchData);
        try {
            Boolean isMultiPlayer = matchData.getBoolean("isMultiPlayer");

            String gameId = matchData.get("gameId").toString();

            if (isMultiPlayer) {
                boolean hasGameCallback = true;
                JSONObject gameObject = null;
                String callback = null;
                if (games.has(gameId) && !games.isNull(gameId)) {
                    gameObject = games.getJSONObject(gameId);

                }
                if (gameObject != null && gameObject.has("callback") && !gameObject.isNull("callback")) {
                    callback = gameObject.getString("callback");
                }

                MultiPlayer game = null;
                JSONObject mData = reformatMultiPlayerMatchData(matchData);
                if(callback != null) {
                    game = (MultiPlayer) Class.forName(callback).newInstance();
                } else {
                    hasGameCallback = false;
                    game = new MultiPlayer() {
                        @Override
                        public void onReceiveData(JSONObject receivedData ,AsyncResponse asyncCallback) {
                            asyncCallback.call();
                        }

                        @Override
                        public void onConnect() {

                        }

                        @Override
                        public void onReconnect() {

                        }

                        @Override
                        public void onDisconnect() {

                        }

                        @Override
                        public void onLeave(JSONObject params) {

                        }

                        @Override
                        public void onInit(JSONObject params) {

                        }

                        @Override
                        public void onStart() {

                        }

                        @Override
                        public void onPause() {

                        }

                        @Override
                        public void onResume() {

                        }

                        @Override
                        public void onEnd(JSONObject params) {

                        }

                        @Override
                        public void onReceiveDataAck(JSONObject params) {

                        }

                        @Override
                        public void onSentData(JSONObject params) {

                        }
                    };
                }
                game.initialize(this, network, mData);
                String matchId = matchData.get("matchId").toString();
                String leagueId = matchData.get("leagueId").toString();
                String requestId = matchData.has("requestId") ? matchData.get("requestId").toString() : null;

                HashMap leagueData = (HashMap) activeMatchRequest.get(leagueId);
                if (leagueData != null) {
                    HashMap requestData = (HashMap) leagueData.get(requestId);
                    if (requestData != null) {

                        MatchRequestCallback res = (MatchRequestCallback) requestData.get("callback");
                        JSONObject data = new JSONObject();
                        data.put("requestId", requestId);
                        res.onAccept(data);
                        currentMatchRequestCount -= 1;
                        Util.clearTimeout((String) requestData.get("timeoutId"));
                        leagueData.remove(requestId);
                    }
                }

                if (matchData.has("isQuick") && !matchData.isNull("isQuick") && matchData.getBoolean("isQuick")) {
                    HashMap leaguesQuickData = (HashMap) quickMatchData.get("leagues");
                    final HashMap quickData = (HashMap) leaguesQuickData.get(leagueId);
                    if (quickData != null && (Boolean) quickData.get("state")) {
                        quickData.put("state", false);
                        quickMatchData.put("requestCount", (Integer) quickMatchData.get("requestCount") - 1);
                        quickMatchData.put("lastLeagueId", null);
                        QuickMatchRequestCallback res = (QuickMatchRequestCallback) quickData.get("callback");
                        JSONObject quickRet = new JSONObject();
                        quickRet.put("leagueId", leagueId);
                        res.onAccept(quickRet);


                        String timeoutId = (String) quickData.get("timeoutId");
                        if (timeoutId != null) {
                            Util.clearTimeout(timeoutId);
                            quickData.put("timeoutId", null);
                        }
                    }

                }

                if (game != null) {
                    activeMatch.put(matchId, game);
                }

                if (!hasGameCallback) {
                    fireEvents("newMatch",mData);
                }

            } else {
//                players = new JSONObject();
//                players.put("player1", player1Data);
            }

        }
        catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void getConfigFromDB(final RequestCallback callback){

        try {
//            Cursor cursor = null;
//
//            cursor = database.rawQuery("SELECT value FROM config WHERE id= ?", new String[]{"SERVER_CONFIG"});
//
//            cursor.moveToFirst();
//            String config = null;
//            if (cursor.getCount() > 0) {
//                config = cursor.getString(cursor.getColumnIndex("value"));
//            }
//            JSONObject data = new JSONObject();
//            data.put("config", config);
//            callback.onResult(data);

            final JSONObject reqData = new JSONObject();
            reqData.put("tableName", "config");
            JSONObject where = new JSONObject();
            where.put("id", "SERVER_CONFIG");
            reqData.put("where", where);
            log.info("getConfigFromDB_1 " + reqData);

            database.find(reqData, new RequestCallback() {
                @Override
                public void onResult(JSONObject result){
                    try {
                        log.info("getConfigFromDB_2 " + result);
                        String config = null;
                        boolean hasError = result.getBoolean("hasError");
                        if (!hasError) {
                            JSONArray configs = result.getJSONArray("result");
                            if (configs.length() > 0) {
                                JSONObject conf = configs.getJSONObject(0);
                                config = conf.getString("value");
                            }
                        }

                        JSONObject data = new JSONObject();
                        if (config != null) {
                            data.put("config", new JSONObject(config));
                        } else {
                            data.put("config", null);
                        }

                        callback.onResult(data);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            });

        } catch (Exception e) {
            e.printStackTrace();
        }
    }


    private void getConfigFromServer(final RequestCallback callback){
        log.info("getConfigFromServer");
        JSONObject requestData = new JSONObject();
        try {
            requestData.put("url", ConfigData.configUrl);
            requestData.put("data", new JSONObject());

            JSONObject headers = new JSONObject();
            headers.put("Content-Type", "application/json; charset=utf-8");
            requestData.put("headers", headers);

        } catch (JSONException e) {
            e.printStackTrace();
        }
        network.postRequest(requestData, new Network.HttpRequestCallback() {
            @Override
            public void onResult(JSONObject res)  {

                JSONObject returnData = res;
                try {
                    if (!res.getBoolean("HasError")) {
                        returnData = new JSONObject(res.getString("Result"));
                    }
                } catch (Exception e) {
                   e.printStackTrace();

                }
                callback.onResult(returnData);
            }

        });
    }

    private void applyConfigData() {
        if (ConfigData.serviceMode.equals(ServiceModeTypes.DEVELOPMODE_LOCAL)) {
            ConfigData.init(null);
            readyService();
        } else {

            getConfigFromServer(new RequestCallback() {
                @Override
                public void onResult(JSONObject res)  {
                    try {

                        if (!res.getBoolean("HasError")) {
                            JSONObject result = res.getJSONObject("Result");

                            ConfigData.init(result);
                            readyService();

                        } else {

                            Util.setTimeout(new Util.SetTimeoutCallback() {
                                @Override
                                public void onDone() {
                                    applyConfigData();
                                }
                            }, 1000);

                        }
//
//                        if (!res.getBoolean("HasError")) {
//                            JSONObject result = res.getJSONObject("Result");
//
//                            ConfigData.init(result);
//                            readyService();
//
//
//                            final JSONObject reqData = new JSONObject();
//                            reqData.put("tableName", "config");
//                            JSONObject data = new JSONObject();
//                            data.put("id", "\"SERVER_CONFIG\"");
//                            data.put("value", "'" + ConfigData.serialize() + "'");
//                            reqData.put("data", data);
//
//                            database.insert(reqData, new RequestCallback() {
//                                @Override
//                                public void onResult(JSONObject result){
//                                    log.info("INSERT_CONFIG_TO_DB " + result);
//                                }
//                            });
//
//                        } else {
//
//                           getConfigFromDB(new RequestCallback() {
//                                @Override
//                                public void onResult(JSONObject result) {
//                                    try {
//                                        JSONObject config = result.getJSONObject("config");
//                                        if (config != null) {
//                                            ConfigData.initWithDBConfig(config);
//                                            readyService();
//                                        } else {
//                                            Util.setTimeout(new Util.SetTimeoutCallback() {
//                                                @Override
//                                                public void onDone() {
//                                                    applyConfigData();
//                                                }
//
//                                            }, ConfigData.smit);
//                                        }
//                                    } catch (Exception e) {
//                                        e.printStackTrace();
//                                    }
//
//                                }
//                            });
//
//
//
//                        }

                    } catch (Exception e) {
                        e.printStackTrace();
//                        getConfigFromDB(new RequestCallback() {
//                            @Override
//                            public void onResult(JSONObject result) {
//                                try {
//                                    JSONObject config = result.getJSONObject("config");
//                                    if (config != null) {
//                                        ConfigData.init(config);
//                                        readyService();
//                                    } else {
//                                        Util.setTimeout(new Util.SetTimeoutCallback() {
//                                            @Override
//                                            public void onDone() {
//                                                applyConfigData();
//                                            }
//
//                                        }, ConfigData.smit);
//                                    }
//                                } catch (Exception ex) {
//                                    ex.printStackTrace();
//                                }
//                            }
//                        });

                    }

                }
            });

        }


    }

    private void readyService() {

        try {
            network.init(false);

            JSONObject params = new JSONObject();
//            params.put("appId", appId + UUID.randomUUID().toString());
            params.put("appId", appId);
            params.put("deviceId", deviceId);
            params.put("dic", dic);
            params.put("lang", lang);
            params.put("service", this);

//            if (chatServiceEnable) {
//                chatService = new ChatService(params);
//            }


            this.isReady = true;
            JSONObject readyData = new JSONObject();
            readyData.put("config", getConfig());
            fireEvents("ready",readyData);
            log.info("readyService");
            if (    loginData != null &&
                    loginData.has("token") && !loginData.isNull("token") &&
                    loginData.has("id") && !loginData.isNull("id") &&
                    loginData.has("name") && !loginData.isNull("name")) {

                boolean guest = false;

                JSONObject image = null;
                String imageUrl = null;
                Integer tokenIssuer = null;

                if (loginData.has("image") && !loginData.isNull("image")) {
                    image = loginData.getJSONObject("image");
                }

                if (loginData.has("imageUrl") && !loginData.isNull("imageUrl")) {
                    imageUrl = loginData.getString("imageUrl");
                }

                if (loginData.has("tokenIssuer") && !loginData.isNull("tokenIssuer")) {
                    tokenIssuer = loginData.getInt("tokenIssuer");
                }

                if (loginData.has("guest") && !loginData.isNull("guest")) {
                    guest = loginData.getBoolean("guest");
                }

                JSONObject uData = new JSONObject();
                userData.put("id", loginData.get("id").toString());
                userData.put("name", loginData.getString("name"));
                userData.put("image", image);
                userData.put("imageUrl", imageUrl);
                userData.put("token", loginData.getString("token"));
                userData.put("tokenIssuer", tokenIssuer);
                userData.put("guest", guest);

                loginAction(uData);
//                loginAction(loginData.get("id").toString(),loginData.getString("name"),loginData.getString("token"),image,guest,tokenIssuer);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void handleChatMessage(JSONObject pushMessageVO, Boolean isGCThread) {

    }

    private void getThreadNotSeenHistory(JSONObject params) {

    }

    protected void request(RequestUrls.UrlData url, JSONObject data, Network.HttpRequestCallback res) {
        try {
            request(url,data,res,null);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    protected void request(final RequestUrls.UrlData urlData, JSONObject data, final Network.HttpRequestCallback res, JSONObject setting) throws Exception {

        if (urlData.encrypt && ConfigData.ure) {
            encryptRequest(urlData, data, res, setting);
        } else {
            requestHandler(urlData, data, res, setting);
        }

    }

    protected void requestHandler(RequestUrls.UrlData urlData, JSONObject data, final Network.HttpRequestCallback res, JSONObject setting) throws Exception{
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
            RequestUrls.UrlData newUrlData = urlData.copy();

            if (newUrlData.encrypt && ConfigData.ure) {
                newUrlData.uri = newUrlData.uri.replace("/srv", "/srv/enc");
            }

            if (ConfigData.har) {
                asyncRequest(newUrlData, data, res, setting);
                return;
            } else {
                url = ConfigData.gca + uri;
            }
        } else {
            url = ConfigData.opsa + uri;
        }


        if (data.has("token") && !data.isNull("token") &&
                data.has("tokenIssuer") && !data.isNull("tokenIssuer")) {
            try {
                data.put("_token", data.get("token"));
                data.put("_token_issuer", data.get("tokenIssuer"));
                data.remove("token");
                data.remove("tokenIssuer");
            } catch (JSONException e) {
                e.printStackTrace();
            }
        } else if (userData.has("token")) {
            try {
                data.put("_token", userData.getString("token"));
                data.put("_token_issuer", userData.get("tokenIssuer"));
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

        JSONObject requestData = new JSONObject();

        if (urlData.encrypt  && ConfigData.ure) {
            url = url.replace("/srv", "/srv/enc");
        }
        try {

            requestData.put("url", url);
            requestData.put("data", data);

        } catch (JSONException e) {
            e.printStackTrace();
        }

        network.postRequest(requestData,new Network.HttpRequestCallback(){
            @Override
            public void onResult(JSONObject resData) {

                JSONObject returnData = resData;
                try {
                    if (!resData.getBoolean("HasError")) {
                        returnData = new JSONObject(resData.getString("Result"));
                    }
                } catch (Exception e) {
                    e.printStackTrace();

                }
                res.onResult(returnData);
            }
        });
    }
//    protected void request(String url, JSONObject data, Network.HttpRequestCallback res) {
//
//
//        if (userData.has("token")) {
//            try {
//                data.put("_token", userData.getString("token"));
//                data.put("_token_issuer", userData.get("tokenIssuer"));
//            } catch (JSONException e) {
//                e.printStackTrace();
//            }
//        }
//
//        JSONObject requestData = new JSONObject();
//        try {
//
//            requestData.put("url", url);
//            requestData.put("data", data);
//
//        } catch (JSONException e) {
//            e.printStackTrace();
//        }
//        network.postRequest(requestData,res);
//    }
//

    protected void getPeerIdFromHttpRequest(final RequestCallback callback) throws Exception {

        final Date currentTime = new Date();

        if ((userData.has("peerId") && !userData.isNull("peerId")) ||
            (temporaryPeerData.has("peerId") &&
                !temporaryPeerData.isNull("peerId") &&
                (currentTime.getTime() - new Date(temporaryPeerData.getString("lastTime")).getTime())<ConfigData.pt)) {

            String peerId;

            if (userData.has("peerId") && !userData.isNull("peerId")) {
                peerId = userData.getString("peerId");
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

                temporaryPeerData.put("isLoading", true);

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

//        getPeerIdFromHttpRequest(new RequestCallback() {
//            @Override
//            public void onResult(JSONObject result) {
//
//            }
//        });

        try {
//            String peerId = result.getString("peerId");
            String uri;

            if (urlData.uri != null) {
                uri = urlData.uri;
            } else {
                uri = setting.getString("uri");
            }

            JSONArray parameters = new JSONArray();
            JSONArray keys = data.names();

            if (keys != null) {
                for (int i = 0; i < keys.length(); i++) {

                    JSONObject paramData = new JSONObject();
                    String keyName = keys.getString(i);


                    paramData.put("name", keyName);
                    paramData.put("value", data.get(keyName));

                    parameters.put(paramData);
                }
            }

            boolean canFromSocket = true;// some request same as device register and server register can not


            if(setting != null){

                if (setting.has("parameters") && !setting.isNull("parameters")) {
                    JSONArray params = setting.getJSONArray("parameters");

                    for (int i = 0; i < params.length(); i++) {
                        parameters.put(params.get(i));
                    }
                }

                if (setting.has("fromSocket") && !setting.isNull("fromSocket")) {
                    canFromSocket = setting.getBoolean("fromSocket");
                }
            }

            JSONObject asyncData = new JSONObject();
            JSONObject messageVO = new JSONObject();
            JSONObject gcParamData = new JSONObject();

            final String clientMessageId = UUID.randomUUID().toString() + "_" + appId;

            gcParamData.put("remoteAddr", null);
            gcParamData.put("clientMessageId", clientMessageId);
            gcParamData.put("serverKey", 0);
            gcParamData.put("oneTimeToken", null);
            gcParamData.put("parameters", parameters);
            gcParamData.put("msgType", 3);
            gcParamData.put("uri", uri);

            if (data.has("token") && !data.isNull("token") &&
                    data.has("tokenIssuer") && !data.isNull("tokenIssuer")) {

                gcParamData.put("token", data.get("token"));
                gcParamData.put("tokenIssuer", data.get("tokenIssuer"));

            }
            else if (userData.has("token") && !userData.isNull("token")) {
                gcParamData.put("token", userData.get("token"));
                gcParamData.put("tokenIssuer", userData.get("tokenIssuer"));
            }

            gcParamData.put("messageId", 1001);
            gcParamData.put("expireTime", 0);

            messageVO.put("content", gcParamData.toString());
            messageVO.put("messageId", 1001);
            messageVO.put("priority", "1");
            messageVO.put("peerName", ConfigData.ahrrn);
//                    messageVO.put("ttl", ConfigData.hrt);
            messageVO.put("ttl", 0);

            asyncData.put("content", messageVO.toString());
//                    asyncData.put("trackerId", 1001);

            asyncData.put("type", 3);


            if (ConfigData.harfs && network.isSocketOpen() && canFromSocket) {
                asyncData.put("type", 5);
                asyncData.put("timeout", ConfigData.hrt);

                log.info("REQUEST_SEND " + clientMessageId + " " +asyncData.toString());
                network.emit(asyncData, new RequestCallback() {
                    @Override
                    public void onResult(JSONObject result) {
                        log.info("REQUEST_RESPONSE "  + clientMessageId + " " + result.toString());
                        if (res != null) {
                            res.onResult(result);
                        }
                    }
                });
            } else {
                JSONObject set = setting;
                if (set == null) {set = new JSONObject();}

                JSONObject headers = new JSONObject();
                headers.put("content-type", "application/x-www-form-urlencoded");
                set.put("headers", headers);

                final String url = ConfigData.aha + "/srv";
                set.put("method", "POST");
                String pData = "data=" + Uri.encode(asyncData.toString()) ;

//                pData += ("&peerId=" + peerId);

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

                        }
                        catch (Exception e){
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
            }




        }catch (Exception e){
            e.printStackTrace();
        }
    }

    protected void httpRequest(String url,Object data,Network.HttpRequestCallback res,JSONObject setting) throws Exception{
        log.info("service_httpRequest " + setting);
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

        if(setting.has("headers") && !setting.isNull("headers")){
            requestData.put("headers", setting.get("headers"));
        }

        network.httpRequest(requestData,res);
    }

    protected void encryptRequest(final RequestUrls.UrlData url, final JSONObject data, final Network.HttpRequestCallback res, final JSONObject setting){
        try {
            this.encryptData(data, new RequestCallback() {
                @Override
                public void onResult(JSONObject result) {
                    try {
                        if (result.getBoolean("hasError")) {
                            JSONObject retData = new JSONObject();
                            retData.put("HasError", true);
                            retData.put("ErrorMessage", result.get("errorMessage"));
                            retData.put("ErrorCode", result.get("errorCode"));
                            res.onResult(retData);
                        } else {
                            requestHandler(url, result.getJSONObject("result"),res,setting);
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            });
        }catch (Exception e){
            e.printStackTrace();
        }

    }

    private void encryptData(JSONObject data, final RequestCallback callback) throws ServiceException{
        try {
            data.put("timestamp", new Date().getTime());
            final JSONArray reqData = new JSONArray();
            JSONArray keys = data.names();

            for (int i = 0; i < keys.length(); i++) {
                JSONObject dataOBJ = new JSONObject();
                dataOBJ.put("name", keys.getString(i));

                try {
                    dataOBJ.put("value", data.getString(keys.getString(i)));
                } catch (Exception e){
                    dataOBJ.put("value", data.get(keys.getString(i)));
                }

                reqData.put(dataOBJ);
            }

            encryptHandshake(new RequestCallback() {
                @Override
                public void onResult(JSONObject result) {
                    try {
                        if (result.getBoolean("hasError")) {
                            callback.onResult(result);
                        } else {
                            JSONObject encryptData = result.getJSONObject("result");
                            String algorithm = encryptData.getString("algorithm");
                            String key = encryptData.getString("secretKey");
                            String iv = encryptData.getString("initializationVector");

                            String strData = reqData.toString();

                            String hash = Util.MD5(strData).toUpperCase();
                            String plusData = hash + ConfigData.ehd + strData;

                            String encrypt;

                            switch (algorithm) {
                                case  "AES" :
                                    encrypt = Util.AESEncrypt(plusData, key, iv);
                                    break;

                                case "DES" :
                                    encrypt = Util.DESEncrypt(plusData, key, iv);
                                    break;

                                default :
                                    encrypt = "";
                            }

                            JSONObject encRes = new JSONObject();
                            encRes.put("data", encrypt);
                            encRes.put("h", hash);
                            encRes.put("clientId", appId);

                            callback.onResult(Util.createReturnData(false, "", 0, encRes));

                        }
                    }catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            });

        } catch (Exception e) {

        }
    }

    private void encryptHandshake(final RequestCallback callback) throws ServiceException {
        try {
            if (
                    encryptHandshakeData.encryptData != null && encryptHandshakeData.updateTime != null &&
                            (new Date().getTime() - encryptHandshakeData.updateTime.getTime() < ConfigData.ehet)
                    ) {

                callback.onResult(Util.createReturnData(false, "", 0, encryptHandshakeData.getEncryptData()));
            } else {

                if (encryptHandshakeData.updating) {
                    encryptHandshakeData.addCallbackQueue(callback);
                    encryptHandshakeData.updating = true;
                    return;
                }

                JSONObject param = new JSONObject();
                param.put("clientId", appId);

                request(RequestUrls.ENCRYPT_HAND_SHAKE, param, new Network.HttpRequestCallback() {
                    @Override
                    public void onResult(JSONObject result){
                        JSONObject returnData = null;
                        try {
                            if (result.getBoolean("HasError")) {
                                returnData = Util.createReturnData(true, result.getString("ErrorMessage"), result.getInt("ErrorCode"), new JSONObject());

                            } else {
                                JSONObject encResult = result.getJSONObject("Result");

                                encryptHandshakeData.setEncryptData(encResult.get("IV").toString(), encResult.get("Alg").toString(), encResult.get("SecretKey").toString());
                                returnData = Util.createReturnData(false, "", 0, encryptHandshakeData.getEncryptData());
                            }

                            callback.onResult(returnData);

                            encryptHandshakeData.excuteQueue(returnData);
                            encryptHandshakeData.updating = false;
                        } catch (Exception e) {
                            e.printStackTrace();
                        }


                    }
                });
            }
        } catch (Exception e) {
            throw new ServiceException(e);
        }

    }

    private void setEncryptHandshakeData(){

    }

    protected void ObjectPoolRequest(JSONObject params, Network.HttpRequestCallback res) throws ServiceException{
        try {
            if (userData.has("token")) {
                params.getJSONObject("data").put("_token", userData.getString("token"));
            }

            network.postRequest(params, res);
        } catch (Exception e) {
            throw new ServiceException(e);
        }

    }

    private void majorConflictAction() {

    }

    private void loginActionWithPeer() {

        try {
            log.info(
                    "loginActionWithPeer_0 " + isCheckLoginActionWithPeer + " " +
                            userData.has("peerId") + " " +
                            (userData.has("loginState") && userData.getBoolean("loginState")));

            if (!isCheckLoginActionWithPeer && userData.has("peerId") && (userData.has("loginState") && userData.getBoolean("loginState"))) {
                log.info("loginActionWithPeer_1 ");
                network.onLogin(userData);

                isCheckLoginActionWithPeer = true;
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    private void registerGame(JSONObject params) {
        log.info("registerGame -- 1");
        try {

            JSONObject gamesParams = (params.has("games") && !params.isNull("games")) ? params.getJSONObject("games") : null;

            if (gamesParams != null) {
                JSONArray gamesId = gamesParams.names();
                for (int i = 0; i < gamesId.length(); i++) {
                    String gameId = gamesId.getString(i);

                    JSONObject gameParams = gamesParams.getJSONObject(gameId);
                    JSONObject setting;
                    JSONObject info;

                    if (!gameParams.has("info") || gameParams.isNull("info")) {
                        info = new JSONObject();
                        info.put("name", dic.getJSONObject("GAME").getString(lang));
                        gameParams.put("info", info);
                    } else {
                        info = gameParams.getJSONObject("info");
                        if (!info.has("name") || info.isNull("name")) {
                            info.put("name", dic.getJSONObject("GAME").getString(lang));
                        }
                    }

                    if (!gameParams.has("setting") || gameParams.isNull("setting")) {
                        setting = new JSONObject();
                        gameParams.put("setting", setting);
                    } else {
                        setting = gameParams.getJSONObject("setting");
                    }


                    JSONObject gameData = new JSONObject();
                    gameData.put("info", info);
                    gameData.put("setting", setting);
                    gameData.put("isRun", false);
                    gameData.put("version", params.getString("version"));

                    if (gameParams.has("callback") && !gameParams.isNull("callback")) {
                        gameData.put("callback", gameParams.get("callback"));
                    }

                    games.put(gameId, gameData);

                    log.info("registerGame " + gameId);
                    this.appId = gameId;
                    this.type = 3;
                }
            }

        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

//    private void fireEvents(String categoryName) {
//        HashMap events = eventCallback.get(categoryName);
//        if (events != null) {
//            for (Object key : events.keySet()) {
//                EventCallback event = (EventCallback) events.get(key);
//                event.onFire();
//            }
//        }
//    }

    private void fireEvents(String categoryName, JSONObject msg) {
        HashMap events = eventCallback.get(categoryName);
        if (events != null) {
            for (Object key : events.keySet()) {
                EventCallback event = (EventCallback) events.get(key);
                event.onFire(msg);
            }
        }
    }

    private void fireEvents(String categoryName, JSONObject msg, AsyncResponse res) {
        HashMap events = eventCallback.get(categoryName);
        if (events != null) {
            for (Object key : events.keySet()) {
                EventCallback event = (EventCallback) events.get(key);
                event.onFire(msg, res);
            }
        }
    }

    private boolean isCellphoneNumber(String number) {

        if (number.matches("^09[\\d]{9}$") && number.length() == 11) {
            return true;
        }
        return false;
    }

    private void getOnlineUser(final JSONObject requestData, final Integer imageWidth, final Integer imageHeight, final RequestCallback res) {

        request(RequestUrls.ONLINE_USER, requestData, new Network.HttpRequestCallback() {
            @Override
            public void onResult(JSONObject result) {

                try {
                    JSONObject resData = new JSONObject();
                    boolean hasError = result.getBoolean("HasError");
                    resData.put("hasError", hasError);
                    if (hasError) {
                        resData.put("errorMessage", result.getString("ErrorMessage"));
                        resData.put("errorCode", result.getString("ErrorCode"));
                        res.onResult(resData);
                    } else {

                        JSONObject innerRes = result.getJSONObject("Result");
                        JSONArray users = innerRes.getJSONArray("users");
                        JSONObject usr = new JSONObject();

                        for (int i = 0; i < users.length(); i++) {
                            JSONObject user = users.getJSONObject(i);
                            String userId = user.get("UserID").toString();
                            JSONObject userData = new JSONObject();
                            userData.put("name", user.getString("Name"));

                            if (user.has("Image") && !user.isNull("Image")) {
                                JSONObject image = user.getJSONObject("Image");
                                image.put("id", image.get("id").toString());
                                userData.put("image", image);
                            }


                            if (user.has("ProfileImage") && !user.isNull("ProfileImage")) {
                                userData.put("imageUrl", user.get("ProfileImage"));
                            }


                            usr.put(userId, userData);
                        }
                        JSONObject resultData = new JSONObject();
                        int index = requestData.getInt("index");
                        resultData.put("users", usr);
                        resultData.put("count", innerRes.get("count"));
                        resultData.put("hasNext", (index + 1) * requestData.getInt("count") < users.length());
                        resultData.put("nextOffset", index + 1);
                        resData.put("result", resultData);

                        res.onResult(resData);
                    }
                } catch (JSONException e) {
                    e.printStackTrace();
                }
//                    res.onResult();
            }
        });
    }

    private JSONObject reformatTableObject(JSONObject data, Integer imageWidth, Integer imageHeight) {

        JSONObject returnData = new JSONObject();

        try {
            int leagueType = (data.has("ColumnNames"))? 0 : 1;
            returnData.put("type", leagueType);
            switch (leagueType) {

                case 0:

                    returnData.put("headerData", data.getJSONArray("ColumnNames"));

                    JSONArray tableRawData = data.getJSONArray("Table");
                    JSONArray usersData = new JSONArray();
                    for (int i = 0; i < tableRawData.length(); i++) {
                        JSONObject uData = tableRawData.getJSONObject(i);
                        JSONObject userData = new JSONObject();
                        JSONArray scores = new JSONArray();
                        userData.put("matchCount", uData.get("played"));
                        userData.put("userId", uData.get("playerID").toString());
                        userData.put("nickName", uData.get("playerName"));
                        userData.put("rank", uData.get("rank"));

                        if (uData.has("profilePreviewImage") && !uData.isNull("profilePreviewImage")) {
                            userData.put("image", uData.get("profilePreviewImage"));
                        }
                        if (uData.has("profileImage") && !uData.isNull("profileImage")) {
                            userData.put("imageUrl", uData.get("profileImage"));
                        }

                        JSONArray scoreRawData = uData.getJSONArray("scores");
                        for (int j = 0; j < scoreRawData.length(); j++) {
                            JSONObject score = scoreRawData.getJSONObject(j);
                            JSONObject scoreData = new JSONObject();
                            scoreData.put("name", score.get("Name"));
                            scoreData.put("value", score.get("Value"));

                            scores.put(scoreData);
                        }
                        userData.put("scores", scores);

                        usersData.put(userData);
                    }
                    returnData.put("usersData", usersData);

                    break;

                case 1:
                    int currentLevelMatchCount = data.getJSONObject("1").names().length() * 2;
                    JSONObject roundData = new JSONObject();
                    JSONObject indexes = new JSONObject();
                    JSONArray levels = data.names();

                    for (int i = 0; i < levels.length(); i++) {
                        int levelId = levels.getInt(i);
                        currentLevelMatchCount /= 2;
                        String levelIdStr = String.valueOf(levelId);

                        if (!roundData.has(levelIdStr)) {
                            roundData.put(levelIdStr, new JSONObject());
                        }

                        JSONObject levelData = data.getJSONObject(levelIdStr);
                        int index = 0;
                        if (!indexes.has(levelIdStr)) {
                            indexes.put(levelIdStr, new JSONObject());
                        }


                        for (int j = 1; j <= currentLevelMatchCount; j++) {
                            JSONObject matchDataObj = new JSONObject();

                            JSONObject user1Data = new JSONObject();
                            user1Data.put("id", null);
                            user1Data.put("name", null);
                            user1Data.put("isWinner", null);

                            JSONObject user2Data = new JSONObject();
                            user2Data.put("id", null);
                            user2Data.put("name", null);
                            user2Data.put("isWinner", null);

                            matchDataObj.put("user1", user1Data);
                            matchDataObj.put("user2", user2Data);
                            int prevLevelId = levelId - 1;
                            String validMatchNodeId = null;

                            if (levelId == 1) {
                                validMatchNodeId = String.valueOf(j);
                            } else {
                                int upMatchIndex = ((j - 1) * 2) + 1;
                                JSONObject upMatchData = roundData.getJSONObject(String.valueOf(prevLevelId)).getJSONObject(String.valueOf(upMatchIndex));
                                JSONObject downMatchData = roundData.getJSONObject(String.valueOf(prevLevelId)).getJSONObject(String.valueOf(upMatchIndex + 1));

                                JSONArray nodeNames = levelData.names();
                                for (int k = 0; k < nodeNames.length(); k++) {
                                    String matchNodeId = nodeNames.getString(k);

                                    String u1Id = levelData.getJSONObject(matchNodeId).get("UserId1").toString();
                                    String u2Id = levelData.getJSONObject(matchNodeId).get("UserId2").toString();

                                    if (
                                            u1Id.equals(upMatchData.getJSONObject("user1").get("id").toString()) ||
                                            u1Id.equals(upMatchData.getJSONObject("user2").get("id").toString()) ||
                                            u2Id.equals(upMatchData.getJSONObject("user1").get("id").toString()) ||
                                            u2Id.equals(upMatchData.getJSONObject("user2").get("id").toString()) ||

                                            u1Id.equals(downMatchData.getJSONObject("user1").get("id").toString()) ||
                                            u1Id.equals(downMatchData.getJSONObject("user2").get("id").toString()) ||
                                            u2Id.equals(downMatchData.getJSONObject("user1").get("id").toString()) ||
                                            u2Id.equals(downMatchData.getJSONObject("user2").get("id").toString())
                                            ) {
                                        validMatchNodeId = matchNodeId;
                                        break;
                                    }
                                }
                            }

                            if (validMatchNodeId != null) {

                                JSONObject matchData = levelData.getJSONObject(validMatchNodeId);

                                if (matchData.has("UserId1") && !matchData.isNull("UserId1")) {
                                    String userId = matchData.get("UserId1").toString();
                                    indexes.getJSONObject(levelIdStr).put(userId, ++index);
                                }

                                if (matchData.has("UserId2") && !matchData.isNull("UserId2")) {
                                    String userId = matchData.get("UserId2").toString();
                                    indexes.getJSONObject(levelIdStr).put(userId, ++index);
                                }

                                JSONObject user1DataObj = matchDataObj.getJSONObject("user1");
                                user1DataObj.put("id", matchData.get("UserId1").toString());
                                user1DataObj.put("name", matchData.get("UserId1Name"));
                                if (matchData.has("Winner") && !matchData.isNull("Winner")) {
                                    user1DataObj.put("isWinner", matchData.getString("Winner").equals(matchData.get("UserId1").toString()));
                                }

                                if (matchData.has("User1Image") && !matchData.isNull("User1Image")) {
                                    JSONObject imageData = matchData.getJSONObject("User1Image");
                                    imageData.put("id", imageData.get("id").toString());
                                    user1DataObj.put("image", imageData);
                                }

                                if (matchData.has("User1ImageUrl") && !matchData.isNull("User1ImageUrl")) {
                                    user1DataObj.put("imageUrl", matchData.get("User1ImageUrl"));
                                }


                                JSONObject user2DataObj = matchDataObj.getJSONObject("user2");
                                user2DataObj.put("id", matchData.get("UserId2").toString());
                                user2DataObj.put("name", matchData.get("UserId2Name"));
                                if (matchData.has("Winner") && !matchData.isNull("Winner")) {
                                    user2DataObj.put("isWinner", matchData.getString("Winner").equals(matchData.get("UserId2").toString()));
                                }

                                if (matchData.has("User2Image") && !matchData.isNull("User2Image")) {
                                    JSONObject imageData = matchData.getJSONObject("User2Image");
                                    imageData.put("id", imageData.get("id").toString());
                                    user2DataObj.put("image", imageData);
                                }

                                if (matchData.has("User2ImageUrl") && !matchData.isNull("User2ImageUrl")) {
                                    user2DataObj.put("imageUrl", matchData.get("User2ImageUrl"));
                                }


                                if (levelId != 1 && indexes.has("prevLevelId")) {
                                    matchDataObj.getJSONObject("user1").put("prevIndex", indexes.getJSONObject("prevLevelId").getJSONObject(matchData.get("UserId1").toString()));
                                    matchDataObj.getJSONObject("user2").put("prevIndex", indexes.getJSONObject("prevLevelId").getJSONObject(matchData.get("UserId2").toString()));
                                }
                            }
                            roundData.getJSONObject(levelIdStr).put(String.valueOf(j), matchDataObj);
                        }
                        returnData.put("rounds", roundData);
                    }
                    break;
            }

            return returnData;

        } catch (JSONException e) {
            e.printStackTrace();
        }


        return returnData;
    }

    private JSONObject reformatGameObject(JSONObject info, Integer imageWidt, Integer imageHeight) {

        try {

            JSONObject businessData = info.getJSONObject("business");

            if (businessData.has("imageInfo") && !businessData.isNull("imageInfo")) {
                JSONObject businessImageData = businessData.getJSONObject("imageInfo");

                businessImageData.put("image", businessImageData.get("id").toString());
                businessData.put("image", businessImageData);
                businessData.remove("imageInfo");
            }


            JSONObject refLobby = new JSONObject();
            JSONObject lobby = info.getJSONObject("Lobby");
            refLobby.put("id", lobby.get("ID").toString());
            refLobby.put("name", lobby.get("Name").toString());
            refLobby.put("timestamp", lobby.get("Timestamp"));
            refLobby.put("hashCode", lobby.get("HashCode"));

            if (lobby.has("Image") && !lobby.isNull("Image")) {
                JSONObject lobbyImageData = lobby.getJSONObject("Image");

                lobbyImageData.put("image", lobbyImageData.get("id").toString());
                refLobby.put("image", lobbyImageData);
            }


            JSONObject gameData = new JSONObject();
            gameData.put("id", info.get("entityId").toString());
            gameData.put("lobby",refLobby);
            gameData.put("name", info.get("Name"));
            gameData.put("description", info.get("description"));
            gameData.put("creator", info.get("Creator"));
            gameData.put("playerNumbersType", info.get("GamePlayerNumbersType"));
            gameData.put("status", info.get("GameStatus"));
            gameData.put("physicalUrl", info.get("PhysicalUrl"));
            gameData.put("timelineId", info.get("timelineId").toString());
            gameData.put("packageName", info.get("PackageName"));
            gameData.put("mobileVersion", info.get("MobileVersion"));
            gameData.put("mobileVersionCode", info.get("MobileVersionCode"));
            gameData.put("supporterId", info.get("SupporterID").toString());
            gameData.put("defaultLeagueId", info.get("DefaultLeague").toString());
            gameData.put("downloadLink", info.get("DownloadLink"));
            gameData.put("gamePlayDescription", info.get("GamePlayDesc"));
            gameData.put("platformType", info.getInt("Platform"));
            gameData.put("score", info.get("Score"));
            gameData.put("webVersion", info.get("WebVersion"));
            gameData.put("attributeValues", info.get("attributeValues"));
            gameData.put("categoryList", info.get("categoryList"));
            gameData.put("availableCount", info.getInt("availableCount"));
            gameData.put("discount", info.getInt("discount"));
            gameData.put("numOfComments", info.get("numOfComments"));
            gameData.put("numOfFavorites", info.get("numOfFavorites"));
            gameData.put("numOfLikes", info.get("numOfLikes"));
            gameData.put("business", businessData);
            gameData.put("canComment", info.get("canComment"));
            gameData.put("canLike", info.get("canLike"));
            gameData.put("enable", info.get("enable"));
            gameData.put("infrustructure", info.get("Infrustructure"));
            gameData.put("hide", info.get("hide"));
            gameData.put("latitude", info.get("latitude"));
            gameData.put("longitude", info.get("longitude"));
            gameData.put("publishedDate", info.get("PublishedDate"));
            gameData.put("price", info.get("price"));
            gameData.put("timestamp", info.get("timestamp"));
            gameData.put("rate", info.get("rate"));
            gameData.put("userPostInfo", info.get("userPostInfo"));
            gameData.put("hasLeague", info.get("HasLeague"));
            gameData.put("hasSdk", info.get("HasSdk"));
            gameData.put("apkSize", info.get("ApkSize"));
            gameData.put("esrb", info.get("Esrb"));

            if (info.has("Changelog") && !info.isNull("Changelog")) {
                gameData.put("changelog", info.get("Changelog"));
            } else {
                gameData.put("changelog","");
            }

            if (info.has("previewInfo") && !info.isNull("previewInfo")) {
                JSONObject imageData = info.getJSONObject("previewInfo");
                imageData.put("id", imageData.get("id").toString());
                gameData.put("image", imageData);
            }

            if (info.has("preview") && !info.isNull("preview")) {
                gameData.put("imageUrl", info.get("preview"));
            }


            return gameData;

        } catch (JSONException e) {
            e.printStackTrace();
            return null;
        }
    }

    private JSONObject reformatLeagueObject(JSONObject leagueData, Integer imageWidth, Integer imageHeight) {
        JSONObject league = new JSONObject();

        try {
            String leagueId = leagueData.get("entityId").toString();
            JSONObject userPostInfo = leagueData.getJSONObject("userPostInfo");

            JSONObject businessData = leagueData.getJSONObject("business");

            if (businessData.has("imageInfo") && !businessData.isNull("imageInfo")) {
                JSONObject businessImageData = businessData.getJSONObject("imageInfo");
                businessImageData.put("id", businessImageData.get("id").toString());
                businessData.put("image", businessImageData);
                businessData.remove("imageInfo");
            }


            JSONArray leagueGames = leagueData.getJSONArray("Games");
            JSONArray games = new JSONArray();
            for (int i = 0; i < leagueGames.length(); i++) {
                games.put(reformatGameObject(leagueGames.getJSONObject(i),imageWidth,imageHeight));
            }
            league.put("games", games);


            league.put("id", leagueId);
            league.put("enrollUrl", leagueData.get("EnrollUrl"));
            league.put("isMember", leagueData.get("IsUserMember"));
            league.put("isFollower", userPostInfo.get("favorite"));
            league.put("userPostInfo", userPostInfo);

            league.put("gameType", leagueData.get("LeagueGameType"));
            league.put("playerType", leagueData.get("LeaguePlayerType"));
            league.put("status", leagueData.get("LeagueStatus"));
            league.put("financialType", leagueData.get("LeagueFinancialType"));
//            league.put("lobbyId", leagueData.get("LobbyID"));
            league.put("maxPlayers", leagueData.get("MaxPlayers"));
            league.put("minNoOfPlayedGames", leagueData.get("MinNoOfPlayedGames"));
            league.put("minPlayers", leagueData.get("MinPlayers"));
            if (leagueData.has("ExpireTimestamp") && !leagueData.isNull("ExpireTimestamp")) {
                league.put("endTime", leagueData.get("ExpireTimestamp"));
            }
            if (leagueData.has("FromDateTimestamp") && !leagueData.isNull("FromDateTimestamp")) {
                league.put("startTime", leagueData.get("FromDateTimestamp"));
            }
            league.put("rules", leagueData.get("Rules"));
            league.put("description", leagueData.get("description"));
            league.put("hasPrize", leagueData.get("HasPrize"));
            league.put("price", leagueData.getDouble("price") / ConfigData.cf);
            league.put("name", leagueData.get("Name"));
            league.put("playerNumberType", leagueData.get("PlayerNumberType"));
            league.put("timestamp", leagueData.get("timestamp"));
            league.put("type", leagueData.get("NTimeKnockout"));
            league.put("accessType", leagueData.get("LeagueAccessType"));
            league.put("quickMatch", leagueData.get("QuickMatch"));
            league.put("creator", leagueData.get("Creator"));
            league.put("memberCount", leagueData.get("MemberCount"));
            league.put("startTypeCapacityComplete", leagueData.get("StartTypeCapacityComplete"));
            league.put("startTypeFromDate", leagueData.get("StartTypeFromDate"));
            league.put("startTypePublishDate", leagueData.get("StartTypePublishDate"));
            league.put("ThreadId", leagueData.get("ThreadId").toString());
            league.put("availableCount", leagueData.get("availableCount"));
            league.put("attributeValues", leagueData.get("attributeValues"));
            league.put("categoryList", leagueData.get("categoryList"));
            league.put("business", businessData);
            league.put("canComment", leagueData.get("canComment"));
            league.put("canLike", leagueData.get("canLike"));
            league.put("enable", leagueData.get("enable"));
            league.put("hide", leagueData.get("hide"));
            league.put("discount", leagueData.get("discount"));
            league.put("numOfComments", leagueData.get("numOfComments"));
            league.put("numOfFavorites", leagueData.get("numOfFavorites"));
            league.put("numOfLikes", leagueData.get("numOfLikes"));
            league.put("rate", leagueData.get("rate"));
            league.put("timelineId", leagueData.get("timelineId").toString());
//            GET_LEAGUE.put("offlineRequestState", info.getBoolean("offlineRequestState"));

            if (leagueData.has("previewInfo") && !leagueData.isNull("previewInfo")) {
                JSONObject imageData = leagueData.getJSONObject("previewInfo");
                imageData.put("id", imageData.get("id").toString());
                league.put("image", imageData);
            }

            if (leagueData.has("preview") && !leagueData.isNull("preview")) {
                league.put("imageUrl", leagueData.get("preview"));
            }

            if (leagueData.has("metadata") && !leagueData.isNull("metadata")) {
                String metadata = leagueData.getString("metadata");

                try {
                    JSONObject metaobj = new JSONObject(metadata);

                    if (metaobj.has("bannerImage") && !metaobj.isNull("bannerImage")) {
                        league.put("bannerImageUrl", metaobj.get("bannerImage"));
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }


        } catch (JSONException e) {
            e.printStackTrace();
        }

        return league;
    }

    private  JSONObject reformatFriendshipRes(JSONObject result) throws JSONException{

        JSONObject retData = new JSONObject();
        JSONObject toUser = result.getJSONObject("ToUser");
        JSONObject fromUser = null;



        JSONObject newToUser = new JSONObject();
        newToUser.put("id", toUser.get("id").toString());
        newToUser.put("name", toUser.get("name"));
        newToUser.put("image", toUser.get("image"));
        newToUser.put("imageUrl", toUser.get("profileImage"));

        if (result.has("FromUser") && !result.isNull("FromUser")) {
            fromUser = result.getJSONObject("FromUser");
            JSONObject newFromUser = new JSONObject();
            newFromUser.put("id", fromUser.get("id").toString());
            newFromUser.put("name", fromUser.get("name"));
            newFromUser.put("image", fromUser.get("image"));
            newFromUser.put("imageUrl", fromUser.get("profileImage"));
            retData.put("fromUser",newFromUser);

        }

        if (result.has("FriendId") && !result.isNull("FriendId")) {
            retData.put("friendId", result.get("FriendId").toString());
        }

        retData.put("creationDate", result.get("CreationDate"));
        retData.put("requestId", result.get("ID").toString());
        retData.put("status", result.get("Status"));
        retData.put("toUser",newToUser);


        return retData;
    }

    private void quickRequest(final JSONObject requestData, final boolean isRepeat, final QuickMatchRequestCallback res) {
        log.info("quickRequest_0 " + requestData);
        request(RequestUrls.REQUEST_QUICK_MATCH, requestData, new Network.HttpRequestCallback() {
            @Override
            public void onResult(JSONObject result){
                try {

                    boolean hasError = result.getBoolean("HasError");
                    if (!isRepeat) {
                        JSONObject returnData = new JSONObject();
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));
                        res.onResult(returnData);
                    }

                    HashMap leaguesQuickData = (HashMap) quickMatchData.get("leagues");
                    final HashMap quickData = (HashMap) leaguesQuickData.get(requestData.get("leagueId").toString());


                    log.info("quickRequest_1 " + quickData);
                    log.info("quickRequest_2 " + requestData.get("leagueId").toString());
                    if (!hasError) {
                        String timeoutId = Util.setTimeout(new Util.SetTimeoutCallback() {
                            @Override
                            public void onDone() {
                                if ((Boolean)quickData.get("state")) {
                                    quickRequest(requestData, true, res);
                                }
                            }
                        }, ConfigData.qmt);

                        quickData.put("timeoutId", timeoutId);
                    } else {
                        if (isRepeat) {
                            QuickMatchRequestCallback res = (QuickMatchRequestCallback) quickData.get("callback");
                            JSONObject cancelData = new JSONObject();
                            cancelData.put("leagueId", requestData.get("leagueId").toString());
                            cancelData.put("message",dic.getJSONObject("NOTOPPONENTFIND").getString(lang));
                            cancelData.put("state",quickData.get("state"));

                            res.onCancel(cancelData);
                        }
                        quickMatchData.put("requestCount", (Integer) quickMatchData.get("requestCount") - 1);
                        quickMatchData.put("lastLeagueId", null);
                        quickData.put("state", false);
                    }

                } catch (JSONException e) {
                    res.onResult(ExceptionErrorData(e));
                }
            }
        });
    }

    private void _sendResult(JSONObject params, final RequestCallback res) throws ServiceException{
        try {

            String result = params.getString("result");
            final boolean forceAddToTable = params.has("forceAddToTable") && params.getBoolean("forceAddToTable");


            JSONObject sendData = new JSONObject();
            sendData.put("matchResult", result);
            if (params.has("matchId")) {
                sendData.put("matchId", params.get("matchId").toString());
            }

            if (params.has("gameId")) {
                sendData.put("gameId", params.get("gameId").toString());
            }


            if (userData.getBoolean("loginState")) {
                String userId = params.has("userId") ? params.get("userId").toString() : userData.get("id").toString();
                sendData.put("userId", userId);

                request(RequestUrls.MATCH_RESULT, sendData, new Network.HttpRequestCallback() {
                    @Override
                    public void onResult(JSONObject result){
                        try {
                            boolean hasError = result.getBoolean("HasError");
                            JSONObject returnData = new JSONObject();
                            returnData.put("hasError", hasError);
                            returnData.put("errorMessage", result.getString("ErrorMessage"));
                            if (hasError) {
                                int errorCode = result.getInt("ErrorCode");
                                returnData.put("errorCode", errorCode);

                                if (errorCode == ErrorCodes.RUNTIME || errorCode == ErrorCodes.REQUEST_FAILED) {
                                    if (forceAddToTable) {
                                        // TODO : database
                                    }
                                } else {
                                    if (!forceAddToTable) {
                                        // TODO : database
                                    }
                                }
                            } else {
                                if (!forceAddToTable) {
                                    // TODO : database
                                }
                            }

                            res.onResult(returnData);
                        } catch (JSONException e) {
                            res.onResult(ExceptionErrorData(e));
                        }
                    }
                });
            }
        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }



    private boolean isGameRun() {

        return false;
    }

    private void logoutAction() {

        try {
            userData.remove("id");
            userData.remove("name");
            userData.remove("token");
            userData.remove("tokenIssuer");
            userData.remove("image");
            userData.remove("imageUrl");
            userData.put("loginState",false);

            network.onLogout();

            currentMatchRequestCount = 0;
            fireEvents("logout", new JSONObject());

        } catch (JSONException e) {
            e.printStackTrace();
        }

    }

    private void subscribeDefaultLeague(final String gameId) throws Exception{
        if (userData.has("loginState") && userData.getBoolean("loginState") && network.isSocketOpen()) {
            JSONObject requestData = new JSONObject();
            requestData.put("gameId", gameId);
            log.info("subscribeDefaultLeague_1 " + gameId);
            request(RequestUrls.DEFAULT_LEAGUE_SUBSCRIBE, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result){
                    log.info("subscribeDefaultLeague_2 " + result);
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        if (!hasError) {
                            JSONObject data = new JSONObject();
                            data.put("gameId", data);
                            fireEvents("defaultLeagueSubscribe",data);
                        } else {
                            Util.setTimeout(new Util.SetTimeoutCallback() {
                                @Override
                                public void onDone() {
                                    try {
                                        subscribeDefaultLeague(gameId);
                                    } catch (Exception e) {
                                        e.printStackTrace();
                                    }
                                }
                            }, ConfigData.smit);
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            });
        } else {
            network.on("open", new EventCallback() {
                @Override
                public void onFire(JSONObject msg) {
                    try {
                        subscribeDefaultLeague(gameId);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }

                }
            });
        }
    }

    private void loginAct(JSONObject params) throws  ServiceException{

        try {
            if (userData == null) {
                userData = new JSONObject(params.toString());
            } else {
                userData.put("id", params.get("id"));
                userData.put("name", params.get("name"));
                userData.put("token", params.get("token"));
                userData.put("tokenIssuer", params.get("tokenIssuer"));

                if (params.has("guest")) {
                    userData.put("guest", params.get("guest"));
                } else {
                    userData.put("guest", false);
                }

            }
            userData.put("loginState", true);

            loginActionWithPeer();
//            checkPeerAndSocketSync();

            JSONArray gamesId = games.names();
            if (gamesId != null && gamesId.length() > 0) {
                for (int i = 0; i < gamesId.length(); i++) {
                    subscribeDefaultLeague(gamesId.getString(i));
                }
            }

            fireEvents("login",userData);

            checkPeerAndSocketSync();
        } catch (Exception e) {
            throw new ServiceException(e);
        }
    }


    private void loginAction(JSONObject params) throws ServiceException{
        log.info("loginAction_1 " + params);
        try {
            String userId = params.getString("id");
            String name = params.getString("name");
            String token = params.getString("token");
            int tokenIssuer = params.getInt("tokenIssuer");
            Boolean guest = params.getBoolean("guest");

            JSONObject image =  (params.has("image") && !params.isNull("image")) ? params.getJSONObject("image") : null;
            String imageUrl =  (params.has("imageUrl") && !params.isNull("imageUrl")) ? params.getString("imageUrl") : null;

            boolean loginState = false;
            if (userData.has("loginState")) {
                loginState = userData.getBoolean("loginState");
            }
            if (loginState) {
                if (!userData.get("id").toString().equals(userId)) {
                    logoutAction();
                    loginAct(params);
//                    loginAct(userId, name, token,guest,image,tokenIssuer);
                } else {

                    userData.put("token", token);
                    userData.put("tokenIssuer", tokenIssuer);
                    if (guest) {
                        fireEvents("guestLogin", userData);
                        fireEvents("profileChange", userData);
                    }
                }
            } else {
                loginAct(params);
//                loginAct(userId, name, token,guest,image,tokenIssuer);
            }

        } catch (Exception e) {
            throw new ServiceException(e);
        }
    }

    private JSONObject reformatInAppPack(JSONObject pack, Integer imageWidth, Integer imageHeight) throws ServiceException {
        JSONObject returnData = new JSONObject();

        try {
            JSONObject base= pack.getJSONObject("Base");
            JSONObject plan = pack.getJSONObject("Plan");
            double price = base.getDouble("price") / ConfigData.cf;


            returnData.put("id", pack.get("ID").toString());
            returnData.put("count", pack.get("Count"));
            returnData.put("name", base.get("Name"));
            returnData.put("visible", pack.get("Visible"));
            returnData.put("enable", pack.get("Enable"));
            returnData.put("allowedTimesToBuy", pack.get("AllowedTimesToBuy"));
            returnData.put("description", base.get("description"));

            returnData.put("item", reformatGameItem(pack.getJSONObject("Item"),imageWidth,imageHeight));

            JSONObject planData = new JSONObject();
            planData.put("cycle", plan.get("Cycle"));
            planData.put("id", plan.get("ID").toString());
            planData.put("type", plan.get("Type"));
            planData.put("fromDate", plan.has("FromDate") ? plan.get("FromDate") : null);
            planData.put("toDate", plan.has("ToDate") ? plan.get("ToDate") : null);
            returnData.put("plan", planData);


            returnData.put("price", price);
            returnData.put("priceText", price + " " + ConfigData.cu);
            returnData.put("priceUnit", ConfigData.cu);


            if (base.has("previewInfo") && !base.isNull("previewInfo")) {
                JSONObject image = base.getJSONObject("previewInfo");
                image.put("id", image.get("id").toString());
                returnData.put("image", image);
            }

            if (base.has("preview") && !base.isNull("preview")) {
                returnData.put("imageUrl", base.get("preview"));
            }


        } catch (JSONException e) {
            e.printStackTrace();

        }

        return returnData;
    }

    private JSONObject reformatUserItem(JSONObject item, Integer imageWidth, Integer imageHeight) throws ServiceException {

        JSONObject returnData = new JSONObject();
        try {

            returnData.put("id", item.get("ID").toString());
            returnData.put("count", item.getInt("Count"));
            returnData.put("item", reformatGameItem(item.getJSONObject("Item"),imageWidth,imageHeight));

        } catch (JSONException e) {
            e.printStackTrace();
            throw new ServiceException(e);
        }
        return returnData;
    }

    private JSONObject reformatGameItem(JSONObject item, Integer imageWidth, Integer imageHeight) throws ServiceException {
        JSONObject returnData = new JSONObject();

        try {
            JSONObject image = item.getJSONObject("Image");

            returnData.put("id", item.get("ID").toString());
            returnData.put("name", item.get("Name"));
            returnData.put("description", item.get("Desc"));
            returnData.put("visible", item.get("Visible"));
            returnData.put("Enable", item.get("Enable"));
            returnData.put("allowedTimesToBuy", item.get("AllowedTimesToBuy"));
            returnData.put("image", image);

        } catch (JSONException e) {
            throw new ServiceException(e);
        }

        return returnData;
    }

    private JSONObject reformatNewsObject(JSONObject news, Integer imageWidth, Integer imageHeight) {

        try {
            if (news.has("imageInfo") && !news.isNull("imageInfo")) {
                JSONObject image = news.getJSONObject("imageInfo");
                image.put("id", image.get("id").toString());
                news.put("image", image);
                news.remove("imageInfo");
            }
            if (news.has("previewImage") && !news.isNull("previewImage")) {
                news.put("imageUrl", news.get("previewImage"));
                news.remove("previewImage");
            }

            JSONObject business = news.getJSONObject("business");

            if (business.has("image") && !business.isNull("image")) {
                business.put("imageUrl", business.get("image"));
                business.remove("image");
            }

            if (business.has("imageInfo") && !business.isNull("imageInfo")) {
                JSONObject image = business.getJSONObject("imageInfo");
                image.put("id", image.get("id").toString());
                business.put("image", image);
                business.remove("imageInfo");
            }

            business.put("id", business.get("id").toString());



            news.put("id", news.get("id").toString());
            news.put("timelineId", news.get("timelineId").toString());
            news.put("entityId", news.get("entityId").toString());
//            news.put("timestamp", news.get("timestamp"));
//            news.put("enable", news.get("enable"));
//            news.put("hide", news.get("hide"));
//            news.put("canComment", news.get("canComment"));
//            news.put("canLike", news.get("canLike"));
//            news.put("hot", news.get("hot"));

        } catch (JSONException e) {
            e.printStackTrace();
        }


        return news;
    }

    private void editScore(JSONObject params, RequestCallback res) {

    }

    private void checkPeerAndSocketSync() {

        log.info("checkPeerAndSocketSync_0 " + peerAndTokenSync + " " + syncTokenWithPeer + " " + syncPeerWithToken);
        try {
            if (!peerAndTokenSync && !syncTokenWithPeer && !syncPeerWithToken) {

                log.info("checkPeerAndSocketSync_1 " + userData.has("token") + " " + userData.has("peerId"));
                if (userData.has("token") && userData.has("peerId")) {
                    JSONObject requestData = new JSONObject();
                    requestData.put("peerId", userData.get("peerId").toString());
                    log.info("checkPeerAndSocketSync_2 ");
                    peerAndTokenSync = true;
                    request(RequestUrls.PING, requestData, new Network.HttpRequestCallback() {
                        @Override
                        public void onResult(JSONObject result) {
                            log.info("checkPeerAndSocketSync_3 " + result);
                        }
                    });
                }
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }

    }


    /**
     * @deprecated
     * */
    @Override
    public void registerPeerId(Long peerId, final Network.HttpRequestCallback res) {
        try {
            JSONObject sendData = new JSONObject();
            sendData.put("peerId", peerId);
            sendData.put("serviceVersion", VERSION);
            sendData.put("deviceId", deviceId);
            sendData.put("type", type);


            JSONArray gamesId = games.names();

            if (gamesId != null && gamesId.length() > 0) {
                JSONArray gameVersion = new JSONArray();
                for (int i = 0; i < gamesId.length(); i++) {
                    String gameId = gamesId.getString(i);
                    JSONObject gameData = new JSONObject();
                    gameData.put("gameId", gameId);
                    gameData.put("version", games.getJSONObject(gameId).getString("version"));
                    gameVersion.put(gameData);
                }

                sendData.put("gameVersion", gameVersion.toString());
                log.info("registerPeerId_1 " + gameVersion);
            }

            if (userData.has("token")) {
                syncTokenWithPeer = true;
            }
            log.info("registerPeerId_2 " + sendData);

            JSONObject setting = new JSONObject();
            setting.put("fromSocket", false);
            request(RequestUrls.ASYNC_REGISTER, sendData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result){
                    log.info("registerPeerId_3 " + result);
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        int errorCode = result.getInt("ErrorCode");


                        JSONObject returnData = new JSONObject();
                        returnData.put("hasError", hasError);
                        returnData.put("errorCode", errorCode);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));

                        if (hasError) {
                            switch (errorCode) {
                                case ErrorCodes.MAJOR_CONFLICT:
                                    majorConflictAction();
                                    break;

                                case ErrorCodes.PEER_CLEAR:
                                    network.onLogout();
                                    break;

                                default:
                                    res.onResult(returnData);
                            }
                        } else {
                            returnData.put("result", result.getString("Result"));
                            res.onResult(returnData);
                        }

                    } catch (JSONException e) {
                        res.onResult(ExceptionErrorData(e));
                    }
                }
            },setting);

        } catch (Exception e) {
            e.printStackTrace();
        }

    }

    /**
     * @deprecated
     * */
    @Override
    public void activatePeerId(Long peerId, final Network.HttpRequestCallback res) {


        JSONObject requestData = new JSONObject();
        try {
            requestData.put("peerId", peerId);
            log.info("activatePeerId_1 " + peerId);
            JSONObject setting = new JSONObject();
            setting.put("fromSocket", false);
            request(RequestUrls.ACTIVE_PEER, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result){
                    log.info("activatePeerId_2 " + result);
                    try {
                        JSONObject data;
                        boolean hasError = result.getBoolean("HasError");
                        if (hasError) {

                            switch (result.getInt("ErrorCode")) {

                                case ErrorCodes.PEER_CLEAR:
                                    network.onLogout();
                                    break;
                                default:
                                    data = new JSONObject();
                                    data.put("hasError", result.getBoolean("HasError"));
                                    data.put("errorMessage", result.getString("ErrorMessage"));
                                    data.put("errorCode", result.getInt("ErrorCode"));
                                    res.onResult(data);
                            }
                        } else {
                            data = new JSONObject();
                            data.put("hasError", false);
                            res.onResult(data);
                        }
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                }
            },setting);

        } catch (Exception e) {
            e.printStackTrace();
        }


    }

    public void httpPostRequest(RequestUrls.UrlData url, JSONObject data, final RequestCallback res) {
        request(url, data, new Network.HttpRequestCallback() {
            @Override
            public void onResult(JSONObject result) {
                try {
                    JSONObject returnData = new JSONObject();
                    returnData.put("hasError", result.getBoolean("HasError"));
                    returnData.put("errorMessage", result.getString("ErrorMessage"));

                    returnData.put("errorCode", result.getInt("ErrorCode"));
                    if (result.has("Result") && !result.isNull("Result")) {
                        returnData.put("result", result.get("Result"));
                    }
                    res.onResult(returnData);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        });
    }

    /**
     * <div style='width: 100%;text-align: right'>دریافت اطلاعات کاربر</div>
     * <pre>
     *     <code style='float:right'>نمونه کد</code>
     *  <code>
     *        JSONObject userData = service.getUserData();
     *  </code>
     * </pre>
     *
     * @return
     *  <p>return data is JSONObject that has</p>
     *  <ul>
     *      <li>{String} id</li>
     *      <li>{String} name</li>
     *      <li>{String} token</li>
     *      <li>{String} peerId</li>
     *      <li>{Boolean} guest</li>
     *      <li>{JSONObject} [image]
     *          <ul>
     *              <li>{String} id</li>
     *              <li>{String} url</li>
     *              <li>{Integer} width</li>
     *              <li>{Integer} height</li>
     *          </ul>
     *      </li>
     * </ul>
     * */
    public JSONObject getUserData() {
        return userData;
    }

    /**
     *<div style='width: 100%;text-align: right'> دریافت رخداد های موجود در سرویس</div>
     *
     * <pre>
     *     <code style='float:right'>نمونه کد</code>
     *     <code>
     *     //fire after service initialize
     *     String id = tis.on("ready", new EventCallback(){
     *        {@code @Override}
     *         public void onFire() {
     *             System.out.println("READY");
     *             functionTest(tis);
     *         }
     *     });
     *     System.out.println("UUID EVENT " + id);
     *     // fire after  login
     *     tis.on("login", new EventCallback(){
     *        {@code @Override}
     *         public void onFire() {
     *             Util.setTimeout(new Util.SetTimeoutCallback(){
     *                 {@code @Override}
     *                 public void onDone() {
     *                     afterLoginFunctionTest(tis);
     *                 }
     *             }, 4000);
     *         }
     *     });
     *     </code>
     * </pre>
     * @param eventName  نام رخداد
     * <ul>
     *      <li>"ready" - بعد از آماده شدن سرویس این رخداد اتفاق می افتد, و می توانید از توابع سرویس استفاده کنید</li>
     *      <li>"login" - بعد از ورود به حساب کاربری این رخداد اتفاق می افتد</li>
     *      <li>"guestLogin" - بهد از ثبت نام کاربر مهمان و تبدیل شدن به کاربر معمولی اتفاق می افتد</li>
     *      <li>"defaultLeagueSubscribe" - بعد از عضویت در لیگ پیشفرض بازی, این رخداد اتفاق می افتد</li>
     *      <li>"logout" - بعد از خروج به حساب کاربری این رخداد اتفاق می افتد</li>
     *      <li>"connect" -  بعد از وصل شدن به سرور ایسینک این رخداد اتفاق می افتد</li>
     *      <li>"disconnect" - بعد از قطع شدن به سرور ایسینک این رخداد اتفاق می افتد</li>
     *      <li>"reconnect" - بعد از وصل مجدد به سرور ایسینک این رخداد اتفاق می افتد</li>
     *      <li>
     *           "message" -  بعد از دریافت پیام جدید این رویداد اتفاق می افتد
     *            <ul>
     *                <li>{Integer} type نوع پیام
     *                    <pre>
     *                        1 = پیام مربوط به درخواست آنلاین
     *                        2 = پیام مربوط به درخواست افلاین
     *                        3 = پیام مربوط به نوتیفیکیشن
     *                    </pre>
     *                </li>
     *                <li>{JSONObject} content محتویات مربوط به پیام که متناسب با نوع پیام متفاوت می باشد
     *                    <ul>
     *                        <li> در درخواست آنلاین کلید های آن عبارتند از
     *                            <ul>
     *                                <li>{String} name نام درخواست دهنده مسابقه</li>
     *                                <li>{String} leagueName شناسه درخواست دهنده مسابقه</li>
     *                                <li>{String} gameName نام بازی که در آن درخواست داده شده است</li>
     *                                <li>{String} gameId شناسه بازی که در آن درخواست داده شده است</li>
     *                                <li>{String} leagueName نام لیگی که در آن درخواست داده شده است</li>
     *                                <li>{String} leagueId شناسه لیگی که در آن درخواست داده شده است</li>
     *                                <li>{String} requestId شناسه درخواست کنونی</li>
     *                                <li>{String} packageName نام پکیج بازی که در آن درخواست داده شده است</li>
     *                                <li>{String} version نسخه بازی در گیم سنتر</li>
     *                                <li>{JSONObject} [image] اطلاعات مربوط به تصویر درخواست کننده بازی
     *                                    <ul>
     *                                        <li>{String} id</li>
     *                                        <li>{String} url</li>
     *                                        <li>{Integer} width</li>
     *                                        <li>{Integer} height</li>
     *                                    </ul>
     *                                </li>
     *                            </ul>
     *                        </li>
     *                    </ul>
     *                </li>
     *            </ul>
     *      </li>
     *      <li>"profileChange" -  بعد از ثبت تغییر پروفایل کاربری اتفاق می افتد</li>
     *      <li>"newMatch" -  اعلان شروع مسابقه جدید از سمت گیم سنتر</li>
     *      <li>"matchReceiveData" -  دریافت پیام یک مسابقه از سمت حربف</li>
     *      <li>"matchStart" -  اعلام شروع بازی از سوی گیم سنتر</li>
     *      <li>"matchPause" - اعلام توفق بازی از سوی گیم سنتر</li>
     *      <li>"matchResume" - اعلام شروع مجدد مسابقه از سوی گیم سنتر</li>
     *      <li>"matchEnd" - بعد از اعلام نتیجه از سوی افراذ حاضر در مسابقه این رویداد اتفاق می افتد</li>
     *      <li>"matchLeave" - با ترک مسابقه از سوی یک نفر این رخداد اتفاق می افتد</li>
     * </ul>
     *
     * @param callback متد اجرا شونده بعد از اتفاق افتادن رخداد مورد نظر
     *
     * @return  شناسه متد رخداد
     * */
    public String on(String eventName, EventCallback callback) {
        HashMap<String, EventCallback> events = eventCallback.get(eventName);
        String id = null;
        if (events != null) {

            id = UUID.randomUUID().toString();

            events.put(id, callback);

            try {
                if (eventName.equals("ready") && this.isReady) {
                    JSONObject readyData = new JSONObject();
                    readyData.put("config", getConfig());
                    callback.onFire(readyData);
                }

                if (eventName.equals("login") && userData.has("loginState") && userData.getBoolean("loginState")) {
                    callback.onFire(userData);
                }

                if ( eventName.equals("connect") && userData.has("peerId") && !userData.isNull("peerId")) {
                    JSONObject readyData = new JSONObject();
                    readyData.put("peerId", userData.get("peerId"));
                    callback.onFire(readyData);
                }

            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        log.info("ON_EVENT " + id + " " + eventName + " " + this.isReady);
        return id;
    }

    public String generateImageSrc(String imageId, Integer imageWidth, Integer imageHeigh) {

        String src = ConfigData.isa + "/nzh/image/?imageId=" + imageId;

        if (imageWidth != null && imageWidth > 0) {
            src += ("&width=" + imageWidth);
        }

        if (imageHeigh != null && imageHeigh > 0) {
            src += ("&height=" + imageHeigh);
        }

        return src;

    }

    public String generateImageSrc(JSONObject imageData, Integer imageWidth, Integer imageHeigh) {

        String imageId = null;
        try {
            imageId = imageData.get("id").toString();
        } catch (JSONException e) {
            e.printStackTrace();
        }
        String src = ConfigData.isa + "/nzh/image/?imageId=" + imageId;

        if (imageWidth != null && imageWidth > 0) {
            src += ("&width=" + imageWidth);
        }

        if (imageHeigh != null && imageHeigh > 0) {
            src += ("&height=" + imageHeigh);
        }

        return src;

    }

    /**
     * <div style='width: 100%;text-align: right'>ورود به حساب کاربری</div>
     * <pre>
     *     <code style='float:right'>نمونه کد</code>
     *  <code>
     *        JSONObject reqData = new JSONObject();
     *        reqData.put("userName", "cellphoneNumber");//cellphone Number or nick name
     *        reqData.put("code", "code");// code or password
     *        service.loginRequest(reqData, new RequestCallback() {
     *           {@code @Override}
     *            public void onResult(JSONObject result) {
     *                System.out.println("loginRequest method -- onResult " + result);
     *            }
     *        });
     *  </code>
     * </pre>
     * @param  params
     * <ul>
     *      <li>{String} userName   شماره تماس و یا نام مستعار کاربر
     *      </li>
     *      <li>{String} code رمز عبور
     *      </li>
     *       <li>{JSONObject} [setting]
     *          <ul>
     *              <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر کاربر</li>
     *              <li>{Integer} [imageHeight] اندازه رزولیشن عمودی تصویر کاربر</li>
     *          </ul>
     *       </li>
     * </ul>
     *
     * @param  callback
     *  <p>onResult method params is JSONObject that has</p>
     *  <ul>
     *      <li>{Boolean} hasError</li>
     *      <li>{String} errorMessage</li>
     *      <li>{Integer} errorCode</li>
     *      <li> {JSONObject} result
     *          <ul>
     *              <li>{String} id</li>
     *              <li>{String} name</li>
     *              <li>{String} token</li>
     *              <li>{JSONObject} [image]
     *                 <ul>
     *                    <li>{String} id</li>
     *                    <li>{String} url</li>
     *                    <li>{Integer} width</li>
     *                    <li>{Integer} height</li>
     *                 </ul>
     *              </li>
     *          </ul>
     *      </li>
     *  </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     *
     * */
    public void loginRequest(JSONObject params, final RequestCallback callback) throws ServiceException {

        log.info("loginRequest-0");
        try {
            String userName = (params.has("userName") && !params.isNull("userName")) ? params.getString("userName") : null;
            String code = (params.has("code") && !params.isNull("code")) ? params.getString("code") : null;

            if (userName == null) {
                throw new ServiceException("userName not exist in params");
            }

            if (code == null) {
                throw new ServiceException("code not exist in params");
            }

            JSONObject requestData = new JSONObject();
            requestData.put("code", code);
            if (isCellphoneNumber(userName)) {
                requestData.put("cellphoneNumber", userName);
            } else {
                requestData.put("nickName", userName);
            }

            if (userData.has("peerId")) {
                syncPeerWithToken = true;
                Long peerId = userData.getLong("peerId");
                log.info("loginRequest -- 0" + peerId);
                requestData.put("peerId", peerId);
            }
            requestData.put("deviceId", deviceId);

            Integer imageWidth = null;
            Integer imageHeight = null;

            if (params.has("setting") && !params.isNull("setting")) {
                JSONObject setting = params.getJSONObject("setting");
                if (setting != null) {
                    if (setting.has("imageWidth")) {
                        imageWidth = setting.getInt("imageWidth");
                    }

                    if (setting.has("imageHeight")) {
                        imageHeight = setting.getInt("imageHeight");
                    }
                }
            }

            final Integer finalImageWidth = imageWidth;
            final Integer finalImageHeight = imageHeight;

            request(RequestUrls.LOGIN, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result){

                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");


                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));
                        JSONObject reqResult = null;
                        if (result.has("Result") && !result.isNull("Result")) {
                            reqResult = result.getJSONObject("Result");
                        }
                        if (!hasError) {

                            if (reqResult != null) {
                                returnData.put("loginState", true);
                                String userId = reqResult.getString("UserID");
                                String name = reqResult.getString("Name");
                                String token = reqResult.getString("Token");
                                JSONObject retResult = new JSONObject();
                                retResult.put("id", userId);
                                retResult.put("name", name);
                                retResult.put("token", token);
                                JSONObject image = null;
                                if (reqResult.has("Image") && !reqResult.isNull("Image")) {
                                    image = reqResult.getJSONObject("Image");
                                    image.put("id", image.get("id").toString());
                                    retResult.put("image", image);
                                    image.remove("Image");
                                }

                                returnData.put("result", retResult);

                                JSONObject uData = new JSONObject();
                                userData.put("id", userId);
                                userData.put("name", name);
                                userData.put("image", image);
                                userData.put("token",token);
                                userData.put("tokenIssuer", 0);
                                userData.put("guest", false);
                                loginAction(uData);
//                                loginAction(userId, name, token,image,false,null);
                            } else {
                                returnData.put("loginState", false);
                            }
                            checkPeerAndSocketSync();
                        }

                    } catch (Exception e) {
                        returnData = ExceptionErrorData(e);
                    }

                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }


    }

    /**
     * <div style='width: 100%;text-align: right'> ثبت نام</div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *        JSONObject reqData = new JSONObject();
     *        reqData.put("cellphoneNumber", "cellphoneNumber");
     *        service.signupRequest(reqData, new RequestCallback() {
     *            {@code @Override}
     *            public void onResult(JSONObject result) {
     *                System.out.println("signupRequest method : " + result);
     *            }
     *        });
     *  </code>
     * </pre>
     * @param  params
     * <ul>
     *      <li>{String} cellphoneNumber شماره موبایل</li>
     *      <li>{Boolean}[resend=false]</li>
     * </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{Boolean} hasProfile تعیین می کند که آیا کاربر قبلا در سامانه ثبت نام کرده است یا خیر</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void signupRequest(JSONObject params, final RequestCallback callback) throws ServiceException{

        try {
            String cellphoneNumber = (params.has("cellphoneNumber") && !params.isNull("cellphoneNumber")) ? params.getString("cellphoneNumber") : null;

            if (cellphoneNumber == null) {
                throw new ServiceException("cellphoneNumber not exist in params");
            }

            if (!isCellphoneNumber(cellphoneNumber)) {
                throw new ServiceException("cellphoneNumber is not valid");
            }
            params.put("deviceId", deviceId);
            params.put("cellphoneNumber", cellphoneNumber);

            boolean isRegistering = true;
            if (params.has("resend") && !params.isNull("resend")) {
                isRegistering = params.getBoolean("resend");
                params.remove("resend");
            }
            params.put("isRegistering", isRegistering);
            request(RequestUrls.SUGNUP, params, new Network.HttpRequestCallback() {

                @Override
                public void onResult(JSONObject result){

                    JSONObject returnData = new JSONObject();

                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        JSONObject retResult = new JSONObject();

                        boolean hasProfile = false;
                        if (!hasError && result.has("Result") && !result.isNull("Result")) {
                            hasProfile = result.getBoolean("Result");
                        }
                        retResult.put("hasProfile", hasProfile);
                        returnData.put("result", retResult);


                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }

                    callback.onResult(returnData);

                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }


    }

    /**
     * <div style='width: 100%;text-align: right'> فعال سازی کد ارسالی به کاربر </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *            JSONObject reqData = new JSONObject();
     *            reqData.put("cellphoneNumber", "cellphoneNumber");
     *            reqData.put("code", "code");
     *            service.verifyRequest(reqData, new RequestCallback() {
     *                {@code @Override}
     *                public void onResult(JSONObject result) {
     *                    System.out.println("verifyRequest RESULT : " + result);
     *                }
     *            });
     *  </code>
     * </pre>
     * @param  params
     *  <ul>
     *      <li>{String} cellphoneNumber شماره موبایل</li>
     *      <li>{String} code کد ارسالی</li>
     *      <li>{String} newCode رمز</li>
     *      <li> {JSONObject} [setting]
     *          <ul>
     *              <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر کاربر</li>
     *              <li>{Integer} [imageHeight] اندازه رزولیشن عمودی تصویر کاربر</li>
     *          </ul>
     *      </li>
     *  </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{String} id</li>
     *                  <li>{String} name</li>
     *                  <li>{String} token</li>
     *                  <li>{JSONObject} [image]
     *                      <ul>
     *                          <li>{String} id</li>
     *                          <li>{String} url</li>
     *                          <li>{Integer} width</li>
     *                          <li>{Integer} height</li>
     *                      </ul>
     *                  </li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void verifyRequest(JSONObject params, final RequestCallback callback) throws ServiceException{
        try {

            String cellphoneNumber = (params.has("cellphoneNumber") && !params.isNull("cellphoneNumber")) ? params.getString("cellphoneNumber") : null;
            String code = (params.has("code") && !params.isNull("code")) ? params.getString("code") : null;
            String newCode = (params.has("newCode") && !params.isNull("newCode")) ? params.getString("newCode") : null;

            if (cellphoneNumber == null) {
                throw new ServiceException("cellphoneNumber not exist in params");
            }

            if (code == null) {
                throw new ServiceException("code not exist in params");
            }

            JSONObject requestData = new JSONObject();
            if (!isCellphoneNumber(cellphoneNumber)) {
                throw new ServiceException("cellphoneNumber is not valid");
            }
            if (code.length() < 4) {
                throw new ServiceException("code length is lower than 4");
            }
            requestData.put("cellphoneNumber", cellphoneNumber);
            requestData.put("code", code);

            if (userData.has("peerId")) {
                requestData.put("peerId", userData.getLong("peerId"));
            }
            if (newCode != null) {
                requestData.put("newCode", params.getString("newCode"));
            }
            requestData.put("deviceId", deviceId);

            Integer imageWidth = null;
            Integer imageHeight = null;

            if (params.has("setting") && !params.isNull("setting")) {
                JSONObject setting = params.getJSONObject("setting");
                if (setting != null) {
                    if (setting.has("imageWidth")) {
                        imageWidth = setting.getInt("imageWidth");
                    }

                    if (setting.has("imageHeight")) {
                        imageHeight = setting.getInt("imageHeight");
                    }
                }
            }

            final Integer finalImageWidth = imageWidth;
            final Integer finalImageHeight = imageHeight;

            request(RequestUrls.VERIFY, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result) {

                    JSONObject returnData = new JSONObject();

                    try {

                        boolean hasError = result.getBoolean("HasError");

                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));
                        JSONObject reqResult = null;
                        if (result.has("Result") && !result.isNull("Result")) {
                            reqResult = result.getJSONObject("Result");
                        }
                        if (!hasError) {

                            if (reqResult != null) {
                                returnData.put("loginState", true);
                                String userId = reqResult.getString("UserID");
                                String name = reqResult.getString("Name");
                                String token = reqResult.getString("Token");
                                JSONObject retResult = new JSONObject();
                                retResult.put("id", userId);
                                retResult.put("name", name);
                                retResult.put("token", token);

                                JSONObject image = null;
                                if (reqResult.has("Image") && !reqResult.isNull("Image")) {
                                    image = reqResult.getJSONObject("Image");
                                    image.put("id", image.get("id").toString());
                                    retResult.put("image", image);
                                    image.remove("Image");
                                }

                                returnData.put("result", retResult);

                                JSONObject uData = new JSONObject();
                                userData.put("id", userId);
                                userData.put("name", name);
                                userData.put("image", image);
                                userData.put("token",token);
                                userData.put("tokenIssuer", 0);
                                userData.put("guest", false);
                                loginAction(uData);
//                                loginAction(userId, name, token,image,false,null);
                            } else {
                                returnData.put("loginState", false);
                            }
                        }


                    } catch (Exception e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'> فعال سازی به همراه ثبت اطلاعات کاربر </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("cellphoneNumber", "cellphoneNumber");
     *      reqData.put("code", "code");
     *      reqData.put("nickName", "nickName");
     *      service.verifyWithCompleteProfileRequest(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("verifyWithCompleteProfileRequest method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     *
     * @param  params
     *  <ul>
     *      <li>{String} cellphoneNumber شماره موبایل</li>
     *      <li>{String} code کد ارسالی</li>
     *      <li>{String} [newCode] رمز عبور کاربر</li>
     *      <li>{String} nickName نام مستعار</li>
     *      <li> {JSONObject} [setting]
     *          <ul>
     *              <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر کاربر</li>
     *              <li>{Integer} [imageHeight] اندازه رزولیشن عمودی تصویر کاربر</li>
     *          </ul>
     *      </li>
     *  </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{String} id</li>
     *                  <li>{String} name</li>
     *                  <li>{String} token</li>
     *                  <li>{JSONObject} [image]
     *                      <ul>
     *                          <li>{String} id</li>
     *                          <li>{String} url</li>
     *                          <li>{Integer} width</li>
     *                          <li>{Integer} height</li>
     *                      </ul>
     *                  </li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void verifyWithCompleteProfileRequest(JSONObject params, final RequestCallback callback) throws ServiceException {

        try {
            String cellphoneNumber = (params.has("cellphoneNumber") && !params.isNull("cellphoneNumber")) ? params.getString("cellphoneNumber") : null;
            String code = (params.has("code") && !params.isNull("code")) ? params.getString("code") : null;
            String nickName = (params.has("nickName") && !params.isNull("nickName")) ? params.getString("nickName") : null;

            if (cellphoneNumber == null) {
                throw new ServiceException("cellphoneNumber not exist in params");
            } else {
                if (!isCellphoneNumber(cellphoneNumber)) {
                    throw new ServiceException("cellphoneNumber is not valid");
                }
            }

            if (code == null) {
                throw new ServiceException("code not exist in params");
            } else if (code.length() < 4) {
                throw new ServiceException("code length is lower than 4");
            }
            if (nickName == null) {
                throw new ServiceException("nickName not exist in params");
            } else if (nickName.length() < 3) {
                throw new ServiceException("nickName length is lower than 3");
            }

            if (userData.has("peerId")) {
                params.put("peerId", userData.getLong("peerId"));
            }
            params.put("deviceId", deviceId);

            Integer imageWidth = null;
            Integer imageHeight = null;

            if (params.has("setting") && !params.isNull("setting")) {
                JSONObject setting = params.getJSONObject("setting");
                if (setting != null) {
                    if (setting.has("imageWidth")) {
                        imageWidth = setting.getInt("imageWidth");
                    }

                    if (setting.has("imageHeight")) {
                        imageHeight = setting.getInt("imageHeight");
                    }
                }
            }

            final Integer finalImageWidth = imageWidth;
            final Integer finalImageHeight = imageHeight;

            request(RequestUrls.VERIFY_AND_COMPLETE_PROFILE, params, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result){

                    JSONObject returnData = new JSONObject();

                    try {
                        boolean hasError = result.getBoolean("HasError");

                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getString("ErrorCode"));
                        JSONObject reqResult = null;
                        if (result.has("Result") && !result.isNull("Result")) {
                            reqResult = result.getJSONObject("Result");
                        }
                        if (!hasError) {

                            if (reqResult != null) {
                                returnData.put("loginState", true);
                                String userId = reqResult.getString("UserID");
                                String name = reqResult.getString("Name");
                                String token = reqResult.getString("Token");
                                JSONObject retResult = new JSONObject();
                                retResult.put("id", userId);
                                retResult.put("name", name);
                                retResult.put("token", token);

                                JSONObject image = null;
                                if (reqResult.has("Image") && !reqResult.isNull("Image")) {
                                    image = reqResult.getJSONObject("Image");
                                    image.put("id", image.get("id").toString());
                                    retResult.put("image", image);
                                    image.remove("Image");
                                }

                                returnData.put("result", retResult);

                                JSONObject uData = new JSONObject();
                                userData.put("id", userId);
                                userData.put("name", name);
                                userData.put("image", image);
                                userData.put("token",token);
                                userData.put("tokenIssuer", 0);
                                userData.put("guest", false);

                                loginAction(uData);
//                                loginAction(userId, name, token, image, false, null);
                            } else {
                                returnData.put("loginState", false);
                            }
                        }

                    } catch (Exception e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);

                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }

    }

    /**
     * <div style='width: 100%;text-align: right'>تکمیل پروفایل کاربر</div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *       JSONObject reqData = new JSONObject();
     *       reqData.put("cellphoneNumber","cellphoneNumber");
     *       reqData.put("nickName", "nickName");
     *       service.completeProfileRequest(reqData, new RequestCallback() {
     *           {@code @Override}
     *           public void onResult(JSONObject result) {
     *               System.out.println("completeProfileRequest method : " + result);
     *           }
     *       });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} cellphoneNumber شماره موبایل</li>
     *          <li>{String} nickName نام مستعار</li>
     *          <li>{String} [firstName] نام </li>
     *          <li>{String} [lastName] نام خانوادگی</li>
     *          <li>{String} [email] ایمیل</li>
     *          <li>{String} [gender] مرد=MAN_GENDER or زن=WOMAN_GENDER ,   جنسیت </li>
     *          <li> {JSONObject} [setting]
     *              <ul>
     *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر کاربر</li>
     *                  <li>{Integer} [imageHeight] اندازه رزولیشن عمودی تصویر کاربر</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{String} id</li>
     *                  <li>{String} name</li>
     *                  <li>{String} token</li>
     *                  <li>{JSONObject} [image]
     *                      <ul>
     *                          <li>{String} id</li>
     *                          <li>{String} url</li>
     *                          <li>{Integer} width</li>
     *                          <li>{Integer} height</li>
     *                      </ul>
     *                  </li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void completeProfileRequest(JSONObject params, final RequestCallback callback) throws ServiceException {
        try {
            String cellphoneNumber = (params.has("cellphoneNumber") && !params.isNull("cellphoneNumber")) ? params.getString("cellphoneNumber") : null;
            String nickName = (params.has("nickName") && !params.isNull("nickName")) ? params.getString("nickName") : null;

            if (cellphoneNumber == null) {
                throw new ServiceException("cellphoneNumber not exist in params");
            } else {
                if (!isCellphoneNumber(cellphoneNumber)) {
                    throw new ServiceException("cellphoneNumber is not valid");
                }
            }

            if (nickName == null) {
                throw new ServiceException("nickName not exist in params");
            } else if (nickName.length() < 3) {
                throw new ServiceException("nickName length is lower than 3");
            }

            if (userData.has("peerId")) {
                params.put("peerId", userData.getLong("peerId"));
            }
            params.put("deviceId", deviceId);

            request(RequestUrls.COMPLETE_PROFILE, params, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result) {

                    JSONObject returnData = new JSONObject();

                    try {
                        boolean hasError = result.getBoolean("HasError");

                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getString("ErrorCode"));
                        JSONObject reqResult = null;
                        if (result.has("Result") && !result.isNull("Result")) {
                            reqResult = result.getJSONObject("Result");
                        }
                        if (!hasError) {

                            if (reqResult != null) {
                                returnData.put("loginState", true);
                                String userId = reqResult.getString("UserID");
                                String name = reqResult.getString("Name");
                                String token = reqResult.getString("Token");
                                JSONObject retResult = new JSONObject();
                                retResult.put("id", userId);
                                retResult.put("name", name);
                                retResult.put("token", token);

                                JSONObject image = null;
                                if (reqResult.has("Image") && !reqResult.isNull("Image")) {
                                    image = reqResult.getJSONObject("Image");
                                    image.put("id", image.get("id").toString());
                                    retResult.put("image",image);
                                }

                                returnData.put("result", retResult);

                                JSONObject uData = new JSONObject();
                                userData.put("id", userId);
                                userData.put("name", name);
                                userData.put("image", image);
                                userData.put("token",token);
                                userData.put("tokenIssuer", 0);
                                userData.put("guest", false);

                                loginAction(uData);
//                                loginAction(userId, name, token,image,false,null);
                            } else {
                                returnData.put("loginState", false);
                            }
                        }

                    } catch (Exception e) {
                        returnData = ExceptionErrorData(e);
                    }

                    callback.onResult(returnData);

                }
            });


        } catch (JSONException e) {
            throw new ServiceException(e);
        }

    }

    /**
     * <div style='width: 100%;text-align: right'> درخواست ارسال دوباره رمز عبور</div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *            JSONObject reqData = new JSONObject();
     *            reqData.put("cellphoneNumber",cellphoneNumber);
     *            service.forgetPasswordRequest(reqData, new RequestCallback() {
     *                {@code @Override}
     *                public void onResult(JSONObject result) {
     *                    System.out.println("forgetPasswordRequest method : " + result);
     *                }
     *            });
     *  </code>
     * </pre>
     *  @param  params
     *      <ul>
     *          <li>{String} cellphoneNumber شماره موبایل</li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{Boolean} result </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void forgetPasswordRequest(JSONObject params, final RequestCallback callback)  throws ServiceException {
        try {
            String cellphoneNumber = (params.has("cellphoneNumber") && !params.isNull("cellphoneNumber")) ? params.getString("cellphoneNumber") : null;

            if (cellphoneNumber == null) {
                throw new ServiceException("cellphoneNumber not exist in params");
            }

            if (!isCellphoneNumber(cellphoneNumber)) {
                throw new ServiceException("cellphoneNumber is not valid");
            }
            JSONObject requestData = new JSONObject();
            requestData.put("deviceId", deviceId);
            requestData.put("cellphoneNumber", cellphoneNumber);

            request(RequestUrls.FORGET_PASSWORD, requestData, new Network.HttpRequestCallback() {

                @Override
                public void onResult(JSONObject result) {

                    JSONObject returnData = new JSONObject();
                    try {
                        Boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        if (!hasError) {
                            returnData.put("result", result.getBoolean("Result"));
                        }

                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }

                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     *  <div style='width: 100%;text-align: right'> ثبت نام</div>
     *  <pre>
     *      <code style='float:right'>نمونه کد</code>
     *      <code>
     *          JSONObject reqData = new JSONObject();
     *          reqData.put("gameId","55");
     *          reqData.put("suggestion", "suggestion");
     *          reqData.put("email", "email");//optional
     *          reqData.put("name", "name");//optional
     *          reqData.put("metaData", "metaData");//optional
     *          reqData.put("type", 2);//optional
     *
     *          service.suggestionRequest(reqData, new RequestCallback() {
     *              {@code @Override}
     *              public void onResult(JSONObject result) {
     *                  System.out.println("suggestionRequest method : " + result);
     *              }
     *          });
     *      </code>
     * </pre>
     *  @param  params
     *      <ul>
     *          <li>{String} gameId شناسه بازی</li>
     *          <li>{String} suggestion توضیحات</li>
     *          <li>{Integer} [type=1] نوع
     *              <p>1 = Suggestion پیشنهاد</p>
     *              <p>2 = User Repor گزارش یک کاربر</p>
     *              <p>3 = Bug Report گزارش خطا</p>
     *          </li>
     *          <li>{String} [name] نام</li>
     *          <li>{String} [email] ایمیل</li>
     *          <li>{String} [metaData] اطلاعات اضافه</li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void suggestionRequest(JSONObject params, final RequestCallback callback) throws ServiceException {

        try {
            String gameId = (params.has("gameId") && !params.isNull("gameId")) ? params.get("gameId").toString() : null;
            String suggestion = (params.has("suggestion") && !params.isNull("suggestion")) ? params.getString("suggestion") : null;
            Integer type = params.has("type") ? params.getInt("type") : null;
            if (gameId == null) {
                throw new ServiceException("gameId not exist in params");
            }

            if (suggestion == null) {
                throw new ServiceException("gameId not exist in params");
            }

            if (type == null) {
                params.put("type", 1);
            }

            params.put("report", suggestion);
            params.remove("suggestion");


            request(RequestUrls.SUGGESTION, params, new Network.HttpRequestCallback() {

                @Override
                public void onResult(JSONObject result){
                    JSONObject returnData = new JSONObject();
                    try {
                        returnData.put("hasError", result.getBoolean("HasError"));
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));
                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }

                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }


    /**
     * <div style='width: 100%;text-align: right'>دریافت کاربران آنلاین یک لیگ </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *       JSONObject reqData = new JSONObject();
     *       reqData.put("size", 10);
     *       reqData.put("gameId", "gameId");
     *       reqData.put("leagueId", "leagueId");
     *       service.getOnlineUser(reqData, new RequestCallback() {
     *           {@code @Override}
     *           public void onResult(JSONObject data) {
     *               System.out.println("getOnlineUser method : " + data);
     *           }
     *       });
     *  </code>
     * </pre>
     *  @param  params
     *      <ul>
     *          <li>{String} gameId شناسه بازی</li>
     *          <li>{String} leagueId شناسه لیگ</li>
     *          <li>{String} [offset=0]</li>
     *          <li>{String} [size]</li>
     *          <li>{String} [filter] نام کاربر</li>
     *          <li>{JSONObject} [setting]
     *              <ul>
     *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر کاربر</li>
     *                  <li>{Integer} [imageHeight] اندازه رزولیشن عمودی تصویر کاربر</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{JSONObject} users - مقدار کلید های این آبجکت شناسه کاربران می باشد و مقدار آن نیز اطلاعات کاربر :
     *                      <ul>
     *                          <li>{String} name</li>
     *                          <li>{JSONObject} [image]
     *                              <ul>
     *                                  <li>{String} id</li>
     *                                  <li>{String}  url</li>
     *                                  <li>{Integer} width</li>
     *                                  <li>{Integer} height</li>
     *                              </ul>
     *                          </li>
     *                      </ul>
     *                  </li>
     *                  <li>{Boolean} result.hasNext</li>
     *                  <li>{Integer} result.nextOffset</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getOnlineUser(JSONObject params, final RequestCallback callback) throws ServiceException {

        try {

            String gameId = params.has("gameId") ? params.get("gameId").toString() : null;
            String leagueId = params.has("leagueId") ? params.get("leagueId").toString() : null;

            if (gameId == null) {
                throw new ServiceException("gameId not exist in params");
            }

            if (leagueId == null) {
                throw new ServiceException("leagueId not exist in params");
            }

            Integer size = params.has("size") ? params.getInt("size") : ConfigData.gous;
            Integer offset = params.has("offset") ? params.getInt("offset") : 0;
            String filter = params.has("filter") ? params.getString("filter") : null;

            Integer imageWidth = null;
            Integer imageHeight = null;

            if (params.has("setting") && !params.isNull("setting")) {
                JSONObject setting = params.getJSONObject("setting");
                if (setting != null) {
                    if (setting.has("imageWidth")) {
                        imageWidth = setting.getInt("imageWidth");
                    }

                    if (setting.has("imageHeight")) {
                        imageHeight = setting.getInt("imageHeight");
                    }
                }
            }
            JSONObject requestData = new JSONObject();
            requestData.put("gameId", gameId);
            requestData.put("leagueId", leagueId);

            requestData.put("index", offset);
            requestData.put("count", size);

            if (filter != null) {
                requestData.put("filter", filter);
            }

            getOnlineUser(requestData, imageWidth, imageHeight, callback);

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'> درخواست بازی </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("gameId", "gameId");
     *      reqData.put("leagueId", "leagueId");
     *      reqData.put("opponentId", "userId");
     *
     *      service.matchRequest(reqData, new MatchRequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject data) {
     *              System.out.println("matchRequest method -- onResult : " + data);
     *          }
     *          {@code @Override}
     *          public void onAccept(JSONObject data) {
     *              System.out.println("matchRequest method -- onAccept : " + data);
     *          }
     *          {@code @Override}
     *          public void onReject(JSONObject data) {
     *              System.out.println("matchRequest method -- onReject : " + data);
     *          }
     *          {@code @Override}
     *          public void onCancel(JSONObject data) {
     *              System.out.println("matchRequest method -- onCancel : " + data);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} opponentId</li>
     *          <li>{String} gameId</li>
     *          <li>{String} leagueId</li>
     *          <li>{Boolean} [isOffline=false]</li>
     *          <li>{Integer} [requestTime] -  for offline request</li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{JSONObject} requestId - شناسه درخواست </li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void matchRequest(JSONObject params, final MatchRequestCallback callback) throws ServiceException {

        try {
            String gameId = (params.has("gameId") && !params.isNull("gameId")) ? params.get("gameId").toString() : null;
            final String leagueId = (params.has("leagueId") && !params.isNull("leagueId")) ? params.get("leagueId").toString() : null;
            final String opponentId = (params.has("opponentId") && !params.isNull("opponentId")) ? params.get("opponentId").toString() : null;
            RequestUrls.UrlData requestUrl = RequestUrls.REQUEST_MATCH;
            JSONObject requestData = new JSONObject();

            if (gameId == null) {
                throw new ServiceException("gameId not exist in params");
            }

            if (leagueId == null) {
                throw new ServiceException("leagueId not exist in params");
            }

            if (opponentId == null) {
                throw new ServiceException("opponentId not exist in params");
            }

            final boolean isOffline = (params.has("isOffline") && !params.isNull("isOffline")) && params.getBoolean("isOffline");

            if (isOffline) {
                requestUrl = RequestUrls.OFFLINE_MATCH_REQUEST;
                requestData.put("opponentUserId", opponentId);
                requestData.put("gameId", gameId);
                requestData.put("leagueId", leagueId);

                if (params.has("requestTime") && !params.isNull("requestTime")) {
                    requestData.put("timestamp", params.getInt("requestTime"));
                }

            } else {

                if (!isMultiTab && (isGameRun() || currentMatchRequestCount > 0)) {
                    JSONObject retData = new JSONObject();

                    String errorMessage = dic.getJSONObject("CANTNOTREQUESTINPLAING").getString(lang);
                    if(currentMatchRequestCount > 0) {
                        errorMessage = dic.getJSONObject("WAITFORPREVIOUSREQUEST").getString(lang);
                    }
                    retData.put("hasError", true);
                    retData.put("errorMessage", errorMessage);

                    callback.onResult(retData);
                    return;
                }

                log.info("matchRequest__ " + network.getSocketConnectionState()  + " " + userData.toString());
                if (!network.getSocketConnectionState() || ! userData.has("peerId") || userData.isNull("peerId")) {
                    JSONObject returnData = new JSONObject();
                    returnData.put("hasError", true);
                    returnData.put("errorCode", ErrorCodes.USER_NOT_CONNECTED);
                    returnData.put("errorMessage", dic.getJSONObject("CONNECTINGTOPUSH").getString(lang));
                    callback.onResult(returnData);
                    return;
                }
                currentMatchRequestCount += 1;
                requestData.put("opponentId", opponentId);
                requestData.put("gameId", gameId);
                requestData.put("leagueId", leagueId);
                requestData.put("id", 0);
                requestData.put("sessionId", userData.get("peerId").toString());

                String gameVersion = null;

                if (params.has("version") && ! params.isNull("version")) {
                    gameVersion = params.getString("version");
                } else {
                    if (games.has(gameId) && ! params.isNull(gameId)) {
                        gameVersion = games.getJSONObject(gameId).getString("version");
                    }
                }

                if (gameVersion == null) {
                    throw new ServiceException("version not exist in params");
                }

                requestData.put("version", gameVersion);

//                requestData.put("request", requestData.toString());
            }

            request(requestUrl, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result) {

                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);

                        if (hasError) {
                            if (!isOffline) {
                                currentMatchRequestCount -= 1;
                            }
                            returnData.put("errorMessage", result.getString("ErrorMessage"));
                            returnData.put("errorCode", result.getInt("ErrorCode"));
                        } else {
                            returnData.put("errorMessage", "");

                            JSONObject retRes = new JSONObject();

                            if (!isOffline) {

                                final String requestId = result.getJSONObject("Result").get("requestId").toString();
                                requestIdLeague.put(requestId, leagueId);
                                HashMap leaguesRequest = activeMatchRequest.get(leagueId);
                                if (leaguesRequest == null) {
                                    leaguesRequest = new HashMap();
                                    activeMatchRequest.put(leagueId, leaguesRequest);
                                }


                                String timeoutId = Util.setTimeout(new Util.SetTimeoutCallback() {
                                    @Override
                                    public void onDone() {

                                        try {
                                            HashMap leaguData = (HashMap) activeMatchRequest.get(leagueId);
                                            if (leaguData.get(requestId) != null) {
                                                currentMatchRequestCount -= 1;
                                                leaguData.remove(requestId);
                                                JSONObject data = new JSONObject();
                                                data.put("requestId", requestId);
                                                callback.onCancel(data);
                                            }
                                        } catch (JSONException e) {
                                            e.printStackTrace();
                                        }

                                    }

                                }, ConfigData.mrt);

                                HashMap requestData = new HashMap();
                                requestData.put("opponentId", opponentId);
                                requestData.put("timeoutId", timeoutId);
                                requestData.put("callback", callback);

                                leaguesRequest.put(requestId, requestData);

                                retRes.put("requestId", requestId);
                            }

                            returnData.put("result", retRes);
                        }


                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }

                    callback.onResult(returnData);

                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'>لغو درخواست مسابقه </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *     JSONObject reqData = new JSONObject();
     *     reqData.put("gameId", "gameId");
     *     reqData.put("leagueId", "leagueId");
     *     reqData.put("opponentId", userId);
     *
     *     // درخواست مسابقه
     *     service.matchRequest(reqData, new MatchRequestCallback() {
     *         {@code @Override}
     *         public void onResult(JSONObject result) {
     *             try {
     *                 boolean hasError = result.getBoolean("hasError");
     *                 if (!hasError) {
     *                     String requestId = result.getJSONObject("result").getString("requestId");// شناسه درخواست
     *                     JSONObject reqData = new JSONObject();
     *                     reqData.put("requestId", requestId);
     *                     // لغو درخواست
     *                     service.cancelMatchRequest(reqData, new RequestCallback() {
     *                         {@code @Override}
     *                         public void onResult(JSONObject result) {
     *                             System.out.println("cancelMatchRequest method : " + result);
     *                         }
     *                     });
     *                 }
     *             } catch (JSONException|ServiceException e) {
     *                 e.printStackTrace();
     *             }
     *         }
     *     });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} requestId - شناسه درخواست</li>
     *      </ul>
     *
     * @param  res
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void cancelMatchRequest(JSONObject params, final RequestCallback res) throws ServiceException{

        try {
            final String requestId = (params.has("requestId") && !params.isNull("requestId")) ? params.get("requestId").toString() : null;

            if (requestId == null) {
                throw new ServiceException("requestId not exist in params");
            }

            JSONObject requestData = new JSONObject();
            requestData.put("requestId", requestId);

            request(RequestUrls.CANCEL_MATCH_REQUEST, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result) {

                    try {
                        boolean hasError = result.getBoolean("HasError");
                        JSONObject returnData = new JSONObject();
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        String leagueId = requestIdLeague.get(requestId);
                        if (!hasError) {
                            currentMatchRequestCount -= 1;
                            if (leagueId != null) {
                                HashMap leaguData = (HashMap) activeMatchRequest.get(leagueId);
                                if (leaguData.get(requestId) != null) {
                                    leaguData.remove(requestId);
                                }
                            }
                        }
                        res.onResult(returnData);
                    } catch (JSONException e) {
                        res.onResult(ExceptionErrorData(e));
                    }
                }
            });
        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'>  درخواست شناسه بازی </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("gameId", gameId);
     *      reqData.put("leagueId", leagueId);
     *      service.matchIdRequest(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("matchIdRequest method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} gameId - شناسه بازی</li>
     *          <li>{String} leagueId - شناسه لیگ </li>
     *      </ul>
     *
     * @param callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{String} result.matchId - شناسه بازی</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void matchIdRequest(JSONObject params, final RequestCallback callback) throws ServiceException {
        try {
            String gameId = (params.has("gameId") && !params.isNull("gameId")) ? params.get("gameId").toString() : null;
            String leagueId = (params.has("leagueId") && !params.isNull("leagueId")) ? params.get("leagueId").toString() : null;

            if (gameId == null) {
                throw new JSONException("gameId not exist in params");
            }

            if (leagueId == null) {
                throw new JSONException("leagueId not exist in params");
            }

            JSONObject requestData = new JSONObject();
            requestData.put("gameId", gameId);
            requestData.put("leagueId", leagueId);


            request(RequestUrls.REQUEST_MATCH_ID, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result) {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        JSONObject retResult = new JSONObject();

                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getString("ErrorCode"));
                        returnData.put("result", retResult);

                        if (!hasError) {
                            retResult.put("matchId", result.getJSONObject("Result").get("ID").toString());
                        }

                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }

                    callback.onResult(returnData);

                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'> استریم درخواست شناسه بازی </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("gameId", gameId);
     *      reqData.put("leagueId", leagueId);
     *      service.streamMatchIdRequest(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("streamMatchIdRequest method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} gameId - شناسه بازی</li>
     *          <li>{String} leagueId - شناسه لیگ </li>
     *          <li>{Integer} clientType -
     *              1 => WEB
     *              2 => ANDROID
     *              3 => PC
     *          </li>
     *      </ul>
     *
     * @param callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{String} matchId - شناسه بازی</li>
     *                  <li>{String} ip </li>
     *                  <li>{Integer} ws </li>
     *                  <li>{Integer} wss </li>
     *                  <li>{Integer} io </li>
     *                  <li>{Integer} rtsp </li>
     *                  <li>{Integer} width </li>
     *                  <li>{Integer} height </li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void streamMatchIdRequest(JSONObject params, final RequestCallback callback) throws ServiceException {
        try {
            String gameId = (params.has("gameId") && !params.isNull("gameId")) ? params.get("gameId").toString() : null;
            String leagueId = (params.has("leagueId") && !params.isNull("leagueId")) ? params.get("leagueId").toString() : null;
            Integer clientType = (params.has("clientType") && !params.isNull("clientType")) ? params.getInt("clientType") : null;

            if (gameId == null && leagueId == null) {
                throw new JSONException("gameId or leagueId not exist in params");
            }

            if (clientType == null) {
                throw new JSONException("clientType not exist in params");
            }



            JSONObject requestData = new JSONObject();
            requestData.put("clientType", clientType);

            if (gameId != null) {
                requestData.put("gameId", gameId);
            }

            if (leagueId != null) {
                requestData.put("leagueId", leagueId);
            }

            if (userData.has("peerId") && !userData.isNull("peerId")) {
                requestData.put("peerIds", userData.get("peerId"));
            }


            request(RequestUrls.REQUEST_STREAM_MATCH_ID, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result) {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        JSONObject retResult = new JSONObject();

                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getString("ErrorCode"));
                        returnData.put("result", retResult);

                        if (!hasError) {
                            JSONObject innerResult = result.getJSONObject("Result");
                            retResult.put("matchId", innerResult.get("matchId").toString());

                            retResult.put("ip", innerResult.get("ip"));


                            if (innerResult.has("ws") && !innerResult.isNull("ws")) {
                                retResult.put("ws", innerResult.get("ws"));
                            }

                            if (innerResult.has("wss") && !innerResult.isNull("wss")) {
                                retResult.put("wss", innerResult.get("wss"));
                            }

                            if (innerResult.has("io") && !innerResult.isNull("io")) {
                                retResult.put("io", innerResult.get("io"));
                            }
                            if (innerResult.has("rtsp") && !innerResult.isNull("rtsp")) {
                                retResult.put("rtsp", innerResult.get("rtsp"));
                            }

                            if (innerResult.has("w") && !innerResult.isNull("w")) {
                                retResult.put("width", innerResult.get("w"));
                            }

                            if (innerResult.has("h") && !innerResult.isNull("h")) {
                                retResult.put("height", innerResult.get("h"));
                            }

                        }

                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }

                    callback.onResult(returnData);

                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     *
     * <div style='width: 100%;text-align: right'> دریافت اطلاعات لیگ </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("gameId", "2");
     *      reqData.put("size", 10);
     *
     *      service.getLeaguesInfo(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getLeaguesInfo method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} [gameId] - شناسه بازی</li>
     *          <li>{String} [leagueId] - شناسه لیگ</li>
     *          <li>{JSONArray} [leaguesId] -ها شناسه لیگ</li>
     *          <li>{Integer} [size=5]</li>
     *          <li>{Integer} [offset=0]</li>
     *          <li>{String} [name] - نام لیگ</li>
     *          <li>{Integer} [prize=0] - نوع لیگ از نظر جایزه
     *              <p>    0 = تمام موارد</p>
     *              <p>    1 = جایزه دار</p>
     *              <p>    2 = عدم داشتن جایزه</p>
     *          </li>
     *          <li>{Integer} [status=0] - نوع لیگ از نظر وضعیت
     *              <p>    0 = تمام موارد</p>
     *              <p>    1 = شروع نشده</p>
     *              <p>    2 = در حال ثبت نام</p>
     *              <p>    3 = در حال اجرا</p>
     *              <p>    4 = تمام شده</p>
     *              <p>    5 = در حال اجرا و ثبت نام</p>
     *              <p>    6 = حساب رسی شذه</p>
     *              <p>    7 = رد شده</p>
     *              <p>    8 = کنسل شده</p>
     *              <p>    9 =در حال بررسی</p>
     *              <p>    10 = نیاز به تغییرات</p>
     *          </li>
     *          <li>{JSONArray} [statusList] - وضعیت های لیگ </li>
     *          <li>{Integer} [financialType=0] - نوع لیگ بر اساس حق عضویت
     *              <p>    0 = تمام موارد</p>
     *              <p>    1 = رایگان</p>
     *              <p>    2 = پولی</p>
     *          </li>
     *          <li>{Integer} [userState=0] - نوع لیگ بر اساس وضعیت کاربر
     *              <p>     0 = تمام موارد</p>
     *              <p>     1 = عضو شده</p>
     *              <p>     2 =</p>
     *              <p>     3 = عضو نشده</p>
     *          </li>
     *          <li>{Boolean} [showDefault=true] - وجود یا عدم وجود لیگ پیش فرض</li>
     *          <li>{Boolean} [newest=false] - دریافت جدیدترین لیگ ها</li>
     *          <li>{String} [lobbyId] - شناسه دسته بازی</li>
     *          <li> {JSONObject} [setting]
     *              <ul>
     *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر لیگ</li>
     *                  <li>{Integer} [imageHeight] اندازه رزولیشن عمودی تصویر لیگ</li>
     *              </ul>
     *          </li>
     *      </ul>
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONArray} result
     *              <ul>
     *                  <li>{JSONArray} leagues
     *                      <ul>
     *                          <li>{String} id </li>
     *                          <li>{String} enrollUrl</li>
     *                          <li>{Boolean} isMember </li>
     *                          <li>{Boolean} isFollower</li>
     *                          <li>{JSONObject} userPostInfo
     *                              <ul>
     *                                  <li>{Boolean} favorite</li>
     *                                  <li>{Boolean} liked</li>
     *                                  <li>{String} postId</li>
     *                              </ul>
     *                          </li>
     *                          <li>{JSONObject} image
     *                              <ul>
     *                                  <li>{String} id</li>
     *                                  <li>{String} url</li>
     *                                  <li>{Integer} width</li>
     *                                  <li>{Integer} height</li>
     *                              </ul>
     *                          </li>
     *                          <li>{Integer} gameType</li>
     *                          <li>{Integer} playerType</li>
     *                          <li>{Integer} status</li>
     *                          <li>{Integer} financialType</li>
     *                          <li>{Integer} lobbyId</li>
     *                          <li>{Integer} maxPlayers</li>
     *                          <li>{Integer} minNoOfPlayedGames</li>
     *                          <li>{Integer} minPlayers</li>
     *                          <li>{Integer} memberCount</li>
     *                          <li>{Integer} playerNumberType</li>
     *                          <li>{Integer} timestamp</li>
     *                          <li>{String} creator</li>
     *                          <li>{Integer} memberCount</li>
     *                          <li>{Integer} availableCount</li>
     *                          <li>{Integer} discount</li>
     *                          <li>{Integer} numOfComments</li>
     *                          <li>{Integer} numOfFavorites</li>
     *                          <li>{Integer} numOfLikes</li>
     *                          <li>{Integer} type</li>
     *                          <li>{Integer} [endTime]</li>
     *                          <li>{Integer} [startTime]</li>
     *                          <li>{String} rules</li>
     *                          <li>{String} description</li>
     *                          <li>{String} name</li>
     *                          <li>{String} ThreadId</li>
     *                          <li>{String} timelineId</li>
     *                          <li>{Boolean} hasPrize</li>
     *                          <li>{Boolean} quickMatch</li>
     *                          <li>{Boolean} startTypeCapacityComplete</li>
     *                          <li>{Boolean} startTypeFromDate</li>
     *                          <li>{Boolean} startTypePublishDate</li>
     *                          <li>{Boolean} canComment</li>
     *                          <li>{Boolean} canLike</li>
     *                          <li>{Boolean} enable</li>
     *                          <li>{Boolean} hide</li>
     *                          <li>{Double} price</li>
     *                          <li>{JSONArray} attributeValues</li>
     *                          <li>{JSONArray} categoryList</li>
     *                          <li>{JSONObject} business</li>
     *                          <li>{JSONObject} rate</li>
     *                          <li>{JSONArray} games</li>
     *                      </ul>
     *                  </li>
     *                  <li>{Boolean} hasNext</li>
     *                  <li>{Integer} nextOffset</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getLeaguesInfo(JSONObject params, final RequestCallback callback) throws ServiceException {

        try {

            final JSONObject requestData = new JSONObject();

            final String gameId = (params.has("gameId") && !params.isNull("gameId")) ? params.get("gameId").toString() : null;
            final String lobbyId = (params.has("lobbyId") && !params.isNull("lobbyId")) ? params.get("lobbyId").toString() : null;

            if (gameId != null) {
                requestData.put("gameId", gameId);
            }

            RequestUrls.UrlData requestUrl = RequestUrls.GET_LEAGUE;
            String leagueId = (params.has("leagueId") && !params.isNull("leagueId")) ? params.get("leagueId").toString() : null;
            JSONArray leaguesId = (params.has("leaguesId") && !params.isNull("leaguesId")) ? params.getJSONArray("leaguesId") : null;


            Integer imageWidth = null;
            Integer imageHeight = null;

            if (params.has("setting") && !params.isNull("setting")) {
                JSONObject setting = params.getJSONObject("setting");
                if (setting != null) {
                    if (setting.has("imageWidth")) {
                        imageWidth = setting.getInt("imageWidth");
                    }

                    if (setting.has("imageHeight")) {
                        imageHeight = setting.getInt("imageHeight");
                    }
                }
            }

            if (lobbyId != null) {
                requestData.put("lobbyId", lobbyId);
            }

            if (leagueId != null || leaguesId != null) {

                if (leaguesId != null) {
                    requestData.put("leaguesId", leaguesId.toString());
                }

                if (leagueId != null) {
                    requestData.put("leagueId", leagueId);
                }

            } else {

                Integer size = (params.has("size") && !params.isNull("size")) ? params.getInt("size") : null;
                Integer offset = (params.has("offset") && !params.isNull("offset")) ? params.getInt("offset") : null;
                Boolean newest = (params.has("newest") && !params.isNull("newest")) ? params.getBoolean("newest") : null;

                if (size != null) {
                    requestData.put("size", size);
                } else {
                    requestData.put("size", ConfigData.gldc);
                }

                if (offset != null) {
                    requestData.put("offset", offset);
                } else {
                    requestData.put("offset", 0);
                }

                if (newest != null) {
                    requestUrl = RequestUrls.GET_LATEST_LEAGUE;
                } else {

                    String name = (params.has("name") && !params.isNull("name")) ? params.getString("name") : null;
                    Integer prize = (params.has("prize") && !params.isNull("prize")) ? params.getInt("prize") : null;
                    Integer userState = (params.has("userState") && !params.isNull("userState")) ? params.getInt("userState") : null;
                    Integer status = (params.has("status") && !params.isNull("status")) ? params.getInt("status") : null;
                    JSONArray statusList = (params.has("statusList") && !params.isNull("statusList")) ? params.getJSONArray("statusList") : null;
                    Integer financialType = (params.has("financialType") && !params.isNull("financialType")) ? params.getInt("financialType") : null;
                    Boolean showDefault = (params.has("showDefault") && !params.isNull("showDefault")) ? params.getBoolean("showDefault") : null;

                    if (name != null) {
                        requestData.put("filter", name);
                    }
                    if (prize != null) {
                        if (prize == 1) {
                            requestData.put("hasPrize", true);
                        } else if (prize == 2) {
                            requestData.put("hasPrize", false);
                        }
                    }

                    if (userState != null) {
                        if (userState == 1) {
                            requestData.put("mine", true);
                        } else if (userState == 3) {
                            requestData.put("mine", false);
                        }
                    }

                    if (status != null) {
                        requestData.put("status", status);

                    } else if (statusList != null) {
                        requestData.put("statusList", statusList.toString());
                    } else {
                        requestData.put("status", 0);
                    }

                    if (showDefault != null) {
                        requestData.put("showDefault", showDefault);
                    }

                    if (financialType != null) {
                        requestData.put("financialType", financialType);
                    } else {
                        requestData.put("financialType", 0);
                    }
                }

            }

            final Integer finalImageWidth = imageWidth;
            final Integer finalImageHeight = imageHeight;
            request(requestUrl, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result){
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        if (!hasError) {
                            JSONArray leagues = result.getJSONArray("Result");
                            JSONArray refactorLeagues = new JSONArray();

                            for (int i = 0; i < leagues.length(); i++) {
                                refactorLeagues.put(reformatLeagueObject(leagues.getJSONObject(i), finalImageWidth, finalImageHeight));
                            }

                            JSONObject retResult = new JSONObject();
                            retResult.put("leagues", refactorLeagues);
                            if (requestData.has("size")) {
                                retResult.put("hasNext", requestData.getInt("size") == leagues.length());
                                retResult.put("nextOffset", requestData.getInt("offset") + leagues.length());
                            }
                            retResult.put("count", result.get("Count"));


                            returnData.put("result", retResult);
                        }
                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }

                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     *
     * <div style='width: 100%;text-align: right'>دریافت لیگ های مرتبط </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("leagueId", "3");
     *      reqData.put("size", 10);
     *      reqData.put("type", 1);
     *
     *      service.getRelatedLeaguesInfo(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getLeaguesInfo method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} leagueId - شناسه لیگ</li>
     *          <li>{Integer} [size=10]</li>
     *          <li>{Integer} [offset=0]</li>
     *          <li>{Integer} [type] - نوع لیگ
     *              <p>     1 = لیگ هایی که در یک لابی می باشند</p>
     *              <p>     2 = لیگ هایی که سازنده آنها یکی است</p>
     *          </li>
     *          <li> {JSONObject} [setting]
     *              <ul>
     *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر لیگ</li>
     *                  <li>{Integer} [imageHeight] اندازه رزولیشن عمودی تصویر لیگ</li>
     *              </ul>
     *          </li>
     *          <li></li>
     *       </ul>
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{JSONArray} CategoryEquality : $ - لیگ هایی که در یک لابی می باشند</li>
     *                  <li>{JSONArray} CreatorEquality : $ - لیگ هایی که سازنده آنها یکی است
     *                      <ul>
     *                          <li>{String} $.id</li>
     *                          <li>{String} $.enrollUrl</li>
     *                          <li>{Boolean} $.isMember</li>
     *                          <li>{Boolean} $.isFollower</li>
     *                          <li>{JSONObject} $.userPostInfo
     *                              <ul>
     *                                  <li>{Boolean} favorite</li>
     *                                  <li>{Boolean} liked</li>
     *                                  <li>{String} postId</li>
     *                              </ul>
     *                          </li>
     *                          <li>{JSONObject} $.image
     *                              <ul>
     *                                  <li>{String} id</li>
     *                                  <li>{String} url</li>
     *                                  <li>{Integer} width</li>
     *                                  <li>{Integer} height</li>
     *                              </ul>
     *                          </li>
     *                          <li>{Integer} $.gameType</li>
     *                          <li>{Integer} $.playerType</li>
     *                          <li>{Integer} $.status</li>
     *                          <li>{Integer} $.financialType</li>
     *                          <li>{Integer} $.lobbyId</li>
     *                          <li>{Integer} $.maxPlayers</li>
     *                          <li>{Integer} $.minNoOfPlayedGames</li>
     *                          <li>{Integer} $.minPlayers</li>
     *                          <li>{Integer} $.memberCount</li>
     *                          <li>{Integer} $.playerNumberType</li>
     *                          <li>{Integer} $.timestamp</li>
     *                          <li>{String} $.creator</li>
     *                          <li>{Integer} $.memberCount</li>
     *                          <li>{Integer} $.availableCount</li>
     *                          <li>{Integer} $.discount</li>
     *                          <li>{Integer} $.numOfComments</li>
     *                          <li>{Integer} $.numOfFavorites</li>
     *                          <li>{Integer} $.numOfLikes</li>
     *                          <li>{Integer} $.type</li>
     *                          <li>{Integer} [$.endTime]</li>
     *                          <li>{Integer} [$.startTime]</li>
     *                          <li>{String} $.rules</li>
     *                          <li>{String} $.description</li>
     *                          <li>{String} $.name</li>
     *                          <li>{String} $.ThreadId</li>
     *                          <li>{String} $.timelineId</li>
     *                          <li>{Boolean} $.hasPrize</li>
     *                          <li>{Boolean} $.quickMatch</li>
     *                          <li>{Boolean} $.startTypeCapacityComplete</li>
     *                          <li>{Boolean} $.startTypeFromDate</li>
     *                          <li>{Boolean} $.startTypePublishDate</li>
     *                          <li>{Boolean} $.canComment</li>
     *                          <li>{Boolean} $.canLike</li>
     *                          <li>{Boolean} $.enable</li>
     *                          <li>{Boolean} $.hide</li>
     *                          <li>{Double} $.price</li>
     *                          <li>{JSONArray} $.attributeValues</li>
     *                          <li>{JSONArray} $.categoryList</li>
     *                          <li>{JSONObject} $.business</li>
     *                          <li>{JSONObject} $.rate</li>
     *                      </ul>
     *                  </li>
     *                  <li>{Boolean} result.hasNext</li>
     *                  <li>{Integer} result.nextOffset</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getRelatedLeaguesInfo(JSONObject params, final RequestCallback callback) throws ServiceException{
        try {
            final String leagueId = (params.has("leagueId") && !params.isNull("leagueId")) ? params.get("leagueId").toString() : null;
            Integer type = (params.has("type") && !params.isNull("type")) ? params.getInt("type") : null;
            if (leagueId == null) {
                throw new ServiceException("leagueId not exist in params");
            }

            final JSONObject requestData = new JSONObject();

            requestData.put("leagueId", leagueId);
            if (type != null) {
                requestData.put("type", type);
            }

            final Integer size = (params.has("size") && !params.isNull("size")) ? params.getInt("size") : 10;
            final Integer offset = (params.has("offset") && !params.isNull("offset")) ? params.getInt("offset") : 0;
            requestData.put("size", size);
            requestData.put("offset", offset);

            Integer imageWidth = null;
            Integer imageHeight = null;

            if (params.has("setting") && !params.isNull("setting")) {
                JSONObject setting = params.getJSONObject("setting");
                if (setting != null) {
                    if (setting.has("imageWidth")) {
                        imageWidth = setting.getInt("imageWidth");
                    }

                    if (setting.has("imageHeight")) {
                        imageHeight = setting.getInt("imageHeight");
                    }
                }
            }

            final Integer finalImageWidth = imageWidth;
            final Integer finalImageHeight = imageHeight;
            request(RequestUrls.GET_RELATED_LEAGUE, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result) {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        if (!hasError) {
                            JSONObject allResult = result.getJSONObject("Result");
                            JSONObject retResult = new JSONObject();
                            boolean hasNext = false;

                            for (Iterator<String> i = allResult.keys(); i.hasNext(); ) {
                                String name = i.next();

                                if (allResult.has(name) && !allResult.isNull(name)) {
                                    JSONArray aLeagues = allResult.getJSONArray(name);
                                    JSONArray leagues = new JSONArray();

                                    if (aLeagues != null) {
                                        for (int j = 0; j < aLeagues.length(); j++) {
                                            JSONObject info = aLeagues.getJSONObject(j);
                                            leagues.put(reformatLeagueObject(info, finalImageWidth, finalImageHeight));
                                        }
                                        if (size == leagues.length()) {
                                            hasNext = true;
                                        }
                                        retResult.put(name, leagues);
                                    }
                                }
                            }
                            retResult.put("hasNext", hasNext);
                            retResult.put("nextOffset", offset + size);
                            returnData.put("result", retResult);
                        }

                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }

                    callback.onResult(returnData);
                }
            });
        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     *
     * <div style='width: 100%;text-align: right'> دریافت برترین لیگ ها</div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("type", type);
     *
     *      service.getTopLeaguesInfo(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getTopLeaguesInfo method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{Integer} [type]
     *              <p>     1 = برترین های گیم سنتر</p>
     *              <p>     8 = پیشنهاد گیم سنتر</p>
     *          </li>
     *          <li>{Integer} [size=5]</li>
     *          <li>{Integer} [offset=0]</li>
     *          <li>{String} [gameId]</li>
     *          <li>{JSONObject} [setting]
     *              <ul>
     *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر لیگ</li>
     *                  <li>{Integer} [imageHeight] اندازه رزولیشن عمودی تصویر لیگ</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{JSONArray} GcSuggestion : $ - پیشنهاد گیم سنتر</li>
     *                  <li>{Integer} GcSuggestionCount</li>
     *                  <li>{JSONArray} GcTop : $ - برترین های گیم سنتر</li>
     *                  <li>{JSONArray} GcTopCount</li>
     *                  <li>{JSONArray} TopFollow : $ - برترین دنبال شده ها</li>
     *                  <li>{JSONArray} TopFollowCount</li>
     *                  <li>{JSONArray} TopRateCount
     *                  <li>{JSONArray} TopRate : $ - برترین ها
     *                      <ul>
     *                          <li>{String} $.id</li>
     *                          <li>{String} $.enrollUrl</li>
     *                          <li>{Boolean} $.isMember</li>
     *                          <li>{Boolean} $.isFollower</li>
     *                          <li>{JSONObject} $.userPostInfo
     *                              <ul>
     *                                  <li>{Boolean} favorite</li>
     *                                  <li>{Boolean} liked</li>
     *                                  <li>{String} postId</li>
     *                              </ul>
     *                          </li>
     *                          <li>{JSONObject} $.image
     *                              <ul>
     *                                  <li>{String} id</li>
     *                                  <li>{String} url</li>
     *                                  <li>{Integer} width</li>
     *                                  <li>{Integer} height</li>
     *                              </ul>
     *                          </li>
     *                          <li>{Integer} $.gameType</li>
     *                          <li>{Integer} $.playerType</li>
     *                          <li>{Integer} $.status</li>
     *                          <li>{Integer} $.financialType</li>
     *                          <li>{Integer} $.lobbyId</li>
     *                          <li>{Integer} $.maxPlayers</li>
     *                          <li>{Integer} $.minNoOfPlayedGames</li>
     *                          <li>{Integer} $.minPlayers</li>
     *                          <li>{Integer} $.memberCount</li>
     *                          <li>{Integer} $.playerNumberType</li>
     *                          <li>{Integer} $.timestamp</li>
     *                          <li>{String} $.creator</li>
     *                          <li>{Integer} $.memberCount</li>
     *                          <li>{Integer} $.availableCount</li>
     *                          <li>{Integer} $.discount</li>
     *                          <li>{Integer} $.numOfComments</li>
     *                          <li>{Integer} $.numOfFavorites</li>
     *                          <li>{Integer} $.numOfLikes</li>
     *                          <li>{Integer} $.type</li>
     *                          <li>{Integer} [$.endTime]</li>
     *                          <li>{Integer} [$.startTime]</li>
     *                          <li>{String} $.rules</li>
     *                          <li>{String} $.description</li>
     *                          <li>{String} $.name</li>
     *                          <li>{String} $.ThreadId</li>
     *                          <li>{String} $.timelineId</li>
     *                          <li>{Boolean} $.hasPrize</li>
     *                          <li>{Boolean} $.quickMatch</li>
     *                          <li>{Boolean} $.startTypeCapacityComplete</li>
     *                          <li>{Boolean} $.startTypeFromDate</li>
     *                          <li>{Boolean} $.startTypePublishDate</li>
     *                          <li>{Boolean} $.canComment</li>
     *                          <li>{Boolean} $.canLike</li>
     *                          <li>{Boolean} $.enable</li>
     *                          <li>{Boolean} $.hide</li>
     *                          <li>{Double} $.price</li>
     *                          <li>{JSONArray} $.attributeValues</li>
     *                          <li>{JSONArray} $.categoryList</li>
     *                          <li>{JSONObject} $.business</li>
     *                          <li>{JSONObject} $.rate</li>
     *                      </ul>
     *                  </li>
     *                  <li>{Boolean} hasNext</li>
     *                  <li>{Integer} nextOffset</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getTopLeaguesInfo(JSONObject params, final RequestCallback callback) throws ServiceException{
        try {
            Integer type = (params.has("type") && !params.isNull("type")) ? params.getInt("type") : null;
            String gameId= (params.has("gameId") && !params.isNull("gameId")) ? params.get("gameId").toString() : null;

            final JSONObject requestData = new JSONObject();

            if (type != null) {
                requestData.put("type", type);
            }

            final Integer size = (params.has("size") && !params.isNull("size")) ? params.getInt("size") : 10;
            final Integer offset = (params.has("offset") && !params.isNull("offset")) ? params.getInt("offset") : 0;
            requestData.put("size", size);
            requestData.put("offset", offset);

            if (gameId != null) {
                requestData.put("gameId", gameId);
            }
            Integer imageWidth = null;
            Integer imageHeight = null;

            if (params.has("setting") && !params.isNull("setting")) {
                JSONObject setting = params.getJSONObject("setting");
                if (setting != null) {
                    if (setting.has("imageWidth")) {
                        imageWidth = setting.getInt("imageWidth");
                    }

                    if (setting.has("imageHeight")) {
                        imageHeight = setting.getInt("imageHeight");
                    }
                }
            }

            final Integer finalImageWidth = imageWidth;
            final Integer finalImageHeight = imageHeight;
            request(RequestUrls.GET_TOP_LEAGUE, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result){
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        if (!hasError) {
                            JSONObject allResult = result.getJSONObject("Result");

                            String[] keys = {"GcSuggestion","GcTop","TopFollow","TopRate"};
                            JSONObject refactorLeagues = new JSONObject();
                            for (int i=0;i<keys.length;i++ ) {
                                String key = keys[i];

                                if (allResult.has(key) && !allResult.isNull(key)) {
                                    JSONArray leagues = allResult.getJSONArray(key);
                                    JSONArray refLeagues = new JSONArray();

                                    if (leagues != null) {
                                        for (int j = 0; j < leagues.length(); j++) {
                                            JSONObject info = leagues.getJSONObject(j);
                                            refLeagues.put(reformatLeagueObject(info, finalImageWidth, finalImageHeight));
                                        }
                                        refactorLeagues.put(key, refLeagues);
                                        String countKeyName = key + "Count";
                                        refactorLeagues.put(countKeyName, allResult.get(countKeyName));
                                    }
                                }
                            }
                            returnData.put("result", refactorLeagues);
                        }

                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }

                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     *
     * <div style='width: 100%;text-align: right'> دریافت آخرین لیگ ها</div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("size", 10);
     *
     *      service.getLatestLeaguesInfo(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getLatestLeaguesInfo method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{Integer} [size=10]</li>
     *          <li>{Integer} [offset=0]</li>
     *          <li> {JSONObject} [setting]
     *              <ul>
     *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر لیگ</li>
     *                  <li>{Integer} [imageHeight] اندازه رزولیشن عمودی تصویر لیگ</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{JSONArray} leagues
     *                      <ul>
     *                          <li>{String} id</li>
     *                          <li>{String} enrollUrl</li>
     *                          <li>{Boolean} isMember</li>
     *                          <li>{Boolean} isFollower</li>
     *                          <li>{JSONObject} $.userPostInfo
     *                              <ul>
     *                                  <li>{Boolean} favorite</li>
     *                                  <li>{Boolean} liked</li>
     *                                  <li>{String} postId</li>
     *                              </ul>
     *                          </li>
     *                          <li>{JSONObject} $.image
     *                              <ul>
     *                                  <li>{String} id</li>
     *                                  <li>{String} url</li>
     *                                  <li>{Integer} width</li>
     *                                  <li>{Integer} height</li>
     *                              </ul>
     *                          </li>
     *                          <li>{Integer} gameType</li>
     *                          <li>{Integer} playerType</li>
     *                          <li>{Integer} status</li>
     *                          <li>{Integer} financialType</li>
     *                          <li>{Integer} lobbyId</li>
     *                          <li>{Integer} maxPlayers</li>
     *                          <li>{Integer} minNoOfPlayedGames</li>
     *                          <li>{Integer} minPlayers</li>
     *                          <li>{Integer} memberCount</li>
     *                          <li>{Integer} playerNumberType</li>
     *                          <li>{Integer} timestamp</li>
     *                          <li>{String} creator</li>
     *                          <li>{Integer} memberCount</li>
     *                          <li>{Integer} availableCount</li>
     *                          <li>{Integer} discount</li>
     *                          <li>{Integer} numOfComments</li>
     *                          <li>{Integer} numOfFavorites</li>
     *                          <li>{Integer} numOfLikes</li>
     *                          <li>{Integer} type</li>
     *                          <li>{Integer} [endTime]</li>
     *                          <li>{Integer} [startTime]</li>
     *                          <li>{String} rules</li>
     *                          <li>{String} description</li>
     *                          <li>{String} name</li>
     *                          <li>{String} ThreadId</li>
     *                          <li>{String} timelineId</li>
     *                          <li>{Boolean} hasPrize</li>
     *                          <li>{Boolean} quickMatch</li>
     *                          <li>{Boolean} startTypeCapacityComplete</li>
     *                          <li>{Boolean} startTypeFromDate</li>
     *                          <li>{Boolean} startTypePublishDate</li>
     *                          <li>{Boolean} canComment</li>
     *                          <li>{Boolean} canLike</li>
     *                          <li>{Boolean} enable</li>
     *                          <li>{Boolean} hide</li>
     *                          <li>{Double} price</li>
     *                          <li>{JSONArray} attributeValues</li>
     *                          <li>{JSONArray} categoryList</li>
     *                          <li>{JSONObject} business</li>
     *                          <li>{JSONObject} rate</li>
     *                      </ul>
     *                  </li>
     *                  <li>{Boolean} hasNext</li>
     *                  <li>{Integer} nextOffset</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getLatestLeaguesInfo(JSONObject params, final RequestCallback callback) throws ServiceException{
        try {
            final JSONObject requestData = new JSONObject();

            final Integer size = (params != null && params.has("size") && !params.isNull("size")) ? params.getInt("size") : 10;
            final Integer offset = (params != null &&  params.has("offset") && !params.isNull("offset")) ? params.getInt("offset") : 0;
            requestData.put("size", size);
            requestData.put("offset", offset);

            Integer imageWidth = null;
            Integer imageHeight = null;

            if (params.has("setting") && !params.isNull("setting")) {
                JSONObject setting = params.getJSONObject("setting");
                if (setting != null) {
                    if (setting.has("imageWidth")) {
                        imageWidth = setting.getInt("imageWidth");
                    }

                    if (setting.has("imageHeight")) {
                        imageHeight = setting.getInt("imageHeight");
                    }
                }
            }

            final Integer finalImageWidth = imageWidth;
            final Integer finalImageHeight = imageHeight;
            request(RequestUrls.GET_LATEST_LEAGUE, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result){
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        if (!hasError) {
                            JSONArray leagues = result.getJSONArray("Result");
                            JSONArray refactorLeagues = new JSONArray();

                            for (int i = 0; i < leagues.length(); i++) {
                                refactorLeagues.put(reformatLeagueObject(leagues.getJSONObject(i), finalImageWidth, finalImageHeight));
                            }

                            JSONObject retResult = new JSONObject();
                            retResult.put("leagues", refactorLeagues);
                            if (requestData.has("size")) {
                                retResult.put("hasNext", size == leagues.length());
                                retResult.put("nextOffset", offset + leagues.length());
                            }


                            returnData.put("result", retResult);
                        }

                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'> دریافت اعضای لیگ</div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("leagueId", "3");
     *      reqData.put("offset", 0);
     *      reqData.put("size",10 );
     *
     *      service.getLeagueMembers(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getLeagueMembers method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} leagueId</li>
     *          <li>{Integer} [size=20]</li>
     *          <li>{Integer} [offset=0]</li>
     *          <li>{Integer} [userState=0] - وضعیت کاربر
     *              <p>     0 = تمامی کاربران</p>
     *              <p>     1 = کاربران آنلاین</p>
     *              <p>     2 = کاربران آفلاین</p>
     *          </li>
     *          <li>{String} [name]</li>
     *          <li> {JSONObject} [setting]
     *              <ul>
     *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر لیگ</li>
     *                  <li>{Integer} [imageHeight] اندازه رزولیشن عمودی تصویر لیگ</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{JSONObject} users - کلید های این آبجکت شناسه کاربر می باشد
     *                      <ul>
     *                          <li>{String} name</li>
     *                          <li>{Boolean} isOnline</li>
     *                          <li>{JSONObject} [image]
     *                              <ul>
     *                                  <li>{String}  id</li>
     *                                  <li>{Integer} width</li>
     *                                  <li>{Integer} height</li>
     *                                  <li>{String}  url</li>
     *                              </ul>
     *                          </li>
     *                      </ul>
     *                  </li>
     *                  <li>{Boolean} hasNext</li>
     *                  <li>{Integer} nextOffset</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getLeagueMembers(JSONObject params, final RequestCallback callback) throws ServiceException {

        try {
            String leagueId = (params.has("leagueId") && !params.isNull("leagueId")) ? params.get("leagueId").toString() : null;

            if (leagueId == null) {
                throw new ServiceException("leagueId not exist in params");
            }

            final JSONObject requestData = new JSONObject();
            requestData.put("leagueId", leagueId);

            Integer size = (params.has("size") && !params.isNull("size")) ? params.getInt("size") : null;
            Integer offset = (params.has("offset") && !params.isNull("offset")) ? params.getInt("offset") : null;

            if (size != null) {
                requestData.put("size", size);
            } else {
                requestData.put("size", ConfigData.glms);
            }

            if (offset != null) {
                requestData.put("offset", offset);
            } else {
                requestData.put("offset", 0);
            }

            if (params.has("userState") && !params.isNull("userState")) {
                requestData.put("online", params.getInt("userState") == 1);
            }

            if (params.has("name") && !params.isNull("name")) {
                requestData.put("filter", params.getString("name"));
            }

            Integer imageWidth = null;
            Integer imageHeight = null;

            if (params.has("setting") && !params.isNull("setting")) {
                JSONObject setting = params.getJSONObject("setting");
                if (setting != null) {
                    if (setting.has("imageWidth")) {
                        imageWidth = setting.getInt("imageWidth");
                    }

                    if (setting.has("imageHeight")) {
                        imageHeight = setting.getInt("imageHeight");
                    }
                }
            }

            final Integer finalImageWidth = imageWidth;
            final Integer finalImageHeight = imageHeight;
            request(RequestUrls.LEAGUE_MEMBERS, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        if (!hasError) {
                            JSONArray members = result.getJSONArray("Result");
                            JSONObject users = new JSONObject();

                            if (members != null) {
//                                String ownId = userData.get("id").toString();
                                for (int i = 0; i < members.length(); i++) {

                                    JSONObject member = members.getJSONObject(i);
                                    String memberId = member.get("UserID").toString();
//                                    if (memberId.equals(ownId) ) {
//                                        continue;
//                                    }
                                    JSONObject memberData = new JSONObject();
                                    memberData.put("name", member.getString("Name"));
                                    memberData.put("isOnline", member.getBoolean("IsOnline"));

                                    if (member.has("Image") && !member.isNull("Image")) {
                                        JSONObject image = member.getJSONObject("Image");
                                        image.put("id", image.get("id").toString());
                                        memberData.put("image",image);
                                    }
                                    if (member.has("ProfileImage") && !member.isNull("ProfileImage")) {
                                        memberData.put("imageUrl",member.get("ProfileImage"));
                                    }
                                    users.put(memberId, memberData);
                                }
                            }


                            JSONObject retResult = new JSONObject();
                            retResult.put("users", users);
                            retResult.put("hasNext", requestData.getInt("size") == members.length());
                            retResult.put("nextOffset", requestData.getInt("offset") + members.length());
                            retResult.put("count", result.get("Count"));
                            returnData.put("result", retResult);
                        }

                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'>  دریافت برترین امتیازات </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("gameId", "2");
     *      reqData.put("isGlobal", true);
     *      service.getTopScore(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getTopScore method : " + result);
     *          }
     *            });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} gameId - شناسه بازی</li>
     *          <li>{String} [leagueId] - شناسه لیگ</li>
     *          <li>{Boolean} [isGlobal] - برترین در بین کاربران و یا امتیازات خود کاربر</li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONArray} result آرایه ای از آبجکت می باشد که هر کدام دارای مقادیر زیر است
     *              <ul>
     *                  <li>{String} id</li>
     *                  <li>{String} name</li>
     *                  <li>{String} score</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getTopScore(JSONObject params, final RequestCallback callback) throws ServiceException{

        try {

            final String gameId = (params.has("gameId") && !params.isNull("gameId")) ? params.get("gameId").toString() : null;

            if (gameId == null) {
                throw new ServiceException("gameId not exist in params");
            }

            String leagueId = (params.has("leagueId") && !params.isNull("leagueId")) ? params.get("leagueId").toString() : null;
            Boolean isGlobal = (params.has("isGlobal") && !params.isNull("isGlobal")) ? params.getBoolean("isGlobal") : null;
            JSONObject requestData = new JSONObject();
            requestData.put("gameId", gameId);

            if (leagueId != null) {
                requestData.put("leagueId", leagueId);
            }

            if (isGlobal != null) {
                requestData.put("isGlobal", isGlobal);
            }

            request(RequestUrls.TOP_SCORE, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result){
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        if (!hasError) {

                            JSONArray all = new JSONArray();
                            JSONArray scores = result.getJSONObject("Result").getJSONArray("topScores");
                            for (int i = 0; i < scores.length(); i++) {
                                JSONObject user = new JSONObject();
                                user.put("id", scores.getJSONObject(i).get("PlayerID").toString());
                                user.put("name", scores.getJSONObject(i).getString("playerName"));
                                user.put("score", scores.getJSONObject(i).get("Score").toString());
                                all.put(user);
                            }
                            returnData.put("result", all);
                        }

                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }


    public void sendScore(JSONObject params,final RequestCallback res) throws ServiceException{
        sendScoreRequest(params, res);
    }

    /**
     *
     * <div style='width: 100%;text-align: right'>ارسال امتیاز کاربر </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("gameId", gameId);
     *      JSONArray score = new JSONArray();
     *
     *      JSONObject data1 = new JSONObject();
     *      data1.put("name", "field1");
     *      data1.put("value ", 33);
     *      score.put(data1);
     *
     *      JSONObject data2 = new JSONObject();
     *      data2.put("name", "field2");
     *      data2.put("value ", 10);
     *      score.put(data2);
     *
     *      reqData.put("score", score);
     *      service.sendScore(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("sendResult method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} gameId - شناسه بازی</li>
     *          <li>{String} [leagueId] - شناسه لیگ</li>
     *          <li>{String} [matchId] - شناسه مسابقه</li>
     *          <li>{JSONObject} [score] - امتیاز کاربر</li>
     *      </ul>
     *
     * @param  res
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void sendScoreRequest(JSONObject params,final RequestCallback res) throws ServiceException{
        try {

            String gameId = (params.has("gameId") && !params.isNull("gameId")) ? params.get("gameId").toString() : null;
            JSONObject score = (params.has("score") && !params.isNull("score")) ? params.getJSONObject("score") : null;

            if (gameId == null) {
                throw new ServiceException("gameId not exist in params");
            }

            if (score == null) {
                throw new ServiceException("score not exist in params");
            }

            JSONObject sendData = new JSONObject();
            boolean forceAddToTable = params.has("forceAddToTable") ? params.getBoolean("forceAddToTable") : false;
            sendData.put("matchResult", params.get("score"));

            if (params.has("matchId")) {
                sendData.put("matchId", params.get("matchId"));
            }

            if (params.has("gameId")) {
                sendData.put("gameId", params.get("gameId"));
            }

            if (params.has("leagueId")) {
                sendData.put("leagueId", params.get("leagueId"));
            }

            if (forceAddToTable) {
                // TODO : database
            }

            if (userData.getBoolean("loginState")) {
                String userId = (params.has("userId")) ? params.get("userId").toString() : userData.get("userId").toString();

                sendData.put("userId", userId);

                request(RequestUrls.EDIT_SCORE, sendData, new Network.HttpRequestCallback() {
                    @Override
                    public void onResult(JSONObject result){
                        try {
                            boolean hasError = result.getBoolean("HasError");
                            JSONObject returnData = new JSONObject();
                            returnData.put("hasError", hasError);
                            returnData.put("errorMessage", result.getString("ErrorMessage"));
                            returnData.put("errorCode", result.getInt("ErrorCode"));

                            res.onResult(returnData);


                        } catch (JSONException e) {
                            res.onResult(ExceptionErrorData(e));
                        }
                    }
                });

            } else {

            }


        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'>دریافت اطلاعات بازی ها </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      JSONArray gamesId = new JSONArray();
     *      gamesId.put("gameId");
     *      reqData.put("gamesId",gamesId);
     *      service.getGamesInfo(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getGamesInfo method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{JSONArray} [gamesId] - شناسه بازی</li>
     *          <li>{String} [lobbyId] - شناسه دسته بازی</li>
     *          <li>{JSONArray} [name] - نام بازی که میخواهید اظلاعات آن را دریافت کنید</li>
     *          <li>{Integer} [size=30]</li>
     *          <li>{Integer} [offset=0]</li>
     *          <li>{JSONObject} [setting]
     *              <ul>
     *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر بازی</li>
     *                  <li>{Integer} [imageHeight] اندازه رزولیشن عمودی تصویر بازی</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{Boolean} hasNext</li>
     *                  <li>{Integer} nextOffset</li>
     *                  <li>{JSONArray} games
     *                      <ul>
     *                          <li>{String} id</li>
     *                          <li>{String} name</li>
     *                          <li>{String} description</li>
     *                          <li>{String} creator</li>
     *                          <li>{String} physicalUrl</li>
     *                          <li>{String} timelineId</li>
     *                          <li>{String} packageName</li>
     *                          <li>{String} mobileVersion</li>
     *                          <li>{String} mobileVersionCode</li>
     *                          <li>{String} supporterId</li>
     *                          <li>{String} defaultLeagueId</li>
     *                          <li>{String} downloadLink</li>
     *                          <li>{String} gamePlayDescription</li>
     *                          <li>{String} score</li>
     *                          <li>{String} webVersion</li>
     *                          <li>{JSONArray} attributeValues</li>
     *                          <li>{JSONArray} categoryList</li>
     *                          <li>{JSONObject} business</li>
     *                          <li>{JSONObject} userPostInfo
     *                              <ul>
     *                                  <li>{Boolean} favorite</li>
     *                                  <li>{Boolean} liked</li>
     *                                  <li>{String} postId</li>
     *                              </ul>
     *                          </li>
     *                          <li>{JSONObject} rate
     *                              <ul>
     *                                  <li>{Integer} rate.rate</li>
     *                                  <li>{Integer} rate.rateCount</li>
     *                              </ul>
     *                          </li>
     *                          <li>{JSONObject} image
     *                              <ul>
     *                                  <li>{String} image.id</li>
     *                                  <li>{String} image.url</li>
     *                                  <li>{String} image.hashCode</li>
     *                                  <li>{Integer} image.width</li>
     *                                  <li>{Integer} image.height</li>
     *                              </ul>
     *                          </li>
     *                          <li>{Integer} playerNumbersType</li>
     *                          <li>{Integer} platformType</li>
     *                          <li>{Integer} availableCount</li>
     *                          <li>{Integer} discount</li>
     *                          <li>{Integer} numOfComments</li>
     *                          <li>{Integer} numOfFavorites</li>
     *                          <li>{Integer} numOfLikes</li>
     *                          <li>{Boolean} canComment</li>
     *                          <li>{Boolean} canLike</li>
     *                          <li>{Boolean} enable</li>
     *                          <li>{Boolean} hide</li>
     *                          <li>{Double} latitude</li>
     *                          <li>{Double} longitude</li>
     *                          <li>{Double} publishedDate</li>
     *                          <li>{Double} price</li>
     *                          <li>{Double} timestamp</li>
     *                      </ul>
     *                  </li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getGamesInfo(JSONObject params, final RequestCallback callback) throws ServiceException{


        try {
            JSONObject requestData = new JSONObject();
            JSONArray gamesId = (params.has("gamesId") && !params.isNull("gamesId")) ? params.getJSONArray("gamesId") : null;
            String name = (params.has("name") && !params.isNull("name")) ? params.getString("name") : null;
            String lobbyId = (params.has("lobbyId") && !params.isNull("lobbyId")) ? params.getString("lobbyId") : null;

            if (gamesId != null) {
                requestData.put("gameId", gamesId.toString());
            }

            if (name != null) {
                requestData.put("filter", name);
            }

            if (lobbyId != null) {
                requestData.put("lobbyId", lobbyId);
            }

            final Integer size = (params.has("size") && !params.isNull("size")) ? params.getInt("size") : 5;
            final Integer offset = (params.has("offset") && !params.isNull("offset")) ? params.getInt("offset") : 0;
            requestData.put("size", size);
            requestData.put("offset", offset);

            Integer imageWidth = null;
            Integer imageHeight = null;

            if (params.has("setting") && !params.isNull("setting")) {
                JSONObject setting = params.getJSONObject("setting");
                if (setting != null) {
                    if (setting.has("imageWidth")) {
                        imageWidth = setting.getInt("imageWidth");
                    }

                    if (setting.has("imageHeight")) {
                        imageHeight = setting.getInt("imageHeight");
                    }
                }
            }

            final Integer finalImageHeight = imageHeight;
            final Integer finalImageWidth = imageWidth;
            request(RequestUrls.GAME_INFO, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result){
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        if (!hasError) {
                            JSONObject retResult = new JSONObject();
                            JSONArray games = new JSONArray();
                            if (result.has("Result") && !result.isNull("Result")) {
                                JSONArray allInfo = result.getJSONArray("Result");
                                if (allInfo != null) {
                                    for (int i = 0; i < allInfo.length(); i++) {
                                        JSONObject info = allInfo.getJSONObject(i);
                                        games.put(reformatGameObject(info, finalImageWidth, finalImageHeight));
                                    }
                                }
                            }
                            retResult.put("games", games);
                            retResult.put("hasNext", size == games.length());
                            retResult.put("nextOffset", offset + games.length());
                            retResult.put("count", result.get("Count"));
                            returnData.put("result", retResult);
                        }


                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }

    }

    /**
     *
     * <div style='width: 100%;text-align: right'> دریافت برترین باز ها </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("type", 1);
     *      service.getTopGamesInfo(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getTopGamesInfo method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{Integer} [type]
     *              <p>     1 = برترین های گیم سنتر</p>
     *              <p>     2 = برترین بازی ها</p>
     *              <p>     4 =برترین دنبال شده ها</p>
     *              <p>     8 = پیشنهاد گیم سنتر</p>
     *          </li>
     *          <li>{Integer} [size=5]</li>
     *          <li>{Integer} [offset=0]</li>
     *          <li>{JSONObject} [setting]
     *              <ul>
     *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر بازی</li>
     *                  <li>{Integer} [imageHeight] اندازه رزولیشن عمودی تصویر بازی</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @param  res
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{JSONArray} GcSuggestion : $ - پیشنهاد گیم سنتر</li>
     *                  <li>{Integer} GcSuggestionCount</li>
     *                  <li>{JSONArray} GcTop : $ - برترین های گیم سنتر</li>
     *                  <li>{JSONArray} GcTopCount</li>
     *                  <li>{JSONArray} TopFollow : $ - برترین دنبال شده ها</li>
     *                  <li>{JSONArray} TopFollowCount</li>
     *                  <li>{JSONArray} TopRateCount
     *                  <li>{JSONArray} TopRate : $ - برترین ها
     *                      <ul>
     *                          <li>{String} $.id</li>
     *                          <li>{String} $.name</li>
     *                          <li>{String} $.description</li>
     *                          <li>{String} $.creator</li>
     *                          <li>{String} $.physicalUrl</li>
     *                          <li>{String} $.timelineId</li>
     *                          <li>{String} $.packageName</li>
     *                          <li>{String} $.mobileVersion</li>
     *                          <li>{String} $.mobileVersionCode</li>
     *                          <li>{String} $.supporterId</li>
     *                          <li>{String} $.defaultLeagueId</li>
     *                          <li>{String} $.downloadLink</li>
     *                          <li>{String} $.gamePlayDescription</li>
     *                          <li>{String} $.score</li>
     *                          <li>{String} $.webVersion</li>
     *                          <li>{JSONArray} $.attributeValues</li>
     *                          <li>{JSONArray} $.categoryList</li>
     *                          <li>{JSONObject} $.business</li>
     *                          <li>{JSONObject} $.userPostInfo
     *                              <ul>
     *                                  <li>{Boolean} favorite</li>
     *                                  <li>{Boolean} liked</li>
     *                                  <li>{Integer} postId</li>
     *                              </ul>
     *                          </li>
     *                          <li>{JSONObject} $.rate
     *                              <ul>
     *                                  <li>{Integer} rate</li>
     *                                  <li>{Integer} rateCount</li>
     *                              </ul>
     *                          </li>
     *                          <li>{JSONObject} $.image
     *                              <ul>
     *                                  <li>{String}  id</li>
     *                                  <li>{String}  url</li>
     *                                  <li>{String}  hashCode</li>
     *                                  <li>{Integer} width</li>
     *                                  <li>{Integer} height</li>
     *                              </ul>
     *                          </li>
     *                          <li>{Integer} $.playerNumbersType</li>
     *                          <li>{Integer} $.platformType</li>
     *                          <li>{Integer} $.availableCount</li>
     *                          <li>{Integer} $.discount</li>
     *                          <li>{Integer} $.numOfComments</li>
     *                          <li>{Integer} $.numOfFavorites</li>
     *                          <li>{Integer} $.numOfLikes</li>
     *                          <li>{Boolean} $.canComment</li>
     *                          <li>{Boolean} $.canLike</li>
     *                          <li>{Boolean} $.enable</li>
     *                          <li>{Boolean} $.hide</li>
     *                          <li>{Double} $.latitude</li>
     *                          <li>{Double} $.longitude</li>
     *                          <li>{Double} $.publishedDate</li>
     *                          <li>{Double} $.price</li>
     *                          <li>{Double} $.timestamp</li>
     *                      </ul>
     *                  </li>
     *              </ul>
     *          </li>
     *      </ul>
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getTopGamesInfo(JSONObject params, final RequestCallback res) throws ServiceException {

        try {
            final JSONObject requestData = new JSONObject();
            Integer type = (params.has("type") && !params.isNull("type")) ? params.getInt("type") : null;

            if (type != null) {
                requestData.put("type", type);
            }

            final Integer size = (params.has("size") && !params.isNull("size")) ? params.getInt("size") : 5;
            final Integer offset = (params.has("offset") && !params.isNull("offset")) ? params.getInt("offset") : 0;
            requestData.put("size", size);
            requestData.put("offset", offset);

            Integer imageWidth = null;
            Integer imageHeight = null;

            if (params.has("setting") && !params.isNull("setting")) {
                JSONObject setting = params.getJSONObject("setting");
                if (setting != null) {
                    if (setting.has("imageWidth")) {
                        imageWidth = setting.getInt("imageWidth");
                    }

                    if (setting.has("imageHeight")) {
                        imageHeight = setting.getInt("imageHeight");
                    }
                }
            }

            final Integer finalImageHeight = imageHeight;
            final Integer finalImageWidth = imageWidth;
            request(RequestUrls.GET_TOP_GAME, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    try {

                        boolean hasError = result.getBoolean("HasError");
                        JSONObject returnData = new JSONObject();
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        if (!hasError) {
                            JSONObject allResult = result.getJSONObject("Result");

                            String[] keys = {"GcSuggestion","GcTop","TopFollow","TopRate"};
                            JSONObject refactorLeagues = new JSONObject();
                            for (int i=0;i<keys.length;i++ ) {
                                String key = keys[i];

                                if (allResult.has(key) && !allResult.isNull(key)) {
                                    JSONArray games = allResult.getJSONArray(key);
                                    JSONArray refGames = new JSONArray();

                                    if (games != null) {
                                        for (int j = 0; j < games.length(); j++) {
                                            JSONObject info = games.getJSONObject(j);
                                            refGames.put(reformatGameObject(info, finalImageWidth, finalImageHeight));
                                        }
                                        refactorLeagues.put(key, refGames);
                                        String countKeyName = key + "Count";
                                        refactorLeagues.put(countKeyName, allResult.get(countKeyName));
                                    }
                                }
                            }
                            returnData.put("result", refactorLeagues);
                        }
                        res.onResult(returnData);

                    } catch (JSONException e) {
                        res.onResult(ExceptionErrorData(e));
                    }
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     *
     * <div style='width: 100%;text-align: right'>دریافت آخرین بازی ها</div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("size", size);
     *      service.getLatestGamesInfo(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getLatestGamesInfo method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{Integer} [size=30]</li>
     *          <li>{Integer} [offset=0]</li>
     *          <li>{JSONObject} [setting]
     *              <ul>
     *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر بازی</li>
     *                  <li>{Integer} [imageHeight] اندازه رزولیشن عمودی تصویر بازی</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @param  res
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{Boolean} hasNext</li>
     *                  <li>{Integer} nextOffset</li>
     *                  <li>{JSONArray} games - array of JSONObject that each object contain :
     *                      <ul>
     *                          <li>{String} id</li>
     *                          <li>{String} name</li>
     *                          <li>{String} description</li>
     *                          <li>{String} creator</li>
     *                          <li>{String} physicalUrl</li>
     *                          <li>{String} timelineId</li>
     *                          <li>{String} packageName</li>
     *                          <li>{String} mobileVersion</li>
     *                          <li>{String} mobileVersionCode</li>
     *                          <li>{String} supporterId</li>
     *                          <li>{String} defaultLeagueId</li>
     *                          <li>{String} downloadLink</li>
     *                          <li>{String} gamePlayDescription</li>
     *                          <li>{String} score</li>
     *                          <li>{String} webVersion</li>
     *                          <li>{JSONArray} attributeValues</li>
     *                          <li>{JSONArray} categoryList</li>
     *                          <li>{JSONObject} business</li>
     *                          <li>{JSONObject} userPostInfo
     *                              <ul>
     *                                  <li>{Boolean} favorite</li>
     *                                  <li>{Boolean} liked</li>
     *                                  <li>{Integer} postId</li>
     *                              </ul>
     *                          </li>
     *                          <li>{JSONObject} rate
     *                              <ul>
     *                                  <li>{Integer} rate</li>
     *                                  <li>{Integer} rateCount</li>
     *                              </ul>
     *                          </li>
     *                          <li>{JSONObject} image
     *                              <ul>
     *                                  <li>{String} id</li>
     *                                  <li>{String} url</li>
     *                                  <li>{String} hashCode</li>
     *                                  <li>{Integer} width</li>
     *                                  <li>{Integer} height</li>
     *                              </ul>
     *                          </li>
     *                          <li>{Integer} playerNumbersType</li>
     *                          <li>{Integer} platformType</li>
     *                          <li>{Integer} availableCount</li>
     *                          <li>{Integer} discount</li>
     *                          <li>{Integer} numOfComments</li>
     *                          <li>{Integer} numOfFavorites</li>
     *                          <li>{Integer} numOfLikes</li>
     *                          <li>{Boolean} canComment</li>
     *                          <li>{Boolean} canLike</li>
     *                          <li>{Boolean} enable</li>
     *                          <li>{Boolean} hide</li>
     *                          <li>{Double} latitude</li>
     *                          <li>{Double} longitude</li>
     *                          <li>{Double} publishedDate</li>
     *                          <li>{Double} price</li>
     *                          <li>{Double} timestamp</li>
     *                      </ul>
     *                  </li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getLatestGamesInfo(JSONObject params, final RequestCallback res) throws ServiceException{

        try {
            final JSONObject requestData = new JSONObject();

            final Integer size = (params.has("size") && !params.isNull("size")) ? params.getInt("size") : 30;
            final Integer offset = (params.has("offset") && !params.isNull("offset")) ? params.getInt("offset") : 0;
            requestData.put("size", size);
            requestData.put("offset", offset);

            Integer imageWidth = null;
            Integer imageHeight = null;

            if (params.has("setting") && !params.isNull("setting")) {
                JSONObject setting = params.getJSONObject("setting");
                if (setting != null) {
                    if (setting.has("imageWidth")) {
                        imageWidth = setting.getInt("imageWidth");
                    }

                    if (setting.has("imageHeight")) {
                        imageHeight = setting.getInt("imageHeight");
                    }
                }
            }

            final Integer finalImageHeight = imageHeight;
            final Integer finalImageWidth = imageWidth;
            request(RequestUrls.GET_LATEST_GAME, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    try {

                        boolean hasError = result.getBoolean("HasError");
                        JSONObject returnData = new JSONObject();
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        if (!hasError) {
                            JSONArray allGames = result.getJSONArray("Result");

                            JSONArray games = new JSONArray();
                            JSONObject retResult = new JSONObject();
                            if (allGames != null) {
                                for (int i = 0; i < allGames.length(); i++) {
                                    JSONObject info = allGames.getJSONObject(i);
                                    games.put(reformatGameObject(info, finalImageWidth, finalImageHeight));
                                }
                            }
                            retResult.put("games", games);
                            retResult.put("hasNext", size == games.length());
                            retResult.put("nextOffset", offset + games.length());
                            returnData.put("result", retResult);
                        }
                        res.onResult(returnData);

                    } catch (JSONException e) {
                        res.onResult(ExceptionErrorData(e));
                    }
                }
            });
        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     *
     * <div style='width: 100%;text-align: right'> دریافت بازی های مرتبط </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("gameId", gameId);
     *      service.getRelatedGamesInfo(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getRelatedGamesInfo method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} gameId شناسه بازی</li>
     *          <li>{Integer} [type]
     *              <p>     1 = بازی هایی که در یک لابی می باشند</p>
     *              <p>     2 = بازی هایی که سازنده آنها یکی است</p>
     *          </li>
     *          <li>{Integer} [size=30]</li>
     *          <li>{Integer} [offset=0]</li>
     *          <li>{JSONObject} [setting]
     *              <ul>
     *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر بازی</li>
     *                  <li>{Integer} [imageHeight] اندازه رزولیشن عمودی تصویر بازی</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @param  res
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>    {Boolean} hasNext</li>
     *                  <li>    {Integer} nextOffset</li>
     *                  <li>    {JSONArray} CategoryEquality : $ - بازی هایی که در یک لابی می باشند</li>
     *                  <li>    {JSONArray} CreatorEquality : $ - بازی هایی که سازنده آنها یکی است
     *                      <ul>
     *                          <li>{String} id</li>
     *                          <li>{String} name</li>
     *                          <li>{String} description</li>
     *                          <li>{String} creator</li>
     *                          <li>{String} physicalUrl</li>
     *                          <li>{String} timelineId</li>
     *                          <li>{String} packageName</li>
     *                          <li>{String} mobileVersion</li>
     *                          <li>{String} mobileVersionCode</li>
     *                          <li>{String} supporterId</li>
     *                          <li>{String} defaultLeagueId</li>
     *                          <li>{String} downloadLink</li>
     *                          <li>{String} gamePlayDescription</li>
     *                          <li>{String} score</li>
     *                          <li>{String} webVersion</li>
     *                          <li>{JSONArray} attributeValues</li>
     *                          <li>{JSONArray} categoryList</li>
     *                          <li>{JSONObject} business</li>
     *                          <li>{JSONObject} userPostInfo
     *                              <ul>
     *                                  <li>{Boolean} favorite</li>
     *                                  <li>{Boolean} liked</li>
     *                                  <li>{Integer} postId</li>
     *                              </ul>
     *                          </li>
     *                          <li>{JSONObject} rate
     *                              <ul>
     *                                  <li>{Integer} rate</li>
     *                                  <li>{Integer} rateCount</li>
     *                              </ul>
     *                          </li>
     *                          <li>{JSONObject} image
     *                              <ul>
     *                                  <li>{String} id</li>
     *                                  <li>{String} url</li>
     *                                  <li>{String} hashCode</li>
     *                                  <li>{Integer} width</li>
     *                                  <li>{Integer} height</li>
     *                              </ul>
     *                          </li>
     *                          <li>{Integer} playerNumbersType</li>
     *                          <li>{Integer} platformType</li>
     *                          <li>{Integer} availableCount</li>
     *                          <li>{Integer} discount</li>
     *                          <li>{Integer} numOfComments</li>
     *                          <li>{Integer} numOfFavorites</li>
     *                          <li>{Integer} numOfLikes</li>
     *                          <li>{Boolean} canComment</li>
     *                          <li>{Boolean} canLike</li>
     *                          <li>{Boolean} enable</li>
     *                          <li>{Boolean} hide</li>
     *                          <li>{Double} latitude</li>
     *                          <li>{Double} longitude</li>
     *                          <li>{Double} publishedDate</li>
     *                          <li>{Double} price</li>
     *                          <li>{Double} timestamp</li>
     *                      </ul>
     *                  </li>
     *               </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getRelatedGamesInfo(JSONObject params, final RequestCallback res) throws ServiceException{
        try {
            final JSONObject requestData = new JSONObject();

            String gameId = (params.has("gameId") && !params.isNull("gameId")) ? params.get("gameId").toString() : null;

            if (gameId == null) {
                throw new ServiceException("gameId not exist in params");
            }

            Integer type = (params.has("type") && !params.isNull("type")) ? params.getInt("type") : null;

            if (type != null) {
                requestData.put("type", type);
            }

            final Integer size = (params.has("size") && !params.isNull("size")) ? params.getInt("size") : 5;
            final Integer offset = (params.has("offset") && !params.isNull("offset")) ? params.getInt("offset") : 0;
            requestData.put("size", size);
            requestData.put("offset", offset);
            requestData.put("gameId", gameId);

            Integer imageWidth = null;
            Integer imageHeight = null;

            if (params.has("setting") && !params.isNull("setting")) {
                JSONObject setting = params.getJSONObject("setting");
                if (setting != null) {
                    if (setting.has("imageWidth")) {
                        imageWidth = setting.getInt("imageWidth");
                    }

                    if (setting.has("imageHeight")) {
                        imageHeight = setting.getInt("imageHeight");
                    }
                }
            }

            final Integer finalImageHeight = imageHeight;
            final Integer finalImageWidth = imageWidth;
            request(RequestUrls.GET_RELATED_GAME, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result){
                    try {

                        boolean hasError = result.getBoolean("HasError");
                        JSONObject returnData = new JSONObject();
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        if (!hasError) {
                            JSONObject allResult = result.getJSONObject("Result");
                            JSONObject retResult = new JSONObject();
                            boolean hasNext = false;

                            for (Iterator<String> i = allResult.keys(); i.hasNext(); ) {
                                String name = i.next();

                                if (allResult.has(name) && !allResult.isNull(name)) {
                                    JSONArray allGames = allResult.getJSONArray(name);
                                    JSONArray games = new JSONArray();

                                    if (allGames != null) {
                                        for (int j = 0; j < allGames.length(); j++) {
                                            JSONObject info = allGames.getJSONObject(j);
                                            games.put(reformatGameObject(info, finalImageWidth, finalImageHeight));
                                        }
                                        if (size == games.length()) {
                                            hasNext = true;
                                        }
                                        retResult.put(name, games);
                                    }
                                }
                            }
                            retResult.put("hasNext", hasNext);
                            retResult.put("nextOffset", offset + size);
                            returnData.put("result", retResult);
                        }
                        res.onResult(returnData);

                    } catch (JSONException e) {
                        res.onResult(ExceptionErrorData(e));
                    }
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'> دریافت اطلاعات جدول رده بندی </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *       JSONObject reqData = new JSONObject();
     *       reqData.put("leagueId", "3");
     *
     *       service.getTableData(reqData, new RequestCallback() {
     *           {@code @Override}
     *           public void onResult(JSONObject result) {
     *               System.out.println("getTableData method : " + result);
     *           }
     *       });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} leagueId - شناسه بازی</li>
     *          <li>{Integer} [rangeType] - زمان جدول
     *              <p>     1 = ۱ ماهه </p>
     *              <p>     3 =    کلی </p>
     *          </li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{Integer} type
     *                      <ul>
     *                          <li>0 = لیگ دوره ای</li>
     *                          <li>1 = لیگ حذفی</li>
     *                      </ul>
     *                  </li>
     *                  <li>{JSONArray} headerData - نام فیلد های جدول در لیگ دوره ای</li>
     *                  <li>{JSONArray} usersData  - اطلاعات جدول در لیگ دوره ای</li>
     *                  <li>{JSONObject} rounds - اطلاعات مرحله ها در لیگ حذفی</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getTableData(JSONObject params, final RequestCallback callback) throws ServiceException{

        try {
            String leagueId = (params.has("leagueId") && !params.isNull("leagueId")) ? params.get("leagueId").toString() : null;

            if (leagueId == null) {
                throw new ServiceException("gameId not exist in params");
            }

            JSONObject requestData = new JSONObject();
            requestData.put("leagueId", leagueId);

            if (params.has("rangeType") && !params.isNull("rangeType")) {
                requestData.put("rangeType", params.getInt("rangeType"));
            }

            Integer imageWidth = null;
            Integer imageHeight = null;

            if (params.has("setting") && !params.isNull("setting")) {
                JSONObject setting = params.getJSONObject("setting");
                if (setting != null) {
                    if (setting.has("imageWidth")) {
                        imageWidth = setting.getInt("imageWidth");
                    }

                    if (setting.has("imageHeight")) {
                        imageHeight = setting.getInt("imageHeight");
                    }
                }
            }

            final Integer finalImageHeight1 = imageHeight;
            final Integer finalImageWidth1 = imageWidth;
            request(RequestUrls.TABLE, requestData, new Network.HttpRequestCallback()  {
                @Override
                public void onResult(JSONObject result){
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));
                        if (!hasError) {
                            returnData.put("result", reformatTableObject(result.getJSONObject("Result"), finalImageWidth1, finalImageHeight1));
                        }

                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'> درخواست خروج از حساب کاربری </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      service.logoutRequest(new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("logoutRequest method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *      </ul>
     *
     * @throws ServiceException خطای سرویس
     * */
    public void logoutRequest(final RequestCallback callback) throws ServiceException{

        logoutAction();
        if (callback != null) {
            callback.onResult(Util.createReturnData(false, "", 0, new JSONObject()));
        }


//        try {
//
//            JSONObject requestData = new JSONObject();
//            if (userData.has("peerId")) {
//                requestData.put("sessionId", userData.get("peerId").toString());
//            }
//
//            request(RequestUrls.LOGOUT, requestData, new Network.HttpRequestCallback() {
//                @Override
//                public void onResult(JSONObject result){
//                    JSONObject returnData = new JSONObject();
//                    try {
//                        boolean hasError = result.getBoolean("HasError");
//                        returnData.put("hasError", hasError);
//                        returnData.put("errorMessage", result.getString("ErrorMessage"));
//                        returnData.put("errorCode", result.getInt("ErrorCode"));
//
//                        logoutAction();
//
//                    } catch (JSONException e) {
//                        returnData = ExceptionErrorData(e);
//                    }
//                    callback.onResult(returnData);
//                }
//            });
//        } catch (JSONException e) {
//            throw new ServiceException(e);
//        }
    }

    /**
     * <div style='width: 100%;text-align: right'> درخواست عضویت در لیگ</div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("gameId", "2");
     *      reqData.put("leagueId", "3");
     *      service.getLeaguesInfo(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              try {
     *                  if (!result.getBoolean("hasError")) {
     *                      JSONObject leagueData = result.getJSONObject("result").getJSONArray("leagues").getJSONObject(0);
     *                      String enrollUrl = leagueData.getString("enrollUrl");
     *                      JSONObject reqData = new JSONObject();
     *                      reqData.put("leagueId", leagueData.getString("id"));
     *                      reqData.put("enrollUrl", enrollUrl);
     *                      service.subscribeLeagueRequest(reqData, new RequestCallback() {
     *                          {@code @Override}
     *                          public void onResult(JSONObject data) {
     *                              System.out.println("subscribeLeagueRequest method : " + data);
     *                          }
     *                      });
     *                  }
     *              } catch (JSONException|ServiceException e) {
     *                  e.printStackTrace();
     *              }
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} leagueId - شناسه لیگ</li>
     *          <li>{String} enrollUrl - لینک عضویت</li>
     *          <li>{String} [voucherHash] - کد تخفیف</li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void subscribeLeagueRequest(JSONObject params, final RequestCallback callback) throws ServiceException {

        try {
            String enrollUrl = (params.has("enrollUrl") && !params.isNull("enrollUrl")) ? params.getString("enrollUrl") : null;
            String leagueId = (params.has("leagueId") && !params.isNull("leagueId")) ? params.get("leagueId").toString() : null;
            String voucherHash = (params.has("voucherHash") && !params.isNull("voucherHash")) ? params.getString("voucherHash") : null;

            if (leagueId == null) {
                throw new ServiceException("leagueId not exist in params");
            }
            if (enrollUrl == null) {
                throw new ServiceException("enrollUrl not exist in params");
            }


            JSONObject requestData = new JSONObject();
            requestData.put("leagueId", leagueId);

            if (voucherHash != null && voucherHash.length() > 0) {
                requestData.put("voucherHash", voucherHash);
            }


            JSONArray queryData = Util.getQueryStringData(enrollUrl);

            JSONObject setting = new JSONObject();

            setting.put("uri", enrollUrl.substring(0,enrollUrl.indexOf("?")));
            setting.put("url", enrollUrl);
            setting.put("parameters", queryData);

            request(RequestUrls.SUBSCRIBE_LEAGUE, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result){
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            },setting);
        } catch (Exception e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'>درخواست اضافه شدن به لیست حریف می طلبم</div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *       JSONObject reqData = new JSONObject();
     *       reqData.put("leagueId", leagueId);
     *       reqData.put("gameId", gameId);
     *       service.quickMatchRequest(reqData, new QuickMatchRequestCallback() {
     *           {@code @Override}
     *           public void onResult(JSONObject result) {
     *               System.out.println("quickMatchRequest method -- onResult : " + result);
     *           }
     *           {@code @Override}
     *           public void onCancel(JSONObject data) {
     *               System.out.println("quickMatchRequest method -- onCancel : " + data);
     *           }
     *           {@code @Override}
     *           public void onAccept(JSONObject data) {
     *               System.out.println("quickMatchRequest method -- onAccept : " + data);
     *           }
     *       });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} gameId - شناسه بازی</li>
     *          <li>{String} leagueId - شناسه لیگ</li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *      </ul>
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void quickMatchRequest(JSONObject params, final QuickMatchRequestCallback callback) throws ServiceException{
        try {
            String gameId = (params.has("gameId") && !params.isNull("gameId")) ? params.get("gameId").toString() : null;
            String leagueId = (params.has("leagueId") && !params.isNull("leagueId")) ? params.get("leagueId").toString() : null;

            if (gameId == null) {
                throw new ServiceException("gameId not exist in params");
            }

            if (leagueId == null) {
                throw new ServiceException("leagueId not exist in params");
            }

            if (!network.getSocketConnectionState()) {
                JSONObject returnData = new JSONObject();
                returnData.put("hasError", true);
                returnData.put("errorMessage", dic.getJSONObject("CONNECTINGTOPUSH").getString(lang));
                callback.onResult(returnData);
                return;
            }

            if (!isMultiTab && (isGameRun() || currentMatchRequestCount > 0 || (Integer)quickMatchData.get("requestCount") > 0)) {
                String errorMessage = dic.getJSONObject("CANTNOTREQUESTINPLAING").getString(lang);

                if(currentMatchRequestCount > 0 || (Integer)quickMatchData.get("requestCount") > 0) {
                    errorMessage = dic.getJSONObject("WAITFORPREVIOUSREQUEST").getString(lang);
                }
                JSONObject returnData = new JSONObject();
                returnData.put("hasError", true);
                returnData.put("errorMessage",errorMessage);
                callback.onResult(returnData);
                return;
            }

            HashMap leaguesQuickData = (HashMap) quickMatchData.get("leagues");
            HashMap quickData = (HashMap) leaguesQuickData.get(leagueId);
            if (quickData == null) {

                quickData = new HashMap();
                quickData.put("state", true);
                quickData.put("callback", callback);
                leaguesQuickData.put(leagueId, quickData);
            } else {
                if ((Boolean) quickData.get("state")) {
                    return;
                }
                quickData.put("state", true);
                quickData.put("callback", callback);
            }
            quickMatchData.put("requestCount", (Integer)quickMatchData.get("requestCount") + 1);
            quickMatchData.put("lastLeagueId", leagueId);

            JSONObject requestData = new JSONObject();
            requestData.put("leagueId", leagueId);
            requestData.put("peerId", userData.get("peerId").toString());


            quickRequest(requestData,false,callback);

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'>درخواست حذف از لیست حریف می طلبم</div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("leagueId", "leagueId");
     *      service.cancelQuickMatchRequest(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("cancelQuickMatchRequest method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} leagueId - شناسه بازی</li>
     *      </ul>
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void cancelQuickMatchRequest(JSONObject params, final RequestCallback callback) throws ServiceException {

        try {

            final String leagueId = (params.has("leagueId") && !params.isNull("leagueId")) ? params.get("leagueId").toString() : null;

            if (leagueId == null) {
                throw new ServiceException("leagueId not exist in params");
            }

            final JSONObject requestData = new JSONObject();
            requestData.put("leagueId", leagueId);
            requestData.put("peerId", userData.get("peerId").toString());


            request(RequestUrls.CANCEL_QUICK_MATCH, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result) {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));


                        HashMap leaguesQuickData = (HashMap) quickMatchData.get("leagues");
                        HashMap quickData = (HashMap) leaguesQuickData.get(leagueId);
                        if (!hasError && quickData != null) {
                            String timeoutId = (String) quickData.get("timeoutId");
                            QuickMatchRequestCallback quickres = (QuickMatchRequestCallback) quickData.get("callback");
                            if (timeoutId != null) {
                                Util.clearTimeout(timeoutId);
                                quickData.put("timeoutId", null);
                            }
                            JSONObject cancelData = new JSONObject();
                            cancelData.put("leagueId", leagueId);
                            cancelData.put("message", "");
                            cancelData.put("state", true);
                            quickres.onCancel(cancelData);

                            quickData.put("state", false);
                            quickMatchData.put("requestCount", (Integer) quickMatchData.get("requestCount") - 1);
                            quickMatchData.put("lastLeagueId", null);
                        }


                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'> جست و جو در بین کاربران گیم سنتر </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("name", "ali");
     *      reqData.put("size", 10);
     *      reqData.put("offset", 0);
     *      service.searchUserRequest(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("searchUserRequest method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} name - نام مستعار</li>
     *          <li>{Integer} [size=5]</li>
     *          <li>{Integer} [offset=0]</li>
     *          <li>{JSONObject} [setting]
     *              <ul>
     *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر کاربر</li>
     *                  <li>{Integer} [imageHeight] اندازه رزولیشن عمودی تصویر کاربر</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @param  res
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{JSONObject} users - JSONObject(key is userId) of JSONObject that  :
     *                      <ul>
     *                          <li>{String} name</li>
     *                          <li>{JSONObject} [image]
     *                              <ul>
     *                                  <li>{String}  id</li>
     *                                  <li>{String}  url</li>
     *                                  <li>{Integer} width</li>
     *                                  <li>{Integer} height</li>
     *                              </ul>
     *                          </li>
     *                      </ul>
     *                  </li>
     *                  <li>{Boolean} hasNext </li>
     *                  <li>{Integer} nextOffset  </li>
     *                  <li>{Integer} count  </li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void searchUserRequest(JSONObject params, final RequestCallback res) throws ServiceException{
        try {
            String name = (params.has("name") && !params.isNull("name")) ? params.getString("name") : null;

            if (name == null) {
                throw new ServiceException("name not exist in params");
            }
            final JSONObject requestData = new JSONObject();
            requestData.put("query", name);

            Integer size = (params.has("size") && !params.isNull("size")) ? params.getInt("size") : null;
            Integer offset = (params.has("offset") && !params.isNull("offset")) ? params.getInt("offset") : null;
            if (size != null) {
                requestData.put("size", size);
            } else {
                requestData.put("size", ConfigData.gsus);
            }

            if (offset != null) {
                requestData.put("offset", offset);
            } else {
                requestData.put("offset", 0);
            }

            Integer imageWidth = null;
            Integer imageHeight = null;

            if (params.has("setting") && !params.isNull("setting")) {
                JSONObject setting = params.getJSONObject("setting");
                if (setting != null) {
                    if (setting.has("imageWidth")) {
                        imageWidth = setting.getInt("imageWidth");
                    }

                    if (setting.has("imageHeight")) {
                        imageHeight = setting.getInt("imageHeight");
                    }
                }
            }

            final Integer finalImageHeight = imageHeight;
            final Integer finalImageWidth = imageWidth;
            request(RequestUrls.SEARCH_USER, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result){
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        JSONObject returnData = new JSONObject();
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        if (!hasError) {
                            JSONArray users = result.getJSONArray("Result");
                            JSONObject usr = new JSONObject();

                            if (users != null) {
                                String ownId = userData.get("id").toString();
                                for (int i = 0; i < users.length(); i++) {

                                    JSONObject user = users.getJSONObject(i);
                                    String userId = user.get("GcUserId").toString();


                                    if (userId.equals(ownId)) {
                                        continue;
                                    }
                                    JSONObject userData = new JSONObject();
                                    if (user.has("nickName")) {
                                        userData.put("name", user.getString("nickName"));
                                    } else {
                                        userData.put("name", user.getString("firstName"));
                                    }

                                    if (user.has("imageInfo") && !user.isNull("imageInfo")) {
                                        JSONObject image = user.getJSONObject("imageInfo");
                                        image.put("id", image.get("id").toString());
                                        userData.put("image", image);
                                    }

                                    if (user.has("profileImage") && !user.isNull("profileImage")) {
                                        userData.put("imageUrl", user.get("profileImage"));
                                    }

                                    if (user.has("score") && !user.isNull("score")) {
                                        userData.put("score", user.get("score"));
                                    }

                                    if (user.has("username") && !user.isNull("username")) {
                                        userData.put("username", user.get("username"));
                                    }

                                    usr.put(userId, userData);
                                }
                            }


                            JSONObject retResult = new JSONObject();
                            retResult.put("users", usr);
                            retResult.put("hasNext", requestData.getInt("size") == users.length());
                            retResult.put("nextOffset", requestData.getInt("offset") + users.length());
                            retResult.put("count", result.get("Count"));

                            returnData.put("result", retResult);
                        }
                        res.onResult(returnData);


                    } catch (JSONException e) {
                        res.onResult(ExceptionErrorData(e));
                    }
                }
            });


        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'>اشتراک گزاری یک لیگ و یا بازی </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("gameId", "gameId");
     *      JSONArray userIds = new JSONArray();
     *      userIds.put("userId");
     *      reqData.put("userIds", userIds);
     *
     *      service.shareRequest(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("shareRequest method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <p>one of the leagueId or gameIs should be exist in params</p>
     *      <ul>
     *          <li>{String} [gameId] -  شناسه بازی
     *              <p> یکی از فیلد های شناسه بازی و یا لیگ باید پر شود</p>
     *          </li>
     *          <li>{String} [leagueId] - شناسه لیگ</li>
     *          <li>{JSONArray} [cellphoneNumbers] - لیست شماره تماس کاربران </li>
     *          <li>{JSONArray} [userIds] - لیست شناسه کاربران</li>
     *          <li>{Boolean} [sendSms=false] - تعیین ارسال از طریق اس ام اس </li>
     *          <li>{JSONObject} [setting]
     *              <ul>
     *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر کاربر</li>
     *                  <li>{Integer} [imageHeight] اندازه رزولیشن عمودی تصویر کاربر</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void shareRequest(JSONObject params, final RequestCallback callback) throws ServiceException{

        try {
            String gameId = (params.has("gameId") && !params.isNull("gameId")) ? params.get("gameId").toString() : null;
            String leagueId = (params.has("leagueId") && !params.isNull("leagueId")) ? params.get("leagueId").toString() : null;

            if (gameId == null && leagueId == null) {
                throw new ServiceException("one of the leagueId or gameIs should be exist in params");
            }
            String shareUrl = "";
            if (gameId != null) {
                shareUrl = ConfigData.bglp + gameId;
            } else {
                shareUrl = ConfigData.bllp + leagueId;
            }
            JSONArray numbers = (params.has("cellphoneNumbers") && !params.isNull("cellphoneNumbers")) ? params.getJSONArray("cellphoneNumbers") : null;
            JSONArray usersId = (params.has("userIds") && !params.isNull("userIds")) ? params.getJSONArray("userIds") : null;

            if (numbers == null && usersId == null) {
                throw new ServiceException("one of the cellphoneNumbers or userIds should be exist in params");
            }

            JSONObject requestData = new JSONObject();
            Boolean sendSms = (params.has("sendSms")) && params.getBoolean("sendSms");
            requestData.put("sendSms", sendSms);
            requestData.put("url", shareUrl);


            if (numbers != null) {
                requestData.put("cellphoneNumbers", numbers.toString());
            }

            if (usersId != null) {
                requestData.put("usersId", usersId.toString());
            }

            request(RequestUrls.SHARE, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result){
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'>افزایش اعتبار با استفاده از کد تخفیف </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("voucherHash", "voucherHash");
     *      service.increaseCreditWithVoucherRequest(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("increaseCreditWithVoucherRequest method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} voucherHash - کد تخفیف</li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{Long} credit  میزان اعتبار</li>
     *                  <li>{String} creditText  میزات اعتبار به همراه واخد</li>
     *                  <li>{String} unitText  نام واحد اعتبار</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void increaseCreditWithVoucherRequest(JSONObject params, final RequestCallback callback) throws ServiceException{

        try {

            String voucherHash = (params != null && params.has("voucherHash") && !params.isNull("voucherHash")) ? params.getString("voucherHash") : null;

            if (voucherHash == null) {
                throw new ServiceException("voucherHash not exist in params");
            }

            if (voucherHash.length() < 1) {
                throw new ServiceException("voucherHash length should be greater than 1");
            }

            JSONObject requestData = new JSONObject();
            requestData.put("voucherHash", voucherHash);


            request(RequestUrls.INCREASE_CREDIT_BY_VOUCHER, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result) {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));
                        if (!hasError && result.has("Result") && !result.isNull("Result")) {
                            Long credit = result.getLong("Result") / ConfigData.cf;

                            JSONObject resData = new JSONObject();
                            resData.put("credit", credit);
                            resData.put("creditText", credit + " " + ConfigData.cu);
                            resData.put("unitText", ConfigData.cu);

                            returnData.put("result", resData);

                        }

                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'> دریافت میزان جایزه لیگ </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("leagueId", leagueId);
     *
     *      service.getLeagueAwards(reqData, new RequestCallback() {
     *         {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getLeagueAwards method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} leagueId - شناسه لیگ</li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONArray} result -  Array of JSONObject that contain :
     *              <ul>
     *                  <li>{Integer} rank - رتبه دریافت کننده جایزه</li>
     *                  <li>{String} description - توضیحات</li>
     *                  <li>{Long} value - میزان جایزه</li>
     *                  <li>{String} textValue - میزان جایزه به همراه واحد آن</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getLeagueAwards(JSONObject params, final RequestCallback callback) throws ServiceException{
        try {
            String leagueId = (params.has("leagueId") && !params.isNull("leagueId")) ? params.get("leagueId").toString() : null;

            if (leagueId == null) {
                throw new ServiceException("leagueId not exist in params");
            }

            request(RequestUrls.LEAGUE_AWARDS, params, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result){
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        if (!hasError && result.has("Result") && !result.isNull("Result")) {
                            JSONArray retResult = new JSONArray();
                            JSONArray awards = result.getJSONArray("Result");
                            for (int i = 0; i < awards.length(); i++) {
                                double value = awards.getJSONObject(i).getDouble("value") / ConfigData.cf;
                                String textValue = value + "   " + ConfigData.cu;
                                JSONObject award = new JSONObject();
                                award.put("rank", i + 1);
                                award.put("value", value);
                                award.put("textValue", textValue);
                                award.put("description", "جایزه نفر " + (i + 1) + (" ") + textValue);
                                retResult.put(award);
                            }
                            returnData.put("result", retResult);
                        }

                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });
        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     *
     * <div style='width: 100%;text-align: right'>دریافت اطلاعات پروفایل کاربر </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *            JSONObject reqData = new JSONObject();
     *            reqData.put("userId", "5");
     *            service.getUserProfile(reqData, new RequestCallback() {
     *                {@code @Override}
     *                public void onResult(JSONObject result) {
     *                    System.out.println("getUserProfile method : " + result);
     *                }
     *            });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} [userId] - در صورت پر نکردن این فیلد , اطلاعات خود کاربر برگردانده می شود</li>
     *          <li>{Boolean} [refetch=false] - دریافت اطلاعات بروزرسانی شده</li>
     *          <li>{JSONObject} [setting]
     *              <ul>
     *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر کاربر</li>
     *                  <li>{Integer} [imageHeight] اندازه رزولیشن عمودی تصویر کاربر</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{Double} birthDate</li>
     *                  <li>{Double} joinDate</li>
     *                  <li>{Double} score</li>
     *                  <li>{Double} sheba</li>
     *                  <li>{String} [cellphoneNumber]</li>
     *                  <li>{String} [email]</li>
     *                  <li>{String} [firstName]</li>
     *                  <li>{String} [lastName]</li>
     *                  <li>{String} [name]</li>
     *                  <li>{String} nickName</li>
     *                  <li>{String} [gender]</li>
     *                  <li>{Integer} followingCount</li>
     *                  <li>{JSONObject} [image]
     *                      <ul>
     *                          <li>{String}  id</li>
     *                          <li>{String}  url</li>
     *                          <li>{Integer} width</li>
     *                          <li>{Integer} height</li>
     *                      </ul>
     *                  </li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getUserProfile(final JSONObject params, final RequestCallback callback) throws ServiceException {

        try {

            JSONObject requestData = new JSONObject();
            if (params.has("userId")) {
                requestData.put("userId", params.get("userId").toString());
            }

            if (params.has("refetch") && !params.isNull("refetch")) {
                requestData.put("refetch", params.getBoolean("refetch"));
            }

            if (params.has("token") && !params.isNull("token")) {
                requestData.put("token", params.get("token"));
            }

            if (params.has("tokenIssuer") && !params.isNull("tokenIssuer")) {
                requestData.put("tokenIssuer", params.get("tokenIssuer"));
            }

            Integer imageWidth = null;
            Integer imageHeight = null;

            if (params.has("setting") && !params.isNull("setting")) {
                JSONObject setting = params.getJSONObject("setting");
                if (setting != null) {
                    if (setting.has("imageWidth")) {
                        imageWidth = setting.getInt("imageWidth");
                    }

                    if (setting.has("imageHeight")) {
                        imageHeight = setting.getInt("imageHeight");
                    }
                }
            }
            final Integer finalImageWidth = imageWidth;
            final Integer finalImageHeight = imageHeight;
            request(RequestUrls.GET_USER_PROFILE, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result){
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        if (!hasError) {
                            JSONObject user = result.getJSONObject("Result");

                            if (user.has("gender") && !user.isNull("gender")) {
                                if (user.getString("gender").equals("مرد")) {
                                    user.put("gender", "MAN_GENDER");
                                } else {
                                    user.put("gender", "WOMAN_GENDER");
                                }
                            }

                            if (user.has("userId") && !user.isNull("userId")) {
                                user.put("userId", user.get("userId").toString());
                            }
                            if (user.has("GcUserId") && !user.isNull("GcUserId")) {
                                user.put("gcUserId", user.get("GcUserId").toString());
                                user.remove("GcUserId");
                            }

                            if (user.has("imageInfo") && !user.isNull("imageInfo")) {
                                JSONObject image = user.getJSONObject("imageInfo");
                                image.put("id", image.get("id").toString());
                                user.put("image", image);
                                user.remove("imageInfo");
                            }

                            if (user.has("profileImage") && !user.isNull("profileImage")) {
                                user.put("imageUrl", user.get("profileImage"));
                                user.remove("profileImage");
                            }

                            returnData.put("result", user);
                        }


                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });
        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     *
     * <div style='width: 100%;text-align: right'> تغییر رمز عبور</div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *       JSONObject reqData = new JSONObject();
     *       reqData.put("oldPass", "oldPass");
     *       reqData.put("newPass", "newPass");
     *       reqData.put("confirmPass", "confirmPass");
     *       service.changePassword(reqData, new RequestCallback() {
     *           {@code @Override}
     *           public void onResult(JSONObject result) {
     *               System.out.println("changePassword method : " + result);
     *           }
     *       });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} oldPass - رمز قدیمی </li>
     *          <li>{String} newPass - رمز جدید</li>
     *          <li>{String} confirmPass - تکرار رمز جدید</li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * @deprecated
     * */
    public void changePassword(JSONObject params, final RequestCallback callback) throws ServiceException {
        changePasswordRequest(params, callback);
    }

    /**
     * <div style='width: 100%;text-align: right'> تغییر رمز عبور</div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *       JSONObject reqData = new JSONObject();
     *       reqData.put("oldPass", "oldPass");
     *       reqData.put("newPass", "newPass");
     *       reqData.put("confirmPass", "confirmPass");
     *       service.changePassword(reqData, new RequestCallback() {
     *           {@code @Override}
     *           public void onResult(JSONObject result) {
     *               System.out.println("changePassword method : " + result);
     *           }
     *       });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} oldPass - رمز قدیمی </li>
     *          <li>{String} newPass - رمز جدید</li>
     *          <li>{String} confirmPass - تکرار رمز جدید</li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void changePasswordRequest(JSONObject params, final RequestCallback callback) throws ServiceException {
        try {

            String oldPass = (params.has("oldPass") && !params.isNull("oldPass")) ? params.getString("oldPass") : null;
            String newPass = (params.has("newPass") && !params.isNull("newPass")) ? params.getString("newPass") : null;
            String confirmPass = (params.has("confirmPass") && !params.isNull("confirmPass")) ? params.getString("confirmPass") : null;

            if (oldPass == null) {
                throw new ServiceException("oldPass not exist in params");
            }

            if (newPass == null) {
                throw new ServiceException("newPass not exist in params");
            }

            if (confirmPass == null) {
                throw new ServiceException("confirmPass not exist in params");
            }

            request(RequestUrls.CHANGE_PASSWORD, params, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result) {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     *
     * <div style='width: 100%;text-align: right'> ویرایش پروفایل</div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("nickName", "nickName");
     *      service.editProfile(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("editProfile method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} nickName - نام مستعار</li>
     *          <li>{String} [email] - ایمیل</li>
     *          <li>{String} [firstName] - نام</li>
     *          <li>{String} [lastName] - نام خانوادگی</li>
     *          <li>{String} [gender] زن=WOMAN_GENDER  مرد=MAN_GENDER  جنسیت</li>
     *          <li>{JSONObject} [setting]
     *              <ul>
     *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر کاربر</li>
     *                  <li>{Integer} [imageHeight] اندازه رزولیشن عمودی تصویر کاربر</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{Double} birthDate</li>
     *                  <li>{Double} joinDate</li>
     *                  <li>{Double} score</li>
     *                  <li>{Double} sheba</li>
     *                  <li>{String} [cellphoneNumber]</li>
     *                  <li>{String} [email]</li>
     *                  <li>{String} [firstName]</li>
     *                  <li>{String} [lastName]</li>
     *                  <li>{String} [name]</li>
     *                  <li>{String} nickName</li>
     *                  <li>{String} [gender]</li>
     *                  <li>{Integer} followingCount</li>
     *                  <li>{JSONObject} result.image
     *                      <ul>
     *                          <li>{String} id</li>
     *                          <li>{String} url</li>
     *                          <li>{Integer} width</li>
     *                          <li>{Integer} height</li>
     *                      </ul>
     *                  </li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * @deprecated
     * */
    public void editProfile(JSONObject params, final RequestCallback callback) throws ServiceException{
        editProfileRequest(params, callback);
    }

    /**
     * <div style='width: 100%;text-align: right'> ویرایش پروفایل</div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("nickName", "nickName");
     *      service.editProfileRequest(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("editProfile method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} nickName - نام مستعار</li>
     *          <li>{String} [email] - ایمیل</li>
     *          <li>{String} [firstName] - نام</li>
     *          <li>{String} [lastName] - نام خانوادگی</li>
     *          <li>{String} [gender] زن=WOMAN_GENDER  مرد=MAN_GENDER  جنسیت</li>
     *          <li>{JSONObject} [setting]
     *              <ul>
     *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر کاربر</li>
     *                  <li>{Integer} [imageHeight] اندازه رزولیشن عمودی تصویر کاربر</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{Double} birthDate</li>
     *                  <li>{Double} joinDate</li>
     *                  <li>{Double} score</li>
     *                  <li>{Double} sheba</li>
     *                  <li>{String} [cellphoneNumber]</li>
     *                  <li>{String} [email]</li>
     *                  <li>{String} [firstName]</li>
     *                  <li>{String} [lastName]</li>
     *                  <li>{String} [name]</li>
     *                  <li>{String} nickName</li>
     *                  <li>{String} [gender]</li>
     *                  <li>{Integer} followingCount</li>
     *                  <li>{JSONObject} image
     *                      <ul>
     *                          <li>{String} id</li>
     *                          <li>{String} url</li>
     *                          <li>{Integer} width</li>
     *                          <li>{Integer} height</li>
     *                      </ul>
     *                  </li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void editProfileRequest(JSONObject params, final RequestCallback callback) throws ServiceException{
        try {

            String nickName = (params.has("nickName") && !params.isNull("nickName")) ? params.getString("nickName") : null;

            if (nickName == null) {
                throw new ServiceException("nickName not exist in params");
            }

            Integer imageWidth = null;
            Integer imageHeight = null;

            if (params.has("setting") && !params.isNull("setting")) {
                JSONObject setting = params.getJSONObject("setting");
                if (setting != null) {
                    if (setting.has("imageWidth")) {
                        imageWidth = setting.getInt("imageWidth");
                    }

                    if (setting.has("imageHeight")) {
                        imageHeight = setting.getInt("imageHeight");
                    }
                }
            }

            final Integer finalImageWidth = imageWidth;
            final Integer finalImageHeight = imageHeight;

            request(RequestUrls.EDIT_PROFILE, params, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result) {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        if (!hasError) {
                            JSONObject user = result.getJSONObject("Result");

                            if (user.has("imageInfo") && !user.isNull("imageInfo")) {
                                JSONObject image = user.getJSONObject("imageInfo");
                                image.put("id", image.get("id").toString());
                                user.put("image", image);
                                user.remove("imageInfo");
                                userData.put("image",image);
                            }
                            userData.put("name", user.getString("nickName"));

                            returnData.put("result", user);
                            fireEvents("profileChange",user);
                        }

                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     *
     * <div style='width: 100%;text-align: right'> ویرایش تصویر پروفایل</div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("base64Image", "base 64 image data");
     *      service.editProfile(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("editProfile method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} base64Image - تصویر </li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{JSONObject} image
     *                      <ul>
     *                          <li>{String} id</li>
     *                          <li>{Integer} width</li>
     *                          <li>{Integer} height</li>
     *                      </ul>
     *                  </li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void editProfileImageRequest(JSONObject params, final RequestCallback callback) throws ServiceException{
        try {

            String base64Image = (params.has("base64Image") && !params.isNull("base64Image")) ? params.getString("base64Image") : null;

            if (base64Image == null) {
                throw new ServiceException("base64Image not exist in params");
            }

            JSONObject requestData = new JSONObject();
            requestData.put("mobileImage", base64Image);
            request(RequestUrls.EDIT_PROFILE_IMAGE, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result) {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        if (!hasError) {
                            JSONObject retData = new JSONObject();
                            retData.put("image", result.getJSONObject("Result"));
                            returnData.put("result", retData);

                        }


                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }

                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'> دریافت پک های بازی </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("gameId", "2");
     *      service.getInAppPurchasePack(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getInAppPurchasePack method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} gameId - شناسه بازی </li>
     *          <li>{Integer} [size=5]</li>
     *          <li>{Integer} [offset=0]</li>
     *          <li>{String} [packId] - شناسه پک</li>
     *          <li>{String} [itemId] - شناسه آیتم</li>
     *          <li>{String} [nameFilter] - فیلتر بر اساس نام پک</li>
     *          <li>{JSONObject} [setting]
     *              <ul>
     *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر پک</li>
     *                  <li>{Integer} [imageHeight] اندازه رزولیشن عمودی تصویر پک</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{JSONArray} packs - آرایه ای از آبجک  :
     *                      <ul>
     *                          <li>{String} id - شناسه پک</li>
     *                          <li>{String} name - نام پک</li>
     *                          <li>{String} description - توضیحات</li>
     *                          <li>{Integer} count - تعداد</li>
     *                          <li>{Boolean} visible</li>
     *                          <li>{Boolean} enable</li>
     *                          <li>{Boolean} allowedTimesToBuy</li>
     *                          <li>{JSONObject} item</li>
     *                          <li>{JSONObject} plan</li>
     *                              <li>{String} id</li>
     *                              <li>{Integer} type</li>
     *                              <li>{Integer} cycle</li>
     *                              <li>{Double} fromDate</li>
     *                              <li>{Double} ToDate</li>
     *                          <li>{Double} price - قیمت</li>
     *                          <li>{String} priceText - قیمت به همراه واحد آن</li>
     *                          <li>{String} priceUnit - واحد قیمت</li>
     *                          <li>{JSONObject} [image]
     *                              <ul>
     *                                  <li>{String} id</li>
     *                                  <li>{String} url</li>
     *                                  <li>{Integer} width</li>
     *                                  <li>{Integer} height</li>
     *                              </ul>
     *                          </li>
     *                      </ul>
     *                  </li>
     *                  <li>{Boolean} hasNext</li>
     *                  <li>{Integer} nextOffset</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getInAppPurchasePack(JSONObject params, final RequestCallback callback) throws ServiceException {
        try {

            String gameId = (params.has("gameId") && !params.isNull("gameId")) ? params.get("gameId").toString() : null;
            Integer itemId = (params.has("itemId") && !params.isNull("itemId")) ? params.getInt("itemId") : null;

            if (gameId == null && itemId== null) {
                throw new ServiceException("one of the gameId or itemId key should be exist.");
            }

            final JSONObject requestData = new JSONObject();
            if (gameId != null) {
                requestData.put("entityId", gameId);
            }


            Integer packId = (params.has("packId") && !params.isNull("packId")) ? params.getInt("packId") : null;

            String nameFilter = (params.has("nameFilter") && !params.isNull("nameFilter")) ? params.getString("nameFilter") : null;
            Integer size = (params.has("size") && !params.isNull("size")) ? params.getInt("size") : null;
            Integer offset = (params.has("offset") && !params.isNull("offset")) ? params.getInt("offset") : null;
            if (size != null) {
                requestData.put("size", size);
            } else {
                requestData.put("size", 10);
            }

            if (offset != null) {
                requestData.put("offset", offset);
            } else {
                requestData.put("offset", 0);
            }

            if (packId != null) {
                requestData.put("packId", packId);
            }
            if (itemId != null) {
                requestData.put("itemId", itemId);
            }
            if (nameFilter != null) {
                requestData.put("query", nameFilter);
            }

            Integer imageWidth = null;
            Integer imageHeight = null;

            if (params.has("setting") && !params.isNull("setting")) {
                JSONObject setting = params.getJSONObject("setting");
                if (setting != null) {
                    if (setting.has("imageWidth")) {
                        imageWidth = setting.getInt("imageWidth");
                    }

                    if (setting.has("imageHeight")) {
                        imageHeight = setting.getInt("imageHeight");
                    }
                }
            }

            final Integer finalImageHeight = imageHeight;
            final Integer finalImageWidth = imageWidth;

            request(RequestUrls.GET_IN_APP_PURCHASE_PACK, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result) {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        if (!hasError) {

                            JSONArray packs = new JSONArray();
                            JSONArray rawPacks = result.getJSONArray("Result");
                            for (int i = 0; i < rawPacks.length(); i++) {
                                packs.put(reformatInAppPack(rawPacks.getJSONObject(i), finalImageHeight, finalImageWidth));
                            }
                            JSONObject retResult = new JSONObject();
                            retResult.put("packs", packs);
                            retResult.put("hasNext", requestData.getInt("size") == packs.length());
                            retResult.put("nextOffset", requestData.getInt("offset") + packs.length());

                            returnData.put("result", retResult);
                        }


                    } catch (Exception e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'> دریافت پک های گیم سنتری </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("itemId", "4455");
     *      service.getGlobalInAppPurchasePack(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getGlobalInAppPurchasePack method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{Integer} [size=5]</li>
     *          <li>{Integer} [offset=0]</li>
     *          <li>{String} [itemId] - شناسه آیتم</li>
     *          <li>{JSONObject} [setting]
     *              <ul>
     *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر پک</li>
     *                  <li>{Integer} [imageHeight] اندازه رزولیشن عمودی تصویر پک</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{JSONArray} packs - آرایه ای از آبجک  :
     *                      <ul>
     *                          <li>{String} id - شناسه پک</li>
     *                          <li>{String} name - نام پک</li>
     *                          <li>{String} description - توضیحات</li>
     *                          <li>{Integer} count - تعداد</li>
     *                          <li>{Boolean} visible</li>
     *                          <li>{Boolean} enable</li>
     *                          <li>{Boolean} allowedTimesToBuy</li>
     *                          <li>{JSONObject} item</li>
     *                          <li>{JSONObject} plan</li>
     *                              <li>{String} id</li>
     *                              <li>{Integer} type</li>
     *                              <li>{Integer} cycle</li>
     *                              <li>{Double} fromDate</li>
     *                              <li>{Double} ToDate</li>
     *                          <li>{Double} price - قیمت</li>
     *                          <li>{String} priceText - قیمت به همراه واحد آن</li>
     *                          <li>{String} priceUnit - واحد قیمت</li>
     *                          <li>{JSONObject} [image]
     *                              <ul>
     *                                  <li>{String} id</li>
     *                                  <li>{String} url</li>
     *                                  <li>{Integer} width</li>
     *                                  <li>{Integer} height</li>
     *                              </ul>
     *                          </li>
     *                      </ul>
     *                  </li>
     *                  <li>{Boolean} hasNext</li>
     *                  <li>{Integer} nextOffset</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getGlobalInAppPurchasePack(JSONObject params, final RequestCallback callback) throws ServiceException {
        try {

            String itemId = (params.has("itemId") && !params.isNull("itemId")) ? params.get("itemId").toString() : null;

            if (itemId == null) {
                throw new ServiceException("itemId not exist in params");
            }

            final JSONObject requestData = new JSONObject();
            requestData.put("itemId", itemId);

            Integer size = (params.has("size") && !params.isNull("size")) ? params.getInt("size") : null;
            Integer offset = (params.has("offset") && !params.isNull("offset")) ? params.getInt("offset") : null;
            if (size != null) {
                requestData.put("size", size);
            } else {
                requestData.put("size", 10);
            }

            if (offset != null) {
                requestData.put("offset", offset);
            } else {
                requestData.put("offset", 0);
            }
            Integer imageWidth = null;
            Integer imageHeight = null;

            if (params.has("setting") && !params.isNull("setting")) {
                JSONObject setting = params.getJSONObject("setting");
                if (setting != null) {
                    if (setting.has("imageWidth")) {
                        imageWidth = setting.getInt("imageWidth");
                    }

                    if (setting.has("imageHeight")) {
                        imageHeight = setting.getInt("imageHeight");
                    }
                }
            }

            final Integer finalImageHeight = imageHeight;
            final Integer finalImageWidth = imageWidth;

            request(RequestUrls.GET_GLOBAL_IN_APP_PURCHASE_PACK, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result) {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));


                        if (!hasError) {

                            JSONArray packs = new JSONArray();
                            JSONArray rawPacks = result.getJSONArray("Result");
                            for (int i = 0; i < rawPacks.length(); i++) {
                                packs.put(reformatInAppPack(rawPacks.getJSONObject(i), finalImageHeight, finalImageWidth));
                            }
                            JSONObject retResult = new JSONObject();
                            retResult.put("packs", packs);
                            retResult.put("hasNext", requestData.getInt("size") == packs.length());
                            retResult.put("nextOffset", requestData.getInt("offset") + packs.length());

                            returnData.put("result", retResult);
                        }


                    } catch (Exception e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'>خرید یک پک </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("packId", "1089");
     *      service.buyInAppPurchasePackRequest(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("buyInAppPurchasePackRequest method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} packId - شناسه پک</li>
     *          <li>{String} [voucherHash] - کد تخفیف</li>
     *          <li>{String} [count=1] - تعداد پگ برای خرید</li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{String} id</li>
     *                  <li>{String} Name</li>
     *                  <li>{Double} packs.price</li>
     *                  <li>{String} packs.priceText</li>
     *                  <li>{String} packs.priceUnit</li>
     *                  <li>{String} description</li>
     *                  <li>{Integer} count</li>
     *                  <li>{Double} price</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void buyInAppPurchasePackRequest(JSONObject params, final RequestCallback callback) throws ServiceException {
        try {

            String packId = (params.has("packId") && !params.isNull("packId")) ? params.get("packId").toString() : null;

            if (packId == null) {
                throw new ServiceException("packId not exist in params");
            }

            request(RequestUrls.BYY_IN_APP_PURCHASE_PACK, params, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result){
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));
                        if (!hasError) {

                            JSONObject retResult = new JSONObject();
                            retResult.put("count", result.getJSONObject("Result").getInt("Count"));
                            retResult.put("id", result.getJSONObject("Result").getJSONObject("Item").get("ID").toString());
                            returnData.put("result", retResult);
                        }

                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'> دریافت آیتم های یک بازی </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("gameId", "2");
     *      service.getGameItems(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getGameItems method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} gameId - شناسه بازی</li>
     *          <li>{Integer} [size=5]</li>
     *          <li>{Integer} [offset=0]</li>
     *          <li>{String} [itemId] - شناسه آیتم
     *              <p> در صورت پر کردن این فیلد , آیتم مشخص شده باز گردانده می شود و در غیر اینصورت کلیه آیتم های آن بازی</p>
     *          </li>
     *          <li>{JSONObject} [setting]
     *              <ul>
     *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر آیتم</li>
     *                  <li>{Integer} [imageHeight]  رزولیشن عمودی تصویر آیتم</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @param  callback
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{JSONArray} packs - Array Of JSONObject that contain :
     *                      <ul>
     *                          <li>{String} id</li>
     *                          <li>{String} name</li>
     *                          <li>{String} description</li>
     *                          <li>{Boolean} visible</li>
     *                          <li>{Boolean} enable</li>
     *                          <li>{Boolean} allowedTimesToBuy</li>
     *                          <li>{JSONObject} [image]
     *                              <ul>
     *                                  <li>{String} id</li>
     *                                  <li>{String} url</li>
     *                                  <li>{Integer} width</li>
     *                                  <li>{Integer} height</li>
     *                              </ul>
     *                          </li>
     *                      </ul>
     *                  </li>
     *                  <li>{Boolean} hasNext</li>
     *                  <li>{Integer} nextOffset</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getGameItems(JSONObject params, final RequestCallback callback) throws ServiceException{
        try {

            String gameId = (params.has("gameId") && !params.isNull("gameId")) ? params.get("gameId").toString() : null;

            if (gameId == null) {
                throw new ServiceException("gameId not exist in params");
            }

            final JSONObject requestData = new JSONObject();
            requestData.put("entityId", gameId);

            Integer itemId = (params.has("itemId") && !params.isNull("itemId")) ? params.getInt("itemId") : null;
            Integer size = (params.has("size") && !params.isNull("size")) ? params.getInt("size") : null;
            Integer offset = (params.has("offset") && !params.isNull("offset")) ? params.getInt("offset") : null;
            if (size != null) {
                requestData.put("size", size);
            } else {
                requestData.put("size", 10);
            }

            if (offset != null) {
                requestData.put("offset", offset);
            } else {
                requestData.put("offset", 0);
            }

            if (itemId != null) {
                requestData.put("itemId", itemId);
            }

            Integer imageWidth = null;
            Integer imageHeight = null;

            if (params.has("setting") && !params.isNull("setting")) {
                JSONObject setting = params.getJSONObject("setting");
                if (setting != null) {
                    if (setting.has("imageWidth")) {
                        imageWidth = setting.getInt("imageWidth");
                    }

                    if (setting.has("imageHeight")) {
                        imageHeight = setting.getInt("imageHeight");
                    }
                }
            }

            final Integer finalImageHeight = imageHeight;
            final Integer finalImageWidth = imageWidth;

            request(RequestUrls.GET_GAME_ITEMS, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        if (!hasError) {

                            JSONArray items = new JSONArray();
                            JSONArray rawItems = result.getJSONArray("Result");
                            for (int i = 0; i < rawItems.length(); i++) {
                                items.put(reformatGameItem(rawItems.getJSONObject(i), finalImageHeight, finalImageWidth));
                            }

                            JSONObject retResult = new JSONObject();
                            retResult.put("items", items);
                            retResult.put("hasNext", requestData.getInt("size") == items.length());
                            retResult.put("nextOffset", requestData.getInt("offset") + items.length());

                            returnData.put("result", retResult);
                        }


                    } catch (Exception e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'> دریافت آیتم های مربوط به گیم سنتر </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("gameId", "3");
     *      service.getUserGameCenterItem(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getUserGameCenterItem method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} gameId - شناسه بازی</li>
     *          <li>{Integer} [size=5]</li>
     *          <li>{Integer} [offset=0]</li>
     *          <li>{String} [itemId] - شناسه آیتم
     *              <p> در صورت پر کردن این فیلد , آیتم مشخص شده باز گردانده می شود و در غیر اینصورت کلیه آیتم های آن بازی</p>
     *          </li>
     *          <li>{JSONObject} [setting]
     *              <ul>
     *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر آیتم</li>
     *                  <li>{Integer} [imageHeight]  رزولیشن عمودی تصویر آیتم</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @param  callback
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{JSONArray} packs - Array Of JSONObject that contain :
     *                      <ul>
     *                          <li>{String} id</li>
     *                          <li>{String} name</li>
     *                          <li>{String} description</li>
     *                          <li>{Boolean} visible</li>
     *                          <li>{Boolean} enable</li>
     *                          <li>{Boolean} allowedTimesToBuy</li>
     *                          <li>{JSONObject} [image]
     *                              <ul>
     *                                  <li>{String} id</li>
     *                                  <li>{String} url</li>
     *                                  <li>{Integer} width</li>
     *                                  <li>{Integer} height</li>
     *                              </ul>
     *                          </li>
     *                      </ul>
     *                  </li>
     *                  <li>{Boolean} hasNext</li>
     *                  <li>{Integer} nextOffset</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getUserGameCenterItem(JSONObject params, final RequestCallback callback) throws ServiceException{
        try {

            String itemId = (params.has("itemId") && !params.isNull("itemId")) ? params.get("itemId").toString() : null;
            final JSONObject requestData = new JSONObject();


            Integer size = (params.has("size") && !params.isNull("size")) ? params.getInt("size") : null;
            Integer offset = (params.has("offset") && !params.isNull("offset")) ? params.getInt("offset") : null;
            if (size != null) {
                requestData.put("size", size);
            } else {
                requestData.put("size", 10);
            }

            if (offset != null) {
                requestData.put("offset", offset);
            } else {
                requestData.put("offset", 0);
            }

            if (itemId != null) {
                requestData.put("itemId", itemId);
            }

            Integer imageWidth = null;
            Integer imageHeight = null;

            if (params.has("setting") && !params.isNull("setting")) {
                JSONObject setting = params.getJSONObject("setting");
                if (setting != null) {
                    if (setting.has("imageWidth")) {
                        imageWidth = setting.getInt("imageWidth");
                    }

                    if (setting.has("imageHeight")) {
                        imageHeight = setting.getInt("imageHeight");
                    }
                }
            }

            final Integer finalImageHeight = imageHeight;
            final Integer finalImageWidth = imageWidth;

            request(RequestUrls.GET_USER_GC_ITEMS, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        if (!hasError) {

                            JSONArray items = new JSONArray();
                            JSONArray rawItems = result.getJSONArray("Result");
                            for (int i = 0; i < rawItems.length(); i++) {
                                items.put(reformatUserItem(rawItems.getJSONObject(i), finalImageHeight, finalImageWidth));
                            }

                            JSONObject retResult = new JSONObject();
                            retResult.put("items", items);
                            retResult.put("hasNext", requestData.getInt("size") == items.length());
                            retResult.put("nextOffset", requestData.getInt("offset") + items.length());

                            returnData.put("result", retResult);
                        }

                    } catch (Exception e) {
                        returnData = ExceptionErrorData(e);
                    }

                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'> دریافت آیتم های کاربر </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("gameId", "3");
     *      service.getUserItems(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getUserItems method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} gameId - شناسه بازی</li>
     *          <li>{Integer} [size=5]</li>
     *          <li>{Integer} [offset=0]</li>
     *          <li>{String} [itemId] - شناسه آیتم</li>
     *          <li>{JSONObject} [setting]
     *              <ul>
     *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر آیتم</li>
     *                  <li>{Integer} [imageHeight]  رزولیشن عمودی تصویر آیتم</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{JSONArray} items  - Array Of JSONObject that contain :
     *                      <ul>
     *                          <li>{String} id</li>
     *                          <li>{Integer} count</li>
     *                          <li>{JSONObject} item</li>
     *                      </ul>
     *                  </li>
     *                  <li>{Boolean} hasNext</li>
     *                  <li>{Integer} nextOffset</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getUserItems(JSONObject params, final RequestCallback callback) throws ServiceException{
        try {

            String gameId = (params.has("gameId") && !params.isNull("gameId")) ? params.get("gameId").toString() : null;

            if (gameId == null) {
                throw new ServiceException("gameId not exist in params");
            }

            final JSONObject requestData = new JSONObject();
            requestData.put("entityId", gameId);

            Integer itemId = (params.has("itemId") && !params.isNull("itemId")) ? params.getInt("itemId") : null;
            Integer size = (params.has("size") && !params.isNull("size")) ? params.getInt("size") : null;
            Integer offset = (params.has("offset") && !params.isNull("offset")) ? params.getInt("offset") : null;
            if (size != null) {
                requestData.put("size", size);
            } else {
                requestData.put("size", 10);
            }

            if (offset != null) {
                requestData.put("offset", offset);
            } else {
                requestData.put("offset", 0);
            }

            if (itemId != null) {
                requestData.put("itemId", itemId);
            }

            Integer imageWidth = null;
            Integer imageHeight = null;

            if (params.has("setting") && !params.isNull("setting")) {
                JSONObject setting = params.getJSONObject("setting");
                if (setting != null) {
                    if (setting.has("imageWidth")) {
                        imageWidth = setting.getInt("imageWidth");
                    }

                    if (setting.has("imageHeight")) {
                        imageHeight = setting.getInt("imageHeight");
                    }
                }
            }

            final Integer finalImageHeight = imageHeight;
            final Integer finalImageWidth = imageWidth;

            request(RequestUrls.GET_USER_ITEMS, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        if (!hasError) {

                            JSONArray items = new JSONArray();
                            JSONArray rawItems = result.getJSONArray("Result");
                            for (int i = 0; i < rawItems.length(); i++) {
                                items.put(reformatUserItem(rawItems.getJSONObject(i), finalImageHeight, finalImageWidth));
                            }

                            JSONObject retResult = new JSONObject();
                            retResult.put("items", items);
                            retResult.put("hasNext", requestData.getInt("size") == items.length());
                            retResult.put("nextOffset", requestData.getInt("offset") + items.length());

                            returnData.put("result", retResult);
                        }


                    } catch (Exception e) {
                        returnData = ExceptionErrorData(e);
                    }

                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     *
     * <div style='width: 100%;text-align: right'> مصرف آیتم کاربر </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *            JSONObject reqData = new JSONObject();
     *            reqData.put("itemId", "itemId");
     *            reqData.put("count", count);
     *            service.consumeItem(reqData, new RequestCallback() {
     *                {@code @Override}
     *                public void onResult(JSONObject result) {
     *                    System.out.println("consumeItem method : " + result);
     *                }
     *            });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} itemId - شناسه آیتم</li>
     *          <li>{Integer} count - تعداد مصرف شده</li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * @deprecated
     * */
    public void consumeItem(JSONObject params, final RequestCallback callback) throws ServiceException {
        consumeItemRequest(params, callback);
    }

    /**
     * <div style='width: 100%;text-align: right'> مصرف آیتم کاربر </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *            JSONObject reqData = new JSONObject();
     *            reqData.put("itemId", "1061");
     *            reqData.put("count", 10);
     *            service.consumeItem(reqData, new RequestCallback() {
     *                {@code @Override}
     *                public void onResult(JSONObject result) {
     *                    System.out.println("consumeItem method : " + result);
     *                }
     *            });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} itemId - شناسه آیتم</li>
     *          <li>{Integer} count - تعداد مصرف شده</li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void consumeItemRequest(JSONObject params, final RequestCallback callback) throws ServiceException {
        try {

            String itemId = (params.has("itemId") && !params.isNull("itemId")) ? params.get("itemId").toString() : null;
            Integer count = (params.has("count") && !params.isNull("count")) ? params.getInt("count") : null;

            if (itemId == null) {
                throw new ServiceException("packId not exist in params");
            }

            if (count == null) {
                throw new ServiceException("count not exist in params");
            }

            request(RequestUrls.CONSUME_ITEM, params, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result) {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }

                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     *
     * <div style='width: 100%;text-align: right'>دریافت میزان اعتبار کاربر </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      service.getCredit(new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getCredit method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{Double} credit - میزان اعتبار</li>
     *                  <li>{String} text - میزان اعتبار به همراه واحد آن</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     *
     * @throws ServiceException خطای سرویس
     * */
    public void getCredit(final RequestCallback callback) throws ServiceException{

        request(RequestUrls.CREDIT, new JSONObject(), new Network.HttpRequestCallback() {
            @Override
            public void onResult(JSONObject result){
                JSONObject returnData = new JSONObject();
                try {
                    boolean hasError = result.getBoolean("HasError");
                    returnData.put("hasError", hasError);
                    returnData.put("errorMessage", result.getString("ErrorMessage"));
                    returnData.put("errorCode", result.getInt("ErrorCode"));
                    JSONObject retResult = new JSONObject();
                    if (!hasError) {
                        double credit = (result.getJSONObject("Result").getDouble("credit")) / ConfigData.cf;
                        retResult.put("credit", credit);
                        retResult.put("text", credit + " " + ConfigData.cu);
                        returnData.put("result", retResult);
                    }

                } catch (JSONException e) {
                    returnData = ExceptionErrorData(e);
                }
                callback.onResult(returnData);
            }
        });
    }

    /**
     *
     * <div style='width: 100%;text-align: right'> تغییر وضعیت کاربر برای دریافت و یا عدم دریافت درخواست مسابقه</div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      service.changeVisibilityRequest(new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("changeVisibilityRequest method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{‌Boolean} visible - وضعیت کنونی کاربر </li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای سرویس
     * */
    public void changeVisibilityRequest(final RequestCallback callback) throws ServiceException{
        try {

            JSONObject requestData = new JSONObject();

            if (!userData.has("peerId")) {
                JSONObject returnData = new JSONObject();
                returnData.put("hasError", true);
                returnData.put("errorMessage", "user is not connect to async server");
                returnData.put("errorCode", ErrorCodes.USER_NOT_CONNECTED);
                callback.onResult(returnData);
                return;
            }

            requestData.put("peerId", userData.get("peerId").toString());

            request(RequestUrls.INVISIBLE, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));


                        if (result.has("Result") && !result.isNull("Result")) {
                            returnData.put("result", result.getJSONObject("Result"));
                        }

                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });
        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     *
     * <div style='width: 100%;text-align: right'> دریافت دسته بندی های بازی</div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      service.getLobby(new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getLobby method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONArray} result - Array Of JSONObject that contain :
     *              <ul>
     *                  <li>{String} id</li>
     *                  <li>{String} name</li>
     *                  <li>{JSONObject} [image]
     *                      <ul>
     *                          <li>{String} id</li>
     *                          <li>{String} url</li>
     *                          <li>{Integer} width</li>
     *                          <li>{Integer} height</li>
     *                      </ul>
     *                  </li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای سرویس
     * */
    public void getLobby(final RequestCallback callback) throws ServiceException{

        request(RequestUrls.GET_LOBBIES, new JSONObject(), new Network.HttpRequestCallback() {
            @Override
            public void onResult(JSONObject result) {
                JSONObject returnData = new JSONObject();
                try {
                    boolean hasError = result.getBoolean("HasError");
                    returnData.put("hasError", hasError);
                    returnData.put("errorMessage", result.getString("ErrorMessage"));
                    returnData.put("errorCode", result.getInt("ErrorCode"));


                    if (!hasError && result.has("Result") && !result.isNull("Result")) {
                        JSONArray retRes = result.getJSONArray("Result");
                        JSONArray retRestul = new JSONArray();

                        for (int i = 0; i < retRes.length(); i++) {
                            JSONObject lobby = retRes.getJSONObject(i);
                            JSONObject data = new JSONObject();

                            data.put("id", lobby.get("ID").toString());
                            data.put("name", lobby.getString("Name"));
                            if (lobby.has("Image") && !lobby.isNull("Image")) {
                                JSONObject image = lobby.getJSONObject("Image");
                                image.put("id", image.get("id").toString());
                                data.put("image", image);
                            }

                            retRestul.put(data);
                        }
                        returnData.put("result", retRestul);
                    }


                } catch (JSONException e) {
                    returnData = ExceptionErrorData(e);
                }
                callback.onResult(returnData);
            }
        });
    }

    /**
     *
     * <div style='width: 100%;text-align: right'>  دریافت اخبار </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("businessId", "businessId");
     *      service.getNews(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getNews method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} businessId - شناسه بیزینس</li>
     *          <li>{Integer} [size=10]</li>
     *          <li>{Integer} [offset=0]</li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{JSONArray} news :
     *                      <ul>
     *                          <li>{JSONObject} business</li>
     *                          <li>{String} id</li>
     *                          <li>{String} name</li>
     *                          <li>{Integer} numOfProducts</li>
     *                          <li>{JSONObject} rate
     *                              <ul>
     *                                  <li>{Integer} rate</li>
     *                                  <li>{Integer} rateCount</li>
     *                              </ul>
     *                          </li>
     *                          <li>{JSONObject} [image]
     *                              <ul>
     *                                  <li>{String} id</li>
     *                                  <li>{String} name</li>
     *                                  <li>{String} url</li>
     *                                  <li>{Integer} width</li>
     *                                  <li>{Integer} height</li>
     *                              </ul>
     *                          </li>
     *                          <li>{JSONArray} categoryList</li>
     *                          <li>{Boolean} enable</li>
     *                          <li>{Boolean} hide</li>
     *                          <li>{Boolean} hot</li>
     *                          <li>{String} entityId</li>
     *                          <li>{String} id</li>
     *                          <li>{Double} latitude</li>
     *                          <li>{Double} longitude</li>
     *                          <li>{String} link</li>
     *                          <li>{String} metadata</li>
     *                          <li>{String} rootitr</li>
     *                          <li>{String} shortDescription</li>
     *                          <li>{String} text</li>
     *                          <li>{String} title</li>
     *                          <li>{String} timelineId</li>
     *                          <li>{Integer} numOfComments</li>
     *                          <li>{Integer} numOfFavorites</li>
     *                          <li>{Integer} numOfLikes</li>
     *                          <li>{Integer} timestamp</li>
     *                          <li>{JSONObject} userPostInfo
     *                              <ul>
     *                                  <li>{String} postId</li>
     *                                  <li>{Boolean} favorite</li>
     *                                  <li>{Boolean} liked</li>
     *                              </ul>
     *                          </li>
     *                          <li>{JSONObject} image
     *                              <ul>
     *                                  <li>{String} id</li>
     *                                  <li>{String} name</li>
     *                                  <li>{String} url</li>
     *                                  <li>{Integer} width</li>
     *                                  <li>{Integer} height</li>
     *                              </ul>
     *                          </li>
     *                      </ul>
     *                  </li>
     *                  <li>{Boolean} hasNext</li>
     *                  <li>{Integer} nextOffset</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getNews(JSONObject params, final RequestCallback callback) throws ServiceException{
        try {

            String businessId = (params.has("businessId") && !params.isNull("businessId")) ? params.get("businessId").toString() : null;

            if (businessId == null) {
                throw new ServiceException("businessId not exist in params");
            }

            final JSONObject requestData = new JSONObject();
            requestData.put("businessId", businessId);

            Integer size = (params.has("size") && !params.isNull("size")) ? params.getInt("size") : 10;
            Integer offset = (params.has("offset") && !params.isNull("offset")) ? params.getInt("offset") : 0;
            requestData.put("size", size);
            requestData.put("offset", offset);


            Integer imageWidth = null;
            Integer imageHeight = null;

            if (params.has("setting") && !params.isNull("setting")) {
                JSONObject setting = params.getJSONObject("setting");
                if (setting != null) {
                    if (setting.has("imageWidth")) {
                        imageWidth = setting.getInt("imageWidth");
                    }

                    if (setting.has("imageHeight")) {
                        imageHeight = setting.getInt("imageHeight");
                    }
                }
            }

            final Integer finalImageHeight = imageHeight;
            final Integer finalImageWidth = imageWidth;

            request(RequestUrls.GET_NEWS, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));


                        if (!hasError) {
                            JSONArray news = result.getJSONArray("Result");
                            JSONArray refNews = new JSONArray();
                            for (int i = 0; i < news.length(); i++) {
                                refNews.put(reformatNewsObject(news.getJSONObject(i), finalImageHeight, finalImageWidth));
                            }
                            JSONObject retResult = new JSONObject();
                            retResult.put("news", refNews);
                            retResult.put("hasNext", requestData.getInt("size") == refNews.length());
                            retResult.put("nextOffset", requestData.getInt("offset") + refNews.length());

                            returnData.put("result", retResult);
                        }


                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }

                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     *
     * <div style='width: 100%;text-align: right'> درخواست دنبال کردن بازی </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *     JSONObject reqData = new JSONObject();
     *     reqData.put("businessId", "businessId");
     *     reqData.put("postId", "postId");
     *     reqData.put("state", false);
     *     service.followGameRequest(reqData, new RequestCallback() {
     *         {@code @Override}
     *         public void onResult(JSONObject result) {
     *             System.out.println("followGameRequest method : " + result);
     *         }
     *     });
     *  </code>
     * </pre>
     * @param  params
     *  <ul>
     *      <li>{String} businessId - شناسه بیزینس</li>
     *      <li>{String} postId - شناسه پست</li>
     *      <li>{Boolean} [state = true] - وضعیت فالو</li>
     *  </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *      </ul>
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void followGameRequest(JSONObject params, final RequestCallback callback) throws ServiceException {
        try {

            String businessId = (params.has("businessId") && !params.isNull("businessId")) ? params.get("businessId").toString() : null;
            String postId = (params.has("postId") && !params.isNull("postId")) ? params.get("postId").toString() : null;
            Boolean state = !(params.has("state") && !params.isNull("state")) || params.getBoolean("state");

            if (businessId == null) {
                throw new ServiceException("businessId not exist in params");
            }

            if (postId == null) {
                throw new ServiceException("postId not exist in params");
            }

            final JSONObject requestData = new JSONObject();
            requestData.put("businessId", businessId);
            requestData.put("postId", postId);
            requestData.put("disfavorite", !state);

            request(RequestUrls.FOLLOW_GAME, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }

                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }


    /**
     *
     * <div style='width: 100%;text-align: right'> درخواست دنبال کردن لیگ </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *     JSONObject reqData = new JSONObject();
     *     reqData.put("businessId", "businessId");
     *     reqData.put("postId", "postId");
     *     reqData.put("state", false);
     *     service.followLeagueRequest(reqData, new RequestCallback() {
     *         {@code @Override}
     *         public void onResult(JSONObject result) {
     *             System.out.println("followLeagueRequest method : " + result);
     *         }
     *     });
     *  </code>
     * </pre>
     * @param  params
     *  <ul>
     *      <li>{String} businessId - شناسه بیزینس</li>
     *      <li>{String} postId - شناسه پست</li>
     *      <li>{Boolean} [state = true] - وضعیت فالو</li>
     *  </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *      </ul>
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void followLeagueRequest(JSONObject params, final RequestCallback callback) throws ServiceException {
        try {

            String businessId = (params.has("businessId") && !params.isNull("businessId")) ? params.get("businessId").toString() : null;
            String postId = (params.has("postId") && !params.isNull("postId")) ? params.get("postId").toString() : null;
            Boolean state = !(params.has("state") && !params.isNull("state")) || params.getBoolean("state");

            if (businessId == null) {
                throw new ServiceException("businessId not exist in params");
            }

            if (postId == null) {
                throw new ServiceException("postId not exist in params");
            }

            final JSONObject requestData = new JSONObject();
            requestData.put("businessId", businessId);
            requestData.put("postId", postId);
            requestData.put("disfavorite", !state);

            request(RequestUrls.FOLLOW_LEAGUE, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }

                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     *
     * <div style='width: 100%;text-align: right'> درخواست دنبال کردن پست </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *     JSONObject reqData = new JSONObject();
     *     reqData.put("postId", "postId");
     *     reqData.put("state", false);
     *     service.followPostRequest(reqData, new RequestCallback() {
     *         {@code @Override}
     *         public void onResult(JSONObject result) {
     *             System.out.println("followLeagueRequest method : " + result);
     *         }
     *     });
     *  </code>
     * </pre>
     * @param  params
     *  <ul>
     *      <li>{String} postId - شناسه پست</li>
     *      <li>{Boolean} [state = true] - وضعیت فالو</li>
     *  </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *      </ul>
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void followPostRequest(JSONObject params, final RequestCallback callback) throws ServiceException {
        try {

            String postId = (params.has("postId") && !params.isNull("postId")) ? params.get("postId").toString() : null;
            Boolean state = !(params.has("state") && !params.isNull("state")) || params.getBoolean("state");

            if (postId == null) {
                throw new ServiceException("postId not exist in params");
            }

            final JSONObject requestData = new JSONObject();
            requestData.put("postId", postId);
            requestData.put("disfavorite", !state);

            request(RequestUrls.FOLLOW_POST, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }

                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     *
     * <div style='width: 100%;text-align: right'> پست کردن لایک </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *     JSONObject reqData = new JSONObject();
     *     reqData.put("postId", "postId");
     *     reqData.put("state", false);
     *     service.likePostRequest(reqData, new RequestCallback() {
     *         {@code @Override}
     *         public void onResult(JSONObject result) {
     *             System.out.println("likePostRequest method : " + result);
     *         }
     *     });
     *  </code>
     * </pre>
     * @param  params
     *  <ul>
     *      <li>{String} postId - شناسه پست</li>
     *      <li>{Boolean} [state = true] - وضعیت فالو</li>
     *  </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *      </ul>
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void likePostRequest(JSONObject params, final RequestCallback callback) throws ServiceException {
        try {

            String postId = (params.has("postId") && !params.isNull("postId")) ? params.get("postId").toString() : null;
            Boolean state = !(params.has("state") && !params.isNull("state")) || params.getBoolean("state");

            if (postId == null) {
                throw new ServiceException("postId not exist in params");
            }

            final JSONObject requestData = new JSONObject();
            requestData.put("postId", postId);
            requestData.put("dislike", !state);

            request(RequestUrls.LIKE_POST, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }

                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }


    /**
     *
     * <div style='width: 100%;text-align: right'> دریافت برترین بازیکنان لیگ</div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      service.getLeagueTopPlayers(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getLeagueTopPlayers method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} leagueId - شناسه لیگ</li>
     *          <li>{Integer} [size=50]</li>
     *          <li>{Integer} [offset=0]</li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{String} columnName</li>
     *                  <li>{JSONArray} players
     *                      <ul>
     *                          <li>{Double} score - امتیاز</li>
     *                          <li>{String} id - شناسه بازیکن</li>
     *                          <li>{String} name - نام بازیکن</li>
     *                          <li>{JSONObject} [image]
     *                              <ul>
     *                                  <li>{String} id</li>
     *                                  <li>{String} url</li>
     *                                  <li>{Integer} width</li>
     *                                  <li>{Integer} height</li>
     *                              </ul>
     *                          </li>
     *                          <li>{JSONObject} imageUrl</li>
     *                      </ul>
     *                  </li>
     *                  <li>{Boolean} hasNext</li>
     *                  <li>{Integer} nextOffset</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getLeagueTopPlayers(JSONObject params, final RequestCallback callback) throws ServiceException {
        try {
            JSONObject requestData = new JSONObject();
            String leagueId = (params!= null &&  params.has("leagueId") && !params.isNull("leagueId")) ? params.get("leagueId").toString() : null;


            if (leagueId != null) {
                requestData.put("leagueId", leagueId);
            }

            final Integer size = (params.has("size") && !params.isNull("size")) ? params.getInt("size") : 50;
            final Integer offset = (params.has("offset") && !params.isNull("offset")) ? params.getInt("offset") : 0;
            requestData.put("size", size);
            requestData.put("offset", offset);


            request(RequestUrls.GET_LEAGUE_TOP_PLAYERS, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result) {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        JSONObject retResult = new JSONObject();
                        if (!hasError) {

                            JSONArray players = new JSONArray();
                            if (result.has("Result") && !result.isNull("Result")) {
                                JSONObject res = result.getJSONObject("Result");
                                JSONArray topPlayers = res.getJSONArray("TopPlayers");

                                for (int i = 0; i < topPlayers.length(); i++) {
                                    JSONObject playerData = topPlayers.getJSONObject(i);
                                    JSONObject playerInfo = playerData.getJSONObject("UserInfo");
                                    if (playerInfo.has("image") && !playerInfo.isNull("image")) {
                                        JSONObject imageData = playerInfo.getJSONObject("image");
                                        imageData.put("id", imageData.get("id").toString());
                                        playerInfo.put("image", imageData);
                                    }

                                    if (playerInfo.has("profileImage") && !playerInfo.isNull("profileImage")) {
                                        playerInfo.put("imageUrl", playerInfo.get("profileImage"));
                                    }

                                    playerInfo.put("score", playerData.getDouble("Score"));
                                    players.put(playerInfo);
                                }
                                retResult.put("columnName", res.getString("ColumnName"));
                                retResult.put("hasNext", size == topPlayers.length());
                                retResult.put("nextOffset", offset + topPlayers.length());
                                retResult.put("count", result.get("Count"));

                            } else {
                                retResult.put("columnName", "");
                                retResult.put("hasNext", false);
                                retResult.put("nextOffset", 0);
                                retResult.put("count", 0);
                            }

                            retResult.put("players", players);
                        }

                        returnData.put("result", retResult);

                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });
        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }


    /**
     *
     * <div style='width: 100%;text-align: right'> دریافت برترین بازیکنان گیم سنتر و یا لیگ</div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      service.getTopPlayers(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getTopPlayers method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} [gameId] - شناسه بازی</li>
     *          <li>{Integer} [size=50]</li>
     *          <li>{Integer} [offset=0]</li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{Integer} count</li>
     *                  <li>{JSONArray} players
     *                      <ul>
     *                          <li>{Double} score - امتیاز</li>
     *                          <li>{String} id - شناسه بازیکن</li>
     *                          <li>{String} name - نام بازیکن</li>
     *                          <li>{JSONObject} [image]
     *                              <ul>
     *                                  <li>{String} id</li>
     *                                  <li>{String} url</li>
     *                                  <li>{Integer} width</li>
     *                                  <li>{Integer} height</li>
     *                              </ul>
     *                          </li>
     *                          <li>{JSONObject} imageUrl</li>
     *                      </ul>
     *                  </li>
     *                  <li>{Boolean} hasNext</li>
     *                  <li>{Integer} nextOffset</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getTopPlayers(JSONObject params, final RequestCallback callback) throws ServiceException {
        try {
            JSONObject requestData = new JSONObject();
            String gameId = (params!= null && params.has("gameId") && !params.isNull("gameId")) ? params.get("gameId").toString() : null;

            if (gameId != null) {
                requestData.put("gameId", gameId);
            }


            final Integer size = (params.has("size") && !params.isNull("size")) ? params.getInt("size") : 50;
            final Integer offset = (params.has("offset") && !params.isNull("offset")) ? params.getInt("offset") : 0;
            requestData.put("size", size);
            requestData.put("offset", offset);


            request(RequestUrls.GET_TOP_PLAYERS, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result) {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        JSONObject retResult = new JSONObject();
                        if (!hasError) {

                            JSONArray players = new JSONArray();
                            if (result.has("Result") && !result.isNull("Result")) {
                                JSONArray topPlayers = result.getJSONArray("Result");

                                for (int i = 0; i < topPlayers.length(); i++) {
                                    JSONObject playerData = topPlayers.getJSONObject(i);
                                    JSONObject playerInfo = playerData.getJSONObject("UserInfo");
                                    if (playerInfo.has("image") && !playerInfo.isNull("image")) {
                                        JSONObject imageData = playerInfo.getJSONObject("image");
                                        imageData.put("id", imageData.get("id").toString());
                                        playerInfo.put("image", imageData);
                                    }

                                    if (playerInfo.has("profileImage") && !playerInfo.isNull("profileImage")) {
                                        playerInfo.put("imageUrl", playerInfo.get("profileImage"));
                                        playerInfo.remove("profileImage");
                                    }

                                    playerInfo.put("score", playerData.getDouble("Score"));
                                    players.put(playerInfo);
                                }
                                retResult.put("count", result.get("Count"));
                                retResult.put("hasNext", size == topPlayers.length());
                                retResult.put("nextOffset", offset + topPlayers.length());
                            } else {
                                retResult.put("count", 0);
                                retResult.put("hasNext", false);
                                retResult.put("nextOffset", 0);
                            }

                            retResult.put("players", players);
                        }

                        returnData.put("result", retResult);

                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });
        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     *
     * <div style='width: 100%;text-align: right'> دریافت تایم لاین </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("userId","userId");
     *      service.getTimeLine(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getTimeLine method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{Integer} [userId] - شناسه کاربر
     *              <p> در صورتی که این فیلد پر نشود, تایم لاین خود کاربر برگردانده می شود.</p>
     *          </li>
     *          <li>{Integer} [size=20]</li>
     *          <li>{Integer} [offset=0]</li>
     *          <li>{JSONObject} [setting]
     *              <ul>
     *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر بازیکن</li>
     *                  <li>{Integer} [imageHeight] رزولیشن عمودی تصویر بازیکن</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{JSONArray} contents - Array Of JSONObject that contain :
     *                      <ul>
     *                          <li>{TimeLineTypes} type</li>
     *                          <li>{JSONObject} content - base  on type ,content is GAME or LEAGUE or NEWS object</li>
     *                      </ul>
     *                  </li>
     *                  <li>{Boolean} hasNext</li>
     *                  <li>{Integer} nextOffset</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getTimeLine(JSONObject params, final RequestCallback callback) throws ServiceException{
        try {
            JSONObject requestData = new JSONObject();

            final String userId = (params != null && params.has("userId") && !params.isNull("userId")) ? params.get("userId").toString() : null;
            final Integer size = (params != null && params.has("size") && !params.isNull("size")) ? params.getInt("size") : 20;
            final Integer offset = (params != null && params.has("offset") && !params.isNull("offset")) ? params.getInt("offset") : 0;
            requestData.put("size", size);
            requestData.put("offset", offset);
            if (userId != null) {
                requestData.put("userId", userId);
            }

            Integer imageWidth = null;
            Integer imageHeight = null;

            if (params.has("setting") && !params.isNull("setting")) {
                JSONObject setting = params.getJSONObject("setting");
                if (setting != null) {
                    if (setting.has("imageWidth")) {
                        imageWidth = setting.getInt("imageWidth");
                    }

                    if (setting.has("imageHeight")) {
                        imageHeight = setting.getInt("imageHeight");
                    }
                }
            }

            final Integer finalImageHeight = imageHeight;
            final Integer finalImageWidth = imageWidth;

            request(RequestUrls.GET_TIME_LINE, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        JSONObject retResult = new JSONObject();
                        if (!hasError) {

                            JSONArray contents = new JSONArray();
                            if (result.has("Result") && !result.isNull("Result")) {
                                JSONArray res = result.getJSONArray("Result");
                                for (int i = 0; i < res.length(); i++) {
                                    JSONObject newData = new JSONObject();
                                    JSONObject object = res.getJSONObject(i);
                                    int type = object.getInt("Type");
                                    JSONObject content;
                                    newData.put("type", type);
                                    switch (type) {
                                        case TimeLineTypes.GAME:
                                            content = reformatGameObject(object.getJSONObject("Item"), finalImageWidth, finalImageHeight);
                                            break;
                                        case TimeLineTypes.LEAGUE:
                                            content = reformatLeagueObject(object.getJSONObject("Item"), finalImageWidth, finalImageHeight);
                                            break;

                                        case TimeLineTypes.NEWS:
                                            content = reformatNewsObject(object.getJSONObject("Item"), finalImageWidth, finalImageHeight);
                                            break;

                                        default:
                                            content = new JSONObject();
                                    }

                                    newData.put("content", content);
                                    contents.put(newData);
                                }

                            }
                            retResult.put("contents", contents);
                        }

                        returnData.put("result", retResult);

                    } catch (Exception e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });
        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     *
     * <div style='width: 100%;text-align: right'>دریافت اطلاعات نفرات آنلاین </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("gameId","gameId");
     *      service.getOnlineInfo(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getOnlineInfo method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{Integer} [gameId] - شناسه بازی
     *              <p> در صورت پر بودن این فیلد تعداد نفرات آنلاین بازی مشخص شده برگردانده می شود</p>
     *          </li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{Integer} onlinePlayersCount  - تعداد کاربران آنلاین</li>
     *                  <li>{Integer} playersCount - تعداد کاربران</li>
     *                  <li>{Integer} score - امتیاز</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getOnlineInfo(JSONObject params, final RequestCallback callback) throws ServiceException{
        try {
            JSONObject requestData = new JSONObject();

            String gameId = (params != null && params.has("gameId") && !params.isNull("gameId")) ? params.get("gameId").toString() : null;
            if (gameId != null) {
                requestData.put("gameId", gameId);
            }

            request(RequestUrls.GET_ONLINE_INFO, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result){
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        JSONObject retResult = new JSONObject();
                        if (!hasError) {
                            JSONObject res = result.getJSONObject("Result");
                            retResult.put("onlinePlayersCount", res.getInt("OnlinePlayersCount"));
                            retResult.put("playersCount", res.getInt("PlayersCount"));
                            retResult.put("score", res.getInt("Score"));
                        }

                        returnData.put("result", retResult);

                    } catch (Exception e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     *
     * <div style='width: 100%;text-align: right'>دریافت بازی های دنبال شده توسط کاربر </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      service.getGameFollowing(null, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getOnlineInfo method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{Integer} [size=10]</li>
     *          <li>{Integer} [offset=0]</li>
     *          <li>{JSONObject} [setting]
     *              <ul>
     *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر بازی</li>
     *                  <li>{Integer} [imageHeight] رزولیشن عمودی تصویر بازی</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{Boolean} hasNext</li>
     *                  <li>{Integer} nextOffset</li>
     *                  <li>{JSONArray} games
     *                      <ul>
     *                          <li>{String} id</li>
     *                          <li>{String} name</li>
     *                          <li>{String} description</li>
     *                          <li>{String} creator</li>
     *                          <li>{String} physicalUrl</li>
     *                          <li>{String} timelineId</li>
     *                          <li>{String} packageName</li>
     *                          <li>{String} mobileVersion</li>
     *                          <li>{String} mobileVersionCode</li>
     *                          <li>{String} supporterId</li>
     *                          <li>{String} defaultLeagueId</li>
     *                          <li>{String} downloadLink</li>
     *                          <li>{String} gamePlayDescription</li>
     *                          <li>{String} score</li>
     *                          <li>{String} webVersion</li>
     *                          <li>{JSONArray} attributeValues</li>
     *                          <li>{JSONArray} categoryList</li>
     *                          <li>{JSONObject} business</li>
     *                          <li>{JSONObject} userPostInfo
     *                              <ul>
     *                                  <li>{Boolean} favorite</li>
     *                                  <li>{Boolean} liked</li>
     *                                  <li>{String} postId</li>
     *                              </ul>
     *                          </li>
     *                          <li>{JSONObject} rate
     *                              <ul>
     *                                  <li>{Integer} rate.rate</li>
     *                                  <li>{Integer} rate.rateCount</li>
     *                              </ul>
     *                          </li>
     *                          <li>{JSONObject} image
     *                              <ul>
     *                                  <li>{String} image.id</li>
     *                                  <li>{String} image.url</li>
     *                                  <li>{String} image.hashCode</li>
     *                                  <li>{Integer} image.width</li>
     *                                  <li>{Integer} image.height</li>
     *                              </ul>
     *                          </li>
     *                          <li>{Integer} playerNumbersType</li>
     *                          <li>{Integer} platformType</li>
     *                          <li>{Integer} availableCount</li>
     *                          <li>{Integer} discount</li>
     *                          <li>{Integer} numOfComments</li>
     *                          <li>{Integer} numOfFavorites</li>
     *                          <li>{Integer} numOfLikes</li>
     *                          <li>{Boolean} canComment</li>
     *                          <li>{Boolean} canLike</li>
     *                          <li>{Boolean} enable</li>
     *                          <li>{Boolean} hide</li>
     *                          <li>{Double} latitude</li>
     *                          <li>{Double} longitude</li>
     *                          <li>{Double} publishedDate</li>
     *                          <li>{Double} price</li>
     *                          <li>{Double} timestamp</li>
     *                      </ul>
     *                  </li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getGameFollowing(JSONObject params, final RequestCallback callback) throws ServiceException{
        try {
            JSONObject requestData = new JSONObject();
            final Integer size = (params != null && params.has("size") && !params.isNull("size")) ? params.getInt("size") : 10;
            final Integer offset = (params != null && params.has("offset") && !params.isNull("offset")) ? params.getInt("offset") : 0;
            requestData.put("size", size);
            requestData.put("offset", offset);

            Integer imageWidth = null;
            Integer imageHeight = null;

            if (params != null && params.has("setting") && !params.isNull("setting")) {
                JSONObject setting = params.getJSONObject("setting");
                if (setting != null) {
                    if (setting.has("imageWidth")) {
                        imageWidth = setting.getInt("imageWidth");
                    }

                    if (setting.has("imageHeight")) {
                        imageHeight = setting.getInt("imageHeight");
                    }
                }
            }

            final Integer finalImageHeight = imageHeight;
            final Integer finalImageWidth = imageWidth;

            request(RequestUrls.GET_GAME_FOLLOWNING, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result){
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        JSONObject retResult = new JSONObject();
                        if (!hasError) {

                            JSONArray games = new JSONArray();
                            if (result.has("Result") && !result.isNull("Result")) {
                                JSONArray allGames = result.getJSONArray("Result");

                                for (int i = 0; i < allGames.length(); i++) {
                                    games.put(reformatGameObject(allGames.getJSONObject(i), finalImageWidth, finalImageHeight));
                                }
                                retResult.put("hasNext", size == allGames.length());
                                retResult.put("nextOffset", offset + allGames.length());
                            } else {
                                retResult.put("hasNext", false);
                                retResult.put("nextOffset", 0);
                            }

                            retResult.put("games", games);
                        }

                        returnData.put("result", retResult);

                    } catch (Exception e) {
                        returnData = ExceptionErrorData(e);
                    }

                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     *
     * <div style='width: 100%;text-align: right'>دریافت لیگ های دنبال شده توسط کاربر </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      service.getLeagueFollowing(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getLeagueFollowing method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{Integer} [size=10]</li>
     *          <li>{Integer} [offset=0]</li>
     *          <li>{JSONObject} [setting]
     *              <ul>
     *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر لیگ</li>
     *                  <li>{Integer} [imageHeight] رزولیشن عمودی تصویر لیگ</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{JSONArray} leagues - شامل اطلاعات لیگ ها</li>
     *                  <li>{Boolean} hasNext</li>
     *                  <li>{Integer} nextOffset</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getLeagueFollowing(JSONObject params, final RequestCallback callback) throws ServiceException {
        try {
            JSONObject requestData = new JSONObject();
            final Integer size = (params!= null && params.has("size") && !params.isNull("size")) ? params.getInt("size") : 10;
            final Integer offset = (params!= null && params.has("offset") && !params.isNull("offset")) ? params.getInt("offset") : 0;
            requestData.put("size", size);
            requestData.put("offset", offset);

            Integer imageWidth = null;
            Integer imageHeight = null;

            if (params.has("setting") && !params.isNull("setting")) {
                JSONObject setting = params.getJSONObject("setting");
                if (setting != null) {
                    if (setting.has("imageWidth")) {
                        imageWidth = setting.getInt("imageWidth");
                    }

                    if (setting.has("imageHeight")) {
                        imageHeight = setting.getInt("imageHeight");
                    }
                }
            }

            final Integer finalImageHeight = imageHeight;
            final Integer finalImageWidth = imageWidth;

            request(RequestUrls.GET_LEAGUE_FOLLOWING, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result){
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        JSONObject retResult = new JSONObject();
                        if (!hasError) {

                            JSONArray games = new JSONArray();
                            if (result.has("Result") && !result.isNull("Result")) {
                                JSONArray allLeagues = result.getJSONArray("Result");

                                for (int i = 0; i < allLeagues.length(); i++) {
                                    games.put(reformatLeagueObject(allLeagues.getJSONObject(i), finalImageWidth, finalImageHeight));
                                }
                                retResult.put("hasNext", size == allLeagues.length());
                                retResult.put("nextOffset", offset + allLeagues.length());
                            } else {
                                retResult.put("hasNext", false);
                                retResult.put("nextOffset", 0);
                            }

                            retResult.put("leagues", games);
                        }

                        returnData.put("result", retResult);

                    } catch (Exception e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     *
     * <div style='width: 100%;text-align: right'> دریافت لیست لیگ های عضو شده توسط یک کاربر </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("userId", "userId");
     *      service.getEnrolledLeagues(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getEnrolledLeagues method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} [userId] - شناسه کاربر
     *              <p>در صورتی که این فیلد پر شود, لیگ های کاربر مورد نظر برگردانده می شود و در غیر اینصورت کاربر کنونی</p>
     *          </li>
     *          <li>{Integer} [size=20]</li>
     *          <li>{Integer} [offset=0]</li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{JSONArray} leagues - شامل اطلاعات لیگ ها</li>
     *                  <li>{Boolean} hasNext</li>
     *                  <li>{Integer} nextOffset</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getEnrolledLeagues(JSONObject params, final RequestCallback callback) throws ServiceException {
        try {
            JSONObject requestData = new JSONObject();

            final String userId  = (params != null && params.has("userId") && !params.isNull("userId")) ? params.get("userId").toString() : null;
            final Integer size   = (params != null && params.has("size") && !params.isNull("size")) ? params.getInt("size") : 20;
            final Integer offset = (params != null && params.has("offset") && !params.isNull("offset")) ? params.getInt("offset") : 0;
            requestData.put("size", size);
            requestData.put("offset", offset);
            if (userId != null) {
                requestData.put("userId", userId);
            }

            Integer imageWidth = null;
            Integer imageHeight = null;

            if (params != null && params.has("setting") && !params.isNull("setting")) {
                JSONObject setting = params.getJSONObject("setting");
                if (setting != null) {
                    if (setting.has("imageWidth")) {
                        imageWidth = setting.getInt("imageWidth");
                    }

                    if (setting.has("imageHeight")) {
                        imageHeight = setting.getInt("imageHeight");
                    }
                }
            }

            final Integer finalImageHeight = imageHeight;
            final Integer finalImageWidth = imageWidth;

            request(RequestUrls.GET_ENROLLED_LEAGUES, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result){
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        JSONObject retResult = new JSONObject();
                        if (!hasError) {

                            JSONArray leagues = new JSONArray();
                            if (result.has("Result") && !result.isNull("Result")) {
                                JSONArray res = result.getJSONArray("Result");
                                for (int i = 0; i < res.length(); i++) {
                                    leagues.put(reformatLeagueObject(res.getJSONObject(i), finalImageWidth, finalImageHeight));
                                }

                                retResult.put("hasNext", size == res.length());
                                retResult.put("nextOffset", offset + res.length());
                                retResult.put("count", result.get("Count"));
                            } else {
                                retResult.put("hasNext", false);
                                retResult.put("nextOffset", 0);
                            }
                            retResult.put("leagues", leagues);
                        }

                        returnData.put("result", retResult);

                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'>دریافت اطلاعات پست یک بیزینس</div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("businessId","26");
     *      reqData.put("metadata","myPost");
     *      service.getCustomPost(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getCustomPost method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} businessId</li>
     *          <li>{JSONObject} metadata</li>
     *          <li>{String} id</li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result</li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getCustomPost(JSONObject params,final RequestCallback callback) throws ServiceException {
        try {

            String businessId  = (params != null && params.has("businessId") && !params.isNull("businessId")) ? params.get("businessId").toString() : null;
            JSONObject metadata  = (params != null && params.has("metadata") && !params.isNull("metadata")) ? params.getJSONObject("metadata") : null;

            if (businessId == null) {
                throw new ServiceException("businessId not exist in params");
            }


            final JSONObject requestData = new JSONObject();
            requestData.put("businessId", businessId);


            if (metadata != null) {

                JSONArray keys = new JSONArray();
                JSONArray values = new JSONArray();
                JSONArray allKeys = metadata.names();

                for (int i = 0; i < allKeys.length(); i++) {
                    keys.put(allKeys.get(i));
                    values.put(metadata.get(allKeys.get(i).toString()));
                }

                requestData.put("keys", keys);
                requestData.put("values", values);
            }

            if (params.has("id") && !params.isNull("id")) {
                requestData.put("id", params.get("id"));
            }


            request(RequestUrls.CUSTOM_POST, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result) {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));
                        if (!hasError) {
                            returnData.put("result", result.get("Result"));
                        }

                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }

                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'> جواب درخواست مسابقه</div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("requestId", "123456");
     *      reqData.put("rejectReasonType", 1);
     *      service.matchRequestResponse(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("matchRequestResponse method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} requestId - شناسه درخواست</li>
     *          <li>{Integer} [rejectReasonType] -  در صورت عدم پذیرش درخواست مقدار آن کد مورد نظر برای رد درخواست می باشد</li>
     *          <li>{String} [rejectMessage] - دلیل رد درخواست در صورت منفی بودن جواب درخواست</li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{Double} birthDate</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void matchRequestResponse(JSONObject params, final RequestCallback callback) throws ServiceException{
        try {

            boolean state = true;
            JSONObject requestData = new JSONObject();
            requestData.put("requestId", params.get("requestId").toString());

            String peerId = (userData.has("peerId") && !userData.isNull("peerId")) ? userData.get("peerId").toString() : null;

            if (peerId == null) {
                throw new ServiceException("در حال ارتباط با سرور, دوباره تلاش کنید");
            }
            requestData.put("sessionId", peerId);


            Integer rejectReasonType = (params.has("rejectReasonType") && !params.isNull("rejectReasonType")) ? params.getInt("rejectReasonType") : null;
            if (rejectReasonType != null) {
                state = false;
                requestData.put("rejectReasonType", rejectReasonType);
                if (params.has("rejectMessage") && !params.isNull("rejectMessage")) {
                    requestData.put("rejectMessage", params.getString("rejectMessage"));
                } else {
                    requestData.put("rejectMessage", MatchRequestRejectTypes.getMessage(rejectReasonType, null));
                }
            }

            requestData.put("result", state);
//            requestData.put("result", requestData.toString());

            request(RequestUrls.MATCH_REQUEST_RESPONSE, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result) {
                    JSONObject returnData = new JSONObject();
                    try {
                        returnData.put("hasError", result.getBoolean("HasError"));
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getString("ErrorCode"));
                    } catch (Exception e) {
                        returnData = ExceptionErrorData(e);
                    }

                    if (callback != null) {
                        callback.onResult(returnData);
                    }
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'>دریافت اطلاعات فایل بازی </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("gameId","2");
     *      service.getFileInfo(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getFileInfo method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{Integer} gameId - شناسه بازی
     *          </li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{String} downloadLink</li>
     *                  <li>{String} fileSize</li>
     *                  <li>{String} version</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getFileInfo(JSONObject params, final RequestCallback callback) throws ServiceException{
        try {
            JSONObject requestData = new JSONObject();

            String gameId = (params != null && params.has("gameId") && !params.isNull("gameId")) ? params.get("gameId").toString() : null;
            if (gameId == null) {
                throw new ServiceException("gameId not exist in params");
            }
            requestData.put("gameId", gameId);

            request(RequestUrls.FILE_INFO, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result){
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        JSONObject retResult = new JSONObject();
                        if (!hasError) {
                            JSONObject res = result.getJSONObject("Result");
                            retResult.put("downloadLink", res.getString("downloadLink"));
                            retResult.put("version", res.getString("version"));
                            retResult.put("fileSize", res.getLong("dataLen"));
                        }

                        returnData.put("result", retResult);

                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'>تعیین اینکه آیا کاربر می تواند عضو لیگ شود یا خیر</div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("leagueId","26");
     *      service.getEnrollAccess(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getEnrollAccess method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} leagueId شناسه لیگ</li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{Boolean} result</li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getEnrollAccess(JSONObject params,final RequestCallback callback) throws ServiceException {
        try {

            String leagueId  = (params != null && params.has("businessId") && !params.isNull("businessId")) ? params.get("businessId").toString() : null;

            if (leagueId == null) {
                throw new ServiceException("businessId not exist in params");
            }

            final JSONObject requestData = new JSONObject();
            requestData.put("leagueId", leagueId);

            request(RequestUrls.GET_LEAGUE_ENROLL_ACCESS, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));
                        if (!hasError) {
                            returnData.put("result", result.get("Result"));
                        }


                    } catch (Exception e) {
                        returnData = ExceptionErrorData(e);
                    }

                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }


    /**
     * <div style='width: 100%;text-align: right'>اعلام امتیاز کاربر به لیگ</div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("leagueId","26");
     *      service.sendLeagueRateRequest(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("sendLeagueRateRequest method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} leagueId شناسه لیگ</li>
     *          <li>{Integer} rate امتیاز کاربر</li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{float} myRate</li>
     *                  <li>{rate} rate</li>
     *                  <li>{long} rateCount</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void sendLeagueRateRequest(JSONObject params,final RequestCallback callback) throws ServiceException {
        try {

            String leagueId  = (params != null && params.has("leagueId") && !params.isNull("leagueId")) ? params.get("leagueId").toString() : null;
            Integer rate  = (params != null && params.has("rate") && !params.isNull("rate")) ? params.getInt("rate") : null;

            if (leagueId == null) {
                throw new ServiceException("leagueId not exist in params");
            }
            if (rate == null) {
                throw new ServiceException("rate not exist in params");
            }

            if (rate <0 ) {
                throw new ServiceException("rate should be greather than 0");
            }
            final JSONObject requestData = new JSONObject();
            requestData.put("entityId", leagueId);
            requestData.put("rate", rate);

            request(RequestUrls.LEAGUE_RATE, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));
                        if (!hasError) {
                            returnData.put("result", result.get("Result"));
                        }

                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'>اعلام امتیاز کاربر به بازی</div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("gameId","22");
     *      reqData.put("rate",4);
     *      service.sendGameRateRequest(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("sendGameRateRequest method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} gameId شناسه بازی</li>
     *          <li>{Integer} rate امتیاز کاربر</li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{float} myRate</li>
     *                  <li>{rate} rate</li>
     *                  <li>{long} rateCount</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void sendGameRateRequest(JSONObject params,final RequestCallback callback) throws ServiceException {
        try {

            String gameId  = (params != null && params.has("gameId") && !params.isNull("gameId")) ? params.get("gameId").toString() : null;
            Integer rate  = (params != null && params.has("rate") && !params.isNull("rate")) ? params.getInt("rate") : null;

            if (gameId == null) {
                throw new ServiceException("gameId not exist in params");
            }
            if (rate == null) {
                throw new ServiceException("rate not exist in params");
            }

            if (rate <0 ) {
                throw new ServiceException("rate should be greather than 0");
            }
            final JSONObject requestData = new JSONObject();
            requestData.put("entityId", gameId);
            requestData.put("rate", rate);

            request(RequestUrls.GAME_RATE, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));
                        if (!hasError) {
                            returnData.put("result", result.get("Result"));
                        }

                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'> دریافت لیست پک های شارژ</div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("fromAmount",20000);
     *      service.getCreditPackList(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getCreditPackList method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{Integer} [size=20]</li>
     *          <li>{Integer} [offset=0]</li>
     *          <li>{Integer} [fromAmount]</li>
     *          <li>{String} [name]</li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{JSONArray} packs - Array Of JSONObject that contain :
     *                      <ul>
     *                          <li>{String} id</li>
     *                          <li>{String} name</li>
     *                          <li>{String} description</li>
     *                          <li>{String} amount</li>
     *                      </ul>
     *                  </li>
     *                  <li>{Boolean} hasNext</li>
     *                  <li>{Integer} nextOffset</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getCreditPackList(JSONObject params, final RequestCallback callback) throws ServiceException{
        try {

            JSONObject requestData = new JSONObject();

            final Integer size = (params != null && params.has("size") && !params.isNull("size")) ? params.getInt("size") : 20;
            final Integer offset = (params != null && params.has("offset") && !params.isNull("offset")) ? params.getInt("offset") : 0;
            requestData.put("size", size);
            requestData.put("offset", offset);

            if (params.has("fromAmount") && !params.isNull("fromAmount")) {
                Long amount = params.getLong("fromAmount") * ConfigData.cf;
                requestData.put("fromAmount", amount);
            }
            if (params.has("name") && !params.isNull("name")) {
                requestData.put("name", params.get("name"));
            }

            request(RequestUrls.GET_CREDIT_PACK_LIST, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        JSONObject retResult = new JSONObject();
                        JSONArray packs = new JSONArray();
                        if (!hasError) {
                            if (result.has("Result") && !result.isNull("Result")) {
                                JSONArray res = result.getJSONArray("Result");
                                for (int i = 0; i < res.length(); i++) {
                                    JSONObject pack = res.getJSONObject(i);
                                    JSONObject newData = new JSONObject();
                                    newData.put("id", pack.get("id"));
                                    newData.put("name", pack.get("name"));
                                    newData.put("description", pack.get("description"));
                                    newData.put("amount", pack.get("amount"));
                                    packs.put(newData);
                                }
                            }
                            retResult.put("packs", packs);
                        }
                        retResult.put("hasNext", size == packs.length());
                        retResult.put("nextOffset", offset + packs.length());
                        returnData.put("result", retResult);

                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });
        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }


    /**
     *
     * <div style='width: 100%;text-align: right'> دریافت لیست دستاورد های کاربر </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      service.getUserAchievements(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getUserAchievements method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} [gameId]</li>
     *          <li>{String} [type]</li>
     *          <li>{String} [userId]</li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONArray} result
     *              <ul>
     *                  <li>{String} count  </li>
     *                  <li>{String} name  </li>
     *                  <li>{String} imageUrl</li>
     *                  <li>{Integer} rank</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getUserAchievements(JSONObject params, final RequestCallback callback) throws ServiceException {
        try {
            JSONObject requestData = new JSONObject();

            String gameId = (params!= null && params.has("gameId") && !params.isNull("gameId")) ? params.get("gameId").toString() : null;
            String userId = (params!= null && params.has("userId") && !params.isNull("userId")) ? params.get("userId").toString() : null;
            Integer type = (params!= null && params.has("type") && !params.isNull("type")) ? params.getInt("type") : null;

            if (gameId != null) {
                requestData.put("gameId", gameId);
            }

            if (type != null) {
                requestData.put("type", type);
            }

            if (userId != null) {
                requestData.put("userId", userId);
            }



            request(RequestUrls.USER_ACHIEVEMENTS, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result) {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        JSONArray achivementsData = new JSONArray();
                        if (!hasError) {

                            if (result.has("Result") && !result.isNull("Result")) {
                                JSONArray achivements = result.getJSONArray("Result");

                                for (int i = 0; i < achivements.length(); i++) {
                                    JSONObject achive = achivements.getJSONObject(i);
                                    JSONObject refAchive = new JSONObject();

                                    refAchive.put("count", achive.get("Count"));
                                    refAchive.put("imageLink", achive.get("ImageLink"));
                                    refAchive.put("name", achive.get("Name"));
                                    refAchive.put("rank", achive.get("Rank"));


                                    achivementsData.put(refAchive);
                                }
                            }
                        }

                        returnData.put("result", achivementsData);

                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });
        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'> دریافت جزئیات یک دستاورد </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("rankType",1);
     *      service.getUserAchievementDetail(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getUserAchievementDetail method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{Integer} [rankType]</li>
     *          <li>{String} [gameId]</li>
     *          <li>{String} [size=50]</li>
     *          <li>{String} [offset]</li>
     *      </ul>
     *
     * @param  callback
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{JSONArray} achivements
     *                      <ul>
     *                          <li>{String} name  </li>
     *                          <li>{String} imageUrl</li>
     *                          <li>{Integer} rank</li>
     *                          <li>{JSONObject} leagueInfo
     *                              <ul>
     *                                  <li>{Double} expireTimestamp</li>
     *                                  <li>{Double} fromDateTimestamp</li>
     *                                  <li>{Integer} financialType</li>
     *                                  <li>{Integer} maxPlayers</li>
     *                                  <li>{Integer} statusNumber</li>
     *                                  <li>{Boolean} hasPrize</li>
     *                                  <li>{String} id</li>
     *                                  <li>{String} name</li>
     *                              </ul>
     *                          </li>
     *                      </ul>
     *                  </li>
     *                  <li>{Integer} count</li>
     *                  <li>{Boolean} hasNext</li>
     *                  <li>{Integer} nextOffset</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getUserAchievementDetail(JSONObject params, final RequestCallback callback) throws ServiceException{
        try {
            JSONObject requestData = new JSONObject();

            final String gameId = (params != null && params.has("gameId") && !params.isNull("gameId")) ? params.get("gameId").toString() : null;
            final Integer size = (params != null && params.has("size") && !params.isNull("size")) ? params.getInt("size") : 50;
            final Integer offset = (params != null && params.has("offset") && !params.isNull("offset")) ? params.getInt("offset") : 0;
            final Integer rankType = (params != null && params.has("rankType") && !params.isNull("rankType")) ? params.getInt("rankType") : null;

            requestData.put("size", size);
            requestData.put("offset", offset);

            if (gameId != null) {
                requestData.put("gameId", gameId);
            }
            if (rankType != null) {
                requestData.put("rankType", rankType);
            }


            request(RequestUrls.USER_ACHIEVEMENT_DETAILS, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        JSONObject retResult = new JSONObject();
                        if (!hasError) {

                            JSONArray matches = new JSONArray();
                            if (result.has("Result") && !result.isNull("Result")) {
                                JSONArray achivements = result.getJSONArray("Result");
                                JSONArray achivementsData = new JSONArray();

                                for (int i = 0; i < achivements.length(); i++) {

                                    JSONObject achive = achivements.getJSONObject(i);
                                    JSONObject leagueInfo = achive.getJSONObject("LeagueInfo");


                                    JSONObject newLeagueData = new JSONObject();
                                    newLeagueData.put("expireTimestamp", leagueInfo.get("ExpireTimestamp"));
                                    newLeagueData.put("financialType", leagueInfo.get("FinancialType"));
                                    newLeagueData.put("fromDateTimestamp", leagueInfo.get("FromDateTimestamp"));
                                    newLeagueData.put("hasPrize", leagueInfo.get("HasPrize"));
                                    newLeagueData.put("id", leagueInfo.get("ID").toString());
                                    newLeagueData.put("maxPlayers", leagueInfo.get("MaxPlayers"));
                                    newLeagueData.put("name", leagueInfo.get("Name"));
                                    newLeagueData.put("statusNumber", leagueInfo.get("StatusNumber"));

                                    JSONObject refAchieveData = new JSONObject();

                                    refAchieveData.put("imageUrl", achive.get("ImageLink"));
                                    refAchieveData.put("name", achive.get("Name"));
                                    refAchieveData.put("rank", achive.get("Rank"));
                                    refAchieveData.put("leagueInfo", newLeagueData);

                                    achivementsData.put(refAchieveData);
                                }

                                retResult.put("achivements", achivementsData);
                                retResult.put("nextOffset", offset + achivements.length());
                                retResult.put("hasNext", size == achivements.length());
                                retResult.put("count", result.get("Count"));

                            }
                        }

                        returnData.put("result", retResult);

                    } catch (Exception e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });
        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'> دریافت امتیاز کاربر در بازی ها </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      service.getUserGamePoints(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getUserGamePoints method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} [gameId]</li>
     *          <li>{String} [size=50]</li>
     *          <li>{String} [offset]</li>
     *      </ul>
     *
     * @param  callback
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{JSONArray} points
     *                      <ul>
     *                          <li>{JSONObject} point
     *                              <ul>
     *                                  <li>{Long} amount</li>
     *                                  <li>{Long} creationDate</li>
     *                              </ul>
     *                          </li>
     *                          <li>{JSONObject} gameInfo
     *                              <ul>
     *                                  <li>{String} downloadLink</li>
     *                                  <li>{String} id</li>
     *                                  <li>{JSONObject} image</li>
     *                                  <li>{String} imageUrl</li>
     *                                  <li>{String} name</li>
     *                                  <li>{String} postId</li>
     *                                  <li>{String} timelineId</li>
     *                              </ul>
     *                          </li>
     *                      </ul>
     *                  </li>
     *                  <li>{Integer} count</li>
     *                  <li>{Boolean} hasNext</li>
     *                  <li>{Integer} nextOffset</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getUserGamePoints(JSONObject params, final RequestCallback callback) throws ServiceException{
        try {
            JSONObject requestData = new JSONObject();

            final String gameId = (params != null && params.has("gameId") && !params.isNull("gameId")) ? params.get("gameId").toString() : null;
            final Integer size = (params != null && params.has("size") && !params.isNull("size")) ? params.getInt("size") : 50;
            final Integer offset = (params != null && params.has("offset") && !params.isNull("offset")) ? params.getInt("offset") : 0;

            requestData.put("size", size);
            requestData.put("offset", offset);

            if (gameId != null) {
                requestData.put("gameId", gameId);
            }


            request(RequestUrls.USER_GAME_POINTS, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        JSONObject retResult = new JSONObject();
                        if (!hasError) {

                            JSONArray matches = new JSONArray();
                            if (result.has("Result") && !result.isNull("Result")) {
                                JSONArray points = result.getJSONArray("Result");
                                JSONArray pointsData = new JSONArray();

                                for (int i = 0; i < points.length(); i++) {

                                    JSONObject pointData = points.getJSONObject(i);
                                    JSONObject gameInfo = pointData.getJSONObject("GameInfo");
                                    JSONObject point = pointData.getJSONObject("Point");


                                    JSONObject newGameData = new JSONObject();
                                    JSONObject newPointData = new JSONObject();

                                    newGameData.put("downloadLink", gameInfo.get("DownloadLink"));
                                    newGameData.put("id", gameInfo.get("EntityId").toString());
                                    newGameData.put("postId", gameInfo.get("ID").toString());
                                    newGameData.put("timelineId", gameInfo.get("TimelineId").toString());
                                    newGameData.put("name", gameInfo.get("Name"));

                                    if (gameInfo.has("Preview")) {
                                        newGameData.put("imageUrl", gameInfo.get("Preview"));
                                    }

                                    if (gameInfo.has("PreviewInfo")) {
                                        if (gameInfo.isNull("PreviewInfo")) {
                                            newGameData.put("image", gameInfo.get("PreviewInfo"));
                                        } else {
                                            JSONObject image = gameInfo.getJSONObject("PreviewInfo");
                                            image.put("id", image.get("id").toString());
                                            newGameData.put("image", image);
                                        }
                                    }


                                    newPointData.put("amount", point.get("Amount"));
                                    newPointData.put("creationDate", point.get("CreationDate"));

                                    JSONObject refPointData = new JSONObject();

                                    refPointData.put("point", newPointData);
                                    refPointData.put("gameInfo", newGameData);

                                    pointsData.put(refPointData);
                                }

                                retResult.put("points", pointsData);
                                retResult.put("nextOffset", offset + points.length());
                                retResult.put("hasNext", size == points.length());
                                retResult.put("count", result.get("Count"));

                            }
                        }

                        returnData.put("result", retResult);

                    } catch (Exception e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });
        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }


//    /**
//     *
//     * <div style='width: 100%;text-align: right'>دریافت یک نمومه از کلاس چت سرویس</div>
//     * <pre>
//     *     <code style='float:right'>نمونه کد</code>
//     *  <code>
//     *        ChatService chatService = service.getChatService();
//     *  </code>
//     * </pre>
//     *
//     * @return
//     * */
//    public ChatService getChatService() {
//        return chatService;
//    }


    /**
     * <div style='width: 100%;text-align: right'>ثبت نام به صورت مهمان</div>
     * <pre>
     *     <code style='float:right'>نمونه کد</code>
     *  <code>
     *        service.registerGuestRequest(new RequestCallback() {
     *           {@code @Override}
     *            public void onResult(JSONObject result) {
     *                System.out.println("registerGuestRequest method -- onResult " + result);
     *            }
     *        });
     *  </code>
     * </pre>
     *
     * @param  callback
     *  <p>onResult method params is JSONObject that has</p>
     *  <ul>
     *      <li>{Boolean} hasError</li>
     *      <li>{String} errorMessage</li>
     *      <li>{Integer} errorCode</li>
     *      <li>{Boolean} loginState </li>
     *      <li> {JSONObject} result
     *          <ul>
     *              <li>{String} id</li>
     *              <li>{String} name</li>
     *              <li>{String} token</li>
     *          </ul>
     *      </li>
     *  </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     *
     * */
    public void registerGuestRequest(final RequestCallback callback) throws ServiceException {

        log.info("registerGuestRequest-0");
        try {
            JSONObject requestData = new JSONObject();
            if (userData.has("peerId")) {
                syncPeerWithToken = true;
                requestData.put("peerId", userData.getLong("peerId"));
            }
            requestData.put("deviceId", deviceId);

            request(RequestUrls.REGISTER_GUEST, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    JSONObject returnData = new JSONObject();
                    try {
                        log.info("registerGuestRequest-1 " + result);
                        boolean hasError = result.getBoolean("HasError");

                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));
                        returnData.put("loginState", false);
                        JSONObject reqResult = null;
                        if (result.has("Result") && !result.isNull("Result")) {
                            reqResult = result.getJSONObject("Result");
                        }
                        if (!hasError) {
                            if (reqResult != null) {
                                returnData.put("loginState", true);
                                String userId = reqResult.getString("UserID");
                                String name = reqResult.getString("Name");
                                String token = reqResult.getString("Token");
                                JSONObject retResult = new JSONObject();
                                retResult.put("id", userId);
                                retResult.put("name", name);
                                retResult.put("token", token);

                                returnData.put("result", retResult);

                                JSONObject uData = new JSONObject();
                                userData.put("id", userId);
                                userData.put("name", name);
                                userData.put("token",token);
                                userData.put("tokenIssuer", 0);
                                userData.put("guest", true);

                                loginAction(uData);
//                                loginAction(userId, name, token,null,true,null);
                            }
                            checkPeerAndSocketSync();
                        }


                    } catch (Exception e) {
                        returnData = ExceptionErrorData(e);
                    }

                    callback.onResult(returnData);
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }


    }


    /**
     * <div style='width: 100%;text-align: right'>دریافت آدرس افزایش اعتبار</div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject data = new JSONObject();
     *      data.put("creditPackId","****");
     *      data.put("leagueId","****");
     *      String url = service.generateIncreaseCreditUrl(data);
     *  </code>
     *
     * </pre>
     *
     *
     * @param  params
     *      <ul>
     *          <li>{String} creditPackId شناسه بسته اعتباری</li>
     *          <li>{String} [packId] شناسه بسته ای که می خواهید بعد از افزایش اعتبار کاربر آن را بخرد</li>
     *          <li>{String} [leagueId]  شناسه لیگی که می خواهید بعد از افزایش اعتبار کاربر عضو آن شود</li>
     *      </ul>
     * */
    public String generateIncreaseCreditUrl(JSONObject params) throws ServiceException {
        try {
            String pageLink = null;
            if (params == null) {
                throw new ServiceException("params is null");
            }

            String creditPackId  = (params.has("creditPackId") && !params.isNull("creditPackId")) ? params.get("creditPackId").toString() : null;

            if (creditPackId == null) {
                throw new ServiceException("creditPackId not exist in params");
            }

            pageLink = ConfigData.icu + "?_token=" + userData.getString("token") + "&creditPackQuantity=1&tokenIssuer" +  userData.getString("tokenIssuer");

            pageLink += ("creditPackId=" + creditPackId);

            if (params.has("creditPackId") && !params.isNull("packId")) {
                pageLink += ("&packId=" + params.getString("creditPackId"));
            }

            if (params.has("leagueId") && !params.isNull("leagueId")) {
                pageLink += ("&leagueId=" + params.getString("leagueId"));
            }
            return pageLink;
        } catch (JSONException e) {
            throw new ServiceException(e);
        }

    }

    /**
     * <div style='width: 100%;text-align: right'>ارسال دیتا به حریف مقابل</div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("matchId","22");
     *      reqData.put("sendData","{cmd:'start'}");
     *      service.sendMatchDataRequest(reqData, new SendDataCallback() {
     *          {@code @Override}
     *          public void onReceive(JSONObject result) {
     *              System.out.println("sendMatchDataRequest method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{JSONObject|String} sendData</li>
     *          <li>{String} matchId</li>
     *          <li>{String} [dataId]</li>
     *      </ul>
     *
     * @param  callback
     *      <p>onReceive method params is JSONObject that has</p>
     *      <ul>
     *          <li></li>
     *      </ul>
     * @return
     *      <ul>
     *          <li></li>
     *      </ul>
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public JSONObject sendMatchDataRequest(final JSONObject params, final SendDataCallback callback) throws ServiceException {
        log.info("sendMatchDataRequest_1" + params);
        try {
            String matchId = (params!= null && params.has("matchId") && !params.isNull("matchId")) ? params.get("matchId").toString() : null;
            if (matchId == null) {
                throw new ServiceException("matchId is not defined in params");
            }

            MultiPlayer game = activeMatch.get(params.get("matchId").toString());
            if (game == null) {
                throw new ServiceException("matchId is not valid");
            }
            log.info("sendMatchDataRequest_2");
            return  game.sendData(params, callback);
        } catch (Exception e) {
            throw new ServiceException(e);
        }
    }

    /**
     *
     * <div style='width: 100%;text-align: right'>اعلام آمادگی برای شروع بازی</div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("matchId","26");
     *      service.sendMatchReadyRequest(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("sendMatchReadyRequest method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} matchId</li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void sendMatchReadyRequest(JSONObject params, RequestCallback callback) throws ServiceException {
        try {
            String matchId = (params!= null && params.has("matchId") && !params.isNull("matchId")) ? params.get("matchId").toString() : null;
            if (matchId == null) {
                throw new ServiceException("matchId is not defined in params");
            }

            MultiPlayer game = activeMatch.get(params.get("matchId").toString());
            if (game == null) {
                throw new ServiceException("matchId is not valid");
            }

            game.ready(callback);
        } catch (Exception e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'>اعلام لغو بازی</div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("matchId","26");
     *      service.sendMatchCancelRequest(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("sendMatchCancelRequest method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} matchId</li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void sendMatchCancelRequest(JSONObject params, RequestCallback callback) throws ServiceException {
        try {
            String matchId = (params!= null && params.has("matchId") && !params.isNull("matchId")) ? params.get("matchId").toString() : null;
            if (matchId == null) {
                throw new ServiceException("matchId is not defined in params");
            }

            MultiPlayer game = activeMatch.get(params.get("matchId").toString());
            if (game == null) {
                throw new ServiceException("matchId is not valid");
            }

            game.cancel(callback);
        } catch (Exception e) {
            throw new ServiceException(e);
        }
    }


    /**
     * <div style='width: 100%;text-align: right'>اعلام لغو بازی</div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("matchId","26");
     *      service.sendMatchLeaveRequest(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("sendMatchCancelRequest method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} matchId</li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void sendMatchLeaveRequest(final JSONObject params, final RequestCallback callback) throws ServiceException {
        try {
            String matchId = (params!= null && params.has("matchId") && !params.isNull("matchId")) ? params.get("matchId").toString() : null;
            if (matchId == null) {
                throw new ServiceException("matchId is not defined in params");
            }

            MultiPlayer game = activeMatch.get(params.get("matchId").toString());
            if (game != null) {
                game.leave(callback);
            }  else {
                try {
                    JSONObject requestData = new JSONObject();
                    requestData.put("matchId", matchId);
                    requestData.put("type",1);

                    this.httpPostRequest(RequestUrls.MATCH_CANCEL, requestData, new RequestCallback() {
                        @Override
                        public void onResult(JSONObject result) {
                            try {
                                boolean hasError = result.getBoolean("hasError");

                                Integer errorCode = 0;
                                if (result.has("errorCode")) {
                                    errorCode = result.getInt("errorCode");
                                }
                                if (hasError && (errorCode == ErrorCodes.RUNTIME || errorCode == ErrorCodes.REQUEST_FAILED)) {
                                    Util.setTimeout(new Util.SetTimeoutCallback(){
                                        @Override
                                        public void onDone() {
                                            try {
                                                sendMatchLeaveRequest(params, callback);
                                            } catch (ServiceException e) {
                                                e.printStackTrace();
                                            }
                                        }
                                    }, ConfigData.smit);
                                } else {
                                    JSONObject retData = new JSONObject();
                                    retData.put("hasError", hasError);
                                    if (hasError) {
                                        retData.put("errorMessage", errorCode);
                                        retData.put("errorCode", errorCode);
                                    }
                                    if (callback != null) {
                                        callback.onResult(retData);
                                    }
                                }
                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        }
                    });
                } catch (JSONException e) {
                    throw new ServiceException(e);
                }
            }


        } catch (Exception e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'>ارسال نتیجه مسابقه </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("gameId", gameId);
     *      JSONArray player1Scores = new JSONArray();
     *      JSONArray player2Scores = new JSONArray();
     *
     *      JSONObject data1 = new JSONObject();
     *      data1.put("name", "field1");
     *      data1.put("value ", 33);
     *      player1Scores.put(data1);
     *
     *      JSONObject data2 = new JSONObject();
     *      data2.put("name", "field2");
     *      data2.put("value ", 10);
     *      player1Scores.put(data2);
     *
     *      JSONObject player1Data = new JSONObject();
     *      player1Data.put("playerId","**");
     *      player1Data.put("scores",player1Scores);
     *
     *      ///------------------
     *      JSONObject data1 = new JSONObject();
     *      data1.put("name", "field1");
     *      data1.put("value ", 33);
     *      player2Scores.put(data1);
     *
     *      JSONObject data2 = new JSONObject();
     *      data2.put("name", "field2");
     *      data2.put("value ", 10);
     *      player2Scores.put(data2);
     *
     *      JSONObject player2Data = new JSONObject();
     *      player2Data.put("playerId","**");
     *      player2Data.put("scores",player2Scores);
     *
     *      JSONArray playersData = new JSONArray();
     *      playersData.put(player1Data);
     *      playersData.put(player2Data);
     *      reqData.put("result",playersData);
     *      service.sendMatchResultRequest(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("sendMatchResultRequest method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} gameId - شناسه بازی</li>
     *          <li>{JSONArray} result - نتیجه بازی
     *          array of JSONObject that each object contain :
     *              <ul>
     *                  <li>{String}playerId</li>
     *                  <li>{JSONArray}scores</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void sendMatchResultRequest(JSONObject params, final RequestCallback callback) throws ServiceException{
        try {

            if (!userData.has("loginState") || !userData.getBoolean("loginState")) {
                throw new ServiceException("first login in game center");
            }

            JSONArray gameResults = params.getJSONArray("result");
            String gameId = params.get("gameId").toString();
            JSONObject ownResult = null;
            JSONObject opponentResult = null;
            JSONArray result = null;
            String ownerId = userData.get("id").toString();
            JSONObject firstData = gameResults.getJSONObject(0);
            if (gameResults.length() > 1) {
                if (firstData.getString("playerId").equals(ownerId)) {
                    ownResult = firstData;
                    opponentResult = gameResults.getJSONObject(1);
                } else {
                    ownResult = gameResults.getJSONObject(1);
                    opponentResult = firstData;
                }
            } else {
                ownResult = firstData;
            }

            result.put(ownResult);

            if (opponentResult != null) {
                result.put(opponentResult);
            }

            JSONObject param = new JSONObject();
            param.put("result", result.toString());
            param.put("forceAddToTable", true);
            param.put("gameId", gameId);

            _sendResult(param, callback);
        } catch (JSONException e) {
            throw new ServiceException(e);
        }

    }



    /**
     * <div style='width: 100%;text-align: right'>دریافت لیست نتیایح بازی هی یک لیگ</div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("leagueId","3");
     *      reqData.put("size",10);
     *      reqData.put("offset",0);
     *      service.getLeagueMatchesResult(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getLeagueMatchesResult method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} leagueId</li>
     *          <li>{Integer} [size=20]</li>
     *          <li>{Integer} [offset=0]</li>
     *          <li>{Integer} [userId]</li>
     *          <li>{Integer} [matchId]</li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{JSONArray} matches
     *                      <ul>
     *                          <li>{Number} startTime</li>
     *                          <li>{Number} endTime</li>
     *                          <li>{String} id</li>
     *                          <li>{String} leagueId</li>
     *                          <li>{JSONArray} users
     *                              <ul>
     *                                  <li>{JSONObject}  info</li>
     *                                  <li>{JSONArray}  scores</li>
     *                              </ul>
     *                          </li>
     *                      </ul>
     *                  </li>
     *                  <li>{Boolean} hasNext</li>
     *                  <li>{Integer} nextOffset</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getLeagueMatchesResult(JSONObject params, final RequestCallback callback) throws ServiceException{
        try {
            JSONObject requestData = new JSONObject();

            final String leagueId = (params != null && params.has("leagueId") && !params.isNull("leagueId")) ? params.get("leagueId").toString() : null;
            final String userId = (params != null && params.has("userId") && !params.isNull("userId")) ? params.get("userId").toString() : null;
            final String matchId = (params != null && params.has("matchId") && !params.isNull("matchId")) ? params.get("matchId").toString() : null;
            final Integer size = (params != null && params.has("size") && !params.isNull("size")) ? params.getInt("size") : 20;
            final Integer offset = (params != null && params.has("offset") && !params.isNull("offset")) ? params.getInt("offset") : 0;
            requestData.put("size", size);
            requestData.put("offset", offset);

            if (leagueId == null) {
                throw new ServiceException("leagueId is not defined in params");
            }
            requestData.put("leagueId", leagueId);

            if (userId != null) {
                requestData.put("userId", userId);
            }

            if (matchId != null) {
                requestData.put("matchId", userId);
            }

            request(RequestUrls.LEAGUE_MATCHES_RESULT, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        JSONObject retResult = new JSONObject();
                        if (!hasError) {

                            JSONArray matches = new JSONArray();
                            if (result.has("Result") && !result.isNull("Result")) {
                                JSONArray matchesData = result.getJSONArray("Result");

                                JSONArray newResultData = new JSONArray();
                                for (int i = 0; i < matchesData.length(); i++) {

                                    JSONObject match = matchesData.getJSONObject(i);
                                    JSONArray usersData = match.getJSONArray("Users");
                                    JSONObject matchData = match.getJSONObject("Match");
                                    JSONObject leagueData = matchData.getJSONObject("League");


                                    JSONObject newLeagueData = new JSONObject();
                                    newLeagueData.put("expireTimestamp", leagueData.get("ExpireTimestamp"));
                                    newLeagueData.put("financialType", leagueData.get("FinancialType"));
                                    newLeagueData.put("fromDateTimestamp", leagueData.get("FromDateTimestamp"));
                                    newLeagueData.put("hasPrize", leagueData.get("HasPrize"));
                                    newLeagueData.put("id", leagueData.get("ID").toString());
                                    newLeagueData.put("maxPlayers", leagueData.get("MaxPlayers"));
                                    newLeagueData.put("name", leagueData.get("Name"));
                                    newLeagueData.put("statusNumber", leagueData.get("StatusNumber"));

                                    JSONObject newMatchData = new JSONObject();

                                    newMatchData.put("endTime", matchData.get("EndTimestamp"));
                                    newMatchData.put("startTime", matchData.get("StartTimestamp"));
                                    newMatchData.put("id", matchData.get("ID").toString());
                                    newMatchData.put("statusNumber", matchData.get("StatusNumber"));
                                    newMatchData.put("league", newLeagueData);


                                    JSONArray newUsersData = new JSONArray();

                                    for (int j = 0; j < usersData.length(); j++) {
                                        JSONObject user= usersData.getJSONObject(j);
                                        JSONObject userInfo = user.getJSONObject("UserInfo");
                                        JSONArray scoreData = user.getJSONArray("Scores");

                                        JSONObject newUserData = new JSONObject();
                                        newUserData.put("id", userInfo.get("ID").toString());
                                        newUserData.put("name", userInfo.get("Name"));

                                        if (userInfo.has("Image") && !userInfo.isNull("Image")) {
                                            newUserData.put("image", userInfo.get("Image"));
                                        }

                                        if (userInfo.has("ProfileImage") && !userInfo.isNull("ProfileImage")) {
                                            newUserData.put("imageUrl", userInfo.get("ProfileImage"));
                                        }

                                        JSONArray newScoresData = new JSONArray();

                                        for (int k = 0; k < scoreData.length(); k++) {
                                            JSONObject score= scoreData.getJSONObject(k);

                                            JSONObject newScoreData = new JSONObject();
                                            newScoreData.put("name", score.get("name"));
                                            newScoreData.put("value", score.get("value"));

                                            newScoresData.put(newScoreData);
                                        }

                                        newUserData.put("scores", newScoresData);
                                        newUsersData.put(newUserData);
                                    }

                                    newMatchData.put("users", newUsersData);

                                    newResultData.put(newMatchData);
                                }

                                retResult.put("matches", newResultData);
                                retResult.put("nextOffset", offset + matchesData.length());
                                retResult.put("hasNext", size == matchesData.length());
                                retResult.put("count", result.get("Count"));

                            }
                        }

                        returnData.put("result", retResult);

                    } catch (Exception e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });
        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'>دریافت لیست آخرین نتایج لیگ</div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("leagueId","3");
     *      reqData.put("size",10);
     *      reqData.put("offset",0);
     *      service.getLeagueLatestMatchesResult(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getLeagueLatestMatchesResult method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} leagueId</li>
     *          <li>{String} [username]</li>
     *          <li>{Integer} [size=20]</li>
     *          <li>{Integer} [offset=0]</li>
     *      </ul>
     *
     * @param  callback
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{JSONArray} matches
     *                      <ul>
     *                          <li>{Number} startTime</li>
     *                          <li>{Number} endTime</li>
     *                          <li>{String} id</li>
     *                          <li>{String} leagueId</li>
     *                          <li>{JSONArray} users
     *                              <ul>
     *                                  <li>{JSONObject}  info</li>
     *                                  <li>{JSONArray}  scores</li>
     *                              </ul>
     *                          </li>
     *                      </ul>
     *                  </li>
     *                  <li>{Boolean} hasNext</li>
     *                  <li>{Integer} nextOffset</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getLeagueLatestMatchesResult(JSONObject params, final RequestCallback callback) throws ServiceException{
        try {
            JSONObject requestData = new JSONObject();

            final String leagueId = (params != null && params.has("leagueId") && !params.isNull("leagueId")) ? params.get("leagueId").toString() : null;
            final String username = (params != null && params.has("username") && !params.isNull("username")) ? params.get("username").toString() : null;
            final Integer size = (params != null && params.has("size") && !params.isNull("size")) ? params.getInt("size") : 20;
            final Integer offset = (params != null && params.has("offset") && !params.isNull("offset")) ? params.getInt("offset") : 0;
            requestData.put("size", size);
            requestData.put("offset", offset);

            if (leagueId == null) {
                throw new ServiceException("leagueId is not defined in params");
            }
            requestData.put("leagueId", leagueId);

            if (username != null) {
                requestData.put("username", username);
            }

            request(RequestUrls.LEAGUE_LATEST_MATCHES_RESULT, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        JSONObject retResult = new JSONObject();
                        if (!hasError) {

                            JSONArray matches = new JSONArray();
                            if (result.has("Result") && !result.isNull("Result")) {
                                JSONArray matchesData = result.getJSONArray("Result");

                                JSONArray newResultData = new JSONArray();
                                for (int i = 0; i < matchesData.length(); i++) {

                                    JSONObject match = matchesData.getJSONObject(i);
                                    JSONArray usersData = match.getJSONArray("Users");
                                    JSONObject matchData = match.getJSONObject("Match");
                                    JSONObject leagueData = matchData.getJSONObject("League");


                                    JSONObject newLeagueData = new JSONObject();
                                    newLeagueData.put("expireTimestamp", leagueData.get("ExpireTimestamp"));
                                    newLeagueData.put("financialType", leagueData.get("FinancialType"));
                                    newLeagueData.put("fromDateTimestamp", leagueData.get("FromDateTimestamp"));
                                    newLeagueData.put("hasPrize", leagueData.get("HasPrize"));
                                    newLeagueData.put("id", leagueData.get("ID").toString());
                                    newLeagueData.put("maxPlayers", leagueData.get("MaxPlayers"));
                                    newLeagueData.put("name", leagueData.get("Name"));
                                    newLeagueData.put("statusNumber", leagueData.get("StatusNumber"));

                                    JSONObject newMatchData = new JSONObject();

                                    newMatchData.put("endTime", matchData.get("EndTimestamp"));
                                    newMatchData.put("startTime", matchData.get("StartTimestamp"));
                                    newMatchData.put("id", matchData.get("ID").toString());
                                    newMatchData.put("statusNumber", matchData.get("StatusNumber"));
                                    newMatchData.put("league", newLeagueData);


                                    JSONArray newUsersData = new JSONArray();

                                    for (int j = 0; j < usersData.length(); j++) {
                                        JSONObject user= usersData.getJSONObject(j);
                                        JSONObject userInfo = user.getJSONObject("UserInfo");
                                        JSONArray scoreData = user.getJSONArray("Scores");

                                        JSONObject newUserData = new JSONObject();
                                        newUserData.put("id", userInfo.get("ID").toString());
                                        newUserData.put("name", userInfo.get("Name"));


                                        if (userInfo.has("Image") && !userInfo.isNull("Image")) {
                                            newUserData.put("image", userInfo.get("Image"));
                                        }

                                        if (userInfo.has("ProfileImage") && !userInfo.isNull("ProfileImage")) {
                                            newUserData.put("imageUrl", userInfo.get("ProfileImage"));
                                        }

                                        JSONArray newScoresData = new JSONArray();

                                        for (int k = 0; k < scoreData.length(); k++) {
                                            JSONObject score= scoreData.getJSONObject(k);

                                            JSONObject newScoreData = new JSONObject();
                                            newScoreData.put("name", score.get("name"));
                                            newScoreData.put("value", score.get("value"));

                                            newScoresData.put(newScoreData);
                                        }

                                        newUserData.put("scores", newScoresData);
                                        newUsersData.put(newUserData);
                                    }

                                    newMatchData.put("users", newUsersData);

                                    newResultData.put(newMatchData);
                                }

                                retResult.put("matches", newResultData);
                                retResult.put("nextOffset", offset + matchesData.length());
                                retResult.put("hasNext", size == matchesData.length());

                            }
                        }

                        returnData.put("result", retResult);

                    } catch (Exception e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });
        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'> آخرین مسابقات لیگ </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("leagueId","3");
     *      reqData.put("size",10);
     *      reqData.put("offset",0);
     *      service.getLeagueLatestMatches(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getLeagueLatestMatches method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} name</li>
     *          <li>{String} leagueId</li>
     *          <li>{Integer} [size=20]</li>
     *          <li>{Integer} [offset=0]</li>
     *      </ul>
     *
     * @param  callback
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{JSONArray} matches
     *                      <ul>
     *                          <li>{Number} startTime</li>
     *                          <li>{Number} endTime</li>
     *                          <li>{String} id</li>
     *                          <li>{String} leagueId</li>
     *                          <li>{JSONArray} users
     *                              <ul>
     *                                  <li>{String}  id</li>
     *                                  <li>{String}  name</li>
     *                                  <li>{JSONObject}  [image]</li>
     *                                  <li>{String}  [imageUrl]</li>
     *                              </ul>
     *                          </li>
     *                      </ul>
     *                  </li>
     *                  <li>{Boolean} hasNext</li>
     *                  <li>{Integer} nextOffset</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getLeagueLatestMatches(JSONObject params, final RequestCallback callback) throws ServiceException{
        try {
            JSONObject requestData = new JSONObject();

            final String leagueId = (params != null && params.has("leagueId") && !params.isNull("leagueId")) ? params.get("leagueId").toString() : null;
            final String name = (params != null && params.has("name") && !params.isNull("name")) ? params.get("name").toString() : null;
            final Integer size = (params != null && params.has("size") && !params.isNull("size")) ? params.getInt("size") : 20;
            final Integer offset = (params != null && params.has("offset") && !params.isNull("offset")) ? params.getInt("offset") : 0;
            requestData.put("size", size);
            requestData.put("offset", offset);

            if (leagueId == null) {
                throw new ServiceException("leagueId is not defined in params");
            }
            requestData.put("leagueId", leagueId);

            if (name != null) {
                requestData.put("query", name);
            }
            request(RequestUrls.LEAGUE_LATEST_MATCHES_RESULT, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        JSONObject retResult = new JSONObject();
                        if (!hasError) {

                            JSONArray matches = new JSONArray();
                            if (result.has("Result") && !result.isNull("Result")) {
                                JSONArray matchesData = result.getJSONArray("Result");

                                JSONArray newResultData = new JSONArray();
                                for (int i = 0; i < matchesData.length(); i++) {

                                    JSONObject match = matchesData.getJSONObject(i);
                                    JSONArray usersData = match.getJSONArray("Users");
                                    JSONObject matchData = match.getJSONObject("Match");
                                    JSONObject leagueData = matchData.getJSONObject("League");


                                    JSONObject newLeagueData = new JSONObject();
                                    newLeagueData.put("expireTimestamp", leagueData.get("ExpireTimestamp"));
                                    newLeagueData.put("financialType", leagueData.get("FinancialType"));
                                    newLeagueData.put("fromDateTimestamp", leagueData.get("FromDateTimestamp"));
                                    newLeagueData.put("hasPrize", leagueData.get("HasPrize"));
                                    newLeagueData.put("id", leagueData.get("ID").toString());
                                    newLeagueData.put("maxPlayers", leagueData.get("MaxPlayers"));
                                    newLeagueData.put("name", leagueData.get("Name"));
                                    newLeagueData.put("statusNumber", leagueData.get("StatusNumber"));

                                    JSONObject newMatchData = new JSONObject();

                                    newMatchData.put("endTime", matchData.get("EndTimestamp"));
                                    newMatchData.put("startTime", matchData.get("StartTimestamp"));
                                    newMatchData.put("id", matchData.get("ID").toString());
                                    newMatchData.put("statusNumber", matchData.get("StatusNumber"));
                                    newMatchData.put("league", newLeagueData);


                                    JSONArray newUsersData = new JSONArray();

                                    for (int j = 0; j < usersData.length(); j++) {
                                        JSONObject user= usersData.getJSONObject(j);

                                        JSONObject newUserData = new JSONObject();
                                        newUserData.put("id", user.get("ID").toString());
                                        newUserData.put("name", user.get("Name"));


                                        if (user.has("Image") && !user.isNull("Image")) {
                                            JSONObject img = user.getJSONObject("Image");
                                            img.put("id", img.get("id").toString());
                                            newUserData.put("image", img);
                                        }

                                        if (user.has("ProfileImage") && !user.isNull("ProfileImage")) {
                                            newUserData.put("imageUrl", user.get("ProfileImage"));
                                        }


                                        newUsersData.put(newUserData);
                                    }

                                    newMatchData.put("users", newUsersData);

                                    newResultData.put(newMatchData);
                                }

                                retResult.put("matches", newResultData);
                                retResult.put("nextOffset", offset + matchesData.length());
                                retResult.put("hasNext", size == matchesData.length());

                            }
                        }

                        returnData.put("result", retResult);

                    } catch (Exception e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });
        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }


    /**
     * <div style='width: 100%;text-align: right'>دریافت لیست مسابقات کاربر</div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("leagueId","3");
     *      reqData.put("size",10);
     *      reqData.put("offset",0);
     *      service.getLeagueMatches(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getLeagueMatches method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} leagueId</li>
     *          <li>{Number} status
     *              NotStarted = 1,
     *              Loading = 2,
     *              Running = 3,
     *              Failed = 4,
     *              Finished = 5,
     *              Cancelled = 6,
     *              NotValidResult = 7
     *          </li>
     *          <li>{Integer} [size=20]</li>
     *          <li>{Integer} [offset=0]</li>
     *      </ul>
     *
     * @param  callback
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{JSONArray} matches
     *                      <ul>
     *                          <li>{Number} startTime</li>
     *                          <li>{Number} endTime</li>
     *                          <li>{String} id</li>
     *                          <li>{String} leagueId</li>
     *                          <li>{JSONArray} users
     *                              <ul>
     *                                  <li>{JSONObject}  info</li>
     *                                  <li>{JSONArray}  scores</li>
     *                              </ul>
     *                          </li>
     *                      </ul>
     *                  </li>
     *                  <li>{Boolean} hasNext</li>
     *                  <li>{Integer} nextOffset</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getLeagueMatches(JSONObject params, final RequestCallback callback) throws ServiceException{
        try {
            JSONObject requestData = new JSONObject();

            final String leagueId = (params != null && params.has("leagueId") && !params.isNull("leagueId")) ? params.get("leagueId").toString() : null;
            String status = (params != null && params.has("status") && !params.isNull("status")) ? params.get("status").toString() : null;
            final Integer size = (params != null && params.has("size") && !params.isNull("size")) ? params.getInt("size") : 20;
            final Integer offset = (params != null && params.has("offset") && !params.isNull("offset")) ? params.getInt("offset") : 0;
            requestData.put("size", size);
            requestData.put("offset", offset);

            if (leagueId != null) {
                requestData.put("leagueId", leagueId);
            }

            if (status != null) {
                requestData.put("status", status);
            }

            request(RequestUrls.LEAGUE_MATCHES, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        JSONObject retResult = new JSONObject();
                        if (!hasError) {

                            JSONArray matches = new JSONArray();
                            if (result.has("Result") && !result.isNull("Result")) {
                                JSONArray matchesData = result.getJSONArray("Result");

                                JSONArray newResultData = new JSONArray();
                                for (int i = 0; i < matchesData.length(); i++) {

                                    JSONObject match = matchesData.getJSONObject(i);
                                    JSONArray usersData = match.getJSONArray("Users");
                                    JSONObject leagueData = match.getJSONObject("League");


                                    JSONObject newLeagueData = new JSONObject();
                                    newLeagueData.put("expireTimestamp", leagueData.get("ExpireTimestamp"));
                                    newLeagueData.put("financialType", leagueData.get("FinancialType"));
                                    newLeagueData.put("fromDateTimestamp", leagueData.get("FromDateTimestamp"));
                                    newLeagueData.put("hasPrize", leagueData.get("HasPrize"));
                                    newLeagueData.put("id", leagueData.get("ID").toString());
                                    newLeagueData.put("maxPlayers", leagueData.get("MaxPlayers"));
                                    newLeagueData.put("name", leagueData.get("Name"));
                                    newLeagueData.put("statusNumber", leagueData.get("StatusNumber"));

                                    JSONObject newMatchData = new JSONObject();

                                    newMatchData.put("endTime", match.get("EndTimestamp"));
                                    newMatchData.put("startTime", match.get("StartTimestamp"));
                                    newMatchData.put("id", match.get("ID").toString());
                                    newMatchData.put("statusNumber", match.get("StatusNumber"));
                                    newMatchData.put("league", newLeagueData);


                                    JSONArray newUsersData = new JSONArray();

                                    for (int j = 0; j < usersData.length(); j++) {
                                        JSONObject user= usersData.getJSONObject(j);

                                        JSONObject newUserData = new JSONObject();
                                        newUserData.put("id", user.get("ID").toString());
                                        newUserData.put("name", user.get("Name"));

                                        if (user.has("Image") && !user.isNull("Image")) {
                                            newUserData.put("image", user.get("Image"));
                                        }

                                        if (user.has("ProfileImage") && !user.isNull("ProfileImage")) {
                                            newUserData.put("imageUrl", user.get("ProfileImage"));
                                        }

                                        newUsersData.put(newUserData);
                                    }

                                    newMatchData.put("users", newUsersData);

                                    newResultData.put(newMatchData);
                                }

                                retResult.put("matches", newResultData);
                                retResult.put("nextOffset", offset + matchesData.length());
                                retResult.put("hasNext", size == matchesData.length());

                            }
                        }

                        returnData.put("result", retResult);

                    } catch (Exception e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });
        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }


    /**
     * <div style='width: 100%;text-align: right'> دریافت لیست نظر های بازی و یا لیگ</div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("id","56");
     *      service.getCommentList(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getCommentList method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{Integer} [size=20]</li>
     *          <li>{Integer} [offset=0]</li>
     *          <li>{String} id شناسه پست بازی و یا لیگ</li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONArray} result
     *              <ul>
     *                  <li>{JSONArray} comments - Array Of JSONObject that contain :
     *                      <ul>
     *                          <li>{Boolean} confirmed</li>
     *                          <li>{String} id</li>
     *                          <li>{String} text</li>
     *                          <li>{Double} timestamp</li>
     *                          <li>{JSONObject} user
     *                              <ul>
     *                                  <li>{String} id</li>
     *                                  <li>{String} name</li>
     *                                  <li>{JSONObject} image
     *                                      <ul>
     *                                          <li>{String} id</li>
     *                                          <li>{Integer} actualWidth</li>
     *                                          <li>{Integer} actualHeight</li>
     *                                          <li>{Integer} width</li>
     *                                          <li>{Integer} height</li>
     *                                      </ul>
     *                                  </li>
     *                              </ul>
     *                          </li>
     *                      </ul>
     *                  </li>
     *                  <li>{Boolean} hasNext</li>
     *                  <li>{Integer} nextOffset</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getCommentList(JSONObject params, final RequestCallback callback) throws ServiceException{
        try {

            String id  = (params != null && params.has("id") && !params.isNull("id")) ? params.get("id").toString() : null;

            if (id == null) {
                throw new ServiceException("id not exist in params");
            }


            JSONObject requestData = new JSONObject();

            requestData.put("postId", id);

            final Integer size = (params != null && params.has("size") && !params.isNull("size")) ? params.getInt("size") : 20;
            final Integer offset = (params != null && params.has("offset") && !params.isNull("offset")) ? params.getInt("offset") : 0;
            requestData.put("size", size);
            requestData.put("offset", offset);


            request(RequestUrls.GET_COMMENT_LIST, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        JSONObject retResult = new JSONObject();
                        JSONArray comments = new JSONArray();
                        if (!hasError) {
                            if (result.has("Result") && !result.isNull("Result")) {
                                JSONArray res = result.getJSONArray("Result");
                                for (int i = 0; i < res.length(); i++) {
                                    JSONObject comment = res.getJSONObject(i);
                                    comment.put("id", comment.get("id").toString());;

                                    JSONObject user = comment.getJSONObject("user");
                                    user.put("id", user.get("id").toString());;

                                    if (user.has("image") && !user.isNull("image")) {
                                        JSONObject image = user.getJSONObject("image");
                                        image.put("id", image.get("id").toString());;
                                    }

                                    if (user.has("profileImage") && !user.isNull("profileImage")) {
                                        user.put("imageUrl", user.get("profileImage"));;
                                        user.remove("profileImage");
                                    }

                                    comments.put(comment);
                                }
                            }
                            retResult.put("comments", comments);
                        }
                        retResult.put("hasNext", size == comments.length());
                        retResult.put("nextOffset", offset + comments.length());
                        returnData.put("result", retResult);

                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });
        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'> افزودن نظر بر روی یک بازی </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("id","56");
     *      reqData.put("text","text");
     *      service.addGameCommentRequest(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("addGameCommentRequest method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} id شناسه بازی </li>
     *          <li>{String} text </li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONArray} result
     *              <ul>
     *                  <li>{String} id</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void addGameCommentRequest(JSONObject params, final RequestCallback callback) throws ServiceException{
        try {

            String id  = (params != null && params.has("id") && !params.isNull("id")) ? params.get("id").toString() : null;

            if (id == null) {
                throw new ServiceException("id not exist in params");
            }

            String text  = (params != null && params.has("text") && !params.isNull("text")) ? params.get("text").toString() : null;

            if (text == null) {
                throw new ServiceException("text not exist in params");
            }

            JSONObject requestData = new JSONObject();

            requestData.put("postId", id);
            requestData.put("comment", text);

            request(RequestUrls.ADD_GAME_COMMENT, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        JSONObject retResult = new JSONObject();
                        if (!hasError && result.has("Result") && !result.isNull("Result")) {
                            String id = result.getString("Result");
                            retResult.put("id", id);
                        }
                        returnData.put("result", retResult);

                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });
        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'> افزودن نظر بر روی یک لیگ </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("id","56");
     *      reqData.put("text","text");
     *      service.addLeagueCommentRequest(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("addLeagueCommentRequest method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} id شناسه لیگ </li>
     *          <li>{String} text </li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONArray} result
     *              <ul>
     *                  <li>{String} id</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void addLeagueCommentRequest(JSONObject params, final RequestCallback callback) throws ServiceException{
        try {

            String id  = (params != null && params.has("id") && !params.isNull("id")) ? params.get("id").toString() : null;

            if (id == null) {
                throw new ServiceException("id not exist in params");
            }

            String text  = (params != null && params.has("text") && !params.isNull("text")) ? params.get("text").toString() : null;

            if (text == null) {
                throw new ServiceException("text not exist in params");
            }

            JSONObject requestData = new JSONObject();

            requestData.put("postId", id);
            requestData.put("comment", text);

            request(RequestUrls.ADD_LEAGUE_COMMENT, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        JSONObject retResult = new JSONObject();
                        if (!hasError && result.has("Result") && !result.isNull("Result")) {
                            String id = result.getString("Result");
                            retResult.put("id", id);
                        }
                        returnData.put("result", retResult);

                    } catch (JSONException e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });
        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'>اعلام ورود کاربر</div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("id","56");
     *      reqData.put("name","ali");
     *      reqData.put("token","************");
     *      reqData.put("tokenIssuer",1);
     *      reqData.put("tokenIssuer",1);
     *      service.initLogin(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("initLogin method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} id</li>
     *          <li>{String} name</li>
     *          <li>{String} token</li>
     *          <li>{String} tokenIssuer</li>
     *          <li>{JSONObject} [image]
     *              <ul>
     *                  <li>{String} id</li>
     *                  <li>{Integer} width</li>
     *                  <li>{Integer} width</li>
     *                  <li>{Integer} height</li>
     *                  <li>{Integer} actualWidth</li>
     *                  <li>{Integer} actualHeight</li>
     *                  <li>{String} [hashCode]</li>
     *                  <li>{String} [name]</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result</li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void initLogin(JSONObject params,final RequestCallback callback) throws ServiceException {
        log.info("initLogin__" + params);
        try {

            String token  = (params != null && params.has("token") && !params.isNull("token")) ? params.get("token").toString() : null;
            Integer tokenIssuer  = (params != null && params.has("tokenIssuer") && !params.isNull("tokenIssuer")) ? params.getInt("tokenIssuer") : null;
            String name  = (params != null && params.has("name") && !params.isNull("name")) ? params.get("name").toString() : null;
            String id  = (params != null && params.has("id") && !params.isNull("id")) ? params.get("id").toString() : null;
            JSONObject  image  = (params != null && params.has("image") && !params.isNull("image")) ? params.getJSONObject("image") : null;
            String  imageUrl  = (params != null && params.has("imageUrl") && !params.isNull("imageUrl")) ? params.getString("imageUrl") : null;

            if (token == null) {
                throw new ServiceException("token not exist in params");
            }

            if (tokenIssuer == null) {
                throw new ServiceException("tokenIssuer not exist in params");
            }

            if (name == null) {
                throw new ServiceException("name not exist in params");
            }

            if (id == null) {
                throw new ServiceException("id not exist in params");
            }


            JSONObject uData = new JSONObject();
            uData.put("id", id);
            uData.put("name", name);
            uData.put("image", image);
            uData.put("imageUrl", imageUrl);
            uData.put("token", token);
            uData.put("tokenIssuer", tokenIssuer);
            uData.put("guest", false);
            loginAction(uData);
//            loginAction(id, name, token, image, false, tokenIssuer);


            callback.onResult(Util.createReturnData(false, "", 0, new JSONObject()));

        } catch (JSONException e) {
            throw new ServiceException(e);
        }

    }


    /**
     * <div style='width: 100%;text-align: right'>عضویت در لیگ پیش فرض یک بازی</div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("gameId","2");
     *      service.subscribeDefaultLeagueRequest(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("subscribeDefaultLeagueRequest method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} gameId - شناسه بازی
     *          </li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void subscribeDefaultLeagueRequest(JSONObject params, final RequestCallback callback) throws Exception{

        final String gameId = (params != null && params.has("gameId") && !params.isNull("gameId")) ? params.get("gameId").toString() : null;
        if (gameId == null) {
            throw new ServiceException("gameId not exist in params");
        }

        JSONObject requestData = new JSONObject();
        requestData.put("gameId", gameId);
        request(RequestUrls.DEFAULT_LEAGUE_SUBSCRIBE, requestData, new Network.HttpRequestCallback() {
            @Override
            public void onResult(JSONObject result){
                JSONObject returnData = new JSONObject();
                try {

                    boolean hasError = result.getBoolean("HasError");
                    returnData.put("hasError", hasError);
                    returnData.put("errorMessage", result.getString("ErrorMessage"));
                    returnData.put("errorCode", result.getInt("ErrorCode"));

                    if (!hasError) {
                        returnData.put("result", reformatLeagueObject(result.getJSONObject("Result"), null, null));
                        JSONObject data = new JSONObject();
                        data.put("gameId", gameId);
                        fireEvents("defaultLeagueSubscribe",data);
                    }
                } catch (Exception e) {
                    returnData = ExceptionErrorData(e);
                }

                if (callback != null) {
                    callback.onResult(returnData);
                }
            }
        });
    }


    /**
     * <div style='width: 100%;text-align: right'>اعلام بروزرسانی توکن</div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("token","**********");
     *
     *      service.refreshToken(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("refreshToken method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} token توکن جدید</li>
     *      </ul>
     *
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result</li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void refreshToken(JSONObject params,final RequestCallback callback) throws ServiceException{

        JSONObject returnData = new JSONObject();
        try {
            String token  = (params != null && params.has("token") && !params.isNull("token")) ? params.get("token").toString() : null;


            if (token == null) {
                throw new ServiceException("token not exist in params");
            }

            boolean loginState = false;
            if (userData.has("loginState")) {
                loginState = userData.getBoolean("loginState");
            }

            if (!loginState) {
                throw new ServiceException("user is not login");
            }

            userData.put("token", token);

            returnData = Util.createReturnData(false, "", 0, new JSONObject());


        } catch (JSONException e) {
            throw new ServiceException(e);
        }

        callback.onResult(returnData);
    }

    /**
     * <div style='width: 100%;text-align: right'> دریافت طلاعات کلی گیم سنتر</div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      service.getGameCenterStatus(new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getGameCenterStatus method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     *
     * @param  callback
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{Number} totalActiveUsers</li>
     *                  <li>{Number} totalCompletedLeagues</li>
     *                  <li>{Number} totalEnrollingRunningLeagues</li>
     *                  <li>{Number} totalEnrollingLeagues</li>
     *                  <li>{Number} totalGames</li>
     *                  <li>{Number} totalLeagues</li>
     *                  <li>{Number} totalMatches</li>
     *                  <li>{Number} totalOnlineUsers</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getGameCenterStatus(final RequestCallback callback) throws ServiceException{
        JSONObject requestData = new JSONObject();
        request(RequestUrls.GAME_CENTER_STATUS, requestData, new Network.HttpRequestCallback() {
            @Override
            public void onResult(JSONObject result)  {
                JSONObject returnData = new JSONObject();
                try {
                    boolean hasError = result.getBoolean("HasError");
                    returnData.put("hasError", hasError);
                    returnData.put("errorMessage", result.getString("ErrorMessage"));
                    returnData.put("errorCode", result.getInt("ErrorCode"));

                    if (!hasError && result.has("Result") && !result.isNull("Result")) {
                        returnData.put("result", result.getJSONObject("Result"));
                    }

                } catch (Exception e) {
                    returnData = ExceptionErrorData(e);
                }
                callback.onResult(returnData);
            }
        });
    }


    /**
     * <div style='width: 100%;text-align: right'> دریافت لیست درخواست های دوستی دریافت شده </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      service.getReceivedFriendshipRequest(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getReceivedFriendshipRequest method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} [status]
     *              <p>    1 = ارسال شده </p>
     *              <p>    2 = بلاک شده </p>
     *              <p>    4 = رد شده </p>
     *              <p>    8 = پذیرفته شده </p>
     *          </li>
     *          <li>{String} [size=50]</li>
     *          <li>{String} [offset]</li>
     *      </ul>
     *
     * @param  callback
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{JSONArray} requests
     *                      <ul>
     *                          <li>{Long} creationDate </li>
     *                          <li>{String} requestId </li>
     *                          <li>{Integer} status </li>
     *                          <li>{JSONObject} toUser
     *                              <ul>
     *                                  <li>{String} id</li>
     *                                  <li>{JSONObject} image</li>
     *                                  <li>{String} imageUrl</li>
     *                                  <li>{String} name</li>
     *                              </ul>
     *                          </li>
     *                          <li>{JSONObject} fromUser
     *                              <ul>
     *                                  <li>{String} id</li>
     *                                  <li>{JSONObject} image</li>
     *                                  <li>{String} imageUrl</li>
     *                                  <li>{String} name</li>
     *                              </ul>
     *                          </li>
     *                      </ul>
     *                  </li>
     *                  <li>{Integer} count</li>
     *                  <li>{Boolean} hasNext</li>
     *                  <li>{Integer} nextOffset</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getReceivedFriendshipRequest(JSONObject params, final RequestCallback callback) throws ServiceException{
        try {
            JSONObject requestData = new JSONObject();

            final Integer status = (params != null && params.has("status") && !params.isNull("status")) ? params.getInt("status") : null;
            final Integer size = (params != null && params.has("size") && !params.isNull("size")) ? params.getInt("size") : 20;
            final Integer offset = (params != null && params.has("offset") && !params.isNull("offset")) ? params.getInt("offset") : 0;
            requestData.put("size", size);
            requestData.put("offset", offset);

            if (status != null) {
                requestData.put("status", status);
            }

            request(RequestUrls.RECIEVED_FRIENDSHIP_REQUEST, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        JSONObject retResult = new JSONObject();
                        if (!hasError) {

                            if (result.has("Result") && !result.isNull("Result")) {
                                JSONArray requests = result.getJSONArray("Result");
                                JSONArray requestsData = new JSONArray();
                                for (int i = 0; i < requests.length(); i++) {
                                    requestsData.put(reformatFriendshipRes(requests.getJSONObject(i)));
                                }

                                retResult.put("requests", requestsData);
                                retResult.put("nextOffset", offset + requests.length());
                                retResult.put("hasNext", size == requests.length());
                                retResult.put("count", result.get("Count"));

                            }
                        }

                        returnData.put("result", retResult);

                    } catch (Exception e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });
        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'> دریافت لیست درخواست های دوستی ارسال شده </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      service.getSentFriendshipRequest(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getSentFriendshipRequest method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} [status]
     *              <p>    1 = ارسال شده </p>
     *              <p>    2 = بلاک شده </p>
     *              <p>    4 = رد شده </p>
     *              <p>    8 = پذیرفته شده </p>
     *          </li>
     *          <li>{int} [size=50]</li>
     *          <li>{int} [offset]</li>
     *          <li>{String} [userId]</li>
     *      </ul>
     *
     * @param  callback
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{JSONArray} requests
     *                      <ul>
     *                          <li>{Long} creationDate </li>
     *                          <li>{String} requestId </li>
     *                          <li>{Integer} status </li>
     *                          <li>{JSONObject} toUser
     *                              <ul>
     *                                  <li>{String} id</li>
     *                                  <li>{JSONObject} image</li>
     *                                  <li>{String} imageUrl</li>
     *                                  <li>{String} name</li>
     *                              </ul>
     *                          </li>
     *                      </ul>
     *                  </li>
     *                  <li>{Integer} count</li>
     *                  <li>{Boolean} hasNext</li>
     *                  <li>{Integer} nextOffset</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getSentFriendshipRequest(JSONObject params, final RequestCallback callback) throws ServiceException{
        try {
            JSONObject requestData = new JSONObject();

            final Integer status = (params != null && params.has("status") && !params.isNull("status")) ? params.getInt("status") : null;
            final Integer size = (params != null && params.has("size") && !params.isNull("size")) ? params.getInt("size") : 20;
            final Integer offset = (params != null && params.has("offset") && !params.isNull("offset")) ? params.getInt("offset") : 0;
            final String userId = (params != null && params.has("userId") && !params.isNull("userId")) ? params.getString("userId") : null;
            requestData.put("size", size);
            requestData.put("offset", offset);

            if (status != null) {
                requestData.put("status", status);
            }
            if (userId != null) {
                requestData.put("userId", userId);
            }

            request(RequestUrls.SENT_FRIENDSHIP_REQUEST, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        JSONObject retResult = new JSONObject();
                        if (!hasError) {

                            if (result.has("Result") && !result.isNull("Result")) {
                                JSONArray requests = result.getJSONArray("Result");
                                JSONArray requestsData = new JSONArray();
                                for (int i = 0; i < requests.length(); i++) {
                                    requestsData.put(reformatFriendshipRes(requests.getJSONObject(i)));
                                }

                                retResult.put("requests", requestsData);
                                retResult.put("nextOffset", offset + requests.length());
                                retResult.put("hasNext", size == requests.length());
                                retResult.put("count", result.get("Count"));

                            }
                        }

                        returnData.put("result", retResult);

                    } catch (Exception e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });
        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'> ارسال درخواست دوستی </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("userId","233");
     *      service.friendshipRequest(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("friendshipRequest method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} userId</li>
     *      </ul>
     *
     * @param  callback
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{Long} creationDate </li>
     *                  <li>{String} requestId </li>
     *                  <li>{Integer} status </li>
     *                  <li>{JSONObject} toUser
     *                      <ul>
     *                          <li>{String} id</li>
     *                          <li>{JSONObject} image</li>
     *                          <li>{String} imageUrl</li>
     *                          <li>{String} name</li>
     *                      </ul>
     *                  </li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void friendshipRequest(JSONObject params, final RequestCallback callback) throws ServiceException{
        try {
            JSONObject requestData = new JSONObject();

            final String userId = (params != null && params.has("userId") && !params.isNull("userId")) ? params.get("userId").toString() : null;


            if (userId == null) {
                throw new ServiceException("userId not defined");
            }

            requestData.put("toUserId", userId);

            request(RequestUrls.FRIENDSHIP_REQUEST, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        JSONObject retResult = new JSONObject();
                        if (!hasError) {

                            if (result.has("Result") && !result.isNull("Result")) {
                                retResult = reformatFriendshipRes(result.getJSONObject("Result"));
                            }
                        }

                        returnData.put("result", retResult);

                    } catch (Exception e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });
        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'> تعیین وضعیت درخواست دوستی </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("requestId","22342");
     *      reqData.put("reply",1);
     *      service.replyFriendshipRequest(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("replyFriendshipRequest method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} requestId</li>
     *          <li>{Integer} reply
     *              <p>     1 = پذیرش درخواست </p>
     *              <p>     2 = رد درخواست </p>
     *              <p>     3 = رد درخواست و بلاک کاربر </p>
     *          </li>
     *      </ul>
     *
     * @param  callback
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{Long} creationDate </li>
     *                  <li>{String} requestId </li>
     *                  <li>{Integer} status </li>
     *                  <li>{JSONObject} toUser
     *                      <ul>
     *                          <li>{String} id</li>
     *                          <li>{JSONObject} image</li>
     *                          <li>{String} imageUrl</li>
     *                          <li>{String} name</li>
     *                      </ul>
     *                  </li>
     *                  <li>{JSONObject} fromUser
     *                      <ul>
     *                          <li>{String} id</li>
     *                          <li>{JSONObject} image</li>
     *                          <li>{String} imageUrl</li>
     *                          <li>{String} name</li>
     *                      </ul>
     *                  </li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void replyFriendshipRequest(JSONObject params, final RequestCallback callback) throws ServiceException{
        try {
            JSONObject requestData = new JSONObject();

            final String requestId = (params != null && params.has("requestId") && !params.isNull("requestId")) ? params.get("requestId").toString() : null;
            final Integer reply = (params != null && params.has("reply") && !params.isNull("reply")) ? params.getInt("reply") : null;


            if (requestId == null) {
                throw new ServiceException("requestId not defined");
            }

            if (reply == null) {
                throw new ServiceException("reply not defined");
            }

            requestData.put("requestId", requestId);
            requestData.put("reply", reply);

            request(RequestUrls.REPLY_FRIENDSHIP_REQUEST, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        JSONObject retResult = new JSONObject();
                        if (!hasError) {

                            if (result.has("Result") && !result.isNull("Result")) {
                                retResult = reformatFriendshipRes(result.getJSONObject("Result"));
                            }
                        }

                        returnData.put("result", retResult);

                    } catch (Exception e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });
        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'> حذف درخواست دوستی ارسالی </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("requestId","22342");
     *      service.cancelFriendshipRequest(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("cancelFriendshipRequest method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} requestId</li>
     *      </ul>
     *
     * @param  callback
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void cancelFriendshipRequest(JSONObject params, final RequestCallback callback) throws ServiceException{
        try {
            JSONObject requestData = new JSONObject();

            final String requestId = (params != null && params.has("requestId") && !params.isNull("requestId")) ? params.get("requestId").toString() : null;

            if (requestId == null) {
                throw new ServiceException("requestId not defined");
            }

            requestData.put("requestId", requestId);

            request(RequestUrls.CANCEL_FRIENDSHIP_REQUEST, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        JSONObject retResult = new JSONObject();
//                        if (!hasError) {}

                        returnData.put("result", retResult);

                    } catch (Exception e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });
        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'> دریافت لیست دوستان </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      service.getUserFriends(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void getUserFriends(JSONObject result) {
     *              System.out.println("getSentFriendshipRequest method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} [name] </li>
     *          <li>{String} [size=50] </li>
     *          <li>{String} [offset] </li>
     *      </ul>
     *
     * @param  callback
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{JSONArray} friends
     *                      <ul>
     *                          <li>{Long} friendshipDate </li>
     *                          <li>{String} id </li>
     *                          <li>{Integer} status </li>
     *                          <li>{JSONObject} user
     *                              <ul>
     *                                  <li>{String} id</li>
     *                                  <li>{String} imageUrl</li>
     *                                  <li>{String} name</li>
     *                                  <li>{String} nickname</li>
     *                                  <li>{String} username</li>
     *                              </ul>
     *                          </li>
     *                      </ul>
     *                  </li>
     *                  <li>{Integer} count</li>
     *                  <li>{Boolean} hasNext</li>
     *                  <li>{Integer} nextOffset</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getUserFriends(JSONObject params, final RequestCallback callback) throws ServiceException{
        try {
            JSONObject requestData = new JSONObject();

            final String name = (params != null && params.has("name") && !params.isNull("name")) ? params.getString("name") : null;
            final Integer size = (params != null && params.has("size") && !params.isNull("size")) ? params.getInt("size") : 20;
            final Integer offset = (params != null && params.has("offset") && !params.isNull("offset")) ? params.getInt("offset") : 0;
            requestData.put("size", size);
            requestData.put("offset", offset);

            if (name != null) {
                requestData.put("name", name);
            }

            request(RequestUrls.USER_FRIENDS, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        JSONObject retResult = new JSONObject();
                        if (!hasError) {

                            if (result.has("Result") && !result.isNull("Result")) {
                                JSONArray friends = result.getJSONArray("Result");
                                JSONArray friendsData = new JSONArray();
                                for (int i = 0; i < friends.length(); i++) {
                                    JSONObject frData = friends.getJSONObject(i);
                                    JSONObject refData = new JSONObject();
                                    JSONObject user = null;

                                    if (frData.has("User") && !frData.isNull("User")) {
                                        user = frData.getJSONObject("User");
                                        user.put("id", user.get("id").toString());

                                        if (user.has("image") && !user.isNull("image")) {
                                            user.put("imageUrl", user.get("image").toString());
                                            user.remove("image");
                                        }

                                    }

                                    if (frData.has("FirstName") && !frData.isNull("FirstName")) {
                                        user.put("firstName", frData.get("FirstName"));
                                    }

                                    if (frData.has("LastName") && !frData.isNull("LastName")) {
                                        user.put("lastName", frData.get("LastName"));
                                    }

                                    refData.put("friendshipDate", frData.get("FriendshipDate"));
                                    refData.put("id", frData.get("ID").toString());
                                    refData.put("user", user);
                                    friendsData.put(refData);
                                }

                                retResult.put("friends", friendsData);
                                retResult.put("nextOffset", offset + friends.length());
                                retResult.put("hasNext", size == friends.length());
                                retResult.put("count", result.get("Count"));

                            }
                        }

                        returnData.put("result", retResult);

                    } catch (Exception e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });
        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'> حذف  دوستی  </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("id","22342");
     *      service.removeFriend(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("removeFriend method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} id</li>
     *      </ul>
     *
     * @param  callback
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONObject} result
     *              <ul>
     *                  <li>{boolean} state </li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void removeFriend(JSONObject params, final RequestCallback callback) throws ServiceException{
        try {
            JSONObject requestData = new JSONObject();

            final String id = (params != null && params.has("id") && !params.isNull("id")) ? params.get("id").toString() : null;

            if (id == null) {
                throw new ServiceException("id not defined");
            }

            requestData.put("id", id);

            request(RequestUrls.REMOVE_FRIEND_REQUEST, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        JSONObject retResult = new JSONObject();
                        if (!hasError) {

                            if (result.has("Result") && !result.isNull("Result")) {
                                retResult.put("state", result.getBoolean("Result"));
                            }
                        }

                        returnData.put("result", retResult);

                    } catch (Exception e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });
        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }


    /**
     * <div style='width: 100%;text-align: right'> دریافت دسته بندی های بازی در گیم سنتر </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      service.getLobbies(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void getLobbies(JSONObject result) {
     *              System.out.println("getLobbies method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *      </ul>
     *
     * @param  callback
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONArray} result
     *              <ul>
     *                  <li>{String} id </li>
     *                  <li>{String} name </li>
     *                  <li>{Long} timestamp</li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getLobbies(JSONObject params, final RequestCallback callback) throws ServiceException{
        try {


            request(RequestUrls.GET_LOBBIES, params, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        JSONArray refResult = new JSONArray();
                        if (!hasError) {

                            if (result.has("Result") && !result.isNull("Result")) {
                                JSONArray results = result.getJSONArray("Result");
                                for (int i = 0; i < results.length(); i++) {
                                    JSONObject data = results.getJSONObject(i);
                                    JSONObject refData = new JSONObject();

                                    refData.put("id", data.get("ID").toString());
                                    refData.put("name", data.get("Name").toString());
                                    refData.put("timestamp", data.get("Timestamp"));

                                    refResult.put(refData);
                                }
                            }
                        }
                        returnData.put("result", refResult);

                    } catch (Exception e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });
        } catch (Exception e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'> دریافت گالری تصاویر یک بازی </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      reqData.put("gameId","122")
     *      reqData.put("businessId","44")
     *      service.getGallery(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void getGallery(JSONObject result) {
     *              System.out.println("getGallery method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{String} gameId</li>
     *          <li>{String} businessId</li>
     *      </ul>
     *
     * @param  callback
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONArray} result
     *              <ul>
     *                  <li>{String} imageUrl </li>
     *                  <li>{String} title </li>
     *                  <li>{String} description </li>
     *              </ul>
     *          </li>
     *      </ul>
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getGallery(JSONObject params, final RequestCallback callback) throws ServiceException{
        try {
            JSONObject requestData = new JSONObject();

            final String gameId = (params != null && params.has("gameId") && !params.isNull("gameId")) ? params.getString("gameId") : null;
            final String businessId = (params != null && params.has("businessId") && !params.isNull("businessId")) ? params.getString("businessId") : null;


            if (gameId == null) {
                throw new ServiceException("gameId is not defined in params");
            }
            if (businessId == null) {
                throw new ServiceException("businessId is not defined in params");
            }

            requestData.put("productId", gameId);
            requestData.put("businessId", businessId);
            request(RequestUrls.GET_GALLERY, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    JSONObject returnData = new JSONObject();
                    try {
                        boolean hasError = result.getBoolean("HasError");
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        JSONArray refResult = new JSONArray();
                        if (!hasError) {

                            if (result.has("Result") && !result.isNull("Result")) {
                                JSONArray results = result.getJSONArray("Result");
                                for (int i = 0; i < results.length(); i++) {
                                    JSONObject data = results.getJSONObject(i);
                                    JSONObject refData = new JSONObject();

                                    refData.put("imageUrl", data.get("previewImage").toString());
                                    refData.put("title", data.get("title").toString());
                                    refData.put("description", data.get("description").toString());

                                    refResult.put(refData);
                                }
                            }
                        }
                        returnData.put("result", refResult);

                    } catch (Exception e) {
                        returnData = ExceptionErrorData(e);
                    }
                    callback.onResult(returnData);
                }
            });
        } catch (Exception e) {
            throw new ServiceException(e);
        }
    }

    /**
     *
     * <div style='width: 100%;text-align: right'>دریافت لیست بازی ها بر اساس لابی </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      JSONArray lobbyIds = new JSONArray();
     *      lobbyIds.put("22");
     *      lobbyIds.put("44");
     *      service.getLobbiesGames(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getLobbiesGames method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{JSONArray} [lobbyIds] - شناسه لابی</li>
     *          <li>{Integer} [size=20]</li>
     *          <li>{Integer} [offset=0]</li>
     *      </ul>
     *
     * @param  res
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONArray} result
     *              <ul>
     *                  <li>{Boolean} lobbyId</li>
     *                  <li>{JSONArray} games
     *                      <ul>
     *                          <li>{String} id</li>
     *                          <li>{String} name</li>
     *                          <li>{String} description</li>
     *                          <li>{String} creator</li>
     *                          <li>{String} physicalUrl</li>
     *                          <li>{String} timelineId</li>
     *                          <li>{String} packageName</li>
     *                          <li>{String} mobileVersion</li>
     *                          <li>{String} mobileVersionCode</li>
     *                          <li>{String} supporterId</li>
     *                          <li>{String} defaultLeagueId</li>
     *                          <li>{String} downloadLink</li>
     *                          <li>{String} gamePlayDescription</li>
     *                          <li>{String} score</li>
     *                          <li>{String} webVersion</li>
     *                          <li>{JSONArray} attributeValues</li>
     *                          <li>{JSONArray} categoryList</li>
     *                          <li>{JSONObject} business</li>
     *                          <li>{JSONObject} userPostInfo
     *                              <ul>
     *                                  <li>{Boolean} favorite</li>
     *                                  <li>{Boolean} liked</li>
     *                                  <li>{String} postId</li>
     *                              </ul>
     *                          </li>
     *                          <li>{JSONObject} rate
     *                              <ul>
     *                                  <li>{Integer} rate.rate</li>
     *                                  <li>{Integer} rate.rateCount</li>
     *                              </ul>
     *                          </li>
     *                          <li>{JSONObject} image
     *                              <ul>
     *                                  <li>{String} image.id</li>
     *                                  <li>{String} image.url</li>
     *                                  <li>{String} image.hashCode</li>
     *                                  <li>{Integer} image.width</li>
     *                                  <li>{Integer} image.height</li>
     *                              </ul>
     *                          </li>
     *                          <li>{Integer} playerNumbersType</li>
     *                          <li>{Integer} platformType</li>
     *                          <li>{Integer} availableCount</li>
     *                          <li>{Integer} discount</li>
     *                          <li>{Integer} numOfComments</li>
     *                          <li>{Integer} numOfFavorites</li>
     *                          <li>{Integer} numOfLikes</li>
     *                          <li>{Boolean} canComment</li>
     *                          <li>{Boolean} canLike</li>
     *                          <li>{Boolean} enable</li>
     *                          <li>{Boolean} hide</li>
     *                          <li>{Double} latitude</li>
     *                          <li>{Double} longitude</li>
     *                          <li>{Double} publishedDate</li>
     *                          <li>{Double} price</li>
     *                          <li>{Double} timestamp</li>
     *                      </ul>
     *                  </li>
     *              </ul>
     *          </li>
     *      </ul>
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getLobbiesGames(JSONObject params, final RequestCallback res) throws ServiceException {

        try {
            final JSONObject requestData = new JSONObject();
            Integer type = (params.has("type") && !params.isNull("type")) ? params.getInt("type") : null;
            JSONArray lobbyIds= (params.has("lobbyIds") && !params.isNull("lobbyIds")) ? params.getJSONArray("lobbyIds") : null;

            if (type != null) {
                requestData.put("type", type);
            }

            if (lobbyIds == null) {
                throw new ServiceException("lobbyIds not defined");
            }

            final Integer size = (params.has("size") && !params.isNull("size")) ? params.getInt("size") : 5;
            final Integer offset = (params.has("offset") && !params.isNull("offset")) ? params.getInt("offset") : 0;
            requestData.put("size", size);
            requestData.put("offset", offset);
            requestData.put("lobbyIds", lobbyIds);


            request(RequestUrls.GET_LOBBY_GAMES, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    try {

                        boolean hasError = result.getBoolean("HasError");
                        JSONObject returnData = new JSONObject();
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        if (!hasError) {
                            JSONObject allResult = result.getJSONObject("Result");

                            JSONArray keys = allResult.names();
                            JSONArray refactorData = new JSONArray();
                            for (int i=0;i<keys.length();i++ ) {
                                String key = keys.getString(i);

                                if (allResult.has(key) && !allResult.isNull(key)) {
                                    JSONArray games = allResult.getJSONArray(key);
                                    JSONArray refGames = new JSONArray();


                                    if (games != null) {
                                        JSONObject lobbiesGames = new JSONObject();

                                        for (int j = 0; j < games.length(); j++) {
                                            JSONObject info = games.getJSONObject(j);
                                            refGames.put(reformatGameObject(info, null, null));
                                        }
                                        lobbiesGames.put("lobbyId", key);
                                        lobbiesGames.put("games", refGames);
                                        refactorData.put(lobbiesGames);
                                    }
                                }
                            }
                            returnData.put("result", refactorData);
                        }
                        res.onResult(returnData);

                    } catch (JSONException e) {
                        res.onResult(ExceptionErrorData(e));
                    }
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     *
     * <div style='width: 100%;text-align: right'>دریافت لیست لیگ ها بر اساس لابی </div>
     * <pre>
     *  <code style='float:right'>نمونه کد</code>
     *  <code>
     *      JSONObject reqData = new JSONObject();
     *      JSONArray lobbyIds = new JSONArray();
     *      lobbyIds.put("22");
     *      lobbyIds.put("44");
     *      service.getLobbiesLeagues(reqData, new RequestCallback() {
     *          {@code @Override}
     *          public void onResult(JSONObject result) {
     *              System.out.println("getLobbiesLeagues method : " + result);
     *          }
     *      });
     *  </code>
     * </pre>
     * @param  params
     *      <ul>
     *          <li>{JSONArray} [lobbyIds] - شناسه لابی</li>
     *          <li>{Integer} [size=20]</li>
     *          <li>{Integer} [offset=0]</li>
     *      </ul>
     *
     * @param  res
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *          <li>{JSONArray} result
     *              <ul>
     *                  <li>{Boolean} lobbyId</li>
     *                  <li>{JSONArray} leagues
     *                      <ul>
     *                          <li>{String} id </li>
     *                          <li>{String} enrollUrl</li>
     *                          <li>{Boolean} isMember </li>
     *                          <li>{Boolean} isFollower</li>
     *                          <li>{JSONObject} userPostInfo
     *                              <ul>
     *                                  <li>{Boolean} favorite</li>
     *                                  <li>{Boolean} liked</li>
     *                                  <li>{String} postId</li>
     *                              </ul>
     *                          </li>
     *                          <li>{JSONObject} image
     *                              <ul>
     *                                  <li>{String} id</li>
     *                                  <li>{String} url</li>
     *                                  <li>{Integer} width</li>
     *                                  <li>{Integer} height</li>
     *                              </ul>
     *                          </li>
     *                          <li>{Integer} gameType</li>
     *                          <li>{Integer} playerType</li>
     *                          <li>{Integer} status</li>
     *                          <li>{Integer} financialType</li>
     *                          <li>{Integer} lobbyId</li>
     *                          <li>{Integer} maxPlayers</li>
     *                          <li>{Integer} minNoOfPlayedGames</li>
     *                          <li>{Integer} minPlayers</li>
     *                          <li>{Integer} memberCount</li>
     *                          <li>{Integer} playerNumberType</li>
     *                          <li>{Integer} timestamp</li>
     *                          <li>{String} creator</li>
     *                          <li>{Integer} memberCount</li>
     *                          <li>{Integer} availableCount</li>
     *                          <li>{Integer} discount</li>
     *                          <li>{Integer} numOfComments</li>
     *                          <li>{Integer} numOfFavorites</li>
     *                          <li>{Integer} numOfLikes</li>
     *                          <li>{Integer} type</li>
     *                          <li>{Integer} [endTime]</li>
     *                          <li>{Integer} [startTime]</li>
     *                          <li>{String} rules</li>
     *                          <li>{String} description</li>
     *                          <li>{String} name</li>
     *                          <li>{String} ThreadId</li>
     *                          <li>{String} timelineId</li>
     *                          <li>{Boolean} hasPrize</li>
     *                          <li>{Boolean} quickMatch</li>
     *                          <li>{Boolean} startTypeCapacityComplete</li>
     *                          <li>{Boolean} startTypeFromDate</li>
     *                          <li>{Boolean} startTypePublishDate</li>
     *                          <li>{Boolean} canComment</li>
     *                          <li>{Boolean} canLike</li>
     *                          <li>{Boolean} enable</li>
     *                          <li>{Boolean} hide</li>
     *                          <li>{Double} price</li>
     *                          <li>{JSONArray} attributeValues</li>
     *                          <li>{JSONArray} categoryList</li>
     *                          <li>{JSONObject} business</li>
     *                          <li>{JSONObject} rate</li>
     *                          <li>{JSONArray} games</li>
     *                      </ul>
     *                  </li>
     *              </ul>
     *          </li>
     *      </ul>
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getLobbiesLeagues(JSONObject params, final RequestCallback res) throws ServiceException {

        try {
            final JSONObject requestData = new JSONObject();
            Integer type = (params.has("type") && !params.isNull("type")) ? params.getInt("type") : null;
            JSONArray lobbyIds= (params.has("lobbyIds") && !params.isNull("lobbyIds")) ? params.getJSONArray("lobbyIds") : null;

            if (type != null) {
                requestData.put("type", type);
            }

            if (lobbyIds == null) {
                throw new ServiceException("lobbyIds not defined");
            }

            final Integer size = (params.has("size") && !params.isNull("size")) ? params.getInt("size") : 5;
            final Integer offset = (params.has("offset") && !params.isNull("offset")) ? params.getInt("offset") : 0;
            requestData.put("size", size);
            requestData.put("offset", offset);
            requestData.put("lobbyIds", lobbyIds);


            request(RequestUrls.GET_LOBBY_LEAGUES, requestData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject result)  {
                    try {

                        boolean hasError = result.getBoolean("HasError");
                        JSONObject returnData = new JSONObject();
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("ErrorMessage"));
                        returnData.put("errorCode", result.getInt("ErrorCode"));

                        if (!hasError) {
                            JSONObject allResult = result.getJSONObject("Result");

                            JSONArray keys = allResult.names();
                            JSONArray refactorData = new JSONArray();
                            for (int i=0;i<keys.length();i++ ) {
                                String key = keys.getString(i);

                                if (allResult.has(key) && !allResult.isNull(key)) {
                                    JSONArray games = allResult.getJSONArray(key);
                                    JSONArray refGames = new JSONArray();


                                    if (games != null) {
                                        JSONObject lobbiesGames = new JSONObject();

                                        for (int j = 0; j < games.length(); j++) {
                                            JSONObject info = games.getJSONObject(j);
                                            refGames.put(reformatLeagueObject(info, null, null));
                                        }
                                        lobbiesGames.put("lobbyId", key);
                                        lobbiesGames.put("leagues", refGames);
                                        refactorData.put(lobbiesGames);
                                    }
                                }
                            }
                            returnData.put("result", refactorData);
                        }
                        res.onResult(returnData);

                    } catch (JSONException e) {
                        res.onResult(ExceptionErrorData(e));
                    }
                }
            });

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

//    public void refreshUserId(JSONObject params,final RequestCallback callback) throws ServiceException{
//
//        JSONObject returnData = new JSONObject();
//        try {
//            String userId  = (params != null && params.has("userId") && !params.isNull("userId")) ? params.get("userId").toString() : null;
//
//
//            if (userId == null) {
//                throw new ServiceException("userId not exist in params");
//            }
//
//            boolean loginState = false;
//            if (userData.has("loginState")) {
//                loginState = userData.getBoolean("loginState");
//            }
//
//            if (!loginState) {
//                throw new ServiceException("user is not login");
//            }
//
//            userData.put("id", userId);
//
//            returnData = Util.createReturnData(false, "", 0, new JSONObject());
//
//
//        } catch (JSONException e) {
//            throw new ServiceException(e);
//        }
//
//        callback.onResult(returnData);
//    }

    public JSONObject getConfig() throws ServiceException{
        JSONObject config = new JSONObject();
        try {
            config.put("isa", ConfigData.isa);
            config.put("mrt", ConfigData.mrt);
            config.put("mmrc", ConfigData.mmrc);
            config.put("rvt", ConfigData.rvt);
            config.put("getChatHistoryCount", ConfigData.gchc);
            config.put("maxTextMessageLength", ConfigData.mtml);
            config.put("maxEmojiInMessage", ConfigData.meim);
            config.put("maxOfflineRequestMatchDay", ConfigData.mormd);
            config.put("offlineRequestMinMinute", ConfigData.mormd);
            config.put("offlineRequestMinMinute", ConfigData.ormm);
            config.put("quickMatchTimeout", ConfigData.qmt);
            config.put("increaseCashUrl", ConfigData.icu);
            config.put("creditUnit", ConfigData.cu);
            config.put("localEditProfile", ConfigData.lep);
            config.put("gameCenterLoginPageUrl", ConfigData.gclpu);
            config.put("gameCenterUserPageUrl", "http://www." + ConfigData.gcDomainName + (userData.has("token") ? "/?_token=" + userData.getString("token") : "/") + ConfigData.gcuph);
            config.put("gameCenterRulesUrl", ConfigData.gcru);
            config.put("chatItemId", ConfigData.ciid);
            config.put("businessId", ConfigData.businessId);
            config.put("bannerCustomPostId", ConfigData.bcpid);
            config.put("emojiCustomPosName", ConfigData.ecpn);
            config.put("gameCenterId", ConfigData.gcid);
            config.put("gameCenterVersion", ConfigData.gcv);
            config.put("gameCenterAPKUrl", ConfigData.gcau);
            config.put("supporterId", ConfigData.gcsid);
            config.put("ssoLoginUrl", ConfigData.ssolu);
            config.put("ssoSignupUrl", ConfigData.ssosu);
            config.put("ssoLogoutUrl", ConfigData.ssolou);
            config.put("ssoLeagueEnrollUrl", ConfigData.ssoleu);
            config.put("ssoInAppPurchaseUrl", ConfigData.ssoiau);
            config.put("ssoGameBuyUrl", ConfigData.ssogbu);
            config.put("gameCenterAddress", ConfigData.gca);
            config.put("lastAndroidAppVersion", ConfigData.malv);
            config.put("lastAndroidAppChangeLog", ConfigData.malvcl);
            config.put("androidAppMinimumVersion", ConfigData.mamv);
            config.put("lastAndroidAppDownloadLink", ConfigData.malvdl);
            config.put("lastAndroidAppForceUpdate", ConfigData.malvfu);
            config.put("gamesConfigData", ConfigData.gcd);
            config.put("leaguesConfigData", ConfigData.lcd);

        } catch (JSONException e) {
            throw new ServiceException(e);
        }

        return config;
    }

    public  JSONObject refactorGameCenterGameObject(JSONObject data){
        return reformatGameObject(data, null, null);
    }

    public void sendLocationRequest(JSONObject params, final RequestCallback res) throws ServiceException {
        try {

            JSONObject requestData = new JSONObject();

            String latitude = (params != null && params.has("latitude") && !params.isNull("latitude")) ? params.getString("latitude") : null;
            String longitude = (params != null && params.has("longitude") && !params.isNull("longitude")) ? params.getString("longitude") : null;
            String appId = (params != null && params.has("appId") && !params.isNull("appId")) ? params.getString("appId") : null;

            if (latitude == null) {
                throw new ServiceException("latitude is not defined in params");
            }
            if (longitude == null) {
                throw new ServiceException("longitude is not defined in params");
            }


            requestData.put("latitude", latitude);
            requestData.put("longitude", longitude);
            if (appId!= null) {
                requestData.put("appId", appId);
            } else {
                requestData.put("appId", this.appId);
            }


            if (params.has("accuracy") && !params.isNull("accuracy")) {
                requestData.put("accuracy", params.get("accuracy"));
            }
            if (params.has("speed") && !params.isNull("speed")) {
                requestData.put("speed", params.get("speed"));
            }
            if (params.has("heading") && !params.isNull("heading")) {
                requestData.put("heading", params.get("heading"));
            }

            JSONObject reqData = new JSONObject();
            reqData.put("url", RequestUrls.SET_LOCATION);
            reqData.put("data", requestData);

            JSONObject headers = new JSONObject();
            headers.put("Content-Type", "application/json; charset=utf-8");
            reqData.put("data", requestData);
            reqData.put("headers", headers);
            ObjectPoolRequest(reqData, new Network.HttpRequestCallback() {
                @Override
                public void onResult(JSONObject resData)  {
                    try {

                        boolean hasError = resData.getBoolean("HasError");
                        JSONObject returnData = new JSONObject();
                        JSONObject result = null;

                        if (!hasError) {
                            result = new JSONObject(resData.getString("Result"));
                            returnData.put("hasError", result.getBoolean("HasError"));
                        }


                        if (result.has("ErrorMessage") && !result.isNull("ErrorMessage")) {
                            returnData.put("errorMessage", result.getString("ErrorMessage"));
                        } else {
                            returnData.put("errorMessage", "");
                        }
                        if (result.has("errorCode") && !result.isNull("ErrorCode")) {
                            returnData.put("errorCode", result.getString("ErrorCode"));
                        }

                        if (result.has("result") && !result.isNull("Result")) {
                            returnData.put("result", result.getString("Result"));
                        }


                        res.onResult(returnData);

                    } catch (JSONException e) {
                        res.onResult(ExceptionErrorData(e));
                    }
                }
            });
        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    public void sendMessage(JSONObject params, final SendDataCallback callback) throws ServiceException{
        try {

            JSONObject emitData = new JSONObject();
            emitData.put("receivers", params.getJSONArray("receivers"));

            emitData.put("content", params.getString("message"));

            JSONObject reqData = new JSONObject();
            reqData.put("type", 5);
            reqData.put("content", emitData);

            network.emit(reqData, new RequestCallback() {
                @Override
                public void onResult(JSONObject result) {
                    callback.onReceive(new JSONObject());
                }
            });
        }catch (Exception e){
            throw new ServiceException(e);
        }


    }

}

