var Board = function (firebase, size, idGame) {
    this.templateCreate = _.template($('#template-game').html());
    this.firebase = firebase;
    this.size = parseInt(size);
    this.idGame = idGame;
    this.stones = [];
    this.init(this.size);
};

Board.Goban = {small: 9, medium: 13, large: 19};

Board.prototype.init = function (size) {
    this.generateGoban(size);
    for (var x = 1; x <= this.size; x++) {
        this.stones[x] = [];
    }
};

Board.prototype.get = function (x, y) {
    var _ref;
    return (_ref = this.stones[x]) != null ? _ref[y] : void 0;
};

Board.prototype.setStone = function (x, y, color) {
    if (this.isOkSetStone(x, y, color)) {
        this.setClassName(x, y, color);
        this.stones[x][y] = color;
    }
};

Board.prototype.setStoneFirebase = function (x, y, color, playerNum) {
    if (this.isOkSetStone(x, y, color) && !_.isNull(playerNum)) {

        var player = 'games/' + this.idGame + '/player' + playerNum + '/token';
        var self = this;

        this.firebase.once(player, 'value').then(function (onlineSnap) {
            if (!_.isNull(onlineSnap.val())) {
                self.setClassName(x, y, color);
                self.stones[x][y] = color;

                self.firebase.setStone(x, y, color);
                self.firebase.switchToken(playerNum);
            } else {
                new PNotify({ text: 'This is your opponent\'s turn' });
            }
        });
    }
};

Board.prototype.skipTurnFirebase = function (playerNum) {
    if (!_.isNull(playerNum)) {
        var player = 'player' + playerNum + '/token';
        var self = this;

        this.firebase.once(player, 'value').then(function () {
            new PNotify({
                text: 'You skip your turn',
                type: "notice"
            });
            self.firebase.switchToken(playerNum);
        });
    }
};

Board.prototype.removeStone = function (x, y) {
    if (!this.isCoordOnGoban(x, y)) {
        new PNotify({ text: 'Outside goban' });
        return false;
    }

    if (_.isUndefined(this.stones[x]) || _.isUndefined(this.stones[x][y])) {
        return;
    }

    this.removeClassName(x, y);
    this.firebase.removeStone(x, y);
};

Board.prototype.isCoordOnGoban = function (x, y) {
    return 0 < x && x <= this.size
        && 0 < y && y <= this.size;
};

Board.prototype.isColorValid = function (color) {
    return (_.isEqual(color, Game.color.BLACK) || _.isEqual(color, Game.color.WHITE));
};

Board.prototype.isOkSetStone = function (x, y, color) {
    if (!this.isCoordOnGoban(x, y) || !this.isColorValid(color)) {
        new PNotify({ text: 'Outside goban or color invalid' });
        return false;
    }

    if (this.stones[x][y] != undefined && this.stones[x][y] != color) {
        new PNotify({ text: 'A stone already exists' });
        return false;
    }
    return true;
};

Board.prototype.convertStringToInt = function (str) {
    var start = "A".toUpperCase().charCodeAt(0);
    return str.charCodeAt(0) - start;
};

Board.prototype.convertIntToString = function (int) {
    var start = "A".toUpperCase().charCodeAt(0);
    return String.fromCharCode(start + int);
};

Board.prototype.setClassName = function (x, y, color) {
    var d = this.removeClassName(x, y);
    if (!_.isNull(d)) {
        d.className = d.className + " stone " + color.toLowerCase();
    }
};

Board.prototype.removeClassName = function (x, y) {
    var d = document.getElementById(x + "-" + y);
    if (_.isNull(d)) {
        console.error("getElementById is null for ", x, y);
        return false;
    }

    d.className = d.className.replace(" stone", "")
        .replace(Game.color.BLACK.toLowerCase(), "")
        .replace(Game.color.WHITE.toLowerCase(), "");
    delete this.stones[x][y];

    return d;
};

Board.prototype.generateGoban = function (size) {
    $('#container-value').html('').addClass('is-visible').append(this.templateCreate);

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
            r.innerHTML = r.innerHTML + "<div id='" + col + "-" + (this.size - row + 1) + "' class=\"cell " + attrClass.join(" ") + "\"></div>";
        }
    }
};
