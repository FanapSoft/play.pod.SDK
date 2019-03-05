package com.fanap.gameCenter.TIS.Base;

import com.fanap.gameCenter.TIS.Network.Network;
import com.fanap.gameCenter.TIS.Share.ServiceException;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public abstract class AsyncResponse {

        private JSONObject sendData = new JSONObject();
        private Network network;
        private boolean canSend = false;

        public AsyncResponse(JSONObject message, Network network) {
                try {
                        int type = message.getInt("type");
                        if (type == 4 || type == 5) {
                                JSONArray receivers = new JSONArray();
                                receivers.put(message.getInt("senderId"));
                                sendData.put("receivers", receivers);
                                sendData.put("messageId", message.getInt("id"));
                                canSend = true;
                        }

                } catch (JSONException e) {
                        e.printStackTrace();
                }

                this.network = network;

        }
        public void call(){
                if (canSend) {
                        try {
                                network.pushSendMessage(6,sendData);
                        } catch (ServiceException e) {
                                e.printStackTrace();
                        }
                }

        }

}

