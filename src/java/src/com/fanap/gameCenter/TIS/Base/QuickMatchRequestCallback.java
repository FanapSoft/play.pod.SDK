package com.fanap.gameCenter.TIS.Base;

import org.json.JSONObject;

/**
 *<div style='width: 100%;text-align: right'>اعلام نتیجه حریف می طلبم</div>
 * */
public abstract class QuickMatchRequestCallback {

        /**
         *<div style='width: 100%;text-align: right'>بعد از اعلام درخواست به سرور و گرفتن نتیجه درخواست این متد فراخوانی می شود </div>
         * @param  result
         *  <ul>
         *      <li>{Boolean} hasError</li>
         *      <li>{String} errorMessage</li>
         *  </ul>
         *
         */
        public abstract void onResult(JSONObject result);

        /**
         *<div style='width: 100%;text-align: right'>بعد از ایجاد مسابقه ای از طریق حریف می طلبم این متد فراخوانی می شود</div>
         * @param  data
         *  <ul>
         *     <li>{String} leagueId شناسه لیگ</li>
         *  </ul>
         */
        public abstract void onCancel(JSONObject data);

        /**
         *<div style='width: 100%;text-align: right'>در صورتی که درخواست حریف می طلبم کنسل شود این متد فراخوانی می شود</div>
         * @param  data
         *  <ul>
         *     <li>{String} leagueId شناسه لیگ</li>
         *     <li>{String} message  پیام مربوط به کنسل شدن درخواست</li>
         *  </ul>
         */
        public abstract void onAccept(JSONObject data);

}
