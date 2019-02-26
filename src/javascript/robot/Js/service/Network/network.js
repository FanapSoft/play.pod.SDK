(function () {


    /*
     * Description
     * @class Network
     * @constructor
     * @module Service
     *
     * @param {Object} options
     *      @param {Service} options.parent
     *      @param {String} options.appId
     *      @param {Object} options.dic
     *      @param {String} options.lang
     *      @param {Object} options.requestUrls
     *      @param {Database} options.database
     *
     * */
    function Network(options) {
        /*==================================================================================================================
         *                                      P R I V A T E   V A R I A B L E
         *================================================================================================================*/

        var TisUtil,
            TisSocketClass,
            ServiceException,
            Request = null,
            _FormData;

        if(typeof require !== 'undefined' && typeof exports !== 'undefined') {
            TisUtil = require("./../Util/util.js");
            TisSocketClass = require("./socket.js");
            ServiceException =  require("./../Share/serviceException.js");
            _FormData = require('form-data');
            Request = require('request');
        } else {
            TisUtil = TIS.Util;
            TisSocketClass = TIS.Socket;
            _FormData = FormData;
            ServiceException = TIS.ServiceException;
        }
        
        var __self = this,
            __parent = options.parent,
            __appId = options.appId || "GAME CENTER",
            __deviceId = options.deviceId || TisUtil.generateUUID(),
            __dic = options.dic,
            __lang = options.lang || "FA",
            __config = options.config,
            __socketServerAddress = options.socketServerAddress,
        // __chatService,
            __errorCodes = {
                RUNTIME: 666,
                REQUESTFAILED: 10000
            },
            __eventCallbacks = {
                connect: {},
                disconnect: {},
                reconnect: {},
                message: {},
                report: {}
            },
            __chatServerName,
            __gameCenterName,
            __socket,
            __ackCallback = {
                /*
                 * messageId : callback
                 *
                 *
                 * */
            },
            __socketMethods = {},
            __isServerRegisterInPush = false,
            __isDeviceRegisterInPush = false,
            __activePeerRetryCount = 0,
            __connectionState = false,
            __lastMessageId = 1,
            __registerDeviceInPushTimeoutId,
            __registerServerInPushTimeoutId,
            __activePeerInGameCenterTimeoutId,
            __registerPeerInGameCenterTimeoutId,
            __pushSendDataQueue = [],
            __peerId = options.peerId,
            __isForChat = (typeof options.isForChat === "boolean") ? options.isForChat : false,
            __socketReport = options.socketReport===true,
            __isNarliga = options.isNarliga===true,
            __isSocketOpen = false,
            __logger = options.logger.getInstance({
                nameSpace: __isForChat ? "Chat Network" : "Network",
                level : __isForChat ? 3 : 1
            }),
            __sendUnique = {};


        /*==================================================================================================================
         *                                   P U B L I C    V A R I A B L E
         *================================================================================================================*/

        /*==================================================================================================================
         *                                   P R I V A T E     M E T H O D
         *================================================================================================================*/

        var __init = function (params) {
                if(params) {
                    if(params.config) {
                        __config = params.config;
                    }

                    if(typeof params.socketServerAddress === "string") {
                        __socketServerAddress = params.socketServerAddress;
                    }

                }
                __initSocket();
            },

            __dispatchSocketReport = function(text) {
                if(__isForChat) {
                    text = "CHAT " + text;
                }
                __fireEvent("report", {message: text});
            },

            __fireEvent = function (eventName,param,res) {
                try {
                    if(res) {
                        for(var id in __eventCallbacks[eventName]) __eventCallbacks[eventName][id](param,res);
                    } else {
                        for(var id in __eventCallbacks[eventName]) __eventCallbacks[eventName][id](param);
                    }
                  
                }catch (e){
                    throw new ServiceException("can not fire " + eventName + " event",e);
                }
            },
            
            __request = function (params, callback) {
                // console.log("request", params);
                var url = params.url,
                    data = params.data,
                    method = typeof params.method === "string" && params.method === "GET" ? "GET" : "POST" ;

                if (!url) {
                    callback({
                        hasError: true,
                        errorMessage: __dic.SERVER_REQUEST_ERROR[__lang]
                    });
                    return;
                }
                if(Request) {
                    if(params.headers) {
                        Request.post({url:url,body: data,headers : params.headers},
                            function (error, response, body) {
                                if (!error) {
                                    if(response.statusCode == 200) {
                                        callback && callback({
                                            hasError : false,
                                            result : {
                                                responseText : body
                                            }
                                        });
                                    } else {
                                        callback && callback({
                                            hasError: true,
                                            errorMessage: __dic.SERVER_REQUEST_ERROR[__lang]
                                        });
                                    }

                                } else {
                                    callback && callback({
                                        hasError: true,
                                        errorMessage: __dic.SERVER_REQUEST_ERROR[__lang]
                                    });
                                }
                            }
                        );
                    } else {

                        var methodFunc;
                        if(params.method === "GET") {
                            methodFunc = Request.get;
                        } else {
                            methodFunc = Request.post;
                        }

                        methodFunc({url:url,formData: data},
                            function (error, response, body) {
                                if (!error) {
                                    if(response.statusCode == 200) {

                                        callback && callback({
                                            hasError : false,
                                            result : {
                                                responseText : body
                                            }
                                        });
                                    } else {
                                        callback && callback({
                                            hasError: true,
                                            errorMessage: __dic.SERVER_REQUEST_ERROR[__lang]
                                        });
                                    }

                                } else {
                                    callback && callback({
                                        hasError: true,
                                        errorMessage: __dic.SERVER_REQUEST_ERROR[__lang]
                                    });
                                }
                            }
                        );
                    }
                    return;
                }
                var request = new XMLHttpRequest();
                var setting = params.setting;
                request.timeout = (setting && typeof  setting.timeout === "number" && setting.timeout > 0) ? setting.timeout : __config.hrt;
                var hasErrorSend = false;
                request.addEventListener("error", function (event) {
                    if (hasErrorSend) {
                        return;
                    }
                    if (callback) {
                        callback({
                            hasError: true,
                            errorMessage: __dic.SERVER_REQUEST_ERROR[__lang],
                            errorCode: Network.ErroCodes.REQUESTFAILED
                        });
                        hasErrorSend = true;
                    }
                }, false);

                try {

                    if(method === "GET") {
                        if(typeof data === "object" && data !== null) {
                            var keys = Object.keys(data);
                            if(keys.length>0) {
                                url += "?";
                                for (var i = 0; i < keys.length; i++) {
                                    var key = keys[i];
                                    url += (key + "=" + data[key]);

                                    if(i<keys.length-1) {
                                        url += "&";
                                    }
                                }
                            }
                        } else if(typeof data === "string"){
                            url += "?" + data;
                        }

                    }

                    request.open(method, url, true);

                    if(method === "POST" && data) {
                        if(typeof params.headers=== "object") {
                            for(var key in params.headers) {
                                request.setRequestHeader(key, params.headers[key]);
                            }
                            request.send(data);
                        } else if (typeof data === "object") {
                            var formData = new _FormData();
                            for (var key in data) {

                                if(Array.isArray(data[key])) {

                                    for (var i = 0; i < data[key].length; i++) {
                                        formData.append(key, data[key][i]);
                                    }
                                } else {
                                    formData.append(key, data[key]);
                                }

                            }

                            request.send(formData);

                        } else {
                            request.send(data);
                        }
                    } else {
                        request.send();
                    }


                } catch (e) {
                    var returnData = {
                        hasError: true,
                        errorMessage: __dic.SERVER_REQUEST_ERROR[__lang]
                    };
                    callback(returnData);
                }


                request.onreadystatechange = function () {
                    // console.log("Aaaaaaa", params.url, request.readyState);
                    if (request.readyState == 4) {
                        if (request.status == 200) {
                            callback && callback({
                                hasError : false,
                                result : {
                                    responseText : request.responseText,
                                    responseHeaders : TisUtil.parseResponseHeaders(request.getAllResponseHeaders())
                                }
                            });
                        } else {
                            if (hasErrorSend) {
                                return;
                            }
                            if (callback) {
                                var returnData = {
                                    hasError: true,
                                    errorMessage: __dic.SERVER_REQUEST_ERROR[__lang],
                                    errorCode: __errorCodes.REQUESTFAILED,
                                    statusCode : request.status
                                };
                                callback(returnData);
                                hasErrorSend = true;
                            }
                        }

                    }
                };
            },

            __pushSendMessage = function(message) {
                if(__connectionState) {
                    __socket.emit(message);
                } else {
                    __pushSendDataQueue.push(message);
                }
            },

            __clearTimeout = function() {

                if(__registerDeviceInPushTimeoutId != undefined) {
                    clearTimeout(__registerDeviceInPushTimeoutId);
                    __registerDeviceInPushTimeoutId = undefined;
                }

                if(__registerServerInPushTimeoutId != undefined) {
                    clearTimeout(__registerServerInPushTimeoutId);
                    __registerServerInPushTimeoutId = undefined;
                }

                if(__activePeerInGameCenterTimeoutId != undefined) {
                    clearTimeout(__activePeerInGameCenterTimeoutId);
                    __activePeerInGameCenterTimeoutId = undefined;
                }

                if(__registerPeerInGameCenterTimeoutId != undefined) {
                    clearTimeout(__registerPeerInGameCenterTimeoutId);
                    __registerPeerInGameCenterTimeoutId = undefined;
                }

            },

            __pushSendDataQueueHandler = function() {
                // for (var i = 0; i < __pushSendDataQueue.length; i++) {
                //     var msg = __pushSendDataQueue[i];
                //     __pushSendDataQueue.splice(i,1);
                //     __pushSendMessage(msg);
                // }
                // __pushSendDataQueue = [];

                while (__pushSendDataQueue.length > 0 && __connectionState) {
                    var msg = __pushSendDataQueue.splice(0,1)[0];
                    __pushSendMessage(msg);
                }
            },

            __initSocket = function () {

                setTimeout(function () {
                    if (!__isSocketOpen) {
                        __dispatchSocketReport("Error > Can Not Open Socket ");
                    }
                }, 60000);
                __socket = new TisSocketClass({
                    parent: __self,
                    config : __config,
                    socketServerAddress :__socketServerAddress,
                    isForChat : __isForChat,
                    isNarliga : __isNarliga,
                    logger : __logger
                });

                __socket.on("message", function (params) {
                    __handleSocketMessage(params);
                });

                __socket.on("open", function () {
                    __isSocketOpen = true;
                    __registerDeviceInPush();
                });

                __socket.on("close", function (e) {
                    __isSocketOpen = false;
                    __dispatchSocketReport("Error > SOCKET CLOSE " + e.code);

                    //__socket.close();
                    __isDeviceRegisterInPush = false;
                    if(__connectionState) {
                        __connectionState = false;
                        __fireEvent("disconnect", e);
                    }

                    if(e && e.code>= 4100) {
                        __peerId = undefined;
                        __isServerRegisterInPush = false;
                    }

                    __clearTimeout();

                    var timeout = (e.code == 4002 ||e.code == 1005) ? 500 : __config.wsto;

                    setTimeout(function(){
                        setTimeout(function () {
                            if (!__isSocketOpen) {
                                __dispatchSocketReport("Error > Can Not Open Socket ");
                            }
                        }, 60000);
                        __socket.connect();
                    }, timeout);
                });

                __socket.on("error", function (params) {

                });
            },

            __handleSocketMessage = function (message) {
                var res;

                if (message.type == 5 || message.type == 4) {
                    res = function () {
                        __pushSendMessage({
                            content: {
                                receivers: [message.senderId],
                                messageId: message.id
                            },
                            type: 6
                        });
                    };
                }
                // if (params.senderName && params.senderName == __chatServerName) {
                //     __handleChatMessage(params);
                //     res && res();
                // } else {
                //     __handleServiceMessage(params, res);
                // }

                switch (message.type) {

                    case 1 :

                        if (message.senderName && message.senderName == __chatServerName) {
                            __fireEvent("message",message,res);
                        } else {
                            __activePeerInGameCenter();
                        }
                        break;

                    case 2 :
                        __handleDeviceRegisterMessage(message.content);
                        break;

                    case 3 :
                    case 4 :
                    case 5 :
                        __fireEvent("message",message,res);
                        break;

                    case 6 :
                        if(typeof __ackCallback[message.senderMessageId] == "function") {
                            __ackCallback[message.senderMessageId]();
                            delete __ackCallback[message.senderMessageId];
                        }

                        break;
                }
            },

            __registerDeviceInPush = function(isRetry) {
                // console.log("__registerDeviceInPush_1");
                //if(__registerDeviceInPushTimeoutId) {
                //    return;
                //}
                //console.log("__registerDeviceInPush",__peerId);
                __isDeviceRegisterInPush = false;
                var content = {
                    appId: __appId,
                    deviceId: __deviceId
                };

                if(__peerId != undefined) {
                    content.peerId = __peerId;
                    content.refresh = true;
                    //content.renew = true;
                } else {
                    if(!isRetry) {
                        content.renew = true;
                    }
                }

                __socket.emit({
                    type: 2,
                    content: content
                });

                __registerDeviceInPushTimeoutId =
                    setTimeout(function(){
                        //console.log("__registerDeviceInPush--Retry",__peerId,__isDeviceRegisterInPush);
                        if(!__isDeviceRegisterInPush) {
                            __dispatchSocketReport("Error > TRY SEND DEVICE REGISTER TO PUSH");
                            __registerDeviceInPush(true);
                        }
                    },__config.pcrit)
            },

            __handleDeviceRegisterMessage = function (peerId) {
                __logger.info("DEVICE REGISTER--0", peerId)();
                if(__isDeviceRegisterInPush) {
                    return;
                }

                console.log(__isForChat ? "Chat" : "Game","PEER ID",peerId);
                if(__registerDeviceInPushTimeoutId) {
                    __clearTimeout(__registerDeviceInPushTimeoutId);
                    __registerDeviceInPushTimeoutId = undefined;
                }
                __isDeviceRegisterInPush = true;
                if (__gameCenterName) {
                    __logger.info("DEVICE REGISTER--1")();
                    if (__peerId != peerId) {
                        __logger.info("DEVICE REGISTER-2")();
                        __peerId = peerId;
                        __registerPeerInGameCenter();

                    } else {
                        __logger.info("DEVICE REGISTER--3")();
                        if(__isServerRegisterInPush) {
                            __connectionState = true;
                            __pushSendDataQueueHandler();
                            // __chatService.onReconnect(__peerId);
                            __fireEvent("reconnect",__peerId);
                        } else {
                            __registerServerInPush();
                        }

                    }

                } else {
                    __logger.info("DEVICE REGISTER--4")();
                    __peerId = peerId;
                    __registerPeerInGameCenter();
                }

            },

            __registerPeerInGameCenter = function() {
                //console.log("__registerPeerInGameCenter",__peerId);
                __isServerRegisterInPush = false;
                __logger.info("REGISTER PEER IN GAME CENTER---0")();
                __parent.registerPeerId(__peerId, function (result) {

                    //console.log("__registerPeerInGameCenter--res",result,__peerId);
                    __logger.info("REGISTER PEER IN GAME CENTER---1",result)();
                    if(result.hasError) {
                        __dispatchSocketReport("Error >  REGISTER PEER IN GAME CENTER : " + result.errorMessage);
                        __registerPeerInGameCenterTimeoutId  = setTimeout(__registerPeerInGameCenter, __config.smit);
                    } else {
                        __gameCenterName = result.result;
                        __registerServerInPush();
                    }

                });
            },

            __registerServerInPush = function() {
                // console.log("__registerServerInPush",__deviceId);
                __logger.info("REGISTER PEER IN PUSH-0")();
                __socket.emit({
                    type : 1,
                    content : {
                        name : __gameCenterName
                    }
                });
                // console.log("__registerServerInPush_1",__isForChat,__gameCenterName,__deviceId,__peerId);
                __registerServerInPushTimeoutId = setTimeout(function () {
                    if(!__isServerRegisterInPush) {
                        __dispatchSocketReport("Error > TRY SEND REGISTER SERVER TO PUSH");
                        __registerServerInPush();
                    }
                }, __config.pcrit);
            },

            __activePeerInGameCenter = function () {
                __logger.info("PUSH CONNECT")();
                if(__isServerRegisterInPush || ! __peerId) {
                    return;
                }
                __isServerRegisterInPush = true;
                __parent.activatePeerId(__peerId, function (result) {
                    //console.trace("__activePeerInGameCenter--Res",result,__activePeerRetryCount);
                    if (result.hasError) {
                        __dispatchSocketReport("Error >  IN ACTIVE PEER IN GAME CENTER : " + result.errorMessage);
                        __isServerRegisterInPush = false;
                        __activePeerInGameCenterTimeoutId = setTimeout(__activePeerInGameCenter, __config.smit);
                    } else {
                        __connectionState = true;
                        __pushSendDataQueueHandler();
                        if (__activePeerRetryCount == 0) {
                            __fireEvent("connect",__peerId);
                        } else {
                            // __chatService.onReconnect(__peerId);
                            __fireEvent("reconnect",__peerId);
                        }
                        __activePeerRetryCount += 1;
                    }

                });
            };


        /*==================================================================================================================
         *                                 P U B L I C     M E T H O D
         *================================================================================================================*/

        this.on = function(eventName,callback) {

            if(__eventCallbacks[eventName]) {
                var id = TisUtil.generateUUID();
                __eventCallbacks[eventName][id] = callback;
                return id;
            }

            if(eventName === "connect" && __connectionState) {
                callback(__peerId);
            }

        };

        /**
         *
         * @method emit
         *
         * @param {Object} params
         *      @param {Integer} params.timeout
         *      @param {Object} params.content
         *              @param {Array} params.content.receivers
         *              @param {Object} params.content.content           this object should be stringify
         *                  @param {Number} params.content.content.type  protocol type between service and game center
         *                  @param {Object} params.content.content.content
         *
         *      @param {Number} params.type  protocol type between service and push server
         *
         * @param callback
         *
         * */
        this.emit = function(params,callback) {
            // console.log("EMIT - 0",params.uniqueId);
            if(__isForChat && params.uniqueId) {
                // console.log("EMIT - 1",params.uniqueId);
                if(__sendUnique[params.uniqueId]) {
                    // console.log("EMIT - 2",params.uniqueId);
                    return;
                }else {
                    // console.log("EMIT - 3",params.uniqueId);
                    __sendUnique[params.uniqueId] = true
                }
            }
            var messageType = (typeof params.type === "number") ? params.type : (callback) ? 5 : 3;
            var socketData = {
                content: params.content,
                type: messageType
            };
            if(messageType === 5 || messageType === 4) {
                __lastMessageId +=1;
                var messageId = __lastMessageId;
                //var currentTime = new Date();
                __ackCallback[messageId] = function() {
                    //__logger.info("Response Time ",new Date() - currentTime)();
                    callback && callback(TisUtil.createReturnData(false,"",0,null));
                };
                socketData.content.ttl = __config.pmttl;
                socketData.content.messageId = messageId;

                if(typeof params.timeout === "number" && params.timeout > 0) {
                    setTimeout(function () {
                        if(typeof __ackCallback[messageId] === "function") {
                            callback && callback(TisUtil.createReturnData(true,"Request Timeout",TIS.Network.ErroCodes.TIMEOUT,null));
                            delete  __ackCallback[messageId];
                        }
                    },params.timeout)
                }
            }

            __pushSendMessage(socketData);
        };

        /**
         *
         * @method request
         *
         * @param {Object} params
         *      @param {String} params.url
         *      @param {Object} params.data
         * @param {Function} callback
         *      @param {Boolean} callback.hasError
         *      @param {String} callback.errorMessage
         *      @param {Object} callback.result
         *          @param {String} callback.responseText
         * */
        this.request = __request;

        this.getSocketConnectionState = function() {
            return __connectionState;
        };

        this.getPeerId = function() {
            return __peerId;
        };

        this.setChatServerName = function(serverName) {
            __chatServerName = serverName;
        };


        this.onLogin = function(params) {

        };

        this.onLogout = function(params) {
            __peerId = undefined;
            __isServerRegisterInPush = false;
            __isDeviceRegisterInPush = false;
            __activePeerRetryCount = 0;
            //__connectionState = false;
            __clearTimeout();
            __socket.onLogout();

        };

        this.reconnectSocket = function () {
            __peerId = undefined;
            __isServerRegisterInPush = false;
            __isDeviceRegisterInPush = false;
            __clearTimeout();
            __socket.close();
        };

        this.isSocketOpen = function () {
            return __isSocketOpen;
        };

        this.init = __init;

        // if(!__isForChat) {
        //     window.reconnectSocket = this.reconnectSocket;
        // }

    }

    Network.ErroCodes = {
        RUNTIME: 666,
        MAJOR_CONFLICT: 1110,
        REQUESTFAILED: 10000,
        USER_NOT_CONNECTED : 10001,
        GAME_NOT_FOUND : 1094,
        TIMEOUT : 10001,
        PEER_CLEAR: 1134,
        NOT_ACCESS: 1005
    };

    if(typeof exports !== 'undefined' && module.exports) {
        module.exports = Network;
    } else {
        if(!window.TIS) {
            window.TIS = {};
        }
        window.TIS.Network = Network;
    }

})();