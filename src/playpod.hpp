/*
	Project			 : play.pod.SDK. Copyright(c) play.pod.land (https://play.pod.land). All rights reserved.
	Source			 : Please direct any bug to https://github.com/FanapSoft/play.pod.SDK/issues
	Name			 : playpod.hpp
	Description		 : declaration of PlayPod services
*/

#ifndef __PLAYPOD_H__
#define __PLAYPOD_H__

#if defined(_MSC_VER) && (_MSC_VER >= 1200)
# pragma once
#endif // defined(_MSC_VER) && (_MSC_VER >= 1200)

#include <w_url.h>
#include <mutex>
#include <condition_variable>
#include <stdio.h>
#include <codecvt>
#include <string>
#include <list>
#include <functional>

//asio
#define ASIO_STANDALONE
#include <asio.hpp>

//rapid json
#include <rapidjson/rapidjson.h>
#include <rapidjson/writer.h>
#include <rapidjson/stringbuffer.h>
#include <rapidjson/document.h>

#define APP_ID					"GAME_CENTER_PC"
#define SERVER_IP				"176.221.69.209:1036"
#define SERVER_NAME             "bg.game.msg"
#define MAX_MESSAGE_SIZE        2048
#define ASYNC_SERVER_NAME       "sandbox.pod.land"
#define ASYNC_SERVER_PORT       "8002"
#define HTTP_PORT				"8003"

//services
#define PING							"user/ping"

#define URL_GAME_INFO					"/srv/game/get"
#define URL_GET_LOBBIES					"/srv/lobby/get"
#define URL_GET_TOP_GAME				"/srv/game/top"
#define URL_GET_LOBBY_GAMES				"/srv/game/getbylobby"
#define URL_GET_GALLERY					"/srv/product/gallery"
#define URL_GET_RELATED_GAME			"/srv/game/related"
#define URL_GET_TOP_PLAYERS				"/srv/user/gettopplayers"
#define URL_REQUEST_STREAM_MATCH_ID		"/srv/stream/addmatch"
#define URL_DEFAULT_LEAUGE_SUBSCRIBE	"/srv/league/enrollDefault"
#define URL_FOLLOW_GAME					"/srv/game/follow"
#define URL_GAME_RATE					"/srv/game/rate"
#define URL_LOGOUT						"/srv/user/logout"
#define URL_GET_NEWS					"/srv/news/get"
#define URL_GET_GAME_FOLLOWNING			"/srv/game/following"
#define URL_GET_USER_PROFILE			"/srv/user/getProfile"
#define URL_FOLLOW_POST					"/srv/user/follow"
#define URL_LIKE_POST					"/srv/user/like"

static std::once_flag s_once_init;
static char           s_last_error_code[MAX_MESSAGE_SIZE];

namespace playpod
{
	namespace sdk
	{
		extern std::function<void(void)> on_services_ready_callback;

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
			//business id
			static int business_id;
		};

		struct JSONObject
		{
			JSONObject()
			{
				//use rapid json to make json
				this->_writer = new rapidjson::Writer<rapidjson::StringBuffer>(this->_write_buffer);
			}

			int from_object(const rapidjson::Value& pValue)
			{
				_document.CopyFrom(pValue, _document.GetAllocator());
				return 0;
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
				//reset last error code
				std::memset(s_last_error_code, '\0', MAX_MESSAGE_SIZE);
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
				if (!this->_writer) return -1;
				return this->_writer->StartArray() ? 0 : 1;
			}

			int end_array()
			{
				if (!this->_writer) return -1;
				return this->_writer->EndArray() ? 0 : 1;
			}

			int get_is_null(const char* pKey)
			{
				if (_document.HasMember(pKey))
				{
					if (_document[pKey].IsNull())
					{
						return true;
					}
				}
				return false;
			}

			bool get_is_false(const char* pKey)
			{
				if (_document.HasMember(pKey))
				{
					if (_document[pKey].IsFalse())
					{
						return true;
					}
				}
				return false;
			}

			bool get_is_true(const char* pKey)
			{
				if (_document.HasMember(pKey))
				{
					if (_document[pKey].IsTrue())
					{
						return true;
					}
				}
				return false;
			}

			bool get_is_bool(const char* pKey)
			{
				if (_document.HasMember(pKey))
				{
					if (_document[pKey].IsBool())
					{
						return true;
					}
				}
				return false;
			}

			bool get_is_object(const char* pKey)
			{
				if (_document.HasMember(pKey))
				{
					if (_document[pKey].IsObject())
					{
						return true;
					}
				}
				return false;
			}

			bool get_is_array(const char* pKey)
			{
				if (_document.HasMember(pKey))
				{
					if (_document[pKey].IsArray())
					{
						return true;
					}
				}
				return false;
			}

			bool get_is_number(const char* pKey)
			{
				if (_document.HasMember(pKey))
				{
					if (_document[pKey].IsNumber())
					{
						return true;
					}
				}
				return false;
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

			int get_object(const char* pKey, JSONObject& pJsonObject)
			{
				if (_document.HasMember(pKey))
				{
					pJsonObject.from_object(_document[pKey]);
					return 0;
				}

				return 1;
			}

			int get_array_value(const unsigned int& pIndex, JSONObject& pJsonObject)
			{
				if (_document.IsArray())
				{
					const auto _size = _document.End() - _document.Begin();
					if (pIndex < _size)
					{
						pJsonObject.from_object(_document[pIndex]);
						return 0;
					}
				}

				return 1;
			}

			int get_array_size()
			{
				if (!_document.IsArray())
					return 0;
				return _document.End() - _document.Begin();
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
		};

		struct Network
		{
			/*
				native socket
				websocket
				http
			 */

			static W_RESULT initialize_device_register(asio::io_service& pIO)
			{
				_is_ready = false;

				_url = new (std::nothrow) wolf::system::w_url();
				if (!_url) return W_FAILED;

				//get config
				std::string _result;
				if (_url->request_url(
					("http://" + std::string(SERVER_IP) + "/srv/serviceApi/getConfig").c_str(),
					_result) == W_FAILED)
				{
					return W_FAILED;
				}

				if (!_result.empty())
				{
					JSONObject _json;
					_json.from_string(_result);
					//get following data for config
					_json.get_value("harfs", config::harfs);
					_json.get_value("ure", config::ure);
					_json.get_value("utc", config::utc);
					_json.release();


					//TODO: hack
					//force to use http
					config::harfs = true;

					//reset last error code
					std::memset(s_last_error_code, '\0', MAX_MESSAGE_SIZE);

					if (config::harfs)
					{
						_result.clear();
						std::string _http_request = ("http://" + std::string(ASYNC_SERVER_NAME) + ":" + HTTP_PORT +
							"/register/?action=register&deviceId=" + "40d1448b-d0dd-41ba-f450-168c4c0bf98d" + "&appId=" + APP_ID);

						if (_url->request_url(_http_request.c_str(), _result) == W_FAILED)
						{
							return W_FAILED;
						}

						if (!_result.empty())
						{
							bool _success = false;
							std::string _content_value;
							JSONObject _json;
							if (_json.from_string(_result))
							{
								sprintf(s_last_error_code, "could not register device via http request: %s", _http_request);
								return W_FAILED;
							}

							_json.get_value("success", _success);
							if (_success)
							{
								_json.get_value("content", _content_value);
								if (!_content_value.empty())
								{
									JSONObject _content_json;
									_content_json.from_string(_content_value);
									_content_json.get_value("token", _peer_id);
									_content_value.clear();

									_is_ready = true;
									if (on_services_ready_callback)
									{
										on_services_ready_callback();
									}
								}
							}
							_result.clear();
						}
					}
					else
					{
						W_RESULT _hr = W_PASSED;

						//we don't need http request anymore
						destroy_url();

						char* _device_register_request = (char*)malloc(MAX_MESSAGE_SIZE);
						sprintf(
							_device_register_request,
							"{\"appId\":\"GAME CENTER PC\",\"deviceId\":\"40d1448a-d0dd-41ba-f450-168c4c0bf98d\",\"renew\":true}\0");

						if (config::utc)
						{
							//we will use tcp for async
							if (initialize_tcp_socket(pIO))
							{
								//some problem was happended
								_hr = W_FAILED;
							}
							else
							{
								send_async(_device_register_request, strlen(_device_register_request),
									[](JSONObject& pJson)
								{
									int _type = -1;
									pJson.get_value("type", _type);

									if (_type != 2)
									{
										sprintf(s_last_error_code, "could not register device to server %s", SERVER_IP);
										return;
									}

									std::string _content_str;
									pJson.get_value("content", _content_str);
									JSONObject _content_jo;
									if (_content_jo.from_string(_content_str))
									{
										sprintf(s_last_error_code, "could not parse content type %s", SERVER_IP);
										return;
									}
									_content_jo.get_value("token", _peer_id);

									char* _server_name_request = (char*)malloc(MAX_MESSAGE_SIZE);
									sprintf(
										_server_name_request,
										"{\"type\":%d,"
										"\"content\":\"{\\\"name\\\":\\\"%s\\\"}\"}", 1, SERVER_NAME);

									send_async(_server_name_request, strlen(_server_name_request),
										[](JSONObject& pJson)
									{
										int _type = -1;
										pJson.get_value("type", _type);
										if (_type == 1)
										{
											_is_ready = true;
											if (on_services_ready_callback)
											{
												on_services_ready_callback();
											}
										}
									});

									free(_server_name_request);

								});
							}
						}
						else
						{
							//we will use web socket for async
						}
						//free allocated memory
						free(_device_register_request);

						return _hr;
					}
				}

				return W_PASSED;
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

			static size_t avaiable_tcp_bytes()
			{
				asio::socket_base::bytes_readable _socket_readabale_bytes(true);
				size_t _avaiable_bytes = 0;
				int _time_out = 2000;
				while (!_avaiable_bytes && _time_out > 0)
				{
					std::this_thread::sleep_for(std::chrono::milliseconds(10));
					_socket->io_control(_socket_readabale_bytes);
					_avaiable_bytes = _socket_readabale_bytes.get();
					_time_out--;
				}
				return _avaiable_bytes;
			}

			//read async
			template<typename PLAYPOD_CALLBACK>
			static void read_async_tcp(const size_t pSizeInBytes, const PLAYPOD_CALLBACK& pCallBack)
			{
				if (!_socket) return;

				//reset last error code
				std::memset(s_last_error_code, '\0', MAX_MESSAGE_SIZE);

				auto _rcv_buffer = (char*)malloc(pSizeInBytes);
				_socket->async_read_some(asio::buffer(_rcv_buffer, pSizeInBytes),
					[_rcv_buffer, &pCallBack](asio::error_code pError, std::size_t pLength)
				{
					if (pError)
					{
						sprintf(s_last_error_code,
							"error on receiving data from socket. error code: %d, error message: %s\n",
							pError.value(), pError.message());
						return;
					}

					std::string _json_str;
					_json_str.resize(pLength);
					memcpy(&_json_str[0], &_rcv_buffer[0], pLength);
					if (!_json_str.empty())
					{
						JSONObject _json;
						//create json from string
						if (_json.from_string(_json_str))
						{
							sprintf(s_last_error_code,
								"error on parsing json.");
						}
						else
						{
							//call callback
							pCallBack(_json);
						}

						//clear resources
						_json_str.clear();
						_json.release();
					}
					free(_rcv_buffer);
				});
			}

			//send async with tcp
			template<typename PLAYPOD_CALLBACK>
			static void send_async_tcp(
				const char* pMessage,
				size_t pLenght,
				const PLAYPOD_CALLBACK& pCallBack)
			{
				if (!_socket) return;

				//reset last error code
				std::memset(s_last_error_code, '\0', MAX_MESSAGE_SIZE);

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
					if (pError)
					{
						sprintf(s_last_error_code,
							"error on writing data to socket. error code: %d, error message: %s\n",
							pError.value(), pError.message());
						return;
					}

					char _lenght_buffer[4];
					auto _bytes = avaiable_tcp_bytes();
					if (_bytes)
					{
						//read lenght
						auto _len = _socket->read_some(asio::buffer(_lenght_buffer, 4), pError);
						if ((_len != 4) || pError)
						{
							sprintf(s_last_error_code,
								"error on reading lenght of data. error code: %d, error message: %s\n",
								pError.value(), pError.message());
						}
						else
						{
							auto _msg_len = to_int(
								_lenght_buffer[0],
								_lenght_buffer[1],
								_lenght_buffer[2],
								_lenght_buffer[3]);

							//read message
							_bytes = avaiable_tcp_bytes();
							if (_bytes == _msg_len)
							{
								read_async_tcp(_bytes, pCallBack);
							}
							else
							{
								sprintf(s_last_error_code,
									"lenght of message is not equal to lenght of read bytes");
							}
						}
					}
					else
					{
						sprintf(s_last_error_code,
							"read time out");
					}
				});
			}

			//send async
			template<typename PLAYPOD_CALLBACK>
			static void send_async(
				const char* pMessage,
				size_t pLenght,
				const PLAYPOD_CALLBACK& pCallBack)
			{
				if (config::harfs)
				{
					//reset last error code
					std::memset(s_last_error_code, '\0', MAX_MESSAGE_SIZE);

					//send using http rest post
					std::string _result;

					const std::string _post_url = ("http://" + std::string(ASYNC_SERVER_NAME) + ":" + HTTP_PORT + "/srv/");
					const std::string _msg = "data=" + std::string(pMessage) + std::string("&peerId=") + std::to_string(Network::_peer_id);
					auto _hr = _url->send_rest_post(_post_url.c_str(), _msg.c_str(), _msg.size(), _result);
					if (_hr == W_PASSED && !_result.empty())
					{
						JSONObject _json;
						//create json from string
						if (_json.from_string(_result))
						{
							sprintf(s_last_error_code,
								"error on parsing json.");
						}
						else
						{
							//call callback
							pCallBack(_json);
						}

						//clear resources
						_json.release();
					}
					else
					{
						sprintf(s_last_error_code,
							"request %s with following params %s failed", _post_url, _msg);
					}
				}
				else
				{
					if (config::utc)
					{
						//send data using native tcp
						send_async_tcp(pMessage, pLenght, pCallBack);
					}
					else
					{
						//send data using web socket
					}
				}
			}

			static W_RESULT request_url(const char* pURL, std::string& pResult)
			{
				return _url ? _url->request_url(pURL, pResult) : W_FAILED;
			}

			static void ping()
			{
				if (!is_ready()) return;

				send_async("{}", 2, [](JSONObject& pJson) {});
			}

			static void destroy_url()
			{
				SAFE_RELEASE(_url);
			}

			static void destroy_tcp()
			{
				if (_socket)
				{
					_socket->close();
					//_socket->release();
				}
			}

			static W_RESULT release()
			{
				wolf::logger.error("Release Network");
				if (_is_released) return W_PASSED;

				destroy_url();
				destroy_tcp();

				return W_PASSED;
			}

			static bool is_ready()
			{
				return _is_ready;
			}


			static std::string	_image;
			static int			_customer_id;
			static std::string	_name;
			static int			_user_id;
			static std::string	_token;
			static std::string	_profile_image;
			static uint64_t		_peer_id;

		private:
			static bool										_is_released;
			static std::thread*								_thread;
			static wolf::system::w_url*						_url;
			static asio::ip::tcp::socket*					_socket;
			static bool										_is_ready;
		};

		struct Services
		{
		public:
			static W_RESULT initialize(asio::io_service& pIO)
			{
				W_RESULT _result = W_PASSED;
				std::call_once(s_once_init, [&]()
				{
					_result = Network::initialize_device_register(pIO);
				});
				return _result;
			}
			static W_RESULT release()
			{
				return Network::release();
			}

			static std::string get_param_str(
				_In_z_ const char* pKey,
				_In_ const char* pValue)
			{
				const auto _type = static_cast<char*>(malloc(1024));
				sprintf(_type, R"({ \\\"name\\\" : \\\"%s\\\", \\\"value\\\" : %s})", pKey, pValue);
				const auto _ret = std::string(_type);
				free(_type);
				return _ret;
			}

			static void add_object_to_params(
				_In_z_	const char* pKey,
				_In_	const char* pValue,
				_In_z_	std::string& pParameters,
				_In_	bool& pHasPrev)
			{
				if (pHasPrev)
					pParameters += ",";

				pParameters += get_param_str(pKey, pValue);

				pHasPrev = true;
			}

			template<typename PLAYPOD_CALLBACK>
			static void get_stream_games_info(const PLAYPOD_CALLBACK& pCallBack, const int& pOffset = -1, const int& pSize = -1)
			{
				std::string _parameters = "[";

				auto _has_prev = false;

				add_object_to_params("infrustructure", std::to_string(2).c_str(), _parameters, _has_prev);

				if (pSize >= 0)
					add_object_to_params("size", std::to_string(pSize).c_str(), _parameters, _has_prev);

				if (pOffset >= 0)
					add_object_to_params("offset", std::to_string(pOffset).c_str(), _parameters, _has_prev);

				_parameters += "]";

				async_request(URL_GAME_INFO, _parameters.c_str(), pCallBack);
			}

			template<typename PLAYPOD_CALLBACK>
			static void get_top_games_info(const PLAYPOD_CALLBACK& pCallBack, const int& pType = -1, const int& pOffset = -1, const int& pSize = -1)
			{
				std::string _parameters = "[";

				auto _has_prev = false;

				if (pType >= 0)
					add_object_to_params("type", std::to_string(pType).c_str(), _parameters, _has_prev);

				if (pSize >= 0)
					add_object_to_params("size", std::to_string(pSize).c_str(), _parameters, _has_prev);

				if (pOffset >= 0)
					add_object_to_params("offset", std::to_string(pOffset).c_str(), _parameters, _has_prev);

				_parameters += "]";

				async_request(URL_GET_TOP_GAME, _parameters.c_str(), pCallBack);
			}

			template<typename PLAYPOD_CALLBACK>
			static void get_lobby(const PLAYPOD_CALLBACK& pCallBack)
			{
				//char* _parameters = (char*)malloc(1024);
				//if (!_parameters) return;

				//sprintf(_parameters, "[]");

				async_request(URL_GET_LOBBIES, "[]", pCallBack);
				//free(_parameters);
			}

			template<typename PLAYPOD_CALLBACK>
			static void get_lobbies_games(const PLAYPOD_CALLBACK& pCallBack, const int* pLobbyIds, const int& pLobbyIdsSize, const int& pOffset = -1, const int& pSize = -1)
			{
				if (pLobbyIdsSize <= 0 || pLobbyIds == nullptr)
					return;

				std::string _parameters = "[";

				auto _has_prev = false;

				if (pOffset >= 0)
					add_object_to_params("offset", std::to_string(pOffset).c_str(), _parameters, _has_prev);

				if (pSize >= 0)
					add_object_to_params("size", std::to_string(pSize).c_str(), _parameters, _has_prev);

				for (auto i = 0; i < pLobbyIdsSize; i++)
				{
					std::string _lobby_id_string = "\\\\\\\"" + std::to_string(pLobbyIds[i]) + "\\\\\\\"";
					add_object_to_params("lobbyIds", _lobby_id_string.c_str(), _parameters, _has_prev);
				}

				_parameters += "]";

				async_request(URL_GET_LOBBY_GAMES, _parameters.c_str(), pCallBack);
			}

			template<typename PLAYPOD_CALLBACK>
			static void get_related_games_info(const PLAYPOD_CALLBACK& pCallBack, const int pType = -1, const int pGameId = -1, const int pOffset = 0, const int& pSize = 50)
			{
				std::string _parameters = "[";

				auto _has_prev = false;

				add_object_to_params("size", std::to_string(pSize).c_str(), _parameters, _has_prev);

				add_object_to_params("offset", std::to_string(pOffset).c_str(), _parameters, _has_prev);

				if (pType >= 0)
					add_object_to_params("type", std::to_string(pType).c_str(), _parameters, _has_prev);

				add_object_to_params("gameId", std::to_string(pGameId).c_str(), _parameters, _has_prev);

				_parameters += "]";

				async_request(URL_GET_RELATED_GAME, _parameters.c_str(), pCallBack);
			}

			template<typename PLAYPOD_CALLBACK>
			static void get_top_players(const PLAYPOD_CALLBACK& pCallBack, const int& pGameId = -1, const int& pOffset = 0, const int& pSize = 50)
			{
				std::string _parameters = "[";

				auto _has_prev = false;

				add_object_to_params("size", std::to_string(pSize).c_str(), _parameters, _has_prev);

				add_object_to_params("offset", std::to_string(pOffset).c_str(), _parameters, _has_prev);

				add_object_to_params("gameId", std::to_string(pGameId).c_str(), _parameters, _has_prev);

				_parameters += "]";

				async_request(URL_GET_TOP_PLAYERS, _parameters.c_str(), pCallBack);
			}

			template<typename PLAYPOD_CALLBACK>
			static void get_gallery(const PLAYPOD_CALLBACK& pCallBack, const int& pGameId, const int& pBusinessId)
			{
				std::string _parameters = "[";

				auto _has_prev = false;

				add_object_to_params("productId", std::to_string(pGameId).c_str(), _parameters, _has_prev);
				add_object_to_params("businessId", std::to_string(pBusinessId).c_str(), _parameters, _has_prev);

				_parameters += "]";

				async_request(URL_GET_GALLERY, _parameters.c_str(), pCallBack);
			}

			template<typename PLAYPOD_CALLBACK>
			static void stream_match_id_request(const PLAYPOD_CALLBACK& pCallBack, const int& pGameId = -1)
			{
				std::string _parameters = "[";

				auto _has_prev = false;

				add_object_to_params("gameId", std::to_string(pGameId).c_str(), _parameters, _has_prev);

				add_object_to_params("clientType", std::to_string(3).c_str(), _parameters, _has_prev);

				auto _peer_id_str = std::to_string(Network::_peer_id);
				add_object_to_params("peerIds", _peer_id_str.c_str(), _parameters, _has_prev);

				_parameters += "]";

				async_request(URL_REQUEST_STREAM_MATCH_ID, _parameters.c_str(), pCallBack);
			}

			template<typename PLAYPOD_CALLBACK>
			static void subscribe_default_league_request(const PLAYPOD_CALLBACK& pCallBack, const int& pGameId)
			{
				std::string _parameters = "[";

				auto _has_prev = false;

				add_object_to_params("gameId", std::to_string(pGameId).c_str(), _parameters, _has_prev);

				_parameters += "]";

				async_request(URL_DEFAULT_LEAUGE_SUBSCRIBE, _parameters.c_str(), pCallBack);
			}

			template<typename PLAYPOD_CALLBACK>
			static void follow_game_request(const PLAYPOD_CALLBACK& pCallBack, const int& pBusinessId, const int& pPostId, const bool& pFollow)
			{
				std::string _parameters = "[";

				auto _has_prev = false;

				add_object_to_params("businessId", std::to_string(pBusinessId).c_str(), _parameters, _has_prev);
				add_object_to_params("postId", std::to_string(pPostId).c_str(), _parameters, _has_prev);

				std::string _unfollow_str = (pFollow) ? "false" : "true";
				add_object_to_params("disfavorite", _unfollow_str.c_str(), _parameters, _has_prev);

				_parameters += "]";

				async_request(URL_FOLLOW_GAME, _parameters.c_str(), pCallBack);
			}

			template<typename PLAYPOD_CALLBACK>
			static void send_game_rate_request(const PLAYPOD_CALLBACK& pCallBack, const int& pGameId, const double& pRate)
			{
				std::string _parameters = "[";

				auto _has_prev = false;

				add_object_to_params("entityId", std::to_string(pGameId).c_str(), _parameters, _has_prev);
				add_object_to_params("rate", std::to_string(pRate).c_str(), _parameters, _has_prev);

				_parameters += "]";

				async_request(URL_GAME_RATE, _parameters.c_str(), pCallBack);
			}

			template<typename PLAYPOD_CALLBACK>
			static void get_game_following(const PLAYPOD_CALLBACK& pCallBack, const int& pOffset = 0, const int& pSize = 50)
			{
				std::string _parameters = "[";

				auto _has_prev = false;

				if (pSize > 0)
					add_object_to_params("size", std::to_string(pSize).c_str(), _parameters, _has_prev);

				if (pOffset > 0)
					add_object_to_params("offset", std::to_string(pOffset).c_str(), _parameters, _has_prev);

				_parameters += "]";

				async_request(URL_GET_GAME_FOLLOWNING, _parameters.c_str(), pCallBack);
			}

			template<typename PLAYPOD_CALLBACK>
			static void get_news(const PLAYPOD_CALLBACK& pCallBack, const int& pOffset = -1, const int& pSize = -1)
			{
				std::string _parameters = "[";

				auto _has_prev = false;

				add_object_to_params("businessId", std::to_string(config::business_id).c_str(), _parameters, _has_prev);

				if (pSize > 0)
					add_object_to_params("size", std::to_string(pSize).c_str(), _parameters, _has_prev);

				if (pOffset > 0)
					add_object_to_params("offset", std::to_string(pOffset).c_str(), _parameters, _has_prev);

				_parameters += "]";

				async_request(URL_GET_NEWS, _parameters.c_str(), pCallBack);
			}

			//not tested!!!!!!!!!!!!

			template<typename PLAYPOD_CALLBACK>
			static void get_user_profile(const PLAYPOD_CALLBACK& pCallBack, const int& pUserId = -1, const int& pRefetch = -1) 
			{
				std::string _parameters = "[";

				auto _has_prev = false;

				if (pUserId > 0)
					add_object_to_params("userId", std::to_string(pUserId), _parameters, _has_prev);

				if (pRefetch > 0)
					add_object_to_params("refetch", std::to_string(pRefetch), _parameters, _has_prev);

				_parameters += "]";

				async_request(URL_GET_NEWS, _parameters.c_str(), pCallBack);

			}

			template<typename PLAYPOD_CALLBACK>
			static void follow_post_request(const PLAYPOD_CALLBACK& pCallBack, const int& pPostId, const int& pState = true)
			{
				std::string _parameters = "[";

				auto _has_prev = false;

				add_object_to_params("postId", std::to_string(pPostId), _parameters, _has_prev);

				add_object_to_params("disfavorite", std::to_string(!pState), _parameters, _has_prev);

				_parameters += "]";

				async_request(URL_FOLLOW_POST, _parameters.c_str(), pCallBack);

			}

			template<typename PLAYPOD_CALLBACK>
			static void like_post_request(const PLAYPOD_CALLBACK& pCallBack, const int& pPostId, const int& pState = true)
			{
				std::string _parameters = "[";

				auto _has_prev = false;

				add_object_to_params("postId", std::to_string(pPostId), _parameters, _has_prev);

				add_object_to_params("disfavorite", std::to_string(!pState), _parameters, _has_prev);

				_parameters += "]";

				async_request(URL_LIKE_POST, _parameters.c_str(), pCallBack);

			}

			template<typename PLAYPOD_CALLBACK>
			static void async_request(
				const char* pUrlData,
				const char* pParamsData,
				const PLAYPOD_CALLBACK& pCallBack)
			{
				//auto _token_str = Network::_token.empty() ? "null" : Network::_token;
				auto _token_str = Network::_token.empty() ? "null" : Network::_token;

				//TODO: get time for client_meesage_id
				auto _gc_param_data = (char*)malloc(MAX_MESSAGE_SIZE);
				sprintf(_gc_param_data,
					"{\\\\\\\"remoteAddr\\\\\\\": null,"
					"\\\\\\\"clientMessageId\\\\\\\":\\\\\\\"%s\\\\\\\","
					"\\\\\\\"serverKey\\\\\\\": %d,"
					"\\\\\\\"oneTimeToken\\\\\\\": null,"
					"\\\\\\\"token\\\\\\\": \\\\\\\"%s\\\\\\\","
					"\\\\\\\"tokenIssuer\\\\\\\": %d,"
					"\\\\\\\"parameters\\\\\\\": %s,"
					"\\\\\\\"msgType\\\\\\\": %d,"
					"\\\\\\\"uri\\\\\\\": \\\\\\\"%s\\\\\\\","
					"\\\\\\\"messageId\\\\\\\": %d,"
					"\\\\\\\"expireTime\\\\\\\": %d}",
					"123e4567-e89b-12d3-b486-426655440000_GC_PC", 0, _token_str.c_str(), 0, pParamsData, 3, pUrlData, 1001, 0);

				auto _message_vo = (char*)malloc(MAX_MESSAGE_SIZE);
				sprintf(_message_vo,
					"{\\\"content\\\": \\\"%s\\\","
					"\\\"messageId\\\":%d,"
					"\\\"priority\\\": \\\"%s\\\","
					"\\\"peerName\\\": \\\"%s\\\","
					"\\\"ttl\\\": %d}",
					_gc_param_data, 1001, "1", config::ahrrn, 0);

				auto _async_data = (char*)malloc(MAX_MESSAGE_SIZE);
				sprintf(_async_data,
					"{\"content\": \"%s\","
					"\"trackerId\":%d,"
					"\"type\": %d}",
					_message_vo, 1001, 3);

				Network::send_async(_async_data, strlen(_async_data), pCallBack);

				free(_gc_param_data);
				free(_message_vo);
				free(_async_data);
			}
		};

	}
}

#endif
