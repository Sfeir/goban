

// STEP 1
// utils.js

function uuid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
};



























































// STEP 2
// game.js

var Game = function (uuid, firebase, gameId, size) {
    this.uuid = uuid;

    // ;;;;;; UTILISATION DE FIREBASE : Init Firebase
    this.fb = new Firebase('https://go-game.firebaseio.com/');

    this.gameId = gameId;
    this.size = size;
    this.playingState = Game.PlayingState.Watching;
    this.init();
};



Game.PlayingState = {Watching: 0, Playing: 2};
Game.color = {BLACK: 'BLACK', WHITE: 'WHITE'};



Game.prototype.init = function () {
    var self = this;
    this.board = new Board(this.fb, this.size, this.gameId);

    // ;;;;;; UTILISATION DE FIREBASE : Getting reference of players
    var path = 'games/' + self.gameId + '/players/';
    var playersRef = self.fb.child(path);


    // ;;;;;; UTILISATION DE FIREBASE : Getting all players one time
    playersRef.once('value', function (snap) {

        var players = snap.val();

        if (_.isNull(players)
            || !_.has(players, 'player0')
            || _.isEqual(players.player0.uuid, self.uuid)) {

            self.tryToJoin(0, self.uuid);
            return;
        }

        if (!_.has(players, 'player1')
            || _.isEqual(players.player1.uuid, self.uuid)) {

            self.tryToJoin(1, self.uuid);
            return;
        }

        self.watchForUser();
    });
};



Game.prototype.tryToJoin = function (playerNum, uuid) {
    var self = this;

    // Use a transaction to make sure we don't conflict with other people trying to join

    // ;;;;;; UTILISATION DE FIREBASE : getting of node ID
    var path = 'games/' + self.gameId + '/players/player' + playerNum + '/uuid';
    var uuidPlayerRef = this.fb.child(path);


    // ;;;;;; UTILISATION DE FIREBASE : starting "transaction"
    uuidPlayerRef.transaction(function (value) {

        if (value !== null) {
            return; // Somebody must have beat us.  Abort the transaction.
        }

        // ;;;;;; UTILISATION DE FIREBASE : Setting the value
        return uuid; // Try to set user with uid current

    }, function (error, committed, snapshot) {
        console.log("tryToJoin transaction error");

        if (error) {
            console.error('Transaction failed abnormally!', error);
            return;
        }

        if (snapshot.val() !== null && _.isEqual(uid, snapshot.val())) {
            self.playingState = Game.PlayingState.Playing;
            self.startPlaying(playerNum, uid);

            self.fb.initToken(playerNum);
        }
    });
};

Game.prototype.initToken = function (playerNum) {

    // ;;;;;; UTILISATION DE FIREBASE : getting of token node
    var path = 'games/' + this.gameId + '/players/token';
    var tokenRef = this.fb.child(path);


    // ;;;;;; UTILISATION DE FIREBASE : starting "transaction"
    tokenRef.transaction(function (value) {

        if (value !== null) {
            return; // Somebody must have beat us.  Abort the transaction.
        }

        // ;;;;;; UTILISATION DE FIREBASE : edit the token
        return playerNum;
    });
};


Game.prototype.startPlaying = function (playerNum) {


    // ;;;;;; UTILISATION DE FIREBASE : Recupere la reference d'un player
    var playerRef = this.fb.child('games/' + this.gameId + '/players/player' + playerNum + '/online');


    // ;;;;;; UTILISATION DE FIREBASE : Recupere la reference d'un player
    playerRef.set(true, function (error) {
        if (error) {
            console.error('startPlaying online failed');
        }
    });


    // Clear our 'online' status when we disconnect so somebody else can join.
    // ;;;;;; UTILISATION DE FIREBASE : suppression of value for the player offline
    playerRef.onDisconnect().remove();


    this.watchForUser();
};




Game.prototype.watchForUser = function () {
    var self = this;

    // Listen location for player0 and player1.
    // ;;;;;; UTILISATION DE FIREBASE : getting the reference of players
    var path = 'games/' + this.gameId + '/players/';
    var playersRef = this.fb.child(path);


    // ;;;;;; UTILISATION DE FIREBASE : Listen the value of player0
    playersRef.child('player0').on('value', function (snap) {

        var player = snap.val();

        if (!_.isNull(player)) {
            if (_.has(player, "score")) {
                $('#scorePlayer0').text(player.score);
            }

            self.presence(0, player.online);
        }
    });


    // ;;;;;; UTILISATION DE FIREBASE : Listen the value of player1
    playersRef.child('player1').on('value', function (snap) {

        var player = snap.val();

        if (!_.isNull(player)) {
            if (_.has(player, "score")) {
                $('#scorePlayer1').text(player.score);
            }

            self.presence(1, player.online);
        }
    });
};




Game.prototype.presence = function (playerNum, online) {
    var $player = $("#player" + playerNum);

    if (online) {
        $player.addClass('online');
    } else {
        $player.removeClass('online');
    }
};
