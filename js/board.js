var Board = function (size, refFirebase) {
    this.size = size;
    this.refFirebase = refFirebase;
    this.stones = [];
    this.resetStones();
};

Board.prototype.resetStones = function () {
    for (var x = 0; x < this.size; x++) {
        this.stones[x] = [];
    }
};

Board.prototype.get = function (x, y) {
    var _ref;
    return (_ref = this.stones[x]) != null ? _ref[y] : void 0;
};

Board.prototype.addStone = function (x, y, color) {
    if (!this.isCoordOnGoban(x, y)) {
        this.error = "Outside goban";
        return false;
    }

    var d = document.getElementById(x + "" + y);
    d.className = d.className.replace(" stone", "")
        .replace(Game.color.BLACK.toLowerCase(), "")
        .replace(Game.color.WHITE.toLowerCase(), "");
    d.className = d.className + " stone " + color.toLowerCase() + " ";

    this.stones[x][y] = color;

    return this.refFirebase.setStone(x, y, color);
};

Board.prototype.removeStone = function (x, y) {
    if (!this.isCoordOnGoban(x, y)) {
        this.error = "Outside goban";
        return false;
    }

    if (typeof this.stones[x] != "undefined" && typeof this.stones[x][y] != "undefined") {
        delete this.stones[x][y];
        var d = document.getElementById(x + "" + y);
        d.className = d.className.replace(" stone", "")
            .replace(Game.color.BLACK.toLowerCase(), "")
            .replace(Game.color.WHITE.toLowerCase(), "");
    }
};

Board.prototype.init = function (goban) {
    this.stones = goban;
};

Board.prototype.isCoordOnGoban = function (x, y) {
    return (0 <= x && x < this.size)
        && (0 <= y && y < this.size);
};
