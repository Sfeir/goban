var Utils = function () {

};

Utils.checkFirebaseId = function (id) {
    var res = id.match(new RegExp("(-)[-_0-9a-zA-Z]{19}"));
    return !_.isNull(res) && res.length > 0;
};
