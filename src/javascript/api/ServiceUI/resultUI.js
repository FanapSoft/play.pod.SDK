/**
 * @class TableUI
 * @module ServiceUI
 * @submodule ServiceUI
 *
 * */
TIS.ResultUI = function (options) {

    var __self = this,
        __parent = options.parent,
        __dic = options.dictionary,
        __lang = options.language,
        __globalConfig = options.config,
        __ownConfig = __globalConfig && __globalConfig.resultUI,
        __animate = false,
        __$parentContainer,
        __$resultContainer,
        __$headerContainer,
        __$footerContainer,__$moreContainer,
        __$headerTitle,
        __visibility = false,
        __isScrollInit = false,
        __isLoading = false,
        __addMoreDataElm,
        __currentLeagueId,
        __currentUserId,
        __currentMatchesResultOffset = 0,
        __serverTime,
        __matchStatus = {
            1 : "شروع نشده",
            2 : "در حال بارگزاری",
            3 : "در حال اجرا",
            4 : "متوقف",
            5 : "تمام شده",
            6 : "لغو شده",
            7 : "نا معتبر",
        },
        __lastHeaderLeagueName,
        __lastSearchPopover,
        __loadingColor = (__globalConfig && __globalConfig.loadingColor) || "#FA8D2E",
        __BtnColor = (__globalConfig && __globalConfig.buttonBackgroundColor) || "#1cb7d4";


    var __init = function () {

            if(__ownConfig && typeof __ownConfig.animate === "boolean") {
                __animate = __ownConfig.animate;
            }
            else if(__globalConfig && typeof __globalConfig.animate === "boolean") {
                __animate = __globalConfig.animate;
            }

            __initView();

            __$resultContainer = __$parentContainer.find("#TIS_resultUI_bodyContainer");
            __$headerContainer = __$parentContainer.find("#TIS_resultUI_header");
            __$footerContainer = __$parentContainer.find("#TIS_resultUI_footer");
            __$moreContainer = __$parentContainer.find("#TIS_resultUI_orderBy_listContainer");
            __$headerTitle = __$parentContainer.find(".panel-title span[TIS-DATA='NAME']");

            __initEvent();

            __initAddMoreDataElm();
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
                                    style='cursor:pointer;text-align: center;color: "+__loadingColor+";height: 2em;margin-top: 20px' >\
                                    <i class='tis tis-2x tis-down-dir'></i>\
                                </div>";

            __addMoreDataElm = $(morDataContent);

            __$resultContainer.on("click", ".moreData", function () {
                var isLoading = $(this).hasClass("tis-spin");

                if (!isLoading) {
                    __moreItemValueClickHandler();
                }

            });
        },

        __initScrollEvent = function () {
            if (!__isScrollInit) {
                __isScrollInit = true;
                __$resultContainer
                    .off("scroll")
                    .on('scroll', function () {
                        if (this.scrollHeight - 20 <= $(this).scrollTop() + this.clientHeight && __visibility) {
                            $(this).off('scroll');
                            __isScrollInit = false;
                            __moreItemValueClickHandler();

                        }
                    });
            }
        },

        __getMatchWinner = function (usersData) {

            var scoresLength = usersData[0].scores.length;
            var winnerUserId = null;
            for (var i = 0; i < scoresLength; i++) {

                var topScore = null,
                    winId = null;

                for (var j = 0; j < usersData.length; j++) {
                    var val = usersData[j].scores[i].value;

                    if (topScore === null) {
                        topScore = val;
                        winId = usersData[j].info.id;
                    } else {
                        if (val > topScore) {
                            topScore = val;
                            winId = usersData[j].info.id;
                        } else if (val === topScore) {
                            topScore = null;
                            winId = null;
                            break;
                        }
                    }
                }

                if (winId !== null) {
                    winnerUserId = winId;
                    break;
                }
            }

            return winnerUserId;

        },

        __initView = function () {

            // var tab = "\
            //     <ul class='nav nav-tabs' role='tablist'>\
            //         <li role='presentation' class='active' style='box-shadow: none'><a href='#TIS_resultUI_edit' aria-controls='home' role='tab'data-toggle='tab' style=' background-color: #faf4e3;white-space: nowrap;'>ویرایش پروفایل</a></li>\
            //         <li role='presentation'  style='box-shadow: none'><a href='#TIS_resultUI_changePass' aria-controls='profile' role='tab' data-toggle='tab' style='background-color: #faf4e3;white-space: nowrap;'>تغییر رمز عبور</a></li>\
            //     </ul>\
            //     <div class='tab-content'>\
            //         <div role='tabpanel' class='tab-pane active' id='TIS_resultUI_edit'>\
            //             <div id='TIS_resultUI_edit_container' class='panel-body'>\</div>\
            //         </div>\
            //         <div role='tabpanel' class='tab-pane' id='TIS_resultUI_changePass'>\
            //             <div id='TIS_resultUI_changePass_container' class='panel-body'>\
            //             </div>\
            //         </div>\
            //     </div>\
            //     ";

            var style = '';

            if(__animate) {
                style = 'transform : translateX(calc(100%));-webkit-transform : translateX(calc(100%))';
            } else {
                style = 'display : none';
            }


            var topScoreView = "\
                <div  id='TIS_resultUI_container' style='"+style+"'>\
                    <div id='TIS_resultUI_header' style='text-align: center;margin: 10px 0' >\
                        <div class='panel-title' style='font-weight: bold;'>\
                            <div id='TIS_resultUI_header_main' style='height: 34px'>\
                                <i id='TIS_resultUI_close' class='tis tis-close tis-2x TIS-pointer' style='float: right;margin-right:10px;color:" + __BtnColor + ";font-weight: bold'></i>\
                                <span TIS-DATA='NAME'>" + __dic.RESULTS[__lang] + "</span>\
                                <i id='TIS_resultUI_searchBtn' class='tis tis-search tis-2x TIS-pointer' style='float: left;margin-left:10px;color:" + __BtnColor + ";font-weight: bold'></i>\
                            </div>\
                            <div id='TIS_resultUI_header_searchFrame' style='display: none'>\
                                 <div class='input-group' style='padding-right: 5px;padding-left: 5px'>\
                                    <span id='TIS_resultUI_header_searchFrame_close' class='input-group-btn'>\
                                        <button class='btn btn-default' type='button'><span class='tis tis-close TIS-pointer'></span></button>\
                                    </span>\
                                    <input id='TIS_resultUI_header_searchFrame_text' style='width: 100%' type='text' class='form-control' placeholder='" + __dic.SEARCH[__lang] + "'>\
                                 </div>\
                            </div>\
                        </div>\
                    </div>\
                    <div id='TIS_resultUI_bodyContainer' class='TIS_scroll'></div>\
                    <div id='TIS_resultUI_footer' style='position: absolute;width: 100%;background-color: rgba(0, 0, 0, 0.74);bottom: 0'>\
                        <div class='dropup' style='text-align: center;color: white'>\
                            <div class='dropdown-toggle' data-toggle='dropdown'>\
                                 <div style='display:table;width:100%;height:100%'>\
                                    <span class='tis tis-sort-1 TIS-leagueType' style='height:2.5em;display:table-cell;vertical-align:middle;margin-left: 10px;font-size: 14.0pt;font-weight: 400;'>\
                                        <span style='padding-right: 5px;'>" + __dic.MORE[__lang] + "...</span>\
                                    </span>\
                                 </div>\
                            </div>\
                            <ul id='TIS_resultUI_orderBy_listContainer' class='dropdown-menu ' role='menu' style='width: 100%;padding:0;background-color: rgba(0, 0, 0, 0.75)'>\
                                <li role='info' style='text-align: right'>\
                                    <a value='0' style='color:white;line-height: 3;' class='TIS-selected'>\
                                        <i class='tis tis-circle' style='padding-left:5px;'></i>" + __dic.ALL_RESULT[__lang] + "\
                                    </a>\
                                </li>\
                                <li role='info' style='text-align: right'>\
                                    <a value='1' style='color:white;line-height: 3;'>\
                                        <i class='tis tis-circle' style='padding-left:5px;visibility: hidden;'></i>" + __dic.MY_RESULT[__lang] + "  \
                                    </a>\
                                </li>\
                                <li role='info' style='text-align: right'>\
                                    <a value='2' style='color:white;line-height: 3;'>\
                                        <i class='tis tis-circle' style='padding-left:5px;visibility: hidden;'></i>" + __dic.MY_MATCHES[__lang] + "\
                                    </a>\
                                </li>\
                            </ul>\
                        </div>\
                    </div>\
                </div>";

            __$parentContainer = $(topScoreView).appendTo(document.body);


        },

        __getStatusName = function (statusNumber) {
            var name = __matchStatus[statusNumber];

            if (!name) {
                name = "نامشخص";
            }

            return name;
        },

        __addLeagueNameToHeader = function (leagueName) {
            if (__lastHeaderLeagueName === leagueName) {
                return;
            }

            __lastHeaderLeagueName = leagueName;

            __$headerTitle.text(__dic.RESULTS[__lang] + "(" + leagueName + ")");
        },

        __addRegisteredMatchResult = function (matchData) {

            __addLeagueNameToHeader(matchData.league.name);

            var winnerId = __getMatchWinner(matchData.users);

            var rightUserImage,
                leftUserImage,
                startTime = new Date(matchData.startTime);

            var rightImageStyle = 'width: 55px;height: 55px;border-radius: 100%;float: right;display:table;margin-left:10px;',
                rightUserColor = "black",
                leftUserColor = "black",
                leftImageStyle = 'width: 55px;height: 55px;border-radius: 100%;float: left;display:table;margin-right:10px;';


            if (matchData.users.length > 1) {
                if (matchData.users[0].info.id == winnerId) {
                    rightImageStyle += "border-bottom : 4px solid #23ce23";
                } else if(matchData.users[1].info.id == winnerId) {
                    leftImageStyle += "border-bottom : 4px solid #23ce23";
                }

                var ownId = __parent.getUserData().id,
                    user1Id = matchData.users[0].info.id,
                    user2Id = matchData.users[1].info.id;

                if (user1Id == ownId || user1Id == __currentUserId) {
                    rightUserColor = "#6495ed";
                } else if (user2Id == ownId || user2Id == __currentUserId) {
                    leftUserColor = "#6495ed";
                }
            }


            var imageUrl;

            if(matchData.users[0].info.imageUrl) {
                imageUrl = matchData.users[0].info.imageUrl;
            } else if(matchData.users[0].info.image) {
                imageUrl = __parent.getService().generateImageSrc(matchData.users[0].info.image, {
                    width: 50,
                    height: 50
                });
            }
            if (imageUrl) {
                rightUserImage = "\
                    <div style='" + rightImageStyle + "'>\
                        <img src='" + imageUrl + "' style='width: 50px;border-radius: 100%;margin-top: 3px'>\
                    </div>\
                ";
            } else {
                rightUserImage = "\
                    <div style='" + rightImageStyle + "'>\
                        <i class='tis tis-user-5' style='display: table-cell;vertical-align: middle;font-size: 2.5em;margin-top: 3px'></i>\
                    </div>\
                ";
            }


            var rightUserView = "\
               <div class='col-lg-5 col-md-5 col-sm-5 col-xs-5' style='padding-right: 10px;overflow: hidden'>\
                  <div style='display: table'>\
                   " + rightUserImage + "\
                   <span style='display: table-cell;vertical-align: middle;color: " + rightUserColor + "'>" + matchData.users[0].info.name + "</span>\
                  </div>\
               </div>\
            ";

            var leftUserView = "";


            if ((matchData.users[1])) {

                imageUrl = null;

                if(matchData.users[1].info.imageUrl) {
                    imageUrl = matchData.users[1].info.imageUrl;
                } else if(matchData.users[1].info.image) {
                    imageUrl = __parent.getService().generateImageSrc(matchData.users[1].info.image, {
                        width: 50,
                        height: 50
                    });
                }

                if (imageUrl) {
                    leftUserImage = "\
                    <div style='" + leftImageStyle + "'>\
                        <img src='" + imageUrl + "' style='width: 50px;border-radius: 100%;margin-top: 3px'>\
                    </div>\
                ";
                } else {
                    leftUserImage = "\
                    <div style='" + leftImageStyle + "'>\
                        <i class='tis tis-user-5' style='display: table-cell;vertical-align: middle;font-size: 2.5em;margin-top: 3px'></i>\
                    </div>\
                ";
                }

                leftUserView = "\
               <div class='col-lg-5 col-md-5 col-sm-5 col-xs-5' style='padding-left: 10px;overflow: hidden'>\
                   <div style='display: table;float: left'>\
                       <span style='display: table-cell;vertical-align: middle;color: " + leftUserColor + "'>" + matchData.users[1].info.name + "</span>\
                       " + leftUserImage + "\
                   </div>\
               </div>\
            ";
            }


            var toFa = TIS.Util.toFaDigit;

            var shamsiStartTime = TIS.Util.miladiToShamsi(startTime.getUTCFullYear(), startTime.getUTCMonth() + 1, startTime.getUTCDate());
            var startTimeView = toFa(shamsiStartTime.d) + " / " + toFa(shamsiStartTime.m) + " / " + toFa(shamsiStartTime.y);
            var matchInfo = "\
                <div class='tis-resultUI-matchInfo' style='height: 60px;'>\
                   " + rightUserView + "\
                    <div class='col-lg-2 col-md-2 col-sm-2 col-xs-2' style='padding: 0;white-space: nowrap'>\
                        <div style='font-weight: bold'>زمان</div>\
                        <div style='font-size: 10px;margin-top: 5px'>" + startTimeView + "</div>\
                        <div><i class='tis tis TIS-resultUI-moreIco tis-down-open'></i></div>\
                    </div>\
                    " + leftUserView + "\
                </div>\
            ";


            var content = "\
               <div>\
                 " + matchInfo + "\
               </div>\
            ";

            var $content = $(content);

            $content.find(".tis-resultUI-matchInfo").on("click", function () {
                var $this = $(this);

                var $more = $this.next(".tis-resultUI-moreMatchInfo");

                __$parentContainer
                    .find(".TIS-resultUI-moreIco")
                    .removeClass("tis-left-open")
                    .addClass("tis-down-open");

                if ($more.length > 0) {
                    $more.css({
                        "height" : 0,
                        "transform": "translateX(calc(100%))",
                        "-webkit-transform": "translateX(calc(100%))"
                    });

                    setTimeout(function () {
                        $more.remove();
                    },1000);

                } else {
                    var $opened = __$resultContainer.find(".tis-resultUI-moreMatchInfo");

                    $opened.css({
                        "height" : 0,
                        "transform": "translateX(calc(100%))",
                        "-webkit-transform": "translateX(calc(100%))"
                    });

                    setTimeout(function () {
                        $opened.remove();
                    },1000);

                    $this
                        .find(".TIS-resultUI-moreIco")
                        .removeClass("tis-down-open")
                        .addClass("tis-left-open");

                    __createMatchResultMoreInfo(matchData, $this.parent());
                }

            });

            __$resultContainer.append($content);
        },

        __addMatch = function (matchData) {

            __addLeagueNameToHeader(matchData.league.name);

            var rightUserImage,
                leftUserImage,
                startTime = new Date(matchData.startTime);

            var rightImageStyle = 'width: 55px;height: 55px;border-radius: 100%;float: right;display:table;margin-left:10px;',
                rightUserColor = "black",
                leftUserColor = "black",
                leftImageStyle = 'width: 55px;height: 55px;border-radius: 100%;float: left;display:table;margin-right:10px;';


            if (matchData.users.length > 1) {
                var ownId = __parent.getUserData().id,
                    user1Id = matchData.users[0].id,
                    user2Id = matchData.users[1].id;

                if (user1Id == ownId || user1Id == __currentUserId) {
                    rightUserColor = "#6495ed";
                } else if (user2Id == ownId || user2Id == __currentUserId) {
                    leftUserColor = "#6495ed";
                }
            }

            if (matchData.users[0].image) {
                rightUserImage = "\
                    <div style='" + rightImageStyle + "'>\
                        <img src='" + __parent.getService().generateImageSrc(matchData.users[0].image, {
                    width: 50,
                    height: 50
                }) + "'>\
                    </div>\
                ";
            } else {
                rightUserImage = "\
                    <div style='" + rightImageStyle + "'>\
                        <i class='tis tis-user-5' style='display: table-cell;vertical-align: middle;font-size: 2.5em'></i>\
                    </div>\
                ";
            }


            var rightUserView = "\
               <div class='col-lg-5 col-md-5 col-sm-5 col-xs-5' style='padding: 15px 0 0 0;overflow: hidden'>\
                  <div style='display: table'>\
                   " + rightUserImage + "\
                   <span style='display: table-cell;vertical-align: middle;color: " + rightUserColor + "'>" + matchData.users[0].name + "</span>\
                  </div>\
               </div>\
            ";

            var leftUserView = "";


            if (matchData.users[1]) {
                if (matchData.users[1].image) {
                    leftUserImage = "\
                    <div style='" + leftImageStyle + "'>\
                        <img src='" + __parent.getService().generateImageSrc(matchData.users[1].image, {
                        width: 50,
                        height: 50
                    }) + "'>\
                    </div>\
                ";
                } else {
                    leftUserImage = "\
                    <div style='" + leftImageStyle + "'>\
                        <i class='tis tis-user-5' style='display: table-cell;vertical-align: middle;font-size: 2.5em'></i>\
                    </div>\
                ";
                }

                leftUserView = "\
               <div class='col-lg-5 col-md-5 col-sm-5 col-xs-5' style='padding:15px 0 0 0;overflow: hidden'>\
                   <div style='display: table;float: left'>\
                       <span style='display: table-cell;vertical-align: middle;color: " + leftUserColor + "'>" + matchData.users[1].name + "</span>\
                       " + leftUserImage + "\
                   </div>\
               </div>\
            ";


            }


            var toFa = TIS.Util.toFaDigit;

            var shamsiStartTime = TIS.Util.miladiToShamsi(startTime.getUTCFullYear(), startTime.getUTCMonth() + 1, startTime.getUTCDate());
            var startTimeView = toFa(shamsiStartTime.d) + " / " + toFa(shamsiStartTime.m) + " / " + toFa(shamsiStartTime.y);
            var matchInfo = "\
                <div class='tis-resultUI-matchInfo' style='height: 100px'>\
               " + rightUserView + "\
                <div class='col-lg-2 col-md-2 col-sm-2 col-xs-2' style='padding: 0;white-space: nowrap'>\
                    <div style='font-weight: bold'>زمان</div>\
                    <div style='font-size: 10px;margin-top: 5px'>" + startTimeView + "</div>\
                    <div style='font-weight: bold'>وضعیت</div>\
                    <div style='font-size: 10px;margin-top: 5px'>" + __getStatusName(matchData.statusNumber) + "</div>\
                    <div><i class='tis tis TIS-resultUI-moreIco tis-down-open'></i></div>\
                </div>\
                " + leftUserView + "\
                </div>\
            ";


            var content = "\
               <div>\
                 " + matchInfo + "\
               </div>\
            ";

            var $content = $(content);

            $content.find(".tis-resultUI-matchInfo").on("click", function () {
                var $this = $(this);

                var $more = $this.next(".tis-resultUI-moreMatchInfo");

                __$parentContainer
                    .find(".TIS-resultUI-moreIco")
                    .removeClass("tis-left-open")
                    .addClass("tis-down-open");

                if ($more.length > 0) {
                    $more.remove();
                } else {
                    __$resultContainer.find(".tis-resultUI-moreMatchInfo").remove();

                    $this
                        .find(".TIS-resultUI-moreIco")
                        .removeClass("tis-down-open")
                        .addClass("tis-left-open");

                    __createMatchMoreInfo(matchData, $this.parent());
                }

            });


            __$resultContainer.append($content);
        },

        __createMatchResultMoreInfo = function (matchData, container) {

            var toFa = TIS.Util.toFaDigit;

            var startTime = new Date(matchData.startTime),
                endTime = new Date(matchData.endTime),

                shamsiStartTime = TIS.Util.miladiToShamsi(startTime.getUTCFullYear(), startTime.getUTCMonth() + 1, startTime.getUTCDate()),
                startTimeView = toFa(startTime.getUTCMinutes()) + " : " + toFa(startTime.getUTCHours()) + "&nbsp;--&nbsp;" + toFa(shamsiStartTime.d) + " / " + toFa((shamsiStartTime.m)) + " / " + toFa(shamsiStartTime.y),

                shamsiEndTime = TIS.Util.miladiToShamsi(endTime.getUTCFullYear(), endTime.getUTCMonth() + 1, endTime.getUTCDate()),
                endTimeView = toFa(endTime.getUTCMinutes()) + " : " + toFa(endTime.getUTCHours()) + "&nbsp;--&nbsp;" + toFa(shamsiEndTime.d) + " / " + toFa(shamsiEndTime.m) + " / " + toFa(shamsiEndTime.y);


            var resView = "";

            for (var i = 0; i < matchData.users.length; i++) {
                var user = matchData.users[i],
                    scores = user.scores;


                var thView = "",
                    trView = "";


                for (var j = 0; j < scores.length; j++) {
                    var score = scores[j];

                    thView += "<th style='border: none;text-align: center'>" + score.name + "</th>";
                    trView += "<td style='border: none'>" + score.value + "</td>";
                }

                resView += "\
                    <div style='margin: 10px 0;text-align: center;font-weight: bold'>" + user.info.name + "</div>\
                    <table style='width: 100%;text-align: center;background-color: #f5f5dc'>\
                       <tr>" + thView + "</tr>\
                       <tr> " + trView + "</tr>\
                    </table>\
                ";
            }

            var playMatchView = "";


            if(__ownConfig && __ownConfig.usePlayMatch) {

                playMatchView = '\
                    <div class="tis-resultUI-playMatch">\
                        <i class="tis tis-2x tis-play" style="padding-left: 6px"></i>\
                    </div>\
                \
                ';
            }

            var extraData = "\
                <div class='tis-resultUI-moreMatchInfo'>\
                    <div>\
                        "+playMatchView+"\
                        <div>\
                            <span style='font-weight: bold'>زمان شروع &nbsp;&nbsp;&nbsp;&nbsp;</span>\
                            <span>" + startTimeView + "</span>\
                        </div>\
                        <div style='margin-top: 10px'>\
                            <span style='font-weight: bold'>زمان پایان &nbsp;&nbsp;&nbsp;&nbsp; </span>\
                            <span>" + endTimeView + "</span>\
                        </div>\
                        <div style='margin-top: 10px'>\
                            <span style='font-weight: bold'>شناسه مسابقه &nbsp;&nbsp;&nbsp;&nbsp; </span>\
                            <span>" + toFa(matchData.id) + "</span>\
                        </div>\
                        <div>\
                            " + resView + "\
                        </div>\
                    </div>\
                </div>\
            ";

            var $extraData = $(extraData);

            $extraData
                .find(".tis-resultUI-playMatch")
                .on("click", function () {

                    var data = {
                        matchId: matchData.id,
                        leagueId: matchData.league.id,
                        users: []
                    };

                    for (var i = 0; i < matchData.users.length; i++) {
                        data.users.push(matchData.users[i].info);
                    }
                    __parent.fireEvent("usePlayMatch", data);
                });

            container.append($extraData);


            $extraData.css({
                "height": $extraData.children().height() + 25 + "px",
                "transform": "translateX(0)",
                "-webkit-transform": "translateX(0)"
            });
        },

        __createMatchMoreInfo = function (matchData, container) {

            var toFa = TIS.Util.toFaDigit;

            var extraData = "\
                <div class='tis-resultUI-moreMatchInfo' style='margin-top: 10px;'>\
                    <div style='background-color: white;box-shadow: 0px 7px 11px -1px rgba(0,0,0,0.4);text-align: right;padding: 10px 15px 20px 10px  '>\
                        <div style='margin-top: 10px'>\
                            <span style='font-weight: bold'>شناسه مسابقه &nbsp;&nbsp;&nbsp;&nbsp; </span>\
                            <span>" + toFa(matchData.id) + "</span>\
                        </div>\
                    </div>\
                </div>\
            ";

            container.append(extraData);
        },

        __onResize = function () {


            var height =
                __$parentContainer.height() -
                __$headerContainer.height();


            if (__$footerContainer.css("display") !== "none") {
                height -= (__$footerContainer.height() + 30)
            } else {
                height -= 40;
            }
            __$resultContainer.height(height);
        },

        __updateLatestRegisteredMatchesResults = function (callback) {
            $("#TIS_resultUI_searchBtn").css({
                visibility : "visible"
            });
            if (__isLoading) {
                return;
            }

            var offset = __currentMatchesResultOffset;

            if (offset === 0) {
                __$resultContainer.empty();
            }
            __$resultContainer.append(__addMoreDataElm);
            __changeAddMoreDataState(true);
            __$resultContainer.scrollTop(function () {
                return this.scrollHeight;
            });

            var reqData = {
                leagueId: __currentLeagueId,
                offset: offset,
                // size : 3,
            };
            __parent.getService().getLeagueLatestMatchesResult(reqData, function (res) {
                __changeAddMoreDataState(false);
                if (res.hasError) {
                    __parent.alert(res.errorMessage);
                } else {
                    __addMoreDataElm.remove();
                    var matches = res.result.matches;
                    for (var i = 0; i < matches.length; i++) {
                        __addRegisteredMatchResult(matches[i]);
                    }

                    if (!res.result.hasNext) {
                        var notMoreTxt;
                        if (matches.length === 0) {
                            notMoreTxt = __dic.NOT_FIND[__lang];
                        } else {
                            notMoreTxt = __dic.NOT_FIND_MORE[__lang];
                        }
                        __$resultContainer.append(
                            "<div class='col-lg-12 col-md-12 col-sm-12 col-xs-12' style='text-align: center;color:#8a2be2;padding: 0 0  30px'>" + notMoreTxt + "</div>"
                        );
                        __isScrollInit = false;
                    } else {
                        __$resultContainer.append(__addMoreDataElm);
                        __currentMatchesResultOffset = res.result.nextOffset;
                        __initScrollEvent();
                    }

                    if (offset === 0) {
                        // because in some device btn click not work, should move to fire click event
                        __$resultContainer.scrollTop(function () {
                            return 1;
                        });
                    }
                }

                __isLoading = false;
            });
        },

        __updateRegisteredMatchesResults = function (callback) {
            $("#TIS_resultUI_searchBtn").css({
                visibility : "hidden"
            });
            if (__isLoading) {
                return;
            }

            var offset = __currentMatchesResultOffset;

            if (offset === 0) {
                __$resultContainer.empty();
            }
            __$resultContainer.append(__addMoreDataElm);
            __changeAddMoreDataState(true);
            __$resultContainer.scrollTop(function () {
                return this.scrollHeight;
            });

            var reqData = {
                leagueId: __currentLeagueId,
                offset: offset,
                // size : 3,
            };

            if (__currentUserId) {
                reqData.userId = __currentUserId;
            }


            __parent.getService().getLeagueMatchesResult(reqData, function (res) {
                __changeAddMoreDataState(false);
                if (res.hasError) {
                    __parent.alert(res.errorMessage);
                } else {
                    __addMoreDataElm.remove();
                    var matches = res.result.matches;
                    for (var i = 0; i < matches.length; i++) {
                        __addRegisteredMatchResult(matches[i]);
                    }

                    if (!res.result.hasNext) {
                        var notMoreTxt;
                        if (matches.length === 0) {
                            notMoreTxt = __dic.NOT_FIND[__lang];
                        } else {
                            notMoreTxt = __dic.NOT_FIND_MORE[__lang];
                        }
                        __$resultContainer.append(
                            "<div class='col-lg-12 col-md-12 col-sm-12 col-xs-12' style='text-align: center;color:#8a2be2;padding: 0 0  30px'>" + notMoreTxt + "</div>"
                        );
                        __isScrollInit = false;
                    } else {
                        __$resultContainer.append(__addMoreDataElm);
                        __currentMatchesResultOffset = res.result.nextOffset;
                        __initScrollEvent();
                    }

                    if (offset === 0) {
                        // because in some device btn click not work, should move to fire click event
                        __$resultContainer.scrollTop(function () {
                            return 1;
                        });
                    }
                }

                __isLoading = false;
            });
        },

        __updateMyLeagueMatches = function (callback) {
            $("#TIS_resultUI_searchBtn").css({
                visibility : "hidden"
            });
            if (__isLoading) {
                return;
            }

            var offset = __currentMatchesResultOffset;

            if (offset === 0) {
                __$resultContainer.empty();
            }
            __$resultContainer.append(__addMoreDataElm);
            __changeAddMoreDataState(true);
            __$resultContainer.scrollTop(function () {
                return this.scrollHeight;
            });

            var reqData = {
                leagueId: __currentLeagueId,
                offset: offset,
                // size : 3,
            };

            if (__currentUserId) {
                reqData.userId = __currentUserId;
            }


            __parent.getService().getLeagueMatches(reqData, function (res) {
                __changeAddMoreDataState(false);
                if (res.hasError) {
                    __parent.alert(res.errorMessage);
                } else {
                    __addMoreDataElm.remove();
                    var matches = res.result.matches;
                    for (var i = 0; i < matches.length; i++) {
                        __addMatch(matches[i]);
                    }

                    if (!res.result.hasNext) {
                        var notMoreTxt;
                        if (matches.length === 0) {
                            notMoreTxt = __dic.NOT_FIND[__lang];
                        } else {
                            notMoreTxt = __dic.NOT_FIND_MORE[__lang];
                        }
                        __$resultContainer.append(
                            "<div class='col-lg-12 col-md-12 col-sm-12 col-xs-12' style='text-align: center;color:#8a2be2;padding: 0 0  30px'>" + notMoreTxt + "</div>"
                        );
                        __isScrollInit = false;
                    } else {
                        __$resultContainer.append(__addMoreDataElm);
                        __currentMatchesResultOffset = res.result.nextOffset;
                        __initScrollEvent();
                    }

                    if (offset === 0) {
                        // because in some device btn click not work, should move to fire click event
                        __$resultContainer.scrollTop(function () {
                            return 1;
                        });
                    }
                }

                __isLoading = false;
            });
        },

        __initUI = function (params) {

            __$moreContainer
                .find("a.TIS-selected")
                .removeClass("TIS-selected")
                .find("i")
                .css("visibility", "hidden");


            __currentLeagueId = params.leagueId;
            __currentMatchesResultOffset = 0;
            __isLoading = false;
            __isScrollInit = false;

            if (params.userId) {
                __currentUserId = params.userId;

                $("#TIS_resultUI_footer").hide();

                __$moreContainer
                    .find("a[value='1']")
                    .addClass("TIS-selected")
                    .find("i")
                    .css("visibility", "visible");

                __updateRegisteredMatchesResults();
            } else {
                __currentUserId = undefined;
                $("#TIS_resultUI_footer").show();

                __$moreContainer
                    .find("a[value='0']")
                    .addClass("TIS-selected")
                    .find("i")
                    .css("visibility", "visible");

                __updateLatestRegisteredMatchesResults()
            }

        },

        __moreItemValueClickHandler = function (val) {
            var selectedVal = val || __$moreContainer.find("a.TIS-selected").attr("value");

            switch (selectedVal) {
                case "0" :
                    __updateLatestRegisteredMatchesResults();

                    break;
                case "1" :
                    __updateRegisteredMatchesResults();

                    break;
                case "2" :
                    __updateMyLeagueMatches();

                    break;
            }
        },

        __initEvent = function () {

            $("#TIS_resultUI_close").on("click", function () {
                __self.hide();
            });

            $("#TIS_resultUI_searchBtn").on("click", function () {
                $("#TIS_resultUI_header_main").hide();
                $("#TIS_resultUI_header_searchFrame").show();
            });


            $("#TIS_resultUI_header_searchFrame_close").on("click", function () {
                $("#TIS_resultUI_header_main").show();
                $("#TIS_resultUI_header_searchFrame").hide();

                $("#TIS_resultUI_header_searchFrame_text").val("");

                __currentMatchesResultOffset = 0;
                $("#TIS_resultUI_footer").show();
                __onResize();
                __updateLatestRegisteredMatchesResults();
                __$moreContainer
                    .find("a.TIS-selected")
                    .removeClass("TIS-selected")
                    .find("i")
                    .css("visibility", "hidden");

                __$moreContainer
                    .find("a[value='0']")
                    .addClass("TIS-selected")
                    .find("i")
                    .css("visibility", "visible");
            });


            $("#TIS_resultUI_header_searchFrame_text").on("keyup", function () {

                var $this = $(this),
                    val = $this.val();
                if (val && val.length > 0) {
                    __parent.getService().getLeagueMembers({
                        leagueId: __currentLeagueId,
                        name: val,
                        size: 10
                    }, function (res) {
                        if (!res.HasError) {
                            var users = res.result.users;
                            __foundUserAction(users);
                        }
                    });
                }
            });


            var $allAList = $("#TIS_resultUI_orderBy_listContainer").find("a");
            $allAList.on("click", function () {
                $allAList
                    .removeClass("TIS-selected")
                    .find("i")
                    .css("visibility", "hidden");

                var $a = $(this);
                $a
                    .addClass("TIS-selected")
                    .find("i").css("visibility", "visible");

                __currentMatchesResultOffset = 0;
                __isLoading = false;
                __isScrollInit = false;

                __moreItemValueClickHandler($a.attr("value"));

            });


            $(window).on("resize", function () {
                if (__visibility) {
                    __onResize();
                }
            });
        },

        __foundUserAction = function (users,preventShowPopover) {

            var htmlContent = $("<div style='max-height: 200px;overflow: auto'></div>");

            for(var userId in users) {
                var content = "\
                            <div class='list' userId='"+userId+"' style='text-align: center;cursor: pointer;margin-bottom: 10px;'>" + users[userId].name + "</div>\
                        ";

                var $content = $(content);

                $content.on("click", function () {
                    var userId = $(this).attr("userId");

                    __initUI({
                        userId: userId,
                        leagueId: __currentLeagueId
                    });

                    __onResize();

                    __lastSearchPopover && __lastSearchPopover.popover("destroy");
                });

                htmlContent.append($content);

            }

            __lastSearchPopover = $("#TIS_resultUI_header_searchFrame_text").popover('destroy');

            if (Object.keys(users).length > 0) {
                $("#TIS_resultUI_header_searchFrame_text")
                    .popover({
                        html: true,
                        placement: "bottom",
                        content: function () {
                            return htmlContent;
                        }
                    });
                if (!preventShowPopover) {
                    __lastSearchPopover.popover("show");
                }
            }
        },



        __visibilityFN = function(visibility) {

            if(typeof visibility === "boolean") {
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
    __self.show = function (params) {
        __visibility = true;
        __parent.getServerTime({}, function (result) {
            __serverTime = result.result.time;
        });

        __initUI(params);

        $("#TIS_resultUI_header_main").show();
        $("#TIS_resultUI_header_searchFrame").hide();
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
        __onResize();
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
            __$parentContainer
                .css({
                    "transform": "translateX(calc(100%))",
                    "-webkit-transform": "translateX(calc(100%))"
                });

            setTimeout(function () {
                __$resultContainer.empty();
            }, 1000);
        } else {
            __$parentContainer.hide();
            __$resultContainer.empty();
        }

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

    __init();
};
