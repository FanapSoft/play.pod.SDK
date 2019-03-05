package com.fanap.gameCenter.TIS.Base.Game;

import com.fanap.gameCenter.TIS.Base.AsyncResponse;
import com.fanap.gameCenter.TIS.Base.MatchRequestCallback;
import com.fanap.gameCenter.TIS.Base.RequestCallback;
import com.fanap.gameCenter.TIS.Base.SendDataCallback;
import com.fanap.gameCenter.TIS.Network.Network;
import com.fanap.gameCenter.TIS.Service;
import com.fanap.gameCenter.TIS.Share.*;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Date;
import java.util.HashMap;
import java.util.UUID;

public abstract class MultiPlayer {

    private Service service;
    private Network network;
    private boolean isFinished = false;
    private boolean isRun = false;
    private boolean isStart = false;
    private boolean isResume = false;
    private boolean isEnd = false;
    private boolean isQuick = false;
    private boolean isReload = false;

    private String matchId;
    private String gameId;
    private String leagueId;
    private String opponentPeerId;
    private JSONObject opponentsData;
    private JSONObject ownData;
    private Date startTime;
    private HashMap<String, HashMap> sendDataAckState = new HashMap<String, HashMap>();
    private HashMap<String, Boolean> receivedData = new HashMap<String, Boolean>();
    private JSONArray receiveDataQueue = new JSONArray();
    static Logger log = Logger.getLogger(MultiPlayer.class);


    public MultiPlayer() {
    }

    public void initialize(Service service, Network network, JSONObject matchData) {

        this.service = service;
        this.network = network;
        init(matchData);
    }

    private void init(JSONObject matchData) {
        try {
            matchId = matchData.get("matchId").toString();
            gameId = matchData.get("gameId").toString();
            leagueId = matchData.get("leagueId").toString();

            if (matchData.has("isResume") && !matchData.isNull("isResume") && matchData.getBoolean("isResume")) {
                isResume = true;
                isReload = true;
            }
            if (matchData.has("isQuick") && !matchData.isNull("isQuick") && matchData.getBoolean("isQuick")) {
                isQuick = true;
            }
            ownData = matchData.getJSONObject("ownData");
            opponentsData =matchData.getJSONArray("opponentsData").getJSONObject(0);
            opponentPeerId = opponentsData.get("peerId").toString();

            this.onInit(matchData);

        } catch (JSONException e) {
            e.printStackTrace();
        }

    }

    private  void cancelMatchRequest(final int type, final RequestCallback callback) throws ServiceException {

        try {
            JSONObject requestData = new JSONObject();
            requestData.put("matchId", matchId);
            requestData.put("type",type);

            service.httpPostRequest(RequestUrls.MATCH_CANCEL, requestData, new RequestCallback() {
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
                                        cancelMatchRequest(type,callback);
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

    private void cancelMatch(boolean sendCancelState,RequestCallback callback) throws ServiceException {
        if (isFinished) {
            return;
        }
        isFinished = true;

        if (sendCancelState) {
            cancelMatchRequest(2,callback);
        }
    }

    private void sendReady(final RequestCallback res) {

        try {
            JSONObject requestData = new JSONObject();
            requestData.put("userId", ownData.get("id").toString());
            requestData.put("sessionId", service.getUserData().get("peerId").toString());
            requestData.put("matchId", matchId);
//            requestData.put("ready", requestData.toString());
            service.httpPostRequest(RequestUrls.MATCH_READY, requestData, new RequestCallback() {
                @Override
                public void onResult(JSONObject result) {
                    try {
                        boolean hasError = result.getBoolean("hasError");
                        JSONObject returnData = new JSONObject();
                        returnData.put("hasError", hasError);
                        returnData.put("errorMessage", result.getString("errorMessage"));

                        if (hasError) {
                            int errorCode = result.getInt("errorCode");

                            if (errorCode == ErrorCodes.RUNTIME || errorCode == ErrorCodes.REQUEST_FAILED) {
                                Util.setTimeout(new Util.SetTimeoutCallback(){
                                    @Override
                                    public void onDone() {
                                        sendReady(res);
                                    }
                                }, ConfigData.smit);
                            } else {
                                cancelMatch(false,null);
                                res.onResult(returnData);
                            }
                        } else {
                            res.onResult(returnData);
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            });

        } catch (JSONException e) {
            e.printStackTrace();
        }

    }


    /**
     * <div style='width: 100%;text-align: right'> ارسال داده های بازی</div>
     * @param params
     *      <ul>
     *          <li>{JSONObject|String} sendData - داده ارسالی</li>
     *          <li>{String} [dataId] - شناسه داده</li>
     *      </ul>
     *
     * @param  callback
     * events : onReceive - بعد از دریافت پیام توسط حریف , این متد فراخوانی می شود
     *
     * @throws ServiceException خطای پارامتر های ورودی
     * @return id شناسه داده ارسال شده
     * */
    public JSONObject sendData(final JSONObject params, final SendDataCallback callback) throws ServiceException {
        final JSONObject retData = new JSONObject();
        log.info("sendData_1");
        try {
            final String dataId = (params.has("dataId") && !params.isNull("dataId")) ? params.getString("dataId") : UUID.randomUUID().toString();
//            boolean sequential = (params.has("dataId") && !params.isNull("sequential")) && params.getBoolean("sequential");
            String matchId = params.get("matchId").toString();

            JSONArray receiversPeerIdPeerId = new JSONArray();
            receiversPeerIdPeerId.put(opponentPeerId);
            HashMap ackObj = sendDataAckState.get(dataId);
            log.info("sendData_2");
            if (ackObj != null) {
                Boolean state = (Boolean) ackObj.get("state");
                log.info("sendData_3 " + state);
                if (state!= null && state) {
                    return null;
                }
            } else {
                log.info("sendData_4");
                ackObj = new HashMap();
                ackObj.put("state", false);
                ackObj.put("sendTryCount", 0);

                if (callback != null) {
                    ackObj.put("callback", callback);
                }
                sendDataAckState.put(dataId, ackObj);


                ackObj.put("sendTryCount",  (Integer)ackObj.get("sendTryCount") + 1);

                JSONObject emitData = new JSONObject();
                emitData.put("receivers", receiversPeerIdPeerId);

                JSONObject pushContent = new JSONObject();
                pushContent.put("type", PushMessageContentTypes.DATA_PACK);

                JSONObject gameContent = new JSONObject();
                gameContent.put("dataId", dataId);
                gameContent.put("matchId", matchId);
                gameContent.put("data", params.get("sendData"));

                pushContent.put("content", gameContent.toString());

                emitData.put("content", pushContent.toString());

                final String timeoutId = Util.setTimeout(new Util.SetTimeoutCallback() {
                    @Override
                    public void onDone() {
                        HashMap ackObj = sendDataAckState.get(dataId);
                        log.info("sendData_6 ");
                        if (!(Boolean) ackObj.get("state")) {
                            log.info("sendData_7 ");
                            if (isFinished && (Integer)ackObj.get("sendTryCount") > ConfigData.msdtc) {
                                log.info("sendData_8 ");
                                return;
                            }
                            try {
                                params.put("resend", true);
                                sendData(params, callback);
                            } catch (Exception e) {
                                e.printStackTrace();
                            }

                        }
                    }
                },ConfigData.pmto);

                final JSONObject reqData = new JSONObject();
                reqData.put("type", 5);
                reqData.put("content", emitData);
                log.info("sendData_5 " + reqData);

                final Date t1 = new Date();
                network.emit(reqData, new RequestCallback() {
                    @Override
                    public void onResult(JSONObject result) {
                        try {
                            log.info("sendData_9 " + (new Date().getTime() - t1.getTime()));
                            HashMap ackObj = sendDataAckState.get(dataId);
                            if (!(Boolean) ackObj.get("state")) {
                                ackObj.put("state", true);

                                if (!isFinished) {
                                    JSONObject recDataAck = new JSONObject();
                                    recDataAck.put("dataId", dataId);
                                    if (params.has("sequential")) {
                                        recDataAck.put("sequential", params.get("sequential"));
                                    }

                                    onReceiveDataAck(recDataAck);
                                }

                                Util.clearTimeout(timeoutId);

                                JSONObject retData = new JSONObject();
                                retData.put("dataId", dataId);
                                log.info("sendData_10 " + retData);
                                callback.onReceive(retData);
                            }
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                    }
                });

                if (params.has("resend") && ! (Boolean) params.get("resend")) {

                    JSONObject sentData = new JSONObject();
                    sentData.put("dataId", dataId);
                    if (params.has("sequential")) {
                        sentData.put("sequential", params.get("sequential"));
                    }
                    int sequentialDataQueueLength = 0;
                    if (params.has("sequentialDataQueueLength") && (Integer) params.get("sequentialDataQueueLength") > 0) {
                        sequentialDataQueueLength = (Integer) params.get("sequentialDataQueueLength");
                    }

                    sentData.put("sequentialDataQueueLength", sequentialDataQueueLength);
                    onSentData(sentData);
                }
            }

            retData.put("dataId", dataId);
            return retData;
        } catch (Exception e) {
            throw new ServiceException(e);
        }
    }

//    public void saveStateData(JSONObject params) {
//
//    }
//
//    public void saveStaticData(JSONObject params) {
//
//    }

    /**
     *
     * <div style='width: 100%;text-align: right'> اعلام نتیجه بازی</div>
     * @param params
     *      <ul>
     *          <li>{JSONObject} result - هر یک از کلید های این آبجکت شناسه بازیکن می باشد و و مقدار آن نیز نتیجه بازیکن
     *              <ul>
     *                  <li>
     *                  {
     *                      5 : [
     *                          {
     *                              name : "field1",//امتیاز
     *                              value : 3
     *                          },
     *                          {
     *                              name : "field2",//
     *                              value : 1
     *                          }
     *                      ],
     *                      6 : [
     *                          {
     *                              name : "field1",//برد
     *                              value : 0
     *                          },
     *                          {
     *                              name : "field2",//باخت
     *                              value : 0
     *                          }
     *                      ]
     *                  }
     *                  </li>
     *              </ul>
     *          </li>
     *          <li> {Integer} [reasonCode]-  کد دلیل نتیجه</li>
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
    public void sendResult(JSONObject params, RequestCallback res) throws ServiceException{
        isRun = false;
        try {
            String result;
            if (params.has("result") && !params.isNull("result")) {

                JSONObject gameResult = params.getJSONObject("result");

                String ownId = ownData.get("id").toString();
                String opponentId = opponentsData.get("id").toString();

                JSONArray resData = new JSONArray();

                JSONObject ownData = new JSONObject();
                ownData.put("player1Id", ownId);
                ownData.put("scores", gameResult.get(ownId));
                resData.put(ownData);

                JSONObject opponentData = new JSONObject();
                opponentData.put("player1Id", opponentId);
                opponentData.put("scores", gameResult.get(opponentId));
                resData.put(opponentData);


                result = resData.toString();

                JSONObject requestData = new JSONObject();
                requestData.put("matchResult", result);
                requestData.put("matchId", matchId);
                requestData.put("gameId", gameId);

                isEnd = true;
                service.sendMatchResultRequest(requestData,res);
            }

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * اعلام آمادگی بازی برای شروع بازی
     * @param  res رخداد جواب درخواست
     * */
    public void ready(RequestCallback res) {
        if (isResume) {
            this.onStart();
            this.onPause();
        }
        sendReady(res);

    }


//    public void getSequentialDataQueue(JSONObject params) {
//
//    }

    public boolean isFinished() {
        return isFinished;
    }

    public boolean isStarted() {
        return isStart;
    }

    public boolean isRun() {
        return isRun;
    }

    /**
     * <div style='width: 100%;text-align: right'>اعلام کنسل شدن بازی</div>
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *      </ul>
     *
     * @throws ServiceException خطای اجرای درخواست
     * */
    public void cancel(RequestCallback callback) throws ServiceException {
        cancelMatch(true,callback);
    }

    /**
     * درخواست بازی دوباره با حریف
     * @param res رخداد جواب درخواست
     * */
    public void reMatch(MatchRequestCallback res)  {
        try {

            JSONObject requestData = new JSONObject();
            requestData.put("opponentId", opponentsData.get("id").toString());
            requestData.put("gameId", gameId);
            requestData.put("leagueId", leagueId);
            service.matchRequest(requestData,res);

        } catch (JSONException e) {
            e.printStackTrace();
        }catch (ServiceException e) {
            e.printStackTrace();
        }
    }

    /**
     * دریافت امتیازات برتر بازیکنان و یا خود بازیکن
     *
     * @param  params
     *      <ul>
     *          <li>{Boolean} [currentLeague] - تعیین دریافت بر اساس لیگی که کاربر مشغول بازی است</li>
     *          <li>{Boolean} [isGlobal] - برترین در بین کاربران و یا امتیازات خود کاربر</li>
     *      </ul>
     *
     * @param res رخداد جواب درخواست
     * @throws ServiceException خطای پارامتر های ورودی
     * */
    public void getTopScore(JSONObject params,RequestCallback res) throws ServiceException {
        try {

            JSONObject requestData = new JSONObject();
            requestData.put("gameId", gameId);
            if (params != null) {
                if (params.has("currentLeague") && params.getBoolean("currentLeague")) {
                    requestData.put("leagueId", leagueId);
                }
                if (params.has("isGlobal") && !params.isNull("isGlobal")) {
                    requestData.put("leagueId", params.getBoolean("isGlobal"));
                }
            }

            service.getTopScore(requestData,res);

        } catch (JSONException e) {
            throw new ServiceException(e);
        }
    }

    /**
     * <div style='width: 100%;text-align: right'>اعلام ترک بازی</div>
     * @param  callback
     *      <p>onResult method params is JSONObject that has</p>
     *      <ul>
     *          <li>{Boolean} hasError</li>
     *          <li>{String} errorMessage</li>
     *          <li>{Integer} errorCode</li>
     *      </ul>
     *
     * @throws ServiceException خطای اجرای درخواست
     * */
    public void leave(RequestCallback callback) throws ServiceException{
        cancelMatchRequest(1,callback);
    }

    /**
     * <div style='width: 100%;text-align: right'> این متد بعد از دریافت پیامی جدید از سوی حریف , فراخوانی می شود</div>
     * @param  receivedData
     *      <ul>
     *          <li>{JSONObject|String} data - پیام ارسال شده از سوی حریف</li>
     *          <li>{JSONObject|String} dataId - شناسه پیام ارسال شده</li>
     *      </ul>
     *
     * @param  res کابکی که بعد از دریافت پیام جدید باید فراخوانی شود.با فرخوانی این متد فرد مقابل می فهمد که پیام به دست شما رسیده است
     * */
    public abstract void onReceiveData(JSONObject receivedData,AsyncResponse res);

    public void _onReceiveData(JSONObject params,AsyncResponse res) {

        try {
            if (isStart && isRun) {
                if (isEnd) {
                    res.call();
                } else {
                    if (receivedData.get(params.getString("dataId")) != null) {
                        res.call();
                    } else {
                        onReceiveData(params,res);
                    }
                }
            } else {
                HashMap queueData = new HashMap();
                queueData.put("params", params);
                queueData.put("res", res);
                receiveDataQueue.put(queueData);
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }

    }

    /**
     * <div style='width: 100%;text-align: right'> این متد بعد از اتصال به سرور ایسینک فراخوانی می شود</div>
     * */
    public abstract void onConnect();

    /**
     * <div style='width: 100%;text-align: right'>این متد بعد از اتصال مجدد به سرور ایسینک فراخوانی می شود</div>
     * */
    public abstract void onReconnect();

    /**
     * <div style='width: 100%;text-align: right'> این متد بعد از قطع اتصال به سرور ایسینک فراخوانی می شود</div>
     * */
    public abstract void onDisconnect();

    /**
     * <div style='width: 100%;text-align: right'> این متد بعد از ترک بازی توسط حریف فراخوانی می شود</div>
     * @param  params
     *      <ul>
     *          <li>{String} opponentId شناسه حریفی که بازی را ترک کرده</li>
     *      </ul>
     * */
    public abstract void onLeave(JSONObject params);

    public void _onLeave(JSONObject params) {
        try {
            if (!isFinished) {
                if (params.has("opponentSessionId") && !params.isNull("opponentSessionId")) {
                    opponentPeerId = params.get("opponentSessionId").toString();
                }
                JSONObject data = new JSONObject();
                data.put("opponentPeerId", opponentPeerId);
                onLeave(data);
            }

        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    /**
     * <div style='width: 100%;text-align: right'>بعد از فراخوانی این متد می توانید به کلیه توابع دیگر که در این کلاس وجود دارد دسترسی داشته باشید</div>
     *  @param params
     *      <ul>
     *          <li>{String} gameId - شناسه بازی</li>
     *          <li>{String} leagueId - شناسه لیگ</li>
     *          <li>{String} leagueName - نام لیگ</li>
     *          <li>{String} matchId - شناسه مسابقه</li>
     *          <li>{‌Boolean} isQuick - ‌تعیین اینکه مسابقه از طریق حریف می طلبم ایجاد شده یا خیر</li>
     *          <li>{JSONObject} ownData
     *              <ul>
     *                  <li>{String} name - نام کاربر</li>
     *                  <li>{String} id - شناسه کاربر</li>
     *                  <li>{Boolean} applicant - تعیین اینکه آیا درخواست دهنده بازی بوده یا خیر</li>
     *                  <li>{JSONObject} [image] - اطلاعات تصویر کاربر
     *                      <ul>
     *                          <li>{String} id - شناسه تصویر</li>
     *                          <li>{String} url - لینک تصویر</li>
     *                          <li>{Integer} width - اندازه رزولیشن افقی تصویر</li>
     *                          <li>{Integer} height - اندازه رزولیشن عمودی تصویر</li>
     *                      </ul>
     *                  </li>
     *              </ul>
     *          </li>
     *          <li>{JSONArray} opponentsData - اطلاعات حربف
     *               <ul>
     *                  <li>{String} name - نام کاربر</li>
     *                  <li>{String} id - شناسه کاربر</li>
     *                  <li>{Boolean} applicant - تعیین اینکه آیا درخواست دهنده بازی بوده یا خیر</li>
     *                  <li>{JSONObject} [image] - اطلاعات تصویر کاربر
     *                      <ul>
     *                          <li>{String} id - شناسه تصویر</li>
     *                          <li>{String} url - لینک تصویر</li>
     *                          <li>{Integer} width - اندازه رزولیشن افقی تصویر</li>
     *                          <li>{Integer} height - اندازه رزولیشن عمودی تصویر</li>
     *                      </ul>
     *                  </li>
     *               </ul>
     *          </li>
     *      </ul>
     * */
    public abstract void onInit(JSONObject params);

    /**
     * <div style='width: 100%;text-align: right'> بعد از اعلام شروع بازی از سمت گیم سنتر این متد فراخوانی می شود</div>
     * */
    public abstract void onStart();

    public void _onStart(JSONObject params){
        try {

            isStart = true;
            isRun = true;
            startTime = new Date();

            if (params.has("opponentSessionId") && !params.isNull("opponentSessionId")) {
                opponentPeerId = params.get("opponentSessionId").toString();
            }

            onStart();

            if (receiveDataQueue.length() > 0) {
                for (int i = 0; i < receiveDataQueue.length(); i++) {
                    AsyncResponse res = (AsyncResponse) params.get("res");
                    onReceiveData(receiveDataQueue.getJSONObject(i),res);
                }
                receiveDataQueue = new JSONArray();
            }

        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    /**
     * <div style='width: 100%;text-align: right'>بعد از اعلام توقف بازی از سمت گیم سنتر این متد فراخوانی می شود</div>
     * */
    public abstract void onPause();

    public void _onPause(JSONObject params) {
        try {
            if (!isFinished) {
                if (params.has("opponentSessionId") && !params.isNull("opponentSessionId")) {
                    opponentPeerId = params.get("opponentSessionId").toString();
                }
                isRun = false;
                onPause();
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    /**
     * <div style='width: 100%;text-align: right'> بعد از اعلام شروع مجدد بازی از سمت گیم سنتر این متد فراخوانی می شود</div>
     * */
    public abstract void onResume();

    public void _onResume(JSONObject params) {

        try {
            if (!isFinished) {
                if (params.has("opponentSessionId") && !params.isNull("opponentSessionId")) {
                    opponentPeerId = params.get("opponentSessionId").toString();
                }
            }
            onResume();

            if (receiveDataQueue.length() > 0) {
                for (int i = 0; i < receiveDataQueue.length(); i++) {
                    AsyncResponse res = (AsyncResponse) params.get("res");
                    onReceiveData(receiveDataQueue.getJSONObject(i),res);
                }
                receiveDataQueue = new JSONArray();
            }


        } catch (JSONException e) {
            e.printStackTrace();
        }

    }

    /**
     * <div style='width: 100%;text-align: right'> بعد از بررسی بازی از سمت گیم سنتر این متد فراخوانی می شود</div>
     * @param  params
     *      <ul>
     *          <li>{Boolean} state - تعیین معتبر و یا نامعتبر بودن نتیجه مسابقه</li>
     *      </ul>
     * */
    public abstract void onEnd(JSONObject params);

    public void _onEnd(JSONObject params) {
        isEnd = true;
        onEnd(params);
    }

    /**
     * <div style='width: 100%;text-align: right'>بعد از دریافت پیام توسط حریف این متد فراخوانی می شود</div>
     * @param  params
     *      <ul>
     *          <li>{String} dataId - شناسه پیام</li>
     *          <li>{‌boolean} sequential - تعین ترتیبی بودن یا نبودن پیام</li>
     *      </ul>
     * */
    public abstract void onReceiveDataAck(JSONObject params);


    /**
     * <div style='width: 100%;text-align: right'> بعد از ارسال پیام این متد فراخوانی می شود</div>
     * @param  params
     *      <ul>
     *          <li>{String} dataId - شناسه پیام</li>
     *          <li>{‌boolean} sequential - تعین ترتیبی بودن یا نبودن پیام</li>
     *      </ul>
     * */
    public abstract void onSentData(JSONObject params);

}
