/**
 * @class TableUI
 * @module ServiceUI
 * @submodule ServiceUI
 *
 * */
TIS.EditProfileUI = function (options) {

    var __self = this,
        __parent = options.parent,
        __dic = options.dictionary,
        __lang = options.language,
        __$parentContainer,
        __$mainPage,
        __$signupPage,
        __isUiInit = false,
        __dialogElm,
        __visibility = false,
        __eventInit = false,
        __BtnColor = (options.config && options.config.buttonBackgroundColor) || "#1cb7d4";

    var __init = function () {
            __initView();

            __$mainPage = $("#TIS_editProfile_mainPage");
            __$signupPage = $("#TIS_editProfile_signupPage");

            __dialogElm = $("#TIS_editProfile_container_dialog");
            __initEvent();
        },

        __initView = function () {
            var topScoreView = "\
        <div  id='TIS_editProfile_container'>\
            <div id='TIS_editProfile_mainPage'>\
                <div id='TIS_editProfile_header' style='text-align: center;margin: 10px 0' >\
                    <i id='TIS_editProfile_close' class='tis tis-close-circle tis-2x TIS-pointer' style='float: right;margin-right: 10px;color:"+__BtnColor+";font-weight: bold'></i>\
                    <div class='panel-title' style='font-weight: bold'>" + __dic.CHANGE[__lang] + "</div>\
                </div>\
                <div id='TIS_editProfile_bodyContainer' class='panel-body'>\
                    <ul class='nav nav-tabs' role='tablist'>\
                        <li role='presentation' class='active' style='box-shadow: none'><a href='#TIS_editProfile_edit' aria-controls='home' role='tab'data-toggle='tab' style=' background-color: #faf4e3;white-space: nowrap;'>ویرایش پروفایل</a></li>\
                        <li role='presentation'  style='box-shadow: none'><a href='#TIS_editProfile_changePass' aria-controls='profile' role='tab' data-toggle='tab' style='background-color: #faf4e3;white-space: nowrap;'>تغییر رمز عبور</a></li>\
                        <li id='TIS_editProfile_creditTab' role='presentation'  style='box-shadow: none;display:none'><a href='#TIS_editProfile_credit' aria-controls='profile' role='tab' data-toggle='tab' style='background-color: #faf4e3;white-space: nowrap;'>اعتبار</a></li>\
                    </ul>\
                    <div class='tab-content'>\
                        <div role='tabpanel' class='tab-pane active' id='TIS_editProfile_edit'>\
                            <div id='TIS_editProfile_edit_container' class='panel-body'>\
                                <div >\
                                    <label for='TIS_editProfile_edit_nickName' class='col-md-12'>" + __dic.NICKNAME[__lang] + "<span style='color: red'>(*)</span></label>\
                                    <div class='col-md-12'>\
                                        <input id='TIS_editProfile_edit_nickName' \
                                        type='text' \
                                        class='form-control'  \
                                        data-validation='length'\
                                        data-validation-length='min3'\
                                        placeholder='" + __dic.NICKNAME[__lang] + "'>\
                                    </div>\
                                </div>\
                                <div >\
                                    <label for='email' class='col-md-12'>" + __dic.EMAIL[__lang] + "</label>\
                                    <div class='col-md-12'>\
                                        <input id='TIS_editProfile_edit_email' \
                                        type='text' \
                                        class='form-control' \
                                        data-validation='email'  \
                                        data-validation-optional='true'\
                                        placeholder='" + __dic.EMAIL[__lang] + "'>\
                                    </div>\
                                </div>\
                                <div >\
                                    <label for='TIS_editProfile_edit_firstName' class='col-md-12'>" + __dic.FIRSTNAME[__lang] + "</label>\
                                    <div class='col-md-12'>\
                                        <input id='TIS_editProfile_edit_firstName' \
                                        type='text' \
                                        class='form-control' \
                                        data-validation='length'\
                                        data-validation-length='min3'\
                                        data-validation-optional='true'\
                                        placeholder='" + __dic.FIRSTNAME[__lang] + "'>\
                                    </div>\
                                </div>\
                                <div >\
                                    <label for='TIS_editProfile_edit_lastName' class='col-md-12'>" + __dic.LASTNAME[__lang] + "</label>\
                                    <div class='col-md-12'>\
                                        <input id='TIS_editProfile_edit_lastName' \
                                        type='text' \
                                        class='form-control' \
                                        data-validation='length'\
                                        data-validation-length='min3'\
                                        data-validation-optional='true'\
                                        placeholder='" + __dic.LASTNAME[__lang] + "'>\
                                    </div>\
                                </div>\
                                <div >\
                                    <label for='TIS_editProfile_edit_gender' class='col-lg-12 control-label' >" + __dic.GENDER[__lang] + "</label>\
                                    <div class='col-lg-12'>\
                                        <select class='form-control' id='TIS_editProfile_edit_gender' style='padding-top: 0' >\
                                            <option value='0'>" + __dic.SELECTOPTIONS[__lang] + "</option>\
                                            <option value='MAN_GENDER'>" + __dic.MALE[__lang] + "</option>\
                                            <option value='WOMAN_GENDER'>" + __dic.FEMALE[__lang] + "</option>\
                                        </select>\
                                    </div>\
                                </div>\
                                <div style='padding-top:20px;text-align:center' class='TIS-pointer'>\
                                    <a id='TIS_editProfile_editImage' style='border-bottom: solid 1px "+__BtnColor+";'>"+__dic.EDIT_PROFILE_IMAGE[__lang]+"</a>\
                                </div>\
                                <div class='col-sm-12' style='text-align:center'>\
                                    <div style='display:inline-block;padding-top:20px'>\
                                        <div \
                                            id='TIS_editProfile_edit_register'\
                                            class='TIS-pointer TIS-BTN' \
                                            style='margin:25px;background-color: "+__BtnColor+";'>\
                                            <span style='display: table-cell;vertical-align: middle;font-size: 20px;'> " + __dic.REGISTER_DATA[__lang] + "</span>\
                                        </div>\
                                    </div>\
                                </div>\
                            </div>\
                        </div>\
                        <div role='tabpanel' class='tab-pane' id='TIS_editProfile_changePass'>\
                            <div id='TIS_editProfile_changePass_container' class='panel-body'>\
                                <div class='form-group'>\
                                    <label for='TIS_editProfile_changePass_oldPass' class='col-md-12'>" + __dic.CURRENTPASS[__lang] + "<span style='color: red'>(*)</span></label>\
                                    <div class='col-md-12'>\
                                        <input id='TIS_editProfile_changePass_oldPass' \
                                        type='password' \
                                        name='password' \
                                        class='form-control'  \
                                        data-validation='length'\
                                        data-validation-length='min1'\
                                        placeholder='" + __dic.CURRENTPASS[__lang] + "'>\
                                    </div>\
                                </div>\
                                <div class='form-group'>\
                                    <label for='TIS_editProfile_changePass_newPass' class='col-md-12'>" + __dic.NEWPASS[__lang] + "<span style='color: red'>(*)</label>\
                                    <div class='col-md-12'>\
                                        <input id='TIS_editProfile_changePass_newPass' \
                                        type='password' \
                                        name='password' \
                                        class='form-control' \
                                        data-validation='length' \
                                        data-validation-length='min4' \
                                        placeholder='" + __dic.NEWPASS[__lang] + "'>\
                                    </div>\
                                </div>\
                                <div class='form-group'>\
                                    <label for='TIS_editProfile_changePass_confirmPass' class='col-md-12'>" + __dic.NEWPASSREPEAT[__lang] + "<span style='color: red'>(*)</label>\
                                    <div class='col-md-12'>\
                                        <input id='TIS_editProfile_changePass_confirmPass' \
                                        type='password' \
                                        name='password' \
                                        class='form-control' \
                                        data-validation='length' \
                                        data-validation-length='min4' \
                                        placeholder='" + __dic.NEWPASSREPEAT[__lang] + "'>\
                                    </div>\
                                </div>\
                                <div class='form-group'>\
                                    <div class='col-sm-12'>\
                                        <div \
                                            id='TIS_editProfile_changePass_register'\
                                            class='TIS-pointer TIS-BTN' \
                                            style='margin:25px auto;background-color:"+__BtnColor+"'>\
                                            <span style='display: table-cell;vertical-align: middle;font-size: 20px;'> " + __dic.CHANGEPASSWORD[__lang] + "</span>\
                                        </div>\
                                    </div>\
                                </div>\
                            </div>\
                        </div>\
                        <div role='tabpanel' class='tab-pane' id='TIS_editProfile_credit'>\
                            <div class='panel-body' style='text-align:center'>\
                                <div class='row' style='font-weight:bold;padding-top: 20px;'>\
                                    <span>"+__dic.YOUR_CREDIT[__lang]+"</span>\
                                    <i id='TIS_editProfile_credit_refresh' class='tis tis-2x tis-refresh TIS-pointer' style='padding-right:10px;color:"+__BtnColor+"' ></i>\
                                </div>\
                                <div class='row' id='TIS_editProfile_credit_amount' style='padding-top: 20px;font-weight:bold'>\
                                    <i class='tis tis-3x tis-spin tis-spin4'></i>\
                                </div>\
                                <div class='row' style='padding-top: 20px;'>\
                                    <div class='form-group'>\
                                        <div class='col-sm-12'>\
                                            <div \
                                                id='TIS_editProfile_credit_increase'\
                                                class='TIS-pointer TIS-BTN' \
                                                style='margin:25px auto;background-color:"+__BtnColor+"'>\
                                                <span style='display: table-cell;vertical-align: middle;font-size: 20px;'> " + __dic.INCREASE_CREDIT[__lang] + "</span>\
                                            </div>\
                                        </div>\
                                    </div>\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
            </div>\
            <div id='TIS_editProfile_signupPage' style='position:absolute;width:100%;height:100%;top:0;background: rgba(0, 0, 0, 0.27);'>\
                <div style='display:table;width:100%;height:100%;text-align:center'>\
                    <div style='display:table-cell;vertical-align : middle'>\
                        <i id='TIS_editProfile_signupPage_close' class='tis tis-close-circle tis-2x TIS-orangeColor TIS-pointer' style='float: right;color:#1cb7d4;font-weight: bold; margin: 50px 50px 20px  0 ;'></i>\
                        <div style='background-color:rgb(250, 244, 227);padding-bottom:10px;margin: 30px;'>\
                            <p style='font-size: large;text-align:center;display: inline-block;width:100%'>"+__dic.EDIT_PROFILE_DES[__lang]+"</p>\
                            <div \
                                id='TIS_editProfile_signupPage_signup'\
                                class='TIS-pointer TIS-BTN ' \
                                style='margin:25px auto;background-color: #1cb7d4;'>\
                                <span style='display: table-cell;vertical-align: middle;font-size: 20px;'> " + __dic.SIGNUP[__lang] + "</span>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
            <div>\
        </div>";

            __$parentContainer = $(topScoreView).appendTo(document.body);
        },

        __fillCredit = function (credit) {
            $("#TIS_editProfile_credit_amount")
                .empty()
                .html(credit);
        },

        __fillProfile = function(userData) {

            var name = userData.name || userData.nickName;
            if(name) {
                $("#TIS_editProfile_edit_nickName").val(name);
            }

            if(userData.email) {
                $("#TIS_editProfile_edit_email").val(userData.email);
            }
            if(userData.firstName) {
                $("#TIS_editProfile_edit_firstName").val(userData.firstName);
            }

            if(userData.lastName) {
                $("#TIS_editProfile_edit_lastName").val(userData.lastName);
            }

            if(userData.gender) {
                var gender;
                if(userData.gender == "مرد" || userData.gender == "MAN_GENDER") {
                    gender = "MAN_GENDER"
                } else {
                    gender = "WOMAN_GENDER"
                }
                $("#TIS_editProfile_edit_gender").val(gender || 0);
            }
        },

        __initUi = function (callback) {
            if (!__isUiInit) {


                // __parent.getUserProfile({},function (res) {
                //     if (!res.hasError) {
                //         __fillProfile(res.result);
                //     }
                //     callback(res);
                // });

                var service = __parent.getService();

                if(!__eventInit) {
                    var callFire = false;
                    service.on("profileChange", function (userData) {
                        __fillProfile(userData);
                    });

                    service.on("login", function (userData) {
                        __parent.getUserProfile({},function (res) {
                            if (!res.hasError) {
                                __fillProfile(res.result);

                            }
                            if(!callFire) {
                                callback(res);
                                callFire = true;
                            }

                        });
                        __parent.getCredit(function (res) {
                            if (!res.hasError) {
                                __fillCredit(res.result.text);
                            }
                        });

                        if(__parent.getService().inAppPurchaseState()) {
                            $("#TIS_editProfile_creditTab").show();
                        }
                    });

                    service.on("creditChange", function (creditData) {
                        __fillCredit(creditData.creditText);
                    });

                    __eventInit = true;
                } else {
                    __parent.getUserProfile({},function (res) {
                        if (!res.hasError) {
                            __fillProfile(res.result);
                        }
                        callback(res);
                    });


                }



            } else {
                callback({
                    hasError: false
                });
            }
        },

        __alert = function (message, isPositive) {
            if (isPositive) {
                __parent.info(message);
            } else {
                __parent.alert(message);
            }
        },

        __initEvent = function () {

            $("#TIS_editProfile_close,#TIS_editProfile_signupPage_close").on("click", function () {
                __self.hide();
            });

            $("#TIS_editProfile_signupPage_signup").on("click", function () {
                __parent.showSignupUI({
                    onHide : function () {
                        if(__parent.getUserData().guest) {
                            __$signupPage.show();
                        } else {
                            __$signupPage.hide();
                        }
                    }
                });
            });

            $("#TIS_editProfile_editImage").on("click", function () {
                TIS.Util.openUrl( __parent.getConfig().gameCenterUserPageUrl);
            });

            $("#TIS_editProfile_edit_nickName").on("keyup", function (e) {
                var $this = $(this);
                if(e.which == 32) {
                    __parent.alert(__dic.SPACE_NOT_VALID[__lang]);
                    var text = $this.val();
                    if(text) {
                        $this.val($this.val().trim().replace(/ /g,""));
                    }
                }
            });

            $('#TIS_editProfile_edit_register').on("click", function () {
                var firstName = $("#TIS_editProfile_edit_firstName").val();
                var lastName = $("#TIS_editProfile_edit_lastName").val();
                var gender = $("#TIS_editProfile_edit_gender").val();
                var email = $("#TIS_editProfile_edit_email").val();
                var nickName = $("#TIS_editProfile_edit_nickName").val();


                if (nickName.length < 4 || nickName.length > 20) {
                    __alert(__dic.NICKNAME_INVALID[__lang],false);
                    return false;
                }

                var data = {
                    nickName: nickName
                };

                if (firstName) {
                    data.firstName = firstName;
                }

                if (lastName) {
                    data.lastName = lastName;
                }

                if (gender == "MAN_GENDER" || gender == "WOMAN_GENDER") {
                    data.gender = gender;
                }

                if (email) {
                    data.email = email;
                }

                $("#TIS_editProfile_edit_register").prop("disabled", true);


                __parent.editProfileRequest(data,function (result) {
                    $("#TIS_editProfile_edit_register").prop("disabled", false);
                    if (result.hasError) {
                        __fillProfile(__parent.getUserData());
                        __alert(result.errorMessage, false);
                    } else {
                        __alert(__dic.EDIT_PROFILE_SUCCESS_CHANGE[__lang], true);
                    }
                });

            });

            $('#TIS_editProfile_changePass_register').on("click", function () {
                var $this = $(this);
                var oldPass = $("#TIS_editProfile_changePass_oldPass").val();
                var newPass = $("#TIS_editProfile_changePass_newPass").val();
                var confirmPass = $("#TIS_editProfile_changePass_confirmPass").val();


                if (newPass != confirmPass) {
                    __alert( __dic.PASSWORDS_NOT_MATCH[__lang], false);
                    return false;
                }

                if (newPass.length<4 || confirmPass.length<4) {
                    __alert(__dic.PASSWORDS_MIN_4[__lang], false);
                    return false;
                }

                var data = {
                    oldPass: oldPass,
                    newPass: newPass,
                    confirmPass: confirmPass
                };

                $this.prop("disabled", true);

                __parent.changePasswordRequest(data,function (result) {
                    $this.prop("disabled", false);
                    if (result.hasError) {
                        __alert(result.errorMessage, false);
                    } else {
                        __alert(__dic.PASSWORD_SUCCESS_CHANGE[__lang],true);
                        $("#TIS_editProfile_changePass_oldPass").val("");
                        $("#TIS_editProfile_changePass_newPass").val("");
                        $("#TIS_editProfile_changePass_confirmPass").val("");
                    }
                });
            });

            $('#TIS_editProfile_credit_increase').on("click", function () {
                __parent.credit({});
            });

            $('#TIS_editProfile_credit_refresh').on("click", function () {
                var $this = $(this);
                $this.addClass("tis-spin TIS_disable");
                __parent.getCredit(function (res) {
                    if (!res.hasError) {
                        __fillCredit(res.result.text);
                    } else {
                        __parent.alert(res.errorMessage);
                    }
                    $this.removeClass("tis-spin TIS_disable");
                });
            });

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
     * @param {Object} [params]
     *      @param {Number} [params.gameId]
     *      @param {Number} [params.leagueId]  if params.leagueId != undefined -> params.gameId != undefuned
     *
     * */
    __self.show = function () {
        __visibility = true;

        if(__parent.getUserData().guest) {
            __$signupPage.show();
        } else {
            __$signupPage.hide();
        }
        __initUi(function (res) {
            __isUiInit = !res.hasError;
            // __isUiInit = true;
        });

        __$parentContainer.show();

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
    __self.hide = function (params) {
        __visibility = false;

        __$parentContainer.hide();

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
        $("#TIS_editProfile_changePass_oldPass").val("");
        $("#TIS_editProfile_changePass_newPass").val("");
        $("#TIS_editProfile_changePass_confirmPass").val("");
        $("#TIS_editProfile_edit_firstName").val("");
        $("#TIS_editProfile_edit_lastName").val("");
        $("#TIS_editProfile_edit_nickName").val("");
        $("#TIS_editProfile_edit_gender").val(0);
        $("#TIS_editProfile_edit_email").val("");
        __isUiInit = false;
    };

    __self.onLogin = function () {

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
