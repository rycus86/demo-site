(function (app) {

    var base_url = 'http://gplay.api.viktoradam.net',
        package = 'hu.rycus',
        target = '#panel-googleplay';

    var generateMarkup = function (application) {
        var placeholder = $('<div/>').css('display', 'none');
        $(target).append(placeholder);

        $.post({
            url: '/render/googleplay',
            data: JSON.stringify(application),
            contentType: 'application/json',
            success: function (html) {
                placeholder.replaceWith($(html));
            }
        });
    };

    var loadProject = function (application) {
        $.get(base_url + '/details/' + application.package_name, function (details) {
            generateMarkup(details);
        });
    };

    var loadProjects = function () {
        $.get(base_url + '/search/' + package, function (applications) {
            applications.sort(function (a, b) {
                if (a.upload_date < b.upload_date) { return 1; } else { return -1; }
            }).forEach(function (application) {
                loadProject(application);
            });
        });
    };

    $(document).ready(function() {
        loadProjects();
    });

})(window.cApp);
