window.cApp = (function () {

    $(window).on('load', function () {
        cApp.Startup.initSlickCarousel();
        cApp.Startup.initTabs();
        cApp.Startup.initTabLinks();

        cApp.Startup.init_tasks.forEach(function (task) {
            task.call();
        });

        cApp.CodeHighlight.initialize();
    });

    return {
        Startup: {
            init_tasks: [],

            initTabs: function () {
                $('.mdl-layout__tab-bar').children().each(function () {
                    $(this).on('click', function (evt) {
                        evt.preventDefault();

                        var tab = $(this).attr('id').replace('tab-', '');

                        cApp.Navigation.goToTab(tab);
                        $('main').scrollTop(0);
                    });
                });
            },

            initSlickCarousel: function () {
                $('.slick-carousel').slick({
                    infinite: true,
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    dots: true,
                    centerMode: true,
                    variableWidth: true
                });
            },

            initTabLinks: function () {
                $('a[data-target-tab]').each(function () {
                    var target_tab = $(this).data('target-tab');

                    $(this).click(function (evt) {
                        evt.preventDefault();
                        cApp.Navigation.goToTab(target_tab);
                    });
                });
            },

            addInitTask: function (task) {
                cApp.Startup.init_tasks.push(task);
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

                current.fadeOut(150, function () {
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
            initialize: function () {
                if (!!hljs) {
                    hljs.configure({
                        languages: ['java', 'python', 'dockerfile', 'yaml', 'xml', 'html', 'shell', 'bash']
                    });
                    hljs.initHighlightingOnLoad();
                }
            },

            processCodeBlocks: function (container) {
                var code_blocks = $(container).find('pre code');
                for (var idx = 0; idx < code_blocks.length; idx++) {
                    window.hljs.highlightBlock(code_blocks[idx]);
                }
            }
        },

        Tracking: {
            start: function (title, label) {
                var start_time = new Date();

                return {
                    done: function () {
                        var end_time = new Date();

                        ga('send', 'timing', title, label, end_time - start_time);
                    }
                };
            }
        }
    };

})();
