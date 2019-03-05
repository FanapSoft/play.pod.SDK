/*
 * @class ChatUI
 * @module ServiceUI
 * @submodule ServiceUI
 *
 * */
TIS.ChatUI = function (options) {
    /*==================================================================================================================
     *                                      P R I V A T E   V A R I A B L E
     *================================================================================================================*/
    var __self = this,
        __dic = {
            "WRITEMESSAGEHERE": {
                "EN": "write message here!...",
                "FA": "پیغام خود را اینجا بنویسید..."
            },
            "DEFAULTTEXT" : {
                "EN": "default text",
                "FA": "جملات پیش فرض"
            },
            "UPDATING": {
                "EN": "updating...",
                "FA": "در حال بروزرسانی ..."
            },
            "DEFAULTEMOJI" : {
                "EN": "default emoji",
                "FA": "شکلک های پیش فرض"
            },
            "NOTMESSAGEEXIST": {
                "EN": "not message exist",
                "FA": "پیامی موجود نمی باشد."
            },
        },
        __lang = options.language || "FA",
        __service,
        __useMiniUI = (typeof options.useMiniUI == "boolean") ? options.useMiniUI : true,
        __minimizeVisibility = (typeof options.minimizeVisibility == "boolean") ? options.minimizeVisibility : true,
        __pinVisibility = (typeof options.pinVisibility == "boolean") ? options.pinVisibility : true,
        __closeVisibility = (typeof options.closeVisibility == "boolean") ? options.closeVisibility : true,
        __autoShow = (typeof options.autoShow == "boolean") ? options.autoShow : false,
        __messageTypes = {
            SPRITE: 1,
            BR: 2
        },
        __uiConfig = {
            miniUIColor: "#fa8d2e"
        },
        // __config = __parent.getConfig(),
        __threads = {},
        __alertElm, __msgEmojiContainerElm, __msgContainerElm, __sendTextElm, __smileTooltipElm, __sendBtnElm,
        __emojiFooterElm, __leftContainerElm, __rightContainerElm, __clearMsgElm, __emojiContainerElm, __footerContainerElm,
        __miniMessageContainerElm,__miniDefaultTextBtnElm,__miniDefaultEmojiBtnElm,
        __pinUIElm, __closeUIElm,
        __threadTitle,
        __minMaxUIElm,
        __mainUIMoveElm, __headerElm,
        __mainUI,
        __mainUIWidth,
        __isFocus = false,
        __currentVisibleThreadId,
        __isTouchable = TIS.Util.isTouchable(),
        __isMinimize = false,
        __visibility = false,
        __isAppInBackground = false,
        __isPin = false,
        __categories = {},
        // __historyReceiveMessageCount = __config.getChatHistoryCount,
        __classPrefixName = "TIS_chat_",
        __userImageclassPrefixName = "TIS_chat_userImage_",
        __styleElm,
        __loadingContent,
        __chatService,
        __miniUIElm,
        __currentShowCategoryName,
        __mapUserToThread = {},
        __selectThreadRequestUserId,
        __lastMiniMessageTimeout,
        __gameMethods = {},
        __defaultTextDic = [
            {
                FA : "بجنب دیگه",
                EN : ""
            },
            {
                FA : "چراحرکت نمی کنی",
                EN : ""
            },
            {
                FA : "خوبی",
                EN : ""
            },
            {
                FA : "چه خبر؟",
                EN : ""
            }
        ],
        __miniEmojiElm,
        __ltrSlideStyleElm,
        __rtlSlideStyleElm,
        __miniDefaultTextElm,
        __extraThreadViewData = {
            /*
            * threadId : {
            * container : container
            *
            * }
            * */
        },
        __extraUserThreadContainer,
        __extraThreadMessageContainer,
        __eventCallbacks = {
            newEmojiCategory: {}
        },
        __currentThreadsOffset = 0,
        __isLoadingThread = false,
        __draggable = true,
        __isApp = false;

    /*==================================================================================================================
     *                                   P U B L I C    V A R I A B L E
     *================================================================================================================*/

    /*==================================================================================================================
     *                                   P R I V A T E     M E T H O D
     *================================================================================================================*/

    var __init = function () {

            if(TIS.Util && TIS.Util.isApp) {
                __isApp = TIS.Util.isApp();
            }

            __initView();
            __loadCss();
            __initTooltip();

            __alertElm = $("#TIS_league_alert");
            __msgContainerElm = $("#TIS_chat_msgContainer");
            __msgEmojiContainerElm = $("#TIS_chat_msgEmojiContainer");
            __footerContainerElm = $("#TIS_chat_footer");
            __sendTextElm = $("#TIS_chat_TXT_send");
            __smileTooltipElm = $("#TIS_chat_BTN_tooltip");
            __sendBtnElm = $("#TIS_chat_BTN_send");
            __headerElm = $("#TIS_chat_header");
            __leftContainerElm = $("#TIS_chat_leftContainer");
            __rightContainerElm = $("#TIS_chat_rightContainer");
            __emojiFooterElm = $("#TIS_chat_emojFooterContainer");
            __emojiContainerElm = $("#TIS_chat_emojiContainer");
            __mainUIMoveElm = __mainUI.find(".col-lg-4");
            __minMaxUIElm = $("#TIS_chat_minMaxUI");
            __pinUIElm = $("#TIS_chat_pin");
            __closeUIElm = $("#TIS_chat_closeUI");
            __clearMsgElm = $("#TIS_chat_BTN_clear");
            __threadTitle = $(".TIS_chat_threadTitle");

            __miniMessageContainerElm = $("#TIS_CHM_message");
            __miniDefaultTextBtnElm = $("#TIS_CHM_defaultText");
            __miniDefaultEmojiBtnElm = $("#TIS_CHM_defaultEmoji");

            __loadingContent = "\
                    <div class='alert-success'  style='text-align: center;padding: 5px' role='info'>\
                        <i class='fa fa-spin fa-spinner'></i>\
                        " + __dic.UPDATING[__lang] + "\
                    </div>\
            ";

            __initEvent();

            if (__useMiniUI) {
                __initMiniUI();
            }

            !__minimizeVisibility && __minMaxUIElm.hide();
            !__pinVisibility && __pinUIElm.hide();
            !__closeVisibility && __closeUIElm.hide();

            __minimize();
            __initMiniModeDefaultContent();
            __onWindowResize();
        },

        __urlify = function(text) {
            var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
            //var urlRegex = /(https?:\/\/[^\s]+)/g;
            return text.replace(urlRegex, function (url, b, c) {
                var url2 = (c == 'www.') ? 'http://' + url : url;
                return "<a  target='_blank' value=" + url2 + " style='cursor:pointer'>" + url + "</a>";
            });
        },

        __canSeeMessage = function(messageThreadId) {

            return (!__visibility && (!__extraUserThreadContainer || __currentVisibleThreadId != messageThreadId)) ||
                __isAppInBackground ||
                __currentVisibleThreadId != messageThreadId;
        },

        __openUrl = function(url) {
            if(url) {
                TIS.Util.openUrl(url);
            }
        },

        __initMiniModeDefaultContent = function() {


            var textHtml = "";
            __defaultTextDic.forEach(function(value,index) {
                textHtml += "<div style='padding-bottom: 5px;padding-top: 5px'>" + value[__lang] + "</div>";
            });

            var textContent = "\
                <div>\
                    "+textHtml+"\
                </div>\
                ";

            __miniDefaultTextElm = $(textContent);

            __miniDefaultTextElm.find("div").on("click", function () {
                var text = $(this).html();
                __sendMessage({
                    messageData : {
                        message : [text],
                        emojiCount : 0,
                        textLength : text.length
                    }
                });
                $("#TIS_CHM_defaultText").popover("destroy");
            });


            var emojiContent = "\
                <div>\
                </div>\
            ";


            __miniEmojiElm = $(emojiContent);

            __miniEmojiElm.on("click","a", function () {
                //var text = $(this).html();

                __sendMessage({
                    messageData : {
                        message : [[__messageTypes.SPRITE, $(this).attr("categoryname"), $(this).attr("spritename")]],
                        textLength : 0,
                        emojiCount : 1
                    }
                });

                $("#TIS_CHM_defaultEmoji").popover("destroy");
            });
        },

        __updateFromNowTime = function () {
            __msgEmojiContainerElm.find("time").each(function () {
                var $this = $(this);
                var time = $this.attr("datetime");
                $this.html(moment(new Date(time)).fromNow());
            });
        },

        __initMiniUI = function () {
            __miniUIElm = $("<div id='chat' class='fa fa-weixin fa-4x' style='display: none; position: absolute;left: 20px;bottom: 0;z-index: 2000;cursor: pointer;color:" + __uiConfig.miniUIColor + "' ></div>");
            __miniUIElm.appendTo(document.body);
            var __isTouchable = TIS.Util.isTouchable(),
                isMoveState = false;

            if (__isTouchable) {
                __miniUIElm[0].addEventListener('touchstart', function (e) {
                    mouseDown(e.touches[0]);
                }, false);

            } else {
                __miniUIElm[0].addEventListener('mousedown', mouseDown, false);

            }

            var startTime,
                startPos;

            function mouseUp(e) {
                if (isMoveState) {
                    if (new Date() - startTime < 200 || TIS.Util.distance(startPos.pageX, startPos.pageY, e.pageX, e.pageY) < 10) {
                        __miniUIElm.css("color", __uiConfig.miniUIColor);
                        __showUI();
                        __miniUIElm.hide();
                    }

                    if (__isTouchable) {
                        window.removeEventListener('touchmove', divMove, true);
                        window.removeEventListener('touchend', divMove, true);
                    } else {
                        window.removeEventListener('mousemove', divMove, true);
                        window.removeEventListener('mouseup', mouseUp, false);
                    }
                    isMoveState = false;
                }
            }

            function mouseDown(e) {
                isMoveState = true;
                startPos = e;
                startTime = new Date();
                if (__isTouchable) {
                    window.addEventListener('touchend', mouseUp, false);
                    window.addEventListener('touchmove', divMove, true);
                } else {
                    window.addEventListener('mousemove', divMove, true);
                    window.addEventListener('mouseup', mouseUp, false);
                }

            }

            var chatElmWidth = __miniUIElm.width(),
                chatElmHalfWidth = chatElmWidth / 2,
                chatElmHeight = __miniUIElm.height(),
                chatElmHalfHeight = chatElmHeight / 2,
                mouseX, mouseY,
                left = 0,
                bottom = 0,
                maxElmXPos = window.innerWidth - chatElmWidth,
                maxXPos = window.innerWidth - chatElmHalfWidth,
                maxElmYPos = window.innerHeight - chatElmHeight,
                maxYPos = window.innerHeight - chatElmHalfHeight;

            function divMove(e) {
                if (!isMoveState || !__draggable) {
                    return;
                }
                if (__isTouchable) {
                    mouseX = e.touches[0].clientX;
                    mouseY = e.touches[0].clientY;
                } else {
                    mouseX = e.clientX;
                    mouseY = e.clientY;
                }


                if (mouseX < chatElmHalfWidth) {
                    left = 0;
                } else if (mouseX > maxXPos) {
                    left = maxElmXPos;
                } else {
                    left = mouseX - chatElmHalfWidth;
                }

                if (mouseY < chatElmHalfHeight) {
                    bottom = maxElmYPos;
                } else if (mouseY > maxYPos) {
                    bottom = 0;
                } else {
                    bottom = window.innerHeight - mouseY - chatElmHalfHeight;
                }

                __miniUIElm.css({
                    bottom: bottom + 'px',
                    left: left + 'px'
                });

                e && e.preventDefault();
            }

            $(window).on("resize", function () {
                if(!__draggable) {
                    return;
                }
                maxElmXPos = window.innerWidth - chatElmWidth;
                maxXPos = window.innerWidth - chatElmHalfWidth;
                maxElmYPos = window.innerHeight - chatElmHeight;
                maxYPos = window.innerHeight - chatElmHalfHeight;

                if (left > maxElmXPos - chatElmHalfWidth) {
                    left = maxElmXPos;
                }

                if (bottom > maxYPos - chatElmHalfHeight) {
                    bottom = maxElmYPos;
                }
                if (bottom < 0) {
                    bottom = 0;
                }

                __miniUIElm.css({
                    bottom: bottom + 'px',
                    left: left + 'px'
                });
            });
        },

        __uiSlide = function(visibilityState,callback,setting) {
            var leftTo = __mainUI.position().left,
                leftFrom = __mainUI.width() + leftTo,
                ltrBody = "from { left: " +leftTo+ "px; } to {left: "+leftFrom+"px}",
                ltrRule = "@keyframes  TIS_ltrAnimate {" + ltrBody + "}",
                ltrWebkitRule = "@-webkit-keyframes  TIS_ltrAnimate {" + ltrBody + "}",
                rtlBody = "from { left: " + leftFrom + "px; } to {left: " + leftTo + "px}",
                rtlRule       = "@keyframes  TIS_rtlAnimate {"+rtlBody+"} ",
                rtlWebkitRule = "@-webkit-keyframes  TIS_rtlAnimate {"+rtlBody+"}";

            __rtlSlideStyleElm.innerHTML = rtlRule +  rtlWebkitRule;
            __ltrSlideStyleElm.innerHTML = ltrRule +  ltrWebkitRule;

            var cssData;

            var slieTime = "800ms";
            if(setting && setting.slideTime) {
                slieTime = setting.slideTime;
            }

            if(visibilityState) {
                cssData = {
                    "animation-name": "TIS_rtlAnimate",
                    "animation-duration": slieTime,
                    "animation-iteration-count": "1",
                    "-webkit-animation-name": "TIS_rtlAnimate",
                    "-webkit-animation-duration": slieTime,
                    "-webkit-animation-iteration-count": "1"
                };

            } else {
                cssData = {
                    "animation-name": "TIS_ltrAnimate",
                    "animation-duration": slieTime,
                    "animation-iteration-count": "1",
                    "-webkit-animation-name": "TIS_ltrAnimate",
                    "-webkit-animation-duration": slieTime,
                    "-webkit-animation-iteration-count": "1"
                    //"animation-direction": "reverse",
                    //"-webkit-animation-direction": "reverse"
                };

            }
            __mainUI.css(cssData);


            function endAction() {

                //__mainUI.css({
                //    "animation-name": "none",
                //    "animation-duration": "none",
                //    "animation-iteration-count": "none",
                //    "-webkit-animation-name": "none",
                //    "-webkit-animation-duration": "none",
                //    "-webkit-animation-iteration-count": "none"
                //});
                __mainUI[0].removeEventListener("animationend", endAction, false);
                __mainUI[0].removeEventListener("webkitAnimationEnd", endAction, false);
                callback && callback();
            }
            __mainUI[0].addEventListener("animationend", endAction, false);
            __mainUI[0].addEventListener("webkitAnimationEnd", endAction, false);

        },

        __showUI = function (params) {

            if (!__visibility) {
                __visibility = true;
                if (__currentVisibleThreadId) {
                    __checkNotSeenMsg(__currentVisibleThreadId);
                }

                __mainUI.show();

                var setting;
                if(params) {
                    if(params.showMode!= undefined) {
                        if(params.showMode == TIS.ChatUI.MAXIMIZE) {
                            if(__isMinimize) {
                                __maximize();
                            }
                        }else{
                            if(!__isMinimize) {
                                __minimize();
                            }
                        }
                        if(params.slideTime != undefined) {
                            setting = {
                                slideTime : params.slideTime
                            }
                        }
                    }

                }

                __uiSlide(true,undefined,setting);

                //if (__isMinimize) {
                //    __maximize();
                //}
                __onWindowResize();
            }

        },

        __hideUI = function() {

            function endAction() {
                __visibility = false;
                __mainUI.hide();
                __useMiniUI && __miniUIElm.show();
                __service.onHidChatUI();
            }
            __uiSlide(false,endAction);


        },

        __loadCss = function () {

            var styleContent = "\
                    .TIS_chat_threadTitle{\
                        display:none;\
                        position: absolute;\
                        top: 0px;\
                        width: 100%;\
                        text-align: center;\
                        background-color: #BDBDBD;\
                        z-index: 999;\
                        right: 0px;\
                        padding: 5px;\
                        font-weight: bold;\
                        border-bottom: 1px solid #929292;\
                    }\
                    .TIS_scroll{\
                    }\
                    .TIS_scroll::scrollbar-track{\
                        -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);\
                        background-color: #F5F5F5;\
                    }\
                    .TIS_scroll::-webkit-scrollbar {\
                        width: 6px;\
                        height: 6px;\
                        background-color: #F5F5F5;\
                    }\
                    .TIS_scroll::-webkit-scrollbar-thumb{\
                        -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);\
                        background-color: #428BCA;\
                    }\
                    [draggable=true] .panel-heading {\
                        cursor: move;\
                    }\
                    .col-md-2, .col-md-10{\
                        padding:0;\
                    }\
                    .panel{\
                        margin-bottom: 0px;\
                    }\
                    .chat-window{\
                        bottom:0;\
                        float:right;\
                        margin-left:10px;\
                    }\
                    .chat-window > div > .panel{\
                        border-radius: 5px 5px 0 0;\
                    }\
                    .icon_minim{\
                        padding:2px 10px;\
                    }\
                    .TIS_chat_threadContainer{\
                        background: #e5e5e5;\
                        margin: 0;\
                        overflow-x:hidden;\
                    }\
                    .TIS_chat_backColor{\
                        background: #e5e5e5;\
                    }\
                    .msg_container_base{\
                        padding: 0 10px 10px;\
                        overflow-x: hidden\
                    }\
                    .top-bar {\
                        background: #666;\
                        color: white;\
                        padding: 10px;\
                        position: relative;\
                        overflow: hidden;\
                    }\
                    .msg_receive{\
                        padding-left:0;\
                        margin-left:0;\
                    }\
                    .msg_sent{\
                        margin-right:0;\
                    }\
                    .messages {\
                        background: white;\
                        padding-right: 5px;\
                        border-radius: 2px;\
                        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);\
                        max-width:100%;\
                        word-wrap: break-word;\
                    }\
                    .messages > p {\
                        font-size: 13px;\
                        margin: 0 0 0.2rem 0;\
                    }\
                    .messages > div >  time {\
                        font-size: 9px;\
                        color: #B4B4B4;\
                    }\
                    .msg_container {\
                        padding: 7px;\
                        overflow: hidden;\
                        display: flex;\
                    }\
                    .user_Container {\
                        padding-bottom: 10px;\
                        overflow: hidden;\
                        display: flex;\
                    }\
                    .TIS_chat_container{\
                        position: fixed;\
                        display: none;\
                        bottom: 0;\
                    }\
                    .user_Container_selected {\
                        background-color : rgb(152, 171, 223)\
                    }\
                    .TIS_chat_msgContainer_active {\
                        display : block;\
                    }\
                    .msg_container_base > img {\
                        display: block;\
                        width: 100%;\
                    }\
                    .avatar {\
                        position: relative;\
                    }\
                    .base_receive > .avatar:after {\
                        content: '';\
                        position: absolute;\
                        top: 0;\
                        right: 0;\
                        width: 0;\
                        height: 0;\
                        border: 5px solid #FFF;\
                        border-left-color: rgba(0, 0, 0, 0);\
                        border-bottom-color: rgba(0, 0, 0, 0);\
                    }\
                    .base_sent {\
                        justify-content: flex-end;\
                        align-items: flex-end;\
                    }\
                    .base_sent > .avatar:after {\
                        content: '';\
                        position: absolute;\
                        bottom: 0;\
                        left: 0;\
                        width: 0;\
                        height: 0;\
                        border: 5px solid white;\
                        border-right-color: transparent;\
                        border-top-color: transparent;\
                    }\
                    .msg_sent > time{\
                        /*float: right;*/\
                        position: absolute;\
                        white-space: nowrap;\
                    }\
                    .btn-group.dropup{\
                        position:fixed;\
                        left:0px;\
                        bottom:0;\
                    }\
                    .composer_emoji_panel {\
                        display: block;\
                        height: 30px;\
                    }\
                    .composer_emoji_panel a.composer_emoji_btn {\
                        display: inline-block;\
                        padding: 5px;\
                        outline: 0;\
                        border-radius: 2px;\
                        margin: -1px 0 2px -1px;\
                    }\
                    a.composer_emoji_btn {\
                        margin: 0 1px 0 0;\
                        cursor : pointer\
                        padding: 6px;\
                        display: block;\
                        float: left;\
                        border-radius: 2px;\
                    }\
                     a.composer_emoji_btn:hover {\
                        background-color : #C3C3C3;\
                    }\
                    .emoji {\
                        -moz-box-orient: vertical;\
                        display: inline-block;\
                        vertical-align: baseline;\
                        height: 18px;\
                        width: 18px;\
                        background-repeat: no-repeat;\
                        text-indent: -9999px;\
                        border: 0;\
                    }\
                    .emoji-w20 {\
                        width: 20px;\
                        height: 20px;\
                        vertical-align: middle;\
                        display: inline-block;\
                    }\
                    .noselect {\
                        -webkit-user-select: none;\
                        -moz-user-select: none;\
                        -ms-user-select: none;\
                        user-select: none;\
                    }\
                    .composer_emoji_tooltip_tab.active   {\
                        opacity: 1;\
                    }\
                    .composer_emoji_tooltip.noselect {\
                        display: none;\
                        z-index: 999;\
                        border: 1px solid #dfdfdf;\
                        -webkit-border-radius: 3px;\
                        -moz-border-radius: 3px;\
                        border-radius: 3px;\
                        -webkit-box-shadow: 0 1px 1px rgba(0,0,0,.1);\
                        -moz-box-shadow: 0 1px 1px rgba(0,0,0,.1);\
                        box-shadow: 0 1px 1px rgba(0,0,0,.1);\
                        background: #fff;\
                    }\
                    .composer_rich_textarea img {\
                        width: 20px;\
                        height: 20px;\
                        vertical-align: middle;\
                        margin: -3px 0 0;\
                    }\
                    .composer_emoji_tooltip {\
                        display: block;\
                        z-index: 999;\
                        width: 100%;\
                        border: 1px solid #dfdfdf;\
                        -webkit-border-radius: 3px;\
                        -moz-border-radius: 3px;\
                        border-radius: 3px;\
                        -webkit-box-shadow: 0 1px 1px rgba(0,0,0,.1);\
                        -moz-box-shadow: 0 1px 1px rgba(0,0,0,.1);\
                        box-shadow: 0 1px 1px rgba(0,0,0,.1);\
                        background: #fff;\
                    }\
                    .composer_emoji_tooltip_tabs {\
                        width: 100%;\
                        margin: 5px 0 2px;\
                    }\
                    .composer_emoji_tooltip_tab {\
                        line-height: 0;\
                        color: #fff;\
                        display: inline-block;\
                        cursor: pointer;\
                        opacity: .4;\
                        margin: 0 5px 0 4px;\
                        background-repeat: no-repeat;\
                    }\
                    .nano {\
                        position: relative;\
                        width: 100%;\
                        height: 100%;\
                        overflow: hidden;\
                    }\
                    .nano > .nano-content {\
                        position: absolute;\
                        overflow: scroll;\
                        overflow-x: hidden;\
                        top: 0;\
                        right: 0;\
                        bottom: 0;\
                        left: 0;\
                    }\
                    .composer_emoji_tooltip_tail {\
                        position: absolute;\
                        bottom: -14px;\
                        left: 50%;\
                        margin-left: -13px;\
                        width: 26px;\
                        height: 14px;\
                    }\
                    .icon-tooltip-tail {\
                        background: #fff;\
                        width: 18px;\
                        height: 18px;\
                        display: inline-block;\
                        border: 1px solid #dfdfdf;\
                        border-width: 0 1px 1px 0;\
                        -webkit-border-radius: 2px;\
                        -moz-border-radius: 2px;\
                        border-radius: 2px;\
                        position: relative;\
                        top: -8px;\
                        left: 4px;\
                        -webkit-transform: rotate(45deg);\
                        -moz-transform: rotate(45deg);\
                        -o-transform: rotate(45deg);\
                        -ms-transform: rotate(45deg);\
                        transform: rotate(45deg);\
                        -webkit-box-shadow: 1px 1px 1px rgba(0,0,0,.1);\
                        -moz-box-shadow: 1px 1px 1px rgba(0,0,0,.1);\
                        box-shadow: 1px 1px 1px rgba(0,0,0,.1);\
                    }\
                    .composer_textarea {\
                        overflow: auto;\
                        overflow-y: scroll;\
                        border-radius: 0;\
                        border: 0;\
                        box-shadow: none;\
                        outline: none;\
                        box-shadow: 0 1px 0 0 #e8e8e8;\
                        /*padding: 1px 30px 1px 0;*/\
                        margin: 0;\
                        min-height: 50px;\
                        line-height: 20px;\
                        height: auto;\
                    }\
                    .composer_rich_textarea {\
                        font-size: 12px;\
                        /*margin-bottom: 10px;*/\
                        /*padding: 6px;*/\
                        min-height: 38px;\
                        height: auto;\
                        width: auto;\
                        max-height: 284px;\
                        overflow: auto;\
                        line-height: 17px;\
                        border: 1px solid #d2dbe3;\
                        border-radius: 2px;\
                        -webkit-box-shadow: none;\
                        -moz-box-shadow: none;\
                        box-shadow: none;\
                        -ms-box-sizing: content-box;\
                        -moz-box-sizing: content-box;\
                        -webkit-box-sizing: content-box;\
                        box-sizing: content-box;\
                        -webkit-transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;\
                        transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;\
                        word-wrap: break-word;\
                        -webkit-user-select: text;\
                        -moz-user-select: text;\
                        -ms-user-select: text;\
                        user-select: text;\
                    }\
                    .composer_rich_textarea:empty:before {\
                        content: attr(placeholder);\
                        color: #9aa2ab;\
                    }\
                    .composer_rich_textarea:active:before,.composer_rich_textarea:focus:before{content:none}\
                    .composer_rich_textarea:focus {\
                        content:none\
                    }\
                    composer_rich_textarea[disabled]{\
                        cursor: not-allowed;\
                        background-color: #eee;\
                        opacity: 1\
                    }\
                    div[Attributes Style] {\
                        -webkit-user-modify: read-write;\
                        word-wrap: break-word;\
                        -webkit-line-break: after-white-space;\
                        unicode-bidi: -webkit-isolate;\
                    }\
                    *, :after, :before {\
                            -webkit-box-sizing: border-box;\
                            -moz-box-sizing: border-box;\
                            box-sizing: border-box;\
                        }\
        ";

            var head = document.head || document.getElementsByTagName("head")[0];
            __styleElm = document.createElement('style');
            __styleElm.type = 'text\/css';
            __styleElm.innerHTML = styleContent;

            head.appendChild(__styleElm);


            __ltrSlideStyleElm = document.createElement('style');
            __ltrSlideStyleElm.type = 'text\/css';
            head.appendChild(__ltrSlideStyleElm);

            __rtlSlideStyleElm = document.createElement('style');
            __rtlSlideStyleElm.type = 'text\/css';
            head.appendChild(__rtlSlideStyleElm);

        },

        __initView = function () {
            var content = "\
                <div class='col-lg-5 col-md-8 col-sm-8 col-xs-12 TIS_chat_container' style='z-index:1000'>\
                    <div class='panel panel-default'>\
                        <div id='TIS_chat_header' class='panel-heading top-bar TIS-recieveMesage' style='background-color: #089ce2;padding-top: 5px;padding-bottom: 5px;padding-right:0'>\
                            <div id='TIS_chat_header_maximize' >\
                                <div class='col-md-8 col-sm-8 col-xs-7'>\
                                    <h3 class='panel-title' style='color:white'><i class='fa fa-comments fa-2x' style='color:#3CEB41'></i>بازیتک</h3>\
                                </div>\
                                <div class='col-md-4 col-sm-4 col-xs-5' style='text-align: left;padding-left: 0;'>\
                                    <i ><span id='TIS_chat_pin' class='fa fa-thumb-tack fa-rotate-90' style='color:#fa8d2e;cursor: pointer;font-size: 1.7em;'></span></i>\
                                    <i ><span id='TIS_chat_minMaxUI' class='fa fa-minus icon_minim' style='color:#fa8d2e;cursor: pointer;font-size: 1.7em;'></span></i>\
                                    <i ><span id='TIS_chat_closeUI' class='fa fa-times icon_close' style='color:#fa8d2e;cursor: pointer;font-size: 1.7em;'></span></i>\
                                </div>\
                            </div>\
                            <div id='TIS_chat_header_minimize' style='display: none'>\
                                <div  style='color:#fa8d2e'>\
                                    <div class='col-md-1 col-sm-1 col-xs-1' style='text-align:center'>\
                                        <i id='TIS_CHM_defaultEmoji' class='fa fa-smile-o fa-2x' style='cursor:pointer'></i>\
                                    </div>\
                                    <div class='col-sm-1 col-xs-1' style='text-align:center'>\
                                        <i id='TIS_CHM_defaultText' class='fa fa-bars fa-2x' style='cursor:pointer'></i>\
                                    </div>\
                                    <div class='col-sm-7 col-xs-6' style='text-align:center;padding-left: 0;'>\
                                        <input id='TIS_CHM_message' type='text' style='width:100%;color:black'>\
                                    </div>\
                                    <div class='col-sm-1 col-xs-1' style='text-align:center;padding-left: 0;padding-right: 10px;float:left'>\
                                        <i id='TIS_CHM_close' class='fa fa-times ' style='cursor:pointer;font-size: 1.7em;'></i>\
                                    </div>\
                                    <div class='col-sm-1 col-xs-1' style='text-align:center;padding-left: 0;padding-right: 10px;float:left'>\
                                        <i id='TIS_CHM_maximize' class='fa fa-plus ' style='cursor:pointer;font-size: 1.7em;'></i>\
                                    </div>\
                                    <div class='col-sm-1 col-xs-1' style='text-align:center;padding-left: 0;padding-right: 0;float:left'>\
                                        <i id='TIS_CHM_send' class='fa fa-paper-plane ' style='cursor:pointer;font-size: 1.7em;'></i>\
                                    </div>\
                                </div>\
                            </div>\
                        </div>\
                        <div class='panel-body' style='padding-top:0;padding-bottom:0'>\
                            <div class='row TIS_chat_backColor'>\
                                <div id='TIS_chat_rightContainer' class='col-lg-3 col-md-3 col-sm-3 col-xs-3 TIS_scroll TIS_chat_threadContainer' style='background: #e5e5e5;border-left: 4px solid rgba(18, 211, 226, 0.94);padding-left:0;padding-right:0;overflow:auto'></div>\
                                <div id='TIS_chat_leftContainer' class='col-lg-9 col-md-9 col-sm-9 col-xs-9' style='padding-left:0;padding-right:0'>\
                                    <div id='TIS_chat_msgEmojiContainer' class=' TIS_scroll' style='background: #e5e5e5;overflow-x:hidden;'>\
                                        <div class='TIS_chat_threadTitle'></div>\
                                        <div class='row' style='margin-left:0;margin-right:0;'>\
                                            <div class='col-lg-12 col-md-12 col-sm-12 col-xs-12' style='padding-left: 0;padding-right: 0'>\
                                                <div id='TIS_chat_msgContainer' class='msg_container_base' style='margin-top:35px' ></div>\
                                            </div>\
                                        </div>\
                                        <div class='row'  style='margin-left: 0;margin-right: 0'>\
                                            <div id='TIS_chat_emojiContainer'></div>\
                                        </div>\
                                    </div>\
                                    <div id='TIS_chat_footer' class='panel-footer' style='overflow: hidden;'>\
                                        <div class='row'>\
                                            <div class='col-lg-1 col-md-1 col-sm-1 col-xs-1' style='padding-right: 0;padding-left: 0;text-align: center'>\
                                                <span id='TIS_chat_BTN_tooltip' style='cursor: pointer'>\
                                                    <i class='fa fa-smile-o fa-2x' style='color:#fa8d2e'></i>\
                                                </span>\
                                            </div>\
                                            <div class='col-lg-7 col-md-7 col-sm-7 col-xs-7' style='padding-right: 0;padding-left: 0'>\
                                                <div id='TIS_chat_TXT_send'\
                                                 class='composer_rich_textarea'\
                                                 contenteditable=true\
                                                 dir='auto'\
                                                 placeholder='" + __dic.WRITEMESSAGEHERE[__lang] + "' style='direction:rtl'></div>\
                                            </div>\
                                            <div class='col-lg-2 col-md-2 col-sm-2 col-xs-2' style='text-align: center;'>\
                                                <i class='fa fa-paper-plane fa-2x' id='TIS_chat_BTN_send' style='color: #fa8d2e;cursor: pointer;'></i>\
                                            </div>\
                                            <div class='col-lg-2 col-md-2 col-sm-2 col-xs-2' style='text-align: center;' >\
                                                <i class='fa fa-trash fa-2x' id='TIS_chat_BTN_clear' style='color: #fa8d2e;cursor: pointer;'></i>\
                                            </div>\
                                        </div>\
                                        <div class='im_send_buttons_wrap clearfix TIS_chat_footerScroll' style='display:none' >\
                                            <div id='TIS_chat_emojFooterContainer' class='composer_emoji_panel' style='margin:0 auto;'></div>\
                                        </div>\
                                    </div>\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
                ";

            __mainUI = $(content).appendTo(document.body);
            __mainUI.css({
                "max-height": $(window).height()
            });
            __mainUIWidth = __mainUI.find(".panel").width();
        },

        __initTooltip = function () {
            var content = "\
                    <div class='composer_emoji_tooltip noselect' style='position: relative'>\
                        <div id= 'TIS_chat_emojiCategory' class='composer_emoji_tooltip_tabs' style='border-bottom: 2px solid #089ce2'></div>\
                        <i class='fa fa-times' style='font-size: 2em;position: absolute;left: 0;top: 0;color:#fa8d2e;cursor:pointer'></i>\
                        <div style='position: relative;height: 174px'>\
                            <div class='nano '>\
                                <div class='nano-content TIS_scroll' tabindex='-1' style='overflow-y:auto;overflow-x:hidden;max-height:300px;'>\
                                    <div id='TIS_chat_emojiCategory_content' class='composer_emoji_tooltip_content clearfix'>\
                                    </div>\
                                </div>\
                            </div>\
                        </div>\
                        <div class='composer_emoji_tooltip_footer'><a class='composer_emoji_tooltip_settings'></a></div>\
                    </div>\
                    ";

            //$(content).appendTo(document.body);
            $(content).appendTo("#TIS_chat_emojiContainer");
        },

        __checkTextFocus = function () {
            if (__isPin) {
                __isFocus = true;
                __sendTextElm.focus();
            } else {
                __isFocus = false;
            }
        },

        __emptySendText = function () {

            //__sendTextElm.empty();

            if (__isPin) {
                __sendTextElm.html("&nbsp");
            } else {
                __sendTextElm.html("");
            }
            __miniMessageContainerElm.val("");

            __onWindowResize();
        },

        __minimize = function () {
            __isMinimize = true;
            __minMaxUIElm.parents('.panel').find('.panel-body').slideUp();
            __minMaxUIElm.addClass('panel-collapsed');
            __minMaxUIElm.removeClass('fa-minus').addClass('fa-plus');

            $("#TIS_chat_header_maximize").hide();
            $("#TIS_chat_header_minimize").show();

            var text = __sendTextElm.text();
            if(text.length>0) {
                __miniMessageContainerElm.val(text);
            }

        },

        __maximize = function () {
            __isMinimize = false;
            __minMaxUIElm.parents('.panel').find('.panel-body').slideDown();
            __minMaxUIElm.removeClass('panel-collapsed');
            __minMaxUIElm.removeClass('fa-plus').addClass('fa-minus');
            __headerElm.css("background-color", "#089ce2");
            __headerElm.find(".fa-comments").css("color", "#3CEB41");
            if (__currentVisibleThreadId) {
                __checkNotSeenMsg(__currentVisibleThreadId);
            }
            __msgEmojiContainerElm.scrollTop(function () {
                return this.scrollHeight;
            });

            $("#TIS_chat_header_maximize").show();
            $("#TIS_chat_header_minimize").hide();

            var text = __miniMessageContainerElm.val();
            if(text.length>0) {
                __sendTextElm.text(text);
            }

            __onWindowResize();
        },

        __removeNotSeenElm = function (threadId, container) {
            if (!container) {
                container = __rightContainerElm.find("div[threadId=" + threadId + "]");
            }

            var spanElm = container.find('span');
            if (spanElm.length != -1) {
                spanElm.remove();
            }

            if(__extraUserThreadContainer) {
                var elm = __extraUserThreadContainer.find("div[threadId=" + threadId + "]").find('span');
                if (elm.length != -1) {
                    elm.remove();
                }
            }
        },

        __selectThread = function (threadId, container) {
            if (threadId == undefined ||
                threadId == __currentVisibleThreadId ||
                (__extraThreadViewData[threadId] && !__extraThreadViewData[threadId].visible)) {
                return;
            }
            __currentVisibleThreadId = threadId;


            __threadTitle.html(__threads[__currentVisibleThreadId].title).show();

            //if (!container) {
            //    container = __rightContainerElm.find("div[threadId=" + __currentVisibleThreadId + "]");
            //}


            function manageStyle(userContainer,messageContainer) {
                userContainer.parent().find(".user_Container_selected").removeClass("user_Container_selected");

                userContainer.addClass("user_Container_selected");

                messageContainer
                    .find(".TIS_chat_msgContainer_active")
                    .removeClass("TIS_chat_msgContainer_active")
                    .hide();

                messageContainer
                    .find("[threadId='" + __currentVisibleThreadId + "']")
                    .addClass("TIS_chat_msgContainer_active")
                    .show();
            }

            var ownContainer = __rightContainerElm.find("div[threadId=" + __currentVisibleThreadId + "]");
            manageStyle(ownContainer,__msgContainerElm);


            if(__extraUserThreadContainer ) {
                ownContainer = __extraUserThreadContainer.find("div[threadId=" + __currentVisibleThreadId + "]");
                manageStyle(ownContainer,__extraThreadMessageContainer);

                __extraThreadMessageContainer.scrollTop(function () {
                    return this.scrollHeight;
                });
            }


            __msgEmojiContainerElm.scrollTop(function () {
                return this.scrollHeight;
            });

            __checkNotSeenMsg(__currentVisibleThreadId);

            __miniMessageContainerElm.attr("placeholder", __threads[__currentVisibleThreadId].title);

            if(__threads[threadId].messageHistoryOffset == 0) {
                __getThreadMessageHistory(threadId);
            }

        },

        __setEndOfContenteditable = function(contentEditableElement) {
            var range, selection;
            if (document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
            {
                range = document.createRange();//Create a range (a range is a like the selection but invisible)
                range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
                range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
                selection = window.getSelection();//get the selection object (allows you to change selection)
                selection.removeAllRanges();//remove any selections already made
                selection.addRange(range);//make the range you have just created the visible selection
            }
            else if (document.selection)//IE 8 and lower
            {
                range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
                range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
                range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
                range.select();//Select the range (make it the visible selection
            }
        },

        __selectEmojiAction = function($emojiElm) {

            if (!__currentVisibleThreadId) {
                return;
            }

            var categoryName = $emojiElm.attr("categoryName");
            var spriteName = $emojiElm.attr("spriteName");
            var sprite = __categories[categoryName].sprites[spriteName].messageData;

            var cssData = {
                width: sprite.width + "px",
                height: sprite.height + "px",
                "background-position": -sprite.x + "px " + -sprite.y + "px"
            };

            if (sprite.backgroundSize) {
                cssData["background-size"] = sprite.backgroundSize.width + "px " + sprite.backgroundSize.height + "px ";
            }

            var tag = $("<i>")
                .css(cssData)
                .attr({
                    categoryName: categoryName,
                    spriteName: spriteName,
                    alt: ":blush:",
                    contenteditable: false,
                    "onresizestart": "return false"
                })
                .addClass($emojiElm.find("i").attr("class"));

            __sendTextElm.append(tag);

            //var node = tag[0];
            //var sel = window.getSelection();
            //if (sel.rangeCount) {
            //    var range = sel.getRangeAt(0);
            //    range.collapse(false);
            //    range.insertNode(node);
            //    range = range.cloneRange();
            //    range.selectNodeContents(node);
            //    range.collapse(false);
            //    sel.removeAllRanges();
            //    sel.addRange(range);
            //}

            //insertNodeAtCaret(tag[0])

            __setEndOfContenteditable(__sendTextElm[0]);
        },

        __initUserThreadContainerEvent = function(container) {
            container
                .on('click', '.user_Container', function (e) {
                    var threadId = $(this).attr("threadId");
                    __selectThread(threadId, $(this));
                })
                .on("click", ".TIS-chat-reportUser", function () {
                    if(__service.showSuggestionUI) {
                        __service.showSuggestionUI({
                            title: "گزارش کاربر",
                            type: 2,
                            metaData: {
                                userId: $(this).attr("userId"),
                                participantId: $(this).attr("participantId"),
                                threadId: $(this).attr("threadId")
                            }
                        });
                    }

                    return false;
                });
        },

        __initEvent = function () {
            __minMaxUIElm
                .on('click', function (e) {
                    if (!__minMaxUIElm.hasClass('panel-collapsed')) {
                        __minimize();
                    } else {
                        __maximize();
                    }
                    __onWindowResize();
                    return false;
                });

            __pinUIElm
                .on("click", function () {
                    $(this).toggleClass("fa-rotate-90");
                    __isPin = !__isPin;
                    __checkTextFocus();
                    if (!__isFocus) {
                        __sendTextElm.blur();
                    }
                });

            __closeUIElm
                .on('click', function (e) {
                    __hideUI();
                });

            __initUserThreadContainerEvent(__rightContainerElm);

            $(window).on("resize", function () {
                __onWindowResize();
            });

            __emojiFooterElm.parent().on("click", ".composer_emoji_btn", function () {
                __selectEmojiAction($(this));
            });

            $("#TIS_chat_emojiCategory_content").on("click", ".composer_emoji_btn",function() {
                __selectEmojiAction($(this));
            });


            __emojiContainerElm.on("click", function (e) {

                if (e.target.nodeName != "A") {
                    $('.composer_emoji_tooltip.noselect ').hide();
                    __msgEmojiContainerElm.css("overflow-y", "scroll");
                }

            });


            $(document).on("click", ".composer_emoji_tooltip_tab", function () {
                $(this).parent().find(".active").removeClass("active");
                $(this).addClass("active");
                __showEmojiCategoryImage($(this).attr("categoryName"));
                return false;
            });

            document.addEventListener("deviceready", function () {
                document.addEventListener("pause", function () {
                    __isAppInBackground = true;
                }, false);

                document.addEventListener("resume", function () {
                    __isAppInBackground = false;

                    if (__visibility && __currentVisibleThreadId) {
                        __checkNotSeenMsg(__currentVisibleThreadId);
                    }
                }, false);

                window.addEventListener('native.keyboardshow', function (e) {
                    if ((__isFocus || __isMinimize) && __visibility && e.keyboardHeight < $(window).height()) {
                        __mainUI.css("bottom", e.keyboardHeight + "px");

                        var popover = __headerElm.data('bs.popover');
                        if(popover && popover.tip().hasClass('in')) {
                            __headerElm.popover("show");
                        }

                        popover = __miniDefaultTextBtnElm.data('bs.popover');
                        if(popover && popover.tip().hasClass('in')) {
                            __miniDefaultTextBtnElm.popover("show");
                        }

                        popover = __miniDefaultEmojiBtnElm.data('bs.popover');
                        if(popover && popover.tip().hasClass('in')) {
                            __miniDefaultEmojiBtnElm.popover("show");
                        }

                    }
                });

                window.addEventListener('native.keyboardhide', function () {
                    __mainUI.css("bottom", "0px");

                    var popover = __headerElm.data('bs.popover');
                    if(popover && popover.tip().hasClass('in')) {
                        __headerElm.popover("show");
                    }

                    popover = __miniDefaultTextBtnElm.data('bs.popover');
                    if(popover && popover.tip().hasClass('in')) {
                        __miniDefaultTextBtnElm.popover("show");
                    }

                    popover = __miniDefaultEmojiBtnElm.data('bs.popover');
                    if(popover && popover.tip().hasClass('in')) {
                        __miniDefaultEmojiBtnElm.popover("show");
                    }
                });
            }, false);

            __sendBtnElm.on("click", function () {
                __sendMessage();

                if (__isPin) {
                    __setEndOfContenteditable(__sendTextElm[0]);
                }
            });

            __smileTooltipElm.on("click", function () {

                $('.composer_emoji_tooltip.noselect ')
                    .show();

                __msgEmojiContainerElm
                    .scrollTop(function () {
                        return this.scrollHeight;
                    })
                    .css("overflow-y", "hidden");

                return false;
            });

            __sendTextElm
                .on("click", function (e) {
                    __isFocus = true;

                    if (e.target.nodeName == "I") {
                        __setEndOfContenteditable(this);
                    }
                })
                .on("blur", function (e) {
                    var text = __sendTextElm.html();
                    if ((text.length < 2 || text == "&nbsp;") && text != "") {
                        __emptySendText();
                    }
                    __checkTextFocus();
                })
                .on("focus", function (e) {
                    if (__sendTextElm.html().length < 1) {
                        __sendTextElm.html("&nbsp;");
                    }
                })
                .on("keydown", function (e) {
                    if (e.which == 13 || e.which == 8) {
                        var leftContainerHeight = __leftContainerElm.height();
                        __rightContainerElm.css({
                            "max-height": leftContainerHeight,
                            "min-height": leftContainerHeight
                        });

                        if (e.which == 13 && !TIS.Util.isApp() && !e.shiftKey) {
                            __sendMessage();
                        }
                    }
                    //e.preventDefault();
                })
                .on("keyup", function (e) {
                    if (e.which == 13 && !TIS.Util.isApp() && !e.shiftKey) {
                        __emptySendText();
                    }

                    if (__sendTextElm.html().length == 0) {
                        __sendTextElm.blur();
                    }
                });



            $("#TIS_chat_BTN_clear").on("click", function () {
                __emptySendText();
            });

            $("#TIS_CHM_maximize").on("click", function () {
                __maximize();
            });


            __miniMessageContainerElm.on("keydown", function (e) {
                if (e.which == 13) {
                    __sendMessage();
                }
            });


            function initDefaultText($container) {

                var template = "\
                            <div class='popover' role='tooltip' > \
                                <div class='arrow'></div>\
                                <div class='popover-title'></div>\
                                <div class='popover-content' style='padding-top:0;padding-bottom: 0;text-align: center;max-height: 150px;overflow-y: auto'></div>\
                            </div>";
                $container
                    //.popover('destroy')
                    .popover({
                        container: 'body',
                        placement: "top",
                        trigger: "manual",
                        html: true,
                        template : template,
                        title : function() {
                            var titleContent = "\
                                        <div>\
                                            <i class='fa fa-times fa-2x' style='position: absolute;left: 0;top:0;color:#fa8d2e'></i>\
                                            <div>"+ __dic.DEFAULTTEXT[__lang] +"</div>\
                                        </div>\
                                    ";

                            var $title = $(titleContent);

                            $title.find("i").on("click", function () {
                                $container.popover('destroy');
                            });

                            return $title;
                        },
                        content : function(e) {
                            return __miniDefaultTextElm;
                        }
                    }).popover("toggle");
            }

            function initDefaultEmoji($container) {

                var template = "\
                            <div class='popover' role='tooltip' > \
                                <div class='arrow'></div>\
                                <div class='popover-title'></div>\
                                <div class='popover-content' style='padding-top:0;padding-bottom: 0;text-align: center'></div>\
                            </div>";
                $container
                    //.popover('destroy')
                    .popover({
                        container: 'body',
                        placement: "top",
                        trigger: "manual",
                        html: true,
                        template : template,
                        title : function() {
                            var titleContent = "\
                                        <div>\
                                            <i class='fa fa-times fa-2x' style='position: absolute;left: 0;top:0;color:#fa8d2e'></i>\
                                            <div>"+ __dic.DEFAULTEMOJI[__lang] +"</div>\
                                        </div>\
                                    ";

                            var $title = $(titleContent);

                            $title.find("i").on("click", function () {
                                $container.popover('destroy');
                            });

                            return $title;
                        },
                        content : function(e) {
                            return __miniEmojiElm;
                        }
                    }).popover("toggle");
            }


            __miniDefaultTextBtnElm.on("click", function () {
                initDefaultText($(this));
            });

            __miniDefaultEmojiBtnElm.on("click", function () {
                initDefaultEmoji($(this));
            });

            $("#TIS_CHM_send").on("click", function () {
                __sendMessage();
            });

            $("#TIS_CHM_close").on("click", function () {
                __hideUI();
            });


            __initMessageScrollEvent();

            //__initUserThreadScrollEvent();
        },

        __initMessageScrollEvent = function (container,threadId) {
            var containerElm = container || __msgEmojiContainerElm;
            var selectedThreadId;
            //console.log("__initScrollEvent",threadId);
            containerElm.off("scroll").on('scroll', function (e) {
                if ($(this).scrollTop() == 0) {
                    selectedThreadId = threadId || __currentVisibleThreadId;
                    if (__threads[selectedThreadId] &&
                        !__threads[selectedThreadId].isGetAllHistory &&
                        ! __threads[selectedThreadId].isLoading) {
                        containerElm.off('scroll');
                        __getThreadMessageHistory(selectedThreadId, function(state) {
                            if(state) {
                                __initMessageScrollEvent(container, threadId);
                            }
                        });
                    }
                }
            });
        },

        __initUserThreadScrollEvent = function(container) {
            var containerElm = container || __rightContainerElm;
            containerElm.off("scroll").on('scroll', function (e) {
                if (($(this).scrollTop() == this.scrollHeight - this.clientHeight) && !__isLoadingThread) {
                    containerElm.off('scroll');
                    __getThreads();
                }
            });
        },

        __plusThreadNotSeenCount = function (params) {
            __threads[params.threadId].notSeen.push(params.messageId);
            var p = $(".TIS_chat_threadContainer").find("div[threadId=" + params.threadId + "]").find("p");

            var span = p.find("span"),
                notSeenNum = 1,
                sp = "<span class='img-responsiv img-circle' style='background-color:#45B010;float: left'>("+notSeenNum+")</span>";

            if (span.length > 0) {
                notSeenNum = (parseInt(span.text().replace("(", ""))) + 1;
                span.text("(" + notSeenNum + ")");

            } else {
                p.append(sp);
            }

            if(__extraThreadMessageContainer) {
                p = __extraUserThreadContainer.find("div[threadId=" + params.threadId + "]").find("p");

                span = p.find("span");

                if (span.length > 0) {
                    span.text("(" + notSeenNum + ")");

                } else {
                    p.append(sp);
                }
            }
        },

        __checkNotSeenMsg = function (threadId, container) {
            var notSeenMsg = __threads[threadId].notSeen;
            if (notSeenMsg.length > 0) {
                for (var i = 0; i < notSeenMsg.length; i++) {
                    __chatService.seen({
                        messageId: notSeenMsg[i]
                    });
                }
                __threads[threadId].notSeen = [];
                __removeNotSeenElm(threadId, container);
            }
        },

        __onWindowResize = function () {
            var height = $(window).height() - __headerElm.innerHeight(),
                footerHeight = __footerContainerElm.innerHeight();

            if (height > 300 + footerHeight) {
                height = 300 + footerHeight;
            }
            __rightContainerElm.css({
                "max-height": height,
                "min-height": height
            });

            __msgEmojiContainerElm.css({
                "max-height": height - footerHeight,
                "min-height": height - footerHeight
            });

            __msgEmojiContainerElm.scrollTop(function () {
                return this.scrollHeight;
            });

        },

        __parseSendMessageContainer = function(container) {
            var sendMsg = [],
                textContent,
                textLength = 0,
                emojiCount = 0;


            if(container) {
                textContent = container.contents();
            } else {

                if(__isMinimize) {
                    var text = __miniMessageContainerElm.val();
                    sendMsg = [text];
                    textLength += text.length;

                } else {
                    textContent = __sendTextElm.contents();
                }

            }

            function parse(container) {
                container.each(function (index, elm) {
                    if (this.nodeType == 1) {
                        switch (this.nodeName) {
                            case "BR" :
                                sendMsg.push([__messageTypes.BR]);
                                break;

                            case "DIV" :
                                sendMsg.push([__messageTypes.BR]);

                                var conts = $(this).contents();

                                if(conts.length > 0) {
                                    parse(conts);
                                } else {
                                    var text = $(this).text();
                                    if (text) {
                                        sendMsg.push(this.textContent);
                                        textLength += this.textContent.length;
                                    }
                                }

                                break;

                            case "SPAN" :
                                var text = $(this).text();
                                if (text) {
                                    sendMsg.push(this.textContent);
                                    textLength += this.textContent.length;
                                }
                                break;

                            case "I" :
                                var categoryName = $(this).attr("categoryName");
                                var spriteName = $(this).attr("spriteName");
                                sendMsg.push([__messageTypes.SPRITE, categoryName, spriteName]);
                                emojiCount += 1;
                                break;
                        }
                    } else if (this.nodeType == 3) {
                        if (textLength == 0) {
                            this.textContent = this.textContent.replace("&nbsp;", "").trim();
                        }
                        sendMsg.push(this.textContent);
                        textLength += this.textContent.length;
                    }
                });
            }

            if(textContent) {
                parse(textContent);
            }
            return {
                message : sendMsg,
                textLength : textLength,
                emojiCount : emojiCount
            };

        },

        __sendMessage = function (params) {
            var messageData,
                threadId =  __currentVisibleThreadId;

            if(params && params.messageData) {
                messageData = params.messageData;
                if(params.threadId) {
                    threadId = params.threadId;
                }
            } else {
                messageData  = __parseSendMessageContainer();
            }

            var threadMsgContainer = __msgContainerElm.find("div[threadId='"+threadId+"']");

            if ((!messageData.emojiCount && (messageData.textLength < 2) )||
                threadMsgContainer.length != 1 ||
                messageData.emojiCount > __service.getConfig().maxEmojiInMessage ||
                messageData.textLength > __service.getConfig().maxTextMessageLength
            ) {
                return false;
            }

            var content = __createOwnerMessageContent({
                threadId: threadId,
                message: messageData.message
            });

            var msgElms = [];

            msgElms.push(content.appendTo(threadMsgContainer));

            if(__extraThreadViewData[threadId]) {
                msgElms.push(content.clone(true).appendTo(__extraThreadViewData[threadId].container));
                __extraThreadViewData[threadId].container.scrollTop(function () {
                    return this.scrollHeight;
                });
            }

            if(__extraThreadMessageContainer) {
                var msgContent = __extraThreadMessageContainer.find("div[threadId='" + threadId + "']");
                msgElms.push(content.clone(true).appendTo(msgContent));
                __extraThreadMessageContainer.scrollTop(function () {
                    return this.scrollHeight;
                });
            }


            var spanElm = [],
                isDeliver = false,
                isSeen = false,
                isSent = false,
                msgId;

            for (var i = 0; i < msgElms.length; i++) {
                spanElm.push(msgElms[i].find("span"));
            }

            __chatService.sendMessage({
                threadId: threadId,
                message: messageData.message,
                onDeliver: function () {
                    //console.log("onDeliver");
                    if (!isDeliver) {
                        var htmlContent = "<span  class='fa fa-check' style='float: left;color:lime;font-size: small' > </span>";
                        for (var i = 0; i < spanElm.length; i++) {
                            var elm = $(htmlContent);
                            spanElm[i].replaceWith(elm);
                            spanElm[i] = elm;
                        }
                        isDeliver = true;
                    }
                },
                onSeen: function () {
                    //console.log("onSeen",isDeliver);
                    if (!isSeen) {
                        var htmlContent = "<span  class='fa fa-check' style='float: left;color:lime;font-size: small' > </span>";
                        var span = "<span  class='fa fa-check' style='float: left;color:lime;font-size: small' > </span>";

                        if(!isDeliver) {
                            for (var i = 0; i < spanElm.length; i++) {
                                var elm = $(htmlContent);
                                spanElm[i].replaceWith(elm);
                                spanElm[i] = elm;
                            }

                            isDeliver = true;
                        }

                        for (var i = 0; i < spanElm.length; i++) {
                            $(span)
                                .insertAfter( spanElm[i])
                                .css({
                                    "margin-left": "-6px"
                                });

                        }

                        isSeen = true;
                    }

                },
                onSent: function (messageId) {
                    //console.log("onSent");
                    msgId = messageId;
                    for (var i = 0; i < msgElms.length; i++) {
                        msgElms[i].attr("messageId", messageId);
                    }
                },
                onServerReceive: function () {
                    //console.log("onServerReceive");
                    for (var i = 0; i < spanElm.length; i++) {
                        spanElm[i].css({color: "lime"});
                    }
                }
            });

            __emptySendText();

            return true;
        },

        __getThreadMessageHistory = function (threadId, callback) {
            //console.trace("__getThreadMessageHistory--11",threadId);

            if (__threads[threadId].isGetAllHistory || __threads[threadId].isLoading) {
                return;
            }

            __threads[threadId].isLoading = true;

            var messageContainer = [],
                loadings = [];

            messageContainer.push(__msgContainerElm.find("div[threadId=" + threadId + "]"));


            //var hasExtra = false,
            //    hasExtraMessage = false;

            if(__extraThreadViewData[threadId]) {
                //hasExtra = true;
                messageContainer.push(__extraThreadViewData[threadId].container);
            }
            //
            if(__extraThreadMessageContainer) {
                //hasExtraMessage = true;
                messageContainer.push(__extraThreadMessageContainer.find("div[threadId=" + threadId + "]"));
            }

            for (var i = 0; i < messageContainer.length; i++) {
                loadings.push($(__loadingContent).prependTo(messageContainer[i]));
            }


            var offset = __threads[threadId].messageHistoryOffset;
            var data = {
                threadId: threadId,
                count: __service.getConfig().getChatHistoryCount,
                offset: offset,
                onResult: function (result) {
                    //console.log("__getThreadMessageHistory--222",threadId);
                    var hasHistory = result.hasHistory;
                    if(__threads[threadId]) {
                        __threads[threadId].isLoading = false;

                        //if(!hasExtra && __extraThreadData[threadId]) {
                        //    messageContainer.push(__extraThreadData[threadId].container);
                        //}
                        //
                        //if(!hasExtraMessage && __extraThreadMessageContainer) {
                        //    messageContainer.push(__extraThreadMessageContainer.find("div[threadId=" + threadId + "]"));
                        //}

                        var extraContainer = __extraThreadViewData[threadId] && __extraThreadViewData[threadId].container;
                        if(__threads[threadId].messageHistoryOffset === 0) {
                            for (var i = 0; i < messageContainer.length; i++) {
                                messageContainer[i].empty();
                            }
                        }
                        for (var i = 0; i < loadings.length; i++) {
                            loadings[i].remove();
                        }

                        __threads[threadId].messageHistoryOffset = result.nextOffset;


                        __receiveThreadHistoryHandler(threadId, result.history,messageContainer[0],__msgEmojiContainerElm,hasHistory);

                        if(extraContainer) {
                            __receiveThreadHistoryHandler(threadId, result.history, extraContainer,extraContainer,hasHistory);
                        }
                        if(__extraThreadMessageContainer) {
                            var extraMessageContainer = __extraThreadMessageContainer.find("div[threadId=" + threadId + "]");
                            __receiveThreadHistoryHandler(threadId, result.history, extraMessageContainer,__extraThreadMessageContainer,hasHistory);
                        }
                        __threads[threadId].isGetAllHistory = (!hasHistory);

                    }
                    callback && callback(hasHistory);
                }
            };

            __chatService.getThreadHistory(data);
        },

        __createOutsiderMessageContent = function (messageVO) {
            var msgContent = "",
                message = messageVO.message,
                currentTime = new Date(),
                time;
            if (messageVO.time) {
                time = new Date(messageVO.time);
                if(time > currentTime) {
                    time = currentTime;
                }
            } else {
                time = currentTime;
            }


            for (var i = 0; i < message.length; i++) {
                var msg = message[i];
                if (typeof msg == "string") {
                    msgContent += __urlify(msg);
                } else {
                    switch (msg[0]) {
                        case __messageTypes.SPRITE :
                            var categoryName = msg[1];
                            var spriteName = msg[2];

                            if (categoryName == null ||
                                categoryName == undefined ||
                                spriteName == null ||
                                spriteName == undefined) {
                                //msgContent += "<i class='fa fa-spinner fa-spin fa-2x'></i>";
                                continue;
                            }

                            var needUpdate = false;
                            if (!__categories[categoryName]) {
                                needUpdate = true;
                            } else if (!__categories[categoryName].sprites[spriteName]) {
                                needUpdate = true;
                            }

                            if (needUpdate) {
                                msgContent += "<i class='fa fa-spinner fa-spin fa-2x TIS_chat_NotSprite' categoryName='" + categoryName + "' spriteName='" + spriteName + "'></i>";
                                __chatService.updateEmojiCategory({
                                    categoryId: categoryName
                                });

                            } else {
                                var tag = __createSpriteElement(categoryName, spriteName);
                                msgContent += tag[0].outerHTML;
                            }

                            break;

                        case __messageTypes.BR :
                            msgContent += "<br/>";
                            break;
                    }
                }

            }


            var userId = messageVO.participant.id,
                threadId = messageVO.threadId,
                participant = __threads[threadId].participants[userId],
                isGroup = __threads[threadId].group,
                groupContent = "";

            if(!participant) {
                __createParticipantImageClass(messageVO.threadId, messageVO.participant);
                participant = __threads[threadId].participants[userId];
            }

            if(isGroup) {
                groupContent = "<div><i style='font-size: 10px;color:#B4B4B4;text-align: right;padding: 0 10px 1px 0px;'>"+messageVO.participant.name+"</i></div>"
            }

            var avatar = participant.image,
                imageContent;
            if (avatar.url) {
                imageContent = "<i class=' " + avatar.className + "' style='height:" + avatar.height + "px;width:" + avatar.width + "px;display: inline-block'></i>";
            } else {
                imageContent = "<i class='" + avatar.className + "' style='display: inline-block'></i>";
            }

            var $elem = $("\
                <div class='row msg_container base_receive' messageId='" + messageVO.messageId + "'>\
                    <div class='col-md-2 col-sm-2 col-xs-2'></div>\
                    <div class='col-md-8 col-sm-8 col-xs-8' style='padding-left: 0;padding-right: 0;position:relative;background: white'>\
                        " + groupContent + "\
                        <div class='messages msg_receive'\
                            <p >" + msgContent + "</p>\
                            <div style='text-align: left;padding-left: 5px'>\
                                <time datetime='" + time + "'>" + moment(time).fromNow() + "</time>\
                            </div>\
                        </div>\
                    </div>\
                    <div class='col-md-2 col-sm-2 col-xs-2 avatar' style='text-align: center'>\
                        " + imageContent + "\
                    </div>\
                </div>\
            ");

            $elem.on("click", "a", function () {
                __openUrl($(this).attr("value"));
            });
            return $elem;
        },

        __createOwnerMessageContent = function (messageVO) {
            var msgContent = "",
                currentTime = new Date(),
                time,
                message = messageVO.message;

            if (messageVO.time) {
                time = new Date(messageVO.time);
                if(time > currentTime) {
                    time = currentTime;
                }
            } else {
                time = currentTime;
            }

            for (var i = 0; i < message.length; i++) {
                var msg = message[i];
                if (typeof msg == "string") {
                    //msgContent += msg;
                    msgContent += __urlify(msg);
                } else {
                    switch (msg[0]) {
                        case __messageTypes.SPRITE :
                            var categoryName = msg[1];
                            var spriteName = msg[2];

                            if (categoryName == null ||
                                categoryName == undefined ||
                                spriteName == null ||
                                spriteName == undefined) {
                                //msgContent += "<i class='fa fa-spinner fa-spin fa-2x'></i>";
                                continue;
                            }

                            var needUpdate = false;
                            if (!__categories[categoryName]) {
                                needUpdate = true;
                            } else if (!__categories[categoryName].sprites[spriteName]) {
                                needUpdate = true;
                            }

                            if (needUpdate) {
                                msgContent += "<i class='fa fa-spinner fa-spin fa-2x TIS_chat_NotSprite' categoryName='" + categoryName + "' spriteName='" + spriteName + "'></i>";
                                __chatService.updateEmojiCategory({
                                    categoryName: categoryName
                                });

                            } else {
                                var tag = __createSpriteElement(categoryName, spriteName);
                                msgContent += tag[0].outerHTML;
                            }

                            break;

                        case __messageTypes.BR :
                            msgContent += "<br/>";
                            break;
                    }

                }

            }

            var avatar = __threads[messageVO.threadId].owner.image,
                imageContent;
            if (avatar.url) {
                imageContent = "<i class=' " + avatar.className + "' style='display:block;height:" + avatar.height + "px;width:" + avatar.width + "px;display: inline-block'></i>";
            } else {
                imageContent = "<i class='" + avatar.className + "' style='display: inline-block'></i>";
            }


            var $content = $("\
                <div class='row msg_container base_sent' messageId='" + messageVO.messageId + "'>\
                    <div class='col-md-2 col-sm-2 col-xs-2 avatar'  style='text-align: center'>\
                        " + imageContent + "\
                    </div>\
                    <div class='col-md-8 col-sm-8 col-xs-8 '  style='padding-left: 0;padding-right: 0'>\
                        <div class='messages msg_sent'>\
                            <p>" + msgContent + "</p>\
                            <div style='text-align: left;padding-left: 5px'>\
                                <time datetime='" + time + "'>" + moment(time).fromNow() + "</time>\
                                <span  class='fa fa-paper-plane' style='float: left;color:darkgray;font-size: small' > </span>\
                            </div>\
                        </div>\
                    </div>\
                    <div class='col-md-2 col-sm-2 col-xs-2'></div>\
                </div>\
            ");

            $content.on("click", "a", function () {
                __openUrl($(this).attr("value"));
            });
            return $content;
        },

        __createSpriteElement = function (categoryName, spriteName) {
            var sprite = __categories[categoryName].sprites[spriteName].messageData;
            var cssData = {
                width: sprite.width + "px",
                height: sprite.height + "px",
                "background-position": -sprite.x + "px " + -sprite.y + "px"
            };
            if (sprite.backgroundSize) {
                cssData["background-size"] = sprite.backgroundSize.width + "px " + sprite.backgroundSize.height + "px ";
            }
            var elm = $("<i>")
                .css(cssData)
                .attr({
                    categoryName: categoryName,
                    spriteName: spriteName,
                    alt: ":blush:",
                    contenteditable: false,
                    "onresizestart": "return false"
                })
                .addClass(__categories[categoryName].className + " emoji emoji-w20");

            return elm;
        },

        __receiveThreadHistoryHandler = function (threadId, messages, messageContainer,scrollContainer,hasHistory) {
            if (messageContainer.length == 1) {
                var messageVO,
                    scrollHeight = 0;
                for (var i = 0; i < messages.length; i++) {
                    messageVO = messages[i];

                    var messageElm;
                    if (messageVO.owner) {
                        messageElm = __createOwnerMessageContent(messageVO);
                    } else {
                        messageElm = __createOutsiderMessageContent(messageVO);
                    }


                    messageContainer.prepend(messageElm);


                    scrollHeight += messageElm.height();

                    if (messageVO.owner) {
                        var spanElm = messageElm.find("span").css({color: "lime"});
                        if (messageVO.delivered) {
                            var elm = $("<span  class='fa fa-check' style='float: left;color:lime;font-size: small' > </span>");

                            spanElm.replaceWith(elm);
                            spanElm = elm;

                            if (messageVO.seen) {
                                var span = "<span  class='fa fa-check' style='float: left;color:lime;font-size: small' > </span>";
                                $(span)
                                    .insertAfter(spanElm)
                                    .css({
                                        "margin-left": "-6px"
                                    });

                            }
                        }

                    } else {

                        var returnData = {
                            messageId: messageVO.messageId
                        };

                        if (!messageVO.delivered) {
                            __chatService.deliver(returnData);
                            messageVO.delivered = true;
                        }

                        if (!messageVO.seen) {
                            if (__canSeeMessage(messageVO.threadId)) {
                                __plusThreadNotSeenCount(messageVO);
                            } else {
                                __chatService.seen(returnData);
                                messageVO.seen = true;
                            }
                        }

                    }
                }

                if(!hasHistory) {

                    var content = "\
                        <div class='alert-success'  style='text-align: center;padding: 5px' role='info'>\
                             " + __dic.NOTMESSAGEEXIST[__lang] + "\
                        </div>\
                    ";
                    messageContainer.prepend(content);
                }

                scrollContainer.scrollTop(scrollHeight);

                if (messageVO && messageVO.messageId) {
                    __threads[threadId].lastHistoryMessageId = messageVO.messageId;
                }

            }

        },

        __addRuleClassToStyleSheet = function (className, url) {
            //__styleElm.sheet.addRule("."+className, "background-image : url('" + url + "');background-repeat: no-repeat;background-size: contain;background-position: center center;");
            __styleElm.sheet.insertRule("." + className + "{" + "background-image : url('" + url + "');background-repeat: no-repeat;background-size: contain;background-position: center center;}", 0);
        },

        __addRuleClassToStyleSheet2 = function (className, url) {

            //__styleElm.sheet.addRule("."+className, "background-image : url('" + url + "');");
            __styleElm.sheet.insertRule("." + className + "{" + "background-image : url('" + url + "');}", 0);
        },

        __addEmojiCategory = function (categoryName, imageData) {
            __categories[categoryName] = imageData;
            var className = __classPrefixName + categoryName,
                categoryData = imageData.categoryData;
            __categories[categoryName].className = className;
            __addRuleClassToStyleSheet2(className, __categories[categoryName].url);

            var content = "<a class='composer_emoji_tooltip_tab composer_emoji_tooltip_tab_recent " + className + "' categoryName='" + categoryName + "'></a>";

            var categoryElm = $(content)
                .appendTo("#TIS_chat_emojiCategory");

            var cssData = {
                width: categoryData.width + "px",
                height: categoryData.height + "px",
                "background-position": -categoryData.x + "px " + -categoryData.y + "px"
            };

            if (categoryData.backgroundSize) {
                cssData["background-size"] = categoryData.backgroundSize.width + "px " + categoryData.backgroundSize.height + "px ";
            }

            categoryElm.css(cssData);


            // if (categoryName == __config.defaultCategoryName) {
            //     var data = TIS.Util.computeSpriteData(
            //         {
            //             width: 20,
            //             height: 20
            //         },
            //         imageData.categorySpriteData,
            //         imageData.meta.imageSize);
            //
            //     var iContent = "<i class='emoji emoji-w20'></i>";
            //     var iElm = $(iContent).css({
            //         width: "20px",
            //         height: "20px",
            //         "background-position": -data.x + "px " + -data.y + "px",
            //         "background-size": data.backgroundSize.width + "px " + data.backgroundSize.height + "px"
            //     })
            //         .addClass(className);
            //     var parent = $("#TIS_chat_BTN_tooltip");
            //
            //     parent.find("i").remove();
            //     parent.find("span").addClass("input-group-btn");
            //     parent.append(iElm);
            //     //var spriteName = imageData.categoryData.
            // }

            // for (var spriteName in __categories[categoryName].sprites) {
            //     var footerData = __categories[categoryName].sprites[spriteName].footerData;
            //     if (typeof footerData == "object") {
            //         __addEmojiToFooter(categoryName, spriteName, footerData);
            //     }
            // }

            if (!__currentShowCategoryName) {
                categoryElm.addClass("active");
                __showEmojiCategoryImage(categoryName);
            }
        },

        __showEmojiCategoryImage = function (categoryName) {

            __currentShowCategoryName = categoryName;
            var container = $("#TIS_chat_emojiCategory_content").empty(),
                data = __categories[categoryName];

            for (var spriteName in __categories[categoryName].sprites) {
                var sprite = __categories[categoryName].sprites[spriteName].categoryData;

                var emojiContent = "\
                        <a class='composer_emoji_btn' categoryName='" + categoryName + "' spriteName='" + spriteName + "'  data-code='1f604'>\
                            <i class='emoji emoji-w20 " + __categories[categoryName].className + "'></i>\
                        </a>";

                var categoryContentElm = $(emojiContent)
                    .appendTo(container);
                var cssData = {
                    width: sprite.width + "px",
                    height: sprite.height + "px",
                    "background-position": -sprite.x + "px " + -sprite.y + "px"
                };

                if (sprite.backgroundSize) {
                    cssData["background-size"] = sprite.backgroundSize.width + "px " + sprite.backgroundSize.height + "px ";
                }


                categoryContentElm
                    .find("i")
                    .css(cssData);
            }

        },

        __addEmojiToFooter = function (categoryName, spriteName, sprite) {
            var content = "<a class='composer_emoji_btn' categoryName='" + categoryName + "' spriteName='" + spriteName + "' data-code='1f604'>\
                                <i class='emoji emoji-w20 " + __categories[categoryName].className + "'></i>\
                        </a>";

            var cssData = {
                width: sprite.width + "px",
                height: sprite.height + "px",
                "background-position": -sprite.x + "px " + -sprite.y + "px"
            };
            if (sprite.backgroundSize) {
                cssData["background-size"] = sprite.backgroundSize.width + "px " + sprite.backgroundSize.height + "px ";
            }

            $(content)
                .appendTo(__emojiFooterElm)
                .find("i")
                .css(cssData);

            $(content)
                .appendTo(__miniEmojiElm)
                .find("i")
                .css(cssData);
            //__miniEmojiElm.append(content);
        },

        __removeThread = function (threadId) {
            if (__threads[threadId]) {
                __rightContainerElm.find("div[threadId=" + threadId + "]").remove();
                __msgContainerElm.find("div[threadId=" + threadId + "]").remove();

                if (__currentVisibleThreadId == threadId) {
                    __currentVisibleThreadId = undefined;
                    __miniMessageContainerElm.attr("placeholder","");
                    __threadTitle.hide();
                }
                delete __threads[threadId];
            }

        },

        __removeRequest = function (requestId) {
            __rightContainerElm.find("div[requestId=" + requestId + "]").remove();
        },

        __removeAllThread = function () {
            __rightContainerElm.empty();
            __msgContainerElm.empty();
            __currentVisibleThreadId = undefined;
            //__sendTextElm.attr({
            //    'disabled': true,
            //    contenteditable : false
            //});
            __threads = {};
            __mapUserToThread = {};
            __threadTitle.hide();
        },

        __createUserThreadView = function (params) {
            var reportContent = "";


            if (!params.isGSThread) {
                reportContent = "<div class='fa fa-ban TIS-chat-reportUser' style='position: absolute;color: red;cursor: pointer;left:1em;bottom:0.01em;display: none'>";
            }

            var userContainer = "\
                <div class='user_Container' requestId=" + params.requestId + " style='border-bottom:0.3em solid rgb(113, 123, 149);padding-left:0;padding-right:0;cursor : pointer'>\
                    <i class='fa fa-spin fa-spinner'></i>\
                    <div class='col-md-6 col-xs-6 avatar' style='padding-right:0'></div>\
                    <div class='col-md-6 col-xs-6 ' style='padding-left:0;padding-right:0'>\
                        <div style='padding-top: 5px;word-wrap: break-word;'>\
                            <p style='white-space: nowrap;'></p>\
                                " + reportContent + "\
                            </div>\
                        </div>\
                    </div>\
                </div>\
            ";


            var containerElm;

            if (params.isGSThread) {
                //$(".TIS_chat_threadContainer").prepend(containerElm);
                containerElm = $(userContainer).prependTo(".TIS_chat_threadContainer");
            } else {
                //$(".TIS_chat_threadContainer").append(userContainer);
                containerElm = $(userContainer).appendTo(".TIS_chat_threadContainer");
            }

            return containerElm;
        },

        __createParticipantImageClass = function(threadId,participantData) {
            var className = "fa fa-user fa-3x";

            if (participantData.image) {
                className = __userImageclassPrefixName + participantData.id;
                __addRuleClassToStyleSheet(className, participantData.image.url);
                participantData.image.className = "img-responsive img-circle img-rounded " + className;
            } else {
                participantData.image = {
                    className: className
                }
            }

            __threads[threadId].participants[participantData.id] = participantData;
        },

        __getThreads = function(callback) {
            __isLoadingThread = true;
            var loadingElms = [];

            loadingElms.push($(__loadingContent).appendTo(__rightContainerElm));
            if(__extraUserThreadContainer) {
                loadingElms.push($(__loadingContent).appendTo(__extraUserThreadContainer));
            }
            __chatService.getThreads({
                //count : 10,
                offset : __currentThreadsOffset,
                addFromService : true,
                onResult : function(result) {
                    for (var i = 0; i < loadingElms.length; i++) {
                        loadingElms[i].remove();
                    }
                    __isLoadingThread =false;
                    __currentThreadsOffset = result.nextOffset;

                    if(result.hasThread) {
                        __initUserThreadScrollEvent(__extraUserThreadContainer);
                    }
                    callback && callback();
                }
            })
        },

        __addNewThread = function (params) {
            //console.log("__addNewThread",params);
            var threadId = params.threadId;
            if(__threads[threadId]) {
                return;
            }
            __threads[threadId] = params;
            __threads[threadId].notSeen = [];
            __threads[threadId].isGetAllHistory = false;
            __threads[threadId].isLoading = false;
            __threads[threadId].messageHistoryOffset = 0;


            var imageContent = "<i class=' fa fa-user fa-3x' style='padding-right: 0.2em'></i>";
            if (params.image) {
                imageContent = "<img src='" + params.image.url + "' class='img-responsive img-circle img-rounded'>";
            }

            var userThreadContainer;

            if (params.requestId) {
                var container = $(".TIS_chat_threadContainer").find("[requestId=" + params.requestId + "]");

                if (container.length > 0) {
                    container.removeAttr("requestId");
                    userThreadContainer = container;
                }
            }

            if (!userThreadContainer) {
                userThreadContainer = __createUserThreadView({
                    isGSThread: params.isGSThread
                });
            }

            if(params.group) {
                userThreadContainer.find(".TIS-chat-reportUser").remove();
            }
            userThreadContainer
                .attr({
                    threadId: params.threadId
                })
                .find("i").remove();

            __threads[threadId].userThreadContainer = userThreadContainer;

            var isSupporterThread = false,
                supporterIds = __service.getConfig().supporterIds;

            if(supporterIds) {
                for (var i = 0; i < supporterIds.length; i++) {
                    if (params.participants[supporterIds[i]]) {
                        isSupporterThread = true;
                    }
                }
            }


            if (!isSupporterThread) {
                var participantsId = Object.keys(params.participants);
                var participantId;
                if (participantsId.length == 1) {
                    participantId = params.participants[participantsId[0]].id;
                }

                userThreadContainer.find(".TIS-chat-reportUser")
                    .attr({
                        threadId: params.threadId,
                        userId: params.owner.id,
                        participantId: participantId
                    })
                    .show();

            }
            userThreadContainer.find(".avatar").append(imageContent);
            userThreadContainer.find("p").append(params.title);


            var className;
            var participants = params.participants;
            for (var userId in participants) {

                if(!params.group) {// just map private chat
                    __mapUserToThread[userId] = params.threadId;
                }
                __createParticipantImageClass(params.threadId, participants[userId]);
            }

            var owner = params.owner,
                avatar = owner.image;
            className = "fa fa-user fa-3x";

            if (avatar) {
                className = __userImageclassPrefixName + owner.id;
                __addRuleClassToStyleSheet(className, avatar.url);
                owner.image.className = "img-responsive img-circle img-rounded " + className;
            } else {

                owner.image = {
                    className: className
                }
            }

            var userMsgContainer = "\
                <div  threadId=" + params.threadId + " style='display: none;'></div>\
            ";

            if(params.position == "top") {
                $(userMsgContainer).prependTo(__msgContainerElm);
            } else {
                $(userMsgContainer).appendTo(__msgContainerElm);
            }


            var extraThreadContainer;
            if(__extraUserThreadContainer && __extraThreadMessageContainer) {
                extraThreadContainer = userThreadContainer.clone(true);
                if(params.position == "top") {
                    __extraUserThreadContainer.prepend(extraThreadContainer);
                } else {
                    __extraUserThreadContainer.append(extraThreadContainer);
                }
                __extraThreadMessageContainer.append(userMsgContainer);
            }


            if(__extraThreadViewData[threadId]) {
                __extraThreadViewData[threadId].onLoad && __extraThreadViewData[threadId].onLoad();
                //__selectThread(threadId);
                __getThreadMessageHistory(threadId);

                if(!__extraThreadViewData[threadId].visible) {
                    userThreadContainer.hide();
                    if(extraThreadContainer) {
                        extraThreadContainer.hide();
                    }
                }
                //__getThreadHistory(threadId,false,__extraThreadData[threadId].container);
            } else {
                if (!__currentVisibleThreadId) {
                    __selectThread(threadId, userThreadContainer);
                }
            }

            //__getThreadMessageHistory(threadId);

            if(__selectThreadRequestUserId != undefined) {
                __self.selectThreadWithUserId(__selectThreadRequestUserId);
            }
        },

        __visibilityFN = function(visibility) {

            if(typeof visibility == "boolean") {
                if(visibility) {
                    __gameMethods.show();
                } else {
                    __gameMethods.hide();
                }
            }
            return __visibility;
        };

    /*==================================================================================================================
     *                                 P R O T E C T E D     M E T H O D
     *================================================================================================================*/

    /*==================================================================================================================
     *                                 P U B L I C     M E T H O D
     *================================================================================================================*/
    __self.show = function (params) {
        if (__useMiniUI) {
            if (params) {
                var miniUICss = params.miniUI;
                if (typeof miniUICss == "object") {
                    if(miniUICss.color) {
                        __uiConfig.miniUIColor = miniUICss.color;
                    }
                    __miniUIElm.css(miniUICss);
                }
            }
            __miniUIElm.show();
        } else {
            var showParam ;
            if(params) {
                showParam = {
                    showMode: params.showMode
                };
            }
            __showUI(showParam);
        }

        return __gameMethods;
    };

    __self.hide = function () {
        __visibility = false;

        if(__useMiniUI) {
            __miniUIElm.hide();
        }
        __mainUI.hide();
        return __gameMethods;
    };

    __self.addThread = function(params) {
        if(params && (typeof params.threads === "object")) {
            var threadIds = [];

            for(var threadId in params.threads) {
                var threadData = params.threads[threadId];
                if(threadData.container) {
                    if(!__extraThreadViewData[threadId]) {
                        __extraThreadViewData[threadId] = {
                            container : threadData.container,
                            onLoad : threadData.onLoad,
                            visible : (typeof threadData.visible === "boolean") ?threadData.visible : true
                        };

                        if(__threads[threadId]) {
                            if(!__extraThreadViewData[threadId].visible) {
                                __threads[threadId].userThreadContainer.hide();
                            }
                            threadData.onLoad && threadData.onLoad();
                            var messageElmData = __msgContainerElm.find("div[threadId='" + threadId + "']").clone().show();
                            __extraThreadViewData[threadId].container.append(messageElmData);

                        } else {
                            threadIds.push(parseInt(threadId));
                        }

                    } else {
                        __extraThreadViewData[threadId].container = threadData.container;
                        threadData.onLoad && threadData.onLoad();
                        var messageElmData = __msgContainerElm.find("div[threadId='" + threadId + "']").clone().show();

                        __extraThreadViewData[threadId].container.append(messageElmData);

                        __extraThreadViewData[threadId].container.scrollTop(function () {
                            return this.scrollHeight;
                        });
                    }
                    __initMessageScrollEvent(threadData.container,threadId);
                } else {
                    if(!__threads[threadId]) {
                        threadIds.push(parseInt(threadId));
                    }
                }

            }

            if(threadIds.length>0) {
                __chatService.addThread({
                    threadIds: threadIds
                });
            }

            if(typeof params.visible == "boolean" && params.visible) {
                __self.show();
            }

        }
    };

    /**
     *@method addAllThread
     *@public
     *
     * @param {Object} params
     *      @param {Object} params.threadContainer
     *      @param {Object} params.messageContainer
     *      @param {Function} params.onLoad
     *
     *
     * */
    __self.addAllThread = function(params) {
        if(params && params.threadContainer && params.messageContainer) {
            if(__extraUserThreadContainer && __extraThreadMessageContainer) {
                var userThreadsElm = __extraUserThreadContainer.children();
                var userMessageElm = __extraThreadMessageContainer.children();

                __extraUserThreadContainer = params.threadContainer;
                __extraThreadMessageContainer = params.messageContainer;

                __extraUserThreadContainer.append(userThreadsElm);
                __extraThreadMessageContainer.append(userMessageElm);

            } else {
                __extraUserThreadContainer = params.threadContainer;
                __extraThreadMessageContainer = params.messageContainer;

            }
            __initUserThreadContainerEvent(__extraUserThreadContainer);
            __initMessageScrollEvent(__extraThreadMessageContainer);
            __initUserThreadScrollEvent(__extraUserThreadContainer);
        }

        if(__currentThreadsOffset === 0 ) {
            __getThreads(params && params.onLoad);
        } else {
            params && params.onLoad && params.onLoad();
        }
    };

    /**
     *@method chatRequest
     *@public
     *
     * @param {Object} params
     *  @param {Number} params.userId
     *  @param {Function} params.onResult
     *      @param {Boolean} params.hasError
     *      @param {String} params.errorMessage
     *  @param {Function} params.onNewThread
     *      @param {Number} params.onNewThread.threadId
     * */
    __self.chatRequest = function(params) {
        __chatService.chatRequest(params);
    };

    __self.sendMessage = function(params) {
        var messageParam = {
            threadId : params.threadId
        };

        if(params.container) {
            messageParam.messageData = __parseSendMessageContainer(params.container);
        } else {
            messageParam.messageData = {
                message : [],
                emojiCount : 0,
                textLength : 0
            }
        }

        if(params.text) {
            messageParam.messageData.message.push(params.text);
            messageParam.messageData.message.textLength += params.text.length;
        }

        if(params.spriteData) {
            messageParam.messageData.message.push([__messageTypes.SPRITE, params.spriteData.categoryName, params.spriteData.spriteName]);
            messageParam.messageData.message.emojiCount += 1;
        }


        var ret = __sendMessage(messageParam);

        if(params.container && ret) {
            params.container.empty();
        }

    };

    __self.on = function(eventName,callback) {
        if(__eventCallbacks[eventName]) {
            var id = TIS.Util.generateUUID();
            __eventCallbacks[eventName][id] = callback;
            return id;
        }
    };

    __self.selectThreadWithUserId = function(userId) {

        var threadId = __mapUserToThread[userId];

        if(threadId && __threads[threadId])  {
            if(threadId != __currentVisibleThreadId ) {
                __selectThread(threadId);
                __selectThreadRequestUserId = undefined;
            }

        } else {
            __selectThreadRequestUserId = userId;
        }

    };

    __self.onRegisterChatService = function (service) {

        __chatService = service;

        __chatService.onNewThread = function (params) {
            __addNewThread(params);
        };

        __chatService.onChatRequest = function (params) {
            __createUserThreadView(params);
        };

        __chatService.onNewEmojiCategory = function (params) {

            for (var categoryName in params) {
                __addEmojiCategory(categoryName, params[categoryName]);

            }
            for(var id in __eventCallbacks.newEmojiCategory) __eventCallbacks.newEmojiCategory[id](params);
        };

        __chatService.onUpdateEmojiCategory = function (params) {
            for (var categoryName in params) {
                if (!__categories[categoryName]) {
                    __addEmojiCategory(categoryName, params[categoryName]);
                } else {
                    __categories[categoryName] = params[categoryName];
                    __categories[categoryName].className = __classPrefixName + categoryName;
                    if (__currentShowCategoryName == categoryName) {
                        __showEmojiCategoryImage(categoryName);
                    }
                }
                __msgEmojiContainerElm.find(".TIS_chat_NotSprite").each(function (e, elm) {
                    var categoryName = $(this).attr("categoryName");
                    var spriteName = $(this).attr("spriteName");

                    if (__categories[categoryName] && __categories[categoryName].sprites[spriteName]) {
                        var newElm = __createSpriteElement(categoryName, spriteName);
                        $(this).replaceWith(newElm);
                    }
                });

            }
        };

        __chatService.onReceiveMessage = function (messageVO) {

            var $msgContent,
                threadId = messageVO.threadId;

            if (messageVO.owner) {
                $msgContent = __createOwnerMessageContent(messageVO);

                if(messageVO.delivered) {
                    var htmlContent = "<span  class='fa fa-check' style='float: left;color:lime;font-size: small' > </span>";
                    $msgContent.find("span").replaceWith(htmlContent);
                }

            } else {
                $msgContent = __createOutsiderMessageContent(messageVO);

                if (!__visibility) {
                    __useMiniUI && __miniUIElm.css("color", "green");
                } else {
                    if(__isMinimize && !__isAppInBackground) {

                        var template = "\
                            <div class='popover' role='tooltip'> \
                                <div class='arrow'></div>\
                                <div class='popover-title'></div>\
                                <div class='popover-content' style='padding-top:0;padding-bottom: 0;text-align: center'></div>\
                            </div>";

                        __headerElm
                            .popover('destroy')
                            .popover({
                                container: 'body',
                                placement: "top",
                                trigger: "manual",
                                html: true,
                                template : template,
                                title : function() {
                                    var senderName = "";

                                    if(messageVO.participant && messageVO.participant.name && __threads[messageVO.threadId].group) {
                                        senderName = "&nbsp,&nbsp" + messageVO.participant.name;
                                    }
                                    var titleContent = "\
                                        <div>\
                                            <i class='fa fa-times fa-2x' style='position: absolute;left: 0;top:0;color:#fa8d2e'></i>\
                                            <div>"+__threads[threadId].title + senderName +"</div>\
                                        </div>\
                                    ";

                                    var $title = $(titleContent);

                                    $title.find("i").on("click", function () {
                                        __headerElm.popover('destroy');
                                        clearTimeout(__lastMiniMessageTimeout);
                                        __lastMiniMessageTimeout = undefined;
                                    });

                                    return $title;
                                },
                                content : function(e) {
                                    var $Data = $msgContent.find(".msg_receive").clone();
                                    $Data.find("time").remove();

                                    $Data.on("click", function () {

                                        __selectThread(threadId);
                                        __miniMessageContainerElm.val("");
                                    });
                                    return $Data;
                                }
                            }).popover("toggle");

                        if(__lastMiniMessageTimeout) {
                            clearTimeout(__lastMiniMessageTimeout);

                        }
                        __lastMiniMessageTimeout = setTimeout(function() {
                            __headerElm.popover('destroy');
                            __lastMiniMessageTimeout = undefined;
                        },3000);

                        //if(__currentVisibleThreadId == messageVO.threadId) {
                        //
                        //} else {
                        //    __headerElm.css("background-color", "#0DA20D");
                        //    __headerElm.find(".fa-comments").css("color", "rgb(52, 185, 248)");
                        //}

                    }
                }
                __service.onReceiveChatMessage({
                    message: $msgContent[0]
                });

                var returnData = {
                    messageId: messageVO.messageId
                };

                if (!messageVO.delivered) {
                    __chatService.deliver(returnData);
                }

                if (__canSeeMessage(threadId)) {
                    __plusThreadNotSeenCount(messageVO);
                } else {
                    __chatService.seen(returnData);
                }
            }

            __msgContainerElm.find("div[threadId=" + threadId + "]").append($msgContent);


            if(__extraThreadViewData[threadId]) {
                __extraThreadViewData[threadId].container.append($msgContent.clone(true));
                __extraThreadViewData[threadId].container.scrollTop(function () {
                    return this.scrollHeight;
                });
            }

            if(__extraUserThreadContainer) {
                __extraThreadMessageContainer.find("div[threadId=" + threadId + "]").append($msgContent.clone(true));
                __extraThreadMessageContainer.scrollTop(function () {
                    return this.scrollHeight;
                });
            }

            __msgEmojiContainerElm.scrollTop(function () {
                return this.scrollHeight;
            });


            if (__autoShow) {
                __showUI();
            }
        };

        __chatService.onRemoveThread = function (params) {
            //console.log("onRemoveThread",params);
            if (params.threadId) {
                __removeThread(params.threadId);
            }

            if (params.requestId) {
                __removeRequest(params.requestId);
            }
        };

        __chatService.onLogin = function () {
            __removeAllThread();

            //setTimeout(function () {
            //    __getThreads();
            //}, 5000);
        };

        __chatService.onLogout = function () {
            __removeAllThread();
            __extraThreadViewData = {};
            __currentThreadsOffset = 0;
        };

        __chatService.onSeen = function (params) {
            var messageContainerElm = __msgContainerElm.find("div[threadId=" + params.threadId + "]").find("div[messageId=" + params.messageId + "]");

            if (messageContainerElm.length == 1) {
                var spanElm = messageContainerElm.find("span");
                var len = spanElm.length;
                if (len > 0) {
                    //if(len == 1) {
                    //    var span = $("<span  class='fa fa-check' style='float: left;color:lime;font-size: small' > </span>");
                    //    if(! spanElm.hasClass("fa-check")) {
                    //        spanElm.replaceWith(span);
                    //        spanElm = span;
                    //    }
                    //    $(span)
                    //        .insertAfter(spanElm)
                    //        .css({
                    //            "margin-left" : "-6px"
                    //        });
                    //} else {
                    //    var sElm = $("<span  class='fa fa-check' style='float: left;color:lime;font-size: small' > </span>" +
                    //                    "<span  class='fa fa-check' style='margin-left : -6px;float: left;color:lime;font-size: small' > </span>");
                    //    spanElm.replaceWith(sElm);
                    //}

                    var sElm = $("<span  class='fa fa-check' style='float: left;color:lime;font-size: small' > </span>" +
                    "<span  class='fa fa-check' style='margin-left : -6px;float: left;color:lime;font-size: small' > </span>");
                    spanElm.replaceWith(sElm);
                }
            }
        };

        __chatService.onDeliver = function (params) {
            var messageContainerElm = __msgContainerElm.find("div[threadId=" + params.threadId + "]").find("div[messageId=" + params.messageId + "]");
            if (messageContainerElm.length == 1) {
                var spanElm = messageContainerElm.find("span");
                var len = spanElm.length;
                if (len == 1) {
                    var sElm = $("<span  class='fa fa-check' style='float: left;color:lime;font-size: small' > </span>");
                    spanElm.replaceWith(sElm);
                }
            }
        };

        __chatService.onShow = function (params) {
            __self.show(params);
        };

        __chatService.onHide = function () {
            __self.hide();
        };

    };

    __self.onRegisterService = function (service) {
        __service = service;
    };

    __self.getActiveThreadId = function() {
        return __currentVisibleThreadId;
    };

    __self.visibility = __visibilityFN;

    /**
     * @method show
     * @public
     * @chainable
     *
     * */
    __gameMethods.show = function(params) {
        __self.show(params);
        return __gameMethods;
    };

    /**
     * @method hide
     * @public
     * @chainable
     *
     *
     *
     * */
    __gameMethods.hide = function() {
        __self.hide();
        return __gameMethods;
    };

    /**
     * @method visibility
     * @public
     *
     * @param  {Boolean} visibility
     * @return {Boolean} visibility
     * */
    __gameMethods.visibility = __visibilityFN;

    /**
     * @method toggle
     * @public
     * @chainable
     *
     * */
    __gameMethods.toggle = function() {

        if(__visibility) {
            __self.hide();
        } else {
            __self.show();
        }
        return __gameMethods;
    };

    __gameMethods.css = function (params) {
        if(params) {
            var miniUICss = params.miniUI;
            if (typeof miniUICss == "object") {
                if(miniUICss.color) {
                    __uiConfig.miniUIColor = miniUICss.color;
                }
                __miniUIElm.css(miniUICss);
            }
        }

        return __gameMethods;
    };

    __gameMethods.config = function (params) {
        if(params) {
            if(typeof params.draggable == "boolean") {
                __draggable = params.draggable;
            }
        }

        return __gameMethods;
    };
    
    
    __init();
};

TIS.ChatUI.MAXIMIZE = 1;
TIS.ChatUI.MINIMIZE = 2;