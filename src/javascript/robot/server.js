const RobotApp = require("./Js/robotApp");
const process = require("process");
process.title = "node_Robot";
class Server {

    constructor(){
        new RobotApp({});
    }
}

new Server();