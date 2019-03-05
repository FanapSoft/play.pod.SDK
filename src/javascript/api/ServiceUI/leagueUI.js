/**
 * @class LeagueUI
 * @module ServiceUI
 * @submodule ServiceUI
 *
 * */
TIS.LeagueUI = function (options) {
    /*==================================================================================================================
     *                                      P R I V A T E   V A R I A B L E
     *================================================================================================================*/
    var __self = this,
        __dic = options.dictionary,
        __parent = options.parent,
        __globalConfig = options.config,
        __ownConfig = __globalConfig && __globalConfig.leagueUI,
        __animate = false,
        __isUiInit = false,
        __visibility = false,
        __parentContainer, __$headerContainerElm,__$footerContainerElm,
        __$mainPageNewLeaguesBody,__$mainPageMyLeaguesBody,
        __filterContainerElm, __addMoreDataElm, __footerContainerElm,
        __$leaguePage, __$leaguePageBody,__$tabContainerElm,
        __$mainPage, __$filterPage,
        __$searchInp,
        __$headerSearchFrame,
        __$headerMainFrame,
        __gameNameContainer,
        __subscribeConfirmDialogElm,
        __$rateModalDialog,
        __gamesInfo,
        __lang = options.language,
        __currentSelectedGameId,
        __currentOffset = 0,
        __isScrollInit = false,
        __isGettingData = false,
        __isLoading = false,
        __hasResize = false,
        __hasNextPage = true,
        __BtnColor = (options.config && options.config.buttonBackgroundColor) || "#0ec10e",
        __headerBtnColor = (options.config && options.config.buttonBackgroundColor) || "white",
        __notMoreTextColor  = (__ownConfig && __ownConfig.notMoreTextColor) || "#8a2be2",
        __moreDescriptionBtnColor = (options.config && options.config.buttonBackgroundColor) || "black",
        __rateButtonColor = (options.config && options.config.buttonBackgroundColor) || "#1cb7d4",
        __playMatchBtnColor = (__ownConfig && __ownConfig.playMatchButtonBackgroundColor) || "#ffb200",
        __rankingBtnColor = (options.config && options.config.buttonBackgroundColor) || "#1285ba",
        __leagueTypeBtnColor = (options.config && options.config.buttonBackgroundColor) || "#1cb7d4",
        __loadingColor = (options.config && options.config.loadingColor) || "#FA8D2E",

        __activeTabId = "#TIS_league_mainPage_firstTab",
        __serverTime;

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
            __$headerContainerElm = __parentContainer.find("#TIS_league_headerContainer");
            __$footerContainerElm = __parentContainer.find("#TIS_league_footerContainer");
            __$tabContainerElm = __parentContainer.find("#TIS_league_mainPage .nav.nav-tabs");
            __filterContainerElm = $("#TIS_league_mainPage_filter");
            __footerContainerElm = __parentContainer.find(".panel-footer");
            __gameNameContainer = $("#TIS_league_gameName_container");
            __$searchInp = $("#TIS_league_search");
            __$mainPageNewLeaguesBody = $("#TIS_league_mainPage_newLeagueContainer");
            __$mainPageMyLeaguesBody = $("#TIS_league_mainPage_myLeagueContainer");
            __$leaguePageBody = $("#TIS_league_leaguePage_leagueContainer");
            __$leaguePage = __parentContainer.find("#TIS_league_leaguePage");
            __$mainPage = __parentContainer.find("#TIS_league_mainPage");
            __$filterPage = __parentContainer.find("#TIS_league_filterPage");
            __$headerSearchFrame = __parentContainer.find("#TIS_league_mainPage_header_searchFrame");
            __$headerMainFrame = __parentContainer.find("#TIS_league_mainPage_header_mainFrame");

            __initEvent();
            __initAddMoreDataElm();
            __initSubscribeConfirmDialog();
            __initRateDialog();

            __$mainPage.find(".panel-title").text(__dic.LEAGUE[__lang] + "   " +  __parent.getService().getGameName());
        },

        __initView = function () {

            var background = "#1cb7d4";
            
            if(__ownConfig && __ownConfig.backgroundUrl ) {
                background = "url(" + __ownConfig.backgroundUrl + ")";
            }

            var style = '';

            if(__animate) {
                style = 'transform : translateX(calc(100%));-webkit-transform : translateX(calc(100%))';
            } else {
                style = 'display : none';
            }

            style += (';background:' + background + ';');


            var mainPageLastLeagueTabContent = "\
                <div id='TIS_league_mainPage_newLeagueContainer' class='TIS_scroll'></div>\
            ";


            var mainPageMyLeagueTabContent = "\
                <div id='TIS_league_mainPage_myLeagueContainer' class='TIS_scroll'></div>\
            ";

            var headerContent = "\
                <div id='TIS_league_headerContainer'>\
                    <div style='padding:10px;'>\
                        <div id='TIS_league_mainPage_header_mainFrame'>\
                           <i id='TIS_league_mainPage_header_mainframe_close' class='tis tis-close tis-2x TIS-pointer'\
                                  style='float: right;color:"+__headerBtnColor+";margin-right: 5px;font-weight: bold'></i>\
                           <i id='TIS_league_mainPage_header_mainframe_update' class='tis tis-refresh tis-2x TIS-pointer'\
                                  style='float: left;color:"+__headerBtnColor+";font-weight: bold'></i>\
                           <i id='TIS_league_mainPage_header_searchBtn' class='tis tis-search tis-2x TIS-pointer'\
                                  style='float: left;margin-left: 20px;color:"+__headerBtnColor+";font-weight: bold'></i>\
                           <div class='panel-title' style='padding:0.3em 0.5em;text-align:center;font-weight: bold;'>" + __dic.LEAGUE[__lang] + "</div>\
                        </div>\
                        <div id='TIS_league_mainPage_header_searchFrame' style='display :none'>\
                             <div class='input-group' style='padding-right: 5px;padding-left: 5px'>\
                                <span id='TIS_league_mainPage_header_searchFrame_close' class='input-group-btn'>\
                                    <button class='btn btn-default' type='button'><span class='tis tis-close TIS-pointer'></span></button>\
                                </span>\
                                <input id='TIS_league_search' style='width: 100%' type='text' class='form-control <!--input-lg-->' placeholder='" + __dic.SEARCH[__lang] + "'>\
                             </div>\
                        </div>\
                    </div>\
                </div>\
            ";

            var footerContent = "\
                <div id='TIS_league_footerContainer'>\
                    <div class='col-lg-12 col-md-12 col-sm-12 col-xs-12'>\
                        <div class='col-lg-6 col-md-6 col-sm-6 col-xs-6 TIS-shadow' style='background-color: black;color:white;box-shadow: 0px 3px 5px 0px #404040;height:4em;text-align:center'>\
                            <div class='dropup'>\
                                <div class='dropdown-toggle' data-toggle='dropdown'>\
                                     <div style='display:table;width:100%;height:100%'>\
                                        <span class='tis tis-sort-1 TIS-leagueType'>\
                                            <span style='padding-right: 5px;'>" + __dic.ORDER_BY[__lang] + "</span>\
                                        </span>\
                                     </div>\
                                </div>\
                                <ul id='TIS_league_orderBy_listContainer' class='dropdown-menu ' role='menu'>\
                                    <!--<li role='info' style='text-align: right'>\
                                        <a value='0' style='color:white;line-height: 3;'>\
                                            <i class='tis tis-circle' style='padding-left:5px;visibility: hidden;'></i> " + __dic.MOST_POPULAR[__lang] + "\
                                        </a>-->\
                                    </li>\
                                    <li role='info' style='text-align: right'>\
                                        <a value='1' style='color:white;line-height: 3;'>\
                                            <i class='tis tis-circle' style='padding-left:5px;visibility: hidden;'></i>" + __dic.TOP_RATE[__lang] + "\
                                        </a>\
                                    </li>\
                                    <li role='info' style='text-align: right'>\
                                        <a value='2' style='color:white;line-height: 3;'>\
                                            <i class='tis tis-circle' style='padding-left:5px;visibility: hidden;'></i>" + __dic.NEWEST[__lang] + "\
                                        </a>\
                                    </li>\
                                </ul>\
                            </div>\
                        </div>\
                        <div id='TIS_league_mainPage_filter' class='col-lg-6 col-md-6 col-sm-6 col-xs-6 TIS-shadow'>\
                             <div style='display:table;width:100%;height:100%'>\
                                <span class='tis tis-filter-2 TIS-leagueType'>\
                                    <span style='padding-right: 5px;'>" + __dic.LEAGUE_TYPE[__lang] + "</span>\
                                </span>\
                             </div>\
                        </div>\
                    </div>\
                </div>\
            ";

            var mainPageContent = "\
                <div id='TIS_league_mainPage'>\
                    <ul class='nav nav-tabs' role='tablist' style='margin-top: 55px;background-color: #faf4e3'>\
                        <li role='presentation' class='active' style='box-shadow: none'>\
                            <a href='#TIS_league_mainPage_firstTab' role='tab'data-toggle='tab' style=' background-color: #faf4e3;white-space: nowrap;'>لیگ های جدید</a>\
                        </li>\
                        <li role='presentation'  style='box-shadow: none'>\
                            <a href='#TIS_league_mainPage_secondTab'role='tab' data-toggle='tab' style='background-color: #faf4e3;white-space: nowrap;'>لیگ های من</a>\
                        </li>\
                    </ul>\
                    <div class='tab-content'>\
                        <div id='TIS_league_mainPage_firstTab' role='tabpanel' class='tab-pane active'>\
                            "+mainPageLastLeagueTabContent+"\
                        </div>\
                        <div id='TIS_league_mainPage_secondTab' role='tabpanel' class='tab-pane'>\
                            "+mainPageMyLeagueTabContent+"\
                        </div>\
                    </div>\
                </div>\
            ";

            var leaguePageContent = "\
                <div  class='TIS_scroll' id='TIS_league_leaguePage' >\
                    <div style=';background-color:rgba(0, 0, 0, 0.4);color:"+__headerBtnColor+";position:fixed;width:100%;z-index:1;padding:5px;right:0'>\
                        <span id='TIS_league_leaguePage_header_back' class='tis tis-right-open-big tis-2x TIS-pointer'\
                              style='float: right;margin-right: 10px;'></span>\
                    </div>\
                    <div  style='height: 100%'>\
                        <div id='TIS_league_leaguePage_leagueContainer' class='TIS_scroll' style='height: 100%;background-color: white;'></div>\
                    </div>\
                </div>\
            ";


            var filterPageSubStateContent = "\
                <div style='padding-top:70px'>\
                     <div class='col-lg-3 col-md-3 col-sm-3 col-xs-3 ' style='text-align:center;z-index:1'>\
                        <div style='display:inline-block'>\
                            <div \
                            id='TIS_league_filterPage_freeSubscribe'\
                            class='TIS-league-selected TIS-league-selection'>\
                                <span style='display:table-cell;vertical-align:middle;'>"+__dic.FREE[__lang]+"</span>\
                            </div>\
                        </div>\
                    </div>\
                    <div class='col-lg-5 col-md-5 col-sm-5 col-xs-5 ' style='text-align:center;white-space:nowrap'>\
                        <div style='font-size:large;font-weight:bold;color:gray'>"+__dic.SUBSCRIBE[__lang]+"</div>\
                        <div style='font-size:30px;line-height: 10px;'>...................</div>\
                    </div>\
                    <div class='col-lg-3 col-md-3 col-sm-3 col-xs-3 ' style='text-align:center;z-index:1'>\
                        <div style='display:inline-block'>\
                            <div \
                            id='TIS_league_filterPage_monetarySubscribe'\
                            class='TIS-league-selected TIS-league-selection'>\
                                <span style='display:table-cell;vertical-align:middle;'>"+__dic.MONETARYSUBSCRIBE[__lang]+"</span>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
            ";

            var filterPageBody = "\
                <div id='TIS_league_filterPage_container' class='TIS_scroll' style='height: 100%;'>\
                    "+filterPageSubStateContent+"\
                    <div style='padding-top:150px'>\
                         <div class='col-lg-3 col-md-3 col-sm-3 col-xs-3 ' style='text-align:center;z-index:1'>\
                            <div style='display:inline-block'>\
                                <div \
                                id='TIS_league_filterPage_hasPrize'\
                                class='TIS-league-selected TIS-league-selection'>\
                                    <span style='display:table-cell;vertical-align:middle;'>"+__dic.HAS[__lang]+"</span>\
                                </div>\
                            </div>\
                        </div>\
                        <div class='col-lg-5 col-md-5 col-sm-5 col-xs-5 ' style='text-align:center;white-space:nowrap'>\
                            <div style='font-size:large;font-weight:bold;color:gray'>"+__dic.PRIZETYPE[__lang]+"</div>\
                            <div style='font-size:30px;line-height: 10px;'>...................</div>\
                        </div>\
                        <div class='col-lg-3 col-md-3 col-sm-3 col-xs-3 ' style='text-align:center;z-index:1'>\
                            <div style='display:inline-block'>\
                                <div \
                                id='TIS_league_filterPage_notPrize'\
                                class='TIS-league-selected TIS-league-selection'>\
                                    <span style='display:table-cell;vertical-align:middle;'>"+__dic.NOT[__lang]+"</span>\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                    <div style='padding-top:100px'>\
                        <div style='font-size:20px;text-align:center;font-weight:bold;color:gray'>"+__dic.LEAGUESTATE[__lang]+"</div>\
                        <div style='text-align:center;padding-top:20px'>\
                            <select \
                            id='TIS_league_filterPage_leagueState'\
                            class='input-lg' style='width:80%;max-width:400px;padding-top:0;padding-bottom:0;height: 60px;'>\
                                <option value='0'>" + __dic.ALL[__lang] + "</option>\
                                <option value='1'>" + __dic.NOTSTARTED[__lang] + "</option>\
                                <option value='2'>" + __dic.ISREGISTERING[__lang] + "</option>\
                                <option value='5' selected>" + __dic.REGISTERING_AND_RUNNING[__lang] + "</option>\
                                <option value='3'>" + __dic.HOLDING[__lang] + "</option>\
                                <option value='4'>" + __dic.PLAYED[__lang] + "</option>\
                            </select>\
                        </div>\
                    </div>\
                    <div style='padding-top:50px'>\
                        <div\
                            id='TIS_league_filterPage_accept'\
                            class='TIS-pointer TIS-BTN' \
                            style='margin:25px auto;background-color: "+__leagueTypeBtnColor+";width:80%;max-width:400px;'>\
                            <span style='display: table-cell;vertical-align: middle;font-size: 30px;'> " + __dic.SHOW[__lang] + "</span>\
                        </div>\
                    </div>\
                </div>\
            ";

            var filterPageContent = "\
                <div class='TIS_scroll' id='TIS_league_filterPage' >\
                    <div style='display:inline-block;position: fixed;width: 100%;background-color: rgb(250, 244, 227);z-index: 2;right:0'>\
                        <i id='TIS_league_filterPage_header_close' class='tis tis-close-circle tis-2x TIS-pointer' style='float: right;margin: 10px;color:"+__leagueTypeBtnColor+";font-weight: bold'></i>\
                    </div>\
                    "+filterPageBody+"\
                </div>\
            ";

            var leagueView = "\
                    <div id='TIS_league_container' class='TIS_scroll' style='"+style+";'>\
                        "+headerContent+"\
                        "+mainPageContent+"\
                        "+leaguePageContent+"\
                        "+filterPageContent+"\
                        "+footerContent+"\
                    </div>\
                ";

            __parentContainer = $(leagueView).appendTo(document.body).modal("hide");
        },

        __changeAddMoreDataState = function (isLoading) {
            if (isLoading) {
                __addMoreDataElm
                    .attr("disabled", true)
                    .find("i")
                    .addClass("tis-spin tis-spin4")
                    .removeClass("tis-down-dir");
                __isLoading = true;
            } else {
                __addMoreDataElm
                    .attr("disabled", false)
                    .find("i")
                    .addClass("tis-down-dir")
                    .removeClass("tis-spin tis-spin4");

                __isLoading = false;
            }
        },

        __initAddMoreDataElm = function () {

            var morDataContent = "<div class='alert moreData img-rounded img-responsive' \
                                    style='cursor:pointer;text-align: center;color: "+__loadingColor+" ;height: 2em;margin-top: 10px'>\
                                    <i class='tis tis-2x tis-down-dir'></i>\
                                </div>";

            __addMoreDataElm = $(morDataContent);

            __parentContainer.on("click", ".moreData", function () {
                var isLoading = $(this).hasClass("tis-spin");

                if (!isLoading) {
                    __changeAddMoreDataState(isLoading);
                    __updateGameLeagues({
                        isFromScroll: false,
                        isFromAddBtn: true,
                        requestType: $(this).attr("requestType"),
                        offset: __currentOffset
                    })
                }

            });
        },

        __subscribeWithWebView = function(params,callback){

            if(TIS.Util.isApp()) {
                TIS.Plugin.subscribeLeagueUI({
                    leagueId: params.leagueId
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
                var url = __parent.getService().getConfig().ssoLeagueEnrollUrl +
                    "/?leagueId=" + params.leagueId +
                    "&_token=" + __parent.getService().getUserData().token +
                    "&_token_issuer=" + __parent.getService().getUserData().tokenIssuer;

                var data = {
                    url: url,
                    callback : function (res) {

                        switch (res.Type) {
                            case 1 :

                                var content = res.Content;
                                callback({
                                    hasError : content.HasError,
                                    errorMessage : content.ErrorMessage,
                                    errorCode : content.ErrorCode,
                                    result : content.Result
                                });

                                __parent.hideWebView();
                                break;

                            case  2 :
                                __parent.hideWebView();

                                break;
                        }

                    }
                };
                __parent.showWebView(data);
            }
        },


        __createLeagueView = function (gameId, leagueData,container) {
            var leagueId = leagueData.id,
                isMember = leagueData.isMember,
                isFollower = leagueData.isFollower,
                BtnName = isMember ? __dic.UNSUBSCRIBE[__lang] : __dic.SUBSCRIBE[__lang],
                maxMemberCount,
                endTime = leagueData.endTime && new Date(leagueData.endTime),
                priceIconContent = "",
                subscribeVtnView = "";


            if (leagueData.maxPlayers > 0) {
                maxMemberCount = leagueData.maxPlayers;
            } else {
                maxMemberCount = __dic.UNLIMIT[__lang];
            }

            maxMemberCount = TIS.Util.toFaDigit(maxMemberCount + "");

            var timeText,
                accessTypeText = "";
            
            if(leagueData.accessType != 1) {
                accessTypeText = __dic.PRIVATE[__lang]
            }


            var timeTextContent;

            if(leagueData.type == 0) {
                timeText = "<i class='tis tis-calendar' style='margin-left: 10px'></i>";
                if (__serverTime < endTime) {
                    var text = "روز مانده به پایان لیگ";
                    var a = moment(__serverTime);
                    var b = moment(endTime);
                    var dif = b.diff(a, 'days');
                    text = TIS.Util.toFaDigit(dif + "") + " " + text;

                    timeText += text;
                } else {
                    timeText = "لیگ به پایان رسیده است";
                }

                timeTextContent = "\
                <h5 class='TIS-leagueUI-remainTime' style='white-space: nowrap'>\
                        "+timeText+"\
                </h5>\
            ";
            }else{
                timeText = "<i class='tis tis-flow-tree' style='margin-left: 10px'></i>" + __dic.PLAYOFF_LEAGUE[__lang];
                timeTextContent = "\
                <h5 style='white-space: nowrap'>\
                        "+timeText+"\
                </h5>\
            ";
            }



            var width = ((isFollower || isMember) ? 45 : 100);

            var matchRequestUIBtnTmp = "\
                    <div leagueId='" + leagueData.id + "'\
                        class='TIS-pointer TIS_league_matchRequest TIS-leagueUI-mainBtn' \
                        style='float: left;box-shadow: inset 0px -7px 0px -2px rgba(189, 135, 8, 0.4);background: "+__playMatchBtnColor+";width: 70px;height: 70px;border-radius: 50%;text-align: center;color:white;display: table'>\
                        <span style='display: table-cell;vertical-align: middle'> " + __dic.PLAYGAME[__lang] + "</span>\
                    </div>\
                ";
            var subscribeVtnViewTmp = "\
                <div>\
                    <div leagueId='" + leagueData.id + "'\
                        class='TIS-pointer TIS_league_subscribe TIS-leagueUI-mainBtn' \
                        isSubscribe='" + isMember + "\
                        enrollUrl='" + leagueData.enrollUrl + "\
                        style='float: left;box-shadow: inset 0px -7px 0px -2px rgba(12, 113, 0, 0.4);background: "+__BtnColor+";width: 70px;height: 70px;border-radius: 50%;text-align: center;color:white;display: table'>\
                        <span style='display: table-cell;vertical-align: middle'> " + BtnName + "</span>\
                    </div>\
                </div>\
                ";

            var subscribeDisableBtnViewTmp = "\
                <div>\
                    <div leagueId='" + leagueData.id + "'\
                        class='TIS-pointer TIS-leagueUI-mainBtn' \
                        isSubscribe='" + isMember + "\
                        enrollUrl='" + leagueData.enrollUrl + "\
                        style='float: left;box-shadow: inset 0px -7px 0px -2px rgba(103, 103, 103, 0.4);background: grey;width: 70px;height: 70px;border-radius: 50%;text-align: center;color:white;display: table'>\
                        <span style='display: table-cell;vertical-align: middle'> " + __dic.RUNNING[__lang] + "</span>\
                    </div>\
                </div>\
                ";

            if (!isMember) {
                if(leagueData.status == 2 || leagueData.status == 5) {
                    subscribeVtnView = subscribeVtnViewTmp;
                } else if(leagueData.status == 3) {
                    subscribeVtnView = subscribeDisableBtnViewTmp;
                }

            } else {

                if(leagueData.status == 3 || leagueData.status == 5 ||  leagueData.status == 2) {
                    subscribeVtnView = matchRequestUIBtnTmp;
                }
            }


            var btnView = subscribeVtnView;

            if (leagueData.price > 0) {
                priceIconContent = "\
                    <div style='font-size: medium;background-color: #ea4218;text-align: center;height: 30px;border-radius: 5px;display: inline;float: left;padding: 0 20px'>\
                        <span style='color: white'>" + '<span style="font-family: sans-serif">'+TIS.Util.tokenizeCurrency(TIS.Util.toFaDigit(leagueData.price))+'</span>' + __parent.getConfig().creditUnit + "</span>\
                    </div>\
                ";
            }

            var rate = leagueData.rate.rate;
            var rateContent = "";
            for (var i = 0; i < 5; i++) {
                var start;

                if (i < rate) {
                    start = "<i class='tis   tis-star-1 TIS-league-rate' style='color: #eea32c;'></i>";
                } else {
                    start = "<i class='tis  tis-star-empty TIS-league-rate' ></i>";
                }

                rateContent += start;
            }

            var imageUrl = null;
            if(typeof leagueData.imageUrl === "string") {
                imageUrl = leagueData.imageUrl
            } else if(typeof leagueData.image === "object" && leagueData.image!== null) {
                imageUrl = __parent.getService().generateImageSrc(leagueData.image)
            }

            var content = "\
                <div \
                    class='TIS-shadow TIS-league-leagueContainer'>\
                    <div>\
                        <i TIS-DATA ='SHARE' class='tis tis-share TIS-orangeColor' style='position: absolute;left: 5px;top: 5px;cursor: pointer;font-size: 1.5em;font-weight: bold;z-index: 1'></i>\
                        <div style='padding-top: 10px'>\
                            <div class='row'>\
                                <div class='col-xs-3 col-sm-2 col-md-2 col-lg-2' style='text-align: center;padding-left: 0'>\
                                    <img class='TIS-league-image' src='" + imageUrl + "'>\
                                    <div style='font-weight: bold'>"+accessTypeText+"</div>\
                                </div>\
                                <div class='col-xs-5 col-sm-8 col-md-8 col-lg-8' style='padding-right: 10px'>\
                                    <h5 style='padding-top: 5px;font-weight: bold;white-space: nowrap'> " + leagueData.name + "</h5>\
                                    <h5 >\
                                        <i class='tis tis-user' style='margin-left: 10px'></i>    " + maxMemberCount + " /  " + TIS.Util.toFaDigit(leagueData.memberCount + "") + " \
                                    </h5>\
                                    "+timeTextContent+"\
                                </div>\
                                <div class='col-xs-4 col-sm-2 col-md-2 col-lg-2' style='padding-right: 0;'>\
                                    " + btnView + "\
                                </div>\
                            </div>\
                            <div class='row'>\
                                <div class='col-xs-12 col-sm-12 col-md-12 col-lg-12' style='padding-left: 12px;'>\
                                     <div class='col-xs-3 col-sm-2 col-md-2 col-lg-2' style='text-align: center'>\
                                       <div style='padding-top: 5px;white-space: nowrap;'>" + rateContent + "</div>\
                                     </div>\
                                     <div class='col-xs-5 col-sm-8 col-md-8 col-lg-8'></div>\
                                     <div class='col-xs-4 col-sm-2 col-md-2 col-lg-2' style='padding: 0'>\
                                           " + priceIconContent + "\
                                     </div>\
                                </div>\
                            </div>\
                            <div class='row' >\
                                <div class='col-lg-12'>\
                                    <div class='col-xs-3 col-sm-2 col-md-2 col-lg-2' style='padding-left: 0;text-align: center'></div>\
                                    <div class='col-xs-9 col-sm-10 col-md-10 col-lg-10 TIS-league-awardsContainer' style='margin-top: 5px;' ></div>\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
            ";
            
            var contElm = $(content).appendTo(container);
            
            if (leagueData.hasPrize) {
                var $content = $("\
                    <div style='margin: 10px 0;white-space: nowrap;overflow-x: auto;overflow-y:hidden' class='TIS_scroll'> \
                        <div style='display: inline-block'><i class='tis  tis-badge-ribbons' style='margin-left: 10px'></i></div>\
                        <div style='display: inline-block' class='TIS-prize'></div>\
                    </div>\
                ");

                __parent.getLeagueAwards({
                    leagueId: leagueId
                }, function (result) {
                    if (!result.hasError && result.result != undefined) {

                        var text = "";
                        leagueData.prizeData = result.result;
                        for (var i = 0; i < result.result.length; i++) {

                            text += '<span style="font-family: sans-serif">'+(TIS.Util.tokenizeCurrency(TIS.Util.toFaDigit(result.result[i].value))+'</span>' +
                                "<i>&nbsp&nbsp</i>" +
                                result.result[i].unitText);

                            if (i + 1 != result.result.length) {
                                text += "<i>&nbsp&nbsp|&nbsp&nbsp</i>";
                            }
                        }
                        var $parent = contElm.find(".TIS-league-awardsContainer");
                        $parent.css({
                            "border-top": "1px solid gray"
                        });

                        $content
                            .appendTo($parent)
                            .find(".TIS-prize")
                            .append(text);
                    }
                });
            }

            contElm.find("i[TIS-DATA='SHARE']").on("click", function (e) {
                __self.hide();
                __parent.shareUI({
                    leagueId: leagueId,
                    leagueName: leagueData.name,
                    onHide: function () {
                        __self.show();
                    }
                });
                e.preventDefault();
                return false;
            });

            /*------------------ subscribe selected league ---------------------*/
            var subScribeBtn = contElm.find(".TIS_league_subscribe");
            var matchRequestBtn = contElm.find(".TIS_league_matchRequest");
            var $voucherElm = __subscribeConfirmDialogElm.find("input[TIS-DATA=VOUCHER]");

            function showMatchRequest(e) {
                __self.hide();
                __parent.showMatchRequestUI({
                    gameSelected: true,
                    leagueSelected: true,
                    gameId: gameId,
                    leagueId: leagueId,
                    onHide: function () {
                        __self.show();
                    }
                });

                e.preventDefault();
                return false;
            }

            subScribeBtn.click(function (e) {
                if (subScribeBtn.attr("isSubscribe") == "true") {
                    return;
                }

                function subscribedResponseAction(result) {
                    subScribeBtn
                        .removeClass("tis-spin TIS_disable")
                        .find("span")
                        .removeClass("tis-spin")
                        .css("animation-direction", "");
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
                                    fromAmount: leagueData.price,
                                    leagueId:leagueId
                                });
                            });
                            __parent.alert($elm);
                        } else {
                            __parent.alert(result.errorMessage);
                        }
                    } else {
                        leagueData.isMember = true;
                        var $matchRequestBTNView = $(matchRequestUIBtnTmp).click(showMatchRequest);
                        subScribeBtn.parent().append($matchRequestBTNView);
                        __parent.info(__dic.SUCCESS_SUBSCRIBE_LEAGUE[__lang]);
                        subScribeBtn.remove();
                    }

                    $voucherElm.val("");
                }

                function subscribeAction() {
                    subScribeBtn
                        .addClass("tis-spin TIS_disable")
                        .find("span")
                        .addClass("tis-spin")
                        .css("animation-direction", "reverse");

                    var enrollUrl = $(this).attr("enrollUrl");


                    var voucher = $voucherElm.val();
                    var requestData = {leagueId: leagueId};
                    var isVoucherChecked = __subscribeConfirmDialogElm.find("#TIS_league_voucherINP").is(":checked");

                    if (voucher && voucher.length > 0 && isVoucherChecked) {
                        requestData.voucherHash = voucher;
                    }
                    __parent.subscribeLeagueRequest(requestData,subscribedResponseAction);
                }

                function requestRout() {

                    if(__parent.getService().getUserData().ssoLogin) {
                        __subscribeWithWebView({
                            leagueId : leagueId,
                        },function (res) {
                            subscribedResponseAction(res);
                        });

                    } else {
                        if (leagueData.financialType == 2 &&
                            leagueData.price > 0) {
                            __parent.getCredit(function (res) {
                                if(res.hasError) {
                                    __parent.alert(res.errorMessage);
                                } else {
                                    if(res.result.credit>= leagueData.price) {
                                        __confirm('<span style="font-family: sans-serif;padding: 0">'+TIS.Util.tokenizeCurrency(TIS.Util.toFaDigit(leagueData.price))+'</span>' + __parent.getConfig().creditUnit + "&nbsp", function () {
                                            subscribeAction();
                                        });
                                    } else {
                                        __parent.credit({
                                            fromAmount: leagueData.price,
                                            leagueId:leagueId
                                        });
                                    }
                                }
                            });
                        } else {
                            subscribeAction();
                        }
                    }
                }

                requestRout();
                // __parent.getEnrollAccess({leagueId:leagueId}, function (res) {
                //     if(res.hasError ) {
                //         __parent.alert(res.errorMessage);
                //     } else {
                //         requestRout();
                //     }
                // });


                e.preventDefault();
                return false;
            });
            matchRequestBtn.click(showMatchRequest);

            contElm.on("click", function () {
                __initLeaguePage(gameId, leagueData,function () {
                    var $matchRequestBTNView = $(matchRequestUIBtnTmp).click(showMatchRequest);
                    subScribeBtn.parent().append($matchRequestBTNView);
                    subScribeBtn.remove();
                });
            });
            return content;
        },

        __initLeaguePage = function (gameId, leagueData, subscribeCallback) {
            __showPage("league");

            var leagueId = leagueData.id,
                isMember = leagueData.isMember,
                BtnName = isMember ? __dic.UNSUBSCRIBE[__lang] : __dic.SUBSCRIBE[__lang],
                maxMemberCount,
                subscribeVtnView = "",
                timeText = "",
                startTime = leagueData.startTime && new Date(leagueData.startTime),
                endTime = leagueData.endTime && new Date(leagueData.endTime),
                currentPageLeagueId = __$leaguePage.attr("leagueId"),
                imageUrl = null;


            if(typeof leagueData.imageUrl === "string") {
                imageUrl = leagueData.imageUrl
            } else if(typeof leagueData.image === "object" && leagueData.image!== null) {
                imageUrl = __parent.getService().generateImageSrc(leagueData.image)
            }

            if (leagueData.maxPlayers > 0) {
                maxMemberCount = leagueData.maxPlayers;
            } else {
                maxMemberCount = __dic.UNLIMIT[__lang];
            }
            maxMemberCount = TIS.Util.toFaDigit(maxMemberCount + "");

            if (startTime) {
                var shamsiStartTime = TIS.Util.miladiToShamsi(startTime.getUTCFullYear(), startTime.getUTCMonth() + 1, startTime.getUTCDate());

                timeText += __dic.FROM[__lang] + " " + TIS.Util.toFaDigit(shamsiStartTime.d + "") + " " + moment.monthsShort()[shamsiStartTime.m - 1];
            }

            if (endTime) {
                var shamsiEndTime = TIS.Util.miladiToShamsi(endTime.getUTCFullYear(), endTime.getUTCMonth() + 1, endTime.getUTCDate());
                timeText += " " +__dic.UNTIL[__lang] + " " + TIS.Util.toFaDigit(shamsiEndTime.d + "") + " " + moment.monthsShort()[shamsiEndTime.m - 1] + " " + TIS.Util.toFaDigit(shamsiEndTime.y + "");
            }

            if (currentPageLeagueId == leagueId) {
                return;
            } else {
                __$leaguePage.attr("leagueId", leagueId);
            }

            var rate = leagueData.rate.rate;
            var rateContent = "";
            for (var i = 0; i < 5; i++) {
                var start;

                if (i < rate) {
                    start = "<i class='tis tis-star-1' style='color: #eea32c;font-size: 1.5em'></i>";
                } else {
                    start = "<i class='tis tis-star-empty' style='font-size: 1.2em'></i>";
                }

                rateContent += start;
            }

            var prize = "",
                prizeContent = "";

            if (leagueData.prizeData) {
                for (var i = 0; i < leagueData.prizeData.length; i++) {
                    prize +=
                        '<span style="font-family: sans-serif">'+(TIS.Util.tokenizeCurrency(TIS.Util.toFaDigit(leagueData.prizeData[i].value))+'</span>'+
                        "<i>&nbsp&nbsp</i>" +
                        leagueData.prizeData[i].unitText);
                    if (i + 1 != leagueData.prizeData.length) {
                        prize += "<i>&nbsp&nbsp|&nbsp&nbsp</i>";
                    }
                }

                // prizeContent = "\
                //     <div style='box-shadow: 0px 3px 16px 4px rgba(14, 14, 31, 0.45);margin-top: 20px;background: url("+TIS.Images.leagueUIPrize+");height: 70px;display: table;width: 100%;color: white;white-space: nowrap;font-size: large'>\
                //         <div style='padding-right: 30px;padding-left: 30px;display: table-cell;vertical-align: middle'>\
                //             " + prize + "\
                //         </div>\
                //     </div>\
                // ";
                prizeContent = "\
                    <div class='TIS-leagueUI-prize' style=''>\
                        <div style='display: table-cell;vertical-align: middle;position: relative'>\
                            <div style='overflow-x: auto;    overflow-y: hidden;width:100%;position: absolute;padding: 0px 15px' class='TIS_scroll'>\
                                " + prize + "\
                            </div>\
                        </div>\
                    </div>\
                ";
            }


            var matchRequestUIBtnTmp = "\
                    <div leagueId='" + leagueData.id + "'\
                        class='TIS-pointer TIS_league_matchRequest TIS-BTN' \
                        style='background-color: "+__playMatchBtnColor+";float: left'>\
                        <span style='display: table-cell;vertical-align: middle;font-size: large'> " + __dic.PLAYGAME[__lang] + "</span>\
                    </div>\
                ";

            var priceContent = "",
                subscribeBtnContent = "<span> " + __dic.SUBSCRIBE[__lang] + "</span>";

            if (leagueData.price > 0) {
                priceContent = '<span style="font-family: sans-serif;padding: 0">'+TIS.Util.tokenizeCurrency(TIS.Util.toFaDigit(leagueData.price))+'</span>' + __parent.getConfig().creditUnit;
                subscribeBtnContent += "\
                    <i style='color: #1ca51c;height: 40px'>&nbsp;|&nbsp;</i>\
                    <span style='padding-left: 20px;padding-right: 20px;'> " + priceContent + "</span>\
                ";
            }
            var subscribeVtnViewTmp = "\
                    <div leagueId='" + leagueData.id + "'\
                        class='TIS-pointer TIS-league-subscribe-btn' \
                        style='min-width: 150px;background-color: "+__BtnColor+"' \
                        isSubscribe='" + isMember + "\
                        enrollUrl='" + leagueData.enrollUrl + ">\
                            <div style='display: table-cell;vertical-align: middle;font-size: large'>\
                                "+subscribeBtnContent+"\
                            </div>\
                    </div>\
                ";

            var subscribeDisableBtnViewTmp = "\
                    <div leagueId='" + leagueData.id + "'\
                        class='TIS-pointer TIS-league-subscribe-btn TIS_disable' \
                        style='min-width: 150px;box-shadow: inset 0px -7px 0px -2px rgba(103, 103, 103, 0.4);background: grey;background-color: "+__BtnColor+"' \
                        isSubscribe='" + isMember + "\
                        enrollUrl='" + leagueData.enrollUrl + ">\
                            <div style='display: table-cell;vertical-align: middle;font-size: large'>\
                                <span>" + __dic.RUNNING[__lang] + "</span>\
                            </div>\
                    </div>\
                ";

            if (!isMember) {
                if(leagueData.status == 2 || leagueData.status == 5) {
                    subscribeVtnView = subscribeVtnViewTmp;
                }  else if(leagueData.status == 3) {
                    subscribeVtnView = subscribeDisableBtnViewTmp;
                }
            } else {
                subscribeVtnView = matchRequestUIBtnTmp;
            }

            var background = "#1cb7d4";

            if(__ownConfig && __ownConfig.backgroundUrl ) {
                background = "url(" + __ownConfig.backgroundUrl + ")";
            }

            var description = leagueData.description;

            if(typeof description === "string") {
                description = description.replace(/\\n|\\r\\n|\\r/g, "<br />");

                description = TIS.Util.urlify(description);
            } else {
                description = "";
            }

            var headerContent;

            if(isMember || true) {
                headerContent = "\
                <div class='col-lg-6 col-md-6 col-sm-6 col-xs-6'>" + leagueData.name + "</div>\
                <div class='col-lg-6 col-md-6 col-sm-6 col-xs-6' style='padding-left:0'>\
                    <div leagueId='" + leagueData.id + "' class='TIS-pointer TIS_league_results TIS-BTN' \
                        style='background-color: "+__playMatchBtnColor+";float: left;width:55px'>\
                        <span style='display: table-cell;vertical-align: middle;font-size: large'> " + __dic.RESULTS[__lang] + "</span>\
                    </div>\
                </div>\
            ";
            } else {
                headerContent = "<div>" + leagueData.name + "</div>";
            }

            var content = "\
            <div>\
                <div  style='height: 180px;background: "+background+";background-size: cover;' ></div>\
                <div  \
                leagueId='" + leagueData.id + "' \
                class='TIS-pointer TIS-league-showTable' \
                style='position:fixed;bottom:0;background:"+__rankingBtnColor+";width: 100%;height: 70px;text-align: center;color:white;display: table;z-index: 1;'>\
                        <span style='display: table-cell;vertical-align: middle;font-size:large'> " + __dic.TABLE[__lang] + "</span>\
                </div>\
                <div style='background-color: white;margin-bottom: 70px;'>\
                    <div style='display: inline-block;width:100%;max-height:100px'>\
                        <div class='col-lg-2 col-md-2 col-sm-4 col-xs-4' >\
                            <img style='border-radius: 10px;border: 4px solid white;width: 100%;margin-top: -40px;max-height:120px;max-width:120px;min-width:85px;min-height:85px' src='" + imageUrl + "'>\
                        </div>\
                        <div class='col-lg-10 col-md-10 col-sm-8 col-xs-8' style='font-size:large;padding-top: 20px;white-space: nowrap;padding-right:0'>\
                            "+headerContent+"\
                        </div>\
                    </div>\
                    <div  style='text-align: center;white-space: nowrap;padding-top:5px;display: inline-block;width:100%'>\
                         <div class='col-lg-4 col-md-4 col-sm-4 col-xs-4 ' style='padding-left: 0;padding-right:25px;text-align:right'>\
                            " + rateContent + "\
                         </div>\
                         <div class='col-lg-4 col-md-4 col-sm-4 col-xs-2' style='padding-left: 0;padding-right: 0'>\
                             <i class='tis tis-user' style='margin-left: 10px'></i>    " + maxMemberCount + " /  " + TIS.Util.toFaDigit(leagueData.memberCount + "") + " \
                         </div>\
                         <div class='col-lg-4 col-md-4 col-sm-4 col-xs-6' style='text-align: center;padding-right:0;padding-left:0'>\
                             <i class='tis tis-calendar' style='margin-left: 10px;padding-right: 10px;'></i>" + timeText + "\
                         </div>\
                    </div>\
                    <div style='width:100%;padding-top: 25px;display: inline-block'>\
                        <div class='col-lg-6 col-md-6 col-sm-6 col-xs-4 TIS-rate-btn TIS-pointer'>\
                            <div style='width:100px;height:40px;border:1px solid #ffc600;text-align:center;margin-top: 5px'>\
                                <div style='width:50px;height:100%;background-color:#ffc600;float:left;display:table'>\
                                    <i class='tis tis-2x  tis-star-empty' style='color:white;display:table-cell;vertical-align: middle;'></i>\
                                </div>\
                                <div  class='TIS-user-rate' style='width:50px;height:100%;font-size:2em'>۱</div>\
                            </div>\
                        </div>\
                        <div class='col-lg-6 col-md-6 col-sm-6 col-xs-8'>\
                            " + subscribeVtnView + "\
                        </div>\
                    </div>\
                    " + prizeContent + "\
                    <div style='width:100%;padding-top: 25px;display: inline-block'>\
                        <div class='col-lg-2 col-md-2 col-sm-2 col-xs-2' style='margin-right: -30px;'>\
                            <i class='tis tis-4x tis-info-circle TIS-rotate--30' style='color: rgba(128, 128, 128, 0.57)'></i>\
                        </div>\
                        <div class='col-lg-10 col-md-10 col-sm-10 col-xs-10' style='margin-top: 10px;padding-left: 0;'>\
                            <div class='TIS-maxRuleDescriptionHeight' id='TIS_league_info_description'  style='padding-top: 10px;min-height: 20px;overflow:hidden'>\
                                <p style='display: inline;white-space: pre-line;margin-right:5px'>" + description + "</p>\
                            </div>\
                            <i class='tis tis-down-dir' style='position:absolute;left:-5px;bottom : -5px;font-size:1.5em;color:"+__moreDescriptionBtnColor+"'></i>\
                        </div>\
                    </div>\
                </div>\
            </div>\
            ";

            var $content = $(content);

            $content.find("a.TIS-url").on("click", function (e) {
                TIS.Util.openUrl($(this).attr("value"));
                e.preventDefault();
                e.stopPropagation();
            });

            __$leaguePageBody
                .empty()
                .append($content);

            $content
                .find(".TIS-league-showTable")
                .on("click", function () {
                    __self.hide();
                    __parent.showTable({
                        gameId: gameId,
                        leagueId: leagueId,
                        gameSelected: true,
                        leagueSelected: true,
                        onHide: function () {
                            __self.show();
                        }
                    });
                });

            var $description = $("#TIS_league_info_description"),
                $matchRequest = $content.find(".TIS_league_matchRequest"),
                $subScribeBtn = $content.find(".TIS-league-subscribe-btn");


            function toggle() {
                if($description.hasClass("TIS-maxRuleDescriptionHeight")) {
                    $description.removeClass("TIS-maxRuleDescriptionHeight");
                    $description.next("i").removeClass("tis-down-dir").addClass("tis-left-dir");

                    __$leaguePage.scrollTop(function () {
                        return this.scrollHeight - $description.height();
                    });

                } else {
                    $description.addClass("TIS-maxRuleDescriptionHeight");
                    $description.next("i").removeClass("tis-left-dir").addClass("tis-down-dir");
                }
            }

            $description.next(".tis-down-dir").on("click", toggle);

            $description.on("click",toggle);

            if ($description.find("p").height() < $description[0].offsetHeight) {
                $description.next(".tis-down-dir").hide();
            } else {
                $description.next(".tis-down-dir").show();
            }


            if (!isMember) {
                $matchRequest.hide();
            }

            function showMatchRequest(e) {
                __self.hide();
                __parent.showMatchRequestUI({
                    gameSelected: true,
                    leagueSelected: true,
                    gameId: gameId,
                    leagueId: leagueId,
                    onHide: function () {
                        __self.show();
                    }
                });

                e.preventDefault();
                return false;
            }

            $matchRequest.on("click", function (e) {
                __self.hide();
                __parent.showMatchRequestUI({
                    gameSelected: true,
                    leagueSelected: true,
                    gameId: gameId,
                    leagueId: leagueId,
                    onHide: function () {
                        __self.show();
                    }
                });
            });

            $content.find(".TIS-rate-btn").on("click", function () {
                __reInitRateDialog(leagueId);
                __$rateModalDialog.modal("show");
            });


            $content.find(".TIS_league_results").on("click", function () {
                __parent.showResultUI({
                    leagueId : leagueId
                });
            });

            $subScribeBtn.click(function (e) {

                if ($subScribeBtn.attr("isSubscribe") == "true") {
                    return;
                }

                var $voucherElm = __subscribeConfirmDialogElm.find("input[TIS-DATA=VOUCHER]");

                function subscribedResponseAction(result) {
                    $subScribeBtn.removeClass("TIS_disable");
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
                                    fromAmount : leagueData.price,
                                    leagueId:leagueId
                                });
                            });

                            __parent.alert($elm);

                        } else {
                            __parent.alert(result.errorMessage);
                        }
                    } else {
                        var $matchRequestBTNView = $(matchRequestUIBtnTmp).click(showMatchRequest);

                        $subScribeBtn.parent().append($matchRequestBTNView);

                        __parent.info(__dic.SUCCESS_SUBSCRIBE_LEAGUE[__lang]);

                        $subScribeBtn.remove();

                        subscribeCallback && subscribeCallback();
                    }

                    $voucherElm.val("");
                }
                function subscribe() {
                    $subScribeBtn.addClass("TIS_disable");
                    var enrollUrl = $(this).attr("enrollUrl");


                    var voucher = $voucherElm.val();
                    var requestData = {leagueId: leagueId};
                    var isVoucherChecked = __subscribeConfirmDialogElm.find("#TIS_league_voucherINP").is(":checked");

                    if (voucher && voucher.length > 0 && isVoucherChecked) {
                        requestData.voucherHash = voucher;
                    }
                    __parent.subscribeLeagueRequest(requestData, subscribedResponseAction);
                }

                function requestRout() {
                    if(__parent.getService().getUserData().ssoLogin) {

                        __subscribeWithWebView({
                            leagueId : leagueId,
                        },function (res) {
                            subscribedResponseAction(res);
                        });
                    } else {
                        if (leagueData.financialType == 2 &&
                            leagueData.price > 0) {

                            __parent.getCredit(function (res) {
                                if(res.hasError) {
                                    __parent.alert(res.errorMessage);
                                } else {
                                    if(res.result.credit>= leagueData.price) {
                                        __confirm(TIS.Util.tokenizeCurrency(leagueData.price) + "&nbsp" + __parent.getConfig().creditUnit + "&nbsp", function () {
                                            subscribe();
                                        });
                                    } else {
                                        __parent.credit({
                                            fromAmount : leagueData.price,
                                            leagueId:leagueId
                                        });
                                    }
                                }
                            });

                        } else {
                            subscribe();
                        }
                    }
                }

                requestRout();
                // __parent.getEnrollAccess({leagueId:leagueId}, function (res) {
                //     if(res.hasError ) {
                //         __parent.alert(res.errorMessage);
                //     } else {
                //         requestRout();
                //     }
                // });

                e.preventDefault();
                return false;
            });

        },

        __showPage = function (pageName) {

            switch (pageName) {
                case "main" :
                    __$leaguePage.hide();
                    __$mainPage.show();
                    __$headerContainerElm.show();
                    __$filterPage.hide();
                    if(__activeTabId === "#TIS_league_mainPage_firstTab") {
                        __$footerContainerElm.show();
                    }

                    break;

                case "league" :
                    __$leaguePage.show();
                    __$mainPage.hide();
                    __$headerContainerElm.hide();
                    __$footerContainerElm.hide();
                    __$filterPage.hide();
                    break;

                case  "filter" :
                    __$leaguePage.hide();
                    __$mainPage.hide();
                    __$headerContainerElm.hide();
                    __$footerContainerElm.hide();
                    __$filterPage.show();
                    break;
            }
        },

        __initEvent = function () {

            $("#TIS_league_mainPage_header_mainframe_close").on("click", function () {
                __self.hide();
            });

            var lastText;

            function update(text,$container) {
                __updateGameLeagues({
                    filter: text
                },function (res) {
                    if(!res.hasError) {
                        $container.attr("TIS-Data", "CHANGE");
                    }
                    if (lastText && text != lastText) {
                        update(lastText,$container);
                    }
                });
            }

            __$searchInp.on("keyup", function () {
                var $this = $(this);
                var text = $this.val();
                if (text.length > 1) {
                    if (!__isGettingData) {
                        update(text,$this);
                    } else {
                        lastText = text;
                    }
                }

            });

            $(".TIS_league_filterContainerClass").find("a").on("click", function () {
                var concept = $(this).text().trim();
                var span = $(this)
                    .closest('div')
                    .attr("value", $(this).attr("value"))
                    .find('span[TisDropText]');

                //var preText = span.attr("value") + " : ";

                span.text(concept);
                __initScrollEvent();
                __updateGameLeagues();
            });

            $("#TIS_league_mainPage_header_mainframe_update").on("click", function () {
                if (__currentSelectedGameId) {
                    __initScrollEvent();
                    __updateGameLeagues({
                        gameId: __currentSelectedGameId
                    });
                }
            });

            $("#TIS_league_mainPage_header_searchBtn").on("click", function () {
                __$headerMainFrame.hide();
                __$headerSearchFrame.show();
            });

            $("#TIS_league_mainPage_header_searchFrame_close").on("click", function () {
                __$searchInp.val("");
                __$headerMainFrame.show();
                __$headerSearchFrame.hide();

                if(__$searchInp.attr("TIS-DATA") == "CHANGE") {
                    __$searchInp.removeAttr("TIS-DATA");
                    __updateGameLeagues({},function () {

                    });
                }

            });

            __filterContainerElm.on("click", function (e) {
                __showPage("filter");

                e.preventDefault();
                return false;
            });

            var $allAList = $("#TIS_league_orderBy_listContainer").find("a");
            $allAList.on("click", function () {
                $allAList
                    .removeClass("TIS-selected")
                    .find("i")
                    .css("visibility", "hidden");

                var $a = $(this);
                $a
                    .addClass("TIS-selected")
                    .find("i").css("visibility", "visible");
                // __useGetLeagueRequest = false;
                __updateGameLeagues({
                    requestType: $a.attr("value"),
                    offset: 0
                });
            });

            // event for league page
            $("#TIS_league_leaguePage_header_back").on("click", function () {
                __showPage("main");
            });

            __initScrollEvent();


            // event for filter page
            $("#TIS_league_filterPage_header_close").on("click", function () {
                __showPage("main");
            });
            $("#TIS_league_filterPage_accept").on("click", function () {
                __showPage("main");
                __updateGameLeagues({
                    offset: 0
                });
            });

            __parentContainer.find(".TIS-league-selection").on("click", function () {
                var $this = $(this);

                if($this.hasClass("TIS-league-notSelected")) {
                    $this
                        .removeClass("TIS-league-notSelected")
                        .addClass("TIS-league-selected");
                } else {
                    $this
                        .removeClass("TIS-league-selected")
                        .addClass("TIS-league-notSelected");
                }
            });

            // __parentContainer.

            __parentContainer.on('shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
                __activeTabId = $(this).attr("href");
                if (__currentSelectedGameId) {

                    if(__activeTabId === "#TIS_league_mainPage_firstTab") {
                        __$footerContainerElm.show();
                    } else {
                        __$footerContainerElm.hide();
                    }
                    __isScrollInit = false;
                    __initScrollEvent();
                    __updateGameLeagues({
                        gameId: __currentSelectedGameId
                    });
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
            var height = __parentContainer.height(),
                headerHeight = __$headerContainerElm.height() + __$tabContainerElm.height() + 50;


            var maxHeight = height - headerHeight;

            __$mainPageNewLeaguesBody.css("max-height", maxHeight+ "px");
            __$mainPageMyLeaguesBody.css("max-height", (maxHeight +  45) + "px");
            __hasResize = false;
        },

        __initScrollEvent = function () {
            if (!__isScrollInit) {
                __isScrollInit = true;
                // __leagueContainerElm.on('scroll', function () {

                var elem;

                if(__activeTabId === "#TIS_league_mainPage_firstTab") {
                    elem = __$mainPageNewLeaguesBody;
                } else {
                    elem = __$mainPageMyLeaguesBody;
                }

                elem
                    .off("scroll")
                    .on('scroll', function () {
                    if (this.scrollHeight - 20 <= $(this).scrollTop() + this.clientHeight) {
                        $(this).off('scroll');
                        __isScrollInit = false;
                        if (__hasNextPage && !__isLoading) {
                            __updateGameLeagues({
                                gameId: __currentSelectedGameId,
                                isFromScroll: true,
                                offset: __currentOffset
                            });
                        }
                    }
                });
            }
        },

        __initSubscribeConfirmDialog = function () {

            var question = __dic.SUBSCRIBECONFIRMMESSAGE[__lang].replace("$VAR", "<i TIS-DATA='PRICE'></i>");

            var content = "\
                <div class='modal fade TIS-black-back' style='z-index: 2001'>\
                    <div class='modal-dialog' >\
                        <div class='modal-content' style='background-color: #faf4e3'>\
                            <div class='modal-header' style='display: table;width: 100%;border: 0;'>\
                                <i class='tis tis-2x tis-close-circle TIS-pointer' data-dismiss='modal' style='display: table-cell;vertical-align: middle;    width: 20px;color:#1cb7d4;font-weight: bold'></i>\
                                <h3 style='text-align: center'>" + __dic.SUBSCRIBE[__lang] + "</h3>\
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
                                    <div class='col-lg-6 col-md-6 col-sm-6 col-xs-8' style='text-align: center'>\
                                        <div style='display: inline-block'>\
                                            <div \
                                                id='okButton'\
                                                class='TIS-pointer TIS-league-sendRate TIS-BTN' \
                                                style='margin-top: 20px;margin-bottom: 20px'>\
                                                <span style='display: table-cell;vertical-align: middle;font-size: 25px;'> " + __dic.ACCEPT[__lang] + "</span>\
                                            </div>\
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


            var $checkbox = __subscribeConfirmDialogElm.find("#TIS_league_voucherINP");
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
        },

        __initRateDialog = function () {
            var content = "\
            <div class='modal fade TIS-black-back' style='z-index: 2001'>\
                <div class='modal-dialog' >\
                    <div class='modal-content' style='background-color: #faf4e3'>\
                        <div class='modal-header' style='display: table;width: 100%;border: 0;'>\
                            <i class='tis tis-2x tis-close-circle TIS-pointer' data-dismiss='modal' style='display: table-cell;vertical-align: middle;    width: 20px;color:"+__rateButtonColor+";font-weight: bold'></i>\
                            <h3 style='text-align: center;color:grey'>" + __dic.YOUR_RATE[__lang] + "</h3>\
                        </div>\
                        <div class='modal-body' style='padding-bottom: 0;text-align: center'>\
                            <div TIS-DATA='RATE'>\
                                <i value = '1'class='tis tis-2x  tis-star-1 TIS-pointer' style='padding: 5px'></i>\
                                <i value = '2'class='tis tis-2x  tis-star-1 TIS-pointer' style='padding: 5px'></i>\
                                <i value = '3'class='tis tis-2x  tis-star-1 TIS-pointer' style='padding: 5px'></i>\
                                <i value = '4'class='tis tis-2x  tis-star-1 TIS-pointer' style='padding: 5px'></i>\
                                <i value = '5'class='tis tis-2x  tis-star-1 TIS-pointer' style='padding: 5px'></i>\
                            </div>\
                            <div class='row'>\
                                <div class='col-lg-3 col-md-3 col-sm-3 col-xs-2'></div>\
                                <div class='col-lg-6 col-md-6 col-sm-6 col-xs-8' style='text-align: center'>\
                                    <div style='display: inline-block'>\
                                        <div \
                                            class='TIS-pointer TIS-league-sendRate TIS-BTN' \
                                            style='background-color: "+__rateButtonColor+";height: 50px;width:200px;margin:20px'>\
                                            <span style='display: table-cell;vertical-align: middle;font-size: 25px;'> " + __dic.ACCEPT[__lang] + "</span>\
                                        </div>\
                                    </div>\
                                </div>\
                                <div class='col-lg-3 col-md-3 col-sm-3 col-xs-2'></div>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
            </div>\
            ";
            __$rateModalDialog = $(content);

            var $i = __$rateModalDialog.find("div[TIS-DATA='RATE'] i");
            $i.on("click", function () {
                var selectedId = parseInt($(this).attr("value"));
                $i.each(function (index,elem) {
                    var $this = $(this);
                    if(index<selectedId) {
                        $this
                            .attr("TIS-DATA","SELECTED")
                            .css({
                                color: "#eea32c"
                            });
                    } else {
                        $this
                            .attr("TIS-DATA","NOT-SELECTED")
                            .css({
                                color : "gray"
                            });
                    }
                });
            });

            __$rateModalDialog.find(".TIS-league-sendRate").on("click", function () {
                var $this = $(this);
                $this.addClass("TIS_disable");
                var leagueId = __$rateModalDialog.attr("leagueId");
                var rate = __$rateModalDialog.find("div[TIS-DATA='RATE'] i.tis-star-1[TIS-DATA=SELECTED]").length;

                __parent.sendLeagueRateRequest({leagueId:leagueId,rate : rate}, function (result) {
                    $this.removeClass("TIS_disable");
                    if(result.hasError) {
                        __parent.alert(result.errorMessage);
                    } else {
                        __$rateModalDialog.modal("hide");
                        __parent.info(__dic.SUCCESS_RATE[__lang]);
                        __$leaguePageBody.find(".TIS-user-rate").html(TIS.Util.toFaDigit(rate+""));
                    }
                });
            });
        },

        __reInitRateDialog = function (leagueId) {

            __$rateModalDialog.attr("leagueId", leagueId);
            var $i = __$rateModalDialog.find("div[TIS-DATA='RATE'] i");

            var currentRate = parseInt(TIS.Util.toEnDigit(__$leaguePageBody.find(".TIS-user-rate").html()));

            $i.each(function (index,elem) {
                var $this = $(this);
                if(index < currentRate) {
                    $this
                        .css({
                            color: "#eea32c"
                        });
                } else {
                    $this
                        .css({
                            color : "gray"
                        });
                }
            });
        },

        __confirm = function (price, callback) {

            __subscribeConfirmDialogElm.find("i[TIS-DATA='PRICE']").html(price);

            __subscribeConfirmDialogElm
                .find('#okButton')
                .off("click")
                .click(function (event) {
                    callback();
                    __subscribeConfirmDialogElm.modal('hide');
                });

            __subscribeConfirmDialogElm.modal('show');
        },

        __updateGameLeagues = function (params,callback) {
            __isGettingData = true;
            var gameId = params.gameId || __currentSelectedGameId;
            var offset = (params && typeof params.offset == "number") ? params.offset : 0;
            var isFromScroll = (params && typeof params.isFromScroll == "boolean") ? params.isFromScroll : false;
            var isFromAddBtn = (params && typeof params.isFromAddBtn == "boolean") ? params.isFromAddBtn : false;
            var loadingElm = $("#TIS_onlineUser_leagueType_loading");
            loadingElm.show();


            var container;

            if(__activeTabId === "#TIS_league_mainPage_firstTab") {
                container = __$mainPageNewLeaguesBody;
            } else {
                container = __$mainPageMyLeaguesBody;
            }

            if (!isFromScroll && !isFromAddBtn) {
                container.empty();
            }
            container.append(__addMoreDataElm);

            container.scrollTop(function () {
                return this.scrollHeight;
            });

            __changeAddMoreDataState(true);

            var data = {
                gameId: gameId,
                offset: offset
            };

            var requestType = params.requestType;

            var requestFunc;

            if (requestType) {
                if(requestType == "0" || requestType == "1") {

                    data.type = requestType == "0" ? 4 : 1;
                    requestFunc = __parent.getTopLeaguesInfo;
                } else {
                    requestFunc = __parent.getLatestLeaguesInfo;
                }
            } else {

                if(__activeTabId === "#TIS_league_mainPage_firstTab") {
                    data.showDefault = false;
                    var status = parseInt($("#TIS_league_filterPage_leagueState").val());
                    if (status == 0 || status==5) {
                        data.statusList = [2, 3, 5];
                    } else {
                        data.status = status;
                    }

                    var freeSubscribe = $("#TIS_league_filterPage_freeSubscribe").hasClass("TIS-league-selected");
                    var monetarySubscribe = $("#TIS_league_filterPage_monetarySubscribe").hasClass("TIS-league-selected");
                    var financialType;

                    if (freeSubscribe && monetarySubscribe) {
                        financialType = 0;
                    } else if (freeSubscribe) {
                        financialType = 1;
                    } else if (monetarySubscribe) {
                        financialType = 2;
                    }
                    data.financialType = financialType;
                } else {
                    data.userState = 1;
                }




                var hasPrize = $("#TIS_league_filterPage_hasPrize").hasClass("TIS-league-selected"),
                    notPrize = $("#TIS_league_filterPage_notPrize").hasClass("TIS-league-selected"),
                    prize;
                if (hasPrize && notPrize) {
                    prize = 0;
                } else if (hasPrize) {
                    prize = 1;
                } else if (notPrize) {
                    prize = 2;
                }
                data.prize = prize;


                var filter = params && params.filter || __$searchInp.val();

                if (filter && filter.length > 1) {
                    data.name = filter;
                }


                requestFunc = __parent.getLeaguesInfo;
            }

            requestFunc(data, function (result) {
                __changeAddMoreDataState(false);
                if(requestType) {
                    __addMoreDataElm.attr("requestType",requestType);
                } else {
                    __addMoreDataElm.removeAttr("requestType");
                }

                if (result.hasError) {
                    __parent.alert(result.errorMessage);
                } else {
                    __addMoreDataElm.remove();
                    var res = result.result;
                    var leaguesData = res.leagues;

                    __parent.getServerTime({}, function (result) {
                        __serverTime = result.result.time;

                        for (var i = 0; i < leaguesData.length; i++) {

                            var leagueInfo = leaguesData[i];

                            __createLeagueView(gameId, leagueInfo,container);
                        }

                        if (!res.hasNext) {
                            var notMoreTxt;
                            if(leaguesData.length == 0) {
                                notMoreTxt = __dic.NOT_FIND[__lang];
                            } else {
                                notMoreTxt = __dic.NOT_FIND_MORE[__lang];
                            }
                            container.append(
                                "<div class='col-lg-12 col-md-12 col-sm-12 col-xs-12' style='text-align: center;color:"+__notMoreTextColor+";padding: 20px;10px'>" + notMoreTxt + "</div>"
                            );
                            __hasNextPage = false;
                            __isScrollInit = false;
                        } else {
                            __hasNextPage = true;
                            container.append(__addMoreDataElm);
                            __currentOffset = res.nextOffset;
                            __initScrollEvent();
                        }

                        if (offset == 0) {
                            // because in some device btn click not work, should move to fire click event
                            __$mainPageNewLeaguesBody.scrollTop(function () {
                                return 1;
                            });
                        }

                    });

                }
                __onWindowResize();

                __isGettingData = false;
                callback && callback(result);
            });
        },

        __initUi = function (callback) {
            if (!__isUiInit) {
                $("#TIS_league_gameName_loading").show();

                __$mainPageNewLeaguesBody.append(__addMoreDataElm);
                __changeAddMoreDataState(true);

                __parent.getGamesInfo({registerGame:true}, function (result) {
                    $("#TIS_league_gameName_loading").hide();
                    if (result.hasError) {
                        __parent.alert(result.errorMessage);
                    } else {
                        __gamesInfo = {};

                        var games = result.result.games;

                        for (var i = 0; i < games.length; i++) {
                            var game = games[i];
                            __gamesInfo[game.id]= game;
                        }

                        __gameNameContainer.empty();
                        // for (var gameId in  __gamesInfo) {
                        //     var info = __gamesInfo[gameId];
                        //
                        //     if (info.name) {
                        //
                        //         var content = "\
                        //                 <li gameId ='" + gameId + "' style='border-radius: 100px'>\
                        //                     <a href='' gameId ='" + gameId + "'>\
                        //                         " + info.name + "\
                        //                     </a>\
                        //                 </li>\
                        //                 ";
                        //
                        //         $(content).appendTo(__gameNameContainer).find("a").click(function (e) {
                        //             e.preventDefault();
                        //             __setCurrentGameShow($(this).attr("gameId"), true);
                        //
                        //         });
                        //
                        //     } else {
                        //         console.error(info.ID + " is not register in game center!");
                        //     }
                        // }

                    }
                    callback(result);
                });
            } else {
                callback({
                    hasError: false
                })
            }
        },

        __setCurrentGameShow = function (gameId, gameSelected) {
            __currentSelectedGameId = gameId;
            var span = __gameNameContainer
                .attr({gameId: gameId})
                .closest('div')
                .find('span[TisDropText]')
                .attr({
                    gameId: gameId
                });

            if (gameSelected) {
                span.text(__gamesInfo[gameId].name);
            } else {
                span.text(__dic.SELECT_GAME[__lang]);
            }

            __gameNameContainer
                .find("li")
                .css({
                    "background-color": "white"
                });
            __gameNameContainer
                .find("li[gameId=" + gameId + "]")
                .css({
                    "background-color": "#12F512"
                });


            __$mainPage.find(".panel-title").text(__dic.LEAGUE[__lang] + "   " +  __parent.getService().getGameName({gameId:gameId}));
            
            __updateGameLeagues({
                gameId: gameId
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
        __initUi(function (result) {
            if (result.hasError) {
                __isUiInit = false;
            } else {
                if (params && params.gameId) {
                    __setCurrentGameShow(params.gameId, params.gameSelected);
                } else {
                    if (!__isUiInit) {
                        var gameId = Object.keys(__gamesInfo)[0];
                        __setCurrentGameShow(gameId, false);
                    }
                }
                __isUiInit = true;
            }

        });


        if(__animate) {
            setTimeout(function () {
                $("#TIS_league_container")
                    .css({
                        "transform": "translateX(0)",
                        "-webkit-transform": "translateX(0)"
                    });
            },1);
        } else {
            $("#TIS_league_container").show();
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
            $("#TIS_league_container")
                .css({
                    "transform": "translateX(calc(100%))",
                    "-webkit-transform": "translateX(calc(100%))"
                });
        } else {
            $("#TIS_league_container").hide();
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

    __self.backButton = function () {
        if (__subscribeConfirmDialogElm && __subscribeConfirmDialogElm.hasClass("in")) {
            __subscribeConfirmDialogElm.modal("hide");
            return true;
        } else if(__$rateModalDialog && __$rateModalDialog.hasClass("in")){
            __$rateModalDialog.modal("hide");
            return true;
        } else if(__$leaguePage.css("display") != "none"){
            __showPage("main");
            return true;
        } else if(__$filterPage.css("display") != "none"){
            __showPage("main");
            return true;

        }else if(__$headerSearchFrame.css("display") != "none"){
            __$searchInp.val("");
            __$headerMainFrame.show();
            __$headerSearchFrame.hide();
            return true;
        }else {
            if (__visibility) {
                __self.hide();
                return true;
            }
        }

        return false;
    };


    __init();
};