package com.fanap.gameCenter.TIS.Base;

import org.json.JSONObject;

/**
 *<div style='width: 100%;text-align: right'>اعلام رخداد به وقوع پیوسته</div>
 * */
public abstract class EventCallback {

        public void onFire(JSONObject msg){}

        public void onFire(JSONObject msg,AsyncResponse res){}
}
