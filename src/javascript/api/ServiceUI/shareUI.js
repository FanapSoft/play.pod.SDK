/**
 * @class ShareUI
 * @module ServiceUI
 * @submodule ServiceUI
 *
 * */
TIS.ShareUI = function (options) {

    var __self = this,
        __parent = options.parent,
        __dic = options.dictionary,
        __lang = options.language,
        __nickNameInputElm,__nickNameListElm,
        __phoneNumberInputElm,__phoneNumberListElm,__smsLabelElm,
        __smsCheckboxElm,__shareSocialCheckboxElm,__shareSocialLabelElm,
        __leagueNameContainerElm,__gameNameMenu,
        __gameNameContainerElm,
        __addPhoneNumberElm,
        __visibility = false,
        __isApp = TIS.Util.isApp(),
        __isUiInit = false,

        __shareLeagueId,
        __onHideCallback,

        __enableCssData = {"pointer-events": "","opacity": ""},
        __disableCssData = {"pointer-events": "none","opacity": "0.5"};
    

    var __init = function () {
            __initView();

            __nickNameInputElm = $("#TIS_share_input_nikeName");
            __nickNameListElm = $("#TIS_share_list_nikeName");
            __phoneNumberInputElm = $("#TIS_share_input_phoneNumber");
            __phoneNumberListElm = $("#TIS_share_list_phoneNumber");
            __smsCheckboxElm = $("#TIS_share_input_sendSms");
            __smsLabelElm = $("#TIS_share_label_sendSms");
            __shareSocialCheckboxElm = $("#TIS_share_input_shareSocial");
            __shareSocialLabelElm = $("#TIS_share_label_shareSocial");
            __addPhoneNumberElm = $("#TIS_share_addPhoneNumber");
            __gameNameContainerElm = $("#TIS_share_gameName_container");
            __leagueNameContainerElm = $("#TIS_share_leagueNameContainer");
            __gameNameMenu = $("#TIS_share_gameNameMenu");


            __initEvent();

            if(!__isApp) {
                $('#TIS_share_sendSmsContainer').hide();
                $('#TIS_share_shareSocialContainer').hide();
            }
        },

        __initView = function () {
            var registerElm = "\
            <div  id='TIS_share_container'>\
                <div id='TIS_share_header' style='text-align: center;margin-top: 20px' >\
                    <span id='TIS_share_close' class='tis tis-close-circle tis-2x  TIS-pointer' style='float: right;margin-right: 10px;color:#1cb7d4;font-weight:bold'></span>\
                    <div class='panel-title' style='font-weight: bold'>" + __dic.SHARE[__lang] + "</div>\
                </div>\
                <div id='TIS_share_body' class='TIS_scroll' style='overflow-y:auto;width:100%'>\
                    <div id='TIS_share_leagueNameContainer' style='width: 100%;display: none;text-align: center;padding: 10px'></div>\
                    <div id='TIS_share_gameNameMenu' class='form-group dropdown' style='width: 100%;padding-top:20px'>\
                        <div data-type='TIS-menu'>\
                             <div class='input-group-btn'  style='padding-right:30px;padding-left:30px '>\
                                 <button type='button' class='btn btn-default dropdown-toggle input-lg' data-toggle='dropdown' style='width: 100%;height:60px;display:block;border-radius: 10px;'>\
                                    <div class='row'>\
                                        <div class='col-lg-3 col-md-3 col-sm-3 col-xs-3'><img TIS-DATA='IMG' style='width:50px;height:50px;float:right;display:none;border-radius: 5px;'></div>\
                                        <div class='col-lg-6 col-md-6 col-sm-6 col-xs-6'><span TisDropText='game' style='float:right;padding:15px'>" + __dic.SELECT_LEAGUE[__lang] + "</span></div>\
                                        <div class='col-lg-3 col-md-3 col-sm-3 col-xs-3'><span class='tis tis-2x  tis-down-dir' style='float:left;padding-top:10px'></span></div>\
                                    </div>\
                                 </button>\
                                 <ul id='TIS_share_gameName_container' class='dropdown-menu' role='menu' style='width: 100%;overflow-y: auto;z-index: 1051;'>\
                                     <li id='TIS_share_gameName_loading' class='alert alert-success tis-spin4'  style='display:none;text-align: center' role='info'>\
                                         " + __dic.UPDATING[__lang] + "\
                                     </li>\
                                 </ul>\
                             </div>\
                        </div>\
                    </div>\
                    <div style='width: 100%;padding-top:20px'>\
                        <div class='col-lg-6 col-md-6 col-sm-6 col-xs-12'>\
                            <div class='input-group'>\
                                <span class='input-group-addon'>\
                                    <span class='tis tis-search' style='font-size: 1.3em'></span>\
                                </span>\
                                <input id='TIS_share_input_nikeName' type='text' class='form-control' placeholder='"+__dic.NICKNAME[__lang]+"' data-toggle='popover' data-placement='bottom' data-trigger='manual'>\
                            </div>\
                            <div id='TIS_share_list_nikeName' style='width: 100%; height: 125px; margin-top: 10px;margin-bottom: 10px;border: 1px dotted #000000;overflow-y: auto;overflow-x: hidden'></div>\
                        </div>\
                        <div class='col-lg-6 col-md-6 col-sm-6 col-xs-12'>\
                            <div class='col-lg-10 col-md-10 col-sm-10 col-xs-10' style='padding-left: 0;padding-right: 0'>\
                                <div class='input-group'>\
                                    <span class='input-group-addon'>\
                                        <span class='tis tis-mobile' style='font-size: 1.3em'></span>\
                                    </span>\
                                    <input id='TIS_share_input_phoneNumber' type='text' class='form-control'\
                                         type='tel' \
                                        class='form-control' \
                                        placeholder ='" + __dic.PHONENUMBER[__lang] + "'\
                                    >\
                                </div>\
                                </div>\
                            <div class='col-lg-2 col-md-2 col-sm-2 col-xs-2' style='padding-left: 0;padding-right: 0;margin-bottom: 10px;'>\
                                <button id='TIS_share_addPhoneNumber' class='btn btn-block TIS-orange'  type='submit'>\
                                    <span class='tis tis-plus' style='vertical-align: middle'></span>\
                                </button>\
                            </div>\
                            <div id='TIS_share_list_phoneNumber' style='width: 100%; height: 125px;border: 1px dotted #000000;overflow-y: auto;overflow-x: hidden'></div>\
                        </div>\
                    </div>\
                    <div style='line-height: 18px; font-size: 11px; text-align: right; margin-top:7px;padding-right: 15px;'>\
                        <i class='tis tis-info-circled-1' style='width: 100%;'><span style='padding-right:5px'>نام کاربری مورد نظر را جستجو و آن را با کلیک کردن به لیست زیر اضافه نمایید</span></i>\
                        <i class='tis tis-info-circled-1' style='width: 100%;'><span style='padding-right:5px'>برای حذف از لیست، روی نام یا شماره تماس مورد نظر کلیک نمایید</span></i>\
                    </div>\
                    <div id='TIS_share_sendSmsContainer' class='checkbox' style='margin-bottom:0;white-space: nowrap'>\
                        <input id='TIS_share_input_sendSms' TIS-Type= 'INPUT' type='checkbox' style='display:none;margin-top:8px;'>\
                        <label id='TIS_share_label_sendSms' for='#TIS_share_input_sendSms'>"+__dic.SENDWITHSMS[__lang]+"</label>\
                    </div>\
                    <div id='TIS_share_shareSocialContainer' class='checkbox' style='margin-bottom:0;margin-top:10px;white-space: nowrap'>\
                        <input id='TIS_share_input_shareSocial' TIS-Type= 'INPUT' type='checkbox' style='display:none;margin-top:8px;'>\
                        <label id='TIS_share_label_shareSocial' for='#TIS_share_input_shareSocial'>"+__dic.SHARETOSOCIAL[__lang]+"</label>\
                    </div>\
                </div>\
                <div id='TIS_share_footer' style='position: absolute;width: 100%;bottom: 0'>\
                    <div \
                        id='TIS_share_share'\
                        class='TIS-pointer TIS-BTN' \
                        style='margin:25px auto;background-color: #1cb7d4;min-width:200px;max-width:400px;height: 60px'>\
                        <span style='display: table-cell;vertical-align: middle;font-size: 20px;'> " + __dic.SHARE[__lang] + "</span>\
                    </div>\
                </div>\
            </div>";

            $(registerElm).appendTo(document.body).modal("hide");
        },

        __isValid = function (p) {
            if(typeof p == "number") {
                p = p + "";
            }
            var phoneRe = "^09[\\d-]{9,9}$";
            var digits = p.replace(/\D/g, "");
            return (digits.match(phoneRe) !== null);
        },

        __onWindowResize = function () {
            var height = $(window).height();
            var minusHeight = $("#TIS_share_header").height() +  $("#TIS_share_footer").height();

            $("#TIS_share_body").height((height - minusHeight ) + "px");
        },

        __alert = function(message,isPositive) {

            if(message != undefined) {
                if(isPositive) {
                    __parent.info(message);
                } else {
                    __parent.alert(message);
                }
            }
        },

        __initEvent = function () {
            $("#TIS_share_container").on("hidden.bs.modal", function () {
                __reset();
            });

            __nickNameInputElm
                .on("keyup", function () {
                    //__nickNameInputElm.popover("hide");
                    var name = $(this).val();

                    if(name && name.length>0) {
                        __parent.searchUserRequest({
                            name: name
                        },function (result) {

                            if (!result.hasError) {

                                var users = result.result.users;
                                var htmlContent = $("<div style='overflow: hidden'></div>");
                                for (var userId in users) {
                                    (function(id){
                                        var currentUser = __nickNameListElm.find("div[userid="+id+"]");

                                        if(currentUser.length>0) {
                                            return;
                                        }
                                        var user = users[id],
                                            spn;

                                        var imageUrl = null;
                                        if(typeof user.imageUrl === "string") {
                                            imageUrl = user.imageUrl
                                        } else if(typeof user.image === "object" && user.image!== null) {
                                            imageUrl = __parent.getService().generateImageSrc(user.image);
                                        }

                                        if (imageUrl) {
                                            spn = "<image class='img-circle' style='background: url(" + imageUrl + ")no-repeat center center;width:2em;height:2em;background-size: cover' ></image>";
                                        } else {
                                            spn = "<span class='tis tis-2x tis-user'></span>";
                                        }

                                        var userContent = "\
                                            <div class='col-lg-12 col-md-12 col-sm-12 col-xs-12' userId="+id+" style='padding-top: 5px;cursor: pointer'>\
                                                <div class='col-lg-2 col-md-2 col-sm-2 col-xs-2'>\
                                                    "+spn+"\
                                                </div>\
                                                <div class='col-lg-10 col-md-10 col-sm-10 col-xs-10' style='display: table;height: 2em'><span style='display: table-cell;vertical-align: middle'>" + user.name + "</span></div>\
                                            </div>\
                                        ";
                                        var elm = $(userContent)
                                            .on("click", function () {
                                                var currentUser = __nickNameListElm.find("div[userid="+id+"]");

                                                if(currentUser.length>0) {
                                                    return;
                                                }

                                                var opt = $(userContent).appendTo(__nickNameListElm);
                                                opt.on("click", function () {
                                                    $(this).remove();
                                                });

                                                __nickNameInputElm.popover("hide");
                                            });

                                        htmlContent.append(elm);
                                    })(userId);
                                }

                                __nickNameInputElm
                                    .popover('destroy')
                                    .popover({
                                        html: true,
                                        placement: "bottom",
                                        delay: { show: 350, hide: 100 },
                                        content : function(e) {
                                            return htmlContent;
                                        }
                                    }).popover("show");
                            }
                        });
                    }

                })
                .on("focus",function() {
                    __nickNameInputElm.popover('show');
                })
                .on("blur",function() {
                    __nickNameInputElm.popover('hide');
                });


            __smsLabelElm.on("click", function () {
                __smsCheckboxElm.click();

                if(__smsCheckboxElm.prop("checked")) {
                    __nickNameInputElm.css(__disableCssData);
                    __nickNameListElm.css(__disableCssData);

                    __shareSocialLabelElm.css(__disableCssData);
                    __shareSocialCheckboxElm.prop("checked", false);
                } else {
                    __nickNameInputElm.css(__enableCssData);
                    __nickNameListElm.css(__enableCssData);
                    __shareSocialLabelElm.css(__enableCssData);
                }

            });

            __shareSocialLabelElm.on("click", function () {
                __shareSocialCheckboxElm.click();

                if(__shareSocialCheckboxElm.prop("checked")) {
                    __nickNameInputElm.css(__disableCssData);
                    __nickNameListElm.css(__disableCssData);
                    __phoneNumberInputElm.css(__disableCssData);
                    __phoneNumberListElm.css(__disableCssData);
                    __addPhoneNumberElm.css(__disableCssData);

                    __smsLabelElm.css(__disableCssData);
                    __smsCheckboxElm.prop("checked", false);
                } else {
                    __nickNameInputElm.css(__enableCssData);
                    __nickNameListElm.css(__enableCssData);
                    __phoneNumberInputElm.css(__enableCssData);
                    __phoneNumberListElm.css(__enableCssData);
                    __addPhoneNumberElm.css(__enableCssData);
                    __smsLabelElm.css(__enableCssData);
                }

            });

            __addPhoneNumberElm.on("click", function () {

                var tel = __phoneNumberInputElm.val();


                if(__isValid(tel)) {

                    var currentUser = __phoneNumberListElm.find("div[phoneNumber="+tel+"]");

                    if(currentUser.length>0) {
                        return;
                    }

                    __phoneNumberInputElm.val("");;
                    var telContent = "<div phoneNumber='"+tel+"' style='height: 2em'>"+tel+"</div>";
                    var telElm = $(telContent).on("click", function () {
                        $(this).remove();
                    });
                    __phoneNumberListElm.append(telElm);
                } else {
                    __alert(__dic.PHONE_INVALID[__lang], false);
                }
            });

            $("#TIS_share_share").on("click", function () {
                var $BTN = $(this);

                var gameId = __gameNameContainerElm.attr("gameId");

                if(!gameId && !__shareLeagueId) {
                    __alert(__dic.SELECTGAME[__lang],false);
                    return;
                }

                $BTN.addClass("TIS_disable");

                var phoneNumbers = [],
                    userIds = [],
                    sendSms = __smsCheckboxElm.prop("checked"),
                    shareSocial  = __shareSocialCheckboxElm.prop("checked");

                __nickNameListElm.children().each(function () {
                    userIds.push($(this).attr("userId"));
                });

                __phoneNumberListElm.children().each(function () {
                    phoneNumbers.push($(this).text());
                });

                if(sendSms || shareSocial || phoneNumbers.length>0 || userIds.length>0) {
                    var paramData = {
                        sendSms: sendSms,
                        shareSocial: shareSocial,
                        cellphoneNumbers: phoneNumbers,
                        userIds: userIds,
                        //gameId: gameId
                    };

                    if(__shareLeagueId) {
                        paramData.leagueId = __shareLeagueId;
                    } else {
                        paramData.gameId = gameId;
                    }

                    __parent.shareRequest(paramData, function (result) {
                        $BTN.removeClass("TIS_disable");
                        if (result.hasError) {
                            __alert(result.errorMessage, false);
                        } else {
                            if (!sendSms && !shareSocial) {
                                __alert(__dic.SUCCESSFULSUGGESTIONSEND[__lang], true);
                            }
                            __reset();
                        }
                    });
                    
                } else {
                    $BTN.removeClass("TIS_disable");
                    __alert(__dic.MIN1PHONEORNICKNAME[__lang],false);

                }
            });

            $("#TIS_share_close").on("click", function () {
                __self.hide();
            });

            $(window).on("resize", __onWindowResize);
        },

        __initUi = function () {
            if (!__isUiInit) {
                $("#TIS_share_gameName_loading").show();
                __parent.getGamesInfo({registerGame:true},function (result) {
                    $("#TIS_share_gameName_loading").hide();
                    if (result.hasError) {
                        __alert(result.errorMessage,false);
                        __isUiInit = false;
                    } else {
                        var gamesInfo = result.result.games;
                        var gameNameContainer = __gameNameContainerElm.empty();
                        for (var i=0;i<gamesInfo.length;i++) {
                            var info = gamesInfo[i];
                            var gameId = info.id;
                            if (info.name) {

                                var content = "\
                                    <li>\
                                        <a href='' gameId ='" + gameId + "'>\
                                            " + info.name + "\
                                        </a>\
                                    </li>\
                                    ";

                                if (gamesInfo.length === 1) {
                                    var span = gameNameContainer
                                        .attr({ gameId: gameId})
                                        .closest('div')
                                        .find('span[TisDropText]')
                                        .attr({
                                            gameId: gameId
                                        });

                                    span.text(info.name);
                                }
                                $(content).appendTo(gameNameContainer).find("a").click(function (e) {
                                    e.preventDefault();

                                    var concept = $(this).text().trim();
                                    var gameId = $(this).attr("gameId");

                                    gameNameContainer.attr({gameId: gameId});

                                    var span = $(this)
                                        .closest('div')
                                        .find('span[TisDropText]')
                                        .attr({
                                            gameId: gameId
                                        });

                                    var preText = span.attr("value") + " : ";

                                    span.text(preText + concept);
                                });

                            } else {
                                console.error(info.ID + " is not register in game center!");
                            }
                        }

                        if(gamesInfo.length < 2) {
                            __gameNameMenu.hide();
                        }
                    }
                });
                __isUiInit = true;
            }
        },

        __reset = function () {
            __nickNameListElm.empty();
            __phoneNumberListElm.empty();
        },

        __visibilityFN = function(visibility) {

            if(typeof visibility == "boolean") {
                if(visibility) {
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
        __visibility = true;
        if(params && params.leagueId) {
            __shareLeagueId = params.leagueId;
            // __gameNameMenu.hide();
            __leagueNameContainerElm.show().html(params.leagueName);
            __onHideCallback = params.onHide;
        }
        __initUi();
        $("#TIS_share_container").show();
        __onWindowResize();
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
        __leagueNameContainerElm.hide();
        // __gameNameMenu.show();
        $("#TIS_share_container").hide();
        if(typeof __onHideCallback == "function") {
            __onHideCallback();
            __shareLeagueId = undefined;
            __onHideCallback = undefined;
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
    __self.toggle = function() {

        if(__visibility) {
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