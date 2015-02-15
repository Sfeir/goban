var App = function (url) {
    this.firebase = null;
    this.init(url);
};

/*
 * Initalize the application
 */
App.prototype.init = function (url) {
    var gameId = window.location.hash.substring(1);

    if (!_.isEmpty(gameId) && Utils.checkFirebaseId(gameId)) {
        this.createGame(url, gameId);
    } else {
        window.location.replace("/#");
        this.firebase = new FB(url, null);
        var welcome = new Welcome(this.firebase);
        welcome.listGames();

        var self = this;
        welcome.watchNewGame().then(function (size) {
            var gameId = self.firebase.newGame(size);
            self.createGame(url, gameId);
        });
    }
};

App.prototype.createGame = function (url, gameId) {
    window.location.replace("/#" + gameId);
    this.firebase = new FB(url, gameId);
    var self = this;
    this.firebase.once('games/' + gameId + '/size', 'value').then(function (snap) {
        var size = snap.val();
        console.debug("new Game [size : ", size, ", gameId : ", gameId, "]");

        new Game(self.firebase, url, gameId, size);
    });
};
