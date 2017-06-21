window.cApp = (function () {

    $(document).ready(function() {
        cApp.Startup.initSlickCarousel();
        cApp.Startup.initTabs();
    });

    return {
        Startup: {
            initTabs: function() {
                $('a.mdl-layout__tab').click(function(event) {
                    var target_link = $(event.currentTarget);
                    var target_id = target_link.attr('href').split('#')[1];

                    window.cApp.Navigation.goToTab(target_id);
                });
            },

            initSlickCarousel: function() {
                $('.slick-carousel').slick({
                    infinite: true,
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    dots: true,
                    centerMode: true,
                    variableWidth: true
                });
            }
        },

        Navigation: {
            goToTab: function (tab_id) {
                var current_link = $('a.mdl-layout__tab.is-active');
                var target_link = $('a[href="#' + tab_id + '"');

                var current_id = current_link.attr('href').split('#')[1];
                var target_id = tab_id;

                if (current_id === target_id) {
                    return;
                }

                var current = $('#' + current_id);
                var target = $('#' + target_id);

                current.fadeOut(150, function() {
                    current_link.toggleClass('is-active');
                    target_link.toggleClass('is-active');

                    $('main').scrollTop(0);

                    target.fadeIn(150);
                });
            }
        }
    };

})();
