/**
 * @class MessageUI
 * @module ServiceUI
 * @submodule ServiceUI
 *
 * */
TIS.MessageUI = function (options) {
    /*==================================================================================================================
     *                                      P R I V A T E   V A R I A B L E
     *================================================================================================================*/

    var __self = this,
        __parent = options.parent,
        __dic = options.dictionary,
        __lang = options.language,
        __globalConfig = options.config,
        __visibility = false,
        __isMinimize = false,
        __backgroundColors = ["cadetblue"/*,"chocolate"*/, "steelblue", "cornflowerblue", "darkcyan", "slategray", "slateblue", "teal"],
        __baseColor = "#faf4e3",
        __lastColor,
        __containerElm, __headerContainerElm, __contentContainerElm,
        __minmaximizeElm, __notContentContainerElm,
        __slider,
        __slideCount = 0,
        __visibleSlideNumber = "0",

        __messagesData = {},
        __messageTypes = {
            offlineRequest: 1,
            onlineRequest: 2,
            notification: 3
        },
        __BtnColor = (options.config && options.config.buttonBackgroundColor) || "#1cb7d4",
        __onlineRequestRejectType = {
            0: {
                EN: "user not accept your request",
                FA: "باشه , بازی می کنم"
            },
            1: {
                EN: "user not accept your request",
                FA: "الان دارم بازی می کنم"
            },
            2: {
                EN: "user not accept your request",
                FA: "خودم میام درخواست می دم"
            },
            3: {
                EN: "user not accept your request",
                FA: "همش منو بردی , دیگه باهات بازی نمی کنم"
            },
            4: {
                EN: "user not accept your request",
                FA: "الان حال ندارم"
            },
            5: {
                EN: "user not accept your request",
                FA: "امروز خیلی باهات بازی کردم‌"
            },
            6: {
                EN: "no",
                FA: "بازی نمی کنم"
            }
        };

    /*==================================================================================================================
     *                                   P U B L I C    V A R I A B L E
     *================================================================================================================*/


    /*==================================================================================================================
     *                                   P R I V A T E     M E T H O D
     *================================================================================================================*/

    var __init = function () {
            __initView();
            __contentContainerElm = __containerElm.find("#TIS_message_content");
            __notContentContainerElm = __containerElm.find("#TIS_message_notContent");
            __headerContainerElm = __containerElm.find("#TIS_message_header");
            // __minmaximizeElm = $("#TIS_message_minmaximize");

            __initEvent();

        },

        __hide = function () {
            __containerElm.hide();
            __visibility = false;

            return __self;
        },

        __show = function () {

            if (!__visibility) {
                __containerElm.show();
            }


            if (__slideCount == 0) {
                __notContentContainerElm.show();
                __contentContainerElm.hide();
            } else {
                __notContentContainerElm.hide();
                __contentContainerElm.show();
            }

            if (__isMinimize) {
                __maximizeAction();
            }

            __visibility = true;
            return __self;
        },

        __removeAllMessage = function () {
            __slider.removeAll();
            __slideCount = 0;
            __visibleSlideNumber = "0";
            __messagesData = {};
            __hide();
        },

        __minimizeAction = function () {
            __isMinimize = true;
            var backColor = __contentContainerElm.find("div[slideNumber=" + __visibleSlideNumber + "]").css("background-color");


            if (!backColor) {
                backColor = __notContentContainerElm.css("background-color");
                ;
            }
            __headerContainerElm
                .css({
                    width: "3em",
                    height: "100%",
                    position: "absolute",
                    left: "0",
                    "backgroundColor": backColor
                })
                .parent().css({
                width: "3em"
            });
            __contentContainerElm.hide();
            __notContentContainerElm.hide();

            // __minmaximizeElm.removeClass("tis-minus").addClass("tis-plus");
        },

        __maximizeAction = function () {
            __isMinimize = false;
            __contentContainerElm.show();
            __headerContainerElm
                .css({
                    width: "",
                    height: "",
                    position: "",
                    left: "",
                    "backgroundColor": ""
                })
                .parent().css({
                width: "100%"
            });


            if (__slideCount == 0) {
                __notContentContainerElm.show();
                __contentContainerElm.hide();
            } else {
                __notContentContainerElm.hide();
                __contentContainerElm.show();
            }

            // __minmaximizeElm.removeClass("tis-plus").addClass("tis-minus");
        },

        __removeMessage = function (slideNumber) {

            if (!__messagesData[slideNumber]) {
                return;
            }
            delete __messagesData[slideNumber];
            __slider.remove(slideNumber);
            __slideCount -= 1;
            if (__slideCount == 0) {
                __hide();
            }

        },

        __createOfflineRequestView = function (params) {

            var messageContent = params.content,
                isFromDB = params.isFromDB,
                messageId = params.messageId;

            var spn;
            if (messageContent.image) {
                var url = __parent.getService().generateImageSrc(messageContent.image);

                spn = "<span class='img-responsive img-circle' style='background: url(" + url + ")no-repeat center center;height:4em;width:4em;background-size: contain;margin:auto' ></span>";
            } else {
                spn = "<span class='tis tis-4x tis-user' style='margin:auto'></span>";
            }


            var index = TIS.Util.generateRandomInt(0, __backgroundColors.length - 1);

            var color = __backgroundColors[index];
            // if(color == __lastColor) {
            //     if(index == 0) {
            //         index += 1;
            //     }
            //     if(index == __backgroundColors.length-1) {
            //         index -= 1;
            //     }
            //
            //     __lastColor =  __backgroundColors[index];
            // } else {
            //     __lastColor = color;
            // }

            var requestTimeView = "";

            if (typeof messageContent.reqestTime == "number" && messageContent.reqestTime > 0) {
                var mDate = new Date(messageContent.reqestTime),
                    jDate = TIS.Util.miladiToShamsi(mDate.getFullYear(), mDate.getMonth() + 1, mDate.getDate()),
                    fromNow = moment(mDate).fromNow();

                var timeView = mDate.getMinutes() + "&nbsp&nbsp:&nbsp&nbsp" + mDate.getHours() + "&nbsp&nbsp" + "--&nbsp&nbsp" + jDate.d + "&nbsp&nbsp/&nbsp&nbsp" + jDate.m + "&nbsp&nbsp/&nbsp&nbsp" + jDate.y + "&nbsp&nbsp(" + fromNow + ")";
                requestTimeView = __dic.REQUESTTIME[__lang] + "&nbsp&nbsp:&nbsp&nbsp" + timeView;
            } else {
                requestTimeView = __dic.REQUESTTIME[__lang] + "&nbsp&nbsp:&nbsp&nbsp" + "--";
            }

            var actionView = "";
            var disableClass = "";
            if (isFromDB) {
                disableClass = "TIS_disable";
            }
            actionView = "\
                    <div class='row' style='margin-top: 0.4em;z-index: 10'>\
                        <i class='tis tis-floppy TIS-orangeColor " + disableClass + "' style='font-size:1.5em;cursor: pointer'></i>\
                        <i class='tis  tis-trash-empty TIS-orangeColor' style='font-size:1.5em;padding-right: 1.4em;cursor: pointer'></i>\
                    </div>\
                ";

            var contentViw = "\
                <div style='height:100%;width:100%;position:absolute;background-color:" + __lastColor + "'>\
                    <div style='position:absolute;width: 100%;height: 100%;display:table;'>\
                        <div class='row' style='text-align: center;vertical-align:middle;display: table-cell'>\
                            <div class='col-lg-1 col-md-1 col-sm-1 col-xs-12'></div>\
                            <div class='col-lg-1 col-md-1 col-sm-1 col-xs-12'>\
                                " + spn + "\
                            </div>\
                            <div class='col-lg-8 col-md-8 col-sm-8 col-xs-12' style='font-size: 1.3em'>\
                                <div class='row'>" + __dic.APLICANT[__lang] + "&nbsp&nbsp:&nbsp&nbsp" + messageContent.name + "</div>\
                                <div class='row'>" + __dic.GAME[__lang] + "&nbsp&nbsp:&nbsp&nbsp" + messageContent.gameName + "</div>\
                                <div class='row'>" + __dic.LEAGUE[__lang] + "&nbsp&nbsp:&nbsp&nbsp" + messageContent.leagueName + "</div>\
                                " + requestTimeView + "\
                                " + actionView + "\
                            </div>\
                            <div class='col-lg-1 col-md-1 col-sm-1 col-xs-12'></div>\
                            <div class='col-lg-1 col-md-1 col-sm-1 col-xs-12'></div>\
                    </div>\
                </div>\
            ";


            var elm = $(contentViw);
            var slideId = __slider.add(elm);
            __messagesData[slideId] = params;

            elm.find("i.tis-trash-empty").on("click", function () {
                __removeMessage(slideId);
                if (isFromDB) {
                    __parent.deleteMessage({messageId: messageId});
                }
            });

            if (!isFromDB) {
                elm.find(".tis-floppy").on("click", function () {
                    var $self = $(this);
                    if ($self.hasClass("TIS_disable")) {
                        return;
                    }

                    $self.addClass("TIS_disable");
                    __parent.saveMessage({
                        messageId: messageId
                    }, function (res) {
                        if (res.hasError) {
                            $self.removeClass("TIS_disable");
                        } else {
                            isFromDB = true;
                        }
                    });
                });
            }

        },

        __createOnlineRequestView = function (params) {

            var spn;


            var imageUrl;

            if(typeof params.imageUrl === "string") {
                imageUrl = params.imageUrl;

            } else if(typeof params.image === "object" && params.image !== null) {
                imageUrl = __parent.getService().generateImageSrc(params.image);
            }

            if (imageUrl) {
                spn = "<div style='background: white url(" + imageUrl + ")no-repeat center center;background-size: cover;width:80px;height: 80px;border-radius: 40px;margin-top: -40px;display: inline-block;border: 2px solid #fdd460;'></div>";
            } else {
                var index = TIS.Util.generateRandomInt(0, __backgroundColors.length - 1);

                var color = __backgroundColors[index];
                spn = "\
                <div style='width:80px;height: 80px;border-radius: 40px;margin-top: -40px;display: inline-block;padding-top: 15px;background:" + color + ";'>\
                    <div style='display:table;text-align: center;width:inherit'>\
                        <span style='font-size: 40px;color:white;display: table-cell;vertical-align:middle'>" + params.name[0] + "</span>\
                    </div>\
                </div>\
                ";
            }

            // var index = TIS.Util.generateRandomInt(0, __backgroundColors.length - 1);
            //
            // var color = __backgroundColors[index];
            // if(color == __lastColor) {
            //     if(index == 0) {
            //         index += 1;
            //     }
            //     if(index == __backgroundColors.length-1) {
            //         index -= 1;
            //     }
            //     __lastColor =  __backgroundColors[index];
            // } else {
            //     __lastColor = color;
            // }


            var moreInfo = "";
            if(__globalConfig && __globalConfig.userMoreInfo) {
                moreInfo = "\
                <div style='width: 1em;height: 1em;background-color: white;border-radius: 100%;display: inline-block'>\
                    <i class='tis  tis-info-circled-1' style='color: rgb(28, 183, 212);'></i>\
                </div>\
            ";
            }


            var confirmBtnContent = "\
                    <div \
                        class='TIS-pointer TIS-message-confirm' \
                        style='background: "+__BtnColor+";'>\
                        <span style='display: table-cell;vertical-align: middle'><i class='tis tis-2x tis-play TIS-flip'></i></span>\
                    </div>\
                ";
            var contentViw = "\
            <div style='display:none;height:100%;width:100%;position:absolute;background-color:" + __baseColor + "'>\
                <div style='position:absolute;width: 100%;height: 100%;display:table'>\
                        <div style='text-align: center;'>" + spn + "</div>\
                        <div class='row' style='text-align: center;'>\
                            <div class='col-lg-12 col-md-12 col-sm-12 col-xs-12' style='font-size: 1.3em'>\
                                <div TISData='MORE_INFO' class='row ' style='padding-top: 10px;font-weight: bold'>\
                                 "+moreInfo+"\
                                " + params.name + "\
                                </div>\
                                <div class='row' style='padding-top: 10px;font-size: smaller'>" + __dic.MATCH_REQUEST_IN[__lang].replace("$VAR", "<span style='color: #2a6496'>" + params.leagueName + "</span>") + "</div>\
                                <div class='row' style='margin-top: 20px'>\
                                    <div class='col-lg-12 col-md-12 col-sm-12 col-xs-12' style='margin-top: 5px'>\
                                        <div class='col-lg-3 col-md-3 col-sm-2 col-xs-1'></div>\
                                        <div class='col-lg-6 col-md-6 col-sm-8 col-xs-10'>\
                                            <div style='max-width: 300px;margin: 0 auto'>\
                                                <select TIS_type = 'TIS_SELECT' class='form-control'  style='z-index: 1065;padding-top: 0;padding-bottom: 0; width: 96%'>\
                                                    <option value='0' >" + __onlineRequestRejectType["0"][__lang] + "</option>\
                                                    <option value='6' >" + __onlineRequestRejectType["6"][__lang] + "</option>\
                                                    <option value='1' >" + __onlineRequestRejectType["1"][__lang] + "</option>\
                                                    <option value='2' >" + __onlineRequestRejectType["2"][__lang] + "</option>\
                                                    <option value='3' >" + __onlineRequestRejectType["3"][__lang] + "</option>\
                                                    <option value='4' >" + __onlineRequestRejectType["4"][__lang] + "</option>\
                                                    <option value='5' >" + __onlineRequestRejectType["5"][__lang] + "</option>\
                                                </select>\
                                                " + confirmBtnContent + "\
                                            </div>\
                                        </div>\
                                        <div class='col-lg-3 col-md-3 col-sm-2 col-xs-1'></div>\
                                    </div>\
                                </div>\
                            </div>\
                        </div>\
                </div>\
            </div>\
            ";

            var elm = $(contentViw);
            var slideId = __slider.add(elm);
            __messagesData[slideId] = params;


            var $BTN = elm.find(".TIS-message-confirm");
            $BTN.on("click", function () {
                if (!__messagesData[slideId]) {
                    return;
                }

                elm.find("select").addClass("TIS_disable");
                $BTN
                    .addClass("tis-spin TIS_disable")
                    .find("span")
                    .addClass("tis-spin")
                    .css("animation-direction", "reverse");
                
                function res(res) {
                    if (res.hasError) {
                        __parent.alert(res.errorMessage);
                    }
                    __removeMessage(slideId);
                }

                var data = {
                    name: __parent.getUserData().name,
                    onResult: res
                };

                var selectVal = elm.find("select[TIS_type =TIS_SELECT]").val();

                if (selectVal != "0") {
                    data.state = false;
                    data.rejectMessage = __onlineRequestRejectType[selectVal][__lang];
                } else {
                    data.state = true;
                }

                __messagesData[slideId].res(data);

            });

            elm.find("div[TISData='MORE_INFO']").on("click", function () {
                if(__globalConfig.userMoreInfo) {
                    __parent.fireEvent("userMoreInfo", {
                        userId: params.id,
                        name: params.name,
                        image: params.image,
                        leagueId: params.leagueId,
                        fromType: 2
                    });
                }

            });
            /*
             *       after n sec  check request if exist , delete the request and
             *       enable user button
             *
             * */
            setTimeout(function () {
                if(__messagesData[slideId]) {
                    __removeMessage(slideId);
                }
            }, __parent.getRequestTimeout()-5000);

            return slideId;
        },

        __createNotificationView = function (params) {

            var messageContent = params.content,
                isFromDB = params.isFromDB,
                messageId = params.messageId;

            var spn = "";
            if (messageContent.icon) {
                spn = "<div style='background: white url(" + messageContent.icon + ")no-repeat center center;width:80px;height: 80px;border-radius: 40px;margin-top: -40px;display: inline-block;'></div>";
            }


            // var index = TIS.Util.generateRandomInt(0, __backgroundColors.length - 1);
            //
            // var color = __backgroundColors[index];
            // if(color == __lastColor) {
            //     if(index == 0) {
            //         index += 1;
            //     }
            //     if(index == __backgroundColors.length-1) {
            //         index -= 1;
            //     }
            //
            //     __lastColor =  __backgroundColors[index];
            // } else {
            //     __lastColor = color;
            // }
            var timeout;
            var scrollMaxHeight= "6.5em";
            var actionView = "";

            if (typeof messageContent.timeout == "number") {

                timeout = messageContent.timeout;
                //if(messageContent.timeout == 0) {
                //    timeout = 1000;
                //}
                scrollMaxHeight = "8.5em";
            }

            if (!timeout || isFromDB) {
                //scrollMaxHeight = "8.5em";
                var disableClass = "";
                if (isFromDB) {
                    disableClass = "TIS_disable";
                }
                actionView = "\
                    <div  style='margin-top: 0.4em;z-index: 10'>\
                        <i class='tis tis-floppy TIS-orangeColor " + disableClass + "' style='font-size:1.5em;cursor: pointer'></i>\
                        <i class='tis tis-trash-empty TIS-orangeColor' style='font-size:1.5em;padding-right: 1.4em;cursor: pointer'></i>\
                    </div>\
                ";
            }

            var contentViw = "\
                <div style='display:none;height:100%;width:100%;position:absolute;background-color:" + __baseColor + "'>\
                    <div style='position:absolute;width: 100%;height: 100%;'>\
                        <div style='text-align: center;'>" + spn + "</div>\
                        <div style='text-align: center;'>\
                            <div class='col-lg-12 col-md-12 col-sm-12 col-xs-12 TIS-message-click' style='font-size: 1em;cursor: pointer;'>\
                                <div  TIS-Data='TITLE' style='font-size: 1.5em;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;' >" + messageContent.title + "</div>\
                                <div class=' TIS_scroll'  TIS-Data='MESSAGE' style='max-height: " + scrollMaxHeight + ";overflow-y: auto;overflow-x:hidden;z-index: 1000;margin-top: 1em'>\
                                    <p>\
                                        " + messageContent.message + "\
                                    </p>\
                                </div>\
                                " + actionView + "\
                            </div>\
                        <div>\
                    </div>\
                </div>\
            ";

            var elm = $(contentViw);
            var slideId = __slider.add(elm);
            __messagesData[slideId] = params;

            if (!timeout || isFromDB) {
                elm.find("i.tis-trash-empty").on("click", function (e) {
                    __removeMessage(slideId);
                    if (isFromDB) {
                        __parent.deleteMessage({messageId: messageId});
                    }
                    messageContent.onRemove();

                    return false;
                });

                if (!isFromDB) {
                    elm.find(".tis-floppy").on("click", function (e) {
                        var $self = $(this);
                        if ($self.hasClass("TIS_disable")) {
                            return;
                        }
                        $self.addClass("TIS_disable");
                        __parent.saveMessage({
                            messageId: messageId
                        }, function (res) {
                            if (res.hasError) {
                                $self.removeClass("TIS_disable");
                            } else {
                                isFromDB = true;
                            }
                        });
                        return false;
                    });
                }
            } else {
                if (timeout) {
                    setTimeout(function () {
                        if (__messagesData[slideId]) {
                            __removeMessage(slideId);
                        }
                    }, timeout);
                }
            }

            elm.find(".TIS-message-click").on("click", function () {
                messageContent.onClick && messageContent.onClick();
            });

            return slideId;
        },

        __initView = function () {
            var content = "\
                <div id='TIS_message_container'>\
                    <div id='TIS_message_header' >\
                        <i id='TIS_message_close' class='tis tis-2x tis-close-circle TIS-orangeColor'   style='position: absolute;left: 10px;top:10px;z-index: 4;cursor: pointer;color:#1cb7d4;font-weight: bold'></i>\
                        <div id='TIS_message_minmaximize' class='tis tis-2x tis-minus TIS-orangeColor'   style='display:none;position:absolute;left: 10px;top:40px;z-index: 4;cursor: pointer'></div>\
                    </div>\
                    <div id='TIS_message_content' style='width:100%;height: 100%'></div>\
                    <div id='TIS_message_notContent' class='demo-slides' style='background-color:"+__baseColor+";width:100%;height: 100%;display: table;text-align: center;vertical-align: middle'>\
                        <span style='font-size: 2em;display: table-cell;vertical-align: middle'>" + __dic.NOTMESSAGEEXIST[__lang] + "</span>\
                    </div>\
                </div>\
            ";
            __containerElm = $(content)
                .appendTo(document.body);

            __slider = __containerElm.find("#TIS_message_content").tisSlide({});
        },

        __initEvent = function () {
            $("#TIS_message_close").on("click", function () {
                __hide();
            });

            // __minmaximizeElm.on("click", function() {
            //     if($(this).hasClass("tis-minus")) {
            //         __minimizeAction();
            //     } else {
            //         __maximizeAction();
            //     }
            // });

            __slider.on("change", function (e) {
                __visibleSlideNumber = e.in.slideNumber;
            });

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
     * @event  onRequest
     * @protected
     *
     * @param {Object} params
     *     @param {Number} params.type
     *     @param {Object} params.content
     *
     **/
    __self.onRequest = function (params) {
        __slideCount += 1;
        __show();

        switch (params.type) {
            // case __messageTypes.offlineRequest :
            //     __createOfflineRequestView(params);
            //     break;

            case __messageTypes.onlineRequest :
                var messageContent = params.content;

                var viewData = {
                    type: params.type,
                    gameName: messageContent.gameName,
                    name: messageContent.name,
                    id: messageContent.id,
                    leagueId: messageContent.leagueId,
                    leagueName: messageContent.leagueName,
                    res: messageContent.res,
                    image: messageContent.image,
                    imageUrl: messageContent.imageUrl
                };
                __createOnlineRequestView(viewData);
                break;

            case __messageTypes.notification :
                __createNotificationView(params);
                break;
        }


    };

    /**
     * @method show
     * @public
     * @chainable
     *
     * */
    __self.show = function () {
        if (!__visibility) {
            __show();
        } else {
            __hide();
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
    __self.hide = __hide;

    /**
     * @method toggle
     * @public
     * @chainable
     *
     * */
    __self.toggle = function () {

        if (__visibility) {
            __hide();
        } else {
            __show();
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
    
    __self.onLogout = function () {
        __removeAllMessage();
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