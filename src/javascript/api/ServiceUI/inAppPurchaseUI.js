/**
 * @class InAppPurchasesUI
 * @module ServiceUI
 * @submodule ServiceUI
 *
 * */
TIS.InAppPurchaseUI = function (options) {
    /*==================================================================================================================
     *                                      P R I V A T E   V A R I A B L E
     *================================================================================================================*/
    var __self = this,
        __dic = options.dictionary,
        __parent = options.parent,
        __globalConfig = options.config,
        __ownConfig = __globalConfig && __globalConfig.inAppPurchaseUI,
        __animate = false,
        __isUiInit = false,
        __visibility = false,
        __$parentContainer, __dialogContainerElm,
        __headerContainerElm, __filterContainerElm,
        __footerContainerElm,
        __$gameItems, __$header,
        __$itemPacks,
        __$mainPage,
        __subscribeConfirmDialogElm,
        __lang = options.language,
        __hasResize = false,
        __isGlobal = false,
        __fullscreen = true,
        __gamesInfo,
        __itemData = {},
        __currentGameId,
        __currentItemId,
        __itemPrefix = "TIS_inApp_item_",
        __BtnBackgroundColor = (__globalConfig && __globalConfig.buttonBackgroundColor) || "#1cb7d4",
        __loadingColor = (__globalConfig && __globalConfig.loadingColor) || "#FA8D2E",
        __$loading,
        __onBuy,
        __onHide,
        __mareginTopPercentForNotFullscreen = 20/100;

    /*==================================================================================================================
     *                                   P U B L I C    V A R I A B L E
     *================================================================================================================*/


    /*==================================================================================================================
     *                                   P R I V A T E     M E T H O D
     *================================================================================================================*/

    var __init = function () {
            if(__ownConfig && typeof __ownConfig.animate === "boolean") {
                __animate = __ownConfig.animate;
            } else if(__globalConfig && typeof __globalConfig.animate === "boolean") {
                __animate = __globalConfig.animate;
            }
            __initView();
            __dialogContainerElm = __$parentContainer.find(".modal-dialog");
            __headerContainerElm = __$parentContainer.find(".TIS-heading");
            __filterContainerElm = __$parentContainer.find("#TIS_inApp_filterContainer");
            __footerContainerElm = __$parentContainer.find(".panel-footer");
            __$gameItems = __$parentContainer.find("#TIS_inApp_itemName_container");
            __$itemPacks = __$parentContainer.find("#TIS_inApp_packs_container");
            __$header = __$parentContainer.find("#TIS_inApp_header");

            __$mainPage = __$parentContainer.find("#TIS_inApp_mainPage");

            __initEvent();

            __initSubscribeConfirmDialog();

            __initLoading();
        },

        __initLoading = function () {
            var content = "\
                <div class='alert alert' style='text-align: center;margin-top: 30px;'>\
                    <i class='tis tis-spin4 tis-spin tis-2x' style='color: "+__loadingColor+"'></i>\
                    </div>\
            ";

            __$loading = $(content);
        },

        __initView = function () {

            var style = '';

            if(__animate) {
                style = 'transform : translateX(calc(100%));-webkit-transform : translateX(calc(100%))';
            } else {
                style = 'display : none';
            }

            var content = "\
                <div  id='TIS_inApp_container' style='"+style+"'>\
                     <div id='TIS_inApp_mainPage'>\
                        <div id='TIS_inApp_header'>\
                            <div style='padding-top: 10px'>\
                                 <i id='TIS_inApp_close' class='tis tis-close tis-2x  TIS-pointer' style='float: right;margin-right: 10px;color:"+__BtnBackgroundColor+";font-weight: bold'></i>\
                                 <i id='TIS_inApp_update' class='tis tis-refresh tis-2x TIS-pointer' style='float: left;margin-left: 10px;color:"+__BtnBackgroundColor+";font-weight: bold'></i>\
                                 <div class='panel-title' style='text-align:center;font-weight: bold;font-size: x-large;'>" + __dic.PURCHASE[__lang] + "</div>\
                             </div>\
                             <ul id='TIS_inApp_itemName_container' class='nav nav-tabs' role='tablist'></ul>\
                        </div>\
                       <div id='TIS_inApp_packs_container' class='tab-content'>\</div>\
                    </div>\
                </div>\
        ";

            __$parentContainer = $(content).appendTo(document.body);
        },

        __changeAddMoreDataState = function ($elem, isLoading) {
            if (isLoading) {
                $elem
                    .attr("disabled", true)
                    .find("i")
                    .addClass("tis-spin tis-spin4")
                    .removeClass("tis-down-dir");
            } else {
                $elem
                    .attr("disabled", false)
                    .find("i")
                    .addClass("tis-down-dir")
                    .removeClass("tis-spin tis-spin4");
            }
        },

        __generateMoreDataElm = function () {

            var morDataContent = "<div class='TIS-moreData' \
                                    style='cursor:pointer;text-align: center;color: "+__loadingColor+";height: 2em;margin-top: 30px'>\
                                    <i class='tis tis-2x tis-down-dir'></i>\
                                </div>";

            return $(morDataContent);

        },

        __disableBtn = function ($btn) {
            $btn.addClass("TIS_disable");
            $btn.find(".TIS-BTN")
                .addClass("tis-spin")
                .find("span")
                .addClass("tis-spin")
                .css("animation-direction", "reverse");
        },

        __enableBtn = function ($btn) {
            $btn.removeClass("TIS_disable");
            $btn.find(".TIS-BTN")
                .removeClass("tis-spin")
                .find("span")
                .removeClass("tis-spin")
                .css("animation-direction", "reverse");
        },

        __subscribeWithWebView = function(params,callback,onHideCallback){
            if(TIS.Util.isApp()) {
                TIS.Plugin.buyPackUI({
                    packId: params.packId
                }, function (res) {
                    callback({
                        hasError : res.HasError,
                        errorMessage : res.ErrorMessage,
                        errorCode : res.ErrorCode,
                        result : res.Result
                    });
                }, function (res) {
                    callback({
                        hasError : true,
                        errorMessage : res
                    });
                });
            } else {
                var url = __parent.getService().getConfig().ssoInApurchaseUrl +
                    "/?packId=" + params.packId +
                    "&count=1" +
                    "&_token=" + __parent.getService().getUserData().token +
                    "&_token_issuer=" + __parent.getService().getUserData().tokenIssuer;

                var data = {
                    url: url,
                    callback : function (res) {

                        switch (res.Type) {
                            case 1 :
                                callback(res.Content);
                                __parent.hideWebView();
                                break;

                            case  2 :
                                __parent.hideWebView();

                                break;

                        }
                    },
                    onClose : function () {
                        onHideCallback && onHideCallback();
                    }
                };
                __parent.showWebView(data);
            }

        },

        __createPackView = function (itemId, packData,$container) {

            var packId = packData.id,
                priceText = '<span style="font-family: sans-serif">'+TIS.Util.tokenizeCurrency(TIS.Util.toFaDigit(packData.price))+'</span>' + " " + packData.priceUnit,
                planData = __getPlanText(packData.plan),
                countView = "";
            if (packData.count && packData.count > 0) {
                countView = "\
                    <div style='height: 20px;overflow-y: hidden'> \
                      " + packData.count + "&nbsp;&nbsp;" + packData.item.name + " \
                    </div>\
                ";
            }

            if (packData.price === 0) {
                priceText = __dic.FREE[__lang];
            }

            var imageUrl = null;
            if(typeof packData.imageUrl === "string") {
                imageUrl = packData.imageUrl
            } else if(typeof packData.image === "object" && packData.image!== null) {
                imageUrl = __parent.getService().generateImageSrc(packData.image)
            }

            var content = "\
                <div style='text-align: center;margin-top: 20px;width:100%;'>\
                    <div class='TIS-inApp-creditContainer'>\
                        <div class='col-xs-2 col-sm-2 col-md-2 col-lg-2 TIS-inApp-credit-col'>\
                            <div>\
                                <img  style='height: 47px;width: 47px;' src='" + imageUrl + "'>\
                            </div>\
                        </div>\
                        <div class='col-xs-5 col-sm-6 col-md-6 col-lg-6 TIS-inApp-credit-col'>\
                            <div>\
                                <div class='TIS-inApp-packName' style='font-size: small'>" + packData.name + "</div>\
                                " + countView + "\
                            </div>\
                        </div>\
                        <div class='col-xs-3 col-sm-2 col-md-2 col-lg-2 TIS-inApp-credit-col'>\
                            <div>\
                             " + priceText + "\
                            </div>\
                        </div>\
                        <div class='col-xs-2 col-sm-2 col-md-2 col-lg-2 TIS-inApp-credit-col' style='padding-left: 3px;'>\
                            <div class='TIS-pointer TIS-inApp-subscribe'>\
                                <div\
                                class='TIS-BTN' \
                                style='background-color: "+__BtnBackgroundColor+";'>\
                                    <span> " + __dic.PURCHASE[__lang] + "</span>\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                    <div class='TIS-inApp-moreInfo' visible='false' TIS-DATA='EXTRA'>\
                        <div class='TIS-inApp-moreInfo-inner'>\
                            " + planData.range + "\
                            <div></div>\
                            " + planData.plan + "\
                           <div style='padding-bottom: 10px;font-weight: bold'>"+__dic.DESCRIPTION[__lang]+"&nbsp;:</div>\
                           <div class='TIS_scroll'>" + packData.description.replace(/\\n|\\r\\n|\\r/g, "<br />") + "</div>\
                        </div>\
                    </div>\
                </div>\
            ";

            var $contElm = $(content).appendTo($container);
            var $extra = $contElm.find("div[TIS-DATA='EXTRA']");

            $contElm.click(function (e) {
                var display = $extra.attr("visible");
                if(display !== "false") {
                    $extra.attr("visible", "false");
                    $extra.css({
                        "height" : 0,
                        "transform": "translateX(calc(100%))",
                        "-webkit-transform": "translateX(calc(100%))"
                    });

                } else {
                    var $allSHow = $container.find("div[TIS-DATA='EXTRA'][visible='true']");
                    $allSHow
                        .attr("visible", "false")
                        .css({
                            "height" : 0,
                            "transform": "translateX(calc(100%))",
                            "-webkit-transform": "translateX(calc(100%))"
                        });

                    $extra.attr("visible", "true");
                    $extra.css({
                        "height": $extra.children().height() + 25 + "px",
                        "transform": "translateX(0)",
                        "-webkit-transform": "translateX(0)"
                    });
                }
            });

            $contElm.find(".TIS-inApp-subscribe").click(function (e) {
                var $this = $(this);

                var $voucherElm = __subscribeConfirmDialogElm.find("input[TIS-DATA=VOUCHER]");


                function subscribedResponseAction(result) {
                    // $this.removeClass("tis-spin TIS_disable");
                    $voucherElm.val("");
                    if (result.hasError) {


                        if (result.errorCode == 1156) {
                            var content = "\
                                        <div>\
                                            <i>" + result.errorMessage + "</i>\
                                            <a href='#!'  class='btn btn-lg TIS-orange'>" + __dic.INCREASECASH[__lang] + "</a>\
                                        </div>\
                                    ";

                            var $elm = $(content);

                            $elm.find("a").on("click", function () {
                                __parent.credit({
                                    packId : packData.id,
                                    fromAmount : packData.price
                                });
                            });
                            __parent.alert($elm);
                        } else {
                            __parent.alert(result.errorMessage);
                        }

                    } else {
                        __parent.info(__dic.BUY_SUCCESS[__lang].replace("$ITEM", packData.name));

                        if(typeof __onBuy === "function") {
                            __onBuy(result.result);
                        }
                    }

                    __enableBtn($this);
                }

                function subscribe() {
                    var voucher = $voucherElm.val();
                    var requestData = {packId: packId};
                    var isVoucherChecked = __subscribeConfirmDialogElm.find("#TIS_inApp_voucherINP").is(":checked");
                    if (voucher && voucher.length > 0 && isVoucherChecked) {
                        requestData.voucherHash = voucher;
                    }

                    __parent.buyInAppPurchasePackRequest(requestData,subscribedResponseAction);
                }


                if(__parent.getService().getUserData().ssoLogin) {

                    if(TIS.Util.isApp()) {
                        __disableBtn($this);
                    }
                    __subscribeWithWebView({
                        packId: packId,
                    },function (res) {
                        subscribedResponseAction({
                            hasError : res.HasError,
                            errorMessage : res.ErrorMessage,
                            errorCode : res.ErrorCode,
                            result : !res.HasError ? __parent.getService().reformatUserItem(res.Result) : null
                        });
                    },function () {
                        __enableBtn($this);
                    });


                } else {
                    __disableBtn($this);
                    if (packData.price > 0) {
                        __parent.getCredit(function (res) {
                            if(res.hasError) {
                                __parent.alert(res.errorMessage);
                                __enableBtn($this);
                            } else {
                                __enableBtn($this);
                                if(res.result.credit>= packData.price) {
                                    __confirm(
                                        "&nbsp;" + "<span style='font-weight: bold'>"+packData.price + "&nbsp" + __parent.getConfig().creditUnit+"</span>" + "&nbsp;",
                                        // (packData.item && packData.item.name) + "&nbsp",
                                        "&nbsp;&nbsp;" + "<span style='font-weight: bold'>"+(packData.name) +"</span>" + "&nbsp;&nbsp;",
                                        function () {
                                            __disableBtn($this);
                                            subscribe();
                                        });
                                } else {
                                    __parent.credit({
                                        packId : packData.id,
                                        fromAmount : packData.price - res.result.credit
                                    });
                                }
                            }
                        });

                    } else {
                        subscribe();
                    }
                }


                e.preventDefault();
                return false;
            });

            return content;
        },

        __setCurrentGameShow = function (gameId, itemId,callback) {
            __currentGameId = gameId;
            __updateItemMenu({
                gameId: gameId, itemId: itemId
            },callback);
        },

        __setCurrentItemShow = function (itemId) {
            __currentItemId = itemId;
            __updateItemPacks()
        },

        __updateItemMenu = function (params,callback) {
            var gameId = params.gameId,
                currentItemId = params.itemId;
            __$gameItems.empty();
            __$itemPacks.children(":not(.alert-success)").remove();
            if(gameId) {
                var requestData = {gameId: gameId};
                __parent.getGameItems(requestData, function (res) {
                    if (res.hasError) {
                        __parent.alert(res.errorMessage);
                    } else {
                        var items = res.result.items;
                        if (items.length > 0) {
                            for (var i = 0; i < items.length; i++) {
                                var item = items[i],
                                    itemId = item.id;
                                __itemData[itemId] = item;

                                var itemIdRef = __itemPrefix + itemId;


                                var imageUrl = null;

                                if(typeof item.imageUrl === "string") {
                                    imageUrl = item.imageUrl
                                } else if(typeof item.image === "object" && item.image!== null) {
                                    imageUrl = __parent.getService().generateImageSrc(item.image)
                                }

                                var tabContent = "\
                                        <li role='presentation' itemId='" + itemId + "' gameId='" + gameId + "' style='box-shadow: none;margin-bottom:0;min-width: 100px'>\
                                            <a href='#" + itemIdRef + "' aria-controls='profile' role='tab' data-toggle='tab'\
                                             style='margin-left:0;white-space: nowrap;background-color: #faf4e3;'>\
                                                <img  style='width:20px;height:20px' src='"+ imageUrl +"'>\
                                                " + item.name + "\
                                            </a>\
                                        </li>\
                                    ";

                                var packContent = "\
                                    <div  id='" + itemIdRef + "' role='tabpanel' class='tab-pane active TIS_scroll' style='overflow-y: scroll;overflow-x:hidden;height: 100%;'></div>\
                                ";

                                $(tabContent)
                                    .click(function () {
                                        __setCurrentItemShow($(this).attr("itemId"));
                                    })
                                    .appendTo(__$gameItems);

                                var $packContent = $(packContent).appendTo(__$itemPacks);

                                // __initScrollEvent($packContent);

                            }
                            if (!currentItemId) {
                                currentItemId = items[0].id;
                            }
                            __$gameItems.find("li[itemId=" + currentItemId + "]").addClass("active");
                            __$itemPacks.find("#"+ __itemPrefix + currentItemId).addClass("active");
                            __setCurrentItemShow(currentItemId);
                        }
                    }
                    callback && callback();
                });
            } else {
                __updateItemPacks({
                    itemId : currentItemId
                },callback);
            }
            
        },

        __updateItemPacks = function (params,callback) {
            var gameId = __currentGameId,
                itemId = (params && params.itemId ) || __currentItemId,
                $container = __$itemPacks.find("#" + __itemPrefix + itemId),
                offset,
                isFromScroll = (params && typeof params.isFromScroll == "boolean") ? params.isFromScroll : false,
                isFromAddBtn = (params && typeof params.isFromAddBtn == "boolean") ? params.isFromAddBtn : false;


            var offs = parseInt($container.attr("nextOffset"));

            if (!isNaN(offs)) {
                offset = offs;
            } else {
                offset = 0;
            }

            var hasNext = $container.attr("hasnextpage");
            if(hasNext == "false") {
                callback && callback();
                return;
            }

            if(offset == 0) {
                __$itemPacks.find("div.alert").remove();
            }

            if (!isFromScroll && !isFromAddBtn) {
                if(offset == 0) {
                    $container.empty();
                } else {
                    return;
                }
            }

            var addMoreDataElm = $container.find(".TIS-moreData");

            if(!addMoreDataElm.length) {
                addMoreDataElm = __generateMoreDataElm();
                addMoreDataElm.appendTo($container);
            }
            __changeAddMoreDataState(addMoreDataElm,true);
            $container.scrollTop(function () {
                return this.scrollHeight;
            });
            var data = {
                offset: offset,
                itemId: itemId,
                // size :3
            };
            if(gameId) {
                data.gameId = gameId;
            }


            function resAction(result) {
                __changeAddMoreDataState(addMoreDataElm,false);
                if (result.hasError) {
                    __parent.alert(result.errorMessage);
                } else {

                    addMoreDataElm.remove();
                    var res = result.result;
                    var leaguesData = res.packs;

                    if($container.length == 0) {
                        var itemIdRef = __itemPrefix + itemId;
                        var packContent = "\
                                    <div  id='" + itemIdRef + "' role='tabpanel' class='tab-pane active TIS_scroll' style='overflow-y: scroll;height: inherit'></div>\
                                ";
                        $container = $(packContent).appendTo(__$itemPacks);
                    }

                    for (var i = 0; i < leaguesData.length; i++) {
                        var packInfo = leaguesData[i];
                        __createPackView(itemId, packInfo,$container);
                    }

                    if (!res.hasNext) {
                        var notMoreTxt;
                        if(leaguesData.length == 0) {
                            notMoreTxt = __dic.NOT_FIND[__lang];
                        } else {
                            notMoreTxt = __dic.NOT_FIND_MORE[__lang];
                        }

                        $container.append(
                            "<div class='alert ' style='text-align: center;margin: 20px 0 5px 0;color: #31708f'>" + notMoreTxt + "</div>"
                        );
                        $container.attr("hasNextPage", false);
                    } else {
                        $container.append(addMoreDataElm);
                        $container.attr("nextOffset", res.nextOffset);
                        $container.attr("hasNextPage", true);
                        // __initScrollEvent($container);
                    }
                }

                __onWindowResize();
                if (offset == 0) {
                    // because in some device btn click not work, should move to fire click event
                    $container.scrollTop(1);
                }
                callback && callback();
            }


            if(__isGlobal) {
                __parent.getGlobalInAppPurchasePack(data, resAction);
            } else {
                __parent.getInAppPurchasePack(data, resAction);
            }

        },

        __initEvent = function () {

            $("#TIS_inApp_close").on("click", function () {
                __self.hide();
            });

            var lastText;

            function update(text) {
                __updateItemPacks({
                    filter: text
                },function () {
                    if (lastText && text != lastText) {
                        update(lastText);
                    }
                });
            }

            // $("#TIS_inApp_search").on("keyup", function () {
            //     var text = $(this).val();
            //     if (!__isGettingData) {
            //         update(text);
            //     } else {
            //         lastText = text;
            //     }
            //
            // });

            $(".TIS_inApp_filterContainerClass").find("a").on("click", function () {
                var concept = $(this).text().trim();
                var span = $(this)
                    .closest('div')
                    .attr("value", $(this).attr("value"))
                    .find('span[TisDropText]');

                //var preText = span.attr("value") + " : ";

                span.text(concept);
                __updateItemPacks();
            });

            $("#TIS_inApp_update").on("click", function () {
                var $allSHow = __$parentContainer.find("div[TIS-DATA='EXTRA'][visible='true']");
                $allSHow
                    .attr("visible", "false")
                    .hide("slow");

                if (__currentGameId && __currentItemId) {
                    var $container = __$itemPacks.find("#" + __itemPrefix + __currentItemId);
                    $container
                        .removeAttr("nextOffset")
                        .removeAttr("hasNextPage");
                    
                    __updateItemPacks({
                        gameId: __currentGameId
                    });
                }

            });

            __$parentContainer.on("click", ".TIS-moreData", function () {
                var $BTN = $(this);
                var isLoading = $BTN.hasClass("tis-spin");

                if (!isLoading) {
                    __changeAddMoreDataState($BTN,isLoading);
                    __updateItemPacks({
                        isFromScroll: false,
                        isFromAddBtn: true
                    })
                }

            });

            $(window).on("resize", function () {
                if (__visibility) {
                    __onWindowResize();
                } else {
                    __hasResize = true;
                }

            });
        },

        __onWindowResize = function () {
            var height = ($(window).height() - __$header.height()) *(__fullscreen ? 1 : ( 60 / 100));
            __$itemPacks.css("height", height + "px");
            __hasResize = false;

            if(!__fullscreen) {
                $("#TIS_inApp_mainPage").css({
                    "margin-top" : ($(window).height() * __mareginTopPercentForNotFullscreen) + "px"
                });
            }
        },

        __initScrollEvent = function ($elem) {
            console.trace("__initScrollEvent--------");
            $elem
                .off("scroll")
                .on('scroll', function () {
                if ($elem[0].scrollHeight - 20 <= $(this).scrollTop() + $elem[0].clientHeight) {
                    $elem.off('scroll');
                    __updateItemPacks({
                        isFromScroll: true
                    });
                }
            });
        },

        __initSubscribeConfirmDialog = function () {

            var question = __dic.PURCHASE_CONFIRMMESSAGE[__lang].replace("$VAR", "<i TIS-DATA='PRICE'></i>");
            question = question.replace("$ITEM", "<i TIS-DATA='ITEM'></i>");

            var content = "\
            <div id='TIS_inApp_confirm_container' class='modal fade'>\
                    <div class='modal-dialog' >\
                        <div class='modal-content' style='background-color: #faf4e3'>\
                            <div class='modal-header' style='display: table;width: 100%;border: 0;'>\
                                <i class='tis tis-2x tis-close-circle  TIS-pointer' data-dismiss='modal' style='display: table-cell;vertical-align: middle; width: 20px;color:#1cb7d4;font-weight: bold'></i>\
                                <h3 style='text-align: center'>" + __dic.PURCHASE[__lang] + "</h3>\
                            </div>\
                            <div class='modal-body' style='padding-bottom: 0;text-align: center'>\
                                <p>" + question + "</p>\
                                <div>\
                                    <div class='list-group-item' style='min-height: 50px;display: none'>\
                                        <div class='TIS-checkbox pull-right' style='text-align: center;float: right;padding-left: 20px'>\
                                            <input  id='TIS_league_voucherINP' type='checkbox' checked='false'/>\
                                            <label  for='TIS_league_voucherINP' class='label-success'></label>\
                                        </div>\
                                        <div style='float: right;'>" + __dic.I_HAVE_VOUCHER[__lang] + "</div>\
                                        <div style='text-align: center;padding-top: 30px'>\
                                            <input type='text' TIS-DATA='VOUCHER' aria-invalid='' placeholder='" + __dic.VOUCHER[__lang] + "' class='input-lg' style='display:none;border-radius:48px;margin-top: 10px;outline: none;'>\
                                        </div>\
                                    </div>\
                                </div>\
                                <div class='row'>\
                                    <div class='col-lg-3 col-md-3 col-sm-3 col-xs-2'></div>\
                                    <div class='col-lg-6 col-md-6 col-sm-6 col-xs-8'>\
                                        <div \
                                            id='okButton'\
                                            class='TIS-pointer TIS-league-sendRate' \
                                            style='box-shadow: inset 0px -7px 0px -2px rgba(0,0,0,0.2);background: #ffb200;width: 100%;height: 50px;border-radius: 10px;text-align: center;color:white;display: table;margin-top: 20px;margin-bottom: 20px'>\
                                            <span style='display: table-cell;vertical-align: middle;font-size: 25px;'> " + __dic.ACCEPT[__lang] + "</span>\
                                        </div>\
                                    </div>\
                                    <div class='col-lg-3 col-md-3 col-sm-3 col-xs-2'></div>\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
            ";
            __subscribeConfirmDialogElm = $(content);

            var $voucherElm = __subscribeConfirmDialogElm.find("input[TIS-DATA=VOUCHER]");
            var $checkbox = __subscribeConfirmDialogElm.find("#TIS_inApp_voucherINP");
            $checkbox.prop("checked", false);

            $checkbox.on("change", function () {
                var checked = $(this).is(":checked");
                $voucherElm.val("");
                if (checked) {
                    $voucherElm.show();
                } else {
                    $voucherElm.hide();
                }
            });

            __subscribeConfirmDialogElm.appendTo(document.body).modal("hide");
        },

        __confirm = function (price,itemName, success) {

            __subscribeConfirmDialogElm.find("i[TIS-DATA='PRICE']").html(price);
            __subscribeConfirmDialogElm.find("i[TIS-DATA='ITEM']").html(itemName);

            __subscribeConfirmDialogElm
                .find('#okButton')
                .off("click")
                .click(function (event) {
                    success();
                    __subscribeConfirmDialogElm.modal('hide');
                });

            __subscribeConfirmDialogElm.modal('show');
        },

        __initUi = function (callback) {
            if (!__isUiInit) {
                __parent.getGamesInfo({registerGame:true}, function (result) {
                    if (result.hasError) {
                        __parent.alert(result.errorMessage);
                    } else {
                        __gamesInfo = result.result.games;
                        __$gameItems.empty();
                    }
                    callback(result);
                });
            } else {
                callback({
                    hasError: false
                });
            }
        },

        __visibilityFN = function (visibility) {

            if (typeof visibility === "boolean") {
                if (visibility) {
                    __self.show();
                } else {
                    __self.hide();
                }
            }
            return __visibility;
        },

        __getPlanText = function (plan) {

            var planText,
                startTimeView = "",
                endTimeView = "";
            if (plan.fromDate) {
                var startTime = new Date(plan.fromDate);
                var shamsiStartTime = TIS.Util.miladiToShamsi(startTime.getUTCFullYear(), startTime.getUTCMonth() + 1, startTime.getUTCDate());
                startTimeView = "<i class='tis tis-left-hand'></i>    " + __dic.STARTTIME[__lang] + "  :  " + shamsiStartTime.d + " / " + shamsiStartTime.m + " / " + shamsiStartTime.y;
            }
            if (plan.toDate) {
                var endTime = new Date(plan.toDate);
                var shamsiEndTime = TIS.Util.miladiToShamsi(endTime.getUTCFullYear(), endTime.getUTCMonth() + 1, endTime.getUTCDate());
                endTimeView = "<i class='tis tis-left-hand'></i>    " + __dic.ENDTIME[__lang] + "  :  " + shamsiEndTime.d + " / " + shamsiEndTime.m + " / " + shamsiEndTime.y;
            }

            if (plan.type == 1) {
                planText = "مصرفی";
            }
            else if (plan.type == 2) {
                planText = "مصرفی - زمانی";
            }
            else if (plan.type == 3) {

                switch (plan.cycle) {
                    case 1:
                        planText = "مصرفی - روزانه";
                        break;

                    case 2:
                        planText = "مصرفی - هفتگی";
                        break;

                    case 3:
                        planText = "مصرفی - ماهانه";
                        break;

                    case 4:
                        planText = "مصرفی - 3 ماهه";
                        break;

                    case 5:
                        planText = "مصرفی - 6 ماهه";
                        break;

                    case 6:
                        planText = "مصرفی - سالانه";
                        break;
                }

            }
            else if (plan.type == 4) {

                if (plan.cycle == 0) {
                    planText = "مصرفی - زمانی";
                }
                else {

                    switch (plan.cycle) {
                        case 1:
                            planText = "اشتراکی - روزانه";
                            break;

                        case 2:
                            planText = "اشتراکی - هفتگی";
                            break;

                        case 3:
                            planText = "اشتراکی - ماهانه";
                            break;

                        case 4:
                            planText = "اشتراکی - 3 ماهه";
                            break;

                        case 5:
                            planText = "اشتراکی - 6 ماهه";
                            break;

                        case 6:
                            planText = "اشتراکی - سالانه";
                            break;
                    }

                }

            }
            var plane = "";
            if (planText) {
                plane = "<i class='tis tis-left-hand'></i>    " + __dic.PLANE[__lang] + "  :  " + planText;
            }

            return {
                plan: "<h5>" + plane + "</h5>",
                range: "<h5>" + startTimeView + "<div style='padding-top: 10px'></div>"+  endTimeView + "</h5>"
            };
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

        __$itemPacks.prepend(__$loading);
        __fullscreen = true;


        if(params) {
            if(typeof  params.buttonBackgroundColor === "string") {
                __BtnBackgroundColor = params.buttonBackgroundColor;
            }

            if(typeof  params.global==="boolean") {
                __isGlobal = params.global;
            } else{
                __isGlobal = false;
            }

            if(typeof params.fullscreen === "boolean") {
                __fullscreen = params.fullscreen;
            }

            if(typeof params.onBuy === "function"){
                __onBuy = params.onBuy;
            }


            if(typeof params.onHide === "function"){
                __onHide = params.onHide;
            }
        }


        if(__fullscreen) {

            $("#TIS_inApp_mainPage").css({
                "height": "100%",
                "overflow" : "hidden",
                "margin-top" : "0"
            });

        } else {
            $("#TIS_inApp_container").css({
                "background-color": "rgba(0, 1, 1, 0.6)"
            });

            $("#TIS_inApp_mainPage").css({
                "height": "auto",
                "overflow" : "hidden",
                "margin-top" : ($(window).height() * __mareginTopPercentForNotFullscreen) + "px"
            });

        }

        __initUi(function (result) {

            if (result.hasError) {
                __isUiInit = false;
                __$loading.remove();
            } else {
                if (params && (params.gameId || params.itemId)) {
                    if(params.itemId && !params.gameId) {
                        __$itemPacks.find('*:not(".alert,.tis-spin4")').remove();
                    }

                    __setCurrentGameShow(params.gameId,params.itemId,function () {
                        __$loading.remove();
                        if(!params.gameId && params.itemId) {
                            __isUiInit = false;
                        }
                    });
                } else {
                    if (!__isUiInit) {
                        if (__gamesInfo.length > 0) {
                            __setCurrentGameShow(__gamesInfo[0].id,null,function () {
                                __$loading.remove();
                            });
                        } else {
                            __$loading.remove();
                        }
                        __isUiInit = true;
                    } else {
                        __$loading.remove();
                    }
                }
            }

        });

        if(__animate) {
            setTimeout(function () {
                __$parentContainer
                    .css({
                        "transform": "translateX(0)",
                        "-webkit-transform": "translateX(0)"
                    });
            },10);
        } else {
            if(__fullscreen) {
                __$parentContainer.show();
            } else {
                __$parentContainer.fadeIn(500);
            }
        }

        if (__hasResize) {
            __onWindowResize();
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
        if(__animate) {
            __$parentContainer
                .css({
                    "transform": "translateX(calc(100%))",
                    "-webkit-transform": "translateX(calc(100%))"
                });
        } else {
            __$parentContainer.hide();
        }
        __onBuy = null;

        if(typeof __onHide === "function"){
            __onHide();
        }

        __onHide = null
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

    __self.onLogout = function () {
        __isUiInit = false;
    };

    __self.onCreditChange = function () {

    };

    __self.backButton = function () {
        if (__subscribeConfirmDialogElm && __subscribeConfirmDialogElm.hasClass("in")) {
            __subscribeConfirmDialogElm.modal("hide");
            return true;
        } else if(__visibility) {
            __self.hide();
            return true;
        }

        return false;
    };


    __init();
};