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

#include <thread>
#include <mutex>
#include <map>
#include <stdio.h>
#include <codecvt>
#include <string>
#include <functional>

//curl
#include <curl/curl.h>

//asio
#define ASIO_STANDALONE
#include <asio.hpp>

//rapid json
#include <rapidjson.h>
#include <encodings.h>
#include <writer.h>
#include <stringbuffer.h>
#include <document.h>

#define MAX_MESSAGE_SIZE        1024
#define SERVER_NAME             "bg.game.msg"
#define ASYNC_SERVER_NAME       "sandbox.pod.land"
#define ASYNC_SERVER_PORT       "8002"

//services
#define PING                "user/ping"


static std::once_flag s_once_init;
static char           s_last_error_code[MAX_MESSAGE_SIZE];

namespace play
{
	namespace pod
	{
		static const char* get_last_error_code()
		{
			return s_last_error_code;
		}

		//convert c++ int to java int
		static int to_int(char pA, char pB, char pC, char pD)
		{
			return ((pA & 0xFF) << 24) | ((pB & 0xFF) << 16) | ((pC & 0xFF) << 8) | (pD & 0xFF);
		}

		struct config
		{
			//in app purchase url
			static const char* ssoiau;
			//use http for requests
			static bool harfs;
			//use encryption in requests
			static bool ure;
			//use tcp or websocket for connection
			static bool utc;
			//peer name
			static const char* ahrrn;
		};

		const char* config::ssoiau =
			"http://176.221.69.209:1036/pages/iap/buy/default.aspx";
		bool        config::harfs = false;
		//use encryption
		bool        config::ure = false;
		//use tcp or websocket connection
		bool        config::utc = true;
		//peer name
		const char*	config::ahrrn = "bp.gc.sandbox";

		struct url_data
		{
			const char* _uri;
		};

		struct request_urls
		{
			static url_data game_info;
		};

		url_data request_urls::game_info = url_data{ "/srv/game/get" };

		struct JSONObject
		{
			JSONObject()
			{
				//use rapid json to make json
				this->_writer = new rapidjson::Writer<rapidjson::StringBuffer>(this->_write_buffer);
			}

			//https://qiita.com/k2ymg/items/eef3b15eaa27a89353ab
			//typedef rapidjson::GenericDocument< rapidjson::UTF8<> > document_utf16;
			//typedef rapidjson::GenericValue< rapidjson::UTF8<> > value_utf16;
			//typedef rapidjson::GenericStringStream< rapidjson::UTF8<> > stringstream_utf16;
			//typedef rapidjson::GenericStringBuffer< rapidjson::UTF8<> > json_stringbuffer_utf16;

			int from_string(std::string& pJSONString)
			{
				using namespace rapidjson;
				//std::wstring_convert<std::codecvt_utf8<wchar_t>> _conv;
				//std::wstring _str = _conv.from_bytes(pJSONString);

				this->_json_string = pJSONString;
				auto _parser = &_document.Parse<rapidjson::kParseStopWhenDoneFlag>(pJSONString.c_str());
				if (_parser->HasParseError())
				{
					sprintf(s_last_error_code, "error on parsing json. error code: %d\n", _parser->GetParseError());
					return 1;
				}
				if (this->_writer)
				{
					delete this->_writer;
					this->_writer = nullptr;
				}
				this->_writer = new rapidjson::Writer<rapidjson::StringBuffer>(this->_write_buffer);
				_document.Accept(*this->_writer);
				return 0;
			}

			const std::string to_string()
			{
				if (this->_writer /*&& this->_writer->IsComplete()*/)
				{
					return this->_write_buffer.GetString();
				}
				return "";
			}

			int begin_write()
			{
				if (!this->_writer) return 1;
				return this->_writer->StartObject() ? 0 : 1;
			}

			int end_write()
			{
				if (!this->_writer) return 1;
				return this->_writer->EndObject() ? 0 : 1;
			}

			int add_key(const char* pKey)
			{
				if (!this->_writer) return 1;
				return this->_writer->Key(pKey) ? 0 : 1;
			}

			int add_string_value(const char* pValue)
			{
				if (!this->_writer) return 1;
				return this->_writer->String(pValue) ? 0 : 1;
			}

			int add_boolean_value(const bool& pValue)
			{
				if (!this->_writer) return 1;
				return this->_writer->Bool(pValue) ? 0 : 1;
			}

			int add_uint_value(const uint32_t& pValue)
			{
				if (!this->_writer) return 1;
				return this->_writer->Uint(pValue) ? 0 : 1;
			}

			int add_uint64_value(const uint64_t& pValue)
			{
				if (!this->_writer) return 1;
				return this->_writer->Uint64(pValue) ? 0 : 1;
			}

			int add_int64_value(const int64_t& pValue)
			{
				if (!this->_writer) return 1;
				return this->_writer->Int64(pValue) ? 0 : 1;
			}

			int add_double_value(const double& pValue)
			{
				if (!this->_writer) return 1;
				return this->_writer->Double(pValue) ? 0 : 1;
			}

			int add_raw_number_value(const char* pValues, const int& pLenght)
			{
				if (!this->_writer) return 1;
				return this->_writer->RawNumber(pValues, pLenght) ? 0 : 1;
			}

			int add_null()
			{
				if (!this->_writer) return 1;
				return this->_writer->Null() ? 0 : 1;
			}

			int begin_object()
			{
				if (!this->_writer) return 1;
				return this->_writer->StartObject() ? 0 : 1;
			}

			int end_object()
			{
				if (!this->_writer) return 1;
				return this->_writer->EndObject() ? 0 : 1;
			}

			int begin_array()
			{
				if (!this->_writer) return 1;
				return this->_writer->StartArray() ? 0 : 1;
			}

			int end_array()
			{
				if (!this->_writer) return 1;
				return this->_writer->EndArray() ? 0 : 1;
			}

			int get_is_null(const char* pKey)
			{
				if (_document.HasMember(pKey))
				{
					if (_document[pKey].IsNull())
					{
						return 0;
					}
				}
				return 1;
			}

			int get_is_false(const char* pKey)
			{
				if (_document.HasMember(pKey))
				{
					if (_document[pKey].IsFalse())
					{
						return 0;
					}
				}
				return 1;
			}

			int get_is_true(const char* pKey)
			{
				if (_document.HasMember(pKey))
				{
					if (_document[pKey].IsTrue())
					{
						return 0;
					}
				}
				return 1;
			}

			int get_is_bool(const char* pKey)
			{
				if (_document.HasMember(pKey))
				{
					if (_document[pKey].IsBool())
					{
						return 0;
					}
				}
				return 1;
			}

			int get_is_object(const char* pKey)
			{
				if (_document.HasMember(pKey))
				{
					if (_document[pKey].IsObject())
					{
						return 0;
					}
				}
				return 1;
			}

			int get_is_array(const char* pKey)
			{
				if (_document.HasMember(pKey))
				{
					if (_document[pKey].IsArray())
					{
						return 0;
					}
				}
				return 1;
			}

			int get_is_number(const char* pKey)
			{
				if (_document.HasMember(pKey))
				{
					if (_document[pKey].IsNumber())
					{
						return 0;
					}
				}
				return 1;
			}

			int get_value(const char* pKey, bool& pValue)
			{
				if (_document.HasMember(pKey))
				{
					if (_document[pKey].IsBool())
					{
						pValue = _document[pKey].GetBool();
						return 0;
					}
				}
				return 1;
			}

			int get_value(const char* pKey, int& pValue)
			{
				if (_document.HasMember(pKey))
				{
					if (_document[pKey].IsInt())
					{
						pValue = _document[pKey].GetInt();
						return 0;
					}
				}
				return 1;
			}

			int get_value(const char* pKey, uint32_t& pValue)
			{
				if (_document.HasMember(pKey))
				{
					if (_document[pKey].IsUint())
					{
						pValue = _document[pKey].GetUint();
						return 0;
					}
				}
				return 1;
			}

			int get_value(const char* pKey, int64_t& pValue)
			{
				if (_document.HasMember(pKey))
				{
					if (_document[pKey].IsInt64())
					{
						pValue = _document[pKey].GetInt64();
						return 0;
					}
				}
				return 1;
			}

			int get_value(const char* pKey, uint64_t& pValue)
			{
				if (_document.HasMember(pKey))
				{
					if (_document[pKey].IsUint64())
					{
						pValue = _document[pKey].GetUint64();
						return 0;
					}
				}
				return 1;
			}

			int get_value(const char* pKey, double& pValue)
			{
				if (_document.HasMember(pKey))
				{
					if (_document[pKey].IsDouble())
					{
						pValue = _document[pKey].GetDouble();
						return 0;
					}
				}
				return 1;
			}

			int get_value(const char* pKey, std::string& pValue)
			{
				if (_document.HasMember(pKey))
				{
					if (_document[pKey].IsString())
					{
						pValue = _document[pKey].GetString();
						return 0;
					}
				}
				return 1;
			}

			int get_value(const char* pKey, rapidjson::Value& pValue)
			{
				if (_document.HasMember(pKey))
				{
					if (_document[pKey].IsObject())
					{
						pValue = _document[pKey];
						return 0;
					}
				}
				return 1;
			}

			int release()
			{
				if (this->_is_released) return 1;

				this->_write_buffer.Clear();
				if (this->_writer)
				{
					delete this->_writer;
					this->_writer = nullptr;
				}
				this->_is_released = true;

				return 0;
			}

		private:
			bool                                            _is_released = false;
			rapidjson::Document                             _document;
			rapidjson::StringBuffer                         _write_buffer;
			rapidjson::Writer<rapidjson::StringBuffer>*     _writer = nullptr;
			std::string										_json_string;
		};

		struct Network
		{
			static const char* _peer_id;

			/*
				native socket
				websocket
				http
			 */

			 //send http request
			static int send_http_request(const char* pURL, std::string& pResult)
			{
				if (!_curl) return 1;

				curl_easy_setopt(_curl, CURLOPT_URL, pURL);
				curl_easy_setopt(_curl, CURLOPT_FOLLOWLOCATION, 1L);
				curl_easy_setopt(_curl, CURLOPT_WRITEFUNCTION, _curl_write_callback);
				curl_easy_setopt(_curl, CURLOPT_WRITEDATA, &pResult);
				//perform the request
				auto _result = curl_easy_perform(_curl);

				//check for errors
				if (_result != CURLE_OK)
				{
					sprintf(s_last_error_code, "curl_easy_perform() failed: %s\n", curl_easy_strerror(_result));
					return 1;
				}
				return 0;
			}

			static int initialize_device_register(asio::io_service& pIO)
			{
				if (initialize_curl()) return 1;

				//get config
				std::string _result;
				send_http_request(
					"http://176.221.69.209:1036/srv/serviceApi/getConfig",
					_result);

				JSONObject _json;
				_json.from_string(_result);
				//get following data for config
				_json.get_value("harfs", config::harfs);
				_json.get_value("ure", config::ure);
				_json.get_value("utc", config::utc);
				_json.release();

				if (!config::harfs)
				{
					//we don't need http request anymore
					destroy_curl();

					if (config::utc)
					{
						//we will use tcp for async
						if (initialize_tcp_socket(pIO) == 0)
						{
							char* _device_register_request = (char*)malloc(1024);

							sprintf(
								_device_register_request,
								"{\"appId\":\"GAME CENTER PC\",\"deviceId\":\"40d1448a-d0dd-41ba-f450-168c4c0bf98d\",\"renew\":true}\0");

							send_async(_device_register_request, strlen(_device_register_request), [](JSONObject& pJson)
							{
								int _type = -1;
								pJson.get_value("type", _type);

								if (_type != 2)
									return;

								std::string _content_str;
								pJson.get_value("content", _content_str);
								JSONObject _content_jo; 
								_peer_id = _content_str.c_str();

								char* _server_name_request = (char*)malloc(1024);

								sprintf(
									_server_name_request,
									"{\"type\":%d,"
									"\"content\":\"{\\\"name\\\":\\\"%s\\\"}\"}", 1, SERVER_NAME);

								send_async(_server_name_request, strlen(_server_name_request), [](JSONObject& pJson)
								{
									int _type = -1;
									pJson.get_value("type", _type);
								});
							});
						}
						else
						{
							return 1;
						}
					}
					else
					{
						//we will websocket for async
					}
				}

				return 0;
			}

			static int initialize_tcp_socket(asio::io_service& pIO)
			{
				using asio::ip::tcp;
				_socket = new tcp::socket(pIO);
				if (!_socket)
				{
					sprintf(s_last_error_code, "could not allocate memory for socket");
					return 1;
				}

				bool _is_socket_avaiable = true;
				try
				{
					tcp::resolver _resolver(pIO);
					tcp::resolver::query _query(ASYNC_SERVER_NAME, ASYNC_SERVER_PORT);
					tcp::resolver::iterator _iter = _resolver.resolve(_query);
					tcp::endpoint _endpoint = _iter->endpoint();
					_socket->connect(_endpoint);
				}
				catch (...)
				{
					_is_socket_avaiable = false;
					sprintf(s_last_error_code, "could connect to async server %s:%s", ASYNC_SERVER_NAME, ASYNC_SERVER_PORT);
				}

				if (!_is_socket_avaiable)
				{
					if (_socket)
					{
						delete(_socket);
						_socket = nullptr;
					}
					return 1;
				}

				return 0;
			}

			static void ping()
			{
				send_async("{}", 2, [](JSONObject& pJson) {});
			}

			//send async
			template<typename PLAYPOD_CALLBACK>
			static void send_async(
				char* pMessage,
				size_t pLenght,
				const PLAYPOD_CALLBACK& pCallBack)
			{
				if (!_socket) return;

				int _len = static_cast<int>(pLenght);
				//convert c++ int to java int structure
				char _msg_size[4];
				_msg_size[3] = (char)_len & 0xFF;
				_msg_size[2] = (char)((_len >> 8) & 0xFF);
				_msg_size[1] = (char)((_len >> 16) & 0xFF);
				_msg_size[0] = (char)((_len >> 24) & 0xFF);
				//write message lenght
				_socket->write_some(asio::buffer(_msg_size));

				_socket->async_write_some(
					asio::buffer(pMessage, pLenght),
					[&pCallBack](asio::error_code pError, std::size_t pLength)
				{
					if (pError) return;

					//TODO : read some async
					std::this_thread::sleep_for(std::chrono::milliseconds(5000));

					asio::error_code _err;
					char _buffer[MAX_MESSAGE_SIZE];
					auto _read_len = _socket->read_some(asio::buffer(_buffer), _err);
					if (_err)
					{
						sprintf(s_last_error_code, 
							"error on receiving data from socket. error code: %d, error message: %s\n", 
							_err.value(), _err.message());
						return;
					}
					auto _msg_len = to_int(
						_buffer[0],
						_buffer[1],
						_buffer[2],
						_buffer[3]);

					std::string _json_str;
					_json_str.resize(_msg_len);//the first 4 bytes are for lenght
					memcpy(&_json_str[0], &_buffer[4], _msg_len);

					JSONObject _json;
					//create json from string
					_json.from_string(_json_str);
					//clear resources
					_json_str.clear();

					//call callback
					pCallBack(_json);

					_json.release();
				});
			}

			static void destroy_curl()
			{
				if (_curl)
				{
					curl_easy_cleanup(_curl);
				}
			}

			static void destroy_tcp()
			{
				if (_socket)
				{
					_socket->close();
					_socket->release();
				}
			}

			static int release()
			{
				if (_is_released) return 1;

				destroy_curl();
				destroy_tcp();

				return 0;
			}

		private:
			//initialize http request
			static int initialize_curl()
			{
				_curl = curl_easy_init();
				if (!_curl) return 1;

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

			static bool                     _is_released;
			static std::thread*             _thread;
			static CURL*                    _curl;
			static asio::ip::tcp::socket*   _socket;
		};

		const char*				Network::_peer_id = nullptr;
		bool                    Network::_is_released = false;
		std::thread*            Network::_thread = nullptr;
		CURL*                   Network::_curl = nullptr;
		asio::ip::tcp::socket*  Network::_socket = nullptr;

		struct Services
		{
		public:
			static int initialize(asio::io_service& pIO)
			{
				int _result = 0;
				std::call_once(s_once_init, [&]()
				{
					_result = Network::initialize_device_register(pIO);
				});
				return _result;
			}

			template<typename PLAYPOD_CALLBACK>
			static void get_games_info(const PLAYPOD_CALLBACK& pCallBack)
			{
				char* _parameters = (char*)malloc(1024);
				if (!_parameters) return;

				sprintf(_parameters, "{}");

				request(request_urls::game_info, _parameters, pCallBack);
				free(_parameters);
			}

			/**
			 * \brief
			 * \tparam PLAYPOD_CALLBACK
			 * \param pUrlData
			 * \param pParamsData  Key Value Array
			 * \param pCallBack
			 */
			template<typename PLAYPOD_CALLBACK>
			static void request(
				const url_data& pUrlData,
				char* pParamsData,
				const PLAYPOD_CALLBACK& pCallBack)
			{
				async_request(pUrlData, pParamsData, pCallBack);
			}

			template<typename PLAYPOD_CALLBACK>
			static void async_request(
				const url_data& pUrlData,
				char* pParamsData,
				const PLAYPOD_CALLBACK& pCallBack)
			{
				char* _gc_param_data = (char*)malloc(1024);
				sprintf(_gc_param_data,
					"{\\\\\\\"remoteAddr\\\\\\\": null,"
					"\\\\\\\"clientMessageId\\\\\\\":\\\\\\\"%s\\\\\\\","
					"\\\\\\\"serverKey\\\\\\\": %d,"
					"\\\\\\\"oneTimeToken\\\\\\\": null,"
					"\\\\\\\"parameters\\\\\\\": %s,"
					"\\\\\\\"msgType\\\\\\\": %d,"
					"\\\\\\\"uri\\\\\\\": \\\\\\\"%s\\\\\\\","
					"\\\\\\\"messageId\\\\\\\": %d,"
					"\\\\\\\"expireTime\\\\\\\": %d}",
					"123e4567-e89b-12d3-a456-426655440000", 0, pParamsData, 3, pUrlData._uri, 1001, 0);

				char* _message_vo = (char*)malloc(1024);
				sprintf(_message_vo,
					"{\\\"content\\\": \\\"%s\\\","
					"\\\"messageId\\\":%d,"
					"\\\"priority\\\": \\\"%s\\\","
					"\\\"peerName\\\": \\\"%s\\\","
					"\\\"ttl\\\": %d}",
					_gc_param_data, 1001, "1", config::ahrrn, 0);

				char* _async_data = (char*)malloc(1024);
				sprintf(_async_data,
					"{\"content\": \"%s\","
					"\"trackerId\":%d,"
					"\"type\": %d}",
					_message_vo, 1001, 3);

				Network::send_async(_async_data, strlen(_async_data), pCallBack);
			}
		};
	}
}

#endif
