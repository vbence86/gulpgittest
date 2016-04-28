BXT.emptyCrossSell = (function (BXT, $, PBX) {
	var process = {
		init: function () {
			//if the cross sell component is disabled, we hide it here
			//if not, empty #cross-sell-offers div will appear on the page.
			//Then async loader will load the cross sells.
			if(!$('#promos #cross-sell-offers').length) {
			//cross sell is disabled. Hence hide the area.
				that.disablePromosArea();
			} else {
				//cross sells are not disabled. try to load asynchronously if not in editor
				if (!that.isInEditor()) {
					PBX.asyncLoader.refreshElement('#cross-sell-offers', function() {
						//check that there are any cross sell items. If not disable promos area.
						if(!$('#promos #cross-sell-offers .item').length) {
							//empty cross sell list received.
							that.disablePromosArea();
						} else {
							//enable cross sell area if it is disabled
							that.enablePromosArea();
						}
					});
				}
			}

			//on click event for the cross sell button
			$(document).off('click', 'a[id^="activate-cross-sell-link-"]').on('click', 'a[id^="activate-cross-sell-link-"]', function click(e) {
				that.crossSellLinkClick($(this));
				return false;
			});
		},
		disablePromosArea: function() {
			var $promosEl = $('#promos');
			var $mainEl = $('#main');
			var $footerEl = $('#basket-footer');
			//if cmsAdd attribute is defined, we are in Magnolia editor. Do not hide the area.
			if (!that.isInEditor()) {
				$promosEl.addClass('hidden');
				$mainEl.removeClass('laplarge-and-up-two-thirds');
				$footerEl.removeClass('laplarge-and-up-two-thirds');
			}
			that.normalizeHeaderAndFooter();
		},
		normalizeHeaderAndFooter: function() {
			var headerNormalizeClass = 'basketSized';
			var $promosEl = $('#promos');
			var $headerChilds = $('#headerArea > div');
			if($promosEl.hasClass('hidden')) {
				$headerChilds.addClass(headerNormalizeClass);
			} else {
				$headerChilds.removeClass(headerNormalizeClass);
			}
		},
		enablePromosArea: function() {
			var $promosEl = $('#promos');
			var $mainEl = $('#main');
			var $footerEl = $('#basket-footer');
			if($promosEl.hasClass('hidden')) {
				$promosEl.removeClass('hidden');
			}
			if(!$mainEl.hasClass('laplarge-and-up-two-thirds')) {
				$mainEl.addClass('laplarge-and-up-two-thirds');
			}
			if(!$footerEl.hasClass('laplarge-and-up-two-thirds')) {
				$footerEl.addClass('laplarge-and-up-two-thirds');
			}
			that.normalizeHeaderAndFooter();
		},
		isInEditor: function() {
			var cmsAddAttr = $('#promos').attr('cms:add');
			return !((typeof cmsAddAttr === typeof undefined || cmsAddAttr === false));
		},
		crossSellLinkClick: function (e) {
			BXT.upsells.doActivateUpsell(e);
		}
	};
	var that = process;
	PBX.utils.functionList.push({ test: '.basket-component', func: process.init, ctx: process });
	return process;
})(BXT, $, PBX);