package com.fanap.gameCenter.TIS.Network;

import com.koushikdutta.async.callback.CompletedCallback;
import com.koushikdutta.async.http.AsyncHttpClient;
import com.fanap.gameCenter.TIS.Share.ConfigData;
import com.fanap.gameCenter.TIS.Share.Logger;
import com.fanap.gameCenter.TIS.Share.ServiceException;
import com.fanap.gameCenter.TIS.Share.Util;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Date;

abstract class WebSocketHandler extends SocketInterface {
    private WebSocketHandler self;
    private String pushServerAddress;
    private com.koushikdutta.async.http.WebSocket socket;
    private Date lastMessageTime;
    private int pcct;//push check connection timeout
    private int pcctt;//webSocket check connection timeout threshold
    private int WSCWTI;//webSocket connection wait time interval
    private int pingTimeCheck;

    private String lastPingTimeoutId = null;
    private String lastMessageTimeoutId = null;
    static Logger log = Logger.getLogger(WebSocketHandler.class);

    WebSocketHandler(String serverAddress) {
        self = this;
        pushServerAddress = serverAddress;
//        psa = "wss://bus.fanapium.com/ws";
        pcct = ConfigData.PCCT;
        pcctt = ConfigData.PCCTT;
        WSCWTI = ConfigData.WSCWTI;
        pingTimeCheck = pcct - pcctt;
        connect();

    }

    private void ping() throws ServiceException {
        log.info("ping_0 " + pushServerAddress);
        emit(0, null);
        lastPingTimeoutId = Util.setTimeout(new Util.SetTimeoutCallback(){
            @Override
            public void onDone() {
                Date currentData = new Date();
                log.info("ping_1 " +(currentData.getTime() - lastMessageTime.getTime()) + " " + lastMessageTime.getTime() + " " + (pcct + pcctt));
                if (currentData.getTime() - lastMessageTime.getTime() > (pcct + pcctt)) {
                    System.out.println("CLOSE_BY_OWN " + socket.isOpen());
                    socket.close();
                }
            }

        },pcct);
    }

    @Override
    public void connect() {

        log.info("INIT_SOCKET_CONNECTION " + pushServerAddress);
        AsyncHttpClient.getDefaultInstance().websocket(pushServerAddress, "", new AsyncHttpClient.WebSocketConnectCallback() {
            @Override
            public void onCompleted(Exception ex, com.koushikdutta.async.http.WebSocket webSocket) {
                log.info("SOCKET_OPENED " + pushServerAddress );
                if (ex != null) {
                    ex.printStackTrace();
                    log.info("CONNECT_TIMEOUT_EXCEPTION_0");
                    Util.setTimeout(new Util.SetTimeoutCallback() {
                        @Override
                        public void onDone() {
                            log.info("CONNECT_TIMEOUT_EXCEPTION_1");
                            connect();
                        }
                    }, pcct);
                    return;
                }
                socket = webSocket;
                onOpen(self);
                webSocket.setStringCallback(new com.koushikdutta.async.http.WebSocket.StringCallback() {
                    public void onStringAvailable(String s) {
                        try {
                            log.info("SOCKET_MESSAGE_1 " + pushServerAddress + " " + s);
                            JSONObject MSG = new JSONObject(s);
                            onMessage(MSG);

                            lastMessageTime = new Date();

                            Util.clearTimeout(lastMessageTimeoutId);
                            Util.clearTimeout(lastPingTimeoutId);
                            lastMessageTimeoutId = Util.setTimeout(new Util.SetTimeoutCallback() {
                                @Override
                                public void onDone() {
                                    Date currentDate = new Date();
                                    if(currentDate.getTime() - lastMessageTime.getTime() >= pingTimeCheck) {
                                        try {
                                            ping();
                                        } catch (ServiceException e) {
                                            e.printStackTrace();
                                        }
                                    }
                                }
                            }, pcct);
                        } catch (Exception e) {
                            e.printStackTrace();
                        }

                    }
                });

                webSocket.setClosedCallback(new CompletedCallback(){
                    @Override
                    public void onCompleted(Exception e) {
                        log.info("SOCKET_CLOSE " + e);

                        Util.clearTimeout(lastMessageTimeoutId);
                        Util.clearTimeout(lastPingTimeoutId);
                        onClose(4002);
                    }
                });


            }
        });
    }

    @Override
    public void emit(Integer type, JSONObject content) throws ServiceException{
        JSONObject data = new JSONObject();

        try {
            data.put("type", type);
            if (content != null) {
                data.put("content", content.toString());
            }

            if (socket != null) {
                socket.send(data.toString());
            }
        } catch (JSONException e) {
            throw new ServiceException(e);
        }

    }

    @Override
    public void logout() {
        if (lastMessageTimeoutId != null) {
            Util.clearTimeout(lastMessageTimeoutId);
            lastMessageTimeoutId = null;
        }

        if (lastPingTimeoutId != null) {
            Util.clearTimeout(lastPingTimeoutId);
            lastPingTimeoutId = null;
        }

        socket.close();
    }

    @Override
    public void close() {
        if (lastMessageTimeoutId != null) {
            Util.clearTimeout(lastMessageTimeoutId);
            lastMessageTimeoutId = null;
        }

        if (lastPingTimeoutId != null) {
            Util.clearTimeout(lastPingTimeoutId);
            lastPingTimeoutId = null;
        }
        socket.close();
    }

    public abstract void onMessage(JSONObject message);

    public abstract void onOpen(SocketInterface webSocket);

    public abstract void onClose(int errorCode);

}
