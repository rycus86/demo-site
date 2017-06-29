window.cApp = (function () {

    $(document).ready(function() {
        cApp.Startup.initSlickCarousel();
        cApp.Startup.initTabs();
    });

    return {
        Startup: {
            initTabs: function() {
                $('.mdl-layout__tab-bar').children().each(function() {
                    $(this).on('click', function(evt) {
                        evt.preventDefault();

                        var tab = $(this).attr('id').replace('tab-', '');

                        cApp.Navigation.goToTab(tab);
                        $('main').scrollTop(0);
                    });
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
                var target_link = $('#tab-' + tab_id);

                var current_id = current_link.attr('id').replace('tab-', '');
                var target_id = tab_id;

                if (current_id === target_id) {
                    return;
                }

                if (!document.getElementById(target_id)) {
                    return;
                }

                var current = $('#' + current_id);
                var target = $('#' + target_id);

                current.fadeOut(150, function() {
                    history.pushState({}, window.title, '/page/' + tab_id);

                    ga('set', 'page', '/page/' + tab_id);
                    ga('send', 'pageview');

                    current_link.toggleClass('is-active');
                    target_link.toggleClass('is-active');

                    $('main').scrollTop(0);

                    target.fadeIn(150);
                });
            }
        },

        CodeHighlight: {
            processCodeBlocks: function (container) {
                var code_blocks = $(container).find('pre code');
                for (var idx = 0; idx < code_blocks.length; idx++) {
                    window.hljs.highlightBlock(code_blocks[idx]);
                }
            }
        },

        Tracking: {
            _all: {},

            start: function (title, label) {
                cApp.Tracking._all[label + '::' + title + '::start'] = new Date();
            },

            finish: function (title, label) {
                _all = cApp.Tracking._all;

                var finished = new Date();
                _all[label + '::' + title + '::end'] = finished;

                var started = _all[label + '::' + title + '::start'];

                if (!!started) {
                    var total = Math.round(finished - started);
                    ga('send', 'timing', title, label, finished);
                }
            }
        }
    };

})();
