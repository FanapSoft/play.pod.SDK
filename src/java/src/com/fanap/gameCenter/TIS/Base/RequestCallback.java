package com.fanap.gameCenter.TIS.Base;

import org.json.JSONObject;

/**
 *<div style='width: 100%;text-align: right'>اعلام جواب درخواست ارسالی</div>
 * */
public abstract class RequestCallback {
        /**
         *<div style='width: 100%;text-align: right'>نتیجه درخواست که بسته به درخواست نتیجه ارسالی به آن متفاوت می باشد</div>]
         *
         * @param result نتیجه درخواست
         * */
        public void onResult(JSONObject result) {

        }
}
