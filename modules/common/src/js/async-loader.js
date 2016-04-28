var PBX = window.PBX || {};
PBX.asyncLoader = (function (PBX, $) {
	var process = {
		reloadContent: function () {
			var allAsyncContainers = $('[data-async="true"]');
			allAsyncContainers.each(function (i) {
				var $that = $(this);
				PBX.asyncLoader.fetchContent($that.data('replacement-url'), $that);
			});
		},
        refreshElement: function(elementId, callback, params) {
			var element = $(elementId);
			if (element.length) {
				var elementUrl = element.data('replacement-url');
				PBX.asyncLoader.fetchContent(elementUrl, element, callback, params);
			}
        },
		loadContent: function(element) {
			$(element).load($(element).data('replacement-url'));
		},
		fetchContent: function (url, cont, callback, params) {
			if (url) {
				url = window.location.origin + url + (url.indexOf('?') !== -1 ? '&' : '?') + 'asyncRedir=' + encodeURIComponent(window.location.href);
				if (params) {
					for (var key in params) {
						if (params.hasOwnProperty(key)) {
							url += '&' + key + '=' + params[key];
						}
					}
				}
				$.ajax({
					url: url,
					success: function (data, status, xhr) {
						PBX.asyncLoader.populateContent(data, cont);
						if (typeof callback !== typeof undefined && callback !== null) {
							callback.call();
						}
					},
					error: function (xhr, status, err) {
						PBX.asyncLoader.errorContent(err, cont);
					}
				});
			}
		},
		populateContent: function (data, cont) {
			cont.replaceWith(data);
			PBX.asyncLoader.checkLoader($(data));
		},
		errorContent: function (err, cont) {},
		checkLoader: function (cont) {
			var obj = '';
			for(var i = 0, iLen = PBX.utils.functionList.length; i < iLen; i++) {
				obj = PBX.utils.functionList[i];
				if (cont.is(obj.test) || cont.find(obj.test).length) {
					obj.func.call(obj.ctx);
				}
			}
		}
	};
	return process;
})(PBX, $);
