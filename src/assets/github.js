(function (app) {

    var base_url = '//api.viktoradam.net/github',
        username = 'rycus86',
        target = '#panel-github';

    var generateMarkup = function (repo) {
        var placeholder = $('<div/>').css('display', 'none');
        $(target).append(placeholder);

        var trackGenerate = app.Tracking.start('GitHub render ' + repo.full_name, 'github');
        $.post({
            url: '/render/github',
            data: JSON.stringify(repo),
            contentType: 'application/json',
            success: function (html) {
                trackGenerate.done();

                placeholder.replaceWith($(html));

                $(target).remove('.loading-panel');

                var trackReadme = app.Tracking.start('GitHub raw readme ' + repo.full_name, 'github');
                $.get(base_url + '/repos/' + repo.full_name + '/readme/raw', function (raw_readme) {
                    trackReadme.done();

                    var trackMarkdown = app.Tracking.start('GitHub readme markdown ' + repo.full_name, 'github');
                    $.post({
                        url: '/markdown',
                        data: raw_readme,
                        contentType: 'text/plain',
                        success: function (readme) {
                            trackMarkdown.done();

                            var markup = $(readme);
                            markup.find('code').parents('p').addClass('code-wrapper');
                            $('#github-readme-' + repo.name).append(markup);

                            app.CodeHighlight.processCodeBlocks(markup);
                        }
                    });
                });
            }
        });
    };

    var loadProjects = function () {
        if($(target).data('loaded')) {
            return;
        } else {
            $(target).data('loaded', 'true');
        }

        var trackProjects = app.Tracking.start('GitHub projects', 'github');

        $.get(base_url + '/repos/' + username, function (repos) {
            trackProjects.done();

            repos.sort(function (a, b) {
                if (a.fork && !b.fork) { return 1; }
                if (!a.fork && b.fork) { return -1; }

                if (a.pushed_at < b.pushed_at) { return 1; } else { return -1; }
            }).forEach(function (repo) {
                generateMarkup(repo);
            });
        });
    };

    app.Startup.addInitTask(function() {
        app.Navigation.onTabChange('github', function () {
            loadProjects();
        });
    });

})(window.cApp);
