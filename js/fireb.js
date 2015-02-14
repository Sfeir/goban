var FB = function (url, gameId) {
    this.firebase = new Firebase(url);
    this.gameId = gameId;
};

FB.prototype.ref = function () {
    return this.firebase.root();
};

FB.prototype.newGame = function (size) {
    var ref = this.firebase.root();
    var key = ref.push().key();
    var def = $.Deferred();
    ref.child('games/' + key).set({size: size}, function(error) {
        if (error) {
            def.reject(error);
        } else {
            def.resolve(key);
        }
    });
    return def.promise();
};

FB.prototype.getGames = function () {
    var def = $.Deferred();
    this.firebase.child('games').orderByKey().limitToLast(5).once('value', function(snap){
        def.resolve(snap.val());
    });
    return def.promise();
};

FB.prototype.setStone = function (x, y, color) {
    return this.firebase.child('games/' + this.gameId + '/board/' + x + "-" + y).set(color);
};

FB.prototype.removeStone = function (x, y) {
    return this.firebase.child('games/' + this.gameId + '/board/' + x + "-" + y).remove();
};

FB.prototype.setToken = function (playerNum) {
    var partnerNum = Math.abs(playerNum - 1);
    var self = this;
    var player = 'games/' + this.gameId + '/player' + playerNum + '/token';
    var partner = 'games/' + this.gameId + 'player' + partnerNum + '/token';
    this.firebase.child(player).once('value', function (snap) {
        self.firebase.child(partner).once('value', function (snapPartner) {
            if (_.isNull(snap.val()) && _.isNull(snapPartner.val())) {
                self.firebase.child(player).transaction(function () {
                    return true;
                });
            }
        });
    });
};

FB.prototype.switchToken = function (playerNum) {
    var partnerNum = Math.abs(playerNum - 1);
    var partner = 'games/' + this.gameId + '/player' + partnerNum + '/token';
    var player = 'games/' + this.gameId + '/player' + playerNum + '/token';
    this.firebase.child(player).set({});
    this.firebase.child(partner).transaction(function () {
        return true;
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

    this.ref().child(path).on(event, function(snap) {
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
