var PBX = window.PBX || {};
PBX.infoPopup = (function (PBX, $) {
	var popupId = 'infoModal';
	var template =
		'<div id="' + popupId + '" class="modal fade info-modal" tabindex="-1" aria-hidden="false">' +
		'	<button type="button" class="close" data-dismiss="modal" aria-hidden="true">A?</button>' +
		'	<div class="article">	' +
		'		<div class="header cf">' +
		'			<h2>{header}</h2>' +
		'		</div>' +
		'		<div class="wrapper">' +
		'			{text}' +
		'		</div>' +
		'	</div>' +
		'</div>';
	var process = {
		showPopup: function (header, text) {
			that.removePopup();
			var popup = $(template.replace('{header}', header).replace('{text}', text));
			$('body').append(popup);
			popup.modal('show');
			popup.on('hidden.bs.modal', function () {
				that.removePopup();
			});
		},
		removePopup: function () {
			$('#' + popupId).off('hidden.bs.modal').remove();
		}
	};
	var that = process;
	return process;
})(PBX, $);