var PBX = window.PBX || {};
PBX.noFlashError = (function (PBX, $) {
	var process = {
		init: function () {
			var $moreInfoLinkEl = $('#moreInfoLink');
			$moreInfoLinkEl.on('click', function () {
				$('#moreInfo').removeClass('hidden');
			});
		}
	};
	PBX.utils.functionList.push({ test: '#noFlashError', func: process.init, ctx: process });
	return process;
})(PBX, $);
