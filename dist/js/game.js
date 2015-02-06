Game = function (url) {
    this.firebase = null;
    this.board = null;
    this.playingState = Game.PlayingState.Watching;
    this.playerNum = null;
    this.init(url);
};

Game.PlayingState = {Watching: 0, Joining: 1, Playing: 2};
Game.color = {BLACK: "BLACK", WHITE: "WHITE"};

Game.prototype.init = function (url) {
    this.idGame = window.location.search.substring(1);

    if (_.isEmpty(this.idGame)) {
        this.showFormCreateGame();
    } else {
        this.firebase = new FB(url, this.idGame);
        var nbOcc = this.idGame.match("size=[0-9]{1,2}");

        if (!_.isNull(nbOcc) && nbOcc.length == 1) {
            var size = this.idGame.split("=")[1];
            this.firebase.newIdGame(size).then(function (key) {
                $(location).attr('href', "/?" + key);
            });
        } else {
            var self = this;
            console.log(self.idGame);
            this.firebase.once(self.idGame + '/size', 'value').then(function (snap) {
                self.board = new Board(self.firebase, snap.val(), self.idGame);
                self.waitToJoin();
                self.addShareLink();
            });
        }
    }
};

Game.prototype.addShareLink = function () {
    var r = document.getElementById("share-link");
    if (r !== null) {
        r.innerHTML = window.location.href;
    }
};

Game.prototype.showFormCreateGame = function () {
    this.templateCreate = _.template($('#template-create').html());
    $('#container-value').html('').addClass('is-visible').append(this.templateCreate);
};

Game.prototype.getColor = function () {
    if (this.playerNum == null) {
        return null;
    }
    return (this.playerNum == 0) ? Game.color.BLACK : Game.color.WHITE;
};

Game.prototype.waitToJoin = function () {
    var self = this;

    // Listen on 'online' location for player0 and player1.
    function join(numPlayer) {
        self.firebase.on(self.idGame + '/player' + numPlayer + '/online', 'value').progress(function (snapshot) {
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

Game.prototype.tryToJoin = function (playerNum) {
    this.playerNum = playerNum;
    console.log("player" + playerNum + " tryToJoin");

    // Set ourselves as joining to make sure we don't try to join as both players. :-)
    this.playingState = Game.PlayingState.Joining;

    // Use a transaction to make sure we don't conflict with other people trying to join.
    var self = this;
    this.firebase.ref().child(self.idGame + '/player' + playerNum + '/online').transaction(function (onlineVal) {
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
Game.prototype.startPlaying = function (playerNum) {
    this.myPlayerRef = this.firebase.ref().child(this.idGame + '/player' + playerNum);

    // Clear our 'online' status when we disconnect so somebody else can join.
    this.myPlayerRef.child('online').onDisconnect().remove();

    var self = this;
    $(".cell").click(function (event) {
        var ids = event.target.id.split("-"),
            x = ids[0],
            y = ids[1];

        var color = self.board.get(x, y);
        if (color != undefined && !_.isEqual(color, self.getColor())) {
            self.board.removeStone(x, y);
            return;
        }

        self.board.setStoneFirebase(x, y, self.getColor(), playerNum);
    });

    $("#skip").on("click", function (event) {
        self.board.skipTurnFirebase(playerNum);
    });
};

/**
 * Detect when our opponent pushes extra rows to us.
 */
Game.prototype.watchForNewStones = function () {
    var self = this;

    this.firebase.on(this.idGame + '/board', 'child_added').progress(function (snapshot) {
        var coord = snapshot.key().split("-");
        var stone = snapshot.val();
        self.board.setStone(parseInt(coord[0]), parseInt(coord[1]), stone);
    });

    this.firebase.on(this.idGame + '/board', 'child_removed').progress(function (snapshot) {
        var coord = snapshot.key().split("-");
        self.board.removeStone(parseInt(coord[0]), parseInt(coord[1]));
    });
};

Game.prototype.presence = function (playerNum, user) {
    if (_.isEqual(playerNum, this.playerNum)) {
        return;
    }

    if (user) {
        $("#presence")
            .addClass('label-success')
            .removeClass('label-warning')
            .text("★ opponent online");
    } else {
        $("#presence")
            .addClass('label-warning')
            .removeClass('label-success')
            .text("☆ opponent idle");
    }
};
