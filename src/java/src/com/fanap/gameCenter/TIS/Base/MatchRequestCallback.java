package com.fanap.gameCenter.TIS.Base;

import org.json.JSONObject;

/**
 *<div style='width: 100%;text-align: right'>اعلام نتیجه درخواست مسابقه</div>
 * */
public abstract class MatchRequestCallback {

        /**
         *
         *<div style='width: 100%;text-align: right'> بعد از اعلام درخواست به سرور این متد فراخوانی می شود</div>
         * @param  result
         *  <ul>
         *      <li>{Boolean} hasError</li>
         *      <li>{String} errorMessage</li>
         *      <li>{Integer} errorCode</li>
         *      <li>{JSONObject} result
         *              <ul>
         *                <li>{String} requestId شناسه درخواست</li>
         *              </ul>
         *       </li>
         *  </ul>
         */
        public abstract void onResult(JSONObject result);

        /**
         *<div style='width: 100%;text-align: right'> در صورت پذیرش درخواست مسابقه این متد فراخوانی می شود </div>
         *
         * @param  data
         *  <ul>
         *     <li>{String} requestId شناسه درخواست</li>
         *  </ul>
         */
        public void onAccept(JSONObject data){}

        /**
         *<div style='width: 100%;text-align: right'>  در صورت رد درخواست مسابقه این متد فراخوانی می شود </div>
         * @param  data
         *  <ul>
         *     <li>{String} requestId شناسه درخواست</li>
         *     <li>{String} rejectMessage پیام رد درخواست</li>
         *  </ul>
         */
        public void onReject(JSONObject data){}

        /**
         *<div style='width: 100%;text-align: right'> در صورت کنسل شدن درخواست مسابقه این متد فراخوانی می شود </div>
         * @param  data
         *  <ul>
         *     <li>{String} requestId شناسه درخواست</li>
         *  </ul>
         */
        public void onCancel(JSONObject data){}
}
