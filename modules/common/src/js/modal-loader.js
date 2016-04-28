PBX.modalLoader = (function (PBX, $) {
	var modalLoaderId = 'modal-loader';
	var process = {
		init: function () {
			var $loaderEl = that.getLoaderEl();
			$loaderEl.css({
				'margin-top': '-' + ($loaderEl.height() * 0.5) + 'px',
				'margin-left': '-' + ($loaderEl.width() * 0.5) + 'px'
			});
		},
		getLoaderEl: function () {
			return $('#' + modalLoaderId);
		},
		show: function () {
			that.getLoaderEl().modal({backdrop:'static',keyboard:false, show:true});
		},
		hide: function () {
			that.getLoaderEl().modal('hide');
		}
	};
	var that = process;
	PBX.utils.functionList.push({ test: '#' + modalLoaderId, func: process.init, ctx: process });
	return process;
})(PBX, $);