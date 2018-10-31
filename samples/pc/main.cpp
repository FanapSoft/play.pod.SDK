/*
	Project			 : play.pod.SDK. Copyright(c) play.pod.land (https://play.pod.land). All rights reserved.
	Source			 : Please direct any bug to https://github.com/FanapSoft/play.pod.SDK/issues
	Name			 : main.cpp
	Description		 : This sample shows how to use play pod services
*/

#include <iostream>
#include <thread>
#include <playpod.hpp>

int main(int argc, char** argv)
{
	using namespace play::pod;

	asio::io_service _io;
	if (Services::initialize(_io)) return EXIT_FAILURE;

	Services::get_games_info([](JSONObject& pJson)
	{
		bool _has_error = false;
		pJson.get_value("HasError", _has_error);
		std::cout << _has_error;
		std::cout << pJson.get_is_array("Result") << std::endl;
		std::string _to_string = pJson.to_string();
		std::cout << _to_string;
	});
	_io.run();

	while (true)
	{
		std::this_thread::sleep_for(std::chrono::milliseconds(100));
	}
	return 0;
}
