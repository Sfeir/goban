var Fb = function (url, idGame) {
    this.ref = new Firebase(url);
    this.idGame = idGame;
};

Fb.prototype.getRef = function () {
    if (_.isEmpty(this.idGame)) {
        var push = this.ref.push();
        this.idGame = push.key();
        $(location).attr('href', "/?" + this.idGame);
        return push;
    } else {
        return this.ref.child('/' + this.idGame + '/');
    }
};

Fb.prototype.setStone = function (x, y, color) {
    return this.getRef().child('board/' + x + "" + y).set(color);
};

Fb.prototype.removeStone = function (x, y) {
    return this.getRef().child('board/' + x + "" + y).remove();
};

Fb.prototype.resetBoard = function () {
    this.getRef().child('board').remove();
};

