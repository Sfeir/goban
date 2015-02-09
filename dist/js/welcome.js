var Welcome = function () {
};

Welcome.prototype.showFormCreateGame = function () {
    this.templateCreate = _.template($('#template-create').html());
    $('#container-value').html('').addClass('is-visible').append(this.templateCreate);
};
