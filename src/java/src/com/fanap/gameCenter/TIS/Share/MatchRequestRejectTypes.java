package com.fanap.gameCenter.TIS.Share;

/**
 *
 *<div style='width: 100%;text-align: right'> انواع پیام های رد درخواست</div>
 * */
public class MatchRequestRejectTypes {
    /**
     *
     *<div style='width: 100%;text-align: right'> عدم پذیرش درخواست توسط کاربر</div>
     * */
    public static final int USER_NOT_ACCEPT = 3;
    /**
     *
     *<div style='width: 100%;text-align: right'>  عدم نصب بودن برنامه </div>
     * */
    public static final int APP_NOT_INSTALLED = 4;

    /**
     *
     *<div style='width: 100%;text-align: right'>تداخل ورژن برنامه نصب شده </div>
     * */
    public static final int USER_VERSION_CONFLICT = 5;

    /**
     *
     *<div style='width: 100%;text-align: right'> مشغول بودن کاربر به بازی </div>
     * */
    public static final int USER_IS_BUSY = 6;

    /**
     *
     *<div style='width: 100%;text-align: right'>دریافت متن پیام </div>
     *
     * @param type نوع پیام
     * @param  langType  نوع زبان
     * @return متن پیام
     * */
    public static String getMessage(int type, LanguageTypes langType) {
        String message = "";

        switch (type) {
            case  USER_NOT_ACCEPT :
                if (langType!= null && langType.equals(LanguageTypes.EN)) {
                    message = "user not accept your request";
                } else {
                    message = "با درخواست شما موافقت نشده است";
                }
                break;
            case APP_NOT_INSTALLED :
                if (langType!= null && langType.equals(LanguageTypes.EN)) {
                    message = "app not installed.";
                } else {
                    message = "کاربر برنامه را نصب نکرده است";
                }
                break;

            case USER_VERSION_CONFLICT :
                if (langType!= null && langType.equals(LanguageTypes.EN)) {
                    message = "use app version not update";
                } else {
                    message = "نسخه بازی کاربر مورد نظر به روز نمی باشد.";
                }
                break;

            case USER_IS_BUSY:
                if (langType!= null && langType.equals(LanguageTypes.EN)) {
                    message = "use is busy.";
                } else {
                    message = "کاربر مورد نظر مشغول انجام بازی می باشد.";
                }
                break;
        }
        return message;
    }
}