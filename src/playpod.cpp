/*
	Project			 : play.pod.SDK. Copyright(c) play.pod.land (https://play.pod.land). All rights reserved.
	Source			 : Please direct any bug to https://github.com/FanapSoft/play.pod.SDK/issues
	Name			 : playpod.hpp
	Description		 : implementation of PlayPod services
*/

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

#pragma region cef

cef_handler* g_instance = NULL;

cef_handler::cef_handler()
	: is_closing_(false) 
{
	DCHECK(!g_instance);
	g_instance = this;
}

cef_handler::~cef_handler() 
{
	g_instance = NULL;
}

// static
cef_handler* cef_handler::GetInstance() 
{
	return g_instance;
}

void cef_handler::OnTitleChange(CefRefPtr<CefBrowser> browser,
	const CefString& title)
{
	CEF_REQUIRE_UI_THREAD();

	// Set the title of the window using platform APIs.
	PlatformTitleChange(browser, title);
}

void cef_handler::OnAfterCreated(CefRefPtr<CefBrowser> browser) 
{
	CEF_REQUIRE_UI_THREAD();

	// Add to the list of existing browsers.
	browser_list_.push_back(browser);
}

bool cef_handler::DoClose(CefRefPtr<CefBrowser> browser) 
{
	CEF_REQUIRE_UI_THREAD();

	// Closing the main window requires special handling. See the DoClose()
	// documentation in the CEF header for a detailed destription of this
	// process.
	if (browser_list_.size() == 1) 
	{
		// Set a flag to indicate that the window close should be allowed.
		is_closing_ = true;
	}

	// Allow the close. For windowed browsers this will result in the OS close
	// event being sent.
	return false;
}

void cef_handler::OnBeforeClose(CefRefPtr<CefBrowser> browser) 
{
	CEF_REQUIRE_UI_THREAD();

	// Remove from the list of existing browsers.
	BrowserList::iterator bit = browser_list_.begin();
	for (; bit != browser_list_.end(); ++bit) 
	{
		if ((*bit)->IsSame(browser)) 
		{
			browser_list_.erase(bit);
			break;
		}
	}

	if (browser_list_.empty()) 
	{
		// All browser windows have closed. Quit the application message loop.
		CefQuitMessageLoop();
	}
}

void cef_handler::OnLoadError(CefRefPtr<CefBrowser> browser,
	CefRefPtr<CefFrame> frame,
	ErrorCode errorCode,
	const CefString& errorText,
	const CefString& failedUrl) 
{
	CEF_REQUIRE_UI_THREAD();

	// Don't display an error for downloaded files.
	if (errorCode == ERR_ABORTED) return;

	// Display a load error message.
	std::stringstream ss;
	ss << "<html><body bgcolor=\"white\">"
		"<h2>Failed to load URL "
		<< std::string(failedUrl) << " with error " << std::string(errorText)
		<< " (" << errorCode << ").</h2></body></html>";
	frame->LoadString(ss.str(), failedUrl);
}

class Visitor : public CefStringVisitor
{
	void Visit(const CefString& string) OVERRIDE
	{
		int i = 0;
		//std::cout << string;
	}

private:
	IMPLEMENT_REFCOUNTING(Visitor);
};

void cef_handler::OnLoadEnd(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, int httpStatusCode)
{
	frame->GetSource(new Visitor());
}

void cef_handler::CloseAllBrowsers(bool force_close) 
{
	if (!CefCurrentlyOn(TID_UI)) 
	{
		// Execute on the UI thread.
		CefPostTask(TID_UI, base::Bind(&cef_handler::CloseAllBrowsers, this, force_close));
		return;
	}

	if (browser_list_.empty())
		return;

	BrowserList::const_iterator it = browser_list_.begin();
	for (; it != browser_list_.end(); ++it)
		(*it)->GetHost()->CloseBrowser(force_close);
}

void cef_handler::PlatformTitleChange(CefRefPtr<CefBrowser> browser, const CefString& title) 
{
	CefWindowHandle hwnd = browser->GetHost()->GetWindowHandle();
	SetWindowText(hwnd, std::wstring(title).c_str());
}

#pragma endregion