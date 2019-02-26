(function () {
    /**
     * @class Service
     * @module Service
     * @constructor
     * @param {Object}  params
     *      @param {Object}  params.setting
     *              @param {Boolean}  params.isMultiTab تعیین اینکه آیا بازی قابلیت اجرای چند بازی به صورت همزمان را دارد یا خیر
     *      @param {String}  params.version ورژن بازی
     *      @param {Object}  params.on رخداد های سرویس
     *
     *      @param {Object} params.games  keys is game id and multiple game id can be define
     *              @param {Function}  params.games.callback کلاسی که به ازاء هر بازی جدید یک نمونه از آن ایجاد می شود
     *              @param {Object}  params.games.info
     *                      @param {String}  params.games.info.name
     *              @param {Object}  params.games.setting
     *                      @param {Number}  params.games.setting.maxReloadCount حداکثر دفعات شروع که کاربر می تواند برنامه را ببندد و دوباره وارد بازی شود
     *              @param {Object}  params.games.userData
     *
     * */
    function Service(params) {
        var TisNetworkClass,
            TisChatServiceClass,
            TisUtil,
            TisLog,
            TisDatabase,
            CryptoJSs ,
            ServiceException;


        if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
            TisNetworkClass = require("./Network/network");
            if(params.database !== false) {
                TisDatabase = require("./Database/mongoDatabase");
            }

            TisChatServiceClass = require("./Chat/chatService");
            TisUtil = require("./Util/util");
            TisLog = require("./Log/log");
            ServiceException = require("./Share/serviceException");
            TIS = require("./TIS");
            CryptoJSs = require("./Lib/cryptojs");
        } else {
            TisNetworkClass = TIS.Network;
            TisChatServiceClass = TIS.ChatService;
            TisUtil = TIS.Util;
            TisLog = TIS.Log;
            ServiceException = TIS.ServiceException;
            TisDatabase = TIS.Database;
            CryptoJSs = typeof window.CryptoJS !== "undefined" ? window.CryptoJS : null;
        }

        if (typeof window == "undefined") {
            window = {};
        }


        /*==============================================================================================================
         *                                      P R I V A T E   V A R I A B L E
         *============================================================================================================*/
        // __serviceMode = TIS.DEVELOPMODE_ONLINE;
        var __self = this,
            __lang = "FA",
            __dic = {
                "CONNECTINGTOPUSH": {
                    "EN": "connecting to push",
                    "FA": "در حال ارتباط با سرور لحظاتی دیگر امتحان کنید"
                },
                "SIGNUP_FOR_USE_SERVICE": {
                    "EN": "please signup for ",
                    "FA": "برای استفاده از این سرویس لطفا ثبت نام کنید"
                },
                "GAME": {
                    "EN": "game",
                    "FA": "بازی"
                },
                "CONNECTIONERROR": {
                    "EN": " connection error",
                    "FA": "خطا در برقراری ارتباط با سرور"
                },
                "NOTONLINE": {
                    "EN": "you are not online.",
                    "FA": "ارتباط شما با اینترنت برقرار نیست"
                },
                "SERVER_REQUEST_ERROR": {
                    "EN": "error in request to server",
                    "FA": "خطا در برقراری ارتباط با سرور"
                },
                "NOTAUTHENTICATE": {
                    "EN": "cannot authenticate user",
                    "FA": "شماره تماس یا رمز عبور اشتباه می باشد"
                },
                "NOTIFREQUESTMATCH": {
                    "EN": "request match.",
                    "FA": " به شما درخواست بازی داده است. "
                },
                "MATCHREQUESTCANCELD": {
                    "EN": "request match.",
                    "FA": " به شما درخواست بازی داده است. "
                },
                "MATCHREQUESTVERSIONFAIL": {
                    "EN": "request match.",
                    "FA": "  به شما درخواست بازی داده است,ولی به دلیل عدم بروزرسانی برنامه شما ,درخواست کنسل گردید. "
                },
                "MATCHREQUEST": {
                    "EN": "request match.",
                    "FA": "درخواست بازی"
                },
                "MATCHREQUESTIN": {
                    "EN": "request match in.",
                    "FA": "درخواست بازی در "
                },
                "HASMAJORCONFLICT": {
                    "EN": "major conflict.",
                    "FA": "نسخه کنونی شما بروز نمی باشد. لطفا بازی خود را بروزرسانی کنید"
                },
                "UPDATE": {
                    "EN": "update",
                    "FA": "بروزرسانی"
                },
                "MATCHREQUESTS": {
                    "EN": "match requests",
                    "FA": "درخواست های بازی"
                },
                "MATCHREQUESTFROM": {
                    "EN": "match requests from ",
                    "FA": "درخواست بازی از "
                },
                "HAVE": {
                    "EN": "have",
                    "FA": "داشته اید."
                },
                "NEWVERSION": {
                    "EN": "new version",
                    "FA": "نسخه جدید"
                },
                "GAMEISRUN": {
                    "EN": "you are plying game",
                    "FA": "تا پایان مسابقه نمی توانید درخواست حریف بدهید."
                },
                "MAXCONCURRENTREQUEST": {
                    "EN": "request result to : ",
                    "FA": "حداکثر درخواست همزمان $VAR نفر میباشد"
                },
                "SHAREGAMEMESSAGE": {
                    "EN": "hi,visit this link,$VAR",
                    "FA": "از این بازی خیلی خوشم اومده! نصبش کن بیا بازی کنیم. منتظرتم. \
                \n\
                $VAR"
                },
                "SHARELEAGUEMESSAGE": {
                    "EN": "hi,visit this link,$VAR",
                    "FA": " این لیگ خیلی باحاله , یه نیگاه بهش بنداز \
                \n\
                $VAR"
                },
                "WAITFORPREVIOUSREQUEST": {
                    "EN": "wait for previous request",
                    "FA": "منتظر نتیجه درخواست قبلی بمانید"
                },
                "WAIT_FORP_REVIOUS_QUICK_MATCH": {
                    "EN": "wait for previous request",
                    "FA": "منتظر نتیجه درخواست حریف می طلبم بمانید"
                },
                "CANCEL_QUICKMATCH_FIRST": {
                    "EN": "cancel quick match request",
                    "FA": "ابتدا درخواست حریف می طلبم رو کنسل کنید"
                },
                "CAN_ACCEPT_MATCH_REQUEST_AFTER_MATCH": {
                    "EN": "you can accept request after match",
                    "FA": "بعداز مسابقه می توانید درخواست جدید را بپذیرید"
                },
                "CANTNOTREQUESTINPLAING": {
                    "EN": "wait for previous request",
                    "FA": "درخواست جدید در حین بازی مجاز نمی باشد"
                },
                "NOTOPPONENTFIND": {
                    "EN": "not opponent find",
                    "FA": "حریفی پیدا نشد"
                },
                "ADDMIN1PHONENUMBER": {
                    "EN": "pleas add minimum one number",
                    "FA": "حداقل یک شماره تماس را وارد نمایید"
                },
                "ERRORINPROCESS": {
                    "EN": "error in operation",
                    "FA": "خطایی در اجرای درخواست شما رخ داد!!!"
                },
                "STORAGE_NOT_PERMISSION": {
                    "EN": "storage not permission",
                    "FA": "دسترسی به حافظه مقدور نمی باشد"
                },
                "MATCHSTART": {
                    "EN": "match started.",
                    "FA": "شروع مسابقه"
                },
                "MATCHSTARTMESSAGE": {
                    "EN": "your match started.",
                    "FA": "مسابقه شما با $VAR شروع شده است"
                },
                "DOWNLOADINGNEWVERSION": {
                    "EN": "downloading .",
                    "FA": "در حال دریافت نسخه جدید "
                },
                "NOT_WRITE_STORAGE_PERMISSION": {
                    "EN": "write storage permission is not active.",
                    "FA": "دسترسی نوشتن بر روی حافظه فعال نمی باشد."
                },
                "NEW_VERSION_EXIST": {
                    "EN": "new version exist,please update",
                    "FA": "نسخه جدید برنامه موجود است، در صورت تمایل بروزرسانی نمایید"
                }
            },
            __rejectType = {
                USER_NOT_ACCEPT: {
                    value: 3,
                    message: {
                        EN: "user not accept your request",
                        FA: "با درخواست شما موافقت نشده است"
                    }
                },
                APP_NOT_INSTALLED: {
                    value: 4,
                    message: {
                        EN: "app not installed.",
                        FA: "کاربر برنامه را نصب نکرده است"
                    }
                },
                USER_VERSION_CONFLICT: {
                    value: 5,
                    message: {
                        EN: "use app version not update",
                        FA: "نسخه بازی کاربر مورد نظر به روز نمی باشد."
                    }
                },
                USER_IS_BUSY: {
                    value: 6,
                    message: {
                        EN: "use is busy.",
                        FA: "کاربر مورد نظر مشغول انجام بازی می باشد."
                    }
                }
            },
            __notificationTypes = {
                BAZITECH_MESSAGE: 1,
                MATCH_REQUEST: 2,
                MATCH_REQUEST_EXPIRE: 3,
                MATCH_START: 4
            },
            __gCMMessageTypes = {
                NEW_MATCH: 1,
                CHECK_CAN_ACCEPT: 2,
                START_APP: 3,
                LOGOUT: 4
            },
            __contentMessageMap = {
                dataPack: 1,
                newUser: 2,
                logoutUser: 3,
                requestIdState: 4,
                newMatch: 5,
                startMatch: 6,
                resumeMatch: 7,
                pauseMatch: 8,
                requestMatch: 9,
                matchResult: 10,
                message: 11,
                reconnect: 12,
                leaveMatch: 13
            },
            __messageTypes = {
                offlineRequest: 1,
                onlineRequest: 2,
                notification: 3
            },
            __metaDataTypes = {
                MATCH_DATA: 1,
                MATCH_CONFLICT: 2,
                USER_DEVICE_INFO: 3,
                INSTALLED_APPS: 4
            },
            __messagesData = {
                /*
                 * messageId : {
                 *   type : __messageTypes
                 *   content :
                 * }
                 *
                 * */
            },
            __gameCenterMessagesId = {},
            __serviceMode = params.serviceMode || TIS.MODE,
            __isLocal = __serviceMode != TIS.RELEASEMODE,
            // __isLocal = false,
            __isApp = TisUtil.isApp(),
            //__isApp = true,
            __logCounter = 0,
            __logFraction = 500,
            __logData = "",
            __socketReport = params.socketReport == true,
            __defaultLeagueSubscribe =
                (typeof params.defaultLeagueSubscribe == "boolean") ?
                    params.defaultLeagueSubscribe :
                    true,
            __isNarliga = params.isNarliga == true,
            __GCDomainName =
                ((__isNarliga === true ) || (typeof TIS.GC_NAME != "undefined" && TIS.GC_NAME == TIS.GC_NARLIGA ) ) ?
                    "narliga.ir" :
                    __isLocal ?
                        (__serviceMode == TIS.DEVELOPMODE_ONLINE ?
                            "176.221.69.209:1036" :
                            "176.221.69.209:1036") :
                        "pod.land",
            __fullDomainAddress =
                __isLocal ?
                    (__serviceMode == TIS.DEVELOPMODE_ONLINE ?
                        "http://" + __GCDomainName :
                        "http://172.16.106.43:8082") :
                        // "http://1-72.16.105.76:8081") :
                        // "http://1-72.16.110.77:8081") :
                        // "http://1-72.16.106.43:8082") :
                    // "http://service." + __GCDomainName,
                    "https://service-play." + __GCDomainName,
            __configData = {
                gca: __isLocal ? (__serviceMode == TIS.DEVELOPMODE_ONLINE ? "http://176.221.69.209:1036" : "http://172.16.106.43:8082") : "https://service-play.pod.land",// game center address
                aha: __isLocal ? (__serviceMode == TIS.DEVELOPMODE_ONLINE ? "http://sandbox.pod.land:8003" : "http://172.16.110.235:8003") : "https://playpod-bus.pod.land",//async http address
                psa: __isLocal ? (__serviceMode == TIS.DEVELOPMODE_ONLINE ? "sandbox.pod.land:8003/ws" : "ws://172.16.110.235:8003/ws") : "wss://playpod-bus.pod.land/ws",// push server address
                csa: __isLocal ? (__serviceMode == TIS.DEVELOPMODE_ONLINE ? "sandbox.pod.land:8003/ws" : "ws://172.16.110.235:8003/ws") : "wss://playpod-bus.pod.land/ws",// chat server address
                isa: __isLocal ? (__serviceMode == TIS.DEVELOPMODE_ONLINE ? "http://sandbox.pod.land:8080" : "http://172.16.110.76:8080") : "https://core.pod.land:8080",// image server address
                wsto: 4000,
                searchto: 300, // search timeout
                getConfigTimeout: 10000,
                disw: 50, // default image size width
                dish: 50, // default image size height
                ldisw: 150,//league Default Image Size width
                ldish: 150,//league Default Image Size height
                pdisw: 200, // pack Default Image Size width
                pdish: 200, // pack Default Image Size width
                pmto: 15000,// push message timeout
                pcct: 20000,//push connection check timeout
                pcctt: 400,//push connection check timeout threshold
                smit: 5000,// send message Interval time
                gcpn: "com.fanap.navin", // game center package name
                sba: "com.nozhaco.gameCenter.actions.gameToGC",// send broadcast action
                // receiveBroadcastAction: "com.nozhaco.gameCenter.actions.GCToGame",
                pmttl: 7000,// push message ttl
                wscwti: 500,    //webSocket connection wait time interval
                mrt: 60000,
                mmrc: 4,// max match request count
                pcrit: 5000,//push Connection Retry Interval Time
                ciid: 1061,//chat item id
                gcrt: 180,//game center register timeout
                srtc: 0,//send result try count
                srt: 3000,//send result timeout
                rvt: 120000,// resend verify timeout
                businessId: __isLocal ? (__serviceMode == TIS.DEVELOPMODE_ONLINE ? 692 : 43) : 1788,
                dmt: 20,//default max try
                gchc: 10, // get chat history count
                ehet: 5 * 60 * 1000,//encryption handshake expire time
                gcid: __isLocal ? (__serviceMode == TIS.DEVELOPMODE_ONLINE ? 44 : 44) : 3, // game center id
                gciv: false, // game center is Viewable
                opdt: __isLocal ? (__serviceMode == TIS.DEVELOPMODE_ONLINE ? "58e368fcdc62ba141699e7fc" : "58e368fcdc62ba141699e7fc") : "58e368fcdc62ba141699e7fc",// object pool database token
                ecd: "EmojiData",// emoji categories data
                gcecn: "EM_01", // game center emoji category name
                ecpn: "TIS_CHAT_EMOJI_CONFIG",
                ehd: "##$##",// encryption hash delimiter
                cevid: 10,// check emoji version interval day,
                gctmhp: undefined, // game center max history page,
                gldc: 20,//get league data count,
                mtml: 200,//max text message length
                meim: 20,//max emoji in message,
                glms: 20,// get league members size
                gous: 20,// get online user size
                gsus: 5,// get search user size
                rctam: true,// remove chat thread after match
                suml: false,// send unvalid match log
                ummll: 0,// unvalid match max log level
                ormm: 5,//offline Request Minimum  Minute
                cmc: true,//check major conflict
                hiap: false,//has in app purchase
                mormd: 10,// max offline request match day,
                gtdt: 1000, // get thread data timeout
                vbif: true, // view bazitech in iFrame
                qmt: 55000, // quick match timeout,
                glma: 50000, // geo location maximum age
                glt: 60000, // geo location timeout,
                glit: 600000, // geo location interval timeout,
                siadi: 30, // send installed apps d interval
                glrdd: 2,//geo location request distance difrence
                cmp: 5, // chat message priority
                sv: undefined,//service version
                scpn: "TIS_SERVICE",//service custom post name
                suv: undefined,// service ui version,
                cuv: undefined,// chat ui version,
                nsu: true,// need service update
                lep: true,// edit profile local
                dlor: true,// default league offline request
                ufs: true,// update from server
                har: true,// http async request
                harfs : false,// http async request from socket
                loui: false,// load own ui
                lotui: false,// load own table ui
                smdtop : true,// send metadata to object pool
                sgltop : true,// send geolocation to object pool
                siatop : true,// send installed App to object pool
                sditop : true,// send device info to object pool
                smrtop : true,// send match result to object pool
                ure : false,// use request encryption
                malvfu : false,//  mobile app last version force update
                malvcl : "",//mobile app last change log
                malvdl : "",//mobile app last version download link
                malv : "1.0.0",// mobile app last version
                palvfu : false,//  pc app last version force update
                palvcl : "",//pc app last change log
                palvdl : "",//pc app last version download link
                palv : "1.0.0",// pc app last version
                btgv: {//beta test game versions
                    /*
                     * gameId: version
                     * */
                },
                cu: TIS.GC_NAME == TIS.GC_BAZITECH ? "ریال" : "نارینگ",//credit unit
                cf: 1,//credit fraction
                aht: 3000,//alert hide timeout
                hrt: 20000,//http request timeout
                msdtc: 10,//max sent data try count
                opsa: __isLocal ? (__serviceMode == TIS.DEVELOPMODE_ONLINE ? "http://176.221.69.213:8084" : "http://172.16.106.45:8084") : "http://176.221.69.213:8084",//object pool server address
                ncsa: __isLocal ? (__serviceMode == TIS.DEVELOPMODE_ONLINE ? "http://185.104.229.163:12547" : "http://185.104.229.163:12547") : "http://185.104.229.163:12547",//navin center address
                qsa: __isLocal ? (__serviceMode == TIS.DEVELOPMODE_ONLINE ? "http://176.221.69.213:8083" : "http://172.16.106.45:8083") : "http://176.221.69.213:8083",//quiz server address
                exsa: __isLocal ? (__serviceMode == TIS.DEVELOPMODE_ONLINE ? "http://176.221.69.213:8085" : "http://172.16.106.45:8085") : "http://176.221.69.213:8085",//exchange server ip
                // uppu: "market://details?id=",// update package prefix url
                // uppu: "bazitech://game?gameId=",// update package prefix url
                sucpn: "TIS_SERVICE_UI",// service ui custom post name
                cucpn: "TIS_SERVICE_CHAT_UI",// chat ui custom post name
                icu: __fullDomainAddress + "/payByGateway/",// increase credit link
                bglp: "http://" + __GCDomainName + "/#game/",// bazitech game link prefix
                bllp: "http://" + __GCDomainName + "/#league/",// bazitech league link prefix
                bvl: "http://" + __GCDomainName + "/about.html",// view bazitech in iFrame
                qpl: "http://" + __GCDomainName + "/Hushang",// quiz panel link
                gclpu: "http://" + __GCDomainName + "/index.html#login", // game center login page url
                gcupu: "http://" + __GCDomainName + "/#profile/user", // game center user page url
                gcuph: "#profile/user", // game center user page hash
                adurl: undefined, // game center login page url
                gcru: "http://www." + __GCDomainName + "/?#rules", // game center rules url
                // adurl: "http://172.16.106.45:8083"
                gcdl: __isLocal ? // game center download link
                    (__serviceMode == TIS.DEVELOPMODE_ONLINE ?
                        "http://185.104.229.163:12547/fileServer/download?key=A81333D454E043BE4AFC9DF3711405A08.107260684095642E14.a" :
                        "http://185.104.229.163:12547/fileServer/download?key=A81333D454E043BE4AFC9DF3711405A08.107260684095642E14.a") :
                    "http://185.104.229.163:12547/fileServer/download?key=A81333D454E043BE4AFC9DF3711405A08.107260684095642E14.a",

                ssolu: __isLocal ? // sso login url
                    (__serviceMode == TIS.DEVELOPMODE_ONLINE ?
                        "https://accounts.pod.land/oauth2/authorize/?client_id=39105edd466f819c057b3c937374&response_type=code&redirect_uri=http://176.221.69.209:1036/Pages/Auth/SSOCallback/Default.aspx&scope=phone profile" :
                        "http://172.16.110.76/oauth2/authorize/?client_id=59cbd42cc8f29e2ced10858d2&response_type=code&redirect_uri=http://172.16.106.43:8082/Pages/Auth/SSOCallback/Default.aspx&scope=phone profile") :
                    "https://accounts.pod.land/oauth2/authorize/?client_id=16807y864b4ab6a05a80d602f5b6d7&response_type=code&redirect_uri=https://service-play.pod.land:443/Pages/Auth/SSOCallback/Default.aspx&scope=phone profile",
                ssosu: __isLocal ? // sso signup url
                    (__serviceMode == TIS.DEVELOPMODE_ONLINE ?
                        "https://accounts.pod.land/oauth2/authorize/?client_id=39105edd466f819c057b3c937374&response_type=code&redirect_uri=http://176.221.69.209:1036/Pages/Auth/SSOCallback/Default.aspx&prompt=signup&scope=phone profile" :
                        "http://172.16.110.76/oauth2/authorize/?client_id=59cbd42cc8f29e2ced10858d2&response_type=code&redirect_uri=http://172.16.106.43:8082/Pages/Auth/SSOCallback/Default.aspx&prompt=signup&scope=phone profile") :
                    "https://accounts.pod.land/oauth2/authorize/?client_id=16807y864b4ab6a05a80d602f5b6d7&response_type=code&redirect_uri=https://service-play.pod.land:443/Pages/Auth/SSOCallback/Default.aspx&prompt=signup&scope=phone profile",

                ssogbu: __isLocal ? // sso league enroll url
                    (__serviceMode == TIS.DEVELOPMODE_ONLINE ?
                        "http://176.221.69.209:1036/pages/game/buy/default.aspx" :
                        "http://172.16.106.43:8082/pages/game/buy/default.aspx") :
                    "https://service-play.pod.land/Pages/game/buy/Default.aspx",


                ssoleu: __isLocal ? // sso league enroll url
                    (__serviceMode == TIS.DEVELOPMODE_ONLINE ?
                        "http://176.221.69.209:1036/Pages/League/Enroll/Default.aspx" :
                        "http://172.16.106.43:8082/Pages/League/Enroll/Default.aspx") :
                    "https://service-play.pod.land/Pages/League/Enroll/Default.aspx",


                ssoiau: __isLocal ? // sso in app Purchase url
                    (__serviceMode == TIS.DEVELOPMODE_ONLINE ?
                        "http://176.221.69.209:1036/pages/iap/buy/default.aspx" :
                        "http://172.16.106.43:8082/pages/iap/buy/default.aspx") :
                    "https://service-play.pod.land/pages/iap/buy/default.aspx",

                ssolou: __isLocal ? // sso logout url
                    (__serviceMode == TIS.DEVELOPMODE_ONLINE ?
                        "http://176.221.69.209:1036/Pages/Logout/Default.aspx" :
                        "http://172.16.106.43:8082/Pages/Logout/Default.aspx") :
                    "https://service-play.pod.land/Pages/Logout/Default.aspx",

                ssocu: __isLocal ? // sso credit url
                    (__serviceMode == TIS.DEVELOPMODE_ONLINE ?
                        "http://sandbox.pod.land:1031/v1/pbc/buycredit" :
                        "http://172.16.110.77/v1/pbc/buycredit") :
                    "https://pay.pod.land/pbc/buycredit",

                ssoepu: __isLocal ? // sso edit profile ui
                    (__serviceMode == TIS.DEVELOPMODE_ONLINE ?
                        "http://sandbox.pod.land:1031/users/info/edit" :
                        "http://172.16.1.77/users/info/edit") :
                    "https://panel.pod.land/Users/Info",

                gcaosid: 1000, // game center android os id
                pt: 4 * 60 * 1000, // peer timeout
                ahrrn: __isLocal ? (__serviceMode == TIS.DEVELOPMODE_ONLINE ? "bp.gc.sandbox" : "vhd.ow") : "playpod.service",// async http request receiver name
                oprrn: __isLocal ? (__serviceMode == TIS.DEVELOPMODE_ONLINE ? "objectpool.st" : "objectpool.st") : "objectpool.st",// object pool request receiver name
                ahrr: __isLocal ? (__serviceMode == TIS.DEVELOPMODE_ONLINE ? [3214025] : [1570893]) : [3214025],// async http request receivers
                tutf : 20000,// token update time diff
                eud : {// encryption url data
                    /*
                    * url : enabled{Boolean}
                    * */
                },
                gcd : {//games config data
                    /*
                    * gameId : {
                    *   bma : ""// banner movie address
                    * }
                    * */
                },
                lcd : {//leagues config data
                    /*
                    * leagueId : {
                    *   bma : ""// banner movie address
                    * }
                    * */
                }
            },
            __generatedConfig,
            __gameSupporterIds = [],
            __isSupporterInit = false,
            __sendDataAckState = {
                /*
                 * dataId : ackState
                 * */
            },
            __serverData = {
                GAME_CENTER: {
                    address: __configData.gca
                },
                OBJECT_POOL: {
                    address: __configData.opsa
                },
                NAVIN: {
                    address: __configData.ncsa
                },
                IMAGE: {
                    address: __configData.isa
                },
                ASYNC: {
                    address: __configData.aha
                },
                PUSH: {
                    address: __configData.psa
                },
                CHAT: {
                    address: __configData.csa
                }
            },
            __requestUrls = {
                signup: {uri: "/srv/user/signup", hostName: "GAME_CENTER"},
                registerGuest: {uri: "/srv/user/registerGuest", hostName: "GAME_CENTER"},
                verify: {uri: "/srv/user/verify", hostName: "GAME_CENTER"},
                login: {uri: "/srv/user/login", hostName: "GAME_CENTER"},
                logout: {uri: "/srv/user/logout", hostName: "GAME_CENTER"},
                leagueMatchesResult: {uri: "/srv/user/matchresult", hostName: "GAME_CENTER"},
                leagueMatches: {uri: "/srv/user/matches", hostName: "GAME_CENTER"},
                getLobbies: {uri: "/srv/lobby/get", hostName: "GAME_CENTER"},
                gameCenterStatus: {uri: "/srv/manage/gcstatus", hostName: "GAME_CENTER"},
                ping: {uri: "/srv/user/ping", hostName: "GAME_CENTER"},
                onlineUser: {uri: "/srv/user/getOnlineUsers", hostName: "GAME_CENTER"},
                completeProfile: {uri: "/srv/user/completeProfile", hostName: "GAME_CENTER"},
                verifyAndCompleteProfile: {uri: "/srv/user/verifyandcompleteProfile", hostName: "GAME_CENTER"},
                suggestion: {uri: "/srv/user/bugReport", hostName: "GAME_CENTER"},
                topScore: {uri: "/srv/user/getTopScore", hostName: "GAME_CENTER"},
                editScore: {uri: "/srv/user/editScore", hostName: "GAME_CENTER"},
                asyncRegister: {uri: "/srv/user/asyncRegister", hostName: "GAME_CENTER",encrypt : false},
                activatePeer: {uri: "/srv/user/activatePeer", hostName: "GAME_CENTER",encrypt : false},
                forgetPassword: {uri: "/srv/user/forgotpass", hostName: "GAME_CENTER"},
                invisible: {uri: "/srv/user/invisible", hostName: "GAME_CENTER"},
                searchUser: {uri: "/srv/user/search", hostName: "GAME_CENTER"},
                share: {uri: "/srv/user/share", hostName: "GAME_CENTER"},
                credit: {uri: "/srv/user/getcredit", hostName: "GAME_CENTER"},
                getUserProfile: {uri: "/srv/user/getProfile", hostName: "GAME_CENTER"},
                changePassword: {uri: "/srv/user/changepass", hostName: "GAME_CENTER"},
                editProfile: {uri: "/srv/user/editProfile", hostName: "GAME_CENTER"},
                increaseCreditByVoucher: {uri: "/srv/user/increasecreditbyvoucher", hostName: "GAME_CENTER"},
                leagueMembers: {uri: "/srv/league/members", hostName: "GAME_CENTER"},
                leagueLatestMatchesResult: {uri: "/srv/league/latestmatchresult", hostName: "GAME_CENTER"},
                leagueLatestMatches: {uri: "/srv/league/latestmatches", hostName: "GAME_CENTER"},
                league: {uri: "/srv/league/get", hostName: "GAME_CENTER"},
                leagueRate: {uri: "/srv/league/rate", hostName: "GAME_CENTER"},
                topLeague: {uri: "/srv/league/top", hostName: "GAME_CENTER"},
                enrolledLeagues: {uri: "/srv/user/enrolledleagues", hostName: "GAME_CENTER"},
                topGame: {uri: "/srv/game/top", hostName: "GAME_CENTER"},
                leagueTopPlayer: {uri: "/srv/user/topPlayers", hostName: "GAME_CENTER"},
                topPlayer: {uri: "/srv/user/gettopplayers", hostName: "GAME_CENTER"},
                userAchievements: {uri: "/srv/user/achievements", hostName: "GAME_CENTER"},
                userAchievementDetails: {uri: "/srv/user/achievementdetails", hostName: "GAME_CENTER"},
                userGamePoints: {uri: "/srv/user/gamepoints", hostName: "GAME_CENTER"},
                receivedFriendshipRequest: {uri: "/srv/user/receivedfriendshiprequestlist", hostName: "GAME_CENTER"},
                sentFriendshipRequest: {uri: "/srv/user/sentfriendshiprequestlist", hostName: "GAME_CENTER"},
                userFriends: {uri: "/srv/user/friends", hostName: "GAME_CENTER"},
                friendshipRequest: {uri: "/srv/user/friendshiprequest", hostName: "GAME_CENTER"},
                replyFriendshipRequest: {uri: "/srv/user/replyfriendshiprequest", hostName: "GAME_CENTER"},
                cancelFriendshipRequest: {uri: "/srv/user/cancelfriendshiprequest", hostName: "GAME_CENTER"},
                removeFriendship: {uri: "/srv/user/cancelfriendship", hostName: "GAME_CENTER"},
                relatedLeague: {uri: "/srv/league/related", hostName: "GAME_CENTER"},
                relatedGame: {uri: "/srv/game/related", hostName: "GAME_CENTER"},
                latestLeague: {uri: "/srv/league/latest", hostName: "GAME_CENTER"},
                // table: {uri:"/srv/league/getTable",hostName:"BAZITECH},
                table: {uri: "/srv/league/table", hostName: "GAME_CENTER"},
                defaultLeagueSubscribe: {uri: "/srv/league/enrollDefault", hostName: "GAME_CENTER"},
                leagueFollow: {uri: "/srv/league/follow", hostName: "GAME_CENTER"},
                gameRate: {uri: "/srv/game/rate", hostName: "GAME_CENTER"},
                gameFollow: {uri: "/srv/game/follow", hostName: "GAME_CENTER"},
                followPost: {uri: "/srv/user/follow", hostName: "GAME_CENTER"},
                likePost: {uri: "/srv/user/like", hostName: "GAME_CENTER"},
                validChatThreadId: {uri: "/srv/league/threads", hostName: "GAME_CENTER"},
                leagueAwards: {uri: "/srv/league/awards", hostName: "GAME_CENTER"},
                enrollAccess: {uri: "/srv/league/enrollaccess", hostName: "GAME_CENTER"},
                gameInfo: {uri: "/srv/game/get", hostName: "GAME_CENTER"},
                getLobbyGames: {uri: "/srv/game/getbylobby", hostName: "GAME_CENTER"},
                getLobbyLeagues: {uri: "/srv/league/getbylobby", hostName: "GAME_CENTER"},
                gameFollowing: {uri: "/srv/game/following", hostName: "GAME_CENTER"},
                leagueFollowing: {uri: "/srv/league/following", hostName: "GAME_CENTER"},
                fileInfo: {uri: "/srv/game/fileinfo", hostName: "GAME_CENTER"},
                // requestMatch: {uri: "/srv/match/request", hostName: "GAME_CENTER",encrypt : true},
                requestMatch: {uri: "/srv/match/matchrequest", hostName: "GAME_CENTER",encrypt : true},
                matchReady: {uri: "/srv/match/ready", hostName: "GAME_CENTER",encrypt : true},
                matchRequestResponse: {uri: "/srv/match/requestresult", hostName: "GAME_CENTER",encrypt : true},
                cancelMatchRequest: {uri: "/srv/match/cancelrequest", hostName: "GAME_CENTER"},
                offlineMatchRequest: {uri: "/srv/match/offlinerequest", hostName: "GAME_CENTER"},
                requestMatchId: {uri: "/srv/match/add", hostName: "GAME_CENTER",encrypt : true},
                subscribeLeague: {uri: null, hostName: "GAME_CENTER"},
                // matchResult: {uri:"/srv/v5/match/result",hostName:"GAME_CENTER"},
                matchResult: {uri: "/srv/match/result", hostName: "GAME_CENTER",encrypt : true},
                matchValidate: {uri: "/srv/match/validate", hostName: "GAME_CENTER",encrypt : true},
                requestQuickMatch: {uri: "/srv/match/addquick", hostName: "GAME_CENTER",encrypt : true},
                cancelQuickMatch: {uri: "/srv/match/removequick", hostName: "GAME_CENTER",encrypt : true},
                matchCancel: {uri: "/srv/match/cancel", hostName: "GAME_CENTER",encrypt : true},
                reconnect: {uri: "/srv/match/reconnect", hostName: "GAME_CENTER"},
                chatAsyncRegister: {uri: "/srv/chat/register", hostName: "GAME_CENTER"},
                chatActivatePeer: {uri: "/srv/chat/activate", hostName: "GAME_CENTER"},
                setChatId: {uri: "/srv/chat/setChatId", hostName: "GAME_CENTER"},
                chatRequest: {uri: "/srv/chat/request", hostName: "GAME_CENTER"},
                image: {uri: "/handlers/imageHandler.ashx?imgid=", hostName: "GAME_CENTER"},
                customPost: {uri: "/srv/custompost/get", hostName: "GAME_CENTER"},
                getNews: {uri: "/srv/news/get", hostName: "GAME_CENTER"},
                getCommentList: {uri: "/srv/commentList/", hostName: "GAME_CENTER"},
                addGameComment: {uri: "/srv/game/addcomment", hostName: "GAME_CENTER"},
                addLeagueComment: {uri: "/srv/league/addcomment", hostName: "GAME_CENTER"},
                getGallery: {uri: "/srv/product/gallery", hostName: "GAME_CENTER"},
                getCreditPackList: {uri: "/srv/getcreditpacklist", hostName: "GAME_CENTER"},
                getInAppPurchasePack: {uri: "/srv/iap/getgamepacks", hostName: "GAME_CENTER"},
                getGlobalInAppPurchasePack: {uri: "/srv/iap/getgcpacks", hostName: "GAME_CENTER"},
                buyInAppPurchasePack: {uri: "/srv/iap/buy", hostName: "GAME_CENTER"},
                getGameItems: {uri: "/srv/iap/searchgameitems", hostName: "GAME_CENTER"},
                getUserItems: {uri: "/srv/iap/getgameitems", hostName: "GAME_CENTER"},
                getUserGCItems: {uri: "/srv/iap/getgcitems", hostName: "GAME_CENTER"},
                consumeItem: {uri: "/srv/iap/consume", hostName: "GAME_CENTER"},
                authHandshake: {uri: "/srv/aut/handshake", hostName: "GAME_CENTER"},
                addStreamMatch: {uri: "/srv/stream/addmatch", hostName: "GAME_CENTER",encrypt : false},

                geoLocation: {uri: "/srv/objectPool/geoLocation/add", hostName: "OBJECT_POOL"},
                metaData: {uri: "/srv/objectPool/metaData/add", hostName: "OBJECT_POOL"},
                insertOne: {uri: "/srv/collection/insertOne", hostName: "OBJECT_POOL"},

                launcherList: {uri: "/appStore/restAPI/spring/service/getAllAppLauncher", hostName: "NAVIN"}
            },
            __isRunFromGC = false, // is run from game center
            __configUrl = __fullDomainAddress + "/srv/serviceApi/getConfig",
            __userData = {
                loginState: false,
                ssoLogin: false,
                deviceId: (window && window.device && window.device.uuid) || TisUtil.generateUUID(),
                // deviceId:"d044e8bc-3827-48d5-a9f4-e86283e836ec"
            },
            __database = params.database,
            __games = {
                /*
                 * gameId : {
                 *  callback :
                 *  info : {}
                 *  setting : {}
                 *  leagues : {}
                 *
                 * }
                 * */
            },
            __isMultiTab = true,
            __eventCallbacks = {
                login: {},
                guestLogin: {},
                logout: {},
                autoLoginStart: {},
                autoLoginEnd: {},
                autoLoginFail: {},
                connect: {},
                reconnect: {},
                disconnect: {},
                ready: {},
                buyPack: {},
                creditChange: {},
                profileChange: {},

                message: {},
                activeMatchData: {},
                matchRequestResponse: {},
                gameRegister: {},
                clearMessage: {},
                showUpdateUI: {},
                showAd: {},
                defaultLeagueSubscribe: {},

                newMatch: {},
                matchStart: {},
                matchResult: {},
                matchRequest: {},

                report: {},

                tokenRefresh : {}
            },
            __leagues = {
                /*
                 * leagueId : {
                 *   members : []
                 *   onlineId : []
                 *   info :
                 *   enrollUrl :
                 *   isUserMember :
                 *   games : {}
                 * }
                 * */
            },
            __activeMatches = {
                /*
                 * matchId : {
                 *
                 *
                 * }
                 * */
            },
            __currentRequestMatch = {
                /*
                 * requestId : {
                 *
                 *
                 * }
                 * */
            },
            __databaseParams = {
                tableName: {
                    activeMatch: "activeMatch",
                    matchResult: "matchResult",
                    gameInfo: "gameInfo",
                    score: "score",
                    setting: "setting",
                    chatService: "chatService",
                    uiMessage: "uiMessage"
                },
                version: 3,
                name: __isNarliga ? "TIS_SERVICE_NARLIGA" : "TIS_SERVICE",
                debugMode: false
            },
            __lastValidMatch = {},
            __lastSearchUserTime,
            __lastSearchTimeoutId,
            __lastPollingTimeoutId,
            __inAppPurchase = false,
            __isAppInBackground = false,
            __autoMatchRequestAccept = false,
            __isGameCenterInstall = false,
            __isChatRegister = false,
            __majorConflictState = false,
            __isCheckLoginActionWithPeer = false,
            __network,
            __chatService,
            __chatEnable = typeof params.chatEnable == "boolean" ? params.chatEnable : true,
            // __quiz,
            __exchange,
            __networkMethods = {},
            // __chatMessagesTypes,
            __appId = (params && params.appId) || "GC_WEB",
            __currentMatchRequestCount = 0,
            __isAcceptingMatchRequest = false,
            __isReady = false,
            __activeMatchRequest = {
                /*
                 * leagues : {
                 *      leagueId : {
                 *        userId : requestId
                 *      }
                 * }
                 *
                 * users : {
                 *      userId : {
                 *             leagueId : requestId
                 *      }
                 * }
                 *
                 *
                 * */
            },
            __quickMatchData = {
                leagues: {
                    /*
                     * leagueId : {
                     *   state :
                     *   onAccept :
                     *   timeoutId :
                     * }
                     * */
                },
                requestCount: 0
            },
            __lastMatchRequestData,
            __serverTime,
            __isNodeJS = TisUtil.isNodeJS(),

            __lastGeoLocationId,
            __lastGeoLocationRequestTimeoutId,
            __lastGeoLocationData,
            __encryptHandshakeData = {
                data: undefined,
                updateTime: undefined,
                updating : false,
                callbackQueue : []
            },

            __asyncInfo = {
                globalResAvg: 0,
                nMinResTime: [],

                globalResAvgCount: 0,
                lastNMinTime: new Date(),
                lastResTime: 0
            },

            __storageData = typeof localStorage !== "undefined" ? JSON.parse(localStorage.getItem("userData")) || JSON.parse(sessionStorage.getItem("userData")) : null,
            // userAccountData,
            // __authTokenType = TIS.GC_NAME == TIS.GC_BAZITECH ? "bazitechGames" : "narligaGames",
            __accountManager,
            __accountType = TIS.GC_NAME == TIS.GC_BAZITECH ?
                (__isLocal ? "com.nozhaco.bazitechLocal" : "com.nozhaco.bazitech") :
                (__isLocal ? "com.nozhaco.narligaLocal" : "com.nozhaco.narliga"),

            __logger,
            __syncPeerWithToken = false,
            __syncTokenWithPeer = false,
            __peerAndTokenSync = false,
            __firstConnect = false,

            __temporaryPeerData = {
                peerId: null,
                lastTime: 0,
                deviceId: TisUtil.generateUUID(),
                loading: false
            };

        /*==================================================================================================================
         *                                   P U B L I C    V A R I A B L E
         *================================================================================================================*/

        /*==================================================================================================================
         *                                   P R I V A T E     M E T H O D
         *================================================================================================================*/


        var __init = function () {

                __logger = new TisLog({
                    nameSpace: "Service",
                    nameSpaceInConsole: true,
                    addTime: true,
                    enable: false,
                    save: true,
                    console: true
                });

                if(!__isNodeJS) {
                    var data = TisUtil.getUrlData(window.location.href)

                    if(data && data.gameData) {
                        __isRunFromGC = true;
                    }

                }

                __handleInputParams(function () {
                    if (__storageData) {
                        __fireEvent("autoLoginStart");
                    } else {
                        __fireEvent("autoLoginFail");
                    }

                    function act() {
                        __initNetwork();

                        __applyConfigData(function () {

                            if(Object.keys(__games).length>0) {
                                __self.getGamesInfo({registerGame: true}, function (result) {
                                    if (!result.hasError) {
                                        var allGame = result.result.games;
                                        var fireState = false;
                                        for (var i = 0; i < allGame.length; i++) {
                                            var game = allGame[i];

                                            var hasConflict = __hasMajorConflict({
                                                gameId: game.id,
                                                version: game.lastVersion
                                            });
                                            if (hasConflict) {
                                                __majorConflictAction();
                                                break;
                                            }

                                        }
                                        for (gameId in allGame) {

                                        }
                                    }
                                });
                            }

                            if (__isApp) {
                                __checkGameCenterIsInstall();
                            }

                            __network.init({
                                config: __configData,
                                socketServerAddress: __serverData.PUSH.address,
                                log: __logger
                            });

                            if (__chatEnable) {
                                __chatService = new TisChatServiceClass({
                                    serverData: __serverData,
                                    socketReport: __socketReport,
                                    isNarliga: __isNarliga,
                                    requestUrls: __requestUrls,
                                    config: __configData,
                                    dic: __dic,
                                    lang: __lang,
                                    appId: __appId,
                                    deviceId: __userData.deviceId,
                                    service: __self
                                });
                            }


                            // __loadBazitechInIFrame();

                            __checkServiceUpdate();


                            if (__configData.hiap) {
                                __inAppPurchase = true;
                            }

                            __isReady = true;

                            __fireEvent("ready");

                            __autoLoginCheck(function () {
                                __checkToken();
                            });

                            __checkForTestApp();
                            // __self.registerGuestRequest();

                        });

                        if(!__database) return;

                        for (var gameId in __games) {
                            gameId = parseInt(gameId);
                            (function (gameId) {
                                __database.getFromTableWithIndex({
                                    name: __databaseParams.tableName.gameInfo,
                                    index: gameId,
                                    onSuccess: function (result) {
                                        if (!result) {
                                            __database.addToTable({
                                                name: __databaseParams.tableName.gameInfo,
                                                data: [{
                                                    index: gameId,
                                                    value: __games[gameId].info
                                                }],
                                                onComplete: function (e) {
                                                    //__logger.info("onComplete", e)();
                                                },
                                                onError: function (e) {
                                                    //__logger.info("errrrr", e)();
                                                }
                                            });
                                        }
                                    }
                                });
                            })(gameId);
                        }

                    }

                    if(typeof __database === "object") {
                        act();
                    } else if (__database === false) {
                        act();
                    } else {
                        __initDatabase(function () {
                            act();
                        });
                    }

                    // if(window) {
                    //     window.addEventListener("message", function (e) {
                    //         console.log("parent message",e.data);
                    //     }, false);
                    // }

                });

                __initCht();

            },

            __checkForTestApp = function () {

                if (TIS.IS_BETA_VERSION && typeof __configData.btgv == "object") {
                    try {
                        var isChecked = false;
                        for (var gameId in __games) {
                            if (typeof __configData.btgv[gameId] == "string") {
                                isChecked = true;
                                var ver = __configData.btgv[gameId];
                                var game = __games[gameId];
                                var compareData = TisUtil.compareVersion(ver, game.version)

                                if (compareData.majorConflict || compareData.isGreater) {
                                    __majorConflictAction();
                                    break;
                                }
                            }
                        }

                        if (!isChecked) {
                            __majorConflictAction();
                        }
                    } catch (e) {
                        console.log("EXCEPTION FOR CHECK IS TEST APP");
                    }

                }
            },

            __geoLocationDistance = function (geoData1, geoData2) { // Points are Geolocation.coords objects
                var rad = TisUtil.degToRad;
                var R = 6371; // earth's mean radius in km
                var dLat = rad(geoData2.latitude - geoData1.latitude);
                var dLong = rad(geoData2.longitude - geoData1.longitude);

                var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(rad(geoData1.latitude)) * Math.cos(rad(geoData2.latitude)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                var d = R * c;

                return parseFloat(d.toFixed(3));
            },

            __initGeoLocationRequest = function () {

                __getGeoLocation(function (geoResult) {
                    if (!geoResult.hasError) {

                        if (__userData.token &&
                            (!__lastGeoLocationId ||
                                (__lastGeoLocationData && __geoLocationDistance(__lastGeoLocationData, geoResult.result) > __configData.glrdd))) {
                            var requestData = {
                                doc: {
                                    latitude: geoResult.result.latitude,
                                    longitude: geoResult.result.longitude,
                                    accuracy: geoResult.result.accuracy,
                                    speed: geoResult.result.speed,
                                    heading: geoResult.result.heading,
                                    appId: __appId
                                },
                                token: __userData.token,
                                dbToken: __configData.opdt,
                                collectionName: "geolocation",
                            };
                            __request(
                                "insertOne",
                                requestData,
                                function (result) {
                                    if (!result.HasError) {
                                        __lastGeoLocationId = result.Result._id;
                                    }
                                },
                                {
                                    addToken: false,
                                    headers: {
                                        "Content-Type": "application/json; charset=utf-8"
                                    }
                                });
                        }

                        __lastGeoLocationData = geoResult.result;
                    }
                    __lastGeoLocationRequestTimeoutId = setTimeout(function () {
                        __initGeoLocationRequest();
                    }, __configData.glit);
                });

            },

            __getGeoLocation = function (callback) {
                function success(geoData) {
                    if (__userData) {
                        __userData.coordsData = geoData.coords;
                    }
                    callback({
                        hasError: false,
                        result: geoData.coords
                    });
                }

                function faild(e) {
                    callback({
                        hasError: true
                    });
                }

                if (__isApp && TIS.Plugin.getCurrentPosition) {

                    TIS.Plugin.getCurrentPosition(success, faild);
                    return;
                }

                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        success,
                        faild,
                        {
                            maximumAge: __configData.glma,
                            timeout: __configData.glt
                        }
                    );
                }

            },

            __sendMetaData = function (metaData, saveIp, callback) {
                if (!__userData.token) {
                    callback && callback(TisUtil.createReturnData(true, "", 0, null));
                    return;
                }
                var requestData = {
                    dbToken: __configData.opdt,
                    collectionName: "metadata",
                    doc: metaData,
                    configs: {
                        _requestIp: saveIp,
                        _createdAt: true
                    },
                    token: __userData.token
                };

                __request(
                    "insertOne",
                    requestData,
                    function (result) {
                        callback && callback(result);
                    },
                    {
                        addToken: false,
                        headers: {
                            "Content-Type": "application/json; charset=utf-8"
                        }
                    });
            },

            __sendMatchMetaData = function (matchId, gameId) {

                if (!__configData.smdtop) {
                    return;
                }

                var matchData = __activeMatches[matchId];
                if (matchData) {
                    var obj = {
                        metaType: __metaDataTypes.MATCH_DATA,
                        matchId: matchId,
                        userId: __userData.id,
                        appId: gameId,
                        applicant: matchData.ownData.applicant,
                        opponentId: matchData.opponentsData[0].id,
                        startTime: matchData.startTime,
                        isQuick: matchData.isQuick,
                        leagueId: matchData.leagueId,
                        isMultiPlayer: matchData.isMultiPlayer,
                        endTime: new Date()
                    };

                    if (matchData.resultReason) {
                        obj.resultReason = matchData.resultReason;
                    }
                    if (__lastGeoLocationId) {
                        obj.geolocation = __lastGeoLocationId;
                    }
                    __sendMetaData(obj, true);
                }
            },

            __sendInstalledAppsToObjectPool = function () {

                if (__isApp) {

                    if (TIS.Plugin && TIS.Plugin.getInstalledApps) {

                        var currentTime = new Date();

                        function sendMetaData() {

                            TIS.Plugin.getInstalledApps(function (apps) {
                                var data = {
                                    metaType: __metaDataTypes.INSTALLED_APPS,
                                    installedApps: apps,
                                    userId: __userData.id,
                                    appId: __appId
                                };

                                __sendMetaData(data, false, function (res) {
                                    if (!res.HasError) {
                                        __database.addToTable({
                                            name: __databaseParams.tableName.setting,
                                            data: [{
                                                index: "lastSendInstalledApps",
                                                value: currentTime
                                            }]
                                        });
                                    }
                                });


                            }, function (e) {
                                //console.log("FAIL", e);
                            });

                        }

                        __database.getFromTableWithIndex({
                            name: __databaseParams.tableName.setting,
                            index: "lastSendInstalledApps",
                            onSuccess: function (result) {
                                if (!result) {
                                    sendMetaData();
                                } else {
                                    var lastTime = new Date(result);
                                    if (currentTime.getTime() - lastTime.getTime() > __configData.siadi * 86400000) {
                                        sendMetaData();
                                    }
                                }

                            }
                        });


                    }
                }
            },

            __sendDeviceInfoToObjectPool = function () {
                var data = {
                    metaType: __metaDataTypes.USER_DEVICE_INFO,
                    userId: __userData.id,
                    appId: __appId
                };

                if (!__isNodeJS) {
                    if (__isApp) {
                        data.isApp = true;
                        if (window && window.device != undefined) {
                            data.platform = window.device.platform;
                            data.available = window.device.available;
                            data.version = window.device.version;
                            data.uuid = window.device.uuid;
                            data.cordova = window.device.cordova;
                            data.model = window.device.model;
                            data.manufacturer = window.device.manufacturer;
                            data.isVirtual = window.device.isVirtual;
                            data.serial = window.device.serial;
                        }

                    } else {
                        var browserData = TisUtil.getBrowserData();
                        data.isApp = false;
                        data.browserName = browserData.name;
                        data.version = browserData.majorVersion;
                        data.platform = browserData.platform;
                        data.architecture = browserData.architecture;
                    }
                }


                if (__lastGeoLocationId) {
                    data.geolocation = __lastGeoLocationId;
                }

                __sendMetaData(data);
            },

            __clearAutoUpdateServiceCache = function () {
                if(__isNodeJS) return
                localStorage.removeItem("TIS_SERVICE_CODE");
                localStorage.removeItem("TIS_SERVICE_VERSION");
                localStorage.removeItem("TIS_SERVICE_UI_CODE");
                localStorage.removeItem("TIS_SERVICE_UI_VERSION");
                localStorage.removeItem("TIS_SERVICE_CHAT_UI_CODE");
                localStorage.removeItem("TIS_SERVICE_CHAT_UI_VERSION");
            },

            __updateUeserData = function () {


            },

            __checkServiceUpdate = function () {

                var serviceUpdateVersion = __configData.sv,
                    serviceUIUpdateVersion = __configData.suv,
                    chatUIUpdateVersion = __configData.cuv;

                if ((serviceUpdateVersion || serviceUIUpdateVersion || chatUIUpdateVersion) && __configData.nsu) {


                    var serviceCode,
                        serviceUICode,
                        chatUICode,
                        needUpdateCount = 0,
                        updatedCount = 0;

                    function applyUpdate() {

                        if (needUpdateCount > 0 && updatedCount == needUpdateCount) {

                            try {
                                if (serviceCode) {
                                    localStorage.setItem("TIS_SERVICE_CODE", serviceCode);
                                    localStorage.setItem("TIS_SERVICE_VERSION", serviceUpdateVersion);
                                }

                                if (serviceUICode) {
                                    localStorage.setItem("TIS_SERVICE_UI_CODE", serviceUICode);
                                    localStorage.setItem("TIS_SERVICE_UI_VERSION", serviceUIUpdateVersion);
                                }

                                if (chatUICode) {
                                    localStorage.setItem("TIS_SERVICE_CHAT_UI_CODE", chatUICode);
                                    localStorage.setItem("TIS_SERVICE_CHAT_UI_VERSION", chatUIUpdateVersion);
                                }

                            } catch (e) {
                                console.log("ERROR IN SAVE CODE TO LOCAL STORAGE");
                                __clearAutoUpdateServiceCache();
                            }
                        }
                    }

                    if (serviceUpdateVersion && TisUtil.compareVersion(serviceUpdateVersion, Service.VERSION).isGreater) {

                        needUpdateCount += 1;
                        __self.getCustomPost(
                            {
                                businessId: __configData.businessId,
                                metadata: {name: __configData.scpn}
                            }, function (result) {
                                try {
                                    updatedCount += 1;
                                    if (!result.hasError && result.result.length > 0) {
                                        serviceCode = JSON.parse(result.result[0].metadata).content;
                                    }
                                    applyUpdate();
                                } catch (e) {
                                    console.log("ERROR IN SERVICE CUSTOM POST PARSE", e);
                                }
                            });

                    }

                    if (serviceUIUpdateVersion && TIS.ServiceUI && TisUtil.compareVersion(serviceUIUpdateVersion, TIS.ServiceUI.VERSION).isGreater &&
                        TIS.ServiceUI.NAME == "TIS_SERVICE_UI") {

                        needUpdateCount += 1;

                        __self.getCustomPost(
                            {
                                businessId: __configData.businessId,
                                metadata: {name: __configData.sucpn}
                            }, function (result) {
                                updatedCount += 1;
                                try {
                                    if (!result.hasError && result.result.length > 0) {
                                        serviceUICode = JSON.parse(result.result[0].metadata).content;
                                    }
                                    applyUpdate()
                                }
                                catch (e) {
                                    console.log("ERROR IN SERVICE UI CUSTOME POST PARSE ", e);
                                }
                            });

                    }

                    if (chatUIUpdateVersion && TIS.ChatUI && TisUtil.compareVersion(chatUIUpdateVersion, TIS.ChatUI.VERSION).isGreater &&
                        TIS.ChatUI.NAME == "TIS_SERVICE_CHAT_UI") {

                        needUpdateCount += 1;

                        __self.getCustomPost(
                            {
                                businessId: __configData.businessId,
                                metadata: {name: __configData.cucpn}
                            }, function (result) {
                                updatedCount += 1;
                                try {
                                    if (!result.hasError && result.result.length > 0) {
                                        chatUICode = JSON.parse(result.result[0].metadata).content;
                                    }
                                    applyUpdate()
                                }
                                catch (e) {
                                    console.log("ERROR IN SERVICE UI CUSTOME POST PARSE ", e);
                                }
                            });

                    }

                }

                if (!__configData.nsu) {
                    __clearAutoUpdateServiceCache();
                }

            },

            __loadBazitechInIFrame = function () {
                if (__configData.vbif) {
                    var iFrame = document.createElement("iframe");
                    iFrame.src = __configData.bvl;
                    iFrame.style.display = "none";

                    document.body.appendChild(iFrame);
                }
            },

            __isGameRun = function () {
                var state = false;

                for (var gameId in __games) {
                    if (__games[gameId].isRun) {
                        state = true;
                    }
                }

                return state;
            },

            __fireEvent = function (eventName, param) {
                try {
                    for (var id in __eventCallbacks[eventName]) __eventCallbacks[eventName][id](param);
                } catch (e) {
                    throw new ServiceException("can not fire " + eventName + " event", e);
                }
            },

            __handleInputParams = function (callback) {
                var games = params.games;

                __inAppPurchase = !!TIS.IN_APP_PURCHASE_STATE;


                if (typeof params.on == "object") {
                    for (var eventName in params.on) {
                        __self.on(eventName, params.on[eventName]);
                    }
                }

                if (params.setting && (typeof params.setting.isMultiTab == "boolean")) {
                    __isMultiTab = params.setting.isMultiTab;
                }


                for (var gameId in games) {
                    __appId = gameId;
                    __registerGame(__appId, params);
                }


                callback();

            },

            __checkHasInputData = function () {
                // console.log("__checkHasInputData");
                if (TisUtil.isNodeJS()) {
                    return;
                }

                if (__isApp) {
                    document.addEventListener("deviceready", function () {
                        __initMobileEvent();
                    }, false);
                } else {
                    var urlData = TisUtil.getUrlData(window.location.href);
                    if (urlData && urlData.gameData) {
                        var data = JSON.parse(decodeURIComponent(urlData.gameData));
                        __gameDataHandler(data, true);

                    } else {
                        //__autoLoginCheck();
                    }
                }
            },

            __initNotificationEvent = function () {
                try {
                    window.cordova.plugins.notification.local.un("click", TIS.__notificationClickAction);

                    __handleLaunchAppNotification();


                    window.cordova.plugins.notification.local.on("click", function (notification) {
                        __handleNotificationClickAction(notification);
                        return false;
                    });

                    window.cordova.plugins.notification.local.on("clear", function (notification) {
                        //__logger.info("NOTIFICATION CLEAR",notification)();
                    });

                    window.cordova.plugins.notification.local.on("cancel", function (notification) {
                        //__logger.info("NOTIFICATION CANCEL",notification)();
                    });

                    window.cordova.plugins.notification.local.getScheduled(function (notifications) {
                        //__logger.info("SCHEDULED NOTIFICATION--0", notifications)();
                        var expireMatchRequest = [];
                        for (var i = 0; i < notifications.length; i++) {
                            var notification = notifications[i];
                            try {
                                var data = JSON.parse(notification.data);
                                //__logger.info("SCHEDULED NOTIFICATION--1", notifications)();
                                if (data && data.timeout && data.type == __notificationTypes.BAZITECH_MESSAGE) {
                                    if (new Date() - new Date(notification.at) > data.timeout) {
                                        __clearNotification(notification.id);
                                    }
                                }

                                if (data &&
                                    (data.type == __notificationTypes.MATCH_START ||
                                        data.type == __notificationTypes.MATCH_REQUEST_EXPIRE)) {
                                    __clearNotification(notification.id);
                                }

                                if (data && data.timeout && data.type == __notificationTypes.MATCH_REQUEST) {
                                    if (data.timeout && data.at) {
                                        if (new Date() - new Date(data.at) > data.timeout) {
                                            expireMatchRequest.push(data);
                                            __clearNotification(notification.id);
                                        }
                                    }
                                }
                            } catch (e) {
                                //__logger.info("SCHEDULED NOTIFICATION--catch failed", notifications,e)();
                            }

                        }
                        if (expireMatchRequest.length > 0) {
                            var message = __dic.MATCHREQUESTFROM[__lang];
                            for (var i = 0; i < expireMatchRequest.length; i++) {
                                var notif = expireMatchRequest[i];
                                if (i == expireMatchRequest.length - 1) {
                                    message += (notif.content.name + " ")
                                } else {
                                    message += (notif.content.name + " ,")
                                }
                            }

                            message += __dic.HAVE[__lang];
                            __showNotification({
                                id: TisUtil.generateUUIDFromTime(),
                                title: __dic.MATCHREQUESTS[__lang],
                                message: message,
                                type: __notificationTypes.MATCH_REQUEST_EXPIRE
                            });
                        }

                    });
                } catch (e) {
                    //__logger.info("can not init notification event",e)();
                }
            },

            __initCht = function () {
                if (typeof document === 'undefined') {
                    return;
                }
                var events = {};

                events.matchDataView = document.createEvent('Event');
                events.matchDataView.initEvent('matchDataView', true, true);

                var menuButtonStartTapTimeStamp = undefined,
                    menuButtonTapCount = 0;

                if (navigator && navigator.app) {
                    navigator.app.overrideButton("menubutton", true);
                }
                document.addEventListener("menubutton", function (e) {
                    var currentTimeStamp = e.timeStamp;
                    if (!menuButtonStartTapTimeStamp || (menuButtonStartTapTimeStamp && (currentTimeStamp - menuButtonStartTapTimeStamp > 3000))) {
                        menuButtonStartTapTimeStamp = currentTimeStamp;
                        menuButtonTapCount = 1;
                    } else {
                        menuButtonTapCount += 1;
                        if (menuButtonTapCount == 4) {
                            document.dispatchEvent(events.matchDataView);
                            menuButtonStartTapTimeStamp = undefined;
                            menuButtonTapCount = 0;
                        }
                    }
                }, false);

            },

            __initMobileEvent = function () {
                console.log("__initMobileEvent");
                try {
                    TIS.Plugin.getExtra("gameData",
                        function (data) {
                            console.log("GET_EXTRA ", data);
                            __handleGCMMessage(data);
                        }, function () {
                            //__autoLoginCheck();
                            if (TIS.GC_NAME == TIS.GC_BAZITECH) {

                            }
                        }
                    );

                    TIS.Plugin.onNewIntent(function (data) {
                        __logger.info("onNewIntent", data)();
                        __handleGCMMessage(data, true, false);

                    });

                    TIS.Plugin.onReceiveBroadcast(function (data) {
                        __logger.info("onReceiveBroadcast", data)();
                        __handleGCMMessage(data);

                    });

                } catch (e) {
                    //__logger.info("can not init mobile event")();
                }

                document.addEventListener("pause", function () {
                    __isAppInBackground = true;
                }, false);

                document.addEventListener("resume", function () {
                    __isAppInBackground = false;
                }, false);

                __initNotificationEvent();
            },

            __initNetwork = function (appId) {

                __network = new TisNetworkClass({
                    parent: __networkMethods,
                    dic: __dic,
                    config: __configData,
                    lang: __lang,
                    appId: __appId,
                    deviceId: __userData.deviceId,
                    socketReport: __socketReport,
                    isNarliga: __isNarliga,
                    isForChat: false,
                    logger: __logger
                });

                __network.on("connect", function (peerId) {
                    __logger.info("connect", peerId)();
                    __userData.peerId = peerId;
                    __fireEvent("connect", {peerId: peerId});

                    __checkPeerAndSocketSync();

                    if (!__firstConnect) {
                        __firstConnect = true;
                        __loginActionWithPeer();
                        __checkHasInputData();
                    } else if (__userData.loginState) {
                        __pingAction();
                    }

                });

                __network.on("disconnect", function () {
                    __logger.info("disconnect")();
                    __fireEvent("disconnect");
                    __userData.peerId = undefined;
                    //var online = navigator.onLine;

                    for (var matchId in __activeMatches) {
                        if (typeof __activeMatches[matchId].match.onDisconnect == "function") {
                            __activeMatches[matchId].match.onDisconnect();
                        }

                    }
                });

                __network.on("reconnect", function (peerId) {
                    __logger.info("reconnect", peerId)();
                    __reconnectAction(peerId);
                    __fireEvent("reconnect", {peerId: peerId});

                });

                __network.on("message", function (params, res) {
                    __handlePushMessageContent(params, res);
                });

                __network.on("report", function (params) {
                    __fireEvent("report", params);
                });
            },

            __handlePushMessageContent = function (params, res) {

                try {
                    var message = JSON.parse(params.content),
                        senderMessageId = params.senderMessageId;

                    var messageType = message.type,
                        data = JSON.parse(message.content);

                    if (messageType == __contentMessageMap.dataPack) {
                        __onReceiveDataPackAction(data, res);
                    } else {
                        if (!__gameCenterMessagesId[senderMessageId]) {
                            switch (messageType) {

                                case __contentMessageMap.requestIdState :
                                    __logger.info("RECEIVE DATA -- REQUEST ID STATE", data.requestId)();
                                    __onReceiveRequestIdStateAction(data);
                                    break;

                                case __contentMessageMap.newMatch :
                                    __logger.info("RECEIVE DATA -- NEW MATCH", data.matchId, senderMessageId)();
                                    __onReceiveNewMatchAction(data);
                                    break;

                                case __contentMessageMap.startMatch :
                                    __logger.info("RECEIVE DATA -- START MATCH", data.matchId, senderMessageId)();
                                    __onReceiveStartMatchAction(data);
                                    break;

                                case __contentMessageMap.resumeMatch :
                                    __logger.info("RECEIVE DATA -- RESUME MATCH", data.matchId, senderMessageId)();
                                    __onReceiveResumeMachAction(data, false);
                                    break;

                                case __contentMessageMap.pauseMatch :
                                    __logger.info("RECEIVE DATA -- PAUSE MATCH", data.matchId, senderMessageId)();
                                    __onReceivePauseMatchAction(data);
                                    break;

                                case __contentMessageMap.requestMatch :
                                    __logger.info("RECEIVE DATA -- REQUEST MATCH", data.requestId, senderMessageId)();
                                    if(__isRunFromGC) return;

                                    __onReceiveRequestMatchAction(data, false);
                                    break;

                                case __contentMessageMap.matchResult :
                                    __logger.info("RECEIVE DATA -- MATCH RESULT", data.matchId, senderMessageId, data.state)();
                                    __onReceiveMatchResultAction(data);
                                    break;

                                case __contentMessageMap.message :
                                    __logger.info("RECEIVE DATA -- NOTIFICATION ", data.matchId, senderMessageId)();
                                    __onReceiveMessageAction(data);
                                    break;

                                case __contentMessageMap.reconnect :
                                    __logger.info("RECEIVE DATA -- RECONNECT ", data.matchId, data.opponentSessionId)();
                                    __onReceiveResumeMachAction(data, true);
                                    break;

                                case __contentMessageMap.leaveMatch :
                                    __logger.info("RECEIVE DATA -- LEAVE MATCH ", data.matchId, data.opponentSessionId)();
                                    __onReceiveLeaveMachAction(data);
                                    break;
                            }
                            __gameCenterMessagesId[senderMessageId] = true;
                            res && res();
                        } else {
                            __logger.info("RECEIVE DATA -- REPEAT MESSAGE  ", senderMessageId)();
                            res && res();
                        }
                    }
                } catch (e) {
                    console.error("__handlePushMessageContent", params,e);

                }


            },

            __getRejectMessageByType = function (rejectReasonType) {
                var message;
                switch (rejectReasonType) {

                    case __rejectType.USER_NOT_ACCEPT.value :
                        message = __rejectType.USER_NOT_ACCEPT.message[__lang];
                        break;

                    case __rejectType.APP_NOT_INSTALLED.value :
                        message = __rejectType.APP_NOT_INSTALLED.message[__lang];
                        break;

                    case __rejectType.USER_VERSION_CONFLICT.value :
                        message = __rejectType.USER_VERSION_CONFLICT.message[__lang];
                        break;

                    case  __rejectType.USER_IS_BUSY.value :
                        message = __rejectType.USER_IS_BUSY.message[__lang];
                        break;
                }

                return message;
            },

            /**
             * @method __onReceiveDataPackAction
             * @private
             *
             * @param {Object} params
             *      @param {Object} params.data
             *      @param {String} params.dataId
             *      @param {Number} params.matchId
             * @param {Function} res
             *
             * */
            __onReceiveDataPackAction = function (params, res) {
                console.log("receive data ", JSON.stringify(params));

                var matchData = __activeMatches[params.matchId];
                __logger.info("__onReceiveDataPackAction ",
                    params.matchId, params.dataId,
                    matchData && matchData.isStart,
                    matchData && matchData.isRun,
                    matchData && matchData.isEnd
                )();

                // console.log("receive",params.matchId,params.dataId,typeof matchData,matchData.isStart,matchData.isRun,matchData.isEnd)
                if (matchData) {
                    if (matchData.isStart && matchData.isRun) {
                        if (matchData.isEnd) {
                            res(true);
                        } else {
                            __dataPackReceiveAction(params, res);
                        }

                    } else {
                        matchData.receiveDataQueue.push({
                            params: params,
                            res: res
                        });
                    }

                } else {
                    res(true);
                }
            },

            /**
             * @method __onReceiveRequestIdStateAction
             * @private
             *
             * @param {Object} params
             *      @param {String} params.gameName
             *      @param {String} params.leagueName
             *      @param {String} params.opponentName
             *      @param {String} params.rejectMessage
             *      @param {Number} params.rejectReasonType
             *      @param {Number} params.requestId
             *      @param {Boolean} params.state
             *
             * */
            __onReceiveRequestIdStateAction = function (params) {
                var message;
                switch (params.rejectReasonType) {

                    case __rejectType.USER_NOT_ACCEPT.value :
                        message = __rejectType.USER_NOT_ACCEPT.message[__lang];

                        if (params.rejectMessage) {
                            message = params.rejectMessage;
                        }
                        break;

                    case __rejectType.APP_NOT_INSTALLED.value :
                        message = __rejectType.APP_NOT_INSTALLED.message[__lang];
                        break;

                    case __rejectType.USER_VERSION_CONFLICT.value :
                        message = __rejectType.USER_VERSION_CONFLICT.message[__lang];
                        break;

                    case  __rejectType.USER_IS_BUSY.value :
                        message = __rejectType.USER_IS_BUSY.message[__lang];
                        break;
                }

                var requestId = params.requestId;
                var data = {
                    requestId: requestId,
                    state: params.state,
                    rejectMessage: message
                };

                var requestData = __activeMatchRequest[params.leagueId] && __activeMatchRequest[params.leagueId][requestId];
                if (requestData) {
                    if (params.state) {
                        requestData.onAccept && requestData.onAccept({
                            requestId: requestId
                        });

                    } else {
                        requestData.onReject && requestData.onReject({
                            requestId: requestId,
                            rejectMessage: message
                        });
                    }
                    __currentMatchRequestCount -= 1;

                    clearTimeout(requestData.timeoutId);

                    delete __activeMatchRequest[params.leagueId][requestId];
                }

                __fireEvent("matchRequestResponse", data);

            },

            /**
             * @method __onReceiveNewMatchAction
             * @private
             *
             * @param {Object} matchData
             *      @param {Boolean} matchData.applicant
             *      @param {Boolean} matchData.isMultiPlayer
             *      @param {Number} matchData.gameId
             *      @param {Number} matchData.leagueId
             *      @param {Number} matchData.matchId
             *      @param {Number} matchData.id
             *      @param {String} matchData.name
             *      @param {String} matchData.packageName
             *      @param {String} matchData.sessionId
             *      @param {Object} matchData.opponentData
             *              @param {Number} matchData.opponentData.id
             *              @param {String} matchData.opponentData.name
             *              @param {String} matchData.opponentData.sessionId
             *
             * */
            __onReceiveNewMatchAction = function (matchData) {

                if (!__userData.loginState) {
                    return;
                }
                __logger.info("__onReceiveNewMatchAction ", matchData.matchId)();

                matchData.isMultiPlayer = true;

                matchData.ownData = {
                    id: matchData.id,
                    name: matchData.name,
                    applicant: matchData.applicant,
                    image: matchData.image,
                    imageUrl: matchData.imageUrl
                };

                // if (matchData.image) {
                //     matchData.ownData.image = {
                //         id: matchData.image.id,
                //         width: matchData.image.width,
                //         height: matchData.image.height,
                //     }
                // }
                if (typeof matchData.rank == "object") {
                    matchData.ownData.rank = matchData.rank;
                }

                matchData.opponentsData = [{
                    id: matchData.opponentData.id,
                    name: matchData.opponentData.name,
                    peerId: matchData.opponentData.sessionId,
                    image: matchData.opponentData.image,
                    imageUrl: matchData.opponentData.imageUrl,
                    applicant: !matchData.applicant
                }];

                if (typeof  matchData.opponentData.rank == "object") {
                    matchData.opponentsData[0].rank = matchData.opponentData.rank;
                }

                // if (matchData.opponentData.image && matchData.opponentData.image.id) {
                //     matchData.opponentsData[0].image = {
                //         id: matchData.opponentData.image.id,
                //         width: matchData.opponentData.image.width,
                //         height: matchData.opponentData.image.height
                //     }
                // }
                __newMatch(matchData);
            },

            /**
             * @method __onReceiveStartMatchAction
             * @private
             *
             * @param {Object} params
             *      @param {Number} params.matchId
             *      @param {String} params.opponentSessionId
             *
             * */
            __onReceiveStartMatchAction = function (params) {
                console.log("match start", JSON.stringify(params));
                __logger.info("__onReceiveStartMatchAction ", params.matchId, params.opponentSessionId)();
                var matchId = params.matchId;
                var matchObj = __activeMatches[matchId];
                if (matchObj) {
                    matchObj.isStart = true;
                    matchObj.isRun = true;
                    matchObj.startTime = new Date();
                    if (params.opponentSessionId)
                        matchObj.opponentSessionId = params.opponentSessionId;


                    __fireEvent("matchStart", {
                        matchId: matchId,
                        leagueId: matchObj.leagueId,
                        players: matchObj.players,
                        isMultiPlayer: matchObj.isMultiPlayer,
                        isReload: matchObj.isReload,
                        isQuick: matchObj.isQuick
                    });

                    if (typeof matchObj.match.onStart == "function") {
                        matchObj.match.onStart();
                    }


                    for (var i = 0; i < matchObj.receiveDataQueue.length; i++) {
                        var data = matchObj.receiveDataQueue[i];
                        __onReceiveDataPackAction(data.params, data.res);
                        matchObj.receiveDataQueue = [];
                    }


                    if (__isAppInBackground) {
                        __showNotification({
                            id: TisUtil.generateUUIDFromTime(),
                            title: __dic.MATCHSTART[__lang],
                            message: __dic.MATCHSTARTMESSAGE[__lang].replace("$VAR", matchObj.players.player2.name),
                            type: __notificationTypes.MATCH_START
                        });
                    }

                } else {
                    __logger.info("__onReceiveStartMatchAction_ match not exists ", params.matchId)();
                }
            },

            /**
             * @method __onReceiveResumeMachAction
             * @private
             *
             * @param {Boolean} isReconnect
             * @param {Object} params
             *      @param {Number} params.matchId
             *      @param {String} params.opponentSessionId
             *
             *
             *
             * */
            __onReceiveResumeMachAction = function (params, isReconnect) {
                console.log("match resume", JSON.stringify(params));
                var matchId = params.matchId,
                    opponentSessionId = params.opponentSessionId,
                    matchObj = __activeMatches[matchId];

                __logger.info("__onReceiveResumeMachAction ", matchId, opponentSessionId)();

                if (matchObj) {
                    matchObj.opponentSessionId = opponentSessionId;
                    if (!matchObj.isFinished) {

                        __updateOpponentSessionId({
                            matchId: matchId,
                            opponentSessionId: opponentSessionId,
                            onDone: function () {
                                __handleSequentialSendData({
                                    matchId: matchId,
                                    callback: function (params) {
                                        var lastData = params.lastData;

                                        var lastReceivedData = [];

                                        if (__activeMatches[matchId].isInReloadState) {

                                            for (var dataId in lastData.receivedData) {
                                                lastReceivedData.push({
                                                    data: lastData.receivedData[dataId],
                                                    dataId: dataId
                                                });
                                            }
                                            __activeMatches[matchId].isInReloadState = false;
                                        }

                                        if (!__activeMatches[matchId].isStart) {
                                            __activeMatches[matchId].isStart = true;
                                            //__activeMatches[matchId].isRun = true;
                                            __fireEvent("matchStart", {
                                                matchId: matchId,
                                                leagueId: __activeMatches[matchId].leagueId,
                                                players: __activeMatches[matchId].players,
                                                isMultiPlayer: __activeMatches[matchId].isMultiPlayer,
                                                isReload: __activeMatches[matchId].isReload,
                                                isQuick: __activeMatches[matchId].isQuick,
                                            });
                                            matchObj.match.onStart && matchObj.match.onStart();
                                        } else {
                                            if (!isReconnect && !matchObj.isRun) {
                                                if (typeof matchObj.match.onResume == "function") {
                                                    matchObj.match.onResume();
                                                }
                                            }
                                        }

                                        if (lastReceivedData.length > 0) {
                                            for (var i = 0; i < lastReceivedData.length; i++) {
                                                __activeMatches[matchId].match.onReceiveData(lastReceivedData[i]);
                                            }
                                        }
                                        matchObj.isRun = true;


                                        for (var i = 0; i < matchObj.receiveDataQueue.length; i++) {
                                            var data = matchObj.receiveDataQueue[i];
                                            __onReceiveDataPackAction(data.params, data.res);
                                        }
                                        matchObj.receiveDataQueue = [];
                                    }
                                });
                            }
                        });

                    }
                }
            },

            /**
             * @method __onReceiveLeaveMachAction
             * @private
             *
             * @param {Object} params
             *      @param {Number} params.matchId
             *      @param {String} params.opponentSessionId
             *      @param {String} params.opponentUserId
             * */
            __onReceiveLeaveMachAction = function (params) {
                console.log("match leave", JSON.stringify(params));
                var matchId = params.matchId,
                    opponentSessionId = params.opponentSessionId,
                    matchObj = __activeMatches[matchId];
                __logger.info("__onReceiveLeaveMachAction ", matchId, opponentSessionId)();
                if (matchObj) {
                    matchObj.opponentSessionId = opponentSessionId;
                    if (!matchObj.isFinished) {
                        var onLeave = __activeMatches[matchId].match.onLeave;
                        onLeave && onLeave({
                            opponentPeerId: params.opponentSessionId
                        });
                    }
                }
            },

            /**
             * @method __onReceivePauseMatchAction
             * @private
             *
             * @param {Object} params
             *      @param {Number} params.matchId
             *      @param {String} params.opponentSessionId
             *
             * */
            __onReceivePauseMatchAction = function (params) {
                console.log("match pause", JSON.stringify(params));
                var matchId = params.matchId,
                    opponentSessionId = params.opponentSessionId;

                __logger.info("__onReceivePauseMatchAction ", matchId, opponentSessionId)();
                if (__activeMatches[matchId]) {
                    __updateOpponentSessionId({
                        matchId: matchId,
                        opponentSessionId: opponentSessionId
                    });

                    __activeMatches[matchId].opponentSessionId = opponentSessionId;
                    __activeMatches[matchId].isRun = false;


                    var onPause = __activeMatches[matchId].match.onPause;
                    onPause && onPause();
                }


            },

            /**
             * @method __onReceiveRequestMatchAction
             * @private
             *
             * @param {Object} data
             *      @param {Number} data.gameId
             *      @param {Number} data.id
             *      @param {Number} data.leagueId
             *      @param {Number} data.opponentId
             *      @param {Number} data.requestId
             *      @param {String} data.sessionId
             *      @param {String} data.version
             *      @param {String} data.gameName
             *      @param {String} data.packageName
             *      @param {String} data.leagueName
             *      @param {String} data.name
             *      @param {Object} data.player1Image
             *              @param {Number} data.player1Image.id
             * @param {Boolean} isFromNotification
             *
             * */
            __onReceiveRequestMatchAction = function (data, isFromNotification) {
                if (__currentRequestMatch[data.requestId] || !__userData.loginState) {
                    return;
                }
                __currentRequestMatch[data.requestId] = data;

                if (__games[data.gameId]) {

                    function res(params, callback) {

                        var isGameRun = __isGameRun();

                        function sendRequest() {
                            __isAcceptingMatchRequest = true;

                            var resData = {
                                requestId: data.requestId,
                                sessionId: __userData.peerId,
                                result: params.state,
                            };

                            if(typeof params.rejectReasonType != "undefined") {
                                resData.rejectReasonType = params.rejectReasonType;
                            }
                            if(typeof params.rejectMessage == "string") {
                                resData.rejectMessage = params.rejectMessage;
                            }

                            __request("matchRequestResponse", resData, function (result) {
                                __isAcceptingMatchRequest = false;

                                if (typeof callback == "function") {
                                    callback({
                                        hasError: result.HasError,
                                        errorMessage: result.ErrorMessage
                                    });
                                } else {
                                    params.onResult && params.onResult({
                                        hasError: result.HasError,
                                        errorMessage: result.ErrorMessage
                                    });
                                }

                            });
                        }

                        if (!__isMultiTab &&
                            (__currentMatchRequestCount > 0 || isGameRun || __quickMatchData.requestCount > 0 || __isAcceptingMatchRequest) &&
                            params.state) {

                            if (__currentMatchRequestCount > 0) {

                                if (__lastMatchRequestData && __lastMatchRequestData.requestId) {
                                    __self.cancelMatchRequest({
                                        requestId: __lastMatchRequestData.requestId,
                                        leagueId: data.leagueId
                                    }, function (cancelResult) {
                                        if (!cancelResult.hasError) {
                                            sendRequest();
                                        } else {
                                            params.onResult && params.onResult({
                                                hasError: true,
                                                errorMessage: __dic.WAITFORPREVIOUSREQUEST[__lang]
                                            });
                                        }
                                    });
                                } else {
                                    params.onResult && params.onResult({
                                        hasError: true,
                                        errorMessage: __dic.WAITFORPREVIOUSREQUEST[__lang]
                                    });
                                }

                            } else if (__quickMatchData.requestCount > 0) {
                                if (__quickMatchData.lastLeagueId) {
                                    __self.cancelQuickMatchRequest({
                                        leagueId: __quickMatchData.lastLeagueId
                                    }, function (cancelResult) {
                                        if (!cancelResult.hasError && cancelResult.result) {
                                            if (cancelResult.result) {
                                                sendRequest();
                                            } else {
                                                params.onResult && params.onResult({
                                                    hasError: true,
                                                    errorMessage: __dic.WAITFORPREVIOUSREQUEST[__lang]
                                                });
                                            }

                                        } else {
                                            params.onResult && params.onResult({
                                                hasError: true,
                                                errorMessage: __dic.CANCEL_QUICKMATCH_FIRST[__lang]
                                            });
                                        }
                                    });
                                } else {
                                    params.onResult && params.onResult({
                                        hasError: true,
                                        errorMessage: __dic.CANCEL_QUICKMATCH_FIRST[__lang]
                                    });
                                }


                            } else if (isGameRun) {
                                params.onResult && params.onResult({
                                    hasError: true,
                                    errorMessage: __dic.CAN_ACCEPT_MATCH_REQUEST_AFTER_MATCH[__lang]
                                });

                                __request("matchRequestResponse", {
                                    requestId: data.requestId,
                                    sessionId: __userData.peerId,
                                    result: false,
                                    rejectReasonType: __rejectType.USER_IS_BUSY.value
                                }, function (result) {
                                });
                            } else if (__isAcceptingMatchRequest) {
                                params.onResult && params.onResult({
                                    hasError: true,
                                    errorMessage: __dic.WAITFORPREVIOUSREQUEST[__lang]
                                });
                            } else {
                                params.onResult && params.onResult({
                                    hasError: true,
                                    errorMessage: __dic.WAITFORPREVIOUSREQUEST[__lang]
                                });
                            }

                        } else {
                            sendRequest();
                        }

                    }

                    if (__autoMatchRequestAccept) {
                        __request("matchRequestResponse", {
                            requestId: data.requestId,
                            sessionId: __userData.peerId,
                            result: true
                        }, function (result) {
                        });
                        return;
                    }

                    var hasMajorConflict = __hasMajorConflict({
                        gameId: data.gameId,
                        version: data.version
                    });
                    //var hasMajorConflict = false;

                    if (hasMajorConflict) {
                        //__logger.info("hasMajorConflict hasMajorConflict");
                        res({
                            state: false,
                            rejectReasonType: __rejectType.USER_VERSION_CONFLICT.value
                        });

                        if (__games[data.gameId].info) {
                            __games[data.gameId].info.lastVersion = data.version;
                        }
                        __majorConflictAction();

                    } else {
                        var image,
                            imageUrl,
                            requestTimeout = __configData.mrt - 5000;

                        if (data.player1Image) {
                            image = data.player1Image
                        }

                        if (typeof data.player1ImageUrl === "string") {
                            imageUrl = data.player1ImageUrl;
                        }


                        var content;

                        if (__isMultiTab) {
                            content = {
                                res: function (resData, callback) {
                                    var data = {
                                        state: resData.state,
                                        onResult: resData.onResult
                                    };

                                    if (!data.state) {
                                        data.rejectReasonType = __rejectType.USER_NOT_ACCEPT.value;
                                    }

                                    if (resData.rejectMessage) {
                                        data.rejectMessage = resData.rejectMessage;
                                    }
                                    res(data, callback);
                                },
                                name: data.name,
                                id: data.id + "",
                                leagueId: data.leagueId + "",
                                gameId: data.gameId + "",
                                gameName: data.gameName,
                                leagueName: data.leagueName,
                                requestId: data.requestId,
                                platform: data.platform,
                                image: image,
                                imageUrl: imageUrl
                            };

                            __fireEvent("matchRequest", content);

                            if (__isAppInBackground && !isFromNotification && !__isGameCenterInstall) {
                                __showNotification({
                                    id: TisUtil.generateUUIDFromTime(),
                                    title: data.name + __dic.NOTIFREQUESTMATCH[__lang],
                                    message: __dic.MATCHREQUESTIN[__lang] + data.leagueName,
                                    icon: image,
                                    iconUrl: imageUrl,
                                    type: __notificationTypes.MATCH_REQUEST,
                                    timeout: requestTimeout,
                                    data: data
                                });
                            }

                        } else {
                            if (!__isGameRun()) {
                                content = {
                                    res: function (resData, callback) {
                                        var data = {
                                            state: resData.state,
                                            onResult: resData.onResult
                                        };

                                        if (!data.state) {
                                            data.rejectReasonType = __rejectType.USER_NOT_ACCEPT.value;
                                        }

                                        if (resData.rejectMessage) {
                                            data.rejectMessage = resData.rejectMessage;
                                        }

                                        res(data, callback);
                                    },
                                    name: data.name,
                                    id: data.id+ "",
                                    leagueId: data.leagueId+ "",
                                    gameId: data.gameId+ "",
                                    requestId: data.requestId+ "",
                                    gameName: data.gameName,
                                    platform: data.platform,
                                    leagueName: data.leagueName,
                                    isRegister: __games[data.gameId] ? true : false,
                                    image: image,
                                    imageUrl: imageUrl
                                };

                                __fireEvent("matchRequest", content);

                                if (__isAppInBackground && !isFromNotification && !__isGameCenterInstall) {
                                    __showNotification({
                                        id: TisUtil.generateUUIDFromTime(),
                                        title: data.name + __dic.NOTIFREQUESTMATCH[__lang],
                                        message: __dic.MATCHREQUESTIN[__lang] + data.leagueName,
                                        icon: image,
                                        iconUrl: imageUrl,
                                        type: __notificationTypes.MATCH_REQUEST,
                                        timeout: requestTimeout,
                                        data: data
                                    });
                                }

                            } else {
                                if (!isFromNotification) {
                                    res({
                                        state: false,
                                        rejectReasonType: __rejectType.USER_IS_BUSY.value
                                    });

                                    __showNotification({
                                        id: TisUtil.generateUUIDFromTime(),
                                        title: data.name + __dic.NOTIFREQUESTMATCH[__lang],
                                        message: __dic.MATCHREQUESTIN[__lang] + data.leagueName,
                                        icon: image,
                                        iconUrl: imageUrl,
                                        type: __notificationTypes.MATCH_REQUEST_EXPIRE,
                                        timeout: requestTimeout,
                                        data: data
                                    });
                                }

                            }
                        }
                    }


                } else {
                    content = {
                        name: data.name,
                        id: data.id + "",
                        leagueId: data.leagueId + "",
                        gameId: data.gameId + "",
                        requestId: data.requestId + "",
                        gameName: data.gameName,
                        leagueName: data.leagueName,
                        isRegister: __games[data.gameId] ? true : false,
                        image: data.player1Image,
                        imageUrl: data.player1ImageUrl
                    };

                    __fireEvent("matchRequest", content);
                }
            },

            __onReceiveOfflineRequestMatchAction = function (pushMessageVO) {

                // var data = JSON.parse(pushMessageVO.message.c);
                //
                // var params = {
                //     name : data.name,
                //     leagueName :  data.leagueName,
                //     gameName :  data.gameName
                // };
                //
                //
                // if(typeof data.timestamp == "number") {
                //     params.reqestTime = data.timestamp;
                // }
                //
                // if (data.player1Image) {
                //     params.image = {
                //         url : __generateImageSrc(data.player1Image.id,__configData.defaultImageSize),
                //         id : data.player1Image.id
                //     };
                // }
                //
                // __showMessage({
                //     type : __messageTypes.offlineRequest,
                //     content : params
                // });

                if (__chatService) {
                    if (!pushMessageVO.myDelivered) {
                        __chatService.deliver({
                            messageId: pushMessageVO.id
                        });
                    }
                    __chatService.seen({
                        messageId: pushMessageVO.id
                    });
                }

            },

            /**
             * @method __onReceiveMatchResultAction
             * @private
             *
             * @param {Object} params
             *      @param {Number} params.matchId
             *      @param {Boolean} params.state
             *
             * */
            __onReceiveMatchResultAction = function (params) {
                var matchId = params.matchId;
                if (__activeMatches[matchId]) {
                    if (__activeMatches[matchId].match.onEnd) {
                        __activeMatches[matchId].match.onEnd(params.state);
                    } else {
                        console.warn("onEnd method is not implemented.");
                    }

                    if (__configData.ummll > 0 && !params.state) {
                        var logData = __logger.getLogData({
                            maxLevel: __configData.ummll
                        });

                        var data = {
                            metaType: __metaDataTypes.MATCH_CONFLICT,
                            logData: logData,
                        };

                        __sendMetaData(data, false);

                        __logger.clear();
                    }

                    __activeMatches[matchId].isEnd = true;


                    __database &&__database.removeFromTable({
                        name: __databaseParams.tableName.activeMatch,
                        index: parseInt(matchId),
                        onSuccess: function (result) {
                            //__logger.info("success remove  unselected match", matchId);
                        },
                        onError: function (result) {
                            //__logger.info("error remove  unselected match", matchId)();
                        }
                    });
                }
            },

            /**
             * @method __onReceiveMessageAction
             * @private
             *
             * @param {Object} params
             *      @param {Number} params.type
             *      @param {Object} params.content
             *          @param {String} params.content.imgLink
             *          @param {String} params.content.msg
             *          @param {String} params.content.oContent operation content --> for app
             *          @param {String} params.content.owc  operation web content --> for web
             *          @param {String} params.content.title
             *          @param {Number} params.content.shType
             *          @param {Number} params.content.to
             *          @param {Number} params.content.wtShow
             *          @param {String} params.content.oAction
             *          @param {Boolean} params.content.stdb
             *
             * @param {Object}  chatMessageId
             *
             * */
            __onReceiveMessageAction = function (params, chatMessageId) {
                var data = JSON.parse(params.content);

                switch (params.type) {
                    case 1 :
                        var serviceHandleType = data.shType;
                        var handleMessageState = serviceHandleType == 1 || (serviceHandleType == 2 && !__isGameCenterInstall );
                        if (handleMessageState) {
                            var whereToShow = data.wtShow;
                            var showAsMessage = (whereToShow == 1 || whereToShow == 3);
                            var showAsNotification = (whereToShow == 2 || whereToShow == 3);
                            var saveToDB = data.stdb;
                            var id = TisUtil.generateUUIDFromTime();
                            var content = {
                                id: id,
                                operationAction: data.oAction,
                                operationContent: data.oContent,
                                webOperationContent: data.owc,
                                showAsMessage: showAsMessage,
                                showAsNotification: showAsNotification,
                                chatMessageId: chatMessageId //message that recieve frome chat service
                            };

                            var uiData = {
                                title: data.title,
                                icon: data.imgLink,
                                message: data.msg,
                                timeout: data.to
                            };

                            if (showAsMessage) {
                                __showMessage({
                                    uiData: uiData,
                                    metaData: content
                                }, saveToDB);
                            }

                            if (showAsNotification && __isApp) {
                                __showNotification({
                                    title: data.title,
                                    icon: {
                                        url: data.imgLink
                                    },
                                    message: data.msg,
                                    timeout: data.to,
                                    id: id,
                                    type: __notificationTypes.BAZITECH_MESSAGE,
                                    data: content
                                });
                            }


                        }
                        break;
                }

            },

            __gameDataHandler = function (data, isFromGC) {
                if (data.loginData || data.token) {
                    if (data.matchId) {
                        TIS.showLoading();
                    }

                    var loginData = data.loginData || {
                        id: data.id,
                        name: data.name,
                        token: data.token,
                        tokenIssuer: data.tokenIssuer,
                        image: data.image
                    };

                    loginData.isFromGC = isFromGC;
                    __loginAction(
                        loginData,
                        {
                            storageStore: false,
                            sessionStore: false
                        },
                        function () {
                            if (data.matchId) {
                                __createGameFromUrlData(data, function () {
                                    TIS.hideLoading();
                                });

                            }
                        });


                } else {
                    if (!__userData.loginState) {
                        //__autoLoginCheck();
                    }
                }
            },

            /*
             *  handle message that come from game center mobile
             * */
            __handleGCMMessage = function (data) {
                console.log("__handleGCMMessage", data);
                try {
                    data = JSON.parse(data);
                    if (data) {
                        switch (data.type) {
                            case __gCMMessageTypes.NEW_MATCH :
                                var matchData = data.content;

                                if (__isMultiTab) {
                                    __gameDataHandler(matchData, true);
                                } else {
                                    if (!__isGameRun()) {
                                        __gameDataHandler(matchData, true);
                                    } else {

                                    }
                                }

                                break;

                            case __gCMMessageTypes.CHECK_CAN_ACCEPT :
                                var content = data.content;
                                var gameId = content.gameId;
                                var requestId = content.requestId;
                                var canAcceptRequest = true;

                            function sendRequestAnswer(canAccept) {
                                TIS.Plugin.canAcceptMatchResponse({
                                    requestId: requestId,
                                    state: canAccept
                                }, function () {
                                    //__logger.info("SEND GAME CENTER REQUEST-succes", requestId, canAccept)();
                                }, function () {
                                    //__logger.info("SEND GAME CENTER REQUEST-fail", requestId, canAccept)();
                                });
                            }

                                if (__games[gameId]) {
                                    if (!__isMultiTab && __isGameRun()) {
                                        canAcceptRequest = false
                                    }
                                }
                                sendRequestAnswer(canAcceptRequest);

                                break;

                            case __gCMMessageTypes.LOGOUT :
                                __logoutAction({});
                                break;
                        }
                    }
                }
                catch (e) {
                    //__logger.info("HANDL GCM ---not catch",e)()
                }
            },

            /*
             * when click notification and app is stop
             * service is not load yet
             * */
            __handleLaunchAppNotification = function () {
                for (var i = TIS.__CLICKEDNOTIFICATIONS.length - 1; i >= 0; i--) {
                    var isHandle = __handleNotificationClickAction(TIS.__CLICKEDNOTIFICATIONS[i]);

                    //__logger.info("HANDLE LAUNCH APP NOTIFICATION",isHandle)();
                    if (isHandle) {
                        TIS.__CLICKEDNOTIFICATIONS.splice(i, 1);
                    }
                }
            },

            __updateOpponentSessionId = function (data) {
                var matchId = parseInt(data.matchId),
                    opponentSessionId = data.opponentSessionId;

                if(__database) {
                    __database.updateTable({
                        name: __databaseParams.tableName.activeMatch,
                        index: matchId,
                        value: {
                            opponentSessionId: opponentSessionId
                        },
                        onSuccess: function () {

                            data.onSuccess && data.onSuccess();
                            data.onDone && data.onDone();
                        },
                        onError: function (e) {
                            data.onError && data.onError();
                            data.onDone && data.onDone();
                            //__logger.info("UPDATE OPPONENT SESSION ID--- fail add to db",matchId,e)();
                        }
                    });
                } else {
                    data.onSuccess && data.onSuccess();
                    data.onDone && data.onDone();
                }

            },

            __handleNotificationClickAction = function (notification) {
                var isHandle = false;
                try {
                    var data = JSON.parse(notification.data);

                    isHandle = true;
                    if (data.timeout && data.at) {
                        if (new Date() - new Date(data.at) > data.timeout) {
                            __clearNotification(notification.id);
                            return isHandle;
                        }
                    }

                    if (typeof data.type == "number") {
                        var content = data.content;
                        switch (data.type) {
                            case __notificationTypes.BAZITECH_MESSAGE :

                                content.isFromNotification = true;
                                __handleBGCMClickAction(content);
                                break;

                            case __notificationTypes.MATCH_REQUEST :
                                if (__userData.loginState) {
                                    if (data.userId == __userData.id) {
                                        __onReceiveRequestMatchAction(content, true);
                                    }

                                } else {
                                    isHandle = false;
                                }
                                break;

                            case __notificationTypes.MATCH_REQUEST_EXPIRE :

                                break;
                        }
                    }
                } catch (e) {
                    isHandle = false;
                }
                __clearNotification(notification.id);
                return isHandle;
            },

            /*
             *
             * handle bazitech game center message click action
             * */
            __handleBGCMClickAction = function (params) {
                if (params.chatMessageId && __chatService) {
                    __chatService.seen({
                        messageId: params.chatMessageId
                    })
                }
                if (params.operationContent || params.webOperationContent) {

                    if (params.isFromNotification && params.showAsMessage) {
                        __fireEvent("clearMessage", {
                            id: params.id
                        });
                    }

                    if (!params.isFromNotification && params.showAsNotification) {
                        if (__isApp) {
                            __clearNotification(params.id);
                        }
                    }

                    if (params.isFromNotification || (!params.isFromNotification && params.callAction == "click")) {
                        if (__isApp) {
                            TIS.Plugin.startActivity({
                                    action: params.operationAction || TIS.Plugin.ACTION_VIEW,
                                    url: params.operationContent
                                },
                                function () {
                                    //__logger.info('success to open URL via Android Intent')();
                                },
                                function () {
                                    //__logger.info('Failed to open URL via Android Intent')();
                                }
                            );
                        } else {

                            if (params.webOperationContent != undefined) {
                                window && window.open(params.webOperationContent);
                            } else {
                                window && window.open(params.operationContent);
                            }


                        }
                    }
                }
            },

            __showNotification = function (params) {

                if (window &&
                    window.cordova &&
                    window.cordova &&
                    window.cordova.plugins &&
                    window.cordova.plugins.notification &&
                    window.cordova.plugins.notification.local) {

                    var id = params.id;
                    var dataObj = {
                        id: id,
                        title: params.title,
                        text: params.message,
                        //sound: "file://sounds/reminder.mp3",
                        data: {
                            content: params.data,
                            timeout: params.timeout,
                            at: new Date(),
                            type: params.type,
                            userId: __userData.id
                        },
                        smallIcon: "res://icon"
                    };

                    var imagesExt = ["png", "jpg"];
                    if (params.icon && params.icon.url) {
                        var path = params.icon.url;
                        var fileExt = path.split('.').pop();

                        if (imagesExt.indexOf(fileExt) < 0) {
                            if (path.indexOf("?") >= 0) {
                                dataObj.icon = path + "&ali=.png";
                            } else if (path.indexOf("&") >= 0) {
                                dataObj.icon = path + "?ali=.png";
                            }
                        } else {
                            dataObj.icon = path;
                        }
                    }
                    window.cordova.plugins.notification.local.schedule(dataObj);

                    if (typeof params.timeout == "number" && params.type == __notificationTypes.BAZITECH_MESSAGE) {
                        setTimeout(function () {
                            __clearNotification(id);
                        }, params.timeout);
                    }

                }

            },

            __clearNotification = function (notificationId) {
                try {
                    if (__isApp) {
                        window.cordova.plugins.notification.local.clear(notificationId);
                        window.cordova.plugins.notification.local.cancel(notificationId);
                    }

                } catch (e) {
                }
            },

            __showMessage = function (params, saveToDB) {

                var messageId = params.messageId || TisUtil.generateUUID();
                __messagesData[messageId] = params;
                params.messageId = messageId;

                if (saveToDB) {
                    __self.saveMessage({
                        messageId: messageId
                    });
                    params.isFromDB = true;
                }

                var uiData = params.uiData;

                var metaData = params.metaData;
                uiData.isFromDB = params.isFromDB;
                uiData.messageId = params.messageId;

                if (metaData) {
                    uiData.onClick = function () {
                        metaData.callAction = "click";
                        __handleBGCMClickAction(metaData);
                    };

                    uiData.onRemove = function () {
                        metaData.callAction = "remove";
                        __handleBGCMClickAction(metaData);
                    }
                }

                __fireEvent("message", uiData);
            },

            __hasMajorConflict = function (params) {
                //var gameId = params.gameId,
                //    lastVersion = params.version,
                //    currentVersion = __games[gameId].version;
                //
                //if(lastVersion) {
                //    var lastMajorValue = lastVersion.split(".")[0];
                //    var currentMajorValue = currentVersion.split(".")[0];
                //    return !(lastMajorValue == currentMajorValue);
                //} else {
                //    return false;
                //}

                if (__configData.cmc) {
                    var compare = TisUtil.compareVersion(params.version, __games[params.gameId].version);

                    return compare.isMajorGreater
                    // return TisUtil.hasMajorConflict({
                    //     currentVersion : __games[params.gameId].version,
                    //     lastVersion : params.version
                    // });
                } else {
                    return false;
                }


            },

            __majorConflictAction = function () {

                function action() {
                    __majorConflictState = false;
                    TIS.HAS_MAJOR_CONFLICT = true;
                    if (!__isNodeJS) {
                        TIS.showLoading();
                        var messageElm = document.getElementById("TIS_loading_messageContainer"),
                            updateText = __dic.UPDATE[__lang];
                        //__isApp = true;
                        if (__isApp) {
                            updateText = __dic.NEWVERSION[__lang];
                        }

                        var content = "\
                            <div style='font-size: 1.3em;color: red;' TIS-Data='ALERT'>" + __dic.HASMAJORCONFLICT[__lang] + "</div>\
                            <a style='font-size: 1.3em;cursor: pointer;color: rgb(111, 167, 21)'>" + "(" + updateText + ")" + "</a>\
                        ";
                        messageElm.innerHTML = content;
                        var aElm = messageElm.querySelector("a");

                        aElm.addEventListener("click", function () {

                            var lastVersion;
                            if (__games[__appId].info) {
                                lastVersion = __games[__appId].info.lastVersion
                            }

                            __fireEvent("showUpdateUI", {
                                lastVersion: lastVersion
                            });

                        }, false);
                    }

                    if (__userData.loginState) {
                        __logoutAction({
                            clearSession: false
                        });
                    }
                }

                for (var matchId in __activeMatches) {
                    if (!__activeMatches[matchId].isFinished) {
                        __majorConflictState = true;
                        return;
                    }
                }
                action();

            },

            __checkGameCenterIsInstall = function (callback) {
                try {
                    TIS.Plugin.isAppExist(__configData.gcpn, function () {
                        __isGameCenterInstall = true;
                        callback && callback(__isGameCenterInstall);
                    }, function () {
                        __isGameCenterInstall = false;
                        callback && callback(__isGameCenterInstall);
                    });
                } catch (e) {
                }
            },

            __createMatchDataFromDBData = function (matchDBData) {
                // var lastStateKey = (Object.keys(matchDBData.data).length) - 1;
                var lastStateKey = matchDBData.data.length - 1;

                var retData = {
                    isResume: true,
                    isQuick: matchDBData.isQuick,
                    config: matchDBData.config,
                    isMultiPlayer: matchDBData.isMultiPlayer,
                    gameId: matchDBData.gameId,
                    matchId: matchDBData.matchId,
                    leagueId: matchDBData.leagueId,
                    leagueName: matchDBData.leagueName,
                    gameName: matchDBData.gameName,
                    platform: matchDBData.platform,
                    stateData: matchDBData.data[lastStateKey].stateData,
                    staticData: matchDBData.staticData,
                    webUrl: matchDBData.webUrl,
                    startTime: matchDBData.startTime
                };

                if (Array.isArray(matchDBData.opponentsData) && matchDBData.opponentsData.length > 0) {
                    retData.opponentsData = matchDBData.opponentsData;
                } else {
                    retData.opponentsData = [{
                        id: matchDBData.players.player2.id,
                        name: matchDBData.players.player2.name,
                        applicant: matchDBData.players.player2.applicant,
                        image: matchDBData.players.player2.image,
                        imageUrl: matchDBData.players.player2.imageUrl,
                        rank: matchDBData.players.player2.rank,
                        peerId: matchDBData.opponentSessionId
                    }];
                }

                if (matchDBData.ownData) {
                    retData.ownData = matchDBData.ownData;
                } else {
                    retData.ownData = {
                        id: matchDBData.players.player1.id,
                        name: matchDBData.players.player1.name,
                        applicant: matchDBData.players.player1.applicant,
                        image: matchDBData.players.player1.image,
                        imageUrl: matchDBData.players.player1.imageUrl,
                        rank: matchDBData.players.player1.rank
                    };
                }

                return retData;
            },

            __createGameFromUrlData = function (gameData, callback) {

                if (gameData.isResume) {
                    var matchId = parseInt(gameData.matchId);
                    __database.getFromTableWithIndex({
                        name: __databaseParams.tableName.activeMatch,
                        index: matchId,
                        onSuccess: function (result) {
                            if (result) {
                                __newMatch(__createMatchDataFromDBData(result));
                                callback();
                            }

                        },
                        onError: function (result) {
                        }
                    });
                } else {
                    __newMatch(gameData);
                    callback();
                }

            },

            __applyConfigData = function (callback) {
                function setData(cfg) {
                    if (cfg) {
                        for (var key in cfg) {
                            __configData[key] = cfg[key];
                        }


                        try {
                            if(typeof __configData.gcd === "string") {
                                __configData.gcd = JSON.parse(__configData.gcd);
                            }
                            if(typeof __configData.lcd === "string") {
                                __configData.lcd = JSON.parse(__configData.lcd);
                            }
                        }catch (e) {
                            console.log("config parse exception", e);
                        }



                        for(var name in __requestUrls) {
                            var urlData = __requestUrls[name];
                            if(!urlData.uri) {
                                continue;
                            }
                            var uri = urlData.uri.toLowerCase();
                            if(__configData.eud && typeof __configData.eud[uri] === "boolean") {
                                urlData.encrypt = __configData.eud[uri];
                            }
                        }
                    }

                    __serverData.OBJECT_POOL.address = __configData.opsa;
                    __serverData.NAVIN.address = __configData.ncsa;
                    __serverData.GAME_CENTER.address = __configData.gca;
                    __serverData.ASYNC.address = __configData.aha;
                    __serverData.IMAGE.address = __configData.isa;
                    __serverData.PUSH.address = __configData.psa;
                    __serverData.CHAT.address = __configData.csa;

                    if (__configData.ummll > 0) {
                        __logger.config({
                            enable: true
                        });
                    }

                    // __configData.lotui = false;
                    // __configData.loui = false;

                    callback();
                }

                if (__isLocal && (__serviceMode == TIS.DEVELOPMODE_LOCAL || __serviceMode == TIS.DEVELOPMODE)) {
                    setData({});
                } else {
                    __getConfig(function (cfg) {
                        setData(cfg);
                    });
                }

            },

            __getConfig = function (callback) {
                __request(__configUrl, {}, function (result) {
                    if (!result.HasError) {
                        // var cfg = JSON.parse(result.Result.config);
                        var cfg = result.Result.config;

                        if (typeof cfg !== "object" || cfg === null) {
                            cfg = {};
                        }

                        if (result.Result.ip)
                        {

                        // && result.Result.port
                            if( TisUtil.startWith(result.Result.ip,"http")) {
                                cfg.gca = result.Result.ip;
                            } else {
                                cfg.gca = "http://" + result.Result.ip + ":" + result.Result.port;
                            }

                        }

                        // var imgAddress = result.Result.imageServer;
                        // if (typeof imgAddress === "string") {
                        //
                        //     if(imgAddress.startsWith("http")) {
                        //         cfg.isa = imgAddress;
                        //     } else {
                        //         cfg.isa = "http://" + imgAddress;
                        //     }
                        //
                        // }


                        callback(cfg);
                        __database && __database && __database.getFromTableWithIndex({
                            name: __databaseParams.tableName.setting,
                            index: "config",
                            onSuccess: function (result) {
                                if (!result) {
                                    __database.addToTable({
                                        name: __databaseParams.tableName.setting,
                                        data: [{
                                            index: "config",
                                            value: __configData
                                        }],
                                        onComplete: function (e) {

                                        },
                                        onError: function (e) {

                                        }
                                    });
                                } else {
                                    __database.updateTable({
                                        name: __databaseParams.tableName.setting,
                                        index: "config",
                                        value: __configData
                                    });
                                }

                            }
                        });

                    } else {

                        __fireEvent("report", {
                            message: "Error > get config from server : " + result.ErrorMessage
                        });

                        if(__database) {
                            __database.getFromTableWithIndex({
                                name: __databaseParams.tableName.setting,
                                index: "config",
                                onSuccess: function (data) {
                                    if (data) {
                                        callback(data);
                                    } else {
                                        if (__isLocal) {
                                            callback(__configData);
                                        } else {
                                            setTimeout(function () {
                                                __getConfig(callback);
                                            }, __configData.getConfigTimeout);
                                        }
                                    }
                                },
                                onError: function (data) {
                                    if (__isLocal) {
                                        callback(__configData);
                                    } else {
                                        setTimeout(function () {
                                            __getConfig(callback);
                                        }, __configData.getConfigTimeout);
                                    }
                                }
                            });
                        } else {
                            setTimeout(function () {
                                __getConfig(callback);
                            }, __configData.getConfigTimeout);
                        }

                    }

                });
            },

            __registerGame = function (gameId, params) {

                var gameParams = params.games[gameId];
                if (!gameParams.info) {
                    gameParams.info = {}
                }

                if (!gameParams.setting) {
                    gameParams.setting = {};
                }

                var info = {
                    name: gameParams.name || __dic.GAME[__lang],
                    // isDefaultLeagueMember: false
                };

                var saveStateData = gameParams.setting.saveStateData;
                //var isMultiTab = (typeof gameParams.setting.isMultiTab == "boolean") ? gameParams.setting.isMultiTab : gameParams.setting.isMultiPlay;
                var maxReloadCount = gameParams.setting.maxReloadCount;
                var setting = {
                    maxClone: gameParams.setting.maxClone || 10,
                    saveStateData: (typeof saveStateData == "boolean") ? saveStateData : true,
                    //isMultiTab: (typeof isMultiTab == "boolean") ? isMultiTab : true,
                    maxReloadCount: (typeof maxReloadCount == "number") ? maxReloadCount : 5
                };

                if (typeof gameParams.version != "string" && typeof params.version != "string") {
                    throw new ServiceException("version key is not exist.value should be a string like \"1.2.1\"");
                }


                __games[gameId] = {
                    callback: gameParams.callback,
                    userData: gameParams.userData,
                    info: info,
                    setting: setting,
                    leagues: undefined,
                    isRun: false,
                    version: params.version || gameParams.version
                };


                __fireEvent("gameRegister", {gameId: gameId});
            },

            __pingAction = function (token, callback) {
                var requestData = {
                    _token: token || __userData.token
                };

                if (__userData.peerId) {
                    requestData.peerId = __userData.peerId;
                }


                __request("ping",
                    requestData,
                    function (result) {
                        if (callback)
                            callback(result);
                    });
            },

            __dataPackReceiveAction = function (data, res) {

                // console.log("__dataPackReceiveAction_0",data.dataId,data.data);
                if (__activeMatches[data.matchId].receivedData[data.dataId]) {
                    // console.log("__dataPackReceiveAction_1");
                    __logger.info("__dataPackReceiveAction -- ", data.matchId, data.dataId, __network.getSocketConnectionState())();
                    res(true);
                    return;
                } else {
                    //__logger.info("__dataPackReceiveAction -- dd ",data.matchId,data.dataId)();
                    //__activeMatches[data.matchId].receivedData[data.dataId] = true;
                }

                function sendDataToMatch() {
                    if(__database) {
                        __database.updateTable({
                            name: __databaseParams.tableName.activeMatch,
                            index: parseInt(data.matchId),
                            //value: result,
                            onBeforeUpdate: function (result) {
                                // console.log("__dataPackReceiveAction_2",data.dataId);
                                // console.log("onBeforeUpdate",data.data && data.data.position,data.dataId);
                                __logger.info("__dataPackReceiveAction -- onBeforeUpdate ",
                                    data.matchId, data.dataId,
                                    __activeMatches[data.matchId].receivedData[data.dataId],
                                    typeof  result, result == null)();
                                if (result && !__activeMatches[data.matchId].receivedData[data.dataId]) {
                                    var allData = result.data;
                                    for (var i = 0; i < allData.length; i++) {
                                        if (allData[i].receivedData[data.dataId]) {
                                            res(true);
                                            return false;
                                        }

                                    }
                                    // for (var id in allData) {
                                    //     if (allData[id].receivedData[data.dataId]) {
                                    //         res(true);
                                    //         return false;
                                    //     }
                                    // }
                                    // var lastKey = Object.keys(result.data).length - 1;
                                    var lastKey = result.data.length - 1;
                                    result.data[lastKey].receivedData[data.dataId] = data.data;

                                    return result;
                                } else {
                                    res(true);
                                    return false;
                                }

                            },
                            onSuccess: function (e) {
                                // console.log("__dataPackReceiveAction_3",data.dataId,__activeMatches[data.matchId].receivedData[data.dataId]);
                                res(true);
                                if (!__activeMatches[data.matchId].receivedData[data.dataId]) {
                                    __activeMatches[data.matchId].match.onReceiveData({
                                        data: data.data,
                                        dataId: data.dataId
                                    });
                                    __activeMatches[data.matchId].receivedData[data.dataId] = true;
                                }
                            },
                            onError: function (e) {
                                __logger.info("__dataPackReceiveAction -- error ", data.matchId, data.dataId, e)();
                                console.error("ERROR IN SAVE RECEIVE DATA TO DB.", data.matchId, data.dataId, e);
                                if (!__activeMatches[data.matchId].receivedData[data.dataId]) {
                                    sendDataToMatch();
                                }

                            }
                        }, data.dataId);
                    } else {
                        res(true);
                        if (!__activeMatches[data.matchId].receivedData[data.dataId]) {
                            __activeMatches[data.matchId].match.onReceiveData({
                                data: data.data,
                                dataId: data.dataId
                            });
                            __activeMatches[data.matchId].receivedData[data.dataId] = true;
                        }
                    }


                }

                sendDataToMatch();

            },

            __reconnectAction = function (peerId) {
                console.log("reconnect-- ",__userData.peerId , peerId);

                if (__userData.peerId !== peerId) {

                    __userData.peerId = peerId;

                    var allMatchId = Object.keys(__activeMatches);


                    console.log("reconnect matches ", allMatchId.length);
                    if (allMatchId.length > 0) {

                        __request("reconnect",
                            {
                                reconnect: JSON.stringify({
                                    sessionId: __userData.peerId,
                                    matchId: allMatchId
                                })
                            },
                            function (result) {
                                console.log("reconnect matches res", JSON.stringify(result));
                            },
                            {
                                intervalTime: __configData.smit,
                                maxTry: __configData.dmt
                            });

                        for (var matchId in __activeMatches) {
                            if (__activeMatches[matchId].isFinished) {
                                continue;
                            }
                            //__activeMatches[matchId].isRun = false;
                            if (typeof __activeMatches[matchId].match.onConnect == "function") {
                                __activeMatches[matchId].match.onConnect();
                            }
                            //__activeMatches[matchId].match.onPause();
                        }
                    }

                } else {
                    for (var matchId in __activeMatches) {
                        if (__activeMatches[matchId].isFinished) {
                            continue;
                        }
                        if (typeof __activeMatches[matchId].match.onConnect == "function") {
                            __activeMatches[matchId].match.onConnect();
                        }
                    }
                }
            },

            __trySendResultToGC = function (params, callback) {
                if (params.sendTryCount < __configData.srtc) {
                    setTimeout(function () {
                        params.forceAddToTable = false;
                        if (params.matchData.matchId) {
                            params.resultDBId = params.matchData.matchId;
                        }
                        __sendResult(params, callback);
                    }, __configData.srt);
                } else {
                    callback && callback();
                }
            },

            __sendResult = function (params, callback) {
                // return;
                var matchData = params.matchData,
                    result = params.result,
                    forceAddToTable = params.forceAddToTable,
                    resultDBId = params.resultDBId;

                var sendData = {
                    matchResult: result
                }, databaseData = {};


                if (matchData.matchId) {
                    sendData["matchId"] = matchData.matchId;
                    if (forceAddToTable)
                        databaseData.index = matchData.matchId;
                }

                if (matchData.gameId) {
                    sendData["gameId"] = matchData.gameId;
                }

                if (forceAddToTable)
                    databaseData.value = sendData;

                //console.trace("SEND RESULT",result);
                __logger.info("SEND RESULT", matchData.matchId, forceAddToTable, __userData.loginState)();
                if (__userData.loginState) {

                    if (matchData.userId) {
                        sendData["userId"] = matchData.userId;
                        databaseData["userId"] = matchData.userId;
                    } else {
                        sendData["userId"] = __userData.id;
                        databaseData["userId"] = __userData.id;
                    }

                    if (typeof params.sendTryCount == "number") {
                        params.sendTryCount += 1;
                    } else {
                        params.sendTryCount = 1;
                    }

                    __request("matchResult", sendData, function (result) {
                        __logger.info("SEND RESULT -- request response", matchData.matchId, result.HasError, result.ErrorMessage, result.ErrorCode)();
                        if (result.HasError) {
                            if (result.ErrorCode == TisNetworkClass.ErroCodes.RUNTIME ||
                                result.ErrorCode == TisNetworkClass.ErroCodes.REQUESTFAILED ||
                                result.ErrorCode == TisNetworkClass.ErroCodes.NOT_ACCESS
                            ) {
                                if (forceAddToTable && __database) {
                                    __database.addToTable({
                                        name: __databaseParams.tableName.matchResult,
                                        sync: true,
                                        data: [databaseData],
                                        onComplete: function (e) {
                                            //__logger.info("SEND RESULT --- succes add to db",matchData.matchId,databaseData);
                                            __trySendResultToGC(params, function () {
                                                callback && callback({
                                                    hasError: true,
                                                    errorMessage: result.ErrorMessage
                                                });
                                            });

                                        },
                                        onError: function (e) {
                                            __logger.info("SEND RESULT -- ADD TO TABLE ERROR", matchData.matchId, e)();
                                        }
                                    });
                                } else {
                                    __trySendResultToGC(params, function () {
                                        callback && callback({
                                            hasError: true,
                                            errorMessage: result.ErrorMessage
                                        });
                                    });
                                }
                            } else {
                                if (!forceAddToTable && __database) {
                                    __database.removeFromTable({
                                        name: __databaseParams.tableName.matchResult,
                                        index: parseInt(resultDBId),
                                        onSuccess: function (e) {
                                        },
                                        onError: function (e) {
                                            __logger.info("SEND RESULT -- REMOVE FROM TABLE ERROR", matchData.matchId)();
                                        }
                                    });
                                }

                                callback && callback({
                                    hasError: false,
                                    errorMessage: result.ErrorMessage
                                });
                            }

                            __fireEvent("report", {
                                message: "Error > send result failed : " + result.ErrorMessage
                            });

                        } else {
                            __fireEvent("matchResult", matchData);

                            if (!forceAddToTable && __database) { // result is store in database and should be delete

                                __database.removeFromTable({
                                    name: __databaseParams.tableName.matchResult,
                                    index: parseInt(resultDBId),
                                    onSuccess: function (e) {
                                        //__logger.info("onSuccess",e)();
                                    },
                                    onError: function (e) {
                                        //__logger.info("SEND RESULT --- fail remove from  db-1",matchData.matchId,e)();
                                    }
                                });
                            }

                            callback && callback({
                                hasError: false
                            });

                        }

                    });
                }
                else {
                    if (forceAddToTable && __database) {
                        __database.addToTable({
                            name: __databaseParams.tableName.matchResult,
                            sync: true,
                            data: [databaseData],
                            onComplete: function () {
                                callback && callback({
                                    hasError: true,
                                    errorMessage: "user is not login"
                                });
                            },
                            onError: function (e) {
                                __logger.info("SEND RESULT -- 12", matchData.matchId, e)();

                                callback && callback({
                                    hasError: true,
                                    errorMessage: "failed add data to db"
                                });
                            }
                        });
                    }
                    else {
                        callback && callback({
                            hasError: true,
                            errorMessage: "user is not login"
                        });
                    }

                }

                if (matchData.isMultiPlayer && __database) {
                    __database.updateTable({
                        name: __databaseParams.tableName.activeMatch,
                        index: parseInt(matchData.matchId),
                        //value: {
                        //    isFinished: true
                        //},
                        onBeforeUpdate: function (result) {
                            if (typeof result == "object" && result != null) {

                                result.isFinished = true;
                                return result
                            } else {
                                return false;
                            }
                        },
                        onSuccess: function (e) {
                            __logCounter = __logFraction - 1;
                            if (__activeMatches[matchData.matchId]) {
                                __activeMatches[matchData.matchId].isFinished = true;
                            }
                            if (__majorConflictState) {
                                __majorConflictAction();
                            }
                        },
                        onError: function (e) {
                            __logger.info("SEND RESULT -- error", matchData.matchId)();
                            if (__activeMatches[matchData.matchId]) {
                                __activeMatches[matchData.matchId].isFinished = true;
                            }
                        }
                    });
                } else {
                    __logCounter = __logFraction - 1;
                    if (__activeMatches[matchData.matchId]) {
                        __activeMatches[matchData.matchId].isFinished = true;
                    }
                    if (__majorConflictState) {
                        __majorConflictAction();
                    }
                }
            },

            __sendScore = function (matchData, result, forceAddToTable, resultDBId) {

                var sendData = {
                    matchResult: result
                }, databaseData = {};


                if (matchData.matchId) {
                    sendData["matchId"] = matchData.matchId;
                    if (forceAddToTable)
                        databaseData.index = matchData.matchId;
                }

                if (matchData.gameId) {
                    sendData["gameId"] = matchData.gameId;
                }

                if (matchData.leagueId) {
                    sendData["leagueId"] = matchData.leagueId;
                }

                if (forceAddToTable)
                    databaseData.value = sendData;


                if (__userData.loginState) {

                    if (matchData.userId) {
                        sendData["userId"] = matchData.userId;
                        databaseData["userId"] = matchData.userId;
                    } else {
                        sendData["userId"] = databaseData["userId"] = __userData.id;
                    }


                    __request("editScore", sendData, function (result) {

                        if (result.HasError) {
                            /*
                             * data is not store in data base
                             * */
                            if (forceAddToTable && __database) {
                                __database.addToTable({
                                    name: __databaseParams.tableName.score,
                                    sync: true,
                                    data: [databaseData],
                                    onComplete: function (e) {
                                        //__logger.info("onComplete", e)();
                                    },
                                    onError: function (e) {
                                        //__logger.info("onError", e)();
                                    }
                                });
                            }

                        } else {
                            if (!forceAddToTable && __database) { // result is store in database and should be delete
                                __database.removeFromTable({
                                    name: __databaseParams.tableName.score,
                                    index: parseInt(resultDBId),
                                    onSuccess: function (e) {
                                        //__logger.info("onSuccess remove score",e)();
                                    },
                                    onError: function (e) {
                                        //__logger.info("onError remove score", e)();
                                    }
                                });
                            }
                        }
                    });
                } else {

                    if (forceAddToTable && __database) {
                        __database.addToTable({
                            name: __databaseParams.tableName.score,
                            sync: true,
                            data: [databaseData],
                            onComplete: function (e) {
                                //__logger.info("onComplete", e)();
                            },
                            onError: function (e) {
                                //__logger.info("onError", e)();
                            }
                        });
                    }

                }

            },

            __cancelMatch = function (data) {
                __request(
                    "matchCancel",
                    data,
                    function (result) {
                        if (result.HasError) {
                            if (result.ErrorCode == TisNetworkClass.ErroCodes.RUNTIME || result.ErrorCode == TisNetworkClass.ErroCodes.REQUESTFAILED) {
                                setTimeout(function () {
                                    __cancelMatch(data);
                                }, __configData.smit);
                            }
                        }
                    });
            },

            __sendData = function (params) {
                var ackObj = __sendDataAckState[params.dataId],
                    isFromGame = params.isFromGame,
                    callback = params.callback,
                    dataId = params.dataId;

                if (ackObj) {
                    if (ackObj.state) {
                        return;
                    }
                } else {
                    __sendDataAckState[dataId] = {
                        state: false,
                        sendTryCount: 0
                    };
                    if (isFromGame) {
                        __sendDataAckState[dataId].callback = callback;
                    }

                }


                var timeoutId,
                    matchId = params.matchId,
                    matchObj = __activeMatches[matchId],
                    maxSendTryCount = params.maxSendTryCount;

                // console.log("send", matchId, dataId, matchObj.opponentSessionId, params.resend,params.data);
                __logger.info("SEND DATA----SEND", matchId, dataId, matchObj.opponentSessionId, params.resend)();
                __sendDataAckState[dataId].sendTryCount += 1;

                var t1 = new Date();
                __network.emit({
                    content: {
                        //receivers: [params.opponentSessionId],
                        receivers: [matchObj.opponentSessionId],
                        content: JSON.stringify({
                            type: __contentMessageMap.dataPack,
                            content: JSON.stringify({
                                dataId: dataId,
                                matchId: matchId,
                                data: params.data
                            })
                        })
                    }
                }, function () {
                    // console.log("send_ack", matchId, dataId, matchObj.opponentSessionId);
                    var currentTime = new Date();
                    if (currentTime - __asyncInfo.lastNMinTime > 15 * 60 * 1000) {
                        __asyncInfo.nMinResTime = [];
                        __asyncInfo.lastNMinTime = new Date();
                    }
                    var dif = currentTime - t1;
                    __asyncInfo.nMinResTime.push(dif);
                    __asyncInfo.globalResAvgCount += 1;
                    __asyncInfo.lastResTime = dif;

                    __asyncInfo.globalResAvg = __asyncInfo.globalResAvg + ((dif - __asyncInfo.globalResAvg ) / __asyncInfo.globalResAvgCount);
                    __logger.info("SEND DATA----ACK RECEIVE -- 00 ", matchId, dataId, dif, matchObj.isFinished, __sendDataAckState[dataId].state)();
                    //if (!__sendDataAckState[dataId].state &&  matchObj && !matchObj.isFinished) {
                    if (!__sendDataAckState[dataId].state) {
                        //console.log("DATA SEND -- 1 ",dataId,params.sequentialDataQueueLength);
                        __sendDataAckState[dataId].state = true;
                        timeoutId && clearTimeout(timeoutId);

                        __saveSendDataAckToDB({
                            matchId: matchId,
                            sequential: params.sequential,
                            //lastKey: res.lastKey,
                            dataId: dataId,
                            callback: function () {
                                if (!matchObj.isFinished) {
                                    if (matchObj.match.onReceiveDataAck) {
                                        matchObj.match.onReceiveDataAck({
                                            dataId: dataId,
                                            sequential: params.sequential
                                        });
                                    }
                                }


                                callback && callback();

                                if (!isFromGame && __sendDataAckState[dataId] && __sendDataAckState[dataId].callback) {
                                    __sendDataAckState[dataId].callback({state: true});
                                }
                                if (params.sequential) {
                                    __handleSequentialSendData({
                                        matchId: matchId,
                                        callback: function (data) {

                                        }
                                    });
                                }
                            }
                        });
                    }

                });

                if (matchObj.match.onSentData && !params.resend) {
                    var sequentialDataQueueLength = (typeof params.sequentialDataQueueLength == "number") ?
                        params.sequentialDataQueueLength : 0;
                    matchObj.match.onSentData({
                        dataId: dataId,
                        sequential: params.sequential,
                        sequentialDataQueueLength: (sequentialDataQueueLength == 0) ? sequentialDataQueueLength : sequentialDataQueueLength - 1
                    });
                }


                if (maxSendTryCount && __sendDataAckState[dataId].sendTryCount >= maxSendTryCount) {
                    return;
                }

                timeoutId = setTimeout(function () {
                    __logger.info("SEND DATA----REPEAT SEND ",
                        matchId, dataId,
                        __activeMatches[matchId].opponentSessionId,
                        __sendDataAckState[params.dataId].state,
                        __sendDataAckState[dataId].sendTryCount,
                        __activeMatches[matchId].isFinished)();

                    //if (!__sendDataAckState[params.dataId].state && __activeMatches[matchId] && !__activeMatches[matchId].isFinished) {
                    if (!__sendDataAckState[params.dataId].state) {

                        var sendCount = __sendDataAckState[dataId].sendTryCount;

                        if (matchObj.isFinished && sendCount > __configData.msdtc) {
                            return;
                        }

                        params.resend = true;
                        __sendData(params);


                        if (sendCount % 3 == 0 && sendCount != 0) {
                            __fireEvent("report", {
                                message: "Error > not receive ack from opponent"
                            });
                        }
                    }

                }, __configData.pmto);
            },

            __getNotApprovedData = function (params) {

                __logger.info("__getNotApprovedData -- 00")();
                var matchId = parseInt(params.matchId);
                if(__database) {
                    __database.getFromTableWithIndex({
                        name: __databaseParams.tableName.activeMatch,
                        index: matchId,
                        onSuccess: function (result) {

                            if (result) {
                                var lastKey = result.data.length - 1,
                                    sendSequential = false,
                                    sequentialDataDataIds = [],
                                    allSendData = [];
                                __logger.info("__getNotApprovedData -- 11", lastKey)();

                                for (var i = 0; i < result.data.length; i++) {
                                    var data = result.data[i];
                                    if (!data.approveState && data.sendData) {
                                        if (data.sequential) {
                                            sequentialDataDataIds.push(data.dataId);
                                            if (sendSequential) {
                                                return;
                                            }
                                            sendSequential = true;
                                        }
                                        allSendData.push({
                                            matchId: matchId,
                                            dataId: data.dataId,
                                            data: data.sendData,
                                            sequential: data.sequential,
                                            isFromGame: false,
                                            maxSendTryCount: data.maxSendTryCount
                                            //callback: function () {
                                            //
                                            //}
                                        });
                                    }

                                }

                                params.callback({
                                    lastData: result.data[lastKey],
                                    allSendData: allSendData,
                                    //sequentialDataQueueLength: sequentialDataDataIds.length,
                                    sequentialDataIds: sequentialDataDataIds
                                });
                            } else {
                                params.callback({
                                    allSendData: [],
                                    sequentialDataIds: []
                                });
                            }

                        },
                        onError: function (e) {
                            __logger.info("__getNotApprovedData -- 22")();
                            console.error("__handleSequentialSendData", e);
                        }
                    });
                } else {
                    params.callback({
                        allSendData: [],
                        sequentialDataIds: []
                    });
                }

            },

            __handleSequentialSendData = function (params) {
                var matchId = parseInt(params.matchId);

                __logger.info("__handleSequentialSendData -- 00")();
                __getNotApprovedData({
                    matchId: matchId,
                    callback: function (result) {
                        var allSendData = result.allSendData,
                            sequentialDataIds = result.sequentialDataIds;
                        __logger.info("__handleSequentialSendData -- 11", matchId, allSendData.length)();
                        for (var i = 0; i < allSendData.length; i++) {
                            allSendData[i].sequentialDataQueueLength = sequentialDataIds.length;
                            __sendData(allSendData[i]);
                        }

                        params.callback && params.callback({
                            lastData: result.lastData
                            //sequentialDataQueueLength: sequentialDataIds.length
                        });
                    }
                });

            },

            __saveSendDataToDB = function (params) {

                var matchId = params.matchId,
                    sendData = params.sendData,
                    stateData = params.stateData,
                    isUpgradeLevel = (typeof params.upgradeLevel == "boolean") ? params.upgradeLevel : (sendData != undefined);

                var dataId = params.dataId,
                    lastSequentialDataAck,
                    isDataInQueue = false;

                if(__database) {
                    __database.updateTable({
                        name: __databaseParams.tableName.activeMatch,
                        index: matchId,
                        onBeforeUpdate: function (result) {
                            if (!result) {
                                __logger.info("SAVE SEND DATA TO DB - 2", matchId, dataId, typeof  result, result == null)();
                            }

                            var lastKey;
                            if (result) {
                                if (isUpgradeLevel) {
                                    var tmpData;

                                    for (var i = 0; i < result.data.length; i++) {
                                        tmpData = result.data[i];
                                        if (!tmpData.approveState && tmpData.sendData && tmpData.sequential) {
                                            isDataInQueue = true;
                                            break;
                                        }
                                    }

                                    lastSequentialDataAck = result.lastSequentialDataAck;

                                    var data = {
                                        sendData: sendData,
                                        stateData: stateData,
                                        dataId: dataId,
                                        sequential: params.sequential,
                                        approveState: false,
                                        receivedData: {}
                                    };

                                    if (params.maxSendTryCount) {
                                        data.maxSendTryCount = params.maxSendTryCount;
                                    }
                                    // lastKey = Object.keys(result.data).length;
                                    // result.data[lastKey] = data;
                                    result.data.push(data);
                                    if (params.sequential && sendData != undefined) {
                                        result.lastSequentialDataAck = false;
                                    }

                                } else {
                                    // lastKey = Object.keys(result.data).length - 1;
                                    lastKey = result.data.length - 1;

                                    if (typeof result.data[lastKey].stateData == "object" &&
                                        typeof stateData == "object") {
                                        for (var key in stateData) {
                                            result.data[lastKey].stateData[key] = stateData[key];
                                        }

                                    } else {
                                        result.data[lastKey].stateData = stateData;
                                    }

                                }
                                return result;
                            } else {
                                return false
                            }

                        },
                        onSuccess: function (e) {
                            params.callback({
                                hasError: false,
                                dataId: dataId,
                                lastSequentialDataAck: lastSequentialDataAck,
                                isDataInQueue: isDataInQueue
                                //lastKey: lastKey
                            });
                        },
                        onError: function (e) {
                            console.error("SAVE SEND DATA TO DB ERROR ", dataId, e);
                            __logger.info("SAVE SEND DATA TO DB - ERROR", matchId, dataId)();
                            params.callback({
                                hasError: true,
                                errorMessage: "could not update Table"
                                //dataId: dataId,
                                //lastKey: lastKey
                            });
                        }
                    }, dataId);
                } else {
                    params.callback({
                        hasError: false,
                        dataId: dataId,
                        lastSequentialDataAck: lastSequentialDataAck,
                        isDataInQueue: isDataInQueue
                        //lastKey: lastKey
                    });
                }

            },

            __saveStaticDataToDB = function (params) {

                if(__database) {
                    __database.updateTable({
                        name: __databaseParams.tableName.activeMatch,
                        index: params.matchId,
                        onBeforeUpdate: function (result) {
                            if (typeof  result == "object") {
                                result.staticData = params.staticData;
                                return result;
                            } else {
                                return false;
                            }
                        },
                        onSuccess: function (e) {
                            params.callback({
                                hasError: false
                            });
                        },
                        onError: function (e) {
                            params.callback({
                                hasError: true,
                                errorMessage: "could not update Table"
                            });
                        }
                    });
                } else {
                    params.callback({
                        hasError: false
                    });
                }

            },

            __saveSendDataAckToDB = function (params) {
                var matchId = params.matchId,
                    dataId = params.dataId;

                if(__database) {
                    __database.updateTable({
                        name: __databaseParams.tableName.activeMatch,
                        index: matchId,
                        //value: result,
                        onBeforeUpdate: function (result) {
                            if (!result) {
                                __logger.info("SAVE SEND DATA ACK -- onBeforeUpdate ", matchId, dataId)();
                            }

                            if (result) {
                                // for (var id in result.data) {
                                //     if (result.data[id].dataId == dataId) {
                                //         result.data[id].approveState = true;
                                //     }
                                // }
                                for (var i = 0; i < result.data.length; i++) {
                                    if (result.data[i].dataId == dataId) {
                                        result.data[i].approveState = true;
                                    }
                                }

                                if (params.sequential) {
                                    result.lastSequentialDataAck = true;
                                }

                                return result;
                            } else {
                                return false;
                            }

                        },
                        onSuccess: function (e) {
                            params.callback({
                                hasError: false
                            });
                        },
                        onError: function (e) {
                            console.error("SAVE SEND DATA ACK ERRROR", dataId);
                            __logger.info("SAVE SEND DATA ACK -- error ", matchId, e)();
                            params.callback({
                                hasError: true,
                                errorMessage: "could not update Table"
                            });
                        }
                    }, dataId);
                } else {
                    params.callback({
                        hasError: false
                    });
                }

            },
            /*
             * matchData : {
             *   isMultiPlayer : ** fill local
             *   startTime : ** fill local (for reload)
             *   isResume :
             *   id :
             *   name :
             *   applicant :
             *   sessionId :
             *   gameId :
             *   matchId :
             *   leagueId :
             *   leagueName :
             *   requestId :
             *   opponentData : {
             *           id :
             *           name :
             *           sessionId :
             *       }
             *
             * }
             * */
            __newMatch = function (matchData) {
                function handleMultiplayerRequests() {
                    var requestId = matchData.requestId;
                    var requestData = __activeMatchRequest[matchData.leagueId] && __activeMatchRequest[matchData.leagueId][requestId];
                    if (requestData) {
                        requestData.onAccept && requestData.onAccept({
                            requestId: requestId
                        });
                        __currentMatchRequestCount -= 1;
                        clearTimeout(requestData.timeoutId);

                        delete __activeMatchRequest[matchData.leagueId][requestId];
                    }

                    var quickData = __quickMatchData.leagues[matchData.leagueId];

                    if (matchData.isQuick && quickData && quickData.state) {
                        quickData.state = false;
                        __quickMatchData.requestCount -= 1;
                        __quickMatchData.lastLeagueId = undefined;
                        if (typeof quickData.onAccept == "function") {
                            quickData.onAccept({
                                leagueId: matchData.leagueId
                            });
                            quickData.onAccept = undefined;
                        }

                        if (quickData.timeout) {
                            clearTimeout(quickData.timeout);
                            quickData.timeout = undefined;
                        }
                    }
                }

                if( __games[matchData.gameId]) {
                    var isMultiPlayer = matchData.isMultiPlayer,
                        matchId = parseInt(matchData.matchId),
                        players;
                    var player1Data = matchData.ownData || matchData.loginData;

                    // if (player1Data.image && player1Data.image.id) {
                    //     player1Data.image.url = __generateImageSrc(player1Data.image.id, __configData.defaultImageSize);
                    //     player1Data.image.generateImageSrc = function (width, height) {
                    //         return __generateImageSrc(player1Data.image.id, {
                    //             width: width || __configData.disw,
                    //             height: height || __configData.dish
                    //         });
                    //     }
                    // }

                    if (isMultiPlayer) {
                        var player2Data = matchData.opponentsData[0];

                        players = {
                            player1: player1Data,
                            player2: player2Data
                        };

                        var dbMatchData = {
                            gameId: matchData.gameId,
                            config: matchData.config,
                            leagueId: matchData.leagueId,
                            leagueName: matchData.leagueName,
                            gameName: matchData.gameName,
                            platform: matchData.platform,
                            matchId: matchData.matchId,
                            isMultiPlayer: isMultiPlayer,
                            opponentSessionId: player2Data.sessionId,
                            ownData: JSON.parse(JSON.stringify(player1Data)),
                            opponentsData: JSON.parse(JSON.stringify(matchData.opponentsData)),
                            isFinished: false,
                            reloadCount: 0,
                            isQuick: matchData.isQuick,
                            lastSequentialDataAck: true,
                            maxReloadCount: __games[matchData.gameId].setting.maxReloadCount,
                            data: [{
                                sendData: undefined,
                                approveState: false,
                                dataId: undefined,
                                stateData: undefined,
                                receivedData: {
                                    /*
                                     * dataId : data
                                     * */
                                }
                            }],
                            startTime: new Date()
                        };
                    } else {
                        players = {
                            player1: player1Data
                        }
                    }

                    /*
                     *   create match data on client database
                     *
                     * */
                    function createMatch() {

                        var config;

                        if (typeof matchData.config == "string") {
                            try {
                                config = JSON.parse(matchData.config);
                            } catch (e) {
                                config = matchData.config;
                            }

                        } else {
                            config = matchData.config;
                        }
                        var data = {
                            gameId: matchData.gameId,
                            config: config,
                            players: players,
                            isMultiPlayer: isMultiPlayer,
                            matchId: matchId,
                            leagueId: matchData.leagueId,
                            leagueName: matchData.leagueName,
                            gameName: matchData.gameName,
                            platform: matchData.platform,
                            stateData: matchData.stateData,
                            staticData: matchData.staticData,
                            userData: __games[matchData.gameId].userData,
                            isReload: (typeof matchData.isResume == "boolean") ? matchData.isResume : false,
                            isQuick: matchData.isQuick
                        };

                        var match = new __games[matchData.gameId].callback(data);

                        match.getQuiz = __self.getQuiz;

                        function getTopScore(params, callback) {
                            if (typeof callback != "function") {
                                throw new ServiceException("onResult should be a function");
                            }
                            var reqData = {
                                gameId: matchData.gameId
                            };

                            if (typeof params.currentLeague == "boolean") {
                                reqData.leagueId = matchData.leagueId;
                            }

                            if (typeof params.isGlobal == "boolean") {
                                reqData.isGlobal = params.isGlobal;
                            }

                            __getTopScore(reqData, callback);
                        }

                        var isReload = (typeof matchData.isResume == "boolean") ? matchData.isResume : false;
                        __fireEvent("newMatch", {
                            matchId: matchData.matchId,
                            leagueId: matchData.leagueId,
                            leagueName: matchData.leagueName,
                            gameName: matchData.gameName,
                            platform: matchData.platform,
                            gameId: matchData.gameId,
                            players: players,
                            isMultiPlayer: isMultiPlayer,
                            webUrl : matchData.webUrl,
                            isReload: isReload,
                            isQuick: matchData.isQuick
                        });

                        if (isMultiPlayer) {

                            __games[matchData.gameId].isRun = true;

                            __activeMatches[matchId] = {
                                gameId: matchData.gameId,
                                match: match,
                                ownData: matchData.ownData,
                                opponentsData: matchData.opponentsData,
                                players: players,
                                opponentSessionId: matchData.opponentsData[0].peerId,
                                isInReloadState: matchData.isResume,
                                isFinished: false,
                                isStart: false,
                                isRun: false,
                                DBLock: false,
                                log: "",
                                receiveDataQueue: [],
                                receivedData: {},
                                resultReason: undefined,
                                startTime: matchData.startTime || undefined,
                                endTime: undefined,
                                isMultiPlayer: isMultiPlayer,
                                leagueId: matchData.leagueId,
                                isQuick: matchData.isQuick,
                                isReload: isReload,
                            };


                            function cancelMatch(sendCancelState) {

                                if (__activeMatches[matchId].isFinished) {
                                    return;
                                }
                                __games[matchData.gameId].isRun = false;
                                __activeMatches[matchId].isFinished = true;

                                if (sendCancelState) {
                                    __cancelMatch({matchId: matchId, type: 2});
                                }

                                __database && __database.updateTable({
                                    name: __databaseParams.tableName.activeMatch,
                                    index: parseInt(matchData.matchId),
                                    onBeforeUpdate: function (result) {
                                        if (result) {
                                            result.isFinished = true;
                                            return result;
                                        } else {
                                            return false;
                                        }

                                    },
                                    onSuccess: function (e) {
                                        //__logger.info("cancel match --- succes add to db",matchId)();
                                    },
                                    onError: function (e) {
                                        __logger.info("cancel match --- fail add to db", matchId, e)();
                                    }
                                });

                                if (__majorConflictState) {
                                    __majorConflictAction();
                                }
                            }

                            match.sendData = function (params, callback) {
                                /*
                                 *           get  match data
                                 *
                                 */

                                var sendData = params.sendData;
                                var stateData = params.stateData;
                                if (!callback) {
                                    callback = params.onResult;
                                }
                                var sequential = (typeof params.sequential == "boolean") ? params.sequential : false,
                                    maxSendTryCount = (typeof params.maxSendTryCount === "number" && params.maxSendTryCount > 0) ? params.maxSendTryCount : undefined,
                                    dataId = (params.dataId != undefined) ? params.dataId : TisUtil.generateUUID();

                                __logger.info("match sendData -- 0 ", matchId, dataId, sequential)();
                                __saveSendDataToDB({
                                    matchId: matchId,
                                    sendData: sendData,
                                    stateData: stateData,
                                    sequential: sequential,
                                    maxSendTryCount: maxSendTryCount,
                                    dataId: dataId,
                                    callback: function (res) {
                                        if (sequential && (!res.lastSequentialDataAck || res.isDataInQueue)) {
                                            __logger.info("match sendData -- 1 ", matchId, dataId, sequential, sendData, res.lastSequentialDataAck, res.isDataInQueue)();
                                            return;
                                        }
                                        __sendData({
                                            matchId: matchId,
                                            dataId: res.dataId,
                                            data: sendData,
                                            isFromGame: true,
                                            sequential: sequential,
                                            maxSendTryCount: maxSendTryCount,
                                            callback: function () {
                                                callback && callback({
                                                    hasError: false,
                                                    errorMessage: false,
                                                    result: {
                                                        state: true,
                                                        dataId: dataId
                                                    }
                                                });
                                            }
                                            //opponentSessionId: __activeMatches[matchId].opponentSessionId
                                        });
                                    }
                                });

                                return {
                                    dataId: dataId
                                }
                            };

                            match.saveStateData = function (params, callback) {

                                var stateData = params.stateData,
                                    dataId = (params.dataId != undefined) ? params.dataId : TisUtil.generateUUID(3),
                                    upgradeLevel = (typeof params.upgradeLevel == "boolean") ? params.upgradeLevel : false;

                                if (!callback) {
                                    callback = params.onResult;
                                }
                                //if(arguments.length == 1 && typeof stateData == "object") {
                                //    upgradeLevel = (typeof stateData.upgradeLevel == "boolean") ? stateData.upgradeLevel : false;
                                //    callback   = stateData.onResult;
                                //    stateData  = stateData.stateData;
                                //}

                                __saveSendDataToDB({
                                    matchId: matchId,
                                    stateData: stateData,
                                    upgradeLevel: upgradeLevel,
                                    dataId: dataId,
                                    callback: function (res) {
                                        callback && callback({
                                            hasError: res.hasError
                                        });
                                    }
                                });
                            };

                            match.saveStaticData = function (params) {
                                __saveStaticDataToDB({
                                    matchId: matchId,
                                    staticData: params.staticData,
                                    callback: params.onResult
                                });
                            };

                            match.sendResult = function (params, callback) {
                                //var finalResult = [];
                                //
                                //for(var id in result) {
                                //    finalResult.push({
                                //        id : result[id]
                                //    })
                                //}
                                __games[matchData.gameId].isRun = false;

                                var result;
                                if (params.result) {
                                    var ownerId = player1Data.id,
                                        opponentId = player2Data.id;
                                    result = JSON.stringify([
                                        {
                                            playerId: ownerId,
                                            scores: params.result[ownerId]
                                        },
                                        {
                                            playerId: opponentId,
                                            scores: params.result[opponentId]
                                        }
                                    ]);
                                } else {
                                    result = params;
                                }

                                __activeMatches[matchId].resultReason = params.reasonCode;

                                __sendResult({
                                    matchData: matchData,
                                    result: result,
                                    forceAddToTable: true
                                }, callback || params.onResult);

                                if (__configData.smrtop && (typeof params.sendMetadata !== "boolean" || params.sendMetadata)) {
                                    __sendMatchMetaData(matchData.matchId, matchData.gameId);
                                }
                            };

                            match.sendScore = function (score) {
                                //var finalResult = [];
                                //
                                //for(var id in result) {
                                //    finalResult.push({
                                //        id : result[id]
                                //    })
                                //}

                                __sendScore(matchData, score, true);

                            };

                            match.ready = function (params, callback) {
                                var clb = callback || params.onResult;
                                // if (matchData.isResume) {
                                //
                                //     __activeMatches[matchId].isStart = true;
                                //     //__activeMatches[matchId].isRun = true;
                                //     __fireEvent("matchStart", {
                                //         matchId: matchId,
                                //         leagueId: __activeMatches[matchId].leagueId,
                                //         players: __activeMatches[matchId].players,
                                //         isMultiPlayer: __activeMatches[matchId].isMultiPlayer,
                                //         isReload: __activeMatches[matchId].isReload,
                                //         isQuick: __activeMatches[matchId].isQuick
                                //     });
                                //     match.onStart && match.onStart();
                                //
                                //     match.onPause();
                                // }

                                var returnData = {
                                    hasError: false,
                                    errorMessage: ""
                                };

                                function sendReady() {
                                    __logger.info("SEND READY---0", matchId)();

                                    if (!__userData.loginState) {
                                        return;
                                    }

                                    if (!__userData.peerId) {
                                        setTimeout(sendReady, 1000);
                                        return;
                                    }
                                    __request("matchReady",
                                        {
                                            userId: player1Data.id,
                                            sessionId: __userData.peerId,
                                            matchId: matchId
                                        }, function (result) {
                                            __logger.info("SEND READY---1", matchId, result)();
                                            if (result.HasError) {
                                                returnData.hasError = true;
                                                returnData.errorMessage = result.ErrorMessage;
                                                if (result.ErrorCode == TisNetworkClass.ErroCodes.RUNTIME ||
                                                    result.ErrorCode == TisNetworkClass.ErroCodes.REQUESTFAILED ||
                                                    result.ErrorCode == TisNetworkClass.ErroCodes.NOT_ACCESS
                                                ) {
                                                    setTimeout(sendReady, __configData.smit);
                                                } else {
                                                    cancelMatch(false);
                                                    clb && clb(returnData);
                                                }

                                                __fireEvent("report", {
                                                    message: "Error > send match ready : " + result.ErrorMessage
                                                });

                                            } else {
                                                returnData.hasError = false;
                                                returnData.errorMessage = "";
                                                clb && clb(returnData);
                                            }
                                        });
                                }

                                sendReady();
                            };

                            match.getSequentialDataQueue = function (params) {
                                __getNotApprovedData({
                                    matchId: matchId,
                                    callback: function (result) {
                                        var returnData = {
                                            hasError: false,
                                            errorMessage: "",
                                            result: {
                                                ids: result.sequentialDataIds
                                            }
                                        };

                                        params.onResult && params.onResult(returnData);
                                    }
                                });
                            };

                            match.cancel = function () {
                                cancelMatch(true);
                            };

                            match.reMatch = function (params) {
                                var requestId;


                                function cancel(params) {
                                    if (requestId) {
                                        __self.cancelMatchRequest({
                                            requestId: requestId,
                                            leagueId: matchData.leagueId
                                        }, params && params.onResult);
                                    } else {
                                        params && params.onResult && params.onResult({
                                            hasError: true,
                                            errorMessage: "request id not exist"
                                        });
                                    }
                                }

                                __self.matchRequest({
                                    opponentId: player2Data.id,
                                    gameId: matchData.gameId,
                                    leagueId: matchData.leagueId
                                }, {
                                    onCancel: params && params.onCancel,
                                    onAccept: params && params.onAccept,
                                    onReject: params && params.onReject,
                                    onResult: function (res) {
                                        if (!res.hasError && res.result && res.result.requestId) {
                                            requestId = res.result.requestId;
                                        }
                                        res.cancel = cancel;
                                        params && params.onResult && params.onResult(res);
                                    }
                                });

                                return {
                                    cancel: cancel
                                };
                            };

                            match.getTopScore = getTopScore;

                            match.onInit && match.onInit();

                            handleMultiplayerRequests();


                        } else {

                            match.sendResult = function (params, callback) {
                                var result;
                                if (params.result) {
                                    var ownerId = player1Data.id;
                                    var scores;
                                    if (typeof params.result == "object" && params.result[ownerId]) {
                                        scores = params.result[ownerId];
                                    } else {
                                        scores = params.result;
                                    }
                                    result = JSON.stringify([
                                        {
                                            playerId: ownerId,
                                            scores: scores
                                        }
                                    ]);
                                } else {
                                    result = params;
                                }
                                __sendResult({
                                    matchData: matchData,
                                    result: result,
                                    forceAddToTable: true
                                }, callback || params.onResult);
                            };

                            match.sendScore = function (score) {
                                __sendScore(matchData, score, true);
                            };

                            match.ready = function () {
                                match.onStart && match.onStart();
                            };

                            match.getTopScore = getTopScore;

                            match.onInit();

                        }

                    }

                    if (!matchData.isResume && isMultiPlayer && __database) {

                        //__logger.info("BEFOR ADD NEW MATCH TO DB", matchId, dbMatchData)();
                        __database.addToTable({
                            name: __databaseParams.tableName.activeMatch,
                            sync: true,
                            data: [{
                                index: matchId,
                                value: dbMatchData
                            }],
                            onComplete: function (e) {
                                //__logger.info("After ADD NEW MATCH TO DB", matchId, e)();
                                createMatch();
                            },
                            onError: function (e) {
                                if (__isRunFromGC) {
                                    /*
                                     *  if reload page in game center
                                     * */
                                    if (e && e.target && e.target.error) {
                                        var err = e.target.error;
                                        if ((err.message == "Key already exists in the object store.") && (err.name = "ConstraintError")) {
                                            __database.getFromTableWithIndex({
                                                name: __databaseParams.tableName.activeMatch,
                                                index: parseInt(matchId),
                                                onSuccess: function (result) {
                                                    if (result) {
                                                        __request(
                                                            "matchValidate",
                                                            {
                                                                matchId: matchId,
                                                                sessionId: __userData.peerId,
                                                                playerId: __userData.id
                                                            },
                                                            function (srvResult) {
                                                                var state = srvResult.Result;
                                                                if (state) {
                                                                    __newMatch(__createMatchDataFromDBData(result));
                                                                } else {
                                                                    __database.removeFromTable({
                                                                        name: __databaseParams.tableName.activeMatch,
                                                                        index: parseInt(matchId),
                                                                        onSuccess: function (result) {
                                                                            //__logger.info("success remove  unselected match", matchId)();
                                                                        },
                                                                        onError: function (result) {
                                                                            //__logger.info("error remove  unselected match", matchId)();
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                    }
                                                }
                                            });
                                        }
                                    }
                                }
                                __logger.info("FAIL ADD MATCH TO DB", matchId, e)();
                                //__logger.info("errrrr", e);
                            },
                            onAbort: function (e) {
                                console.log("CREATE MATCH ABORT", e);
                            }
                        });
                    } else {
                        createMatch();
                    }
                } else {


                    if(matchData.isMultiPlayer) {
                        handleMultiplayerRequests();
                    }

                    matchData.matchId += "";
                    matchData.leagueId += "";
                    matchData.gameId += "";
                    matchData.requestId += "";

                    __fireEvent("newMatch", matchData);
                }

            },

            __initDatabase = function (callback) {
                function createTable() {
                    var tables = [
                        {
                            name: __databaseParams.tableName.activeMatch,
                            parameters: {autoIncrement: false},
                            indexes: [
                                {
                                    name: "matchId",
                                    parameters: {unique: true}
                                }
                            ]
                        },
                        {
                            name: __databaseParams.tableName.score,
                            parameters: {autoIncrement: true}
                        },
                        {
                            name: __databaseParams.tableName.matchResult,
                            parameters: {autoIncrement: true}
                        },
                        {
                            name: __databaseParams.tableName.gameInfo,
                            parameters: {autoIncrement: false},
                            indexes: [
                                {
                                    name: "id",
                                    parameters: {unique: true}
                                }
                            ]
                        },
                        {
                            name: __databaseParams.tableName.setting,
                            parameters: {autoIncrement: false},
                            indexes: [
                                {
                                    name: "config",
                                    parameters: {unique: true}
                                }
                            ]
                        },
                        {
                            name: __databaseParams.tableName.chatService,
                            parameters: {autoIncrement: false},
                            indexes: [
                                {
                                    name: "categoryId",
                                    parameters: {unique: true}
                                }
                            ]
                        },
                        {
                            name: __databaseParams.tableName.uiMessage,
                            parameters: {autoIncrement: false},
                            indexes: [
                                {
                                    name: "messageId",
                                    parameters: {unique: true}
                                }
                            ]
                        }
                    ];
                    var tableCount = tables.length;

                    for (var i = 0; i < tableCount; i++) {
                        var tableName = tables[i].name;
                        __database.createTable({
                            name: tableName,
                            parameters: tables[i].parameters || {},
                            indexes: tables[i].indexes || [],
                            onComplete: function () {

                            }
                        });
                    }
                }

                __database = new TisDatabase({
                    logger: __logger,
                    name: __databaseParams.name,
                    version: __databaseParams.version,
                    debugMode: __databaseParams.debugMode || false,
                    onSuccess: function (e) {
                        if (callback) {
                            callback();
                        }
                    },
                    onUpgradeNeeded: function (e) {
                        createTable();
                    }
                });
            },

            __checkMatchResultInDatabase = function () {
                __database && __database.getAllItemFromTable({
                    name: __databaseParams.tableName.matchResult,
                    onSuccess: function (result) {
                        for (var id in result) {
                            var matchResultData = result[id];
                            var matchData = {
                                gameId: matchResultData.gameId
                            };

                            if (matchResultData.userId) {
                                if (matchResultData.userId == __userData.id) {

                                    if (matchResultData.matchId) {
                                        matchData.matchId = matchResultData.matchId;
                                    }
                                    __sendResult({
                                        matchData: matchData,
                                        result: matchResultData.matchResult,
                                        forceAddToTable: false,
                                        resultDBId: id
                                    });

                                }
                            } else {
                                matchResultData.userId = __userData.id;
                                __sendResult({
                                    matchData: matchData,
                                    result: matchResultData.matchResult,
                                    forceAddToTable: false,
                                    resultDBId: id
                                });
                            }

                        }
                    }
                });
            },

            __checkMatchScoreInDatabase = function () {
                __database && __database.getAllItemFromTable({
                    name: __databaseParams.tableName.score,
                    onSuccess: function (result) {

                        for (var id in result) {
                            var matchResultData = result[id];

                            if (matchResultData.userId == __userData.id) {

                                var matchData = {};

                                if (matchResultData.matchId) {
                                    matchData.matchId = matchResultData.matchId;
                                }

                                if (matchResultData.gameId) {
                                    matchData.gameId = matchResultData.gameId;
                                }

                                __sendScore(matchData, matchResultData.matchResult, false, id);

                            }
                        }

                    }
                });
            },

            __checkToken = function () {
                if (__storageData && __storageData.token) {
                    __pingAction(__storageData.token, function (result) {
                        if (
                            (result.HasError &&
                                result.ErrorCode != TisNetworkClass.ErroCodes.RUNTIME &&
                                result.ErrorCode != TisNetworkClass.ErroCodes.REQUESTFAILED )
                            || (!result.HasError && !result.Result)
                        ) {
                            __logoutAction();
                        }
                    });
                }
            },

            __autoLoginCheck = function (callback) {

                if (__isApp) {
                    TIS.Plugin.getAppInfo(
                        __configData.gcpn,
                        function (appinfo) {
                            TIS.Plugin.getUserData(
                                {},
                                function (res) {
                                    console.log("TIS.Plugin.getUserData", res);
                                    if (res && !res.HasError && typeof res.Result === "object" && res.Result !== null) {
                                        res.Result.isFromGC = false;
                                        res.Result.ssoLogin = true;
                                        __loginAction(
                                            res.Result,
                                            {
                                                storageStore: true,
                                                sessionStore: true
                                            }, callback);
                                    }
                                }, function () {
                                    callback && callback();
                                });
                        },
                        function () {
                            callback && callback();
                        });
                } else {
                    if (__storageData) {
                        if (__storageData.token && __storageData.id && __storageData.name) {
                            __loginAction(__storageData, {
                                storageStore: true,
                                sessionStore: true
                            }, callback);
                            // __fireEvent("autoLoginEnd");
                        }
                        __fireEvent("autoLoginEnd");
                    }
                }
            },

            __encryptRequest = function (url, data, callback, setting) {

                __encryptData(data, function (res) {
                    if (res.hasError) {
                        callback({HasError : true,ErrorMessage:res.errorMessage,ErrorCode : res.errorCode});
                    } else {
                        __requestHandler(url, res.result, function (response) {
                            // console.log("000000000000", url,__userData.id,__userData.token);
                            // console.log("11111111111111", res.result);
                            // console.log("22222222222222", response);
                            callback(response);
                        }, setting);
                    }
                });
            },
            __request = function (reqUrlName, data, callback, setting) {

                var reqUrlData = __requestUrls[reqUrlName];

                if(reqUrlData) {
                    if(reqUrlData.encrypt && __configData.ure) {
                        __encryptRequest(reqUrlName, data, callback, setting);
                    } else {
                        __requestHandler(reqUrlName, data, callback, setting);

                    }
                } else {
                    __requestHandler(reqUrlName, data, callback, setting);
                }

            },

            __requestHandler = function(reqUrlName, data, callback, setting){
                var url,
                    token,
                    tokenIssuer,
                    reqUrlData = __requestUrls[reqUrlName];


                if (data.token && typeof data.tokenIssuer === "number") {
                    token = data.token;
                    tokenIssuer = data.tokenIssuer;

                } else if (__userData && __userData.token && typeof __userData.tokenIssuer === "number") {
                    token = __userData.token;
                    tokenIssuer = __userData.tokenIssuer;
                }


                if (reqUrlData) {
                    var uri = (setting && (setting.url || setting.uri )) || reqUrlData.uri;

                    if(reqUrlData.encrypt && __configData.ure) {
                        var srvIndex = uri.indexOf("/srv");
                        uri = uri.replace("/srv", "/srv/enc");
                    }
                    var hostName = reqUrlData.hostName;
                    if (hostName === "GAME_CENTER" || hostName === "OBJECT_POOL") {
                        if (__configData.har) {
                            if (!setting) {
                                setting = {};
                            }

                            var content;
                            if (hostName === "OBJECT_POOL") {
                                if (!setting) {
                                    setting = {};
                                }

                                setting.peerName = __configData.oprrn;
                                content = {
                                    "content": data,
                                    "uri": reqUrlData.uri,
                                    "tokenIssuer": __userData && __userData.tokenIssuer,
                                    "token": __userData && __userData.token
                                }
                            } else {
                                var parameters = [];

                                for (var key in data) {

                                    if(Array.isArray(data[key])) {

                                        for (var i = 0; i < data[key].length; i++) {
                                            parameters.push({
                                                name: key,
                                                value: data[key][i]
                                            });

                                        }
                                    } else {
                                        parameters.push({
                                            name: key,
                                            value: data[key]
                                        });
                                    }

                                }

                                if (setting && Array.isArray(setting.parameters)) {
                                    for (var i = 0; i < setting.parameters.length; i++) {
                                        parameters.push(setting.parameters[i]);
                                    }
                                }

                                content = {
                                    "remoteAddr": null,
                                    "serverKey": 0,
                                    "oneTimeToken": null,
                                    "parameters": parameters,
                                    "msgType": 3,
                                    "uri": uri,
                                    "tokenIssuer": tokenIssuer,
                                    "token": token,
                                    "clientMessageId": TisUtil.generateUUID() + "_" + __appId,
                                    // "messageId": 1001,
                                    "expireTime": 0
                                };


                            }
                            __asyncRequest(reqUrlName, content, callback, setting);
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


                if (token && typeof tokenIssuer === "number") {
                    if (setting && typeof setting.addToken == "boolean") {
                        if (setting.addToken) {
                            data._token = token;
                            data._token_issuer = tokenIssuer;
                        }
                    } else {
                        data._token = token;
                        data._token_issuer = tokenIssuer;
                    }
                }

                __httpRequest(url, data, function (res) {
                    __setEncryptHandshakeData(res.Headers)
                    callback && callback(res);
                }, setting);
            },

            __setEncryptHandshakeData = function (data) {

                if (data && data["X-iaut"] && data["X-algaut"] && data["X-kaut"]) {

                    __encryptHandshakeData.data = {
                        IV : data["X-iaut"],
                        Alg : data["X-algaut"],
                        SecretKey : data["X-kaut"],
                    };
                    __encryptHandshakeData.updateTime = new Date();
                }

            },

            __getPeerIdFromHttpRequest = function (callback) {

                var currentTime = new Date();

                if ((__userData && __userData.peerId) || (__temporaryPeerData.peerId && (currentTime - __temporaryPeerData.lastTime < __configData.pt))) {
                    callback((__userData && __userData.peerId) || __temporaryPeerData.peerId);
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

                    // peerId = 3678135;
                    var uri = (__requestUrls[reqUrlName] && __requestUrls[reqUrlName].uri) || setting.uri;

                    var asyncData = {
                        // trackerId: new Date().getTime(),
                        content: JSON.stringify({
                            content: JSON.stringify(data),
                            // messageId: 1001,
                            priority: 1,
                            peerName: (setting && setting.peerName) ? setting.peerName : __configData.ahrrn,
                            // receivers: (setting && setting.receivers)? setting.receivers :__configData.ahrr,
                            ttl: __configData.hrt,
                            // ttl:0,
                        }),
                        "type": 3
                    };

                    // var canFromSocket = true;// some request same as device register and server register can not
                    //
                    // if(setting) {
                    //     if(typeof setting.fromSocket === "boolean") {
                    //         canFromSocket = setting.fromSocket;
                    //     }
                    // }
                    //
                    // console.log("11111111111111", __configData.harfs, __network.isSocketOpen() && canFromSocket);
                    //
                    // if(__configData.harfs && __network.isSocketOpen() && canFromSocket) {
                    //     asyncData.type = 5;
                    //     asyncData.timeout = __configData.hrt;
                    //     asyncData.cotent = JSON.parse(asyncData.content);
                    //     __network.emit(asyncData, function (res) {
                    //
                    //         console.log("22222222222222", res);
                    //     });
                    //
                    //     return;
                    // }

                    var paramData = "data=" + encodeURIComponent(JSON.stringify(asyncData)) + "&peerId=" + peerId;

                    var url = __serverData.ASYNC.address + "/srv";

                    if (!setting) {
                        setting = {};
                    }

                    if (!setting.headers) {
                        setting.headers = {};
                    }

                    setting.method = "POST";
                    setting.headers = {
                        "content-type": "application/x-www-form-urlencoded"
                    };
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


                        var metaData = result.Metadata;
                        if(Array.isArray(metaData)) {
                            var headerData = {};
                            for (var i = 0; i < metaData.length; i++) {
                                headerData[ metaData[i].name] =  metaData[i].value
                            }
                            __setEncryptHandshakeData(headerData);
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
                        if (!hasError) {
                            try {
                                response = JSON.parse(result.result.responseText);
                                response.Headers = result.result.responseHeaders;
                            } catch (e){
                                console.log(url,result.result.responseText);
                                console.error(e);
                                response.HasError = true;
                            }


                            hasError = response.HasError === true;
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
                            var responseHeaders = result.result.responseHeaders;
                            if (responseHeaders && (responseHeaders.Timestamp || responseHeaders.timestamp) && !__serverTime) {
                                __serverTime = new Date(parseInt(responseHeaders.Timestamp || responseHeaders.timestamp));
                            }

                            callback(response);
                        }

                        currentTryCount += 1;
                    });
                }

                req(params);

            },

            __validateMatch = function (data, callback) {

                __request(
                    "matchValidate", data, function (result) {

                        if (result.HasError) {
                            if (result.ErrorCode == TisNetworkClass.ErroCodes.RUNTIME || result.ErrorCode == TisNetworkClass.ErroCodes.REQUESTFAILED) {
                                setTimeout(function () {
                                    __validateMatch(data, callback);
                                }, __configData.smit);
                            } else {
                                var res = (typeof result.Result == "boolean") ? result.Result : false;
                                callback(res);
                            }
                        } else {
                            callback(result.Result);
                        }
                    });
            },

            __initActiveMatch = function () {
                if(!__database) return;
                __database.getAllItemFromTable({
                    name: __databaseParams.tableName.activeMatch,
                    onSuccess: function (result) {
                        // console.log("__initActiveMatch_1",result);
                        var selectedMatches = {};
                        //__logger.info("INIT ACTIVE MATCH")();

                        for (var matchId in result) {

                            if (result[matchId].isFinished) {
                                selectedMatches[matchId] = result[matchId];
                                selectedMatches[matchId].isValidate = false;
                                matchValidateChecked();
                            } else {
                                if (result[matchId].ownData && result[matchId].ownData.id == __userData.id
                                    && __games[result[matchId].gameId]) {

                                    if (result[matchId].reloadCount <= __games[result[matchId].gameId].setting.maxReloadCount) {
                                        (function (matchId) {
                                            selectedMatches[matchId] = result[matchId];

                                            __validateMatch({
                                                matchId: selectedMatches[matchId].matchId,
                                                sessionId: __userData.peerId,
                                                playerId: selectedMatches[matchId].ownData.id
                                            }, function (result) {
                                                //__logger.info("MATCH VALIDATE ", "MATCH ID ‌: " + matchId ,"VALIDATE RESULT : " + result)();
                                                selectedMatches[matchId].isValidate = result;
                                                matchValidateChecked();
                                            });
                                            __database.updateTable({
                                                name: __databaseParams.tableName.activeMatch,
                                                index: parseInt(matchId),
                                                value: {
                                                    reloadCount: result[matchId].reloadCount + 1
                                                },
                                                onSuccess: function (e) {
                                                },
                                                onError: function (e) {
                                                }
                                            });
                                        })(matchId);
                                    } else {
                                        selectedMatches[matchId] = result[matchId];
                                        selectedMatches[matchId].isValidate = false;
                                        matchValidateChecked();

                                        __cancelMatch({matchId: matchId, type: 1});
                                    }

                                }
                            }
                        }

                        function matchValidateChecked() {

                            var matchId;
                            var allIsChecked = true;
                            for (matchId in selectedMatches) {
                                if (selectedMatches[matchId].isValidate == undefined || selectedMatches[matchId].isValidate == null) {
                                    allIsChecked = false;
                                    break;
                                }

                            }
                            // console.log("__initActiveMatch_2",allIsChecked,selectedMatches);

                            if (allIsChecked) {

                                __lastValidMatch = {};
                                var matches = {};
                                for (matchId in selectedMatches) {

                                    (function (matchId) {
                                        if (selectedMatches[matchId].isValidate != undefined) {
                                            if (selectedMatches[matchId].isValidate) {
                                                __lastValidMatch[matchId] = selectedMatches[matchId];
                                                matches[matchId] = {
                                                    ownData: __lastValidMatch[matchId].ownData,
                                                    opponentsData: __lastValidMatch[matchId].opponentsData,
                                                    matchId: __lastValidMatch[matchId].matchId,
                                                    leagueId: __lastValidMatch[matchId].leagueId,
                                                    gameId: __lastValidMatch[matchId].gameId,
                                                    maxReloadCount: __lastValidMatch[matchId].maxReloadCount,
                                                    currentReloadCount: __lastValidMatch[matchId].reloadCount
                                                };
                                            } else {
                                                __database.removeFromTable({

                                                    name: __databaseParams.tableName.activeMatch,
                                                    index: parseInt(matchId),
                                                    onSuccess: function (result) {
                                                        //__logger.info("success remove  unselected match", matchId)();
                                                    },
                                                    onError: function (result) {
                                                        __logger.info("error remove  unselected match", matchId)();
                                                    }
                                                });
                                            }
                                        }

                                    })(matchId);

                                }
                                if (Object.keys(__lastValidMatch).length > 0) {
                                    __fireEvent("activeMatchData", matches);
                                }
                            }
                        }
                    }
                });
            },

            __subscribeDefaultLeague = function (gameId) {
                if (!__userData.loginState) {
                    return;
                }

                __request("defaultLeagueSubscribe", {
                    gameId: gameId
                }, function (result) {

                    if (result.HasError) {
                        setTimeout(function () {
                            __subscribeDefaultLeague(gameId);
                        }, __configData.smit);
                    } else {
                        __fireEvent("defaultLeagueSubscribe", {gameId: gameId});
                    }

                });
            },

            __initUIMessageInDB = function () {
                if(!__database) return;
                __database.getAllItemFromTable({
                    name: __databaseParams.tableName.uiMessage,
                    onSuccess: function (result) {
                        for (var messageId in result) {

                            if (result[messageId].userId && result[messageId].userId != __userData.id) {
                                continue;
                            }

                            var content;
                            try {
                                content = JSON.parse(result[messageId].content);
                            } catch (e) {
                                content = result[messageId].content;
                            }

                            if (!result[messageId].type || result[messageId].type == 3) {
                                content.isFromDB = true;
                                content.messageId = messageId;
                                __showMessage(content);
                            }


                        }
                    },
                    onError: function (e) {
                    }
                });
            },

            __setDataToStorage = function (setting) {
                if (__isNodeJS) {
                    return;
                }
                var storageData = {
                    id: __userData.id,
                    name: __userData.name,
                    token: __userData.token,
                    tokenIssuer: __userData.tokenIssuer,
                    guest: __userData.guest,
                    ssoLogin: __userData.ssoLogin
                };

                if (__userData.image) {
                    storageData.image = __userData.image;
                }
                if (__userData.imageUrl) {
                    storageData.imageUrl = __userData.imageUrl;
                }
                var storageUserData = JSON.stringify(storageData);

                if (setting.storageStore) {
                    localStorage.setItem("userData", storageUserData);
                    __storageData = storageData;
                }

                if (setting.sessionStore) {
                    sessionStorage.setItem("userData", storageUserData);
                    __storageData = storageData;
                }

                // if (__isApp && __accountManager) {
                //     // if(true) {
                //     __accountManager.setUserData(
                //         {
                //             type: __accountType,
                //             id: __userData.id,
                //             data: {userData: storageUserData}
                //         },
                //         function (data) {
                //             console.log("ADD USER DATA---SUCCESS", data);
                //             if (data && data.name != __userData.name) {
                //                 __accountManager.removeAccount({id: __userData.id, type: __accountType}, function () {
                //                     console.log("REMOVE USER--SUCCESS");
                //                     __accountManager.addAccountExplicitly(
                //                         {
                //                             type: __accountType,
                //                             id: __userData.id,
                //                             name: __userData.name,
                //                             password: "pass",
                //                             userData: {
                //                                 userData: storageUserData
                //                             }
                //                         },
                //                         function (data) {
                //                             console.log("NEW USER ADD---SUCCESS", data);
                //                         },
                //                         function (err) {
                //
                //                             console.log("NEW USER ADD---FAIL", err);
                //                         });
                //                 }, function () {
                //                     console.log("REMOVE USER--FAIL");
                //                 });
                //             }
                //         },
                //         function (err) {
                //             console.log("ADD USER DATA---FAIL", err);
                //             __accountManager.addAccountExplicitly(
                //                 {
                //                     type: __accountType,
                //                     id: __userData.id,
                //                     name: __userData.name,
                //                     password: "pass",
                //                     userData: {
                //                         userData: storageUserData
                //                     }
                //                 },
                //                 function (data) {
                //                     console.log("NEW USER ADD---SUCCESS", data);
                //                 },
                //                 function (err) {
                //
                //                     console.log("NEW USER ADD---FAIL", err);
                //                 });
                //         });
                // }
            },

            __checkPeerAndSocketSync = function () {
                if (!__peerAndTokenSync && !__syncTokenWithPeer && !__syncPeerWithToken) {

                    // console.log("checkPeerAndSocketSync_1 ", __userData.token,__userData.peerId);
                    if (__userData.token && __userData.peerId) {
                        // console.log("checkPeerAndSocketSync_2 ");
                        __peerAndTokenSync = true;
                        __pingAction();
                    }
                }
            },

            __loginActionWithPeer = function () {
                if (!__isCheckLoginActionWithPeer && __userData.peerId && __userData.loginState) {
                    if (!__isRunFromGC) {
                        __initActiveMatch();
                    }

                    if (__isApp) {
                        __handleLaunchAppNotification();
                    }
                    __isCheckLoginActionWithPeer = true;
                }
            },

            __setUserData = function (userData, setting) {
                var image = userData.image;

                if (image && typeof image == "object") {
                    __userData["image"] = image;
                }

                if (typeof userData.imageUrl == "string") {
                    __userData.imageUrl = userData.imageUrl;
                }
                __userData.name = userData.name;
                __userData.id = userData.id;
                __userData.token = userData.token;
                __userData.loginState = true;
                __userData.tokenIssuer = typeof userData.tokenIssuer === "number" ? userData.tokenIssuer : 0;
                __userData.ssoLogin = userData.ssoLogin === true;
                __userData.guest = typeof userData.guest == "boolean" ? userData.guest : (userData.guest == "true");

                __setDataToStorage(setting);
            },

            __loginAction = function (userData, setting, callback) {

                if (userData === null ||
                    typeof userData !== "object" ||
                    typeof userData.token !== "string") {

                    console.error("Login action error,userData is not valid", userData);
                    return;
                }

                function action() {

                    if (__configData.adurl && !__isRunFromGC) {
                        var addUserData = {
                            id: userData.id,
                            name: userData.name
                        };
                        if (__userData.coordsData) {
                            addUserData.coordsData = __userData.coordsData;
                        }
                        __fireEvent("showAd", {
                            src: __configData.adurl,
                            userData: addUserData
                        });
                    }

                    __setUserData(userData, setting);

                    if (userData.isFromGC) {
                        __isRunFromGC = true;
                    }

                    __loginActionWithPeer();

                    __initUIMessageInDB();


                    if (__configData.smdtop && !TisUtil.isNodeJS()) {

                        if (__configData.sgltop) {
                            __initGeoLocationRequest();
                        }

                        if (__configData.sditop) {
                            __sendDeviceInfoToObjectPool();
                        }


                        if (__configData.siatop) {
                            __sendInstalledAppsToObjectPool();
                        }

                    }

                    if (__defaultLeagueSubscribe) {
                        for (var gameId in __games) {
                            __subscribeDefaultLeague(gameId);
                        }
                    }

                    __checkMatchResultInDatabase();

                    __checkMatchScoreInDatabase();

                    callback && callback();

                    __fireEvent("login", __self.getUserData());

                    __checkPeerAndSocketSync();

                    if (userData.tokenExpireTime) {
                        manageTokenExpireTime(userData.tokenExpireTime);
                    }
                }

                if (__userData.loginState) {
                    if (__userData.id != userData.id) {
                        __logoutAction({
                            callback: function () {
                                action();
                            }
                        });
                    } else {
                        callback && callback();
                        if (userData.isFromGC) {
                            __isRunFromGC = true;
                        }
                        if (__userData.guest) {
                            __setUserData(userData, setting);
                            __fireEvent("guestLogin", __userData);
                            __fireEvent("profileChange", __userData);
                        }
                    }
                }
                else {
                    action();
                }

            },

            __logoutAction = function (params) {

                var callback,
                    clearSession = true;

                if (params) {
                    callback = params.callback;

                    if (typeof params.clearSession == "boolean") {
                        clearSession = params.clearSession;
                    }
                }


                function action(result) {
                    var returnData = {
                        hasError: result.HasError,
                        errorMessage: result.ErrorMessage,
                        result: result.Result
                    };

                    __userData.loginState = false;

                    if (clearSession) {
                        // __userData = {
                        //     sessionId : __userData.peerId
                        // };
                        __userData.token = undefined;
                        __userData.tokenIssuer = undefined;
                        __userData.name = undefined;
                        __userData.id = undefined;
                        __userData.image = undefined;
                        __userData.peerId = undefined;
                        __storageData = undefined;
                        localStorage.removeItem('userData');
                        sessionStorage.removeItem('userData');
                    }

                    //__isSocketInit = false;
                    __lastValidMatch = {};
                    __lastSearchTimeoutId = undefined;
                    __lastPollingTimeoutId = undefined;
                    __isChatRegister = false;
                    __isSupporterInit = false;
                    __isCheckLoginActionWithPeer = false;
                    __activeMatches = {};
                    __leagues = {};

                    for (var leagueId in __activeMatchRequest) {
                        for (var requestId in __activeMatchRequest[leagueId]) {
                            clearTimeout(__activeMatchRequest[leagueId][requestId].timeoutId);
                        }
                    }
                    __activeMatchRequest = {};
                    __currentMatchRequestCount = 0;

                    __quickMatchData.leagues = {};
                    __quickMatchData.requestCount = 0;
                    __quickMatchData.lastLeagueId = undefined;

                    for (var id in __games) __games[id].leagues = undefined;

                    __fireEvent("logout");
                    __network.onLogout();

                    if (__lastGeoLocationRequestTimeoutId) {
                        clearTimeout(__lastGeoLocationRequestTimeoutId);
                        __lastGeoLocationRequestTimeoutId = undefined;
                    }

                    if (typeof callback == "function") {
                        callback(returnData);
                    }
                }

                action({ErrorCode: 0, HasError: false, ErrorMessage: "", Result: true});
                __isRunFromGC = false;

                // if (__isRunFromGC || !clearSession) {
                //     action({ErrorCode: 0, HasError: false, ErrorMessage: "", Result: true});
                //     __isRunFromGC = false;
                // } else {
                //     __request("logout", {
                //         sessionId: __userData.peerId
                //     }, function (result) {
                //         action(result);
                //     });
                // }


            },

            __generateImageSrc = function (imgId, size) {

                var data = {
                    size: size,
                    imageServerAddress: __serverData.IMAGE.address
                };
                if (typeof imgId == "object") {
                    data.imgData = imgId;
                } else {
                    data.imgId = imgId;
                }
                return TisUtil.generateImageSrc(data);
            },

            __setLeagueUserMemberState = function (params) {
                __leagues[params.leagueId].isUserMember = params.state;
            },

            __getOnlineUser = function (requestData, setting, onResult) {
                __request(
                    "onlineUser", requestData, function (result) {
                        if (result.HasError) {
                            onResult({
                                hasError: true,
                                errorMessage: result.ErrorMessage,
                                result: result.Result
                            });
                        } else {
                            var users = result.Result.users;
                            var usr = {};

                            for (var i = 0; i < users.length; i++) {
                                var user = users[i],
                                    userId = user.UserID;


                                usr[userId] = {
                                    name: user.Name,
                                    requestIds: []
                                };

                                if (typeof user.Image === "object" && user.Image !== null) {
                                    usr[userId].image = user.Image;
                                }

                                if (typeof user.ProfileImage === "string") {
                                    usr[userId].imageUrl = user.ProfileImage;
                                }

                                var leagueRequestData = __activeMatchRequest[requestData.leagueId];

                                if (leagueRequestData) {
                                    for (var requestId in leagueRequestData) {
                                        if (userId == leagueRequestData[requestId].opponentId) {
                                            usr[userId].requestIds.push(requestId);
                                        }
                                    }
                                }
                            }

                            var nextOffset = requestData.index + 1;

                            onResult({
                                hasError: false,
                                result: {
                                    users: usr,
                                    hasNext: (requestData.index + 1) * requestData.count < result.Result.count,
                                    nextIndex: nextOffset,
                                    nextOffset: nextOffset,
                                    count : result.Count
                                }
                            })
                        }
                    });
            },

            __searchUser = function (requestData, setting, callback) {

                __lastSearchUserTime = new Date();
                __request(
                    "searchUser", requestData, function (result) {
                        if (result.HasError) {
                            callback({
                                hasError: true,
                                errorMessage: result.ErrorMessage,
                                result: result.Result
                            });
                        } else {
                            var users = result.Result;
                            var usr = {};

                            for (var i = 0; i < users.length; i++) {
                                var user = users[i],
                                    userId = user.GcUserId + "";

                                if (userId == __userData.id) {
                                    continue;
                                }

                                usr[userId] = {
                                    name: user.nickName || user.firstName,
                                    image: user.imageInfo,
                                    imageUrl: user.profileImage,
                                    id : userId
                                };

                            }

                            callback({
                                hasError: false,
                                result: {
                                    users: usr,
                                    hasNext: requestData.size == users.length,
                                    nextOffset: requestData.offset += requestData.size,
                                    count: result.Count
                                }
                            })
                        }
                    });
            },

            __getTopScore = function (params, callback) {
                if (typeof params != "object") {
                    throw new ServiceException("params is not exist");
                }

                if (!params.gameId) {
                    throw new ServiceException("gameId key is not exist");
                }

                if (typeof callback != "function") {
                    throw new ServiceException("callback is not function");
                }

                var data = {
                    gameId: params.gameId
                };

                if (params.leagueId != undefined) {
                    data.leagueId = params.leagueId;
                }

                if (typeof params.isGlobal == "boolean") {
                    data.isGlobal = params.isGlobal;
                }
                __request("topScore", data, function (result) {
                    if (result.HasError) {
                        callback({
                            hasError: true,
                            errorMessage: result.ErrorMessage,
                            result: result.Result
                        });

                    } else {
                        var all = {};
                        var scores = result.Result.topScores;
                        for (var i = 0; i < scores.length; i++) {
                            all[i] = {
                                id: scores[i].PlayerID,
                                score: scores[i].Score,
                                name: scores[i].playerName
                            }
                        }
                        callback({
                            hasError: false,
                            errorMessage: undefined,
                            result: all
                        })
                    }
                });
            },

            __getGamesInfo = function (params, callback) {
                if (typeof callback != "function") {
                    throw new ServiceException("callback is not function");
                }


                var requestData = {
                    size: 50,
                    offset: 0
                };

                var id;
                if (params.registerGame) {
                    requestData.gameId = JSON.stringify(Object.keys(__games));
                } else if (Array.isArray(params.gamesId)) {
                    requestData.gameId = JSON.stringify(params.gamesId);
                }

                if (typeof params.name == "string") {
                    requestData.filter = params.name;
                }

                if (params.lobbyId) {
                    requestData.lobbyId = params.lobbyId;
                }

                if (typeof params.size === "number") {
                    requestData.size = params.size;
                }

                if (typeof params.offset === "number") {
                    requestData.offset = params.offset;
                }


                __request(
                    "gameInfo",
                    requestData,
                    function (result) {
                        var returnData = {
                            hasError: result.HasError,
                            errorMessage: result.ErrorMessage,
                            errorCode: result.ErrorCode,
                        };
                        if (!result.HasError) {
                            var resGamesData = [];

                            var allInfo = result.Result;
                            if (allInfo) {
                                for (var i = 0; i < allInfo.length; i++) {
                                    var gameData = allInfo[i];
                                    var refData = __reformatGameObject(gameData);

                                    if (__games[gameData.entityId]) {
                                        __games[gameData.entityId].info = refData;
                                    }

                                    resGamesData.push(refData);
                                }
                            }

                            returnData.result = {
                                games: resGamesData,
                                nextOffset: (requestData.offset += resGamesData.length),
                                hasNext: requestData.size == resGamesData.length,
                                count: result.Count
                            };
                        }

                        callback(returnData);
                    });
            },

            __getLeagueInfo = function (requestUrl, data, setting, callback) {
                if (typeof params != "object") {
                    throw new ServiceException("params is not exist");
                }

                if (typeof callback != "function") {
                    throw new ServiceException("callback is not function");
                }


                __request(
                    requestUrl,
                    data,
                    function (result) {
                        if (result.HasError) {
                            callback({
                                hasError: result.HasError,
                                errorMessage: result.ErrorMessage,
                                errorCode: result.ErrorCode,
                                result : null
                            });
                        } else {
                            var leagues = result.Result;

                            var refactorLeagues = [];
                            for (var i = 0; i < leagues.length; i++) {
                                refactorLeagues.push(__reformatLeagueObject(leagues[i], setting));
                            }

                            callback({
                                hasError: false,
                                errorMessage: result.ErrorMessage,
                                errorCode: result.ErrorCode,
                                result: {
                                    leagues: refactorLeagues,
                                    nextOffset: (data.offset += leagues.length),
                                    hasNext: data.size == leagues.length,
                                    count: result.Count
                                }
                            });
                        }
                    });
            },

            __reformatTableObject = function (data, setting) {
                // var data = params.data,
                //     returnData = {};
                //
                //
                // if(Array.isArray(data)) {
                //
                //     var leagueType = (data.length == 1) ? 1 : ((data.length == 2 ) ? 0 : 3);
                //     switch (leagueType) {
                //
                //         case 0 :
                //             returnData.headerData = data[1].columnNames;
                //             returnData.usersData = data[0];
                //             break;
                //
                //         case 1 :
                //             //leagueType = 0
                //             var rawData = data[0],
                //                 currentLevelMatchCount =Object.keys(rawData[1]).length * 2,
                //                 roundData = {},
                //                 indexes = {};
                //
                //             for(var levelId in rawData) {
                //                 levelId = parseInt(levelId);
                //                 currentLevelMatchCount /=  2;
                //
                //                 if(!roundData[levelId]) {
                //                     roundData[levelId] = {};
                //                 }
                //                 var levelData = rawData[levelId];
                //
                //                 var index = 0;
                //
                //                 if(!indexes[levelId]) {
                //                     indexes[levelId] = {};
                //                 }
                //
                //                 for(var i=1;i<= currentLevelMatchCount;i++) {
                //                     var matchDataObj= {
                //                         user1: {
                //                             id: undefined,
                //                             name: undefined,
                //                             isWinner: undefined,
                //                             image : {
                //                                 url : undefined,
                //                                 id :  undefined
                //                             }
                //                         },
                //                         user2: {
                //                             id: undefined,
                //                             name: undefined,
                //                             isWinner: undefined,
                //                             image : {
                //                                 url : undefined,
                //                                 id :  undefined
                //                             }
                //                         }
                //                         },
                //                         prevLevelId = levelId - 1,
                //                         validMatchNodeId = undefined;
                //
                //                     if(levelId == 1) {
                //                         validMatchNodeId = i;
                //                     } else {
                //                         var upMatchIndex = ((i - 1) * 2 ) + 1,
                //                             upMatchData = roundData[prevLevelId][upMatchIndex],
                //                             downMatchData = roundData[prevLevelId][upMatchIndex+1];
                //
                //                         for(var matchNodeId in levelData) {
                //
                //                             var u1Id = levelData[matchNodeId].UserId1,
                //                                 u2Id = levelData[matchNodeId].UserId2;
                //
                //                             if( u1Id == upMatchData.user1.id   || u1Id == upMatchData.user2.id ||
                //                                 u2Id == upMatchData.user1.id   || u2Id == upMatchData.user2.id ||
                //                                 u1Id == downMatchData.user1.id || u1Id == downMatchData.user2.id ||
                //                                 u2Id == downMatchData.user1.id || u2Id == downMatchData.user2.id
                //                             ) {
                //                                 validMatchNodeId = matchNodeId;
                //                                 break;
                //                             }
                //                         }
                //                     }
                //
                //                     if(validMatchNodeId) {
                //                         var matchData = levelData[validMatchNodeId];
                //
                //                         if(matchData.UserId1) {
                //                             indexes[levelId][matchData.UserId1] = ++index;
                //                         }
                //
                //                         if(matchData.UserId2) {
                //                             indexes[levelId][matchData.UserId2] = ++index;
                //                         }
                //
                //                         matchDataObj.user1.id = matchData.UserId1;
                //                         matchDataObj.user1.name = matchData.UserId1Name;
                //                         matchDataObj.user1.isWinner = (typeof matchData.Winner == "number") ? matchData.Winner == matchData.UserId1 : undefined;
                //                         matchDataObj.user1.image = {
                //                             url : matchData.User1Image && __generateImageSrc(matchData.User1Image.id,params.setting),
                //                             id :  matchData.User1Image && matchData.User1Image.id
                //                         };
                //
                //                         matchDataObj.user2.id = matchData.UserId2;
                //                         matchDataObj.user2.name = matchData.UserId2Name;
                //                         matchDataObj.user2.isWinner = (typeof matchData.Winner == "number") ? matchData.Winner == matchData.UserId2 : undefined;
                //                         matchDataObj.user2.image = {
                //                             url : matchData.User2Image && __generateImageSrc(matchData.User2Image.id,params.setting),
                //                             id :  matchData.User2Image && matchData.User2Image.id
                //                         };
                //
                //                         if(levelId != 1) {
                //                             matchDataObj.user1.prevIndex = indexes[prevLevelId] && indexes[prevLevelId][matchData.UserId1];
                //                             matchDataObj.user2.prevIndex = indexes[prevLevelId] && indexes[prevLevelId][matchData.UserId2];
                //                         }
                //                     }
                //
                //                     roundData[levelId][i] = matchDataObj;
                //                 }
                //
                //                 returnData.rounds = roundData;
                //             }
                //
                //             break;
                //     }
                // }
                // return returnData;

                var returnData = {};

                var leagueType = (Array.isArray(data.ColumnNames)) ? 0 : 1;
                switch (leagueType) {

                    case 0 :
                        returnData.headerData = data.ColumnNames;
                        var usersData = [];
                        if (Array.isArray(data.Table)) {
                            for (var i = 0; i < data.Table.length; i++) {
                                var uData = data.Table[i];

                                var userData = {
                                    matchCount: uData.played,
                                    userId: uData.playerID,
                                    nickName: uData.playerName,
                                    rank: uData.rank,
                                    image: uData.profilePreviewImage,
                                    imageUrl: uData.profileImage,
                                    scores: []
                                };

                                var scores = uData.scores;

                                for (var j = 0; j < scores.length; j++) {
                                    var score = scores[j];
                                    userData.scores.push({
                                        name: score.Name,
                                        value: score.Value
                                    });
                                }
                                usersData.push(userData);
                            }
                        }

                        returnData.usersData = usersData;
                        break;

                    case 1 :
                        //leagueType = 0
                        var currentLevelMatchCount = Object.keys(data[1]).length * 2,
                            roundData = {},
                            indexes = {};

                        for (var levelId in data) {
                            levelId = parseInt(levelId);
                            currentLevelMatchCount /= 2;

                            if (!roundData[levelId]) {
                                roundData[levelId] = {};
                            }
                            var levelData = data[levelId];

                            var index = 0;

                            if (!indexes[levelId]) {
                                indexes[levelId] = {};
                            }

                            for (var i = 1; i <= currentLevelMatchCount; i++) {
                                var matchDataObj = {
                                        user1: {
                                            id: undefined,
                                            name: undefined,
                                            isWinner: undefined,
                                            image: {
                                                url: undefined,
                                                id: undefined
                                            }
                                        },
                                        user2: {
                                            id: undefined,
                                            name: undefined,
                                            isWinner: undefined,
                                            image: {
                                                url: undefined,
                                                id: undefined
                                            }
                                        }
                                    },
                                    prevLevelId = levelId - 1,
                                    validMatchNodeId = undefined;

                                if (levelId == 1) {
                                    validMatchNodeId = i;
                                } else {
                                    var upMatchIndex = ((i - 1) * 2 ) + 1,
                                        upMatchData = roundData[prevLevelId][upMatchIndex],
                                        downMatchData = roundData[prevLevelId][upMatchIndex + 1];

                                    for (var matchNodeId in levelData) {

                                        var u1Id = levelData[matchNodeId].UserId1,
                                            u2Id = levelData[matchNodeId].UserId2;

                                        if (u1Id == upMatchData.user1.id || u1Id == upMatchData.user2.id ||
                                            u2Id == upMatchData.user1.id || u2Id == upMatchData.user2.id ||
                                            u1Id == downMatchData.user1.id || u1Id == downMatchData.user2.id ||
                                            u2Id == downMatchData.user1.id || u2Id == downMatchData.user2.id
                                        ) {
                                            validMatchNodeId = matchNodeId;
                                            break;
                                        }
                                    }
                                }

                                if (validMatchNodeId) {
                                    var matchData = levelData[validMatchNodeId];

                                    if (matchData.UserId1) {
                                        indexes[levelId][matchData.UserId1] = ++index;
                                    }

                                    if (matchData.UserId2) {
                                        indexes[levelId][matchData.UserId2] = ++index;
                                    }

                                    matchDataObj.user1.id = matchData.UserId1;
                                    matchDataObj.user1.name = matchData.UserId1Name;
                                    matchDataObj.user1.isWinner = (typeof matchData.Winner == "number") ? matchData.Winner == matchData.UserId1 : undefined;
                                    matchDataObj.user1.image = matchData.User1Image;
                                    matchDataObj.user1.imageUrl = matchData.User1ImageUrl;

                                    matchDataObj.user2.id = matchData.UserId2;
                                    matchDataObj.user2.name = matchData.UserId2Name;
                                    matchDataObj.user2.isWinner = (typeof matchData.Winner == "number") ? matchData.Winner == matchData.UserId2 : undefined;
                                    matchDataObj.user2.image = matchData.User2Image;
                                    matchDataObj.user2.imageUrl = matchData.User2ImageUrl;

                                    if (levelId != 1) {
                                        matchDataObj.user1.prevIndex = indexes[prevLevelId] && indexes[prevLevelId][matchData.UserId1];
                                        matchDataObj.user2.prevIndex = indexes[prevLevelId] && indexes[prevLevelId][matchData.UserId2];
                                    }
                                }

                                roundData[levelId][i] = matchDataObj;
                            }

                            returnData.rounds = roundData;
                        }

                        break;
                }
                return returnData;
            },

            __reformatLobbyObject = function (lobby) {

                var ret = {
                    id: lobby.ID + "",
                    name: lobby.Name,
                    timestamp: lobby.Timestamp,
                    hashCode: lobby.HashCode,
                    image: lobby.Image
                };

                if(ret.image) {
                    ret.image.id += "";
                }

                return ret;
            },

            __reformatGameObject = function (gameData) {


                var businessData = gameData.business;
                businessData.id += "";

                if(businessData.imageInfo) {
                    var businessImageData = businessData.imageInfo;
                    businessImageData.id += "";
                    businessData.image = businessImageData;
                    delete  businessData.image;
                }

                var data = {
                    id: gameData.entityId + "",
                    name: gameData.Name,
                    lobby : __reformatLobbyObject(gameData.Lobby),
                    description: gameData.description,
                    creator: gameData.Creator,
                    playerNumbersType: gameData.GamePlayerNumbersType,
                    status: gameData.GameStatus,
                    physicalUrl: gameData.PhysicalUrl,
                    timelineId: gameData.timelineId,
                    packageName: gameData.PackageName,
                    mobileVersion: gameData.MobileVersion,
                    mobileVersionCode: gameData.MobileVersionCode,
                    supporterId: gameData.SupporterID + "",
                    defaultLeagueId: gameData.DefaultLeague + "",
                    downloadLink: gameData.DownloadLink,
                    gamePlayDescription: gameData.GamePlayDesc,
                    platformType: gameData.Platform,
                    score: gameData.Score,
                    webVersion: gameData.WebVersion,
                    attributeValues: gameData.attributeValues,
                    categoryList: gameData.categoryList,
                    availableCount: gameData.availableCount,
                    discount: gameData.discount,
                    numOfComments: gameData.numOfComments,
                    numOfFavorites: gameData.numOfFavorites,
                    numOfLikes: gameData.numOfLikes,
                    business : businessData,
                    canComment: gameData.canComment,
                    canLike: gameData.canLike,
                    enable: gameData.enable,
                    infrustructure: gameData.Infrustructure,
                    hide: gameData.hide,
                    latitude: gameData.latitude,
                    longitude: gameData.longitude,
                    publishedDate: gameData.PublishedDate,
                    price: gameData.price,
                    timestamp: gameData.timestamp,
                    rate: gameData.rate,
                    userPostInfo: gameData.userPostInfo,
                    hasLeague: gameData.HasLeague,
                    hasSdk: gameData.HasSdk,
                    apkSize: gameData.ApkSize,
                    changelog: gameData.Changelog || "",
                    lastVersion: gameData.MobileVersion,
                    currentVersion: __games[gameData.entityId] && __games[gameData.entityId].version,
                    image: gameData.previewInfom,
                    imageUrl: gameData.preview,
                    esrb : gameData.Esrb
                };

                if(data.userPostInfo) {
                    data.userPostInfo.postId += "";
                }

                return data;

            },

            __reformatLeagueObject = function (leagueData, setting) {
                var leagueGames = leagueData.Games;

                var games = [], members = {};

                for (var i = 0; i < leagueGames.length; i++) {
                    var gameData = __reformatGameObject(leagueGames[i]);
                    games.push(gameData);
                }

                var leagueId = leagueData.entityId + "";

                var businessData = leagueData.business;
                businessData.id += "";

                if(businessData.imageInfo) {
                    var businessImageData = businessData.imageInfo;
                    businessImageData.id += "";
                    businessData.image = businessImageData;
                    delete  businessData.image;
                }

                __leagues[leagueId] = {
                    enrollUrl: leagueData.EnrollUrl,
                    business : businessData,
                    members: members,
                    isMember: leagueData.IsUserMember,
                    isFollower: leagueData.userPostInfo.favorite,
                    id: leagueId,
                    image: leagueData.previewInfo,
                    imageUrl: leagueData.preview,
                    gameType: leagueData.LeagueGameType,
                    playerType: leagueData.LeaguePlayerType,
                    status: leagueData.LeagueStatus,
                    financialType: leagueData.LeagueFinancialType,
                    lobbyID: leagueData.LobbyID,
                    maxPlayers: leagueData.MaxPlayers,
                    minNoOfPlayedGames: leagueData.MinNoOfPlayedGames,
                    minPlayers: leagueData.MinPlayers,
                    memberCount: leagueData.MemberCount,
                    endTime: leagueData.ExpireTimestamp,
                    startTime: leagueData.FromDateTimestamp,
                    rules: leagueData.Rules,
                    description: leagueData.description,
                    hasPrize: leagueData.HasPrize,
                    price: leagueData.price / __configData.cf,
                    name: leagueData.Name,
                    playerNumberType: leagueData.PlayerNumberType,
                    timestamp: leagueData.timestamp,
                    type: leagueData.NTimeKnockout,
                    accessType: leagueData.LeagueAccessType,
                    quickMatch: leagueData.QuickMatch,
                    rate: leagueData.rate,
                    timelineId: leagueData.timelineId,
                    userPostInfo: leagueData.userPostInfo,
                    // offlineRequestState : offlineRequestState,
                    games: games
                };

                try {
                    if(leagueData.metadata) {
                        var metaData = JSON.parse(leagueData.metadata);
                        var bannerImageUrl = metaData.bannerImage;
                        if(bannerImageUrl) {
                            __leagues[leagueId].bannerImageUrl = bannerImageUrl;
                        }
                    }
                }catch (e){
                    console.log("league meta data exception", e);
                }

                var game = __games[leagueData.Games[0].entityId];
                if (game) {
                    if (!game.leagues) {
                        game.leagues = {}
                    }

                    game.leagues[leagueData.entityId] = __leagues[leagueData.entityId];

                }

                return __leagues[leagueId];
            },

            __reformatInAppPack = function (pack) {
                var price,
                    base = pack.Base,
                    plan = pack.Plan;

                price = base.price / __configData.cf;

                return {
                    id: pack.ID + "",
                    count: pack.Count,
                    name: base.Name,
                    visible: pack.Visible,
                    enable: pack.Enable,
                    allowedTimesToBuy: pack.AllowedTimesToBuy,
                    description: base.description,
                    price: price,
                    priceText: TisUtil.tokenizeCurrency(price) + " " + __configData.cu,
                    priceUnit: __configData.cu,
                    item: __reformatGameItem(pack.Item),
                    plan: {
                        cycle: plan.Cycle,
                        fromDate: plan.FromDate,
                        id: plan.ID + "",
                        toDate: plan.ToDate,
                        type: plan.Type
                    },
                    image: base.previewInfo,
                    imageUrl: base.preview
                };
            },

            __reformatGameItem = function (item) {

                return {
                    id: item.ID + "",
                    name: item.Name,
                    description: item.Desc,
                    visible: item.Visible,
                    enable: item.Enable,
                    allowedTimesToBuy: item.AllowedTimesToBuy,
                    image: item.Image
                };
            },

            __reformatUserItem = function (item) {
                return {
                    id: item.ID + "",
                    count: item.Count,
                    item: __reformatGameItem(item.Item)
                };
            },

            __reformatFriendshipRes = function (result) {
                var toUser = result.ToUser;
                var fromUser = result.FromUser;

                var retData = {
                    creationDate: result.CreationDate,
                    requestId: result.ID + "",
                    friendId : result.FriendId,
                    status: result.Status,
                    toUser: {
                        id: toUser.id + "",
                        name: toUser.name,
                        image: toUser.image,
                        imageUrl: toUser.profileImage
                    }
                };
                if(fromUser) {
                    retData.fromUser = {
                        id: fromUser.id + "",
                        name: fromUser.name,
                        image: fromUser.image,
                        imageUrl: fromUser.profileImage
                    }
                }
                return retData;
            },

            __reformatNewsObject = function (news) {

                if(news.imageInfo) {
                    news.image = news.imageInfo;
                    news.image.id += "";
                    delete news.imageInfo;
                }

                if(news.previewImage) {
                    news.imageUrl = news.previewImage;
                    delete news.previewImage;
                }

                var business = news.business;


                if(business.image) {
                    business.imageUrl = business.image;
                    delete business.image;
                }

                if(business.imageInfo) {
                    business.image = business.imageInfo;
                    business.image.id += "";
                    delete business.imageInfo;
                }
                business.id += "";

                news.id += "";
                news.timelineId += "";
                news.entityId += "";


                return news;
            },

            __reformatCommentFormat = function (comment) {

                comment.id += "";

                comment.user.id += "";

                if(comment.user.image) {
                    comment.user.image += "";
                }
                if(comment.user.profileImage) {
                    comment.user.imageUrl = comment.user.profileImage;
                    delete comment.user.profileImage;
                }

                return comment;
            },

            __getUserItem = function (params, callback) {
                if (typeof params != "object") {
                    throw new ServiceException("params is not exist");
                }

                if (!params.gameId) {
                    throw new ServiceException("gameId key is not exist");
                }


                var data = {
                    entityId: params.gameId
                };
                if (typeof params.size == "number") {
                    data.size = params.size;
                } else {
                    data.size = 10;
                }

                if (typeof params.offset == "number") {
                    data.offset = params.offset;
                } else {
                    data.offset = 0;
                }

                if (typeof params.itemId != "undefined") {
                    data.itemId = params.itemId;
                }

                __request("getUserItems", data, function (result) {

                    var retData = {
                        hasError: result.HasError,
                        errorMessage: result.ErrorMessage
                    };

                    if (!result.HasError) {

                        var items = [];
                        if (Array.isArray(result.Result)) {
                            for (var i = 0; i < result.Result.length; i++) {
                                items.push(__reformatUserItem(result.Result[i]));
                            }
                        }
                        retData.result = {
                            items: items,
                            nextOffset: (data.offset += items.length),
                            hasNext: data.size == items.length
                        }
                    }
                    callback && callback(retData);

                });
            },

            __getUserGameCenterItem = function (params, callback) {
                if (typeof params != "object") {
                    throw new ServiceException("params is not exist");
                }


                var data = {};

                if (params.itemId) {
                    data.itemId = params.itemId;
                }

                if (typeof params.size == "number") {
                    data.size = params.size;
                } else {
                    data.size = 10;
                }

                if (typeof params.offset == "number") {
                    data.offset = params.offset;
                } else {
                    data.offset = 0;
                }

                if (typeof params.itemId != "undefined") {
                    data.itemId = params.itemId;
                }

                __request("getUserGCItems", data, function (result) {

                    var retData = {
                        hasError: result.HasError,
                        errorMessage: result.ErrorMessage
                    };

                    if (!result.HasError) {

                        var items = [];
                        if (Array.isArray(result.Result)) {
                            for (var i = 0; i < result.Result.length; i++) {
                                items.push(__reformatUserItem(result.Result[i]));
                            }
                        }
                        retData.result = {
                            items: items,
                            nextOffset: (data.offset += items.length),
                            hasNext: data.size == items.length
                        }
                    }
                    callback && callback(retData);

                });
            },

            __consumeItem = function (params, callback) {
                if (typeof params != "object") {
                    throw new ServiceException("params is not exist");
                }

                if (!params.itemId) {
                    throw new ServiceException("itemId key is not exist");
                }
                if (!params.count) {
                    throw new ServiceException("count key is not exist");
                }

                var data = {
                    itemId: params.itemId,
                    count: params.count
                };
                var setting;
                if (params.setting) {
                    setting = params.setting;
                }

                __request("consumeItem", data, function (result) {

                    var retData = {
                        hasError: result.HasError,
                        errorMessage: result.ErrorMessage,
                        errorCode: result.ErrorCode
                    };

                    if (!result.HasError) {
                        retData.result = __reformatUserItem(result.Result);
                    }
                    if (typeof callback == "function") {
                        callback(retData);
                    }

                }, setting);
            },

            __encryptData = function (data, callback) {
                data.timestamp = new Date().getTime();
                var reqData = [];
                for (var key in data) {
                    var value = data[key];

                    if (Array.isArray(value) || typeof value == "object" && value != null) {
                        reqData.push({
                            name: key,
                            value: JSON.stringify(value)
                        });
                    } else {
                        reqData.push({
                            name: key,
                            value: value
                        });
                    }
                }
                __encryptHandshake(function (res) {
                    if (!res.hasError) {
                        var encryptData = res.result;

                        var strData = JSON.stringify(reqData);

                        var key = CryptoJSs.enc.Latin1.parse(encryptData.secretKey);
                        var iv = CryptoJSs.enc.Latin1.parse(encryptData.initializationVector);

                        var hash = CryptoJSs.MD5(strData).toString().toUpperCase();
                        var plusData = hash + __configData.ehd + strData;

                        var encrypt;

                        switch (encryptData.algorithm) {
                            case "AES" :
                                encrypt = CryptoJSs.AES.encrypt(plusData, key, {
                                    iv: iv,
                                    padding: CryptoJSs.pad.Pkcs7,
                                    mode: CryptoJSs.mode.CBC,
                                });
                                break;

                            case "DES" :
                                encrypt = CryptoJSs.DES.encrypt(plusData, key, {
                                    iv: iv,
                                    padding: CryptoJSs.pad.Pkcs7,
                                    mode: CryptoJSs.mode.CBC,
                                });
                                break;

                            default :

                                encrypt = {};

                        }

                        callback({
                            hasError: false,
                            result: {
                                // encryptData : encryptData,
                                data: encrypt.toString(),
                                clientId : __appId + "",
                                h: hash
                            }
                        });
                    } else {
                        callback(res);
                    }
                });

            },

            __encryptHandshake = function (callback) {

                // console.log("__encryptndshake",__userData.id,__userData.token,new Date(),__authHandshakeData.data,__authHandshakeData.updateTime,__configData.ehet);

                if (__encryptHandshakeData.data &&
                    __encryptHandshakeData.updateTime &&
                    (new Date() - __encryptHandshakeData.updateTime < __configData.ehet)) {
                    callback && callback({
                        hasError: false,
                        result: __encryptHandshakeData.data
                    });
                    return;
                }

                if( __encryptHandshakeData.updating) {
                    __encryptHandshakeData.callbackQueue.push(callback);
                    return;
                }
                __encryptHandshakeData.updating = true;

                __request("authHandshake", {clientId : __appId+""}, function (result) {

                    var retData = {
                        hasError: result.HasError,
                        errorMessage: result.ErrorMessage
                    };


                    if (!result.HasError) {
                        retData.result = {
                            algorithm: result.Result.Alg,
                            initializationVector: result.Result.IV,
                            secretKey: result.Result.SecretKey,
                        };

                        __encryptHandshakeData.data = retData.result;
                        __encryptHandshakeData.updateTime = new Date();

                    }
                    callback && callback(retData);

                    for (var i = 0; i < __encryptHandshakeData.callbackQueue.length; i++) {
                        __encryptHandshakeData.callbackQueue[i](retData);

                    }
                    __encryptHandshakeData.callbackQueue = [];
                    __encryptHandshakeData.updating = false;

                });
            };

        function manageTokenExpireTime(tokenExpireTime) {
            return;

            if (!__isApp) {
                return;
            }
            console.log("manageTokenExpireTime_1", tokenExpireTime, __userData.token);
            var expTime = new Date(tokenExpireTime);
            var currentTime = new Date();
            var remainTime = expTime - currentTime - __configData.tutf;
            console.log("manageTokenExpireTime_2", remainTime,expTime);
            if (remainTime > 0) {

                setTimeout(updateUserToken, remainTime);

            } else {
                // updateUserToken();
                setTimeout(function () {
                    updateUserToken();
                }, 1000);
            }

        }

        function updateUserToken() {

            console.log("updateUserToken_1", __userData.loginState, __userData.token);
            if (!__userData.loginState) {
                return;
            }

            TIS.Plugin.getUserData(
                {},
                function (res) {
                    console.log("updateUserToken_2 " + JSON.stringify(res));
                    var result = res.Result;
                    if (!res.HasError && result) {
                        var expireTime = new Date(result.tokenExpireTime);
                        var currentTime = new Date();
                        console.log("updateUserToken_3",expireTime,currentTime);
                        if (expireTime - currentTime > 0) {
                            console.log("updateUserToken_4");
                            __self.refreshToken({token: result.token, tokenExpireTime: result.tokenExpireTime});
                        } else {
                            console.log("updateUserToken_5");
                            setTimeout(function () {
                                updateUserToken();
                            }, 1000);
                        }
                    } else {
                        console.log("updateUserToken_6");
                        setTimeout(function () {
                            updateUserToken();
                        }, 1000);
                    }

                },
                function (res) {
                    console.log("updateUserToken_7", res);
                    setTimeout(function () {
                        updateUserToken();
                    }, 1000);
                });
        }


        /*==================================================================================================================
         *                                 P R O T E C T E D     M E T H O D
         *================================================================================================================*/

        __networkMethods.registerPeerId = function (peerId, callback) {


            var gameVersion = [];
            for (var gameId in __games) {
                gameVersion.push({
                    gameId: gameId,
                    version: __games[gameId].version
                });
            }


            var type = 3;

            if (!__isApp) {

                if(gameVersion.length == 0) {
                    type = 4;
                } else{
                    type = 1;
                }


            }

            var sendData = {
                peerId: peerId,
                serviceVersion: Service.VERSION,
                deviceId : __userData.deviceId,
                type: type
            };

            if(gameVersion.length == 0) {
                sendData.type = 1;//game center web
            }

            sendData.gameVersion = JSON.stringify(gameVersion);
            if (__userData.token) {
                __syncTokenWithPeer = true;
            }


            __request(
                "asyncRegister",
                sendData,
                function (result) {
                    var returnData = {
                        hasError: result.HasError,
                        errorCode: result.ErrorCode,
                        errorMessage: result.ErrorMessage,
                        result: result.Result
                    };

                    if (result.HasError) {
                        console.log("registerPeerId", result);
                        switch (result.ErrorCode) {

                            case TisNetworkClass.ErroCodes.MAJOR_CONFLICT :
                                __majorConflictAction();
                                break;

                            case TisNetworkClass.ErroCodes.PEER_CLEAR :
                                __network.onLogout();
                                break;

                            case TisNetworkClass.ErroCodes.GAME_NOT_FOUND :
                                break;

                            default  :
                                callback(returnData);
                        }

                    } else {
                        callback(returnData);
                    }
                },{
                    fromSocket : false
                }
            );
        };

        __networkMethods.activatePeerId = function (peerId, callback) {
            var requestData = {
                peerId: peerId
            };

            if (window && window.device != undefined) {
                requestData.device = window.device
            }

            __request(
                "activatePeer", requestData,
                function (result) {
                    if (result.HasError) {
                        switch (result.ErrorCode) {
                            case TisNetworkClass.ErroCodes.PEER_CLEAR :
                                __network.onLogout();
                                break;

                            default  :
                                callback({
                                    hasError: result.HasError,
                                    errorMessage: result.ErrorMessage
                                });
                        }

                    } else {
                        callback({
                            hasError: result.HasError
                        });
                    }

                    // if (!result.HasError && __userData.loginState && !__isRunFromGC) {
                    //     function ping() {
                    //         __pingAction(__userData.token, function (result) {
                    //             if (result.HasError) {
                    //                 setTimeout(function () {
                    //                     ping();
                    //                 }, __configData.smit);
                    //             }
                    //         });
                    //     }
                    //
                    //     ping();
                    // }
                },
                {
                    fromSocket : false
                }
            );
        };

        __networkMethods.getConfig = function () {
            return __configData;
        };


        /*==================================================================================================================
         *                                 P U B L I C     M E T H O D
         *================================================================================================================*/

        /**
         * <div style='width: 100%;text-align: right'>دریافت رخداد های سرویس </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *      service.on("login",function(result) {
         *          console.log("on method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method on
         * @public
         *
         * @param {String} eventName
         *
         *      login
         *      guestLogin
         *      logout
         *      autoLoginStart
         *      autoLoginEnd
         *      autoLoginFail
         *      connect
         *      reconnect
         *      disconnect
         *      ready
         *      buyPack
         *      creditChange
         *      profileChange
         *      message
         *      activeMatchData
         *      matchRequestResponse
         *      gameRegister
         *      clearMessage
         *      showUpdateUI
         *      showAd
         *      defaultLeagueSubscribe
         *      newMatch
         *      matchStart
         *      matchResult
         *      matchRequest
         *
         * @param {Function} callback
         *      <ul>
         *      </ul>
         *
         * @return {String} id
         * */
        __self.on = function (eventName, callback) {
            if (__eventCallbacks[eventName]) {
                var id = TisUtil.generateUUID();
                __eventCallbacks[eventName][id] = callback;

                if (eventName == "ready" && __isReady) {
                    callback();
                }

                if (eventName == "login" && __userData.loginState) {
                    callback({
                        id: __userData.id,
                        name: __userData.name,
                        token: __userData.token,
                        image: __userData.image
                    });
                }


                if (eventName == "connect" && __userData.peerId) {
                    callback({
                        peerId: __userData.peerId
                    });
                }

                return id;
            }
        };

        /**
         * <div style='width: 100%;text-align: right'> حذف رخداد</div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *       var reqData = {};
         *       reqData["eventId"]= "123323-32323-23";
         *       service.removeEventListener(reqData);
         *  </code>
         * </pre>
         * @method removeEventListener
         * @public
         *
         * @param {Object} params
         *      <ul>
         *          <li>{String} eventId  </li>
         *
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.removeEventListener = function (params) {
            if (typeof params != "object") {
                throw new ServiceException("params is not defined!");
            }
            if (!params.eventId) {
                throw new ServiceException("eventId is not exists!");
            }

            for(var eventName in __eventCallbacks) {

                for(var eventId in __eventCallbacks[eventName]) {
                    if(eventId === params.eventId) {
                        delete __eventCallbacks[eventName][eventId];
                        break;
                    }
                }
            }


        }


        __self.sendResult = function (params, gameId) {
            if (typeof params != "object") {
                throw new ServiceException("params is not defined!");
            }
            var result;
            if (params.result) {
                var ownerId = (__userData.loginState) ? __userData.id : undefined,
                    scores;

                if (typeof params.result == "object" && params.result[ownerId]) {
                    scores = params.result[ownerId];
                } else {
                    scores = params.result;
                }

                result = JSON.stringify([
                    {
                        playerId: ownerId,
                        scores: scores
                    }
                ]);
                gameId = params.gameId;
            } else {
                result = params;
            }
            __sendResult({
                matchData: {gameId: gameId},
                result: result,
                forceAddToTable: true
            }, params.onResult);
        };

        /**
         * @method sendResultRequest
         * @public
         *
         * @param {Object} params
         *      @param {String} params.gameId
         *      @param {Object} params.result
         *
         * @throws {ServiceException}
         *
         * */
        __self.sendResultRequest = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params is not defined!");
            }
            if (!params.result) {
                throw new ServiceException("result is not exists!");
            }
            if (!params.gameId) {
                throw new ServiceException("gameId is not exists!");
            }

            var result;
            var ownerId = (__userData.loginState) ? __userData.id : undefined,
                scores;

            if (typeof params.result == "object" && params.result[ownerId]) {
                scores = params.result[ownerId];
            } else {
                scores = params.result;
            }

            result = JSON.stringify([
                {
                    playerId: ownerId,
                    scores: scores
                }
            ]);

            __sendResult({
                matchData: {gameId: params.gameId},
                result: result,
                forceAddToTable: true
            }, callback);
        };

        __self.sendScore = function (score, gameId) {
            if (!gameId) {
                throw new ServiceException("gameId is not defined!");
            }

            if (!score) {
                throw new ServiceException("score is not defined!");
            }

            __sendScore({
                gameId: gameId
            }, score, true);
        };

        /**
         * @method sendScore
         * @public
         *
         * @param {Object} score
         * @param {Number} gameId
         * @deprecated
         * @throws {ServiceException}
         * */
        __self.sendScoreRequest = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params is not defined!");
            }
            if (!params.score) {
                throw new ServiceException("score is not defined!");
            }
            if (!params.gameId) {
                throw new ServiceException("gameId is not defined!");
            }

            __sendScore({
                gameId: callback
            }, params.score, true);
        };

        /**
         * @method visibility
         * @public
         * @deprecated
         *
         * */
        __self.visibility = function (params) {
            __self.changeVisibilityRequest(params && params.onResult);
        };

        /**
         *  تغییر وضعیت کاربر برای دریافت و یا عدم دریافت درخواست مسابقه
         * @method changeVisibilityRequest
         * @public
         *
         * @param {Function} callback
         *      @param {Boolean} callback.hasError
         *      @param {String} callback.errorMessage
         *      @param {Object} callback.result
         *              @param {Boolean} callback.result.visible وضعیت کنونی کاربر
         *
         * */
        __self.changeVisibilityRequest = function (callback) {

            __request("invisible", {peerId: __userData.peerId}, function (res) {
                var returnData = {
                    hasError: res.HasError,
                    errorMessage: res.ErrorMessage
                };

                if (!res.HasError) {
                    returnData.result = {
                        visible: res.Result.visible
                    };
                }

                if (typeof callback == "function") {
                    callback(returnData);
                }
            });
        };

        /**
         * <div style='width: 100%;text-align: right'>دریافت میزان اعتبار کاربر </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      service.getCredit(function() {
         *          console.log("getCredit method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getCredit
         * @public
         *
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{Double} credit - میزان اعتبار</li>
         *                  <li>{String} text - میزان اعتبار به همراه واحد آن</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         *
         * @throws ServiceException خطای سرویس
         * */
        __self.getCredit = function (callback) {
            if (typeof callback != "function") {
                throw new ServiceException("callback is not defined");
            }

            __request("credit", {}, function (res) {
                var returnData = {
                    hasError: res.HasError,
                    errorMessage: res.ErrorMessage,
                    result: {}
                };

                var credit = 0;
                if (res && res.Result && res.Result.credit != undefined) {
                    credit = parseInt(res.Result.credit) / __configData.cf;
                }

                returnData.result = {
                    credit: credit,
                    text: credit + "&nbsp" + __configData.cu
                };

                callback(returnData);
            });
        };

        /**
         * <div style='width: 100%;text-align: right'> دریافت اطلاعات لیگ </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["gameId"]="2";
         *      reqData["size"] = 10;
         *
         *      service.getLeaguesInfo(reqData, function() {
         *           console.log("getLeaguesInfo method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getLeaguesInfo
         * @public
         *
         * @param {Object} params
         *      <ul>
         *          <li>{String} [gameId] - شناسه بازی</li>
         *          <li>{String} [leagueId] - شناسه لیگ</li>
         *          <li>{String} [leaguesId] - شناسه لیگ ها</li>
         *          <li>{Integer} [size=5]</li>
         *          <li>{Integer} [offset=0]</li>
         *          <li>{String} [name] - نام لیگ</li>
         *          <li>{Integer} [prize=0] - نوع لیگ از نظر جایزه
         *              <p>    0 = تمام موارد</p>
         *              <p>    1 = جایزه دار</p>
         *              <p>    2 = عدم داشتن جایزه</p>
         *          </li>
         *          <li>{Integer} [status=0] - نوع لیگ از نظر وضعیت
         *              <p>    0 = تمام موارد</p>
         *              <p>    1 = شروع نشده</p>
         *              <p>    2 = در حال ثبت نام</p>
         *              <p>    3 = در حال اجرا</p>
         *              <p>    4 = تمام شده</p>
         *              <p>    5 = در حال اجرا و ثبت نام</p>
         *              <p>    6 = حساب رسی شذه</p>
         *              <p>    7 = رد شده</p>
         *              <p>    8 = کنسل شده</p>
         *              <p>    9 =در حال بررسی</p>
         *              <p>    10 = نیاز به تغییرات</p>
         *          </li>
         *          <li>{JSONArray} [statusList] - وضعیت های لیگ </li>
         *          <li>{Integer} [financialType=0] - نوع لیگ بر اساس حق عضویت
         *              <p>    0 = تمام موارد</p>
         *              <p>    1 = رایگان</p>
         *              <p>    2 = پولی</p>
         *          </li>
         *          <li>{Integer} [userState=0] - نوع لیگ بر اساس وضعیت کاربر
         *              <p>     0 = تمام موارد</p>
         *              <p>     1 = عضو شده</p>
         *              <p>     2 =</p>
         *              <p>     3 = عضو نشده</p>
         *          </li>
         *          <li>{Boolean} [showDefault=true] - وجود یا عدم وجود لیگ پیش فرض</li>
         *          <li>{Boolean} [newest=false] - دریافت جدیدترین لیگ ها</li>
         *          <li>{String} [lobbyId] - شناسه دسته بازی</li>
         *          <li> {JSONObject} [setting]
         *              <ul>
         *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر لیگ</li>
         *                  <li>{Integer} [imageHeight] اندازه رزولیشن عمودی تصویر لیگ</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONArray} result
         *              <ul>
         *                  <li>{JSONArray} leagues
         *                      <ul>
         *                          <li>{String} id </li>
         *                          <li>{String} enrollUrl</li>
         *                          <li>{Boolean} isMember </li>
         *                          <li>{Boolean} isFollower</li>
         *                          <li>{JSONObject} userPostInfo
         *                              <ul>
         *                                  <li>{Boolean} favorite</li>
         *                                  <li>{Boolean} liked</li>
         *                                  <li>{String} postId</li>
         *                              </ul>
         *                          </li>
         *                          <li>{JSONObject} image
         *                              <ul>
         *                                  <li>{String} id</li>
         *                                  <li>{String} url</li>
         *                                  <li>{Integer} width</li>
         *                                  <li>{Integer} height</li>
         *                              </ul>
         *                          </li>
         *                          <li>{Integer} gameType</li>
         *                          <li>{Integer} playerType</li>
         *                          <li>{Integer} status</li>
         *                          <li>{Integer} financialType</li>
         *                          <li>{Integer} lobbyId</li>
         *                          <li>{Integer} maxPlayers</li>
         *                          <li>{Integer} minNoOfPlayedGames</li>
         *                          <li>{Integer} minPlayers</li>
         *                          <li>{Integer} memberCount</li>
         *                          <li>{Integer} playerNumberType</li>
         *                          <li>{Integer} timestamp</li>
         *                          <li>{String} creator</li>
         *                          <li>{Integer} memberCount</li>
         *                          <li>{Integer} availableCount</li>
         *                          <li>{Integer} discount</li>
         *                          <li>{Integer} numOfComments</li>
         *                          <li>{Integer} numOfFavorites</li>
         *                          <li>{Integer} numOfLikes</li>
         *                          <li>{Integer} type</li>
         *                          <li>{Integer} [endTime]</li>
         *                          <li>{Integer} [startTime]</li>
         *                          <li>{String} rules</li>
         *                          <li>{String} description</li>
         *                          <li>{String} name</li>
         *                          <li>{String} ThreadId</li>
         *                          <li>{String} timelineId</li>
         *                          <li>{Boolean} hasPrize</li>
         *                          <li>{Boolean} quickMatch</li>
         *                          <li>{Boolean} startTypeCapacityComplete</li>
         *                          <li>{Boolean} startTypeFromDate</li>
         *                          <li>{Boolean} startTypePublishDate</li>
         *                          <li>{Boolean} canComment</li>
         *                          <li>{Boolean} canLike</li>
         *                          <li>{Boolean} enable</li>
         *                          <li>{Boolean} hide</li>
         *                          <li>{Double} price</li>
         *                          <li>{JSONArray} attributeValues</li>
         *                          <li>{JSONArray} categoryList</li>
         *                          <li>{JSONObject} business</li>
         *                          <li>{JSONObject} rate</li>
         *                          <li>{JSONArray} games</li>
         *                      </ul>
         *                  </li>
         *                  <li>{Boolean} hasNext</li>
         *                  <li>{Integer} nextOffset</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getLeaguesInfo = function (params, callback) {
            var data = {},
                leagueId = parseInt(params.leagueId),
                requestUrl = "league";

            if (params.gameId) {
                data.gameId = params.gameId;
            }

            if (params.lobbyId) {
                data.lobbyId = params.lobbyId;
            }

            if (!isNaN(leagueId) && typeof leagueId == "number" || (Array.isArray(params.leaguesId) && params.leaguesId.length > 0)) {
                if (params.leagueId) {
                    data.leagueId = params.leagueId;
                }

                if (params.leaguesId) {
                    data.leaguesId = JSON.stringify(params.leaguesId);
                }
            } else {
                if (typeof params.size == "number" && params.size > 0) {
                    data.size = params.size;
                } else {
                    data.size = __configData.gldc
                }

                if (typeof params.offset == "number" && params.offset >= 0) {
                    data.offset = params.offset;
                } else {
                    data.offset = 0;
                }

                if (typeof params.name == "string" && params.name.length > 0) {
                    data.filter = params.name;
                }

                if (typeof params.prize == "number") {
                    if (params.prize == 1) {
                        data.hasPrize = true;
                    }

                    if (params.prize == 2) {
                        data.hasPrize = false;
                    }
                }

                if (typeof params.userState == "number") {
                    if (params.userState == 1) {
                        data.mine = true;
                    } else if (params.userState == 3) {
                        data.mine = false;
                    }
                }

                if (typeof params.status == "number" && params.status >= 0) {
                    data.status = params.status;
                } else {
                    if (Array.isArray(params.statusList) && params.statusList.length > 0) {
                        data.statusList = JSON.stringify(params.statusList);
                    } else {
                        data.status = 0;
                    }
                }

                if (typeof params.showDefault == "boolean") {
                    data.showDefault = params.showDefault;
                }

                if (typeof params.financialType == "number" && params.financialType >= 0) {
                    data.financialType = params.financialType;
                }
            }

            var setting = {
                imageWidth: (params.setting && params.setting.imageWidth ) ?
                    params.setting.imageWidth :
                    __configData.ldisw,

                imageHeight: (params.setting && params.setting.imageHeight ) ?
                    params.setting.imageHeight :
                    __configData.ldish
            };

            __getLeagueInfo(requestUrl, data, setting, callback);
        };

        /**
         * <div style='width: 100%;text-align: right'>دریافت لیگ های دنبال شده توسط کاربر </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["size"] = 10;
         *
         *      service.getLeagueFollowing(reqData, function() {
         *           console.log("getLeagueFollowing method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getLeagueFollowing
         * @public
         *
         * @param {Object} params
         *      <ul>
         *          <li>{Integer} [size=10]</li>
         *          <li>{Integer} [offset=0]</li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONArray} result
         *              <ul>
         *                  <li>{JSONArray} leagues
         *                      <ul>
         *                          <li>{String} id </li>
         *                          <li>{String} enrollUrl</li>
         *                          <li>{Boolean} isMember </li>
         *                          <li>{Boolean} isFollower</li>
         *                          <li>{JSONObject} userPostInfo
         *                              <ul>
         *                                  <li>{Boolean} favorite</li>
         *                                  <li>{Boolean} liked</li>
         *                                  <li>{String} postId</li>
         *                              </ul>
         *                          </li>
         *                          <li>{JSONObject} image
         *                              <ul>
         *                                  <li>{String} id</li>
         *                                  <li>{String} url</li>
         *                                  <li>{Integer} width</li>
         *                                  <li>{Integer} height</li>
         *                              </ul>
         *                          </li>
         *                          <li>{Integer} gameType</li>
         *                          <li>{Integer} playerType</li>
         *                          <li>{Integer} status</li>
         *                          <li>{Integer} financialType</li>
         *                          <li>{Integer} lobbyId</li>
         *                          <li>{Integer} maxPlayers</li>
         *                          <li>{Integer} minNoOfPlayedGames</li>
         *                          <li>{Integer} minPlayers</li>
         *                          <li>{Integer} memberCount</li>
         *                          <li>{Integer} playerNumberType</li>
         *                          <li>{Integer} timestamp</li>
         *                          <li>{String} creator</li>
         *                          <li>{Integer} memberCount</li>
         *                          <li>{Integer} availableCount</li>
         *                          <li>{Integer} discount</li>
         *                          <li>{Integer} numOfComments</li>
         *                          <li>{Integer} numOfFavorites</li>
         *                          <li>{Integer} numOfLikes</li>
         *                          <li>{Integer} type</li>
         *                          <li>{Integer} [endTime]</li>
         *                          <li>{Integer} [startTime]</li>
         *                          <li>{String} rules</li>
         *                          <li>{String} description</li>
         *                          <li>{String} name</li>
         *                          <li>{String} ThreadId</li>
         *                          <li>{String} timelineId</li>
         *                          <li>{Boolean} hasPrize</li>
         *                          <li>{Boolean} quickMatch</li>
         *                          <li>{Boolean} startTypeCapacityComplete</li>
         *                          <li>{Boolean} startTypeFromDate</li>
         *                          <li>{Boolean} startTypePublishDate</li>
         *                          <li>{Boolean} canComment</li>
         *                          <li>{Boolean} canLike</li>
         *                          <li>{Boolean} enable</li>
         *                          <li>{Boolean} hide</li>
         *                          <li>{Double} price</li>
         *                          <li>{JSONArray} attributeValues</li>
         *                          <li>{JSONArray} categoryList</li>
         *                          <li>{JSONObject} business</li>
         *                          <li>{JSONObject} rate</li>
         *                          <li>{JSONArray} games</li>
         *                      </ul>
         *                  </li>
         *                  <li>{Boolean} hasNext</li>
         *                  <li>{Integer} nextOffset</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getLeagueFollowing = function (params, callback) {
            var data = {
                    size : 10,
                    offset : 0
                },
                requestUrl = "leagueFollowing";

            if (typeof params.size == "number" && params.size > 0) {
                data.size = params.size;
            } else {
                data.size = __configData.gldc
            }

            if (typeof params.offset == "number" && params.offset >= 0) {
                data.offset = params.offset;
            } else {
                data.offset = 0;
            }

            var setting = {
                imageWidth: (params.setting && params.setting.imageWidth ) ?
                    params.setting.imageWidth :
                    __configData.ldisw,

                imageHeight: (params.setting && params.setting.imageHeight ) ?
                    params.setting.imageHeight :
                    __configData.ldish
            };

            __getLeagueInfo(requestUrl, data, setting, callback);
        };

        /**
         * <div style='width: 100%;text-align: right'>دریافت لیگ های مرتبط </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["leagueId"]="3";
         *      reqData["size"] = 10;
         *      reqData["type"] = 1;
         *      service.getRelatedLeaguesInfo(reqData, function() {
         *           console.log("getRelatedLeaguesInfo method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getRelatedLeaguesInfo
         * @public
         *
         * @param {Object} params
         *      <ul>
         *          <li>{String} leagueId - شناسه لیگ</li>
         *          <li>{Integer} [size=10]</li>
         *          <li>{Integer} [offset=0]</li>
         *          <li>{Integer} [type] - نوع لیگ
         *              <p>     1 = لیگ هایی که در یک لابی می باشند</p>
         *              <p>     2 = لیگ هایی که سازنده آنها یکی است</p>
         *          </li>
         *          <li> {JSONObject} [setting]
         *              <ul>
         *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر لیگ</li>
         *                  <li>{Integer} [imageHeight] اندازه رزولیشن عمودی تصویر لیگ</li>
         *              </ul>
         *          </li>
         *          <li></li>
         *       </ul>
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{JSONArray} CategoryEquality : $ - لیگ هایی که در یک لابی می باشند</li>
         *                  <li>{JSONArray} CreatorEquality : $ - لیگ هایی که سازنده آنها یکی است
         *                      <ul>
         *                          <li>{String} $.id</li>
         *                          <li>{String} $.enrollUrl</li>
         *                          <li>{Boolean} $.isMember</li>
         *                          <li>{Boolean} $.isFollower</li>
         *                          <li>{JSONObject} $.userPostInfo
         *                              <ul>
         *                                  <li>{Boolean} favorite</li>
         *                                  <li>{Boolean} liked</li>
         *                                  <li>{String} postId</li>
         *                              </ul>
         *                          </li>
         *                          <li>{JSONObject} $.image
         *                              <ul>
         *                                  <li>{String} id</li>
         *                                  <li>{String} url</li>
         *                                  <li>{Integer} width</li>
         *                                  <li>{Integer} height</li>
         *                              </ul>
         *                          </li>
         *                          <li>{Integer} $.gameType</li>
         *                          <li>{Integer} $.playerType</li>
         *                          <li>{Integer} $.status</li>
         *                          <li>{Integer} $.financialType</li>
         *                          <li>{Integer} $.lobbyId</li>
         *                          <li>{Integer} $.maxPlayers</li>
         *                          <li>{Integer} $.minNoOfPlayedGames</li>
         *                          <li>{Integer} $.minPlayers</li>
         *                          <li>{Integer} $.memberCount</li>
         *                          <li>{Integer} $.playerNumberType</li>
         *                          <li>{Integer} $.timestamp</li>
         *                          <li>{String} $.creator</li>
         *                          <li>{Integer} $.memberCount</li>
         *                          <li>{Integer} $.availableCount</li>
         *                          <li>{Integer} $.discount</li>
         *                          <li>{Integer} $.numOfComments</li>
         *                          <li>{Integer} $.numOfFavorites</li>
         *                          <li>{Integer} $.numOfLikes</li>
         *                          <li>{Integer} $.type</li>
         *                          <li>{Integer} [$.endTime]</li>
         *                          <li>{Integer} [$.startTime]</li>
         *                          <li>{String} $.rules</li>
         *                          <li>{String} $.description</li>
         *                          <li>{String} $.name</li>
         *                          <li>{String} $.ThreadId</li>
         *                          <li>{String} $.timelineId</li>
         *                          <li>{Boolean} $.hasPrize</li>
         *                          <li>{Boolean} $.quickMatch</li>
         *                          <li>{Boolean} $.startTypeCapacityComplete</li>
         *                          <li>{Boolean} $.startTypeFromDate</li>
         *                          <li>{Boolean} $.startTypePublishDate</li>
         *                          <li>{Boolean} $.canComment</li>
         *                          <li>{Boolean} $.canLike</li>
         *                          <li>{Boolean} $.enable</li>
         *                          <li>{Boolean} $.hide</li>
         *                          <li>{Double} $.price</li>
         *                          <li>{JSONArray} $.attributeValues</li>
         *                          <li>{JSONArray} $.categoryList</li>
         *                          <li>{JSONObject} $.business</li>
         *                          <li>{JSONObject} $.rate</li>
         *                      </ul>
         *                  </li>
         *                  <li>{Boolean} result.hasNext</li>
         *                  <li>{Integer} result.nextOffset</li>
         *              </ul>
         *          </li>
         *      </ul>
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getRelatedLeaguesInfo = function (params, callback) {
            var data = {},
                requestUrl = "relatedLeague";

            if (params.leagueId) {
                data.leagueId = params.leagueId;
            }

            if (typeof params.size == "number" && params.size > 0) {
                data.size = params.size;
            } else {
                data.size = __configData.gldc
            }

            if (typeof params.offset == "number" && params.offset >= 0) {
                data.offset = params.offset;
            } else {
                data.offset = 0;
            }

            if (params.type) {
                data.type = params.type;
            }

            var setting = {
                imageWidth: (params.setting && params.setting.imageWidth ) ?
                    params.setting.imageWidth :
                    __configData.ldisw,

                imageHeight: (params.setting && params.setting.imageHeight ) ?
                    params.setting.imageHeight :
                    __configData.ldish
            };

            __request(
                requestUrl,
                data,
                function (result) {
                    if (result.HasError) {
                        callback({
                            hasError: result.HasError,
                            errorMessage: result.ErrorMessage,
                            errorCode: result.ErrorCode,
                        });
                    } else {

                        var refactorLeagues = {};

                        var keys = ["CreatorEquality", "CategoryEquality"];
                        for(var k=0;k<keys.length;k++) {
                            var key = keys[k];
                            if(Array.isArray(result.Result[key])) {
                                var leagues = result.Result[key];
                                var refLeagues = [];
                                for (var i = 0; i < leagues.length; i++) {
                                    refLeagues.push(__reformatLeagueObject(leagues[i], setting));
                                }

                                refactorLeagues[key] = refLeagues;
                                var countKeyName = key + "Count";
                                refactorLeagues[countKeyName] = result.Result[countKeyName];
                            }
                        }


                        callback({
                            hasError: false,
                            errorMessage: result.ErrorMessage,
                            errorCode: result.ErrorCode,
                            result: refactorLeagues,
                        });
                    }
                });
        };

        /**
         * <div style='width: 100%;text-align: right'> دریافت لیست لیگ های عضو شده توسط یک کاربر </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["userId"] = "333";
         *
         *      service.getEnrolledLeagues(reqData, function() {
         *           console.log("getEnrolledLeagues method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getEnrolledLeagues
         * @public
         *
         * @param {Object} params
         *      <ul>
         *          <li>{String} [userId] - شناسه کاربر
         *              <p>در صورتی که این فیلد پر شود, لیگ های کاربر مورد نظر برگردانده می شود و در غیر اینصورت کاربر کنونی</p>
         *          </li>
         *          <li>{Integer} [size=20]</li>
         *          <li>{Integer} [offset=0]</li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONArray} result
         *              <ul>
         *                  <li>{JSONArray} leagues
         *                      <ul>
         *                          <li>{String} id </li>
         *                          <li>{String} enrollUrl</li>
         *                          <li>{Boolean} isMember </li>
         *                          <li>{Boolean} isFollower</li>
         *                          <li>{JSONObject} userPostInfo
         *                              <ul>
         *                                  <li>{Boolean} favorite</li>
         *                                  <li>{Boolean} liked</li>
         *                                  <li>{String} postId</li>
         *                              </ul>
         *                          </li>
         *                          <li>{JSONObject} image
         *                              <ul>
         *                                  <li>{String} id</li>
         *                                  <li>{String} url</li>
         *                                  <li>{Integer} width</li>
         *                                  <li>{Integer} height</li>
         *                              </ul>
         *                          </li>
         *                          <li>{Integer} gameType</li>
         *                          <li>{Integer} playerType</li>
         *                          <li>{Integer} status</li>
         *                          <li>{Integer} financialType</li>
         *                          <li>{Integer} lobbyId</li>
         *                          <li>{Integer} maxPlayers</li>
         *                          <li>{Integer} minNoOfPlayedGames</li>
         *                          <li>{Integer} minPlayers</li>
         *                          <li>{Integer} memberCount</li>
         *                          <li>{Integer} playerNumberType</li>
         *                          <li>{Integer} timestamp</li>
         *                          <li>{String} creator</li>
         *                          <li>{Integer} memberCount</li>
         *                          <li>{Integer} availableCount</li>
         *                          <li>{Integer} discount</li>
         *                          <li>{Integer} numOfComments</li>
         *                          <li>{Integer} numOfFavorites</li>
         *                          <li>{Integer} numOfLikes</li>
         *                          <li>{Integer} type</li>
         *                          <li>{Integer} [endTime]</li>
         *                          <li>{Integer} [startTime]</li>
         *                          <li>{String} rules</li>
         *                          <li>{String} description</li>
         *                          <li>{String} name</li>
         *                          <li>{String} ThreadId</li>
         *                          <li>{String} timelineId</li>
         *                          <li>{Boolean} hasPrize</li>
         *                          <li>{Boolean} quickMatch</li>
         *                          <li>{Boolean} startTypeCapacityComplete</li>
         *                          <li>{Boolean} startTypeFromDate</li>
         *                          <li>{Boolean} startTypePublishDate</li>
         *                          <li>{Boolean} canComment</li>
         *                          <li>{Boolean} canLike</li>
         *                          <li>{Boolean} enable</li>
         *                          <li>{Boolean} hide</li>
         *                          <li>{Double} price</li>
         *                          <li>{JSONArray} attributeValues</li>
         *                          <li>{JSONArray} categoryList</li>
         *                          <li>{JSONObject} business</li>
         *                          <li>{JSONObject} rate</li>
         *                          <li>{JSONArray} games</li>
         *                      </ul>
         *                  </li>
         *                  <li>{Boolean} hasNext</li>
         *                  <li>{Integer} nextOffset</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getEnrolledLeagues = function (params, callback) {
            var data = {
                    size : 20,
                    offset : 0
                },
                requestUrl = "enrolledLeagues";

            if (typeof params.size == "number" && params.size > 0) {
                data.size = params.size;
            } else {
                data.size = __configData.gldc
            }

            if (typeof params.offset == "number" && params.offset >= 0) {
                data.offset = params.offset;
            } else {
                data.offset = 0;
            }

            if(params.userId) {
                data.userId = params.userId;
            }

            var setting = {
                imageWidth: (params.setting && params.setting.imageWidth ) ?
                    params.setting.imageWidth :
                    __configData.ldisw,

                imageHeight: (params.setting && params.setting.imageHeight ) ?
                    params.setting.imageHeight :
                    __configData.ldish
            };

            __getLeagueInfo(requestUrl, data, setting, callback);
        };

        /**
         *
         * <div style='width: 100%;text-align: right'> دریافت برترین لیگ ها</div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["type"] = 1;
         *      service.getTopLeaguesInfo(reqData, function() {
     *           console.log("getTopLeaguesInfo method : " + result);
     *      });
         *  </code>
         * </pre>
         * @method getTopLeaguesInfo
         * @public
         *
         *
         * @param  params
         *      <ul>
         *          <li>{Integer} [type]
         *              <p>     1 = برترین های گیم سنتر</p>
         *              <p>     8 = پیشنهاد گیم سنتر</p>
         *          </li>
         *          <li>{Integer} [size=5]</li>
         *          <li>{Integer} [offset=0]</li>
         *          <li>{String} [gameId]</li>
         *          <li>{JSONObject} [setting]
         *              <ul>
         *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر لیگ</li>
         *                  <li>{Integer} [imageHeight] اندازه رزولیشن عمودی تصویر لیگ</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @param  callback
         *      <p>onResult method params is JSONObject that has</p>
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{JSONArray} GcSuggestion : $ - پیشنهاد گیم سنتر</li>
         *                  <li>{JSONArray} GcTop : $ - برترین های گیم سنتر</li>
         *                  <li>{JSONArray} TopFollow : $ - برترین دنبال شده ها</li>
         *                  <li>{JSONArray} TopRate : $ - برترین ها
         *                      <ul>
         *                          <li>{String} $.id</li>
         *                          <li>{String} $.enrollUrl</li>
         *                          <li>{Boolean} $.isMember</li>
         *                          <li>{Boolean} $.isFollower</li>
         *                          <li>{JSONObject} $.userPostInfo
         *                              <ul>
         *                                  <li>{Boolean} favorite</li>
         *                                  <li>{Boolean} liked</li>
         *                                  <li>{String} postId</li>
         *                              </ul>
         *                          </li>
         *                          <li>{JSONObject} $.image
         *                              <ul>
         *                                  <li>{String} id</li>
         *                                  <li>{String} url</li>
         *                                  <li>{Integer} width</li>
         *                                  <li>{Integer} height</li>
         *                              </ul>
         *                          </li>
         *                          <li>{Integer} $.gameType</li>
         *                          <li>{Integer} $.playerType</li>
         *                          <li>{Integer} $.status</li>
         *                          <li>{Integer} $.financialType</li>
         *                          <li>{Integer} $.lobbyId</li>
         *                          <li>{Integer} $.maxPlayers</li>
         *                          <li>{Integer} $.minNoOfPlayedGames</li>
         *                          <li>{Integer} $.minPlayers</li>
         *                          <li>{Integer} $.memberCount</li>
         *                          <li>{Integer} $.playerNumberType</li>
         *                          <li>{Integer} $.timestamp</li>
         *                          <li>{String} $.creator</li>
         *                          <li>{Integer} $.memberCount</li>
         *                          <li>{Integer} $.availableCount</li>
         *                          <li>{Integer} $.discount</li>
         *                          <li>{Integer} $.numOfComments</li>
         *                          <li>{Integer} $.numOfFavorites</li>
         *                          <li>{Integer} $.numOfLikes</li>
         *                          <li>{Integer} $.type</li>
         *                          <li>{Integer} [$.endTime]</li>
         *                          <li>{Integer} [$.startTime]</li>
         *                          <li>{String} $.rules</li>
         *                          <li>{String} $.description</li>
         *                          <li>{String} $.name</li>
         *                          <li>{String} $.ThreadId</li>
         *                          <li>{String} $.timelineId</li>
         *                          <li>{Boolean} $.hasPrize</li>
         *                          <li>{Boolean} $.quickMatch</li>
         *                          <li>{Boolean} $.startTypeCapacityComplete</li>
         *                          <li>{Boolean} $.startTypeFromDate</li>
         *                          <li>{Boolean} $.startTypePublishDate</li>
         *                          <li>{Boolean} $.canComment</li>
         *                          <li>{Boolean} $.canLike</li>
         *                          <li>{Boolean} $.enable</li>
         *                          <li>{Boolean} $.hide</li>
         *                          <li>{Double} $.price</li>
         *                          <li>{JSONArray} $.attributeValues</li>
         *                          <li>{JSONArray} $.categoryList</li>
         *                          <li>{JSONObject} $.business</li>
         *                          <li>{JSONObject} $.rate</li>
         *                      </ul>
         *                  </li>
         *                  <li>{Boolean} hasNext</li>
         *                  <li>{Integer} nextOffset</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getTopLeaguesInfo = function (params, callback) {
            var data = {},
                requestUrl = "topLeague";

            if (params.gameId) {
                data.gameId = params.gameId;
            }

            if (typeof params.size == "number" && params.size > 0) {
                data.size = params.size;
            } else {
                data.size = __configData.gldc
            }

            if (typeof params.offset == "number" && params.offset >= 0) {
                data.offset = params.offset;
            } else {
                data.offset = 0;
            }

            if (params.type) {
                data.type = params.type;
            }

            var setting = {
                imageWidth: (params.setting && params.setting.imageWidth ) ?
                    params.setting.imageWidth :
                    __configData.ldisw,

                imageHeight: (params.setting && params.setting.imageHeight ) ?
                    params.setting.imageHeight :
                    __configData.ldish
            };

            // __getLeagueInfo(requestUrl, data, setting, callback);


            __request(
                requestUrl,
                data,
                function (result) {
                    if (result.HasError) {
                        callback({
                            hasError: result.HasError,
                            errorMessage: result.ErrorMessage,
                            errorCode: result.ErrorCode,
                        });
                    } else {

                        var refactorLeagues = {};

                        var keys = ["GcSuggestion", "GcTop", "TopFollow", "TopRate"];
                        for(var k=0;k<keys.length;k++) {
                            var key = keys[k];
                            if(Array.isArray(result.Result[key])) {
                                var leagues = result.Result[key];
                                var refLeagues = [];
                                for (var i = 0; i < leagues.length; i++) {
                                    refLeagues.push(__reformatLeagueObject(leagues[i], setting));
                                }

                                refactorLeagues[key] = refLeagues;
                                var countKeyName = key + "Count";
                                refactorLeagues[countKeyName] = result.Result[countKeyName];
                            }
                        }


                        callback({
                            hasError: false,
                            result: refactorLeagues
                        });
                    }
                });
        };

        /**
         *
         * <div style='width: 100%;text-align: right'> دریافت برترین باز ها </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["type"] = 1;
         *      service.getTopGamesInfo(reqData, function() {
         *           console.log("getTopGamesInfo method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getTopGamesInfo
         * @public
         *
         *
         * @param  params
         *      <ul>
         *          <li>{Integer} [type]
         *              <p>     1 = برترین های گیم سنتر</p>
         *              <p>     2 = برترین بازی ها</p>
         *              <p>     4 =برترین دنبال شده ها</p>
         *              <p>     8 = پیشنهاد گیم سنتر</p>
         *          </li>
         *          <li>{Integer} [size=5]</li>
         *          <li>{Integer} [offset=0]</li>
         *          <li>{JSONObject} [setting]
         *              <ul>
         *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر بازی</li>
         *                  <li>{Integer} [imageHeight] اندازه رزولیشن عمودی تصویر بازی</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @param  res
         *      <p>onResult method params is JSONObject that has</p>
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{JSONArray} GcSuggestion : $ - پیشنهاد گیم سنتر</li>
         *                  <li>{Integer} GcSuggestionCount</li>
         *                  <li>{JSONArray} GcTop : $ - برترین های گیم سنتر</li>
         *                  <li>{JSONArray} GcTopCount</li>
         *                  <li>{JSONArray} TopFollow : $ - برترین دنبال شده ها</li>
         *                  <li>{JSONArray} TopFollowCount</li>
         *                  <li>{JSONArray} TopRateCount
         *                  <li>{JSONArray} TopRate : $ - برترین ها
         *                      <ul>
         *                          <li>{String} $.id</li>
         *                          <li>{String} $.name</li>
         *                          <li>{String} $.description</li>
         *                          <li>{String} $.creator</li>
         *                          <li>{String} $.physicalUrl</li>
         *                          <li>{String} $.timelineId</li>
         *                          <li>{String} $.packageName</li>
         *                          <li>{String} $.mobileVersion</li>
         *                          <li>{String} $.mobileVersionCode</li>
         *                          <li>{String} $.supporterId</li>
         *                          <li>{String} $.defaultLeagueId</li>
         *                          <li>{String} $.downloadLink</li>
         *                          <li>{String} $.gamePlayDescription</li>
         *                          <li>{String} $.score</li>
         *                          <li>{String} $.webVersion</li>
         *                          <li>{JSONArray} $.attributeValues</li>
         *                          <li>{JSONArray} $.categoryList</li>
         *                          <li>{JSONObject} $.business</li>
         *                          <li>{JSONObject} $.userPostInfo
         *                              <ul>
         *                                  <li>{Boolean} favorite</li>
         *                                  <li>{Boolean} liked</li>
         *                                  <li>{Integer} postId</li>
         *                              </ul>
         *                          </li>
         *                          <li>{JSONObject} $.rate
         *                              <ul>
         *                                  <li>{Integer} rate</li>
         *                                  <li>{Integer} rateCount</li>
         *                              </ul>
         *                          </li>
         *                          <li>{JSONObject} $.image
         *                              <ul>
         *                                  <li>{String}  id</li>
         *                                  <li>{String}  url</li>
         *                                  <li>{String}  hashCode</li>
         *                                  <li>{Integer} width</li>
         *                                  <li>{Integer} height</li>
         *                              </ul>
         *                          </li>
         *                          <li>{Integer} $.playerNumbersType</li>
         *                          <li>{Integer} $.platformType</li>
         *                          <li>{Integer} $.availableCount</li>
         *                          <li>{Integer} $.discount</li>
         *                          <li>{Integer} $.numOfComments</li>
         *                          <li>{Integer} $.numOfFavorites</li>
         *                          <li>{Integer} $.numOfLikes</li>
         *                          <li>{Boolean} $.canComment</li>
         *                          <li>{Boolean} $.canLike</li>
         *                          <li>{Boolean} $.enable</li>
         *                          <li>{Boolean} $.hide</li>
         *                          <li>{Double} $.latitude</li>
         *                          <li>{Double} $.longitude</li>
         *                          <li>{Double} $.publishedDate</li>
         *                          <li>{Double} $.price</li>
         *                          <li>{Double} $.timestamp</li>
         *                      </ul>
         *                  </li>
         *              </ul>
         *          </li>
         *      </ul>
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getTopGamesInfo = function (params, callback) {
            var data = {};


            if (typeof params.size == "number" && params.size > 0) {
                data.size = params.size;
            } else {
                data.size = __configData.gldc
            }

            if (typeof params.offset == "number" && params.offset >= 0) {
                data.offset = params.offset;
            } else {
                data.offset = 0;
            }

            if (params.type) {
                data.type = params.type;
            }

            var setting = {
                imageWidth: (params.setting && params.setting.imageWidth ) ?
                    params.setting.imageWidth :
                    __configData.ldisw,

                imageHeight: (params.setting && params.setting.imageHeight ) ?
                    params.setting.imageHeight :
                    __configData.ldish
            };

            // __getLeagueInfo(requestUrl, data, setting, callback);


            __request(
                "topGame",
                data,
                function (result) {
                    if (result.HasError) {
                        callback({
                            hasError: result.HasError,
                            errorMessage: result.ErrorMessage,
                            errorCode: result.ErrorCode,
                        });
                    } else {

                        var refactorGames = {};

                        var keys = ["GcSuggestion", "GcTop", "TopFollow", "TopRate"];
                        for(var k=0;k<keys.length;k++) {
                            var key = keys[k];
                            if(Array.isArray(result.Result[key])) {
                                var leagues = result.Result[key];
                                var refLeagues = [];
                                for (var i = 0; i < leagues.length; i++) {
                                    refLeagues.push(__reformatGameObject(leagues[i], setting));
                                }

                                refactorGames[key] = refLeagues;
                                var countKeyName = key + "Count";
                                refactorGames[countKeyName] = result.Result[countKeyName];
                            }
                        }


                        callback({
                            hasError: false,
                            errorMessage : "",
                            errorCode : 0,
                            result: refactorGames
                        });
                    }
                });
        };


        /**
         * <div style='width: 100%;text-align: right'> دریافت بازی های مرتبط </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["gameId"]="3";
         *      reqData["size"] = 10;
         *      reqData["type"] = 1;
         *      service.getRelatedGamesInfo(reqData, function() {
         *           console.log("getRelatedGamesInfo method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getRelatedGamesInfo
         * @public
         *
         * @param {Object} params
         *      <ul>
         *          <li>{String} gameId شناسه بازی</li>
         *          <li>{Integer} [type]
         *              <p>     1 = بازی هایی که در یک لابی می باشند</p>
         *              <p>     2 = بازی هایی که سازنده آنها یکی است</p>
         *          </li>
         *          <li>{Integer} [size=30]</li>
         *          <li>{Integer} [offset=0]</li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>    {Boolean} hasNext</li>
         *                  <li>    {Integer} nextOffset</li>
         *                  <li>    {JSONArray} CategoryEquality : $ - بازی هایی که در یک لابی می باشند</li>
         *                  <li>    {JSONArray} CreatorEquality : $ - بازی هایی که سازنده آنها یکی است
         *                      <ul>
         *                          <li>{String} id</li>
         *                          <li>{String} name</li>
         *                          <li>{String} description</li>
         *                          <li>{String} creator</li>
         *                          <li>{String} physicalUrl</li>
         *                          <li>{String} timelineId</li>
         *                          <li>{String} packageName</li>
         *                          <li>{String} mobileVersion</li>
         *                          <li>{String} mobileVersionCode</li>
         *                          <li>{String} supporterId</li>
         *                          <li>{String} defaultLeagueId</li>
         *                          <li>{String} downloadLink</li>
         *                          <li>{String} gamePlayDescription</li>
         *                          <li>{String} score</li>
         *                          <li>{String} webVersion</li>
         *                          <li>{JSONArray} attributeValues</li>
         *                          <li>{JSONArray} categoryList</li>
         *                          <li>{JSONObject} business</li>
         *                          <li>{JSONObject} userPostInfo
         *                              <ul>
         *                                  <li>{Boolean} favorite</li>
         *                                  <li>{Boolean} liked</li>
         *                                  <li>{Integer} postId</li>
         *                              </ul>
         *                          </li>
         *                          <li>{JSONObject} rate
         *                              <ul>
         *                                  <li>{Integer} rate</li>
         *                                  <li>{Integer} rateCount</li>
         *                              </ul>
         *                          </li>
         *                          <li>{JSONObject} image
         *                              <ul>
         *                                  <li>{String} id</li>
         *                                  <li>{String} url</li>
         *                                  <li>{String} hashCode</li>
         *                                  <li>{Integer} width</li>
         *                                  <li>{Integer} height</li>
         *                              </ul>
         *                          </li>
         *                          <li>{Integer} playerNumbersType</li>
         *                          <li>{Integer} platformType</li>
         *                          <li>{Integer} availableCount</li>
         *                          <li>{Integer} discount</li>
         *                          <li>{Integer} numOfComments</li>
         *                          <li>{Integer} numOfFavorites</li>
         *                          <li>{Integer} numOfLikes</li>
         *                          <li>{Boolean} canComment</li>
         *                          <li>{Boolean} canLike</li>
         *                          <li>{Boolean} enable</li>
         *                          <li>{Boolean} hide</li>
         *                          <li>{Double} latitude</li>
         *                          <li>{Double} longitude</li>
         *                          <li>{Double} publishedDate</li>
         *                          <li>{Double} price</li>
         *                          <li>{Double} timestamp</li>
         *                      </ul>
         *                  </li>
         *               </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getRelatedGamesInfo = function (params, callback) {
            var requestData = {};

            if (params.gameId) {
                requestData.gameId = params.gameId;
            }

            if (typeof params.size == "number" && params.size > 0) {
                requestData.size = params.size;
            } else {
                requestData.size = __configData.gldc
            }

            if (typeof params.offset == "number" && params.offset >= 0) {
                requestData.offset = params.offset;
            } else {
                requestData.offset = 0;
            }

            if (params.type) {
                requestData.type = params.type;
            }


            __request(
                "relatedGame",
                requestData,
                function (result) {
                    var returnData = {
                        hasError: result.HasError,
                        errorMessage: result.ErrorMessage,
                        errorCode: result.ErrorCode,
                    };
                    if (!result.HasError) {


                        var allInfo = result.Result;
                        var refResultData = {};

                        if (allInfo) {
                            for(var name in allInfo) {
                                var games = allInfo[name];
                                if(!games) continue;

                                var resGamesData = [];
                                for (var i = 0; i < games.length; i++) {
                                    var gameData = games[i];
                                    var refData = __reformatGameObject(gameData);

                                    if (__games[gameData.entityId]) {
                                        __games[gameData.entityId].info = refData;
                                    }

                                    resGamesData.push(refData);
                                }

                                refResultData[name] = resGamesData;
                            }

                        }

                        refResultData.nextOffset = (requestData.offset += resGamesData.length);
                        refResultData.hasNext = requestData.size == resGamesData.length;
                        returnData.result = refResultData;

                    }

                    callback(returnData);
                });
        };

        /**
         *
         * <div style='width: 100%;text-align: right'> دریافت آخرین لیگ ها</div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["size"] = 10;
         *      service.getLatestLeaguesInfo(reqData, function() {
     *           console.log("getLatestLeaguesInfo method : " + result);
     *      });
         *  </code>
         * </pre>
         * @method getLatestLeaguesInfo
         * @public
         * @param  params
         *      <ul>
         *          <li>{Integer} [size=10]</li>
         *          <li>{Integer} [offset=0]</li>
         *          <li> {JSONObject} [setting]
         *              <ul>
         *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر لیگ</li>
         *                  <li>{Integer} [imageHeight] اندازه رزولیشن عمودی تصویر لیگ</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @param  callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{JSONArray} leagues
         *                      <ul>
         *                          <li>{String} id</li>
         *                          <li>{String} enrollUrl</li>
         *                          <li>{Boolean} isMember</li>
         *                          <li>{Boolean} isFollower</li>
         *                          <li>{JSONObject} $.userPostInfo
         *                              <ul>
         *                                  <li>{Boolean} favorite</li>
         *                                  <li>{Boolean} liked</li>
         *                                  <li>{String} postId</li>
         *                              </ul>
         *                          </li>
         *                          <li>{JSONObject} $.image
         *                              <ul>
         *                                  <li>{String} id</li>
         *                                  <li>{String} url</li>
         *                                  <li>{Integer} width</li>
         *                                  <li>{Integer} height</li>
         *                              </ul>
         *                          </li>
         *                          <li>{Integer} gameType</li>
         *                          <li>{Integer} playerType</li>
         *                          <li>{Integer} status</li>
         *                          <li>{Integer} financialType</li>
         *                          <li>{Integer} lobbyId</li>
         *                          <li>{Integer} maxPlayers</li>
         *                          <li>{Integer} minNoOfPlayedGames</li>
         *                          <li>{Integer} minPlayers</li>
         *                          <li>{Integer} memberCount</li>
         *                          <li>{Integer} playerNumberType</li>
         *                          <li>{Integer} timestamp</li>
         *                          <li>{String} creator</li>
         *                          <li>{Integer} memberCount</li>
         *                          <li>{Integer} availableCount</li>
         *                          <li>{Integer} discount</li>
         *                          <li>{Integer} numOfComments</li>
         *                          <li>{Integer} numOfFavorites</li>
         *                          <li>{Integer} numOfLikes</li>
         *                          <li>{Integer} type</li>
         *                          <li>{Integer} [endTime]</li>
         *                          <li>{Integer} [startTime]</li>
         *                          <li>{String} rules</li>
         *                          <li>{String} description</li>
         *                          <li>{String} name</li>
         *                          <li>{String} ThreadId</li>
         *                          <li>{String} timelineId</li>
         *                          <li>{Boolean} hasPrize</li>
         *                          <li>{Boolean} quickMatch</li>
         *                          <li>{Boolean} startTypeCapacityComplete</li>
         *                          <li>{Boolean} startTypeFromDate</li>
         *                          <li>{Boolean} startTypePublishDate</li>
         *                          <li>{Boolean} canComment</li>
         *                          <li>{Boolean} canLike</li>
         *                          <li>{Boolean} enable</li>
         *                          <li>{Boolean} hide</li>
         *                          <li>{Double} price</li>
         *                          <li>{JSONArray} attributeValues</li>
         *                          <li>{JSONArray} categoryList</li>
         *                          <li>{JSONObject} business</li>
         *                          <li>{JSONObject} rate</li>
         *                      </ul>
         *                  </li>
         *                  <li>{Boolean} hasNext</li>
         *                  <li>{Integer} nextOffset</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getLatestLeaguesInfo = function (params, callback) {
            var data = {},
                requestUrl = "latestLeague";

            if (params.gameId) {
                data.gameId = params.gameId;
            }

            if (typeof params.size == "number" && params.size > 0) {
                data.size = params.size;
            } else {
                data.size = __configData.gldc
            }

            if (typeof params.offset == "number" && params.offset >= 0) {
                data.offset = params.offset;
            } else {
                data.offset = 0;
            }


            var setting = {
                imageWidth: (params.setting && params.setting.imageWidth ) ?
                    params.setting.imageWidth :
                    __configData.ldisw,

                imageHeight: (params.setting && params.setting.imageHeight ) ?
                    params.setting.imageHeight :
                    __configData.ldish
            };

            __getLeagueInfo(requestUrl, data, setting, callback);
        };

        /**
         * <div style='width: 100%;text-align: right'> مصرف آیتم کاربر </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *     varreqData = {};
         *     reqData["itemId"]= "1061";
         *     reqData["count"]=10;
         *     service.consumeItemRequest(reqData, function() {
     *             console.log("consumeItem method : " + result);
     *     });
         *  </code>
         * </pre>
         * @method consumeItemRequest
         * @public
         *
         * @param {Object} params
         *      <ul>
         *          <li>{String} itemId - شناسه آیتم</li>
         *          <li>{Integer} count - تعداد مصرف شده</li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.consumeItemRequest = __consumeItem;

        /**
         * <div style='width: 100%;text-align: right'>دریافت اطلاعات پروفایل کاربر </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["userId"]= "5";
         *      service.getUserProfile(reqData, function() {
     *              console.log("getUserProfile method : " + result);
     *      });
         *  </code>
         * </pre>
         * @method getUserProfile
         * @protected
         *
         * @param {Object} [params]
         *      <ul>
         *          <li>{String} [userId] - در صورت پر نکردن این فیلد , اطلاعات خود کاربر برگردانده می شود</li>
         *          <li>{Boolean} [refetch=false] - دریافت اطلاعات بروزرسانی شده</li>
         *          <li>{JSONObject} [setting]
         *              <ul>
         *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر کاربر</li>
         *                  <li>{Integer} [imageHeight] اندازه رزولیشن عمودی تصویر کاربر</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{Double} birthDate</li>
         *                  <li>{Double} joinDate</li>
         *                  <li>{Double} score</li>
         *                  <li>{Double} sheba</li>
         *                  <li>{String} [cellphoneNumber]</li>
         *                  <li>{String} [email]</li>
         *                  <li>{String} [firstName]</li>
         *                  <li>{String} [lastName]</li>
         *                  <li>{String} [name]</li>
         *                  <li>{String} nickName</li>
         *                  <li>{String} [gender]</li>
         *                  <li>{Integer} followingCount</li>
         *                  <li>{JSONObject} [image]
         *                      <ul>
         *                          <li>{String}  id</li>
         *                          <li>{String}  url</li>
         *                          <li>{Integer} width</li>
         *                          <li>{Integer} height</li>
         *                      </ul>
         *                  </li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getUserProfile = function (params, callback) {
            if (typeof callback != "function") {
                throw new ServiceException("callback is not defined");
            }

            var requestData = {};

            if(params){
                if (params.userId) {
                    requestData.userId = params.userId;
                }

                if (params.refetch) {
                    requestData.refetch = params.refetch;
                }

                if(params.token) {
                    requestData.token = params.token;

                }

                if(typeof params.tokenIssuer === "number") {
                    requestData.tokenIssuer = params.tokenIssuer;
                }
            }


            __request(
                "getUserProfile",
                requestData,
                function (result) {
                    var returnData = {
                        hasError: result.HasError,
                        errorMessage: result.ErrorMessage,
                        errorCode: result.ErrorCode,
                    };
                    if (!result.HasError) {
                        returnData.result = result.Result;

                        var gender = result.Result.gender;
                        if (gender) {
                            if (gender == "مرد") {
                                returnData.result.gender = "MAN_GENDER";
                            } else {
                                returnData.result.gender = "WOMAN_GENDER";
                            }
                        }

                        if (result.Result.imageInfo) {
                            returnData.result.image = result.Result.imageInfo;
                            delete  returnData.result.imageInfo;
                        }

                        if (result.Result.profileImage) {
                            returnData.result.imageUrl = result.Result.profileImage;
                            delete  returnData.result.profileImage;
                        }
                    }
                    callback(returnData);
                });
        };

        /**
         * <div style='width: 100%;text-align: right'> دریافت آیتم های کاربر </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["gameId"]="3";
         *      service.getUserItems(reqData, function() {
         *          console.log("getUserItems method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getUserItems
         * @public
         *
         * @param {Object} params
         *      <ul>
         *          <li>{String} gameId - شناسه بازی</li>
         *          <li>{Integer} [size=5]</li>
         *          <li>{Integer} [offset=0]</li>
         *          <li>{String} [itemId] - شناسه آیتم</li>
         *          <li>{JSONObject} [setting]
         *              <ul>
         *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر آیتم</li>
         *                  <li>{Integer} [imageHeight]  رزولیشن عمودی تصویر آیتم</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{JSONArray} items  - Array Of JSONObject that contain :
         *                      <ul>
         *                          <li>{String} id</li>
         *                          <li>{Integer} count</li>
         *                          <li>{JSONObject} item</li>
         *                      </ul>
         *                  </li>
         *                  <li>{Boolean} hasNext</li>
         *                  <li>{Integer} nextOffset</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getUserItems = __getUserItem;
        __self.getUserItem = __getUserItem;

        /**
         * <div style='width: 100%;text-align: right'> دریافت آیتم های مربوط به گیم سنتر </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["gameId"]= "3";
         *      service.getUserGameCenterItem(reqData, function() {
         *              console.log("getUserGameCenterItem method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getUserGameCenterItem
         * @public
         *
         * @param {Object} params
         *      <ul>
         *          <li>{String} gameId - شناسه بازی</li>
         *          <li>{Integer} [size=5]</li>
         *          <li>{Integer} [offset=0]</li>
         *          <li>{String} [itemId] - شناسه آیتم
         *              <p> در صورت پر کردن این فیلد , آیتم مشخص شده باز گردانده می شود و در غیر اینصورت کلیه آیتم های آن بازی</p>
         *          </li>
         *          <li>{JSONObject} [setting]
         *              <ul>
         *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر آیتم</li>
         *                  <li>{Integer} [imageHeight]  رزولیشن عمودی تصویر آیتم</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{JSONArray} packs - Array Of JSONObject that contain :
         *                      <ul>
         *                          <li>{String} id</li>
         *                          <li>{String} name</li>
         *                          <li>{String} description</li>
         *                          <li>{Boolean} visible</li>
         *                          <li>{Boolean} enable</li>
         *                          <li>{Boolean} allowedTimesToBuy</li>
         *                          <li>{JSONObject} [image]
         *                              <ul>
         *                                  <li>{String} id</li>
         *                                  <li>{String} url</li>
         *                                  <li>{Integer} width</li>
         *                                  <li>{Integer} height</li>
         *                              </ul>
         *                          </li>
         *                      </ul>
         *                  </li>
         *                  <li>{Boolean} hasNext</li>
         *                  <li>{Integer} nextOffset</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getUserGameCenterItem = __getUserGameCenterItem;

        /**
         * <div style='width: 100%;text-align: right'>خرید یک پک </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["packId"]= "1089";
         *      service.buyInAppPurchasePackRequest(reqData, function() {
         *              console.log("buyInAppPurchasePackRequest method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method buyInAppPurchasePack
         * @protected
         *
         * @param {Object} params
         *      <ul>
         *          <li>{String} packId - شناسه پک</li>
         *          <li>{String} [voucherHash] - کد تخفیف</li>
         *          <li>{String} [count=1] - تعداد پگ برای خرید</li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{String} id</li>
         *                  <li>{String} Name</li>
         *                  <li>{Double} packs.price</li>
         *                  <li>{String} packs.priceText</li>
         *                  <li>{String} packs.priceUnit</li>
         *                  <li>{String} description</li>
         *                  <li>{Integer} count</li>
         *                  <li>{Double} price</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.buyInAppPurchasePackRequest = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params is not exist");
            }

            if (!params.packId) {
                throw new ServiceException("packId key is not exist");
            }

            var data = {
                packId: params.packId
            };

            if (typeof params.voucherHash == "string" && params.voucherHash.length > 0) {
                data.voucherHash = params.voucherHash;
            }

            if (typeof params.count == "number" && params.count > 0) {
                data.count = params.count;
            }

            __request("buyInAppPurchasePack", data, function (result) {

                var retData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage,
                    errorCode: result.ErrorCode
                };

                if (result.HasError) {
                    if (result.ErrorCode == TisNetworkClass.ErroCodes.NOT_ACCESS) {
                        retData.errorMessage = __dic.SIGNUP_FOR_USE_SERVICE[__lang]
                    }
                } else {
                    __fireEvent("buyPack", __reformatUserItem(result.Result));

                    // __self.getCredit(function (res) {
                    //     if (!res.hasError) {
                    //         var data = res.result;
                    //
                    //         var credit = data.credit;
                    //         res = {
                    //             credit: credit,
                    //             creditText: credit + "&nbsp" + __configData.cu,
                    //             unitText: __configData.cu
                    //         };
                    //
                    //         __fireEvent("creditChange", res);
                    //     }
                    // });
                }


                if (typeof callback) {
                    callback(retData);
                }


            });
        };

        __self.getInAppPurchaseState = function () {
            return __inAppPurchase;
        };

        /**
         * <div style='width: 100%;text-align: right'>ورود به حساب کاربری</div>
         * <pre>
         *     <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *        var reqData = {};
         *        reqData["userName"]= "cellphoneNumber";//cellphone Number or nick name
         *        reqData["code"]= "code";// code or password
         *        service.loginRequest(reqData, function() {
         *                System.out.println("loginRequest method -- onResult " + result);
         *        });
         *  </code>
         * </pre>
         * @method loginRequest
         * @public
         *
         * @param {Object} params
         *      <ul>
         *           <li>{String} userName   شماره تماس و یا نام مستعار کاربر
         *           </li>
         *           <li>{String} code رمز عبور
         *           </li>
         *            <li>{JSONObject} [setting]
         *               <ul>
         *                   <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر کاربر</li>
         *                   <li>{Integer} [imageHeight] اندازه رزولیشن عمودی تصویر کاربر</li>
         *               </ul>
         *            </li>
         *      </ul>
         *
         * @param {Function} callback
         *  <ul>
         *      <li>{Boolean} hasError</li>
         *      <li>{String} errorMessage</li>
         *      <li>{Integer} errorCode</li>
         *      <li> {JSONObject} result
         *          <ul>
         *              <li>{String} id</li>
         *              <li>{String} name</li>
         *              <li>{String} token</li>
         *              <li>{JSONObject} [image]
         *                 <ul>
         *                    <li>{String} id</li>
         *                    <li>{String} url</li>
         *                    <li>{Integer} width</li>
         *                    <li>{Integer} height</li>
         *                 </ul>
         *              </li>
         *          </ul>
         *      </li>
         *  </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.loginRequest = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params is not exist");
            }
            if (typeof params.userName != "string") {
                throw new ServiceException("userName key  is not exist");
            }

            if (!params.code) {
                throw new ServiceException("code key is not exist");
            }

            var requestData = {
                code: params.code
            };

            var tel = TisUtil.toEnDigit(params.userName.replace(/\s+/g, ''));

            if (TisUtil.isCellphoneNumber(tel)) {
                requestData.cellphoneNumber = tel;
            } else {
                requestData.nickName = params.userName;
            }


            if (__userData.peerId) {
                __syncPeerWithToken = true;
                requestData.peerId = __userData.peerId;
            }

            if (__userData.deviceId) {
                requestData.deviceId = __userData.deviceId;
            }
            __request("login", requestData, function (result) {
                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage,
                    loginState: false
                };
                if (!result.HasError) {
                    if (result.Result) {
                        returnData.loginState = true;
                        var setting = {
                            sessionStore: false,
                            storageStore: false
                        };

                        if (params.setting) {
                            if (params.setting.sessionStore) {
                                setting.sessionStore = params.setting.sessionStore;
                            }
                            if (params.setting.storageStore) {
                                setting.storageStore = params.setting.storageStore;
                            }
                        }

                        var retResult = {
                            name: result.Result.Name,
                            token: result.Result.Token,
                            id: result.Result.UserID
                        };

                        var image;
                        if (result.Result.Image && result.Result.Image.id) {
                            image = {
                                id: result.Result.Image.id,
                                hashCode: result.Result.Image.hashCode,
                                width: result.Result.Image.width,
                                height: result.Result.Image.height,
                                // url: __generateImageSrc(result.Result.Image)
                            };
                            retResult.image = {
                                id: image.id,
                                width: image.width,
                                height: image.height,
                                url: image.url,
                                hashCode: image.hashCode
                            };

                        }
                        returnData.result = retResult;
                        __loginAction({
                            name: result.Result.Name,
                            token: result.Result.Token,
                            id: result.Result.UserID,
                            image: image
                            //id: result.Result.CustomerID
                        }, setting);
                        __checkPeerAndSocketSync();
                    }
                }

                if (typeof callback == "function") {
                    callback(returnData);
                }

            });
        };

        /**
         * <div style='width: 100%;text-align: right'> ثبت نام</div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *        var reqData = {};
         *        reqData["cellphoneNumber"] = "cellphoneNumber";
         *        service.signupRequest(reqData,function() {
         *                console.log("signupRequest method : " + result);
         *        });
         *  </code>
         * </pre>
         * @method signupRequest
         * @protected
         *
         * @param {Object} params
         *      <ul>
         *           <li>{String} cellphoneNumber شماره موبایل</li>
         *           <li>{Boolean}[resend=false]</li>
         *      </ul>
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{Boolean} hasProfile تعیین می کند که آیا کاربر قبلا در سامانه ثبت نام کرده است یا خیر</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.signupRequest = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params is not exist");
            }


            if (!params.cellphoneNumber) {
                throw new ServiceException("cellphoneNumber key  is not exist");
            }

            params.isRegistering = true;
            if (typeof  params.resend == "boolean") {
                params.isRegistering = !params.resend;
            }

            if (__userData.deviceId) {
                params.deviceId = __userData.deviceId;
            }

            __request("signup", params, function (result) {
                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage,
                    errorCode: result.ErrorCode,
                    result: {
                        hasProfile: (typeof result.Result == "boolean") ? result.Result : false
                    }
                };

                if (typeof callback == "function") {
                    callback(returnData);
                }
            });
        };

        /**
         * <div style='width: 100%;text-align: right'> فعال سازی کد ارسالی به کاربر </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *       var reqData = {};
         *       reqData["cellphoneNumber"]= "cellphoneNumber";
         *       reqData["code"] "code";
         *       service.verifyRequest(reqData, function() {
         *               console.log("verifyRequest RESULT : " + result);
         *       });
         *  </code>
         * </pre>
         * @method verifyRequest
         * @public
         *
         * @param {Object} params
         *      <ul>
         *          <li>{String} cellphoneNumber شماره موبایل</li>
         *          <li>{String} code کد ارسالی</li>
         *          <li>{String} newCode رمز</li>
         *          <li> {JSONObject} [setting]
         *              <ul>
         *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر کاربر</li>
         *                  <li>{Integer} [imageHeight] اندازه رزولیشن عمودی تصویر کاربر</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{String} id</li>
         *                  <li>{String} name</li>
         *                  <li>{String} token</li>
         *                  <li>{JSONObject} [image]
         *                      <ul>
         *                          <li>{String} id</li>
         *                          <li>{String} url</li>
         *                          <li>{Integer} width</li>
         *                          <li>{Integer} height</li>
         *                      </ul>
         *                  </li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.verifyRequest = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params is not exist");
            }

            if (!params.cellphoneNumber) {
                throw new ServiceException("cellphoneNumber key  is not exist");
            }

            if (!params.code) {
                throw new ServiceException("code key is not exist");
            }

            if (__userData.peerId) {
                params.peerId = __userData.peerId;
            }

            if (__userData.deviceId) {
                params.deviceId = __userData.deviceId;
            }

            __request("verify", params, function (result) {

                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage,
                    errorCode: result.ErrorCode,
                    loginState: false
                };

                if (!result.HasError) {


                    var setting = {
                        sessionStore: false,
                        storageStore: false
                    };

                    if (params.setting) {
                        if (params.setting.sessionStore) {
                            setting.sessionStore = params.setting.sessionStore;
                        }
                        if (params.setting.storageStore) {
                            setting.storageStore = params.setting.storageStore;
                        }
                    }

                    if (result.Result) {
                        returnData.loginState = true;

                        var retResult = {
                            name: result.Result.Name,
                            token: result.Result.Token,
                            id: result.Result.UserID
                        };

                        var image;
                        if (result.Result.Image && result.Result.Image.id) {
                            image = {
                                id: result.Result.Image.id,
                                width: result.Result.Image.width,
                                height: result.Result.Image.height,
                                hashCode: result.Result.Image.hashCode
                            };
                            retResult.image = {
                                id: image.id,
                                width: image.width,
                                height: image.height,
                                url: image.url,
                                hashCode: image.hashCode
                            };
                            returnData.result = retResult;
                        }

                        __loginAction({
                            name: result.Result.Name,
                            token: result.Result.Token,
                            id: result.Result.UserID,
                            image: image
                            //id : result.Result.CustomerID
                        }, setting);
                    }

                }

                if (typeof callback == "function") {
                    callback(returnData);
                }

            });

        };

        /**
         * <div style='width: 100%;text-align: right'> فعال سازی به همراه ثبت اطلاعات کاربر </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var  reqData = {};
         *      reqData["cellphoneNumber"] = "cellphoneNumber";
         *      reqData["code"] = "code";
         *      reqData["nickName"] = "nickName";
         *      service.verifyWithCompleteProfileRequest(reqData, function() {
         *              console.log("verifyWithCompleteProfileRequest method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method verifyWithCompleteProfileRequest
         * @public
         *
         * @param {Object} params
         *      <ul>
         *          <li>{String} cellphoneNumber شماره موبایل</li>
         *          <li>{String} code کد ارسالی</li>
         *          <li>{String} [newCode] رمز عبور کاربر</li>
         *          <li>{String} nickName نام مستعار</li>
         *          <li> {JSONObject} [setting]
         *              <ul>
         *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر کاربر</li>
         *                  <li>{Integer} [imageHeight] اندازه رزولیشن عمودی تصویر کاربر</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{String} id</li>
         *                  <li>{String} name</li>
         *                  <li>{String} token</li>
         *                  <li>{JSONObject} [image]
         *                      <ul>
         *                          <li>{String} id</li>
         *                          <li>{String} url</li>
         *                          <li>{Integer} width</li>
         *                          <li>{Integer} height</li>
         *                      </ul>
         *                  </li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.verifyWithCompleteProfileRequest = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params is not exist");
            }

            if (!params.cellphoneNumber) {
                throw new ServiceException("cellphoneNumber key  is not exist");
            }

            if (!params.code) {
                throw new ServiceException("code key is not exist");
            }

            if (!params.nickName) {
                throw new ServiceException("nickName key is not exist");
            }

            if (__userData.peerId) {
                params.peerId = __userData.peerId;
            }

            if (__userData.deviceId) {
                params.deviceId = __userData.deviceId;
            }

            __request("verifyAndCompleteProfile", params, function (result) {

                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage,
                    errorCode: result.ErrorCode,
                    loginState: false
                };

                if (!result.HasError) {

                    var setting = {
                        sessionStore: false,
                        storageStore: false
                    };

                    if (params.setting) {
                        if (params.setting.sessionStore) {
                            setting.sessionStore = params.setting.sessionStore;
                        }
                        if (params.setting.storageStore) {
                            setting.storageStore = params.setting.storageStore;
                        }
                    }

                    if (result.Result) {
                        returnData.loginState = true;
                        var retResult = {
                            name: result.Result.Name,
                            token: result.Result.Token,
                            id: result.Result.UserID
                        };
                        var image;
                        if (result.Result.Image && result.Result.Image.id) {
                            image = {
                                id: result.Result.Image.id,
                                width: result.Result.Image.width,
                                height: result.Result.Image.height,
                                hashCode: result.Result.Image.hashCode
                            };
                            retResult.image = {
                                id: image.id,
                                width: image.width,
                                height: image.height,
                                url: image.url,
                                hashCode: image.hashCode
                            };
                            returnData.result = retResult;
                        }

                        __loginAction({
                            name: result.Result.Name,
                            token: result.Result.Token,
                            id: result.Result.UserID,
                            image: image
                            //id : result.Result.CustomerID
                        }, setting);
                    }

                }

                if (typeof callback == "function") {
                    callback(returnData);
                }
            });
        };

        /**
         * <div style='width: 100%;text-align: right'>تکمیل پروفایل کاربر</div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *       var reqData = {};
         *       reqData["cellphoneNumber"] = "cellphoneNumber");
         *       reqData["nickName"] = "nickName");
         *       service.completeProfileRequest(reqData, function() {
         *            console.log("completeProfileRequest method : " + result);
         *       });
         *  </code>
         * </pre>
         * @method completeProfileRequest
         * @public
         *
         * @param {Object} params
         *      <ul>
         *          <li>{String} cellphoneNumber شماره موبایل</li>
         *          <li>{String} nickName نام مستعار</li>
         *          <li>{String} [firstName] نام </li>
         *          <li>{String} [lastName] نام خانوادگی</li>
         *          <li>{String} [email] ایمیل</li>
         *          <li>{String} [gender] مرد=MAN_GENDER or زن=WOMAN_GENDER ,   جنسیت </li>
         *          <li> {JSONObject} [setting]
         *              <ul>
         *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر کاربر</li>
         *                  <li>{Integer} [imageHeight] اندازه رزولیشن عمودی تصویر کاربر</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{String} id</li>
         *                  <li>{String} name</li>
         *                  <li>{String} token</li>
         *                  <li>{JSONObject} [image]
         *                      <ul>
         *                          <li>{String} id</li>
         *                          <li>{String} url</li>
         *                          <li>{Integer} width</li>
         *                          <li>{Integer} height</li>
         *                      </ul>
         *                  </li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         *
         * */
        __self.completeProfileRequest = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params is not exist");
            }

            if (!params.cellphoneNumber) {
                throw new ServiceException("cellphoneNumber key  is not exist");
            }

            if (!params.nickName) {
                throw new ServiceException("nickName key is not exist");
            }

            if (__userData.peerId) {
                params.peerId = __userData.peerId;
            }

            if (__userData.deviceId) {
                params.deviceId = __userData.deviceId;
            }
            __request("completeProfile", params, function (result) {

                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage,
                    loginState: false
                };

                if (!result.HasError) {
                    returnData.loginState = true;

                    var setting = {
                        sessionStore: false,
                        storageStore: false
                    };

                    if (params.setting) {
                        if (params.setting.sessionStore) {
                            setting.sessionStore = params.setting.sessionStore;
                        }
                        if (params.setting.storageStore) {
                            setting.storageStore = params.setting.storageStore;
                        }
                    }
                    var retResult = {
                        name: result.Result.Name,
                        token: result.Result.Token,
                        id: result.Result.UserID
                    };

                    var image;
                    if (result.Result.Image && result.Result.Image.id) {
                        image = {
                            id: result.Result.Image.id,
                            width: result.Result.Image.width,
                            height: result.Result.Image.height,
                            hashCode: result.Result.Image.hashCode
                        };
                        retResult.image = {
                            id: image.id,
                            width: image.width,
                            height: image.height,
                            url: image.url,
                            hashCode: image.hashCode
                        };
                        returnData.result = retResult;
                    }

                    __loginAction({
                        name: result.Result.Name,
                        token: result.Result.Token,
                        id: result.Result.UserID,
                        image: image
                        //id : result.Result.CustomerID
                    }, setting);

                }

                if (typeof callback == "function") {
                    callback(returnData);
                }

            });
        };

        /**
         * <div style='width: 100%;text-align: right'> درخواست ارسال دوباره رمز عبور</div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["cellphoneNumber"] = "cellphoneNumber";
         *      service.forgetPasswordRequest(reqData, function() {
         *              console.log("forgetPasswordRequest method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method forgetPasswordRequest
         * @public
         *
         * @param {Object} params
         *      <ul>
         *          <li>{String} cellphoneNumber شماره موبایل</li>
         *      </ul>
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{Boolean} result </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.forgetPasswordRequest = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params is not exist");
            }

            if (!params.cellphoneNumber) {
                throw new ServiceException("cellphoneNumber key  is not exist");
            }

            if (__userData.deviceId) {
                params.deviceId = __userData.deviceId;
            }

            __request("forgetPassword", params, function (result) {

                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage,
                    errorCode: result.ErrorCode,
                    result: result.Result
                };

                if (typeof callback == "function") {
                    callback(returnData);
                }
            });
        };

        /**
         *  <div style='width: 100%;text-align: right'> ثبت پیشنهاد کاربر </div>
         *  <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["gameId"] = "55";
         *      reqData["suggestion"] = "suggestion";
         *      reqData["email"]= "email";//optional
         *      reqData["name"] =  "name";//optional
         *      reqData["metaData"] = "metaData";//optional
         *      reqData["type"] = 2;//optional
         *      service.suggestionRequest(reqData,function() {
         *              console.log("suggestionRequest method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method suggestionRequest
         * @public
         *
         * @param {Object} params
         *      <ul>
         *          <li>{String} gameId شناسه بازی</li>
         *          <li>{String} suggestion توضیحات</li>
         *          <li>{Integer} [type=1] نوع
         *              <p>1 = Suggestion پیشنهاد</p>
         *              <p>2 = User Repor گزارش یک کاربر</p>
         *              <p>3 = Bug Report گزارش خطا</p>
         *          </li>
         *          <li>{String} [name] نام</li>
         *          <li>{String} [email] ایمیل</li>
         *          <li>{String} [metaData] اطلاعات اضافه</li>
         *      </ul>
         * @param {Function} callback
         *
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.suggestionRequest = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params is not exist");
            }

            if (!params.suggestion) {
                throw new ServiceException("suggestion key is not exist");
            }

            if (!params.gameId) {
                throw new ServiceException("gameId key is not exist");
            }


            var data = {
                report: params.suggestion,
                gameId: params.gameId
            };

            if (params.email) {
                data.email = params.email;
            }

            if (params.name) {
                data.name = params.name;
            }

            if (params.metaData) {
                var meta = params.metaData;
                if (typeof meta == "object") {
                    meta = JSON.stringify(meta);
                }
                data.metaData = meta;
            }

            if (typeof params.type == "number") {
                data.type = params.type;
            } else {
                data.type = 1;
            }

            __request("suggestion", data, function (result) {
                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage
                };

                if (typeof callback == "function") {
                    callback(returnData);
                }
            });
        };

        /**
         * <div style='width: 100%;text-align: right'>دریافت اطلاعات کاربر</div>
         * <pre>
         *     <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *        var userData = service.getUserData();
         *  </code>
         * </pre>
         * @method getUserData
         * @public
         *
         * @return
         *      <ul>
         *          <li>{String} id</li>
         *          <li>{String} name</li>
         *          <li>{String} token</li>
         *          <li>{String} peerId</li>
         *          <li>{Boolean} guest</li>
         *          <li>{Boolean} ssoLogin</li>
         *          <li>{JSONObject} [image]
         *              <ul>
         *                  <li>{String} id</li>
         *                  <li>{String} url</li>
         *                  <li>{Integer} width</li>
         *                  <li>{Integer} height</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * */
        __self.getUserData = function () {
            // console.trace("getUserData", __userData);
            return {
                id: __userData.id + "",
                name: __userData.name,
                peerId: __userData.peerId,
                chatPeerId: __chatService && __chatService.getPeerId(),
                token: __userData.token,
                tokenIssuer: __userData.tokenIssuer,
                guest: __userData.guest,
                ssoLogin: __userData.ssoLogin,
                imageUrl: __userData.imageUrl
            };
        };

        /**
         * <div style='width: 100%;text-align: right'>دریافت کاربران آنلاین یک لیگ </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *       var reqData = {};
         *       reqData["size"] =  10);
         *       reqData["gameId"] =  "2");
         *       reqData["leagueId"] = "3");
         *       service.getOnlineUser(reqData, function() {
        *               console.log("getOnlineUser method : " + data);
        *       });
         *  </code>
         * @method getOnlineUser
         * @public
         *
         * @param {Object} params
         *      <ul>
         *          <li>{String} gameId شناسه بازی</li>
         *          <li>{String} leagueId شناسه لیگ</li>
         *          <li>{String} [offset=0]</li>
         *          <li>{String} [size]</li>
         *          <li>{JSONObject} [setting]
         *              <ul>
         *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر کاربر</li>
         *                  <li>{Integer} [imageHeight] اندازه رزولیشن عمودی تصویر کاربر</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{JSONObject} users - مقدار کلید های این آبجکت شناسه کاربران می باشد و مقدار آن نیز اطلاعات کاربر :
         *                      <ul>
         *                          <li>{String} name</li>
         *                          <li>{JSONObject} [image]
         *                              <ul>
         *                                  <li>{String} id</li>
         *                                  <li>{String}  url</li>
         *                                  <li>{Integer} width</li>
         *                                  <li>{Integer} height</li>
         *                              </ul>
         *                          </li>
         *                      </ul>
         *                  </li>
         *                  <li>{Boolean} result.hasNext</li>
         *                  <li>{Integer} result.nextOffset</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getOnlineUser = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params is not exist");
            }

            if (!params.leagueId) {
                throw new ServiceException("leagueId key is not exist");
            }

            if (!params.gameId) {
                throw new ServiceException("gameId key is not exist");
            }

            var leagueId = params.leagueId;
            var gameId = params.gameId;
            var filter = params.filter;

            var requestData = {
                leagueId: leagueId,
                gameId: gameId
            };

            var setting = {
                imageWidth: (params.setting && params.setting.imageWidth ) ?
                    params.setting.imageWidth :
                    __configData.disw,

                imageHeight: (params.setting && params.setting.imageHeight ) ?
                    params.setting.imageHeight :
                    __configData.disw
            };

            if (params.offset != undefined) {
                requestData.index = params.offset;
            } else {
                requestData.index = 0;
            }

            if (params.size != undefined) {
                requestData.count = params.size;
            } else {
                requestData.count = __configData.gous;
            }

            if (filter) {
                requestData.filter = filter
            }

            __getOnlineUser(requestData, setting, callback);

        };

        /**
         * <div style='width: 100%;text-align: right'> درخواست بازی </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["gameId"] =  "2";
         *      reqData["leagueId"] =  "3";
         *      reqData["opponentId"] =  "5";
         *
         *      service.matchRequest(reqData,{
         *          onResult : function(data) {
         *              console.log("matchRequest method -- onResult : " + data);
         *          }
         *          onAccept : function(data) {
         *              console.log("matchRequest method -- onAccept : " + data);
         *          }
         *          onReject : function(data) {
         *              console.log("matchRequest method -- onReject : " + data);
         *          }
         *          onCancel : function(data) {
         *              console.log("matchRequest method -- onCancel : " + data);
         *          }
         *      });
         *  </code>
         * </pre>
         * @method matchRequest
         * @protected
         *
         * @param {Object} params
         *      <ul>
         *          <li>{String} opponentId</li>
         *          <li>{String} gameId</li>
         *          <li>{String} leagueId</li>
         *          <li>{String} version  - current game version </li>
         *          <li>{Boolean} [isOffline=false]</li>
         *          <li>{Integer} [requestTime] -  for offline request</li>
         *      </ul>
         *
         *  @param {Object} callbacks
         *      @param {Function} callbacks.onResult
         *          @param {Boolean} callbacks.onResult.hasError
         *          @param {String} callbacks.onResult.errorMessage
         *
         *      @param {Function} [callbacks.onCancel] for online request
         *          @param {Function} callbacks.onCancel.requestId
         *
         *      @param {Function} [callbacks.onAccept] for online request
         *          @param {Function} callbacks.onAccept.requestId
         *
         *      @param {Function} [callbacks.onReject] for online request
         *          @param {Function} callbacks.onReject.requestId
         *          @param {String} callbacks.onReject.rejectMessage
         *
         * @throws {ServiceException}
         * */
        __self.matchRequest = function (params, callbacks) {
            if (typeof params != "object") {
                throw new ServiceException("params is not exist");
            }

            if (!params.opponentId) {
                throw new ServiceException("opponentId key is not exist");
            }

            if (!params.leagueId) {
                throw new ServiceException("leagueId key is not exist");
            }

            if (!params.gameId) {
                throw new ServiceException("gameId key is not exist");
            }


            var gameVersion = params.version || __games[params.gameId].version,
                sendData,
                requestUrl = "requestMatch";

            if (params.isOffline) {
                requestUrl = "offlineMatchRequest";
                sendData = {
                    opponentUserId: params.opponentId,
                    gameId: params.gameId,
                    leagueId: params.leagueId
                };

                if (typeof params.requestTime == "number") {
                    sendData.timestamp = params.requestTime;
                }
            } else {

                // if (__currentMatchRequestCount >= __configData.mmrc) {
                //     callbacks.onResult({
                //         hasError: true,
                //         errorMessage: __dic.MAXCONCURRENTREQUEST[__lang].replace("$VAR", __configData.mmrc)
                //     });
                //     return;
                // }

                if (!__isMultiTab &&
                    (__isGameRun() || __currentMatchRequestCount > 0 || __quickMatchData.requestCount > 0)
                ) {

                    var errorMessage = __dic.CANTNOTREQUESTINPLAING[__lang];
                    if (__currentMatchRequestCount > 0) {
                        errorMessage = __dic.WAITFORPREVIOUSREQUEST[__lang];
                    } else if (__quickMatchData.requestCount > 0) {
                        errorMessage = __dic.WAIT_FORP_REVIOUS_QUICK_MATCH[__lang];
                    }
                    callbacks.onResult({
                        hasError: true,
                        errorMessage: errorMessage
                    });
                    return;
                }

                if (!__network.getSocketConnectionState()) {
                    callbacks.onResult({
                        hasError: true,
                        errorMessage: __dic.CONNECTINGTOPUSH[__lang]
                    });
                    return;
                }

                __currentMatchRequestCount += 1;
                sendData = {
                    opponentId: params.opponentId,
                    gameId: params.gameId,
                    leagueId: params.leagueId,
                    id: 0,
                    sessionId: __userData.peerId,
                    version: gameVersion
                };
            }

            __request(requestUrl, sendData, function (result) {
                if (callbacks.onResult) {
                    var returnData = {
                        hasError: result.HasError,
                        errorMessage: result.ErrorMessage
                    };
                    if (result.HasError) {
                        if (!params.isOffline) {
                            __currentMatchRequestCount -= 1;
                        }
                        returnData.result = undefined;
                    } else {
                        var requestId = result.Result.requestId+"";
                        returnData.result = {
                            requestId: requestId
                        };

                        if (!params.isOffline) {
                            var timeoutId = setTimeout(function () {
                                if (__activeMatchRequest[params.leagueId][requestId]) {
                                    delete __activeMatchRequest[params.leagueId][requestId];
                                    __currentMatchRequestCount -= 1;

                                    callbacks.onCancel && callbacks.onCancel({
                                        requestId: requestId
                                    });
                                }
                            }, __configData.mrt);


                            if (!__activeMatchRequest[params.leagueId]) {
                                __activeMatchRequest[params.leagueId] = {};
                            }

                            __lastMatchRequestData = {
                                requestId: requestId,
                                opponentId: params.opponentId,
                                leagueId: params.leagueId
                            };
                            __activeMatchRequest[params.leagueId][requestId] = {
                                opponentId: params.opponentId,
                                onAccept: callbacks.onAccept,
                                onReject: callbacks.onReject,
                                timeoutId: timeoutId
                            };
                        }

                    }

                    callbacks.onResult(returnData);
                }

            });

        };

        /**
         * <div style='width: 100%;text-align: right'>لغو درخواست مسابقه </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *     var reqData = {};
         *     reqDatap["gameId"] =  "2";
         *     reqDatap["leagueId"] "3";
         *     reqDatap["opponentId"] "5";
         *
         *     service.matchRequest(reqData, function(result) {
         *           var hasError = result.hasError;
         *           if (!hasError) {
         *               String requestId = result["result"]["requestId"];
         *               var reqData = {};
         *               reqData["requestId"] =  requestId;
         *               reqData["leagueId"] =  "3";
         *               service.cancelMatchRequest(reqData, function() {
         *                       console.log("cancelMatchRequest method : " + result);
         *               });
         *           }
         *     });
         *  </code>
         * </pre>
         * @method cancelMatchRequest
         * @protected
         *
         * @param {Object} params
         *      <ul>
         *          <li>{String} requestId - شناسه درخواست</li>
         *          <li>{String} leagueId - شناسه لیگ</li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.cancelMatchRequest = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params is not exist");
            }

            if (!params.leagueId) {
                throw new ServiceException("leagueId key is not exist");
            }

            if (!params.requestId) {
                throw new ServiceException("requestId key is not exist");
            }

            if (__activeMatchRequest[params.leagueId] && __activeMatchRequest[params.leagueId][params.requestId]) {
                __request("cancelMatchRequest", {
                    requestId: params.requestId
                }, function (result) {

                    var returnData = {
                        hasError: result.HasError,
                        errorMessage: result.ErrorMessage
                    };
                    if (!result.HasError) {
                        delete __activeMatchRequest[params.leagueId][params.requestId];
                        __currentMatchRequestCount -= 1;
                    }
                    callback && callback(returnData);
                });
            } else {
                callback && callback({
                    hasError: false,
                    errorMessage: ""
                });
            }

        };

        /**
         * <div style='width: 100%;text-align: right'>  درخواست شناسه بازی </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["gameId"] =  "2";
         *      reqData["leagueId"] =  "3";
         *      service.matchIdRequest(reqData, function() {
         *              console.log("matchIdRequest method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method matchIdRequest
         * @protected
         *
         * @param {Object} params
         *      <ul>
         *          <li>{String} gameId - شناسه بازی</li>
         *          <li>{String} leagueId - شناسه لیگ </li>
         *      </ul>
         *
         * @param {Function} callback
         *      <p>onResult method params is JSONObject that has</p>
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{String} result.matchId - شناسه بازی</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         *
         * */
        __self.matchIdRequest = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params is not exist");
            }

            if (!params.leagueId) {
                throw new ServiceException("leagueId key is not exist");
            }

            if (!params.gameId) {
                throw new ServiceException("gameId key is not exist");
            }


            function sendRequest() {
                __request("requestMatchId", {
                    // players: JSON.stringify([__userData.id]),
                    gameId: params.gameId,
                    leagueId: params.leagueId
                }, function (result) {

                    var returnData = {
                        hasError: result.HasError,
                        errorMessage: result.ErrorMessage,
                        errorCode: result.ErrorCode
                    };
                    if (result.HasError) {
                        returnData.result = undefined;
                    } else {
                        returnData.result = {
                            matchId: result.Result.ID
                        };
                    }
                    callback && callback(returnData);
                });
            }

            var isGameRun = __isGameRun();
            if (!__isMultiTab && (__currentMatchRequestCount > 0 || isGameRun || __quickMatchData.requestCount > 0)) {
                if (__currentMatchRequestCount > 0) {
                    if (__lastMatchRequestData && __lastMatchRequestData.requestId) {
                        __self.cancelMatchRequest({
                            requestId: __lastMatchRequestData.requestId,
                            leagueId: __lastMatchRequestData.leagueId
                        }, function (cancelResult) {
                            if (!cancelResult.hasError) {
                                sendRequest();
                            } else {
                                callback && callback({
                                    hasError: true,
                                    errorMessage: __dic.WAITFORPREVIOUSREQUEST[__lang]
                                });
                            }
                        });
                    } else {
                        callback && callback({
                            hasError: true,
                            errorMessage: __dic.WAITFORPREVIOUSREQUEST[__lang]
                        });
                    }

                } else if (__quickMatchData.requestCount > 0) {
                    if (__quickMatchData.lastLeagueId) {
                        __self.cancelQuickMatchRequest({
                            leagueId: __quickMatchData.lastLeagueId
                        }, function (cancelResult) {
                            if (!cancelResult.hasError && cancelResult.result) {
                                if (cancelResult.result) {
                                    sendRequest();
                                } else {
                                    callback && callback({
                                        hasError: true,
                                        errorMessage: __dic.WAITFORPREVIOUSREQUEST[__lang]
                                    });
                                }

                            } else {
                                callback && callback({
                                    hasError: true,
                                    errorMessage: __dic.CANCEL_QUICKMATCH_FIRST[__lang]
                                });
                            }
                        });
                    } else {
                        callback && callback({
                            hasError: true,
                            errorMessage: __dic.CANCEL_QUICKMATCH_FIRST[__lang]
                        });
                    }

                } else if (isGameRun) {
                    callback && callback({
                        hasError: true,
                        errorMessage: __dic.CAN_ACCEPT_MATCH_REQUEST_AFTER_MATCH[__lang]
                    });
                }


            } else {
                sendRequest();
            }


        };

        /**
         * <div style='width: 100%;text-align: right'> استریم درخواست شناسه بازی </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["gameId"] =  "2";
         *      reqData["leagueId"] =  "3";
         *      service.streamMatchIdRequest(reqData, function() {
         *              console.log("streamMatchIdRequest method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method streamMatchIdRequest
         * @protected
         *
         * @param {Object} params
         *      <ul>
         *          <li>{String} gameId - شناسه بازی</li>
         *          <li>{String} leagueId - شناسه لیگ </li>
         *          <li>{Integer} clientType -
         *              1 => WEB
         *              2 => ANDROID
         *              3 => PC
         *          </li>
         *      </ul>
         *
         * @param {Function} callback
         *      <p>onResult method params is JSONObject that has</p>
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{String} matchId - شناسه بازی</li>
         *                  <li>{String} ip </li>
         *                  <li>{Integer} ws </li>
         *                  <li>{Integer} wss </li>
         *                  <li>{Integer} io </li>
         *                  <li>{Integer} rtsp </li>
         *                  <li>{Integer} width </li>
         *                  <li>{Integer} height </li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         *
         * */
        __self.streamMatchIdRequest = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params is not exist");
            }

            var legueId = params.leagueId;
            var gameId = params.gameId;
            var clientType = params.clientType;

            if(!legueId && !gameId) {
                throw new ServiceException("leagueId or gameId is not exist");
            }
            if(!clientType) {
                throw new ServiceException("clientType or gameId is not exist");
            }

            var requestData = {
                peerIds : [__userData.peerId],
                clientType : clientType
            };
            if(params.leagueId) {
                requestData.leagueId = params.leagueId;
            }
            if(params.gameId) {
                requestData.gameId = params.gameId;
            }

            __request("addStreamMatch",requestData, function (result) {

                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage,
                    errorCode: result.ErrorCode
                };
                if (result.HasError) {
                    returnData.result = undefined;
                } else {
                    returnData.result = {
                        matchId: result.Result.matchId + "",
                        ip: result.Result.ip,
                        ws: result.Result.ws,
                        wss: result.Result.wss,
                        io: result.Result.io,
                        width : result.Result.w,
                        height : result.Result.h
                    };
                }
                callback && callback(returnData);
            });
        };

        /**
         * <div style='width: 100%;text-align: right'> دریافت اعضای لیگ</div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["leagueId"] =  "3");
         *      reqData["offset"] = 0);
         *      reqData["size"] = 10 );
         *
         *      service.getLeagueMembers(reqData, function() {
         *              console.log("getLeagueMembers method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getLeagueMembers
         * @protected
         * @param {Object} params
         *      <ul>
         *          <li>{String} leagueId</li>
         *          <li>{Integer} [size=20]</li>
         *          <li>{Integer} [offset=0]</li>
         *          <li>{Integer} [userState=0] - وضعیت کاربر
         *              <p>     0 = تمامی کاربران</p>
         *              <p>     1 = کاربران آنلاین</p>
         *              <p>     2 = کاربران آفلاین</p>
         *          </li>
         *          <li>{String} [name]</li>
         *          <li> {JSONObject} [setting]
         *              <ul>
         *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر لیگ</li>
         *                  <li>{Integer} [imageHeight] اندازه رزولیشن عمودی تصویر لیگ</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{JSONObject} users - کلید های این آبجکت شناسه کاربر می باشد
         *                      <ul>
         *                          <li>{String} name</li>
         *                          <li>{Boolean} isOnline</li>
         *                          <li>{JSONObject} [image]
         *                              <ul>
         *                                  <li>{String}  id</li>
         *                                  <li>{Integer} width</li>
         *                                  <li>{Integer} height</li>
         *                                  <li>{String}  url</li>
         *                              </ul>
         *                          </li>
         *                      </ul>
         *                  </li>
         *                  <li>{Boolean} hasNext</li>
         *                  <li>{Integer} nextOffset</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getLeagueMembers = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params is not exist");
            }

            if (!params.leagueId) {
                throw new ServiceException("leagueId key is not exist");
            }

            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }

            var sendData = {
                leagueId: params.leagueId
            };

            if (typeof params.offset == "number" && params.offset >= 0) {
                sendData.offset = params.offset;
            } else {
                sendData.offset = 0;
            }

            if (typeof params.size == "number" && params.size >= 0) {
                sendData.size = params.size;
            } else {
                sendData.size = __configData.glms
            }

            if (typeof params.userState == "number") {
                sendData.online = params.userState == 1;
            }

            if (typeof params.name == "string" && params.name.length > 1) {
                sendData.filter = params.name;
            }

            var setting = {
                imageWidth: (params.setting && params.setting.imageWidth ) ?
                    params.setting.imageWidth :
                    __configData.ldisw,

                imageHeight: (params.setting && params.setting.imageHeight ) ?
                    params.setting.imageHeight :
                    __configData.ldish
            };

            __request("leagueMembers", sendData, function (result) {

                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage
                };
                if (result.HasError) {
                    returnData.result = undefined;
                } else {
                    var members = result.Result;
                    var users = {};

                    if (members) {
                        for (var i = 0; i < members.length; i++) {
                            var member = members[i];

                            // if (member.UserID == __userData.id) {
                            //     continue
                            // }

                            users[member.UserID] = {
                                name: member.Name,
                                isOnline: member.IsOnline,
                                image: member.Image,
                                imageUrl: member.ProfileImage
                            };

                            if (member.Image) {
                                users[member.UserID].image = member.Image;
                            }
                        }
                    }

                    returnData.result = {
                        users: users,
                        nextOffset: sendData.offset += members.length,
                        hasNext: sendData.size == members.length
                    };
                }

                callback(returnData);

            });
        };

        /**
         * <div style='width: 100%;text-align: right'> دریافت اطلاعات جدول رده بندی </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *       var reqData = {};
         *       reqData["leagueId"] = "3";
         *
         *       service.getTableData(reqData, function() {
         *               console.log("getTableData method : " + result);
         *       });
         *  </code>
         * </pre>
         * @method getTableData
         * @protected
         *
         * @param {Object} params
         *      <ul>
         *          <li>{String} leagueId - شناسه بازی</li>
         *          <li>{Integer} [rangeType] - زمان جدول
         *              <p>     1 = اهفته </p>
         *              <p>     3 =    کلی </p>
         *          </li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{Integer} type
         *                      <ul>
         *                          <li>0 = لیگ دوره ای</li>
         *                          <li>1 = لیگ حذفی</li>
         *                      </ul>
         *                  </li>
         *                  <li>{JSONArray} headerData - نام فیلد های جدول در لیگ دوره ای</li>
         *                  <li>{JSONArray} usersData  - اطلاعات جدول در لیگ دوره ای</li>
         *                  <li>{JSONObject} rounds - اطلاعات مرحله ها در لیگ حذفی</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getTableData = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params is not exist");
            }

            if (!params.leagueId) {
                throw new ServiceException("leagueId key is not exist");
            }

            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }

            var data = {
                leagueId: params.leagueId
            };

            if (params.rangeType != undefined) {
                data.rangeType = params.rangeType;
            }

            var setting = {
                width: (params.setting && params.setting.imageWidth ) ?
                    params.setting.imageWidth :
                    __configData.disw,

                height: (params.setting && params.setting.imageHeight ) ?
                    params.setting.imageHeight :
                    __configData.disw
            };

            __request(
                "table",
                data,
                function (result) {
                    var returnData = {
                        hasError: result.HasError,
                        errorMessage: result.ErrorMessage,
                        result: undefined
                    };
                    if (!result.HasError) {
                        returnData.result = __reformatTableObject(result.Result, setting);
                    }
                    callback(returnData);
                });

        };

        /**
         * <div style='width: 100%;text-align: right'>  دریافت برترین امتیازات </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      JSONObject reqData = new JSONObject();
         *      reqData["gameId"] =  "2";
         *      reqData["isGlobal"] = true;
         *      service.getTopScore(reqData, function() {
         *              console.log("getTopScore method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getTopScore
         * @public
         *
         * @param {Object} params
         *      <ul>
         *          <li>{String} gameId - شناسه بازی</li>
         *          <li>{String} [leagueId] - شناسه لیگ</li>
         *          <li>{Boolean} [isGlobal] - برترین در بین کاربران و یا امتیازات خود کاربر</li>
         *      </ul>
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONArray} result آرایه ای از آبجکت می باشد که هر کدام دارای مقادیر زیر است
         *              <ul>
         *                  <li>{String} id</li>
         *                  <li>{String} name</li>
         *                  <li>{String} score</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         *
         * */
        __self.getTopScore = __getTopScore;

        /**
         * <div style='width: 100%;text-align: right'>  اجرای بازی تک نفره </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["gameId"] =  "2";
         *      reqData["leagueId"] = "3";
         *      reqData["matchId"] = "44333";
         *      service.runSingleMatch(reqData);
         *  </code>
         * </pre>
         * @method runSingleMatch
         * @public
         *
         * @param {Object} params
         *      @param {String} params.leagueId شناسه لیگ
         *      @param {String} params.gameId شناسه بازی
         *      @param {String} params.matchId شناسه مسابقه
         * @throws {ServiceException}
         * */
        __self.runSingleMatch = function (params) {
            if (typeof params != "object") {
                throw new ServiceException("params not exist or not an object");
            }

            if (!params.leagueId) {
                throw new ServiceException("leagueId key is not exist");
            }

            if (!params.gameId) {
                throw new ServiceException("gameId key is not exist");
            }

            if (!params.matchId) {
                throw new ServiceException("matchId key is not exist");
            }

            var matchData = {
                ownData: __self.getUserData(),
                leagueId: params.leagueId,
                leagueName: __leagues[params.leagueId].name,
                gameId: params.gameId,
                matchId: params.matchId,
                isMultiPlayer: false
            };
            __newMatch(matchData);
        };

        /**
         * @method runMultiPlayerMatch
         * @protected
         *
         * @param {Object} params
         *      @param {Array} params.selectedMatchesId
         * @throws {ServiceException}
         * */
        __self.runMultiPlayerMatch = function (params) {
            if (typeof params != "object") {
                throw new ServiceException("params not exist or not an object");
            }

            if (!Array.isArray(params.selectedMatchesId)) {
                throw new ServiceException("selectedMatchesId key is not exist or not an array");
            }

            var selectedMatchesId = params.selectedMatchesId;
            for (var matchId in __lastValidMatch) {

                if (selectedMatchesId.indexOf(matchId) >= 0) {

                    var matchData = __createMatchDataFromDBData(__lastValidMatch[matchId]);
                    __newMatch(matchData);
                } else {
                    (function (matchId) {

                        __cancelMatch({matchId: matchId, type: 1});

                        __database && __database.removeFromTable({
                            name: __databaseParams.tableName.activeMatch,
                            index: parseInt(matchId),
                            onSuccess: function (result) {
                                //__logger.info("success remove  unselected match", matchId,result)();
                            },
                            onError: function (result) {
                                //__logger.info("error remove  unselected match", matchId)();
                            }
                        });
                    })(matchId);

                }
            }

            __lastValidMatch = {};
        };

        /**
         * <div style='width: 100%;text-align: right'>دریافت اطلاعات بازی ها </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      var gamesId  = ["2"];
         *      reqData.put("gamesId",gamesId);
         *      service.getGamesInfo(reqData, function() {
         *              console.log("getGamesInfo method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getGamesInfo
         * @public
         *
         * @param {Object} params
         *      <ul>
         *          <li>{JSONArray} [gamesId] - شناسه بازی</li>
         *          <li>{String} [lobbyId] - شناسه دسته بازی</li>
         *          <li>{JSONArray} [name] - نام بازی که میخواهید اظلاعات آن را دریافت کنید</li>
         *          <li>{Integer} [size=30]</li>
         *          <li>{Integer} [offset=0]</li>
         *          <li>{JSONObject} [setting]
         *              <ul>
         *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر بازی</li>
         *                  <li>{Integer} [imageHeight] اندازه رزولیشن عمودی تصویر بازی</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{Boolean} hasNext</li>
         *                  <li>{Integer} nextOffset</li>
         *                  <li>{JSONArray} games
         *                      <ul>
         *                          <li>{String} id</li>
         *                          <li>{String} name</li>
         *                          <li>{String} description</li>
         *                          <li>{String} creator</li>
         *                          <li>{String} physicalUrl</li>
         *                          <li>{String} timelineId</li>
         *                          <li>{String} packageName</li>
         *                          <li>{String} mobileVersion</li>
         *                          <li>{String} mobileVersionCode</li>
         *                          <li>{String} supporterId</li>
         *                          <li>{String} defaultLeagueId</li>
         *                          <li>{String} downloadLink</li>
         *                          <li>{String} gamePlayDescription</li>
         *                          <li>{String} score</li>
         *                          <li>{String} webVersion</li>
         *                          <li>{JSONArray} attributeValues</li>
         *                          <li>{JSONArray} categoryList</li>
         *                          <li>{JSONObject} business</li>
         *                          <li>{JSONObject} userPostInfo
         *                              <ul>
         *                                  <li>{Boolean} favorite</li>
         *                                  <li>{Boolean} liked</li>
         *                                  <li>{String} postId</li>
         *                              </ul>
         *                          </li>
         *                          <li>{JSONObject} rate
         *                              <ul>
         *                                  <li>{Integer} rate.rate</li>
         *                                  <li>{Integer} rate.rateCount</li>
         *                              </ul>
         *                          </li>
         *                          <li>{JSONObject} image
         *                              <ul>
         *                                  <li>{String} image.id</li>
         *                                  <li>{String} image.url</li>
         *                                  <li>{String} image.hashCode</li>
         *                                  <li>{Integer} image.width</li>
         *                                  <li>{Integer} image.height</li>
         *                              </ul>
         *                          </li>
         *                          <li>{Integer} playerNumbersType</li>
         *                          <li>{Integer} platformType</li>
         *                          <li>{Integer} availableCount</li>
         *                          <li>{Integer} discount</li>
         *                          <li>{Integer} numOfComments</li>
         *                          <li>{Integer} numOfFavorites</li>
         *                          <li>{Integer} numOfLikes</li>
         *                          <li>{Boolean} canComment</li>
         *                          <li>{Boolean} canLike</li>
         *                          <li>{Boolean} enable</li>
         *                          <li>{Boolean} hide</li>
         *                          <li>{Double} latitude</li>
         *                          <li>{Double} longitude</li>
         *                          <li>{Double} publishedDate</li>
         *                          <li>{Double} price</li>
         *                          <li>{Double} timestamp</li>
         *                      </ul>
         *                  </li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getGamesInfo = __getGamesInfo;

        /**
         *  <div style='width: 100%;text-align: right'>دریافت بازی های دنبال شده توسط کاربر </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      service.getGameFollowing(reqData, function() {
         *              console.log("getGameFollowing method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getGamesInfo
         * @protected
         *
         * @param {Object} params
         *      <ul>
         *          <li>{Integer} [size=10]</li>
         *          <li>{Integer} [offset=0]</li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{Boolean} hasNext</li>
         *                  <li>{Integer} nextOffset</li>
         *                  <li>{JSONArray} games
         *                      <ul>
         *                          <li>{String} id</li>
         *                          <li>{String} name</li>
         *                          <li>{String} description</li>
         *                          <li>{String} creator</li>
         *                          <li>{String} physicalUrl</li>
         *                          <li>{String} timelineId</li>
         *                          <li>{String} packageName</li>
         *                          <li>{String} mobileVersion</li>
         *                          <li>{String} mobileVersionCode</li>
         *                          <li>{String} supporterId</li>
         *                          <li>{String} defaultLeagueId</li>
         *                          <li>{String} downloadLink</li>
         *                          <li>{String} gamePlayDescription</li>
         *                          <li>{String} score</li>
         *                          <li>{String} webVersion</li>
         *                          <li>{JSONArray} attributeValues</li>
         *                          <li>{JSONArray} categoryList</li>
         *                          <li>{JSONObject} business</li>
         *                          <li>{JSONObject} userPostInfo
         *                              <ul>
         *                                  <li>{Boolean} favorite</li>
         *                                  <li>{Boolean} liked</li>
         *                                  <li>{String} postId</li>
         *                              </ul>
         *                          </li>
         *                          <li>{JSONObject} rate
         *                              <ul>
         *                                  <li>{Integer} rate.rate</li>
         *                                  <li>{Integer} rate.rateCount</li>
         *                              </ul>
         *                          </li>
         *                          <li>{JSONObject} image
         *                              <ul>
         *                                  <li>{String} image.id</li>
         *                                  <li>{String} image.url</li>
         *                                  <li>{String} image.hashCode</li>
         *                                  <li>{Integer} image.width</li>
         *                                  <li>{Integer} image.height</li>
         *                              </ul>
         *                          </li>
         *                          <li>{Integer} playerNumbersType</li>
         *                          <li>{Integer} platformType</li>
         *                          <li>{Integer} availableCount</li>
         *                          <li>{Integer} discount</li>
         *                          <li>{Integer} numOfComments</li>
         *                          <li>{Integer} numOfFavorites</li>
         *                          <li>{Integer} numOfLikes</li>
         *                          <li>{Boolean} canComment</li>
         *                          <li>{Boolean} canLike</li>
         *                          <li>{Boolean} enable</li>
         *                          <li>{Boolean} hide</li>
         *                          <li>{Double} latitude</li>
         *                          <li>{Double} longitude</li>
         *                          <li>{Double} publishedDate</li>
         *                          <li>{Double} price</li>
         *                          <li>{Double} timestamp</li>
         *                      </ul>
         *                  </li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getGameFollowing = function(params,callback){
            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }


            var requestData = {
                size: 10,
                offset: 0
            };

            if (typeof params.size === "number") {
                requestData.size = params.size;
            }

            if (typeof params.offset === "number") {
                requestData.offset = params.offset;
            }



            __request(
                "gameFollowing",
                requestData,
                function (result) {

                    var returnData = {
                        hasError: result.HasError,
                        errorMessage: result.ErrorMessage,
                        errorCode: result.ErrorCode,
                    };
                    if (!result.HasError) {
                        var resGamesData = [];

                        var allInfo = result.Result;
                        if (allInfo) {
                            for (var i = 0; i < allInfo.length; i++) {
                                var gameData = allInfo[i];
                                var refData = __reformatGameObject(gameData);

                                if (__games[gameData.entityId]) {
                                    __games[gameData.entityId].info = refData;
                                }

                                resGamesData.push(refData);
                            }
                        }

                        returnData.result = {
                            games: resGamesData,
                            nextOffset: (requestData.offset += resGamesData.length),
                            hasNext: requestData.size == resGamesData.length,
                            count: result.Count
                        };
                    }

                    callback(returnData);
                });
        };

        /**
         * <div style='width: 100%;text-align: right'> درخواست خروج از حساب کاربری </div>
         * @method logout
         * @public
         * @deprecated
         *
         * */
        __self.logout = function (params) {
            __logoutAction({
                callback: params && params.onResult
            });
        };

        /**
         * <div style='width: 100%;text-align: right'> درخواست خروج از حساب کاربری </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      service.logoutRequest(function() {
         *              console.log("logoutRequest method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method logoutRequest
         * @public
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *      </ul>
         *
         * @throws ServiceException خطای سرویس
         * */
        __self.logoutRequest = function (callback) {
            __logoutAction({
                callback: callback
            });
        };

        /**
         * <div style='width: 100%;text-align: right'> درخواست عضویت در لیگ</div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["gameId"] =  "2";
         *      reqData["leagueId" =  "3";
         *      service.getLeaguesInfo(reqData, function() {
         *           if (!result.hasError) {
         *               var leagueData = result.result".leagues;
         *               String enrollUrl = leagueData.enrollUrl;
         *               var reqData = {};
         *               reqData["leagueId"] =  leagueData.id";
         *               reqData["enrollUrl"] =  enrollUrl;
         *               service.subscribeLeagueRequest(reqData,function() {
         *                       console.log("subscribeLeagueRequest method : " + data);
         *               });
         *           }
         *      });
         *  </code>
         * </pre>
         * @method subscribeLeagueRequest
         * @protected
         *
         * @param {Object} params
         *      <ul>
         *          <li>{String} leagueId - شناسه لیگ</li>
         *          <li>{String} enrollUrl - لینک عضویت</li>
         *          <li>{String} [voucherHash] - کد تخفیف</li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.subscribeLeagueRequest = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params not exist or not an object");
            }

            if (!params.leagueId) {
                throw new ServiceException("leagueId key is not exist");
            }

            var enrollUrl = params.enrollUrl || __leagues[params.leagueId].enrollUrl;
            var requestData = {
                leagueId: params.leagueId
            };

            if (typeof params.voucherHash == "string" && params.voucherHash.length > 0) {
                requestData.voucherHash = params.voucherHash;
            }


            var urlData = TisUtil.getQueryStringData(enrollUrl);

            __request("subscribeLeague",
                requestData,
                function (result) {

                    if (typeof callback == "function") {
                        if (!result.HasError) {
                            var leagueGameId;
                            for (var gameId in __games) {
                                var leagues = __games[gameId].leagues;
                                if (leagues[params.leagueId]) {
                                    leagueGameId = gameId;
                                    break;
                                }
                            }
                            __setLeagueUserMemberState({
                                leagueId: params.leagueId,
                                gameId: leagueGameId,
                                state: true
                            });
                        }
                        callback({
                            hasError: result.HasError,
                            errorMessage: result.ErrorMessage,
                            errorCode: result.ErrorCode,
                            result: {
                                state: !result.HasError,
                                leagueId: params.leagueId,
                                gameId: leagueGameId
                            }

                        });
                    }

                }, {
                    uri: enrollUrl.substring(0, enrollUrl.indexOf("?")),
                    url: enrollUrl,
                    parameters: urlData
                });
        };

        /**
         * <div style='width: 100%;text-align: right'>عضویت در لیگ پیش فرض یک بازی</div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["gameId"] =  "2";
         *      service.subscribeDefaultLeagueRequest(reqData, function(res) {
         *          console.log("subscribeDefaultLeagueRequest method : " + res);
         *      });
         *  </code>
         * </pre>
         * @method subscribeLeagueRequest
         * @protected
         *
         * @param {Object} params
         *      <ul>
         *          <li>{String} gameId - شناسه بازی</li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.subscribeDefaultLeagueRequest = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params not exist or not an object");
            }

            if (!params.gameId) {
                throw new ServiceException("gameId key is not exist");
            }

            __request("defaultLeagueSubscribe", {
                gameId: params.gameId
            }, function (result) {
                var hasError = result.HasError;


                var retData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage,
                    errorCode: result.ErrorCode,
                    result: null
                }

                if (!hasError) {
                    __fireEvent("defaultLeagueSubscribe", {gameId: params.gameId});

                    retData.result = __reformatLeagueObject(result.Result);
                }

                callback && callback(retData);

            });
        };

        /**
         * @method saveMessage
         * @protected
         *
         * @param {Object} params
         *      @param {String} params.messageId
         *
         * @param {Function} callback
         *      @param {Boolean} callback.hasError
         *
         * @throws {ServiceException}
         * */
        __self.saveMessage = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params not exist or not an object");
            }

            if (!params.messageId) {
                throw new ServiceException("messageId key is not exist");
            }

            var msgData = __messagesData[params.messageId];
            if (msgData) {

                if (msgData.content && msgData.content.metaData) {
                    var chatMessageId = msgData.content.metaData.chatMessageId;
                    if (chatMessageId && __chatService) {
                        __chatService.seen({
                            messageId: chatMessageId
                        })
                    }
                }
                __database.addToTable({
                    name: __databaseParams.tableName.uiMessage,
                    data: [{
                        index: params.messageId,
                        value: {
                            userId: __userData.id,
                            type: msgData.type,
                            content: JSON.stringify(msgData.content)
                        }
                    }],
                    onComplete: function (e) {
                        if (typeof callback == "function") {
                            callback({
                                hasError: false
                            });
                        }
                    },
                    onError: function (e) {
                        if (typeof callback == "function") {
                            callback({
                                hasError: true
                            });
                        }
                    }
                });
            } else {
                if (typeof params.onResult == "function") {
                    params.onResult({
                        hasError: true
                    });
                }
            }

        };

        /**
         * @method deleteMessage
         * @protected
         *
         * @param {Object} params
         *      @param {String} params.messageId
         *
         * @param {Function} callback
         *      @param {Boolean} callback.hasError
         *
         * @throws {ServiceException}
         * */
        __self.deleteMessage = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params not exist or not an object");
            }

            if (!params.messageId) {
                throw new ServiceException("messageId key is not exist");
            }

            __database.removeFromTable({
                name: __databaseParams.tableName.uiMessage,
                index: params.messageId,
                onSuccess: function (e) {
                    if (typeof callback == "function") {
                        callback({
                            hasError: false
                        });
                    }
                },
                onError: function (e) {
                    if (typeof callback == "function") {
                        callback({
                            hasError: true
                        });
                    }
                }
            });
        };

        /**
         * @method generateImageUrl
         * @public
         *
         * @param {Object} params
         *      @param {Number} params.id
         *      @param {Number} [params.width]
         *      @param {Number} [params.height]
         *
         * @return {String} image url
         * */
        __self.generateImageUrl = function (params) {
            return TisUtil.generateImageUrl({
                imgId: params.id,
                size: {
                    width: params.width || __configData.disw,
                    height: params.height || __configData.dish
                },
                imageServerAddress: __serverData.IMAGE.address
            });
        };

        /**
         * <div style='width: 100%;text-align: right'>درخواست اضافه شدن به لیست حریف می طلبم</div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *       var reqData = {};
         *       reqData["leagueId"] =  leagueId;
         *       reqData["gameId"] = gameId;
         *       service.quickMatchRequest(reqData, {
         *           onResult : function(result) {
         *               console.log("quickMatchRequest method -- onResult : " + result);
         *           }
         *           onCancel : function(data) {
         *               console.log("quickMatchRequest method -- onCancel : " + data);
         *           }
         *           onAccept : function(data) {
         *               console.log("quickMatchRequest method -- onAccept : " + data);
         *           }
         *       });
         *  </code>
         * </pre>
         * @method quickMatchRequest
         * @protected
         * @param {Object} params
         *      <ul>
         *          <li>{String} gameId - شناسه بازی</li>
         *          <li>{String} leagueId - شناسه لیگ</li>
         *      </ul>
         *
         * @param {Object} callbacks
         *
         *      @param {Function} callbacks.onCancel
         *              @param {Number} callbacks.onCancel.leagueId
         *              @param {String} callbacks.onCancel.message
         *
         *      @param {Function} callbacks.onResult
         *              @param {Boolean} callbacks.onResult.hasError
         *              @param {String} callbacks.onResult.errorMessage
         *              @param {Object} callbacks.onResult.result
         *
         * @throws {ServiceException}
         * */
        __self.quickMatchRequest = function (params, callbacks) {

            if (typeof params != "object") {
                throw new ServiceException("params not exist or not an object");
            }

            if (!params.leagueId) {
                throw new ServiceException("leagueId key is not exist");
            }
            if (!params.gameId) {
                throw new ServiceException("gameId key is not exist");
            }

            if (typeof callbacks != "object") {
                throw new ServiceException("callbacks not exist or not an object");
            }

            if (typeof callbacks.onResult != "function") {
                throw new ServiceException("callbacks onResult is not exist");
            }

            if (!__network.getSocketConnectionState()) {
                callbacks.onResult({
                    hasError: true,
                    errorMessage: __dic.CONNECTINGTOPUSH[__lang]
                });
                return;
            }

            var leagueId = params.leagueId,
                gameId = params.gameId,
                data = {
                    peerId: __userData.peerId,
                    leagueId: leagueId
                };

            if (!__isMultiTab &&
                (__isGameRun() || __currentMatchRequestCount > 0 || __quickMatchData.requestCount > 0)
            ) {

                var errorMessage = __dic.CANTNOTREQUESTINPLAING[__lang];
                if (__currentMatchRequestCount > 0 || __quickMatchData.requestCount > 0) {
                    errorMessage = __dic.WAITFORPREVIOUSREQUEST[__lang];
                }


                callbacks.onResult({
                    hasError: true,
                    errorMessage: errorMessage
                });
                return;
            }


            if (!__quickMatchData.leagues[leagueId]) {
                __quickMatchData.leagues[leagueId] = {
                    state: true,
                    onAccept: callbacks.onAccept,
                    onCancel: callbacks.onCancel
                }
            } else {
                if (__quickMatchData.leagues[leagueId].state) {
                    return;
                }
                __quickMatchData.leagues[leagueId].state = true;
                __quickMatchData.leagues[leagueId].onAccept = callbacks.onAccept;
            }
            __quickMatchData.requestCount += 1;
            __quickMatchData.lastLeagueId = leagueId;


            function quickRequest(isRepeat) {
                __request(
                    "requestQuickMatch",
                    data,
                    function (result) {
                        if (!isRepeat) {
                            callbacks.onResult({
                                hasError: result.HasError,
                                errorMessage: result.ErrorMessage
                            });
                        }
                        if (!result.HasError) {
                            __quickMatchData.leagues[leagueId].timeoutId = setTimeout(function () {
                                if (__quickMatchData.leagues[leagueId].state) {
                                    quickRequest(true);
                                }
                            }, __configData.qmt);
                        } else {
                            if (isRepeat) {
                                callbacks.onCancel && callbacks.onCancel({
                                    leagueId: leagueId,
                                    message: __dic.NOTOPPONENTFIND[__lang],
                                    state: __quickMatchData.leagues[leagueId].state
                                });
                            }
                            __quickMatchData.requestCount -= 1;
                            __quickMatchData.lastLeagueId = undefined;
                            __quickMatchData.leagues[leagueId].state = false;
                        }
                    });
            }

            quickRequest(false);
        };

        /**
         * <div style='width: 100%;text-align: right'>درخواست حذف از لیست حریف می طلبم</div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["leagueId"] = "3";
         *      service.cancelQuickMatchRequest(reqData, function() {
         *              console.log("cancelQuickMatchRequest method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method cancelQuickMatchRequest
         * @protected
         * @param {Object} params
         *      <ul>
         *          <li>{String} leagueId - شناسه بازی</li>
         *      </ul>
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.cancelQuickMatchRequest = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params not exist or not an object");
            }

            if (!params.leagueId) {
                throw new ServiceException("leagueId key is not exist");
            }

            var data = {
                peerId: __userData.peerId,
                leagueId: params.leagueId
            };

            __request(
                "cancelQuickMatch",
                data,
                function (result) {
                    var returnData = {
                        hasError: result.HasError,
                        errorMessage: result.ErrorMessage,
                        result: result.Result
                    };
                    var quickData = __quickMatchData.leagues[params.leagueId];
                    if (!result.HasError && quickData) {
                        var timeoutId = quickData.timeoutId;
                        if (timeoutId) {
                            clearTimeout(timeoutId);
                            quickData.timeoutId = false;
                        }
                        if (typeof quickData.onCancel == "function") {
                            quickData.onCancel({
                                leagueId: params.leagueId,
                                message: "",
                                state: true
                            });
                        }
                        quickData.state = false;
                        __quickMatchData.requestCount -= 1;
                        __quickMatchData.lastLeagueId = undefined;
                    }

                    if (typeof callback == "function") {
                        callback(returnData);
                    }
                });

        };

        /**
         * @method getQuickMatchState
         * @protected
         * @param {Object} params
         *      @param {Number} params.leagueId
         *
         * @return {Boolean} state
         * @throws {ServiceException}
         * */
        __self.getQuickMatchState = function (params) {
            if (typeof params != "object") {
                throw new ServiceException("params not exist or not an object");
            }

            if (!params.leagueId) {
                throw new ServiceException("leagueId key is not exist");
            }

            var leagueId = params.leagueId;

            return __quickMatchData.leagues[leagueId] != undefined ? __quickMatchData.leagues[leagueId].state : false;
        };

        /**
         * <div style='width: 100%;text-align: right'> جست و جو در بین کاربران گیم سنتر </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["name"] =  "ali";
         *      reqData["size"] = 10;
         *      reqData["offset"] =  0;
         *      service.searchUserRequest(reqData, function() {
         *              console.log("searchUserRequest method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method searchUserRequest
         * @public
         *
         * @param {Object} params
         *      <ul>
         *          <li>{String} name - نام مستعار</li>
         *          <li>{Integer} [size=5]</li>
         *          <li>{Integer} [offset=0]</li>
         *          <li>{JSONObject} [setting]
         *              <ul>
         *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر کاربر</li>
         *                  <li>{Integer} [imageHeight] اندازه رزولیشن عمودی تصویر کاربر</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{JSONObject} users - JSONObject(key is userId) of JSONObject that  :
         *                      <ul>
         *                          <li>{String} name</li>
         *                          <li>{JSONObject} [image]
         *                              <ul>
         *                                  <li>{String}  id</li>
         *                                  <li>{String}  url</li>
         *                                  <li>{Integer} width</li>
         *                                  <li>{Integer} height</li>
         *                              </ul>
         *                          </li>
         *                      </ul>
         *                  </li>
         *                  <li>{Boolean} hasNext </li>
         *                  <li>{Integer} nextOffset  </li>
         *                  <li>{Integer} count  </li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.searchUserRequest = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params not exist or not an object");
            }

            if (!params.name) {
                throw new ServiceException("name key is not exist");
            }

            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }

            var requestData = {
                query: params.name
            };

            var setting = {
                imageWidth: (params.setting && params.setting.imageWidth ) ?
                    params.setting.imageWidth :
                    __configData.disw,

                imageHeight: (params.setting && params.setting.imageHeight ) ?
                    params.setting.imageHeight :
                    __configData.disw
            };

            if (params.size != undefined) {
                requestData.size = params.size;
            } else {
                requestData.size = __configData.gsus;
            }

            if (params.offset != undefined) {
                requestData.offset = params.offset;
            } else {
                requestData.offset = 0;
            }

            if (__lastSearchUserTime) {
                var searchTimeInterval = new Date() - __lastSearchUserTime;

                if (searchTimeInterval > __configData.searchto) {
                    __searchUser(requestData, setting, callback);
                } else {
                    if (__lastSearchTimeoutId) {
                        clearTimeout(__lastSearchTimeoutId);
                    }
                    __lastSearchTimeoutId = setTimeout(function () {
                        __searchUser(requestData, setting, callback);
                    }, __configData.searchto - searchTimeInterval);
                }

            } else {
                __searchUser(requestData, setting, callback);
            }
        };

        /**
         * <div style='width: 100%;text-align: right'>اشتراک گزاری یک لیگ و یا بازی </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["gameId"] = "2";
         *      var userIds = ["5"];
         *      reqData["userIds"] = userIds;
         *
         *      service.shareRequest(reqData, function() {
         *              console.log("shareRequest method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method share
         * @protected
         *
         * @param {Object} params
         *      <p>one of the leagueId or gameIs should be exist in params</p>
         *      <ul>
         *          <li>{String} [gameId] -  شناسه بازی
         *              <p> یکی از فیلد های شناسه بازی و یا لیگ باید پر شود</p>
         *          </li>
         *          <li>{String} [leagueId] - شناسه لیگ</li>
         *          <li>{JSONArray} [cellphoneNumbers] - لیست شماره تماس کاربران </li>
         *          <li>{JSONArray} [userIds] - لیست شناسه کاربران</li>
         *          <li>{Boolean} [sendSms=false] - تعیین ارسال از طریق اس ام اس </li>
         *          <li>{JSONObject} [setting]
         *              <ul>
         *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر کاربر</li>
         *                  <li>{Integer} [imageHeight] اندازه رزولیشن عمودی تصویر کاربر</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.shareRequest = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params not exist or not an object");
            }

            if (!(params.gameId || params.leagueId)) {
                throw new ServiceException("gameId key or leqgueId key is not exist");
            }

            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }


            if (!params) {
                params = {};
            }

            var numbers = params.cellphoneNumbers,
                shareUrl;

            if (params.gameId) {
                shareUrl = __configData.bglp + params.gameId;
            } else if (params.leagueId) {
                shareUrl = __configData.bllp + params.leagueId;
            }

            if (params.sendSms || params.shareSocial) {

                var data = {},
                    message;
                if (params.gameId) {
                    message = __dic.SHAREGAMEMESSAGE[__lang].replace("$VAR", shareUrl);
                } else if (params.leagueId) {
                    message = __dic.SHARELEAGUEMESSAGE[__lang].replace("$VAR", shareUrl);
                }

                if (params.sendSms) {
                    var url = "smsto:";
                    if (Array.isArray(numbers)) {
                        for (var i = 0; i < numbers.length; i++) {
                            url += (numbers + ",");
                        }
                    }
                    data.url = url;
                    data.action = TIS.Plugin.ACTION_VIEW;
                    data.extras = {
                        sms_body: message
                    }

                }

                if (params.shareSocial) {
                    data.type = "text/plain";
                    data.action = TIS.Plugin.ACTION_SEND;
                    data.extras = {};
                    data.extras[TIS.Plugin.EXTRA_TEXT] = message
                }
                TIS.Plugin.startActivity(
                    data,
                    function () {
                        //__logger.info('success to open URL via Android Intent')();
                        callback({
                            hasError: false,
                            errorMessage: ""
                            //result: result.Result
                        });
                    },
                    function () {
                        //__logger.info('Failed to open URL via Android Intent')();
                        callback({
                            hasError: true,
                            errorMessage: __dic.ERRORINPROCESS[__lang]
                            //result: result.Result
                        });
                    }
                );

                return;
            }


            var requestData = {
                sendSms: (typeof params.sendSms == "boolean") ? params.sendSms : false,
                url: shareUrl
            };

            if (Array.isArray(numbers)) {
                requestData.cellphoneNumbers = JSON.stringify(numbers);
            }

            if (Array.isArray(params.userIds)) {
                requestData.usersId = JSON.stringify(params.userIds);
            }

            __request("share", requestData, function (result) {
                callback({
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage,
                    result: result.Result
                });
            });
        };

        /**
         * @method increaseCredit
         * @public
         * @deprecated
         *
         * */
        __self.increaseCredit = function () {
            var pageLink = __configData.icu + __userData.token;
            TisUtil.openUrl(pageLink);

        };

        /**
         * <div style='width: 100%;text-align: right'>دریافت آدرس افزایش اعتبار</div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var  data = {};
         *      data["creditPackId"] = "****";
         *      data["leagueId"] = "****";
         *      var url = service.generateIncreaseCreditUrl(data);
         *  </code>
         *
         * </pre>
         *
         * @method generateIncreaseCreditUrl
         * @public
         *
         * @param {Object} params
         *      @param {Number|String} params.creditPackId
         *      @param {Number|String} [params.packId]
         *      @param {Number|String} [params.leagueId]
         *
         * @return String
         * */
        __self.generateIncreaseCreditUrl = function (params) {
            if (typeof params != "object") {
                throw new ServiceException("params not exist or not an object");
            }

            if (!params.creditPackId) {
                throw new ServiceException("creditPackId not exist");
            }

            var pageLink = __configData.icu + "?_token=" + __userData.token + "&creditPackQuantity=1&";

            pageLink += ("creditPackId=" + params.creditPackId);

            if (params.packId) {
                pageLink += ("&packId=" + params.packId);
            }

            if (params.leagueId) {
                pageLink += ("&leagueId=" + params.leagueId);
            }
            return pageLink;
        };

        /**
         * <div style='width: 100%;text-align: right'>افزایش اعتبار با استفاده از کد تخفیف </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["voucherHash"] =  "voucherHash";
         *      service.increaseCreditWithVoucherRequest(reqData, function() {
         *              console.log("increaseCreditWithVoucherRequest method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method increaseCreditWithVoucherRequest
         * @protected
         *
         * @param {Object} params
         *      <ul>
         *          <li>{String} voucherHash - کد تخفیف</li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{Long} credit  میزان اعتبار</li>
         *                  <li>{String} creditText  میزات اعتبار به همراه واخد</li>
         *                  <li>{String} unitText  نام واحد اعتبار</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.increaseCreditWithVoucherRequest = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params not exist or not an object");
            }

            if (!params.voucherHash) {
                throw new ServiceException("voucherHash key is not exist");
            }

            __request("increaseCreditByVoucher", params, function (result) {
                var res;

                if (!result.HasError && result.Result) {
                    var credit = result.Result / __configData.cf;
                    res = {
                        credit: credit,
                        creditText: credit + "&nbsp" + __configData.cu,
                        unitText: __configData.cu
                    };

                    __fireEvent("creditChange", res);
                }

                if (typeof callback == "function") {
                    callback({
                        hasError: result.HasError,
                        errorCode: result.ErrorCode,
                        errorMessage: result.ErrorMessage,
                        result: res
                    });
                }

            });
        };

        /**
         * <div style='width: 100%;text-align: right'> دریافت میزان جایزه لیگ </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["leagueId"] =  leagueId;
         *
         *      service.getLeagueAwards(reqData, function() {
         *              console.log("getLeagueAwards method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getLeagueAwards
         * @protected
         *
         * @param {Object} params
         *      <ul>
         *          <li>{String} leagueId - شناسه لیگ</li>
         *      </ul>
         *
         * @param {Function} callback
         *      <p>onResult method params is JSONObject that has</p>
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONArray} result -  Array of JSONObject that contain :
         *              <ul>
         *                  <li>{Integer} rank - رتبه دریافت کننده جایزه</li>
         *                  <li>{String} description - توضیحات</li>
         *                  <li>{Double} value - میزان جایزه</li>
         *                  <li>{String} textValue - میزان جایزه به همراه واحد آن</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getLeagueAwards = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params not exist or not an object");
            }

            if (!params.leagueId) {
                throw new ServiceException("leagueId key is not exist");
            }

            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }

            __request("leagueAwards", params, function (result) {

                var res = [];
                if (!result.HasError && Array.isArray(result.Result)) {

                    for (var i = 0; i < result.Result.length; i++) {
                        var value = result.Result[i].value / __configData.cf;
                        var textValue = value + __configData.cu;
                        res.push({
                            rank: i + 1,
                            description: "جایزه نفر " + ( i + 1 ) + +textValue,
                            value: value,
                            textValue: textValue,
                            unitText: __configData.cu
                        });
                    }
                }
                callback({
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage,
                    result: res
                });
            });
        };

        /**
         * <div style='width: 100%;text-align: right'> تغییر رمز عبور</div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *       var reqData = {};
         *       reqData["oldPass"] =  "oldPass";
         *       reqData["newPass"] =  "newPass";
         *       reqData["confirmPass"] = "confirmPass";
         *       service.changePassword(reqData, function() {
         *               console.log("changePassword method : " + result);
         *       });
         *  </code>
         * </pre>
         * @method changePasswordRequest
         * @public
         *
         * @param {Object} params
         *      <ul>
         *          <li>{String} oldPass - رمز قدیمی </li>
         *          <li>{String} newPass - رمز جدید</li>
         *          <li>{String} confirmPass - تکرار رمز جدید</li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.changePasswordRequest = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params not exist or not an object");
            }

            if (!params.oldPass) {
                throw new ServiceException("oldPass key is not exist");
            }

            if (!params.newPass) {
                throw new ServiceException("newPass key is not exist");
            }

            if (!params.confirmPass) {
                throw new ServiceException("confirmPass key is not exist");
            }

            __request("changePassword", params, function (result) {
                if (typeof callback == "function") {
                    callback && callback({
                        hasError: result.HasError,
                        errorMessage: result.ErrorMessage
                    });
                }
            });
        };

        /**
         * <div style='width: 100%;text-align: right'> ویرایش پروفایل</div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["nickName"] = "nickName";
         *      service.editProfileRequest(reqData, function() {
         *              console.log("editProfile method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method editProfileRequest
         * @protected
         *
         * @param {Object} params
         *      <ul>
         *          <li>{String} nickName - نام مستعار</li>
         *          <li>{String} [email] - ایمیل</li>
         *          <li>{String} [firstName] - نام</li>
         *          <li>{String} [lastName] - نام خانوادگی</li>
         *          <li>{String} [gender] زن=WOMAN_GENDER  مرد=MAN_GENDER  جنسیت</li>
         *          <li>{JSONObject} [setting]
         *              <ul>
         *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر کاربر</li>
         *                  <li>{Integer} [imageHeight] اندازه رزولیشن عمودی تصویر کاربر</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @param {Function} callback
         *      <p>onResult method params is JSONObject that has</p>
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{Double} birthDate</li>
         *                  <li>{Double} joinDate</li>
         *                  <li>{Double} score</li>
         *                  <li>{Double} sheba</li>
         *                  <li>{String} [cellphoneNumber]</li>
         *                  <li>{String} [email]</li>
         *                  <li>{String} [firstName]</li>
         *                  <li>{String} [lastName]</li>
         *                  <li>{String} [name]</li>
         *                  <li>{String} nickName</li>
         *                  <li>{String} [gender]</li>
         *                  <li>{Integer} followingCount</li>
         *                  <li>{JSONObject} image
         *                      <ul>
         *                          <li>{String} id</li>
         *                          <li>{String} url</li>
         *                          <li>{Integer} width</li>
         *                          <li>{Integer} height</li>
         *                      </ul>
         *                  </li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.editProfileRequest = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params not exist or not an object");
            }

            if (!params.nickName) {
                throw new ServiceException("nickName key is not exist");
            }

            __request("editProfile", params, function (result) {

                if (!result.HasError) {

                    var uData = result.Result;
                    __userData.name = uData.nickName;

                    if (uData.email) {
                        __userData.email = uData.email;
                    }
                    if (uData.firstName) {
                        __userData.firstName = uData.firstName;
                    }
                    if (uData.lastName) {
                        __userData.lastName = uData.lastName;
                    }
                    if (uData.gender) {
                        __userData.gender = uData.gender;
                    }

                    __setDataToStorage({storageStore: true, sessionStore: true});

                    __fireEvent("profileChange", __userData);
                }
                if (typeof callback == "function") {

                    var returnResult = {
                        hasError: result.HasError,
                        errorMessage: result.ErrorMessage
                    };

                    if (!result.HasError) {

                        var retResult = result.Result;

                        if (typeof retResult.imageInfo == "object" && retResult.imageInfo != null) {
                            var image = retResult.imageInfo;
                            retResult.image = image;
                            delete  retResult.imageInfo;
                        }
                        returnResult.result = retResult;
                    }
                    callback(returnResult);
                }


            });
        };

        /**
         * <div style='width: 100%;text-align: right'> دریافت پک های بازی </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["gameId"] =  "2";
         *      service.getInAppPurchasePack(reqData, function() {
         *              console.log("getInAppPurchasePack method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getInAppPurchasePack
         * @protected
         *
         * @param {Object} params
         *      <ul>
         *          <li>{String} gameId - شناسه بازی </li>
         *          <li>{Integer} [size=5]</li>
         *          <li>{Integer} [offset=0]</li>
         *          <li>{String} [packId] - شناسه پک</li>
         *          <li>{String} [itemId] - شناسه آیتم</li>
         *          <li>{String} [nameFilter] - فیلتر بر اساس نام پک</li>
         *          <li>{JSONObject} [setting]
         *              <ul>
         *                  <li>{Integer} [imageWidth] اندازه رزولیشن افقی تصویر پک</li>
         *                  <li>{Integer} [imageHeight] اندازه رزولیشن عمودی تصویر پک</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @param {Function} callback
         *      <p>onResult method params is JSONObject that has</p>
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{JSONArray} packs - آرایه ای از آبجک  :
         *                      <ul>
         *                          <li>{String} id - شناسه پک</li>
         *                          <li>{String} name - نام پک</li>
         *                          <li>{String} description - توضیحات</li>
         *                          <li>{Integer} count - تعداد</li>
         *                          <li>{Boolean} visible</li>
         *                          <li>{Boolean} enable</li>
         *                          <li>{Boolean} allowedTimesToBuy</li>
         *                          <li>{JSONObject} item</li>
         *                          <li>{JSONObject} plan</li>
         *                              <li>{String} id</li>
         *                              <li>{Integer} type</li>
         *                              <li>{Integer} cycle</li>
         *                              <li>{Double} fromDate</li>
         *                              <li>{Double} ToDate</li>
         *                          <li>{Double} price - قیمت</li>
         *                          <li>{String} priceText - قیمت به همراه واحد آن</li>
         *                          <li>{String} priceUnit - واحد قیمت</li>
         *                          <li>{JSONObject} [image]
         *                              <ul>
         *                                  <li>{String} id</li>
         *                                  <li>{String} url</li>
         *                                  <li>{Integer} width</li>
         *                                  <li>{Integer} height</li>
         *                              </ul>
         *                          </li>
         *                      </ul>
         *                  </li>
         *                  <li>{Boolean} hasNext</li>
         *                  <li>{Integer} nextOffset</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getInAppPurchasePack = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params not exist or not an object");
            }

            if (!params.gameId && !params.itemId) {
                throw new ServiceException("one of the gameId or itemId key should be exist.");
            }

            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }


            var data = {};

            if (params.gameId) {
                data.entityId = params.gameId;
            }

            if (typeof params.size == "number") {
                data.size = params.size;
            } else {
                data.size = 10;
            }

            if (typeof params.offset == "number") {
                data.offset = params.offset;
            } else {
                data.offset = 0;
            }

            if (typeof params.packId != "undefined") {
                data.packId = params.packId;
            }

            if (typeof params.itemId != "undefined") {
                data.itemId = params.itemId;
            }

            __request("getInAppPurchasePack", data, function (result) {

                var retData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage
                };

                if (!result.HasError) {

                    var packs = [];
                    if (Array.isArray(result.Result)) {
                        for (var i = 0; i < result.Result.length; i++) {
                            packs.push(__reformatInAppPack(result.Result[i]));
                        }
                    }

                    retData.result = {
                        packs: packs,
                        nextOffset: (data.offset += packs.length),
                        hasNext: data.size == packs.length
                    }
                }
                callback(retData);

            });
        };

        /**
         * <div style='width: 100%;text-align: right'> دریافت پک های گیم سنتری </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["itemId"] =  "4455";
         *      service.getGlobalInAppPurchasePack(reqData, function() {
         *              console.log("getGlobalInAppPurchasePack method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getGlobalInAppPurchasePack
         * @protected
         *
         * @param {Object} params
         *      <ul>
         *          <li>{Integer} [size=5]</li>
         *          <li>{Integer} [offset=0]</li>
         *          <li>{String} [itemId] - شناسه آیتم</li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{JSONArray} packs - آرایه ای از آبجک  :
         *                      <ul>
         *                          <li>{String} id - شناسه پک</li>
         *                          <li>{String} name - نام پک</li>
         *                          <li>{String} description - توضیحات</li>
         *                          <li>{Integer} count - تعداد</li>
         *                          <li>{Boolean} visible</li>
         *                          <li>{Boolean} enable</li>
         *                          <li>{Boolean} allowedTimesToBuy</li>
         *                          <li>{JSONObject} item</li>
         *                          <li>{JSONObject} plan</li>
         *                              <li>{String} id</li>
         *                              <li>{Integer} type</li>
         *                              <li>{Integer} cycle</li>
         *                              <li>{Double} fromDate</li>
         *                              <li>{Double} ToDate</li>
         *                          <li>{Double} price - قیمت</li>
         *                          <li>{String} priceText - قیمت به همراه واحد آن</li>
         *                          <li>{String} priceUnit - واحد قیمت</li>
         *                          <li>{JSONObject} [image]
         *                              <ul>
         *                                  <li>{String} id</li>
         *                                  <li>{String} url</li>
         *                                  <li>{Integer} width</li>
         *                                  <li>{Integer} height</li>
         *                              </ul>
         *                          </li>
         *                      </ul>
         *                  </li>
         *                  <li>{Boolean} hasNext</li>
         *                  <li>{Integer} nextOffset</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getGlobalInAppPurchasePack = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params not exist or not an object");
            }

            if (!params.itemId) {
                throw new ServiceException("itemId key should be exist.");
            }

            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }

            var data = {
                itemId: params.itemId
            };

            if (typeof params.size == "number") {
                data.size = params.size;
            } else {
                data.size = 10;
            }

            if (typeof params.offset == "number") {
                data.offset = params.offset;
            } else {
                data.offset = 0;
            }


            __request("getGlobalInAppPurchasePack", data, function (result) {

                var retData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage
                };

                if (!result.HasError) {
                    var packs = [];
                    if (Array.isArray(result.Result)) {
                        for (var i = 0; i < result.Result.length; i++) {
                            packs.push(__reformatInAppPack(result.Result[i]));
                        }
                    }

                    retData.result = {
                        packs: packs,
                        nextOffset: (data.offset += packs.length),
                        hasNext: data.size == packs.length
                    }
                }
                callback(retData);
            });
        };

        /**
         * <div style='width: 100%;text-align: right'> دریافت آیتم های یک بازی </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["gameId"] = "2";
         *      service.getGameItems(reqData, function() {
         *              console.log("getGameItems method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getGameItems
         * @public
         *
         * @param {Object} params
         *      <ul>
         *          <li>{String} gameId - شناسه بازی</li>
         *          <li>{Integer} [size=5]</li>
         *          <li>{Integer} [offset=0]</li>
         *          <li>{String} [itemId] - شناسه آیتم
         *              <p> در صورت پر کردن این فیلد , آیتم مشخص شده باز گردانده می شود و در غیر اینصورت کلیه آیتم های آن بازی</p>
         *          </li>
         *      </ul>
         *
         *  @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{JSONArray} packs - Array Of JSONObject that contain :
         *                      <ul>
         *                          <li>{String} id</li>
         *                          <li>{String} name</li>
         *                          <li>{String} description</li>
         *                          <li>{Boolean} visible</li>
         *                          <li>{Boolean} enable</li>
         *                          <li>{Boolean} allowedTimesToBuy</li>
         *                          <li>{JSONObject} [image]
         *                              <ul>
         *                                  <li>{String} id</li>
         *                                  <li>{String} url</li>
         *                                  <li>{Integer} width</li>
         *                                  <li>{Integer} height</li>
         *                              </ul>
         *                          </li>
         *                      </ul>
         *                  </li>
         *                  <li>{Boolean} hasNext</li>
         *                  <li>{Integer} nextOffset</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getGameItems = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params not exist or not an object");
            }

            if (!params.gameId) {
                throw new ServiceException("gameId key is not exist");
            }

            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }

            var data = {
                entityId: params.gameId
            };
            if (typeof params.size == "number") {
                data.size = params.size;
            } else {
                data.size = 10;
            }

            if (typeof params.offset == "number") {
                data.offset = params.offset;
            } else {
                data.offset = 0;
            }

            if (typeof params.itemId != "undefined") {
                data.itemId = params.itemId;
            }

            __request("getGameItems", data, function (result) {

                var retData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage
                };

                if (!result.HasError) {
                    var items = [];
                    if (Array.isArray(result.Result)) {
                        for (var i = 0; i < result.Result.length; i++) {
                            items.push(__reformatGameItem(result.Result[i]));
                        }
                    }

                    retData.result = {
                        items: items,
                        nextOffset: (data.offset += items.length),
                        hasNext: data.size == items.length
                    }
                }
                callback(retData);

            });
        };
        __self.getGameItem = __self.getGameItems;

        /**
         * <div style='width: 100%;text-align: right'>دریافت اطلاعات پست یک بیزینس</div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["businessId"] = "26";
         *      reqData["metadata"] = "myPost";
         *      service.getCustomPost(reqData, function() {
         *              console.log("getCustomPost method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getCustomPost
         * @public
         *
         * @param {Object} params
         *      <ul>
         *          <li>{String} businessId</li>
         *          <li>{String} metadata</li>
         *          <li>{String} [id]</li>
         *      </ul>
         *
         *  @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result</li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getCustomPost = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params not exist or not an object");
            }

            if (!params.businessId) {
                throw new ServiceException("businessId key is not exist");
            }


            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }


            var requestData = {
                businessId: params.businessId
            };

            if(params.metadata) {
                var keys = [];
                var values = [];
                for(var key in params.metadata) {
                    keys.push(key);
                    values.push(params.metadata[key]);
                }

                requestData.keys = keys;
                requestData.values = values;
            }

            if(params.id) {
                requestData.id = params.id;
            }
            __request("customPost", requestData, function (result) {
                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage,
                    result: result.Result
                };
                callback(returnData);
            });
        };

        /**
         * <div style='width: 100%;text-align: right'>دریافت یک نمومه از کلاس چت سرویس</div>
         * <pre>
         *     <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *        var chatService = service.getChatService();
         *  </code>
         * </pre>
         * @method getChatService
         * @public
         *
         *  @return {Function} ChatService
         * */
        __self.getChatService = function () {
            return __chatService;
        };

        /**
         * <div style='width: 100%;text-align: right'>تولید آدرس کامل عکس</div>
         * @method generateImageSrc
         * @public
         *
         * @param {Object} imageData
         *      @param {String} imageData.id
         *      @param {String} [imageData.hashCode]
         * @param {Object} size
         *      @param {Integer} size.width
         *      @param {Integer} size.height
         *  @return {String} url
         * */
        __self.generateImageSrc = function (imageData, size) {
            return __generateImageSrc(imageData, size)
        };

        /**
         * <div style='width: 100%;text-align: right'>ثبت نام به صورت مهمان</div>
         * <pre>
         *    <code style='float:right'>نمونه کد</code>
         *    <code>
         *
         *        service.registerGuestRequest(function() {
         *                console.log("registerGuestRequest method -- onResult " + result);
         *        });
         *    </code>
         * </pre>
         * @method registerGuestRequest
         * @public
         *
         * @param {Object} params
         * @param {Function} callback
         *  <ul>
         *      <li>{Boolean} hasError</li>
         *      <li>{String} errorMessage</li>
         *      <li>{Integer} errorCode</li>
         *      <li>{Boolean} loginState </li>
         *      <li> {JSONObject} result
         *          <ul>
         *              <li>{String} id</li>
         *              <li>{String} name</li>
         *              <li>{String} token</li>
         *          </ul>
         *      </li>
         *  </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.registerGuestRequest = function (params, callback) {

            if (arguments.length == 1 && typeof params == "function") {
                callback = params;
            }
            var requestData = {};
            if (__userData.deviceId) {
                requestData.deviceId = __userData.deviceId;
            }

            if (__userData.peerId) {
                __syncPeerWithToken = true;
                requestData.peerId = __userData.peerId;
            }
            __request("registerGuest", requestData, function (result) {
                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage,
                    loginState: false
                };
                if (!result.HasError && result.Result) {
                    returnData.loginState = true;
                    var setting = {
                        sessionStore: true,
                        storageStore: true
                    };

                    var retResult = {
                        name: result.Result.Name,
                        token: result.Result.Token,
                        id: result.Result.UserID
                    };

                    var image;
                    if (result.Result.Image && result.Result.Image.id) {
                        image = {
                            id: result.Result.Image.id,
                            hashCode: result.Result.Image.hashCode,
                            width: result.Result.Image.width,
                            height: result.Result.Image.height,
                        };
                        retResult.image = {
                            id: image.id,
                            width: image.width,
                            height: image.height,
                            url: image.url,
                            hashCode: image.hashCode
                        };
                        returnData.result = retResult;
                    }

                    __loginAction({
                        name: result.Result.Name,
                        token: result.Result.Token,
                        id: result.Result.UserID,
                        image: image,
                        guest: true
                    }, setting);
                    __checkPeerAndSocketSync();
                }

                if (typeof callback == "function") {
                    callback(returnData);
                }

            });
        };

        /**
         * @method getServerTime
         * @public
         *
         * @param {Object} [params]
         *      @param {Boolean} [params.absolute=false]
         *
         *
         *
         * @param {Function} callback
         *       @param {Boolean} callback.hasError
         *       @param {String} callback.errorMessage
         *       @param {Object} callback.result
         *          @param {Date} callback.result.time
         *
         *
         * */
        __self.getServerTime = function (params, callback) {

            var absolute = false;
            if (params && typeof params.absolute == "boolean") {
                absolute = params.absolute;
            }

            if (__serverTime && !absolute) {
                callback({
                    hasError: false,
                    errorMessage: "",
                    result: {
                        time: __serverTime
                    }
                });
            } else {
                __request(__configUrl, {}, function (result) {
                    if (!result.HasError) {
                        callback({
                            hasError: false,
                            errorMessage: "",
                            result: {
                                time: __serverTime
                            }
                        });
                    } else {
                        callback({
                            hasError: result.HasError,
                            errorMessage: result.ErrorMessage
                        });
                    }

                });
            }
        };

        /**
         * <div style='width: 100%;text-align: right'>اعلام امتیاز کاربر به لیگ</div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["leagueId"] = "26";
         *      reqData["rate"] = "4";
         *      service.getEnrollAccess(reqData, new RequestCallback() {
         *              console.log("getEnrollAccess method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method sendLeagueRateRequest
         * @public
         *
         * @param {Object} params
         *      <ul>
         *          <li>{String} leagueId شناسه لیگ</li>
         *          <li>{Integer} rate امتیاز کاربر</li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result</li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.sendLeagueRateRequest = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params not exist or not an object");
            }

            if (!params.leagueId) {
                throw new ServiceException("leagueId key is not exist");
            }

            if (typeof params.rate != "number") {
                throw new ServiceException("rate is not number");
            }

            if (params.rate < 0) {
                throw new ServiceException("rate should be greather than 0");
            }

            __request("leagueRate", {entityId: params.leagueId, rate: params.rate}, function (result) {
                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage,
                    result: result.Result
                };
                callback(returnData);
            });
        };

        /**
         * <div style='width: 100%;text-align: right'> دریافت لیست پک های شارژ</div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["fromAmount"] = 20000;
         *      service.getCreditPackList(reqData, function() {
         *              console.log("getCreditPackList method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getCreditPackList
         * @public
         *
         * @param {Object} params
         *      <ul>
         *          <li>{Integer} [size=20]</li>
         *          <li>{Integer} [offset=0]</li>
         *          <li>{Integer} [fromAmount]</li>
         *          <li>{String} [name]</li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{JSONArray} packs - Array Of JSONObject that contain :
         *                      <ul>
         *                          <li>{String} id</li>
         *                          <li>{String} name</li>
         *                          <li>{String} description</li>
         *                          <li>{String} amount</li>
         *                      </ul>
         *                  </li>
         *                  <li>{Boolean} hasNext</li>
         *                  <li>{Integer} nextOffset</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getCreditPackList = function (params, callback) {

            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }

            var requestData = {};
            if (typeof params == "object") {

                requestData.size = 20;
                requestData.offset = 0;

                if (typeof params.size == "number") {
                    requestData.size = params.size;
                }

                if (typeof params.offset == "number") {
                    requestData.offset = params.offset;
                }

                if (typeof  params.fromAmount == "number") {
                    requestData.fromAmount = params.fromAmount * __configData.cf;
                }

                if (typeof  params.name == "string") {
                    requestData.name = params.name;
                }
            }

            __request("getCreditPackList", requestData, function (res) {
                var returnData = {
                    hasError: res.HasError,
                    errorMessage: res.ErrorMessage,
                    result: {}
                };

                if (!res.HasError && Array.isArray(res.Result)) {

                    var packs = [];
                    for (var i = 0; i < res.Result.length; i++) {
                        var pack = res.Result[i];
                        packs.push({
                            id: pack.id,
                            name: pack.name,
                            description: pack.description,
                            amount: pack.amount,
                        });
                    }

                    returnData.result = {
                        packs: packs,
                        nextOffset: (requestData.offset += packs.length),
                        hasNext: requestData.size == packs.length
                    };
                }


                callback(returnData);
            });
        };

        /**
         * <div style='width: 100%;text-align: right'>تعیین اینکه آیا کاربر می تواند عضو لیگ شود یا خیر</div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData.put("leagueId","26");
         *      service.getEnrollAccess(reqData, function() {
         *              console.log("getEnrollAccess method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getEnrollAccess
         * @public
         *
         * @param {Object} params
         *      <ul>
         *          <li>{String} leagueId شناسه لیگ</li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{Boolean} result</li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         *
         *
         * */
        __self.getEnrollAccess = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params not exist or not an object");
            }

            if (!params.leagueId) {
                throw new ServiceException("leagueId key is not exist");
            }

            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }

            var requestData = {
                leagueId: params.leagueId
            };

            __request("enrollAccess", requestData, function (res) {
                var returnData = {
                    hasError: res.HasError,
                    errorMessage: res.ErrorMessage,
                    errorCode: res.ErrorCode,
                    result: res.Result
                };

                callback(returnData);
            });
        };

        /**
         * <div style='width: 100%;text-align: right'>دریافت اطلاعات فایل بازی </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["gameId"] = "2";
         *      service.getFileInfo(reqData, function() {
         *              console.log("getFileInfo method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getFileInfo
         * @public
         *
         * @param {Object} params
         *      <ul>
         *          <li>{Integer} gameId - شناسه بازی
         *          </li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{String} downloadLink</li>
         *                  <li>{String} fileSize</li>
         *                  <li>{String} version</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getFileInfo = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params not exist or not an object");
            }

            if (!params.gameId) {
                throw new ServiceException("gameId key is not exist");
            }

            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }

            var requestData = {
                gameId: params.gameId
            };

            __request("fileInfo",
                requestData
                , function (result) {
                    var returnData = {
                        hasError: result.HasError,
                        errorCode: result.ErrorCode,
                        errorMessage: result.ErrorMessage
                    };

                    if (!returnData.hasError) {
                        returnData.result = {
                            downloadLink: result.Result.downloadLink,
                            version: result.Result.version,
                            fileSize: result.Result.dataLen
                        };
                    }

                    callback(returnData);
                });
        };

        /**
         * @method getValidChatThreadIds
         * @public
         *
         * @param {Object} params
         *
         * @param {Function} callback
         *       @param {Boolean} callback.hasError
         *       @param {String} callback.errorMessage
         *       @param {Number} callback.errorCode
         *       @param {Array} callback.result
         *
         *
         * */
        __self.getValidChatThreadIds = function (params, callback) {
            __request(
                "validChatThreadId",
                {
                    gameIds: JSON.stringify(Object.keys(__games))
                },
                function (result) {
                    callback && callback({
                        hasError: result.HasError,
                        errorMessage: result.ErrorMessage,
                        errorCode: result.ErrorCode,
                        result: result.Result
                    });
                });
        };

        /**
         * <div style='width: 100%;text-align: right'>اعلام آمادگی برای شروع بازی</div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {
         *          matchId : "26"
         *      };
         *      service.sendMatchReadyRequest(reqData, function(result) {
         *         console.log(("sendMatchReadyRequest method : " , result)
         *      });
         *  </code>
         * </pre>
         *
         * @method sendMatchReadyRequest
         * @public
         *
         * @param  params
         *      <ul>
         *          <li>{String} matchId</li>
         *      </ul>
         *
         * @param  callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         *
         * */
        __self.sendMatchReadyRequest = function (params, callback) {

            if (typeof params != "object") {
                throw new ServiceException("params is not exist or is not object");
            }
            if (!params.matchId) {
                throw new ServiceException("matchId key is not exist");
            }
            __request("matchReady",
                {
                    userId: __userData.id,
                    sessionId: __userData.peerId,
                    matchId: params.matchId
                }, function (result) {
                    callback && callback({
                        hasError: result.HasError,
                        errorMessage: result.ErrorMessage,
                        errorCode: result.ErrorCode
                    });
                });
        };

        /**
         * <div style='width: 100%;text-align: right'>اعلام لغو بازی</div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {
         *          matchId : "26"
         *      };
         *      service.sendMatchCancelRequest(reqData, function(result) {
         *         console.log(("sendMatchCancelRequest method : " , result)
         *      });
         *  </code>
         * </pre>
         *
         * @method sendMatchCancelRequest
         * @public
         *
         * @param  params
         *      <ul>
         *          <li>{String} matchId</li>
         *      </ul>
         *
         * @param  callback
         *      <p>onResult method params is JSONObject that has</p>
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.sendMatchCancelRequest = function (params, callback) {

            if (typeof params != "object") {
                throw new ServiceException("params is not exist or is not object");
            }
            if (!params.matchId) {
                throw new ServiceException("matchId key is not exist");
            }
            __request(
                "matchCancel",
                {
                    matchId: params.matchId,
                    type: 2
                },
                function (result) {
                    callback && callback({
                        hasError: result.HasError,
                        errorMessage: result.ErrorMessage,
                        errorCode: result.ErrorCode
                    });
                });
        };

        /**
         * <div style='width: 100%;text-align: right'>اعلام لغو بازی</div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {
         *          matchId : "26"
         *      };
         *      service.sendMatchLeaveRequest(reqData, function(result) {
         *         console.log(("sendMatchLeaveRequest method : " , result)
         *      });
         *  </code>
         * </pre>
         *
         * @method sendMatchLeaveRequest
         * @public
         *
         * @param  params
         *      <ul>
         *          <li>{String} matchId</li>
         *      </ul>
         *
         * @param  callback
         *      <p>onResult method params is JSONObject that has</p>
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.sendMatchLeaveRequest = function (params, callback) {

            if (typeof params != "object") {
                throw new ServiceException("params is not exist or is not object");
            }
            if (!params.matchId) {
                throw new ServiceException("matchId key is not exist");
            }
            __request(
                "matchCancel",
                {
                    matchId: params.matchId,
                    type: 1
                },
                function (result) {
                    callback && callback({
                        hasError: result.HasError,
                        errorMessage: result.ErrorMessage,
                        errorCode: result.ErrorCode
                    });
                });
        };

        /**
         * <div style='width: 100%;text-align: right'>ارسال نتیجه مسابقه </div>
         *
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["gameId"] = gameId;
         *      var player1Scores = [];
         *      var player2Scores = [];
         *
         *      var data1 = {};
         *      data1["name"] =  "field1";
         *      data1["value "] = 33;
         *      player1Scores.push(data1);
         *
         *      JSONObject data2 = {};
         *      data2["name"] = "field2";
         *      data2["value "] =  10;
         *      player1Scores.push(data2);
         *
         *      var player1Data = {};
         *      player1Data["playerId"] = "**";
         *      player1Data["scores"] = player1Scores;
         *
         *      ///------------------
         *      var data1 = {};
         *      data1["name"] =  "field1";
         *      data1["value "] = 33;
         *      player2Scores.push(data1);
         *
         *      JSONObject data2 = {};
         *      data2["name"] = "field2";
         *      data2["value "] =  10);
         *      player2Scores.push(data2);
         *
         *      var player1Data = {};
         *      player2Data["playerId"] = "**";
         *      player2Data["scores"] = player2Scores;
         *
         *      var playersData = [];
         *      playersData.push(player1Data);
         *      playersData.push(player2Data);
         *      reqData["result"] = playersData;
         *      service.sendMatchResultRequest(reqData, function(result) {
         *          console.log("sendMatchResultRequest method : ", result);
         *      });
         *  </code>
         * </pre>
         *
         * @method sendMatchResultRequest
         * @public
         *
         * @param  params
         *      <ul>
         *          <li>{String} gameId - شناسه بازی</li>
         *          <li>{JSONArray} result - نتیجه بازی
         *          array of JSONObject that each object contain :
         *              <ul>
         *                  <li>{String}playerId</li>
         *                  <li>{JSONArray}scores</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @param  callback
         *      <p>onResult method params is JSONObject that has</p>
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.sendMatchResultRequest = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params is not defined!");
            }
            if (!Array.isArray(params.result) || params.result.length == 0) {
                throw new ServiceException("result is not exists!");
            }
            if (!params.gameId) {
                throw new ServiceException("gameId is not exists!");
            }
            if (!__userData.loginState) {
                throw new ServiceException("first login in game center");
            }

            var gameResults = params.result,
                ownerId = __userData.id,
                result = [],
                ownResult,
                opponentResult;

            if (gameResults.length > 1) {
                if (gameResults[0].playerId == ownerId) {
                    ownResult = gameResults[0];
                    opponentResult = gameResults[1];
                } else {
                    ownResult = gameResults[1];
                    opponentResult = gameResults[0];
                }
            } else {
                ownResult = gameResults[0];
            }

            result.push(ownResult);


            if (opponentResult) {
                result.push(opponentResult);
            }

            __sendResult({
                matchData: {gameId: params.gameId},
                result: JSON.stringify(result),
                forceAddToTable: true
            }, callback);
        };

        /**
         * <div style='width: 100%;text-align: right'> ویرایش پروفایل</div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var  reqData = {};
         *      reqData["requestId"] = "******";
         *      reqData["rejectReasonType"] = 1;
         *      service.matchRequestResponse(reqData, function(result) {
         *           console.log("matchRequestResponse method : " + result);
         *      });
         *  </code>
         * </pre>
         *
         * @method matchRequestResponse
         * @public
         *
         * @param  params
         *      <ul>
         *          <li>{String} requestId - شناسه درخواست</li>
         *          <li>{Integer} [rejectReasonType] -  در صورت عدم پذیرش درخواست مقدار آن کد مورد نظر برای رد درخواست می باشد</li>
         *          <li>{String} [rejectMessage] - دلیل رد درخواست در صورت منفی بودن جواب درخواست</li>
         *      </ul>
         *
         * @param  callback
         *      <p>onResult method params is JSONObject that has</p>
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.matchRequestResponse = function (params, callback) {

            if (typeof params != "object") {
                throw new ServiceException("params is not exist or is not object");
            }
            if (!params.requestId) {
                throw new ServiceException("requestId key is not exist");
            }
            var isGameRun = __isGameRun();

            function sendRequest() {
                __isAcceptingMatchRequest = true;

                var reqData = {
                    requestId: params.requestId,
                    sessionId: __userData.peerId,
                    result: true
                };

                if (typeof params.rejectReasonType == "number") {
                    reqData.rejectReasonType = params.rejectReasonType;
                    if (typeof params.rejectMessage == "string") {
                        reqData.rejectMessage = params.rejectMessage;
                    } else {
                        reqData.rejectMessage = __getRejectMessageByType(params.rejectReasonType);
                    }

                    reqData.result = false;
                }

                __request("matchRequestResponse", reqData, function (result) {
                    __isAcceptingMatchRequest = false;

                    callback({
                        hasError: result.HasError,
                        errorMessage: result.ErrorMessage
                    });
                });
            }

            if (!__isMultiTab && (__currentMatchRequestCount > 0 || isGameRun || __quickMatchData.requestCount > 0 || __isAcceptingMatchRequest) && params.state) {

                if (__currentMatchRequestCount > 0) {

                    if (__lastMatchRequestData && __lastMatchRequestData.requestId) {
                        __self.cancelMatchRequest({
                            requestId: __lastMatchRequestData.requestId,
                            leagueId: __currentRequestMatch[__lastMatchRequestData.requestId].leagueId
                        }, function (cancelResult) {
                            if (!cancelResult.hasError) {
                                sendRequest();
                            } else {
                                callback && callback({
                                    hasError: true,
                                    errorMessage: __dic.WAITFORPREVIOUSREQUEST[__lang]
                                });
                            }
                        });
                    } else {
                        callback && callback({
                            hasError: true,
                            errorMessage: __dic.WAITFORPREVIOUSREQUEST[__lang]
                        });
                    }

                } else if (__quickMatchData.requestCount > 0) {
                    if (__quickMatchData.lastLeagueId) {
                        __self.cancelQuickMatchRequest({
                            leagueId: __quickMatchData.lastLeagueId
                        }, function (cancelResult) {
                            if (!cancelResult.hasError && cancelResult.result) {
                                if (cancelResult.result) {
                                    sendRequest();
                                } else {
                                    params.onResult && params.onResult({
                                        hasError: true,
                                        errorMessage: __dic.WAITFORPREVIOUSREQUEST[__lang]
                                    });
                                }

                            } else {
                                params.onResult && params.onResult({
                                    hasError: true,
                                    errorMessage: __dic.CANCEL_QUICKMATCH_FIRST[__lang]
                                });
                            }
                        });
                    } else {
                        params.onResult && params.onResult({
                            hasError: true,
                            errorMessage: __dic.CANCEL_QUICKMATCH_FIRST[__lang]
                        });
                    }


                } else if (isGameRun) {
                    params.onResult && params.onResult({
                        hasError: true,
                        errorMessage: __dic.CAN_ACCEPT_MATCH_REQUEST_AFTER_MATCH[__lang]
                    });

                    __request("matchRequestResponse", {
                        requestId: params.requestId,
                        sessionId: __userData.peerId,
                        result: false,
                        rejectReasonType: __rejectType.USER_IS_BUSY.value
                    }, function (result) {
                    });
                } else if (__isAcceptingMatchRequest) {
                    callback && callback({
                        hasError: true,
                        errorMessage: __dic.WAITFORPREVIOUSREQUEST[__lang]
                    });
                } else {
                    params.onResult && params.onResult({
                        hasError: true,
                        errorMessage: __dic.WAITFORPREVIOUSREQUEST[__lang]
                    });
                }

            } else {
                sendRequest();
            }

        };

        /**
         * <div style='width: 100%;text-align: right'>ارسال دیتا به حریف مقابل</div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["matchId"] = "****";
         *      reqData["sendData"] = {cmd:'start',data : "col_1"};
         *      reqData["stateData"] = {state : [[1,2,3,4],[1,3,4,5]];
         *      service.sendMatchDataRequest(reqData, function(result) {
         *          console.log("sendMatchDataRequest method : " , result);
         *      });
         *  </code>
         * </pre>
         *
         * @method sendData
         * @public
         *
         * @param {Object} params
         * @param {String} params.matchId
         * @param {Object} params.sendData // دیتای ارسالی
         * @param {Object} params.stateData // دیتای وضعیت کنونی مسابقه
         * این دیتا به نفر مقابل ارسال نمی شود و تنها در صورت ریلود شدن بازی دوباره به عنوان دیتای مسابقه داده می شود تا بازی از همان وضعیت ادامه پیدا کند
         * @param {Boolean} [params.sequential=false]
         * @param {String} [params.dataId]
         * @param {Function} callback
         *      @param {Boolean} callback.hasError
         *      @param {String} callback.errorMessage
         *      @param {Object} callback.result
         *              @param {Boolean} params.onResult.result.state
         *              @param {String} params.onResult.result.dataId
         *
         * @return {dataId : String}
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.sendMatchDataRequest = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params is not exist or is not object");
            }
            if (!params.matchId) {
                throw new ServiceException("matchId key is not exist");
            }

            var matchObj = __activeMatches[params.matchId];

            if (!matchObj) {
                throw new ServiceException("matchId is not valid");
            }

            matchObj.sendData(params, callback);
        };

        /**
         * <div style='width: 100%;text-align: right'>دریافت لیست نتیایح بازی هی یک لیگ</div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["leagueId"] =  "3";
         *      reqData["offset"] = 0;
         *      reqData["size"] = 10 ;
         *
         *      service.getLeagueMatchesResult(reqData, function() {
         *              console.log("getLeagueMatchesResult method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getLeagueMatchesResult
         * @protected
         * @param {Object} params
         *      <ul>
         *          <li>{String} leagueId</li>
         *          <li>{Integer} [size=20]</li>
         *          <li>{Integer} [offset=0]</li>
         *          <li>{Integer} [userId]</li>
         *          <li>{Integer} [matchId]</li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{JSONArray} matches
         *                      <ul>
         *                          <li>{Number} startTime</li>
         *                          <li>{Number} endTime</li>
         *                          <li>{String} id</li>
         *                          <li>{String} leagueId</li>
         *                          <li>{JSONArray} users
         *                              <ul>
         *                                  <li>{JSONObject}  info</li>
         *                                  <li>{JSONArray}  scores</li>
         *                              </ul>
         *                          </li>
         *                      </ul>
         *                  </li>
         *                  <li>{Boolean} hasNext</li>
         *                  <li>{Integer} nextOffset</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         *
         * */
        __self.getLeagueMatchesResult = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params is not exist");
            }

            if (!params.leagueId) {
                throw new ServiceException("leagueId key is not exist");
            }

            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }

            var sendData = {
                leagueId: params.leagueId,
                size: 20,
                offset: 0
            };

            if (typeof params.offset == "number" && params.offset >= 0) {
                sendData.offset = params.offset;
            }

            if (typeof params.size == "number" && params.size >= 0) {
                sendData.size = params.size;
            }

            if (params.userId) {
                sendData.userId = params.userId;
            }

            if (params.matchId) {
                sendData.matchId = params.matchId;
            }

            __request("leagueMatchesResult", sendData, function (result) {
                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage
                };
                if (result.HasError) {
                    returnData.result = undefined;
                } else {
                    var matchesData = result.Result;
                    var matches = [];

                    if (matchesData) {
                        for (var i = 0; i < matchesData.length; i++) {
                            var match = matchesData[i];
                            var users = match.Users;
                            matches[i] = {
                                endTime: match.Match.EndTimestamp,
                                startTime: match.Match.StartTimestamp,
                                id: match.Match.ID + "",
                                league: {
                                    expireTimestamp: match.Match.League.ExpireTimestamp,
                                    financialType: match.Match.League.FinancialType,
                                    fromDateTimestamp: match.Match.League.FromDateTimestamp,
                                    hasPrize: match.Match.League.HasPrize,
                                    id: match.Match.League.ID + "",
                                    maxPlayers: match.Match.League.MaxPlayers,
                                    name: match.Match.League.Name,
                                    statusNumber: match.Match.League.StatusNumber,
                                },
                                statusNumber: match.StatusNumber,
                            };

                            var usersData = [];
                            for (var j = 0; j < users.length; j++) {
                                var user = users[j];
                                var scoresData = user.Scores;
                                usersData[j] = {
                                    info: {
                                        id: user.UserInfo.ID + "",
                                        name: user.UserInfo.Name,
                                        image: user.UserInfo.Image,
                                        imageUrl: user.UserInfo.ProfileImage
                                    }
                                };

                                var scores = [];
                                for (var k = 0; k < scoresData.length; k++) {
                                    var score = scoresData[k];

                                    scores[k] = {
                                        name: score.name,
                                        value: score.value,
                                    }
                                }


                                usersData[j].scores = scores;
                            }

                            matches[i].users = usersData;


                        }
                    }

                    returnData.result = {
                        matches: matches,
                        nextOffset: sendData.offset += matchesData.length,
                        hasNext: sendData.size == matchesData.length
                    };
                }

                callback(returnData);

            });
        };

        /**
         * <div style='width: 100%;text-align: right'>دریافت لیست آخرین نتایج لیگ</div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["leagueId"] =  "3";
         *      reqData["offset"] = 0;
         *      reqData["size"] = 10 ;
         *
         *      service.getLeagueLatestMatchesResult(reqData, function() {
         *              console.log("getLeagueLatestMatchesResult method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getLeagueLatestMatchesResult
         * @protected
         * @param {Object} params
         *      <ul>
         *          <li>{String} leagueId</li>
         *          <li>{Integer} [size=20]</li>
         *          <li>{String} [username]</li>
         *          <li>{Integer} [offset=0]</li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{JSONArray} matches
         *                      <ul>
         *                          <li>{Number} startTime</li>
         *                          <li>{Number} endTime</li>
         *                          <li>{String} id</li>
         *                          <li>{String} leagueId</li>
         *                          <li>{JSONArray} users
         *                              <ul>
         *                                  <li>{JSONObject}  info</li>
         *                                  <li>{JSONArray}  scores</li>
         *                              </ul>
         *                          </li>
         *                      </ul>
         *                  </li>
         *                  <li>{Boolean} hasNext</li>
         *                  <li>{Integer} nextOffset</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getLeagueLatestMatchesResult = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params is not exist");
            }

            if (!params.leagueId) {
                throw new ServiceException("leagueId key is not exist");
            }

            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }



            var sendData = {
                leagueId: params.leagueId,
                size: 20,
                offset: 0
            };

            if(params.username) {
                sendData.username = params.username;
            }

            if (typeof params.offset == "number" && params.offset >= 0) {
                sendData.offset = params.offset;
            }

            if (typeof params.size == "number" && params.size >= 0) {
                sendData.size = params.size;
            }


            __request("leagueLatestMatchesResult", sendData, function (result) {
                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage
                };
                if (result.HasError) {
                    returnData.result = undefined;
                } else {
                    var matchesData = result.Result;
                    var matches = [];

                    if (matchesData) {
                        for (var i = 0; i < matchesData.length; i++) {
                            var match = matchesData[i];
                            var users = match.Users;
                            matches[i] = {
                                endTime: match.Match.EndTimestamp,
                                startTime: match.Match.StartTimestamp,
                                id: match.Match.ID,
                                league: {
                                    expireTimestamp: match.Match.League.ExpireTimestamp,
                                    financialType: match.Match.League.FinancialType,
                                    fromDateTimestamp: match.Match.League.FromDateTimestamp,
                                    hasPrize: match.Match.League.HasPrize,
                                    id: match.Match.League.ID + "",
                                    maxPlayers: match.Match.League.MaxPlayers,
                                    name: match.Match.League.Name,
                                    statusNumber: match.Match.League.StatusNumber,
                                },
                                statusNumber: match.StatusNumber,
                            };

                            var usersData = [];
                            for (var j = 0; j < users.length; j++) {
                                var user = users[j];
                                var scoresData = user.Scores;
                                usersData[j] = {
                                    info: {
                                        id: user.UserInfo.ID + "",
                                        name: user.UserInfo.Name,
                                        image: user.UserInfo.Image,
                                        imageUrl: user.UserInfo.ProfileImage,
                                    }
                                };

                                var scores = [];
                                for (var k = 0; k < scoresData.length; k++) {
                                    var score = scoresData[k];

                                    scores[k] = {
                                        name: score.name,
                                        value: score.value,
                                    }
                                }


                                usersData[j].scores = scores;
                            }

                            matches[i].users = usersData;


                        }
                    }

                    returnData.result = {
                        matches: matches,
                        nextOffset: sendData.offset += matchesData.length,
                        hasNext: sendData.size == matchesData.length
                    };
                }

                callback(returnData);

            });
        };

        /**
         * <div style='width: 100%;text-align: right'>دریافت آخرین مسابقات لیگ </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["leagueId"] =  "3";
         *      reqData["offset"] = 0;
         *      reqData["size"] = 10 ;
         *
         *      service.getLeagueLatestMatches(reqData, function() {
         *              console.log("getLeagueLatestMatches method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getLeagueLatestMatches
         * @protected
         * @param {Object} params
         *      <ul>
         *          <li>{String} name</li>
         *          <li>{String} leagueId</li>
         *          <li>{Integer} [size=20]</li>
         *          <li>{Integer} [offset=0]</li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{JSONArray} matches
         *                      <ul>
         *                          <li>{Number} startTime</li>
         *                          <li>{Number} endTime</li>
         *                          <li>{String} id</li>
         *                          <li>{String} leagueId</li>
         *                          <li>{JSONArray} users
         *                              <ul>
         *                                  <li>{String}  id</li>
         *                                  <li>{String}  name</li>
         *                                  <li>{JSONObject}  [image]</li>
         *                                  <li>{String}  [imageUrl]</li>
         *                              </ul>
         *                          </li>
         *                      </ul>
         *                  </li>
         *                  <li>{Boolean} hasNext</li>
         *                  <li>{Integer} nextOffset</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getLeagueLatestMatches = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params is not exist");
            }

            if (!params.leagueId) {
                throw new ServiceException("leagueId key is not exist");
            }

            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }

            var sendData = {
                leagueId: params.leagueId,
                size: 20,
                offset: 0
            };

            if (typeof params.offset == "number" && params.offset >= 0) {
                sendData.offset = params.offset;
            }

            if (typeof params.size == "number" && params.size >= 0) {
                sendData.size = params.size;
            }


            if (typeof params.name === "string") {
                sendData.query = params.name;
            }

            __request("leagueLatestMatches", sendData, function (result) {
                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage
                };
                if (result.HasError) {
                    returnData.result = undefined;
                } else {
                    var matchesData = result.Result;
                    var matches = [];

                    if (matchesData) {
                        for (var i = 0; i < matchesData.length; i++) {
                            var match = matchesData[i];
                            var users = match.Users;

                            matches[i] = {
                                endTime: match.EndTimestamp,
                                startTime: match.StartTimestamp,
                                id: match.ID + "",
                                league: {
                                    expireTimestamp: match.League.ExpireTimestamp,
                                    financialType: match.League.FinancialType,
                                    fromDateTimestamp: match.League.FromDateTimestamp,
                                    hasPrize: match.League.HasPrize,
                                    id: match.League.ID + "",
                                    maxPlayers: match.League.MaxPlayers,
                                    name: match.League.Name,
                                    statusNumber: match.League.StatusNumber,
                                },
                                statusNumber: match.StatusNumber,
                            };

                            var usersData = [];
                            for (var j = 0; j < users.length; j++) {
                                var user = users[j];
                                usersData[j] = {
                                    id: user.ID + "",
                                    name: user.Name,
                                    image: user.Image,
                                    imageUrl: user.ProfileImage,
                                };

                            }

                            matches[i].users = usersData;


                        }
                    }

                    returnData.result = {
                        matches: matches,
                        nextOffset: sendData.offset += matchesData.length,
                        hasNext: sendData.size == matchesData.length
                    };
                }

                callback(returnData);

            });
        };

        /**
         * <div style='width: 100%;text-align: right'>دریافت لیست مسابقات کاربر</div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["leagueId"] =  "3";
         *      reqData["offset"] = 0;
         *      reqData["size"] = 10 ;
         *
         *      service.getLeagueMatches(reqData, function() {
         *              console.log("getLeagueMatches method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getLeagueMatches
         * @protected
         * @param {Object} params
         *      <ul>
         *          <li>{String} leagueId</li>
         *          <li>{Number} status</li>
         *              NotStarted = 1,
         *              Loading = 2,
         *              Running = 3,
         *              Failed = 4,
         *              Finished = 5,
         *              Cancelled = 6,
         *              NotValidResult = 7
         *          <li>{Integer} [size=20]</li>
         *          <li>{Integer} [offset=0]</li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{JSONArray} matches
         *                      <ul>
         *                          <li>{Number} startTime</li>
         *                          <li>{Number} endTime</li>
         *                          <li>{String} id</li>
         *                          <li>{String} leagueId</li>
         *                          <li>{JSONArray} users
         *                              <ul>
         *                                  <li>{JSONObject}  info</li>
         *                                  <li>{JSONArray}  scores</li>
         *                              </ul>
         *                          </li>
         *                      </ul>
         *                  </li>
         *                  <li>{Boolean} hasNext</li>
         *                  <li>{Integer} nextOffset</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getLeagueMatches = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params is not exist");
            }

            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }

            var sendData = {
                size: 20,
                offset: 0
            };

            if (typeof params.offset == "number" && params.offset >= 0) {
                sendData.offset = params.offset;
            }

            if (typeof params.size == "number" && params.size >= 0) {
                sendData.size = params.size;
            }

            if (params.leagueId) {

                sendData.leagueId = params.leagueId;
            }

            if (params.status) {
                sendData.status = params.status;
            }

            __request("leagueMatches", sendData, function (result) {
                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage
                };
                if (result.HasError) {
                    returnData.result = undefined;
                } else {
                    var matchesData = result.Result;
                    var matches = [];

                    if (matchesData) {
                        for (var i = 0; i < matchesData.length; i++) {
                            var match = matchesData[i];
                            var users = match.Users;

                            matches[i] = {
                                endTime: match.EndTimestamp,
                                startTime: match.StartTimestamp,
                                id: match.ID + "",
                                league: {
                                    expireTimestamp: match.League.ExpireTimestamp,
                                    financialType: match.League.FinancialType,
                                    fromDateTimestamp: match.League.FromDateTimestamp,
                                    hasPrize: match.League.HasPrize,
                                    id: match.League.ID + "",
                                    maxPlayers: match.League.MaxPlayers,
                                    name: match.League.Name,
                                    statusNumber: match.League.StatusNumber,
                                },
                                statusNumber: match.StatusNumber,
                            };

                            var usersData = [];
                            for (var j = 0; j < users.length; j++) {
                                var user = users[j];
                                usersData[j] = {
                                    id: user.ID + "",
                                    name: user.Name,
                                    image: user.Image,
                                    imageUrl: user.ProfileImage,
                                };

                            }

                            matches[i].users = usersData;


                        }
                    }

                    returnData.result = {
                        matches: matches,
                        nextOffset: sendData.offset += matchesData.length,
                        hasNext: sendData.size == matchesData.length
                    };
                }

                callback(returnData);

            });
        };

        /**
         * <div style='width: 100%;text-align: right'>ورود کاریر </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["token"] =  "****";
         *      reqData["nickName"] = "ali";
         *      reqData["id"] = 10 ;
         *
         *      service.initLogin(reqData);
         *  </code>
         * </pre>
         * @method login
         * @protected
         * @param {Object} params
         *      <ul>
         *          <li>{String} token</li>
         *          <li>{Number} id</li>
         *          <li>{String} nickName</li>
         *          <li>{Object} [image]</li>
         *          <li>{Object} [imageUrl]</li>
         *          <li>{Boolean} [guest=false]</li>
         *          <li>{Boolean} [ssoLogin=false]</li>
         *      </ul>
         * @param  {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result</li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.initLogin = function (params, callback) {
            __loginAction({
                name: params.nickName || params.name,
                token: params.token,
                tokenIssuer: params.tokenIssuer,
                tokenExpireTime: params.tokenExpireTime,
                id: params.id,
                image: params.image,
                imageUrl: params.imageUrl,
                guest: params.guest === true,
                // ssoLogin: params.ssoLogin === true
                ssoLogin: true
            }, {
                storageStore: true,
                sessionStore: true
            }, callback);
        };

        /**
         * <div style='width: 100%;text-align: right'>اعلام بروزرسانی توکن</div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *      JSONObject reqData = new JSONObject();
         *      reqData.put("token","**********");
         *
         *      service.refreshToken(reqData, function() {
         *          console.log("refreshToken method : " + resul);
         *      });
         *
         *  </code>
         * </pre>
         * @method refreshToken
         * @protected
         * @param  params
         *      <ul>
         *          <li>{String} token توکن جدید</li>
         *      </ul>
         *
         * @param  callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result</li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.refreshToken = function (params, callback) {

            if (typeof params != "object") {
                throw new ServiceException("params is not exist");
            }


            if (typeof params.token != "string") {
                throw new ServiceException("token is not exist");
            }

            if (!__userData.loginState) {
                throw new ServiceException("user is not login");
            }

            __userData.token = params.token;

            if (params.tokenExpireTime) {
                manageTokenExpireTime(params.tokenExpireTime);
            }

            __fireEvent("tokenRefresh", __self.getUserData());

            callback && callback(TisUtil.createReturnData(false, "", 0, null));
        }


        /**
         * <div style='width: 100%;text-align: right'> دریافت طلاعات کلی گیم سنتر</div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *
         *      service.getGameCenterStatus(reqData, function() {
         *              console.log("getGameCenterStatus method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getGameCenterStatus
         * @protected
         * @param {Object} params
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{Number} totalActiveUsers</li>
         *                  <li>{Number} totalCompletedLeagues</li>
         *                  <li>{Number} totalEnrollingRunningLeagues</li>
         *                  <li>{Number} totalEnrollingLeagues</li>
         *                  <li>{Number} totalGames</li>
         *                  <li>{Number} totalLeagues</li>
         *                  <li>{Number} totalMatches</li>
         *                  <li>{Number} totalOnlineUsers</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getGameCenterStatus = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params is not exist");
            }

            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }

            var sendData = {};


            __request("gameCenterStatus", sendData, function (result) {
                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage
                };
                if (result.HasError) {
                    returnData.result = undefined;
                } else {
                    var matchesData = result.Result;
                    returnData.result = result.Result;
                }

                callback(returnData);

            });
        };

        /**
         * <div style='width: 100%;text-align: right'> دریافت برترین بازیکنان لیگ</div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["leagueId"] =  "3";
         *      reqData["offset"] = 0;
         *      reqData["size"] = 10 ;
         *
         *      service.getLeagueTopPlayers(reqData, function() {
         *              console.log("getLeagueTopPlayers method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getGameCenterStatus
         * @param {Object} params
         *      <ul>
         *          <li>{String} leagueId</li>
         *          <li>{String} [size=50]</li>
         *          <li>{String} [offset=0]</li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{String} columnName</li>
         *                  <li>{JSONArray} players
         *                      <ul>
         *                          <li>{Double} score - امتیاز</li>
         *                          <li>{String} id - شناسه بازیکن</li>
         *                          <li>{String} name - نام بازیکن</li>
         *                          <li>{JSONObject} [image]
         *                              <ul>
         *                                  <li>{String} id</li>
         *                                  <li>{String} url</li>
         *                                  <li>{Integer} width</li>
         *                                  <li>{Integer} height</li>
         *                              </ul>
         *                          </li>
         *                          <li>{JSONObject} imageUrl</li>
         *                      </ul>
         *                  </li>
         *                  <li>{Boolean} hasNext</li>
         *                  <li>{Integer} nextOffset</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getLeagueTopPlayers = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params is not exist");
            }

            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }

            var sendData = {
                size : 50,
                offset : 0
            };

            if (typeof params.offset == "number" && params.offset >= 0) {
                sendData.offset = params.offset;
            }

            if (typeof params.size == "number" && params.size >= 0) {
                sendData.size = params.size;
            }

            if(params.leagueId) {
                sendData.leagueId = params.leagueId;
            }

            __request("leagueTopPlayer", sendData, function (result) {
                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage,
                    errorCode: result.ErrorCode,
                };
                if (result.HasError) {
                    returnData.result = undefined;
                } else {

                    if(result.Result) {
                        var res = result.Result;
                        var topPlayers = res.TopPlayers;
                        var players = [];
                        for (var i = 0; i < topPlayers.length; i++) {
                            var playerData = topPlayers[i];
                            var playerInfo = playerData.UserInfo;

                            if(playerInfo.image) {
                                playerInfo.image.id += "";
                            }

                            if(playerInfo.profileImage) {
                                playerInfo.imageUrl = playerInfo.profileImage;
                            }

                            playerInfo.score = playerData.Score;

                            players.push(playerInfo);

                        }


                        returnData.result = {
                            columnName : res.ColumnName,
                            players: players,
                            hasNext: sendData.size == topPlayers.length,
                            nextOffset: sendData.offset += topPlayers.length
                        };

                    } else {
                        returnData.result = null;
                    }

                }

                callback(returnData);

            });
        };


        /**
         * <div style='width: 100%;text-align: right'> دریافت برترین بازیکنان گیم سنتر و یا لیگ</div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["offset"] = 0;
         *      reqData["size"] = 10 ;
         *
         *      service.getTopPlayers(reqData, function() {
         *              console.log("getTopPlayers method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getGameCenterStatus
         * @param {Object} params
         *      <ul>
         *          <li>{String} [gameId]</li>
         *          <li>{String} [size=50]</li>
         *          <li>{String} [offset=0]</li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{Integer} count</li>
         *                  <li>{JSONArray} users
         *                      <ul>
         *                          <li>{Double} score - امتیاز</li>
         *                          <li>{String} id - شناسه بازیکن</li>
         *                          <li>{String} name - نام بازیکن</li>
         *                          <li>{JSONObject} [image]
         *                              <ul>
         *                                  <li>{String} id</li>
         *                                  <li>{String} url</li>
         *                                  <li>{Integer} width</li>
         *                                  <li>{Integer} height</li>
         *                              </ul>
         *                          </li>
         *                          <li>{JSONObject} imageUrl</li>
         *                      </ul>
         *                  </li>
         *                  <li>{Boolean} hasNext</li>
         *                  <li>{Integer} nextOffset</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getTopPlayers = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params is not exist");
            }

            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }

            var sendData = {
                size : 50,
                offset : 0
            };

            if (typeof params.offset == "number" && params.offset >= 0) {
                sendData.offset = params.offset;
            }

            if (typeof params.size == "number" && params.size >= 0) {
                sendData.size = params.size;
            }

            if(params.gameId){
                sendData.gameId = params.gameId;
            }


            __request("topPlayer", sendData, function (result) {
                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage,
                    errorCode: result.ErrorCode,
                };
                if (result.HasError) {
                    returnData.result = undefined;
                } else {

                    if(result.Result) {
                        var topPlayers = result.Result;
                        var players = [];
                        for (var i = 0; i < topPlayers.length; i++) {
                            var playerData = topPlayers[i];
                            var playerInfo = playerData.UserInfo;

                            if(playerInfo.image) {
                                playerInfo.image.id += "";
                            }

                            if(playerInfo.profileImage) {
                                playerInfo.imageUrl = playerInfo.profileImage;
                            }

                            playerInfo.score = playerData.Score;

                            players.push(playerInfo);

                        }


                        returnData.result = {
                            count : result.Count,
                            players: players,
                            hasNext: sendData.size == topPlayers.length,
                            nextOffset: sendData.offset += topPlayers.length
                        };

                    } else {
                        returnData.result = null;
                    }

                }

                callback(returnData);

            });
        };

        /**
         * <div style='width: 100%;text-align: right'> دریافت لیست دستاورد های کاربر </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *
         *      service.getUserAchievements(reqData, function() {
         *              console.log("getUserAchievements method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getUserAchievements
         * @param {Object} params
         *      <ul>
         *          <li>{String} [gameId]</li>
         *          <li>{Integer} [type]</li>
         *          <li>{String} [userId]</li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONArray} result
         *              <ul>
         *                  <li>{String} count  </li>
         *                  <li>{String} name  </li>
         *                  <li>{String} imageUrl</li>
         *                  <li>{Integer} rank</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getUserAchievements = function (params, callback) {


            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }

            var sendData = {};


            if (typeof params === "object") {
                if(params.gameId){
                    sendData.gameId = params.gameId;
                }

                if(params.type){
                    sendData.type = params.type;
                }
                if(params.userId){
                    sendData.userId = params.userId;
                }
            }


            __request("userAchievements", sendData, function (result) {
                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage,
                    errorCode: result.ErrorCode,
                };
                if (result.HasError) {
                    returnData.result = undefined;
                } else {

                    if(result.Result) {
                        var achivements = result.Result;
                        var achivementsData = [];
                        for (var i = 0; i < achivements.length; i++) {
                            var achive = achivements[i];
                            achivementsData.push({
                                count : achive.Count,
                                imageUrl : achive.ImageLink,
                                name : achive.Name,
                                rank : achive.Rank,
                            });

                        }

                        returnData.result = achivementsData;

                    } else {
                        returnData.result = null;
                    }

                }

                callback(returnData);

            });
        };

        /**
         * <div style='width: 100%;text-align: right'> دریافت جزئیات یک دستاورد </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *
         *      service.getUserAchievementDetail(reqData, function() {
         *              console.log("getUserAchievementDetail method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getUserAchievementDetail
         * @param {Object} params
         *      <ul>
         *          <li>{Integer} [rankType]</li>
         *          <li>{String} [gameId]</li>
         *          <li>{String} [size=50]</li>
         *          <li>{String} [offset]</li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{JSONArray} achivements
         *                      <ul>
         *                          <li>{String} name  </li>
         *                          <li>{String} imageUrl</li>
         *                          <li>{Integer} rank</li>
         *                          <li>{JSONObject} leagueInfo
         *                              <ul>
         *                                  <li>{Double} expireTimestamp</li>
         *                                  <li>{Double} fromDateTimestamp</li>
         *                                  <li>{Integer} financialType</li>
         *                                  <li>{Integer} maxPlayers</li>
         *                                  <li>{Integer} statusNumber</li>
         *                                  <li>{Boolean} hasPrize</li>
         *                                  <li>{String} id</li>
         *                                  <li>{String} name</li>
         *                              </ul>
         *                          </li>
         *                      </ul>
         *                  </li>
         *                  <li>{Integer} count</li>
         *                  <li>{Boolean} hasNext</li>
         *                  <li>{Integer} nextOffset</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getUserAchievementDetail = function (params, callback) {

            if (typeof params != "object" || params === null) {
                throw new ServiceException("params is not exist");
            }

            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }

            var sendData = {
                size : 50,
                offset : 0
            };

            if(typeof params.offset === "number" && params.offset > 0) {
                sendData.offset = params.offset;
            }

            if(typeof params.size === "number" && params.size > 0) {
                sendData.size = params.size;
            }

            if(typeof params.rankType === "number") {
                sendData.rankType = params.rankType;
            }

            if(params.gameId) {
                sendData.gameId = params.gameId;
            }
            
            __request("userAchievementDetails", sendData, function (result) {

                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage,
                    errorCode: result.ErrorCode,
                };
                if (result.HasError) {
                    returnData.result = undefined;
                } else {

                    if(result.Result) {
                        var achivements = result.Result;
                        var achivementsData = [];
                        for (var i = 0; i < achivements.length; i++) {
                            var achive = achivements[i];
                            achivementsData.push({
                                imageUrl : achive.ImageLink,
                                name : achive.Name,
                                rank : achive.Rank,
                                leagueInfo : {
                                    expireTimestamp: achive.LeagueInfo.ExpireTimestamp,
                                    financialType: achive.LeagueInfo.FinancialType,
                                    fromDateTimestamp: achive.LeagueInfo.FromDateTimestamp,
                                    hasPrize: achive.LeagueInfo.HasPrize,
                                    id: achive.LeagueInfo.ID + "",
                                    maxPlayers: achive.LeagueInfo.MaxPlayers,
                                    name: achive.LeagueInfo.Name,
                                    statusNumber: achive.LeagueInfo.StatusNumber,
                                }
                            });

                        }

                        returnData.result = {
                            hasNext: sendData.size == achivementsData.length,
                            nextOffset: sendData.offset += achivementsData.length,
                            count : result.Count,
                            achivements : achivementsData
                        };

                    } else {
                        returnData.result = null;
                    }

                }

                callback(returnData);

            });
        };

        /**
         * <div style='width: 100%;text-align: right'> دریافت امتیاز کاربر در بازی ها </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *
         *      service.getUserGamePoints(reqData, function() {
         *              console.log("getUserGamePoints method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getUserGamePoints
         * @param {Object} params
         *      <ul>
         *          <li>{String} [gameId]</li>
         *          <li>{String} [size=50]</li>
         *          <li>{String} [offset]</li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{JSONArray} points
         *                      <ul>
         *                          <li>{JSONObject} point
         *                              <ul>
         *                                  <li>{Long} amount</li>
         *                                  <li>{Long} creationDate</li>
         *                              </ul>
         *                          </li>
         *                          <li>{JSONObject} gameInfo
         *                              <ul>
         *                                  <li>{String} downloadLink</li>
         *                                  <li>{String} id</li>
         *                                  <li>{JSONObject} image</li>
         *                                  <li>{String} imageUrl</li>
         *                                  <li>{String} name</li>
         *                                  <li>{String} postId</li>
         *                                  <li>{String} timelineId</li>
         *                              </ul>
         *                          </li>
         *                      </ul>
         *                  </li>
         *                  <li>{Integer} count</li>
         *                  <li>{Boolean} hasNext</li>
         *                  <li>{Integer} nextOffset</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getUserGamePoints = function (params, callback) {

            if (typeof params != "object" || params === null) {
                throw new ServiceException("params is not exist");
            }

            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }

            var sendData = {
                size : 50,
                offset : 0
            };

            if(typeof params.offset === "number" && params.offset > 0) {
                sendData.offset = params.offset;
            }

            if(typeof params.size === "number" && params.size > 0) {
                sendData.size = params.size;
            }

            if(params.gameId) {
                sendData.gameId = params.gameId;
            }

            __request("userGamePoints", sendData, function (result) {

                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage,
                    errorCode: result.ErrorCode,
                };
                if (result.HasError) {
                    returnData.result = undefined;
                } else {

                    if(result.Result) {
                        var points = result.Result;
                        var pointsData = [];
                        for (var i = 0; i < points.length; i++) {
                            var pointData = points[i];

                            var gameInfo = pointData.GameInfo;
                            var point = pointData.Point;

                            if(gameInfo.PreviewInfo) {
                                gameInfo.PreviewInfo.id += "";
                            }

                            pointsData.push({
                                point : {
                                    amount : point.Amount,
                                    creationDate : point.CreationDate

                                },
                                gameInfo : {
                                    downloadLink: gameInfo.DownloadLink,
                                    id: gameInfo.EntityId + "",
                                    postId: gameInfo.ID + "",
                                    name: gameInfo.Name,
                                    imageUrl: gameInfo.Preview,
                                    image: gameInfo.PreviewInfo,
                                    timelineId: gameInfo.TimelineId + "",
                                }
                            });

                        }

                        returnData.result = {
                            hasNext: sendData.size == pointsData.length,
                            nextOffset: sendData.offset += pointsData.length,
                            count : result.Count,
                            points : pointsData
                        };

                    } else {
                        returnData.result = null;
                    }

                }

                callback(returnData);

            });
        };

        /**
         * <div style='width: 100%;text-align: right'> دریافت لیست درخواست های دوستی دریافت شده </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *
         *      service.getReceivedFriendshipRequest(reqData, function() {
         *              console.log("getReceivedFriendshipRequest method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getReceivedFriendshipRequest
         * @param {Object} params
         *      <ul>
         *          <li>{String} [status]
         *              <p>    1 = ارسال شده </p>
         *              <p>    2 = بلاک شده </p>
         *              <p>    4 = رد شده </p>
         *              <p>    8 = پذیرفته شده </p>
         *          </li>
         *          <li>{String} [size=50]</li>
         *          <li>{String} [offset]</li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{JSONArray} requests
         *                      <ul>
         *                          <li>{Long} creationDate </li>
         *                          <li>{String} requestId </li>
         *                          <li>{Integer} status </li>
         *                          <li>{JSONObject} toUser
         *                              <ul>
         *                                  <li>{String} id</li>
         *                                  <li>{JSONObject} image</li>
         *                                  <li>{String} imageUrl</li>
         *                                  <li>{String} name</li>
         *                              </ul>
         *                          </li>
         *                          <li>{JSONObject} fromUser
         *                              <ul>
         *                                  <li>{String} id</li>
         *                                  <li>{JSONObject} image</li>
         *                                  <li>{String} imageUrl</li>
         *                                  <li>{String} name</li>
         *                              </ul>
         *                          </li>
         *                      </ul>
         *                  </li>
         *                  <li>{Integer} count</li>
         *                  <li>{Boolean} hasNext</li>
         *                  <li>{Integer} nextOffset</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getReceivedFriendshipRequest = function (params, callback) {

            if (typeof params != "object" || params === null) {
                throw new ServiceException("params is not exist");
            }

            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }

            var sendData = {
                size : 50,
                offset : 0
            };

            if(typeof params.offset === "number" && params.offset > 0) {
                sendData.offset = params.offset;
            }

            if(typeof params.size === "number" && params.size > 0) {
                sendData.size = params.size;
            }

            if(params.status) {
                sendData.status = params.status;
            }

            __request("receivedFriendshipRequest", sendData, function (result) {

                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage,
                    errorCode: result.ErrorCode,
                };
                if (result.HasError) {
                    returnData.result = undefined;
                } else {

                    if(result.Result) {
                        var requests = result.Result;
                        var requestsData = [];
                        for (var i = 0; i < requests.length; i++) {
                            requestsData.push(__reformatFriendshipRes(requests[i]));

                        }

                        returnData.result = {
                            hasNext: sendData.size == requestsData.length,
                            nextOffset: sendData.offset += requestsData.length,
                            count : result.Count,
                            requests : requestsData
                        };

                    } else {
                        returnData.result = null;
                    }

                }

                callback(returnData);

            });
        };

        /**
         * <div style='width: 100%;text-align: right'> دریافت لیست درخواست های دوستی ارسال شده </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *
         *      service.getSentFriendshipRequest(reqData, function() {
         *              console.log("getSentFriendshipRequest method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getSentFriendshipRequest
         * @param {Object} params
         *      <ul>
         *          <li>{String} [status]
         *              <p>    1 = ارسال شده </p>
         *              <p>    2 = بلاک شده </p>
         *              <p>    4 = رد شده </p>
         *              <p>    8 = پذیرفته شده </p>
         *              <li>{String} [userId]</li>
         *          </li>
         *          <li>{String} [size=50]</li>
         *          <li>{String} [offset]</li>
         *          <li>{String} [userId]</li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{JSONArray} requests
         *                      <ul>
         *                          <li>{Long} creationDate </li>
         *                          <li>{String} requestId </li>
         *                          <li>{Integer} status </li>
         *                          <li>{JSONObject} toUser
         *                              <ul>
         *                                  <li>{String} id</li>
         *                                  <li>{JSONObject} image</li>
         *                                  <li>{String} imageUrl</li>
         *                                  <li>{String} name</li>
         *                              </ul>
         *                          </li>
         *                      </ul>
         *                  </li>
         *                  <li>{Integer} count</li>
         *                  <li>{Boolean} hasNext</li>
         *                  <li>{Integer} nextOffset</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getSentFriendshipRequest = function (params, callback) {

            if (typeof params != "object" || params === null) {
                throw new ServiceException("params is not exist");
            }

            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }

            var sendData = {
                size : 50,
                offset : 0
            };

            if(typeof params.offset === "number" && params.offset > 0) {
                sendData.offset = params.offset;
            }

            if(typeof params.size === "number" && params.size > 0) {
                sendData.size = params.size;
            }

            if(params.status) {
                sendData.status = params.status;
            }

            if(params.userId) {
                sendData.userId = params.userId;
            }

            __request("sentFriendshipRequest", sendData, function (result) {

                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage,
                    errorCode: result.ErrorCode,
                };
                if (result.HasError) {
                    returnData.result = undefined;
                } else {

                    if(result.Result) {
                        var requests = result.Result;
                        var requestsData = [];
                        for (var i = 0; i < requests.length; i++) {
                            requestsData.push(__reformatFriendshipRes(requests[i]));
                        }

                        returnData.result = {
                            hasNext: sendData.size == requestsData.length,
                            nextOffset: sendData.offset += requestsData.length,
                            count : result.Count,
                            requests : requestsData
                        };

                    } else {
                        returnData.result = null;
                    }

                }

                callback(returnData);

            });
        };

        /**
         * <div style='width: 100%;text-align: right'> ارسال درخواست دوستی </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {
         *          userId : "233"
         *      };
         *
         *      service.friendshipRequest(reqData, function() {
         *              console.log("friendshipRequest method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method friendshipRequest
         * @param {Object} params
         *      <ul>
         *          <li>{String} userId</li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{Long} creationDate </li>
         *                  <li>{String} requestId </li>
         *                  <li>{Integer} status </li>
         *                  <li>{JSONObject} toUser
         *                      <ul>
         *                          <li>{String} id</li>
         *                          <li>{JSONObject} image</li>
         *                          <li>{String} imageUrl</li>
         *                          <li>{String} name</li>
         *                      </ul>
         *                  </li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.friendshipRequest = function (params, callback) {

            if (typeof params != "object" || params === null) {
                throw new ServiceException("params is not exist");
            }

            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }

            if (!params.userId) {
                throw new ServiceException("userId key is not exist");
            }

            var sendData = {
                toUserId : params.userId
            };

            __request("friendshipRequest", sendData, function (result) {


                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage,
                    errorCode: result.ErrorCode,
                };
                if (result.HasError) {
                    returnData.result = undefined;
                } else {
                    var innerRes = result.Result;
                    if(innerRes) {
                        returnData.result = __reformatFriendshipRes(innerRes);

                    } else {
                        returnData.result = null;
                    }

                }

                callback(returnData);

            });
        };

        /**
         * <div style='width: 100%;text-align: right'> تعیین وضعیت درخواست دوستی </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {
         *          requestId : "22342",
         *          reply : 1
         *      };
         *
         *      service.replyFriendshipRequest(reqData, function() {
         *              console.log("replyFriendshipRequest method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method replyFriendshipRequest
         * @param {Object} params
         *      <ul>
         *          <li>{String} requestId</li>
         *          <li>{Integer} reply
         *              <p>     1 = پذیرش درخواست </p>
         *              <p>     2 = رد درخواست </p>
         *              <p>     3 = رد درخواست و بلاک کاربر </p>
         *          </li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{Long} creationDate </li>
         *                  <li>{String} userId </li>
         *                  <li>{Integer} status </li>
         *                  <li>{JSONObject} toUser
         *                      <ul>
         *                          <li>{String} id</li>
         *                          <li>{JSONObject} image</li>
         *                          <li>{String} imageUrl</li>
         *                          <li>{String} name</li>
         *                      </ul>
         *                  </li>
         *                  <li>{JSONObject} fromUser
         *                      <ul>
         *                          <li>{String} id</li>
         *                          <li>{JSONObject} image</li>
         *                          <li>{String} imageUrl</li>
         *                          <li>{String} name</li>
         *                      </ul>
         *                  </li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.replyFriendshipRequest = function (params, callback) {

            if (typeof params != "object" || params === null) {
                throw new ServiceException("params is not exist");
            }

            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }

            if (!params.requestId) {
                throw new ServiceException("requestId key is not exist");
            }

            if (!params.reply) {
                throw new ServiceException("reply key is not exist");
            }

            var sendData = {
                requestId : params.requestId,
                reply : params.reply,
            };

            __request("replyFriendshipRequest", sendData, function (result) {

                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage,
                    errorCode: result.ErrorCode,
                };

                var innerRes = result.Result;
                if(innerRes) {
                    returnData.result = __reformatFriendshipRes(innerRes);

                } else {
                    returnData.result = null;
                }

                callback(returnData);

            });
        };

        /**
         * <div style='width: 100%;text-align: right'> تعیین وضعیت درخواست دوستی </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {
         *          requestId : "22342",
         *      };
         *
         *      service.cancelFriendshipRequest(reqData, function() {
         *              console.log("cancelFriendshipRequest method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method cancelFriendshipRequest
         * @param {Object} params
         *      <ul>
         *          <li>{String} requestId</li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.cancelFriendshipRequest = function (params, callback) {

            if (typeof params != "object" || params === null) {
                throw new ServiceException("params is not exist");
            }

            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }

            if (!params.requestId) {
                throw new ServiceException("requestId key is not exist");
            }


            var sendData = {
                requestId : params.requestId
            };

            __request("cancelFriendshipRequest", sendData, function (result) {

                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage,
                    errorCode: result.ErrorCode,
                    result : {}
                };
                callback(returnData);

            });
        };

        /**
         * <div style='width: 100%;text-align: right'> دریافت لیست دوستان </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *
         *      service.getUserFriends(reqData, function() {
         *              console.log("getUserFriends method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getUserFriends
         * @param {Object} params
         *      <ul>
         *          <li>{String} [name] </li>
         *          <li>{String} [size=50] </li>
         *          <li>{String} [offset] </li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{JSONArray} friends
         *                      <ul>
         *                          <li>{Long} friendshipDate </li>
         *                          <li>{String} id </li>
         *                          <li>{Integer} status </li>
         *                          <li>{JSONObject} user
         *                              <ul>
         *                                  <li>{String} id</li>
         *                                  <li>{String} imageUrl</li>
         *                                  <li>{String} name</li>
         *                                  <li>{String} nickname</li>
         *                                  <li>{String} username</li>
         *                              </ul>
         *                          </li>
         *                      </ul>
         *                  </li>
         *                  <li>{Integer} count</li>
         *                  <li>{Boolean} hasNext</li>
         *                  <li>{Integer} nextOffset</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getUserFriends = function (params, callback) {

            if (typeof params != "object" || params === null) {
                throw new ServiceException("params is not exist");
            }

            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }

            var sendData = {
                size : 50,
                offset : 0
            };

            if(typeof params.offset === "number" && params.offset > 0) {
                sendData.offset = params.offset;
            }

            if(typeof params.size === "number" && params.size > 0) {
                sendData.size = params.size;
            }

            if(params.name) {
                sendData.name = params.name;
            }

            __request("userFriends", sendData, function (result) {

                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage,
                    errorCode: result.ErrorCode,
                };
                if (result.HasError) {
                    returnData.result = undefined;
                } else {

                    if(result.Result) {
                        var friends = result.Result;
                        var friendsData = [];

                        for (var i = 0; i < friends.length; i++) {
                            var frData = friends[i];
                            frData.User && (frData.User.id += "");

                            var user = frData.User;
                            if(user) {
                                user.imageUrl = user.image;
                                delete user.image;
                            }

                            friendsData.push({
                                friendshipDate : frData.FriendshipDate,
                                id : frData.ID + "",
                                user : frData.User
                            });
                        }

                        returnData.result = {
                            hasNext: sendData.size == friendsData.length,
                            nextOffset: sendData.offset += friendsData.length,
                            count : result.Count,
                            friends : friendsData
                        };

                    } else {
                        returnData.result = null;
                    }

                }

                callback(returnData);

            });
        };

        /**
         * <div style='width: 100%;text-align: right'> حذف  دوستی  </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {
         *          id : "22342",
         *      };
         *
         *      service.removeFriend(reqData, function() {
         *              console.log("removeFriend method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method removeFriend
         * @param {Object} params
         *      <ul>
         *          <li>{String} id</li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{Boolean} state </li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.removeFriend = function (params, callback) {

            if (typeof params != "object" || params === null) {
                throw new ServiceException("params is not exist");
            }

            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }

            if (!params.id) {
                throw new ServiceException("id key is not exist");
            }


            var sendData = {
                id : params.id
            };

            __request("removeFriendship", sendData, function (result) {

                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage,
                    errorCode: result.ErrorCode,
                };

                var innerRes = result.Result;
                if(innerRes) {
                    returnData.result = {
                        state : innerRes
                    };

                } else {
                    returnData.result = null;
                }

                callback(returnData);

            });
        };

        /**
         * <div style='width: 100%;text-align: right'>  دریافت اخبار </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["businessId"] = "26";
         *      service.getNews(reqData, function() {
         *              console.log("getNews method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getNews
         * @public
         *
         * @param {Object} params
         *      <ul>
         *          <li>{String} businessId - شناسه بیزینس</li>
         *          <li>{JSONArray} [timelineIds]</li>
         *          <li>{Integer} [size=20]</li>
         *          <li>{Integer} [offset=0]</li>
         *      </ul>
         *
         *  @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{JSONArray} news :
         *                      <ul>
         *                          <li>{JSONObject} business</li>
         *                          <li>{String} id</li>
         *                          <li>{String} name</li>
         *                          <li>{Integer} numOfProducts</li>
         *                          <li>{JSONObject} rate
         *                              <ul>
         *                                  <li>{Integer} rate</li>
         *                                  <li>{Integer} rateCount</li>
         *                              </ul>
         *                          </li>
         *                          <li>{JSONObject} [image]
         *                              <ul>
         *                                  <li>{String} id</li>
         *                                  <li>{String} name</li>
         *                                  <li>{String} url</li>
         *                                  <li>{Integer} width</li>
         *                                  <li>{Integer} height</li>
         *                              </ul>
         *                          </li>
         *                          <li>{JSONArray} categoryList</li>
         *                          <li>{Boolean} enable</li>
         *                          <li>{Boolean} hide</li>
         *                          <li>{Boolean} hot</li>
         *                          <li>{String} entityId</li>
         *                          <li>{String} id</li>
         *                          <li>{Double} latitude</li>
         *                          <li>{Double} longitude</li>
         *                          <li>{String} link</li>
         *                          <li>{String} metadata</li>
         *                          <li>{String} rootitr</li>
         *                          <li>{String} shortDescription</li>
         *                          <li>{String} text</li>
         *                          <li>{String} title</li>
         *                          <li>{String} timelineId</li>
         *                          <li>{Integer} numOfComments</li>
         *                          <li>{Integer} numOfFavorites</li>
         *                          <li>{Integer} numOfLikes</li>
         *                          <li>{Integer} timestamp</li>
         *                          <li>{JSONObject} userPostInfo
         *                              <ul>
         *                                  <li>{String} postId</li>
         *                                  <li>{Boolean} favorite</li>
         *                                  <li>{Boolean} liked</li>
         *                              </ul>
         *                          </li>
         *                          <li>{JSONObject} image
         *                              <ul>
         *                                  <li>{String} id</li>
         *                                  <li>{String} name</li>
         *                                  <li>{String} url</li>
         *                                  <li>{Integer} width</li>
         *                                  <li>{Integer} height</li>
         *                              </ul>
         *                          </li>
         *                      </ul>
         *                  </li>
         *                  <li>{Boolean} hasNext</li>
         *                  <li>{Integer} nextOffset</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getNews = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params not exist or not an object");
            }

            if (!params.businessId) {
                throw new ServiceException("businessId key is not exist");
            }


            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }


            var requestData = {
                businessId: params.businessId,
                size : 10,
                offset : 0
            };

            if(typeof params.offset === "number" && params.offset > 0) {
                requestData.offset = params.offset;
            }

            if(typeof params.size === "number" && params.size > 0) {
                requestData.size = params.size;
            }


            if(params.timelineIds) {
                requestData.newsId = params.timelineIds;
            }
            __request("getNews", requestData, function (result) {
                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage,
                    errorCode: result.ErrorCode,
                };
                if (result.HasError) {
                    returnData.result = undefined;
                } else {

                    if(result.Result) {
                        var requests = result.Result;
                        var requestsData = [];
                        for (var i = 0; i < requests.length; i++) {
                            requestsData.push(__reformatNewsObject(requests[i]));
                        }

                        returnData.result = {
                            hasNext: requestData.size == requestsData.length,
                            nextOffset: requestData.offset += requestsData.length,
                            count : result.Count,
                            news : requestsData
                        };

                    } else {
                        returnData.result = null;
                    }

                }

                callback(returnData);
            });
        };

        /**
         * <div style='width: 100%;text-align: right'> دریافت دسته بندی های بازی</div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *
         *      service.getLobby(reqData, function() {
         *              console.log("getLobby method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getLobby
         * @protected
         * @param {Object} params
         *      <ul>
         *      </ul>
         *
         * @param  callback
         *      <p>onResult method params is JSONObject that has</p>
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONArray} result - Array Of JSONObject that contain :
         *              <ul>
         *                  <li>{String} id</li>
         *                  <li>{String} name</li>
         *                  <li>{JSONObject} [image]
         *                      <ul>
         *                          <li>{String} id</li>
         *                          <li>{String} url</li>
         *                          <li>{Integer} width</li>
         *                          <li>{Integer} height</li>
         *                      </ul>
         *                  </li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای سرویس
         * */
        __self.getLobby = function (params, callback) {


            __request("getLobbies", {}, function (result) {
                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage
                };
                if (result.HasError) {
                    returnData.result = undefined;
                } else {
                    var retRes = result.Result;
                    var retRestul = [];

                    if (retRes) {
                        for (var i = 0; i < retRes.length; i++) {
                            var lobby = retRes[i];
                            var data = {
                                id : lobby.ID + "",
                                name : lobby.Name,
                                image : lobby.Image,
                            };

                            if(data.image) {
                                data.image.id += "";
                            }

                            retRestul.push(data);


                        }
                    }

                    returnData.result = retRestul;
                }

                callback(returnData);

            });
        };

        /**
         * <div style='width: 100%;text-align: right'>دریافت لیست بازی ها بر اساس لابی </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData.put("lobbyIds",["33","333"]);
         *      service.getLobbiesGames(reqData, function() {
         *              console.log("getLobbiesGames method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getLobbiesGames
         * @protected
         *
         * @param {Object} params
         *      <ul>
         *          <li>{JSONArray} [lobbyIds] - شناسه لابی</li>
         *          <li>{Integer} [size=20]</li>
         *          <li>{Integer} [offset=0]</li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONArray} result
         *              <ul>
         *                  <li>{Boolean} lobbyId</li>
         *                  <li>{JSONArray} games
         *                      <ul>
         *                          <li>{String} id</li>
         *                          <li>{String} name</li>
         *                          <li>{String} description</li>
         *                          <li>{String} creator</li>
         *                          <li>{String} physicalUrl</li>
         *                          <li>{String} timelineId</li>
         *                          <li>{String} packageName</li>
         *                          <li>{String} mobileVersion</li>
         *                          <li>{String} mobileVersionCode</li>
         *                          <li>{String} supporterId</li>
         *                          <li>{String} defaultLeagueId</li>
         *                          <li>{String} downloadLink</li>
         *                          <li>{String} gamePlayDescription</li>
         *                          <li>{String} score</li>
         *                          <li>{String} webVersion</li>
         *                          <li>{JSONArray} attributeValues</li>
         *                          <li>{JSONArray} categoryList</li>
         *                          <li>{JSONObject} business</li>
         *                          <li>{JSONObject} userPostInfo
         *                              <ul>
         *                                  <li>{Boolean} favorite</li>
         *                                  <li>{Boolean} liked</li>
         *                                  <li>{String} postId</li>
         *                              </ul>
         *                          </li>
         *                          <li>{JSONObject} rate
         *                              <ul>
         *                                  <li>{Integer} rate.rate</li>
         *                                  <li>{Integer} rate.rateCount</li>
         *                              </ul>
         *                          </li>
         *                          <li>{JSONObject} image
         *                              <ul>
         *                                  <li>{String} image.id</li>
         *                                  <li>{String} image.url</li>
         *                                  <li>{String} image.hashCode</li>
         *                                  <li>{Integer} image.width</li>
         *                                  <li>{Integer} image.height</li>
         *                              </ul>
         *                          </li>
         *                          <li>{Integer} playerNumbersType</li>
         *                          <li>{Integer} platformType</li>
         *                          <li>{Integer} availableCount</li>
         *                          <li>{Integer} discount</li>
         *                          <li>{Integer} numOfComments</li>
         *                          <li>{Integer} numOfFavorites</li>
         *                          <li>{Integer} numOfLikes</li>
         *                          <li>{Boolean} canComment</li>
         *                          <li>{Boolean} canLike</li>
         *                          <li>{Boolean} enable</li>
         *                          <li>{Boolean} hide</li>
         *                          <li>{Double} latitude</li>
         *                          <li>{Double} longitude</li>
         *                          <li>{Double} publishedDate</li>
         *                          <li>{Double} price</li>
         *                          <li>{Double} timestamp</li>
         *                      </ul>
         *                  </li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getLobbiesGames = function (params,callback) {
            if (typeof params != "object" || params === null) {
                throw new ServiceException("params is not exist");
            }

            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }

            var sendData = {
                size : 20,
                offset : 0
            };

            if(typeof params.offset === "number" && params.offset > 0) {
                sendData.offset = params.offset;
            }

            if(typeof params.size === "number" && params.size > 0) {
                sendData.size = params.size;
            }

            if(Array.isArray(params.lobbyIds) && params.lobbyIds.length>0) {
                sendData.lobbyIds = params.lobbyIds;
            }


            __request("getLobbyGames", sendData, function (result) {

                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage,
                    errorCode: result.ErrorCode,
                };
                if (result.HasError) {
                    returnData.result = undefined;
                } else {

                    var lobbiesGames = [];

                    if(result.Result) {

                        for(var i in result.Result) {
                            var data = {
                                lobbyId : i,
                                games : []
                            }

                            var games = result.Result[i];

                            for (var j = 0; j < games.length; j++) {
                                var game = games[j];

                                data.games.push(__reformatGameObject(game));

                            }
                            lobbiesGames.push(data)
                        }


                        returnData.result = lobbiesGames

                    } else {
                        returnData.result = [];
                    }

                }

                callback(returnData);

            });
        };

        /**
         * <div style='width: 100%;text-align: right'>دریافت لیست لیگ ها بر اساس لابی </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData.put("lobbyIds",["2222","44"]);
         *      service.getLobbiesLeagues(reqData, function() {
         *              console.log("getLobbiesLeagues method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getLobbiesLeagues
         * @protected
         *
         * @param {Object} params
         *      <ul>
         *          <li>{JSONArray} [lobbyIds] - شناسه لابی</li>
         *          <li>{Integer} [size=20]</li>
         *          <li>{Integer} [offset=0]</li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONArray} result
         *              <ul>
         *                  <li>{Boolean} lobbyId</li>
         *                  <li>{JSONArray} leagues
         *                      <ul>
         *                          <li>{String} id </li>
         *                          <li>{String} enrollUrl</li>
         *                          <li>{Boolean} isMember </li>
         *                          <li>{Boolean} isFollower</li>
         *                          <li>{JSONObject} userPostInfo
         *                              <ul>
         *                                  <li>{Boolean} favorite</li>
         *                                  <li>{Boolean} liked</li>
         *                                  <li>{String} postId</li>
         *                              </ul>
         *                          </li>
         *                          <li>{JSONObject} image
         *                              <ul>
         *                                  <li>{String} id</li>
         *                                  <li>{String} url</li>
         *                                  <li>{Integer} width</li>
         *                                  <li>{Integer} height</li>
         *                              </ul>
         *                          </li>
         *                          <li>{Integer} gameType</li>
         *                          <li>{Integer} playerType</li>
         *                          <li>{Integer} status</li>
         *                          <li>{Integer} financialType</li>
         *                          <li>{Integer} lobbyId</li>
         *                          <li>{Integer} maxPlayers</li>
         *                          <li>{Integer} minNoOfPlayedGames</li>
         *                          <li>{Integer} minPlayers</li>
         *                          <li>{Integer} memberCount</li>
         *                          <li>{Integer} playerNumberType</li>
         *                          <li>{Integer} timestamp</li>
         *                          <li>{String} creator</li>
         *                          <li>{Integer} memberCount</li>
         *                          <li>{Integer} availableCount</li>
         *                          <li>{Integer} discount</li>
         *                          <li>{Integer} numOfComments</li>
         *                          <li>{Integer} numOfFavorites</li>
         *                          <li>{Integer} numOfLikes</li>
         *                          <li>{Integer} type</li>
         *                          <li>{Integer} [endTime]</li>
         *                          <li>{Integer} [startTime]</li>
         *                          <li>{String} rules</li>
         *                          <li>{String} description</li>
         *                          <li>{String} name</li>
         *                          <li>{String} ThreadId</li>
         *                          <li>{String} timelineId</li>
         *                          <li>{Boolean} hasPrize</li>
         *                          <li>{Boolean} quickMatch</li>
         *                          <li>{Boolean} startTypeCapacityComplete</li>
         *                          <li>{Boolean} startTypeFromDate</li>
         *                          <li>{Boolean} startTypePublishDate</li>
         *                          <li>{Boolean} canComment</li>
         *                          <li>{Boolean} canLike</li>
         *                          <li>{Boolean} enable</li>
         *                          <li>{Boolean} hide</li>
         *                          <li>{Double} price</li>
         *                          <li>{JSONArray} attributeValues</li>
         *                          <li>{JSONArray} categoryList</li>
         *                          <li>{JSONObject} business</li>
         *                          <li>{JSONObject} rate</li>
         *                          <li>{JSONArray} games</li>
         *                      </ul>
         *                  </li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getLobbiesLeagues = function (params,callback) {
            if (typeof params != "object" || params === null) {
                throw new ServiceException("params is not exist");
            }

            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }

            var sendData = {
                size : 20,
                offset : 0
            };

            if(typeof params.offset === "number" && params.offset > 0) {
                sendData.offset = params.offset;
            }

            if(typeof params.size === "number" && params.size > 0) {
                sendData.size = params.size;
            }

            if(Array.isArray(params.lobbyIds) && params.lobbyIds.length>0) {
                sendData.lobbyIds = params.lobbyIds;
            }


            __request("getLobbyLeagues", sendData, function (result) {

                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage,
                    errorCode: result.ErrorCode,
                };
                if (result.HasError) {
                    returnData.result = undefined;
                } else {

                    var lobbiesGames = [];

                    if(result.Result) {


                        for(var i in result.Result) {
                            var data = {
                                lobbyId : i,
                                leagues : []
                            }

                            var leagues = result.Result[i];

                            for (var j = 0; j < leagues.length; j++) {
                                var game = leagues[j];

                                data.leagues.push(__reformatLeagueObject(game));

                            }
                            lobbiesGames.push(data)
                        }


                        returnData.result = lobbiesGames

                    } else {
                        returnData.result = [];
                    }

                }

                callback(returnData);

            });
        };

        /**
         * <div style='width: 100%;text-align: right'> دریافت گالری تصاویر یک بازی </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {
         *          gameId : "233",
         *          businessId : "44",
         *      };
         *
         *      service.getGallery(reqData, function() {
         *              console.log("getGallery method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getGallery
         * @param {Object} params
         *      <ul>
         *          <li>{String} gameId</li>
         *          <li>{String} businessId</li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONArray} result
         *              <ul>
         *                  <li>{String} imageUrl </li>
         *                  <li>{String} title </li>
         *                  <li>{String} description </li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getGallery = function (params,callback) {
            if (typeof params != "object") {
                throw new ServiceException("params not exist or not an object");
            }

            if (!params.businessId) {
                throw new ServiceException("businessId key is not exist");
            }
            if (!params.gameId) {
                throw new ServiceException("gameId key is not exist");
            }


            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }


            var requestData = {
                businessId: params.businessId,
                productId: params.gameId
            };


            __request("getGallery", requestData, function (result) {
                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage,
                    errorCode: result.ErrorCode,
                };
                if (result.HasError) {
                    returnData.result = undefined;
                } else {

                    if(result.Result) {
                        var images = result.Result;
                        var refImages = [];
                        for (var i = 0; i < images.length; i++) {
                            refImages.push({
                                imageUrl : images[i].previewImage,
                                title : images[i].title,
                                description : images[i].description,
                            });
                        }

                        returnData.result = refImages;

                    } else {
                        returnData.result = [];
                    }

                }

                callback(returnData);
            });
        }

        /**
         * <div style='width: 100%;text-align: right'> دریافت لیست نظر های بازی و یا لیگ</div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {};
         *      reqData["gameId"] = "26";
         *      service.getCommentList(reqData, function() {
         *              console.log("getCommentList method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method getCommentList
         * @public
         *
         * @param {Object} params
         *      <ul>
         *          <li>{Integer} [size=20]</li>
         *          <li>{Integer} [offset=0]</li>
         *          <li>{String} id شناسه پست بازی و یا لیگ</li>
         *      </ul>
         *
         *  @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONArray} result
         *              <ul>
         *                  <li>{JSONArray} comments - Array Of JSONObject that contain :
         *                      <ul>
         *                          <li>{Boolean} confirmed</li>
         *                          <li>{String} id</li>
         *                          <li>{String} text</li>
         *                          <li>{Double} timestamp</li>
         *                          <li>{JSONObject} user
         *                              <ul>
         *                                  <li>{String} id</li>
         *                                  <li>{String} name</li>
         *                                  <li>{JSONObject} image
         *                                      <ul>
         *                                          <li>{String} id</li>
         *                                          <li>{Integer} actualWidth</li>
         *                                          <li>{Integer} actualHeight</li>
         *                                          <li>{Integer} width</li>
         *                                          <li>{Integer} height</li>
         *                                      </ul>
         *                                  </li>
         *                              </ul>
         *                          </li>
         *                      </ul>
         *                  </li>
         *                  <li>{Boolean} hasNext</li>
         *                  <li>{Integer} nextOffset</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.getCommentList = function (params, callback) {
            if (typeof params != "object") {
                throw new ServiceException("params not exist or not an object");
            }

            if (!params.id) {
                throw new ServiceException("id key is not exist");
            }


            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }


            var requestData = {
                postId: params.id,
                size : 10,
                offset : 0
            };

            if(typeof params.offset === "number" && params.offset > 0) {
                requestData.offset = params.offset;
            }

            if(typeof params.size === "number" && params.size > 0) {
                requestData.size = params.size;
            }

            __request("getCommentList", requestData, function (result) {
                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage,
                    errorCode: result.ErrorCode,
                };
                if (result.HasError) {
                    returnData.result = undefined;
                } else {

                    if(result.Result) {
                        var requests = result.Result;
                        var requestsData = [];
                        for (var i = 0; i < requests.length; i++) {
                            requestsData.push(__reformatCommentFormat(requests[i]));
                        }

                        returnData.result = {
                            hasNext: requestData.size == requestsData.length,
                            nextOffset: requestData.offset += requestsData.length,
                            count : result.Count,
                            comments : requestsData
                        };

                    } else {
                        returnData.result = null;
                    }

                }

                callback(returnData);
            });
        };

        /**
         * <div style='width: 100%;text-align: right'> افزودن نظر بر روی یک بازی </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {
         *          id : "233",
         *          text : "text"
         *      };
         *
         *      service.addGameCommentRequest(reqData, function() {
         *              console.log("addGameCommentRequest method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method addGameCommentRequest
         * @param {Object} params
         *      <ul>
         *          <li>{String} id</li>
         *          <li>{String} text</li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONArray} result
         *              <ul>
         *                  <li>{String} id</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.addGameCommentRequest = function (params, callback) {

            if (typeof params != "object" || params === null) {
                throw new ServiceException("params is not exist");
            }

            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }

            if (!params.id) {
                throw new ServiceException("id key is not exist");
            }
            if (!params.text) {
                throw new ServiceException("text key is not exist");
            }

            var sendData = {
                postId : params.id,
                comment : params.text,
            };

            __request("addGameComment", sendData, function (result) {


                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage,
                    errorCode: result.ErrorCode,
                };
                if (result.HasError) {
                    returnData.result = undefined;
                } else {
                    returnData.result = {
                        id : result.Result
                    }
                }

                callback(returnData);

            });
        };

        /**
         * <div style='width: 100%;text-align: right'> افزودن نظر بر روی یک لیگ </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {
         *          id : "23",
         *          text : "text"
         *      };
         *
         *      service.addLeagueCommentRequest(reqData, function() {
         *              console.log("addLeagueCommentRequest method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method addLeagueCommentRequest
         * @param {Object} params
         *      <ul>
         *          <li>{String} id</li>
         *          <li>{String} text</li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONArray} result
         *              <ul>
         *                  <li>{String} id</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.addLeagueCommentRequest = function (params, callback) {

            if (typeof params != "object" || params === null) {
                throw new ServiceException("params is not exist");
            }

            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }

            if (!params.id) {
                throw new ServiceException("id key is not exist");
            }
            if (!params.text) {
                throw new ServiceException("id key is not exist");
            }

            var sendData = {
                postId : params.id,
                comment : params.text,
            };

            __request("addLeagueComment", sendData, function (result) {

                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage,
                    errorCode: result.ErrorCode,
                };
                if (result.HasError) {
                    returnData.result = undefined;
                } else {
                    returnData.result = {
                        id : result.Result
                    }
                }

                callback(returnData);

            });
        };

        /**
         * <div style='width: 100%;text-align: right'>بازی درخواست دنبال کردن </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {
         *          businessId : "233",
         *          postId : "333",
         *          state : true,
         *      };
         *
         *      service.followGameRequest(reqData, function() {
         *              console.log("followGameRequest method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method followGameRequest
         * @param {Object} params
         *  <ul>
         *      <li>{String} businessId - شناسه بیزینس</li>
         *      <li>{String} postId - شناسه پست</li>
         *      <li>{Boolean} [state = true] - وضعیت فالو</li>
         *  </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.followGameRequest = function (params, callback) {

            if (typeof params != "object" || params === null) {
                throw new ServiceException("params is not exist");
            }

            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }

            if (!params.businessId) {
                throw new ServiceException("businessId key is not exist");
            }
            if (!params.postId) {
                throw new ServiceException("postId key is not exist");
            }

            var state = true;

            if(typeof params.state == "boolean"){
                state = params.state;
            }

            var sendData = {
                businessId : params.businessId,
                postId : params.postId,
                disfavorite : !state,
            };

            __request("gameFollow", sendData, function (result) {


                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage,
                    errorCode: result.ErrorCode,
                    result : null
                };

                callback(returnData);

            });
        };

        /**
         * <div style='width: 100%;text-align: right'> لیگ درخواست دنبال کردن </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {
         *          businessId : "233",
         *          postId : "333",
         *          state : true,
         *      };
         *
         *      service.followLeagueRequest(reqData, function() {
         *              console.log("followLeagueRequest method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method followLeagueRequest
         * @param {Object} params
         *  <ul>
         *      <li>{String} businessId - شناسه بیزینس</li>
         *      <li>{String} postId - شناسه پست</li>
         *      <li>{Boolean} [state = true] - وضعیت فالو</li>
         *  </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.followLeagueRequest = function (params, callback) {

            if (typeof params != "object" || params === null) {
                throw new ServiceException("params is not exist");
            }

            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }

            if (!params.businessId) {
                throw new ServiceException("businessId key is not exist");
            }
            if (!params.postId) {
                throw new ServiceException("postId key is not exist");
            }

            var state = true;

            if(typeof params.state == "boolean"){
                state = params.state;
            }

            var sendData = {
                businessId : params.businessId,
                postId : params.postId,
                disfavorite : !state,
            };

            __request("leagueFollow", sendData, function (result) {


                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage,
                    errorCode: result.ErrorCode,
                    result : null
                };

                callback(returnData);

            });
        };

        /**
         * <div style='width: 100%;text-align: right'>اعلام امتیاز کاربر به بازی</div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {
         *          gameId : "22",
         *          rate : 4
         *      };
         *
         *      service.sendGameRateRequest(reqData, function() {
         *              console.log("sendGameRateRequest method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method sendGameRateRequest
         * @param {Object} params
         *      <ul>
         *          <li>{String} gameId شناسه بازی</li>
         *          <li>{Integer} rate امتیاز کاربر</li>
         *      </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result
         *              <ul>
         *                  <li>{float} myRate</li>
         *                  <li>{rate} rate</li>
         *                  <li>{long} rateCount</li>
         *              </ul>
         *          </li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.sendGameRateRequest = function (params, callback) {

            if (typeof params != "object" || params === null) {
                throw new ServiceException("params is not exist");
            }

            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }

            if (!params.gameId) {
                throw new ServiceException("gameId key is not exist");
            }
            if (!params.rate) {
                throw new ServiceException("rate key is not exist");
            }


            var sendData = {
                entityId : params.gameId,
                rate : params.rate
            };

            __request("gameRate", sendData, function (result) {


                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage,
                    errorCode: result.ErrorCode,
                    result : result.Result
                };

                callback(returnData);

            });
        };

        /**
         * <div style='width: 100%;text-align: right'> درخواست دنبال کردن پست </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {
         *          postId : "333",
         *          state : true,
         *      };
         *
         *      service.followPostRequest(reqData, function() {
         *              console.log("followPostRequest method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method followPostRequest
         * @param {Object} params
         *  <ul>
         *      <li>{String} postId - شناسه پست</li>
         *      <li>{Boolean} [state = true] - وضعیت فالو</li>
         *  </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.followPostRequest = function (params, callback) {

            if (typeof params != "object" || params === null) {
                throw new ServiceException("params is not exist");
            }

            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }

            if (!params.postId) {
                throw new ServiceException("postId key is not exist");
            }

            var state = true;

            if(typeof params.state == "boolean"){
                state = params.state;
            }

            var sendData = {
                postId : params.postId,
                disfavorite : !state,
            };

            __request("followPost", sendData, function (result) {


                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage,
                    errorCode: result.ErrorCode,
                    result : null
                };

                callback(returnData);

            });
        };


        /**
         * <div style='width: 100%;text-align: right'> پست کردن لایک </div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {
         *          postId : "333",
         *          state : true,
         *      };
         *
         *      service.likePostRequest(reqData, function() {
         *              console.log("likePostRequest method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method likePostRequest
         * @param {Object} params
         *  <ul>
         *      <li>{String} postId - شناسه پست</li>
         *      <li>{Boolean} [state = true] - وضعیت فالو</li>
         *  </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.likePostRequest = function (params, callback) {

            if (typeof params != "object" || params === null) {
                throw new ServiceException("params is not exist");
            }

            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }

            if (!params.postId) {
                throw new ServiceException("postId key is not exist");
            }

            var state = true;

            if(typeof params.state == "boolean"){
                state = params.state;
            }

            var sendData = {
                postId : params.postId,
                dislike : !state,
            };

            __request("likePost", sendData, function (result) {


                var returnData = {
                    hasError: result.HasError,
                    errorMessage: result.ErrorMessage,
                    errorCode: result.ErrorCode,
                    result : null
                };

                callback(returnData);

            });
        };


        /**
         * <div style='width: 100%;text-align: right'> بررسی وضعیت امکان انجام مسابقه</div>
         * <pre>
         *  <code style='float:right'>نمونه کد</code>
         *  <code>
         *
         *      var reqData = {
         *          matchId : "1234",
         *      };
         *
         *      service.validateMatchIdRequest(reqData, function() {
         *              console.log("validateMatchIdRequest method : " + result);
         *      });
         *  </code>
         * </pre>
         * @method likePostRequest
         * @param {Object} params
         *  <ul>
         *      <li>{String} matchId - شناسه مسابقه</li>
         *  </ul>
         *
         * @param {Function} callback
         *      <ul>
         *          <li>{Boolean} hasError</li>
         *          <li>{String} errorMessage</li>
         *          <li>{Integer} errorCode</li>
         *          <li>{JSONObject} result</li>
         *      </ul>
         *
         * @throws ServiceException خطای پارامتر های ورودی
         * */
        __self.validateMatchIdRequest = function (params, callback) {

            if (typeof params != "object" || params === null) {
                throw new ServiceException("params is not exist");
            }

            if (typeof callback != "function") {
                throw new ServiceException("callback is not function");
            }

            if (!params.matchId) {
                throw new ServiceException("postId key is not exist");
            }


            var reqData = {
                matchId: params.matchId,
                sessionId: __userData.peerId,
                playerId: __userData.id
            };

            __request(
                "matchValidate", reqData, function (res) {

                    var returnData = {
                        hasError: res.HasError,
                        errorMessage: res.ErrorMessage,
                        errorCode: res.ErrorCode,
                        result : res.Result
                    };

                    callback(returnData);
                });
        };




        __self.inAppPurchaseState = function () {
            return __inAppPurchase;
        };

        __self.getConfig = function () {

            if(!__generatedConfig) {
                __generatedConfig = {
                    matchRequestTimeout: __configData.mrt,
                    maxMatchRequestCount: __configData.mmrc,
                    resendVerifyTimeout: __configData.rvt,
                    getChatHistoryCount: __configData.gchc,
                    supporterIds: __gameSupporterIds,
                    maxTextMessageLength: __configData.mtml,
                    maxEmojiInMessage: __configData.meim,
                    maxOfflineRequestMatchDay: __configData.mormd,
                    offlineRequestMinMinute: __configData.ormm,
                    quickMatchTimeout: __configData.qmt,
                    increaseCashUrl: __configData.icu,
                    creditUnit: __configData.cu,
                    localEditProfile: __configData.lep,
                    gameCenterLoginPageUrl: __configData.gclpu,
                    gameCenterUserPageUrl: "http://www." + __GCDomainName + (__userData.token ? "/?_token=" + __userData.token : "/") + __configData.gcuph,
                    alertHideTimeout: __configData.aht,
                    gameCenterRulesUrl: __configData.gcru,
                    chatItemId: __configData.ciid,
                    inAppPurchaseState: __inAppPurchase,
                    businessId: __configData.businessId,
                    emojiCustomPosName: __configData.ecpn,
                    gameCenterId: __configData.gcid,
                    objectPoolServerAddress: __serverData.OBJECT_POOL.address,
                    asyncServerAddress: __serverData.ASYNC.address,
                    exchangeServerAddress: __configData.exsa,
                    ssoLoginUrl: __configData.ssolu,
                    ssoSignupUrl: __configData.ssosu,
                    ssoLeagueEnrollUrl: __configData.ssoleu,
                    ssoGameBuyUrl: __configData.ssogbu,
                    ssoInApurchaseUrl: __configData.ssoiau,
                    ssoLogoutUrl: __configData.ssolou,
                    ssoCreditUrl: __configData.ssocu,
                    ssoEditProfileUrl: __configData.ssoepu,
                    gameCenterPackageName: __configData.gcpn,
                    gameCenterAndroidOsId: __configData.gcaosid,
                    httpAsyncRequest: __configData.har,
                    quizServerAddress: __configData.qsa,
                    quizPanelLink: __configData.qpl,
                    fileServerAddress: __serverData.IMAGE.address,
                    peerTimeout: __configData.pt,
                    creditFraction: __configData.cf,
                    loadOwnUI: __configData.loui,
                    loadOwnTableUI: __configData.lotui,
                    gameCenterDownloadLink : __configData.gcdl,
                    gameCenterAddress : __configData.gca,
                    lastAndroidAppVersion : __configData.malv,
                    lastAndroidAppChangeLog : __configData.malvcl,
                    lastAndroidAppDownloadLink : __configData.malvdl,
                    lastAndroidAppForceUpdate : __configData.malvfu,
                    lastWindowsAppVersion : __configData.palv,
                    lastWindowsAppChangeLog : __configData.palvcl,
                    lastWindowsAppDownloadLink : __configData.palvdl,
                    lastWindowsAppForceUpdate : __configData.palvfu,
                    gamesConfigData : __configData.gcd,
                    leaguesConfigData : __configData.lcd,
                };
            }
            return __generatedConfig;
        };

        __self.getGameCenterUrl = function () {
            return ("http://" + __GCDomainName);
        };

        __self.generateGameCenterLeagueUrl = function (params) {
            return __configData.bllp + params.leagueId;
        };

        __self.getGameName = function (params) {
            var gameId = params && params.gameId;
            if (gameId) {
                return __games[gameId].info.name;
            } else {
                gameId = Object.keys(__games)[0];
                return __games[gameId].info.name || "";
            }
        };

        __self.getRegisterGamesId = function () {
            return Object.keys(__games);
        };

        __self.getLogger = function () {
            return __logger;
        };

        __self.getAsyncInfo = function () {

            var sum = 0;
            for (var i = 0; i < __asyncInfo.nMinResTime.length; i++) {
                sum += __asyncInfo.nMinResTime[i];
            }

            return {
                globalAvgRes: parseInt(__asyncInfo.globalResAvg),
                nMinAvgRes: parseInt(sum / __asyncInfo.nMinResTime.length),
                lastResTime: __asyncInfo.lastResTime
            }
        };

        __self.getMatchRequestIds = function (params) {

            var ids = [];
            var requests = __activeMatchRequest[params.leagueId];
            if (requests) {
                for (var id in requests) {
                    if (requests[id].opponentId === params.opponentId) {
                        ids.push(id);
                    }
                }
            }
            return ids;
        };

        __self.getLauncherList = function (params, callback) {

            __request("launcherList", {osId: params.osId}, function (res) {

                try {
                    var results = JSON.parse(res.result);

                    callback(TisUtil.createReturnData(false, "", 0, results));
                } catch (e) {
                    callback(TisUtil.createReturnData(true, TisNetworkClass.ErroCodes.REQUESTFAILED, e.message));
                }
            }, {
                method: "GET"
            });
        };

        __self.sendMessage = function (params, callback) {
            __network.emit(params, callback);
        };

        __self.reformatUserItem = function (Result) {
            return __reformatUserItem(Result);
        };

        __self.isRunFromGC = function () {
            return __isRunFromGC;
        }

        __init();
    }

    Service.VERSION = "1.0.0";


    if (typeof exports !== 'undefined' && module.exports) {
        module.exports = Service;
    } else {
        if (!window.TIS) {
            window.TIS = {};
        }
        window.TIS.Service = Service;
    }
})();