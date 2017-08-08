window.cApp = (function () {

    $(window).on('load', function () {
        cApp.LazyLoad.css();
        cApp.LazyLoad.images($('body'));

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

        LazyLoad: {
            css: function () {
                $('meta[name=custom-fetch-css]').each(function () {
                    var placeholder = $(this);
                    var href = placeholder.attr('content');

                    placeholder.replaceWith(
                        $('<link>').attr('rel', 'stylesheet')
                                   .attr('href', href)
                                   .attr('type', 'text/css'));
                });
            },

            images: function (container) {
                container.find('img[data-src]').each(function () {
                    var img = $(this);
                    img.attr('src', img.data('src'));
                    img.removeAttr('data-src');
                });

                container.find('*[data-background-image]').each(function () {
                    var item = $(this);

                    var position = item.data('background-position');
                    if (!!position) {
                        item.css('background-position', position);
                        item.removeAttr('data-background-position');
                    }

                    var size = item.data('background-size');
                    if (!!size) {
                        item.css('background-size', size);
                        item.removeAttr('data-background-size');
                    }

                    item.css('background-image', 'url(' + item.data('background-image') + ')');
                    item.removeAttr('data-background-image');
                });
            },
        },

        Navigation: {
            on_change_listeners: [],

            getSelectedTab: function () {
                var current_link = $('a.mdl-layout__tab.is-active');
                return current_link.attr('id').replace('tab-', '');
            },

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

                cApp.Navigation.fireTabChange(target_id);

                var current = $('#' + current_id);
                var target = $('#' + target_id);

                current.fadeOut(150, function () {
                    history.pushState({}, window.title, '/page/' + tab_id);

                    if (!!window.TabTitles && target_id in window.TabTitles) {
                        document.title = window.TabTitles[target_id];
                    }

                    ga('set', 'page', '/page/' + tab_id);
                    ga('send', 'pageview');

                    current_link.toggleClass('is-active');
                    target_link.toggleClass('is-active');

                    $('main').scrollTop(0);

                    target.fadeIn(150);
                });
            },

            onTabChange: function (target_tab, callback) {
                cApp.Navigation.on_change_listeners.push({'target': target_tab, 'callback': callback});

                if (cApp.Navigation.getSelectedTab() === target_tab) {
                    callback();
                }
            },

            fireTabChange: function (target_tab) {
                cApp.Navigation.on_change_listeners.forEach(function (listener) {
                    if (listener.target === target_tab) {
                        listener.callback();
                    }
                });
            }
        },

        CodeHighlight: {
            initialize: function () {
                if (!!hljs) {
                    hljs.configure({
                        languages: ['java', 'python', 'dockerfile', 'yaml', 'xml', 'html', 'shell', 'bash']
                    });

                    $('pre code').each(function(i, block) {
                        hljs.highlightBlock(block);
                    });
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
