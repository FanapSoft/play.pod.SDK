package com.fanap.gameCenter.TIS.Database;

import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

import com.fanap.gameCenter.TIS.Base.RequestCallback;
import com.fanap.gameCenter.TIS.Service;
import com.fanap.gameCenter.TIS.Share.Logger;
import com.fanap.gameCenter.TIS.Share.ServiceException;

import com.fanap.gameCenter.TIS.Share.Util;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;


public class Database {
//public class Database extends SQLiteOpenHelper {
    static Logger log = Logger.getLogger(Database.class);
    private SQLiteDatabase db;
    private DBCallback dbCallback;
    private Database self;

    public Database(JSONObject params, final DBCallback callback) throws ServiceException {
//        super((Context)params.get("context"),params.getString("name"),null,params.getInt("version"));
//        dbCallback = callback;
        try {
            Context context = (Context) params.get("context");
            String name = params.getString("name");
            int version = params.getInt("version");
            self = this;
            SQLiteOpenHelper sqLiteOpenHelper = new SQLiteOpenHelper(context, name, null, version) {
                @Override
                public void onCreate(SQLiteDatabase sqLiteDatabase) {
                    db = sqLiteDatabase;
                    callback.onCreate(self);
                }

                @Override
                public void onUpgrade(SQLiteDatabase sqLiteDatabase, int i, int i1) {
                    log.info("database_onUpgrade");
                    db = sqLiteDatabase;
                    callback.onUpgrade(self);
                }

                @Override
                public void onOpen(SQLiteDatabase sqLiteDatabase) {
                    log.info("database_onOpen " + sqLiteDatabase.getVersion());
                    db = sqLiteDatabase;
                    callback.onOpen(self);
                }
            };
            // onCreate call if this method call
            sqLiteOpenHelper.getReadableDatabase();

        }catch (JSONException e) {
            log.info("Database_Exception " + e.getMessage());
            throw new ServiceException(e);
        }
        log.info("database_INIT");
    }

    public void execSQL (String sql) throws ServiceException {
        try {
            db.execSQL(sql);
        } catch (Exception e) {
            e.printStackTrace();
            throw new ServiceException(e);
        }

    }

    public Cursor rawQuery(String sql,String[] selectionArgs ) {
        return db.rawQuery(sql,selectionArgs);
    }


    public void createTable(JSONObject params, RequestCallback callback) throws ServiceException {
        try {

            String tableName = params.getString("name");
            String sqlStr = "CREATE TABLE "+tableName;
            if (params.has("attr") && !params.isNull("attr")) {
                sqlStr += "(";
                JSONArray attrs = params.getJSONArray("attr");
                for (int i = 0; i < attrs.length(); i++) {
                    JSONObject attr = attrs.getJSONObject(i);
                    String attrName = attr.getString("name");
                    String attrType = attr.getString("type");

                    sqlStr += attrName + " ";
                    sqlStr += attrType + "";
                    if (attr.has("primaryKey") && !params.isNull("primaryKey") && params.getBoolean("PRIMARY KEY")) {
                        sqlStr += "PRIMARY KEY ";
                    }
                    if (i < attrs.length() - 1) {
                        sqlStr += ",";
                    }
                }

                sqlStr += ")";
            }
            self.execSQL(sqlStr);
            callback.onResult(Util.createReturnData(false, null, null, new JSONObject()));

        } catch (Exception e) {
            throw new ServiceException(e);
        }
    }

    public void find(JSONObject params,RequestCallback callback) throws ServiceException {
        try {
            String tableName = params.getString("tableName");
            String sqlStr = "SELECT * FROM "+tableName;

            if (params.has("where") && !params.isNull("where")) {
                JSONObject where = params.getJSONObject("where");
                JSONArray keys = where.names();
                if (keys != null && keys.length() > 0) {
                    String key = keys.getString(0);
                    sqlStr += " WHERE ";
                    sqlStr += (key + "=\"" + where.get(key) + "\"");
                }
            }
            Cursor cursor = self.rawQuery(sqlStr, null);

            JSONArray result = new JSONArray();
            cursor.moveToFirst();
            while (!cursor.isAfterLast()) {
                String[] columnNames = cursor.getColumnNames();
                JSONObject data = new JSONObject();
                for (int i = 0; i < columnNames.length; i++) {
                    String columnName = columnNames[i];
                    data.put(columnName, cursor.getString(cursor.getColumnIndex(columnName)));
                }
                result.put(data);
                cursor.moveToNext();
            }
            callback.onResult(Util.createReturnData(false, null, null, result));
        } catch (Exception e) {
            throw new ServiceException(e);
        }
    }

    public void insert(JSONObject params,RequestCallback callback) throws ServiceException {
        try {
            String tableName = params.getString("tableName");
            String sqlStr = "INSERT OR REPLACE INTO "+tableName;

            if (params.has("data") && !params.isNull("data")) {
                JSONObject data = params.getJSONObject("data");
                JSONArray keys = data.names();
                if (keys != null && keys.length() > 0) {

                    String valuesStr = "(";
                    String keysStr = "(";
                    for (int i = 0; i < keys.length(); i++) {
                        String key = keys.getString(i);
                        valuesStr += (data.get(key));
                        keysStr += key;

                        if (i < keys.length()-1) {
                            valuesStr += ",";
                            keysStr += ",";
                        }
                    }

                    valuesStr += ")";
                    keysStr += ")";

                    sqlStr += (keysStr + " VALUES " + valuesStr + ";");
                } else {
                    throw new ServiceException("data dos not any key and value");
                }
            } else {
                throw new ServiceException("data key is not defined in params");
            }
            self.execSQL(sqlStr);
            if (callback != null) {
                callback.onResult(Util.createReturnData(false, null, null, new JSONObject()));
            }

        } catch (Exception e) {
            throw new ServiceException(e);
        }
    }

}

