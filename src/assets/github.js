(function (app) {

    var base_url = 'https://api.viktoradam.net/github',
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
            complete: function () {
                $(target).children('.loading-panel').remove();
            },
            success: function (html) {
                trackGenerate.done();

                var content = $(html);
                placeholder.replaceWith(content);

                content.find('.mdl-js-spinner').each(function() {
                    componentHandler.upgradeElement($(this).get(0));
                });

                var trackReadme = app.Tracking.start('GitHub raw readme ' + repo.full_name, 'github');
                $.get({
                    url: base_url + '/repos/' + repo.full_name + '/readme/raw',
                    error: function () {
                        $('#github-readme-' + repo.name).empty().append($('<p><i>None</i></p>'));
                    },
                    success: function (raw_readme) {
                        trackReadme.done();

                        var trackMarkdown = app.Tracking.start('GitHub readme markdown ' + repo.full_name, 'github');
                        $.post({
                            url: '/markdown',
                            data: raw_readme,
                            contentType: 'text/plain',
                            error: function () {
                                $('#github-readme-' + repo.name).empty().append($('<p><i>Failed to render</i></p>'));
                            },
                            success: function (readme) {
                                trackMarkdown.done();

                                var markup = $(readme);
                                markup.find('code').parents('p').addClass('code-wrapper');
                                $('#github-readme-' + repo.name).empty().append(markup);

                                app.LazyLoad.images(markup);
                                app.CodeHighlight.processCodeBlocks('#github-' + repo.name + ' .readme');
                            }
                        });
                    }
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

        $.get({
            url: base_url + '/repos/' + username,
            error: function () {
                $(target).children('.loading-panel').remove();
            },
            success: function (repos) {
                trackProjects.done();

                repos.sort(function (a, b) {
                    if (a.fork && !b.fork) { return 1; }
                    if (!a.fork && b.fork) { return -1; }

                    if (a.pushed_at < b.pushed_at) { return 1; } else { return -1; }
                }).forEach(function (repo) {
                    generateMarkup(repo);
                });
            }
        });
    };

    app.Startup.addInitTask(function() {
        app.Navigation.onTabChange('github', function () {
            loadProjects();
        });
    });

})(window.cApp);
