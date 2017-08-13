(function (app) {
    'use strict';

    // Big thanks to inigotoro on the initial implementation!

    var SwipeController = {

        isTouchDevice_: false,

        $window: $(window),
        $tabs: $('.mdl-layout__tab'),

        init: function () {
            var swipeListener = new Hammer(document.querySelector('.mdl-layout__content'));
            swipeListener.on('swipeleft swiperight', this.gestureDetector.bind(this));
        },

        gestureDetector: function (ev) {
            if (!this.isTouchDevice_) {
                return;
            }

            var $currentTab = $('.mdl-layout__tab.is-active');
            var isFirstTab = $currentTab.index() === 0;
            var isLastTab = $currentTab.index() === this.$tabs.length - 1;
            var targetTab = null;

            switch (ev.type) {
                case 'swipeleft': {
                    if (isLastTab) {
                        targetTab = this.$tabs.first();
                    } else {
                        targetTab = $currentTab.next();
                    }

                    break;
                }
                case 'swiperight': {
                    if (isFirstTab) {
                        targetTab = this.$tabs.last();
                    } else {
                        targetTab = $currentTab.prev();
                    }

                    break;
                }
            }
            
            if (!!targetTab) {
                app.Navigation.goToTab(targetTab.attr('id').replace('tab-', ''));
            }
        }

    };

    var touchTrigger = function () {
        SwipeController.isTouchDevice_ = true;
        window.removeEventListener('touchstart', touchTrigger, false);
    };

    window.addEventListener('touchstart', touchTrigger, false);
    
    app.Startup.addInitTask(function() {
        SwipeController.init();
    });

})(window.cApp);
