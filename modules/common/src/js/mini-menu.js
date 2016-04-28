var PBX = window.PBX || {};

PBX.miniMenu = (function (PBX, $) {
	var process = {
		menuCont: $('.nav-mini'),
		menuItems: null,
		menuMini: $('#mini-menu-side'),
		mainGrid: $('.gw'),
		intervalVar: null,
		hasInterval: false,
		hasTransition: null,
		init: function () {
			var transitionEnds = 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend';
			this.menuItems = this.menuCont.find('li');
			PBX.utils.resizeFuncs.push({ ctx: this, func: this.onResize });
			
			/* check for transition support */
			var s = document.createElement('p').style;
			this.hasTransition = ( s.transition !== undefined ) ? true : false;

			$(this.menuItems[1]).on(transitionEnds, $.proxy(this.onAnimEnd, this));
			this.mainGrid.on(transitionEnds, $.proxy(this.onSlideAnimEnd, this));

			if (PBX.utils.isPalm || (PBX.utils.isLap && !PBX.utils.isLapLarge)) {
				this.addAnimation();
				this.addTouchStartHandlers();
			}
		},
		addTouchStartHandlers: function () {
			this.menuMini.find('a').on('touchstart', this.onTouchStart);
		},
		onTouchStart: function (e) {
			//note that the scope of this is event
			$(this).addClass('tap-highlight');
		},
		addAnimation: function () {
			this.menuItems.addClass('menu-anim');
			if(!this.hasTransition) {
				var that = this;
				this.menuItems.fadeOut('slow', function(){
					$(this.menuItems).hide();
					that.addCompressedMenu();
				});
			}
			$('body').addClass('fullheight');
			PBX.miniMenu.mainGrid.addClass('fullheight');
		},
		onSlideAnimEnd: function () {
			var leftVal = parseInt(this.mainGrid.css('left').toString().replace('px', ''), 10);
			if (leftVal === 0) {
				this.menuMini.removeAttr('style');
			}
		},
		onAnimEnd: function () {
			this.menuItems.hide();
			this.addCompressedMenu();
		},
		onResize: function () {
			if (PBX.utils.isPalm || (PBX.utils.isLap && !PBX.utils.isLapLarge)) {
				
				this.addAnimation();
				
			} else {
				this.menuItems.removeAttr('style');
				this.menuItems.removeClass('menu-anim');
				this.menuCont.find('.mini-menu').remove();
				this.menuMini.removeAttr('style');
				this.mainGrid.removeClass('slide');
				$('body').removeClass('fullheight');
				PBX.miniMenu.mainGrid.removeClass('fullheight');
			}
		},
		onMenuClick: function () {
			this.menuMini.css('display', 'block').delay(1).queue(function addCss3Anim() {
				var that = $(this);
				if (!PBX.miniMenu.mainGrid.hasClass('slide')) {
					$('body').addClass('no-scroll');
				}
				PBX.miniMenu.mainGrid.toggleClass('slide');
				if (!PBX.miniMenu.hasInterval) {
					PBX.miniMenu.hasInterval = true;
					PBX.miniMenu.intervalVar = window.setInterval(PBX.miniMenu.whenMenuClosed, 50);
				}
				that.dequeue();
			});
		},
		whenMenuClosed: function () {
			if ($('.gw').css('left') === '0px') {
				window.clearInterval(PBX.miniMenu.intervalVar);
				$('body').removeClass('no-scroll');
				PBX.miniMenu.hasInterval = false;
			}
		},
		
		addCompressedMenu: function () {
			var newCompressedMenu = $('#sandwich-template').html();
			if(!this.hasTransition) {
				this.menuCont.find('.mini-menu').remove();
			}
			this.menuCont.append(newCompressedMenu).delay(1).queue(function addCss3Anim() {
				var that = $(this);
				that.find('.mini-menu').addClass('menu-anim-rev');
				that.dequeue();
			});
			this.menuCont.find('.mini-menu').on('click', $.proxy(this.onMenuClick, this));
		}
	};
	PBX.utils.functionList.push({ test: '.mini-menu-side', func: process.init, ctx: process });
	return process;
})(PBX, $);
