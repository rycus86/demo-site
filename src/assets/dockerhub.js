(function (app) {

    var base_url = 'http://docker.api.viktoradam.net',
        username = 'rycus86',
        target = '#panel-dockerhub';

    var generateMarkup = function (repo, placeholder) {
        $.post({
            url: '/render/dockerhub',
            data: JSON.stringify(repo),
            contentType: 'application/json',
            success: function (html) {
                placeholder.replaceWith($(html));
            }
        });
    };

    var loadProject = function (repository_name) {
        var placeholder = $('<div/>').css('display', 'none');
        $(target).append(placeholder);

        $.get(base_url + '/repositories/' + username + '/' + repository_name, function (repo) {
            generateMarkup(repo, placeholder);
        });
    };

    var loadProjects = function () {
        $.get(base_url + '/repositories/' + username, function (response) {
            response.results.sort(function (a, b) {
                if (a.last_updated < b.last_updated) { return 1; } else { return -1; }
            }).forEach(function (repo) {
                loadProject(repo.name);
            });
        });
    };

    var generateTags = function (repo_full_name, container_id) {
        $.get(base_url + '/repositories/' + repo_full_name + '/tags', function (response) {
            var container = $('#' + container_id);

            var list = $('<ul class="mdl-list condensed-list"/>');
            container.append(list);

            response.results.forEach(function (tag) {
                var item = $('<span class="mdl-list__item-primary-content"/>')
                            .append($('<i class="material-icons mdl-list__item-icon mdl-color-text--cyan">label</i>'))
                            .append($('<span/>')
                                     .append(tag.name))
                            .append($('<span class="mdl-list__item-sub-title"/>')
                                     .append((tag.full_size / (1024.0 * 1024.0)).toFixed(2) + ' MB'));

                list.append($('<li class="mdl-list__item mdl-list__item--two-line"/>').append(item));
            });

            container.show();
        });
    };

    $(document).ready(function() {
        loadProjects();
    });

    app.DockerHub = {
        generateTags: generateTags
    };  // TODO

})(window.cApp);
