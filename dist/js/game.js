var Game = function () {
};

Game.PlayingState = {Watching: 0, Joining: 1, Playing: 2};
Game.color = {BLACK: "BLACK", WHITE: "WHITE"};

Game.Controller = function (size, url) {
    var idGame = window.location.search.substring(1);
    this.firebase = new FB(url, idGame);

    this.board = new Board(size, this.firebase);

    this.playingState = Game.PlayingState.Watching;
    this.playerNum = null;

    this.waitToJoin();
};

Game.Controller.prototype.getColor = function () {
    if (this.playerNum == null) {
        return null;
    }
    return (this.playerNum == 0) ? Game.color.BLACK : Game.color.WHITE;
};

Game.Controller.prototype.waitToJoin = function () {
    var self = this;

    // Listen on 'online' location for player0 and player1.
    function join(numPlayer) {
        self.firebase.on('player' + numPlayer + '/online', "value").progress(function (snapshot) {
            if (_.isNull(snapshot.val()) && _.isEqual(self.playingState, Game.PlayingState.Watching)) {
                self.tryToJoin(numPlayer);
            }
            self.presence(numPlayer, snapshot.val());
        });
    }

    join(0);
    join(1);

    this.watchForNewStones();
};

Game.Controller.prototype.tryToJoin = function (playerNum) {
    this.playerNum = playerNum;
    console.log("player" + playerNum + " tryToJoin");

    // Set ourselves as joining to make sure we don't try to join as both players. :-)
    this.playingState = Game.PlayingState.Joining;

    // Use a transaction to make sure we don't conflict with other people trying to join.
    var self = this;
    this.firebase.ref().child('player' + playerNum + '/online').transaction(function (onlineVal) {
        console.log("tryToJoin transaction ", onlineVal);
        if (onlineVal === null) {
            self.firebase.setToken(playerNum);
            return true; // Try to set online to true
        } else {
            return; // Somebody must have beat us.  Abort the transaction.
        }
    }, function (error, committed) {
        console.log("tryToJoin error ", committed);
        if (committed) { // We got in!
            self.playingState = Game.PlayingState.Playing;
            self.startPlaying(playerNum);
        } else {
            self.playingState = Game.PlayingState.Watching;
        }
    });
};

/**
 * Once we've joined, enable controlling our player.
 */
Game.Controller.prototype.startPlaying = function (playerNum) {
    this.myPlayerRef = this.firebase.ref().child('player' + playerNum);

    // Clear our 'online' status when we disconnect so somebody else can join.
    this.myPlayerRef.child('online').onDisconnect().remove();

    var self = this;
    $(".cell").click(function (event) {
        var ids = event.target.id.split("-"),
            x = ids[0],
            y = ids[1];

        var color = self.board.get(x, y);
        if (color != undefined && _.isEqual(color, self.getColor())) {
            self.board.removeStone(x, y);
            return;
        }

        self.board.setStoneFirebase(x, y, self.getColor(), playerNum);
    });
};

/**
 * Detect when our opponent pushes extra rows to us.
 */
Game.Controller.prototype.watchForNewStones = function () {
    var self = this;

    this.firebase.on("board", "child_added").progress(function (snapshot) {
        var coord = snapshot.key().split("-");
        var stone = snapshot.val();
        self.board.setStone(parseInt(coord[0]), parseInt(coord[1]), stone);
    });

    this.firebase.on("board", "child_removed").progress(function (snapshot) {
        var coord = snapshot.key().split("-");
        self.board.removeStone(parseInt(coord[0]), parseInt(coord[1]));
    });
};

Game.Controller.prototype.presence = function (playerNum, user) {
    if (_.isEqual(playerNum, this.playerNum)) {
        return;
    }

    if (user) {
        $("#presence").text("Opponent : ★ online");
    } else {
        $("#presence").text("Opponent : ☆ idle");
    }
};
