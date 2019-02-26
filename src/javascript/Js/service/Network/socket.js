(function () {

    /*
     * Description
     * @class Socket
     * @constructor
     * @module Service
     *
     * @param {Object} params
     *      @param {_Network} params.parent
     *      @param {Object} params.config
     *
     * */
    function Socket(params) {

        if(typeof WebSocket === "undefined" && typeof require !== 'undefined' && typeof exports !== 'undefined') {
            WebSocket = require("ws");
        }
        
        /*==================================================================================================================
         *                                      P R I V A T E   V A R I A B L E
         *================================================================================================================*/
        var __self = this,

            __parent = params.parent,
            __config = params.config,
        // __address = __config.pushServerAddress,
            __address = params.socketServerAddress,
            __fullAddress = __address,
            __isNarliga = params.isNarliga,
            __isForChat = params.isForChat,
            __eventCallback = {
                /*
                 * messageName : callback
                 * messageName : callback
                 * */
            },
            __lastMessageTime,
            __lastMessageTimeoutId,
            __lastPingTimeoutId,
            __waitConnectionTimeoutId,
            __pcct  = __config.pcct,//push check connection timeout
            __pcctt = __config.pcctt,//webSocket check connection timeout threshold
            __WSCWTI = __config.wscwti,//webSocket connection wait time interval
            __pingTimeCheck = __pcct - __pcctt,
            __logger = params.logger.getInstance({
                nameSpace:__isForChat ? "Chat Socket":"Socket",
                level : __isForChat ? 3 : 1
            }),
            __socket;

        /*==============================================================================================================
         *                                   P U B L I C    V A R I A B L E
         *============================================================================================================*/

        /*==============================================================================================================
         *                                   P R I V A T E     M E T H O D
         *============================================================================================================*/


        var __init = function() {
                __connect();
            },

            __ping = function() {
                __sendData({
                    type: 0
                });

                // console.log("PING_0",__isForChat);
                __lastPingTimeoutId = setTimeout(function () {
                    var currentDate = new Date();
                    __logger.info("PING---1",currentDate,__lastMessageTime,currentDate - __lastMessageTime,(__pcct+__pcct))();
                    if(currentDate - __lastMessageTime >= (__pcct+__pcct - 1000)) {
                        // console.log("PING_1",__isForChat);
                        __logger.info("PING---2")();
                        console.log("CLOSE SOCKET BY OWN");
                        __socket.close(4002);
                    }
                }, __pcct);
            },

            __connect = function() {
                try{
                    __socket = new WebSocket(__fullAddress,[]);

                    __socket.onopen = function(event) {
                        __logger.info("SOCKET OPEN_0")();
                        __waitForSocketConnection(function () {
                            __logger.info("SOCKET OPEN_1")();
                            __eventCallback["open"]();
                        });
                    };

                    __socket.onmessage = function(event) {
                        var serverMSG = JSON.parse(event.data);
                        __logger.info("SOCKET MSG",serverMSG.type,__parent.getPeerId())();
                        __eventCallback["message"](serverMSG);

                        clearTimeout(__lastMessageTimeoutId);
                        clearTimeout(__lastPingTimeoutId);
                        __lastMessageTime = new Date();
                        __lastMessageTimeoutId = setTimeout(function () {
                            var currentDate = new Date();

                            if(currentDate - __lastMessageTime >= __pingTimeCheck) {
                                // console.log("aaaaaa",__isForChat,__lastMessageTime,__pingTimeCheck);
                                __ping();
                            }
                        }, __pcct);
                    };

                    __socket.onclose = function(event) {
                        console.log("SOCKET ---- CLOSE",__isForChat,__isNarliga,event.code);
                        __logger.info('SOCKET CLOSE',__isForChat,__isNarliga,event.code)();
                        clearTimeout(__lastMessageTimeoutId);
                        clearTimeout(__lastPingTimeoutId);
                        __eventCallback["close"](event);
                    };

                    __socket.onerror = function(event) {
                        console.log("SOCKET ---- ERROR",__isForChat,__isNarliga,__parent.getPeerId());
                        __logger.info('SOCKET ERROR',__isForChat,__isNarliga,__parent.getPeerId())();
                        __eventCallback["error"](event);
                    };
                } catch(e) {
                    //alert("websocket not suport!");
                }
            },

            __waitForSocketConnection = function(callback){
                if(__waitConnectionTimeoutId) {
                    clearTimeout(__waitConnectionTimeoutId);
                }
                __waitConnectionTimeoutId = setTimeout(
                    function(){
                        if (__socket.readyState === 1) {
                            callback();
                        } else {
                            __waitForSocketConnection(callback);
                        }
                    }, __WSCWTI);
            },

            __sendData = function(params) {

                var sendData = {
                    type : params.type
                };

                //if(typeof params.senderMessageId == "number") {
                //    sendData.senderMessageId = params.senderMessageId;
                //}

                try {
                    if(params.content) {
                        sendData.content = JSON.stringify(params.content);
                    }
                    __socket.send(JSON.stringify(sendData));
                } catch (e){
                    __logger.info("FAIL SOCKET",e)();
                }
            };

        /*==============================================================================================================
         *                                 P U B L I C     M E T H O D
         *============================================================================================================*/

        this.on = function(messageName,callback) {
            __eventCallback[messageName] = callback;
        };

        this.emit = __sendData;

        this.disconnect = function() {
            __socket.close();
        };

        this.connect = function() {
            __connect();
        };

        this.close = function() {
            __lastMessageTimeoutId && clearTimeout(__lastMessageTimeoutId);
            __lastPingTimeoutId && clearTimeout(__lastPingTimeoutId);
            __socket.close(4002);
        };

        this.onLogout = function() {
            __lastMessageTimeoutId && clearTimeout(__lastMessageTimeoutId);
            __lastPingTimeoutId && clearTimeout(__lastPingTimeoutId);
            __socket.close(4001);
        };


        __init();
    }

    if(typeof exports !== 'undefined' && module.exports) {
        module.exports = Socket;
    } else {
        if(!window.TIS) {
            window.TIS = {};
        }
        window.TIS.Socket = Socket;
    }
})();