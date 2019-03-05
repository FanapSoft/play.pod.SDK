/**
 * @class InAppPurchasesUI
 * @module ServiceUI
 * @submodule ServiceUI
 *
 * */
TIS.ExchangeUI = function (options) {
    /*==================================================================================================================
     *                                      P R I V A T E   V A R I A B L E
     *================================================================================================================*/
    var __self = this,
        __dic = options.dictionary,
        __exchange = options.exchange,
        __globalConfig = options.config,
        __ownConfig = __globalConfig && __globalConfig.exchangeUI,
        __animate = false,
        __parent = options.parent,
        __isUiInit = false,
        __visibility = false,
        __$parentContainer, __dialogContainerElm,
        __headerContainerElm, __filterContainerElm,
        __$productSelectContainer,__$providerProductContainer,
        __$tagPoolContainer,
        __$back,
        __footerContainerElm,
        __$gameItems, __$header,
        __$transformerProductContainer,
        __$mainPage,
        __subscribeConfirmDialogElm,
        __lang = options.language,
        __hasResize = false,
        __isPopoverTagInit = false,
        __hasNextPage = true,
        __currentTransformerProductOffset = 0,
        __loadProductCount = 20,
        __selectedProviderProductId,
        __ProviderProducts = {},
        __ProviderProductsFromServer = {},
        __BtnBackgroundColor = (options.config && options.config.buttonBackgroundColor) || "#1cb7d4",
        __BtnTextColor = (options.config && options.config.buttonTextColor) || "black",
        __$lastTagSearchPopover,
        __$loading,
        __$reload;

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
            __initSearchPopover();
            __dialogContainerElm = __$parentContainer.find(".modal-dialog");
            __headerContainerElm = __$parentContainer.find(".TIS-heading");
            __filterContainerElm = __$parentContainer.find("#TIS_exchange_filterContainer");
            __footerContainerElm = __$parentContainer.find(".panel-footer");
            __$gameItems = __$parentContainer.find("#TIS_exchange_itemName_container");
            __$transformerProductContainer = __$parentContainer.find("#TIS_exchange_transformerProducts_container");
            __$providerProductContainer = __$parentContainer.find("#TIS_exchange_providerProducts_container");
            __$productSelectContainer = __$parentContainer.find("#TIS_exchange_productSelectContainer");
            __$back = __$parentContainer.find("#TIS_exchange_back");
            __$header = __$parentContainer.find("#TIS_exchange_header");
            __$tagPoolContainer = __$parentContainer.find("#TIS_exchange_tagPool"),
            __$mainPage = __$parentContainer.find("#TIS_exchange_mainPage");

            __initEvent();

            __initSubscribeConfirmDialog();

            __initLoading();
        },

        __showProviderProduct = function () {
            __$providerProductContainer.show();
            __$transformerProductContainer.hide();
            $("#TIS_exchange_tagSearchContainer").hide();
            __$back.css("visibility","hidden");
        },

        __showTransformerProduct = function (providerProductId) {


            __$providerProductContainer.hide();
            __$transformerProductContainer.show();
            __$back.css("visibility","visible");

            $("#TIS_exchange_tagSearchContainer").show();

            if(providerProductId != __selectedProviderProductId) {
                __$tagPoolContainer.empty();
                __selectedProviderProductId = providerProductId;
                __currentTransformerProductOffset = 0;
                __hasNextPage = true;
                __loadTransformerProducts();
            }
        },

        __initLoading = function () {
            var content = "\
                <div class='alert alert-success' style='text-align: center;margin: 30px;'><i class='tis tis-spin4 tis-spin tis-3x'></i></div>\
            ";

            var reloadContent = "\
                <div class='alert alert-danger TIS-reload' style='text-align: center;margin: 30px;'><i class='tis tis-spin4 tis-3x'></i></div>\
            ";

            __$loading = $(content);
            __$reload = $(reloadContent);
        },

        __initSearchPopover = function () {
            __$lastTagSearchPopover = __$parentContainer.find("#TIS_exchange_tagSearchInp").popover('destroy');
            __$lastTagSearchPopover
                .popover({
                    html: true,
                    placement: "bottom",
                    content: function () {
                        return "<div></div>";
                    }
                });
            // __$lastTagSearchPopover.popover("show");

        },

        __addTagToTagPool = function (tagData) {
            var tagId = tagData.tId;

            // __lastAddedTag[tagId] = tagData;

            var currentTag = __$tagPoolContainer.find("a[tId='" + tagId + "']");

            if (currentTag.length > 0) {
                return;
            }

            var $tag = $("<li class='btn' style='position:relative;margin:5px;background-color: "+__BtnBackgroundColor+"'>" +
                "<a style='color:white' href='#'  tId= " + tagId + ">" + tagData.name + "</a>" +
                "<i class='tis  tis-close-circle' style='position: absolute;left: 0;top: 0;font-weight: bold;color:#492c2a;font-size: x-small'></i>" +
                "</li>");
            $tag.on("click", function () {
                $(this).remove();
                __currentTransformerProductOffset = 0;
                __hasNextPage = true;
                __loadTransformerProducts();
            });
            __$tagPoolContainer.append($tag);

            __currentTransformerProductOffset = 0;
            __hasNextPage = true;
            __loadTransformerProducts();
        },

        __addNewTagsToList = function (tags, preventShowPopover) {
            // __$tagContainer.find("li a[tId]").parent().remove();

            var htmlContent = $("<div style='max-height: 200px;overflow: auto'></div>");

            for (var i = 0; i < tags.length; i++) {
                var content = "\
                            <div class='list'  status='" + tags[i].status + "' tId=" + tags[i].id + " style='text-align: center;cursor: pointer;margin-bottom: 5px;'>" + tags[i].name + "</div>\
                        ";

                var $content = $(content);

                $content.on("click", function () {
                    var $this = $(this);
                    __addTagToTagPool({
                        tId: $this.attr("tId"),
                        name: $this.html(),
                    });
                    if (__$lastTagSearchPopover) {
                        $("#quiz_tag_search").val("");
                        __$lastTagSearchPopover.popover('hide');
                    }

                });

                htmlContent.append($content);
            }

            __$lastTagSearchPopover = $("#TIS_exchange_tagSearchInp").popover('destroy');
            if (tags.length > 0) {
                __$lastTagSearchPopover
                    .popover({
                        html: true,
                        placement: "bottom",
                        content: function () {
                            return htmlContent;
                        }
                    });
                if (!preventShowPopover) {
                    __$lastTagSearchPopover.popover("show");
                }
            }

        },

        __updatePopoverTags = function (preventShowPopover) {

            __exchange.getTags({
                nameFilter: $("#TIS_exchange_tagSearchInp").val()
            },function (res) {
                if(!res.hasError) {
                    __addNewTagsToList(res.result, preventShowPopover);
                }
            });

        },

        __initView = function () {

            var style = '';

            if(__animate) {
                style = 'transform : translateX(calc(100%));-webkit-transform : translateX(calc(100%))';
            } else {
                style = 'display : none';
            }
            var content = "\
                <div  id='TIS_exchange_container' style='"+style+"'>\
                     <div id='TIS_exchange_mainPage' style='background-color:#faf4e3;height: 100%'>\
                        <div id='TIS_exchange_header' >\
                            <div style='padding-top: 10px'>\
                                 <i id='TIS_exchange_close' class='tis tis-close tis-2x  TIS-pointer' style='float: right;margin-right: 10px;color:"+__BtnBackgroundColor+";font-weight: bold'></i>\
                                 <i id='TIS_exchange_back' class='tis tis-left-open-1 tis-2x TIS-pointer' style='float: left;margin-left: 25px;color:"+__BtnBackgroundColor+";visibility: hidden'></i>\
                                 <div class='panel-title' style='text-align:center;font-weight: bold;font-size: x-large;'>" + __dic.EXCHANGE_CREDIT[__lang] + "</div>\
                             </div>\
                             <div id='TIS_exchange_tagSearchContainer' style='display: none'>\
                                 <div id='TIS_exchange_searchContainer' class='input-group' style='margin: 10px 5px 5px 5px'>\
                                    <span class='input-group-addon'>\
                                        <i class='tis tis-search'></i>\
                                    </span>\
                                    <input id='TIS_exchange_tagSearchInp' type='search' class='form-control' placeholder='نوع تبدیل'>\
                                 </div>\
                                 <div id='TIS_exchange_tagPool'></div>\
                             </div>\
                        </div>\
                       <div id='TIS_exchange_transformerProducts_container' style='display: none;height: 100%;overflow-y: auto;'></div>\
                       <div id='TIS_exchange_providerProducts_container' style='height: 100%'>\
                            <div style='display: table;padding: 80px 10px 40px 10px;width: 100%'>\
                                <div style='text-align: center;display: table-cell;vertical-align: middle'>\
                                    <div style='font-weight: bold;font-size: large;color:#663399'>\
                                                                        از کدام اعتبار خود برای خرید می خواهید استفاده کنید؟\
                                    </div>\
                                </div>\
                            </div>\
                            <div style='display: table;height: 40%;width: 100%'>\
                                <div style='text-align: center;display: table-cell;vertical-align: middle'>\
                                    <div id='TIS_exchange_productSelectContainer'>\
                                        <div class='alert alert-success' style='text-align: center;margin: 30px;'>تیس</div>\
                                    </div>\
                                </div>\
                            </div>\
                       </div>\
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
                                    style='cursor:pointer;text-align: center;color: "+__BtnBackgroundColor+";height: 2em;margin-top: 10px'>\
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

        __createPackView = function (productData,providerProductId) {

            var productId = productData.id,
                priceText = productData.price,
                price = productData.price;
            if (productData.price == 0) {
                priceText = __dic.FREE[__lang];
            }

            if(productData.price != 0 && providerProductId ) {

                if(__ProviderProducts[providerProductId]) {

                    if(__ProviderProducts[providerProductId].factor) {
                        priceText *= __ProviderProducts[providerProductId].factor;
                        price *= __ProviderProducts[providerProductId].factor;
                    }

                    if(__ProviderProducts[providerProductId].creditUnitName) {
                        priceText += (" " + __ProviderProducts[providerProductId].creditUnitName)
                    } else {
                        priceText += (" " + __ProviderProductsFromServer[providerProductId].creditUnitName)
                    }


                } else {
                    priceText += (" " + __ProviderProductsFromServer[providerProductId].creditUnitName)
                }

            }
            var leagueImageUrl = __parent.getService().generateImageSrc(productData.image) ;


            var content = "\
                <div style='text-align: center;margin: 5px 0 15px 0;width:100%;'>\
                    <div style='background-color: white;height: 55px;box-shadow: 0 0 5px 3px rgba(0,0,0,0.4);text-align: center'>\
                        <div class='col-xs-2 col-sm-2 col-md-2 col-lg-2' style='padding-left: 0;padding-right: 0;height: 100%;display:table'>\
                            <div  style='display: table-cell;vertical-align: middle'>\
                                <img  style='height: 47px;width: 47px;' src='" + leagueImageUrl + "'>\
                            </div>\
                        </div>\
                        <div class='col-xs-5 col-sm-6 col-md-6 col-lg-6' style='padding-left: 0;padding-right: 0;height: 100%;display:table'>\
                            <div style='display: table-cell;vertical-align: middle'>\
                                <div class='TIS-inApp-packName' style='font-size: small'>" + productData.name + "</div>\
                            </div>\
                        </div>\
                        <div class='col-xs-3 col-sm-2 col-md-2 col-lg-2' style='padding-left: 0;padding-right: 0;height: 100%;display:table '>\
                            <div style='display: table-cell;vertical-align: middle'>\
                             " + priceText + "\
                            </div>\
                        </div>\
                        <div class='col-xs-2 col-sm-2 col-md-2 col-lg-2' style='padding-left: 3px;padding-right: 0;height: 100%;display: table;float: left'>\
                            <div class='TIS-pointer TIS-inApp-subscribe' style='display: table-cell;vertical-align: middle'>\
                                <div\
                                class='TIS-BTN' \
                                style='background-color: "+__BtnBackgroundColor+";height:50px;width: 50px;border-radius: 25px;float: left'>\
                                    <span style='display: table-cell;vertical-align: middle;font-size: 15px;'> " + __dic.EXCHANGE[__lang] + "</span>\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                    <div TIS-DATA='EXTRA' style='display: none;padding-top: 2px'>\
                        <div style='background-color: white;box-shadow: 0px 7px 11px -1px rgba(0,0,0,0.4);text-align: right;padding-right: 30px'>\
                           <div style='padding-bottom: 10px;font-weight: bold'>" + __dic.DESCRIPTION[__lang] + "&nbsp;:</div>\
                           <div class='TIS_scroll' style='overflow-y:auto;padding-bottom: 20px;max-height: 200px'>" + productData.description.replace(/\\n|\\r\\n|\\r/g, "<br />") + "</div>\
                        </div>\
                    </div>\
                </div>\
            ";

            var $contElm = $(content).appendTo(__$transformerProductContainer);
            var $extra = $contElm.find("div[TIS-DATA='EXTRA']");

            $contElm.click(function (e) {
                var display = $extra.css("display");
                if (display != "none") {
                    $extra.attr("visible", "false");
                    $extra.hide("slow");
                } else {
                    var $allSHow = __$transformerProductContainer.find("div[TIS-DATA='EXTRA'][visible='true']");
                    $allSHow
                        .attr("visible", "false")
                        .hide("slow");

                    $extra.attr("visible", "true");
                    $extra.show("slow");
                }
            });

            $contElm.find(".TIS-inApp-subscribe").click(function (e) {
                var $this = $(this);
                __disableBtn($this);

                function subscribe(fields,callback) {
                    var requestData = {
                        providerProductId: providerProductId,
                        transformerProductId: productData.id
                    };

                    if(typeof fields == "object" && fields != null) {
                        for(var key in fields) {
                            requestData[key] = fields[key];
                        }
                    }

                    __exchange.buyTransformerProduct(requestData, function (result) {
                        // $this.removeClass("tis-spin TIS_disable");
                        if (result.hasError) {
                            if (result.errorCode == 1019) {
                                var content = "\
                                        <div>\
                                            <i>" + result.errorMessage + "</i>\
                                            <a href='#!'  class='btn btn-lg TIS-orange'>" + __dic.INCREASECASH[__lang] + "</a>\
                                        </div>\
                                    ";

                                var $elm = $(content);

                                $elm.find("a").on("click", function () {

                                    if(__ProviderProducts[providerProductId] && __ProviderProducts[providerProductId].tisCredit) {
                                        __parent.credit({
                                            // packId: productData.id,
                                            fromAmount: productData.price
                                        });
                                    } else {
                                        __parent.showInAppPurchaseUI();
                                    }

                                });
                                __parent.alert($elm);
                            } else {
                                var errMsg = result.errorMessage;
                                if(result.errorCode == 1017) {
                                    errMsg = __dic.TRY_AGAIN[__lang];
                                }
                                __parent.alert(errMsg);
                            }

                        } else {
                            __parent.info(__dic.BUY_SUCCESS[__lang].replace("$ITEM", productData.name));
                        }

                        __enableBtn($this);
                        callback && callback(result);
                    });
                }

                if (productData.price > 0 || (Array.isArray( productData.dynamicAttribute) &&  productData.dynamicAttribute.length>0) ) {

                    function confirm() {
                        __confirm(
                            priceText  + "&nbsp" + "&nbsp",
                            productData.dynamicAttribute,
                            function (fields) {
                            __disableBtn($this);
                            __subscribeConfirmDialogElm.find(".tis-close-circle").removeAttr("data-dismiss");
                            __subscribeConfirmDialogElm.find("#TIS_exchange_confirm_okBtn").addClass("TIS_disable");
                            __subscribeConfirmDialogElm.find("input").attr("disabled","disabled");
                            __subscribeConfirmDialogElm.modal({
                                backdrop: 'static',
                                keyboard: false
                            });
                            subscribe(fields,function () {
                                __subscribeConfirmDialogElm.find(".tis-close-circle").attr("data-dismiss","modal");
                                __subscribeConfirmDialogElm.find("#TIS_exchange_confirm_okBtn").removeClass("TIS_disable");
                                __subscribeConfirmDialogElm.find("input").removeAttr("disabled");
                                __subscribeConfirmDialogElm.modal('hide');
                            });
                        });
                    }
                    if(__ProviderProducts[providerProductId]) {
                        if(__ProviderProducts[providerProductId].tisCredit) {
                            __parent.getCredit(function (res) {
                                __enableBtn($this);
                                if (res.hasError) {
                                    __parent.alert(res.errorMessage);
                                } else {
                                    if (res.result.credit >= price || price ==0) {
                                        confirm();
                                    } else {
                                        __parent.credit({
                                            fromAmount: price - res.result.credit
                                        });
                                    }
                                }
                            });
                        } else if(__ProviderProducts[providerProductId].itemId) {
                            __parent.getUserItem({
                                itemId : __ProviderProducts[providerProductId].itemId,
                                gameId : __ProviderProducts[providerProductId].gameId
                                
                            },function (res) {
                                __enableBtn($this);
                                if (res.hasError) {
                                    __parent.alert(res.errorMessage);
                                } else {
                                    var count = res.result &&
                                        Array.isArray(res.result.items) &&
                                        res.result.items.length>0 &&
                                        res.result.items[0].count;

                                    if (count >= price || price ==0) {
                                        confirm();
                                    } else {
                                        __parent.alert(__dic.INCREASE_CREDIT_FOR_BUY[__lang]);
                                        __parent.showInAppPurchaseUI({
                                            itemId: __ProviderProducts[providerProductId].itemId,
                                            gameId : __ProviderProducts[providerProductId].gameId,
                                            fullscreen : false
                                        });
                                    }
                                }
                            })
                        } else {
                            confirm();
                        }

                    } else {
                        confirm();
                    }


                } else {
                    subscribe();
                }

                e.preventDefault();
                return false;
            });

            return content;
        },

        __initEvent = function () {

            $("#TIS_exchange_close").on("click", function () {
                __self.hide();
            });

            __$back.on("click", function () {
                __showProviderProduct();

            });

            __$parentContainer.on("click", ".TIS-moreData", function () {
                var $BTN = $(this);
                var isLoading = $BTN.hasClass("tis-spin");

                if (!isLoading) {
                    __loadTransformerProducts();
                }

            });
            __$parentContainer.on("click", function (e) {
                if(!$(e.target).is("input")) {
                    __$parentContainer.find("#TIS_exchange_tagSearchInp").popover('hide');
                }

            });

            $(window).on("resize", function () {
                if (__visibility) {
                    __onWindowResize();
                } else {
                    __hasResize = true;
                }

            });

            $(document).on("click", ".TIS-exchange-providerProduct", function () {

                __showTransformerProduct($(this).attr("productId"));

            });


            __$parentContainer.on("click", ".TIS-reload", function () {
                __loadProviderProducts();
            });


            __$parentContainer.find("#TIS_exchange_tagSearchInp").on("keyup", function () {

                __updatePopoverTags(false);
            });
        },

        __onWindowResize = function () {
            var height = $(window).height() - __$header.height();
            __$transformerProductContainer.css("height", height + "px");
            __hasResize = false;
        },

        __initScrollEvent = function ($elem) {
            $elem
                .off("scroll")
                .on('scroll', function () {
                    if ($elem[0].scrollHeight - 20 <= $(this).scrollTop() + $elem[0].clientHeight) {
                        $elem.off('scroll');
                        __loadTransformerProducts();
                    }
                });
        },

        __initSubscribeConfirmDialog = function () {

            var question = __dic.PURCHASE_CONFIRMMESSAGE[__lang].replace("$VAR", "<i TIS-DATA='PRICE'></i>");
            question = question.replace("$ITEM", "<i TIS-DATA='ITEM'></i>");

            var content = "\
            <div id='TIS_exchange_confirm_container'  class='modal fade'>\
                    <div class='modal-dialog' >\
                        <div class='modal-content' style='background-color: #faf4e3'>\
                            <div class='modal-header' style='display: table;width: 100%;border: 0;padding-top: 0'>\
                                <i class='tis tis-2x tis-close-circle  TIS-pointer' data-dismiss='modal' style='display: table-cell;vertical-align: middle; width: 20px;color:#1cb7d4;font-weight: bold'></i>\
                                <h3 style='text-align: center'>" + __dic.EXCHANGE[__lang] + "</h3>\
                            </div>\
                            <div class='modal-body' style='padding-bottom: 0;text-align: center'>\
                                <p>" + question + "</p>\
                                <div class='input-group' TIS-DATA='INPUTS' style='width: 100%'>\
                                </div>\
                                <div class='row'>\
                                    <div class='col-lg-3 col-md-3 col-sm-3 col-xs-2'></div>\
                                    <div class='col-lg-6 col-md-6 col-sm-6 col-xs-8'>\
                                        <div \
                                            id='TIS_exchange_confirm_okBtn'\
                                            class='TIS-pointer' \
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

            __subscribeConfirmDialogElm.appendTo(document.body).modal("hide");
        },

        __confirm = function (price,dynamicAttr, success) {

            __subscribeConfirmDialogElm.find("i[TIS-DATA='PRICE']").html(price);
            // __subscribeConfirmDialogElm.find("i[TIS-DATA='ITEM']").html(itemName);

            var $inputs = __subscribeConfirmDialogElm.find("[TIS-DATA='INPUTS']").empty();
            var content = "";


            if(Array.isArray(dynamicAttr) && dynamicAttr.length>0) {

                for (var i = 0; i < dynamicAttr.length; i++) {
                    var attr = dynamicAttr[i];


                    content += '\
                      <input type="text" class="form-control input-lg" placeholder="'+attr.description+'" name="'+attr.name+'" style="width: 100%;margin-top: 10px;border-radius: 15px">\
                    ';

                    $inputs.append(content);
                }
            }
            __subscribeConfirmDialogElm
                .find('#TIS_exchange_confirm_okBtn')
                .off("click")
                .click(function (event) {
                    var fields = {};
                    if(Array.isArray(dynamicAttr) && dynamicAttr.length>0) {
                        for (var i = 0; i < dynamicAttr.length; i++) {
                            var attr = dynamicAttr[i];
                            var $input = __subscribeConfirmDialogElm.find("[TIS-DATA='INPUTS']").find("input[name=" + attr.name + "]");
                            var value = $input.val();
                            if(value.length ==0 && attr.force) {
                                __parent.alert(attr.description + " را وارد نمایید");
                                return;
                            }

                            if(attr.validatorRegex) {
                                var reg = new RegExp(attr.validatorRegex);
                                if(!reg.test(value)) {
                                    __parent.alert(attr.description + " را صحیح وارد نمایید");
                                    return;
                                }
                            }
                            fields[attr.name] = value;
                        }
                    }
                    success(fields);
                });

            __subscribeConfirmDialogElm.modal('show');
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

        __initProviderSelect = function () {

            var productIds = Object.keys(__ProviderProductsFromServer);
            __$productSelectContainer.empty();
            if(productIds.length >1) {

                __showProviderProduct();
                for (var i = 0; i < productIds.length; i++) {
                    var productId = productIds[i];

                    var creditUnitName;
                    if(__ProviderProducts[productId] && __ProviderProducts[productId].creditUnitName) {
                        creditUnitName = __ProviderProducts[productId].creditUnitName;
                    } else {
                        creditUnitName = __ProviderProductsFromServer[productId].creditUnitName
                    }
                    var content = "\
                        <div productId='"+productId+"' class='TIS-exchange-providerProduct' " +
                        "style='text-align: center;margin: 30px;padding: 15px;border: 1px solid transparent;border-radius: 4px;color: "+__BtnTextColor+";background-color: "+__BtnBackgroundColor+"'>"+creditUnitName+"</div>\
                    ";

                    __$productSelectContainer.append(content);
                }
            } else if(productIds.length==1) {

                __showTransformerProduct(productIds[0]);
            }
        },

        __loadProviderProducts = function (productIds,callback) {

            if(!productIds) {
                productIds = Object.keys(__ProviderProducts);
            }
            __$productSelectContainer.empty().append(__$loading);

            var reqData = {
                productIds: productIds
            };
            __exchange.getProviderProducts(reqData, function (res) {
                if(res.hasError) {
                    __$productSelectContainer.empty().append(__$reload);
                } else {
                    for (var i = 0; i < res.result.length; i++) {
                        var data = res.result[i];
                        __ProviderProductsFromServer[data.id] = data;
                    }
                    __initProviderSelect();
                }
                __$loading.remove();
                callback && callback(res);
            });

        },

        __loadTransformerProducts = function(params){
            if(!__hasNextPage) {
                return;
            }
            var moreElm;

            if(__currentTransformerProductOffset== 0) {
                __$transformerProductContainer.empty();
                moreElm = __generateMoreDataElm();
                __$transformerProductContainer.append(moreElm);
            } else {
                moreElm = __$transformerProductContainer.find(".TIS-moreData");

            }

            __changeAddMoreDataState(moreElm, true);

            var tags = [];
            var $tags = $("#TIS_exchange_tagPool").find("a");
            for (var i = 0; i < $tags.length; i++) {
                tags.push($($tags[i]).attr("tId"));
            }


            var reqData = {
                providerProductId : __selectedProviderProductId,
                count : __loadProductCount,
                offset : __currentTransformerProductOffset
            };

            if(tags.length>0) {
                reqData.tagIds = tags;
            }

            $("#TIS_exchange_tagSearchInp").attr("disabled", "disabled");
            __exchange.getTransformerProducts(reqData, function (res) {
                if(!res.hasError) {
                    moreElm.remove();
                    var products = res.result;
                    for (var i = 0; i < products.length; i++) {
                        __createPackView(products[i],__selectedProviderProductId);
                    }

                    if(products.length == __loadProductCount ) {
                        __currentTransformerProductOffset += __loadProductCount;
                        __initScrollEvent(__$transformerProductContainer);
                        __changeAddMoreDataState(moreElm, false);
                        __$transformerProductContainer.append(moreElm);

                    } else {
                        var notMoreTxt;
                        if(products.length == 0 && __currentTransformerProductOffset==0) {
                            notMoreTxt = __dic.NOT_FIND[__lang];
                        } else {
                            notMoreTxt = __dic.NOT_FIND_MORE[__lang];
                        }

                        __$transformerProductContainer.append(
                            "<div class='alert' style='text-align: center;margin:0;color: #31708f'>" + notMoreTxt + "</div>"
                        );

                        __hasNextPage = false;
                    }
                } else {
                    __changeAddMoreDataState(moreElm, false);
                }

                $("#TIS_exchange_tagSearchInp").removeAttr("disabled");

                __onWindowResize();
            });
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

        if(!__isPopoverTagInit) {
            __updatePopoverTags(true);
            __isPopoverTagInit = true;
        }

        var providerProducts = params.providerProducts;

        if(params) {
            if(typeof  params.buttonBackgroundColor == "string") {
                __BtnBackgroundColor = params.buttonBackgroundColor;
            }
            if(typeof  params.buttonTextColor == "string") {
                __BtnTextColor = params.buttonTextColor;
            }
        }

        var providerProductIds = [];
        if(Array.isArray(providerProducts)) {

            for (var i = 0; i < providerProducts.length; i++) {
                var data = providerProducts[i];
                if(data.productId) {
                    var productId = data.productId;

                    if(!__ProviderProducts[productId]) {
                        __ProviderProducts[productId] = {};
                    }

                    if(data.name) {
                        __ProviderProducts[productId].name = data.name;
                    }
                    if(data.creditUnitName) {
                        __ProviderProducts[productId].creditUnitName = data.creditUnitName;
                    }
                    if(data.factor) {
                        __ProviderProducts[productId].factor = data.factor;
                    }

                    if(typeof data.tisCredit == "boolean") {
                        __ProviderProducts[productId].tisCredit = data.tisCredit;
                    }

                    if(data.itemId) {
                        __ProviderProducts[productId].itemId = data.itemId;
                    }
                    if(data.gameId) {
                        __ProviderProducts[productId].gameId = data.gameId;
                    }
                    if(!__ProviderProductsFromServer[productId]) {
                        providerProductIds.push(productId);
                    }
                }
            }
        }

        if(providerProductIds.length>0) {
            __loadProviderProducts(providerProductIds);
        } else {
            __initProviderSelect();
        }

        if(__animate) {
            setTimeout(function () {
                __$parentContainer
                    .css({
                        "transform": "translateX(0)",
                        "-webkit-transform": "translateX(0)"
                    });
            },1);
        } else {
            __$parentContainer.show();
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
            if(__subscribeConfirmDialogElm.find("#TIS_exchange_confirm_okBtn").hasClass("TIS_disable")) {
                return true;
            }
            __subscribeConfirmDialogElm.modal("hide");
            return true;
        } else if(__visibility) {
            if(__$transformerProductContainer.css("display") != "none" && Object.keys(__ProviderProductsFromServer).length>1) {
                __showProviderProduct();
                return true;
            }  else {
                __self.hide();
                return true;
            }

        }

        return false;
    };




    __init();
};