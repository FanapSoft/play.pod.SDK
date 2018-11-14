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

	Services::get_top_players([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	}, 4997);
}

int APIENTRY wWinMain(
	HINSTANCE pInstance,
	HINSTANCE pPrevInstance,
	LPTSTR plpCmdLine,
	int pCmdShow)
{
	UNREFERENCED_PARAMETER(pPrevInstance);
	UNREFERENCED_PARAMETER(plpCmdLine);

	OAuth2::launch(pInstance);
	
	asio::io_service _io;
	on_services_ready_callback = on_services_ready_callback_handle;
	if (Services::initialize(_io)) return EXIT_FAILURE;
	_io.run();

	std::getchar();

	return EXIT_SUCCESS;
}
