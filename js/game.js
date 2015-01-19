var Game = function () {
};

Game.PlayingState = {Watching: 0, Joining: 1, Playing: 2};
Game.color = {BLACK:"BLACK", WHITE: "WHITE"};

Game.Controller = function (size, url) {
    var idGame = window.location.search.substring(1);
    this.refFirebase = new Fb(url, idGame);

    this.board = new Board(size, this.refFirebase);

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
    this.refFirebase.getRef().child('player0/online').on('value', function (onlineSnap) {
        if (onlineSnap.val() === null && self.playingState === Game.PlayingState.Watching) {
            self.tryToJoin(0);
        }
        self.presence(0, onlineSnap.val());
    });

    this.refFirebase.getRef().child('player1/online').on('value', function(onlineSnap) {
        if (onlineSnap.val() === null && self.playingState === Game.PlayingState.Watching) {
            self.tryToJoin(1);
        }
        self.presence(1, onlineSnap.val());
    });
};

Game.Controller.prototype.tryToJoin = function (playerNum) {
    this.playerNum = playerNum;
    console.log("player" + playerNum + " tryToJoin");
    // Set ourselves as joining to make sure we don't try to join as both players. :-)
    this.playingState = Game.PlayingState.Joining;

    // Use a transaction to make sure we don't conflict with other people trying to join.
    var self = this;
    this.refFirebase.getRef().child('player' + playerNum + '/online').transaction(function (onlineVal) {
        console.log("tryToJoin transaction ", onlineVal);
        if (onlineVal === null) {
            return true; // Try to set online to true.
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
    this.myPlayerRef = this.refFirebase.getRef().child('player' + playerNum);

    // Clear our 'online' status when we disconnect so somebody else can join.
    this.myPlayerRef.child('online').onDisconnect().remove();

    // Detect when other player pushes rows to our board.
    this.watchForNewStones();

    // Detect when game is restarted by other player.
    //this.watchForRestart();

    var self = this;
    $(".cell").click(function (event) {
        var id = event.target.id;
        self.board.addStone({x:id.charAt(0), y:id.charAt(1), color:self.getColor()});
    });
};

/**
 * Detect when our opponent pushes extra rows to us.
 */
Game.Controller.prototype.watchForNewStones = function () {
    var self = this;
    var boardRef = this.refFirebase.getRef().child('board');

    boardRef.on('child_changed', function (snapshot) {
        var coord = snapshot.key();
        var stone = snapshot.val();
        self.board.addStone({x:parseInt(coord.charAt(0)), y:parseInt(coord.charAt(1)), color:stone});
    });

    boardRef.on('child_added', function (snapshot) {
        var coord = snapshot.key();
        var stone = snapshot.val();
        self.board.addStone({x:parseInt(coord.charAt(0)), y:parseInt(coord.charAt(1)), color:stone});
    });

    boardRef.on('child_removed', function (snapshot) {
        var coord = snapshot.key();
        self.board.removeStone({x:coord.charAt(0), y:coord.charAt(1)});
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
