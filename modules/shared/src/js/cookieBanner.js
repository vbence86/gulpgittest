var SHARED = window.SHARED || {};
SHARED.cookieBanner = (function (SHARED, $) {
	var process = {
		init: function () {
			if(!_this.isCookiePolicyAccepted()) {
				$('#CookieBannerClose').click(function () {
					_this.acceptCookiePolicy();
					_this.bannerVisibility('hide');
					return false;
				});
				_this.bannerVisibility('show');
			}
		},
		acceptCookiePolicy: function() {
			SHARED.utils.setCookie('optcookieinfo',true,(365*2),'/');
		},
		isCookiePolicyAccepted: function(){
			var optcookieinfo = SHARED.utils.getCookie('optcookieinfo');
			if(optcookieinfo !== '' && optcookieinfo === 'true'){
				return true;
			}
			return false;
		},
		bannerVisibility: function(state) {
			var cookieBanner = $('#CookieBanner');
			if(state === 'show'){
				cookieBanner.show();
			} else {
				cookieBanner.hide();
			}
		}
	};
	var _this = process;
	SHARED.utils.functionList.push({ func: process.init });
	return process;
})(SHARED, $);
