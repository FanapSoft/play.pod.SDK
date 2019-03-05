/**
 * @class LoginUI
 * @module ServiceUI
 * @submodule ServiceUI
 *
 * */
TIS.LoginUI = function (options) {
    var __self = this,
        __dic = options.dictionary,
        __parent = options.parent,
        __lang = options.language,
        __onHideFunc,
        __visibility = false;

    var __init = function () {
        __initView();
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

            var loginElm = "\
        <div  id='TIS_login_container' >\
            <div style='display:inline-block'>\
                <span id='TIS_login_close' class='tis tis-close tis-2x TIS-pointer' style='float: right;margin: 10px;color:#AA070E'></span>\
            </div>\
            <div id='TIS_login_login_container'>\
                <div style='margin-bottom:15px;text-align:center'>\
                    <i  id='TIS_login_login_logo' class='TIS-logo-img TIS-logo' ></i>\
                </div>\
                <div id='TIS_login_login_enterPhoneText' style='text-align:center;display:none;margin-bottom:30px;font-weight:bold'>" + __dic.ENTER_PHONENUMBER[__lang] + "</div>\
                <div  id='TIS_login_hasAccountAlert' style='display:none;position:absolute;top: 137px;background-color:white;color:black;z-index : 3;border : 2px solid #D9D9D9;right:10px;left:10px;max-width : 400px;margin: 0 auto;'>\
                    <div>\
                        <div style='padding : 30px 15px 30px 15px;font-size: 12.0pt;font-weight: 400;'>\
                            <div style='white-space: nowrap;text-align: center;'>" + __dic.USER_NOT_EXISTS[__lang] + "</div>\
                            <div style='white-space: nowrap;text-align: center;'>" + __dic.WANT_SIGNUP[__lang] + "</div>\
                        </div>\
                        <div>\
                            <div class='col-lg-6 col-md-6 col-sm-6 col-xs-6' style='text-align:center;padding-right:0;padding-left:0;border : 2px solid #D9D9D9'>\
                                <button id='TIS_login_signup' value='register' class='btn btn-block btn-lg ' style='background-color:#FFB300;border-radius: 0;font-size: 14.0pt;font-weight: 400;'>\
                                    <span class='tis'>" + __dic.SIGNUP[__lang] + "</span>\
                                </button>\
                            </div>\
                            <div class='col-lg-6 col-md-6 col-sm-6 col-xs-6' style='text-align:center;padding-right:0;padding-left:0;border : 2px solid #D9D9D9'>\
                                <button id='TIS_login_return' value='register' class='btn btn-block btn-lg' style='background-color:white;border-radius: 0;font-size: 14.0pt;font-weight: 400;'>\
                                    <span >" + __dic.RETURN[__lang] + "</span>\
                                </button>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
                <div>\
                    <div class='col-lg-2 col-md-2 col-sm-2 col-xs-1' ></div>\
                    <div class='col-lg-8 col-md-8 col-sm-8 col-xs-10' >\
                        <form id='TIS_login_login_form' class='form-horizontal' role='form'>\
                            <div  style='margin-bottom: 25px;width:100%' class='input-group'>\
                                <input id='TIS_login_login_phoneNumber'  style='background-color:rgba(217, 217, 217, 0.48);color:#434343;height: 3em;'\
                                        type='text' \
                                        class='form-control' \
                                        placeholder ='" + __dic.NICKNAME_OR_PHONENUMBER[__lang] + "'>\
                                <i class='tis tis-mobile' style='color: #7D7D7D;position: absolute;right: 15px;z-index:2;font-size: 42px;display:none'></i>\
                            </div>\
                            <div id='TIS_login_login_password_container'  class='input-group' style='margin-top:10px;width:100%;' >\
                                    <input id='TIS_login_login_password' style='background-color:rgba(217, 217, 217, 0.48);color:#434343;height: 3em;'\
                                            type='password' \
                                            class='form-control' \
                                            placeholder='" + __dic.PASSWORD[__lang] + "'>\
                                    <i  id='TIS_login_login_passwordView' class='tis tis-2x tis-eye-off' style='position: absolute;top: 0.3em;left: 10px;z-index:2;'></i>\
                            </div>\
                            <div style='margin-top:40px' class='form-group'>\
                                <div class='col-lg-12 col-md-12 col-sm-12 col-xs-12'>\
                                    <div\
                                        id='TIS_login_login_register'\
                                        class='TIS-pointer TIS-BTN' \
                                        style='margin:15px auto 0;background-color: #AA070E;width:100%;height:60px;border-radius: 5px;'>\
                                            <div style='display: table-cell;vertical-align: middle;font-size: 20px;'>\
                                                <i class='tis tis-spin tis-spin4' style='display:none'></i>\
                                                <span>" + __dic.LOGIN_WITH_GC[__lang] + "</span>\
                                            </div>\
                                    </div>\
                                </div>\
                            </div>\
                            <div class='input-group' style='width:100%;margin-bottom:20px;text-align: center;'>\
                                <div class='checkbox'>\
                                    <label style='text-align : center'>\
                                        <input id='TIS_login_dontPassword' type='checkbox'  value='1' style='display : none'>\
                                        <div style='color:#AA070E;padding-bottom: 2px'>\
                                            <span style='border-bottom: solid 1px black;'>" + __dic.DONTPASSWORD[__lang] + "</span>\
                                            <i class='tis tis-left-open-big' style='padding-right: 20px;'></i>\
                                        </div>\
                                    </label>\
                                </div>\
                            </div>\
                        </form>\
                    </div>\
                    <div class='col-lg-2 col-md-2 col-sm-2 col-xs-1' ></div>\
                </div>\
                <div id='TIS_login_login_notAccount' style='position:absolute;right:0;bottom:0;text-align:center;width:100%;background-color:#ffb200'>\
                  <div style='font-size: 12.0pt;padding-top:20px;padding-bottom:20px;color:white'>" + __dic.HAS_NOT_ACCOUNT[__lang] + "</div>\
                </div>\
            </div>\
            <div id='TIS_login_verify_container' style='display:none;' verifyWithComp='true' > \
                <div style='text-align: center;margin-bottom: 15px;'>\
                    <i  id='TIS_login_verify_logo' class='TIS-logo-img TIS-logo' ></i>\
                </div>\
                <div >\
                     <div class='col-lg-2 col-md-2 col-sm-2 col-xs-1' ></div>\
                     <div class='col-lg-8 col-md-8 col-sm-8 col-xs-10'>\
                          <div class='input-group' style='width:100%'>\
                              <input id='TIS_login_verify_code' style='width:50%;background-color:rgba(217, 217, 217, 0.48);color:#434343;height: 3em;' \
                                      type='tel' \
                                      class='form-control' \
                                      placeholder='" + __dic.INVITATIONCODE[__lang] + "'>\
                              <i id='TIS_login_verify_resend' class='tis tis-2x tis-refresh TIS-pointer TIS_disable' style='float:left;color:#AA070E;'></i>\
                          </div>\
                          <div class='input-group' style='margin-top:10px;width:100%' >\
                              <input id='TIS_login_verify_nickName' style='background-color:rgba(217, 217, 217, 0.48);color:#434343;height: 3em;'\
                                      type='text' \
                                      class='form-control' \
                                      placeholder='" + __dic.NICK_NAME_WITH_LIMIT[__lang] + "'>\
                          </div>\
                          <div class='input-group' style='margin-top:10px;width:100%' >\
                              <input id='TIS_login_verify_password' style='background-color:rgba(217, 217, 217, 0.48);color:#434343;height: 3em;'\
                                      type='password' \
                                      class='form-control' \
                                      placeholder='" + __dic.PASS_WITH_LIMIT[__lang] + "'>\
                              <i  id='TIS_login_verify_passwordView' class='tis tis-2x tis-eye-off' style='position: absolute;top: 0.3em;left: 10px;z-index:2'></i>\
                          </div>\
                          <div style='margin-top:20px' class='form-group'>\
                              <div class='col-sm-12 controls'>\
                                  <div\
                                      id='TIS_login_verify_register'\
                                      class='TIS-pointer TIS-BTN' \
                                      style='margin:15px auto;background-color: #AA070E;width:100%;height:60px;border-radius: 5px;'>\
                                          <span style='display: table-cell;vertical-align: middle;font-size: 20px;'><i class='tis tis-spin tis-spin4' style='display:none'></i>" + __dic.CHANGE_PASS_AND_LOGIN[__lang] + "</span>\
                                  </div>\
                              </div>\
                          </div>\
                     </div>\
                     <div class='col-lg-2 col-md-2 col-sm-2 col-xs-1' ></div>\
                </div>\
            </div>\
            <div id='TIS_login_isLogin_container' style='display:none;height:100%;' class='panel-body' >\
                <form id='TIS_login_isLogin_form' class='form-horizontal' role='form'>\
                    <div style='margin-top:10px' class='form-group'>\
                        <div class='alert alert-success' role='info'>\
                            <span aria-hidden='true'>" + __dic.YOUARELOGIN[__lang] + "</span>\
                        </div>\
                        <div class='col-sm-12 controls'>\
                            <div\
                                id='TIS_login_isLogin_register'\
                                class='TIS-pointer TIS-BTN' \
                                style='margin:15px auto;background-color: #AA070E;width:100%;height:60px;border-radius: 5px;'>\
                                    <span style='display: table-cell;vertical-align: middle;font-size: 20px;'>\
                                        <i class='tis tis-spin tis-spin4' style='display:none'></i>" + __dic.LOGOUT[__lang] + "\
                                    </span>\
                            </div>\
                        </div>\
                    </div>\
                </form>\
            </div>\
        </div>";

            $(loginElm).appendTo(document.body);
        },

        __initEvent = function () {

            $("#TIS_login_login_logo").on("click", function () {
                TIS.Util.openUrl(__parent.getGameCenterUrl());
            });

            $("#TIS_login_close").on("click", function () {
                if ($(this).hasClass("tis-close")) {
                    __self.hide();
                } else {
                    if ($("#TIS_login_login_container").css("display") == "none") {
                        $("#TIS_login_login_container").show();
                        $("#TIS_login_verify_container").hide();
                        if (!$("#TIS_login_dontPassword").is(":checked")) {
                            $("#TIS_login_close").removeClass("tis-right-open-big").addClass("tis-close");
                        }
                    } else {
                        $("#TIS_login_dontPassword").click();
                    }

                }

            });

            $("#TIS_login_dontPassword").on("change", function (e) {
                var isChecked = $(this).is(":checked");

                if (!isChecked) {
                    $("#TIS_login_close").removeClass("tis-right-open-big").addClass("tis-close");
                    $("#TIS_login_login_enterPhoneText").hide();
                    $(this).closest(".input-group").show();
                    $("#TIS_login_login_notAccount").show();
                    $(this).next("span").html(__dic.DONTPASSWORD[__lang]);

                    $("#TIS_login_login_register").find("span").html(__dic.LOGIN_WITH_GC[__lang]);
                    $("#TIS_login_login_register").closest(".form-group").css("margin-top", "50px");

                    $("#TIS_login_login_phoneNumber")
                        .css({
                            direction: "rtl"
                        })
                        .attr({
                            placeholder: __dic.NICKNAME_OR_PHONENUMBER[__lang],
                            type: 'text'
                        })
                        .next(".tis-mobile").hide();

                    $("#TIS_login_login_password_container").show();


                } else {
                    $("#TIS_login_close").removeClass("tis-close").addClass("tis-right-open-big");
                    $("#TIS_login_login_enterPhoneText").show();
                    $(this).closest(".input-group").hide();
                    $("#TIS_login_login_notAccount").hide();
                    $("#TIS_login_login_register").find("span").html(__dic.GET_VERIFY_CODE[__lang]);

                    $("#TIS_login_login_register").closest(".form-group").css("margin-top", "30px");
                    $(this).next("span").html(__dic.HAVE_VERIFY_CODE[__lang]);


                    $("#TIS_login_login_phoneNumber")
                        .css({
                            direction: "ltr"
                        })
                        .attr({
                            placeholder: "۰۹۱××××××××",
                            type: 'tel'
                        })
                        .next(".tis-mobile").show();

                    $("#TIS_login_login_password_container").hide();
                }
            });

            $("#TIS_login_isLogin_register").on("click", function () {
                __parent.logout();
                __reset();
                return false;
            });

            $("#TIS_login_verify_resend").on("click", function () {
                var $this = $(this);
                $this.addClass("tis-spin  TIS_disable");

                __parent.forgetPasswordRequest({
                    cellphoneNumber: $("#TIS_login_login_phoneNumber").val(),
                    resend: true
                }, function (result) {
                    if (result.hasError) {
                        __parent.alert(result.errorMessage)
                    }
                    $this.removeClass("tis-spin");
                    setTimeout(function () {
                        $this.removeClass("TIS_disable");
                    }, __parent.getConfig().resendVerifyTimeout);
                });

                return false;
            });


            $("#TIS_login_login_passwordView").on("click", function () {

                var $pass = $("#TIS_login_login_password");
                var currentType = $pass.attr("type");

                if (currentType == "text") {
                    $(this).removeClass("tis-eye").addClass("tis-eye-off");
                    $pass.attr("type", "password");
                } else {
                    $(this).removeClass("tis-eye-off").addClass("tis-eye");
                    $pass.attr("type", "text");
                }

            });

            $("#TIS_login_verify_passwordView").on("click", function () {

                var $pass = $("#TIS_login_verify_password");
                var currentType = $pass.attr("type");

                if (currentType == "text") {
                    $(this).removeClass("tis-eye").addClass("tis-eye-off");
                    $pass.attr("type", "password");
                } else {
                    $(this).removeClass("tis-eye-off").addClass("tis-eye");
                    $pass.attr("type", "text");
                }

            });


            var loginState = false;
            function loginAction() {

                if(loginState ) {
                    return;
                }

                loginState = true;

                var isChecked = $("#TIS_login_dontPassword").is(":checked"),
                    $ID = $("#TIS_login_login_phoneNumber"),
                    $pass = $("#TIS_login_login_password");


                var ID = $ID.val(),
                    pass = $pass.val();

                if (ID.length < 3) {
                    __addAlertToInput($ID);
                    loginState = false;
                    return false;
                } else {
                    __removeAlertFromInput($ID);
                }


                if (!isChecked) {

                    if (pass.length < 4) {
                        __addAlertToInput($pass);
                        loginState = false;
                        return false;
                    } else {
                        __removeAlertFromInput($pass);
                    }

                    var data = {
                        code: pass,
                        setting: {
                            sessionStore: true,
                            storageStore: true
                        }
                    };

                    data.userName = ID;

                    $("#TIS_login_login_register").addClass("TIS_disable").find("i").show();
                    __parent.loginRequest(data, function (result) {
                        loginState = false;
                        if (result.hasError) {
                            if (result.errorMessage == "complete use profile") {
                                //$("#TIS_login_title").html(__dic.COMPLETEPROFILE[__lang]);
                                $("#TIS_login_login_container").hide();
                                $("#TIS_login_verify_container").show();
                                $("#TIS_login_verify_code").val(pass);

                            } else {
                                __parent.alert(result.errorMessage);
                            }
                        } else {
                            if (result.loginState) {

                                $("#TIS_login_container").hide();

                            } else {
                                $("#TIS_login_login_container").hide();
                                $("#TIS_login_verify_container").show();
                                $("#TIS_login_verify_code").val(pass);
                                $("#TIS_login_close").removeClass("tis-close").addClass("tis-right-open-big");
                            }
                        }
                        $("#TIS_login_login_register").removeClass("TIS_disable").find("i").hide();
                    });

                } else {
                    ID = ID.trim();
                    if (ID.length < 11 || !/^09[\d]{9}$/.test(ID)) {
                        __addAlertToInput($ID);
                        loginState = false;
                        return false;
                    } else {
                        __removeAlertFromInput($ID);
                    }

                    $("#TIS_login_login_register").addClass("TIS_disable").find("i").show();

                    __parent.forgetPasswordRequest({
                        cellphoneNumber: $("#TIS_login_login_phoneNumber").val()
                    }, function (result) {
                        loginState = false;
                        $("#TIS_login_login_register").removeClass("TIS_disable").find("i").hide();
                        if (result.hasError) {
                            if (result.errorCode == -23) {
                                $("#TIS_login_hasAccountAlert").show();
                            } else {
                                __parent.alert(result.errorMessage);
                            }

                        } else {
                            //$("#TIS_login_title").html(__dic.PASSWORD[__lang]);
                            // if(result.result.hasProfile) {
                            //     $("#TIS_login_verify_container").attr("verifyWithComp", false);
                            //     $("#TIS_login_verify_nickName").closest("div").hide();
                            // }
                            if (result.result) {
                                $("#TIS_login_verify_nickName").closest("div").hide();
                            } else {
                                $("#TIS_login_verify_nickName").closest("div").show();
                            }

                            $("#TIS_login_verify_container").attr("verifyWithComp", !result.result);


                            $("#TIS_login_login_container").hide();
                            $("#TIS_login_verify_container").show();

                            setTimeout(function () {
                                $("#TIS_login_verify_resend").removeClass("disabled");
                            }, __parent.getConfig().resendVerifyTimeout);

                        }


                    });

                }

                return false; // Will stop the submission of the form
            }

            $("#TIS_login_login_register").on("click", loginAction);

            $("#TIS_login_login_phoneNumber,#TIS_login_login_password_container,#TIS_login_verify_code,#TIS_login_verify_password")
                .on("keyup", function (e) {
                if (e.which == 13) {
                    $(this).blur();
                    loginAction();
                }
            });


            var verifyState = false;
            function verify() {

                if(verifyState) {
                    return;
                }
                verifyState = true;
                var $verifyCode = $("#TIS_login_verify_code"),
                    $nickName = $("#TIS_login_verify_nickName"),
                    $pass = $("#TIS_login_verify_password");
                var verifyCode = $verifyCode.val(),
                    nickName = $nickName.val(),
                    pass = TIS.Util.toEnDigit($pass.val().replace(/\s+/g, '')),
                    verifyWithComp = $("#TIS_login_verify_container").attr("verifyWithComp") == "true",
                    phone = TIS.Util.toEnDigit($("#TIS_login_login_phoneNumber").val().replace(/\s+/g, ''));

                if (verifyCode.length < 4) {
                    __addAlertToInput($verifyCode);
                    verifyState = false;
                    return false;
                } else {
                    __removeAlertFromInput($verifyCode);
                }

                if (verifyWithComp) {
                    if (verifyWithComp && (nickName.length < 4 || nickName.length > 20)) {
                        __addAlertToInput($nickName);
                        verifyState = false;
                        return false;
                    } else {
                        __removeAlertFromInput($nickName);
                    }
                }


                if (pass.length < 6) {
                    __addAlertToInput($pass);
                    verifyState = false;
                    return false;
                } else {
                    __removeAlertFromInput($pass);
                }

                $("#TIS_login_verify_register").addClass("TIS_disable").find("i").show();
                $("#TIS_login_verify_resend").addClass("TIS_disable");


                function resAction(result) {
                    $("#TIS_login_verify_register").removeClass("TIS_disable").find("i").hide();
                    $("#TIS_login_verify_resend").removeClass("TIS_disable");
                    if (result.hasError) {
                        __parent.alert(result.errorMessage);
                    }
                    verifyState = false;

                    // if(!result.hasError && !verifyWithComp && result.loginState) {
                    //     __parent.changePasswordRequest({
                    //         oldPass : verifyCode,
                    //         newPass : pass,
                    //         confirmPass : pass
                    //     },function (res) {});
                    // }
                }

                if (verifyWithComp) {
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
                } else {
                    __parent.verifyRequest({
                        cellphoneNumber: phone,
                        code: verifyCode,
                        newCode: pass,
                        setting: {
                            sessionStore: true,
                            storageStore: true
                        }
                    }, resAction);
                }


                return false;
            }

            $("#TIS_login_verify_register").on("click", verify);

            $("#TIS_login_verify_password,#TIS_login_verify_code").on("keyup", function (e) {
                if (e.which == 13) {
                    $(this).blur();
                    verify();
                }
            });



            $("#TIS_login_verify_code").on("keyup", function () {

                var $this = $(this);
                if ($this.val().length >= 4) {
                    __removeAlertFromInput($this);
                }

            });

            $("#TIS_login_verify_nickName").on("keyup", function (e) {

                var $this = $(this);

                if(e.which == 32) {
                    __parent.alert(__dic.SPACE_NOT_VALID[__lang]);
                    var text = $this.val();
                    if(text) {
                        $this.val($this.val().trim().replace(/ /g,""));
                    }
                }

                if ($this.val().length >= 4 && $this.val().length <= 20) {
                    __removeAlertFromInput($this);
                }


            });

            $("#TIS_login_verify_password").on("keyup", function () {

                var $this = $(this);
                if ($this.val().length >= 6) {
                    __removeAlertFromInput($this);
                }

            });

            $("#TIS_login_login_notAccount").on("click", function () {
                __parent.showSignupUI();
                __self.hide();
            });


            $("#TIS_login_signup").on("click", function () {
                __self.hide();
                __parent.showSignupUI();
            });

            $("#TIS_login_return").on("click", function () {
                $("#TIS_login_hasAccountAlert").hide();
            });
        },

        __reset = function () {
            //$("#TIS_login_title").html(__dic.LOGIN[__lang]);
            $("#TIS_login_hasAccountAlert").hide();
            if (__parent.getUserData().id) {
                // $("#TIS_login_login_container").hide();
                // $("#TIS_login_isLogin_container").show();
            } else {
                $("#TIS_login_login_container").show();
                $("#TIS_login_isLogin_container").hide();

            }
            $("#TIS_login_verify_container").attr("verifyWithComp", true).hide();

            $("#TIS_login_container").find("input").val("");

            $("#TIS_login_login_register").removeClass("TIS_disable").find("i").hide();

            var $pass = $("#TIS_login_dontPassword");
            if ($pass.is(":checked")) $pass.click();
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
     * @param {Object} params
     *      @param {Function} params.onHide
     *
     * */
    __self.show = function (params) {
        __visibility = true;
        __reset();
        if (params && typeof params.onHide == "function") {
            __onHideFunc = params.onHide;
        }
        $("#TIS_login_container").show();

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

        if (__onHideFunc) {
            __onHideFunc();
            __onHideFunc = undefined;
        }
        $("#TIS_login_container").hide();

        return __self;
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

    /**
     * @method visibility
     * @public
     *
     * @param  {Boolean} visibility
     * @return {Boolean} visibility
     * */
    __self.visibility = __visibilityFN;

    __self.onLogout = function () {
        $("#TIS_login_login_container").show();
        $("#TIS_login_isLogin_container").hide();
    };

    __self.backButton = function () {

        if (__visibility) {
            if ($("#TIS_login_close").hasClass("tis-close")) {
                __self.hide();
                return true;
            } else {
                if ($("#TIS_login_login_container").css("display") == "none") {
                    $("#TIS_login_login_container").show();
                    $("#TIS_login_verify_container").hide();
                    if (!$("#TIS_login_dontPassword").is(":checked")) {
                        $("#TIS_login_close").removeClass("tis-right-open-big").addClass("tis-close");
                    }
                    return true;
                } else {
                    if ($("#TIS_login_dontPassword").is(":checked")) {
                        $("#TIS_login_dontPassword").click();
                        return true;
                    }
                }
            }
        }

        return false;
    };

    __init(options);
};