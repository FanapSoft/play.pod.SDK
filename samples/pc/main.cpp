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
	int _lobby_ids[3] = { 21, 22, 23 };

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
	}, 7561);

	Services::get_online_info([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, 5556);

	Services::get_file_info([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, 5556);

	Services::get_user_achievements([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, 5556, 1, 661);

	Services::get_user_achievement_detail([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, 5556, 50, 0, 1);
	Services::get_user_game_points([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, 5556);
	Services::get_comment_list([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, 4701);

	Services::add_game_comment_request([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, 4701, "khoobid?!");


	Services::friendship_request([](JSONObject& pJson)
	{
	bool _has_error = false;
	pJson.get_value("HasError", _has_error);
	std::cout << _has_error;
	std::cout << pJson.get_is_array("Result") << std::endl;
	std::string _to_string = pJson.to_string();
	std::cout << _to_string;
	}, 461);

	Services::get_sent_friendship_request([](JSONObject& pJson)
	{
	bool _has_error = false;
	pJson.get_value("HasError", _has_error);
	std::cout << _has_error;
	std::cout << pJson.get_is_array("Result") << std::endl;
	std::string _to_string = pJson.to_string();
	std::cout << _to_string;
	});

	Services::cancel_friendship_request([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, 1842);

	Services::reply_friendship_request([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, 1843, 1);

	Services::get_user_friends([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	});

	Services::get_online_user([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, 5556, 5557);

	Services::get_top_score([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, 5556);

	Services::get_latest_games_info([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	});

	Services::change_visibility_request([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	});

//	Services::match_request([](JSONObject& pJson)
//	{
//		bool _has_error = false;
//		pJson.get_value("HasError", _has_error);
//		std::cout << _has_error;
//		std::cout << pJson.get_is_array("Result") << std::endl;
//		std::string _to_string = pJson.to_string();
//		std::cout << _to_string;
//	}, 5556, 5557, 241, "9.0.0");

	Services::cancel_match_request([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, 6727);

	Services::match_id_request([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, 5556, 5557);

	Services::get_related_leagues_info([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, 5557);

	Services::get_top_leagues_info([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	});

	Services::get_latest_leagues_info([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	});

	Services::get_league_members([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, 5557);

	Services::quick_match_request([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, 5557);

	Services::cancel_quick_match_request([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, 5557);

	Services::get_league_awards([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, 5557);

	Services::get_in_app_purchase_pack([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, 5556, 41);

	Services::get_global_in_app_purchase_pack([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, 41);

	Services::get_game_items([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, 5556, 41);

	Services::get_user_game_center_item([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	});

	Services::get_user_items([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, 5556, 41);

	Services::consume_item_request([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, 41, 1);

//	Services::follow_league_request([](JSONObject& pJson)
//	{
//		bool _has_error = false;
//		pJson.get_value("HasError", _has_error);
//		std::cout << _has_error;
//		std::cout << pJson.get_is_array("Result") << std::endl;
//		std::string _to_string = pJson.to_string();
//		std::cout << _to_string;
//	});

	Services::get_league_top_players([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, 5557);

	Services::get_time_line([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, 461);

	Services::get_league_following([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	});

	Services::get_enrolled_leagues([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, 461);

	Services::get_custom_post([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, 691);

	Services::get_enroll_access([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, 6640);

	Services::send_league_rate_request([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, 5557, 1);

	Services::get_credit_pack_list([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, 20, 0, 100000, "");

	Services::get_league_matches_result([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, 7534);

	Services::add_league_comment_request([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, 5557, "\\\ \"salam\\\ \"");

	Services::get_game_center_status([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	});

	std::vector<int> _cur = { 0, 1, 2 };

	Services::get_lobbies_leagues([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, _cur);

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
