package com.fanap.gameCenter.TIS.Share;

import org.json.JSONException;
import org.json.JSONObject;

public class ConfigData {
    public static boolean isLocal = false;
    public static String gcDomainName = isLocal ? "176.221.69.209:1036" : "pod.land";
    public static String serviceMode = ServiceModeTypes.RELEASEMODE;
    public static String gca   = isLocal ? (serviceMode.equals( ServiceModeTypes.DEVELOPMODE_ONLINE) ? "http://176.221.69.209:1036":"http://172.16.106.43:8082" ): "https://service-play.pod.land";
    public static String aha   = isLocal ? (serviceMode.equals( ServiceModeTypes.DEVELOPMODE_ONLINE) ? "http://sandbox.pod.land:8003":"http://172.16.110.235:8003" ): "https://playpod-bus.pod.land";
    public static String psa   = isLocal ? (serviceMode.equals( ServiceModeTypes.DEVELOPMODE_ONLINE) ? "ws://sandbox.pod.land:8003/ws":"ws://172.16.110.235:8003/ws") : "wss://playpod-bus.pod.land/ws";
    public static String psat  = isLocal ? (serviceMode.equals( ServiceModeTypes.DEVELOPMODE_ONLINE) ? "sandbox.pod.land:8002":"172.16.110.235:8002") : "https://playpod-bus.pod.land:8002";
    public static String csa   = isLocal ? (serviceMode.equals( ServiceModeTypes.DEVELOPMODE_ONLINE) ? "ws://sandbox.pod.land:8003/ws":"ws://172.16.110.235:8003/ws" ): "wss://playpod-bus.pod.land/ws";
    public static String csat  = isLocal ? (serviceMode.equals( ServiceModeTypes.DEVELOPMODE_ONLINE) ? "sandbox.pod.land:8002":"172.16.110.235:8002" ): "sandbox.pod.land:8002";
    public static String isa   = isLocal ? (serviceMode.equals( ServiceModeTypes.DEVELOPMODE_ONLINE) ? "http://sandbox.pod.land:8080":"http://172.16.110.76:8080"): "https://core.pod.land:8080";
    public static String opsa  = isLocal ? (serviceMode.equals( ServiceModeTypes.DEVELOPMODE_ONLINE) ? "http://176.221.69.213:8084":"http://172.16.106.45:8084" ): "http://84.241.60.231:8084";
    public static String gcid  = isLocal ? "44" : "3";// game center id
    public static String gcsid = isLocal ? "157" : "333";// game center supporter id
    public static String gcv   = isLocal ? "1.0.0" : "1.0.0";// game center id
    public static String gcau  = isLocal ? null : null;// game center android app url
    //    public static String configUrl = "http://service." + gcDomainName + "/srv/serviceApi/getConfig";
    public static String configURI = "/srv/serviceApi/getConfig";
    public static String configUrl = isLocal ? (gca + configURI)  : ("https://service-play." + gcDomainName + configURI);

    public static String domainName = "https://service-play." + gcDomainName;
    public static String gcpn = "land.pod.play";
    public static JSONObject gcd = new JSONObject();
    public static JSONObject lcd = new JSONObject();
    public static String malv = "1.0.0";// mobile app last version
    public static boolean malvfu = false;// mobile app last version force update
    public static String mamv = "1.0.0";// mobile app minimum versub
    public static String malvcl = ""; //mobile app last change log
    public static String malvdl = "";//mobile app last version download link
    public static String sba = "com.fanap.gameCenter.actions.gameToGC";
    public static String rba = "com.fanap.gameCenter.actions.GCToGame";
    public static String cu = "ریال";//CREDIT unit
    public static String ecpn = "TIS_CHAT_EMOJI_CONFIG";
    public static String uppu = "market://details?id=";// update package prefix url
    public static String sucpn = "TIS_SERVICE_UI";// service ui custom post name
    public static String icu =  "http://service."+ gcDomainName + "/payByGateway/";// increase CREDIT link
    public static String bglp = "http://www." + gcDomainName + "/#game/";// bazitech game link prefix
    public static String bllp = "http://www." + gcDomainName + "/#GET_LEAGUE/";// bazitech GET_LEAGUE link prefix
    public static String bvl = "http://www." +gcDomainName + "/about.html";// view bazitech in iFrame
    public static String qpl = "http://www." + gcDomainName + "/Hushang";// quiz panel link
    public static String gclpu = "http://www." + gcDomainName + "/index.html#login"; // game center LOGIN page url
    public static String gcru = "http://www." + gcDomainName + "/?#rules" ; // game center rules url
    public static String gcuph =  "#profile/user"; // game center user page hash
    public static String ehd =  "##$##"; // encryption hash delimiter
    public static String ssoleu =   isLocal ? (serviceMode.equals( ServiceModeTypes.DEVELOPMODE_ONLINE) ?
        "http://176.221.69.209:1036/Pages/League/Enroll/Default.aspx":
        "http://172.16.106.43:8082/Pages/League/Enroll/Default.aspx" ):
        "https://service-play.pod.land/Pages/League/Enroll/Default.aspx";  // sso league enroll url

    public static String ssolu =   isLocal ? (serviceMode.equals( ServiceModeTypes.DEVELOPMODE_ONLINE) ?
            "https://accounts.pod.land/oauth2/authorize/?client_id=39105edd466f819c057b3c937374&response_type=code&redirect_uri=http://176.221.69.209:1036/Pages/Auth/SSOCallback/Default.aspx&scope=phone profile":
            "http://172.16.110.76/oauth2/authorize/?client_id=59cbd42cc8f29e2ced10858d2&response_type=code&redirect_uri=http://172.16.106.43:8082/Pages/Auth/SSOCallback/Default.aspx&scope=phone profile" ):
            "https://accounts.pod.land/oauth2/authorize/?client_id=16807y864b4ab6a05a80d602f5b6d7&response_type=code&redirect_uri=https://service-play.pod.land:443/Pages/Auth/SSOCallback/Default.aspx&scope=phone profile";  // sso login url

    public static String ssosu =   isLocal ? (serviceMode.equals( ServiceModeTypes.DEVELOPMODE_ONLINE) ?
            "https://accounts.pod.land/oauth2/authorize/?client_id=39105edd466f819c057b3c937374&response_type=code&redirect_uri=http://176.221.69.209:1036/Pages/Auth/SSOCallback/Default.aspx&prompt=signup&scope=phone profile":
            "http://172.16.110.76/oauth2/authorize/?client_id=59cbd42cc8f29e2ced10858d2&response_type=code&redirect_uri=http://172.16.106.43:8082/Pages/Auth/SSOCallback/Default.aspx&prompt=signup&scope=phone profile" ):
            "https://accounts.pod.land/oauth2/authorize/?client_id=16807y864b4ab6a05a80d602f5b6d7&response_type=code&redirect_uri=https://service-play.pod.land:443/Pages/Auth/SSOCallback/Default.aspx&prompt=signup&scope=phone profile";  // sso signup  url

    public static String ssoiau =   isLocal ? (serviceMode.equals( ServiceModeTypes.DEVELOPMODE_ONLINE) ?
            "http://176.221.69.209:1036/pages/iap/buy/default.aspx":
            "http://172.16.106.43:8082/pages/iap/buy/default.aspx" ):
            "https://service-play.pod.land/pages/iap/buy/default.aspx";  //sso inapppurchase  url

    public static String ssolou =   isLocal ? (serviceMode.equals( ServiceModeTypes.DEVELOPMODE_ONLINE) ?
            "http://176.221.69.209:1036/Pages/Logout/Default.aspx":
            "http://172.16.106.43:8082/Pages/Logout/Default.aspx" ):
            "https://service-play.pod.land/Pages/Logout/Default.aspx";  //sso inapppurchase  url

    public static String ssogbu =   isLocal ? (serviceMode.equals( ServiceModeTypes.DEVELOPMODE_ONLINE) ?
            "http://176.221.69.209:1036/pages/game/buy/default.aspx":
            "http://172.16.106.43:8082/pages/game/buy/default.aspx" ):
            "https://service-play.pod.land/Pages/game/buy/Default.aspx";  //sso game buy  url

    public static String ahrrn = isLocal ? (serviceMode.equals( ServiceModeTypes.DEVELOPMODE_ONLINE) ? "bp.gc.sandbox":"vhd.ow"): "bp.gc.sandbox";


    public static String adurl;

    public static int businessId = isLocal ? 43 : 1788;
    public static long bcpid = isLocal ? 342 : 2541;//banner custom post id
    public static int PCCT  = 20000;//push connection check timeout
    public static int PCCTT  = 400;//push connection check timeout threshold
    public static int wsto = 4000;
    public static int searchto = 300;
    public static int getConfigTimeout = 10000;
    public static int pmto = 15000;
    public static int smit = 5000;
    public static int pmttl = 7000;
    public static int WSCWTI = 500;//webSocket connection wait time interval
    public static int mrt = 60000;
    public static int mmrc = 4;
    public static int pcrit = 5000;//push Connection Retry Interval Time
    public static int gcrt = 180;//game center register timeout
    public static int rvt = 120000;
    public static int dmt = 20;//default max try
    public static int gchc = 10;// get chat history count
    public static int cevid = 10;// check emoji version interval day
    public static int gldc = 5;//get GET_LEAGUE data count
    public static int mtml = 200;//max text message length
    public static int meim = 20;//max emoji in message
    public static int glms = 20;// get GET_LEAGUE members size
    public static int gous = 10;// get online user size
    public static int gsus = 5;// get search user size
    public static int ormm = 5;//offline Request Minimum  Minute
    public static int mormd = 10;// max offline request match day,
    public static int gtdt = 1000;// get thread data timeout
    public static int qmt = 55000; // quick match timeout
    public static int glma = 50000; // geo location maximum age
    public static int glt = 60000;// geo location timeout
    public static int glit = 600000; // geo location interval timeout
    public static int siadi = 30; // send installed apps d interval
    public static int glrdd = 2;//geo location request distance difrence
    public static int cmp = 5; // chat message priority
    public static int cf = 1;//CREDIT fraction
    public static int hrt = 20000;//http request timeout
    public static int msdtc = 10;//max sent data try count
    public static int ciid = 1061;//chat item id
    public static int ehet = 5 * 60 * 1000;//encription handshake expire time
    public static int pt = 4 * 60 * 1000;//peer timeout


    public static int gctmhp;// game center max history page

    public static boolean gciv = false;// game center is Viewable
    public static boolean rctam = true;// remove chat thread after match
    public static boolean suml = false;// send unvalid match log
    public static boolean cmc = true;//check major conflict
    public static boolean vbif = true; // view bazitech in iFrame
    public static boolean nsu = true;//need service update
    public static boolean lep = false;//edit profile local
    public static boolean dlor = true;//default GET_LEAGUE offline request
    public static boolean ufs = true;// update from server
    public static boolean har = true;// http async request
    public static boolean harfs = false;// http async request from socket
    public static boolean ure = false;// use request encryption
    public static boolean utc = false;// use tcp connection

    static private void checkLocalState(){
        gca  =  isLocal ? (serviceMode.equals( ServiceModeTypes.DEVELOPMODE_ONLINE) ? "http://176.221.69.209:1036":"http://172.16.106.43:8082" ): "https://service-play.pod.land";
        aha  =  isLocal ? (serviceMode.equals( ServiceModeTypes.DEVELOPMODE_ONLINE) ? "http://sandbox.pod.land:8003":"http://172.16.110.235:8003" ): "https://playpod-bus.pod.land";
        psa  =  isLocal ? (serviceMode.equals( ServiceModeTypes.DEVELOPMODE_ONLINE) ? "ws://sandbox.pod.land:8003/ws":"ws://172.16.110.235:8003/ws") : "wss://playpod-bus.pod.land/ws";
        psat  =  isLocal ? (serviceMode.equals( ServiceModeTypes.DEVELOPMODE_ONLINE) ? "sandbox.pod.land:8002":"172.16.110.235:8002") : "https://playpod-bus.pod.land:8002";
        csa  =  isLocal ? (serviceMode.equals( ServiceModeTypes.DEVELOPMODE_ONLINE) ? "ws://sandbox.pod.land:8003/ws":"ws://172.16.110.235:8003/ws" ): "wss://playpod-bus.pod.land/ws";
        csat  =  isLocal ? (serviceMode.equals( ServiceModeTypes.DEVELOPMODE_ONLINE) ? "sandbox.pod.land:8002":"172.16.110.235:8002" ): "https://playpod-bus.pod.land:8002";
        isa  =  isLocal ? (serviceMode.equals( ServiceModeTypes.DEVELOPMODE_ONLINE) ? "http://sandbox.pod.land:8080":"http://172.16.110.76:8080"): "https://core.pod.land:8080";
        opsa =  isLocal ? (serviceMode.equals( ServiceModeTypes.DEVELOPMODE_ONLINE) ? "http://84.241.60.231:8084":"http://172.16.106.45:8084" ): "http://84.241.60.231:8084";

        ssoleu = isLocal ? (serviceMode.equals( ServiceModeTypes.DEVELOPMODE_ONLINE) ?
                "http://176.221.69.209:1036/Pages/League/Enroll/Default.aspx":
                "http://172.16.106.43:8082/Pages/League/Enroll/Default.aspx" ):
                "https://service-play.pod.land/Pages/League/Enroll/Default.aspx";  // sso league enroll url

        ssolu =   isLocal ? (serviceMode.equals( ServiceModeTypes.DEVELOPMODE_ONLINE) ?
                "https://accounts.pod.land/oauth2/authorize/?client_id=39105edd466f819c057b3c937374&response_type=code&redirect_uri=http://176.221.69.209:1036/Pages/Auth/SSOCallback/Default.aspx&scope=phone profile":
                "http://172.16.110.76/oauth2/authorize/?client_id=59cbd42cc8f29e2ced10858d2&response_type=code&redirect_uri=http://172.16.106.43:8082/Pages/Auth/SSOCallback/Default.aspx&scope=phone profile" ):
                "https://accounts.pod.land/oauth2/authorize/?client_id=16807y864b4ab6a05a80d602f5b6d7&response_type=code&redirect_uri=https://service-play.pod.land:443/Pages/Auth/SSOCallback/Default.aspx&scope=phone profile";  // sso league enroll url
        ssosu =   isLocal ? (serviceMode.equals( ServiceModeTypes.DEVELOPMODE_ONLINE) ?
                "https://accounts.pod.land/oauth2/authorize/?client_id=39105edd466f819c057b3c937374&response_type=code&redirect_uri=http://176.221.69.209:1036/Pages/Auth/SSOCallback/Default.aspx&prompt=signup&scope=phone profile":
                "http://172.16.110.76/oauth2/authorize/?client_id=59cbd42cc8f29e2ced10858d2&response_type=code&redirect_uri=http://172.16.106.43:8082/Pages/Auth/SSOCallback/Default.aspx&prompt=signup&scope=phone profile" ):
                "https://accounts.pod.land/oauth2/authorize/?client_id=16807y864b4ab6a05a80d602f5b6d7&response_type=code&redirect_uri=https://service-play.pod.land:443/Pages/Auth/SSOCallback/Default.aspx&prompt=signup&scope=phone profile";  // sso league enroll url


        ssoiau =   isLocal ? (serviceMode.equals( ServiceModeTypes.DEVELOPMODE_ONLINE) ?
                "http://176.221.69.209:1036/pages/iap/buy/default.aspx":
                "http://172.16.106.43:8082/pages/iap/buy/default.aspx" ):
                "https://service-play.pod.land/pages/iap/buy/default.aspx";  //sso inapppurchase  url

        ssolou =   isLocal ? (serviceMode.equals( ServiceModeTypes.DEVELOPMODE_ONLINE) ?
                "http://176.221.69.209:1036/Pages/Logout/Default.aspx":
                "http://172.16.106.43:8082/Pages/Logout/Default.aspx" ):
                "https://service-play.pod.land/Pages/Logout/Default.aspx";  //sso inapppurchase  url

        ssogbu =   isLocal ? (serviceMode.equals( ServiceModeTypes.DEVELOPMODE_ONLINE) ?
                "http://176.221.69.209:1036/pages/game/buy/default.aspx":
                "http://172.16.106.43:8082/pages/game/buy/default.aspx" ):
                "https://service-play.pod.land/Pages/game/buy/Default.aspx";  //sso game buy  url

        ahrrn = isLocal ? (serviceMode.equals( ServiceModeTypes.DEVELOPMODE_ONLINE) ? "bp.gc.sandbox":"vhd.ow"): "playpod.service";

        gcid = isLocal ? "44" : "3";// game center id
        gcsid = isLocal ? "157" : "333";// game center id
        gcv = isLocal ? "1.0.0" : "1.0.0";// game center id
        gcau = isLocal ? null : null;// game center android app url
        configUrl = isLocal ? (gca + configURI)  : ("https://service-play." + gcDomainName + configURI);
        businessId = isLocal ? (serviceMode.equals( ServiceModeTypes.DEVELOPMODE_ONLINE) ?
                692:
                43 ):
                692;
        bcpid = isLocal ? 342 : 2541;
        bcpid = isLocal ? (serviceMode.equals( ServiceModeTypes.DEVELOPMODE_ONLINE) ?
                2541:
                342 ):
                2541;
    }

    public static void init(JSONObject config) {
        checkLocalState();

        if (config != null) {
            try {
                JSONObject conf = new JSONObject(config.getString("config"));

                String ip = config.getString("ip");
                String gameCenterAddress;
                if (ip.startsWith("http")) {
                    gameCenterAddress = ip;
                } else{
                    gameCenterAddress = "http://" + ip  + ":" + config.getString("port");
                }


                ConfigData.gca = gameCenterAddress;
                ConfigData.aha = (conf.has("aha") && !conf.isNull("aha")) ? conf.getString("aha") : ConfigData.aha;;
                ConfigData.isa = conf.has("isa") ? conf.getString("isa") : ConfigData.isa;
                ConfigData.psa = (conf.has("psa") && !conf.isNull("psa")) ? conf.getString("psa") : "ws://84.241.60.231:8002/ws";
                ConfigData.psat = (conf.has("psat") && !conf.isNull("psat")) ? conf.getString("psat") : "sandbox.pod.land:8002";
                ConfigData.csa = (conf.has("csa") && !conf.isNull("csa")) ? conf.getString("csa") : "ws://84.241.60.231:8002/ws";
                ConfigData.csat = (conf.has("csat") && !conf.isNull("csat")) ? conf.getString("csat") : "sandbox.pod.land:8002";
                ConfigData.uppu = conf.has("uppu") ? conf.getString("uppu") : ConfigData.uppu;
                ConfigData.sucpn = conf.has("sucpn") ? conf.getString("sucpn") : ConfigData.sucpn;
                ConfigData.gcpn = conf.has("gcpn") ? conf.getString("gcpn") : ConfigData.gcpn;
                ConfigData.malv = conf.has("malv") ? conf.getString("malv") : ConfigData.malv;
                ConfigData.mamv = conf.has("mamv") ? conf.getString("mamv") : ConfigData.mamv;
                ConfigData.malvcl = conf.has("malvcl") ? conf.getString("malvcl") : ConfigData.malvcl;
                ConfigData.malvdl = conf.has("malvdl") ? conf.getString("malvdl") : ConfigData.malvdl;
                ConfigData.sba = conf.has("sba") ? conf.getString("sba") : ConfigData.sba;
                ConfigData.rba = conf.has("rba") ? conf.getString("rba") : ConfigData.rba;
                ConfigData.icu = (conf.has("icu") && !conf.isNull("icu")) ? conf.getString("icu") : ("http://service." + gcDomainName + "/payByGateway/");
                ConfigData.bglp = (conf.has("bglp") && !conf.isNull("bglp")) ? conf.getString("bglp") : ("http://www." + gcDomainName + "/#game/");
                ConfigData.bllp = (conf.has("bllp") && !conf.isNull("bllp")) ? conf.getString("bllp") : ("http://www." + gcDomainName + "/#GET_LEAGUE/");
                ConfigData.bvl = (conf.has("bvl") && !conf.isNull("bvl")) ? conf.getString("bvl") : ("http://www." + gcDomainName + "/about.html");
                ConfigData.bvl = (conf.has("qpl") && !conf.isNull("qpl")) ? conf.getString("qpl") : ("http://www." + gcDomainName + "/Hushang");
                ConfigData.bvl = (conf.has("gclpu") && !conf.isNull("gclpu")) ? conf.getString("gclpu") : ("http://www." + gcDomainName + "/index.html#login");
                ConfigData.bvl = (conf.has("gcru") && !conf.isNull("gcru")) ? conf.getString("gcru") : ("http://www." + gcDomainName + "/?#rules");
                ConfigData.cu = conf.has("cu") ? conf.getString("cu") :  ConfigData.cu;
                ConfigData.ecpn = conf.has("ecpn") ? conf.getString("ecpn") : ConfigData.ecpn;
                ConfigData.gcuph = conf.has("gcuph") ? conf.getString("gcuph") : ConfigData.gcuph;
                ConfigData.ehd = conf.has("ehd") ? conf.getString("ehd") : ConfigData.ehd;
                ConfigData.ssoleu = conf.has("ssoleu") ? conf.getString("ssoleu") : ConfigData.ssoleu;
                ConfigData.ssolu = conf.has("ssolu") ? conf.getString("ssolu") : ConfigData.ssolu;
                ConfigData.ssosu = conf.has("ssosu") ? conf.getString("ssosu") : ConfigData.ssosu;
                ConfigData.ssoiau = conf.has("ssoiau") ? conf.getString("ssoiau") : ConfigData.ssoiau;
                ConfigData.ssolou = conf.has("ssolou") ? conf.getString("ssolou") : ConfigData.ssolou;
                ConfigData.ssogbu = conf.has("ssogbu") ? conf.getString("ssogbu") : ConfigData.ssogbu;
                ConfigData.ahrrn = conf.has("ahrrn") ? conf.getString("ahrrn") : ConfigData.ahrrn;

                ConfigData.wsto = conf.has("wsto") ? conf.getInt("wsto") : ConfigData.wsto;
                ConfigData.searchto = conf.has("searchto") ? conf.getInt("searchto") : ConfigData.searchto;
                ConfigData.pmto = conf.has("pmto") ? conf.getInt("pmto") : ConfigData.pmto;
                ConfigData.smit = conf.has("smit") ? conf.getInt("smit") : ConfigData.smit;
                ConfigData.pmttl = conf.has("pmttl") ? conf.getInt("pmttl") : ConfigData.pmttl;
                ConfigData.mrt = conf.has("mrt") ? conf.getInt("mrt") : ConfigData.mrt;
                ConfigData.mmrc = conf.has("mmrc") ? conf.getInt("mmrc") : ConfigData.mmrc;
                ConfigData.rvt = conf.has("rvt") ? conf.getInt("rvt") : ConfigData.rvt;
                ConfigData.businessId = conf.has("businessId") ? conf.getInt("businessId") :  ConfigData.businessId;
                ConfigData.bcpid = conf.has("bcpid") ? conf.getLong("bcpid") :  ConfigData.bcpid;
                ConfigData.PCCT = conf.has("PCCT") ? conf.getInt("PCCT") : ConfigData.PCCT;
                ConfigData.PCCTT = conf.has("PCCTT") ? conf.getInt("PCCTT") : ConfigData.PCCTT;
                ConfigData.WSCWTI = conf.has("WSCWTI") ? conf.getInt("WSCWTI") : ConfigData.WSCWTI;
                ConfigData.pcrit = conf.has("pcrit") ? conf.getInt("pcrit") : ConfigData.pcrit;
                ConfigData.gcrt = conf.has("gcrt") ? conf.getInt("gcrt") : ConfigData.gcrt;
                ConfigData.gctmhp = conf.has("gctmhp") ? conf.getInt("gctmhp") : ConfigData.gctmhp;
                ConfigData.gldc = conf.has("gldc") ? conf.getInt("gldc") : ConfigData.gldc;
                ConfigData.gsus = conf.has("gsus") ? conf.getInt("gsus") : ConfigData.gsus;
                ConfigData.glms = conf.has("glms") ? conf.getInt("glms") : ConfigData.glms;
                ConfigData.cf = conf.has("cf") ? conf.getInt("cf") : ConfigData.cf;
                ConfigData.gous = conf.has("gous") ? conf.getInt("gous") : ConfigData.gous;
                ConfigData.cmp = conf.has("cmp") ? conf.getInt("cmp") : ConfigData.cmp;
                ConfigData.gtdt = conf.has("gtdt") ? conf.getInt("gtdt") :ConfigData.gtdt;
                ConfigData.ciid = conf.has("ciid") ? conf.getInt("ciid") :ConfigData.ciid;
                ConfigData.ehet = conf.has("ehet") ? conf.getInt("ehet") :ConfigData.ehet;
                ConfigData.pt = conf.has("pt") ? conf.getInt("pt") :ConfigData.pt;

                ConfigData.gcid = conf.has("gcid") ? conf.get("gcid").toString() :ConfigData.gcid;
                ConfigData.gcsid = conf.has("gcsid") ? conf.get("gcsid").toString() :ConfigData.gcsid;
                ConfigData.gcv = conf.has("gcv") ? conf.getString("gcv") :ConfigData.gcv;
                ConfigData.gcau = conf.has("gcau") ? conf.getString("gcau") :ConfigData.gcau;

                ConfigData.gciv = conf.has("gciv") ? conf.getBoolean("gciv") :ConfigData.gciv;
                ConfigData.malvfu = conf.has("malvfu") ? conf.getBoolean("malvfu") :ConfigData.malvfu;
                ConfigData.rctam = conf.has("rctam") ? conf.getBoolean("rctam") :ConfigData.rctam;
                ConfigData.suml = conf.has("suml") ? conf.getBoolean("suml") :ConfigData.suml;
                ConfigData.cmc = conf.has("cmc") ? conf.getBoolean("cmc") :ConfigData.cmc;
                ConfigData.vbif = conf.has("vbif") ? conf.getBoolean("vbif") :ConfigData.vbif;
                ConfigData.nsu = conf.has("nsu") ? conf.getBoolean("nsu") :ConfigData.nsu;
                ConfigData.lep = conf.has("lep") ? conf.getBoolean("lep") :ConfigData.lep;
                ConfigData.dlor = conf.has("dlor") ? conf.getBoolean("dlor") :ConfigData.dlor;
                ConfigData.ufs = conf.has("ufs") ? conf.getBoolean("ufs") :ConfigData.ufs;
                ConfigData.har = conf.has("har") ? conf.getBoolean("har") :ConfigData.har;
                ConfigData.harfs = conf.has("harfs") ? conf.getBoolean("harfs") :ConfigData.harfs;
                ConfigData.ure = conf.has("ure") ? conf.getBoolean("ure") :ConfigData.ure;
                ConfigData.utc = conf.has("utc") ? conf.getBoolean("utc") :ConfigData.utc;

                ConfigData.gcd = conf.has("gcd") ? new JSONObject(conf.getString("gcd")) :ConfigData.gcd;
                ConfigData.lcd = conf.has("lcd") ? new JSONObject(conf.getString("lcd")) :ConfigData.lcd;

                ConfigData.opsa = conf.has("opsa") ? conf.getString("opsa") :ConfigData.opsa;

                configUrl =  isLocal ? ConfigData.gca : "https://service-play." + gcDomainName ;
                configUrl += configURI;

            } catch (JSONException e) {
                e.printStackTrace();
            }


        }
    }

    public static void initWithDBConfig(JSONObject config) {
        checkLocalState();
        try {
            if (config.has("gca")) ConfigData.gca = config.getString("gca");
            if (config.has("psa")) ConfigData.psa = config.getString("psa");
            if (config.has("psat")) ConfigData.psat = config.getString("psat");
            if (config.has("csa")) ConfigData.csa = config.getString("csa");
            if (config.has("csat")) ConfigData.csat = config.getString("csat");
            if (config.has("isa")) ConfigData.isa = config.getString("isa");
            if (config.has("domainName")) ConfigData.domainName = config.getString("domainName");
            if (config.has("gcpn")) ConfigData.gcpn = config.getString("gcpn");
            if (config.has("malv")) ConfigData.malv = config.getString("malv");
            if (config.has("mamv")) ConfigData.mamv = config.getString("mamv");
            if (config.has("malvcl")) ConfigData.malvcl = config.getString("malvcl");
            if (config.has("malvdl")) ConfigData.malvdl = config.getString("malvdl");
            if (config.has("sba")) ConfigData.sba = config.getString("sba");
            if (config.has("rba")) ConfigData.rba = config.getString("rba");
            if (config.has("cu")) ConfigData.cu = config.getString("cu");
            if (config.has("ecpn")) ConfigData.ecpn = config.getString("ecpn");
            if (config.has("uppu")) ConfigData.uppu = config.getString("uppu");
            if (config.has("sucpn")) ConfigData.sucpn = config.getString("sucpn");
            if (config.has("icu")) ConfigData.icu = config.getString("icu");
            if (config.has("bglp")) ConfigData.bglp = config.getString("bglp");
            if (config.has("bllp")) ConfigData.bllp = config.getString("bllp");
            if (config.has("bvl")) ConfigData.bvl = config.getString("bvl");
            if (config.has("qpl")) ConfigData.qpl = config.getString("qpl");
            if (config.has("gclpu")) ConfigData.gclpu = config.getString("gclpu");
            if (config.has("gcru")) ConfigData.gcru = config.getString("gcru");
            if (config.has("gcuph")) ConfigData.gcuph = config.getString("gcuph");
            if (config.has("ehd")) ConfigData.ehd = config.getString("ehd");
            if (config.has("ssoleu")) ConfigData.ssoleu = config.getString("ssoleu");
            if (config.has("ssolu")) ConfigData.ssolu = config.getString("ssolu");
            if (config.has("ssosu")) ConfigData.ssosu = config.getString("ssosu");
            if (config.has("ssoiau")) ConfigData.ssoiau = config.getString("ssoiau");
            if (config.has("ssolou")) ConfigData.ssolou = config.getString("ssolou");
            if (config.has("ssogbu")) ConfigData.ssogbu = config.getString("ssogbu");
            if (config.has("ahrrn")) ConfigData.ahrrn = config.getString("ahrrn");
            if (config.has("adurl")) ConfigData.adurl = config.getString("adurl");
            if (config.has("gcid")) ConfigData.gcid = config.get("gcid").toString();
            if (config.has("gcsid")) ConfigData.gcsid = config.get("gcsid").toString();
            if (config.has("gcv")) ConfigData.gcv = config.getString("gcv");
            if (config.has("gcau")) ConfigData.gcau = config.getString("gcau");
            if (config.has("PCCT")) ConfigData.PCCT = config.getInt("PCCT");
            if (config.has("PCCTT")) ConfigData.PCCTT = config.getInt("PCCTT");
            if (config.has("wsto")) ConfigData.wsto = config.getInt("wsto");
            if (config.has("searchto")) ConfigData.searchto = config.getInt("searchto");
            if (config.has("getConfigTimeout")) ConfigData.getConfigTimeout = config.getInt("getConfigTimeout");
            if (config.has("pmto")) ConfigData.pmto = config.getInt("pmto");
            if (config.has("smit")) ConfigData.smit = config.getInt("smit");
            if (config.has("pmttl")) ConfigData.pmttl = config.getInt("pmttl");
            if (config.has("WSCWTI")) ConfigData.WSCWTI = config.getInt("WSCWTI");
            if (config.has("mrt")) ConfigData.mrt = config.getInt("mrt");
            if (config.has("mmrc")) ConfigData.mmrc = config.getInt("mmrc");
            if (config.has("pcrit")) ConfigData.pcrit = config.getInt("pcrit");
            if (config.has("gcrt")) ConfigData.gcrt = config.getInt("gcrt");
            if (config.has("rvt")) ConfigData.rvt = config.getInt("rvt");
            if (config.has("businessId")) ConfigData.businessId = config.getInt("businessId");
            if (config.has("bcpid")) ConfigData.bcpid = config.getLong("bcpid");
            if (config.has("dmt")) ConfigData.dmt = config.getInt("dmt");
            if (config.has("gchc")) ConfigData.gchc = config.getInt("gchc");
            if (config.has("cevid")) ConfigData.cevid = config.getInt("cevid");
            if (config.has("gldc")) ConfigData.gldc = config.getInt("gldc");
            if (config.has("ormm")) ConfigData.ormm = config.getInt("ormm");
            if (config.has("meim")) ConfigData.meim = config.getInt("meim");
            if (config.has("glms")) ConfigData.glms = config.getInt("glms");
            if (config.has("gous")) ConfigData.gous = config.getInt("gous");
            if (config.has("gsus")) ConfigData.gsus = config.getInt("gsus");
            if (config.has("mormd")) ConfigData.mormd = config.getInt("mormd");
            if (config.has("gtdt")) ConfigData.gtdt = config.getInt("gtdt");
            if (config.has("qmt")) ConfigData.qmt = config.getInt("qmt");
            if (config.has("glma")) ConfigData.glma = config.getInt("glma");
            if (config.has("glt")) ConfigData.glt = config.getInt("glt");
            if (config.has("glit")) ConfigData.glit = config.getInt("glit");
            if (config.has("siadi")) ConfigData.siadi = config.getInt("siadi");
            if (config.has("glrdd")) ConfigData.glrdd = config.getInt("glrdd");
            if (config.has("cmp")) ConfigData.cmp = config.getInt("cmp");
            if (config.has("cf")) ConfigData.cf = config.getInt("cf");
            if (config.has("hrt")) ConfigData.hrt = config.getInt("hrt");
            if (config.has("msdtc")) ConfigData.msdtc = config.getInt("msdtc");
            if (config.has("gctmhp")) ConfigData.gctmhp = config.getInt("gctmhp");
            if (config.has("ciid")) ConfigData.ciid = config.getInt("ciid");
            if (config.has("ehet")) ConfigData.ehet = config.getInt("ehet");
            if (config.has("pt")) ConfigData.pt = config.getInt("pt");

            if (config.has("gciv")) ConfigData.gciv = config.getBoolean("gciv");
            if (config.has("malvfu")) ConfigData.malvfu = config.getBoolean("malvfu");
            if (config.has("rctam")) ConfigData.rctam = config.getBoolean("rctam");
            if (config.has("suml")) ConfigData.suml = config.getBoolean("suml");
            if (config.has("cmc")) ConfigData.cmc = config.getBoolean("cmc");
            if (config.has("vbif")) ConfigData.vbif = config.getBoolean("vbif");
            if (config.has("nsu")) ConfigData.nsu = config.getBoolean("nsu");
            if (config.has("lep")) ConfigData.lep = config.getBoolean("lep");
            if (config.has("dlor")) ConfigData.dlor = config.getBoolean("dlor");
            if (config.has("ufs")) ConfigData.ufs = config.getBoolean("ufs");
            if (config.has("har")) ConfigData.har = config.getBoolean("har");
            if (config.has("harfs")) ConfigData.harfs = config.getBoolean("harfs");
            if (config.has("ure")) ConfigData.ure = config.getBoolean("ure");
            if (config.has("utc")) ConfigData.utc = config.getBoolean("utc");

        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    public static String serialize() {
        JSONObject config = new JSONObject();
        try {
            config.put("gca", ConfigData.gca);
            config.put("psa", ConfigData.psa);
            config.put("psat", ConfigData.psat);
            config.put("csa", ConfigData.csa);
            config.put("csat", ConfigData.csat);
            config.put("isa", ConfigData.isa);
            config.put("domainName", ConfigData.domainName);
            config.put("gcpn", ConfigData.gcpn);
            config.put("malv", ConfigData.malv);
            config.put("mamv", ConfigData.mamv);
            config.put("malvcl", ConfigData.malvcl);
            config.put("malvdl", ConfigData.malvdl);
            config.put("sba", ConfigData.sba);
            config.put("rba", ConfigData.rba);
            config.put("cu", ConfigData.cu);
            config.put("ecpn", ConfigData.ecpn);
            config.put("uppu", ConfigData.uppu);
            config.put("sucpn", ConfigData.sucpn);
            config.put("icu", ConfigData.icu);
            config.put("bglp", ConfigData.bglp);
            config.put("bllp", ConfigData.bllp);
            config.put("bvl", ConfigData.bvl);
            config.put("qpl", ConfigData.qpl);
            config.put("gclpu", ConfigData.gclpu);
            config.put("gcru", ConfigData.gcru);
            config.put("gcuph", ConfigData.gcuph);
            config.put("ehd", ConfigData.ehd);
            config.put("ssoleu", ConfigData.ssoleu);
            config.put("ssolu", ConfigData.ssolu);
            config.put("ssosu", ConfigData.ssosu);
            config.put("ssoiau", ConfigData.ssoiau);
            config.put("ssolou", ConfigData.ssolou);
            config.put("ssogbu", ConfigData.ssogbu);
            config.put("ahrrn", ConfigData.ahrrn);
            config.put("adurl", ConfigData.adurl);
            config.put("gcid", ConfigData.gcid);
            config.put("gcsid", ConfigData.gcsid);
            config.put("gcv", ConfigData.gcv);
            config.put("gcau", ConfigData.gcau);
            config.put("PCCT", ConfigData.PCCT);
            config.put("PCCTT", ConfigData.PCCTT);
            config.put("wsto", ConfigData.wsto);
            config.put("searchto", ConfigData.searchto);
            config.put("getConfigTimeout", ConfigData.getConfigTimeout);
            config.put("pmto", ConfigData.pmto);
            config.put("smit", ConfigData.smit);
            config.put("pmttl", ConfigData.pmttl);
            config.put("WSCWTI", ConfigData.WSCWTI);
            config.put("mrt", ConfigData.mrt);
            config.put("mmrc", ConfigData.mmrc);
            config.put("pcrit", ConfigData.pcrit);
            config.put("gcrt", ConfigData.gcrt);
            config.put("rvt", ConfigData.rvt);
            config.put("businessId", ConfigData.businessId);
            config.put("bcpid", ConfigData.bcpid);
            config.put("dmt", ConfigData.dmt);
            config.put("gchc", ConfigData.gchc);
            config.put("cevid", ConfigData.cevid);
            config.put("gldc", ConfigData.gldc);
            config.put("mtml", ConfigData.mtml);
            config.put("meim", ConfigData.meim);
            config.put("glms", ConfigData.glms);
            config.put("gous", ConfigData.gous);
            config.put("gsus", ConfigData.gsus);
            config.put("ormm", ConfigData.ormm);
            config.put("mormd", ConfigData.mormd);
            config.put("gtdt", ConfigData.gtdt);
            config.put("qmt", ConfigData.qmt);
            config.put("glma", ConfigData.glma);
            config.put("glt", ConfigData.glt);
            config.put("glit", ConfigData.glit);
            config.put("siadi", ConfigData.siadi);
            config.put("glrdd", ConfigData.glrdd);
            config.put("cmp", ConfigData.cmp);
            config.put("cf", ConfigData.cf);
            config.put("hrt", ConfigData.hrt);
            config.put("msdtc", ConfigData.msdtc);
            config.put("gctmhp", ConfigData.gctmhp);
            config.put("gciv", ConfigData.gciv);
            config.put("malvfu", ConfigData.malvfu);
            config.put("rctam", ConfigData.rctam);
            config.put("suml", ConfigData.suml);
            config.put("cmc", ConfigData.cmc);
            config.put("vbif", ConfigData.vbif);
            config.put("nsu", ConfigData.nsu);
            config.put("lep", ConfigData.lep);
            config.put("dlor", ConfigData.dlor);
            config.put("ufs", ConfigData.ufs);
            config.put("har", ConfigData.har);
            config.put("harfs", ConfigData.harfs);
            config.put("ure", ConfigData.ure);
            config.put("utc", ConfigData.utc);
            config.put("ciid", ConfigData.ciid);
            config.put("ehet", ConfigData.ehet);
            config.put("pt", ConfigData.pt);
            config.put("gcd", ConfigData.gcd);
            config.put("lcd", ConfigData.lcd);
        } catch (JSONException e) {
            e.printStackTrace();
        }
//        return "\"" + config.toString().replace("\"","\\\"") + "\"";
        return config.toString();
    }

}
