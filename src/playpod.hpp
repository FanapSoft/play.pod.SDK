/*
	Project			 : play.pod.SDK. Copyright(c) play.pod.land (https://play.pod.land). All rights reserved.
	Source			 : Please direct any bug to https://github.com/FanapSoft/play.pod.SDK/issues
	Name			 : main.cpp
	Description		 : This sample shows how to use play pod services
*/

#ifndef __PLAYPOD_H__
#define __PLAYPOD_H__

#if defined(_MSC_VER) && (_MSC_VER >= 1200)
# pragma once
#endif // defined(_MSC_VER) && (_MSC_VER >= 1200)

#include <mutex>
#include <stdio.h>
#include <curl/curl.h>

#define ASIO_STANDALONE
#include <asio.hpp>

//rapid json
#include <rapidjson.h>
#include <encodings.h>
#include <writer.h>
#include <stringbuffer.h>
#include <document.h>

#define SERVER_NAME "bg.game.msg"

static std::once_flag s_once_init;
static char           s_last_error_code[1024];

namespace play
{
    namespace pod
    {
        const char* get_last_error_code()
        {
            return s_last_error_code;
        }
        
        struct config
        {
            
        };
        
        struct JSONObject
        {
            //const wchar_t* getKey(_In_ const char* pKey);
            //void getKeys(_Inout_ std::vector<char*> pValue);
        
        };
        
        struct Network
        {
            /*
                native socket
                websocket
                http
             */
            
            //send http request
            static int send_http_request(const char* pURL)
            {
                if(!_curl) return 1;
                
                std::string _result_buffer;
                curl_easy_setopt(_curl, CURLOPT_URL, pURL);
                curl_easy_setopt(_curl, CURLOPT_FOLLOWLOCATION, 1L);
                curl_easy_setopt(_curl, CURLOPT_WRITEFUNCTION, _curl_write_callback);
                curl_easy_setopt(_curl, CURLOPT_WRITEDATA, &_result_buffer);
                //perform the request
                auto _result = curl_easy_perform(_curl);
                
                //check for errors
                if(_result != CURLE_OK)
                {
                    sprintf(s_last_error_code, "curl_easy_perform() failed: %s\n", curl_easy_strerror(_result));
                    return 1;
                }
                return 0;
            }
            
            static int initialize()
            {
                if(init_http_request()) return 1;
                
                send_http_request("http://185.37.55.3:8081/srv/user/activatePeer/");
                
                return 0;
            }
            
            //send async
            static void send(std::function<JSONObject> pCallBack);

            static int release()
            {
                if(_is_released) return 1;
                if(_curl)
                {
                    curl_easy_cleanup(_curl);
                }
                
                return 0;
            }
            
        private:
            static int init_http_request()
            {
                _curl = curl_easy_init();
                if(!_curl) return 1;

                return 0;
            }
            static size_t _curl_write_callback(
                                               void* pContents,
                                               size_t pSize,
                                               size_t pNmemb,
                                               void* pUserp)
            {
                ((std::string*)pUserp)->append((char*)pContents, pSize * pNmemb);
                return pSize * pNmemb;
            }
            
            static CURL*           _curl;
            static bool            _is_released;
        };
        CURL*           Network::_curl = nullptr;
        bool            Network::_is_released = false;
        
        struct services
        {
        public:
            static int initialize()
            {
                int _result = 0;
//                std::call_once([]()
//                               {
//
//
//                               });
                
                
                return _result;
            }
//            static void getGamesInfo(_In_ JSONObject& pJSONObject,
//                                     _Inout_ std::function<JSONObject>& pCallBack,
//                                     _Out_ std::string& pErrorCode)
//            {
//
//                auto _game_ids = pJSONObject.getKey("gamesId");
//                auto _name = pJSONObject.getKey("name");
//                auto _lobby_id = pJSONObject.getKey("lobbyId");
//                auto _game_id = pJSONObject.getKey("gameId");
//                //auto _name = pJSONObject.getKey("name");
//
//
//                using namespace rapidjson;
//                StringBuffer _string_buffer;
//                Writer<StringBuffer, Document::EncodingType, AutoUTF<>> _json_writer(_string_buffer);
//                _json_writer.StartObject();
//                {
//                    if(_game_id)
//                    {
//                        _json_writer.Key("");
//                        _json_writer.String(_game_id);
//                    }
//                    _writer.Key("male");
//                    _writer.Bool(true);
//                    _writer.Key("age");
//                    _writer.Uint(31);
//                    _writer.Key("friends");
//                    _writer.StartArray();
//                    _writer.String("ray");
//                    _writer.String("rayan");
//                    _writer.String("sib");
//                    _writer.String("barf");
//                    _writer.EndArray();
//                    _writer.Key("NULL");
//                    _writer.Null();
//                }
//
//
//                    if (name != null) {
//                        requestData.put("filter", name);
//                    }
//
//                    if (lobbyId != null) {
//                        requestData.put("lobbyId", lobbyId);
//                    }
//
//                    final Integer size = (params.has("size") && !params.isNull("size")) ? params.getInt("size") : 5;
//                    final Integer offset = (params.has("offset") && !params.isNull("offset")) ? params.getInt("offset") : 0;
//                    requestData.put("size", size);
//                    requestData.put("offset", offset);
//
//                    Integer imageWidth = null;
//                    Integer imageHeight = null;
//
//                    if (params.has("setting") && !params.isNull("setting")) {
//                        JSONObject setting = params.getJSONObject("setting");
//                        if (setting != null) {
//                            if (setting.has("imageWidth")) {
//                                imageWidth = setting.getInt("imageWidth");
//                            }
//
//                            if (setting.has("imageHeight")) {
//                                imageHeight = setting.getInt("imageHeight");
//                            }
//                        }
//                    }
//
//                    final Integer finalImageHeight = imageHeight;
//                    final Integer finalImageWidth = imageWidth;
//                    request(RequestUrls.GAME_INFO, requestData, new Network.HttpRequestCallback() {
//                        @Override
//                        public void onResult(JSONObject result){
//                            JSONObject returnData = new JSONObject();
//                            try {
//                                boolean hasError = result.getBoolean("HasError");
//                                returnData.put("hasError", hasError);
//                                returnData.put("errorMessage", result.getString("ErrorMessage"));
//                                returnData.put("errorCode", result.getInt("ErrorCode"));
//
//                                if (!hasError) {
//                                    JSONObject retResult = new JSONObject();
//                                    JSONArray games = new JSONArray();
//                                    if (result.has("Result") && !result.isNull("Result")) {
//                                        JSONArray allInfo = result.getJSONArray("Result");
//                                        if (allInfo != null) {
//                                            for (int i = 0; i < allInfo.length(); i++) {
//                                                JSONObject info = allInfo.getJSONObject(i);
//                                                games.put(reformatGameObject(info, finalImageWidth, finalImageHeight));
//                                            }
//                                        }
//                                    }
//                                    retResult.put("games", games);
//                                    retResult.put("hasNext", size == games.length());
//                                    retResult.put("nextOffset", offset + games.length());
//                                    retResult.put("count", result.get("Count"));
//                                    returnData.put("result", retResult);
//                                }
//
//
//                            } catch (JSONException e) {
//                                returnData = ExceptionErrorData(e);
//                            }
//                            callback.onResult(returnData);
//                        }
//                    });
//
//                } catch (JSONException e) {
//                    throw new ServiceException(e);
//                }
            
                
                
            //}
            //std::function<JSONObject> ready;
        //private:
            
        };
    }
}

static int to_int(char pA, char pB, char pC, char pD)
{
    return ((pA & 0xFF) << 24) | ((pB & 0xFF) << 16) | ((pC & 0xFF) << 8) | (pD & 0xFF);
}

//WOLF_MAIN()
//{
//    play::pod::services::initialize();
//    
//    w_logger_config _log_config;
//    _log_config.app_name = L"24_asio";
//    _log_config.log_path = wolf::system::io::get_current_directoryW();
//#ifdef __WIN32
//    _log_config.log_to_std_out = false;
//#else
//    _log_config.log_to_std_out = true;
//#endif
//    //initialize logger, and log in to the output debug window of visual studio(just for windows) and Log folder inside running directory
//    logger.initialize(_log_config);
//    
//    //log to output file
//    logger.write("Wolf initialized");
//    
//    using asio::ip::tcp;
//    asio::io_service _io;
//    tcp::socket _socket(_io);
//    bool _is_socket_avaiable = true;
//    try
//    {
//        asio::ip::tcp::resolver _resolver(_io);
//        asio::ip::tcp::resolver::query _query("sandbox.pod.land", "8002");
//        asio::ip::tcp::resolver::iterator _iter = _resolver.resolve(_query);
//        asio::ip::tcp::endpoint _endpoint = _iter->endpoint();
//        _socket.connect(_endpoint);
//    }
//    catch(...)
//    {
//        _is_socket_avaiable = false;
//        logger.error("could not connect");
//    }
//    
//    char _buffer[4096];
//    std::string _msg = "{\"appId\":5556,\"deviceId\":\"40d14e87-d0dd-41ba-f450-168c4c0bf98d\",\"renew\":true}";
//    //std::string _msg = "{}";
//    int _size = static_cast<int>(_msg.size());
//    char _msg_size[4];
//    _msg_size[3] = (char)_size & 0xFF;
//    _msg_size[2] = (char)((_size >> 8) & 0xFF);
//    _msg_size[1] = (char)((_size >> 16) & 0xFF);
//    _msg_size[0] = (char)((_size >> 24) & 0xFF);
//    if (_is_socket_avaiable)
//    {
//        for (;;)
//        {
//            asio::error_code _err;
//            size_t _len = _socket.write_some(asio::buffer(_msg_size));
//            _len = _socket.write_some(asio::buffer(_msg));
//            _len = _socket.read_some(asio::buffer(_buffer), _err);
//            
//            std::string _out;
//            for (auto i = 4; i < _len; ++i)
//            {
//                _out += _buffer[i];
//            }
//           // logger.write("{}", _out);
//            
//            _len = to_int(_buffer[0], _buffer[1], _buffer[2], _buffer[3]);
//            auto _size = _out.size();
//            //logger.write("ack {}", _len == _size ? "Y" : "N");
//            if (_err)
//            {
//                if(_err ==  asio::error::eof)
//                {
//                    break;
//                }
//                else
//                {
//                    //logger.error("unexpected error");
//                }
//            }
//            else
//            {
//                //logger.write("{}", _buffer);
//            }
//        }
//    }
//    
//    _socket.close();
//    _socket.release();
//    _io.stop();
//    
//    return EXIT_SUCCESS;
//}


#endif
