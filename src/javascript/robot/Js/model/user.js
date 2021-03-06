// const Service = require("./../../../Service/Javascript/SDK/API/service");
const Service = require("../service/service");

class User {


    constructor(options) {
        this._gameId = null;
        this._service = null;
        this._options = options;
        this._concurrentMatchCount = 0;
        this._games = {};
        let game;

        for (let i = 0; i < this._options.games.length; i++) {
            game = this._options.games[i];
            this._gameId = game.id;
            this._games[game.id] = {
                callback: require(game.path),
                version: game.version
            };
        }

        this._service = new Service({
            deviceId: this._options.deviceId,
            serviceMode: this._options.serviceMode,
            socketReport: this._options.socketReport,
            games: this._games,
            version: game.version,
            database: false,
            chatEnable: this._options.chatEnable,
            report: () => {

            },
            on: {
                ready: () => {
                },
                connect: (params) => {
                    console.log("connect", params.peerId);
                    this._login();
                },
                disconnect: () => {
                    console.log("disconnect");
                },
                reconnect: (params) => {
                    console.log("reconnect", params.peerId);
                },
                login: (userData) => {
                    console.log("login", "username:", userData.name, "userId:", userData.id,);
                    this._quickMatchRequest();
                },
                matchRequest: (content) => {
                    console.log("MATCH_REQUEST", JSON.stringify(content));

                    if(content.gameId !== this._gameId) {
                        console.log("REQUESTED_GAME_NOT_VALID");
                        return;
                    }

                    
                    if(this._concurrentMatchCount>= options.maxConcurrentMatch) {
                        console.log("CONCURRENT_MATCH_OVERFLOW");
                        content.res({
                            state: false
                        }, (result) => {

                        });
                        return;
                    }


                    if (this._options.autoAcceptMatchRequest) {

                        if(Array.isArray(this._options.acceptRequestFrom) && this._options.acceptRequestFrom.length>0) {
                            if(this._options.acceptRequestFrom.indexOf(content.id) !== -1) {
                                content.res({
                                    state: true
                                }, (result) => {
                                    console.log("RECEIVE_MATCH_REQUEST_2", result);
                                });
                            }
                        } else {
                            content.res({
                                state: true
                            }, (result) => {
                                console.log("RECEIVE_MATCH_RESPONSE", result);
                            });
                        }

                    }

                },
                matchResult: (data) => {
                    console.log("match finished");
                    this._concurrentMatchCount -= 1;

                    setTimeout( () => {
                        this._quickMatchRequest();
                    },this._options.newMatchDelay);

                },
                newMatch: (matchData) => {
                    this._concurrentMatchCount += 1;
                    console.log("new match", JSON.stringify(matchData));
                },
                matchStart: (matchData) => {
                    console.log("match start ", matchData.matchId);
                }
            }
        });

    }

    _quickMatchRequest() {
        if (!this._options.quickMatch) return;

        let reqData = {};
        reqData["leagueId"] = this._options.leagueId;
        reqData["gameId"] = this._gameId;
        this._service.quickMatchRequest(reqData, {
            onResult: (res) => {
                console.log("quickMatchRequest-- onResult : ", JSON.stringify(res));

                if (res.hasError) {
                    setTimeout(() => {
                        this._quickMatchRequest();
                    }, 2000);
                }
            },
            onCancel: (data) => {
                console.log("quickMatchRequest-- onCancel" ,JSON.stringify(data));
            },
            onAccept: (data) => {
                console.log("quickMatchRequest-- onAccept ",JSON.stringify(data));
            }
        });
    };

    _login() {

        this._service.getUserProfile({
            token: this._options.token,
            tokenIssuer: this._options.tokenIssuer,
        }, (res) => {

            if (!res.hasError && res.result) {
                this._service.initLogin({
                    token: this._options.token,
                    tokenIssuer: this._options.tokenIssuer,
                    id: res.result.GcUserId,
                    name: res.result.username
                });
            } else {
                console.log("Error in get profile", res);
                setTimeout(() => {
                    this._login();
                }, 2000);
            }


        })

    };

}

module.exports = User;