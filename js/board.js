var Board = function (firebase, size, gameId) {
    this.templateCreate = _.template($('#template-game').html());
    this.firebase = firebase;
    this.size = parseInt(size);
    this.gameId = gameId;
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
    return (_ref = this.stones[x]) !== null ? _ref[y] : void 0;
};

Board.prototype.setStone = function (x, y, color) {
    if (this.isOkSetStone(x, y, color)) {
        this.setClassName(x, y, color);
        this.stones[x][y] = color;
    }
};

Board.prototype.setStoneFirebase = function (x, y, color, playerNum) {
    if (this.isOkSetStone(x, y, color) && !_.isNull(playerNum)) {

        var player = 'games/' + this.gameId + '/player' + playerNum + '/token';
        var self = this;

        this.firebase.once(player, 'value').then(function (snap) {
            if (!_.isNull(snap.val())) {
                self.setClassName(x, y, color);
                self.stones[x][y] = color;

                self.firebase.setStone(x, y, color);
                self.firebase.switchToken(playerNum);
            } else {
                toastr.error('This is your opponent\'s turn ');
            }
        });
    }
};

Board.prototype.skipTurnFirebase = function (playerNum) {
    if (!_.isNull(playerNum)) {
        var player = 'player' + playerNum + '/token';
        var self = this;

        this.firebase.once(player, 'value').then(function () {
            toastr.success('You skip your turn');
            self.firebase.switchToken(playerNum);
        });
    }
};

Board.prototype.removeStone = function (x, y, playerNum) {
    if (!this.isCoordOnGoban(x, y)) {
        toastr.success('Outside goban');
        return false;
    }

    if (_.isUndefined(this.stones[x]) || _.isUndefined(this.stones[x][y])) {
        return;
    }

    this.removeClassName(x, y);
    if (_.isNumber(playerNum)) {
        this.firebase.removeStone(x, y, playerNum);
    }
};

Board.prototype.isCoordOnGoban = function (x, y) {
    return 0 < x && x <= this.size && 0 < y && y <= this.size;
};

Board.prototype.isColorValid = function (color) {
    return (_.isEqual(color, Game.color.BLACK) || _.isEqual(color, Game.color.WHITE));
};

Board.prototype.isOkSetStone = function (x, y, color) {
    if (!this.isCoordOnGoban(x, y) || !this.isColorValid(color)) {
        toastr.error('Outside goban or color invalid');
        return false;
    }

    if (this.stones[x][y] !== undefined && this.stones[x][y] !== color) {
        toastr.error('A stone already exists');
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

Board.prototype.generatorSVG = function (size) {
    var boardGo = document.getElementById('board');
    var canvasGoban = document.getElementById('canvasGoban');
    var svgns = 'http://www.w3.org/2000/svg';

    var svg = document.createElementNS(svgns, 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('style', 'padding:' + (100 / ((size - 1) * 2)) + '%;');

    var defs = document.createElementNS(svgns, "defs");

    var path = document.createElementNS(svgns, "path");
    path.setAttribute('d', 'M 100 0 L 100 100 0 100');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'black');
    path.setAttribute('stroke-width', '.4');

    var pattern = document.createElementNS(svgns, "pattern");
    pattern.setAttribute('id', 'grid');
    pattern.setAttribute('width', 100 / (size - 1) + '%');
    pattern.setAttribute('height', 100 / (size - 1) + '%');
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');

    var patternPath = document.createElementNS(svgns, "path");
    patternPath.setAttribute('d', 'M 30 0 L 0 0 0 30');
    patternPath.setAttribute('fill', 'none');
    patternPath.setAttribute('stroke', 'black');
    patternPath.setAttribute('stroke-width', '.8');

    pattern.appendChild(patternPath);
    defs.appendChild(pattern);

    var hoshi9X = ['25.2%', '25.2%', '75.2%', '75.2%'];
    var hoshi9Y = ['25.2%', '75.2%', '25.2%', '75.2%'];
    var space1 = ((Math.round(((100 / (size - 1)) * 3) * 100) / 100) + 0.2) + '%';
    var space2 = ((Math.round(((100 / (size - 1)) * ((size - 1) / 2)) * 100) / 100) + 0.2) + '%';
    var space3 = ((Math.round(((100 / (size - 1)) * (size - 4)) * 100) / 100) + 0.2) + '%';
    var hoshiX = [space1, space1, space1, space2, space2, space2, space3, space3, space3];
    var hoshiY = [space1, space2, space3, space1, space2, space3, space1, space2, space3];

    for (var i = 0; i < ((size > 9) ? 9 : 4); ++i) {
        // Boucle 4x pour un goban de 9
        // Boucle 9x pour un goban > 9
        var circle = document.createElementNS(svgns, "circle");
        circle.setAttribute('fill', 'black');
        circle.setAttribute('stroke', 'none');
        circle.setAttribute('cx', (size > 9) ? hoshiX[i] : hoshi9X[i]);
        circle.setAttribute('cy', (size > 9) ? hoshiY[i] : hoshi9Y[i]);
        circle.setAttribute('r', '1');

        svg.appendChild(circle);
    }

    var rect = document.createElementNS(svgns, "rect");
    rect.setAttribute('width', '100%');
    rect.setAttribute('height', '100%');
    rect.setAttribute('fill', 'url(#grid)');

    svg.appendChild(defs);
    svg.appendChild(path);
    svg.appendChild(rect);
    boardGo.insertBefore(svg, canvasGoban);
};

Board.prototype.generateGoban = function (size) {
    $('#container-value').html('').addClass('is-visible').append(this.templateCreate);

    if (size != Board.Goban.small && size != Board.Goban.medium && size != Board.Goban.large) {
        this.size = Board.Goban.medium;
    }

    this.generatorSVG(this.size);

    var r = document.getElementById('canvasGoban');
    $(r).addClass('gb' + size);
    $('#gb' + size).show();
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
            r.innerHTML = r.innerHTML + '<div id="' + col + '-' + (this.size - row + 1) + '" class="cell ' + attrClass.join(' ') + '" style="width:' + (100 / size) + '%;height:' + (100 / size) + '%;"></div>';
        }
    }
};
