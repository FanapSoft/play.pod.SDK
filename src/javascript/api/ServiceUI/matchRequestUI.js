/**
 * @class MatchRequestUI
 * @module ServiceUI
 * @submodule ServiceUI
 *
 * */
TIS.MatchRequestUI = function (options) {

    /*==================================================================================================================
     *                                      P R I V A T E   V A R I A B L E
     *================================================================================================================*/

    var __self = this,
        __parent = options.parent,
        __dic = options.dictionary,
        __backgroundColors = ["cadetblue", "steelblue", "cornflowerblue", "darkcyan", "slategray", "slateblue", "teal", "#296588", "#de3e0a", "#de8e0b", "#3baa1e"],
        __lang = options.language,
        __isMultiTab = options.isMultiTab,
        __globalConfig = options.config,
        __ownConfig = __globalConfig && __globalConfig.matchRequestUI,
        __animate = false,
        __isUiInit = false,
        __activeMatchRequest = {
            /*
             * leagueId : {
             *   requestId : userId
             * }
             * */
        },
        __leagueNameContainerElm, __leagueMemberContainerElm,
        __onlineRequestTabContentElm, __offlineRequestTabContentElm,
        __offlineRequestTabHeaderElm,__$mainPageHeader,
        __onlineRequestContainerElm,__onlineRequestTabHeaderElm,
        __userSearchInputElm,__$userSearchContainer,__quickMatchBtnElm,
        __navbarContainerElm,__$quickMatchContainer,__tabContainer,
        __dateTimeElm,__timeContainerElm,
        __updateUserBtnElm,
        __gamesInfo,
        __currentGameId,
        __lastSearchTime,
        __currentLeagueId = 0,
        __containerElm,
        __currentLeagueMembers = {},
        __currentLeagueOnlineUser = {},
        __leaguesData = {},
        __isLogin = false,
        __currentView = "onlineRequest",// onlineRequest offlineRequest
        __visibility = false,
        __enableCssData = {"pointer-events": "","opacity": ""},
        __disableCssData = {"pointer-events": "none","opacity": "0.5"},
        __onHideCallback,
        __quickMatchVisibility = true,
        __loadingColor = (options.config && options.config.loadingColor) || "#FA8D2E",
        __BtnColor = (options.config && options.config.buttonBackgroundColor) || "#ffb200",

    // online request
        __ONR_isUpdating = false,
        __ONR_AddMoreElm,
        __ONR_isLoading,
        __ONR_CurrentOffset = 0,
        __ONR_isScrollInit = false,
        __ONR_hasNext = false,

    //offline request
        __OFR_AddMoreElm,
        __OFR_isLoading,
        __OFR_CurrentOffset = 0,
        __OFR_isUpdating = false,
        __OFR_isScrollInit = false,
        __OFR_hasNext = false;


    /*==================================================================================================================
     *                                   P U B L I C    V A R I A B L E
     *================================================================================================================*/


    /*==================================================================================================================
     *                                   P R I V A T E     M E T H O D
     *================================================================================================================*/

    var __init = function () {

            if(__ownConfig && __ownConfig.animate) {
                __animate = true;
            } else if(__globalConfig && __globalConfig.animate) {
                __animate = true;
            }

            __initView();
            __initAddMoreDataElm();
            __leagueNameContainerElm = $("#TIS_onlineUser_leagueName_container");
            __leagueMemberContainerElm = $("#TIS_OU_OTC_userContent");
            __onlineRequestTabContentElm = $("#TIS_OU_onlineRequestTabContent");
            __onlineRequestTabHeaderElm = $("#TIS_OU_TC_onlineRequestTab");
            __offlineRequestTabContentElm = $("#TIS_OU_offlineRequestTabContent");
            __offlineRequestTabHeaderElm = $("#TIS_OU_TC_offlineRequestTab");
            __updateUserBtnElm = $("#TIS_onlineUser_mainPage_update");
            __onlineRequestContainerElm = $("#TIS_onlineUser_table_body");
            __dateTimeElm = $("#TIS_OU_OTC_DC_dateTimePicker");
            __timeContainerElm = $("#TIS_OU_OTC_DC_timePicker");
            __userSearchInputElm = $("#TIS_onlineUser_userSearch");
            __$userSearchContainer=  $("#TIS_onlineUser_userSearchContainer");
            __quickMatchBtnElm = $("#TIS_onlineUser_quickMatch");
            __$quickMatchContainer = $("#TIS_onlineUser_mainPage_quickMatchContainer");
            __$mainPageHeader = $("#TIS_onlineUser_mainPage_header");
            __navbarContainerElm = $("#TIS_matchRequest_navbar");
            __tabContainer = $("#TIS_onlineUser_tabContainer");
            __initEvent();
            __onWindowResize();
        },

        __onWindowResize = function() {
            var quickMatchHeight = 0;
            if(__$quickMatchContainer.css("display")!="none") {
                quickMatchHeight = __$quickMatchContainer.height();
            }
            var maxHeight = $(window).height() - __$mainPageHeader.height() - quickMatchHeight;

            __onlineRequestContainerElm.css({
                "max-height": maxHeight
            });

            __leagueMemberContainerElm.css({
                "max-height": maxHeight
            });
        },

        __hideUI = function() {
            $("#TIS_OU_OTC_userContent").show();
            $("#TIS_OU_OTC_dateContent").hide();
        },

        __requestQuickMatch = function(leagueId,gameId) {
            var span = __quickMatchBtnElm.prop("disabled", true).find("span");
            span.addClass("tis-spin4");

            __navbarContainerElm.css(__disableCssData);
            __changeQuickMatchState(true);

            __parent.quickMatchRequest({
                leagueId: leagueId,
                gameId : gameId
            },{
                onResult: function (result) {
                    __quickMatchBtnElm.prop("disabled", false);
                    span.removeClass("tis-spin4");
                    __navbarContainerElm.css(__enableCssData);

                    if(result.hasError) {
                        __parent.alert(result.errorMessage);
                        __changeQuickMatchState(false);
                    } else {
                        span.html(__dic.CANCELQUICKMATCH[__lang]);
                    }
                },
                onAccept : function() {
                    if(__currentLeagueId == leagueId) {
                        __changeQuickMatchState(false);
                    }
                },
                onBeforeCancel : function(params) {

                },
                onCancel : function(params) {
                    if(__currentLeagueId == leagueId && params.state) {
                        if(typeof params.message == "string" && params.message.length > 0) {
                            __parent.alert(params.message);
                        }
                        __changeQuickMatchState(false);
                    }
                }
            });
        },

        __cancelQuickMatch = function(leagueId) {
            if(__currentLeagueId == leagueId) {
                var span = __quickMatchBtnElm.prop("disabled", true).find("span");
                span.addClass("tis-spin4");
                __userSearchInputElm.css(__disableCssData);
                __navbarContainerElm.css(__disableCssData);
                __updateUserBtnElm.css(__disableCssData);
            }
            __parent.cancelQuickMatchRequest({
                leagueId: leagueId
            },function (result) {
                if(__currentLeagueId == leagueId) {
                    __quickMatchBtnElm.prop("disabled", false);
                    span.removeClass("tis-spin4");
                    __navbarContainerElm.css(__enableCssData);
                    __updateUserBtnElm.css(__enableCssData);

                    if(result.hasError) {
                        __parent.alert(result.errorMessage);
                        __quickMatchBtnElm.prop("disabled", false);
                    } else {
                        __changeQuickMatchState(false);
                    }
                }

            });
        },

        __changeQuickMatchState = function(state) {
            __quickMatchBtnElm.prop('checked', state);
            if(state) {
                if(!__isMultiTab) {
                    __updateUserBtnElm.css(__disableCssData);
                    __onlineRequestTabContentElm.css(__disableCssData);
                    __userSearchInputElm.css(__disableCssData);
                }
            } else {
                __updateUserBtnElm.css(__enableCssData);
                __onlineRequestTabContentElm.css(__enableCssData);
                __userSearchInputElm.css(__enableCssData);
            }
        },

        __initialQuickMatchContainer = function(leagueId) {
            if(__leaguesData[leagueId].quickMatch) {
                if(__parent.getQuickMatchState({leagueId : leagueId})) {
                    __changeQuickMatchState(true);
                } else {
                    __changeQuickMatchState(false);
                }
                if(__quickMatchVisibility) {
                    __$quickMatchContainer.show();
                    __onWindowResize();
                }

            } else{
                __$quickMatchContainer.hide();
                __onWindowResize();
            }
        },

        __changeOFRAddMoreDataState = function (isLoading) {
            if (isLoading) {
                __OFR_AddMoreElm
                    .addClass("tis-spin4")
                    .attr("disabled", true)
                    .find("i").hide();
                __OFR_isLoading = true;
            } else {
                __OFR_AddMoreElm
                    .removeClass("tis-spin4")
                    .attr("disabled", false)
                    .find("i").show();

                __OFR_isLoading = false;
            }
        },

        __changeONRAddMoreDataState = function (isLoading) {
            if (isLoading) {
                __ONR_AddMoreElm
                    .attr("disabled", true)
                    .find("i")
                    .removeClass("tis-plus-3")
                    .addClass("tis-spin4 tis-spin");
                __ONR_isLoading = true;
            } else {
                __ONR_AddMoreElm
                    .attr("disabled", false)
                    .find("i")
                    .removeClass("tis-spin4 tis-spin")
                    .addClass("tis-plus-3");

                __ONR_isLoading = false;
            }
        },

        __initAddMoreDataElm = function () {
            var OFR_morDataContent = "<div class='alert-info moreData' \
                                        style='cursor:pointer;text-align: center;color: "+__loadingColor+";height: 2em;margin-top: 20px' >\
                                        <i class='tis tis-plus-3 tis-3x'></i>\
                                    </div>";

            var ONR_morDataContent = "<div class=' moreData' \
                                        style='cursor:pointer;text-align: center;color: "+__loadingColor+";height: 2em;margin-top: 20px;display: inline-block;width:100%'>\
                                        <i class='tis tis-plus-3 tis-2x'></i>\
                                    </div>";

            __OFR_AddMoreElm = $(OFR_morDataContent);

            __ONR_AddMoreElm = $(ONR_morDataContent);

        },

        __updateOnlineUser = function (params, callback) {


            var leagueSpanElm = __leagueNameContainerElm.closest('div').find('span[leagueId]');
            var leagueId = leagueSpanElm.attr("leagueId");

            var offset = (params && typeof params.offset == "number") ? params.offset : 0;
            var isFromScroll = (params && typeof params.isFromScroll == "boolean") ? params.isFromScroll : false;
            var isFromAddBtn = (params && typeof params.isFromAddBtn == "boolean") ? params.isFromAddBtn : false;


            var gameId = __currentGameId;


            if (!gameId) {
                __initUi(function () {
                    callback && callback();
                });
                return;
            }


            if (!leagueId) {
                __setCurrentGameShow(gameId, undefined,undefined,callback);
                return;
            }

            if (__ONR_isUpdating) {
                callback && callback();
                return;
            }

            var runGameElm = $("#TIS_onlineUser_requestSingleMatch");

            var isMultiPlayer = leagueSpanElm.attr("isMultiPlayer");

            if (typeof isMultiPlayer === "undefined") {
                return;
            }

            if (isMultiPlayer === true || isMultiPlayer === "true") {
                __onlineRequestContainerElm.show();
                __onlineRequestTabHeaderElm.show();
                __tabContainer.show();
                if (!isFromScroll && !isFromAddBtn) {
                    __currentLeagueOnlineUser = {};
                    __onlineRequestContainerElm.empty();
                }

                __onlineRequestContainerElm.append(__ONR_AddMoreElm);
                __changeONRAddMoreDataState(true);
                __onlineRequestContainerElm.scrollTop(function () {
                    return this.scrollHeight;
                });

                runGameElm.hide();
                __$userSearchContainer.show();

                var requestData = {
                    leagueId: leagueId,
                    offset: offset,
                    gameId: gameId,
                    size : 10
                };

                var selectedTab =  __tabContainer.find("input:checked").closest("label").attr("tis-data");
                if (params && params.filter) {

                    if(selectedTab === "ONLINE") {
                        requestData.filter = params && params.filter;
                    } else {
                        requestData.name = params && params.filter;
                    }

                }

                __lastSearchTime = new Date();

                __onlineRequestContainerElm.css({
                    height: "100%"
                });

                __ONR_isUpdating = true;
                __updateUserBtnElm.addClass("TIS_disable");

                var method = selectedTab === "MEMBER" ? __parent.getLeagueMembers: __parent.getOnlineUser;
                method(requestData,function (result) {
                    __updateUserBtnElm.removeClass("TIS_disable");
                    __ONR_isUpdating = false;
                    __changeONRAddMoreDataState(false);
                    if (result.hasError) {
                        __parent.alert(result.errorMessage);
                    } else {
                        __ONR_AddMoreElm.remove();
                        var users = result.result.users;
                        __insertOnlineUsers(users, leagueId,selectedTab === "MEMBER");

                        if(offset == 0  && (!users|| Object.keys(users).length == 0)) {
                            var text;

                            if(selectedTab === "ONLINE") {
                                text = __dic.NOT_ANY_USER_ONLINE[__lang];
                            } else {
                                text = __dic.NOT_ANY_USER_EXIST[__lang];
                            }
                            __onlineRequestContainerElm.append("\
                                <div style='text-align: center;color:#8a2be2;padding: 20px 10px'>"+text+"</div>\
                            ");
                            
                        } else if(!result.result.hasNext) {
                            var text;

                            if(selectedTab === "ONLINE") {
                                text = __dic.NOT_MORE_ONLINE_USER_FIND[__lang];
                            } else {
                                text = __dic.NOT_MORE_USER_FIND[__lang];
                            }

                            __onlineRequestContainerElm.append("\
                                <div class='col-lg-12 col-md-12 col-sm-12 col-xs-12' style='text-align: center;color:#8a2be2;padding: 20px 10px'>"+text+"</div>\
                            ");
                        }

                        if (result.result.hasNext) {
                            __ONR_CurrentOffset = result.result.nextOffset;
                            __ONR_hasNext = true;
                            __initONRScroll();
                            __onlineRequestContainerElm.append(__ONR_AddMoreElm);
                        }

                    }

                    callback && callback();
                    __onlineRequestTabContentElm.attr("leagueId", leagueId);
                });

            } else {
                __tabContainer.hide();
                __onlineRequestTabHeaderElm.hide();
                __onlineRequestContainerElm.hide().empty();
                runGameElm.show();
                __$userSearchContainer.hide();
                callback && callback();
            }

        },

        __updateLeagueMembers = function (params, callback) {
            var leagueSpanElm = __leagueNameContainerElm.closest('div').find('span[leagueId]');
            var isMultiPlayer = leagueSpanElm.attr("isMultiPlayer");
            var leagueId = leagueSpanElm.attr("leagueId");
            var offset = (params && typeof params.offset == "number") ? params.offset : 0;
            var isFromScroll = (params && typeof params.isFromScroll == "boolean") ? params.isFromScroll : false;
            var isFromAddBtn = (params && typeof params.isFromAddBtn == "boolean") ? params.isFromAddBtn : false;

            if (isMultiPlayer != "true") {
                callback && callback();
                return;
            }
            //searchElm.show();

            if (!isFromScroll && !isFromAddBtn) {
                __currentLeagueMembers = {};
                __leagueMemberContainerElm.empty();
            }

            __leagueMemberContainerElm.append(__OFR_AddMoreElm);
            __changeOFRAddMoreDataState(true);
            __leagueMemberContainerElm.scrollTop(function () {
                return this.scrollHeight;
            });

            __parent.getLeagueMembers({
                leagueId: leagueId,
                offset: offset,
                name: params && params.filter
            },function (res) {
                var result = res.result;
                __changeOFRAddMoreDataState(false);
                if (res.hasError) {
                    __parent.alert(res.errorMessage);
                } else {
                    __OFR_AddMoreElm.remove();
                    var users = result.users;
                    for (var userId in users) {

                        if (__currentLeagueMembers[userId]) {
                            continue;
                        }
                        var imageUrl;

                        if(users[userId].imageUrl) {
                            imageUrl = users[userId].imageUrl
                        } else if(typeof users[userId].image === "object" && users[userId].image!== null) {
                            imageUrl = __parent.getService().generateImageSrc(users[userId].image)
                        }
                        __addLeagueMember(userId, users[userId].name, imageUrl);
                        __currentLeagueMembers[userId] = true;
                    }

                    if (result.hasNext) {
                        __OFR_CurrentOffset = result.nextOffset;
                        __OFR_hasNext = true;
                        __initOFRScroll();
                        __leagueMemberContainerElm.append(__OFR_AddMoreElm);
                    } else {
                        __OFR_isScrollInit = false;
                        __OFR_hasNext = false;
                    }

                    __offlineRequestTabContentElm.attr({
                        leagueId: leagueId
                    });
                }
                callback && callback();
            });


        },

        __updateLeagueMenu = function (params) {
            var gameId   = params.gameId,
                selectedLeagueIdOption = params.leagueId,
                callback = params.callback,
                nextOffset = params.nextOffset,
                loadingElm = $("#TIS_onlineUser_leagueName_loading"),
                isForceView = params.ifForceView,// for leagues that set from onSHow(league ui call this)
                moreLeagueElm;

            loadingElm.show();

            var requestData = {gameId: gameId};

            if(isForceView) {
                requestData.leagueId = selectedLeagueIdOption;
            } else {
                requestData.userState = 1;
                requestData.statusList = [2,3,5];
                if(typeof  nextOffset == "number") {
                    requestData.offset = nextOffset;
                } else {
                    __leagueNameContainerElm.find('*:not("#TIS_onlineUser_leagueName_loading")').remove();
                }
            }

            moreLeagueElm = __leagueNameContainerElm.find("li[TIS-Data=TIS-moreData]");

            __parent.getLeaguesInfo(requestData,function (result) {
                if (result.hasError) {
                    //__updateLeagueMenu(gameId);
                    __parent.alert(result.errorMessage);
                    callback && callback();
                } else {
                    loadingElm.hide();

                    if(typeof  nextOffset !== "number" && !isForceView) {

                        __leagueNameContainerElm.empty();
                    }

                    var leaguesData = result.result.leagues;

                    var selectedLeagueId,
                        selectedIsMulti;

                    for (var i=0;i<leaguesData.length;i++) {
                        var leagueData = leaguesData[i],
                            leagueId = leagueData.id;
                        __leaguesData[leagueId] = leagueData;

                        if (!leagueData.isMember) {
                            continue;
                        }
                        if(isForceView && leagueId == selectedLeagueIdOption /*&& __leagueNameContainerElm.find('a[leagueId='+selectedLeagueIdOption+']').length > 0*/) {
                            selectedIsMulti = leagueData.playerNumberType >= 2;
                            __leaguesData[leagueId] = leagueData;
                            __setCurrentLeagueShow(gameId,leagueData,selectedIsMulti,callback,params.menuSelected);
                            return;
                        }

                        (function(leagueId){

                            var isMultiPlayer = (leagueData.playerNumberType >= 2);

                            var imageUrl = null;
                            if(typeof leagueData.imageUrl === "string") {
                                imageUrl = leagueData.imageUrl
                            } else if(typeof leagueData.image === "object" && leagueData.image!== null) {
                                imageUrl = __parent.getService().generateImageSrc(leagueData.image)
                            }

                            var content = "\
                                    <li isMultiPlayer='" + isMultiPlayer + "' leagueId ='" + leagueData.id + "' style='height: 40px'>\
                                        <a href=''  isMultiPlayer='" + isMultiPlayer + "' leagueId ='" + leagueData.id + "' >\
                                            <img src='"+imageUrl+"' style='height:30px;float: right'>\
                                            " + leagueData.name + "\
                                        </a>\
                                    </li>\
                                ";

                            var leagueElm;

                            if(moreLeagueElm.length > 0) {
                                leagueElm = $(content).insertBefore(moreLeagueElm);
                            } else {
                                leagueElm = $(content).appendTo(__leagueNameContainerElm);
                            }

                            leagueElm.find("a").click(function (e) {
                                e.preventDefault();
                                var leagueId = $(this).attr("leagueId");
                                __setCurrentLeagueShow(gameId,__leaguesData[leagueId], $(this).attr("isMultiPlayer"),null,true);
                            });

                        })(leagueId);

                    }
                    selectedLeagueId = __gamesInfo[gameId].defaultLeagueId;

                    if(selectedLeagueId !==  undefined && __leaguesData[selectedLeagueId]) {
                        selectedIsMulti = (__leaguesData[selectedLeagueId].playerNumberType >= 2);
                    } else {
                        selectedLeagueId = Object.keys(__leaguesData)[0];
                        if(selectedLeagueId) {
                            selectedIsMulti = (__leaguesData[selectedLeagueId].playerNumberType >= 2);
                        }

                    }

                    if (selectedLeagueId) {
                        __setCurrentLeagueShow(gameId,__leaguesData[selectedLeagueId],selectedIsMulti,callback,params.menuSelected);
                    }


                    if(result.result.hasNext) {
                        if(moreLeagueElm.length > 0) {
                            moreLeagueElm.off("click");
                        } else {
                            var content = "\
                                <li TIS-Data ='TIS-moreData'>\
                                    <i class='tis tis-plus tis-2x' style='color: #fa8d2e'></i>\
                                </li>\
                                ";
                            moreLeagueElm = $(content).appendTo(__leagueNameContainerElm);
                        }

                        moreLeagueElm
                            .click(function () {
                                var aElm = moreLeagueElm.find("i");

                                aElm
                                    .removeClass("tis-plus")
                                    .addClass("tis-refresh tis-spin");

                                moreLeagueElm.css("pointer-events", "none");

                                __updateLeagueMenu({
                                    gameId : gameId,
                                    nextOffset : result.result.nextOffset,
                                    callback : function () {
                                        aElm
                                            .removeClass("tis-refresh tis-spin")
                                            .addClass("tis-plus");

                                        moreLeagueElm.css("pointer-events", "");
                                    }
                                });

                                return false;

                            });
                    } else {
                        if(moreLeagueElm.length > 0) {
                            moreLeagueElm.remove();
                        }
                    }

                    if(selectedLeagueIdOption && isForceView) {
                        __isUiInit = false;
                    }
                }
            });
        },

        __insertOnlineUsers = function (users, leagueId,leagueMember) {
            for (var userId in  users) {
                if (__currentLeagueOnlineUser[userId]) {
                    continue;
                }

                var isOnline = false;

                if(leagueMember) {
                    isOnline = users[userId].isOnline;
                } else {
                    isOnline = true;
                }

                var ids = users[userId].requestIds;
                if(!ids) {
                    ids = __parent.getService().getMatchRequestIds({leagueId: leagueId,opponentId:userId});
                }

                var imageUrl = null;

                if(typeof users[userId].imageUrl === "string") {
                    imageUrl = users[userId].imageUrl
                } else if(typeof users[userId].image === "object" && users[userId].image!== null) {
                    imageUrl = __parent.getService().generateImageSrc(users[userId].image)
                }

                __addUser(userId, users[userId].name, imageUrl, leagueId,ids,isOnline,leagueMember);
                __currentLeagueOnlineUser[userId] = true;
            }
        },

        __addLeagueMember = function (id, name, imageUrl) {
            var parent;

            var lastDiv = __leagueMemberContainerElm.children("div:last-child");
            if (lastDiv.length > 0) {
                lastDiv.children("div").each(function (e, div) {
                    if ($(div).children().length == 0) {
                        parent = $(this);
                        return false;
                    }
                });
            }

            if (!parent) {
                var row = $("<div>")
                    .appendTo(__leagueMemberContainerElm)
                    .css({
                        "padding-top": "1em"
                    })
                    .addClass("row");

                parent = $("<div>")
                    .appendTo(row)

                    .addClass("col-lg-6 col-md-6 col-sm-6 col-xs-6");

                $("<div>")
                    .appendTo(row)
                    .css({
                        "text-align": "center"
                    })
                    .addClass("col-lg-6 col-md-6 col-sm-6 col-xs-6");
            }

            var spn;


            if (typeof imageUrl === "string") {
                spn = "<span class='img-responsive img-circle' style='background: url(" + imageUrl + ")no-repeat center center;height:3em;background-size: contain' ></span>";
            } else {
                spn = "<span class='tis tis-3x tis-user'></span>";
            }

            var btnData = "\
                <div class='row' userId=" + id + " style='cursor:pointer;border-radius:5px;margin:0.1em'>\
                    <div class='col-lg-4 col-md-4 col-sm-4 col-xs-12' style='text-align: center'>\
                        " + spn + "\
                    </div>\
                    <div class='col-lg-8 col-md-8 col-sm-8 col-xs-12' style='text-align: center;overflow: hidden;white-space: nowrap'>\
                        " + name + "\
                    </div>\
                </div>\
                    ";


            var btn = $(btnData)
                //.addClass("btn btn-default btn-block")
                .appendTo(parent)
                .attr("opponentName", name);

            btn.on("click", function (e) {
                var gameId = __currentGameId;
                //var gameName = gameElm.text().trim();
                //var leagueName = leagueElm.text().trim();
                var opponentId = $(this).attr("userId");
                var opponentName = $(this).attr("opponentName");


                $("#TIS_OU_OTC_DC_imageContent").empty().append(spn);
                $("#TIS_OU_OTC_DC_nameContent").empty().append(name);

                $("#TIS_OU_OTC_userContent").hide();
                $("#TIS_OU_OTC_dateContent")
                    .attr({
                        opponentId: opponentId,
                        leagueId: __currentLeagueId,
                        gameId: gameId
                    })
                    .show();

                __dateTimeElm.val("");
                __timeContainerElm.val("");
            });
        },

        __changeBtnState = function (btn, state) {

            var css;
            if (state) {

                css = {
                    "pointer-events": "auto",
                    opacity: 1,
                    "background-color": "white",
                    padding: "0px"// because in some device not render after set css
                };

                btn.find(".TIS-onlineUser-cancelRequest").css({visibility : "hidden"});
                btn.find(".TIS-user-container")
                .css(css);

            } else {

                css = {
                    "pointer-events": "none",
                    opacity: 0.6,
                    "background-color": "lightgrey",
                    padding: "0px"// because in some device not render after set css
                };

                btn.find(".TIS-onlineUser-cancelRequest").css({visibility : "visible"});
                btn.find(".TIS-user-container")
                .css(css);

            }
        },

        __addUser = function (id, name, imageUrl, leagueId,requestIds,isOnline,leagueMember) {

            var parent;
            parent = $("<div>")
                .appendTo(__onlineRequestContainerElm)
                .addClass("col-lg-2 col-md-3 col-sm-4 col-xs-6");


            var onlineCircleView = "";
            var userOnlineStateStyle = "";

            if(leagueMember ) {

                // var color = "#36c736";
                // if(!isOnline) {
                //     color = "#b3b3b3";
                // }
                // onlineCircleView = '\
                // <div>\
                //     <i class="tis tis-circle" style="font-size: 1.5em;color:'+color+';position: absolute;left:6px;top:-10px;"></i>\
                // </div>\
                // ';

                if(isOnline) {
                    userOnlineStateStyle = "border-bottom: 9px solid #03bf03;"
                } else {
                    userOnlineStateStyle = "border-bottom: 9px solid gray;"
                }

            }

            var spn;


            if (typeof imageUrl === "string" && imageUrl.length>1) {
                // var url = __parent.getService().generateImageSrc(image, {width: 100, height: 100});
                spn = "<div class='TIS-onlineUser-image' style='background-image: url(" + imageUrl + ");"+userOnlineStateStyle+"'></div>";
            } else {
                var index = TIS.Util.generateRandomInt(0, __backgroundColors.length - 1);

                var color = __backgroundColors[index];
                spn = "\
                    <div style='display:inline-block;'>\
                        <div style='display:table;text-align: center;width:80px;height: 80px;border-radius: 40px;margin-top: -40px;background:"+color+";"+userOnlineStateStyle+"'>\
                            <span style='font-size: 40px;color:white;display: table-cell;vertical-align: middle'>"+name[0].toUpperCase()+"</span>\
                        </div>\
                    </div>\
                ";
            }

            var morInfo = "";
            if(__globalConfig && __globalConfig.userMoreInfo) {
                morInfo = "\
                <div class='TIS-onlineUser-moreInfo'>\
                    <i class='tis tis-info-circled-1' style='font-size: 3em;color: "+__BtnColor+";position: absolute;right: 0;top:-3px;'></i>\
                </div>\
            ";
            }

            var btnData = "\
                <div class='TIS-onlineUser-cancelRequest TIS-pointer'>\
                    <i class='tis tis-close'></i>\
                </div>\
                <div class='TIS-user-container' userId=" + id + ">\
                    " + onlineCircleView + "\
                    " + morInfo + "\
                    " + spn + "\
                    <div class='TIS-onlineUser-nickName'>\
                        " + name + "\
                    </div>\
                </div>\
            ";

            var requestId;

            var btn = parent.append(btnData);

            if(Array.isArray(requestIds) && requestIds.length > 0) {
                requestId = requestIds[0];
                __changeBtnState(btn, false);
                __activeMatchRequest[requestIds[0]].btn = btn;
            }

            btn.find(".TIS-user-container")
                .on("click", function (e) {
                    if(isOnline) {

                        var userId = __parent.getUserData().id;

                        if(userId == id) {
                            __parent.alert("به خودتان نمی توانید درخواست دهید");
                            return;
                        }

                        __changeBtnState(btn, false);
                        var gameId =__currentGameId;
                        //var gameName = gameElm.text().trim();

                        var leagueElm = __leagueNameContainerElm.closest('div').find('span[leagueId]');
                        var leagueId = leagueElm.attr("leagueId");
                        //var leagueName = leagueElm.text().trim();
                        var opponentId = id;
                        var opponentName = name;

                        var matchData = {
                            opponentId: opponentId,
                            gameId: gameId,
                            leagueId: leagueId
                        };


                        __parent.matchRequest(matchData,{
                            onResult: function (result) {
                                if (result.hasError) {
                                    __parent.alert(result.errorMessage);
                                    __changeBtnState(btn, true);
                                } else {
                                    requestId = result.result.requestId;
                                    __activeMatchRequest[requestId] = {
                                        leagueId: leagueId,
                                        opponentId: opponentId,
                                        btn: btn,
                                        opponentName: opponentName
                                    };
                                }
                            },
                            onCancel : function(params) {
                                __changeBtnState(__activeMatchRequest[params.requestId].btn, true);
                            },
                            onAccept : function(params) {
                                __changeBtnState(__activeMatchRequest[params.requestId].btn, true);
                                __matchRequestResponse({
                                    requestId: params.requestId,
                                    state: true
                                });
                            },
                            onReject :function(params) {
                                __changeBtnState(__activeMatchRequest[params.requestId].btn, true);
                                __matchRequestResponse({
                                    requestId: params.requestId,
                                    state: false,
                                    rejectMessage: params.rejectMessage
                                });
                            }
                        });
                    } else {
                        __parent.alert(__dic.USER_NOT_ONLINE[__lang]);
                    }

            });

            btn.find("i.tis-info-circled-1").on("click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                __parent.fireEvent("userMoreInfo", {
                    userId: id,
                    name: name,
                    image: imageUrl,
                    leagueId: leagueId,
                    fromType: 1
                });
            });
            // var cancelBTN = btn.find("button");
            btn.find(".TIS-onlineUser-cancelRequest")
                .on("click", function () {
                    if(requestId) {
                        var $btn = $(this);
                        var span = $btn.prop("disabled", true).find("span");
                        span.addClass("tis-spin4");
                        var leagueElm = __leagueNameContainerElm.closest('div').find('span[leagueId]');
                        var leagueId = leagueElm.attr("leagueId");
                        __parent.cancelMatchRequest({
                            requestId : requestId,
                            leagueId : leagueId
                        },function (res) {
                            $btn.prop("disabled", false);
                            span.removeClass("tis-spin4");
                            __changeBtnState(__activeMatchRequest[requestId].btn, true);
                        })
                    }
                });
        },

        __initView = function () {

            var background = "#1cb7d4";

            if(__ownConfig ) {
                if(__ownConfig.backgroundUrl) {
                    background = "url(" + __ownConfig.backgroundUrl + ")";
                } else if(__ownConfig.backgroundColor) {
                    background = __ownConfig.backgroundColor;
                }
            }

            var style = '';

            if(__animate) {
                style = 'transform : translateX(calc(100%));-webkit-transform : translateX(calc(100%))';
            } else {
                style = 'display : none';
            }

            style += (';background:' + background + ';');


            var onlineUserView = "\
                <div  id='TIS_onlineUser_container' style='"+style+";'>\
                    <div id='TIS_onlineUser_mainPage' style='height:100%'>\
                        <div id='TIS_onlineUser_mainPage_quickMatchContainer'>\
                            <div class='TIS-quickMatch-checkbox TIS-CheckBox' style='text-align: center;padding:10px 0'>\
                                <input  id='TIS_onlineUser_quickMatch' type='checkbox' />\
                                <label  for='TIS_onlineUser_quickMatch' class='label-success' style='margin-bottom: 8px;'></label>\
                                <span style='font-size:x-large;color:white;padding-right:25px'>"+__dic.REQUESTQUICKMATCH[__lang]+"</span>\
                            </div>\
                        </div>\
                        <div id='TIS_onlineUser_mainPage_header'>\
                             <div>\
                                 <span id='TIS_onlineUser_mainPage_close' class='tis tis-2x tis-close TIS-pointer'\
                                        style='float: right;margin-right: 10px;color:"+__BtnColor+";font-weight: bold'></span>\
                                 <span id='TIS_onlineUser_mainPage_update' class='tis tis-refresh tis-2x TIS-pointer'\
                                        style='float: left;margin-left: 10px;color:"+__BtnColor+";font-weight: bold'></span>\
                                 <div class='panel-title' style='text-align:center;font-weight: bold;font-size: x-large;'>" + __dic.PLAY_MATCH[__lang] + "</div>\
                             </div>\
                             <div class='row' style='padding:20px 15px'>\
                                <div class='input-group-btn'  style='padding: 0 30px; '>\
                                     <button type='button' class='btn btn-default dropdown-toggle input-lg' data-toggle='dropdown' style='width: 100%;height:50px;display:block;border-radius: 5px;'>\
                                        <div class='row'>\
                                            <div class='col-lg-3 col-md-3 col-sm-3 col-xs-3'><img tis-data='IMG' style='height:38px;float:right;display:none;border-radius: 5px;'></div>\
                                            <div class='col-lg-6 col-md-6 col-sm-6 col-xs-6'><span TisDropText='game' style='float:right;padding:10px'>" + __dic.SELECT_LEAGUE[__lang] + "</span></div>\
                                            <div class='col-lg-3 col-md-3 col-sm-3 col-xs-3'><span class='tis tis-2x  tis-down-dir' style='float:left;padding-top:5px'></span></div>\
                                        </div>\
                                     </button>\
                                     <ul id='TIS_onlineUser_leagueName_container' class='dropdown-menu' role='menu' style='width: 100%;overflow-y: auto;z-index: 1051;'>\
                                         <li id='TIS_onlineUser_leagueName_loading' class='alert alert-success tis-spin4'  style='display:none;text-align: center' role='info'>\
                                             " + __dic.UPDATING[__lang] + "\
                                         </li>\
                                     </ul>\
                                 </div>\
                             </div>\
                             <div id='TIS_onlineUser_tabContainer' class='row'>\
                                <div class='btn-group' data-toggle='buttons'>\
                                    <label tis-data='ONLINE' class='btn active'>\
                                        <input type='radio' name='TIS-onlineUser-tab' checked>\
                                        <i class='tis tis-circle-thin tis-2x'></i>\
                                        <i class='tis tis-dot-circled tis-2x'></i>\
                                        <span>نفرات آنلاین</span>\
                                    </label>\
                                    <label tis-data='MEMBER' class='btn'>\
                                        <input type='radio' name='TIS-onlineUser-tab'>\
                                        <i class='tis tis-circle-thin tis-2x'></i>\
                                        <i class='tis tis-dot-circled tis-2x'></i>\
                                        <span>همه اعضا</span>\
                                    </label>\
                                </div>\
                             </div>\
                             <div id='TIS_onlineUser_userSearchContainer'>\
                                    <i class='tis tis-2x tis-search'></i>\
                                    <input id='TIS_onlineUser_userSearch' type='text' class='form-control' placeholder='" + __dic.SEARCH[__lang] + "'>\
                            </div>\
                        </div>\
                        <div style='height:100%'>\
                            <div id='TIS_onlineUser_noLoginContainer' class='alert alert-danger'>"+__dic.LOGINFIRST[__lang]+"</div>\
                            <div id='TIS_onlineUser_loginContainer' style='display: none;height:100%'>\
                                <div style='height:100%;background:#e4e4e4'>\
                                    <div class='TIS_scroll' id='TIS_onlineUser_table_body'></div>\
                                    <div class='controls' style='padding-top:20px'>\
                                        <button id='TIS_onlineUser_requestSingleMatch' style='display: none' class='btn btn-lg btn-block TIS-orange'  type='submit' value='" + __dic.LOGIN[__lang] + "'>\
                                            <span> " + __dic.PLAYGAME[__lang] + "</span>\
                                        </button>\
                                    </div>\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
            ";

            __containerElm = $(onlineUserView).appendTo(document.body).modal("hide");
        },

        __initEvent = function () {

            $("#TIS_onlineUser_mainPage_close").on("click", function () {
                __self.hide();
            });

            __userSearchInputElm.on("keyup", function () {
                var text = $(this).val();

                if (__currentView == "onlineRequest") {
                    __updateOnlineUser({
                        filter: text
                    });
                } else {
                    //__updateLeagueMembers({
                    //    filter: text
                    //});
                }

            });

            $("#TIS_onlineUser_requestSingleMatch").on("click", function () {
                var current = this;
                var gameId = __currentGameId;

                var leagueId = __leagueNameContainerElm.closest('div')
                    .find('span[leagueId]').attr("leagueId");

                var userData = __parent.getUserData();
                if (userData.id) {

                    $(current).prop("disabled", true);

                    __parent.matchIdRequest({
                        gameId: gameId,
                        leagueId: leagueId
                    },function (result) {
                        $(current).prop("disabled", false);

                        if (result.hasError) {
                            __parent.alert(result.errorMessage);
                        } else {
                            __parent.runSingleMatch({
                                gameId: gameId,
                                leagueId: leagueId,
                                matchId: result.result.matchId
                            });
                            __self.hide();
                        }
                    });
                }
            });

            __updateUserBtnElm.on("click", function () {
                var $self = $(this);
                if ($self.hasClass("TIS_disable")) {
                    return;
                }
                __updateOnlineUser(undefined, function () {
                    $self.removeClass("TIS_disable");
                });
            });

            $("#TIS_OU_OTC_DC_sendRequest").on('click', function () {
                var self = this;
                $(self).prop("disabled", true).find("span").addClass("tis-spin4");

                var jalaliDateDate = $("#TIS_OU_OTC_DC_dateTimePicker").val().split("/");

                var clock = __timeContainerElm.val().split(":");


                var containerElm = $("#TIS_OU_OTC_dateContent");

                var data = {
                    gameId: containerElm.attr("gameId"),
                    leagueId: containerElm.attr("leagueId"),
                    opponentId: containerElm.attr("opponentId")
                };


                if (jalaliDateDate.length > 1) {
                    var gTime = TIS.Util.shamsiToMiladi(jalaliDateDate[0], jalaliDateDate[1], jalaliDateDate[2]);
                    var date = new Date(gTime.y+"/"+gTime.m+"/"+gTime.d);

                    if(clock.length > 1) {
                        date.setHours(clock[0],clock[1]);
                    }

                    data.requestTime = date.getTime();

                }

                //return;
                data.isOffline = true;
                __parent.matchRequest(data,{
                    onResult: function (result) {
                        if (result.hasError) {
                            __parent.alert(result.errorMessage);
                        } else {
                            __parent.info(__dic.SUCCESSREQUEST[__lang]);

                            $("#TIS_OU_OTC_userContent").show();
                            containerElm.hide();
                        }
                        $(self).prop("disabled", false).find("span").removeClass("tis-spin4");


                    }
                });

            });

            $("#TIS_OU_OTC_DC_cancelRequest").on('click', function () {
                $("#TIS_OU_OTC_userContent").show();
                $("#TIS_OU_OTC_dateContent").hide();
            });

            __containerElm.on("click", ".moreData", function () {
                var isLoading;
                if (__currentView == "offlineRequest") {

                    isLoading = $(this).find("i").hasClass("tis-spin4");
                    if (!isLoading) {
                        __changeOFRAddMoreDataState(isLoading);
                        __updateLeagueMembers({
                            isFromScroll: false,
                            isFromAddBtn: true,
                            offset: __OFR_CurrentOffset
                        });
                    }

                } else {

                    isLoading = $(this).find("i").hasClass("tis-spin4");
                    if (!isLoading) {
                        __changeONRAddMoreDataState(isLoading);
                        __updateOnlineUser({
                            isFromScroll: false,
                            isFromAddBtn: true,
                            offset: __ONR_CurrentOffset
                        });
                    }

                }
            });

            $(window).on("resize", __onWindowResize);

            $("#datetimepicker").find("span").on("click", function () {
                __dateTimeElm.datepicker("show");
            });

            $("#timepicker").find("span").on("click", function (e) {
                e.stopPropagation();
                __timeContainerElm.clockpicker("show");
            });

            $("#TIS_onlineUser_container").on("hidden.bs.modal", function () {
                __hideUI();
            });

            __quickMatchBtnElm.on("change", function () {
                var leagueId = __leagueNameContainerElm.closest('div').find('span[leagueId]').attr("leagueId");
                var gameId = __currentGameId;

                if(! __parent.getQuickMatchState({leagueId:leagueId})) {
                    __requestQuickMatch(leagueId,gameId);
                } else {
                    __cancelQuickMatch(leagueId);
                }
            });


            __tabContainer
                .find("input")
                .on("change", function () {
                    __updateOnlineUser({
                        offset: 0,
                    });
                });

        },

        __initOFRScroll = function () {
            if (!__OFR_isScrollInit) {
                __OFR_isScrollInit = true;
                __leagueMemberContainerElm.on('scroll', function () {
                    if (__leagueMemberContainerElm[0].scrollHeight - 20 <= $(this).scrollTop() + __leagueMemberContainerElm[0].clientHeight) {
                        __leagueMemberContainerElm.off('scroll');
                        __OFR_isScrollInit = false;
                        if (__OFR_hasNext && !__OFR_isLoading) {
                            __updateLeagueMembers({
                                isFromScroll: true,
                                offset: __OFR_CurrentOffset
                            });
                        }
                    }
                });
            }
        },

        __initONRScroll = function () {
            if (!__ONR_isScrollInit) {
                __ONR_isScrollInit = true;
                __onlineRequestContainerElm.on('scroll', function () {
                    if (__onlineRequestContainerElm[0].scrollHeight - 20 <= $(this).scrollTop() + __onlineRequestContainerElm[0].clientHeight) {
                        __onlineRequestContainerElm.off('scroll');
                        __ONR_isScrollInit = false;
                        if (__ONR_hasNext && !__ONR_isLoading) {
                            __updateOnlineUser({
                                isFromScroll: true,
                                offset: __ONR_CurrentOffset
                            });
                        }
                    }
                });
            }
        },

        __changeOfflineRequestView = function(gameId,leagueId,isMultiPlayer) {
            if(isMultiPlayer) {
                //if($.prototype.datetimepicker) {
                //
                //    var currentShamsiDate =TIS.Util.miladiToShamsi(new Date().getTime());
                //
                //    var maxTime =  TIS.Util.miladiToShamsi(leagueEndTime);
                //    if(typeof leagueEndTime == "number" && leagueEndTime>0 && maxTime > currentShamsiDate ) {
                //        __offlineRequestTabHeaderElm
                //            .removeClass("TIS_disable disabled")
                //            .show();
                //        __dateTimeElm
                //            .data('DateTimePicker')
                //            .maxDate(new Date(maxTime.getUTCFullYear(), maxTime.getUTCMonth() - 1, maxTime.getUTCDate(), maxTime.getHours(), maxTime.getMinutes()));
                //    } else {
                //        __currentView = "onlineRequest";
                //        __onlineRequestTabHeaderElm
                //            .find('a')
                //            .addClass("TIS_activeTab")
                //            .tab("show");
                //        __offlineRequestTabHeaderElm
                //            .addClass("TIS_disable disabled")
                //            .find('a').removeClass("TIS_activeTab");
                //    }
                //}

                if($.datepicker) {
                    if(__leaguesData[leagueId].offlineRequestState ) {
                        __offlineRequestTabHeaderElm
                            .removeClass("TIS_disable disabled")
                            .show();

                        __dateTimeElm.datepicker("option", "maxDate", new Date(__leaguesData[leagueId].endTime));

                    } else {
                        __dateTimeElm.datepicker("option", "maxDate", "");

                        __currentView = "onlineRequest";
                        __onlineRequestTabHeaderElm
                            .find('a')
                            .addClass("TIS_activeTab")
                            .tab("show");
                        __offlineRequestTabHeaderElm
                            .show()
                            .addClass("TIS_disable disabled")
                            .find('a').removeClass("TIS_activeTab");
                    }
                }
            } else {
                __currentView = "onlineRequest";
                //__offlineRequestTabHeaderElm.hide();
                __offlineRequestTabHeaderElm.addClass("TIS_disable disabled");
                __onlineRequestTabHeaderElm
                    .find('a')
                    .addClass("TIS_activeTab")
                    .tab("show");
                __offlineRequestTabHeaderElm.find('a').removeClass("TIS_activeTab");
                //__updateOnlineUser();
            }


        },

        __setCurrentTime = function() {
            if($.prototype.datetimepicker) {
                var currentMDate = new Date();
                var currentTime  = TIS.Util.miladiToShamsi(currentMDate),
                    setDate = TIS.Util.shamsiToMiladi(new Date(__dateTimeElm.val())),
                    minimumMinute = __parent.getConfig().offlineRequestMinMinute;

                if (setDate !== "Invalid Date" && !isNaN(setDate)) {
                    if(setDate - currentMDate >  minimumMinute * 60000) {
                        return;
                    }
                }
                var minMinute = currentTime.getMinutes() + minimumMinute;

                var time = new Date(currentTime.getUTCFullYear(), currentTime.getUTCMonth() - 1, currentTime.getUTCDate(), currentTime.getHours(), minMinute);


                __dateTimeElm.val("");
                __dateTimeElm
                    .data('DateTimePicker')
                    .defaultDate(time)
                    .minDate(time);

            }

        },

        __initUi = function (callback) {
            if (!__isUiInit) {
                __parent.getGamesInfo({registerGame:true},function (result) {
                    if (result.hasError) {
                        __parent.alert(result.errorMessage);
                        __isUiInit = false;
                    } else {
                        __leagueNameContainerElm.empty();

                        var games = result.result.games;
                        __gamesInfo = {};

                        for (var i = 0; i < games.length; i++) {
                            var game = games[i];
                            __gamesInfo[game.id] = game;
                        }

                        if(Object.keys(__gamesInfo).length>1) {
                            __navbarContainerElm
                                .find(".TIS-matchRequest-leagueContainer")
                                .removeClass("col-lg-12 col-md-12 col-sm-12 col-xs-12")
                                .addClass("col-lg-8 col-md-8 col-sm-8 col-xs-8");
                        }
                    }

                    callback && callback(result);
                });

                //if($.prototype.datetimepicker) {
                //    __dateTimeElm
                //        .datetimepicker({
                //            format: 'HH:mm   YYYY/MM/DD',
                //            showClear: true,
                //            showClose: true,
                //            sideBySide: true,
                //            ignoreReadonly : true
                //        })
                //        .on("dp.show",function() {
                //            __setCurrentTime();
                //        });
                //}

                if($.datepicker) {

                    __dateTimeElm
                        .datepicker({
                            gotoCurrent : true ,
                            minDate : new Date(),
                            beforeShow : function() {
                                //__setCurrentTime();
                            }
                        });

                    __timeContainerElm.clockpicker({
                        donetext : "OK",
                        placement: 'bottom',
                        autoclose : true,
                        afterShow: function() {
                            $(".clockpicker-popover").css({
                                "z-index" : 1050 ,
                                "right" : "initial"
                            });
                            $(".popover-title").css({
                                "direction" : "ltr"
                            })
                        }
                    });
                }

            } else {
                callback && callback({
                    hasError : false
                });
            }
        },

        __setCurrentGameShow = function (gameId, leagueId,ifForceView,callback,gameSelected,leagueSelected) {
            if (!__OFR_isUpdating) {
                if(__currentGameId!= gameId) {
                    __changeQuickMatchState(false);
                    __onlineRequestContainerElm.empty().append(__ONR_AddMoreElm);
                    __changeONRAddMoreDataState(true);
                    $("#TIS_onlineUser_requestSingleMatch").hide();
                    __$userSearchContainer.hide();
                    __$quickMatchContainer.hide();
                }
                __currentGameId = gameId;
                __OFR_isUpdating = true;
                __updateUserBtnElm.addClass("TIS_disable tis-spin");

                __updateLeagueMenu({
                    gameId : gameId,
                    leagueId : leagueId,
                    ifForceView : ifForceView,
                    menuSelected :leagueSelected,
                    callback : function () {
                        __OFR_isUpdating = false;
                        __updateUserBtnElm.removeClass("TIS_disable tis-spin");
                        callback && callback();
                        __onWindowResize();
                    }
                });
            }
        },

        __setCurrentLeagueShow = function(gameId,leagueData,isMultiPlayer,callback,menuSelected) {
            var leagueName = leagueData.name,
                leagueId = leagueData.id;


            var $container = __leagueNameContainerElm.closest('div');
            var $elem = $container.find('span[TisDropText]')
                .attr({
                    leagueId: leagueId,
                    isMultiPlayer: isMultiPlayer
                });

            var $img = $container.find("img[tis-data='IMG']");

            var imageUrl = null;
            if(typeof leagueData.imageUrl === "string") {
                imageUrl = leagueData.imageUrl
            } else if(typeof leagueData.image === "object" && leagueData.image!== null) {
                imageUrl = __parent.getService().generateImageSrc(leagueData.image)
            }

            if(imageUrl) {
                $img.attr("src", imageUrl).show();
            } else {
                $img.hide();
            }


            if(menuSelected) {
                $elem.text(leagueName);
            } else {
                $elem.text( __dic.SELECT_LEAGUE[__lang]);
            }


            var $league = __leagueNameContainerElm.find("li");

            // if($league.length>1) {
            //     __leagueNameContainerElm.closest(".TIS-matchRequest-leagueContainer").show();
            // }

            $league
                .css({
                    "background-color": "white"
                });
            __leagueNameContainerElm
                .find("li[leagueId="+leagueId+"]")
                .css({
                    "background-color": "#12F512"
                });

            if(__currentLeagueId === leagueId) {
                callback && callback();
                return;
            }

            __currentLeagueId = leagueId;
            if (__currentView === "onlineRequest") {
                __initialQuickMatchContainer(__currentLeagueId);
                __updateOnlineUser(undefined, callback);
            } else {
                __updateLeagueMembers(undefined, callback);
            }
            __changeOfflineRequestView(gameId,__currentLeagueId,isMultiPlayer);

        },

        __matchRequestResponse = function(params) {
            var requestId = params.requestId;
            var requestState = params.state;
            var rejectMessage = params.rejectMessage;

            var currentLeagueId = __leagueNameContainerElm.closest('div')
                .find('span[leagueId]').attr("leagueId");

            if (__activeMatchRequest[requestId]) {
                var leagueId = __activeMatchRequest[requestId].leagueId;

                var userId = __activeMatchRequest[requestId].opponentId;

                if (currentLeagueId == leagueId) {
                    __onlineRequestContainerElm
                        .find("tr[userId=" + userId + "]")
                        .find("input").prop("disabled", false);
                }
                if (!requestState) {
                    var messageContent = "\
                <div class='row'>\
                    <div class='col-lg-12 col-md-12 col-sm-12 col-xs-12' >\
                        <div class='row' style='color: #089ce2'>\
                            " + __dic.REQUESTRESULTTO[__lang] + __activeMatchRequest[requestId].opponentName + "\
                        </div>\
                        <div class='row'>\
                            " + rejectMessage + "\
                        </div>\
                    </div>\
                </div>\
                ";
                    __parent.info({
                        message : $(messageContent),
                        css : {
                            "background-color" : "#ffb200"
                        }
                    });

                }
                //__changeBtnState(__activeMatchRequest[requestId].btn, true);
                //delete __activeMatchRequest[requestId];

            }
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

    __self.onNewUser = function (id, name, leagueId) {
        //var currentLeagueId = $("#TIS_onlineUser_leagueName_container").closest('div')
        //    .find('span[leagueId]').attr("leagueId");
        //
        //
        //if (currentLeagueId == leagueId) {
        //    __addUser(id, name);
        //}

    };

    __self._matchRequestResponse = function (params) {

    };

    __self.onRemoveUser = function (userId, leagueId) {
        var currentLeagueId = __leagueNameContainerElm.closest('div')
            .find('span[leagueId]').attr("leagueId");
        if (currentLeagueId == leagueId) {
            __onlineRequestContainerElm.find("tr[userId='" + userId + "']").remove();
        }

    };

    /**
     * @method show
     * @public
     * @chainable
     *
     * @param {object} params
     *      @param {Number} params.gameId
     *      @param {Boolean} params.gameSelected
     *      @param {Boolean} params.leagueSelected
     *      @param {Boolean} params.leaguesMenuVisible
     *      @param {Boolean} params.quickMatchMenuVisible
     *
     * */
    __self.show = function (params) {
        __visibility = true;
        if(__parent.isLogin()) {

            if($("#TIS_onlineUser_noLoginContainer").css("display") !== "none") {
                __self.onLogin();
            }

            if(params) {
                
                if(typeof   params.leaguesMenuVisible === "boolean") {
                    if(params.leaguesMenuVisible) {
                        __leagueNameContainerElm.parent().show();
                    } else {
                        __leagueNameContainerElm.parent().hide();
                    }
                } else {
                    __leagueNameContainerElm.parent().show();
                }

                if(typeof   params.quickMatchMenuVisible === "boolean") {
                    __quickMatchVisibility = !!params.quickMatchMenuVisible;
                } else {
                    __quickMatchVisibility = true;
                }

            } else {
                __leagueNameContainerElm.parent().show();
                __quickMatchVisibility = true;
            }

            __onlineRequestContainerElm.append(__ONR_AddMoreElm);
            __changeONRAddMoreDataState(true);
            __initUi(function (result) {
                if(result.hasError) {
                    __isUiInit = false;
                    __ONR_AddMoreElm.remove();
                } else {

                    if (params && params.gameId) {
                        if(params.defaultLeague) {
                            var defaultLeagueId = __gamesInfo[params.gameId].defaultLeagueId;
                            if(defaultLeagueId !== __currentLeagueId) {
                                __setCurrentGameShow(params.gameId,defaultLeagueId,true,function () {
                                    __ONR_AddMoreElm.remove();
                                },null,params.gameSelected,params.leagueSelected);
                                __isUiInit = true;
                            } else {
                                __ONR_AddMoreElm.remove();
                            }
                        } else if((__currentLeagueId !== params.leagueId)) {

                            __setCurrentGameShow(params.gameId,params.leagueId,typeof params.leagueId != "undefined",function () {
                                __ONR_AddMoreElm.remove();
                            },params.gameSelected,params.leagueSelected);
                        } else {
                            __ONR_AddMoreElm.remove();
                        }
                    } else {
                        if (!__isUiInit) {
                            var allGameIds = Object.keys(__gamesInfo);
                            if (allGameIds.length > 0) {
                                __currentGameId = allGameIds[0];
                                __setCurrentGameShow(__currentGameId,null,null,function () {
                                    // __ONR_AddMoreElm.remove();
                                });

                            } else {
                                __ONR_AddMoreElm.remove();
                            }
                            __isUiInit = true;
                        } else {
                            __ONR_AddMoreElm.remove();
                        }
                    }
                }
            });
        }


        if(__animate) {
            setTimeout(function () {
                $("#TIS_onlineUser_container")
                    .css({
                        "transform": "translateX(0)",
                        "-webkit-transform": "translateX(0)"
                    });
            },1);
        } else {
            $("#TIS_onlineUser_container").show();
        }

        if(params && typeof params.onHide == "function") {
            __onHideCallback = params.onHide;
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
            $("#TIS_onlineUser_container")
                .css({
                    "transform": "translateX(calc(100%))",
                    "-webkit-transform": "translateX(calc(100%))"
                });
        } else {
            $("#TIS_onlineUser_container").hide();
        }
        if(typeof __onHideCallback === "function" ) {
            __onHideCallback();
            __onHideCallback = undefined;
        }

        return __self;
    };

    __self.onSubscribeLeague = function (data) {
        if (__currentGameId == data.gameId) {
            __updateLeagueMenu({
                gameId : __currentGameId
            });
        }
    };

    __self.onLogout = function () {
        __onlineRequestContainerElm.empty();
        $("#TIS_onlineUser_noLoginContainer").show();
        $("#TIS_onlineUser_loginContainer").hide();
        __isUiInit = false;
        __isLogin = true;
        __ONR_CurrentOffset = 0;
        __activeMatchRequest = {};
        __leaguesData = {};
        __lastSearchTime = undefined;
        __gamesInfo = undefined;
        __currentGameId = undefined;
        __ONR_isUpdating = false;
        __ONR_isScrollInit = false;
        __ONR_hasNext = false;
        __OFR_CurrentOffset = 0;
        __OFR_isUpdating = false;
        __OFR_isScrollInit = false;
        __OFR_hasNext = false;
        __changeQuickMatchState(false);
    };

    __self.onLogin = function() {
        __isLogin = true;
        $("#TIS_onlineUser_noLoginContainer").hide();
        $("#TIS_onlineUser_loginContainer").show();
    };

    __self.backButton = function () {
        if (__visibility) {
            __self.hide();
            return true;
        }
        return false;
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

    __init();
};