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

