

// STEP 1

$(".cell").on("click", function (event) {
    var ids = event.target.id.split("-"),
        x = ids[0],
        y = ids[1];

    var color = self.board.get(x, y);

    if (_.isEqual(color, self.getColor())) {
        return;
    }

    if (color !== undefined && !_.isEqual(color, self.getColor())) {
        self.board.removeStone(x, y, playerNum);
        return;
    }

    self.board.setStoneFirebase(x, y, self.getColor(), playerNum);
});


































































// STEP 2


Board.prototype.setStoneFirebase = function (x, y, color, playerNum) {
    // verifies coordinates
    if (this.checkValueStone(x, y, color) && !_.isNull(playerNum)) {

        var self = this;


        // ;;;;;; UTILISATION DE FIREBASE : getting of token node
        var path = 'games/' + this.gameId + '/players/token';
        var tokenRef = this.fb.child(path);


        // ;;;;;; UTILISATION DE FIREBASE : get one time the token
        tokenRef.once('value', function (snap) {

            var value = snap.val();

            if (!_.isNull(value) && _.isEqual(playerNum, value)) {

                // ;;;;;; UTILISATION DE FIREBASE : getting of cell node
                var path = self.gameId + '/goban/' + x + "-" + y;
                var gobanRef = this.gamesRef.child(path);


                // ;;;;;; UTILISATION DE FIREBASE : add new stone and switch the token
                gobanRef.set(color, function () {
                    self.switchToken(playerNum);

                }, function (error) {
                    if (!error) {
                        self.setClassName(x, y, color);
                        self.stones[x][y] = color;
                    }
                });

            } else {
                toastr.error('This is your opponent\'s turn ');
            }
        });
    }
};


Board.prototype.switchToken = function (playerNum) {
    var partnerNum = Math.abs(playerNum - 1);


    // ;;;;;; UTILISATION DE FIREBASE : getting of token node
    var tokenPath = 'games/' + this.gameId + '/players/token';
    var tokenRef = this.child(tokenPath);


    // ;;;;;; UTILISATION DE FIREBASE : Switch the token
    tokenRef.transaction(function (value) {
        if (value !== null && value !== playerNum) {
            return;
        }

        return (value === null) ? playerNum : partnerNum;
    });
};































































// STEP 3
// Detect when our opponent pushes extra rows to us.


Game.prototype.watchForNewStones = function () {
    var self = this;


    this.fb.once('games/' + this.gameId + '/goban', 'value', function (snaps) {
        snaps.forEach(function (snap) {
            var coord = snap.key().split("-");
            var stone = snap.val();
            self.board.setStone(parseInt(coord[0]), parseInt(coord[1]), stone);
        });
    });


    this.fb.on('games/' + this.gameId + '/goban', 'child_added', function (snap) {
        var coord = snap.key().split("-");
        var stone = snap.val();
        self.board.setStone(parseInt(coord[0]), parseInt(coord[1]), stone);
    });


    this.fb.on('games/' + this.gameId + '/goban', 'child_removed', function (snap) {
        var coord = snap.key().split("-");
        self.board.removeStone(parseInt(coord[0]), parseInt(coord[1]));
    });
};