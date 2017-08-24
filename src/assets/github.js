(function (app) {
    'use strict';

    var base_url = 'https://api.viktoradam.net/github',
        username = 'rycus86',
        target = '#panel-github',

        pendingTasks = 0,
        pendingRenderPanel = 0,
        pendingLoadReadme = 0,
        pendingRenderReadme = 0;

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

                pendingRenderPanel--;
                updateProgress();
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

                        pendingRenderReadme--;
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
                            },
                            complete: function () {
                                pendingRenderReadme--;
                                updateProgress();
                            }
                        });
                    },
                    complete: function () {
                        pendingLoadReadme--;
                        updateProgress();
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

            app.StickyProgress.set('github', 2);
        }

        var trackProjects = app.Tracking.start('GitHub projects', 'github');

        $.get({
            url: base_url + '/repos/' + username,
            error: function () {
                $(target).children('.loading-panel').remove();

                app.StickyProgress.set('github', 100);
                app.StickyProgress.hide('github');
            },
            success: function (repos) {
                trackProjects.done();

                app.StickyProgress.set('github', 5);

                pendingRenderPanel = pendingLoadReadme = pendingRenderReadme = repos.length;
                pendingTasks = repos.length * 3;

                repos.sort(function (a, b) {
                    if (a.fork && !b.fork) { return 1; }
                    if (!a.fork && b.fork) { return -1; }

                    if (a.pushed_at < b.pushed_at) { return 1; } else { return -1; }
                }).forEach(function (repo) {
                    generateMarkup(repo);
                });

                // make sure the last panel is left aligned
                for (var idx = 0; idx < 3 - (repos.length % 3); idx++) {
                    var placeholder = $('<div/>').addClass('mdl-cell mdl-cell--4-col empty-cell');
                    $(target).append(placeholder);
                }
            }
        });
    };

    var updateProgress = function () {
        var ratio = (pendingRenderPanel + pendingLoadReadme + pendingRenderReadme) / pendingTasks;
        var progress = 5 + 95 - Math.round(95 * ratio);

        app.StickyProgress.set('github', progress);

        if (pendingRenderPanel + pendingLoadReadme + pendingRenderReadme == 0) {
            app.StickyProgress.hide('github');
        }
    };

    app.Startup.addInitTask(function() {
        app.Navigation.onTabChange('github', function () {
            loadProjects();
        });
    });

})(window.cApp);
