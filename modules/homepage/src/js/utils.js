var FLEXI = window.FLEXI || {};
FLEXI.utils = (function (FLEXI, $) {
	var win = window,
		nav = win.navigator,
		ua = nav.userAgent.toLowerCase();

	var process = {
		mobileBreakpoint: 1024,
		functionList: [],
		resizeFuncs: [],
		getWindowWidth: function () {
			return window.innerWidth;
		},
		getWindowHeight: function () {
			return window.innerHeight;
		},
		isMobile: function(){
			return ua.indexOf('mobile') !== -1;
		},
		isNexus: function(){
			return ua.indexOf('nexus') !== -1;
		},
		isIOS: function () {
			return navigator.userAgent.match(/iPad|iPhone/i) !== null;
		},
		isAndroid: function () {
			return ua.indexOf('android') !== -1;
		},
		isLandscape: function(){
			var that = this;
			return (that.getWindowHeight() < that.getWindowWidth());
		},
		isSmallScreen: function(){
			return (this.getWindowWidth() <= this.mobileBreakpoint) ? true : false;
		},
		getCookie: function(cookieName) {
			var name = cookieName + '=';
			var ca = document.cookie.split(';');
			for(var i=0; i<ca.length; i++) {
				var c = ca[i];
				while (c.charAt(0) === ' ') {
					c = c.substring(1);
				}
				if (c.indexOf(name) === 0) {
					return c.substring(name.length,c.length);
				}
			}
			return '';
		},
		getCookieString: function(name, key, default_){
			if (default_ === null || default_ === undefined) {
				default_ = '';
			}
			var regex = new RegExp(key+'=([^&#]*)');
			var qs = regex.exec(FLEXI.utils.getCookie(name));
			if(qs === null || qs === undefined){
				return default_;
			}else{
				return decodeURIComponent(encodeURI(qs[1]));
			}
		},
		setCookie: function(cname, cvalue, exdays, path){
			var d = new Date(),
				expires,
				cookie;

			exdays = (typeof exdays === 'number') ? exdays : 1;

			d.setTime(d.getTime() + (exdays*24*60*60*1000));
			expires = 'expires='+d.toUTCString();

			cookie = cname + '=' + cvalue + '; ' + expires;

			if( path ){
				cookie += '; path=' + path;
			}
			
			document.cookie = cookie;
		},
		functionInitialiser: function () {
			var obj;
			var i = 0;
			var iLen = FLEXI.utils.functionList.length;

			for (i = 0; i < iLen; i++) {
				obj = FLEXI.utils.functionList[i];
				obj.func.call(obj.func);
			}

			iLen = null;
			obj = null;
		},
		getJson: function(url) {
			var options = {
				type: 'GET',
				dataType: 'json',
				url: url,
				headers: {
					'Accept' : 'application/json',
					'Content-Type': 'application/json'
				}
			};
			return $.ajax(options);
		}
	};
	return process;
})(FLEXI, $);

