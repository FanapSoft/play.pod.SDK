/*
	Project			 : play.pod.SDK. Copyright(c) play.pod.land (https://play.pod.land). All rights reserved.
	Source			 : Please direct any bug to https://github.com/FanapSoft/play.pod.SDK/issues
	Name			 : main.cpp
	Description		 : This sample shows how to use play pod services
*/

#include <windows.h>
#include <iostream>
#include <playpod.hpp>

using namespace playpod::sdk;

void on_services_ready_callback_handle()
{
	int _lobby_ids[3] = {21, 22, 23};

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

int APIENTRY wWinMain(
	HINSTANCE pHInstance,
	HINSTANCE pPrevInstance,
	LPTSTR plpCmdLine,
	int pCmdShow)
{
	//UNREFERENCED_PARAMETER(pPrevInstance);
	//UNREFERENCED_PARAMETER(plpCmdLine);

	//CefEnableHighDPISupport();

	//CefMainArgs _main_args(pHInstance);
	//int _exit_code = CefExecuteProcess(_main_args, NULL, NULL);
	//if (_exit_code >= 0)
	//{
	//	return _exit_code;
	//}

	//CefSettings _settings;
	//_settings.no_sandbox = true;

	//CefRefPtr<cef_app> app(new cef_app(nullptr));
	//CefInitialize(_main_args, _settings, app.get(), NULL);

	//CefRunMessageLoop();
	//CefShutdown();

	//
	asio::io_service _io;
	on_services_ready_callback = on_services_ready_callback_handle;
	if (Services::initialize(_io)) return EXIT_FAILURE;
	_io.run();

	std::getchar();

	return EXIT_SUCCESS;
}
