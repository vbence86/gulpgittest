var SHARED = window.SHARED || {};
SHARED.mobileSiteNav = (function (SHARED, $) {
    var isLoaded = false;
    var isMobileNav = false;
    var $body = null;
    var $header = null;
    var selector = {
        mobileNav:'#MobileSiteNav',
        mobileMenuButton:'#MobileMenuButton',
        closeMobileNav: '.closeNav',
        viewMobileNav:'mobileNav'
    };

    var process = {
        init: function() {
            if(isLoaded){
                return;
            }

            $body = $('body');
            $header = $('header');

            SHARED.mobileSiteNav.initMobileNav();

            SHARED.mobileSiteNav.addEvents();

            isLoaded = true;
        },

        addEvents: function(){
            SHARED.mobileSiteNav.addMenuClickEvents();
            SHARED.mobileSiteNav.addResizeEvents();
            SHARED.mobileSiteNav.addOrientationChangeEvents();
            SHARED.mobileSiteNav.addBodyTouchEvents();
            SHARED.mobileSiteNav.addSwipeEvents();
        },

        addMenuClickEvents: function(){
            $(selector.mobileMenuButton).on('click', function() {
                SHARED.mobileSiteNav.toggleMobileNav();
            });
            $(selector.closeMobileNav).on('click', function() {
                SHARED.mobileSiteNav.closeMobileNav();
            });
        },

        addResizeEvents: function(){
            $(window).resize(function(){
                if(!SHARED.utils.isIOS() && !SHARED.utils.isAndroid() ) {
                    if(!isMobileNav){
                        SHARED.mobileSiteNav.initMobileNav();
                    }
                    SHARED.mobileSiteNav.resetMobileNav();
                }
            });
        },

        addOrientationChangeEvents: function(){
            $(window).on('orientationchange', function(){
                window.setTimeout(function() {
                    SHARED.mobileSiteNav.setMobileNavHeight();
                }, 1000);
                SHARED.mobileSiteNav.resetMobileNav();
                if(!isMobileNav){
                    SHARED.mobileSiteNav.initMobileNav();
                }
            });
        },

        addBodyTouchEvents: function(){
            $body.on('touchstart', function(e) {
                if( SHARED.mobileSiteNav.isMobileNavActive() && $(selector.mobileNav).has( e.target ).length <= 0 ){
                    e.preventDefault();
                    e.stopPropagation();
                    SHARED.mobileSiteNav.closeMobileNav();
                }
            });
        },

        addSwipeEvents: function(){
            if(isMobileNav){
                $('#MobileSiteNav').hammer().bind('swipeleft', function(e) {
                    SHARED.mobileSiteNav.closeMobileNav();
                });
            }
        },

        isMobileNavActive: function(){
            return $body.hasClass(selector.viewMobileNav);
        },

        toggleMobileNav: function() {
            $body.toggleClass(selector.viewMobileNav);
        },

        closeMobileNav: function() {
            $body.removeClass(selector.viewMobileNav);
        },

        moveHeaderToTop: function(){
            // move header to top
            // so we can fix for device
            $header.prependTo('body');
        },

        moveHeaderBack: function(){
            // move header back into main
            $header.prependTo('main');
        },

        resetMobileNav: function() {
            if( !SHARED.utils.isSmallScreen() ){
                SHARED.mobileSiteNav.moveHeaderBack();
                if( SHARED.mobileSiteNav.isMobileNavActive() ) {
                    $('main').css('height', '');
                    SHARED.mobileSiteNav.closeMobileNav();
                }
            } else {
                if( SHARED.mobileSiteNav.isMobileNavActive() ) {
                    SHARED.mobileSiteNav.setMobileNavHeight();
                    $(selector.mobileMenuButton).trigger('click');
                }
            }
        },

        setMobileNavHeight: function(){
            var winHeight = $(window).height();
            var headerHeight = $header.height();

            $(selector.mobileNav).css({
                'height': (winHeight + headerHeight)
            });
            $('.navScollWrapper', selector.mobileNav).css({
                'height': (winHeight - headerHeight)
            });
        },

        initMobileNav: function() {
            if( SHARED.utils.isSmallScreen() ){
                SHARED.mobileSiteNav.moveHeaderToTop();
                SHARED.mobileSiteNav.setMobileNavHeight();
                isMobileNav = true;
            }
        }

    };

    SHARED.utils.functionList.push({ test: '#MobileSiteNav', func: process.init });
    return process;

})(SHARED, $);
