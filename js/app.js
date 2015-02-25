var App = function (url) {
    this.firebase = new FB(url, null);
    this.$signOut = $('#sign-out');
    this.init(url);
};

/*
 * Initalize the application
 */
App.prototype.init = function (url) {
    var self = this;
    routie('/game/:gameId', function(gameId) {
        if (!Utils.checkFirebaseId(gameId)) {
            window.location.replace('/#/');
        } else {
            self.createGame(url, gameId);
        }
    });
    routie('*', function() {
        console.log("app ", self.firebase);
        var welcome = new Welcome(self.firebase);
        welcome.listGames();
        welcome.watchNewGame();
    });

    this.watchForSignOut();
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

App.prototype.watchForSignOut = function () {
    var self = this;
    $('#sign-out').on("click", function () {
        self.firebase.ref().unauth();
    });

    $(".welcome-login-btn").on("click", function () {
        var provider = $(this).data("provider");
        self.firebase.ref().authWithOAuthPopup(provider, function (error, authData) {
            if (error) {
                toastr.error('Login Failed! : <br>' + error.message);
            }
        }, {
            scope: "email"
        });
    });

    this.fb.ref().onAuth(function (authData) {
        if (authData) {
            self.$signOut.removeClass('is-hidden');
        } else {
            self.$signOut.addClass('is-hidden');
        }
    });
};
