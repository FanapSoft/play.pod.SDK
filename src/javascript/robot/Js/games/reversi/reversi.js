var Brain = require("./brain");
var Config = require("../../../config");

function PlayerNozha(options) {

    var __self = this,
        __parent = options.parent,
        __ai = undefined;

    __self.name = options.name;
    __self.id = options.id;
    __self.opponentName = options.opponentName;
    __self.opponentId = options.opponentId;
    __self.tile = options.tile;
    __self.hasAI = options.hasAI || false;

    if (__self.hasAI) {

        __ai = new AiNozha({

            parent : __self
        });
    }

    __self._getComputerMove = function (board, computrTile) {

        return __ai._getComputerMove(board, computrTile);
    };

    __self._getComputerAction = function () {

        __parent._getComputerAction();
    };

    __self._setBoardAndTile = function (options) {

        __ai._setBoardAndTile(options);
    };

    __self._setBestMove = function (options) {

        __parent._setBestMove(options);
    };

    __self.setComputerMove = function (board, computerTile) {

        __ai._getComputerMove(board, computerTile);
    };

    __self._setUpdatedItems = function (updatedBoardItems) {

        __parent._setUpdatedItems(updatedBoardItems);
    };
}

function LogicNozha(options) {

    var __self = this,
        __parent = options.parent,
        __board = [],
        __updatedBoardItems = [];

    __self._resetBoard = function () {

        var object = resetBoard(__board);

        __board = object.board;
        __updatedBoardItems = object.updatedBoardItems;
        __parent._setUpdatedItems(__updatedBoardItems,true);
        __parent._updateBoard(__board);
    };


    var getPlayerMove = function (board, playerTile, x, y) {

        if (isValidMove(board, playerTile, x, y) != false) {

            return [x, y];
        }

        return false;
    };

    __self._takePlayerMove = function (playerAction, player) {

        __board = __parent._getUpdatedBoard();
        var playerMove = getPlayerMove(__board, player.tile, playerAction.column, playerAction.row);
        __updatedBoardItems = [];
        makeMove(__board, player.tile, playerMove[0], playerMove[1], __updatedBoardItems);
        __parent._updateBoard(__board);
        __parent._setUpdatedItems(__updatedBoardItems);
    };

    __self._updateBoard = function (board) {

        __board = board;
    };
}

function resetBoard(board) {

    var updatedBoardItems = [],
        dupBoard = getBoardCopy(board);

    var element = undefined;

    for (var i = 0; i < 8; i++) {

        for (var j = 0; j < 8; j++) {

            if (dupBoard[j][i] != " ") {

                if ((i == 3) && (j == 4) || (i == 4) && (j == 3)) {

                    element = "O";

                    dupBoard[j][i] = element;

                    updatedBoardItems.push({

                        column : j,
                        row : i,
                        element : element
                    });
                }

                else if ((i == 3) && (j == 3) || (i == 4) && (j == 4)) {

                    element = "X";

                    dupBoard[j][i] = element;

                    updatedBoardItems.push({

                        column : j,
                        row : i,
                        element : element
                    });
                }

                else {

                    element = " ";

                    dupBoard[j][i] = element;

                    updatedBoardItems.push({

                        column : j,
                        row : i,
                        element : element
                    });
                }
            }

            else if (dupBoard[j][i] == " ") {

                if ((i == 3) && (j == 4) || (i == 4) && (j == 3)) {

                    element = "X";

                    dupBoard[j][i] = element;

                    updatedBoardItems.push({

                        column : j,
                        row : i,
                        element : element
                    });
                }

                else if ((i == 3) && (j == 3) || (i == 4) && (j == 4)) {

                    element = "O";

                    dupBoard[j][i] = element;

                    updatedBoardItems.push({

                        column : j,
                        row : i,
                        element : element
                    });
                }
            }
        }
    }

    return {

        board : dupBoard,
        updatedBoardItems : updatedBoardItems
    };
}

function getNewBoard() {

    var board = [];

    for (var i = 0; i < 8; i++) {

        for (var j = 0; j < 8; j++) {

            if (board[j] == undefined) {

                board[j] = [];
            }
            board[j][i] = " ";
        }
    }

    return board;
}

function getBoardCopy(board) {

    if (board[0] == undefined) {

        board = getNewBoard();
    }

    var duplicatedBoard = getNewBoard();

    for (var i = 0; i < 8; i++) {

        for (var j = 0; j < 8; j++) {

            duplicatedBoard[i][j] = board[i][j];
        }
    }

    return duplicatedBoard;
}

function CountDown(options, callback, source) {

    if (options) {

        var maxTime = (options.hours || 0) * 60 * 60 + (options.minutes || 0) * 60 + (options.seconds || 0) + Math.floor((options.milliseconds || 0) / 1000);
    }
    else {

        console.log("You should pass a time object!");
    }

    var __self = this,
        startTime,
        lastTime,
        timeOffset = 0,
        lastTimeoutId,
        isStart = false,
        isRunning = false,
        secondsRemained;

    var _update = function() {
        if(!isStart || !isRunning) {
            return;
        }
        //console.log(source);
        lastTime = new Date();
        secondsRemained = maxTime - Math.floor(((lastTime - timeOffset)- startTime) / 1000);

        if (secondsRemained <= 0) {
            callback();

        } else {
            lastTimeoutId = setTimeout(function () {
                _update();
            }, 500);
        }

        //console.log("TIME",secondsRemained);
    };

    __self.stop = function () {
        isStart = false;
        isRunning = false;
        timeOffset = 0;
        clearTimeout(lastTimeoutId);
    };

    __self.start = function () {
        isRunning = true;
        isStart = true;
        startTime = new Date();
        timeOffset = 0;
        _update();
    };

    __self.pause = function () {
        isRunning = false;
        clearTimeout(lastTimeoutId);
    };

    __self.resume = function() {
        isRunning = true;
        timeOffset = new Date - lastTime;
        _update();
    };

}

function isOnBoard(x, y) {

    return ((x >= 0) && (x <= 7) && (y >= 0) && (y <= 7))
}

function isValidMove(board, tile, xStart, yStart) {

    if (board[xStart][yStart] != " " || !(isOnBoard(xStart, yStart))) {

        return false;
    }

    board[xStart][yStart] = tile;

    var otherTile = "";

    if (tile == "X") {

        otherTile = "O";
    }

    else {

        otherTile = "X";
    }

    var tilesToFlip = [];

    for (var i = -1; i < 2; i++) {

        for (var j = -1; j < 2; j++) {

            if ((i != 0) || (j != 0)) {

                var x = xStart,
                    y = yStart;

                x += i;
                y += j;

                if ((isOnBoard(x, y)) && board[x][y] == otherTile) {

                    x += i;
                    y += j;

                    if(!(isOnBoard(x, y))) {

                        continue;
                    }

                    while (board[x][y] == otherTile) {

                        x += i;
                        y += j;

                        if((!isOnBoard(x, y))) {

                            break;
                        }
                    }

                    if((!isOnBoard(x, y))) {

                        continue;
                    }

                    if (board[x][y] == tile) {

                        while (true) {

                            x -= i;
                            y -= j;

                            if ((x == xStart) && (y == yStart)) {

                                break;
                            }

                            tilesToFlip.push([x, y]);
                        }
                    }
                }
            }
        }
    }

    board[xStart][yStart] = " ";

    if (tilesToFlip.length == 0) {

        return false;
    }

    return tilesToFlip;
}

function makeMove(board, tile, xStart, yStart, updatedBoardItems) {

    var tilesToFlip = isValidMove(board, tile, xStart, yStart);

    if (tilesToFlip == false) {

        return false;
    }

    board[xStart][yStart] = tile;


    for (var i = 0; i < tilesToFlip.length; i++) {

        board[tilesToFlip[i][0]][tilesToFlip[i][1]] = tile;

        updatedBoardItems.push({

            column : tilesToFlip[i][0],
            row : tilesToFlip[i][1],
            element : tile,
            playerMove : false
        });
    }

    updatedBoardItems.push({

        column : xStart,
        row : yStart,
        element : tile,
        playerMove : true
    })

    return true;
}

function getValidMoves(board, tile) {

    var validMoves = [];

    for (var i = 0; i < 8; i++) {

        for (var j = 0; j < 8; j++) {

            if (isValidMove(board, tile, i, j) != false) {

                validMoves.push([i, j]);
            }
        }
    }

    return validMoves;
}

function parseReversiBoard (board) {

    var parsedItems = [],
        empty = " ";

    for (var i = 0; i < 8; i++) {

        for (var j = 0; j < 8; j++) {

            if (board[j][i] != empty) {

                parsedItems.push({

                    column: j,
                    row: i,
                    element: board[j][i]
                });
            }
        }
    }

    return parsedItems;
}

function getScoreOfBoard(board) {

    var xScore = 0,
        oScore = 0;

    for (var i = 0; i < 8; i++) {

        for (var j = 0; j < 8; j++) {

            if (board[i][j] == "X") {

                xScore += 1;
            }

            if (board[i][j] == "O") {

                oScore += 1;
            }
        }
    }

    return { "X" : xScore, "O" : oScore };
};

function Game(options) {

    var __self = this,
        __defaultBoard = [],
        //__parent = options.userData.parent,
        __lang = "FA",
        __resultReason = {
            1: {
                FA: "شما برنده بازی می باشید."
            },
            2: {
                FA: "شما بازنده بازی می باشید."
            },
            3: {
                FA: "به دلیل اتمام زمان حرکت حریف , شما برنده بازی می باشید."
            },
            4: {
                FA: "به دلیل عدم دریافت حرکت از سوی حریف در زمان مجاز , شما برنده بازی می باشید."
            },
            5: {
                FA: "به دلیل اتمام وقت مجاز , شما بازنده بازی می باشید."
            },
            6: {
                FA: "به دلیل قطع بودن ارتباط شما با سرور ,بیش از زمان مجاز , شما بازنده بازی می باشید. "
            },
            7: {
                FA: "به دلیل ترک بازی توسط حریف , شما برنده بازی می باشید."
            },
            8: {
                FA: "بازی مساوی تمام شد."
            },
            9: {
                FA: "نتیجه بازی معتبر نمی باشد."
            },
            10: {
                FA: "به دلیل ترک بازی , شما بازنده بازی می باشید."
            },
            11: {
                FA: "با توجه به عدم شروع بازی از سوی حریف , بازی لغو گردید."
            },
            12: {
                FA: "با توجه به عدم بازی از سوی شما , بازی لغو گردید."
            },
            13: {
                FA: "با توجه به عدم ارسال حرکت اول شما , بازی لغو گردید."
            },
            14: {
                FA: "با توجه به ترک زمین قبل از حرکت اول توسط حریف , بازی لغو گردید. "
            }
        },
        __logic = undefined,
        __gameUi = undefined,
        __board = undefined,
        __playerAction = undefined,
        __prevTurn = undefined,
        __matchResult = {},
        __playerOne = undefined,
        __playerTwo = undefined,
        __service = undefined,
        __updatedItems = undefined,
        __lastState = options.stateData,
        __pauseModalShowState = (__lastState) ? false : true,
        __matchId = options.matchId,
        __owner = options.players.player1,
        __opponent = options.players.player2,
    //__ui = options.ui.createMatchPage(__matchId,{
    //    title : options.players.player2.name
    //}),
        __container,
        __gameState = false,
        __endGameState = false,
        __isDisconnected = false,
        __soundManager,
        __countDown,
        __unEffectReceivedData,
        __receiveDataCount = (__lastState && __lastState.receiveDataCount) ? __lastState.receiveDataCount : 0,
        __ackSendDataCount = (__lastState && __lastState.ackSendDataCount) ? __lastState.ackSendDataCount : 0,
        __sounds = {},
        __turn;

    var robotBraint = new Brain();

    var __init = function () {
        //return;
        __initSound();
        //__container = __ui.getContainer();

        __turn = __owner.applicant ? __owner.id : __opponent.id;

        __createPlayers(__turn);

        //__gameUi = new GameUiNozha({
        //    container : __container,
        //    matchId : __matchId,
        //    parent : __self,
        //    owner : __owner,
        //    opponent : __opponent,
        //    gameState: __gameState,
        //    lastState : __lastState,
        //    leagueName : options.leagueName
        //});

        //__ui.show();

        __logic = new LogicNozha({

            parent: __self
        });

        //__gameUi._drawBoard();

        if (__lastState != undefined) {

            __turn = __lastState.turn;
            //__gameUi._updateBoardItems(__lastState.parsedBoard,true);
            __self._updateBoard(__lastState.board);

            //__gameUi._setPlayersInfo();
        }

        else {

            __logic._resetBoard();
            //__gameUi._setPlayersInfo();
        }

        __self.ready({
            onResult: function (result) {
                if (result.hasError) {
                    //__hidePauseModal();
                    matchReadyCancel(result.errorMessage);
                }
            }
        });

        __self._setGameContainer();

        __self._setGame();

        // timer for check disconnect time
        __countDown = new CountDown({minutes: 3}, function () {

            if (__self.isSendResultValid()) {

                __self._sendResult(false, 6);

            } else {
                __unValidFinishAction(13);
            }

        }, "GAME_JS");

        if (!__lastState) {
            __showPauseModal();
        }

        //window.game = __self;
        //window.gameui = __gameUi;
    };

    var matchReadyCancel = function (message) {

        __unValidFinishAction(message);

    };

    var __initSound = function () {
        //__soundManager = __parent.getSoundManager();

        //__sounds.tickout = __soundManager.createSound({
        //    name: "tickout",
        //    type: SoundManager.EFFECT
        //});
        //
        //__sounds.ring = __soundManager.createSound({
        //    name: "ring",
        //    type: SoundManager.EFFECT
        //});
    };

    var __showPauseModal = function () {
        //var pauseModal = __container.find("[uiType='modal'][mode='pause']"),
        //    modalBassin = __container.find("[uiType='modalBassin']");
        //
        //pauseModal.css({
        //
        //    "width": __container.width() / 2,
        //    "height": __container.height() / 2,
        //    "left": __container.width() / 4,
        //    "top": ((__container.height() + 45) - (__container.height() / 2)) / 2
        //});
        //
        //modalBassin.css({
        //
        //    "position": 'absolute',
        //    "width": "100%",
        //    "height": __container.height(),
        //    "background-color": "rgba(0 ,0 , 0 , 0.5)"
        //});
        //
        //pauseModal.fadeIn(500);
        //modalBassin.fadeIn(500);
    };

    var __hidePauseModal = function () {
        var pauseModal = __container.find("[uiType='modal'][mode='pause']"),
            modalBassin = __container.find("[uiType='modalBassin']");
        pauseModal.fadeOut(500);
        modalBassin.fadeOut(500);
    };

    var __showResultDialog = function (reasonCode) {

        var informModal = __container.find("[mode='inform']"),
            modalBassin = __container.find("[mode='modalBassin']"),
            closeModal = __container.find("[mode='close']"),
            button = informModal.find("[uiType='modalDismiss']");

        if (reasonCode == 11 ||
            reasonCode == 12 ||
            reasonCode == 13 || typeof reasonCode == "string") {

            informModal.find("[uiType='panel']")
                .addClass("panel-warning")
                .removeClass("panel-info")
                .removeClass("panel-success");

            informModal.find("button").removeClass("btn-info").addClass("btn-warning");

        } else {
            if (reasonCode == 2 ||
                reasonCode == 5 ||
                reasonCode == 6 ||
                reasonCode == 9 ||
                reasonCode == 10) {

                informModal.find("[uiType='panel']")
                    .addClass("panel-danger")
                    .removeClass("panel-info")
                    .removeClass("panel-success");

                informModal.find("button").removeClass("btn-info").addClass("btn-danger");
            }
        }


        closeModal.hide();

        var message;

        if (typeof reasonCode == "string") {
            message = reasonCode;
        } else {
            message = __resultReason[reasonCode][__lang];
        }


        informModal.find("p").html(message);

        informModal.css({

            "width": __container.width() / 2,
            "height": __container.height() / 2,
            "left": __container.width() / 4,
            "top": ((__container.height() + 45) - (__container.height() / 2)) / 2
        });

        modalBassin.css({

            "position": 'absolute',
            "width": "100%",
            "height": __container.height(),
            "background-color": "rgba(0 ,0 , 0 , 0.5)"
        });

        informModal.fadeIn(1000);
        modalBassin.fadeIn(1000);
        button.off("click");
        button.on("click", function () {

            informModal.fadeOut(1000);
            modalBassin.fadeOut(1000);

            //__ui.close();
        });
    };

    function generateRandomInt (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function randomMove(validMoves) {
        var selectedIndex = generateRandomInt(0, validMoves.length - 1);

        return {
            column: validMoves[selectedIndex][1],
            row: validMoves[selectedIndex][0]
        }
    }

    var __brainMove = function (params) {

        var validMoves = getValidMoves(__board, __owner.tile);

        if(validMoves.length === 0) {
            return;
        }


        try {

            var move;

            if(params.move) {
                move = {
                    row: params.move.column,
                    column : params.move.row
                };
            }
            robotBraint.execute({
                board : __board,
                tile : __owner.tile,
                move : move,
                opponent : __opponent,
                matchId : __matchId
            },function (data) {

                if(typeof data.column === "undefined" || typeof data.row === "undefined") {
                    data = randomMove(validMoves);
                }

                __self._setPlayerAction(__owner.id, {
                    row : data.column,
                    column : data.row,
                });
            });


        } catch (e){
            console.log("EXECUTE EXCEPTION", e);
            var data = randomMove(validMoves);
            __self._setPlayerAction(__owner.id, {
                row : data.column,
                column : data.row,
            });
        }

    };

    var __autoMove = function (params) {

        // __brainMove();

        setTimeout(function () {
            __brainMove(params);
        },Config.moveInterval);

    };

    var __sendGameData = function (data, stateData, callback) {
        //__noneAckSendDataCount += 1;
        //var state = __self._saveStats();
        //__self.sendData(data, stateData, function (e) {
        //    __ackSendDataCount+=1;
        //    if(callback) {
        //        callback(e);
        //    }
        //});

        __self.sendData({
            sendData: data,
            stateData: stateData,
            onResult: function (e) {
                __ackSendDataCount += 1;
                if (callback) {
                    callback(e);
                }
            }
        });
    };

    // if un applicant player not play
    var __unValidFinishAction = function (ownReasonCode, opponentReasonCode) {

        if (__endGameState) {

            return;
        }

        if (opponentReasonCode) {
            __sendGameData({
                cmd: "finish",
                reasonCode: opponentReasonCode
            });
        }
        //__showResultDialog(ownReasonCode);
        __countDown.stop();
        //__gameUi._getCountDown().stop();
        //__gameUi._pauseTimer();
        __endGameState = true;
        __self.cancel();
        //toastr.clear();
    };

    var __setTurn = function (options) {

        if (__turn == __owner.id) {

            __self._setTabState(true);
        }

        else if (options == __opponent.id) {

            __self._setTabState(false);
        }

        //__gameUi._setTurn(options);
    };

    var __createPlayers = function (playerOne) {

        __playerOne = {};
        __playerTwo = {};

        if (playerOne == __owner.id) {


            __playerOne = new PlayerNozha({

                parent: __self,
                name: __owner.name,
                id: __owner.id,
                opponentName: __opponent.name,
                opponentId: __opponent.id,
                tile: "X"
            });

            __playerTwo = new PlayerNozha({

                parent: __self,
                name: __opponent.name,
                id: __opponent.id,
                opponentName: __owner.name,
                opponentId: __owner.id,
                tile: "O"
            });

            __owner.tile = "X";
            __opponent.tile = "O";
        }

        else {

            __playerOne = new PlayerNozha({

                parent: __self,
                name: __opponent.name,
                id: __opponent.id,
                opponentName: __owner.name,
                opponentId: __owner.id,
                tile: "X"
            });

            __playerTwo = new PlayerNozha({

                parent: __self,
                name: __owner.name,
                id: __owner.id,
                opponentName: __opponent.name,
                opponentId: __opponent.id,
                tile: "O"
            });

            __owner.tile = "O";
            __opponent.tile = "X";
        }
    };

    __self._setUpdatedItems = function (options, isInit) {

        __updatedItems = options;
        //__gameUi._updateBoardItems(options,isInit);
    };

    __self._setPlayerAction = function (playerID, options) {

        __playerAction = options;

        if (__turn == playerID) {

            if (playerID == __playerOne.id) {

                if (isValidMove(__board, __playerOne.tile, __playerAction["column"], __playerAction["row"])) {

                    __logic._takePlayerMove(__playerAction, __playerOne);

                    if (playerID == __owner.id) {

                        __self._sendPlayerAction(__playerOne.id, __playerAction);

                        __prevTurn = __turn;
                        __turn = __playerTwo.id;
                        __setTurn(__turn);
                        if (getValidMoves(__board, __playerTwo.tile).length == 0) {

                            __prevTurn = __turn;
                            __turn = __playerOne.id;
                            __setTurn(__turn);
                            __autoMove({
                                move : __playerAction
                            });
                        }
                    }

                    else if (playerID == __opponent.id) {

                        __prevTurn = __turn;
                        __turn = __playerTwo.id;
                        __setTurn(__turn);

                        if (getValidMoves(__board, __playerOne.tile).length == 0 && getValidMoves(__board, __playerTwo.tile).length == 0) {

                            __self._sendResult();
                        } else if (getValidMoves(__board, __playerTwo.tile).length == 0) {

                            __prevTurn = __turn;
                            __turn = __playerOne.id;
                            __setTurn(__turn);
                        }

                    }
                }
            }

            else if (playerID == __playerTwo.id) {

                if (isValidMove(__board, __playerTwo.tile, __playerAction["column"], __playerAction["row"])) {

                    __logic._takePlayerMove(__playerAction, __playerTwo);

                    if (playerID == __owner.id) {

                        __self._sendPlayerAction(__playerTwo.id, __playerAction);

                        __prevTurn = __turn;
                        __turn = __playerOne.id;
                        __setTurn(__turn);

                        if (getValidMoves(__board, __playerOne.tile).length == 0) {

                            __prevTurn = __turn;
                            __turn = __playerTwo.id;
                            __setTurn(__turn);
                            __autoMove({
                                    move : __playerAction
                                });
                        }
                    }

                    else if (playerID == __opponent.id) {

                        __prevTurn = __turn;
                        __turn = __playerOne.id;
                        __setTurn(__turn);

                        if (getValidMoves(__board, __playerOne.tile).length == 0 && getValidMoves(__board, __playerTwo.tile).length == 0) {
                            __self._sendResult();
                        }

                        else if (getValidMoves(__board, __playerOne.tile).length == 0) {

                            __prevTurn = __turn;
                            __turn = __playerTwo.id;
                            __setTurn(__turn);
                        }
                    }
                }
            }
        }
    };

    __self._updateBoard = function (options) {

        __board = options;
        //__gameUi._setScores(getScoreOfBoard(__board));
        //__gameUi._clearHighlights(__board);
    };

    __self._sendPlayerAction = function (playerId, options) {

        if (getValidMoves(__board, __playerOne.tile).length == 0 && getValidMoves(__board, __playerTwo.tile).length == 0) {

            if (__turn == __owner.id) {

                __sendGameData(
                    {cmd: "position", position: options, playerId: playerId},
                    __self._saveStats());

                __self._sendResult();
            }
        }

        else {

            __sendGameData(
                {cmd: "position", position: options, playerId: playerId},
                __self._saveStats());
        }
    };

    __self.onReceiveData = function (params) {
        var data = params.data;

        if (!__gameState) {
            __unEffectReceivedData = data;
            return;
        }

        if (!__endGameState) {

            __receiveDataCount += 1;

            if (data.cmd == "position") {

                __self._setPlayerAction(data.playerId, data.position);
                __autoMove({move : data.position});

            }
            else if (data.cmd == "finish") {
                if (data.reasonCode == 11 || data.reasonCode == 14) {
                    __unValidFinishAction(data.reasonCode);
                } else {
                    __self._sendResult(true, data.reasonCode, undefined, data.totalDieCount);
                }
            }
        }


    };

    __self._getUpdatedBoard = function () {

        return __board;
    };

    __self._resetBoard = function () {

        __logic._resetBoard();
    };

    __self._getOwnerPhone = function () {

        return __owner["phoneNumber"];
    };

    __self._headerStyler = function () {

        //__gameUi._headerStyler();
    };

    __self.onDisconnect = function () {
        //console.log("onDisconnect");

        if (!__endGameState && __gameState && !__isDisconnected) {
            __isDisconnected = true;

            __countDown.start();

            //__gameUi._getCountDown().pause();
        }
    };

    __self.onConnect = function () {
        //console.log("onConnect");

        if (!__endGameState && __gameState && __isDisconnected) {
            __isDisconnected = false;
            // toastr.clear();
            __countDown.stop();

            //__gameUi._getCountDown().resume();
        }

    };

    __self.onStart = function () {
        //console.log("onStart");
        if (__owner.applicant) {
            __autoMove({});
        }

        __gameState = true;
        __setTurn(__turn);
        //__hidePauseModal();
        if (__unEffectReceivedData) {
            __self.onReceiveData(__unEffectReceivedData);
            __unEffectReceivedData = undefined;
        }

        //__ui.selectChat();
    };

    __self._getGameState = function () {

        return __gameState;
    };

    __self._getEndGameState = function () {

        return __endGameState;
    };

    __self._setGameContainer = function () {

        //__parent._games.push(__container);
    };

    __self._setGame = function () {

        //__parent._gameObject = __self;
    };

    //$(window).on("resize",  function () {
    //
    //    __container.find("[uiType='gameContainer']").coverify();
    //    //__gameUi._onResize();
    //
    //    var closeModal = __container.find("[mode='close']"),
    //        informModal = __container.find("[mode='inform']"),
    //        pauseModal = __container.find("[mode='pause']"),
    //        modalBassin = __container.find("[uiType='modalBassin']");
    //
    //    modalBassin.css({
    //
    //        "position" : 'absolute',
    //        "width" : "100%",
    //        "height" : __container.height(),
    //        "background-color" : "rgba(0 ,0 , 0 , 0.5)"
    //    });
    //
    //    closeModal.css({
    //
    //        "width" : __container.width() / 2,
    //        "height" : __container.height() / 2,
    //        "left" : __container.width() / 4,
    //        "top" : ((__container.height() + 45) - (__container.height() / 2)) / 2
    //    });
    //
    //    informModal.css({
    //
    //        "width" : __container.width() / 2,
    //        "height" : __container.height() / 2,
    //        "left" : __container.width() / 4,
    //        "top" : ((__container.height() + 45) - (__container.height() / 2)) / 2
    //    });
    //
    //    pauseModal.css({
    //
    //        "width" : __container.width() / 2,
    //        "height" : __container.height() / 2,
    //        "left" : __container.width() / 4,
    //        "top" : ((__container.height() + 45) - (__container.height() / 2)) / 2
    //    });
    //});

    __self._sendResult = function (isWin, reasonCode, opponentReasonCode, opTotalDieCount) {
        if (__endGameState) {
            return;
        }

        var gains = {},
            losses = {},
            scores = {},
            diffs = {},
            winner = {},
            loser = {},
            draw = {},
            result;


        __matchResult[__owner.id] = {};

        __matchResult[__opponent.id] = {};

        var ownerDieCount = getScoreOfBoard(__board)[(__owner.tile).toUpperCase()];
        var opponentDieCount = getScoreOfBoard(__board)[(__opponent.tile).toUpperCase()];

        var totalDieCount = ownerDieCount + opponentDieCount;

        if (opponentReasonCode == 3 || opponentReasonCode == 7) {

            if (!isWin) {
                __sendGameData({
                    cmd: "finish",
                    reasonCode: opponentReasonCode,
                    totalDieCount: totalDieCount
                });
            }

        }

        if (opTotalDieCount) {
            totalDieCount = opTotalDieCount;
        }

        if (isWin == undefined) {

            gains[__owner.id] = ownerDieCount;
            losses[__owner.id] = opponentDieCount;

            gains[__opponent.id] = opponentDieCount;
            losses[__opponent.id] = ownerDieCount;

            diffs[__owner.id] = ownerDieCount - opponentDieCount;
            diffs[__opponent.id] = opponentDieCount - ownerDieCount;
        } else {

            if (isWin) {
                gains[__owner.id] = totalDieCount;
                losses[__owner.id] = 0;

                gains[__opponent.id] = 0;
                losses[__opponent.id] = totalDieCount;

                diffs[__owner.id] = totalDieCount;
                diffs[__opponent.id] = -totalDieCount;

            } else {
                gains[__owner.id] = 0;
                losses[__owner.id] = totalDieCount;

                gains[__opponent.id] = totalDieCount;
                losses[__opponent.id] = 0;

                diffs[__owner.id] = -totalDieCount;
                diffs[__opponent.id] = totalDieCount;
            }

        }

        if (gains[__owner.id] > gains[__opponent.id]) {

            scores[__owner.id] = 3;
            winner[__owner.id] = 1;
            loser[__owner.id] = 0;

            draw[__owner.id] = 0;
            scores[__opponent.id] = 0;
            winner[__opponent.id] = 0;
            loser[__opponent.id] = 1;

            draw[__opponent.id] = 0;
            __matchResult[__owner.id].type = "winner";
            __matchResult[__opponent.id].type = "loser";

        }
        else if (gains[__owner.id] < gains[__opponent.id]) {

            scores[__owner.id] = 0;
            winner[__owner.id] = 0;
            loser[__owner.id] = 1;

            draw[__owner.id] = 0;
            scores[__opponent.id] = 3;
            winner[__opponent.id] = 1;
            loser[__opponent.id] = 0;

            draw[__opponent.id] = 0;
            __matchResult[__owner.id].type = "loser";
            __matchResult[__opponent.id].type = "winner";
        }
        else if (gains[__owner.id] == gains[__opponent.id]) {

            scores[__owner.id] = 1;
            winner[__owner.id] = 0;
            loser[__owner.id] = 0;


            draw[__owner.id] = 1;
            scores[__opponent.id] = 1;
            winner[__opponent.id] = 0;
            loser[__opponent.id] = 0;

            draw[__opponent.id] = 1;
            __matchResult[__owner.id].type = "draw";
            __matchResult[__opponent.id].type = "draw";
        }


        __matchResult[__owner.id].result = [

            {
                name: "field1",
                value: scores[__owner.id]
            },

            {
                name: "field2",
                value: diffs[__owner.id]
            },

            {
                name: "field3",
                value: gains[__owner.id]
            },

            {
                name: "field4",
                value: losses[__owner.id]
            },

            {
                name: "field5",
                value: winner[__owner.id]
            },

            {
                name: "field6",
                value: loser[__owner.id]
            },

            {
                name: "field7",
                value: draw[__owner.id]
            }
        ];

        __matchResult[__opponent.id].result = [

            {
                name: "field1",
                value: scores[__opponent.id]
            },

            {
                name: "field2",
                value: diffs[__opponent.id]
            },

            {
                name: "field3",
                value: gains[__opponent.id]
            },

            {
                name: "field4",
                value: losses[__opponent.id]
            },

            {
                name: "field5",
                value: winner[__opponent.id]
            },

            {
                name: "field6",
                value: loser[__opponent.id]
            },

            {
                name: "field7",
                value: draw[__opponent.id]
            }
        ];


        if (!reasonCode) {
            switch (__matchResult[__owner.id].type) {
                case "winner" :
                    //__showResultDialog(1);
                    reasonCode = 1;
                    break;

                case "loser" :
                    //__showResultDialog(2);
                    reasonCode = 2;
                    break;

                case "draw" :
                    //__showResultDialog(8);
                    reasonCode = 8;
                    break;
            }
        }
        //__showResultDialog(reasonCode);
        //result = [
        //
        //    {
        //        playerId : __owner.id,
        //
        //        scores :
        //
        //            [
        //                {
        //                    name : "field1",
        //                    value : scores[__owner.id]
        //                },
        //
        //                {
        //                    name : "field2",
        //                    value : diffs[__owner.id]
        //                },
        //
        //                {
        //                    name : "field3",
        //                    value : gains[__owner.id]
        //                },
        //
        //                {
        //                    name : "field4",
        //                    value : losses[__owner.id]
        //                },
        //
        //                {
        //                    name : "field5",
        //                    value : winner[__owner.id]
        //                },
        //
        //                {
        //                    name : "field6",
        //                    value : loser[__owner.id]
        //                },
        //
        //                {
        //                    name : "field7",
        //                    value : draw[__owner.id]
        //                }
        //            ]
        //    },
        //
        //    {
        //
        //        playerId : __opponent.id,
        //
        //        scores :
        //
        //            [
        //                {
        //                    name : "field1",
        //                    value : scores[__opponent.id]
        //                },
        //
        //                {
        //                    name : "field2",
        //                    value : diffs[__opponent.id]
        //                },
        //
        //                {
        //                    name : "field3",
        //                    value : gains[__opponent.id]
        //                },
        //
        //                {
        //                    name : "field4",
        //                    value : losses[__opponent.id]
        //                },
        //
        //                {
        //                    name : "field5",
        //                    value : winner[__opponent.id]
        //                },
        //
        //                {
        //                    name : "field6",
        //                    value : loser[__opponent.id]
        //                },
        //
        //                {
        //                    name : "field7",
        //                    value : draw[__opponent.id]
        //                }
        //            ]
        //    }
        //];
        //__self.sendResult(JSON.stringify(result));

        result = {};
        result[__owner.id] = [
            {
                name: "field1",
                value: scores[__owner.id]
            },

            {
                name: "field2",
                value: diffs[__owner.id]
            },

            {
                name: "field3",
                value: gains[__owner.id]
            },

            {
                name: "field4",
                value: losses[__owner.id]
            },

            {
                name: "field5",
                value: winner[__owner.id]
            },

            {
                name: "field6",
                value: loser[__owner.id]
            },

            {
                name: "field7",
                value: draw[__owner.id]
            }
        ];

        result[__opponent.id] = [
            {
                name: "field1",
                value: scores[__opponent.id]
            },

            {
                name: "field2",
                value: diffs[__opponent.id]
            },

            {
                name: "field3",
                value: gains[__opponent.id]
            },

            {
                name: "field4",
                value: losses[__opponent.id]
            },

            {
                name: "field5",
                value: winner[__opponent.id]
            },

            {
                name: "field6",
                value: loser[__opponent.id]
            },

            {
                name: "field7",
                value: draw[__opponent.id]
            }
        ];

        __self.sendResult({
            result: result,
            reasonCode: reasonCode,
            onResult: function () {

            }
        });

        __endGameState = true;

        //__gameUi._stopCountDowns();
        __countDown.stop();
        //toastr.clear();

    };

    __self.onEnd = function (data) {
        //console.log("onEnd",data);
        //var informModal = __container.find("[mode='inform']");

        //if (!data) {
        //    informModal.find("[uiType='panel']")
        //        .addClass("panel-warning")
        //        .removeClass("panel-danger")
        //        .removeClass("panel-success");
        //    __showResultDialog(9);
        //}
    };

    __self.onPause = function () {
        //console.log("onPause");

        if (__endGameState) {
            return;
        }
        __gameState = false;

        //if (__turn != __owner.id) {
        //
        //    __gameUi._getCountDown().stop();
        //}

        //__gameUi._getCountDown().stop();

        if (__turn == __owner.id) {

            //__gameUi._pauseTimer();
        }

        if (__pauseModalShowState) {

            __showPauseModal();

        } else {
            __pauseModalShowState = true;
        }
    };

    __self.onResume = function () {
        //console.log("onResume");
        if (__endGameState) {
            return;
        }
        __gameState = true;

        if (__turn == __owner.id) {

            //__gameUi._resumeTimer();
        } else {

            // __gameUi._getCountDown().start();
        }

        if (__pauseModalShowState) {
            //__hidePauseModal();
        }
    };

    //__ui.onClose = function (callback){
    //
    //    //console.log("onClose");
    //    if (__endGameState) {
    //
    //        //__ui.close();
    //    }
    //
    //    else if (! __endGameState) {
    //
    //        var closeModal = __container.find("[mode='close']"),
    //            modalBassin = __container.find("[uiType='modalBassin']"),
    //            dismissableModals = __container.find("[uiType='modalDismiss']"),
    //            confirm = closeModal.find("[mode='confirm']");
    //
    //        modalBassin.css({
    //
    //            "position" : 'absolute',
    //            "width" : "100%",
    //            "height" : __container.height(),
    //            "background-color" : "rgba(0 ,0 , 0 , 0.5)"
    //        });
    //
    //        closeModal.css({
    //
    //            "width" : __container.width() / 2,
    //            "height" : __container.height() / 2,
    //            "left" : __container.width() / 4,
    //            "top" : ((__container.height() + 45) - (__container.height() / 2)) / 2
    //        });
    //
    //        modalBassin.fadeIn(1000);
    //        closeModal.fadeIn(1000);
    //
    //        if(! __self.isSendResultValid()) {
    //            closeModal.find(".alert").hide();
    //        } else {
    //            closeModal.find(".alert").show();
    //        }
    //
    //        dismissableModals
    //            .unbind('click')
    //            .on("click", function () {
    //                modalBassin.fadeOut(1000);
    //                closeModal.fadeOut(1000);
    //            });
    //
    //        confirm
    //            .unbind('click')
    //            .on("click", function () {
    //                if(! __endGameState ) {
    //                    if( __self.isSendResultValid()) {
    //                        __self._sendResult(false,10,7);
    //                    } else {
    //                        __unValidFinishAction(12, 14);
    //                    }
    //
    //                }
    //
    //                callback(true);
    //            });
    //    }
    //};
    //
    //__ui.onShow = function () {
    //    __gameUi._onShow();
    //    __ui.selectChat();
    //};
    //
    //__ui.onHide = function () {
    //
    //    __gameUi._onHide();
    //};

    __self.onLeave = function (params) {
        //__hidePauseModal();
        //if(__self.isSendResultValid()) {
        //    if(__receiveDataCount > 0 || !__owner.applicant) {
        //        __self._sendResult(true,15);
        //    } else {
        //        __unValidFinishAction(11);
        //    }
        //
        //} else {
        //    if(!__owner.applicant) {
        //        __self._sendResult(true,15);
        //    } else {
        //        __unValidFinishAction(11);
        //    }
        //
        //}

        if (__owner.applicant) {
            if (__receiveDataCount > 0) {
                __self._sendResult(true, 7);
            } else {
                __unValidFinishAction(14);
            }
        } else {
            __self._sendResult(true, 7);

        }

    };

    __self._sendResultData = function (isWin, reasonCode) {
        if (__endGameState) {
            return;
        }

        if (!__self.isSendResultValid()) {
            if (reasonCode == 4) {
                __self._sendResult(isWin, reasonCode);
            } else {
                __unValidFinishAction(12, 11);
            }
        } else {
            if (!__receiveDataCount) {
                if (!isWin) {
                    __self._sendResult(isWin, reasonCode, 3);
                } else {
                    __unValidFinishAction(11);
                }

            } else {
                __self._sendResult(isWin, reasonCode, 3);

            }
        }
    };

    __self._getConnectionState = function () {

        return !__isDisconnected;
    };

    __self._setTabState = function (bool) {

        //__ui.setTabState(bool);
    };

    __self.close = function () {

        //__ui.close();
    };

    __self._getTurn = function () {

        return __turn;
    };

    __self.isSendResultValid = function () {
        if (!__owner.applicant) {

            if (!__ackSendDataCount) {
                return false;
            } else {
                return true;
            }
        } else {
            return true;
        }

        //return true;
    };

    __self._saveStats = function (isFromTimer) {
        return {
            receiveDataCount: __receiveDataCount,
            ackSendDataCount: __ackSendDataCount,
            board: __board,
            parsedBoard: parseReversiBoard(__board),
            turn: isFromTimer ? __owner.id : __opponent.id,
            //totalPoints : __gameUi._getTotalPoints()};
        };
    };
    __self.playSound = function (soundName) {
        //__sounds[soundName].play();
    };

    __self._saveStateData = function () {

        __self.saveStateData({
            stateData: __self._saveStats(true)
        });
    };

    __self._showRankings = function () {

        //__parent._showRankings();
    };

    __self.getAnimatePawnState = function () {
        //return __parent.getAnimatePawnState();
    };

    __self.onInit = __init;


}

module.exports = Game;