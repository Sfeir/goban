var Welcome = function () {
};

Welcome.prototype.showFormCreateGame = function () {
    this.templateCreate = _.template($('#template-create').html());
    $('#container-value').html('').addClass('is-visible').append(this.templateCreate);
};

Welcome.prototype.listGames = function (fb) {
	var that = this;
    fb.getGames().then(function (games) {
    	that.creatListGames(games);
    });
};

Welcome.prototype.creatListGames = function(games) {
	var listContainer = $('#list-games');
	$.each(games, function(k, v){
		var html = [];
		html.push('<a href="' + window.location.href + '?' + k + '" class="list-group-item">');
		html.push('<h4 class="list-group-item-heading">Game : ' + k + '</h4>');
		html.push('<p class="list-group-item-text"><b>Score :</b> -</p>');
		html.push('</a>');
		html = html.join('');
		listContainer.prepend(html);
	});
};