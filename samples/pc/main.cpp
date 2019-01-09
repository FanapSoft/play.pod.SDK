/*
	Project			 : play.pod.SDK. Copyright(c) play.pod.land (https://play.pod.land). All rights reserved.
	Source			 : Please direct any bug to https://github.com/FanapSoft/play.pod.SDK/issues
	Name			 : main.cpp
	Description		 : This sample shows how to use play pod services
*/

#include <wolf.h>
#include <playpod.hpp>

using namespace wolf::system;
using namespace playpod::sdk;

void on_services_ready_callback_handle()
{
	int _lobby_ids[3] = {21, 22, 23};

	Services::get_user_profile([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	});

	Services::get_top_games_info([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, 9);


	Services::send_game_rate_request([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, 6595, 5);

	Services::follow_game_request([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, 692, 5008, true);

	Services::get_stream_games_info([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	});


	Services::subscribe_default_league_request([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, 6591);

	Services::stream_match_id_request([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, 6591);
}

WOLF_MAIN()
{
	w_logger_config _log_config;
	_log_config.app_name = L"play.pod.services.test";
	_log_config.log_path = wolf::system::io::get_current_directoryW();
#ifdef __WIN32
	_log_config.log_to_std_out = false;
#else
	_log_config.log_to_std_out = true;
#endif
	//initialize logger, and log in to the output debug window of visual studio(just for windows) and Log folder inside running directory
	wolf::logger.initialize(_log_config);

	asio::io_service _io;
	on_services_ready_callback = on_services_ready_callback_handle;
	if (Services::initialize(_io) == W_FAILED) return EXIT_FAILURE;
	_io.run();

	

	std::vector< std::thread*> _threads;
	for (size_t i = 0; i < 10; i++)
	{
		auto _t = new std::thread([&]()
		{
			std::string _result;
			std::string _address;
			if (i % 2 == 0)
			{
				_address = "http://sandbox.pod.land:8080/nzh/image/?imageId=50101&width=640&height=360&hashCode=167593be6e7-0.23092292405291015";
			}
			else
			{
				_address = "http://sandbox.pod.land:8080/nzh/image/?imageId=49902&width=640&height=360&hashCode=16734fdbbb2-0.11177657811236619";
			}
			
			wolf::system::w_url _url;
			_url.request_url(_address.c_str(), _result);
			_url.release();

			std::cout << _result << std::endl;
		});
		_threads.push_back(_t);
	}
	
	while (std::getchar() != '\r')
	{

	}

	Services::release();
	wolf::release_heap_data();

	return EXIT_SUCCESS;
}
