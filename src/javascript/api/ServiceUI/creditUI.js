/**
 * @class CreditUI
 * @module ServiceUI
 * @submodule ServiceUI
 *
 * */
TIS.CreditUI = function (options) {
    /*==================================================================================================================
     *                                      P R I V A T E   V A R I A B L E
     *================================================================================================================*/
    var __self = this,
        __dic = options.dictionary,
        __parent = options.parent,
        __isUiInit = false,
        __visibility = false,
        __parentContainer,
        __packs = {},
        __$packPage,
        __$payPage,
        __$packs,
        __selectedCreditPackId,
        __selectedPackId,
        __selectedLeagueId,
        __lastFromAmount,
        __BtnColor = (options.config && options.config.buttonBackgroundColor) || "#1cb7d4",
        __lang = options.language;

    /*==================================================================================================================
     *                                   P U B L I C    V A R I A B L E
     *================================================================================================================*/


    /*==================================================================================================================
     *                                   P R I V A T E     M E T H O D
     *================================================================================================================*/

    var __init = function () {
            __initView();

            __$packPage = __parentContainer.find("#TIS_credit_packPage");
            __$payPage = __parentContainer.find("#TIS_credit_payPage");
            __$packs = __parentContainer.find("#TIS_credit_packPage_packContainer");

            __initEvent();
        },

        __initView = function () {
            var creditView = "\
                <div id='TIS_credit_container' class='TIS-black-back'>\
                    <div style='display:table-cell;vertical-align: middle;min-width: 100px;'>\
                        <div style='background-color:#faf4e3;min-height: 300px'>\
                            <div id='TIS_credit_packPage' >\
                                <div style='display: inline-block;width: 100%;position: relative;overflow: hidden'>\
                                    <div class='row' id='TIS_credit_header' style='text-align: center;margin: 10px 10px 20px 20px' >\
                                        <i id='TIS_credit_packPage_close' class='tis tis-close-circle tis-2x TIS-pointer' style='float: right;color:"+__BtnColor+";font-weight:bold'></i>\
                                        <div class='panel-title' style='font-weight: bold'>" + __dic.INCREASE_CREDIT[__lang] + "</div>\
                                        <span  class='tis tis-credit-card tis-3x TIS-pointer TIS-rotate--30' style='position:absolute;left:-18px;top: -12px;;color: rgba(165, 162, 162, 0.49);font-size: 80px;'></span>\
                                    </div>\
                                    <div id='TIS_credit_packPage_packsList'>\
                                        <div class='row' style='text-align: center;font-weight: bold' >"+__dic.SELECT_CREDIT_PACK[__lang]+"</div>\
                                        <div class='row'>\
                                            <div class='col-lg-2 col-md-2 col-sm-2 col-xs-1'></div>\
                                            <div class='col-lg-8 col-md-8 col-sm-8 col-xs-10'  style='margin-bottom: 15px;margin-top:15px'>\
                                                <div id='TIS_credit_packPage_loading' style='display:none;text-align:center;height:50px;padding-top: 30px;'><i class='tis tis-3x tis-spin tis-spin4'></i></div>\
                                                <div id='TIS_credit_packPage_packContainer' class='funkyradio TIS_scroll' style='overflow-y: auto;max-height: 200px' ></div>\
                                            </div>\
                                            <div class='col-lg-2 col-md-2 col-sm-2 col-xs-1'></div>\
                                        </div>\
                                        <div class='row'>\
                                            <div\
                                                id='TIS_credit_packPage_next'\
                                                class='TIS-pointer TIS-BTN' \
                                                style='margin:25px auto;background-color: "+__BtnColor+";width:80%;max-width:200px;'>\
                                                <span style='display: table-cell;vertical-align: middle;font-size: 20px;'> " + __dic.PAY[__lang] + "</span>\
                                            </div>\
                                        </div>\
                                    </div>\
                                    <div id='TIS_credit_packPage_notInAppMessage' style='text-align:center;font-size: x-large;padding-top: 45px;' >\
                                        "+__dic.NOT_IN_APP_MESSAGE[__lang]+"\
                                    </div>\
                                </div>\
                            </div>\
                            <div id='TIS_credit_payPage' style='display: none;'>\
                                <div style='background-color:#faf4e3;display: inline-block;width: 100%;position: relative;overflow: hidden'>\
                                    <div class='row' id='TIS_credit_header' style='text-align: center;margin: 10px 0' >\
                                        <span id='TIS_credit_payPage_back' class='tis tis-right-open-big tis-2x TIS-pointer' style='float: right;margin-right: 10px;color:"+__BtnColor+"'></span>\
                                        <div class='panel-title' style='font-weight: bold'>" + __dic.PAY[__lang] + "</div>\
                                        <span  class='tis tis-credit-card tis-3x TIS-pointer TIS-rotate--30' style='position:absolute;left:-18px;top: -12px;;color: rgba(165, 162, 162, 0.49);font-size: 80px;'></span>\
                                    </div>\
                                    <div class='row' style='padding-top:20px'>\
                                        <div class='col-lg-12 col-md-12 col-sm-12 col-xs-12' style=''>\
                                            <div class='col-lg-1 col-md-1 col-sm-1 col-xs-1' ></div>\
                                            <div class='col-lg-10 col-md-10 col-sm-10 col-xs-10' >\
                                                <div style='height:50px;border : 1px solid rgba(128, 128, 128, 0.65);;padding: 10px 20px;color: gray;font-size: large'>\
                                                    <span id='TIS_credit_payPage_packName' style='float:right'></span>\
                                                    <span id='TIS_credit_payPage_packPrice' style='float:left'>۲۰۰۰ تومان</span>\
                                                </div>\
                                            </div>\
                                            <div class='col-lg-1 col-md-1 col-sm-1 col-xs-1' ></div>\
                                        </div>\
                                        <div class='col-lg-12 col-md-12 col-sm-12 col-xs-12' style='padding:10px;text-align:center;color:gray'>" + __dic.SELECT_PAYMENT_METHOD[__lang] + "</div>\
                                        <div class='col-lg-12 col-md-12 col-sm-12 col-xs-12' style='padding:10px;text-align:center;'>\
                                            <div class='TIS-credit-payMethod TIS_disable'>\
                                                <div style='display:table;width:100%;height:100%'><div style='display:table-cell;vertical-align : middle'>"+__dic.VAS[__lang]+"</div></div>\
                                            </div>\
                                            <div class='TIS-credit-payMethod TIS_disable'>\
                                                <div style='display:table;width:100%;height:100%'><div style='display:table-cell;vertical-align : middle'>"+__dic.IMI[__lang]+"</div></div>\
                                            </div>\
                                            <div class='TIS-credit-payMethod TIS-credit-selectedMethod'>\
                                                <div style='display:table;width:100%;height:100%'><div style='display:table-cell;vertical-align : middle'>"+__dic.GETEWAY[__lang]+"</div></div>\
                                            </div>\
                                            <div class='TIS-credit-payMethod TIS_disable'>\
                                                <div style='display:table;width:100%;height:100%'><div style='display:table-cell;vertical-align : middle'>"+__dic.USSD[__lang]+"</div></div>\
                                            </div>\
                                        </div>\
                                    </div>\
                                    <div class='row'>\
                                        <div\
                                            id='TIS_credit_packPage_send'\
                                            class='TIS-pointer TIS-BTN' \
                                            style='margin:25px auto;background-color: "+__BtnColor+";width:80%;max-width:200px;'>\
                                            <span style='display: table-cell;vertical-align: middle;font-size: 20px;'> " + __dic.PAY[__lang] + "</span>\
                                        </div>\
                                    </div>\
                                <div>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
            ";
            __parentContainer = $(creditView).appendTo(document.body);
        },

        __subscribeWithWebView = function(params,callback){

            var data = {
                url: params.url,
                callback : function (res) {

                    switch (res.Type) {
                        case 1 :
                            callback(res.Content);
                            break;

                        case 2 :
                            __parent.hideWebView();
                            break;

                    }

                }
            };

            __parent.showWebView(data);
        },

        __createPackView = function (packData) {
            __packs[packData.id] = packData;
            

            var id = "TIS_credit_pack_"+packData.id;
            var content = "\
                <div packId='"+packData.id+"' class='funkyradio-success'>\
                    <input type='radio' name='radio' id= '"+id+"'/>\
                    <label for='"+id+"'>"+packData.name+"</label>\
                </div>\
            ";

            __$packs.append(content);
        },

        __updatePackList = function (fromAmount) {
            var reqData = {};
            if(fromAmount) {
                reqData.fromAmount = fromAmount;
            }

            __lastFromAmount = fromAmount;
            __$packs.empty();
            $("#TIS_credit_packPage_loading").show();
            __parent.getCreditPackList(reqData,function (result) {
                __isUiInit = !result.hasError;
                if (result.hasError) {
                    // __parent.alert(result.errorMessage);
                    __updatePackList(fromAmount);
                } else {
                    $("#TIS_credit_packPage_loading").hide();
                    var packs = result.result.packs;
                    for (var i = 0; i < packs.length; i++) {
                        __createPackView(packs[i])
                    }
                }


            });
        },
        
        __initEvent = function () {

            $("#TIS_credit_packPage_close").on("click", function () {
                __self.hide();
            });

            $("#TIS_credit_payPage_back").on("click", function () {
                __$payPage.hide();
                __$packPage.show();
            });

            $("#TIS_credit_packPage_send").on("click", function () {

                var data = {
                    creditPackId: __selectedCreditPackId
                };

                if(__selectedPackId) {
                    data.packId = __selectedPackId;
                }
                if(__selectedLeagueId) {
                    data.leagueId = __selectedLeagueId;
                }

                if(__parent.getService().getUserData().ssoLogin) {
                    __subscribeWithWebView({
                        url : __parent.generateIncreaseCreditUrl(data)
                    }, function (res) {
                        console.log("INCREASE CREDIT CALLBACK",res);
                    });

                } else {
                    TIS.Util.openUrl(__parent.generateIncreaseCreditUrl(data));
                    __self.hide();
                }

            });

            $("#TIS_credit_packPage_next").on("click", function () {
                var $inps = __$packs.find("input:checked");

                if($inps.length==1) {
                    var $selected = $($inps[0]);
                    __selectedCreditPackId = $selected.closest("div").attr("packId");

                    __parentContainer.find("#TIS_credit_payPage_packName").html(__packs[__selectedCreditPackId].name);
                    __parentContainer.find("#TIS_credit_payPage_packPrice").html(TIS.Util.toFaDigit(__packs[__selectedCreditPackId].amount/10+"") + "&nbsp;&nbsp;"+ __dic.TOAMAN[__lang]);

                    __$payPage.show();
                    __$packPage.hide();
                } else {
                    __parent.alert(__dic.SELECT_1_CREDIT_PACK[__lang]);
                }
            });

        },

        __reset = function () {
            __$packPage.show();
            __$payPage.hide();
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

    /*==================================================================================================================
     *                                 P U B L I C     M E T H O D
     *================================================================================================================*/

    /**
     * @method show
     * @public
     * @chainable
     * 
     * @param {Object} [params]
     *      @param {String|Number} [params.leagueId]
     *      @param {String|Number} [params.packId]
     *      @param {String} [params.fromAmount]
     *
     * */
    __self.show = function (params) {
        __visibility = true;
        __parentContainer
            .css("display","table")
            .show();

        if(__parent.getService().inAppPurchaseState()) {
            $("#TIS_credit_packPage_packsList").show();
            $("#TIS_credit_packPage_notInAppMessage").hide();
            var fromAmount;
            if(params) {
                if(params.packId) {
                    __selectedPackId = params.packId;
                }
                if(params.leagueId) {
                    __selectedLeagueId = params.leagueId;
                }
                if(typeof params.fromAmount == "number") {

                    fromAmount = params.fromAmount;
                }
            } else{
                __selectedPackId = undefined;
                __selectedLeagueId = undefined;
            }

            if(!__isUiInit || (fromAmount != __lastFromAmount) ) {
                __updatePackList(fromAmount);
            }
        } else {
            $("#TIS_credit_packPage_packsList").hide();
            $("#TIS_credit_packPage_notInAppMessage").show();
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
        __reset();
        __parentContainer.hide();
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

    __self.onLogout = function () {
        __isUiInit = false;
    };

    __self.backButton = function () {
        if(__$payPage.css("display") != "none") {
            __$payPage.hide();
            __$packPage.show();
            return true;
        } else if (__visibility) {
            __self.hide();
            return true;
        }
        return false;
    };

    __init();
};