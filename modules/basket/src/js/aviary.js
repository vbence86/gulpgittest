var BXT = window.BXT || {};
BXT.aviary = (function (BXT, $, Aviary, PBX) {
	var imagePlaceHolderId = 'aviary-image-placeholder';
	var process = {
		featherEditor: null,
		init: function () {
			if (Aviary) {
				that.featherEditor = new Aviary.Feather({
					apiKey: 'b99aa4601',
					apiVersion: 3,
					theme: 'light',
					language: that.getLocale(),
					tools: ['enhance', 'effects', 'brightness', 'contrast', 'saturation', 'sharpness', 'redeye'],
					onSave: function (imageID, newURL) {
						var actionlist = that.featherEditor.getActionList();
						document.getElementById('studio').aviaryCallback(actionlist, newURL);
						return true;
					},
					onReady: function () {

						//added hack for ie to stop confirm link to be activated
						if ($.browser && $.browser.msie) {

							var $avairyJSVoid = $('#avpw_controls').find('a[href="javascript:void(0)"]');
							$avairyJSVoid.each(function () {
								$(this).attr('href', '#').bind('click.preventDefault', function (e) {
									e.preventDefault();
								});
							});

						}

					}

				});

				window.aviaryPlugin = {
					createImagePlaceholder: that.createImagePlaceholder,
					launchEditor: that.launchEditor
				};
			}
		},
		getLocale: function () {
			var $localeEl = $('[data-aviary-locale]');
			if ($localeEl.length) {
				return $($localeEl[0]).data('aviary-locale');
			}
			return '';
		},
		createImagePlaceholder: function (url) {
			if (!url) {
				throw('URL argument is required');
			}
			var img = $('#' + imagePlaceHolderId);
			if (!img.length) {
				img = $('<img>')
					.attr({ id: imagePlaceHolderId  })
					.hide()
					.appendTo($(document.body));
			}
			img.attr({ src: url });
			return img[0];
		},
		launchEditor: function (url) {
			that.createImagePlaceholder(url);
			that.featherEditor.launch({
				image: imagePlaceHolderId,
				url: url
			});
			return false;
		}
	};
	var that = process;
	PBX.utils.functionList.push({ test: '.studio-container', func: process.init });
	return process;
})(BXT, $, window.Aviary, PBX);