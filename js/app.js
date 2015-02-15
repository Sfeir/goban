var App = function (url) {
    this.firebase = null;
    this.init(url);
};

/*
 * Initalize the application
 */
App.prototype.init = function (url) {
    var self = this;
    var routes = {
        '/:gameId': function (gameId) {
            if (!Utils.checkFirebaseId(gameId)) {
                window.location.replace('/#/');
            } else {
                self.createGame(url, gameId);
            }
        },
        '/': function () {
            self.firebase = new FB(url, null);
            var welcome = new Welcome(self.firebase);
            welcome.listGames();

            welcome.watchNewGame().then(function (size) {
                var gameId = self.firebase.newGame(size);
                window.location.replace('/#/' + gameId);
            });
        }
    };
    var router = Router(routes);
    router.init('/');
};

App.prototype.createGame = function (url, gameId) {
    this.firebase = new FB(url, gameId);
    var self = this;
    this.firebase.once('games/' + gameId + '/size', 'value').then(function (snap) {
        var size = snap.val();
        console.debug('new Game [size : ', size, ', gameId : ', gameId, ']');

        new Game(self.firebase, url, gameId, size);
    });
};
