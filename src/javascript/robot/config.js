const isDebug = true; // in debug mode quick match is off and just accept request from users that specified in acceptRequestFrom

module.exports = {
    token:  "******************",// get your token from https://play.pod.land
    tokenIssuer: 0,
    games: [
        {
            id:"7533",
            path: "./../games/reversi/reversi.js",
            version:"1.0.0"
        }
    ],
    leagueId: isDebug ?"7534" : "7534" ,
    serviceMode : "releaseMode" ,
    moveInterval : 1000,// delay for move
    newMatchDelay : 3000, // quick match state timeout after current match finished
    debug : isDebug,
    acceptRequestFrom : ["501"] // in debug accept request from specified users, userId is string
};