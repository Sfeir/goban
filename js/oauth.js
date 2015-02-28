var Oauth = function (firebase) {
    this.fb = firebase;
};

Oauth.prototype.login = function (provider) {
    var self = this;

    return $.Deferred(function (def) {
        self.fb.ref().authWithOAuthPopup(provider, function (error, authData) {
            if (error) {
                toastr.error('Login Failed! : <br>' + error.message);
                def.reject(error);
            } else {
                console.log("Authenticated successfully with payload:", authData);
                def.resolve(authData);
            }
        }, {
            scope: "email"
        });
    });
};
