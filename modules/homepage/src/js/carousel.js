var FLEXI = window.FLEXI || {};
FLEXI.carousel = (function (FLEXI, $) {
	var process = {
		init: function() {
			
			$('[data-type="carousel"]').pbxCarousel();

		}
	};

	FLEXI.utils.functionList.push({ func: process.init });

	return process;

})(FLEXI, $);
