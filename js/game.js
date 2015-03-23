var Game = function (firebase, url, gameId, size) {
    this.fb = firebase;
    this.url = url;
    this.size = size;
    this.gameId = gameId;
    this.playingState = Game.PlayingState.Watching;
    this.playerNum = null;
    this.board = null;
    this.init();
};

Game.PlayingState = {Watching: 0, Joining: 1, Playing: 2};
Game.color = {BLACK: "BLACK", WHITE: "WHITE"};

Game.prototype.init = function () {
    this.board = new Board(this.fb, this.size, this.gameId);
    this.addShareLink();
    this.waitToJoin();

    var $gameAlertToplay = $('#game-alert-toplay');
    var $welcomeLogin = $('#welcome-login');

    this.fb.ref().onAuth(function (authData) {
        if (authData) {
            $gameAlertToplay.addClass('is-hidden');
            $welcomeLogin.addClass('is-hidden');
        } else {
            $gameAlertToplay.removeClass('is-hidden');
            $welcomeLogin.removeClass('is-hidden');
        }
    });

    this.watchForNewStones();
};

Game.prototype.addShareLink = function () {
    var link = $("#share-link");
    if (link !== null) {
        link.text(window.location.href).attr('href', window.location.href);
    }
};

Game.prototype.getColor = function () {
    if (this.playerNum === null) {
        return null;
    }
    return (this.playerNum === 0) ? Game.color.BLACK : Game.color.WHITE;
};

Game.prototype.waitToJoin = function () {
    var self = this;

    var players = self.fb.ref('games/' + self.gameId + '/players/');

    this.fb.ref().onAuth(function (authData) {
        if (authData && _.isEqual(self.playingState, Game.PlayingState.Watching)) {
            players.once('value', function (snap) {
                var players = snap.val();

                if (_.isNull(players) || !_.has(players, "player0") || _.isEqual(players.player0.uid, authData.uid)) {
                    self.tryToJoin(0, authData.uid);
                    return;
                }

                if (!_.has(players, "player1") || _.isEqual(players.player1.uid, authData.uid)) {
                    self.tryToJoin(1, authData.uid);
                    return;
                }

                self.watchForUser();
                $('#skip').addClass('is-hidden');
            });
        } else {
            self.watchForUser();
            console.log(" waitToJoin watching");
        }
    });
};

Game.prototype.tryToJoin = function (playerNum, uid) {
    console.log('tryToJoin start', playerNum, uid);
    this.playerNum = playerNum;

    // Set ourselves as joining to make sure we don't try to join as both players. :-)
    this.playingState = Game.PlayingState.Joining;

    // Use a transaction to make sure we don't conflict with other people trying to join.
    var self = this;
    this.fb.ref('games/' + self.gameId + '/players/player' + playerNum + '/uid').transaction(function (snap) {

        if (snap !== null) {
            return; // Somebody must have beat us.  Abort the transaction.
        }

        self.playingState = Game.PlayingState.Playing;
        self.startPlaying(playerNum, uid);

        self.fb.initToken(playerNum);
        return uid; // Try to set user with uid current

    }, function (error, committed, snapshot) {
        console.log("tryToJoin transaction error");
        if (error) {
            console.log('Transaction failed abnormally!', error);
        } else if (!committed) {
            console.log('We aborted the transaction (because value already exists).');
        } else {
            console.log('Value added!');
        }
        console.log("Value data: ", snapshot.val());
    });
};

/**
 * Once we've joined, enable controlling our player.
 */
Game.prototype.startPlaying = function (playerNum, uid) {
    var playerRef = this.fb.ref('games/' + this.gameId + '/players/player' + playerNum + '/online');

    playerRef.set(true, function (error) {
        if (error) {
            console.error('startPlaying online failed');
        }
    });

    // Clear our 'online' status when we disconnect so somebody else can join.
    playerRef.onDisconnect().remove();

    this.watchForUser();

    var $board = $('#board');

    if (playerNum === 0) {
        $board.addClass('black');
    } else if (playerNum === 1){
        $board.addClass('white');
    }

    var $picPlayer0 = $('#player0');
    var $picPlayer1 = $('#player1');
    var tokenRef = this.fb.ref('games/' + this.gameId + '/players/token');
    tokenRef.on('value', function (snap) {
        if (snap.val() === 0) {
            $picPlayer0.removeClass('waitForTurn');
            $picPlayer1.addClass('waitForTurn');
        } else {
            $picPlayer0.addClass('waitForTurn');
            $picPlayer1.removeClass('waitForTurn');
        }
    });

    var self = this;
    $(".cell").on("click", function (event) {
        var ids = event.target.id.split("-"),
            x = ids[0],
            y = ids[1];

        var color = self.board.get(x, y);

        if (color === undefined || _.isEqual(color, self.getColor())) {
            return;
        }

        if (!_.isEqual(color, self.getColor())) {
            self.board.removeStone(x, y, playerNum);
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

    this.fb.once('games/' + this.gameId + '/goban', 'value').then(function (snaps) {
        snaps.forEach(function (snap) {
            var coord = snap.key().split("-");
            var stone = snap.val();
            self.board.setStone(parseInt(coord[0]), parseInt(coord[1]), stone);
        });
    });

    this.fb.on('games/' + this.gameId + '/goban', 'child_added').progress(function (snap) {
        var coord = snap.key().split("-");
        var stone = snap.val();
        self.board.setStone(parseInt(coord[0]), parseInt(coord[1]), stone);
    });

    this.fb.on('games/' + this.gameId + '/goban', 'child_removed').progress(function (snap) {
        var coord = snap.key().split("-");
        self.board.removeStone(parseInt(coord[0]), parseInt(coord[1]));
    });
};

Game.prototype.watchForUser = function () {
    var self = this;
    var player0Avatar = "", player1Avatar = "";
    var players = this.fb.ref('games/' + this.gameId + '/players/');

    // Listen location for player0 and player1.
    players.child('player0').on('value', function (snap) {
        var player = snap.val();
        if (!_.isNull(player)) {
            if (_.has(player, "score")) {
                $('#scorePlayer0').text(player.score);
            }
            self.presence(0, player.online);

            if (_.isEmpty(player0Avatar)) {
                self.fb.ref('users/' + player.uid).once('value', function (snapUser) {
                    if (!_.isNull(snapUser.val())) {
                        $('#player0').find('img:first-child')[0].src = snapUser.val().picture;
                    }
                });
            }
        }
    });

    players.child('player1').on('value', function (snap) {
        var player = snap.val();
        if (!_.isNull(player)) {
            if (_.has(player, "score")) {
                $('#scorePlayer1').text(player.score);
            }
            self.presence(1, player.online);

            if (_.isEmpty(player1Avatar)) {
                self.fb.ref('users/' + player.uid).once('value', function (snapUser) {
                    if (!_.isNull(snapUser.val())) {
                        $('#player1').find('img:first-child')[0].src = snapUser.val().picture;
                    }
                });
            }
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
