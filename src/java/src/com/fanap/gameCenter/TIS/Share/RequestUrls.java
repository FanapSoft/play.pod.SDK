package com.fanap.gameCenter.TIS.Share;


public class RequestUrls {

    public static UrlData SUGNUP = new UrlData("/srv/user/signup","BAZITECH");
    public static UrlData VERIFY = new UrlData("/srv/user/verify","BAZITECH");
    public static UrlData LOGIN = new UrlData("/srv/user/login","BAZITECH");
    public static UrlData REGISTER_GUEST = new UrlData("/srv/user/registerGuest","BAZITECH");
    public static UrlData LOGOUT = new UrlData("/srv/user/logout","BAZITECH");
    public static UrlData PING = new UrlData("/srv/user/ping","BAZITECH");
    public static UrlData ONLINE_USER = new UrlData("/srv/user/getOnlineUsers","BAZITECH");
    public static UrlData COMPLETE_PROFILE = new UrlData("/srv/user/completeProfile","BAZITECH");
    public static UrlData VERIFY_AND_COMPLETE_PROFILE = new UrlData("/srv/user/verifyandcompleteProfile","BAZITECH");
    public static UrlData FORGET_PASSWORD = new UrlData("/srv/user/forgotpass","BAZITECH");
    public static UrlData EDIT_PROFILE_IMAGE = new UrlData("/srv/user/editprofileimage","BAZITECH");
    public static UrlData GAME_INFO = new UrlData("/srv/game/get","BAZITECH");
    public static UrlData GET_LEAGUE = new UrlData("/srv/league/get","BAZITECH");
    public static UrlData GET_TOP_LEAGUE = new UrlData("/srv/league/top","BAZITECH");
    public static UrlData GET_LATEST_LEAGUE = new UrlData("/srv/league/latest","BAZITECH");
//    public static UrlData TABLE = new UrlData("/srv/league/getTable","BAZITECH");
    public static UrlData TABLE = new UrlData("/srv/league/table","BAZITECH");
//    public static UrlData REQUEST_MATCH = new UrlData("/srv/match/request","BAZITECH",true);
    public static UrlData REQUEST_MATCH = new UrlData("/srv/match/matchrequest","BAZITECH",true);
    public static UrlData MATCH_READY = new UrlData("/srv/match/ready","BAZITECH",true);
    public static UrlData MATCH_REQUEST_RESPONSE = new UrlData("/srv/match/requestresult","BAZITECH",true);
    public static UrlData CANCEL_MATCH_REQUEST = new UrlData("/srv/match/cancelrequest","BAZITECH");
    public static UrlData OFFLINE_MATCH_REQUEST = new UrlData("/srv/match/offlinerequest","BAZITECH");
    public static UrlData LEAGUE_MEMBERS = new UrlData("/srv/league/members","BAZITECH");
    public static UrlData GET_LEAGUE_ENROLL_ACCESS = new UrlData("/srv/league/enrollaccess","BAZITECH");
    public static UrlData LEAGUE_RATE = new UrlData("/srv/league/rate","BAZITECH");
    public static UrlData GAME_RATE = new UrlData("/srv/game/rate","BAZITECH");
    public static UrlData REQUEST_MATCH_ID = new UrlData("/srv/match/add","BAZITECH",true);
    public static UrlData REQUEST_STREAM_MATCH_ID = new UrlData("/srv/stream/addmatch","BAZITECH");
    public static UrlData MATCH_RESULT = new UrlData("/srv/match/result","BAZITECH",true);
    public static UrlData MATCH_VALIDATE = new UrlData("/srv/match/validate","BAZITECH",true);
    public static UrlData MATCH_CANCEL = new UrlData("/srv/match/cancel","BAZITECH",true);
    public static UrlData SUGGESTION = new UrlData("/srv/user/bugReport","BAZITECH");
    public static UrlData TOP_SCORE = new UrlData("/srv/user/getTopScore","BAZITECH");
    public static UrlData EDIT_SCORE = new UrlData("/srv/user/editScore","BAZITECH");
    public static UrlData RECONNECT = new UrlData("/srv/match/reconnect","BAZITECH");
    public static UrlData ASYNC_REGISTER = new UrlData("/srv/user/asyncRegister","BAZITECH");
    public static UrlData CHAT_ASYNC_REGISTER = new UrlData("/srv/chat/register","BAZITECH");
    public static UrlData ACTIVE_PEER = new UrlData("/srv/user/activatePeer","BAZITECH");
    public static UrlData CHAT_ACTIVE_PEER = new UrlData("/srv/chat/activate","BAZITECH");
    public static UrlData SET_CHAT_ID = new UrlData("/srv/chat/setChatId","BAZITECH");
    public static UrlData CHAT_REQUEST = new UrlData("/srv/chat/request","BAZITECH");
    public static UrlData DEFAULT_LEAGUE_SUBSCRIBE = new UrlData("/srv/league/enrollDefault","BAZITECH");
    public static UrlData IMAGE = new UrlData("/handlers/imageHandler.ashx?imgid=","BAZITECH");
    public static UrlData CUSTOM_POST = new UrlData("/srv/custompost/get","BAZITECH");
    public static UrlData FOLLOW = new UrlData("/srv/league/follow","BAZITECH");
    public static UrlData INVISIBLE = new UrlData("/srv/user/invisible","BAZITECH");
    public static UrlData REQUEST_QUICK_MATCH = new UrlData("/srv/match/addquick","BAZITECH",true);
    public static UrlData CANCEL_QUICK_MATCH = new UrlData("/srv/match/removequick","BAZITECH",true);
    public static UrlData SEARCH_USER = new UrlData("/srv/user/search","BAZITECH");
    public static UrlData SHARE = new UrlData("/srv/user/share","BAZITECH");
    public static UrlData CREDIT = new UrlData("/srv/user/getcredit","BAZITECH");
    public static UrlData FILE_INFO = new UrlData("/srv/game/fileinfo","BAZITECH");
    public static UrlData GET_CREDIT_PACK_LIST = new UrlData("/srv/getcreditpacklist","BAZITECH");
    public static UrlData GET_COMMENT_LIST = new UrlData("/srv/commentList/","BAZITECH");
    public static UrlData ADD_GAME_COMMENT = new UrlData("/srv/game/addcomment","BAZITECH");
    public static UrlData ADD_LEAGUE_COMMENT = new UrlData("/srv/league/addcomment","BAZITECH");
    public static UrlData VALID_CHAT_THREAD_ID = new UrlData("/srv/league/threads","BAZITECH");
    public static UrlData LEAGUE_AWARDS = new UrlData("/srv/league/awards","BAZITECH");
    public static UrlData GET_USER_PROFILE = new UrlData("/srv/user/getProfile","BAZITECH");
    public static UrlData CHANGE_PASSWORD = new UrlData("/srv/user/changepass","BAZITECH");
    public static UrlData EDIT_PROFILE = new UrlData("/srv/user/editProfile","BAZITECH");
    public static UrlData GET_LOBBY = new UrlData("/srv/lobby/get","BAZITECH");
    public static UrlData GET_LOBBY_GAMES = new UrlData("/srv/game/getbylobby","BAZITECH");
    public static UrlData GET_LOBBY_LEAGUES = new UrlData("/srv/league/getbylobby","BAZITECH");
    public static UrlData GET_NEWS = new UrlData("/srv/news/get","BAZITECH");
    public static UrlData FOLLOW_GAME = new UrlData("/srv/game/follow","BAZITECH");
    public static UrlData FOLLOW_LEAGUE = new UrlData("/srv/league/follow","BAZITECH");
    public static UrlData FOLLOW_POST = new UrlData("/srv/user/follow","BAZITECH");
    public static UrlData LIKE_POST = new UrlData("/srv/user/like","BAZITECH");
    public static UrlData GET_TOP_GAME = new UrlData("/srv/game/top","BAZITECH");
    public static UrlData GET_LATEST_GAME = new UrlData("/srv/game/latest","BAZITECH");
    public static UrlData GET_RELATED_GAME = new UrlData("/srv/game/related","BAZITECH");
    public static UrlData GET_RELATED_LEAGUE = new UrlData("/srv/league/related","BAZITECH");
    public static UrlData GET_LEAGUE_TOP_PLAYERS = new UrlData("/srv/user/topplayers","BAZITECH");
    public static UrlData GET_TOP_PLAYERS = new UrlData("/srv/user/gettopplayers","BAZITECH");
    public static UrlData GET_TIME_LINE = new UrlData("/srv/timeline","BAZITECH");
    public static UrlData GET_ONLINE_INFO = new UrlData("/srv/game/onlineinfo","BAZITECH");
    public static UrlData GET_GAME_FOLLOWNING = new UrlData("/srv/game/following","BAZITECH");
    public static UrlData GET_LEAGUE_FOLLOWING = new UrlData("/srv/league/following","BAZITECH");
    public static UrlData GET_ENROLLED_LEAGUES = new UrlData("/srv/user/enrolledleagues","BAZITECH");
    public static UrlData INCREASE_CREDIT_BY_VOUCHER = new UrlData("/srv/user/increasecreditbyvoucher","BAZITECH");
    public static UrlData ENCRYPT_HAND_SHAKE = new UrlData("/srv/aut/handshake","BAZITECH");
    public static UrlData SUBSCRIBE_LEAGUE = new UrlData(null,"BAZITECH");
    public static UrlData LEAGUE_MATCHES_RESULT = new UrlData("/srv/user/matchresult","BAZITECH");
    public static UrlData LEAGUE_LATEST_MATCHES_RESULT = new UrlData("/srv/league/latestmatchresult","BAZITECH");
    public static UrlData LEAGUE_MATCHES = new UrlData("/srv/user/matches","BAZITECH");
    public static UrlData GAME_CENTER_STATUS = new UrlData("/srv/manage/gcstatus","BAZITECH");
    public static UrlData USER_ACHIEVEMENTS = new UrlData("/srv/user/achievements","BAZITECH");
    public static UrlData USER_ACHIEVEMENT_DETAILS = new UrlData("/srv/user/achievementdetails","BAZITECH");
    public static UrlData USER_GAME_POINTS = new UrlData("/srv/user/gamepoints","BAZITECH");
    public static UrlData RECIEVED_FRIENDSHIP_REQUEST = new UrlData("/srv/user/receivedfriendshiprequestlist","BAZITECH");
    public static UrlData SENT_FRIENDSHIP_REQUEST = new UrlData("/srv/user/sentfriendshiprequestlist","BAZITECH");
    public static UrlData FRIENDSHIP_REQUEST = new UrlData("/srv/user/friendshiprequest","BAZITECH");
    public static UrlData REPLY_FRIENDSHIP_REQUEST = new UrlData("/srv/user/replyfriendshiprequest","BAZITECH");
    public static UrlData CANCEL_FRIENDSHIP_REQUEST = new UrlData("/srv/user/cancelfriendshiprequest","BAZITECH");
    public static UrlData REMOVE_FRIEND_REQUEST = new UrlData("/srv/user/cancelfriendship","BAZITECH");
    public static UrlData USER_FRIENDS = new UrlData("/srv/user/friends","BAZITECH");
    public static UrlData GET_LOBBIES = new UrlData("/srv/lobby/get","BAZITECH");
    public static UrlData GET_GALLERY = new UrlData("/srv/product/gallery","BAZITECH");

    public static UrlData GET_IN_APP_PURCHASE_PACK = new UrlData("/srv/iap/getgamepacks","BAZITECH");
    public static UrlData GET_GLOBAL_IN_APP_PURCHASE_PACK = new UrlData("/srv/iap/getgcpacks","BAZITECH");
    public static UrlData BYY_IN_APP_PURCHASE_PACK = new UrlData("/srv/iap/buy","BAZITECH");
    public static UrlData GET_GAME_ITEMS = new UrlData("/srv/iap/searchgameitems","BAZITECH");
    public static UrlData GET_USER_GC_ITEMS = new UrlData("/srv/iap/getgcitems","BAZITECH");
    public static UrlData GET_USER_ITEMS = new UrlData("/srv/iap/getgameitems","BAZITECH");
    public static UrlData CONSUME_ITEM = new UrlData("/srv/iap/consume","BAZITECH");

    public static UrlData SET_LOCATION = new UrlData("/srv/objectPool/geoLocation/add","OBJECT_POOL");
    public static UrlData META_DATA = new UrlData("/srv/objectPool/metaData/add","OBJECT_POOL");
    public static UrlData CUSTOM_DATA = new UrlData("/srv/wl/customData/get","OBJECT_POOL");




    public static class UrlData {
        public String uri = null;
        public String hostName = null;
        public Boolean encrypt = false;

        UrlData(String uri,String hostName){
            this.uri = uri;
            this.hostName = hostName;
        }

        UrlData(String uri,String hostName,Boolean encrypt){
            this.uri = uri;
            this.hostName = hostName;
            this.encrypt = encrypt;
        }

        public UrlData copy(){
            return new UrlData(uri, hostName, encrypt);
        }
    }

}
