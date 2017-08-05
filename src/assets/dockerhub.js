(function (app) {

    var base_url = 'https://api.viktoradam.net/docker',
        username = 'rycus86',
        target = '#panel-dockerhub',
        projects_to_load = -1;

    var generateMarkup = function (repo, placeholder) {
        var trackGenerate = app.Tracking.start('Docker Hub render ' + username + '/' + repo.name, 'dockerhub');

        $.post({
            url: '/render/dockerhub',
            data: JSON.stringify(repo),
            contentType: 'application/json',
            success: function (html) {
                trackGenerate.done();

                var content = $(html);
                placeholder.replaceWith(content);

                if (--projects_to_load <= 0) {
                    $(target).children('.loading-panel').remove();
                }

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

        $.get(base_url + '/repositories/' + username + '/' + repository_name, function (repo) {
            trackProject.done();

            generateMarkup(repo, placeholder);
        });
    };

    var loadProjects = function () {
        if($(target).data('loaded')) {
            return;
        } else {
            $(target).data('loaded', 'true');
        }

        var trackProjects = app.Tracking.start('Docker Hub projects', 'dockerhub');

        $.get(base_url + '/repositories/' + username, function (response) {
            trackProjects.done();

            projects_to_load = response.results.length;

            response.results.sort(function (a, b) {
                if (a.last_updated < b.last_updated) { return 1; } else { return -1; }
            }).forEach(function (repo) {
                loadProject(repo.name);
            });
        });
    };

    var generateTags = function (repo_full_name, container_id) {
        var trackTags = app.Tracking.start('Docker Hub tags ' + repo_full_name, 'dockerhub');

        $.get(base_url + '/repositories/' + repo_full_name + '/tags', function (response) {
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
        });
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
