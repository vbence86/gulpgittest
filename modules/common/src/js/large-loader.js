PBX = window.PBX || {};
PBX.largeLoader = (function (PBX, $) {
	var process = {
		loader: function (el) {
			
			//Re-use modal loader asset and text
			var loaderSelector = $('#modal-loader');
			var loaderImage = loaderSelector.attr('src');
			var loaderText = loaderSelector.attr('alt');

			$(el).html('<div class="large-loader"><img src="'+loaderImage+'" alt="'+loaderText+'" /></div>');
		}
	};
	return process;
})(PBX, $);