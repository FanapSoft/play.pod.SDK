package com.fanap.gameCenter.TIS.Database;

public interface DBCallback{
    void onCreate(Database database);
    void onUpgrade(Database database);
    void onOpen(Database database);
}
