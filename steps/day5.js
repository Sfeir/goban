

// STEP 1

App.prototype.watchForSignOut = function () {
    var self = this;

    $('.welcome-login-btn').on('click', function () {

        var provider = $(this).data('provider');

        // ;;;;;; UTILISATION DE FIREBASE : user authentication
        self.fb.authWithOAuthPopup(provider, function (error, authData) {
            if (error) {
                toastr.error('Login Failed! : ' + error.message);
            } else {
                var user = Oauth.dataOauthToJson(authData); // wrapper


                // ;;;;;; UTILISATION DE FIREBASE : get users node for current user
                var userRef = self.fb.child('users/' + authData.uid);


                // ;;;;;; UTILISATION DE FIREBASE : stores the user's information
                userRef.update(user, function(error) {
                    if (error) {
                        toastr.error('Synchronization failed! : ' + error.message);


                        // ;;;;;; UTILISATION DE FIREBASE : if a problem when disconnection of user
                        self.fb.unauth();
                    } else {
                        toastr.success('Hi ' + user.name);
                    }
                });
            }
        }, {
            scope: 'email'
        });
    });



    $('#sign-out').on('click', function () {
        // ;;;;;; UTILISATION DE FIREBASE : disconnection of user
        self.fb.unauth();
    });



    // ;;;;;; UTILISATION DE FIREBASE : know whether the user is connected
    this.fb.onAuth(function (authData) {
        if (authData) {
            self.$signOut.removeClass('is-hidden');
        } else {
            self.$signOut.addClass('is-hidden');
        }
    });
};



























































// STEP 2

this.fb.onAuth(function (authData) {
    if (authData) {
        // functionality for connected
    }
});