/**
 * @class SignupUI
 * @module ServiceUI
 * @submodule ServiceUI
 *
 * */
TIS.SignupUI = function (options) {

    var __self = this,
        __parent = options.parent,
        __dic = options.dictionary,
        __lang = options.language,
        __$verify,
        __$sifnup,
        __$hasAcount,
        __onHideFunc,
        __visibility = false;

    var __init = function () {
            __initView();
            __$verify = $("#TIS_signUp_verify_container");
            __$sifnup = $("#TIS_signUp_signup_container");
            __$hasAcount = $("#TIS_signUp_signup_hasAccountAlert");

            __initEvent();

        },

        __addAlertToInput = function ($input) {
            $input.css({
                "border-color": "#ff0000"
            });
        },

        __removeAlertFromInput = function ($input) {
            $input.css({
                "border-color": ""
            });
        },

        __initView = function () {
            var registerElm = "\
        <div  id='TIS_signup_container'>\
            <div id='TIS_signUp_signup_hasAccountAlert' style='display:none;position:absolute;height:100%;z-index : 3;height:100%;width:100%;top:0'>\
                <div  style='position:absolute;top: 160px;background-color:white;color:black;z-index : 2;border : 2px solid #D9D9D9;right:10px;left:10px;max-width : 400px;margin: 0 auto;'>\
                    <div>\
                        <div style='padding : 30px 15px 30px 15px;font-size: 12.0pt;font-weight: 400;'>\
                            <div style='white-space: nowrap;text-align: center;'>" + __dic.USER_EXISTS[__lang] + "</div>\
                            <div style='white-space: nowrap;text-align: center;'>" + __dic.WANT_LOGIN[__lang] + "</div>\
                        </div>\
                        <div style='display: inline-block;width:100%;padding:15px 10px 15px 10px'>\
                            <div class='col-lg-6 col-md-6 col-sm-6 col-xs-6' style='text-align:center;padding-right:0;padding-left:0;border : 2px solid #D9D9D9'>\
                                <button id='TIS_signUp_signup_login' class='btn btn-block btn-lg ' style='height:55px;background-color:#FFB300;border-radius: 0;font-size: 14.0pt;font-weight: 400;'>\
                                    <span>" + __dic.LOGIN[__lang] + "</span>\
                                </button>\
                            </div>\
                            <div class='col-lg-6 col-md-6 col-sm-6 col-xs-6' style='text-align:center;padding-right:0;padding-left:0;border : 2px solid #D9D9D9'>\
                                <button id='TIS_signUp_signup_return' class='btn btn-block btn-lg' style='height:55px;background-color:white;border-radius: 0;font-size: 14.0pt;font-weight: 400;'>\
                                    <span>" + __dic.RETURN[__lang] + "</span>\
                                </button>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
            </div>\
            <div id='TIS_signUp_signup_container' style='height:100%;width:100%;position: relative;'>\
                <div style='text-align: center;margin: 10px 10px 0 0;display:inline-block' >\
                    <i id='TIS_signUp_signup_close' class='tis tis-close tis-2x  TIS-pointer' style='float: right;color:#aa070e'></i>\
                </div>\
                <div>\
                    <div style='text-align:center;'>\
                            <i id='TIS_signUp_verify_logo'  class='TIS-logo-img TIS-logo'></i>\
                    </div>\
                    <div id='TIS_signup_signup_form' class='form-horizontal' style='margin-bottom: 10px;' >\
                        <div class='col-lg-4 col-md-4 col-sm-3 col-xs-1' ></div>\
                        <div class='col-lg-4 col-md-4 col-sm-6 col-xs-10' style='text-align:center'>\
                            <div class='row'>\
                                <span style='white-space: nowrap;font-weight:bold'>" + __dic.ENTER_PHONENUMBER_HERE[__lang] + "</span>\
                            </div>\
                            <div class='row' style='padding-top:25px'>\
                                <div  class='input-group' style='width:100%'>\
                                    <input id='TIS_signup_signup_phoneNumber'  style='direction:ltr;border-radius:4px;height: 3.5em;background-color:rgba(217, 217, 217, 0.48)'\
                                        type='tel' \
                                        maxlength='11'\
                                        class='form-control' \
                                        placeholder ='۰۹۱××××××××'>\
                                    <i class='tis tis-mobile' style='position: absolute;right: 15px;z-index:2;font-size: 3.5em;color: #7D7D7D;'></i>\
                                </div>\
                            </div>\
                            <div class='row' style='padding-top:25px'>\
                                <div\
                                    id='TIS_signUp_signup_register'\
                                    class='TIS-pointer TIS-BTN' \
                                    style='margin:15px auto;background-color: #ffb200;width:100%;height:60px;border-radius: 5px;'>\
                                        <span style='display: table-cell;vertical-align: middle;font-size: 20px;'>\
                                            <i class='tis tis-spin tis-spin4' style='display:none'></i>" + __dic.GET_VERIFY_CODE[__lang] + "\
                                        </span>\
                                </div>\
                            </div>\
                            <div class='row'>\
                                <span id='TIS_signUp_signup_hasVerify' style='white-space: nowrap;color:#ffb200;border-bottom: solid 1px black;font-size: 15px;'>\
                                    " + __dic.HAVE_VERIFY_CODE[__lang] + "\
                                    <i class='tis tis-left-open-big' style='padding-right: 20px;'></i>\
                                </span>\
                            </div>\
                            <div  class='row' style='padding-top:40px;font-size: 12px;'>\
                                <span id='TIS_signUp_signup_rules' style='white-space: nowrap;color:black;border-bottom: solid 1px black;'>" + __dic.ACCEPT_RULE_WITH_REGISTER[__lang] + "</span>\
                            </div>\
                        </div>\
                        <div class='col-lg-4 col-md-4 col-sm-3 col-xs-1' ></div>\
                    </div>\
                </div>\
                <div id='TIS_signUp_signup_hasAccount' style='position:absolute;right:0;bottom:0;text-align:center;width:100%;background-color:#AA070E'>\
                  <div style='font-size: 12.0pt;padding-top:20px;padding-bottom:20px;color:white'>" + __dic.HAVE_ACCOUNT[__lang] + "</div>\
                </div>\
            </div>\
            <div id='TIS_signUp_verify_container'  style='display:none;height:100%;width:100%;position: relative;' verifyWithComp='true' class='TIS-fullscreen'>\
                <div style='margin: 10px 0;display:inline-block' >\
                    <i id='TIS_signUp_verify_back' class='tis tis-right-open-big tis-2x TIS-pointer' style='float: right;margin-right: 10px;color:#aa070e'></i>\
                    <i style='float: right;margin-right: 10px;padding-top: 0.2em;white-space: nowrap;'>" + __dic.CHANGE_PHONE_NUMBER[__lang] + "</i>\
                </div>\
                <div >\
                    <div style='padding-bottom : 15px ;text-align:center'>\
                            <i id='TIS_signUp_verify_logo'  class='TIS-logo-img TIS-logo'></i>\
                    </div>\
                    <div >\
                        <div class='col-lg-4 col-md-4 col-sm-3 col-xs-1' ></div>\
                        <div class='col-lg-4 col-md-4 col-sm-6 col-xs-10' >\
                            <div class='input-group' style='width:100%'>\
                                <input id='TIS_signup_verify_code' style='width:50%;height: 3em;background-color:rgba(217, 217, 217, 0.48)'\
                                        type='number' \
                                        class='form-control' \
                                        placeholder='" + __dic.INVITATIONCODE[__lang] + "'>\
                            <i id='TIS_signup_verify_resend' class='tis tis-2x tis-refresh TIS-pointer TIS_disable' style='float:left;color:#AA070E;'></i>\
                            </div>\
                            <div style='padding-top:20px;padding-bottom:20px;font-weight:bold;text-align:center;font-size:large'>" + __dic.ENTER_PROFILE_DATA[__lang] + "</div>\
                            <div class='input-group' style='width:100%;background-color:rgba(217, 217, 217, 0.48)' >\
                                <input id='TIS_signup_verify_nickName' style='height: 3em;background-color:rgba(217, 217, 217, 0.48)'\
                                        type='text' \
                                        class='form-control' \
                                        placeholder='" + __dic.NICK_NAME_WITH_LIMIT[__lang] + "'>\
                            </div>\
                            <div class='input-group' style='margin-top:10px;width:100%;background-color:rgba(217, 217, 217, 0.48)' >\
                                <input id='TIS_signup_verify_password' style='height: 3em;background-color:rgba(217, 217, 217, 0.48)'\
                                        type='password' \
                                        class='form-control' \
                                        placeholder='" + __dic.PASS_WITH_LIMIT[__lang] + "'>\
                                <i  id='TIS_signup_verify_passwordView' class='tis tis-2x  tis-eye-off' style='position: absolute;top: 0.3em;left: 15px;z-index:2'></i>\
                            </div>\
                            <div class='form-group' style='margin-top:20px'>\
                                <div class='col-lg-12 col-md-12 col-sm-12 col-xs-12'>\
                                    <div\
                                        id='TIS_signUp_verify_register'\
                                        class='TIS-pointer TIS-BTN' \
                                        style='margin:15px auto;background-color: #ffb200;width:100%;height:60px;border-radius: 5px;'>\
                                            <span style='display: table-cell;vertical-align: middle;font-size: 20px;'><i class='tis tis-spin tis-spin4' style='display:none'></i>" + __dic.REGISTER_IN_GC[__lang] + "</span>\
                                    </div>\
                                </div>\
                            </div>\
                        </div>\
                        <div class='col-lg-4 col-md-4 col-sm-3 col-xs-1' ></div>\
                    </div>\
                </div>\
            </div>\
        </div>";

            $(registerElm).appendTo(document.body);
        },

        __getCoords = function (elem) { // crossbrowser version
            var box = elem.getBoundingClientRect();

            var body = document.body;
            var docEl = document.documentElement;

            var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
            var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

            var clientTop = docEl.clientTop || body.clientTop || 0;
            var clientLeft = docEl.clientLeft || body.clientLeft || 0;

            var top  = box.top +  scrollTop - clientTop;
            var left = box.left + scrollLeft - clientLeft;

            return {top: Math.round(top), left: Math.round(left)};
        },

        __initEvent = function () {

            var signupState = false;
            function signup() {

                if(signupState) {
                    return;
                }
                signupState = true;
                var tel = TIS.Util.toEnDigit($("#TIS_signup_signup_phoneNumber").val().replace(/\s+/g, ''));

                if (tel.length < 11 || !/^09[\d]{9}$/.test(tel)) {
                    __addAlertToInput($("#TIS_signup_signup_phoneNumber"));
                    signupState = false;
                    return false;
                } else {
                    __removeAlertFromInput($("#TIS_signup_signup_phoneNumber"));
                }

                //var hasVerifyCode = $("#TIS_signup_signup_hasVerifyCode").is(":checked");
                var hasVerifyCode = false;

                if (hasVerifyCode) {
                    __$sifnup.hide();
                    __$verify.show();
                } else {
                    $("#TIS_signUp_signup_register").addClass("TIS_disable").find("i").show();
                    __parent.signupRequest({
                        cellphoneNumber: tel
                    }, function (result) {
                        $("#TIS_signUp_signup_register").removeClass("TIS_disable").find("i").hide();

                        if (result.hasError) {
                            if (result.errorCode == -22) {
                                __$hasAcount.show();
                            } else {
                                __parent.alert(result.errorMessage);
                            }

                        } else {
                            // if(result.result.hasProfile) {
                            //     // __$verify.attr("verifyWithComp", false);
                            //     // $("#TIS_signup_verify_nickName")
                            //     //     .removeAttr("data-validation")
                            //     //     .closest("div").hide();
                            //
                            //     $("#TIS_signUp_signup_hasAccountAlert").show();
                            //     return;
                            // }
                            __$sifnup.hide();
                            __$verify.show();
                            setTimeout(function () {
                                $("#TIS_signup_verify_resend").removeClass("TIS_disable");
                            }, __parent.getConfig().resendVerifyTimeout);
                        }
                        signupState = false;
                    });

                }

                return false;
            }
            
            function verify() {

                var verifyCode = $("#TIS_signup_verify_code").val(),
                    nickName = $("#TIS_signup_verify_nickName").val(),
                    pass = TIS.Util.toEnDigit($("#TIS_signup_verify_password").val().replace(/\s+/g, '')),
                // verifyWithComp = __$verify.attr("verifyWithComp") == "true",
                    phone = TIS.Util.toEnDigit($("#TIS_signup_signup_phoneNumber").val().replace(/\s+/g, ''));

                if (verifyCode.length < 4) {
                    __parent.alert(__dic.VERIFY_INVALID[__lang]);
                    return false;
                }

                if (/*verifyWithComp && */(nickName.length < 4 || nickName.length > 20)) {
                    __parent.alert(__dic.NICKNAME_INVALID[__lang]);
                    return false;
                }

                if (pass.length < 6) {
                    __parent.alert(__dic.PASSWORD_INVALID[__lang]);
                    return false;
                }


                $("#TIS_signUp_verify_register").addClass("TIS_disable").find("i").show();
                $("#TIS_signup_verify_resend").addClass("TIS_disable");

                function resAction(result) {
                    $("#TIS_signUp_verify_register").removeClass("TIS_disable").find("i").hide();
                    $("#TIS_signup_verify_resend").removeClass("TIS_disable");
                    // if (result.hasError) {
                    //     __parent.alert(result.errorMessage);
                    // }
                    if (result.hasError) {
                        if (result.errorCode == -13) {
                            __$hasAcount.show();
                        } else {
                            __parent.alert(result.errorMessage);
                        }

                    }
                }

                __parent.verifyWithCompleteProfileRequest({
                    cellphoneNumber: phone,
                    code: verifyCode,
                    newCode: pass,
                    nickName: nickName,
                    setting: {
                        sessionStore: true,
                        storageStore: true
                    }
                }, resAction);


                // if(verifyWithComp) {
                //     __parent.verifyWithCompleteProfileRequest({
                //         cellphoneNumber: phone,
                //         code: verifyCode,
                //         nickName :  nickName
                //     },function (res) {
                //
                //         if(res.hasError && res.errorCode == -13) {
                //             __parent.verifyRequest({
                //                 data: {
                //                     cellphoneNumber: phone,
                //                     code: verifyCode
                //                 },
                //                 setting : {
                //                     sessionStore : true,
                //                     storageStore : true
                //                 },
                //                 onResult : resAction
                //             });
                //         } else {
                //             resAction(res);
                //         }
                //
                //     });
                // }
                // else{
                //     __parent.verifyRequest({
                //         cellphoneNumber: phone,
                //         code: verifyCode,
                //         setting : {
                //             sessionStore : true,
                //             storageStore : true
                //         }
                //     },resAction);
                // }


                return false;
            }

            $("#TIS_signUp_signup_close").on("click", function () {
                __self.hide();
            });

            $("#TIS_signup_verify_resend").on("click", function () {
                var $this = $(this);
                $this.addClass("tis-spin  TIS_disable");

                __parent.signupRequest({
                    cellphoneNumber: $("#TIS_signup_signup_phoneNumber").val(),
                    resend: true
                }, function (result) {
                    if (result.hasError) {
                        __parent.alert(result.errorMessage);
                    }
                    $this.removeClass("tis-spin");
                    setTimeout(function () {
                        $this.removeClass("TIS_disable");
                    }, __parent.getConfig().resendVerifyTimeout);
                });

                return false;
            });

            $("#TIS_signup_verify_passwordView").on("click", function () {

                var currentType = $("#TIS_signup_verify_password").attr("type");

                if (currentType == "text") {
                    $(this).removeClass("tis-eye").addClass("tis-eye-off");
                    $("#TIS_signup_verify_password").attr("type", "password");
                } else {
                    $(this).removeClass("tis-eye-off").addClass("tis-eye");
                    $("#TIS_signup_verify_password").attr("type", "text");
                }

            });

            $("#TIS_signUp_signup_rules").on("click", function () {
                TIS.Util.openUrl(__parent.getConfig().gameCenterRulesUrl);
            });

            $("#TIS_signup_signup_phoneNumber").on("keyup", function (e) {

                var $this = $(this);
                var tel = TIS.Util.toEnDigit($this.val().replace(/\s+/g, ''));

                if (tel.length == 11 && /^09[\d]{9}$/.test(tel)) {
                    __removeAlertFromInput($this);
                }

                if (e.which == 13) {
                    $(this).blur();
                    signup();
                }

            });

            $("#TIS_signUp_signup_hasAccount").on("click", function () {
                __parent.showLoginUI({
                    onHide: function () {
                        if (__onHideFunc) {
                            __onHideFunc();
                            __onHideFunc = undefined;
                        }
                    }
                });
                __hide(false);
            });

            $("#TIS_signUp_signup_login").on("click", function () {
                __self.hide();
                __parent.showLoginUI();
            });

            $("#TIS_signUp_signup_return").on("click", function () {
                __$hasAcount.hide();
            });

            $("#TIS_signUp_verify_logo").on("click", function () {
                TIS.Util.openUrl(__parent.getGameCenterUrl());
            });


            $("#TIS_signup_verify_code,#TIS_signup_verify_nickName,#TIS_signup_verify_password").on("keyup", function (e) {
                if (e.which == 13) {
                    $(this).blur();
                    verify();
                }
            });

            $("#TIS_signup_verify_nickName").on("keyup", function (e) {
                var $this = $(this);
                if(e.which == 32) {
                    __parent.alert(__dic.SPACE_NOT_VALID[__lang]);
                    var text = $this.val();
                    if(text) {
                        $this.val($this.val().trim().replace(/ /g,""));
                    }
                }
            });


            $("#TIS_signUp_signup_register").on("click", signup);

            $("#TIS_signUp_verify_register").on("click", verify);

            $("#TIS_signUp_signup_hasVerify").on("click", function () {
                var tel = $("#TIS_signup_signup_phoneNumber").val();

                if (tel.length < 11 || !/^09[\d]{9}$/.test(tel)) {
                    if (tel.length == 0) {
                        __parent.alert(__dic.ENTER_YOUR_PHONE_NUMBER[__lang]);
                    } else {
                        __parent.alert(__dic.PHONE_NUMBER_INVALID[__lang]);
                    }
                    __addAlertToInput($("#TIS_signup_signup_phoneNumber"));
                    return false;
                } else {
                    __removeAlertFromInput($("#TIS_signup_signup_phoneNumber"));
                }

                __$sifnup.hide();
                __$verify.show();

                $("#TIS_signup_verify_resend").hide();
                return false;
            });

            $("#TIS_signUp_verify_back").on("click", function () {

                __$sifnup.show();
                __$verify.hide();
                $("#TIS_signup_verify_resend").show();
                return false;
            });

            $("#TIS_signup_verify_nickName").on("click", function (e) {

                var $this = $(this);
                if (e.which == 32) {
                    __parent.alert(__dic.SPACE_NOT_VALID[__lang]);
                    var text = $this.val();
                    if (text) {
                        $this.val($this.val().trim().replace(/ /g, ""));
                    }
                }
            });



            window.addEventListener('native.keyboardshow', function (e) {
                if(__visibility) {
                    var keyHeight = e.keyboardHeight,
                    $pass = $("#TIS_signup_verify_password"),
                    $nickName = $("#TIS_signup_verify_nickName"),
                    pos = __getCoords($pass[0]);

                    if($nickName.is(':focus') || $pass.is(':focus')) {
                        if((pos.top + $pass.height())> ($(window).height() - keyHeight + 10)) {
                            var newTop = ((pos.top  + $pass.height() )- ($(window).height() - keyHeight)) ;
                            if( $pass.is(':focus')) {
                                newTop += 20;
                            }
                            $("#TIS_signup_container").css("top", "-" + newTop + "px");
                        }
                    }
                }
            });

            window.addEventListener('native.keyboardhide', function () {
                $("#TIS_signup_container").css("top", "0px");
            });


        },

        __reset = function () {
            __$hasAcount.hide();
            __$sifnup.show();
            __$verify.attr("verifyWithComp", true).hide();

            $("#TIS_signUp_verify_register").removeClass("TIS_disable");
            $("#TIS_signup_container").find("input").val("");

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

        __hide = function (checkOnHide) {
            __visibility = false;
            if (__onHideFunc && checkOnHide) {
                __onHideFunc();
                __onHideFunc = undefined;
            }
            $("#TIS_signup_container").hide();
            __reset();
        };

    /*==================================================================================================================
     *                                 P R O T E C T E D     M E T H O D
     *================================================================================================================*/

    /**
     * @method show
     * @public
     * @chainable
     *
     * @param {Object} params
     *      @param {Function} params.onHide
     *
     * */
    __self.show = function (params) {
        __visibility = true;
        if (params && typeof params.onHide == "function") {
            __onHideFunc = params.onHide;
        }

        $("#TIS_signup_container").show();

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
        __hide(true);
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

            if (__$verify.css("display") != "none") {
                __$sifnup.show();
                __$verify.hide();
                $("#TIS_signup_verify_resend").show();
            } else if (__$hasAcount.css("display") != "none") {
                __$hasAcount.hide();
            } else {
                __self.hide();
            }
            return true;
        }
        return false;
    };


    __init();
};