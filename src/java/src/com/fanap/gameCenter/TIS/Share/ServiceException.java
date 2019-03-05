package com.fanap.gameCenter.TIS.Share;

public class ServiceException extends Exception {


    public ServiceException(String message) {
        super(message);
    }

    public ServiceException(String message,Throwable originalException) {
        super(message,originalException);
    }
    public ServiceException(Throwable originalException) {
        super("unhandled exception",originalException);
        originalException.printStackTrace();
    }

}
