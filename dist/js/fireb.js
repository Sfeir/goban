var FB = function (url, idGame) {
    this.firebase = new Firebase(url);
    this.idGame = idGame;
};

FB.prototype.ref = function () {
    if (_.isEmpty(this.idGame)) {
        var push = this.firebase.push();
        this.idGame = push.key();
        $(location).attr('href', "/?" + this.idGame);
        return push;
    } else {
        return this.firebase.child('/' + this.idGame + '/');
    }
};

FB.prototype.setStone = function (x, y, color) {
    return this.ref().child('board/' + x + "" + y).set(color);
};

FB.prototype.removeStone = function (x, y) {
    return this.ref().child('board/' + x + "" + y).remove();
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
    this.ref().child(opponent).transaction(function (onlineVal) {
        return true;
    });
};
