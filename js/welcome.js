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
    this.fb.getGames().then(function (games) {
        var html = [];
        $.each(games, function (k, v) {
            var scorePlayer0 = 0;
            if (_.has(v, 'players/1') && _.has(v.player1, 'score')) {
                scorePlayer0 = v.player1.score;
            }

            var scorePlayer1 = 0;
            if (_.has(v, 'players/0') && _.has(v.player0, 'score')) {
                scorePlayer1 = v.player1.score;
            }

            html.push('<a href="#/game/' + k + '" class="list-group-item">');
            html.push('<h4 class="list-group-item-heading">Game : ' + k + '</h4>');
            html.push('<p class="list-group-item-text"><b>Score :</b> ' + scorePlayer0 + ' - ' + scorePlayer1 + '</p>');
            html.push('</a>');
        });
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
