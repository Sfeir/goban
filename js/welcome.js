var Welcome = function (firebase) {
    this.fb = firebase;

    this.templateCreate = _.template($('#template-create').html());
    $('#container-value').html(this.templateCreate);

    this.$welcomeLogin = $('#welcome-login');
    this.$welcomeNewGame = $('#welcome-new-game');
    this.$listGame = $('#list-games');
    this.$welcomeGameSize = $(".welcome-game-size");

    this.init();
};

Welcome.prototype.init = function () {
    var self = this;
    this.fb.ref().onAuth(function (authData) {
        if (authData) {
            self.$welcomeLogin.addClass('is-hidden');
            self.$welcomeNewGame.removeClass('is-hidden');
        } else {
            self.$welcomeLogin.removeClass('is-hidden');
            self.$welcomeNewGame.addClass('is-hidden');
        }
    });
    this.listGames();
};

Welcome.prototype.listGames = function () {
    var self = this;
    this.fb.getGames().progress(function (games) {
        var html = [];

        games.forEach(function(game) {
            var key = game.key();
            var child = game.val();

            var scorePlayer0 = 0;
            if (_.has(child, 'players/1') && _.has(child.player1, 'score')) {
                scorePlayer0 = child.player1.score;
            }

            var scorePlayer1 = 0;
            if (_.has(child, 'players/0') && _.has(child.player0, 'score')) {
                scorePlayer1 = child.player1.score;
            }

            html.push('<a href="#/game/' + key + '" class="list-group-item">');
            html.push('<h4 class="list-group-item-heading">Game : ' + key + '</h4>');
            html.push('<p class="list-group-item-text"><b>Score :</b> ' + scorePlayer0 + ' - ' + scorePlayer1 + '</p>');
            html.push('</a>');
        });

        if (_.isEmpty(html)) {
            html.push('<div class="text-center">No Game</div>');
        }

        self.$listGame.html(html.join(''));
    });
};

Welcome.prototype.watchNewGame = function () {
    var self = this;

    this.$welcomeGameSize.on("click", function () {
        var size = $(this).data("size");
        var gameId = self.fb.newGame(size);

        window.location.replace('/#/game/' + gameId);
    });
};
