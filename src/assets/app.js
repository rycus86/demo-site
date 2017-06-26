window.cApp = (function () {

    $(document).ready(function() {
        cApp.Startup.initSlickCarousel();
        cApp.Startup.initTabs();
    });

    return {
        Startup: {
            initTabs: function() {
                $('.mdl-layout__tab-bar').children().each(function() {
                    $(this).on('click', function() {
                        $('main').scrollTop(0);

                        if (!!ga) {
                            var link = $(this).find('a').first();
                            if (!!link) {
                                var tab = link.attr('href').slice(1);

                                ga('send', 'pageview', '/tabs/' + tab);
                            }
                        }
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
                var target_link = $('a[href="#' + tab_id + '"');

                var current_id = current_link.attr('href').split('#')[1];
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
        }
    };

})();
