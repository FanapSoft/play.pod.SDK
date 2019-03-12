const
    User = require("./model/user.js"),
    Config = require("../config");


class RobotApp {


    constructor() {

        let param = JSON.parse(JSON.stringify(Config));
        param.socketReport = false;
        param.chatSocketReport = false;
        param.chatEnable = false;
        param.parent = this;

        new User(param);
    };

}

module.exports = RobotApp;