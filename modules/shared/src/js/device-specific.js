var SHARED = window.SHARED || {};
SHARED.device = (function (SHARED, $) {
	var $mainContainer = null;
	var process = {
		init: function () {

			$mainContainer = $('main');

			// If a mobile device
			// => add '.device-scroll' class to main container
			// => fixes native scrollbar position
			// => makes scrolling 'smoother' on device
			if( SHARED.utils.isMobile() ){
				if($mainContainer.length >= 1){
					$mainContainer.addClass('device-scroll');
				}
			}else{
				if($mainContainer.length >= 1){
					$mainContainer.removeClass('device-scroll');
				}
			}
		},
	};
	SHARED.utils.functionList.push({ func: process.init });
	return process;
})(SHARED, $);
