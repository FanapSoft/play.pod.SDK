/*
	Project			 : play.pod.SDK. Copyright(c) play.pod.land (https://play.pod.land). All rights reserved.
	Source			 : Please direct any bug to https://github.com/FanapSoft/play.pod.SDK/issues
	Name			 : main.cpp
	Description		 : This sample shows how to use play pod services
*/

#include <iostream>
#include <thread>
#include <playpod.hpp>

using namespace playpod;

void on_services_ready_callback_handle()
{
	Services::get_games_info([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	});
}

int main(int argc, char** argv)
{
	asio::io_service _io;
	on_services_ready_callback = on_services_ready_callback_handle;
	if (Services::initialize(_io)) return EXIT_FAILURE;
	_io.run();

	std::getchar();

	return EXIT_SUCCESS;
}
