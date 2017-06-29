(function (app) {

    var base_url = 'http://github.api.viktoradam.net',
        username = 'rycus86',
        target = '#panel-github';

    var generateMarkup = function (repo) {
        var placeholder = $('<div/>').css('display', 'none');
        $(target).append(placeholder);

        app.Tracking.start('GitHub render ' + repo.full_name, 'github');
        $.post({
            url: '/render/github',
            data: JSON.stringify(repo),
            contentType: 'application/json',
            success: function (html) {
                app.Tracking.finish('GitHub render ' + repo.full_name, 'github');

                placeholder.replaceWith($(html));

                app.Tracking.start('GitHub readme ' + repo.full_name, 'github');
                $.get(base_url + '/repos/' + repo.full_name + '/readme', function (readme) {
                    app.Tracking.finish('GitHub readme ' + repo.full_name, 'github');

                    var markup = $(readme);
                    markup.find('code').parents('p').addClass('code-wrapper');
                    $('#github-readme-' + repo.name).append(markup);

                    app.CodeHighlight.processCodeBlocks(markup);
                });
            }
        });
    };

    var loadProjects = function () {
        app.Tracking.start('GitHub projects', 'github');

        $.get(base_url + '/repos/' + username, function (repos) {
            app.Tracking.finish('GitHub projects', 'github');

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
