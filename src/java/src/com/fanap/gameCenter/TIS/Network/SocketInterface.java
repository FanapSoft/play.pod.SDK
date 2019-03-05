package com.fanap.gameCenter.TIS.Network;

import com.fanap.gameCenter.TIS.Share.ServiceException;
import org.json.JSONObject;

public abstract class SocketInterface {

    public abstract void connect();
    public abstract void logout();
    public abstract void close();
    public abstract void emit(Integer type, JSONObject content) throws ServiceException;
}
