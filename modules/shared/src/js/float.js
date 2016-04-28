var SHARED = window.SHARED || {};
SHARED.float = (function (SHARED, $) {
	var process = {
		floatBreakpoint: 1130,
		$float: null,
		$floats: null,
		$hideFloat: null,

		init: function () {

			if(!$('#Float')){
				return;
			}

			_this.$float = $('#Float');
			_this.$floats = $('.float', _this.$float);
			_this.$hideFloat = $('.hideFloat', _this.$floats);

			_this.$hideFloat.on('click', _this.hideFloatEvent);

			_this.initFloat();
		},

		hideFloatEvent: function(event){
			$(event.target).parent().hide();
			_this.setCookieToHideFloat();
		},

		initFloat: function() {
			if(!_this.isFloatHidden() && SHARED.utils.getWindowWidth() >= _this.floatBreakpoint) {
				_this.floatVisibility('show');
			} else {
				_this.floatVisibility('hide');
			}
		},

		setCookieToHideFloat: function() {
			SHARED.utils.setCookie('sidePromo','hidePromo',0,'/',30);
		},

		isFloatHidden: function(){
			var floatCookie = SHARED.utils.getCookie('sidePromo');
			if(floatCookie !== '' && floatCookie === 'hidePromo'){
				return true;
			}
			return false;
		},
		floatVisibility: function(state) {
			if(state === 'show'){
				_this.$float.show();
			} else {
				_this.$float.hide();
			}
		}
	};
	var _this = process;
	SHARED.utils.functionList.push({ func: process.init });
	return process;
})(SHARED, $);
