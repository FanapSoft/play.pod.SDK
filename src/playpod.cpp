/*
	Project			 : play.pod.SDK. Copyright(c) play.pod.land (https://play.pod.land). All rights reserved.
	Source			 : Please direct any bug to https://github.com/FanapSoft/play.pod.SDK/issues
	Name			 : playpod.hpp
	Description		 : implementation of PlayPod services
*/

#include "pch.h"
#include "playpod.hpp"

using namespace playpod::sdk;

std::function<void(void)> playpod::sdk::on_services_ready_callback = nullptr;

#pragma region config

const char* config::ssoiau = ("http://" + std::string(SERVER_IP) + "/pages/iap/buy/default.aspx").c_str();
//use http instead of tcp or web socket
bool        config::harfs = false;
//use encryption
bool        config::ure = false;
//use tcp or websocket connection
bool        config::utc = true;
//peer name
const char*	config::ahrrn = "bp.gc.sandbox";

#pragma endregion

#pragma region network

uint64_t										Network::_peer_id = 0;
bool											Network::_is_released = false;
std::thread*									Network::_thread = nullptr;
CURL*											Network::_curl = nullptr;
asio::ip::tcp::socket*							Network::_socket = nullptr;
bool											Network::_is_ready = false;

#pragma endregion

