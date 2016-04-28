var FLEXI = window.FLEXI || {};
FLEXI.tiles = (function (FLEXI, $) {
	
	var process = {
		init: function() {
			$('#Tiles').pbxTruncate();
		}
	};

	FLEXI.utils.functionList.push({ func: process.init });

	return process;

})(FLEXI, $);
