window.cApp = (function () {
    'use strict';

    $(window).on('load', function () {
        cApp.LazyLoad.css();
        cApp.LazyLoad.images($('body'));

        cApp.Startup.initTabs();
        cApp.Startup.initTabLinks();

        cApp.Startup.initTasks_.forEach(function (task) {
            task.call();
        });

        cApp.Scroll.initialize();
        cApp.Scroll.registerListeners();

        cApp.Navigation.ensureActiveTabIsVisible();
        cApp.StickyProgress.initialize();
        cApp.CodeHighlight.initialize();
    });

    return {
        Startup: {
            initTasks_: [],

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
                cApp.Startup.initTasks_.push(task);
            }
        },

        LazyLoad: {
            css: function () {
                $('meta[name=custom-fetch-css]').each(function () {
                    var $placeholder = $(this);
                    var href = $placeholder.attr('content');

                    $placeholder.replaceWith(
                        $('<link>').attr('rel', 'stylesheet')
                                   .attr('href', href)
                                   .attr('type', 'text/css'));
                });
            },

            images: function (container) {
                container.find('img[data-src]').each(function () {
                    var $img = $(this);
                    var source = $img.data('src');

                    if (source.indexOf('http://') !== 0) {
                        // do not load images on HTTP
                        $img.attr('src', source);
                    }

                    $img.removeAttr('data-src');
                });

                container.find('*[data-background-image]').each(function () {
                    var $item = $(this);

                    var position = $item.data('background-position');
                    if (!!position) {
                        $item.css('background-position', position);
                        $item.removeAttr('data-background-position');
                    }

                    var size = $item.data('background-size');
                    if (!!size) {
                        $item.css('background-size', size);
                        $item.removeAttr('data-background-size');
                    }

                    $item.css('background-image', 'url(' + $item.data('background-image') + ')');
                    $item.removeAttr('data-background-image');
                });
            },
        },

        Navigation: {
            onChangeListeners_: [],

            getSelectedTab: function () {
                var $currentLink = $('a.mdl-layout__tab.is-active');
                return $currentLink.attr('id').replace('tab-', '');
            },

            isTabSelected: function (tabId) {
                return this.getSelectedTab() === tabId;
            },

            goToTab: function (tabId) {
                var $currentLink = $('a.mdl-layout__tab.is-active');
                var $targetLink = $('#tab-' + tabId);

                var currentId = $currentLink.attr('id').replace('tab-', '');
                var targetId = tabId;

                if (currentId === targetId) {
                    return;
                }

                if (!document.getElementById(targetId)) {
                    return;
                }

                cApp.StickyProgress.hide(currentId);

                var $current = $('#' + currentId);
                var $target = $('#' + targetId);

                $current.fadeOut(150, function () {
                    history.pushState({}, window.title, '/page/' + tabId);

                    if (!!window.TabTitles && targetId in window.TabTitles) {
                        document.title = window.TabTitles[targetId];
                    }

                    ga('set', 'page', '/page/' + tabId);
                    ga('send', 'pageview');

                    $currentLink.toggleClass('is-active');
                    $targetLink.toggleClass('is-active');

                    $current.toggleClass('is-active');
                    $target.toggleClass('is-active');

                    $('main').scrollTop(0);

                    cApp.Navigation.fireTabChange(targetId);
                    cApp.Navigation.ensureActiveTabIsVisible();

                    $target.fadeIn(150);
                });
            },

            ensureActiveTabIsVisible: function () {
                var $target = $('a.mdl-layout__tab.is-active');
                var bounds = $target.get(0).getBoundingClientRect();

                if (bounds.left < 0) {
                    var offset = bounds.left - 4;
                    $target.parent().scrollLeft($target.parent().scrollLeft() + offset);
                } else if (bounds.right > $(window).width()) {
                    var offset = bounds.right - $(window).width() + 4;
                    $target.parent().scrollLeft($target.parent().scrollLeft() + offset);
                }
            },

            onTabChange: function (targetTab, callback) {
                cApp.Navigation.onChangeListeners_.push({'target': targetTab, 'callback': callback});

                if (cApp.Navigation.getSelectedTab() === targetTab) {
                    callback();
                }
            },

            fireTabChange: function (targetTab) {
                cApp.Navigation.onChangeListeners_.forEach(function (listener) {
                    if (listener.target === targetTab) {
                        listener.callback();
                    }
                });
            }
        },

        Scroll: {
            listeners_: [],

            pending_: false,
            endScrollHandle_: null,

            initialize: function () {
                var _this = cApp.Scroll;

                $('main').scroll(function () {
                    if (_this.pending_) {
                        return;
                    }

                    _this.pending_ = true;

                    clearTimeout(_this.endScrollHandle_);

                    _this.onScroll();

                    setTimeout(function () {
                        _this.pending_ = false;
                    }, 300);

                    _this.endScrollHandle_ = setTimeout(function () {
                        _this.onScroll();
                    }, 500);
                });
            },

            registerListeners: function () {
                cApp.Scroll.setupFab();
            },

            onScroll: function () {
                cApp.Scroll.listeners_.forEach(function (listener) {
                    listener();
                });
            },

            setupFab: function () {
                var $button = $('.specs-fab-menu');
                var $footer = $('footer');

                cApp.Scroll.listeners_.push(function () {
                    var margin = $button.css('margin-bottom');
                    if (!!margin) {
                        margin = parseInt(margin.substring(0, margin.length - 2));
                    }

                    var threshold = button.offset().top + button.outerHeight() / 2 + margin;
                    var offset = footer.offset().top;

                    if (offset < threshold) {
                        $button.stop().animate({'margin-bottom': '-100px'}, 'fast').addClass('off-screen');
                    } else if (offset > threshold) {
                        $button.removeClass('off-screen').stop().animate({'margin-bottom': '0'}, 'fast');
                    }
                });

                var $header = $('header');
                var $main = $('main');

                $button.find('a').each(function (index, item) {
                    var $item = $(item);
                    var $target = $($item.attr('href'));

                    $item.click(function (event) {
                        event.preventDefault();

                        $main.animate({
                            scrollTop: $target.offset().top + $main.scrollTop() - $header.outerHeight()
                        }, 1000);
                    });
                });
            }
        },

        StickyProgress: {
            progressbar_: $('.sticky-progress'),

            initialize: function () {
                this.progressbar_.hide(); 
            },

            set: function (tabId, value) {
                if (!cApp.Navigation.isTabSelected(tabId)) {
                    return;
                }

                if (!!this.progressbar_.get(0).MaterialProgress) {
                    if (!this.progressbar_.is(':visible')) {
                        this.progressbar_.fadeIn('fast');
                    }

                    this.progressbar_.get(0).MaterialProgress.setProgress(value);
                }
            },

            hide: function (tabId) {
                if (!cApp.Navigation.isTabSelected(tabId)) {
                    return;
                }
                
                this.progressbar_.fadeOut();
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
                var codeBlocks = $(container).find('pre code');
                for (var idx = 0; idx < codeBlocks.length; idx++) {
                    window.hljs.highlightBlock(codeBlocks[idx]);
                }
            }
        },

        Tracking: {
            start: function (title, label) {
                var startTime = new Date();

                return {
                    done: function () {
                        var endTime = new Date();

                        ga('send', 'timing', title, label, endTime - startTime);
                    }
                };
            }
        }
    };

})();
