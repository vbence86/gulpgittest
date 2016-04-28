PBX = window.PBX || {};
PBX.smallLoader = (function (PBX, $) {
	var process = {
		loader: function (el) {
			$(el).html('<div class="small-loader"><!-- --></div>');
		}
	};
	return process;
})(PBX, $);