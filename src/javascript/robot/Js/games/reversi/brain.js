function Brain() {

    function isOnBoard(x, y) {

        return ((x >= 0) && (x <= 7) && (y >= 0) && (y <= 7))
    }

    function isValidMove(board, tile, xStart, yStart) {

        if (board[xStart][yStart] !== " " || !(isOnBoard(xStart, yStart))) {

            return false;
        }

        board[xStart][yStart] = tile;

        var otherTile = "";

        if (tile == "X") {

            otherTile = "O";
        }

        else {

            otherTile = "X";
        }

        var tilesToFlip = [];

        for (var i = -1; i < 2; i++) {

            for (var j = -1; j < 2; j++) {

                if ((i != 0) || (j != 0)) {

                    var x = xStart,
                        y = yStart;

                    x += i;
                    y += j;

                    if ((isOnBoard(x, y)) && board[x][y] == otherTile) {

                        x += i;
                        y += j;

                        if(!(isOnBoard(x, y))) {

                            continue;
                        }

                        while (board[x][y] == otherTile) {

                            x += i;
                            y += j;

                            if((!isOnBoard(x, y))) {

                                break;
                            }
                        }

                        if((!isOnBoard(x, y))) {

                            continue;
                        }

                        if (board[x][y] == tile) {

                            while (true) {

                                x -= i;
                                y -= j;

                                if ((x == xStart) && (y == yStart)) {

                                    break;
                                }

                                tilesToFlip.push([x, y]);
                            }
                        }
                    }
                }
            }
        }

        board[xStart][yStart] = " ";

        if (tilesToFlip.length == 0) {

            return false;
        }

        return tilesToFlip;
    }

    /*
    * return all position that is valid for nex move
    * */
    function getValidMoves(board, tile) {

        var validMoves = [];

        for (var i = 0; i < 8; i++) {

            for (var j = 0; j < 8; j++) {

                if (isValidMove(board, tile, i, j) != false) {

                    validMoves.push([i, j]);
                }
            }
        }

        return validMoves;
    }

    function generateRandomInt (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function getCurrentResult(board) {

        var xCount = 0;
        var oCount = 0;

        for (var i = 0; i < board.length; i++) {
            var row = board[i];

            for (var j = 0; j < row.length; j++) {
                if(row[j]=== "X") {
                    xCount += 1;
                } else if(row[j]=== "O") {
                    oCount += 1;
                }
            }

        }

        return "X : " + xCount + "  ------  " + "O : " + oCount;

    }

    function autoMove(board,tile) {
        var player1ValidMove = getValidMoves(board,tile);
        var moveData;
        var selectedIndex = generateRandomInt(0, player1ValidMove.length-1);

        moveData = {
            column: player1ValidMove[selectedIndex][1],
            row: player1ValidMove[selectedIndex][0]
        };

        console.log("move",
            "row", moveData && moveData.row,
            "column",moveData && moveData.column);


        return moveData;
    }

    /*
    * params.board : current state of board  [[row0],[row2],...,[row7]]
    *  ' ' = position is empty
    * params.tile  : your die , X or O
    *
    * params.matchId
    *
    * params.move.row
    * params.move.column
    *
    * params.opponent.id
    * params.opponent.name
    *
    * return { row : row index , column : column index}
    *
    * */
    this.execute = function (params) {
        console.log("board",params.board);
        console.log("move",params.move);
        console.log("matchId",params.matchId);
        console.log('Current State ', getCurrentResult(params.board));
        return autoMove(params.board,params.tile);
    };
}

module.exports = Brain;