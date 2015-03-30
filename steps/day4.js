

// STEP 1

Welcome.prototype.getGames = function () {
    // use promise
    var def = $.Deferred();

    // ;;;;;; UTILISATION DE FIREBASE : games node
    var gamesRef = this.fb.child('games');


    // ;;;;;; UTILISATION DE FIREBASE : Listen the node and get the 5 last games
    gamesRef.limitToLast(5).on('value', function (snap) {
        def.notify(snap);
    });

    return def.promise();
};

















































// STEP 2

Welcome.prototype.listGames = function () {

    this.getGames().progress(function (games) {
        games.forEach(function(game) {
            // render on HTML
        });
    });
};