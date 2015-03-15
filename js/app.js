var App = function (url) {
    this.fb = new FB(url, null);
    this.$signOut = $('#sign-out');
    this.gameId = null;
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
        } else if (!_.isEqual(self.gameId, gameId)) {
            self.createGame(url, gameId);
            self.gameId = gameId;
        }
    });
    routie('*', function() {
        self.gameId = null;
        var welcome = new Welcome(self.fb);
        welcome.watchNewGame();
    });

    this.watchForSignOut();
};

App.prototype.createGame = function (url, gameId) {
    this.fb = new FB(url, gameId);
    var self = this;
    this.fb.once('games/' + gameId + '/size', 'value').then(function (snap) {
        var size = snap.val();
        console.debug('new Game [size : ', size, ', gameId : ', gameId, ']');

        new Game(self.fb, url, gameId, size);
    });
};

App.prototype.watchForSignOut = function () {
    var self = this;
    $('#sign-out').on("click", function () {
        self.fb.ref().unauth();
    });

    $(".welcome-login-btn").on("click", function () {
        var provider = $(this).data("provider");
        self.fb.ref().authWithOAuthPopup(provider, function (error, authData) {
            if (error) {
                toastr.error('Login Failed! : <br>' + error.message);
            } else {
                var user = dataOauthToJson(authData);
                console.log(authData);
                self.fb.ref().child("users/" + authData.uid).update(user, function(error) {
                    if (error) {
                        toastr.error('Synchronization failed! : <br>' + error.message);
                        self.fb.ref().unauth();
                    } else {
                        toastr.success('Hi ' + user.name);
                    }
                });
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
