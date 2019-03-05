/**
 * @class ServiceUI
 * @module Service
 * @submodule Service
 * @constructor
 * @param {Object}  options
 * @param {Boolean}  [options.isMultiTab=true]
 * @param {Boolean}  [ptions.userMoreInfo=false]
 * @param {Boolean}  [ptions.animate=false]
 * @param {String}  [ptions.buttonBackgroundColor]
 * @param {String}  [ptions.loadingColor]
 * @param {String}  [ptions.buttonTextColor]
 * @param {Service}  options.service
 * @param {Object}  options.config
 *      @param {Object}  options.config
 *          @param {Object}  options.config.leagueUI
 *              @param {Object}  options.config.leagueUI.backgroundUrl
 *          @param {Object}  options.config.tableUI
 *              @param {Object}  options.config.tableUI.backgroundUrl
 *          @param {Object}  options.config.matchRequestUI
 *              @param {Object}  options.config.matchRequestUI.backgroundUrl
 *
 * */

TIS.ServiceUI = function (options) {
    /*==================================================================================================================
     *                                      P R I V A T E   V A R I A B L E
     *================================================================================================================*/

    var __self = this,
        __service = options.service,
        __minGameCenterVersion = options.minGameCenterVersion || "0.0.0",
        __config = options.config || {},
        __lang = "FA",
        __buttonColor = options.buttonColor,
        __GCName = TIS.GC_NAME == TIS.GC_BAZITECH ? "بازیتک" : "نارلیگا",
        __dic = {
            "RUNNING": {
                "EN": "running",
                "FA": "در حال اجرا"
            },
            "NOT_FIND": {
                "EN": "not find",
                "FA": "موردی یافت نشد"
            },
            "NOT_FIND_MORE": {
                "EN": "not find more",
                "FA": "مورد بیشتری یافت نشد"
            },
            "PRIVATE": {
                "EN": "private",
                "FA": "اختصاصی"
            },
            "PLAYOFF_LEAGUE": {
                "EN": "playoff league",
                "FA": "لیگ حذفی"
            },
            "LOGIN": {
                "EN": "login",
                "FA": "ورود"
            },
            "SPACE_NOT_VALID": {
                "EN": "space is not valid",
                "FA": "استفاده از کاراکتر فاصله مجاز نمی باشد"
            },
            "PHONENUMBER": {
                "EN": "phone number",
                "FA": "شماره تماس"
            },
            "PASSWORD": {
                "EN": "password",
                "FA": "رمز عبور"
            },
            "REMEMBERME": {
                "EN": "remember me",
                "FA": "مرا به خاطر بسپار"
            },
            "FORGOTPASSWORD": {
                "EN": "forgot password",
                "FA": "فراموشی رمز عبور"
            },
            "SIGNUP": {
                "EN": "sign up",
                "FA": "ثبت نام"
            },
            "REGISTER": {
                "EN": "register",
                "FA": "ثبت"
            },
            "TOAMAN": {
                "EN": "toman",
                "FA": "تومان"
            },
            "REGISTER_DATA": {
                "EN": "register data",
                "FA": "ثبت اطلاعات"
            },
            "EMAIL": {
                "EN": "email",
                "FA": "ایمیل"
            },
            "FIRSTNAME": {
                "EN": "first name",
                "FA": "نام"
            },
            "LASTNAME": {
                "EN": "last name",
                "FA": "نام خانوادگی"
            },
            "INVITATIONCODE": {
                "EN": "Invitation code",
                "FA": "کد فعالسازی"
            },
            "ENTER_PROFILE_DATA": {
                "EN": "enter profile data",
                "FA": "مشخصات کاربری خود را تعیین کنید"
            },
            "STEP1": {
                "EN": "step1",
                "FA": "مرحله ۱"
            },
            "STEP2": {
                "EN": "step2",
                "FA": "مرحله ۲"
            },
            "STEP3": {
                "EN": "step3",
                "FA": "مرحله ۳"
            },
            "NICKNAME": {
                "EN": "nicke name",
                "FA": "نام مستعار"
            },
            "UPDATE": {
                "EN": "update",
                "FA": "بروزرسانی"
            },
            "TABLE": {
                "EN": "table",
                "FA": "جدول رده بندی"
            },
            "ONLINEUSER": {
                "EN": "online user",
                "FA": "بازیکنان آنلاین"
            },
            "MATCHREQUEST": {
                "EN": "match request",
                "FA": "درخواست بازی"
            },
            "NAME": {
                "EN": "name",
                "FA": "نام"
            },
            "ICON": {
                "EN": "icon",
                "FA": "تصویر"
            },
            "SEARCH": {
                "EN": "search",
                "FA": "جست و جو"
            },
            "DONTPASSWORD": {
                "EN": "i dont have password",
                "FA": "رمز عبور ندارم"
            },
            "RESEND": {
                "EN": "resend",
                "FA": "فرستادن مجدد"
            },
            "RANK": {
                "EN": "rank",
                "FA": "رده"
            },
            "RANKING": {
                "EN": "rankهدل",
                "FA": "رده بندی"
            },
            "GAMEREQUEST": {
                "EN": "game request ",
                "FA": "درخواست بازی"
            },
            "GAMEREQUESTTEXT": {
                "EN": " want to play with you.are you ok?",
                "FA": ".می خواهد با شما بازی کند آیا تمایل به بازی بااو دارید"
            },
            "YES": {
                "EN": "yes",
                "FA": "بله"
            },
            "NO": {
                "EN": "no",
                "FA": "خیر"
            },
            "ACCEPTGAME": {
                "EN": "request accepted",
                "FA": "با در خواست شما موافقت شده است"
            },
            "REJECTGAME": {
                "EN": "request rejected",
                "FA": "با درخواست شما موافقت نشده است"
            },
            "REJECT": {
                "EN": "reject",
                "FA": "انصراف"
            },
            "HASERROR": {
                "EN": "has error",
                "FA": "خطایی وجود دارد"
            },
            "SUCCESSSIGNUP": {
                "EN": "success sign up",
                "FA": "ثبت نام با موفقیت انجام شد"
            },
            "CONNECTIONERROR": {
                "EN": " connection error",
                "FA": "خطا در برقراری ارتباط با سرور"
            },
            "INVALIDRESULT": {
                "EN": "game result is invalid",
                "FA": "نتیجه بازی معتبر نمی باشد"
            },
            "VALIDRESULT": {
                "EN": "game result is valid",
                "FA": "نتیجه بازی معتبر می باشد"
            },
            "GAME": {
                "EN": "game",
                "FA": "بازی"
            },
            "LEAGUE": {
                "EN": "league",
                "FA": "لیگ"
            },
            "LOGOUT": {
                "EN": "logout",
                "FA": "خروج"
            },
            "YOUARELOGIN": {
                "EN": "you are login",
                "FA": "شما قبلا وارد شده اید"
            },
            "YOUARENOTLOGIN": {
                "EN": "you are not login",
                "FA": "شما وارد حساب کاربری خود نشده اید"
            },
            "LOADING": {
                "EN": "loading...",
                "FA": "در حال بارگذاری ..."
            },
            "UPDATING": {
                "EN": "updating...",
                "FA": "در حال بروزرسانی ..."
            },
            "LEAGUETYPE": {
                "EN": "league type",
                "FA": "نوع لیگ"
            },
            "COMPLETEPROFILE": {
                "EN": "complete profile",
                "FA": "اطلاعات کاربری"
            },
            "VERIFY": {
                "EN": "verify",
                "FA": "کد فعال سازی"
            },
            "APLICANT": {
                "EN": "aplicant",
                "FA": "درخواست کننده"
            },
            "NOTONLINE": {
                "EN": "you are not online.",
                "FA": "ارتباط شما با اینترنت برقرار نیست"
            },
            "SERVER_REQUEST_ERROR": {
                "EN": "error in request to server",
                "FA": "خطا در برقراری ارتباط با سرور"
            },
            "REQUESTMATCH": {
                "EN": "request match.",
                "FA": "درخواست بازی"
            },
            "PLAYGAME": {
                "EN": "play game",
                "FA": "‌انجام بازی"
            },
            "RESULTS": {
                "EN": "results",
                "FA": "نتایج"
            },
            "BEFORUNLOADMSG": {
                "EN": "are you sure ?",
                "FA": "ایا برای خروج اطمینان دارید؟"
            },
            "SUBSCRIBE": {
                "EN": "subscribe",
                "FA": "عضویت"
            },
            "UNSUBSCRIBE": {
                "EN": "unsubscribe",
                //"FA": "لغو عضویت"
                "FA": "شما عضو می باشید."
            },
            "ACTIVEMATCH": {
                "EN": "active match",
                "FA": "بازی های فعال"
            },
            "START": {
                "EN": "start",
                "FA": "شروع"
            },
            "SUGGESTION": {
                "EN": "suggestion",
                "FA": "پیشنهادات"
            },
            "SEND": {
                "EN": "send",
                "FA": "ارسال"
            },
            "SEND_SUGGESTION": {
                "EN": "send suggestion",
                "FA": "ارسال بازخورد"
            },
            "FILL_SUGGESTION_FIELD": {
                "EN": "please fill suggestion field",
                "FA": "لطفا متن پیام را وارد نمایید"
            },
            "MESSAGE": {
                "EN": "message",
                "FA": "پیام"
            },
            "GOGAMEPAGE": {
                "EN": "go game page",
                "FA": "رفتن به صفحه بازی"
            },
            "GOGAMEPAGEINFO": {
                "EN": "this game is not installed,please go to game page and install it.",
                "FA": "این بازی بر روی دستگاه شما نصب نمی باشد لطفا به صفحه بازی بروید و آن را نصب کنید"
            },
            "SUCCESSFULSUGGESTIONSEND": {
                "EN": "Suggestion sent successful",
                "FA": "پیام با موفقیت ارسال شد"
            },
            "NEXT": {
                "EN": "next",
                "FA": "بعدی"
            },
            "BACK": {
                "EN": "back",
                "FA": "قبلی"
            },
            "GENDER": {
                "EN": "gender",
                "FA": "جنسیت"
            },
            "MALE": {
                "EN": "male",
                "FA": "مرد"
            },
            "FEMALE": {
                "EN": "female",
                "FA": "زن"
            },
            "SELECTOPTIONS": {
                "EN": "choose your option",
                "FA": "گزینه مورد نظر را انتخاب نمایید"
            },
            "SELECTGENDER": {
                "EN": "slect gender",
                "FA": "جنسیت را تعیین نمایید"
            },
            "SELECTGAME": {
                "EN": "please select game",
                "FA": "بازی را انتخاب نمایید"
            },
            "OPPONENTNAME": {
                "EN": "opponent name",
                "FA": "نام حریف"
            },
            "GAMENAME": {
                "EN": "game name",
                "FA": "نام بازی"
            },
            "REGISTERSMSINFO": {
                "EN": "your code has sent",
                "FA": "رمز عبور به شماره شما پیامک خواهد شد."
            },
            "NOTANYLEAGUETOSUBSCRIBE": {
                "EN": "not any league to subscribe",
                "FA": "لیگی برای عضویت وجود ندارد"
            },
            "NOTANYPACKTOSUBSCRIBE": {
                "EN": "not any pack to buy",
                "FA": "بسته ای برای خرید وجود ندارد"
            },
            "NOTIFREQUESTMATCH": {
                "EN": "request match.",
                "FA": " به شما درخواست بازی داده است. "
            },
            "HASVERIFYCODE": {
                "EN": "has verify code.",
                "FA": "کد ثبت نام دارم."
            },
            "REQUESTRESULTTO": {
                "EN": "request result to : ",
                "FA": "نتیجه درخواست شما به  :  "
            },
            "MAXCONCURRENTREQUEST": {
                "EN": "request result to : ",
                "FA": "حداکثر درخواست همزمان $VAR نفر میباشد"
            },
            "MAXRELOADCOUNT": {
                "EN": "max reload ",
                "FA": "حداکثر دفعات شروع مجدد"
            },
            "CURRENTRELOADCOUNT": {
                "EN": "current reload count ",
                "FA": "تعداد کنونی شروع مجدد"
            },
            "CHAT": {
                "EN": "chat",
                "FA": "پیام"
            },
            "WRITEMESSAGEHERE": {
                "EN": "write message here!...",
                "FA": "پیغام خود را اینجا بنویسید..."
            },
            "CLEAR": {
                "EN": "clear",
                "FA": "پاک"
            },
            "LEAGUESTATE": {
                "EN": "league state",
                "FA": "وضعیت لیگ"
            },
            "NOTSTARTED": {
                "EN": "not started",
                "FA": "شروع نشده"
            },
            "ISREGISTERING": {
                "EN": "registering",
                "FA": "در حال ثبت نام"
            },
            "REGISTERING_AND_RUNNING": {
                "EN": "registering and running",
                "FA": "در حال ثبت نام و برگزاری"
            },
            "HOLDING": {
                "EN": "is holding",
                "FA": "درحال برگزاری"
            },
            "PLAYED": {
                "EN": "played",
                "FA": "برگزار شده"
            },
            "ALLOPTIONS": {
                "EN": "all options",
                "FA": "تمام موارد"
            },
            "SUBSCRIBETYPE": {
                "EN": "subscribe type",
                "FA": "نوع عضویت"
            },
            "FREESUBSCRIBE": {
                "EN": "free",
                "FA": "رایگان"
            },
            "MONETARYSUBSCRIBE": {
                "EN": "monetary",
                "FA": "پولی"
            },
            "PRIZETYPE": {
                "EN": "prize",
                "FA": "جایزه"
            },
            "HAS": {
                "EN": "has",
                "FA": "دارد"
            },
            "NOT": {
                "EN": "not",
                "FA": "ندارد"
            },
            "MEMBERCOUNT": {
                "EN": "member count",
                "FA": "تعداد اعضا"
            },
            "PERSON": {
                "EN": "person",
                "FA": "نفر"
            },
            "MAXLEAGUEPLAYCOUNT": {
                "EN": "league play count",
                "FA": "حداکثر تعداد بازی بین دو نفر"
            },
            "PLAY": {
                "EN": "play",
                "FA": "بازی"
            },
            "DESCRIPTION": {
                "EN": "description",
                "FA": "توضیحات"
            },
            "RULES": {
                "EN": "rules",
                "FA": "قوانین"
            },
            "UNLIMIT": {
                "EN": "unlimit",
                "FA": "نامحدود"
            },
            "MAXMEMBER": {
                "EN": "max member",
                "FA": "حداکثر تعداد اعضا"
            },
            "MORE": {
                "EN": "more",
                "FA": "بیشتر"
            },
            "STARTTIME": {
                "EN": "start time",
                "FA": "زمان شروع"
            },
            "ENDTIME": {
                "EN": "end time",
                "FA": "زمان پایان"
            },
            "SHOWTABLE": {
                "EN": "show table",
                "FA": "نمایش جدول"
            },
            "SHOW": {
                "EN": "show",
                "FA": "نمایش"
            },
            "MYSTATE": {
                "EN": "my state",
                "FA": "وضعیت من"
            },
            "FOLLOWER": {
                "EN": "follower",
                "FA": "دنبال شده"
            },
            "FOLLOW": {
                "EN": "follow",
                "FA": "دنبال کردن"
            },
            "ONLINEREQUST": {
                "EN": "online request",
                "FA": "درخواست آنلاین"
            },
            "OFFLINEREQUEST": {
                "EN": "offline request",
                "FA": "درخواست آفلاین"
            },
            "REQUESTDATE": {
                "EN": "request date",
                "FA": "روز درخواست"
            },
            "SENDREQUEST": {
                "EN": "send request",
                "FA": "ارسال درخواست"
            },
            "REQUESTTIME": {
                "EN": "request date",
                "FA": "زمان درخواست"
            },
            "CANCEREQUEST": {
                "EN": "cancel request",
                "FA": "لغو درخواست"
            },
            "OFFLINEREQUESTEXPLANATION": {
                "EN": "explanation",
                "FA": "با استفاده از این ویژگی می توانید زمانی که می خواهید با فرد مورد نظر بازی کنید را به وی اطلاع دهید."
            },
            "CONFIRM": {
                "EN": "confirm",
                "FA": "تایید"
            },
            "NOTMESSAGEEXIST": {
                "EN": "not message exist",
                "FA": "پیامی موجود نمی باشد."
            },
            "ISMEMBER": {
                "EN": "member",
                "FA": "عضو شده"
            },
            "MONTH1": {
                "EN": "1 month",
                "FA": "۱ ماهه"
            },
            "WEEK_1": {
                "EN": "1 week",
                "FA": "۱ هفته"
            },
            "MONTH3": {
                "EN": "3 month",
                "FA": "۳ ماهه"
            },
            "IN_TABLE": {
                "EN": "in table",
                "FA": "در جدول"
            },
            "TOTAL": {
                "EN": "total",
                "FA": "کلی"
            },
            "SUCCESSREQUEST": {
                "EN": "request send successfully",
                "FA": "درخواست شما با موفقیت ارسال شد."
            },
            "LOGINFIRST": {
                "EN": "please login first",
                "FA": "ابتدا وارد حساب کاربری خود شوید"
            },
            "REQUESTQUICKMATCH": {
                "EN": "quick match",
                "FA": "حریف می طلبم"
            },
            "PLAY_MATCH": {
                "EN": "play match",
                "FA": "انجام بازی"
            },
            "CANCELQUICKMATCH": {
                "EN": "cancel quick match",
                "FA": "انصراف"
            },
            "SHARE": {
                "EN": "share",
                "FA": "اشتراک گذاری"
            },
            "MIN1PHONEORNICKNAME": {
                "EN": "please enter 1 user or phone number",
                "FA": "حداقل یک نام کاربری یا شماره تماس وارد کنید"
            },
            "SENDWITHSMS": {
                "EN": "send with sms",
                "FA": "ارسال از طریق پیامک"
            },
            "SHARETOSOCIAL": {
                "EN": "share to social network",
                "FA": "ارسال به شبکه های اجتماعی"
            },
            "DEFAULTTEXT": {
                "EN": "default text",
                "FA": "جملات پیش فرض"
            },
            "DEFAULTEMOJI": {
                "EN": "default emoji",
                "FA": "شکلک های پیش فرض"
            },
            "SUBSCRIBECONFIRMMESSAGE": {
                "EN": "leageue price is $VAR.do you want subscribe league?",
                "FA": "مبلغ $VAR بابت حق عضویت لیگ از اعتبار شما کسر خواهد شد. لطفا تایید فرمایید."
            },
            "MATCH_REQUEST_IN": {
                "EN": "match requrest in $VAT",
                "FA": "درخواست بازی در $VAR دارد"
            },
            "PURCHASE_CONFIRMMESSAGE": {
                "EN": "purchase price is $VAR.do you want subscribe league?",
                "FA": "مبلغ $VAR بابت خرید $ITEM از اعتبار شما کسر خواهد شد. لطفا تایید فرمایید."
            },
            "INCREASECASH": {
                "EN": "increase cash",
                "FA": "افزایش اعتبار"
            },
            "ACCEPT": {
                "EN": "accept",
                "FA": "تایید"
            },
            "CANCEL": {
                "EN": "cancel",
                "FA": "انصراف"
            },
            "CANCEL2": {
                "EN": "cancel",
                "FA": "لغو"
            },
            "INSTALL": {
                "EN": "install",
                "FA": "نصب"
            },
            "RECEIVE_NEW_VERSION": {
                "EN": "receive new version",
                "FA": "دریافت نسخه جدید"
            },
            "RECEIVE_ANDROID_APK": {
                "EN": "receive apk",
                "FA": "دریافت نسخه اندروید"
            },
            "CURRENTVERSION": {
                "EN": "current version",
                "FA": "نسخه کنونی"
            },
            "LASTVERSION": {
                "EN": "last version",
                "FA": "نسخه نهایی"
            },
            "AWARDS": {
                "EN": "awards",
                "FA": "جوایز"
            },
            "CHANGEPASSWORD": {
                "EN": "change password",
                "FA": "تغییر رمز عبور"
            },
            "CHANGE_PHONE_NUMBER": {
                "EN": "change phone number",
                "FA": "تغییر شماره تلفن"
            },
            "CHANGE": {
                "EN": "change",
                "FA": "ویرایش"
            },
            "CURRENTPASS": {
                "EN": "current pass",
                "FA": "رمز عبور کنونی"
            },
            "NEWPASS": {
                "EN": "new pass",
                "FA": "رمز عبور جدید"
            },
            "NEWPASSREPEAT": {
                "EN": "new pass repeat",
                "FA": "تکرار رمز عبور جدید"
            },
            "PASSWORD_SUCCESS_CHANGE": {
                "EN": "new pass repeat",
                "FA": "رمز عبور با موفقیت تغییر کرد"
            },
            "EDIT_PROFILE_SUCCESS_CHANGE": {
                "EN": "new pass repeat",
                "FA": "ویرایش پروفایل با موفقیت انجام شد"
            },
            "PASSWORDS_NOT_MATCH": {
                "EN": "password not match",
                "FA": "رمز عبور مطابق نمی باشد"
            },
            "PASSWORDS_MIN_4": {
                "EN": "minimum password length is 4",
                "FA": "حداقل تعداد کلمه عبور ۴ می باشد."
            },
            "ENTER_PHONENUMBER_HERE": {
                "EN": "enter your phone number here",
                "FA": "لطفا شماره تلفن همراه خود را وارد نمایید"
            },
            "ENTER_PASSWORD_HERE": {
                "EN": "enter your password here",
                "FA": "رمز عبور خود را وارد نمایید"
            },
            "ENTER_RECEIVE_PASSWORD_HERE": {
                "EN": "enter your password here",
                "FA": "رمز عبور دریافت شده را وارد نمایید"
            },
            "PASSWORD_USE_ALL_GC_GAMES": {
                "EN": "this password use all game",
                "FA": "این رمز در تمامی بازی ها ی بازیتک استفاده خواهد شد."
            },
            "USER_HAS_PROFILE": {
                "EN": "you have profile",
                "FA": "شما قبلا در سامانه بازیتک ثبت نام کرده اید."
            },
            "PURCHASE": {
                "EN": "purchase",
                "FA": "خرید"
            },
            "EXCHANGE": {
                "EN": "exchange",
                "FA": "تبدیل"
            },
            "EXCHANGE_CREDIT": {
                "EN": "exchange credit",
                "FA": "تبدیل اعتبار"
            },
            "ITEMS": {
                "EN": "items",
                "FA": "آیتم ها"
            },
            "ALL": {
                "EN": "all",
                "FA": "همه"
            },
            "BUY_SUCCESS": {
                "EN": "buy success",
                "FA": "خرید $ITEM با موفقیت انجام شد."
            },
            "INCREASE_CREDIT": {
                "EN": "increase credit",
                "FA": "افزایش اعتبار"
            },
            "VOUCHER": {
                "EN": "voucher",
                "FA": "کد تخفیف"
            },
            "CHARGE_CODE": {
                "EN": "charge code",
                "FA": "کد شارژ"
            },
            "CHARGE_CODE_REGISTER": {
                "EN": "register charge code",
                "FA": "ثبت کد شارژ"
            },
            "INCREASE_CREDIT_WITH_BANK": {
                "EN": "increase credit with bank",
                "FA": "افزایش شارژ از طریق درگاه بانکی"
            },
            "I_HAVE_VOUCHER": {
                "EN": "i have voucher",
                "FA": "کد تخفیف دارم"
            },
            "CODE_CHARGE_SUCCESS": {
                "EN": "code charge success",
                "FA": "کد با موفقیت ثبت شد"
            },
            "SUCCESS_SUBSCRIBE_LEAGUE": {
                "EN": "success subscribe league",
                "FA": "عضویت شما در لیگ پذیرفته شد"
            },
            "SELECT_LEAGUE": {
                "EN": "select league",
                "FA": "انتخاب لیگ"
            },
            "SELECT_GAME": {
                "EN": "select game",
                "FA": "انتخاب بازی"
            },
            "SELECT_ITEM": {
                "EN": "select item",
                "FA": "انتخاب آیتم"
            },
            "FREE": {
                "EN": "free",
                "FA": "رایگان"
            },
            "COUNT": {
                "EN": "count",
                "FA": "تعداد"
            },
            "PLANE": {
                "EN": "plane",
                "FA": "طرح"
            },
            "TABLE_RANK": {
                "EN": "rank",
                "FA": "رتبه"
            },
            "TABLE_MATCH_COUNT": {
                "EN": "match count",
                "FA": "تعداد بازی"
            },
            "REGISTER_AS_GUEST": {
                "EN": "register as guest",
                "FA": "ورود به عنوان کاربر مهمان"
            },
            "PLAY_GAME_IN_LEAGUE": {
                "EN": "play game in league",
                "FA": "بازی در لیگ"
            },
            "FROM": {
                "EN": "from",
                "FA": "از"
            },
            "UNTIL": {
                "EN": "until",
                "FA": "تا"
            },
            "MOST_POPULAR": {
                "EN": "post popular",
                "FA": "محبوب ترین ها"
            },
            "NEWEST": {
                "EN": "newest",
                "FA": "جدیدترین ها"
            },
            "TOP_RATE": {
                "EN": "top rate",
                "FA": "برترین ها"
            },
            "ORDER_BY": {
                "EN": "order by",
                "FA": "به ترتیب..."
            },
            "LEAGUE_TYPE": {
                "EN": "league type",
                "FA": "نوع لیگ"
            },
            "YOUR_RATE": {
                "EN": "your rate",
                "FA": "امتیاز شما"
            },
            "SUCCESS_RATE": {
                "EN": "success rate",
                "FA": "امتیاز شما با موفقیت ثبت شد."
            },
            "ENTER_PHONENUMBER": {
                "EN": "enter phone number. ",
                "FA": "لطفا شماره‌ی تلفن همراه خود را وارد کنید "
            },
            "USER_NOT_EXISTS": {
                "EN": "this user not exist.",
                "FA": "حساب کاربری با این شماره وجود ندارد،"
            },
            "WANT_SIGNUP": {
                "EN": "whant login",
                "FA": "می‌خواهید ثبت نام کنید؟ "
            },
            "NICKNAME_OR_PHONENUMBER": {
                "EN": "nicke name / phone number",
                "FA": "نام بازیکن / شماره‌ی تلفن همراه"
            },
            "LOGIN_WITH_GC": {
                "EN": "login",
                "FA": "ورود با " + __GCName
            },
            "HAS_NOT_ACCOUNT": {
                "EN": "i have not account. ",
                "FA": "حساب " + __GCName + " ندارید؟ ثبت‌نام کنید "
            },
            "NICK_NAME_WITH_LIMIT": {
                "EN": "nick name",
                "FA": "نام بازیکن(۴ تا ۲۰ کاراکتر)"
            },
            "PASS_WITH_LIMIT": {
                "EN": "password",
                "FA": "رمز عبور دلخواه(حداقل ۶ کاراکتر)"
            },
            "CHANGE_PASS_AND_LOGIN": {
                "EN": "chage pass and login",
                "FA": "تغییر رمز عبور و ورود"
            },
            "RETURN": {
                "EN": "RETURN",
                "FA": "بازگشت "
            },
            "GET_VERIFY_CODE": {
                "EN": "get verify code",
                "FA": "دریافت کد فعالسازی"
            },
            "HAVE_VERIFY_CODE": {
                "EN": "i have verify code",
                "FA": "کد فعالسازی دارم"
            },
            "ENTER_PHONE_NUMBER": {
                "EN": "enter phone number",
                "FA": "ورود شماره تلفن همراه"
            },
            "ENTER_YOUR_PHONE_NUMBER": {
                "EN": "enter phone number",
                "FA": "شماره تلفن همراه خود را وارد نمایید"
            },
            "PHONE_NUMBER_INVALID": {
                "EN": "enter phone is invalid",
                "FA": "شماره تلفن همراه وارد شده معتبر نمی باشد"
            },
            "ACCEPT_RULE_WITH_REGISTER": {
                "EN": "accept rule with register",
                "FA": "با ثبت نام قوانین را میپذیرید"
            },
            "HAVE_ACCOUNT": {
                "EN": "i have account",
                "FA": "حساب " + __GCName + " دارید؟ وارد شوید "
            },
            "USER_EXISTS": {
                "EN": "this user exist.",
                "FA": "حساب کاربری با این شماره وجود دارد،"
            },
            "WANT_LOGIN": {
                "EN": "whant login",
                "FA": "می‌خواهید وارد شوید؟ "
            },
            "REGISTER_IN_GC": {
                "EN": "passwregisterord",
                "FA": "ثبت نام در " + __GCName
            },
            "VERIFY_INVALID": {
                "EN": "verify code is invalid",
                "FA": "حداقل تعداد کد فعالسازی ۴ می باشد"
            },
            "NICKNAME_INVALID": {
                "EN": "nick name is invalid",
                "FA": "نام مستعار باید بین ۴ تا ۲۰ کاراکتر باشد"
            },
            "PASSWORD_INVALID": {
                "EN": "password is invalid",
                "FA": "حداقل کاراکتر برای رمز عبور ۶ کارکتر می باشد"
            },
            "SELECT_CREDIT_PACK": {
                "EN": "please credit pack",
                "FA": "لطفا یکی از بسته های زیر را انتخاب نمایید"
            },
            "SELECT_PAYMENT_METHOD": {
                "EN": "please select payment method ",
                "FA": "لطفا روش پرداخت خود را انتخاب نمایید"
            },
            "PAY": {
                "EN": "pay",
                "FA": "پرداخت"
            },
            "VAS": {
                "EN": "VAS",
                "FA": "VAS"
            },
            "IMI": {
                "EN": "IMI",
                "FA": "IMI"
            },
            "GETEWAY": {
                "EN": "geteway",
                "FA": "درگاه اینترنتی"
            },
            "USSD": {
                "EN": "USSD",
                "FA": "USSD"
            },
            "SELECT_1_CREDIT_PACK": {
                "EN": "please select one ",
                "FA": "یک بسته را انتخاب نمایید"
            },
            "PHONE_INVALID": {
                "EN": "phone is invalid",
                "FA": "شماره تماس نامعتبر است"
            },
            "SHARE_TABLE_DES": {
                "EN": "please select one ",
                "FA": "من در لیگ $league بازی $gameName $tableField  دارای رتبه $rank و $scoreName $scoreValue هستم."
            },
            "EDIT_PROFILE_IMAGE": {
                "EN": "edit profile image",
                "FA": "تغییر عکس پروفایل"
            },
            "EDIT_PROFILE_DES": {
                "EN": "for edit profile , please signup",
                "FA": "برای ویرایش پروفایل کافیه ثبت نام کنی"
            },
            "NOT_IN_APP_MESSAGE": {
                "EN": "your app not in app purchase",
                "FA": "نسخه برنامه شما این ویژگی را پشتیبانی نمیکند"
            },
            "YOUR_CREDIT": {
                "EN": "your credit",
                "FA": "اعتبار شما"
            },
            "TRY_AGAIN": {
                "EN": "your request failed.please try again",
                "FA": "درخواست شما انجام نشد، لطفا مجددا تلاش نمایید"
            },
            "INCREASE_CREDIT_FOR_BUY": {
                "EN": "increase your credit for buy",
                "FA": "برای خرید,  اعتبار خود را افزایش دهید"
            },
            "NOT_ANY_USER_ONLINE": {
                "EN": "not any user online",
                "FA": "کاربری آنلاین نمی باشد"
            },
            "NOT_ANY_USER_EXIST": {
                "EN": "not any user online",
                "FA": "کاربری موجود نمی باشد"
            },
            "USER_NOT_ONLINE": {
                "EN": "user not online",
                "FA": "کاربر آنلاین نمی باشد"
            },
            "NOT_MORE_ONLINE_USER_FIND": {
                "EN": "not more user is online",
                "FA": "کاربر بیشتری آنلاین نمی باشد"
            },
            "NOT_MORE_USER_FIND": {
                "EN": "not more user exists",
                "FA": "کاربر بیشتری موجود نمی باشد"
            },
            "MY_RESULT": {
                "EN": "my result",
                "FA": "نتایج من"
            },
            "MATCHES": {
                "EN": "matches",
                "FA": "مسابقات"
            },
            "ALL_RESULT": {
                "EN": "all result",
                "FA": "تمامی نتایج"
            },
            "MY_MATCHES": {
                "EN": "my matches",
                "FA": "مسابقات من"
            }
        },
        __hasDiagnostic = typeof cordova != "undefined" ? cordova.plugins && cordova.plugins.diagnostic : false,
        __loginUI, __suggestionUI, __tableUI, __leagueUI, __matchRequestUI,
        __signupUI, __adUI, __activeMatchUI, __shareUI, __creditUI,
        __editProfileUI, __inAppPurchaseUI, __resultUI,
        __exchangeUI, __updateUI, __webViewUI,
        __exchange = options.exchange,
        __messageUI, __matchPageUI,
        __logInfoUI,
        __toast,
        __protected = {},
        __requestTimeout,
        __userEvents = {
            firstPageShow: {},
            matchPageShow: {},
            firstPageHide: {},
            matchPageHide: {},
            tabSelect: {},
            userMoreInfo: {},
            usePlayMatch: {}
        },
        __messagesElm = {},
        __matches = {},
        __$message,
        __defaultTimeout = 4000,
        __UIInstanceArg;

    // 1cb7d4 blue
    // ffb200 orange

    /*==================================================================================================================
     *                                   P U B L I C    V A R I A B L E
     *================================================================================================================*/


    /*==================================================================================================================
     *                                   P R I V A T E     M E T H O D
     *================================================================================================================*/

    var __init = function () {
            // __config.userMoreInfo = true;
            __loadCss();

            __initAlertMessage();

            __UIInstanceArg = {
                dictionary: __dic,
                language: __lang,
                parent: __protected,
                isMultiTab: options.isMultiTab,
                config: __config,
            };

            document.body.style.overflow = "hidden";

            __matchPageUI = new TIS.MatchPageUI(__UIInstanceArg);
            __messageUI = new TIS.MessageUI(__UIInstanceArg);


            __initService();

            __initLogInfoDialog();

            document.addEventListener("matchDataView", function (e) {
                __showLogInfo();
            }, false);

            __initEvent();

        },

        __initEvent = function () {

            $(document).on("click", ".TIS-message", function () {
                $(this).hide();
            });
        },

        __initAlertMessage = function () {
            var content = "\
                <div class='TIS-message' style='display:none;font-size: larger;'></div>\
            ";
            __$message = $(content);
            __$message.appendTo(document.body);
        },

        __getLauncherDownloadLink = function (callback) {
            __service.getLauncherList(
                {osId: __service.getConfig().gameCenterAndroidOsId},
                function (res) {
                    if (!res.hasError) {
                        var url;
                        var results = res.result;
                        var bigTime = 0;

                        for (var i = 0; i < results.length; i++) {
                            var result = results[i];
                            if (result.fileHandlerAppUploadTime > bigTime) {
                                url = result.fileHandlerAppKey;
                            }
                        }

                        callback(TIS.Util.createReturnData(false, "", 0, {url: url}));
                    } else {
                        callback(res);
                    }
                });
        },

        __fireEvent = function (eventName, param) {
            for (var id in __userEvents[eventName]) __userEvents[eventName][id](param);
        },

        __initService = function () {

            __service.on("message", function (params) {

                __messageUI.onRequest({
                    type: 3,
                    content: params
                });
            });
            __service.on("matchRequest", function (params) {
                __messageUI.onRequest({
                    type: 2,
                    content: params

                });
            });
            __service.on("activeMatchData", function (matches) {
                if (!__activeMatchUI) {
                    __activeMatchUI = new TIS.ActiveMatchUI(__UIInstanceArg);
                }
                __activeMatchUI.onActiveMatchData(matches);
            });

            __service.on("matchRequestResponse", function (params) {
                __matchRequestUI && __matchRequestUI._matchRequestResponse(params);
            });

            __service.on("gameRegister", function (params) {

            });

            __service.on("login", function () {
                __requestTimeout = __service.getConfig().matchRequestTimeout || 60000;
                __loginUI && __loginUI.hide();
                __signupUI && __signupUI.hide();
                __matchRequestUI && __matchRequestUI.onLogin();
                __editProfileUI && __editProfileUI.onLogin();

                // __leagueUI.show();
                // __updateUI.show();
                // __editProfileUI.show();
                // __creditUI.show();
                // __inAppPurchaseUI.show({
                //     // itemId : 1049
                // });
                // __shareUI.show();
                // __showMatchHideData();
                // __signupUI.show();
                // __suggestionUI.show();
                // setTimeout(function () {
                //     __showLogInfo();
                // },3000);db.providerProduct.find({})
                // __exchangeUI.show({
                //     providerProducts: [
                //         {
                //             productId : "58f5e15e590b9f5e898706df",
                //             creditUnitName : "تیس",
                //             name : "تیس",
                //             factor : 0.001,
                //             tisCredit : true
                //         },
                //         {
                //             productId : "58f5f0947ec6706862583257"
                //         }
                //     ]
                // });

                // __service.getUserFriends({
                // __service.replyFriendshipRequest({
                // __service.getReceivedFriendshipRequest({
                // __service.friendshipRequest({
                // __service.cancelFriendshipRequest({
                // //     gameId : 1567,
                // //     rankType : 1,
                // //     userId : "42",
                //     requestId : "42",
                // //     reply : 1
                //     name : "fa"
                // }, function (res) {
                //     console.log("---------------", res);
                // });
            });

            __service.on("guestLogin", function () {
                __loginUI && __loginUI.hide();
                __signupUI && __signupUI.hide();
                __matchRequestUI && __matchRequestUI.onLogin();
                __editProfileUI && __editProfileUI.onLogin();
            });

            __service.on("ready", function () {
                // __self.update({
                //     message: "به منظور استفاده از تمامی فیچر های بازی لطفا اپ گیم سنتر را نصب نمایید.",
                //     updateGameCenter : true
                // });

                // console.log("0--------------------");
                // __service.getTopLeaguesInfo({type:9}, function (res) {
                //     console.log("---------------", res);
                // });
            });

            __service.on("logout", function () {
                __leagueUI && __leagueUI.onLogout();
                __tableUI && __tableUI.onLogout();
                __matchRequestUI && __matchRequestUI.onLogout();
                __loginUI && __loginUI.onLogout();
                __messageUI.onLogout();
                __editProfileUI && __editProfileUI.onLogout();
            });

            __service.on("newMatch", function (params) {
                __matches[params.matchId] = params;
                __hideAllPage();
            });

            __service.on("clearMessage", function (params) {
                if (__messagesElm[params.id]) {
                    __messagesElm[params.id].remove();
                }
            });

            __service.on("showAd", function (params) {
                if (!__adUI) {
                    __adUI = new TIS.AdUI(__UIInstanceArg);
                }
                __adUI.show(params);
            });

            __service.on("showUpdateUI", function (params) {
                // if (TIS.Util.isApp()) {
                //
                // }
                __self.update();
            });

            __service.on("connect", function () {
                __logInfoUI.find("span.tis-circle").hide();
            });

            __service.on("disconnect", function () {
                __logInfoUI.find(".tis-circle").show();
            });

            __service.on("reconnect", function () {
                __logInfoUI.find("span.tis-circle").hide();
            });

            __service.on("creditChange", function () {
                __inAppPurchaseUI && __inAppPurchaseUI.onCreditChange();
            });

            __requestTimeout = __service.getConfig().matchRequestTimeout || 60000;

        },

        __hideAllPage = function () {
            __tableUI && __tableUI.hide();
            __leagueUI && __leagueUI.hide();
            __suggestionUI && __suggestionUI.hide();
            __matchRequestUI && __matchRequestUI.hide();
        },

        __initLogInfoDialog = function () {

            var currentMatchId = __matchPageUI.getCurrentPageMatchId();
            var userData = __service.getUserData();

            if (currentMatchId == undefined) {
                var allMatchId = Object.keys(__matches);
                currentMatchId = allMatchId[allMatchId.length - 1];
            }

            $("#TIS_HideData").remove();
            $(".modal-backdrop").remove();

            var content = "\
                <div class='modal fade' style='z-index: 2001'>\
                    <div class='modal-dialog' >\
                        <div class='modal-content' style='background-color: #faf4e3'>\
                            <div class='modal-header' style='display: table;width: 100%;border: 0;'>\
                                <a class='tis tis-2x tis-close TIS-pointer' data-dismiss='modal' style='display: table-cell;vertical-align: middle;    width: 20px;'></a>\
                                 <span class='tis tis-circle TIS-orangeColor TIS-pointer' style='position: absolute;color: #bdbd0f;left:10px'></span>\
                            </div>\
                            <div class='modal-body' style='text-align: center'>\
                                    <div >\
                                        <div >MatchId :      <span TIS-DATA='MATCH_ID'>" + currentMatchId + "</span></div>\
                                        <div >UserId  :      <span TIS-DATA='USER_ID'>" + userData.id + "</span></div>\
                                        <div >Game peerId  :  <span TIS-DATA='PEER_GAME_ID'>" + userData.peerId + "</span></div>\
                                        <div >Chat peerId  : <span TIS-DATA='PEER_CHAT_ID'>" + userData.peerId + "</span></div>\
                                        <div>Service Version  : " + TIS.Service.VERSION + "</div>\
                                        <div>Service UI Version  : " + TIS.ServiceUI.VERSION + "</div>\
                                        <div>Chat UI Version  : " + (TIS.ChatUI && TIS.ChatUI.VERSION) + "</div>\
                                        <div>BETA VERSION  : " + (TIS.IS_BETA_VERSION == 1) + "</div>\
                                    </div>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
            ";

            __logInfoUI = $(content).appendTo(document.body);

            __logInfoUI.find("#TIS_HideData_close").on("click", function () {
                $("#TIS_HideData").modal("hide").remove();
            });

            __logInfoUI.modal("hide");
        },

        __showLogInfo = function () {

            var currentMatchId = __matchPageUI.getCurrentPageMatchId();
            var userData = __service.getUserData();

            if (currentMatchId == undefined) {
                var allMatchId = Object.keys(__matches);
                currentMatchId = allMatchId[allMatchId.length - 1];
            }
            __logInfoUI.find("[TIS-DATA='MATCH_ID']").html(currentMatchId);
            __logInfoUI.find("[TIS-DATA='USER_ID']").html(userData.id);
            __logInfoUI.find("[TIS-DATA='PEER_GAME_ID']").html(userData.peerId);
            __logInfoUI.find("[TIS-DATA='PEER_CHAT_ID']").html(userData.chatPeerId);

            __logInfoUI.modal("show");
        },

        __webViewResponseHandle = function (params, callback) {
            var data = {
                url: params.url,
                callback: function (res) {
                    switch (res.Type) {
                        case 1 :
                            callback(res.Content);
                            break;

                        case  2 :
                            __protected.hideWebView();
                            break;

                    }

                },
                onClose : function () {

                }
            };
            __protected.showWebView(data);
        },

        __loadCss = function () {

            var styleContent = "\
                #TIS_table_body tr:hover td{\
                  background-color : #a8f957\
                }\
                #TIS_table_body td.own{\
                  background-color : rgba(0,255,0,0.2)\
                }\
                .tis-resultUI-playMatch i {\
                    display: table-cell;\
                    vertical-align: middle;\
                    color : white;\
                }\
                .tis-resultUI-playMatch {\
                    position : absolute;\
                    left : 0;\
                    top : 0;\
                    margin: 4px 7px;\
                    width: 40px;\
                    height: 40px;\
                    border-radius: 100%;\
                    background-color: #00ff08;\
                    display: table;\
                    text-align : center\
                }\
                .tis-resultUI-moreMatchInfo {\
                    transition : 1s;\
                    height : 0;\
                    overflow : hidden;\
                    -webkit-transition : 1s;\
                    transform : translateX(calc(100%));\
                    -webkit-transform : translateX(calc(100%));\
                }\
                .tis-resultUI-moreMatchInfo > div{\
                    background-color: white;\
                    box-shadow: 0px 7px 11px -1px rgba(0,0,0,0.4);\
                    text-align: right;\
                    padding: 10px 15px 20px 10px;\
                    margin-top:10px;\
                    position : relative;\
                }\
                .tis-resultUI-matchInfo {\
                    box-shadow: 0 0 5px 3px rgba(0,0,0,0.4);\
                    background-color: white;\
                    text-align: center;\
                }\
                #TIS_resultUI_bodyContainer > div {\
                    margin-bottom: 20px;\
                }\
                #TIS_resultUI_bodyContainer {\
                    overflow-y:auto;\
                    padding-top: 10px\
                }\
                #TIS_resultUI_bodyContainer {\
                    overflow-y:auto;\
                    padding-top: 10px\
                }\
                #TIS_onlineUser_tabContainer .btn-group {\
                    width : 100%;\
                    text-align : center;\
                }\
                #TIS_onlineUser_tabContainer .btn {\
                    float : none;\
                }\
                #TIS_onlineUser_tabContainer div[data-toggle='buttons'] label:hover {\
                    color: #7AA3CC;\
                }\
                #TIS_onlineUser_tabContainer label:hover input[type='radio'] ~ i.tis {\
                    color: #7AA3CC;\
                }\
                #TIS_onlineUser_tabContainer div[data-toggle='buttons'] label.active {\
                    color: #7AA3CC;\
                }\
                #TIS_onlineUser_tabContainer div[data-toggle='buttons'] label:active, div[data-toggle='buttons'] label.active {\
                    -webkit-box-shadow: none;\
                    box-shadow: none;\
                }\
                #TIS_onlineUser_tabContainer label.btn span {\
                    font-size: 1.5em;\
                }\
                #TIS_onlineUser_tabContainer label input[type='radio'] ~ i.tis.tis-dot-circled{\
                    display: none;\
                }\
                #TIS_onlineUser_tabContainer label input[type='radio']:checked ~ i.tis.tis-dot-circled {\
                    color: #7AA3CC;\
                    display: inline;\
                }\
                #TIS_onlineUser_tabContainer label input[type='radio']:checked ~ i.tis.tis-circle-thin{\
                    display: none;\
                }\
                #TIS_onlineUser_tabContainer label input[type='radio'] ~ i.tis.tis-circle-thin {\
                    color: #c8c8c8;\
                    display: inline;\
                }\
                #TIS_onlineUser_tabContainer div[data-toggle='buttons'] label {\
                    display: inline-block;\
                    padding: 6px 12px;\
                    margin-bottom: 0;\
                    font-size: 14px;\
                    font-weight: normal;\
                    line-height: 2em;\
                    text-align: left;\
                    white-space: nowrap;\
                    vertical-align: top;\
                    cursor: pointer;\
                    background-color: none;\
                    border: 0px solid \
                    #c8c8c8;\
                    border-radius: 3px;\
                    color: #c8c8c8;\
                    -webkit-user-select: none;\
                    -moz-user-select: none;\
                    -ms-user-select: none;\
                    -o-user-select: none;\
                    user-select: none;\
                }\
                #TIS_onlineUser_tabContainer {\
                    background-color : #e4e4e4;\
                }\
                .TIS-inApp-subscribe .TIS-BTN{\
                    display : table;\
                    height:50px;\
                    width: 50px;\
                    border-radius: 25px;\
                    float: left\
                }\
                .TIS-inApp-subscribe .TIS-BTN span{\
                    display: table-cell;\
                    vertical-align: middle;\
                    font-size: 15px;\
                }\
                .TIS-inApp-subscribe{\
                   display: table-cell;vertical-align: middle\
                }\
                .TIS-inApp-credit-col div{\
                    display: table-cell;\
                    vertical-align: middle\
                }\
                .TIS-inApp-credit-col {\
                    padding-left: 0;\
                    padding-right: 0;\
                    height: 100%;\
                    display:table\
                }\
                .TIS-inApp-creditContainer {\
                    background-color: white;\
                    height: 55px;\
                    box-shadow: 0 0 5px 3px rgba(0,0,0,0.4);\
                    text-align: center\
                }\
                .TIS-inApp-moreInfo .TIS_scroll{\
                    overflow-y:auto;\
                    padding-bottom: 20px;\
                    max-height: 200px\
                }\
                .TIS-inApp-moreInfo-inner {\
                    background-color: #efeeea;\
                    box-shadow: 0px 7px 11px -1px rgba(0,0,0,0.4);\
                    text-align: right;\
                    padding-right: 30px\
                }\
                .TIS-inApp-moreInfo {\
                    -webkit-transition:1s;\
                    transition:1s;\
                    height: 0;\
                    transform: translateX(calc(100%));\
                    -webkit-transform: translateX(calc(100%));\
                    overflow: hidden;\
                    padding-top: 2px;\
                }\
                .TIS-message-confirm {\
                    float: left;\
                    margin-top: -50px;\
                    margin-right: 5px;\
                    box-shadow: inset 0px -7px 0px -2px rgba(0,0,0,0.4);\
                    width: 60px;\
                    height: 60px;\
                    border-radius: 50%;\
                    text-align: center;\
                    color:white;\
                    display: table\
                }\
                #TIS_league_mainPage_newLeagueContainer {\
                    overflow-x: hidden;\
                    padding:10px 15px 15px 15px;\
                    margin-bottom: 30px;\
                }\
                #TIS_league_mainPage_myLeagueContainer {\
                    overflow-x: hidden;\
                    padding:10px 15px 15px 15px\
                }\
                #TIS_league_headerContainer {\
                    background-color:rgba(0, 0, 0, 0.4);\
                    color:white;\
                    position:fixed;\
                    width:100%;\
                    z-index:2;\
                    top:0\
                }\
                #TIS_league_footerContainer {\
                    position:fixed;\
                    width:100%;\
                    bottom:0;\
                    z-index:2;\
                }\
                #TIS_league_leaguePage {\
                    width:100%;\
                    height:100%;\
                    display: none;\
                    overflow-x: hidden\
                }\
                #TIS_league_filterPage {\
                    width:100%;\
                    height:100%;\
                    display: none;\
                    overflow-x: hidden;\
                    background-color: #faf4e3;\
                }\
                #TIS_league_footerContainer .TIS-leagueType {\
                    height:1.5em;\
                    display:table-cell;\
                    vertical-align:middle;\
                    margin-left: 10px;\
                    font-size: 14.0pt;\
                    font-weight: 400;\
                }\
                #TIS_league_footerContainer .dropdown-toggle {\
                   position:absolute;\
                   width:100%;\
                   height:100%;\
                   font-size: 14.0pt;\
                   font-weight: 400;\
                   display:block;\
                }\
                .TIS-league-leagueContainer {\
                    background-color: white;\
                    position: relative;\
                    color:black;\
                    border-radius: 15px;\
                    margin-bottom: 5px\
                }\
                #TIS_league_mainPage_filter .TIS-leagueType {\
                    height:1.5em;\
                    display:table-cell;\
                    vertical-align:middle;\
                    margin-left: 10px;\
                    font-size: 14.0pt;\
                    font-weight: 400;\
                }\
                #TIS_league_orderBy_listContainer {\
                    width: 100%;\
                    padding:0;\
                    background-color: rgba(0, 0, 0, 0.75)\
                }\
                #TIS_league_mainPage_filter {\
                    background-color: black;\
                    color:white;\
                    box-shadow: 0px 3px 5px 0px #404040;\
                    height:4em;text-align:center\
                }\
                #TIS_webView_container {\
                    overflow-x:hidden;\
                    overflow-y: auto;\
                    width:100%;\
                    height:100%;\
                    position:fixed;\
                    z-index: 2000;\
                    display: none\
                }\
                #TIS_webView_close {\
                    margin: 10px 10px 0;\
                    font-weight: bold;\
                    float: right\
                }\
                #TIS_league_orderBy_listContainer.dropdown-menu > li > a:hover,\
                #TIS_resultUI_orderBy_listContainer.dropdown-menu > li > a:hover {\
                    background-color: rgba(0, 0, 0, 0.75);\
                }\
                #TIS_update_install {\
                    background-color: #1cb7d4;\
                }\
                #TIS_update_install.TIS_disable {\
                    background-color: gray;\
                }\
                #TIS_gamePage_tabList ul:last-child{\
                    width:130px\
                }  \
                .TIS-logo-img {\
                    width: 100px;\
                    height: 100px;\
                    display:inline-block;\
                }\
                .TIS-league-image {\
                    max-height: 90px\
                }\
                .TIS-black-back {\
                    background-color: rgba(0, 0, 0, 0.5);\
                }\
                .TIS-BTN {\
                    box-shadow: inset 0px -7px 0px -2px rgba(0,0,0,0.2);\
                    background-color: #ffb200;\
                    width: 150px;\
                    height: 50px;\
                    border-radius: 10px;\
                    text-align: center;\
                    color:white;display: table;\
                }\
                .TIS-inApp-packName {\
                    font-weight: bold\
                }\
                #TIS_editProfile_bodyContainer .nav-tabs>li:not(.active)>a ,\
                #TIS_league_mainPage .nav-tabs>li:not(.active)>a ,\
                #TIS_resultUI_bodyContainer .nav-tabs>li:not(.active)>a {\
                   border : 0px solid #ddd;\
                   color: gray;\
                }\
                #TIS_league_mainPage .nav-tabs>li>a,\
                #TIS_editProfile_bodyContainer .nav-tabs>li>a {\
                   color: #1cb7d4;\
                }\
                #TIS_inApp_itemName_container li:not(.active)>a {\
                   border-bottom : 1px solid #ddd;\
                    color: gray;\
                }\
                #TIS_inApp_itemName_container li>a {\
                    color: #1cb7d4;\
                }\
                .TIS-league-subscribe-btn {\
                    box-shadow: inset 0px -7px 0px -2px rgba(0,0,0,0.2);\
                    white-space: nowrap;\
                    background: #0ec10e;\
                    float: left;\
                    height: 50px;\
                    border-radius: 10px;\
                    text-align: center;\
                    color:white;\
                    display: table\
                }\
                .TIS-league-subscribe-btn  span{\
                    padding-left: 20px;\
                    padding-right: 20px;\
                }\
                .TIS-onlineUser-cancelRequest {\
                    width: 2.5em;\
                    height: 2.5em;\
                    background-color: red;\
                    border-radius: 100%;\
                    position: absolute;\
                    right: 0;\
                    top:-15px;\
                    text-align : center;\
                    display : table;\
                    visibility : hidden;\
                    z-index: 2;\
                }\
                .TIS-onlineUser-cancelRequest .tis-close {\
                    color : white;\
                    font-size: 1.8em;\
                    display : table-cell;\
                    vertical-align : middle;\
                    font-weight: bold;\
                }\
                .TIS-onlineUser-nickName {\
                    text-align: center;\
                    overflow: hidden;\
                    white-space: nowrap;\
                    font-weight: bold;\
                    padding-top: 10px\
                }\
                #TIS_onlineUser_table_body > div {\
                    margin-top:50px;\
                }\
                #TIS_onlineUser_table_body .TIS-user-container {\
                    cursor:pointer;\
                    border-radius:5px;\
                    background-color:white;\
                    height:100px;\
                    text-align: center\
                }\
                #TIS_onlineUser_table_body .TIS-onlineUser-image {\
                    background-size:cover;\
                    width:80px;\
                    height: 80px;\
                    border-radius: 40px;\
                    margin-top: -40px;\
                    display: inline-block;\
                }\
                #TIS_onlineUser_table_body {\
                    overflow-y: auto;\
                    overflow-x: hidden;\
                    height: 100%;\
                    padding-bottom: 10px;\
                }\
                #TIS_inApp_itemName_container {\
                    width:100%;\
                    display: flex;\
                    list-style: none;\
                    overflow-x: auto;\
                    padding-top: 10px;\
                    border: none\
                }\
                #TIS_inApp_mainPage {\
                    background-color:#faf4e3;\
                    height: 100%\
                }\
                #TIS_onlineUser_userSearchContainer {\
                    background:white;\
                    position:relative\
                }\
                #TIS_onlineUser_userSearchContainer .tis-search{\
                    position:absolute;\
                    top:10px;\
                    right:20px;\
                    color: gray;\
                }\
                #TIS_onlineUser_userSearch {\
                    font-size: medium;\
                    border:transparent;\
                    height:50px;\
                    margin-right: 55px;\
                }\
                #TIS_onlineUser_mainPage_quickMatchContainer {\
                    position:absolute;\
                    width:100%;\
                    background:rgba(0, 0, 0, 0.74);\
                    bottom:0;\
                    z-index:2001;\
                    display:none\
                }\
                #TIS_onlineUser_mainPage_header {\
                    color:white;\
                    width:100%;\
                    z-index:1;\
                    padding-top:10px\
                }\
                .TIS-leagueUI-prize{\
                    margin-top: 20px;\
                    background: url(" + TIS.Images.leagueUIPrize + ");\
                    background-repeat: round;\
                    background-size : cover;\
                    height: 140px;\
                    display: table;\
                    width: 100%;\
                    color: white;\
                    white-space: nowrap;\
                    font-size: large\
                }\
                .TIS-onlineUser-moreInfo {\
                    width: 2.5em;\
                    height: 2.5em;\
                    background-color: white;\
                    border-radius: 100%;\
                    position: absolute;\
                    right: 0;\
                    bottom:-15px;\
                }\
                .TIS-maxRuleDescriptionHeight {\
                    max-height : 50px\
                }\
                .TIS-flip {\
                    -moz-transform: scale(-1, 1);\
                    -webkit-transform: scale(-1, 1);\
                    -o-transform: scale(-1, 1);\
                    -ms-transform: scale(-1, 1);\
                    transform: scale(-1, 1);\
                }\
                .TIS-rotate-45 {\
                    -moz-transform: rotate(45deg);\
                    -webkit-transform: rotate(45deg);\
                    -o-transform: rotate(45deg);\
                    -ms-transform: rotate(45deg);\
                    transform: rotate(45deg);\
                }\
                .TIS-rotate--45 {\
                    -moz-transform: rotate(-45deg);\
                    -webkit-transform: rotate(-45deg);\
                    -o-transform: rotate(-45deg);\
                    -ms-transform: rotate(-45deg);\
                    transform: rotate(-45deg);\
                }\
                .TIS-rotate--30 {\
                    -moz-transform: rotate(-30deg);\
                    -webkit-transform: rotate(-30deg);\
                    -o-transform: rotate(-30deg);\
                    -ms-transform: rotate(-30deg);\
                    transform: rotate(-30deg);\
                }\
                .TIS-alert {\
                    background-color: #f30000;\
                }\
                .TIS-info {\
                    background-color: #0eca0e;\
                }\
                .TIS-message {\
                    margin: 20px;\
                    z-index:2010;\
                    height:auto;\
                    position:fixed;\
                    bottom:10px;\
                    left:0;\
                    right:0;\
                    color: #F0F0F0;\
                    font-size: 20px;\
                    font-weight : bold;\
                    padding:10px;\
                    text-align:center;\
                    border-radius: 2px;\
                    -webkit-box-shadow: 0px 0px 24px -1px rgba(56, 56, 56, 1);\
                    -moz-box-shadow: 0px 0px 24px -1px rgba(56, 56, 56, 1);\
                    box-shadow: 0px 0px 24px -1px rgba(56, 56, 56, 1);\
                }\
                 .TIS-leagueUI-mainBtn{\
                    margin: 25px auto 10px\
                 }\
                @media screen and (max-height: 500px) {\
                    .TIS-logo-img {\
                        width: 65px;\
                        height: 65px;\
                    }\
                }\
                @media screen and (max-width: 330px) {\
                    .TIS-league-subscribe-btn span{\
                        padding-left: 10px;\
                        padding-right: 10px;\
                    }\
                    .TIS-inApp-packName {\
                        font-size: 11px;\
                        font-weight: bold\
                    }\
                    .TIS-leagueUI-remainTime{\
                        font-size: 11px;\
                     }\
                     .TIS-leagueUI-mainBtn{\
                            margin: 25px auto 10px 0px;\
                     }\
                }\
                @media screen and (max-width: 400px) {\
                    .TIS-league-image {\
                        max-height: 70px\
                    }\
                    .TIS_league_showTable,.TIS_league_matchRequest,.TIS_league_subscribe{\
                        font-size: small\
                     }\
                     #TIS_onlineUser_userSearch {\
                       font-size: small;\
                       height: 34px\
                    }\
                    .TIS-league-rate {\
                        font-size : 0.9em\
                    }\
                    .TIS-updateUI-margin{\
                        margin-left: 30px;\
                        margin-right: 30px;\
                    }\
                    #TIS_onlineUser_userSearchContainer .tis-search{\
                        top:5px;\
                    }\
                }\
                 @media screen and (min-width: 400px) {\
                    .TIS-league-rate {\
                        font-size : 1.2em\
                    }\
                    .TIS-updateUI-margin{\
                        margin-left: 50px;\
                        margin-right: 50px;\
                    }\
                }\
                .TIS-checkbox > input[type='checkbox'] {\
                    display: none;\
                }\
                .TIS-checkbox > label {\
                    cursor: pointer;\
                    height: 0;\
                    position: relative;\
                    width: 40px;\
                }\
                .TIS-checkbox > label::before {\
                    background: rgb(0, 0, 0);\
                    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);\
                    border-radius: 8px;\
                    content: '';\
                    height: 16px;\
                    margin-top: -8px;\
                    position:absolute;\
                    opacity: 0.3;\
                    transition: all 0.4s ease-in-out;\
                    -webkit-transition: all 0.4s ease-in-out;\
                    width: 40px;\
                    left : 0\
                }\
                .TIS-checkbox > label::after {\
                    background: rgb(255, 255, 255);\
                    border-radius: 16px;\
                    box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);\
                    content: '';\
                    height: 24px;\
                    left: -4px;\
                    margin-top: -8px;\
                    position: absolute;\
                    top: -4px;\
                    transition: all 0.3s ease-in-out;\
                    -webkit-transition: all 0.3s ease-in-out;\
                    width: 24px;\
                }\
                .TIS-checkbox > input[type='checkbox']:checked + label::before {\
                    background: inherit;\
                    opacity: 0.5;\
                    left : 0\
                }\
                .TIS-checkbox > input[type='checkbox']:checked + label::after {\
                    background: inherit;\
                    left: 20px;\
                }\
                \
                \
                \
                .TIS-CheckBox > input[type='checkbox'] {\
                    display: none;\
                }\
                .TIS-CheckBox > label {\
                    cursor: pointer;\
                    position: relative;\
                    width: 40px;\
                }\
                .TIS-CheckBox > label::before {\
                   background: rgb(255, 0, 0);\
                    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);\
                    border-radius: 3px;\
                    content: '';\
                    height: 20px;\
                    margin-top: -8px;\
                    position:absolute;\
                    opacity: 1;\
                    transition: all 0.4s ease-in-out;\
                    -webkit-transition: all 0.4s ease-in-out;\
                    width: 50px;\
                    left : 0\
                }\
                \
                .TIS-resultUI-checkbox > label::before  {\
                    background: rgb(255, 255, 255);\
                }\
                .TIS-CheckBox > label::after {\
                    background: rgb(255, 255, 255);\
                    border-radius: 16px;\
                    box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);\
                    content: '';\
                    height: 30px;\
                    left: 30px;\
                    margin-top: -8px;\
                    position: absolute;\
                    top: -4px;\
                    transition: all 0.3s ease-in-out;\
                    -webkit-transition: all 0.3s ease-in-out;\
                    width: 30px;\
                }\
                .TIS-CheckBox > input[type='checkbox']:checked + label::before {\
                   background: inherit;\
                    opacity: 1;\
                    left : 0\
                }\
                .TIS-CheckBox > input[type='checkbox']:checked + label::after {\
                    left: -15px;\
                }\
                .TIS-heading {\
                    color: #ffffff ;\
                    background-color: #089ce2;\
                    border-color: #fa8d2e;\
                    height: 2.2em;\
                    padding: 0;\
                }\
                .TIS-heading>.panel-title {\
                    padding:0.3em 0.5em;\
                }\
                .TIS-blue {\
                    color: #ffffff ;\
                    background-color: #089ce2;\
                    border-color: #fa8d2e;\
                }\
                .TIS-orange {\
                    color: #ffffff;\
                    background-color: #fa8d2e;\
                    border-color: #089ce2;\
                }\
                .TIS-border-orangeColor {\
                    border-color: #fa8d2e;\
                }\
                .TIS-orangeColor {\
                    color: #fa8d2e;\
                }\
                .TIS-receiveDataTab{\
                    background-color: rgb(5, 252, 58) !important;\
                }\
                .TIS-activeTab {\
                    background-color: #000000 !important;\
                    border-bottom: 3px solid #fa8d2e !important;\
                }\
                .TIS-activeTab > i {\
                    color: white !important;\
                }\
                .TIS-activeTab > span{\
                    color: white !important;\
                }\
                .TIS-activeTab i {\
                    display : inline-block;\
                }\
                #TIS_gamePage_tabList li a:not(.TIS-activeTab) i{\
                    display : none\
                }\
                .TIS-pointer {\
                    cursor: pointer;\
                }\
                .TIS-shadow {\
                        box-shadow: 0 3px 7px rgba(0, 0, 0, .3);\
                }\
                ul[role=menu]>li{\
                    text-align: center;\
                    cursor: pointer\
                }\
                .TIS-gradient {\
                    background : -webkit-radial-gradient(#3CA55C, #B5AC49);\
                    background : -o-linear-gradient(#3CA55C, #B5AC49);\
                    background : -moz-linear-gradient(#3CA55C, #B5AC49);\
                    background : linear-gradient(#3CA55C, #B5AC49);\
                }\
                .TIS_hide {\
                  display : none\
                }\
                .TIS_league_descriptionContainer{\
                    padding : 15px;\
                    border: 3px solid #0DDC31\
                }\
                .TIS_league_awardsContainer{\
                    padding : 15px;\
                    margin-bottom : 5px;\
                    border: 3px solid #0DDC31\
                }\
                .TIS_league_rulesContainer{\
                    padding : 15px;\
                    margin-bottom : 5px;\
                    border: 3px solid #0DDC31\
                }\
                .TIS_scroll::scrollbar-track{\
                    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);\
                    background-color: #F5F5F5;\
                }\
                .TIS_scroll::-webkit-scrollbar {\
                    width: 5px;\
                    height: 5px;\
                    background-color: #F5F5F5;\
                }\
                .TIS_scroll::-webkit-scrollbar-thumb{\
                    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);\
                    background-color: #428BCA;\
                }\
                .TIS-league-awardsContainer .TIS_scroll::-webkit-scrollbar-thumb,\
                .TIS-leagueUI-prize .TIS_scroll::-webkit-scrollbar-thumb{\
                    background-color: #ff0616;\
                }\
                 .TIS_activeTab  {\
                    background-color : #428bca !important;\
                    color: white !important;\
                }\
                .active[role='presentation'] {\
                    box-shadow: rgba(0, 28, 52, 0.59) 3px 3px 1px;\
                }\
                .TIS_disable{\
                    opacity : 0.5;\
                    cursor : default !important;\
                    pointer-events : none\
                }\
                input[TIS-Type=INPUT] + label:before {\
                    font-family: FontAwesome, tahoma, serif;\
                    display: inline-block;\
                }\
                input[TIS-Type=INPUT] { display:none; }\
                input[TIS-Type=INPUT] + label:before { content: '\\f096'; }\
                input[TIS-Type=INPUT]:checked  + label:before { content: '\\f046'} \
                .TIS-league-notSelected {\
                    background-color : #faf4e3\
                }\
                .TIS-league-notSelected span{\
                    color : gray\
                }\
                .TIS-league-selected {\
                    background-color : #9f10b1\
                }\
                .TIS-credit-selectedMethod {\
                    background-color : #9f10b1;\
                    color : white\
                }\
                .TIS-league-selected span{\
                    color : white\
                }\
                .TIS-league-selection {\
                    width:80px;\
                    height:80px;\
                    border-radius:40px;\
                    box-shadow: 0 0 0 5px rgba(128, 128, 128, 0.41);\
                    display:table;\
                    text-align:center;\
                    font-size : x-large;\
                }\
                \
                .funkyradio div {\
                    clear: both;\
                    overflow: hidden;\
                }\
                .funkyradio label {\
                    width: 100%;\
                    font-weight: normal;\
                }\
                .funkyradio input[type='radio']:empty,\
                .funkyradio input[type='checkbox']:empty {\
                    display: none;\
                }\
                .funkyradio input[type='radio']:empty ~ label,\
                .funkyradio input[type='checkbox']:empty ~ label {\
                    position: relative;\
                    line-height: 2em;\
                    text-indent: 3.25em;\
                    margin-top: 10px;\
                    cursor: pointer;\
                    -webkit-user-select: none;\
                    -moz-user-select: none;\
                    -ms-user-select: none;\
                    user-select: none;\
                }\
                .funkyradio input[type='radio']:empty ~ label:before,\
                .funkyradio input[type='checkbox']:empty ~ label:before {\
                    position: absolute;\
                    display: block;\
                    top: 0;\
                    bottom: 0;\
                    right: 0;\
                    content: '';\
                    width: 2em;\
                    background: #D1D3D4;\
                    border-radius: 50%;\
                }\
                .funkyradio input[type='radio']:hover:not(:checked) ~ label,\
                .funkyradio input[type='checkbox']:hover:not(:checked) ~ label {\
                    color: #888;\
                }\
                .funkyradio input[type='radio']:hover:not(:checked) ~ label:before,\
                .funkyradio input[type='checkbox']:hover:not(:checked) ~ label:before {\
                    text-indent: .9em;\
                    color: #C2C2C2;\
                }\
                .funkyradio input[type='radio']:checked ~ label,\
                .funkyradio input[type='checkbox']:checked ~ label {\
                    color: #777;\
                }\
                .funkyradio input[type='radio']:checked ~ label:before,\
                .funkyradio input[type='checkbox']:checked ~ label:before {\
                    text-indent: .9em;\
                    color: #333;\
                    background-color: #ccc;\
                }\
                .funkyradio input[type='radio']:focus ~ label:before,\
                .funkyradio input[type='checkbox']:focus ~ label:before {\
                    box-shadow: 0 0 0 3px #999;\
                }\
                .funkyradio-success input[type='radio']:checked ~ label:before,\
                .funkyradio-success input[type='checkbox']:checked ~ label:before {\
                    color: #fff;\
                    background-color: #5cb85c;\
                }\
                \
                .TIS-credit-payMethod {\
                    box-shadow: 0 0 0 7px rgba(128, 128, 128, 0.41);\
                    width :60px;\
                    height:60px;\
                    display:inline-block;\
                    margin:15px\
                }\
                .tis {\
                    display: inline-block;\
                    font: normal normal normal 14px/1 tisFont;\
                    font-size: inherit;\
                    text-rendering: auto;\
                    -webkit-font-smoothing: antialiased;\
                    -moz-osx-font-smoothing: grayscale;\
                }\
                .tis-lg {\
                    font-size: 1.33333333em;\
                    line-height: .75em;\
                    vertical-align: -15%\
                }\
                .tis-2x {\
                    font-size: 2em\
                }\
                .tis-3x {\
                    font-size: 3em\
                }\
                .tis-4x {\
                    font-size: 4em\
                }\
                .tis-5x {\
                    font-size: 5em\
                }\
                .tis-fw {\
                    width: 1.28571429em;\
                    text-align: center\
                }\
                .tis-ul {\
                    padding-left: 0;\
                    margin-left: 2.14285714em;\
                    list-style-type: none\
                }\
                .tis-ul > li {\
                    position: relative\
                }\
                .tis-li {\
                    position: absolute;\
                    left: -2.14285714em;\
                    width: 2.14285714em;\
                    top: .14285714em;\
                    text-align: center\
                }\
                .tis-li.tis-lg {\
                    left: -1.85714286em\
                }\
                .tis-border {\
                    padding: .2em .25em .15em;\
                    border: solid .08em #eee;\
                    border-radius: .1em\
                }\
                .pull-right {\
                    float: right\
                }\
                .pull-left {\
                    float: left\
                }\
                .fa.pull-left {\
                    margin-right: .3em\
                }\
                .fa.pull-right {\
                    margin-left: .3em\
                }\
                .tis-spin {\
                    -webkit-animation: tis-spin 2s infinite linear;\
                    animation: tis-spin 2s infinite linear\
                }\
                .tis-pulse {\
                    -webkit-animation: tis-spin 1s infinite steps(8);\
                    animation: tis-spin 1s infinite steps(8)\
                }\
                @-webkit-keyframes tis-spin {\
                    0% {\
                        -webkit-transform: rotate(0deg);\
                        transform: rotate(0deg)\
                    }\
                    100% {\
                        -webkit-transform: rotate(359deg);\
                        transform: rotate(359deg)\
                    }\
                }\
                @keyframes tis-spin {\
                    0% {\
                        -webkit-transform: rotate(0deg);\
                        transform: rotate(0deg)\
                    }\
                    100% {\
                        -webkit-transform: rotate(359deg);\
                        transform: rotate(359deg)\
                    }\
                }\
                .tis-rotate-90 {\
                    filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=1);\
                    -webkit-transform: rotate(90deg);\
                    -ms-transform: rotate(90deg);\
                    transform: rotate(90deg)\
                }\
                .tis-rotate-180 {\
                    filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=2);\
                    -webkit-transform: rotate(180deg);\
                    -ms-transform: rotate(180deg);\
                    transform: rotate(180deg)\
                }\
                .tis-rotate-270 {\
                    filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=3);\
                    -webkit-transform: rotate(270deg);\
                    -ms-transform: rotate(270deg);\
                    transform: rotate(270deg)\
                }\
                .tis-flip-horizontal {\
                    filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=0, mirror=1);\
                    -webkit-transform: scale(-1, 1);\
                    -ms-transform: scale(-1, 1);\
                    transform: scale(-1, 1)\
                }\
                .tis-flip-vertical {\
                    filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1);\
                    -webkit-transform: scale(1, -1);\
                    -ms-transform: scale(1, -1);\
                    transform: scale(1, -1)\
                }\
                :root .tis-rotate-90, :root .tis-rotate-180, :root .tis-rotate-270, :root .tis-flip-horizontal, :root .tis-flip-vertical {\
                    filter: none\
                }\
                .tis-stack {\
                    position: relative;\
                    display: inline-block;\
                    width: 2em;\
                    height: 2em;\
                    line-height: 2em;\
                    vertical-align: middle\
                }\
                .tis-stack-1x, .tis-stack-2x {\
                    position: absolute;\
                    left: 0;\
                    width: 100%;\
                    text-align: center\
                }\
                .tis-stack-1x {\
                    line-height: inherit\
                }\
                .tis-stack-2x {\
                    font-size: 2em\
                }\
                .tis-inverse {\
                    color: #fff\
                }\
                #TIS_resultUI_container{\
                    overflow-x:hidden;\
                    overflow-y: auto;width:100%;\
                    height:100%;\
                    position:absolute;\
                    z-index: 2002;\
                    background-color:#faf4e3;\
                    transition: 1s;\
                    -webkit-transition: 1s;\
                }\
                #TIS_activeMatch_container {\
                    overflow-y: auto;width:100%;height:100%;display:none;position:absolute;z-index: 2000;background-color:#faf4e3\
                }\
                #TIS_ad_container {\
                    position:absolute;width:100%;height:100%;display: none;z-index: 2500\
                }\
                #TIS_credit_container {\
                    overflow-x:hidden;overflow-y: auto;width:100%;height:100%;position:fixed;z-index: 2001;display: none\
                }\
                #TIS_editProfile_container {\
                    overflow-x:hidden;overflow-y: auto;width:100%;height:100%;display:none;position:absolute;z-index: 2000;background-color:#faf4e3\
                }\
                #TIS_exchange_container {\
                    overflow:hidden;width:100%;height:100%;position:absolute;z-index: 2000;\
                    transition: 1s;\
                    -webkit-transition: 1s;\
                }\
                #TIS_inApp_container {\
                    overflow:hidden;\
                    width:100%;height:100%;\
                    position:absolute;z-index: 2003;\
                    transition: 1s;\
                    -webkit-transition: 1s;\
                }\
                #TIS_league_container {\
                    overflow-y: auto;\
                    width:100%;height:100%;\
                    background-size: cover;\
                    position:absolute;\
                    z-index: 2000;\
                    overflow-x:hidden;\
                    overflow-y:auto;\
                    transition: 1s;\
                    -webkit-transition: 1s;\
                }\
                #TIS_login_container {\
                    overflow-y: auto;width:100%;height:100%;display:none;position:absolute;z-index: 2001;background-color:white\
                }\
                #TIS_firstPage_container {\
                    position:fixed;width: 100%;height:100%;display: none\
                }\
                #TIS_gamePage_container {\
                    display: none;position: absolute;width: 100%;height:100%;overflow: hidden\
                }\
                #TIS_onlineUser_container {\
                    width:100%;\
                    height:100%;\
                    background-size: \
                    cover;position:absolute;\
                    z-index:2000;\
                    overflow:hidden;\
                    transition: 1s;\
                    -webkit-transition: 1s;\
                }\
                #TIS_message_container {\
                    position: fixed;bottom: 0;left:0;width : 100%;height: 16em;display: none;z-index: 2001\
                }\
                #TIS_share_container {\
                    overflow-x:hidden;overflow-y: auto;width:100%;height:100%;display:none;position:absolute;z-index: 2000;background-color:#faf4e3\
                }\
                #TIS_signup_container {\
                    overflow-y: auto;width:100%;height:100%;display:none;overflow-y: auto;position:absolute;z-index: 2001;background-color:white\
                }\
                #TIS_suggestion_container {\
                    overflow-x:hidden;\
                    overflow-y: auto;\
                    width:100%;\
                    height:100%;\
                    position:fixed;\
                    z-index: 2000;\
                    transition: 1s;\
                    -webkit-transition: 1s;\
                }\
                #TIS_table_container {\
                    width:100%;height:100%;background-size: cover;position:fixed;z-index:2000;overflow:hidden;\
                    transition: 1s;\
                    -webkit-transition: 1s;\
                }\
                #TIS_update_container {\
                    position: fixed;\
                    overflow-x:hidden;\
                    overflow-y: auto;\
                    width:100%;\
                    height:100%;\
                    z-index: 2501;\
                    display: table;\
                    transition: 1s;\
                    -webkit-transition: 1s;\
                }\
                #TIS_update_container .TIS-content{\
                    display: table-cell;\
                    vertical-align: middle;\
                }\
                #TIS_exchange_confirm_container {\
                    z-index: 2001;overflow-y: auto\
                }\
                #TIS_inApp_confirm_container {\
                    z-index: 2001\
                }\
            ";

            var head = document.head || document.getElementsByTagName("head")[0];
            var element = document.createElement('style');
            element.type = 'text\/css';
            element.innerHTML = styleContent;
            head.appendChild(element);
        };

    /**
     * @method updateApp
     * @public
     *
     * @param {Object} [params]
     *      @param {Object} [params.gameId]
     *
     * @param {Object} callbacks
     *
     *      @param {Function} [callbacks.onStart]
     *      @param {Function} [callbacks.onLoad]
     *
     *      @param {Function} [callbacks.onFail]
     *
     *      @param {Function} callbacks.onProgress
     *              @param {Number} callbacks.onProgress.loaded
     *
     * */
    __updateApp = function (params, callbacks) {

        // var gameIds = __service.getRegisterGamesId();
        // var gameId = (params && params.gameId) ? params.gameId : Object.keys(gameIds)[0],
        var
            rootFolderPath = "cdvfile://localhost/persistent/TISService/download/",
            downloadLink = params.downloadLink;

        if (TIS.Util.isApp()) {
            function checkPermission() {
                // update();b
                if (__hasDiagnostic) {
                    TIS.Util.hasPermission(cordova.plugins.diagnostic.runtimePermission.WRITE_EXTERNAL_STORAGE, function (result) {
                        if (result.state) {
                            update();
                        } else {
                            TIS.Util.requestPermission(cordova.plugins.diagnostic.runtimePermission.WRITE_EXTERNAL_STORAGE, function (res) {
                                if (res.state) {
                                    update();
                                } else {
                                    params.onFail && params.onFail({
                                        //loaded : percent
                                        errorMessage: __dic.STORAGE_NOT_PERMISSION[__lang]
                                    });
                                }
                            });
                        }
                    });
                } else {
                    update();
                }
            }

            function update() {
                var fileTransfer = new FileTransfer(),
                    lastPercent;

                fileTransfer.download(
                    downloadLink,
                    rootFolderPath + "launcher.apk",
                    function (entry) {
                        openFile(entry.toURL());
                    },
                    function () {
                        callbacks.onFail && callbacks.onFail({
                            //loaded : percent
                            errorMessage: __dic.ERRORINPROCESS[__lang]
                        });
                    },
                    false,
                    {
                        //headers: {
                        //    "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
                        //}
                    }
                );

                fileTransfer.onprogress = function (result) {
                    var percent = parseInt(result.loaded / result.total * 100);

                    if (percent != lastPercent) {
                        lastPercent = percent;
                        callbacks.onProgress && callbacks.onProgress({
                            loaded: percent
                        });
                    }
                };
            }

            function openFile(filePath) {
                callbacks.onLoad && callbacks.onLoad({
                    //loaded : percent
                });
                TIS.Plugin.startActivity({
                        action: TIS.Plugin.ACTION_VIEW,
                        url: filePath,
                        type: 'application/vnd.android.package-archive'
                    },
                    function () {
                        //__logger.info('success to open URL via Android Intent')();
                    },
                    function () {
                        console.log('can not open app', __games[gameId].info.downloadLink);
                        //__logger.info('Failed to open URL via Android Intent')();
                    }
                );
            }

            callbacks.onStart && callbacks.onStart({});

            checkPermission();

        } else {
            location.reload();
        }


    };


    function checkGameCenterCompatibility(successCallback) {
        TIS.Plugin.getAppInfo(
            __service.getConfig().gameCenterPackageName,
            function (appinfo) {
                var compareData = TIS.Util.compareVersion(appinfo.versionName, __minGameCenterVersion);

                if (compareData.isGreater || compareData.isEqual) {
                    successCallback && successCallback();
                } else {
                    __self.update({
                        message: "به منظور استفاده از تمامی فیچر های بازی لطفا اپ گیم سنتر را بروزرسانی نمایید.",
                        updateGameCenter: true
                    });
                }

            },
            function () {
                __self.update({
                    message: "به منظور استفاده از تمامی فیچر های بازی لطفا اپ گیم سنتر را نصب نمایید.",
                    updateGameCenter: true
                });
            });
    }



    function ssoLoginSignup(params) {
        if (TIS.Util.isApp()) {

            checkGameCenterCompatibility(function () {

                var method = TIS.Plugin.signupUI;

                if(params.login) {
                    method = TIS.Plugin.loginUI;
                }

                method({}, function (res) {
                    console.log("SSO_LOGIN_CALLBACK ", res);

                    if(!res.HasError) {
                        var result = res.Result;

                        __service.initLogin({
                            id: result.id,
                            nickName: result.name,
                            image: result.image,
                            imageUrl: result.imageUrl,
                            token: result.token,
                            tokenIssuer: result.tokenIssuer,
                            tokenExpireTime: result.tokenExpireTime,
                            ssoLogin: true
                        });
                    }

                }, function (message) {
                    console.log("SSO_LOGIN_FAILED ",message);
                });
            });

        } else {
            __webViewResponseHandle({
                url: params.webUrl
            }, function (res) {

                if (!res.HasError) {
                    var result = res.Result;
                    __service.initLogin({
                        id: result.UserID,
                        nickName: result.Name,
                        image: result.Image,
                        imageUrl: result.ProfileImage,
                        token: result.Token,
                        tokenIssuer: 0,
                        ssoLogin: true
                    });

                } else {
                    __self.alert(res.ErrorMessage);
                }
                __protected.hideWebView();
            });
        }
    }


    __protected.getLauncherDownloadLink = __getLauncherDownloadLink;

    __protected.toast = function (params) {

        if (params && params.message) {
            __toast.find("span").html(params.message);
        }
        __toast.stop().fadeIn(400).delay(2000).fadeOut(400);
    };

    // __protected.getOnlineUserUI = function () {
    //     return __matchRequestUI;
    // };

    __protected.isLogin = function () {
        return (__service && typeof __service.getUserData().token === "string");
    };

    __protected.loginRequest = function (params, callback) {
        __service.loginRequest(params, callback);
    };

    __protected.signupRequest = function (params, callback) {
        __service.signupRequest(params, callback);
    };

    __protected.verifyRequest = function (params, callback) {
        __service.verifyRequest(params, callback);
    };

    __protected.completeProfileRequest = function (params, callback) {
        __service.completeProfileRequest(params, callback);
    };

    __protected.suggestionRequest = function (params, callback) {
        __service.suggestionRequest(params, callback);
    };

    __protected.showSuggestionUI = function (params) {

        if (!__suggestionUI) {
            __suggestionUI = new TIS.SuggestionUI(__UIInstanceArg);
        }
        return __suggestionUI.show(params);
    };

    __protected.getUserData = function () {
        return __service.getUserData();
    };

    __protected.showTable = function (params) {
        if(TIS.Util.isApp() && !__service.getConfig().loadOwnTableUI) {
            checkGameCenterCompatibility(function () {

                if(!params) {
                    params = {};
                }

                if(!params.gameId) {
                    params.gameId = __service.getRegisterGamesId()[0];
                }

                TIS.Plugin.leaderBoardUI(params,
                    function (res) {
                        console.log("SUCCESS_leaderBoardUI_RES", res);
                    },
                    function (res) {
                        console.log("FAILED_leaderBoardUI_RES", res);
                    });
            });
        } else {
            if (!__tableUI) {
                __tableUI = new TIS.TableUI(__UIInstanceArg);
            }
            return __tableUI.show(params);
        }

    };

    __protected.showMatchRequestUI = function (params) {

        if(TIS.Util.isApp() && !__service.getConfig().loadOwnUI) {
            checkGameCenterCompatibility(function () {
                if(!params ) {
                    params = {};
                }

                if(!params.gameId) {
                    params.gameId = __service.getRegisterGamesId()[0];
                }
                TIS.Plugin.matchRequestUI(params,
                    function (res) {
                        console.log("SUCCESS_matchRequestUI_RES", res);
                    },
                    function (res) {
                        console.log("FAILED_matchRequestUI_RES", res);
                    });
            });
        } else {
            if (!__matchRequestUI) {
                __matchRequestUI = new TIS.MatchRequestUI(__UIInstanceArg);
            }
            return __matchRequestUI.show(params);
        }

    };

    __protected.hideMatchRequestUI = function (params) {
        __matchRequestUI && __matchRequestUI.hide(params)
    };

    __protected.getOnlineUser = function (params, callback) {
        __service.getOnlineUser(params, callback);
    };

    __protected.getLeagueMembers = function (params, callback) {
        __service.getLeagueMembers(params, callback);
    };

    __protected.matchRequest = function (params, callbacks) {
        __service.matchRequest(params, callbacks);
    };

    __protected.cancelMatchRequest = function (params, callback) {
        __service.cancelMatchRequest(params, callback);
    };

    __protected.matchIdRequest = function (params, callback) {
        __service.matchIdRequest(params, callback);
    };

    __protected.getLeaguesInfo = function (params, callback) {
        __service.getLeaguesInfo(params, callback);
    };

    __protected.getLeaguesInfo = function (params, callback) {
        __service.getLeaguesInfo(params, callback);
    };

    __protected.getTopLeaguesInfo = function (params, callback) {
        __service.getTopLeaguesInfo(params, callback);
    };

    __protected.getLatestLeaguesInfo = function (params, callback) {
        __service.getLatestLeaguesInfo(params, callback);
    };

    __protected.runSingleMatch = function (params) {
        __service.runSingleMatch(params);
    };

    __protected.runMultiPlayerMatch = function (params) {
        __service.runMultiPlayerMatch(params);
    };

    __protected.getGamesInfo = function (params, callback) {
        __service.getGamesInfo(params, callback);
    };

    __protected.logoutRequest = function (callback) {
        __service.logoutRequest(callback);
    };

    __protected.subscribeLeagueRequest = function (params, callback) {
        __service.subscribeLeagueRequest(params, function (data) {
                callback && callback(data);
                if (data.result.state) {
                    __matchRequestUI && __matchRequestUI.onSubscribeLeague({
                        gameId: data.result.gameId
                    });

                    __tableUI && __tableUI.onSubscribeLeague({
                        gameId: data.result.gameId
                    });
                }
            }
        );
    };

    __protected.getRequestTimeout = function () {
        return __requestTimeout;
    };

    __protected.onShowFirstPage = function () {
        // var allShowEvent = __userEvents["firstPage_show"];
        // var allHideEvent = __userEvents["matchPage_hide"];
        // var eventId;
        //
        // for (eventId in allShowEvent) {
        //     allShowEvent[eventId]();
        // }
        //
        // for (eventId in allHideEvent) {
        //     allShowEvent[eventId]();
        // }

        __fireEvent("firstPageShow");
        __fireEvent("matchPageHide");
    };

    __protected.onShowMatchPage = function () {
        // var allShowEvent = __userEvents["matchPage_show"];
        // var allHideEvent = __userEvents["firstPage_hide"];
        // var eventId;
        //
        // for (eventId in allShowEvent) {
        //     allShowEvent[eventId]();
        // }
        //
        // for (eventId in allHideEvent) {
        //     allShowEvent[eventId]();
        // }

        __fireEvent("matchPageShow");
        __fireEvent("firstPageHide");
    };

    __protected.showSignupUI = function (params) {
        if (!__signupUI) {
            __signupUI = new TIS.SignupUI(__UIInstanceArg);
        }
        __signupUI.show(params);
    };

    __protected.showLoginUI = function (params) {
        if (!__loginUI) {
            __loginUI = new TIS.LoginUI(__UIInstanceArg);
        }
        __loginUI.show(params);
    };

    __protected.getConfig = function () {
        return __service.getConfig();
    };

    __protected.saveMessage = function (params, callback) {
        __service.saveMessage(params, callback);
    };

    __protected.deleteMessage = function (params, callback) {
        __service.deleteMessage(params, callback);
    };

    __protected.generateImageUrl = function (params) {
        return __service.generateImageUrl(params);
    };

    __protected.selectChatThread = function (matchId) {
        if (__matches[matchId]) {
            // __chatUI.selectThreadWithUserId(__matches[matchId].players.player2.id);
            __fireEvent("tabSelect", {userId: __matches[matchId].players.player2.id, matchId: matchId});
        }
    };

    __protected.quickMatchRequest = function (params, callbacks) {
        __service.quickMatchRequest(params, callbacks);
    };

    __protected.cancelQuickMatchRequest = function (params, callback) {
        __service.cancelQuickMatchRequest(params, callback);
    };

    __protected.getQuickMatchState = function (params) {
        return __service.getQuickMatchState(params);
    };

    __protected.searchUserRequest = function (params, callback) {
        __service.searchUserRequest(params, callback);
    };

    __protected.shareRequest = function (params, callback) {
        __service.shareRequest(params, callback);
    };

    __protected.shareUI = function (params) {
        if (!__shareUI) {
            __shareUI = new TIS.ShareUI(__UIInstanceArg);
        }
        return __shareUI.show(params);
    };

    __protected.credit = function (params) {
        if (!__creditUI) {
            __creditUI = new TIS.CreditUI(__UIInstanceArg);
        }
        return __creditUI.show(params);
    };

    __protected.generateIncreaseCreditUrl = function (params) {
        return __service.generateIncreaseCreditUrl(params);
    };

    __protected.increaseCreditWithVoucherRequest = function (params, callback) {
        __service.increaseCreditWithVoucherRequest(params, callback);
    };

    __protected.updateApp = function (params, callbacks) {
        __updateApp(params, callbacks);
    };

    __protected.getLeagueAwards = function (params, callback) {
        __service.getLeagueAwards(params, callback);
    };

    __protected.getUserProfile = function (params, callback) {
        __service.getUserProfile(params, callback);
    };

    __protected.editProfileRequest = function (params, callback) {
        __service.editProfileRequest(params, callback);
    };

    __protected.sendLeagueRateRequest = function (params, callback) {
        __service.sendLeagueRateRequest(params, callback);
    };

    __protected.changePasswordRequest = function (params, callback) {
        __service.changePasswordRequest(params, callback);
    };

    __protected.verifyWithCompleteProfileRequest = function (params, callback) {
        __service.verifyWithCompleteProfileRequest(params, callback);
    };

    __protected.getInAppPurchasePack = function (params, callback) {
        __service.getInAppPurchasePack(params, callback);
    };

    __protected.getGlobalInAppPurchasePack = function (params, callback) {
        __service.getGlobalInAppPurchasePack(params, callback);
    };

    __protected.buyInAppPurchasePackRequest = function (params, callback) {
        __service.buyInAppPurchasePackRequest(params, callback);
    };

    __protected.getGameItems = function (params, callback) {
        __service.getGameItems(params, callback);
    };

    __protected.registerGuestRequest = function (params, callback) {
        __service.registerGuestRequest(params, callback);
    };

    __protected.alert = function (params) {

        var message,
            timeout = __defaultTimeout;
        if (typeof params == "object") {
            message = params.message;
            if (typeof params.timeout == "number" && params.timeout > 0) {
                timeout = params.timeout;
            }
        } else {
            message = params;
        }

        __$message.finish();
        __$message
            .removeClass("TIS-info")
            .addClass("TIS-alert")
            .html(message)
            .fadeIn(400)
            .delay(timeout)
            .fadeOut(400);
    };

    __protected.info = function (params) {

        var message,
            timeout = __defaultTimeout;

        if (typeof params == "object") {
            message = params.message;
            if (typeof params.timeout == "number" && params.timeout > 0) {
                timeout = params.timeout;
            }

            if (typeof params.css == "object") {
                __$message.css(params.css);
            } else {
                __$message.css({
                    "background-color": "none"
                });
            }

        } else {
            __$message.css({
                "background-color": "none"
            });
            message = params;
        }

        __$message.finish();

        __$message
            .removeClass("TIS-alert")
            .addClass("TIS-info")
            .html(message)
            .fadeIn(400)
            .delay(timeout)
            .fadeOut(400);
    };

    __protected.getServerTime = function (params, callback) {
        __service.getServerTime(params, callback);
    };

    __protected.getTableData = function (params, callback) {
        __service.getTableData(params, callback);
    };

    __protected.getEnrollAccess = function (params, callback) {
        __service.getEnrollAccess(params, callback);
    };

    __protected.getCreditPackList = function (params, callback) {
        __service.getCreditPackList(params, callback);
    };

    __protected.forgetPasswordRequest = function (params, callback) {
        __service.forgetPasswordRequest(params, callback);
    };

    __protected.getGameCenterUrl = function () {
        return __service.getGameCenterUrl();
    };

    __protected.getCredit = function (callback) {
        __service.getCredit(callback);
    };

    __protected.getUserItem = function (params, callback) {
        __service.getUserItem(params, callback);
    };

    __protected.getService = function () {
        return __service;
    };

    __protected.getExchange = function () {
        return __service.getExchange();
    };

    __protected.showInAppPurchaseUI = function (params) {
        if (!__inAppPurchaseUI) {
            __inAppPurchaseUI = new TIS.InAppPurchaseUI(__UIInstanceArg);
        }
        return __inAppPurchaseUI.show(params);
    };

    __protected.showResultUI = function (params) {
        if (!__resultUI) {
            __resultUI = new TIS.ResultUI(__UIInstanceArg);
        }
        return __resultUI.show(params);
    };

    __protected.fireEvent = function (eventName, data) {
        __fireEvent(eventName, data);
    };

    __protected.showWebView = function (params) {
        if (!__webViewUI) {
            __webViewUI = new TIS.WebViewUI(__UIInstanceArg);
        }
        __webViewUI.show(params);
    };

    __protected.hideWebView = function () {
        __webViewUI && __webViewUI.hide();
    };

    /*==================================================================================================================
     *                                 P U B L I C     M E T H O D (this methods  should be implement.)
     *================================================================================================================*/

    /*
     *   this function use by user
     * */

    /**
     * نمایش صفحه ورود و یا ثبت نام در حساب کاربری
     * @method loginUI
     * @public
     * */
    __self.loginUI = function (params) {
        ssoLoginSignup({
            webUrl: __service.getConfig().ssoLoginUrl,
            appUrl: "bazitech://login",
            login : true
        });
    }
    __self.login = __self.loginUI;


    /**
     * نمایش صفحه ورود و یا ثبت نام در حساب کاربری
     * @method signupUI
     * @public
     *
     * */
    __self.signupUI = function (params) {
        ssoLoginSignup({
            webUrl: __service.getConfig().ssoSignupUrl,
            appUrl: "bazitech://signup",
            login : false
        });
    };
    __self.signup = __self.signupUI;



    /**
     * نمایش صفحه لبگ های بازی
     * @method leagueUI
     * @public
     *
     * @param {Object} [params]
     *  @param {Number} [params.gameId]
     *  @param {Number} [params.leagueId]
     * */
    __self.leagueUI = function (params) {

        if(TIS.Util.isApp() && !__service.getConfig().loadOwnUI) {
            checkGameCenterCompatibility(function () {
                if(!params) {
                    params = {};
                }

                if(!params.gameId) {
                    params.gameId = __service.getRegisterGamesId()[0];
                }

                TIS.Plugin.leagueUI(params,
                    function (res) {
                        console.log("SUCCESS_leagueUI_RES", res);
                    },
                    function (res) {
                        console.log("FAILED_leagueUI_RES", res);
                    });
            });
        } else {
            if (!__leagueUI) {
                __leagueUI = new TIS.LeagueUI(__UIInstanceArg);
            }
            return __leagueUI.show(params);
        }

    };
    __self.league = __self.leagueUI;


    /**
     * نمایش جدول رده بندی
     * @method leaderBoardUI
     * @param {Object} params
     *  @param {Number} params.gameId
     *  @param {Number} [params.leagueId]
     *
     * */
    __self.leaderBoardUI = function (params) {
        return __protected.showTable(params);
    };
    __self.table = __self.leaderBoardUI;


    /**
     * نمایش صفحه افزایش اعتبار
     * @method increaseCreditUI
     * @public
     *
     * */
    __self.increaseCreditUI = function (params) {

        if(/*params && params.gameCenter === true &&*/ TIS.Util.isApp()) {
            checkGameCenterCompatibility(function () {
                if(!params) {
                    params = {};
                }

                TIS.Plugin.increaseCreditUI(params,
                    function (res) {
                        console.log("SUCCESS_increaseCreditUI_RES", res);
                    },
                    function (res) {
                        console.log("FAILED_increaseCreditUI_RES", res);
                    });
            });
        } else {
            // return __protected.credit(params);
            __webViewResponseHandle({
                url: __service.getConfig().ssoCreditUrl
            }, function (res) {

            });
        }
    };
    __self.credit = __self.increaseCreditUI;

    /**
     * نمایش صفحه خرید آیتم های درون برنامه ای
     * @method inAppPurchaseUI
     * @public
     *
     * @param {Object} [params]
     *      @param {String} [params.gameId]
     *      @param {String} [params.itemId]
     *
     * */
    __self.inAppPurchaseUI = function (params) {

        if(TIS.Util.isApp() && !__service.getConfig().loadOwnUI) {
            checkGameCenterCompatibility(function () {

                if(!params) {
                    params = {};
                }
                if(!params.gameId) {
                    params.gameId = __service.getRegisterGamesId()[0];
                }

                TIS.Plugin.inAppPurchaseUI(params,
                    function (res) {
                        console.log("SUCCESS_inAppPurchaseUI_RES", res);

                        params.onBuy && params.onBuy({
                            hasError : res.HasError,
                            errorMessage : res.ErrorMessage,
                            errorCode : res.ErrorCode,
                            result : res.Result && __service.reformatUserItem(res.Result)
                        });
                    },
                    function (res) {
                        console.log("FAILED_inAppPurchaseUI_RES", res);
                    });
            });
        } else {
            return __protected.showInAppPurchaseUI(params);
        }

    };
    __self.inAppPurchase = __self.inAppPurchaseUI;

    /**
     * show exchange ui
     * @method exchangeUI
     * @public
     * @deprecated
     * */
    __self.exchangeUI = function (params) {

        if(!__exchange) {
            throw new TIS.ServiceException("exchange instance  is not exists in ServiceUI constructor");
        }

        if (!__exchangeUI) {
            __UIInstanceArg.exchange = __exchange;
            __exchangeUI = new TIS.ExchangeUI(__UIInstanceArg);
        }
        __exchangeUI.show(params);
    };
    __self.exchange = __self.exchangeUI;

    /**
     * نمایش صفحه درخواست مسابقه
     * @method matchRequestUI
     * @public
     * @param {Object} [params]
     *      @param {String} [params.gameId]
     *      @param {String} [params.leagueId]
     *
     * */
    __self.matchRequestUI = function (params) {

        __protected.showMatchRequestUI(params);
    };
    __self.matchRequest = __self.matchRequestUI;

    __self.onlineUser = function (params) {
        console.log("this function deprecated, use matchRequestUI instead");
        return __protected.showMatchRequestUI(params);
    };

    /**
     * نمایش صفحه ویرایش پروفایل
     * @public
     * @method editProfileUI
     *
     * */
    __self.editProfileUI = function (params) {
        if (TIS.Util.isApp()) {

            checkGameCenterCompatibility(function () {

                TIS.Plugin.editProfileUI({}, function (res) {
                    console.log("SSO_editProfileUI_CALLBACK ", res);

                }, function (message) {
                    console.log("SSO_editProfileUI_FAILED ",message);
                });
            });

        } else {
            __webViewResponseHandle({
                url: __service.getConfig().ssoEditProfileUrl
            }, function (res) {

            });
        }
    };
    __self.editProfile = __self.editProfileUI;

    /**
     * نمایش صفحه نتایج لیگ
     * @method resultUI
     *
     * @param {Object} [params]
     *      @param {String} [params.leagueId]
     *      @param {String} [params.userId]
     *
     * @return {ResultUI}
     * */
    __self.resultUI = function (params) {
        return __protected.showResultUI(params);
    };
    __self.result = __self.resultUI;

    /**
     * show message UI
     * @method messageUI
     *
     * @return {MessageUI}
     * */
    __self.messageUI = function () {
        __messageUI.show();
    };
    __self.message = __self.messageUI;

    /**
     * نمایش صفحه پیشنهادات
     * @method suggestionUI
     * @public
     *
     * @param {Object} params
     *      @param {String} params.title
     *      @param {String} params.metaData
     *      @param {Number} [params.type=1]  1 -> suggestion   2-> bug report  3-> user block report
     *
     * */
    __self.suggestionUI = function (params) {
        __protected.showSuggestionUI(params);
    };
    __self.suggestion = __self.suggestionUI;

    /**
     * show suggestion ui
     * @method getFirstPageContainer
     * @public
     *
     * @return {Function} return first page container
     *
     * */
    __self.getFirstPageContainer = function () {
        return __matchPageUI.getFirstPageContainer();
    };

    /**
     * show showFirstPage
     * @method showFirstPage
     * @public
     *
     * */
    __self.showFirstPage = function () {
        __matchPageUI.showFirstPage();
    };

    /**
     * @method createMatchPage
     *  @param {Object} [params]
     *      @param {String} params.matchId
     *      @param {String} [params.title]
     *
     * @return {MatchPageHandler}
     * */
    __self.createMatchPage = function (params) {
        __hideAllPage();

        var par;
        if(arguments.length == 1) {
            if(typeof arguments[0] === "string") {
                par = {
                    matchId : arguments[0]
                }
            } else {
                par = arguments[0];

            }
        } else {
            if(typeof arguments[1] === "object" && arguments[1] !== null) {
                par = arguments[1];
            } else {
                par = {};
            }

            par.matchId = arguments[0]
        }

        return __matchPageUI.createMatchPage(par);
    };


    /**
     * نمایش صفحه بروزرسانی بازی
     * @method updateUI
     * @public
     *
     * */
    __self.updateUI = function (params) {
        if (!__updateUI) {
            __updateUI = new TIS.UpdateUI(__UIInstanceArg);
        }
        return __updateUI.show(params);
    };
    __self.update = __self.updateUI;

    /**
     * نمایش صفحه اشتراک گزاری
     * @method shareUI
     * @public
     *
     * @deprecated
     *
     * */
    __self.shareUI = function (params) {
        return __protected.shareUI(params)
    };
    __self.share = __self.shareUI;

    /**
     * @event on
     * @public
     *
     * @param {String} eventName    firstPageShow ,
     *                              matchPageShow ,
     *                              firstPageHide ,
     *                              matchPageHide ,
     *                              tabSelect
     * @param {Function} callback
     *
     * */
    __self.on = function (eventName, callback) {
        var eventId = TIS.Util.generateUUID(3);
        if (__userEvents[eventName]) {
            __userEvents[eventName][eventId] = callback;
            return eventId;
        }
    };

    __self.subscribeLeagueUI = function (params) {
        if(TIS.Util.isApp()) {
            checkGameCenterCompatibility(function () {
                TIS.Plugin.subscribeLeagueUI(params,
                    function (res) {
                        console.log("SUCCESS_subscribeLeagueUI_RES", res);
                    },
                    function (res) {
                        console.log("FAILED_subscribeLeagueUI_RES", res);
                    });
            });
        } else {

            var userData = __service.getUserData();
            var url = __service.getConfig().ssoLeagueEnrollUrl +
                "/?leagueId=" + params.leagueId +
                "&_token=" + userData.token +
                "&tokenIssuer=" + userData.tokenIssuer;

            __webViewUI.show({url: url});
        }
    }

    __self.subscribeLeague = __self.subscribeLeagueUI;

    __self.backButton = function () {
        if (__activeMatchUI && __activeMatchUI.backButton()) {
            return true;
        }

        if (__adUI && __adUI.backButton()) {
            return true;
        }

        if (__editProfileUI && __editProfileUI.backButton()) {
            return true;
        }

        if (__creditUI && __creditUI.backButton()) {
            return true;
        }

        if (__inAppPurchaseUI && __inAppPurchaseUI.backButton()) {
            return true;
        }


        if (__resultUI && __resultUI.backButton()) {
            return true;
        }


        if (__leagueUI && __leagueUI.backButton()) {
            return true;
        }

        if (__loginUI && __loginUI.backButton()) {
            return true;
        }

        if (__webViewUI && __webViewUI.backButton()) {
            return true;
        }

        if (__signupUI && __signupUI.backButton()) {
            return true;
        }

        if (__suggestionUI && __suggestionUI.backButton()) {
            return true;
        }

        if (__tableUI && __tableUI.backButton()) {
            return true;
        }

        if (__matchRequestUI && __matchRequestUI.backButton()) {
            return true;
        }

        if (__messageUI && __messageUI.backButton()) {
            return true;
        }

        if (__shareUI && __shareUI.backButton()) {
            return true;
        }

        if (__updateUI && __updateUI.backButton()) {
            return true;
        }



        if (__exchangeUI && __exchangeUI.backButton()) {
            return true;
        }

        return __matchPageUI.backButton();
    };

    __self.alert = __protected.alert;
    __self.info = __protected.info;


    __init();
};

TIS.ServiceUI.VERSION = "1.0.0";
TIS.ServiceUI.NAME = "TIS_SERVICE_UI";

