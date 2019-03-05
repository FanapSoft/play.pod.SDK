/**
 * @class ActiveMatchUI
 * @module ServiceUI
 * @submodule ServiceUI
 *
 * */
TIS.ActiveMatchUI = function (options) {
    /*==================================================================================================================
     *                                      P R I V A T E   V A R I A B L E
     *================================================================================================================*/
    var __self = this,
        __dic = options.dictionary,
        __parent = options.parent,
        __matchesData = {},
        __lang = options.language,
        __BtnColor = (options.config && options.config.buttonBackgroundColor) || "#1cb7d4",
        __visibility = false;

    /*==================================================================================================================
     *                                   P U B L I C    V A R I A B L E
     *================================================================================================================*/


    /*==================================================================================================================
     *                                   P R I V A T E     M E T H O D
     *================================================================================================================*/

    var __init = function () {
        __initView();
        __initEvent();
    },

        __onWindowResize = function () {
            var height = $(window).height();
            var minusHeight = $("#TIS_activeMatch_header").height() +  $("#TIS_activeMatch_footer").height();

            $("#TIS_activeMatch_body").height((height - minusHeight - 40) + "px");
        },

        __processOnActiveMatch = function (cancelAllMatch) {
        var selectedMatchId = [];
        if(!cancelAllMatch) {
            $("#TIS_activeMatch_matches li.active").each(function (idx, li) {
                var matchId = $(this).attr("matchId");
                selectedMatchId.push(matchId);
                //console.log($(li).text());
            });
        }

        __parent.runMultiPlayerMatch({
            selectedMatchesId : selectedMatchId
        });
    },

        __updateSelection = function () {
        var selectedMatchId = [];
        $("#TIS_activeMatch_matches li.active").each(function (idx, li) {

            var matchId = $(this).attr("matchId");
            selectedMatchId.push(matchId);
            //console.log($(li).text());
        });

        if(selectedMatchId.length > 0) {
            $("#TIS_activeMatch_startMatch").find("span").html(__dic.START[__lang]);
        } else {
            $("#TIS_activeMatch_startMatch").find("span").html(__dic.REJECT[__lang]);
        }
    },

        __initView = function () {
        var leagueView = "\
        <div  id='TIS_activeMatch_container'>\
            <div id='TIS_activeMatch_header' style='text-align: center;margin-top: 20px' >\
                <i id='TIS_activeMatch_close' class='tis tis-close-circle  tis-2x TIS-pointer' style='float: right;margin-right: 10px;color:"+__BtnColor+";font-weight: bold'></i>\
                <div class='panel-title' style='font-weight: bold'>" + __dic.ACTIVEMATCH[__lang] + "</div>\
            </div>\
            <div id='TIS_activeMatch_body' style='overflow-y: auto;width: 100%;padding-top: 30px;'>\
                <ul style='margin-bottom: 3px; font-weight: bold;display: table;width: 100%'>\
                    <div class='col-lg-3 col-md-3 col-sm-3 col-xs-3'>"+__dic.GAME[__lang]+"</div>\
                    <div class='col-lg-3 col-md-3 col-sm-3 col-xs-3'>"+__dic.OPPONENTNAME[__lang]+"</div>\
                    <div class='col-lg-3 col-md-3 col-sm-3 col-xs-3'>"+__dic.CURRENTRELOADCOUNT[__lang]+"</div>\
                    <div class='col-lg-3 col-md-3 col-sm-3 col-xs-3'>"+__dic.MAXRELOADCOUNT[__lang]+"</div>\
                </ul>\
                <ul id='TIS_activeMatch_matches' class='list-group checked-list-box'>\
                </ul>\
                <br />\
            </div>\
            <div id='TIS_activeMatch_footer' style='position: absolute;width: 100%;bottom: 0'>\
                <div \
                    id='TIS_activeMatch_startMatch'\
                    class='TIS-pointer TIS-BTN' \
                    style='margin:25px auto;background-color: "+__BtnColor+";'>\
                    <span style='display: table-cell;vertical-align: middle;font-size: 20px;'> " + __dic.REJECT[__lang] + "</span>\
                </div>\
            </div>\
        </div>";

        $(leagueView).appendTo(document.body);
    },

        __initEvent = function () {
        $("#TIS_activeMatch_close").on("click", function () {
            __processOnActiveMatch(true);
            __self.hide();
        });

        $('#TIS_activeMatch_startMatch').on('click', function (event) {
            __processOnActiveMatch(false);
            event.preventDefault();
            __self.hide();
        });
    },

        __initUi = function () {
        __parent.getGamesInfo({registerGame:true},function(result) {
            if(! result.hasError) {

                var games = result.result.games;
                var refGames = {};

                for (var i = 0; i < games.length; i++) {
                    var game = games[i];
                    refGames[game.id]= game;
                }
                for (var matchId in __matchesData) {
                    //var info = __parent.getGameInfo(__matchesData[matchId].gameId);
                    var info = refGames[__matchesData[matchId].gameId];
                    if (!info) {
                        continue;
                    }

                    var gameName = info.name;

                    var showData = __matchesData[matchId].opponentsData[0].name + "----";

                    showData += gameName;

                    var matchContent = "\
                        <li class='list-group-item TIS-shadow' data-color='info' matchId='" + matchId + "' style='margin: 10px'>\
                            <ul class='row' >\
                                <div class='col-lg-3 col-md-3 col-sm-3 col-xs-3'>"+gameName+"</div>\
                                <div class='col-lg-3 col-md-3 col-sm-3 col-xs-3'>"+__matchesData[matchId].opponentsData[0].name+"</div>\
                                <div class='col-lg-3 col-md-3 col-sm-3 col-xs-3' style='text-align: center'>"+__matchesData[matchId].currentReloadCount+"</div>\
                                <div class='col-lg-3 col-md-3 col-sm-3 col-xs-3' style='text-align: center'>"+__matchesData[matchId].maxReloadCount+"</div>\
                            </ul>\
                        </li>\
                        ";
                    $(matchContent).appendTo("#TIS_activeMatch_matches");
                }

                $(function () {
                    $('.list-group.checked-list-box .list-group-item').each(function () {

                        // Settings
                        var $widget = $(this),
                            $checkbox = $('<input type="checkbox" class="hidden" />'),
                            color = ($widget.data('color') ? $widget.data('color') : "primary"),
                            style = ($widget.data('style') == "button" ? "btn-" : "list-group-item-");

                        $widget.css('cursor', 'pointer');
                        $widget.append($checkbox);

                        // Event Handlers
                        $widget.on('click', function () {
                            $checkbox.prop('checked', !$checkbox.is(':checked'));
                            $checkbox.triggerHandler('change');
                            updateDisplay();
                            __updateSelection();
                        });

                        // Actions
                        function updateDisplay() {
                            var isChecked = $checkbox.is(':checked');

                            // Update the button's color
                            if (isChecked) {
                                $widget.addClass(style + color + ' active');
                            } else {
                                $widget.removeClass(style + color + ' active');
                            }
                        }

                    });
                });
            }
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

    /*==================================================================================================================
     *                                 P U B L I C     M E T H O D
     *================================================================================================================*/
    
    /**
     * @method show
     * @public
     * @chainable
     *
     * */
    __self.show = function () {
        __visibility = true;
        __initUi();
        $("#TIS_activeMatch_container").show();
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
    __self.hide = function () {
        __visibility = false;
        $("#TIS_activeMatch_container").hide();

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

    __self.onActiveMatchData = function (matchesData) {
        __matchesData = matchesData;
        __self.show();
    };

    __self.backButton = function () {
        if (__visibility) {
            __processOnActiveMatch(true);
            __self.hide();
            return true;
        }
        return false;
    };


    __init();
};