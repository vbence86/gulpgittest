var PBX = window.PBX || {};
PBX.utils = (function (PBX, $) {
	var ua = window.navigator.userAgent.toLowerCase();
	var process = {
		isPalm: null,
		isLap: null,
		isLapLarge: null,
		isDesk: null,
		lapStart: 641,
		lapLargeStart: 960,
		deskStart: 1280,
		functionList: [],
		resizeFuncs: [],
		requestHeaders: {
			Accept : 'application/json',
			'Content-Type': 'application/json'
		},
		prevPageParamName: 'previousPage',
		initScreenDetection: function () {
			var that = this;
			that.screenDetection();
			that.resizeFuncs.push({ ctx: that, func: that.screenDetection });
			//$(window).on('orientationchange resize', $.proxy(that.screenDetection, that));
			//$(window).on('resize', that.screenDetection);
		},
		getWindowWidth: function () {
			return window.innerWidth;
		},
		getWindowHeight: function () {
			return window.innerHeight;
		},
		getWindowLocation: function () {
			return window.location;
		},
		isMobile: function () {
			return ua.indexOf('mobile') !== -1 || ua.indexOf('android') !== -1;
		},
		isIOS: function () {
			return navigator.userAgent.match(/iPad|iPhone/i) !== null;
		},
		isIPad: function() {
			return navigator.userAgent.match(/iPad/i) !== null;
		},
		isAndroid: function () {
			return navigator.userAgent.match(/Android/i) !== null;
		},
		isLandscape: function(){
			var that = this;
			return (that.getWindowHeight() < that.getWindowWidth());
		},
		screenDetection: function () {
			var currentWidth = this.getWindowWidth();
			if (currentWidth < this.lapStart) {
				this.isPalm = true;
				this.isLap = false;
				this.isLapLarge = false;
				this.isDesk = false;
			} else if (currentWidth >= this.lapStart && currentWidth < this.lapLargeStart) {
				this.isPalm = false;
				this.isLap = true;
				this.isLapLarge = false;
				this.isDesk = false;
			} else if (currentWidth >= this.lapLargeStart && currentWidth < this.deskStart) {
				this.isPalm = false;
				this.isLap = true;
				this.isLapLarge = true;
				this.isDesk = false;
			} else if (currentWidth >= this.deskStart) {
				this.isPalm = false;
				this.isLap = false;
				this.isLapLarge = false;
				this.isDesk = true;
			}
		},
		functionInitializer: function () {
			var localJquery = $;
			var presentElements;
			var obj;
			var i = 0;
			var functionsList = PBX.utils.functionList;
			var iLen = functionsList.length;

			for (i = 0; i < iLen; i++) {
				obj = functionsList[i];
				if (!obj.initialized) {
					obj.initialized = true;
					presentElements = localJquery(obj.test);
					if (presentElements && presentElements.length) {
						obj.func.call(obj.ctx);
					}
				}
			}
			presentElements = null;
			functionsList = null;
			obj = null;
			localJquery = null;
		},
		onResize: function () {
			
			$(window).on('orientationchange resize', function onResize() {
				var presentElements;
				var obj;
				var i = 0;
				var iLen = PBX.utils.resizeFuncs.length;
				for (i = 0; i < iLen; i++) {
					obj = PBX.utils.resizeFuncs[i];
					obj.func.call(obj.ctx);
					//console.log(obj.func.toString());
				}
				presentElements = null;
				iLen = null;
				obj = null;
			});
		},
		/**
		 * Insert values from array into string
		 * @param str
		 * @param arr
		 * @returns {*}
		 */
		insertValuesIntoString: function (str, arr) {
			for (var i=0; i < arr.length; i++){
				str = str.replace('{' + (i + 1) + '}', arr[i]);
			}
			return str;
		},
		htmlEscape: function (str) {
			return String(str)
				.replace(/&/g, '&amp;')
				.replace(/"/g, '&quot;')
				.replace(/'/g, '&#39;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;');
		},
		htmlUnescape: function (str) {
			return String(str)
				.replace(/&gt;/g, '>')
				.replace(/&lt;/g, '<')
				.replace(/&quot;/g, '"')
				.replace(/&#39;/g, '\'')
				.replace(/&amp;/g, '&');
		},
		/**
		 * Get id from element id
		 * @param str prefix
		 * @returns {string}
		 */
		getIdFromElement: function (prefix) {
			var element = $('[id^="' + prefix + '-"]');
			return element.length ? element.attr('id').substring(prefix.length + 1) : '';
		},
		/**
		 * Get node id
		 * @returns {string}
		 */
		getNodeId: function() {
			return PBX.utils.getIdFromElement('node');
		},
        getWindowLocation: function () {
            return window.location;
        },
        getWindowOrigin: function(){
            var winLoc = PBX.utils.getWindowLocation();
            return (winLoc.origin) ? winLoc.origin : winLoc.protocol + '//' + winLoc.hostname + (winLoc.port ? ':' + winLoc.port: '');
        },
		setWindowOrigin: function (obj) {
			obj.origin = obj.protocol + '//' + obj.hostname + (obj.port ? ':' + obj.port : '');
		},
		doWindowOrigin: function () {
			var windowObject = PBX.utils.getWindowLocation();
			if (!windowObject.origin) {
				PBX.utils.setWindowOrigin(windowObject);
			}
		},
		loadData: function (url, options, noJsonHeaders) {
			options = $.extend(options, {
				url: url
			});
			if (!noJsonHeaders){
				options = $.extend(options, {
					headers: that.requestHeaders
				});
			}
			$.ajax(options);
		},
		getURLParameter: function(paramName)
		{
			var sPageURL = window.location.search.substring(1);
			var sURLVariables = sPageURL.split('&');
			for (var i = 0; i < sURLVariables.length; i++)
			{
				var sParameterName = sURLVariables[i].split('=');
				if (sParameterName[0] === paramName)
				{
					return sParameterName[1];
				}
			}
		},
		getPreviousPage: function() {
			var pathname;
			var queryString;
			var previousPage = PBX.utils.getURLParameter(PBX.utils.prevPageParamName);
			if(previousPage && PBX.utils.isUrlInSameDomain(previousPage)){
				previousPage = decodeURIComponent(previousPage);
			} else {
				pathname = window.location.pathname.replace(/register|login|my\/password/,'');
				queryString = window.location.search;
				previousPage = pathname + queryString;
			}
			return previousPage;
		},
		isUrlInSameDomain: function(url){
			var previousPageHostName = $('<a>').prop('href', decodeURIComponent(url)).prop('hostname');
			return previousPageHostName === window.location.hostname;
		}
	};
	var that = process;
	process.functionList.push({ test: 'body', func: process.initScreenDetection, ctx: process });
	process.functionList.push({ test: 'body', func: process.doWindowOrigin, ctx: process });
	return process;
})(PBX, $);
