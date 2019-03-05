/**
 * @class SuggestionUI
 * @module ServiceUI
 * @submodule ServiceUI
 *
 * */
TIS.SuggestionUI = function (options) {
    /*==================================================================================================================
     *                                      P R I V A T E   V A R I A B L E
     *================================================================================================================*/
    var __self = this,
        __dic = options.dictionary,
        __dir = options.direction,
        __globalConfig = options.config,
        __ownConfig = __globalConfig && __globalConfig.SuggestionUI,
        __animate = false,
        __gameId,
        __parent = options.parent,
        __isUiInit = false,
        __metaData,
        __type,
        __lang = options.language,
        __BtnColor = (options.config && options.config.buttonBackgroundColor) || "#1cb7d4",
        __defaultTitleName = __dic.SUGGESTION[__lang],

        __visibility = false;

    /*==================================================================================================================
     *                                   P U B L I C    V A R I A B L E
     *================================================================================================================*/


    /*==================================================================================================================
     *                                   P R I V A T E     M E T H O D
     *================================================================================================================*/

    var __init = function () {

        if (__ownConfig && typeof __ownConfig.animate === "boolean") {
            __animate = __ownConfig.animate;
        }
        else if (__globalConfig && typeof __globalConfig.animate === "boolean") {
            __animate = __globalConfig.animate;
        }

        __initView();
        __initEvent();
    };

    var __initView = function () {

        var style = '';

        if (__animate) {
            style = 'transform : translateX(calc(100%));-webkit-transform : translateX(calc(100%))';
        } else {
            style = 'display : none';
        }

        var leagueView = "\
            <div id='TIS_suggestion_container' style='" + style + "'>\
                <div  style='background-color:#faf4e3;display: inline-block;width:100%' >\
                <span id='TIS_suggestion_close' class='tis tis-close-circle tis-2x TIS-pointer' style='margin: 10px;color: " + __BtnColor + ";font-weight: bold'></span>\
                <div>\
                    <div class='col-lg-1 col-md-1 col-sm-1 col-xs-1'></div>\
                    <div class='col-lg-10 col-md-10 col-sm-10 col-xs-10'>\
                        <div>\
                            <div class='col-lg-4 col-md-4 col-sm-4 col-xs-4' style='padding-right: 0'>\
                                <div style='margin: 5px'>" + __dic.NAME[__lang] + "</div>\
                                <div><input  id='TIS_suggestion_name' type='text' class='form-control' placeholder ='" + __dic.NAME[__lang] + "'>\</div>\
                            </div>\
                            <div class='col-lg-8 col-md-8 col-sm-8 col-xs-8' style='padding-left: 0;'>\
                                <div style='margin: 5px'>" + __dic.EMAIL[__lang] + "</div>\
                                <div><input  id='TIS_suggestion_email'  type='text' class='form-control ' placeholder='" + __dic.EMAIL[__lang] + "'></div>\
                            </div>\
                        </div>\
                        <div>\
                            <div style='margin: 5px'>" + __dic.MESSAGE[__lang] + "</div>\
                            <div><textarea id='TIS_suggestion_text' name='msg' style='resize: vertical;' class='form-control ' rows='4' cols='78' placeholder='" + __dic.MESSAGE[__lang] + "'></textarea>\</div>\
                        </div>\
                        <div style='margin-top:30px;margin-bottom:30px'>\
                            <div\
                                id='TIS_suggestion_send'\
                                class='TIS-pointer TIS-BTN' \
                                style='margin:25px auto;background-color: " + __BtnColor + "'>\
                                <span style='display: table-cell;vertical-align: middle;font-size: 20px;'> " + __dic.SEND_SUGGESTION[__lang] + "</span>\
                            </div>\
                        </div>\
                    </div>\
                    <div class='col-lg-1 col-md-1 col-sm-1 col-xs-1'></div>\
                </div>\
            </div>\
        ";

        $(leagueView).appendTo(document.body);
    };

    var __initEvent = function () {

        $("#TIS_suggestion_close").on("click", function () {
            __self.hide();
        });


        $("#TIS_suggestion_container").on("click", function (e) {

            if ($(e.target).attr("id") === "TIS_suggestion_container") {
                __self.hide();
            }
        });

        $("#TIS_suggestion_email").on("keyup", function (e) {
            var text = $(this).val();

            if (text.length > 0) {
                $(this)
                    .attr({
                        "data-validation": "email"
                    });
            } else {
                $(this).removeAttr("data-validation")
            }
        });

        $("#TIS_suggestion_send").on("click", function () {
            var $this = $(this);
            if (__gameId == undefined) {
                __parent.alert(__dic.SERVER_REQUEST_ERROR[__lang]);
                return false;
            }


            var sendData = {};

            var name = $("#TIS_suggestion_name").val();
            var email = $("#TIS_suggestion_email").val();

            var suggestion = $("#TIS_suggestion_text").val();

            if (suggestion.length < 1) {
                __parent.alert(__dic.FILL_SUGGESTION_FIELD[__lang]);
                return false;
            }

            sendData.gameId = __gameId;

            sendData.suggestion = suggestion;

            if (name) {
                sendData.name = name;
            }

            if (email) {
                sendData.email = email;
            }

            if (__type) {
                sendData.type = __type;
            }

            if (__metaData) {
                sendData.metaData = __metaData;
            }

            $this.addClass("TIS_disable");
            __parent.suggestionRequest(sendData, function (result) {
                $this.removeClass("TIS_disable");
                if (result.hasError) {
                    __parent.alert(result.errorMessage);
                } else {
                    __parent.info(__dic.SUCCESSFULSUGGESTIONSEND[__lang]);
                    __reset(true);
                }
            });
        });
    };

    var __initUi = function () {
        if (!__isUiInit) {
            $("#TIS_suggestion_gameName_loading").show();

            __parent.getGamesInfo({registerGame: true}, function (result) {
                $("#TIS_suggestion_gameName_loading").hide();
                if (result.hasError) {
                    __parent.alert(result.errorMessage);
                    __isUiInit = false;
                } else {
                    __gameId = result.result.games[0].id;
                }
            });


            __isUiInit = true;
        }
    };

    var __reset = function (hideAlertState) {
        $("#TIS_suggestion_name").val("");
        $("#TIS_suggestion_email").val("");
        $("#TIS_suggestion_text").val("");

    };

    var __visibilityFN = function (visibility) {

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
        var userData = __parent.getUserData();
        if (userData.id) {
            $("#TIS_suggestion_name").val(userData.name)
        }
        __initUi();

        // $("#TIS_suggestion_container").show();

        if (__animate) {
            setTimeout(function () {
                $("#TIS_suggestion_container")
                    .css({
                        "transform": "translateX(0)",
                        "-webkit-transform": "translateX(0)"
                    });
            }, 1);

            setTimeout(function () {
                $("#TIS_suggestion_container")
                    .addClass("TIS-black-back");
            }, 700);

        } else {
            $("#TIS_suggestion_container")
                .addClass("TIS-black-back")
                .show();
        }


        var title = (params && (typeof params.title) == "string") ? params.title : __defaultTitleName;
        $("#TIS_suggestion_title").html(title);

        if (params && params.metaData) {
            __metaData = params.metaData;
            if (typeof __metaData == "object") {
                __metaData.deviceInfo = window.device;
            }
        } else {
            __metaData = {
                deviceInfo: window.device
            }
        }

        if (params && typeof params.type === "number") {
            __type = params.type;
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
        // $("#TIS_suggestion_container").hide();

        if (__animate) {
            $("#TIS_suggestion_container")
                .removeClass("TIS-black-back")
                .css({
                    "transform": "translateX(calc(100%))",
                    "-webkit-transform": "translateX(calc(100%))"
                });
        } else {
            $("#TIS_suggestion_container")
                .removeClass("TIS-black-back")
                .css({display: "none"});
        }

        __metaData = undefined;
        __type = undefined;

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