var Oauth = function () {
};

Oauth.dataOauthToJson = function (authData) {

    var data, user = { "last_login_at": Firebase.ServerValue.TIMESTAMP };

    if (_.isEmpty(authData)) {
        return {};
    }

    if (!_.isEmpty(authData.google)) {
        data = authData.google.cachedUserProfile;

        user.name = data.name;
        user.picture = data.picture + "?sz=150";

        return user;
    }

    if (!_.isEmpty(authData.twitter)) {
        data = authData.twitter.cachedUserProfile;
        var picture = (data.profile_image_url).replace("normal", "bigger");

        user.name = data.name;
        user.picture = picture;

        return user;
    }

    return user;
};
