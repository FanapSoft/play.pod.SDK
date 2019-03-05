/**
 * @class UpdateUI
 * @module ServiceUI
 * @submodule ServiceUI
 *
 * */
TIS.UpdateUI = function (options) {

    var __self = this,
        __parent = options.parent,
        __dic = options.dictionary,
        __lang = options.language,
        __globalConfig = options.config,
        __ownConfig = __globalConfig && __globalConfig.updateUI,
        __animate = false,
        __progressElm,
        __installBTNElm,
        __visibility = false,
        __onHideCallback,
        __updateGameCenter = false,
        __downloadLink,
        __packageName,
        __BtnColor = (__globalConfig && __globalConfig.buttonBackgroundColor) || "#1cb7d4",
        __isApp = TIS.Util.isApp();

    var __init = function () {

            if(__ownConfig && typeof __ownConfig.animate === "boolean") {
                __animate = __ownConfig.animate;
            }
            else if(__globalConfig && typeof __globalConfig.animate === "boolean") {
                __animate = __globalConfig.animate;
            }

            __initView();

            __installBTNElm = $("#TIS_update_install");
            __progressElm = $(".progress-bar");
            __initEvent();

        },

        __initView = function () {

            var text;
            if (__isApp) {
                text = __dic.RECEIVE_NEW_VERSION[__lang];
            } else {
                text = __dic.RECEIVE_ANDROID_APK[__lang];
            }


            var style = '';

            if(__animate) {
                style = 'transform : translateX(calc(100%));-webkit-transform : translateX(calc(100%))';
            } else {
                style = 'display : none';
            }


            var registerElm = "\
            <div  id='TIS_update_container' style='"+style+"'>\
                <div class='TIS-content'>\
                    <div style='background-color:#faf4e3'>\
                        <span id='TIS_update_close' class='tis tis-close tis-2x TIS-pointer' style='margin: 10px;color: " + __BtnColor + ";font-weight: bold'></span>\
                        <!--<span  class='tis tis-down-circle tis-2x TIS-pointer' style='position:absolute;left:-43px;margin-top: -4px;color: rgba(165, 162, 162, 0.49);font-size: 95px;'></span>-->\
                        <div id='TIS_update_message_container' class='row' style='margin: 15px 53px 0;;text-align: center;font-weight: bold'></div>\
                        <div id='TIS_update_gameData_Container' class='row TIS-updateUI-margin' style='padding-top:30px'>\
                            <div class='col-lg-5 col-md-5 col-sm-5 col-xs-6' style='padding-right: 0;padding-left: 0'>\
                                <img id='TIS_update_image' src='' style='width: 100px'>\
                            </div>\
                            <div class='col-lg-7 col-md-7 col-sm-7 col-xs-6' style='font-weight: bold;padding-right: 0;padding-left: 0'>\
                                <div style='padding-top: 20px'>" + __dic.CURRENTVERSION[__lang] + "&nbsp : &nbsp<i id='TIS_update_currentVersion'></i></div>\
                                <div style='padding-top: 20px'>" + __dic.LASTVERSION[__lang] + "&nbsp : &nbsp<i id='TIS_update_lastVersion'></i></div>\
                            </div>\
                        </div>\
                        <div class='row TIS-updateUI-margin' style='padding-top: 30px'>\
                            <div\
                                id='TIS_update_install'\
                                class='TIS-pointer TIS_disable TIS-BTN' \
                                style='margin:25px auto;width:80%;max-width:400px;background-color: " + __BtnColor + "'>\
                                <span style='display: table-cell;vertical-align: middle;font-size: 20px;'> " + text + "</span>\
                            </div>\
                        </div>\
                        <div class='row TIS-updateUI-margin' style='padding-top: 10px;display: none'>\
                            <div class='progress' >\
                                <div class='progress-bar' role='progressbar' aria-valuenow='60' aria-valuemin='0' aria-valuemax='100' style='width: 0%;float: left'>\
                                    <span class=''>0%</span>\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
            </div>";

            $(registerElm).appendTo(document.body).modal("hide");
        },

        __alert = function (message, isPositive) {

            if (message != undefined) {
                if (isPositive) {
                    __parent.info(message);
                } else {
                    __parent.alert(message);
                }
            }
        },

        __initEvent = function () {

            __installBTNElm.on("click", function () {
                var $BTN = $(this),
                    span = __progressElm.find("span"),
                    value;

                if (__isApp) {

                    if (__updateGameCenter) {

                        TIS.Plugin.isAppExist(__parent.getConfig().gameCenterPackageName,
                            function () {

                                TIS.Plugin.startActivity({
                                        action: TIS.Plugin.ACTION_VIEW,
                                        url: "bazitech://update",
                                        packageName : __parent.getConfig().gameCenterPackageName
                                    },
                                    function () {},
                                    function () {}
                                );

                            }, function () {
                                $BTN.addClass("TIS_disable");

                                function endAction() {
                                    $BTN.removeClass("tis-spin4");
                                    __progressElm.closest(".row").hide();
                                    span.html("");
                                    $BTN.removeClass("TIS_disable");
                                }

                                __parent.updateApp({
                                    downloadLink: __downloadLink
                                }, {
                                    onStart: function () {
                                        //console.log("onStart");
                                        $BTN.addClass("tis-spin4");
                                        __progressElm.closest(".row").show();
                                    },
                                    onFail: function (params) {
                                        //console.log("onFail");
                                        __alert(params.errorMessage, false);
                                        endAction();
                                    },
                                    onLoad: function () {
                                        //console.log("onLoad");
                                        endAction();
                                    },
                                    onProgress: function (params) {
                                        value = params.loaded + "%";
                                        __progressElm.css("width", value);
                                        span.html(value);
                                    }
                                });
                            });


                    } else {
                        TIS.Plugin.gameUI({
                                gameId : __parent.getService().getRegisterGamesId()[0]
                            },
                            function () {},
                            function () {}
                        );
                    }

                } else {
                    TIS.Util.openUrl(__downloadLink);
                }
            });

            $("#TIS_update_close").on("click", function () {
                __self.hide();
            })
        },

        __initUi = function (lastVersion, message) {

            if (typeof  message === "string") {
                $("#TIS_update_message_container").text(message);
            } else {
                $("#TIS_update_message_container").text("");
            }

            $("#TIS_update_gameName_loading").show();

            if (__updateGameCenter) {

                $("#TIS_update_gameData_Container").hide();
                __packageName = undefined;
                __downloadLink = __parent.getService().getConfig().gameCenterDownloadLink;
                __installBTNElm.removeClass("TIS_disable");
                // __parent.getLauncherDownloadLink(function (result) {
                //     $("#TIS_update_gameName_loading").hide();
                //
                //     if (result.hasError) {
                //         __alert(result.errorMessage, false);
                //         __installBTNElm.addClass("TIS_disable");
                //     } else {
                //         __downloadLink = result.result.url;
                //         __installBTNElm.removeClass("TIS_disable");
                //
                //     }
                // });

            } else {
                __parent.getGamesInfo({registerGame: true}, function (result) {
                    $("#TIS_update_gameName_loading").hide();
                    if (result.hasError) {
                        __alert(result.errorMessage, false);
                    } else {

                        $("#TIS_update_gameData_Container").show();

                        var gamesInfo = result.result;

                        if (gamesInfo && gamesInfo.length>0) {
                            var info = gamesInfo[0];
                            var compareData = TIS.Util.compareVersion(info.lastVersion, info.currentVersion);

                            __downloadLink = info.downloadLink;
                            __packageName = info.packageName;

                            if (compareData.isGreater || !__isApp) {
                                __installBTNElm.removeClass("TIS_disable");
                            } else {
                                __installBTNElm.addClass("TIS_disable");
                            }

                            if (info.name) {
                                $("#TIS_update_currentVersion").html(info.currentVersion);
                                $("#TIS_update_lastVersion").html(info.lastVersion);


                                var imageUrl = null;
                                if(typeof info.imageUrl === "string") {
                                    imageUrl = info.imageUrl
                                } else if(typeof info.image === "object" && info.image!== null) {
                                    imageUrl = __parent.getService().generateImageSrc(info.image)
                                }
                                $("#TIS_update_image").attr("src", imageUrl);
                            } else {
                                console.error(" is not register in game center!");
                            }
                        }
                    }
                });
            }

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
        };


    /*==================================================================================================================
     *                                 P R O T E C T E D     M E T H O D
     *================================================================================================================*/

    /**
     * @method show
     * @public
     * @chainable
     *
     * */
    __self.show = function (params) {

        if (!__visibility) {
            __visibility = true;

            var lastVersion, message;
            if (params) {
                __onHideCallback = params.onHide;

                if (params.lastVersion) {
                    lastVersion = params.lastVersion;
                }
                if (typeof params.message === "string") {
                    message = params.message;
                } else {
                    message = undefined;
                }

                if (typeof params.updateGameCenter === "boolean") {
                    __updateGameCenter = params.updateGameCenter;
                } else {
                    __updateGameCenter = false;
                }
            } else {
                __updateGameCenter = false;
            }
            __initUi(lastVersion, message);

            if(__animate) {
                setTimeout(function () {
                    $("#TIS_update_container")
                        .css({
                            "transform": "translateX(0)",
                            "-webkit-transform": "translateX(0)"
                        });
                },1);

                setTimeout(function () {
                    $("#TIS_update_container")
                        .addClass("TIS-black-back");
                },700);

            } else {
                $("#TIS_update_container")
                    .addClass("TIS-black-back")
                    .css({display: "table"});
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
        if (__visibility) {
            __visibility = false;

            if(__animate) {
                $("#TIS_update_container")
                    .removeClass("TIS-black-back")
                    .css({
                        "transform": "translateX(calc(100%))",
                        "-webkit-transform": "translateX(calc(100%))"
                    });
            } else {
                $("#TIS_update_container")
                    .removeClass("TIS-black-back")
                    .css({display: "none"});
            }

            if (typeof __onHideCallback == "function") {
                __onHideCallback();
                __onHideCallback = undefined;
            }

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

    __self.backButton = function () {
        if (__visibility) {
            __self.hide();
            return true;
        }
        return false;
    };


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

    __init();
};