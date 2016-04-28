var PBX = window.PBX || {};
PBX.retroNav = (function (PBX, $) {
	var timeout = null;
	var process = {
		init: function () {
			$('.has-sub-nav').on('click mouseover', that.onMouseAction);
			$('.has-sub-nav').on('mouseleave', that.onMouseLeave);

			$('body').on('click', function click(event) {
				that.onBodyClick(event);
				return true;
			});
		},
		closeOtherMenus: function ($menuEl) {
			$('.nav-t').not($menuEl).removeClass('nav-active');
		},
		closeAllMenus: function () {
			$('.nav-t').removeClass('nav-active');
		},
		clearTimeout: function () {
			clearTimeout(timeout);
		},
		onMouseLeave: function (e) {
			timeout = setTimeout(that.closeAllMenus, 1000);
		},
		onMouseAction: function (e) {
			that.clearTimeout();
			var $el = $(e.currentTarget);
			if (!$el.hasClass('nav-active')) {
				e.preventDefault();
				$el.toggleClass('nav-active');
				PBX.retroNav.closeOtherMenus($el);
			}
		},
		onBodyClick: function (event) {
			that.clearTimeout();
			if(!$(event.target).is('.nav-t') && !$('.nav-t').has(event.target).length) {
				that.closeAllMenus();
			}
		}

	};
	var that = process;
	PBX.utils.functionList.push({ test: '#retro-nav', func: process.init, ctx: process });
	return process;

})(PBX, $);
