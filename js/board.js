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
    this.generateGoban();
};

Board.prototype.get = function (coord) {
    var _ref;
    return (_ref = this.stones[coord.x]) != null ? _ref[coord.y] : void 0;
};

Board.prototype.addStone = function (coord) {
    if (!this.isCoordOnGoban(coord) || !this.isColorValid(coord.color)) {
        new PNotify({
            title: 'Oh No!',
            text: 'Outside goban',
            type: 'error'
        });
        return false;
    }

    if (this.stones[coord.x][coord.y] != undefined && this.stones[coord.x][coord.y] != coord.color) {
        new PNotify({
            title: 'Oh No!',
            text: 'A stone already exists',
            type: 'error'
        });
        return false;
    }

    var d = document.getElementById(coord.x + "" + coord.y);
    d.className = d.className.replace("stone", "")
        .replace(Game.color.BLACK.toLowerCase(), "")
        .replace(Game.color.WHITE.toLowerCase(), "");
    d.className = d.className + " stone " + coord.color.toLowerCase() + " ";

    this.stones[coord.x][coord.y] = coord.color;

    return this.refFirebase.setStone(coord.x, coord.y, coord.color);
};

Board.prototype.removeStone = function (coord) {
    if (!this.isCoordOnGoban(coord.x, coord.y)) {
        new PNotify({
            title: 'Oh No!',
            text: 'Outside goban',
            type: 'error'
        });
        return false;
    }

    if (typeof this.stones[coord.x] != "undefined" && typeof this.stones[coord.x][coord.y] != "undefined") {
        delete this.stones[coord.x][coord.y];
        var d = document.getElementById(coord.x + "" + coord.y);
        d.className = d.className.replace(" stone", "")
            .replace(Game.color.BLACK.toLowerCase(), "")
            .replace(Game.color.WHITE.toLowerCase(), "");
    }
};

Board.prototype.init = function (goban) {
    this.stones = goban;
};

Board.prototype.isCoordOnGoban = function (coord) {
    return (0 <= coord.x && coord.x < this.size)
        && (0 <= coord.y && coord.y < this.size);
};

Board.prototype.isColorValid = function (color) {
    return (_.isEqual(color, Game.color.BLACK) || _.isEqual(color, Game.color.WHITE));
};

Board.prototype.generateGoban = function () {
    var r = document.getElementById('canvasGoban');
    for (var row = 0; row < this.size; row++) {
        for (var col = 0; col < this.size; col++) {
            var attrClass = [];
            if (col == 0) {
                attrClass.push("first_col");
            }
            if (col == this.size - 1) {
                attrClass.push("last_col");
            }
            if (row == 0) {
                attrClass.push("first_row");
            }
            if (row == this.size - 1) {
                attrClass.push("last_row");
            }
            if (row == 2 && col == 2) {
                attrClass.push("oeil");
            }
            if (row == 6 && col == 2) {
                attrClass.push("oeil");
            }
            if (row == 2 && col == 6) {
                attrClass.push("oeil");
            }
            if (row == 6 && col == 6) {
                attrClass.push("oeil");
            }
            r.innerHTML = r.innerHTML + "<a><div id='" + row + col + "' class=\"cell " + attrClass.join(" ") + "\"></div></a>";
        }
    }
};
