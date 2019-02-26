(function () {
    /**
     * Description
     * @class ChatService
     * @constructor
     * @module Service
     *
     * */
    function ChatService(params) {

        var TisNetworkClass;
        var TisServiceClass;
        var TisUtil = TIS.Util;

        if(typeof require !== 'undefined' && typeof exports !== 'undefined') {
            TisNetworkClass = require("./../Network/network.js");
            TisServiceClass = require("./../service.js");
            TisUtil = require("./../Util/util.js");
        } else {
            TisNetworkClass = TIS.Network;
            TisServiceClass = TIS.Service;
            TisUtil = TIS.Util;
        }
        
        /*==================================================================================================================
         *                                      P R I V A T E   V A R I A B L E
         *================================================================================================================*/
        var __self = this,
            __requestUrls = params.requestUrls,
            __serverData = params.serverData,
            __configData = params.config,
            __network,
            __dic = params.dic,
            __service = params.service,
            __lang = params.lang,
            __peerId = undefined,
            __tempPeerId = undefined,
            __appId = params.appId,
            __deviceId = params.deviceId,
            __logger = __service.getLogger().getInstance({nameSpace : "ChatService",level : 3}),
            __isRegisterInChatServer = false,
            __isLogin = false,
            __lastMessageId = 1,
            __messageTypes = {
                CHECK_VERSION: 1,
                C2C_Message: 2,
                MATCH_SUGGESTION: 3,
                NOTIFICATION: 4
            },
            __chatMessageVOTypes = {
                INVITATION: 1,
                MESSAGE: 2,
                SENT: 3,
                DELIVERY: 4,
                SEEN: 5,
                PING: 6,
                BLOCK: 7,
                UNBLOCK: 8,
                LEAVE_THREAD: 9,
                RENAME: 10,
                ADD_PARTICIPANT: 11,
                GET_STATUS: 12,
                GET_CONTACTS: 13,
                GET_THREADS: 14,
                GET_HISTORY: 15,
                CHANGE_TYPE : 16,
                LAST_SEEN_TYPE : 17,
                REMOVE_PARTICIPANT : 18,
                MUTE_THREAD : 19,
                UNMUTE_THREAD : 20,
                FORWARD_MESSAGE : 22
            },
            __chatTypes = {
                PRIVATE : 0,
                OWNER_GROUP : 1,
                PUBLIC_GROUP : 2,
                CHANNEL_GROUP : 4,
                CHANNEL : 8
            },
            __userData,
            __serverName,
            __messagesCallbacks = {},
            __sendMessageCallbacks = {},
            __registerChatInPushTimeoutId,
            __eventCallbacks = {
                connect : {},
                disconnect : {},
                reconnect : {},
                serverRegister: {},
                message : {},
                forwardMessage : {},
                newThread : {},
                leaveThread : {},
                newParticipant : {},
                deliver : {},
                seen : {},
                sent : {},
                login : {},
                logout : {},
                report : {}
            },

            __networkMethods = {},
            __isCheckLoginActionWithPeer = false,
            __temporaryPeerData = {
                peerId : null,
                lastTime : 0,
                deviceId : TisUtil.generateUUID(),
                loading : false
            };


        /*==================================================================================================================
         *                                   P R I V A T E     M E T H O D
         *================================================================================================================*/

        var __init = function () {
                __initServiceEvent();

                __network = new TisNetworkClass({
                    socketReport : params.socketReport,
                    isNarliga : params.isNarliga,
                    parent : __networkMethods,
                    dic : __dic,
                    config : __configData,
                    socketServerAddress :__configData.csa,
                    lang : __lang,
                    appId : __appId  + "_CHAT",
                    deviceId : __deviceId,
                    isForChat : true,
                    logger : __logger
                });

                __network.init();

                __network.on("connect", function (peerId) {
                    __logger.info("connect",peerId)();
                    __peerId = peerId;
                    __loginActionWithPeer();
                    __fireEvent("connect");
                });

                __network.on("disconnect", function () {
                    __logger.info("disconnect")();
                    __tempPeerId = __peerId;
                    __peerId = undefined;
                    __fireEvent("disconnect");
                });

                __network.on("reconnect", function (peerId) {
                    if(__isLogin &&((__peerId && __peerId !== peerId) || (__tempPeerId && __tempPeerId !== peerId) )) {
                        __peerId = peerId;// __registerChatInGameCenter use __peerId
                        __registerChatInGameCenter();
                    }
                    __peerId = peerId;
                    __fireEvent("reconnect");
                });

                __network.on("message", function (params,res) {
                    // __handlePushMessageContent(params,res);
                    __pushMessageHandler(params);
                    res && res();
                });

                __network.on("report", function (params) {
                    __fireEvent("report",params)
                });
            },

            __initServiceEvent = function () {
                __service.on("login", function (userData) {
                    __isLogin = true;
                    __userData = userData;
                    __peerId = __network.getPeerId();
                    __loginActionWithPeer();
                    __fireEvent("login",__userData);
                });
                __service.on("logout", function (userData) {
                    __isLogin = false;
                    __peerId = undefined;
                    __userData = undefined;
                    __isCheckLoginActionWithPeer = false;
                    __registerChatInPushTimeoutId && clearTimeout(__registerChatInPushTimeoutId);
                    __isRegisterInChatServer = false;
                    __network.onLogout();

                    __fireEvent("logout");
                });
            },

            __request = function (reqUrlName, data, callback, setting) {

                var url;

                if (__requestUrls[reqUrlName]) {
                    var uri = (setting && (setting.url ||  setting.uri )) || __requestUrls[reqUrlName].uri ;

                    var hostName = __requestUrls[reqUrlName].hostName;

                    if (hostName === "GAME_CENTER") {
                        if(__configData.har) {
                            __asyncRequest(reqUrlName, data, callback, setting);
                            return;
                        } else {
                            url = __serverData[hostName].address + uri;
                        }


                    } else {
                        url = __serverData[hostName].address + uri;
                    }
                } else {
                    url = reqUrlName
                }


                if (__userData &&__userData.token) {
                    if (setting && typeof setting.addToken == "boolean") {
                        if (setting.addToken) {
                            data._token = __userData.token;
                            data._token_issuer = __userData.tokenIssuer;
                        }
                    } else {
                        data._token = __userData.token;
                        data._token_issuer = __userData.tokenIssuer;
                    }
                }

                __httpRequest(url, data, callback, setting);

            },

            __getPeerIdFromHttpRequest = function (callback) {

                var currentTime = new Date();

                if (__peerId || (__temporaryPeerData.peerId && (currentTime - __temporaryPeerData.lastTime < 5000))) {
                    callback(__peerId || __temporaryPeerData.peerId);
                } else {

                    if (!__temporaryPeerData.loading) {

                        var action = "register";

                        var url = __serverData.ASYNC.address + "/register/?action=register&deviceId=" + __temporaryPeerData.deviceId + "&appId=" + __appId;
                        __temporaryPeerData.loading = true;
                        __httpRequest(url, null, function (res) {
                            __temporaryPeerData.loading = false;
                            var result;
                            if (res.success) {
                                var peerId = JSON.parse(res.content).token;
                                __temporaryPeerData.peerId = peerId;
                                __temporaryPeerData.lastTime = currentTime;
                                callback(peerId);
                            } else {
                                setTimeout(function () {
                                    __getPeerIdFromHttpRequest(callback);
                                }, __configData.smit);
                            }
                        }, {method: "GET"});
                    } else {
                        setTimeout(function () {
                            __getPeerIdFromHttpRequest(callback);
                        }, __configData.smit);
                    }

                }

            },

            __asyncRequest = function (reqUrlName, data, callback, setting) {

                __getPeerIdFromHttpRequest(function (peerId) {
                    var uri = (__requestUrls[reqUrlName] &&__requestUrls[reqUrlName].uri) || setting.uri;

                    var parameters = [];

                    for (var key in data) {
                        parameters.push({
                            name: key,
                            value: data[key]
                        });
                    }

                    if(setting && Array.isArray(setting.parameters)) {
                        for (var i = 0; i < setting.parameters.length; i++) {
                            parameters.push(setting.parameters[i]);
                        }
                    }

                    var asyncData = {
                        trackerId: 1001,
                        content: JSON.stringify({
                            content: JSON.stringify({
                                "remoteAddr": null,
                                "serverKey": 0,
                                "oneTimeToken": null,
                                "parameters": parameters,
                                "msgType": 3,
                                "uri": uri,
                                "tokenIssuer": __userData && __userData.tokenIssuer,
                                "token": __userData && __userData.token,
                                // "messageId": 1001,
                                "expireTime": 0
                            }),
                            // messageId: 1001,
                            // peerName: "245",
                            priority: 1,
                            receivers: (setting && setting.receivers)? setting.receivers :__configData.ahrr,
                            ttl: 0,
                        }),
                        "type": 3
                    };

                    var paramData = "data=" + JSON.stringify(asyncData) + "&peerId=" + peerId;

                    var url = __serverData.ASYNC.address + "/srv";

                    if(!setting) {
                        setting = {};
                    }

                    if(!setting.headers) {
                        setting.headers = {};
                    }

                    setting.method = "POST";
                    setting.headers = {
                        "content-type" : "application/x-www-form-urlencoded"
                    }
                    var formData = null;



                    __httpRequest(url, paramData, function (res) {

                        var result = {
                            HasError: true,
                            ErrorMessage: __dic.ERRORINPROCESS[__lang],
                            ErrorCode: TisNetworkClass.ErroCodes.REQUESTFAILED
                        };

                        if (typeof  res.content == "string") {
                            try {
                                result = JSON.parse(res.content);
                            } catch (e) {
                            }
                        }

                        callback && callback(result);
                    }, setting);
                });
            },


            __httpRequest = function (url, data, callback, setting) {

                var params = {
                    url: url,
                    data: data
                };

                if (setting) {

                    if (setting.headers) {
                        params.headers = setting.headers;
                    }

                    if (setting.method) {
                        params.method = setting.method;
                    }

                }
                var maxTry,
                    currentTryCount = 0,
                    intervalTime = 0;

                if (setting) {
                    intervalTime = (typeof setting.intervalTime == "number") ? setting.intervalTime : 0;
                    maxTry = (typeof setting.maxTry == "number") ? setting.maxTry : 0;
                }

                function req(requestData) {
                    __network.request(requestData, function (result) {

                        var hasError = result.hasError,
                            response = {
                                HasError: result.hasError,
                                ErrorMessage: result.errorMessage,
                                ErrorCode: result.errorCode
                            };

                        if (result.statusCode) {
                            response.StatusCode = result.statusCode;
                        }

                        if (!hasError) {
                            response = JSON.parse(result.result.responseText);
                            hasError = response.HasError;
                        }
                        if (hasError) {
                            if (intervalTime) {
                                if (typeof maxTry == "number") {

                                    if (currentTryCount < maxTry) {
                                        setTimeout(function () {
                                            req(requestData);
                                        }, intervalTime);
                                    } else {
                                        callback(response);
                                    }
                                } else {
                                    setTimeout(function () {
                                        req(requestData);
                                    }, intervalTime);
                                }


                            } else {
                                if (typeof maxTry == "number") {
                                    if (currentTryCount < maxTry) {
                                        req(requestData);
                                    } else {
                                        callback(response);
                                    }
                                } else {
                                    callback(response);
                                }
                            }

                        } else {
                            // var responseHeaders = result.result.responseHeaders;
                            // if (responseHeaders && responseHeaders.Timestamp && !__serverTime) {
                            //     __serverTime = new Date(parseInt(responseHeaders.Timestamp));
                            // }

                            callback(response);
                        }

                        currentTryCount += 1;
                    });
                }

                req(params);

            },

            __loginActionWithPeer = function() {

                if(!__isCheckLoginActionWithPeer && __peerId && __isLogin) {
                    __registerChatInGameCenter();
                    __isCheckLoginActionWithPeer = true;
                }
            },

            __sendMessage = function (params,callbacks) {
                var messageVO = {
                    type: params.chatMessageVOType
                };

                if (params.threadId) {
                    messageVO.subjectId = params.threadId;
                }

                if(params.repliedTo) {
                    messageVO.repliedTo = params.repliedTo;
                }

                if (params.content) {
                    if(typeof params.content == "object") {
                        messageVO.content = JSON.stringify(params.content);
                    } else {
                        messageVO.content = params.content;
                    }

                }
                __lastMessageId += 1;
                // var uniqueId =  ("" + __lastMessageId);
                var uniqueId;

                if(typeof params.uniqueId != "undefined") {
                    uniqueId = params.uniqueId;
                } else {
                    uniqueId =  TisUtil.generateUUID();
                }

                if(Array.isArray(uniqueId)) {
                    messageVO.uniqueId = JSON.stringify(uniqueId);
                } else {
                    messageVO.uniqueId = uniqueId;
                }


                if(typeof callbacks == "object") {
                    if (callbacks.onSeen || callbacks.onDeliver || callbacks.onSent) {
                        __messagesCallbacks[uniqueId] = function(params) {
                            var messageId = params.messageId;
                            callbacks.onSent && callbacks.onSent(params);

                            __sendMessageCallbacks[messageId] = {};

                            if (callbacks.onSeen) {
                                __sendMessageCallbacks[messageId].onSeen = callbacks.onSeen;
                            }

                            if (callbacks.onDeliver) {
                                __sendMessageCallbacks[messageId].onDeliver = callbacks.onDeliver;
                            }

                        };

                    } else if(callbacks.onResult) {

                        __messagesCallbacks[uniqueId] = callbacks.onResult;
                    }
                }

                if(params.metaData) {
                    messageVO.metadata = params.metaData;
                }
                var data = {
                    type: (typeof params.pushMsgType == "number") ? params.pushMsgType : 3,
                    content: {
                        peerName: __serverName,
                        priority : __configData.cmp,
                        content: JSON.stringify(messageVO)
                    },
                    uniqueId :messageVO.uniqueId,
                    timeout : params.timeout
                };

                __network.emit(data,function (res) {

                    if(res.hasError && callbacks) {
                        if(typeof callbacks == "function") {
                            callbacks(res);
                        } else if(typeof callbacks== "object" && typeof callbacks.onResult=="function"){
                            callbacks.onResult(res);
                        }

                        if(__messagesCallbacks[uniqueId]) {
                            delete  __messagesCallbacks[uniqueId];
                        }
                    }
                });

                return {
                    uniqueId : uniqueId
                }
            },

            __chatRequest = function (params,callback) {

                if(! (params && params.userId)) {
                    if(callback) {
                        callback({
                            hasError: true,
                            errorMessage: "set user id."
                        });
                    }
                    return;
                }

                var uniqueId;

                if(params.uniqueId) {
                    uniqueId = params.uniqueId;
                } else {
                    uniqueId = __userData.id + "_" + TisUtil.generateUUID();
                }
                __request("chatRequest", {
                    usersId: JSON.stringify([params.userId]),
                    uniqueId: uniqueId
                }, function (res) {
                    if(callback) {
                        callback({
                            hasError : res.HasError,
                            errorMessage :res.ErrorMessage,
                            errorCodee : res.ErrorCode,
                            result : res.Result
                        })
                    }
                }, {
                    intervalTime: (params.setting && typeof params.setting.intervalTime === "number") ? params.setting.intervalTime : __configData.smit,
                    maxTry: (params.setting && typeof params.setting.maxTry === "number") ? params.setting.maxTry : __configData.dmt
                });

                return {
                    uniqueId : uniqueId
                }

            },

            __registerChatInPushServer = function () {
                __network.emit({
                    type: 1,
                    content: {
                        name: __serverName
                    }
                });


                __registerChatInPushTimeoutId = setTimeout(function () {
                    if (!__isRegisterInChatServer && __userData.loginState) {
                        __registerChatInPushServer();
                    }
                }, __configData.smit);
            },

            __registerChatInGameCenter = function () {
                __request("setChatId", {peerId: __peerId}, function (result) {
                    if (!result.HasError) {
                        __serverName = result.Result.serverName;
                        __network.setChatServerName(__serverName);
                        __registerChatInPushServer();
                    } else {
                        if(result.ErrorCode === TisNetworkClass.ErroCodes.REQUESTFAILED) {
                            setTimeout(__registerChatInGameCenter, __configData.smit);
                        } else {
                            __network.reconnectSocket();
                        }
                    }
                }/*
                 , {
                 intervalTime: __config.smit,
                 maxTry: __config.dmt
                 }*/);

            },

            __reformatThread = function (messageContent) {
                var participants = messageContent.participants,
                    partnerId = messageContent.partner,
                    threadData = {
                        group: messageContent.group,
                        threadId: messageContent.id,
                        title: messageContent.title,
                        participants: [],
                        partnerId: partnerId,
                        requestId : messageContent.requestId,
                        uniqueId : messageContent.uniqueId,
                        type : messageContent.type,
                        time : messageContent.time,
                        unreadCount: messageContent.unreadCount,
                        lastMessage : messageContent.lastMessage,
                        lastSeenMessageId : messageContent.lastMessageId,
                        mute : messageContent.mute,
                        image : messageContent.image,
                        partnerLastMessageId : messageContent.partnerLastMessageId,
                        partnerLastDeliveredMessageId: messageContent.partnerLastDeliveredMessageId,
                        participantCount : messageContent.participantCount
                    };

                if(messageContent.lastMessageVO) {
                    try{
                        threadData.lastMessageVO  = JSON.parse( messageContent.lastMessageVO);
                    }catch (e){
                        threadData.lastMessageVO = messageContent.lastMessageVO;
                    }
                }

                if(participants && Array.isArray(participants)) {
                    for (var i = 0; i < participants.length; i++) {
                        var participant = participants[i];

                        if (participant.id == __userData.id) {

                            threadData["owner"] = {
                                id: participant.id,
                                name: participant.name
                            };

                            if (participant.image) {
                                threadData["owner"].image = participant.image
                            }
                            continue;
                        }
                        var participantData = {
                            id: participant.id,
                            name: participant.name
                        };

                        if (participant.image) {
                            participantData.image = participant.image
                        }
                        threadData.participants.push(participantData);
                    }
                }
                return threadData;
            },

            __createThread = function (messageContent,addFromService) {
                // console.log("__createThread",messageContent);
                var threadData = __reformatThread(messageContent);
                if(addFromService) {
                    __fireEvent("newThread", threadData);
                }

                return threadData;
            },

            __fireEvent = function (eventName,param) {
                for(var id in __eventCallbacks[eventName]) __eventCallbacks[eventName][id](param);
            },

            __pushMessageHandler = function(params) {
                var content;
                switch (params.type) {
                    case 1 :
                        if (!__isRegisterInChatServer) {
                            __isRegisterInChatServer = true;
                            setTimeout(function () {
                                // setTimeout(function () {
                                //     console.log("aaaaaaaaaaaaaaaaaaa");
                                //     __chatRequest({
                                //         userId: 6
                                //     },function (res) {
                                //         console.log("aaaaaaaaaaaaaa",res);
                                //     });
                                // },4000);
                                __fireEvent("serverRegister");
                            },__configData.gtdt);
                        }
                        break;

                    default :
                        content = JSON.parse(params.content);
                        __chatServiceMsgHandler(content);
                }
            },

            __chatServiceMsgHandler = function (params) {
                var threadId = params.subjectId,
                    type = params.type,
                    messageContent = JSON.parse(params.content);
                var uniqueId = params.uniqueId;

                switch (type) {
                    case  __chatMessageVOTypes.INVITATION :
                        // console.log("INVITATION",messageContent);
                        messageContent.uniqueId = uniqueId;
                        messageContent.requestId = uniqueId;
                        __createThread(messageContent, true);
                        break;

                    case __chatMessageVOTypes.MESSAGE :
                        //console.log("MESSAGE",messageContent);
                        __chatMessageHandler(threadId, messageContent);

                        break;

                    case __chatMessageVOTypes.DELIVERY :
                        // console.log("DELIVERY",messageContent,uniqueId);
                        var deliverData = {
                            messageId: messageContent,
                            threadId: threadId
                        };

                        if (__sendMessageCallbacks[messageContent] &&
                            __sendMessageCallbacks[messageContent].onDeliver) {
                            __sendMessageCallbacks[messageContent].onDeliver(deliverData);
                            delete  __sendMessageCallbacks[messageContent].onDeliver;
                        }
                        __fireEvent("deliver",deliverData);
                        break;

                    case __chatMessageVOTypes.SEEN :
                        // console.log("SEEN",messageContent,uniqueId);
                        var seenData = {
                            messageId: messageContent,
                            threadId: threadId,
                            uniqueId : uniqueId
                        };

                        if (__sendMessageCallbacks[messageContent] &&
                            __sendMessageCallbacks[messageContent].onSeen) {
                            __sendMessageCallbacks[messageContent].onSeen(seenData);

                            delete  __sendMessageCallbacks[messageContent].onSeen;
                        }
                        __fireEvent("seen",seenData);

                        break;

                    case __chatMessageVOTypes.SENT :

                        var sentData = {
                            messageId: messageContent,
                            threadId: threadId,
                            uniqueId : uniqueId,
                            time :params.time,
                            repliedTo : params.repliedTo
                        };

                        if (__messagesCallbacks[uniqueId]) {
                            __messagesCallbacks[uniqueId](sentData);
                        }
                        __fireEvent("sent",sentData);
                        break;

                    case __chatMessageVOTypes.GET_THREADS :
                        //console.log("GET_THREADS",uniqueId,messageContent);
                        if (__messagesCallbacks[uniqueId]) {
                            __messagesCallbacks[uniqueId](TisUtil.createReturnData(false,"",0,messageContent));
                        }
                        break;

                    case __chatMessageVOTypes.GET_HISTORY :
                        //console.log("GET_HISTORY",messageContent);
                        if (__messagesCallbacks[uniqueId]) {
                            __messagesCallbacks[uniqueId](TisUtil.createReturnData(false,"",0,messageContent));
                        }

                        break;

                    case __chatMessageVOTypes.MUTE_THREAD :
                        // console.log("MUTE_THREAD ", messageContent);
                        if (__messagesCallbacks[uniqueId]) {
                            __messagesCallbacks[uniqueId](TisUtil.createReturnData(false,"",0,messageContent));
                        }
                        break;

                    case __chatMessageVOTypes.UNMUTE_THREAD :
                        // console.log("UNMUTE_THREAD ", messageContent);
                        if (__messagesCallbacks[uniqueId]) {
                            __messagesCallbacks[uniqueId](TisUtil.createReturnData(false,"",0,messageContent));
                        }
                        break;

                    case __chatMessageVOTypes.LAST_SEEN_TYPE :
                        // console.log("LAST_SEEN_TYPE", messageContent);
                        if (__messagesCallbacks[uniqueId]) {
                            __messagesCallbacks[uniqueId](TisUtil.createReturnData(false,"",0,messageContent));
                        }
                        break;

                    case __chatMessageVOTypes.PING :
                        __logger.info("PING ", messageContent)();
                        break;

                    case __chatMessageVOTypes.GET_STATUS :
                        __logger.info("GET_STATUS ", messageContent)();
                        break;

                    case __chatMessageVOTypes.ADD_PARTICIPANT :
                        //console.log("ADD_PARTICIPANT",messageContent);
                        __fireEvent("newParticipant",__reformatThread(messageContent));
                        break;

                    case __chatMessageVOTypes.BLOCK :
                        __logger.info("BLOCK ", messageContent)();
                        break;

                    case __chatMessageVOTypes.UNBLOCK :
                        __logger.info("UNBLOCK ", messageContent)();
                        break;

                    case __chatMessageVOTypes.LEAVE_THREAD :
                        // __logger.info("LEAVE_THREAD ", messageContent)();

                        if (__messagesCallbacks[uniqueId]) {
                            __messagesCallbacks[uniqueId](TisUtil.createReturnData(false,"",0,messageContent));
                            delete  __messagesCallbacks[uniqueId];
                        } else {
                            __fireEvent("leaveThread",{threadId : threadId,participant : messageContent});
                        }

                        break;

                    case __chatMessageVOTypes.RENAME :
                        __logger.info("RENAME ", messageContent)();
                        break;

                    case __chatMessageVOTypes.GET_CONTACTS :
                        __logger.info("GET_CONTACTS ", messageContent)();
                        break;

                    case __chatMessageVOTypes.CHANGE_TYPE :
                        __logger.info("CHANGE_TYPE ", messageContent)();
                        break;

                    case __chatMessageVOTypes.REMOVE_PARTICIPANT :
                        __logger.info("REMOVE_PARTICIPANT ", messageContent)();
                        break;

                    case __chatMessageVOTypes.FORWARD_MESSAGE :
                        __logger.info("FORWARD_MESSAGE ", messageContent)();
                        __chatForwardMessageHandler(threadId, messageContent);
                        break;

                }
            },

            __chatMessageHandler = function (threadId, pushMessageVO) {
                var message = __reformatMessage(threadId, pushMessageVO);
                __fireEvent("message",message);
            },

            __chatForwardMessageHandler = function (threadId, pushMessageVO) {
                var message = __reformatForwardMessage(threadId, pushMessageVO);
                __fireEvent("forwardMessage",message);
            },

            __reformatMessageHistory = function (threadId, pushMessagesVO) {
                var returnData = [];
                for (var i = 0; i < pushMessagesVO.length; i++) {
                    returnData.push(__reformatMessage(threadId, pushMessagesVO[i]));

                    // var pushMessageVO = pushMessagesVO[i],
                    //     message;
                    // if(pushMessageVO.message) {
                    //     try {
                    //         var messageVo = JSON.parse(pushMessageVO.message);
                    //         if (messageVo.t == __messageTypes.C2C_Message) {
                    //             message = __reformatMessage(threadId, pushMessageVO, messageVo.c);
                    //         } else if(typeof messageVo == "string") {
                    //             message = __reformatMessage(threadId, pushMessageVO, [messageVo]);
                    //         }
                    //     } catch(e){
                    //         message = __reformatMessage(threadId, pushMessageVO,[pushMessageVO.message]);
                    //
                    //     }
                    //     if(message) {
                    //         returnData.push(message);
                    //     }
                    //
                    // }
                }
                return returnData;
            },

            __reformatMessage = function (threadId, pushMessageVO) {
                return {
                    threadId: threadId,
                    messageId: pushMessageVO.id,
                    participant: pushMessageVO.participant,
                    message: pushMessageVO.message,
                    metaData: pushMessageVO.metadata,
                    uniqueId: pushMessageVO.uniqueId,
                    seen: pushMessageVO.seen,
                    delivered: pushMessageVO.delivered,
                    // repliedToMessageId: pushMessageVO.repliedToMessageId,
                    // repliedToMessage: pushMessageVO.repliedToMessage,
                    replyInfoVO : pushMessageVO.replyInfoVO,
                    forwardInfo: pushMessageVO.forwardInfo,
                    previousId: pushMessageVO.previousId,
                    owner: pushMessageVO.participant.id == __userData.id,
                    time: pushMessageVO.time
                };

            },

            __reformatForwardMessage = function (threadId, pushMessageVO) {
                return {
                    threadId: threadId,
                    conversation: pushMessageVO.conversation,
                    forwardInfo: pushMessageVO.forwardInfo,
                    messageId: pushMessageVO.id,
                    participant: pushMessageVO.participant,
                    message: pushMessageVO.message,
                    uniqueId: pushMessageVO.uniqueId,
                    previousId: pushMessageVO.previousId,
                    owner: pushMessageVO.participant.id == __userData.id,
                    time: pushMessageVO.time
                };

            },

            __messageDeliverAction = function (params,callback) {
                var data = {
                    type: 3,
                    content: {
                        peerName: __serverName,
                        content: JSON.stringify({
                            type: __chatMessageVOTypes.DELIVERY,
                            content: params.messageId
                        })
                    },
                    callback : function() {
                        callback && callback();
                    }
                };
                __network.emit(data);
            },

            __messageSeenAction = function (params,callback) {
                var data = {
                    type: 3,
                    content: {
                        peerName: __serverName,
                        content: JSON.stringify({
                            type: __chatMessageVOTypes.SEEN,
                            content: params.messageId
                        })
                    },
                    callback : function() {
                        callback && callback();
                    }
                };
                __network.emit(data);
            },

            __getThreadHistory = function (params,callback) {
                var data = {
                    chatMessageVOType: __chatMessageVOTypes.GET_HISTORY,
                    threadId: params.threadId,
                    content: {},
                    timeout : params.timeout
                };

                if (typeof params.count == "number") {
                    data.content.count = params.count;
                } else {
                    if (typeof params.size == "number") {
                        data.content.size = params.size;
                    } else {

                        data.content.count = __configData.gchc;
                    }
                }

                if (typeof params.offset == "number") {
                    data.content.offset = params.offset;
                } else {
                    data.content.offset = 0;
                }

                if (typeof params.firstMessageId != "undefined") {
                    data.content.firstMessageId = params.firstMessageId;
                }

                if (typeof params.lastMessageId != "undefined") {
                    data.content.lastMessageId = params.lastMessageId;
                }

                if (typeof params.order != "undefined") {
                    data.content.order = params.order;
                }

                return __sendMessage(data,{onResult : function (result) {

                    var retData = {
                        hasError : result.hasError,
                        errorMessage : result.errorMessage,
                        errorCode : result.errorCode
                    };
                    if(!retData.hasError) {
                        var messageContent = result.result;
                        var returnDataLength = messageContent.length;
                        retData.result = {
                            history: __reformatMessageHistory(params.threadId, messageContent),
                            hasHistory: (data.content.count == returnDataLength && returnDataLength>0),
                            hasNext: (data.content.count == returnDataLength && returnDataLength>0),
                            nextOffset: data.content.offset += returnDataLength
                        }
                    }
                    callback && callback(retData);
                }});
            };

        /*==================================================================================================================
         *                                 N E T W O R K     M E T H O D
         *================================================================================================================*/
        __networkMethods.registerPeerId = function(peerId,callback) {

            var type = 3;

            var sendData = {
                peerId: peerId,
                serviceVersion : TisServiceClass.VERSION,
                deviceId : __deviceId,
                type : type
            };

            __request("chatAsyncRegister", sendData, function (result) {
                var returnData = {
                    hasError: result.HasError,
                    errorCode : result.ErrorCode,
                    errorMessage : result.ErrorMessage,
                    result: result.Result
                };

                if (result.HasError) {

                    switch (result.ErrorCode) {

                        // case __errorCodes.MAJOR_CONFLICT :
                        //     __majorConflictAction();
                        //     break;
                        //
                        // case __errorCodes.PEER_CLEAR :
                        //     __network.onLogout({
                        //         callChatService : false
                        //     });
                        //     break;

                        default  :
                            callback(returnData);

                    }

                } else {
                    callback(returnData);
                }
            });
        };

        __networkMethods.activatePeerId = function(peerId,callback) {
            var requestData = {
                peerId: peerId
            };

            if(window &&  window.device != undefined) {
                requestData.device = window.device
            }

            __request("chatActivatePeer", requestData, function (result) {
                if (result.HasError) {
                    switch (result.ErrorCode) {
                        // case __errorCodes.PEER_CLEAR :
                        //     __network.onLogout({
                        //         callChatService : false
                        //     });
                        //     break;
                        default  :
                            callback({
                                hasError: result.HasError
                            });
                    }
                } else {
                    callback({
                        hasError: result.HasError
                    });
                }
            });

        };

        __networkMethods.getConfig = function() {
            return __configData;
        };

        /*==================================================================================================================
         *                                 P U B L I C     M E T H O D
         *================================================================================================================*/

        this.on = function(eventName,callback) {
            if(__eventCallbacks[eventName]) {
                var id = TisUtil.generateUUID();
                __eventCallbacks[eventName][id] = callback;
                if(eventName == "login" && __isLogin) {
                    callback(__userData);
                }

                if(eventName == "connect" && __peerId) {
                    callback();
                }

                if(eventName == "serverRegister" && __isRegisterInChatServer) {
                    callback();
                }
                return id;
            }
        };

        this.getPeerId = function () {
            return __network.getPeerId();
        };

        /**
         * <div style='width: 100%;text-align: right'>ارسال پیام </div>
         *@method sendMessage
         *@public
         *
         * @param {Object} params
         *  <ul>
         *      <li>{String} message  پیام ارسالی</li>
         *      <li>{String} threadId شناسه ترد</li>
         *      <li>{String} [repliedTo] شناسه پیامی که می خواهد به آن اشاره شود</li>
         *      <li>{String} [uniqueId] شناسه منحصر به فرد</li>
         *      <li>{String} [metaData] اطلاعات اضافی به همراه پیام فرد</li>
         *  </ul>
         * @param {Object} callbacks
         *      <ul>
         *         <li>callbacks.onSeen</li>
         *         <li>callbacks.onDeliver</li>
         *         <li>callbacks.onSent</li>
         *         <li>callbacks.onResult</li>
         *      </ul>
         *
         * @return {Object}
         *      <ul>
         *         <li>uniqueId </li>
         *      </ul>
         * */
        __self.sendMessage = function (params,callbacks) {
            return __sendMessage({
                chatMessageVOType: __chatMessageVOTypes.MESSAGE,
                threadId: params.threadId,
                repliedTo : params.repliedTo,
                content: params.message,
                uniqueId: params.uniqueId,
                pushMsgType: 4,
                metaData: params.metaData,
                timeout : params.timeout
            },callbacks);
        };

        /**
         * <div style='width: 100%;text-align: right'>ارسال پیام </div>
         *@method forwardMessage
         *@public
         *
         * @param {Object} params
         *  <ul>
         *      <li>{String} threadId شناسه ترد</li>
         *      <li>{String} messagesId شناسه پیام</li>
         *      <li>{Array} [uniqueId] شناسه منحصر به فرد</li>
         *  </ul>
         * @param {Object} callbacks
         *      <ul>
         *         <li>messageCallback.onSeen</li>
         *         <li>messageCallback.onDeliver</li>
         *         <li>messageCallback.onSent</li>
         *         <li>messageCallback.onResult</li>
         *      </ul>
         *
         * @return {Object} data
         *      @return {String} data.uniqueId
         * */
        __self.forwardMessage = function (params,callbacks) {
            return __sendMessage({
                chatMessageVOType: __chatMessageVOTypes.FORWARD_MESSAGE,
                threadId: params.threadId,
                content: params.messagesId,
                uniqueId: params.uniqueId,
                pushMsgType: 4,
                timeout : params.timeout
            },callbacks);
        };

        /**
         *@method deliver
         *
         * @param {Object} params
         *      @param {Object} params.messageId
         *
         * @param {Function} callback
         * */
        __self.deliver = function (params,callback) {
            // return __messageDeliverAction(params,callback);

            return __sendMessage({
                chatMessageVOType : __chatMessageVOTypes.DELIVERY,
                content : params.messageId,
                pushMsgType: 4,
                timeout : params.timeout
            },callback);
        };

        /**
         * <div style='width: 100%;text-align: right'> اعلام دیده شدن پیام </div>
         * @method seen
         * @public
         * @param {Object} params
         *      <ul>
         *          <li>{String} messageId شناسه پیام </li>
         *      </ul>
         * @param {Function} callback
         * */
        __self.seen = function (params,callback) {
            // return __messageSeenAction(params,callback);
            return __sendMessage({
                chatMessageVOType : __chatMessageVOTypes.SEEN,
                content : params.messageId,
                pushMsgType: 4,
                timeout : params.timeout
            },callback);
        };

        /**
         * <div style='width: 100%;text-align: right'> اعلام دیده شدن پیام در گروه </div>
         *@method lastSeen
         *
         * @param {Object} params
         *      <ul>
         *          <li>{String} messageId شناسه پیام </li>
         *      </ul>
         *
         * @param {Function} [callback]
         * */
        __self.lastSeen = function (params,callback) {
            var data = {
                chatMessageVOType: __chatMessageVOTypes.LAST_SEEN_TYPE,
                content:params.messageId,
                pushMsgType: 4,
                timeout : params.timeout
            };

            return __sendMessage(data,{onResult : function () {
                callback && callback();
            }});
        };

        /**
         * <div style='width: 100%;text-align: right'>  دریافت اطلاعات ترد </div>
         * @method getThreadHistory
         * @public
         *
         * @param {Object} params
         *  <ul>
         *      <li>{String} threadId</li>
         *      <li>{Integer} [size=50]</li>
         *      <li>{Integer} [offset=0]</li>
         *      <li>{String|Number} [firstMessageId]</li>
         *      <li>{String|Number} [lastMessageId]</li>
         *      <li>{String|Number} [lastMessageId]</li>
         *      <li>{String} [order] asc or desc</li>
         *  </ul>
         * @param {Function} callback
         *      @param {boolean} callback.hasNext
         *      @param {Integer} callback.nextOffset
         *      @param {Array} callback.threads
         * */
        __self.getThreadHistory = function (params,callback) {
            return __getThreadHistory(params,callback);
        };

        /**
         * @method chatRequest
         * @public
         * @param {Object} params
         *  @param {Number} params.userId
         *  @param {String} [params.uniqueId]
         *
         * @param {Object} callback
         *      @param {Boolean} callback.hasError
         *      @param {String}  callback.errorMessage
         *
         * @return {Object} data
         *      @return {String} data.uniqueId
         * */
        __self.chatRequest = function(params,callback) {
            return __chatRequest(params,callback);
        };

        /**
         * <div style='width: 100%;text-align: right'>  دریافت ترد های کاربر </div>
         * @method getThreads
         * @public
         * @param {Object} params
         *  <ul>
         *      <li>{Integer} [size=50]</li>
         *      <li>{Integer} [offset=0]</li>
         *      <li>{Boolean} [new]</li>
         *      <li>{String} [name]</li>
         *      <li>{JSONArray} [threadsId]</li>
         *      <li>{Boolean} [addFromService = true]</li>
         *  </ul>
         * @param {Function} callback
         *         @param {Number} callback.nextOffset
         *         @param {Boolean} callback.hasNext
         *         @param {Array} callback.threads
         *
         * */
        __self.getThreads = function(params,callback) {

            var count = 50,
                offset = 0,
                content = {};

            if(params) {
                if(typeof params.count == "number") {
                    count = params.count;
                }
                if(typeof params.size == "number") {
                    count = params.size;
                }
                if(typeof params.offset == "number") {
                    offset = params.offset;
                }

                if(typeof  params.name == "string") {
                    content.name = params.name;
                }
            }
            content.count = count;
            content.offset = offset;


            if(Array.isArray(params.threadsId)) {
                content.threadIds = params.threadsId;
            }

            if(typeof params.new =="boolean") {
                content.new = params.new;
            }

            // if(Array.isArray(params.participantsId)) {
            //     requestData.participantIds = params.participantsId;
            // }

            var requestParam = {
                chatMessageVOType: __chatMessageVOTypes.GET_THREADS,
                content : content,
                timeout : params.timeout
            };

            return __sendMessage(
                requestParam,
                {
                    onResult : function(result) {

                        var retData = {
                            hasError : result.hasError,
                            errorMessage : result.errorMessage,
                            errorCode : result.errorCode
                        };

                        if(!retData.hasError) {
                            var messageContent = result.result;
                            var addFromService = true,
                                msgLength = messageContent.length,
                                resultData = {
                                    threads: [],
                                    hasNext: (count == msgLength && msgLength>0),
                                    nextOffset: offset += msgLength
                                },
                                threadData;
                            if(params && typeof params.addFromService == "boolean") {
                                addFromService = params.addFromService;
                            }

                            for (var i = 0; i < msgLength; i++) {

                                threadData = __createThread(messageContent[i],addFromService);

                                if(threadData) {
                                    resultData.threads.push(threadData);
                                }

                            }
                            retData.result = resultData;
                        }

                        callback && callback(retData);

                    }
                });
        };

        /**
         * <div style='width: 100%;text-align: right'> خاموش کردن یک ترد </div>
         * @method muteThread
         * @public
         * @param {Object} params
         *  <ul>
         *      <li>{Integer} threadId شناسه ترد</li>
         *  </ul>
         * @param {Function} [callback]
         *
         * */
        __self.muteThread = function (params,callback) {
            var data = {
                chatMessageVOType: __chatMessageVOTypes.MUTE_THREAD,
                threadId: params.threadId,
                content: {},
                pushMsgType: 4,
                timeout : params.timeout
            };

            return __sendMessage(data,{onResult : function () {
                callback && callback();
            }});
        };

        /**
         * <div style='width: 100%;text-align: right'> روشن کردن یک ترد </div>
         * @method muteThread
         * @public
         * @param {Object} params
         *  <ul>
         *      <li>{Integer} threadId شناسه ترد</li>
         *  </ul>
         * @param {Function} [callback]
         *
         * */
        __self.unMuteThread = function (params, callback) {
            var data = {
                chatMessageVOType: __chatMessageVOTypes.UNMUTE_THREAD,
                threadId: params.threadId,
                content: {},
                pushMsgType: 4,
                timeout : params.timeout
            };

            return __sendMessage(data,{onResult : function () {
                callback && callback();
            }});
        };

        /**
         * <div style='width: 100%;text-align: right'> ترک کردن ترد</div>
         * @method leaveThread
         * @public
         * @param {Object} params
         *  <ul>
         *      <li>{Integer} threadId شناسه ترد</li>
         *  </ul>
         * @param {Function} [callback]
         *
         * */
        __self.leaveThread = function (params,callback) {
            var data = {
                chatMessageVOType: __chatMessageVOTypes.LEAVE_THREAD,
                threadId: params.threadId,
                content: {},
                pushMsgType: 4,
                timeout : params.timeout
            };

            return __sendMessage(data,{onResult : function (res) {
                callback && callback(res);
            }});
        };

        __init();

    }
    
    ChatService.VERSION = "1.1.0";

    if(typeof exports !== 'undefined' && module.exports) {
        module.exports = ChatService;
    } else {
        if(!window.TIS) {
            window.TIS = {};
        }
        window.TIS.ChatService = ChatService;
    }
})();