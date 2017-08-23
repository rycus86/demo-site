(function (app) {
    'use strict';

    var base_url = 'https://api.viktoradam.net/docker',
        username = 'rycus86',
        target = '#panel-dockerhub',

        pendingTasks = 0,
        pendingLoadProject = 0,
        pendingRenderProject = 0,
        pendingLoadTags = 0;

    var generateMarkup = function (repo, placeholder) {
        var trackGenerate = app.Tracking.start('Docker Hub render ' + username + '/' + repo.name, 'dockerhub');

        $.post({
            url: '/render/dockerhub',
            data: JSON.stringify(repo),
            contentType: 'application/json',
            complete: function () {
                $(target).children('.loading-panel').remove();

                pendingRenderProject--;
                updateProgress();
            },
            success: function (html) {
                trackGenerate.done();

                var content = $(html);
                placeholder.replaceWith(content);

                content.find('.mdl-js-spinner').each(function() {
                    componentHandler.upgradeElement($(this).get(0));
                });

                app.LazyLoad.images(content);
                app.CodeHighlight.processCodeBlocks('#dockerhub-' + repo.name + ' .readme');
            }
        });
    };

    var loadProject = function (repository_name) {
        var placeholder = $('<div/>').css('display', 'none');
        $(target).append(placeholder);

        var trackProject = app.Tracking.start('Docker Hub load ' + username + '/' + repository_name, 'dockerhub');

        $.get({
            url: base_url + '/repositories/' + username + '/' + repository_name,
            error: function () {
                $(target).children('.loading-panel').remove();
            },
            success: function (repo) {
                trackProject.done();

                generateMarkup(repo, placeholder);
            },
            complete: function (repo) {
                pendingLoadProject--;
                updateProgress();
            }
        });
    };

    var loadProjects = function () {
        if($(target).data('loaded')) {
            return;
        } else {
            $(target).data('loaded', 'true');

            app.StickyProgress.set('dockerhub', 2);
        }

        var trackProjects = app.Tracking.start('Docker Hub projects', 'dockerhub');

        $.get({
            url: base_url + '/repositories/' + username,
            error: function () {
                $(target).children('.loading-panel').remove();

                app.StickyProgress.set('dockerhub', 100);
                app.StickyProgress.hide('dockerhub');
            },
            success: function (response) {
                trackProjects.done();

                app.StickyProgress.set('dockerhub', 5);

                pendingLoadProject = pendingRenderProject = pendingLoadTags = response.results.length;
                pendingTasks = response.results.length * 3;

                response.results.sort(function (a, b) {
                    if (a.last_updated < b.last_updated) { return 1; } else { return -1; }
                }).forEach(function (repo) {
                    loadProject(repo.name);
                });
            }
        });
    };

    var generateTags = function (repo_full_name, container_id) {
        var trackTags = app.Tracking.start('Docker Hub tags ' + repo_full_name, 'dockerhub');

        $.get({
            url: base_url + '/repositories/' + repo_full_name + '/tags',
            error: function () {
                $('#' + container_id).empty().append($('<p><i>Failed to load tags</i></p>'));
            },
            success: function (response) {
                trackTags.done();

                var container = $('#' + container_id);
                var list = $('<ul class="mdl-list condensed-list"/>');

                response.results.forEach(function (tag) {
                    var item = $('<span class="mdl-list__item-primary-content"/>')
                                .append($('<i class="material-icons mdl-list__item-icon mdl-color-text--accent">label</i>'))
                                .append($('<span/>')
                                         .append(tag.name))
                                .append($('<span class="mdl-list__item-sub-title"/>')
                                         .append((tag.full_size / (1024.0 * 1024.0)).toFixed(2) + ' MB'));

                    list.append($('<li class="mdl-list__item mdl-list__item--two-line"/>').append(item));
                });

                container.empty().append($('<p>').append(list));
            },
            complete: function () {
                pendingLoadTags--;
                updateProgress();
            }
        });
    };

    var updateProgress = function () {
        var ratio = (pendingLoadProject + pendingRenderProject + pendingLoadTags) / pendingTasks;
        var progress = 5 + 95 - Math.round(95 * ratio);

        app.StickyProgress.set('dockerhub', progress);

        if (pendingLoadProject + pendingRenderProject + pendingLoadTags == 0) {
            app.StickyProgress.hide('dockerhub');
        }
    };

    app.Startup.addInitTask(function() {
        app.Navigation.onTabChange('dockerhub', function () {
            loadProjects();
        });
    });

    app.DockerHub = {
        generateTags: generateTags
    };

})(window.cApp);
