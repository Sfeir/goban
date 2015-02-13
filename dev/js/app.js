var App = function (url) {
    this.firebase = null;
    this.init(url);
};

/*
 * Initalize the application
 */
App.prototype.init = function (url) {
    this.idGame = window.location.search.substring(1);

    if (_.isEmpty(this.idGame)) {
        var welcome = new Welcome();
        this.firebase = new FB(url, null);
        welcome.showFormCreateGame();
        welcome.listGames(this.firebase);
        return;
    }

    this.firebase = new FB(url, this.idGame);
    var re = new RegExp("size=[0-9]{1,2}");
    var nbOcc = this.idGame.match(re);

    if (!_.isNull(nbOcc) && nbOcc.length == 1) {
        var size = this.idGame.split("=")[1];
        this.firebase.newIdGame(size).then(function (key) {
            $(location).attr('href', "/?" + key);
        });
        return;
    }

    var self = this;
    this.firebase.once('games/' + self.idGame + '/size', 'value').then(function (snap) {
        var size = snap.val();
        new Game(self.firebase, url, self.idGame, size);
    });
};
