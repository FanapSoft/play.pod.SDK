/**
 * @class PopupUI
 * @module ServiceUI
 * @submodule ServiceUI
 *
 * */
TIS.WebViewUI = function (options) {
    /*==================================================================================================================
     *                                      P R I V A T E   V A R I A B L E
     *================================================================================================================*/
    var __self = this,
        __parent = options.parent,
        _popupRef,
        __callback,
        __onCloseCallback,
        __visibility = false;

    /*==================================================================================================================
     *                                   P U B L I C    V A R I A B L E
     *================================================================================================================*/


    /*==================================================================================================================
     *                                   P R I V A T E     M E T H O D
     *================================================================================================================*/

    var __init = function () {
            // __initView();
            __initEvent();
        },

        __initView = function () {
            var content = "\
            <div id='TIS_webView_container' class='TIS-black-back'>\
                <div style='display: table;width: 100%;height: 100%'>\
                    <div  style='display: table-cell;vertical-align:middle;text-align: center' >\
                        <div class='col-lg-4 col-md-3 col-sm-2 '></div>\
                        <div class='col-lg-4 col-md-6 col-sm-8 col-xs-12 ' style='background-color:#faf4e3;padding: 0' >\
                            <div>\
                                <span id='TIS_webView_close' class='tis tis-close-circle tis-2x TIS-pointer' style='color: " + __BtnColor + ";'></span>\
                            </div>\
                             <i class='tis tis-3x tis-spin4 tis-spin' style='position: absolute;left: 0;right: 0;top:150px'></i>\
                            <iframe src='' style='width: 100%;height: 500px;border: none'></iframe>\
                        </div>\
                        <div class='col-lg-4 col-md-3 col-sm-2 '></div>\
                    </div>\
                </div>\
            </div>\
        ";

            $(content).appendTo(document.body);
        },

        __initEvent = function () {

            $("#TIS_webView_close").on("click", function () {
                __self.hide();
            });


            window.addEventListener("message", function (e) {
                try {
                    console.log("popup_message",e.data);
                    // ref.close();
                    var result = e.data;

                    // __self.hide();

                    if (typeof __callback === "function") {
                        __callback(result);
                        // __callback = undefined;
                    }
                } catch (e) {

                }
            }, false);
        },

        __visibilityFN = function (visibility) {

            if (typeof visibility == "boolean") {
                if (visibility) {
                    __self.show();
                } else {
                    __self.hide();
                }
            }
            return __visibility;
        },

        __popupCenter = function (url) {

            // var popupContainer = $("#TIS_webView_container"),
            //     $iframe = popupContainer.find("iframe"),
            //     $loading = popupContainer.find(".tis-spin4");
            // $loading.show();
            //
            // window.addEventListener("message", function (e) {
            //     try {
            //         var result = JSON.parse(e.data);
            //         __self.hide();
            //
            //         if (typeof __callback === "function") {
            //             __callback(result);
            //             __callback = undefined;
            //         }
            //     } catch (e) {
            //
            //     }
            // }, false);
            //
            // $iframe[0].onload = function (a) {
            //     $loading.hide();
            // };
            //
            // $iframe.attr("src", url);
            // popupContainer.show();

            var w = 500;
            var h = 700;

            var dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : screen.left;
            var dualScreenTop = window.screenTop !== undefined ? window.screenTop : screen.top;

            var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
            var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

            var left = ((width / 2) - (w / 2)) + dualScreenLeft;
            var top = ((height / 2) - (h / 2)) + dualScreenTop;

            _popupRef = window.open (url,"mywindow",'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

            if(!_popupRef) {
                __parent.alert("اجازه باز کردن پاپ آپ در مرورگر خود را فعال نماییپ");
                return;
            }
            var pollTimer = window.setInterval(function() {
                if (_popupRef.closed !== false) {
                    window.clearInterval(pollTimer);
                    __onCloseCallback && __onCloseCallback();
                }
            }, 1000);

        };

    /*==================================================================================================================
     *                                 P R O T E C T E D     M E T H O D
     *================================================================================================================*/

    /*==================================================================================================================
     *                                 P U B L I C     M E T H O D
     *================================================================================================================*/

    /**
     * @method show
     * @public
     * @chainable
     *
     * */
    __self.show = function (params) {
        __visibility = true;


        __popupCenter(
            params.url,
            "TEST",
            500,
            600
        );
        if (typeof params === "object") {

            if (typeof params.callback === "function") {
                __callback = params.callback;
            }

            if (typeof params.onClose === "function") {
                __onCloseCallback = params.onClose;
            }
        }

        return __self;

    };

    /**
     * @method hide
     * @public
     * @chainable
     *
     *
     *
     * */
    __self.hide = function () {
        __visibility = false;

        // $("#TIS_webView_container")
        //     .hide()
        //     .find("iframe").attr("src", "");

        if(_popupRef) {
            _popupRef.close();
        }
        return __self;
    };

    /**
     * @method visibility
     * @public
     *
     * @param  {Boolean} visibility
     * @return {Boolean} visibility
     * */
    __self.visibility = __visibilityFN;

    /**
     * @method toggle
     * @public
     * @chainable
     *
     * */
    __self.toggle = function () {

        if (__visibility) {
            __self.hide();
        } else {
            __self.show();
        }
        return __self;
    };

    __self.backButton = function () {
        if (__visibility) {
            __self.hide();
            return true;
        }
        return false;
    };

    __init();
};