var Board = function (size, refFirebase) {
    this.size = size;
    this.firebase = refFirebase;
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

Board.prototype.setStone = function (coord) {
    if (this.isOkSetStone(coord)) {
        this.setClassName(coord, coord.color.toLowerCase());
        this.stones[coord.x][coord.y] = coord.color;
    }
};

Board.prototype.setStoneFirebase = function (coord, playerNum) {
    if (this.isOkSetStone(coord) && !_.isNull(playerNum)) {

        var player = 'player' + playerNum + '/token';
        var self = this;
        this.firebase.ref().child(player).once('value', function (onlineSnap) {
            if (!_.isNull(onlineSnap.val())) {
                self.setClassName(coord, coord.color.toLowerCase());
                self.stones[coord.x][coord.y] = coord.color;

                self.firebase.setStone(coord.x, coord.y, coord.color);
                self.firebase.switchToken(playerNum);
            } else {
                new PNotify({
                    title: 'Oh No!',
                    text: 'This is your opponent\'s turn'
                });
            }
        });
    }
};

Board.prototype.removeStone = function (coord) {
    if (!this.isCoordOnGoban(coord)) {
        new PNotify({
            title: 'Oh No!',
            text: 'Outside goban'
        });
        return false;
    }

    if (typeof this.stones[coord.x] == "undefined" || typeof this.stones[coord.x][coord.y] == "undefined") {
        return;
    }

    delete this.stones[coord.x][coord.y];
    this.setClassName(coord);
    this.firebase.removeStone(coord.x, coord.y);
};

Board.prototype.init = function (goban) {
    this.stones = goban;
};

Board.prototype.isCoordOnGoban = function (coord) {
    return (0 <= coord.x && coord.x < this.size)
        && (0 < coord.y && coord.y <= this.size);
};

Board.prototype.isColorValid = function (color) {
    return (_.isEqual(color, Game.color.BLACK) || _.isEqual(color, Game.color.WHITE));
};

Board.prototype.isOkSetStone = function (coord) {
    if (!this.isCoordOnGoban(coord) || !this.isColorValid(coord.color)) {
        new PNotify({
            title: 'Oh No!',
            text: 'Outside goban or color invalid'
        });
        return false;
    }

    if (this.stones[coord.x][coord.y] != undefined && this.stones[coord.x][coord.y] != coord.color) {
        new PNotify({
            title: 'Oh No!',
            text: 'A stone already exists'
        });
        return false;
    }
    return true;
};

Board.prototype.convertStringToInt = function(str) {
    var start = "A".toUpperCase().charCodeAt(0);
    return str.charCodeAt(0) - start;
};

Board.prototype.convertIntToString = function(int) {
    var start = "A".toUpperCase().charCodeAt(0);
    return String.fromCharCode(start + int);
};

Board.prototype.setClassName = function(coord, className) {
    var d = document.getElementById(coord.x + "-" + coord.y);
    d.className = d.className.replace(" stone", "")
        .replace(Game.color.BLACK.toLowerCase(), "")
        .replace(Game.color.WHITE.toLowerCase(), "");

    if (_.isNull(d)) {
        return false;
    }

    if (!_.isEmpty(className)) {
        d.className = d.className + " stone " + coord.color.toLowerCase();
    }
};

Board.prototype.generateGoban = function () {
    var r = document.getElementById('canvasGoban');
    for (var row = this.size; row > 0; row--) {
        for (var col = 0; col < this.size; col++) {
            var attrClass = [];
            if (col == 0) {
                attrClass.push("first_col");
            }
            if (col == this.size - 1) {
                attrClass.push("last_col");
            }
            if (row == this.size) {
                attrClass.push("first_row");
            }
            if (row == 1) {
                attrClass.push("last_row");
            }
            if (row == 3 && col == 2) {
                attrClass.push("oeil");
            }
            if (row == 7 && col == 2) {
                attrClass.push("oeil");
            }
            if (row == 3 && col == 6) {
                attrClass.push("oeil");
            }
            if (row == 7 && col == 6) {
                attrClass.push("oeil");
            }
            r.innerHTML = r.innerHTML + "<a><div id='" + col + "-" + row + "' class=\"cell " + attrClass.join(" ") + "\"></div></a>";
        }
    }
};
