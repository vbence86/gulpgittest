var SHARED = window.SHARED || {};
SHARED.megaNav = (function (SHARED, $) {
    var isLoaded = false;
    var subNavTimeout;
    var $siteNavItems = null;
    var $header = null;
    var $body = null;
    var $nav = null;
    var selector = {
        navProducts:'nav.products',
        navList:function() { return this.navProducts+' li'; },
        navItem: 'navItem',
        subNavSelected:'subNavSelected',
        subNav:'.subNav',
        mobileMenuButton:'#MobileMenuButton',
        menuBasket:'MenuBasket',
        siteNavItem: '.site-nav__item'
    };


    var process = {
        init: function() {

            if(isLoaded){
                return;
            }
            $body = $('body');
            $header = $('header');
            $siteNavItems = $(selector.siteNavItem, $header);
            $nav = $(selector.navProducts);

            /**
             * Handle nav menu events on tablet/touch
             */
             $body.on('touchstart', function(e) {

                 var target = e.target;
                 var $navEl = $(target).parent();


                 if($navEl.hasClass('noRedirectionOnIpad') || $navEl.parent().hasClass('noRedirectionOnIpad')){
                     // preventDefault so extras links dont fire
                     e.preventDefault();
                     SHARED.megaNav.resetSubNav();
                     SHARED.megaNav.openExtraMenu(target);
                     return false;

                 }else if ($siteNavItems.has(target).length > 0){
                     // stop propogation so child link is honoured
                     e.stopPropagation();

                 }else{
                     $siteNavItems.removeClass('open');
                 }

                 SHARED.megaNav.handleProductNav(e);
             });

            //Show the subNav on hover
            $('body').on('mouseenter', selector.navList(), function() {
                SHARED.megaNav.showSubNav($(this));
            });
            $('body').on('mouseleave', selector.navList(), function() {
                SHARED.megaNav.hideSubNav($(this));
            });

            $(selector.navList()).click(function(){
                SHARED.megaNav.resetSubNav();
            });


            if (SHARED.utils.isIE()) {
                $('body').addClass('ie');
            }


            if (SHARED.megaNav.getProductsIds() !== 'undefined' && SHARED.megaNav.getProductsIds().length > 0) {
                SHARED.megaNav.loadPrices();
            }

            SHARED.megaNav.addProductNavEvents();

            isLoaded = true;
        },

        handleProductNav: function(e){
            var target = e.target;
            var $link = null;

            if( $(selector.navProducts).has(target).length > 0 ) {
                e.preventDefault();
                e.stopPropagation();
                $link = $(target).closest('a');
                if( $link.attr('href') ){
                    // Add a bg tranparent color
                    // and a slight delay
                    // to replicate the click action to the user
                    $link.css({'background': 'rgba(51,51,51,.1)'});
                    setTimeout(function(){
                        SHARED.megaNav.resetSubNav();
                        $link.css({'background': ''});
                        window.location = $link.attr('href');
                    },150);
                    return false;
                }
            }
            SHARED.megaNav.resetSubNav();
        },

        addProductNavEvents: function(){
            var $navItems = $nav.find('.navItem');

            $navItems.on('touchstart', function(e) {
                e.preventDefault();
                return false;
            })
            .on('touchend', function(e) {
                e.preventDefault();
                return false;
            });

            // use hammer lib to handle 'tap'
            // this helps solve the extra click problem we were having on tablet
            $navItems.hammer().on('tap', function(e) {
                var target = e.target;
                var $navEl = $(target);
                if($navEl.hasClass('navItem')){
                    if($navEl.hasClass('subNavSelected')){
                        SHARED.megaNav.resetSubNav();
                        return false;
                    }
                    e.preventDefault();
                    SHARED.megaNav.resetSubNav();
                    SHARED.megaNav.closeExtraMenu();
                    SHARED.megaNav.showSubNav($navEl.parent());
                    return false;
                }
            });
        },

        openExtraMenu: function(target){
            var $target = $(event.target),
                $targetLi = $target.closest('li');
            $siteNavItems.removeClass('open');
            $targetLi.addClass('open');
        },

        closeExtraMenu: function(){
            $siteNavItems.removeClass('open');
        },

        showSubNav: function(e) {
            if($('.subNav',e).length < 1){
                $('a.navItem',e).addClass('remove');
            }
            $('a.navItem',e).addClass(selector.subNavSelected);
            $('a.navItem',e).append($('<span>', {class: 'arrow'}));
            $('.arrow',e).delay(50).animate({ opacity: 1 }, 125);

            //Using setTimeout instead of jQuery.delay because jQuery.delay doesn't offer cancellation
            subNavTimeout = setTimeout(function(){
                e.find(selector.subNav).fadeIn(125);
            }, 50);
        },

        hideSubNav: function(e) {
            clearTimeout(subNavTimeout);
            $('a.navItem',e).removeClass(selector.subNavSelected);
            $('.arrow',e).remove();
            e.find(selector.subNav).hide();
        },

        resetSubNav: function(){
            //Reset the hover state
            $(selector.subNav).hide();
            $('a.navItem').removeClass(selector.subNavSelected);
            $('.arrow','a.navItem').remove();
        },

        loadPrices: function() {
            var productsIdsString = SHARED.megaNav.getProductsIds();
            var sessionCode = SHARED.megaNav.getApiSessionCode();
            var productInfosUri = SHARED.megaNav.getProductDetailsUrl(productsIdsString, sessionCode);
            SHARED.utils.getJson(productInfosUri).then(SHARED.megaNav.renderDynamicPrices);
        },

        getProductsIds: function() {
            return $('.productPrice').map(function() { return $(this).attr('data-product-id'); }).toArray();
        },

        createDynamicPriceContent: function (productInfo, elementData) {
            if (!productInfo) { return ''; }
            var price;
            if (productInfo.promoPrice) {
                price = elementData.undiscountedLabel + ' <span class="subNavOldPrice">' + productInfo.undiscountedPrice + '</span>' +
                '&nbsp;' + elementData.discountedLabel + ' <span class="subNavPromoPrice">' + productInfo.promoPrice + '</span>';
            } else {
                price = elementData.priceLabel + ' <span class="subNavBasePrice">' + productInfo.undiscountedPrice + '</span>';
            }
            if (elementData.quantityLabel) {
                price+=' <span class="quantityForPrice">' + elementData.quantityLabel + '</span>';
            }
            return '<p>' + price + '</p>';
        },

        renderDynamicPrices: function(data, status, jqXHR) {
            $('.productPrice').append(function() {
                var $elem = $(this);
                var productId = $elem.attr('data-product-id');
                return SHARED.megaNav.createDynamicPriceContent(data.productsInfos[productId], $elem.data());
            });
        },

        getApiSessionCode: function() {
            return $('#Bxt').data('ajaxSessionCode');
        },

        getProductDetailsUrl: function(productIds, sessionCode) {
            var url = $('nav#Nav').data('productDetailsUrl');
            var params = {
                productIds: productIds.join(),
                bsessioncode: sessionCode
            };
            return url + '?' + jQuery.param(params);
        }

    };
    // var _this = process;
    SHARED.utils.functionList.push({ test: '#Nav', func: process.init });
    return process;

})(SHARED, $);
