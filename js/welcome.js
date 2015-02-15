var Welcome = function (firebase) {
    this.fb = firebase;
    this.init();
};

Welcome.prototype.init = function () {
    var self = this;
    self.showFormCreateGame();
};

Welcome.prototype.showFormCreateGame = function () {
    this.templateCreate = _.template($('#template-create').html());
    $('#container-value').html(this.templateCreate);
    this.watchNewGame();
};

Welcome.prototype.listGames = function () {
    var self = this;
    this.fb.getGames().then(function (games) {
        self.creatListGames(games);
    });
};

Welcome.prototype.creatListGames = function (games) {
    var $listGame = $('#list-games');

    $.each(games, function (k) {
        var html = [];
        html.push('<a href="' + window.location.href + '?' + k + '" class="list-group-item">');
        html.push('<h4 class="list-group-item-heading">Game : ' + k + '</h4>');
        html.push('<p class="list-group-item-text"><b>Score :</b> - </p>');
        html.push('</a>');
        html = html.join('');
        $listGame.prepend(html);
    });
};

Welcome.prototype.watchNewGame = function () {
    var def = $.Deferred();

    $(".welcome-game-size").on("click", function () {
        var provider = $(this).data("size");
        def.resolve(provider);
    });
    return def.promise();
};
