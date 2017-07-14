(function (app) {

    var base_url = 'http://api.viktoradam.net/gplay',
        developer_name = 'Viktor Adam',
        target = '#panel-googleplay';

    var convertUploadDateToISO = function (application) {
        var parsed_date;

        if (application.upload_date.test(/^[0-9]+ [A-Z][a-z]+ [0-9]{4}$/) {
            parsed_date = moment(application.upload_date, 'D MMM YYYY');
        } else {
            parsed_date = moment(application.upload_date, 'MMM D, YYYY');
        }

        application.upload_date = parsed_date.format();
    };

    var generateMarkup = function (application, placeholder) {
        convertUploadDateToISO(application);

        var trackGenerate = app.Tracking.start('Google Play render ' + application.package_name, 'googleplay');

        $.post({
            url: '/render/googleplay',
            data: JSON.stringify(application),
            contentType: 'application/json',
            success: function (html) {
                trackGenerate.done();

                placeholder.replaceWith($(html));
            }
        });
    };

    var loadProject = function (application) {
        var placeholder = $('<div/>').css('display', 'none');
        $(target).append(placeholder);

        var trackProject = app.Tracking.start('Google Play load ' + application.package_name, 'googleplay');

        $.get(base_url + '/details/' + application.package_name, function (details) {
            trackProject.done();

            generateMarkup(details, placeholder);
        });
    };

    var loadProjects = function () {
        var trackProjects = app.Tracking.start('Google Play projects', 'googleplay');

        $.get(base_url + '/developer/' + developer_name, function (applications) {
            trackProjects.done();

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
