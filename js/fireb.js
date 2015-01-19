var Fb = function (url) {
    this.ref = new Firebase(url);
};

Fb.prototype.getRef = function () {
    return this.ref;
};

Fb.prototype.setStone = function (x, y, color) {
    if (!_.isEqual(color, Game.color.BLACK) && !_.isEqual(color, Game.color.WHITE)) {
        return false;
    }

    return this.ref.child('board/' + x + "" + y).set(color);
};

Fb.prototype.resetBoard = function () {
    this.ref.child('board').remove();
};
