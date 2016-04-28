var BXT = window.BXT || {};
BXT.crossSell = (function (BXT, $, PBX) {
	var popupClass = 'cross-sell-popup';
	var process = {
		store: null,
		showCrossSell: false,
		$promoContainer: null,
		$offers: null,
		$crossSellLinks: null,
		$checkoutBtn: null,
		isLocalStorageAvailable: true,
		checkoutBtnText: 'No thanks',
		init: function () {
			var that = this;
			var offers = $('#cross-sell-offers');
			that.$offers = $('#cross-sell-offers');
			that.$promoContainer = $('#promos');
			that.$crossSellLinks = that.$promoContainer.find('.promotion-button');
			that.$checkoutBtn = that.$promoContainer.find('.checkout');

			that.store = that.getLocalStorage();

			if (that.isLocalStorageAvailable) {
				that.showCrossSell = that.store.getItem('bxtShowCrossSell') || that.showCrossSell;
				that.checkoutBtnText = that.store.getItem('bxtCheckoutBtnText') || that.checkoutBtnText;
			}
			that.setCheckoutBtnText(that.checkoutBtnText);

			PBX.utils.resizeFuncs.push({ ctx: this, func: this.resizeHandler});

			if( that.$offers.hasClass(popupClass) && !!that.showCrossSell && !!that.$crossSellLinks.length ){
				that.showPopup();
			} else {
				offers.hide();
			}

			offers.find('.checkout').attr('href', $('#bottom-controls .c-out').attr('href'));

			that.addClickEvents();
			this.resizeHandler();

            $(document).on('click', 'a[id^="activate-cross-sell-link-"]', function click(e) {
                that.crossSellLinksClick(e);
                return false;
            });
		},
		addClickEvents: function(){
			var that = this;
			that.$checkoutBtn.on('click', that.checkoutBtn);
			$('body').on('click', that.bodyOnClickEvent);
			$('.c-out').on('click', that.onCheckoutPopup);
		},
		getLocalStorage: function(){
			if (typeof (Storage) !== 'undefined') {
				try{
					window.localStorage.setItem('isLocalAvailable', 'true');
					window.localStorage.removeItem('isLocalAvailable');
				} catch (e) {
					BXT.crossSell.isLocalStorageAvailable = false;
				}
				return window.localStorage;
			} else {
				return false;
			}
		},
		getSessionStorage: function(){
			if( typeof(Storage) !== 'undefined' ) {
				return window.sessionStorage;
			} else {
				return false;
			}
		},
		bodyOnClickEvent: function(e){
			var app = BXT.crossSell;
			if( app.$offers.hasClass(popupClass) && e.target.id !== 'cross-sell-offers' && !$('#cross-sell-offers').has(e.target).length) {
				app.hidePopup();
			}
			return true;
		},
		onCheckoutPopup: function(e){
			var app = BXT.crossSell;
			if (!PBX.utils.isPalm && !PBX.utils.isLapLarge && !PBX.utils.isDesk) {
				$('body').scrollTop(0);
				app.showPopup();
				return false;
			}
		},
		removeOnCheckoutPopup: function(){
			$('.c-out').off('click');
		},
		crossSellLinksClick: function (e){
			var app = BXT.crossSell;
			app.setCheckoutBtnText('Close');
			app.setCrossSellShowFlag(true);
            BXT.upsells.doActivateUpsell($(this));
		},
		setCheckoutBtnText: function(val){
			var that = this;
			that.$checkoutBtn.text(val);
			that.checkoutBtnText = val;
			if (that.isLocalStorageAvailable) {
				that.store.setItem('bxtCheckoutBtnText', val);
			}
		},
		checkoutBtn: function(e){
			var app = BXT.crossSell;
			if( $(this).text() === 'Close' ){
				e.preventDefault();
				app.hidePopup();
				app.setCheckoutBtnText('Close');
				app.setCrossSellShowFlag(false);
				app.removeOnCheckoutPopup();
			}
		},
		setCrossSellShowFlag: function(val){
			var that = this;
			that.showCrossSell = val;
			if (that.isLocalStorageAvailable) {
				that.store.setItem('bxtShowCrossSell', that.showCrossSell);
			}
		},
		showPopup: function () {
			var offers = $('#cross-sell-offers');
			offers.fadeIn();
			offers.css({right: '-' + offers.css('width')});
			offers.animate({right: '0%'}, 500);
		},
		hidePopup: function () {
			var offers = $('#cross-sell-offers');
			offers.animate({right: '-' + offers.css('width')}, 500, function() {
				offers.hide();
			});
		},
		update: function(){
			var that = this;
			if(that.$crossSellLinks.length === 0){
				that.removeOnCheckoutPopup();
			}
		},
		resizeHandler: function () {
			var that = this;
			var offers = $('#cross-sell-offers');
			if (PBX.utils.isPalm || PBX.utils.isLapLarge || PBX.utils.isDesk) {
				offers.css({right: '0'});
				offers.removeClass(popupClass);
				if (!offers.is(':visible')) {
					offers.show();
				}
			} else {
				offers.addClass(popupClass);
				offers.hide();
			}
			that.update();
		}
	};
	PBX.utils.functionList.push({ test: '#cross-sell-offers', func: process.init, ctx: process });
	return process;
})(BXT, $, PBX);