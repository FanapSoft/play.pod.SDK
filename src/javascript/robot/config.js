
module.exports = {
    token:  "***********************",// get your token from https://play.pod.land
    tokenIssuer:0,
    games: [
        {
            id:"7533",
            path: "./../games/reversi/reversi.js",
            version:"1.0.0"
        }
    ],
    leagueId: "7534" ,
    serviceMode : "releaseMode" ,
    moveInterval : 1000,// delay for move
    newMatchDelay : 3000, // quick match state timeout after current match finished
    quickMatch : false,
    autoAcceptMatchRequest : true,
    maxConcurrentMatch : 2,
    acceptRequestFrom : [] //accept request from specified users, userId is string
};
