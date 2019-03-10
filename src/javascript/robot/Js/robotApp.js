const
    User = require("./model/user.js"),
    Config = require("../config");


class RobotApp {


    constructor() {

        new User({
            token: Config.token,
            tokenIssuer: Config.tokenIssuer,
            serviceMode: Config.serviceMode,
            games: Config.games,
            leagueId: Config.leagueId,
            quickMatch: Config.quickMatch,
            acceptRequestFrom: Config.acceptRequestFrom,
            newMatchDelay: Config.newMatchDelay,
            autoAcceptMatchRequest: Config.autoAcceptMatchRequest,
            socketReport: false,
            chatSocketReport: false,
            chatEnable : false,
            parent: this
        });
    };

}

module.exports = RobotApp;