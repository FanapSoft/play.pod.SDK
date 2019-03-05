/**
 * @class MatchPageUI
 * @module ServiceUI
 * @submodule ServiceUI
 *
 * */
TIS.MatchPageUI = function (options) {

    /*==================================================================================================================
     *                                      P R I V A T E   V A R I A B L E
     *================================================================================================================*/
    var __self = this,
        __parent = options.parent,
        __dic = options.dictionary,
        __firstPageContainer,
        __gamePageContainer,
        __tabListContainer,
        __tabCount = 0,
        __isGamePageVisible = false,
        __activeMatches = {
            /*
             * matchId : function
             *   function(){
             *       this.getContainer()
             *       this.onShowTab()
             *       this.onHide()
             *   }
             * */
        },
        __currentShowPageId,
        __tabIdPrefix = "TIS_gamePage_tab_nav_",
        __contentIdPrefix = "TIS_gamePage_tab_content_";

    /*==================================================================================================================
     *                                   P U B L I C    V A R I A B L E
     *================================================================================================================*/
    var __init = function () {
        __initFirstPage();
        __initGamePage();
        __initEvent();
        __tabListContainer = $("#TIS_gamePage_tabList");
        $(window).on("resize", function () {
            __onResize();
        });
    };

    var __onResize = function () {

        //var size = {
        //    width: window.innerWidth,
        //    height: window.innerHeight
        //};

        $("#TIS_gamePage_tabContent")
            .find("div[role='tabpanel']")
            .css({
                //width : "100%",
                height: window.innerHeight - (
                __tabListContainer.height() +
                parseInt(__tabListContainer.css("margin-top")) +
                parseInt(__tabListContainer.css("margin-top")) +
                parseInt(__tabListContainer.css("border-bottom-width")) +
                parseInt(__tabListContainer.parent().css("margin-top")) +
                parseInt(__tabListContainer.parent().css("padding-top")))
            });


        //$("#TIS_gamePage_container")
        //    .css({
        //        width: size.width,
        //        height: size.height
        //    });

    };

    var __initFirstPage = function () {
        var firstPageContent = "\
            <div id='TIS_firstPage_container'></div>\
            ";
        __firstPageContainer = $(firstPageContent)
            .appendTo(document.body);

    };

    var __initGamePage = function () {

        //style='background-color:black;border-bottom: 2px solid #ff8600; direction: ltr; padding-left: 0;box-sizing: content-box'>\
        var gamePageContent = "\
            <div id='TIS_gamePage_container'>\
                <div role='tabpanel' >\
                    <ul id='TIS_gamePage_tabList' class='nav nav-tabs TIS_scroll' role='tablist'\
                     style='overflow-y:hidden;width:100%;display: flex;list-style: none;overflow-x: auto;background-color:black;border-bottom: 2px solid #ff8600; direction: rtl; padding-left: 0;box-sizing: content-box'>\
                        <li id='TIS_gamePage_onlineUser' class='TIS-pointer' role='presentation' style='position: absolute;z-index: 123;left:1px;' >\
                            <i  class='tis tis-user' style='padding: 5px;font-size: 35px;color: white;display: table'>\
                                <i  class='tis tis-plus TIS-orangeColor' style='position :relative;float: right;font-size: 25px;padding-top: 12px;margin-left: -11px;'></i>\
                            </i>\
                        </li>\
                    </ul>\
                    <div id='TIS_gamePage_tabContent' class='tab-content'>\
                    </div>\
                    \
                </div>\
            </div>\
            ";
        __gamePageContainer = $(gamePageContent)
            .appendTo(document.body);

    };

    var __initEvent = function () {
        $("#TIS_gamePage_onlineUser").on("click", function () {
            __parent.showMatchRequestUI();
        });
    };

    var __showTab = function (matchId) {
        var contentId = __contentIdPrefix + matchId;
        __gamePageContainer
            .find("#TIS_gamePage_tabList .TIS-activeTab")
            .removeClass("TIS-activeTab");

        __tabListContainer
            .find("a[href='#" + contentId + "']")
            .tab("show")
            .addClass("TIS-activeTab");

        //__gamePageContainer.css({
        //    width: "100%",
        //    height: (window.innerHeight - tabContainer.height())
        //});

        __onResize();
        __onShowTab(matchId);
    };

    var __onShowTab = function (matchId) {
        if (__activeMatches[matchId]) {
            for (var id in __activeMatches) {
                if (id == matchId) {
                    __activeMatches[id].onShow();
                    //__parent.onShowMatchTab(matchId);

                } else {
                    __activeMatches[id].onHide();
                }
            }
            __currentShowPageId = matchId;
        }
    };

    var __closeTab = function (matchId) {
        var tabId = __tabIdPrefix + matchId;
        var contentId = __contentIdPrefix + matchId;

        var tabElm = $("#" + tabId);

        if (tabElm.length <= 0) {
            return;
        }

        __tabCount -= 1;
        var li;
        if (__tabCount > 0) {

            if (__currentShowPageId == matchId) {

                if (tabElm.index() == 1) {
                    li = $("#" + tabId).next("li[matchId]");
                } else {
                    li = $("#" + tabId).prev("li[matchId]");
                }
                //li.find("a").tab("show");

                __currentShowPageId = li.attr("matchId");
            }
        } else {
            __gamePageContainer.hide();
            __firstPageContainer.show();
            __isGamePageVisible = false;
            __parent.onShowFirstPage();
            __currentShowPageId = undefined;
        }

        tabElm.remove();
        $("#" + contentId).remove();

        __onResize();

        var $elem = __tabListContainer.find("li:last-child:not(#TIS_gamePage_onlineUser)");
        if(__tabListContainer.children().length>3 && $elem.length>0) {
            $elem.find("a").css("width", "130px");
        }
        if (li) {
            __showTab(li.attr("matchId"));
        }

        delete __activeMatches[matchId];

    };


    /*==================================================================================================================
     *                                   P R I V A T E     M E T H O D
     *================================================================================================================*/


    /*==================================================================================================================
     *                                 P R O T E C T E D     M E T H O D
     *================================================================================================================*/

    this.getFirstPageContainer = function () {
        return __firstPageContainer;
    };

    this.getCurrentPageMatchId = function () {
        return __currentShowPageId;
    };

    this.createMatchPage = function (params) {
        __parent.hideMatchRequestUI();
        var matchId = params.matchId;
        var tabId = __tabIdPrefix + matchId;
        var contentId = __contentIdPrefix + matchId;
        var title = params.title || "Game";

        if (title.length > 5) {
            title = title.substr(0, 5) + "...";
        } else {
            var tmp = "";
            for (var i = 0; i < 8 - title.length; i++) {
                tmp += " &nbsp";
            }
            title = title + tmp;
        }

        var navContent = "\
            <li role='presentation' id='" + tabId + "' matchId='" + matchId + "'>\
                <a role='tab' data-toggle ='tab' style='text-align:right;color:grey;overflow: hidden;width:90px;padding: 4px 0 0 ;border:0;height:45px;background-color:black;white-space: nowrap;font-size:1.5em; font-weight: bold;' href='#" + contentId + "' >\
                    <i class='tis tis-close TIS-pointer' style='font-size: medium;padding-right: 10px;font-weight: bold;'></i>\
                    <span TIS-DATA='TEXT' style='padding-right: 10px;font-size: 14px' >"+ title +"</span>\
                </a>\
            </li>\
        ";
        var $content = $(navContent);
        if(__tabListContainer.children().length>=3) {
            var $elem = __tabListContainer.find("li:last-child:not(#TIS_gamePage_onlineUser)");
            if($elem.length>0) {
                $elem.find("a").css("width", "90px");
            }
            $content.find("a").css("width", "130px");
        }

        // __tabListContainer
        //     .append($content)
        //     .find("a[href='#" + contentId + "']").on("click", function () {
        //         if (__currentShowPageId != matchId) {
        //             __showTab(matchId);
        //         }
        //
        //     })
        //     .find("i.tis-close")
        //     .on("click", function () {
        //         var matchId = $(this).closest("li").attr("matchId");
        //         if(__currentShowPageId) {
        //
        //         }
        //         if (__activeMatches[matchId]) {
        //
        //             __activeMatches[matchId].onClose(function (state) {
        //                 if (state) {
        //                     __closeTab(matchId);
        //                 }
        //             });
        //
        //         } else {
        //             __closeTab(matchId);
        //         }
        //     });

        __tabListContainer
            .append($content)
            .find("a[href='#" + contentId + "']").on("click", function () {
                if (__currentShowPageId != matchId) {
                    __showTab(matchId);
                } else {
                    if (__activeMatches[matchId]) {

                        __activeMatches[matchId].onClose(function (state) {
                            if (state) {
                                __closeTab(matchId);
                            }
                        });

                    } else {
                        __closeTab(matchId);
                    }
                }

            });

        var matchContainer =
            $("<div role='tabpanel' class='tab-pane'>")
                .appendTo("#TIS_gamePage_tabContent")
                .attr({
                    id: contentId
                })
                .css({
                    width: "100%",
                    direction: "ltr"
                    //height: (window.innerHeight - __tabListContainer.height())
                });

        __tabCount += 1;


        function MatchHandler() {
            TIS.MatchPageHandler.call(this);

            this.getContainer = function () {
                return matchContainer;
            };

            this.setTabState = function (state) {
                if (state) {
                    $("#TIS_gamePage_tabList")
                        .find("li > a[href='#" + __contentIdPrefix + matchId + "']")
                        .addClass("TIS-receiveDataTab");
                } else {
                    $("#TIS_gamePage_tabList")
                        .find("li > a[href='#" + __contentIdPrefix + matchId + "']")
                        .removeClass("TIS-receiveDataTab");
                }
            };

            this.close = function () {
                __closeTab(matchId);
            };

            this.show = function () {
                __showTab(matchId);
            };

            this.selectChat = function() {
                __parent.selectChatThread(matchId);
            };


        }

        if (!__isGamePageVisible) {
            __gamePageContainer.show();
            __firstPageContainer.hide();
            __isGamePageVisible = true;
            __currentShowPageId = matchId;
            __parent.onShowMatchPage();
            __onResize();
        }
        __activeMatches[matchId] = new MatchHandler();

        __onResize();
        return __activeMatches[matchId];
    };

    this.showFirstPage = function () {
        __firstPageContainer.show();
        __gamePageContainer.hide();
    };

    this.showMatchPage = function () {
        __firstPageContainer.hide();
        __gamePageContainer.show();
    };

    this.hideOnlineUserButton = function () {
        $("#TIS_gamePage_onlineUser").hide();
    };

    this.backButton = function () {

        if(__currentShowPageId  && __activeMatches[__currentShowPageId]) {
            (function (currentShowPageId) {
                __activeMatches[currentShowPageId].onClose(function (state) {
                    if (state) {
                        __closeTab(currentShowPageId);
                    }
                });
            })(__currentShowPageId);

            return true;
        }
        return false;
    };

    __init();
};