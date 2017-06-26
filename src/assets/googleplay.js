(function (app) {

    var base_url = 'http://gplay.api.viktoradam.net',
        package = 'hu.rycus',
        target = '#panel-googleplay';

    var convertUploadDateToISO = function (application) {
        var parsed_date = moment(application.upload_date, 'MMM D, YYYY');
        application.upload_date = parsed_date.format();
    };

    var generateMarkup = function (application, placeholder) {
        convertUploadDateToISO(application);

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
        var placeholder = $('<div/>').css('display', 'none');
        $(target).append(placeholder);

        $.get(base_url + '/details/' + application.package_name, function (details) {
            generateMarkup(details, placeholder);
        });
    };

    var loadProjects = function () {
        $.get(base_url + '/search/' + package, function (applications) {
            applications.forEach(convertUploadDateToISO);

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
