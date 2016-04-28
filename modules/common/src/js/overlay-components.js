var PBX = window.PBX || {};
PBX.overlayComponents = (function (PBX, $) {
	var process = {
		hiddenAreaId: 'hidden-area',
		init: function () {
			var $hiddenAreaEl = $('#' + that.hiddenAreaId);
			if ($hiddenAreaEl.hasClass('hidden')) {
				$hiddenAreaEl.removeClass('hidden');

				$hiddenAreaEl.find('>*[id]').wrap(function () {
					return '<div class="modal fade from-hidden-area" id="modal-' + $(this).attr('id') + '"><div class="modal-body"></div></div>';
				});
				$hiddenAreaEl.find('.modal').prepend('<button type="button" class="close" data-dismiss="modal" aria-hidden="true">A?</button>');
			}
			that.resizeHandler();
			PBX.utils.resizeFuncs.push({ ctx: that, func: that.resizeHandler});
		},
		showComponent: function (id) {
			$('.modal[id^="modal-"]').not('#modal-' + id).modal('hide');
			$('#modal-' + id).modal('show');
		},
		hideComponent: function (id) {
			$('#modal-' + id).modal('hide');
		},
		resizeHandler: function () {
			$('#' + that.hiddenAreaId + ' .modal-body').css('max-height', Math.round($(window).height() * 0.8) + 'px');
		},
		hasPreviousPage: function(){
			return PBX.utils.getPreviousPage() !== undefined;
		},
		goToInitialPage: function(){
			var previousPage = PBX.utils.getPreviousPage();
			if(previousPage !== undefined){
				window.location = previousPage;
			}
		}
	};
	var that = process;
	PBX.utils.functionList.push({ test: '#' + that.hiddenAreaId, func: process.init });
	return process;
})(PBX, $);