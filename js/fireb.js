var FB = function (url, gameId) {
    this.fb = new Firebase(url);
    this.gamesRef = this.fb.root().child('games');
    this.gameId = gameId;
};

FB.prototype.ref = function (child) {
    if (_.isUndefined(child)) {
        return this.fb;
    }

    return this.fb.child(child);
};

FB.prototype.newGame = function (size) {
    return this.gamesRef.push({size: size, startedAt: Firebase.ServerValue.TIMESTAMP}).key();
};

FB.prototype.getGames = function () {
    var def = $.Deferred();
    this.gamesRef.limitToLast(5).on('value', function (snap) {
        def.notify(snap);
    });

    return def.promise();
};

FB.prototype.setStone = function (x, y, color) {
    var gobanRef = this.gamesRef.child(this.gameId + '/goban/' + x + "-" + y);

    return $.Deferred(function (def) {
        gobanRef.set(color, function (error) {
            if (error) {
                def.reject(error);
            } else {
                def.resolve(true);
            }
        });
    });
};

FB.prototype.removeStone = function (x, y, playerNum) {
    var ref = this.gamesRef.child(this.gameId);
    ref.child('/goban/' + x + "-" + y).remove();

    var path = '/players/player' + playerNum;
    this.fb.child('games/' + this.gameId + path + '/score').once('value', function (snap) {
        var score = (snap.val() === null) ? 0 : snap.val();
        ref.child(path).update({score: score + 1});
    });
};

FB.prototype.initToken = function (playerNum) {
    var path = 'games/' + this.gameId + '/players/token';
    this.fb.child(path).transaction(function (value) {
        if (value !== null) {
            return;
        }

        return playerNum;
    });
};

FB.prototype.switchToken = function (playerNum) {
    var partnerNum = Math.abs(playerNum - 1);
    var tokenPath = 'games/' + this.gameId + '/players/token';

    this.fb.child(tokenPath).transaction(function (value) {
        if (value !== null && value !== playerNum) {
            return;
        }

        return (value === null) ? playerNum : partnerNum;
    });
};

/**
 * Calls Firebase.on(), Listens for data changes at a particular location
 *
 * <pre>
 *     FB.on('board', 'child_added')
 *       .progress( childAdded )
 *       .fail( securityError )
 *       .done( listenerDisposed )
 * </pre>
 *
 * @param path
 * @param event
 * @return {jQuery.Deferred}
 */
FB.prototype.on = function (path, event) {
    var def = $.Deferred();

    this.fb.child(path).on(event, function (snap) {
        def.notify(snap);
    }, function (err) {
        console.error('Access denied attempting to read database ', err, path, event);
    });

    return def.promise();
};

/**
 * Calls Firebase.once(), Listens for exactly one event of the specified event type, and then stops listening.
 *
 * @param path
 * @param event
 * @returns {jQuery.Deferred}
 */
FB.prototype.once = function (path, event) {
    var def = $.Deferred();

    this.fb.child(path).once(event, function (snap) {
        def.resolve(snap);
    }, function (err) {
        console.error('Access denied attempting to read database', err, path, event);
        def.reject(err);
    });

    return def.promise();
};

FB.prototype.childWithTransaction = function (path, input) {
    var def = $.Deferred();
    this.fb.child(path).transaction(function (value) {
        def.resolve(value);
        if (value !== null) {
            return;
        }

        return input;

    }, function (error, committed) {
        def.reject(error, committed);
    });
    return def.promise();
};
