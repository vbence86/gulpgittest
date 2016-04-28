var PBX = window.PBX || {};
PBX.noCookies = (function (PBX, $) {
	var process = {
		init: function () {
			var $closeButtonEl = $('#no-cookies-panel .close-icon');
			$closeButtonEl.css('display', 'inline');
			$closeButtonEl.on('click', function () {
				$('#no-cookies-panel').remove();
			});
		}
	};
	PBX.utils.functionList.push({ test: '#no-cookies-panel', func: process.init, ctx: process });
	return process;
})(PBX, $);
