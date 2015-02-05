var FB = function (url, idGame) {
    this.firebase = new Firebase(url);
    this.idGame = idGame;
};

FB.prototype.ref = function () {
    return this.firebase.child('/' + this.idGame + '/');
};

FB.prototype.newIdGame = function (size) {
    var ref = this.firebase.root();
    var key = ref.push().key();
    var def = $.Deferred();
    ref.child(key).set({size: size}, function(error) {
        if (error) {
            def.reject(error);
        } else {
            def.resolve(key);
        }
    });
    return def.promise();
};

FB.prototype.setStone = function (x, y, color) {
    return this.ref().child('board/' + x + "-" + y).set(color);
};

FB.prototype.removeStone = function (x, y) {
    return this.ref().child('board/' + x + "-" + y).remove();
};

FB.prototype.resetBoard = function () {
    this.ref().child('board').remove();
};

FB.prototype.setToken = function (playerNum) {
    var numOpponent = Math.abs(playerNum - 1);
    // TODO Utilise la méthode waitToJoin afin de réduire les connexions
    var self = this;
    var player = 'player' + playerNum + '/token';
    var opponent = 'player' + numOpponent + '/token';
    this.ref().child(player).once('value', function (onlineSnap) {
        self.ref().child(opponent).once('value', function (onlineSnapOpponent) {
            if (_.isNull(onlineSnap.val()) && _.isNull(onlineSnapOpponent.val())) {
                self.ref().child(player).transaction(function () {
                    return true;
                });
            }
        });
    });
};

FB.prototype.switchToken = function (playerNum) {
    // TODO Utilise la méthode waitToJoin afin de réduire les connexions
    var numOpponent = Math.abs(playerNum - 1);
    var opponent = 'player' + numOpponent + '/token';
    var player = 'player' + playerNum + '/token';
    this.ref().child(player).set({});
    this.ref().child(opponent).transaction(function () {
        return true;
    });
};

/**
 * Listens for data changes at a particular location
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
 * @returns {snapshot}
 */
FB.prototype.on = function (path, event) {
    var def = $.Deferred();

    this.ref().child(path).on(event, function(snap) {
        def.notify(snap);
    }, function (err) {
        console.error('Access denied attempting to read database ', err, path, event)
    });

    return def.promise();
};

FB.prototype.once = function(path, event) {
    var def = $.Deferred();

    this.ref().child(path).once(event, function(snap) {
        def.resolve(snap);
    }, function(err) {
        console.error('Access denied attempting to read database', err, path, event);
        def.reject(err);
    });

    return def.promise();
};

FB.prototype.childWithTransaction = function (path, input) {
    var def = $.Deferred();
    this.ref().child(path).transaction(function (value) {
        def.resolve(value);
        if (value === null) {
            return input;
        } else {
            return;
        }
    }, function (error, committed) {
        def.reject(error, committed);
    });
    return def.promise();
};