(function (app) {

    var base_url = 'http://github.api.viktoradam.net',
        username = 'rycus86',
        target = '#panel-github';

    var generateMarkup = function (repo) {
        var placeholder = $('<div/>').css('display', 'none');
        $(target).append(placeholder);

        $.post({
            url: '/render/github',
            data: JSON.stringify(repo),
            contentType: 'application/json',
            success: function (html) {
                placeholder.replaceWith($(html));

                $.get(base_url + '/repos/' + repo.full_name + '/readme', function (readme) {
                    var markup = $(readme);
                    markup.find('code').parents('p').addClass('code-wrapper');
                    $('#github-readme-' + repo.name).append(markup);

                    app.CodeHighlight.processCodeBlocks(markup);
                });
            }
        });
    };

    var loadProjects = function () {
        $.get(base_url + '/repos/' + username, function (repos) {
            repos.sort(function (a, b) {
                if (a.pushed_at < b.pushed_at) { return 1; } else { return -1; }
            }).forEach(function (repo) {
                generateMarkup(repo);
            });
        });
    };

    $(document).ready(function() {
        loadProjects();
    });

})(window.cApp);
