var PBX = window.PBX || {};
PBX.stiky = (function (PBX, $) {
	var process = {
		$window: null,
		$document: null,
		$stickyElement: null,
		$headerPlaceholder: null,
		$quantityInput: null,
		stickyNavTop: 0,
		isSticky: false,
		isIOS: null,
		isAnroid: null,

		init: function () {
			this.$window = $(window);
			this.$document = $(document);
			this.$stickyElement = $('.basket-summary-header');
			this.$headerPlaceholder = $('#header-placeholder');
			this.$quantityInput = $('.quantity-input');
			this.stickyNavTop = this.$stickyElement.offset().top;
			this.isIOS = navigator.userAgent.match(/iPad|iPhone/i) !== null;
			this.isAnroid = navigator.userAgent.match(/Android/i) !== null;
			this.initSticky();
			PBX.utils.resizeFuncs.push({ ctx: this, func: this.initSticky });
		},
		
		initSticky: function () {
			var that = this;
			if (PBX.utils.isPalm && !PBX.utils.isLandscape()) {
				
				if(!that.isSticky){
					that.isSticky = true;
					that.addScrollEvent();

					if(that.isIOS || that.isAndroid){
						that.addInputEvent();
					}

				} else {
					that.$window.trigger('scroll.bxtsticky');
				}
				
			} else {
				that.isSticky = false;
				that.removeScrollEvent();
				that.removeSticky();
			}
		},

		addSticky: function(){
			// var that = this;
			this.$stickyElement.addClass('sticky');
			this.$headerPlaceholder.removeClass('hidden');
		},

		removeSticky: function(){
			// var that = this;
			this.$stickyElement.removeClass('sticky');
			this.$headerPlaceholder.addClass('hidden');
		},

		addScrollEvent: function(){
			this.$window.on('scroll.bxtsticky', this.scrollEvent);
			this.$window.trigger('scroll.bxtsticky');
		},

		removeScrollEvent: function(){
			this.$window.off('scroll.bxtsticky', this.scrollEvent);
		},

		addInputEvent: function(){
			var that = this;
			that.$document.on('focus', 'input', function () {
				that.$stickyElement.addClass('ios-fix');
			}).on('blur', 'input', function () {
				that.$stickyElement.removeClass('ios-fix');
			});
		},

		scrollEvent: function ( e ) {
			if( $(window).scrollTop() >= PBX.stiky.stickyNavTop){
				PBX.stiky.addSticky();
			} else {
				PBX.stiky.removeSticky();
			}
		}
	};
	PBX.utils.functionList.push({ test: '.basket-summary-header', func: process.init, ctx: process });
	return process;
})(PBX, $);

