/**
 * @class TableUI
 * @module ServiceUI
 * @submodule ServiceUI
 *
 * */
TIS.TableUI = function (options) {

    var __self = this,
        __parent = options.parent,
        __dic = options.dictionary,
        __lang = options.language,
        __globalConfig = options.config,
        __ownConfig = __globalConfig && __globalConfig.tableUI,
        __animate = false,
        __leagueNameContainerElm,
        __leagueLengthContainerElm,
        __filterContainerElm,
        __currentGameId,
        __currentLeagueId,
        __$share,
        __gamesInfo,
        __isUiInit = false,
        __isApp = TIS.Util.isApp(),
        __tableContainerElm,
        __onHideCallback,
        __leaguesData = {},
        __tableData = {},
        __lastPopover,
        __$loading,
        __$container,
        __$tBodyContainer,
        __$zoomContainer,
        __loadingColor = (options.config && options.config.loadingColor) || "#FA8D2E",
        __BtnColor = (options.config && options.config.buttonBackgroundColor) || "white",
        __visibility = false;

    var __init = function () {
            if(__ownConfig && typeof __ownConfig.animate === "boolean") {
                __animate = __ownConfig.animate;
            } else if(__globalConfig && typeof __globalConfig.animate === "boolean") {
                __animate = __globalConfig.animate;
            }

            __$loading = $(
                "<div style='cursor:pointer;text-align: center;color: "+__loadingColor+";height: 2em;margin-top: 15px;display: inline-block;width:100%'>\
                    <i class='tis tis-spin4 tis-spin tis-2x'></i>\
                </div>");

            __initView();
            __leagueNameContainerElm = $("#TIS_table_leagueName_container");
            __leagueLengthContainerElm = $("#TIS_table_leagueLength_container");
            __tableContainerElm = $("#TIS_table_dataContainer");
            __filterContainerElm = $("#TIS_table_filterContainer");
            __$share = $("#TIS_table_share");
            __$tBodyContainer = __$container.find("#TIS_table_body");
            __$zoomContainer = __$container.find("#TIS_table_zoomContainer");

            __$loading.appendTo(__tableContainerElm);
            __initEvent();
        },

        __onWindowResize = function () {
            var height = $(window).height() - $("#TIS_table_mainPage_header").height();


            __tableContainerElm.css({
                height: height + "px"
            });

            __leagueNameContainerElm.css({
                "max-height": height + "px"
            });
        },

        __updateLeagueTable = function () {
            if (!__parent.getUserData().id) {
                return;
            }
            __$share.hide();
            __removePopover();

            var gameId = __currentGameId;

            var leagueDataElm = __leagueNameContainerElm.closest('div')
                .find('span[leagueId]');

            var leagueId = leagueDataElm.attr("leagueId");


            var type = leagueDataElm.attr("type");

            __$loading.appendTo(__tableContainerElm);
            __$zoomContainer.hide();
            if (leagueId) {

                $("#TIS_table_header").empty();
                __$tBodyContainer.empty();

                __tableContainerElm.css({
                    height: "100%"
                });

                var requestData = {leagueId: leagueId};

                var leagueRangeElm = __leagueLengthContainerElm.closest("div[data-type='TIS-menu']");

                if (__leaguesData[leagueId].type == 0) {
                    leagueRangeElm.show();
                    requestData.rangeType = __leagueLengthContainerElm.closest('div')
                        .find('span[TisDropText]').attr("value");
                } else {
                    leagueRangeElm.hide();
                }
                leagueRangeElm.find("button").prop("disabled", true);

                __resetTableZom();
                __parent.getTableData(requestData, function (result) {
                    leagueRangeElm.find("button").prop("disabled", false);
                    __$loading.remove();
                    if (!result.hasError) {
                        __tableData[leagueId] = result.result;
                        __insertTableData(result.result, type, leagueId);
                        __onWindowResize();
                    } else {
                        __parent.alert(result.errorMessage);
                    }
                });

            }

        },

        __updateLeagueMenu = function (params) {
            var gameId = params.gameId,
                currentLeagueId = params.currentLeagueId,
                callback = params.callback,
                nextOffset = params.nextOffset,
                loadingElm = $("#TIS_table_leagueName_loading"),
                moreLeagueElm,
                isForceView = params.ifForceView;// for leagues that set from onSHow(league ui call this)


            loadingElm.show();

            var requestData = {
                gameId: gameId
            };

            if (isForceView) {
                requestData.leagueId = currentLeagueId;
            } else {
                requestData.userState = 1;
                if (typeof  nextOffset == "number") {
                    requestData.offset = nextOffset;
                } else {
                    __leagueNameContainerElm.find('*:not("#TIS_onlineUser_leagueName_loading")').remove();
                }
            }

            moreLeagueElm = __leagueNameContainerElm.find("li[TIS-Data=TIS-moreData]");

            __parent.getLeaguesInfo(requestData, function (result) {

                callback && callback();

                if (typeof  nextOffset != "number" && !isForceView) {
                    __leagueNameContainerElm.empty()
                }

                if (result.hasError) {
                    __parent.alert(result.errorMessage);
                    __isUiInit = false;
                } else {
                    loadingElm.hide();
                    var leaguesData = result.result.leagues,
                        leagueData,
                        leagueId;

                    for (var i = 0; i < leaguesData.length; i++) {
                        leagueData = leaguesData[i];
                        leagueId = leagueData.id;
                        __leaguesData[leagueId] = leagueData;

                        if (isForceView && leagueId == currentLeagueId && __leagueNameContainerElm.find('a[leagueId=' + currentLeagueId + ']').length > 0) {
                            __setCurrentLeagueShow(leagueData, leagueData.type);
                            return;
                        }

                        (function (leagueId) {

                            if (!leagueData.isMember && !leagueData.isFollower) {
                                return;
                            }

                            var isMultiPlayer = (leagueData.games[0].playerNumbersType >= 2);

                            var imageUrl = null;
                            if(typeof leagueData.imageUrl === "string") {
                                imageUrl = leagueData.imageUrl
                            } else if(typeof leagueData.image === "object" && leagueData.image!== null) {
                                imageUrl = __parent.getService().generateImageSrc(leagueData.image)
                            }

                            var content = "\
                                <li isMultiPlayer='" + isMultiPlayer + "' leagueId ='" + leagueData.id + "' style='border-radius: 100px;height: 40px'>\
                                    <a href=''  isMultiPlayer='" + isMultiPlayer + "' leagueId ='" + leagueData.id + "' >\
                                        <img src='" + imageUrl + "' style='height:30px;float: right'>\
                                        " + leagueData.name + "\
                                    </a>\
                                </li>\
                            ";

                            var leagueElm;
                            if (moreLeagueElm.length > 0) {
                                leagueElm = $(content).insertBefore(moreLeagueElm);
                            } else {
                                leagueElm = $(content).appendTo(__leagueNameContainerElm);
                            }

                            leagueElm.find("a").click(function (e) {
                                __setCurrentLeagueShow(__leaguesData[leagueId], __leaguesData[leagueId].type, true);
                                e.preventDefault();
                            });

                        })(leagueId);

                    }

                    var defaultLeagueId = __gamesInfo[gameId].defaultLeagueId;
                    var selectedLeagueId = (typeof currentLeagueId != "undefined" && currentLeagueId != null) ? currentLeagueId : defaultLeagueId;

                    //selectedLeagueId = 126;
                    if (selectedLeagueId) {
                        if (!__leaguesData[selectedLeagueId]) {
                            selectedLeagueId = leaguesData[0].id;
                        }

                        __setCurrentLeagueShow(__leaguesData[selectedLeagueId], __leaguesData[selectedLeagueId].type, params.menuSelected);
                    }

                    if (result.result.hasNext) {
                        if (moreLeagueElm.length > 0) {
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
                                    .addClass("tis-spin4 tis-spin");

                                moreLeagueElm.css("pointer-events", "none");

                                __updateLeagueMenu({
                                    gameId: gameId,
                                    callback: function () {
                                        aElm
                                            .removeClass("tis-spin4 tis-spin")
                                            .addClass("tis-plus");

                                        moreLeagueElm.css("pointer-events", "");
                                    },
                                    nextOffset: result.result.nextOffset
                                });

                                return false;

                            });
                    } else {
                        if (moreLeagueElm.length > 0) {
                            moreLeagueElm.remove();
                        }
                    }

                }
            });
        },

        __removePopover = function () {
            if (__lastPopover) {
                // __lastPopover.popover('destroy');
                __lastPopover.remove();
                __lastPopover = undefined;
            }
        },

        __zoomInTable = function (factor, pos) {
            var currentZoom = __$tBodyContainer.css("zoom") || __$tBodyContainer.css("-webkit-zoom") || __$tBodyContainer.css("-moz-zoom");
            var zoom = parseFloat(currentZoom) + (factor || 0.1);

            if (zoom > 3) {
                zoom = 3;
            }

            __$tBodyContainer.css({
                zoom: zoom,
                "-webkit-zoom": zoom,
                "-moz-zoom": zoom
            });

            // if(!pos) {
            //     pos = {
            //         x:0,
            //         y:0
            //     }
            // }
            // var matrixRegex = /matrix\((-?\d*\.?\d+),\s*0,\s*0,\s*(-?\d*\.?\d+),\s*0,\s*0\)/,
            //     matches = __$tBodyContainer.css('-webkit-transform').match(matrixRegex);
            //
            // var zoom = parseFloat((matches && matches[1]) || 1) + (factor  ||0.1);
            // if(zoom>3) {
            //     zoom = 3;
            // }
            //
            // __$tBodyContainer.css('-webkit-transform', 'scale(' + zoom + ')' + 'translate(' + pos.x + 'px, ' + pos.y + 'px' + ')')
        },

        __zoomOutTable = function (factor, pos) {
            var currentZoom = __$tBodyContainer.css("zoom") || __$tBodyContainer.css("-webkit-zoom") || __$tBodyContainer.css("-moz-zoom");

            var zoom = parseFloat(currentZoom) - (factor || 0.1);
            if (zoom < 0.1) {
                zoom = 0.1;
            }
            __$tBodyContainer.css({
                zoom: zoom,
                "-webkit-zoom": zoom,
                "-moz-zoom": zoom
            });
        },

        __resetTableZom = function () {
            var zoom = 1;
            __$tBodyContainer.css({
                zoom: zoom,
                "-webkit-zoom": zoom,
                "-moz-zoom": zoom
            });
        },

        __insertTableData = function (data, leagueType, leagueId) {
            if (leagueType == 0) {
                __$zoomContainer.hide();
                var headerData = data.headerData;
                var usersData = data.usersData;

                var header = $("#TIS_table_header"),
                    i;

                header.empty();
                __$tBodyContainer.empty();

                var leagueData = __leaguesData[leagueId];
                if (leagueData.playerNumberType != 1) {
                    headerData.unshift(__dic.TABLE_MATCH_COUNT[__lang]);
                }

                headerData.unshift(__dic.NAME[__lang]);
                headerData.unshift(__dic.TABLE_RANK[__lang]);
                // headerData.unshift("تصویر");
                headerData.unshift("");

                for (i = 0; i < headerData.length; i++) {
                    $("<th>")
                        .appendTo(header)
                        .attr({
                            "data-field": "rank",
                            "data-align": "center",
                            "data-sortable": "true"
                        })
                        .css({"white-space": "nowrap"})
                        .addClass("text-center")
                        .html(headerData[i]);
                }

                var hasUser = false;
                for (i = 0; i < usersData.length; i++) {
                    var userData = usersData[i];
                    // if current user rank is not in sequence
                    if (usersData[i - 1]) {
                        if (userData.rank - usersData[i - 1].rank > 1) {
                            var newTr = $("<tr>").appendTo(__$tBodyContainer);
                            $("<td>").appendTo(newTr).attr({"colspan": headerData.length}).html(".<br>.<br>.");
                        }
                    }
                    var tr = $("<tr class='TIS-tableUI-userData' userId='"+userData.userId+"'>").appendTo(__$tBodyContainer);

                    var tdCss = {
                        "vertical-align": "middle",
                        "white-space": "nowrap"
                    };


                    var imageUrl = null;
                    if(typeof userData.imageUrl === "string") {
                        imageUrl = userData.imageUrl
                    } else if(typeof userData.image === "object" && userData.image!== null) {
                        imageUrl = __parent.getService().generateImageSrc(userData.image)
                    }

                    var image;
                    if(imageUrl && imageUrl.length > 1) {
                        image = "<img src='" + imageUrl + "' style='width: 50px;border-radius: 100%'>";
                    } else {
                        image = "<div style='display:inline-block;width: 50px;height: 50px;border-radius: 100%;border: 1px solid grey'><i class='tis tis-user-1 tis-2x' style='color : grey;padding-top: 8px;font-size: 32px'></i></div>"
                    }

                    $("<td>").appendTo(tr).css(tdCss).html(image);
                    $("<td>").appendTo(tr).css(tdCss).html(userData.rank);
                    $("<td>").appendTo(tr).css(tdCss).html(userData.nickName);
                    if (leagueData.playerNumberType != 1) {
                        $("<td>").appendTo(tr).css(tdCss).html(userData.matchCount);
                    }


                    for (var j = 0; j < userData.scores.length; j++) {
                        $("<td>").appendTo(tr).css(tdCss).html(userData.scores[j].value).css("direction", "ltr");
                    }

                    if (userData.userId == __parent.getUserData().id) {
                        hasUser = true;
                        tr.find("td").addClass("own");
                    }
                }

                if (hasUser && __isApp) {
                    __$share.show();
                }

            } else if (leagueType == 1) {

                __$zoomContainer.show();
                __$share.hide();
                var customData = {
                    teams: [
                        //[{ name : "علی"    ,flag:"۲۲۳۲"}  ,{name : "حسین" ,flag:"۳۳"}],
                        //[{ name : "علی"    ,flag:"۲۲۳۲"}  ,{name : "رضا"  ,flag:"۳۳"}],
                        //[{ name : "محسن"   ,flag:"۲۲۳۲"}  ,{name : "محممد",flag:"۳۳"}],
                        //[{ name : "سعید"   ,flag:"۲۲۳۲"}  ,{name : "رحیم" ,flag:"۳۳"}]
                    ],
                    results: [
                        //[[1, 2], [4, 3],[1, 2], [3, 4]],
                        //[[1, 2], [3, 4]],
                        //[[1, 2]]
                    ]
                };
                var roundNumber = 0;

                //console.log("aaaa",data.rounds);

                for (var roundId in data.rounds) {
                    var roundData = data.rounds[roundId];

                    customData.results.push([]);

                    for (var matchNodeId  in roundData) {
                        if (roundNumber == 0) {
                            customData.teams.push([
                                {
                                    name: roundData[matchNodeId].user1.name,
                                    image: roundData[matchNodeId].user1.image,
                                    imageUrl: roundData[matchNodeId].user1.imageUrl,
                                    id: roundData[matchNodeId].user1.id
                                },
                                {
                                    name: roundData[matchNodeId].user2.name,
                                    image: roundData[matchNodeId].user2.image,
                                    imageUrl: roundData[matchNodeId].user2.imageUrl,
                                    id: roundData[matchNodeId].user2.id
                                }
                            ]);
                        }

                        var user1Score = (roundData[matchNodeId].user1.isWinner) ? 1 : 0;
                        var user2Score = (roundData[matchNodeId].user2.isWinner) ? 1 : 0;

                        var user1PrevIndex = roundData[matchNodeId].user1.prevIndex;
                        var user2PrevIndex = roundData[matchNodeId].user2.prevIndex;

                        //console.log("ccccc",roundData[matchNodeId].user1.name,user1Score,user1PrevIndex,roundData[matchNodeId].user2.name,user2Score,user2PrevIndex);
                        if (user1PrevIndex && user2PrevIndex) {
                            if (user1PrevIndex < user2PrevIndex) {
                                customData.results[roundNumber].push([user1Score, user2Score]);
                            } else {
                                customData.results[roundNumber].push([user2Score, user1Score]);
                            }
                        } else {
                            customData.results[roundNumber].push([user1Score, user2Score]);
                        }


                    }
                    roundNumber += 1;
                }

                function edit_fn(container, data, doneCb) {
                    //var input = $('<input type="text">');
                    //input.val(data.name);
                    //container.html(input);
                    //input.focus();
                    //input.blur(function() { doneCb({flag: data.flag, name: input.val()}) })
                }

                function render_fn(container, data, score) {
                    //console.log("RRRRR",data, score);
                    //if (!data.flag || !data.name)
                    //    return;

                    var spn;

                    var imageUrl = null;
                    if(typeof data.imageUrl === "string") {
                        imageUrl = data.imageUrl
                    } else if(typeof data.image === "object" && data.image!== null) {
                        imageUrl = __parent.getService().generateImageSrc(data.image)
                    }

                    if (imageUrl) {
                        spn = "<div class='col-lg-2 col-md-2 col-sm-2 col-xs-2' style='padding-left:0;padding-right: 0;height: 100%'><img class='img-responsive img-circle' src='" + imageUrl + "' ></div>";
                    } else {
                        spn = "<div class='col-lg-2 col-md-2 col-sm-2 col-xs-2' style='padding-left:0;padding-right: 0'><i class='tis tis-user'></i></div>";
                    }
                    var name = "-----";

                    if (data.name != undefined) {
                        name = data.name;
                    }
                    container
                        .attr("data-userId", data.id)
                        .append(spn)
                        .append("<div class='col-lg-10 col-md-10 col-sm-10 col-xs-10' data-userId =" + data.id + " style='padding-left:0;padding-right: 0;overflow-x: hidden'><span style='color: #000000'>" + name + "</span></div>")
                        .on("click", function (e) {
                            __removePopover();

                            var imageUrl = null;
                            if(typeof data.imageUrl === "string") {
                                imageUrl = data.imageUrl
                            } else if(typeof data.image === "object" && data.image!== null) {
                                imageUrl = __parent.getService().generateImageSrc(data.image)
                            }

                            if (imageUrl) {
                                if (container.find(".userImage").length == 0) {
                                    __$tBodyContainer.find(".userImage").remove();
                                    __lastPopover = $("<div class='userImage' style='position: absolute;left:70px;top: -70px;z-index: 10'><div style='width:100px;height: 100px;position: fixed' ><img class='img-responsive img-circle' src='" + imageUrl + "'></div></div>");
                                    __lastPopover.on("click", function (e) {
                                        __lastPopover.remove();
                                        __lastPopover = undefined;
                                        e.preventDefault();
                                        e.stopPropagation();
                                    });
                                    container.append(__lastPopover);

                                    e.preventDefault();
                                    e.stopPropagation();
                                }
                            }
                        });

                }


                $(function () {
                    __$tBodyContainer
                        .bracket({
                            init: customData,
                            skipConsolationRound: true,
                            dir: "rl",
                            label: {
                                first: "اول",
                                second: "دوم"
                            },
                            decorator: {
                                edit: edit_fn,
                                render: render_fn
                            }
                        });
                });
            }


            __tableContainerElm.scrollLeft(function () {
                return this.scrollWidth;
            });

        },

        __initView = function () {
            var background = "#1cb7d4",
                columnHeaderBackgroundColor = "#089CE2";

            if (__ownConfig) {
                if (__ownConfig.backgroundUrl) {
                    background = "url(" + __ownConfig.backgroundUrl + ")";
                } else if (__ownConfig.backgroundColor) {
                    background = __ownConfig.backgroundColor;
                }

                if (__ownConfig.tableHeaderBackgroundColor) {
                    columnHeaderBackgroundColor = __ownConfig.tableHeaderBackgroundColor;
                }
            }

            var style = '';

            if(__animate) {
                style = 'transform : translateX(calc(100%));-webkit-transform : translateX(calc(100%))';
            } else {
                style = 'display : none';
            }

            style += (';background:' + background + ';');

            var topScoreView = "\
        <div  id='TIS_table_container' style='"+style+"'>\
            <div id='TIS_table_mainPage' style='height:100%'>\
                <div id='TIS_table_mainPage_header' style='color:white;width:100%;z-index:1;padding-top:10px;font-weight: bold'>\
                     <div  class='row' >\
                         <span id='TIS_table_close' class='tis tis-close tis-2x TIS-pointer'\
                                style='float: right;margin-right: 25px;color:" + __BtnColor + ";font-weight: bold'></span>\
                         <span id='TIS_table_update' class='tis tis-refresh tis-2x TIS-pointer' style='float: left;margin-left: 25px;color:" + __BtnColor + ";font-weight: bold;'></span>\
                         <span id='TIS_table_share' class='tis tis-share tis-2x TIS-pointer' style='float: left;margin-left: 25px;display:none;color:" + __BtnColor + ";font-weight: bold;'></span>\
                         <div class='panel-title' style='text-align:center;font-weight: bold;font-size: x-large;'>" + __dic.TABLE[__lang] + "</div>\
                     </div>\
                     <div class='row' style='padding-top:15px'>\
                        <div data-type='TIS-menu'>\
                             <div class='input-group-btn'  style='padding-right:30px;padding-left:30px '>\
                                 <button type='button' class='btn btn-default dropdown-toggle input-lg' data-toggle='dropdown' style='width: 100%;height:50px;display:block;border-radius: 10px;'>\
                                    <div class='row'>\
                                        <div class='col-lg-3 col-md-3 col-sm-3 col-xs-3'><img TIS-DATA='IMG' style='height:38px;float:right;display:none;border-radius: 5px;'></div>\
                                        <div class='col-lg-6 col-md-6 col-sm-6 col-xs-6'><span TisDropText='game' style='float:right;padding:10px'>" + __dic.SELECT_LEAGUE[__lang] + "</span></div>\
                                        <div class='col-lg-3 col-md-3 col-sm-3 col-xs-3'><span class='tis tis-2x  tis-down-dir' style='float:left;padding-top:5px'></span></div>\
                                    </div>\
                                 </button>\
                                 <ul id='TIS_table_leagueName_container' class='dropdown-menu TIS_scroll' role='menu' style='width: 100%;overflow-y: auto;z-index: 1051;'>\
                                     <li id='TIS_table_leagueName_loading' class='alert alert-success tis-spin4'  style='display:none;text-align: center' role='info'>\
                                         " + __dic.UPDATING[__lang] + "\
                                     </li>\
                                 </ul>\
                             </div>\
                        </div>\
                        <div data-type='TIS-menu' style='padding-top:15px;display:none'>\
                             <div class='input-group-btn'  style='padding-right:30px;padding-left:30px '>\
                                 <button type='button' class='btn btn-default dropdown-toggle input-lg' data-toggle='dropdown' style='width: 100%;display:block;border-radius: 10px;'>\
                                     <span TisDropText='leagueLength' style='float:right;padding:5px' value='1'>" + __dic.WEEK_1[__lang] + "</span> \
                                     <span class='tis tis-2x tis-down-dir' style='float:left;padding-top:5px'></span>\
                                 </button>\
                                 <ul id='TIS_table_leagueLength_container' class='dropdown-menu' role='menu' style='width: 100%;overflow-y: auto;'>\
                                     <li role='info' style='height:40px'><a value='1' style='text-align: right;padding-top:10px'>" + __dic.WEEK_1[__lang] + "</a></li>\
                                     <li role='info' style='height:40px'><a value='3' style='text-align: right;padding-top:10px'>" + __dic.TOTAL[__lang] + "</a></li>\
                                 </ul>\
                             </div>\
                        </div>\
                     </div>\
                </div>\
                <div style='height:100%;background-color:white;margin-top: 15px'>\
                    <div id='TIS_table_dataContainer' class='TIS_scroll' style='overflow: auto;direction: ltr; text-align: center;'>\
                        <div id='TIS_table_zoomContainer' style='position: fixed;left:20px;z-index:11;display:none'>\
                            <div id='TIS_table_zoomIn' style='width: 2.5em;height: 2.5em;background-color: white;border-radius: 100%;display: inline-block;margin-left:20px;cursor:pointer'>\
                                <i class='tis tis-plus-circled' style='font-size: 3em;color: rgb(28, 183, 212);'></i>\
                            </div>\
                            <div id='TIS_table_zoomOut' style='width: 2.5em;height: 2.5em;background-color: white;border-radius: 100%;display: inline-block;cursor:pointer'>\
                                <i class='tis tis-minus-circled' style='font-size: 3em;color: rgb(234, 109, 19);'></i>\
                            </div>\
                        </div>\
                        <table class='table table-striped text-center' data-height='299' data-sort-name='name' data-sort-order='desc' >\
                            <thead>\
                                <tr id='TIS_table_header' style='background-color: " + columnHeaderBackgroundColor + ";color: white' >\
                                </tr>\
                            </thead>\
                            <tbody id='TIS_table_body' >\
                            </tbody>\
                        </table>\
                    </div>\
                </div>\
                </div>\
            </div>\
        </div>";

            __$container = $(topScoreView)
                .appendTo(document.body);
        },

        __initUi = function (callback) {
            if (!__isUiInit) {
                $("#TIS_table_gameName_loading").show();
                __parent.getGamesInfo({registerGame: true}, function (result) {
                    $("#TIS_table_gameName_loading").hide();
                    if (result.hasError) {
                        __parent.alert(result.errorMessage);
                        //__isUiInit = false;
                    } else {
                        __leagueNameContainerElm.empty();

                        __gamesInfo = {};
                        for (var i = 0; i < result.result.games.length; i++) {
                            var game = result.result.games[i];
                            __gamesInfo[game.id] = game;
                        }
                    }
                    if (callback) {
                        callback(result);
                    }

                });

            } else {
                callback({
                    hasError: false
                });
            }
        },

        __setCurrentLeagueShow = function (leagueData, type, menuSelected) {

            var leagueName = leagueData.name;
            __currentLeagueId = leagueData.id;

            var $container = __leagueNameContainerElm.closest('div');
            var $elem = $container
                .find('span[TisDropText]')
                .attr({
                    leagueId: __currentLeagueId,
                    type: type
                });

            if (menuSelected) {
                $elem.text(leagueName);
            } else {
                $elem.text(__dic.SELECT_LEAGUE[__lang]);
            }
            var $league = __leagueNameContainerElm.find("li");

            var $img = $container.find("img[TIS-DATA='IMG']");

            var imageUrl = null;
            if(typeof leagueData.imageUrl === "string") {
                imageUrl = leagueData.imageUrl
            } else if(typeof leagueData.image === "object" && leagueData.image!== null) {
                imageUrl = __parent.getService().generateImageSrc(leagueData.image)
            }

            if (imageUrl) {
                $img.attr("src", imageUrl).show();
            } else {
                $img.hide();
            }

            // if($league.length>1) {
            //     __leagueNameContainerElm.closest(".TIS-matchRequest-leagueContainer").show();
            // }

            $league
                .css({
                    "background-color": "white"
                });
            __leagueNameContainerElm
                .find("li[leagueId=" + __currentLeagueId + "]")
                .css({
                    "background-color": "#12F512"
                });

            __updateLeagueTable();
        },

        __setCurrentGameShow = function (gameId, leagueId, ifForceView, gameSelected, leagueSelected) {
            __currentGameId = gameId;

            __updateLeagueMenu({
                gameId: gameId,
                currentLeagueId: leagueId,
                ifForceView: ifForceView,
                menuSelected: leagueSelected
            });
        },

        __reset = function () {
            __removePopover();
        },

        __initEvent = function () {

            $("#TIS_table_close").on("click", function () {
                __self.hide();
            });

            $("#TIS_table_update").click(function () {
                __updateLeagueTable();
            });

            __$share.click(function () {

                if (__currentLeagueId && __tableData[__currentLeagueId] && __tableData[__currentLeagueId].usersData) {
                    var usersData = __tableData[__currentLeagueId].usersData;

                    var userRankData;
                    for (var i = 0; i < usersData.length; i++) {
                        var user = usersData[i];
                        if (user.userId == __parent.getUserData().id) {
                            userRankData = user;
                            break;
                        }
                    }
                    if (userRankData) {
                        var text = __dic.SHARE_TABLE_DES[__lang];
                        text = text.replace("$league", __leaguesData[__currentLeagueId].name);
                        text = text.replace("$rank", userRankData.rank);
                        text = text.replace("$scoreName", userRankData.scores[0].name);
                        text = text.replace("$scoreValue", userRankData.scores[0].value);
                        text = text.replace("$gameName", __gamesInfo[__currentGameId].name);

                        text += "\n";
                        text += __parent.getService().generateGameCenterLeagueUrl({leagueId: __currentLeagueId});

                        var rangeType = __leagueLengthContainerElm.closest('div').find('span[TisDropText]').attr("value");

                        var tableText = "";
                        if (rangeType == "1" || rangeType == "2") {
                            tableText = __dic.IN_TABLE[__lang];

                            if (rangeType == "1") {
                                tableText += (" " + __dic.WEEK_1[__lang]);
                            } else {
                                tableText += (" " + __dic.MONTH3[__lang]);
                            }
                        }
                        text = text.replace("$tableField", tableText);

                        if (__isApp) {
                            var data = {
                                type: "text/plain",
                                action: TIS.Plugin.ACTION_SEND,
                                extras: {}
                            };
                            data.extras[TIS.Plugin.EXTRA_TEXT] = text;

                            __leagueLengthContainerElm.closest('div')
                                .find('span[TisDropText]').attr("value");

                            TIS.Plugin.startActivity(
                                data,
                                function () {
                                },
                                function () {
                                }
                            );
                        }
                    }
                }
            });

            __leagueLengthContainerElm.find('a').click(function (e) {
                e.preventDefault();
                var concept = $(this).text();
                var value = $(this).attr("value");

                $(this)
                    .closest('div')
                    .find('span[TisDropText]')
                    .attr({
                        value: value
                    })
                    .text(concept);

                __updateLeagueTable();
            });


            __$container.find("#TIS_table_zoomIn").on("click", function () {
                __zoomInTable();
            });

            __$container.find("#TIS_table_zoomOut").on("click", function () {
                __zoomOutTable();
            });

            __tableContainerElm.on("click", function () {
                __removePopover();
            });
            var lastDis = 0,
                centerPos;
            __$container.on("touchstart", function (e) {
                var touches = e.originalEvent.touches;
                if (touches.length > 1) {
                    lastDis = TIS.Util.distance(touches[0].clientX, touches[0].clientY, touches[1].clientX, touches[1].clientY);
                    centerPos = {
                        x: (touches[0].clientX - touches[1].clientX) / 2,
                        y: (touches[0].clientY - touches[1].clientY) / 2
                    }
                }
            });

            __$container.on("touchmove", function (e) {
                var touches = e.originalEvent.touches;
                if (touches.length > 1) {
                    var newDis = TIS.Util.distance(touches[0].clientX, touches[0].clientY, touches[1].clientX, touches[1].clientY);

                    if (Math.abs(lastDis - newDis) > 10) {
                        if (newDis > lastDis) {
                            __zoomInTable(0.05, centerPos);
                        } else {
                            __zoomOutTable(0.05, centerPos);
                        }

                        lastDis = newDis;
                    }

                }
            });


            __$container.on("click",".TIS-tableUI-userData", function () {

                if(__leaguesData[__currentLeagueId] && __leaguesData[__currentLeagueId].isMember) {
                    __parent.showResultUI({
                        leagueId: __currentLeagueId,
                        userId: $(this).attr("userId")
                    });
                }
            });

            // __$container.on("touchend", function (e) {
            //     console.log("touchend",e.originalEvent.touches);
            // });
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
     * @param {object} params
     *      @param {Number} params.gameId
     *      @param {Boolean} params.gameSelected
     *      @param {Boolean} params.leagueSelected
     *
     * */
    __self.show = function (params) {
        __visibility = true;

        if (__parent.getUserData().id) {
            var isForceLeagueView = params && params.leagueId != undefined;
            __initUi(function (result) {
                if (params && params.gameId) {
                    if (__currentGameId != params.gameId ||
                        (__currentLeagueId != params.leagueId)) {
                        __setCurrentGameShow(params.gameId, params.leagueId, params.leagueId, typeof params.leagueId != "undefined", params.gameSelected, params.leagueSelected);
                    }

                    if (typeof params.onHide == "function") {
                        __onHideCallback = params.onHide;
                    }
                } else {
                    if (result.hasError) {
                        __isUiInit = false;
                    } else {
                        if (!__isUiInit) {
                            var allGameIds = Object.keys(__gamesInfo);
                            if (allGameIds.length) {
                                __currentGameId = allGameIds[0];
                                __setCurrentGameShow(__currentGameId);
                            }
                        }
                        if (!isForceLeagueView) {
                            __isUiInit = true;
                        }
                    }
                }
            });
        } else {
            __parent.alert(__dic.YOUARENOTLOGIN[__lang]);
        }

        // $("#TIS_table_container").show();
        if(__animate) {
            setTimeout(function () {
                $("#TIS_table_container")
                    .css({
                        "transform": "translateX(0)",
                        "-webkit-transform": "translateX(0)"
                    });
            },1);
        } else {
            $("#TIS_table_container").show();
        }
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
    __self.hide = function (params) {
        __visibility = false;
        if(__animate) {
            $("#TIS_table_container")
                .css({
                    "transform": "translateX(calc(100%))",
                    "-webkit-transform": "translateX(calc(100%))"
                });
        } else {
            $("#TIS_table_container").hide();
        }

        if (typeof __onHideCallback == "function") {
            __onHideCallback();
            __onHideCallback = undefined;
        }
        __reset();

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

    __self.backButton = function () {
        if (__visibility) {
            __self.hide();
            return true;
        }
        return false;
    };

    __self.onSubscribeLeague = function (data) {
        var currentGameId = $("#TIS_league_gameName_container").closest('div')
            .find('span[gameId]').attr("gameId");

        if (__isUiInit && currentGameId != undefined && currentGameId == data.gameId) {
            __updateLeagueMenu({gameId: data.gameId});
        }
    };

    __self.onLogout = function () {
        $("#TIS_table_header").empty();
        $("#TIS_table_body").empty();

        __isUiInit = false;
        __leaguesData = {};
        __currentGameId = undefined;
        __gamesInfo = undefined;
    };


    __init();
};
