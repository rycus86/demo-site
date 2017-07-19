(function (app) {

    app.DateTime = {

        formatTimeFromNow: function (container_id) {
            $('#' + container_id + ' *[data-time]').each(function (index, item) {
                var element = $(item),
                    formatted = moment(element.data('time')).fromNow(),
                    prefix = element.data('prefix');

                element.html('');
                if (!!prefix) {
                    element.append(prefix);
                    element.append(' ');
                }
                element.append($('<b/>').append(formatted));
            });
        },

        formatDateTime: function (container_id) {
            $('#' + container_id + ' *[data-datetime]').each(function (index, item) {
                var element = $(item);

                var m = moment(element.data('datetime'));
                element.html(m.format('MMMM D, YYYY, HH:mm'));

                componentHandler.upgradeElement(item);
            });
        },

        formatDate: function (container_id) {
            $('#' + container_id + ' *[data-date]').each(function (index, item) {
                var element = $(item);

                var m = moment(element.data('date'));
                element.html(m.format('MMMM D, YYYY'));
            });
        }

    };

})(window.cApp);
