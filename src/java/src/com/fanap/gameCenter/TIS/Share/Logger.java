package com.fanap.gameCenter.TIS.Share;

import java.util.HashMap;

public class Logger {

    private static boolean enable = true;
    private static  HashMap<Class , Logger> logs = new HashMap<Class, Logger>();
    Class className = null;

    Logger(Class className) {
        this.className = className;
    }

    public void info(final String data) {
        if (enable) {
//            Thread one = new Thread() {
//                public void run() {
//                    System.out.println(data);
//                }
//            };
//            one.start();
            String printData = "";
            if (className != null) {
                printData += className + "  ";
            }
            printData += data;
            System.out.println(printData);
        }
    }

    static void enable() {
        enable = true;
    }

    static void disable() {
        enable = false;
    }

    public static Logger getLogger(Class className) {
        Logger log = logs.get(className);
        if (log == null) {
            log = new Logger(className);
        }
        return  log;
    }
}
