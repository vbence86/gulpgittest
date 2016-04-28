var BXT = window.BXT || {};
BXT.megaNav = (function (BXT, $, PBX) {
	var isLoaded = false;
	var isMobileNav = false;
	var isMiniBasketShowing = false;
	var isSubNavShowing = false;
	var subNavTimeout;
	var selector = {
		subNavSelected:'subNavSelected',
		subNav:'.subNav',
		subNavContent:'.subNavContent',
		nav:'nav',
		navList:function() { return this.nav+' li'; },
		menuMyAccount:'.menuMyAccount',
		mobileNav:'#MobileNav',
		myAccount:'header .myAccount ul',
		menuButton:'#MenuButton',
		menuBasket:'MenuBasket',
		menuBasketHeaderOverlay:'#MenuBasket .headerOverlay',
		menuHeaderOverlayCenter:'.headerOverlayCenter',
		mobileIcon:'.mobileIcon',
		viewMobileNav:'mobileNav',
		mobileNavContainer:'#MobileNavContainer',
		mobileMyAccount: function() { return this.mobileNav+' .myAccount .headerOverlayCenter'; }
	};

	var process = {
		init: function() {

			if(isLoaded){
				return;
			}

			//Show the subNav on hover
			$(selector.navList()).hover(function() {
				BXT.megaNav.showSubNav($(this));
			},function () {
				BXT.megaNav.hideSubNav($(this));
			});

			$(selector.navList()).click(function(){
				BXT.megaNav.resetSubNav();
			});

			//Close my account drop down when option is selected
			$('*[data-target-component="login"],*[data-target-component="registration"]').on('click touchstart', function click(event) {
				BXT.megaNav.closeMyAccount();
				BXT.megaNav.extrasSubNavState('show', $(this));
			});

			// Mobile Nav setup
			BXT.megaNav.setupMobileNav();

			//Mobile menu button click
			$('body').on('click', selector.menuButton, function() {
				BXT.megaNav.toggleMobileNav();
			});

			//Remove the mobile nav on window resize
			$(window).resize(function(){
				if(!PBX.utils.isIOS() && !PBX.utils.isAndroid()) {
					BXT.megaNav.resetMobileNav();
					if(!isMobileNav){
						BXT.megaNav.setupMobileNav();
					}
				}
			});

			//Reset on orientation change
			$(window).on('orientationchange',function(){
				BXT.megaNav.resetMobileNav();
				if(!isMobileNav){
					BXT.megaNav.setupMobileNav();
				}
			});

			// Load Basket Data into overlay
			this.loadMiniBasket();

			//Show basket data
			$('body').on({
				mouseenter: function () {
					BXT.megaNav.miniBasketState('show');
				},
				mouseleave: function () {
					BXT.megaNav.miniBasketState('hide');
				},
				// and handle touch event for device
				touchstart: function (e) {
					var target = e.target;
					var touched = e.currentTarget;

					if($(touched).attr('id') === selector.menuBasket){
						if(!isMiniBasketShowing){
							isMiniBasketShowing = true;
							BXT.megaNav.miniBasketState('show');
						}else{
							isMiniBasketShowing = false;
							BXT.megaNav.miniBasketState('hide');
							if($(target).hasClass('btn')){
								//target is a link, so goto location target;
								window.location = target;
								return false;
							}
						}
					}
					e.preventDefault();
				}
			},'#MenuBasket');

			//Show sub nav
			$('body').on({
				mouseenter: function () {
					BXT.megaNav.extrasSubNavState('show', $(this));
				},
				mouseleave: function () {
					BXT.megaNav.extrasSubNavState('hide', $(this));
				},
				// and handle touch event for device
				touchstart:function(e){
					// first hide mini basket if shown
					BXT.megaNav.miniBasketState('hide');
					e.preventDefault();
					var target = e.target;

					if(!isSubNavShowing){
						isSubNavShowing = true;
						BXT.megaNav.extrasSubNavState('show', $(this));
					}else{
						isSubNavShowing = false;
						BXT.megaNav.extrasSubNavState('hide', $(this));
						if( $(target).data('target-component') === 'registration'){
							BXT.registration.onRegistrationLinkClick();
							return false;
						}
						if( !$(target).data('target-component') && $(target).attr('href')){
							//target is a link, so goto location target;
							window.location = target;
							return false;
						}
					}
				},
			},'header .hasExtrasSubNav');

			//Remove sub nav on click anywhere on the page for mobile devices
			$('header').on('touchstart', function(){
				if($(selector.nav).is(':visible')) {
					BXT.megaNav.extrasSubNavState('hide');
					BXT.megaNav.resetSubNav();
				}
			});

			isLoaded = true;

			BXT.megaNav.loadPrices();

		},
		getBasePath: function(productIds) {
			var path = window.location.origin;
			var contextPath = $('#node-'+PBX.utils.getNodeId()).data('ajax-url');
			path = contextPath === '' || contextPath === null ? path : path + contextPath;

			var $megaHeaderData = $('#megaheader-data');

			return path + '/.rest/lazyProductsDetails/v1/filters?productIds=' + productIds +
				'&bsessioncode=' + $megaHeaderData.data('ajax-session-code');
		},
		loadPrices: function() {
			var products = $('[data-product-id]');
			var productsIdsString = '';
			var productsLength = products.length;

			for(var i = 0; i < productsLength; i++) {
				var product = $(products[i]);
				var productId = product.data('product-id');
				if (productId !== '') {
					productsIdsString = productsIdsString + productId + ',';
				}
			}
			if (productsIdsString !== '') {
				//removing the last ',' symbol
				productsIdsString = productsIdsString.substring(0, productsIdsString.length - 1);

				var options = {
					type: 'GET',
					success: function (data, status, jqXHR) {
						for (var i = 0; i < productsLength; i++) {
							var product = $(products[i]);
							var productId = product.data('product-id');
							var hidePromos = product.data('hide-promos');
							var undiscountedPriceLabel = product.data('undiscounted-label');
							var discountedPriceLabel = product.data('discounted-label');
							var priceLabel = product.data('price-label');

							if (data.productsInfos[productId]) {
								var undiscounted = data.productsInfos[productId].undiscountedPrice;
								var promo = data.productsInfos[productId].promoPrice;
								if (promo !== null && !hidePromos) {
									product.html('<p>' +  undiscountedPriceLabel + ' <span class="subNavOldPrice">'+undiscounted+'</span> </p><p>' + discountedPriceLabel +' <span class="subNavPromoPrice">'+promo+'</span></p>');

								} else {
									product.html(priceLabel +  ' <span class="subNavBasePrice">'+undiscounted+'</span>');
								}
							}
						}
					},
					error: function (jqXHR, status, errorThrown) {
					}
				};
				PBX.utils.loadData(BXT.megaNav.getBasePath(productsIdsString), options);
			}
		},
		showSubNav: function(e) {
			if ($('.subNav',e).length < 1){
				$('a.navItem',e).addClass('remove');
			}
			$('a.navItem',e).addClass(selector.subNavSelected);
			$('a.navItem',e).append($('<span>', {class: 'arrow'}));
			$('.arrow',e).delay(400).animate({ opacity: 1 }, 150);
			//Using setTimeout instead of jQuery.delay because jQuery.delay doesn't offer cancellation
			subNavTimeout = setTimeout(function(){
				e.find(selector.subNav).fadeIn(150);
			}, 250);
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
		},
		myAccount: function(e) {

			var $ele = $(selector.myAccount);

			if ($ele.is(':visible')){
				$ele.fadeOut();
			} else {
				$ele.fadeIn();
			}

		},
		closeMyAccount: function() {
			$(selector.myAccount).fadeOut();
		},
		setupMobileNav: function(){
			if(!PBX.utils.isLapLarge && !PBX.utils.isDesk){
				this.mobileNavContainer();
				this.initMobileNav();
				isMobileNav = true;
			}
		},
		toggleMobileNav: function() {

			$('body').toggleClass(selector.viewMobileNav);

			if(!$(selector.mobileNavContainer).hasClass(selector.viewMobileNav)){
				$(selector.mobileNavContainer).addClass(selector.viewMobileNav);
			}else{
				$(selector.mobileNavContainer).removeClass(selector.viewMobileNav);
			}
		},
		resetMobileNav: function() {

			if($(selector.mobileNavContainer).hasClass(selector.viewMobileNav)) {
				$(selector.menuButton).trigger('click');
			}

		},
		mobileNavContainer: function () {

			// stop #MobileNav from generating if it already exists
			if( $(selector.mobileNav).length < 1 ){
				$('<div id="MobileNav" />').prependTo('body');
			}

		},
		wrapMobileNav: function(){
			//Set and remove mobileNav container for transition effect
			if($(selector.mobileNavContainer).length < 1) {
				$('body').wrapInner('<div id="'+selector.mobileNavContainer.replace('#','')+'" />');
			}
		},
		unwrapMobileNav: function(){
			$(selector.mobileNav).unwrap(selector.mobileNavContainer);
		},
		initMobileNav: function() {

			var headerHTML = $('header').html();
			var $myAccountUL = $(headerHTML).find('.myAccount .headerOverlayCenter');
			$myAccountUL.find('ul').addClass('userAccount');
			var dataProducts = $(selector.nav).data('products');
			var navHTML = $(selector.nav).html();

			var htmlElements  = '';

			if(dataProducts !== null) {
				htmlElements += '<div class="products">'+dataProducts+'</div>';
			}
			if(navHTML !== undefined) {
				htmlElements += navHTML;
			}
			if($myAccountUL !== undefined) {
				htmlElements += $myAccountUL.html();
			}
			if(headerHTML !== undefined) {
				htmlElements += headerHTML;
			}

			$(selector.mobileNav).html(htmlElements);

			//Elements to be removed from mobile version of nav
			var removeItems = [
				'#MenuButton',
				'#MenuBasket',
				'.myAccount',
				'.logo-cont',
				'.headerIcon',
				'ul.extras .headerOverlayCenter',
				'.pbxIcon',
				'.subNav'
			];
			removeItems = removeItems.join(',');

			$(selector.mobileNav).find(removeItems).remove();

			//Attributes to be removed
			$(selector.mobileNav+' .menuMyAccount').removeAttr('data-target-component');

			//Elements to be moved
			$(selector.mobileNav+' .userAccount').insertBefore(selector.mobileNav+' .extras-cont .extras');
			$(selector.mobileNav+' .language').insertAfter(selector.mobileNav+' .extras-cont .extras');

			BXT.megaNav.wrapMobileNav();
		},
		loadMiniBasket: function(){
			PBX.asyncLoader.loadContent(selector.menuBasketHeaderOverlay);
		},
		insertMobileNavArrows: function() {
			$(selector.mobileNav+' '+selector.menuMyAccount).append(' <span class="'+selector.mobileIcon.replace('.','')+' down">&#x25BC;</span><span class="'+selector.mobileIcon.replace('.','')+' up">&#x25B2;</span>');
		},
		mobileNavAccount: function() {

			var $ele = $(selector.mobileMyAccount());

			if($ele.is(':visible')){
				$(selector.mobileIcon+'.up').show();
				$(selector.mobileIcon+'.down').hide();
				$ele.slideUp();
			} else {
				$(selector.mobileIcon+'.up').hide();
				$(selector.mobileIcon+'.down').show();
				$ele.slideDown();
			}

		},
		miniBasketState: function(state) {
			if(state === 'show'){
				var $miniBasket = $('#MiniBasket');
				$(selector.menuBasketHeaderOverlay).fadeIn();
				if($miniBasket.length < 1){
					BXT.megaNav.loadMiniBasket();
				}
			} else {
				$(selector.menuBasketHeaderOverlay).fadeOut();
			}

		},
		extrasSubNavState: function(state,_this) {

			//Reset visible state
			$(selector.menuHeaderOverlayCenter).hide();

			if(typeof _this !== 'undefined') {

				if(state === 'show'){
					$(selector.menuHeaderOverlayCenter,_this).fadeIn();
					$(selector.menuHeaderOverlayCenter+' ul',_this).show();
				} else {
					$(selector.menuHeaderOverlayCenter,_this).fadeOut();
				}

			}

		}
	};
	PBX.utils.functionList.push({ test: 'header', func: process.init, ctx: process });
	return process;

})(BXT, $, PBX);
