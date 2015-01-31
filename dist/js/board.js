var Board = function (size, refFirebase) {
    this.size = size;
    this.firebase = refFirebase;
    this.stones = [];
    this.resetStones(this.size);
};
Board.Goban = {small: 9, medium: 13, large: 19};

Board.prototype.resetStones = function (size) {
    this.generateGoban(size);
    for (var x = 1; x <= this.size; x++) {
        this.stones[x] = [];
    }
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

Board.prototype.generateGoban = function (size) {
    if (size != Board.Goban.small && size != Board.Goban.medium && size != Board.Goban.large) {
        this.size = Board.Goban.medium;
    }

    var r = document.getElementById('canvasGoban');
    for (var row = 1; row <= this.size; row++) {
        for (var col = 1; col <= this.size; col++) {
            var attrClass = [];
            if (col == 1) {
                attrClass.push("first_col");
            }
            if (col == this.size) {
                attrClass.push("last_col");
            }
            if (row == 1) {
                attrClass.push("first_row");
            }
            if (row == this.size) {
                attrClass.push("last_row");
            }

            if (this.size == Board.Goban.small) {
                if ((row == 3 && col == 3) ||
                    (row == 7 && col == 3) ||
                    (row == 3 && col == 7) ||
                    (row == 7 && col == 7)) {
                    attrClass.push("hoshi");
                }
            } else {
                var hoshiMax = this.size - 3;
                var hoshiMiddle = Math.round(this.size / 2);

                if ((row == 4 && col == 4) ||
                    (row == hoshiMax && col == 4) ||
                    (row == 4 && col == hoshiMax) ||
                    (row == hoshiMax && col == hoshiMax) ||
                    (row == 4 && col == hoshiMiddle) ||
                    (row == hoshiMiddle && col == 4) ||
                    (row == hoshiMiddle && col == 4) ||
                    (row == hoshiMiddle && col == hoshiMax) ||
                    (row == hoshiMax && col == hoshiMiddle) ||
                    (row == hoshiMiddle && col == hoshiMiddle)) {
                    attrClass.push("hoshi");
                }
            }
            r.innerHTML = r.innerHTML + "<a><div id='" + col + "-" + (this.size - row + 1) + "' class=\"cell " + attrClass.join(" ") + "\"></div></a>";
        }
    }
};
