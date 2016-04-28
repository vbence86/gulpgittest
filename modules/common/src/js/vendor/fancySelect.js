/**
 * This has been modified - please do not override.
 */

(function() {
	var $;

	$ = window.jQuery || window.Zepto || window.$;

	$.fn.fancySelect = function(opts) {
		var isiOS, isAndroid, settings, inScroll;
		settings = $.extend({
			forceiOS: false,
			forceAndroid: false
		}, opts);
		isiOS = !!navigator.userAgent.match(/iP(hone|od|ad)/i);
		isAndroid = !!navigator.userAgent.match(/Android/i);
		return this.each(function() {
			var copyOptionsToList, disabled, options, sel, trigger, updateTriggerText, wrapper;
			sel = $(this);
			if (sel.hasClass('fancified') || sel[0].tagName !== 'SELECT') {
				return;
			}
			sel.wrap('<div class="fancy-select">');
			wrapper = sel.parent();
			if (sel.data('class')) {
				wrapper.addClass(sel.data('class'));
			}
			wrapper.prepend('<div class="trigger">');
			if (!((isiOS && !settings.forceiOS) || (isAndroid && !settings.forceAndroid))) {
				wrapper.append('<ul class="options">');
			}
			trigger = wrapper.find('.trigger');
			options = wrapper.find('.options');
			disabled = sel.prop('disabled');
			sel.addClass('fancified');
			sel.css({
						width: 1,
						height: 1,
						display: 'block',
						position: 'absolute',
						top: 0,
						left: 0,
						opacity: 0
			});
			if (disabled) {
				wrapper.addClass('disabled');
			}
			updateTriggerText = function() {
				var result;
				var selected;
				if (sel.find(':selected').length) {
					selected = sel.find(':selected');
				} else {
					selected = sel.find('[selected="selected"]');
				}
				if (selected.length) {
					if (selected.data('rich-text')){
						result = trigger.html(PBX.utils.htmlUnescape(selected.data('rich-text')));
					} else {
						result = trigger.text(selected.text());
					}
				}
				if((isiOS && !settings.forceiOS) || (isAndroid && !settings.forceAndroid)) {
					sel.width('100%');
					sel.height('100%');
				}
				return result;
			};
			sel.on('blur', function() {
		if (inScroll) {
			return sel.focus();
		}
		if (trigger.hasClass('open')) {
					return setTimeout(function() {
						return trigger.trigger('close');
					}, 120);
				}
			});
			trigger.on('close', function() {
				trigger.removeClass('open');
				return options.removeClass('open');
			});
			trigger.on('click', function() {
				var offParent, parent;
				if (!disabled) {
					trigger.toggleClass('open');
					if ((isiOS && !settings.forceiOS) || (isAndroid && !settings.forceAndroid)) {
						if (trigger.hasClass('open')) {
							return sel.focus();
						}
					} else {
						if (trigger.hasClass('open')) {
							parent = trigger.parent();
							offParent = parent.offsetParent();
							if ((parent.offset().top + parent.outerHeight() + options.outerHeight() + 20) > $(window).height()) {
								options.addClass('overflowing');
							} else {
								options.removeClass('overflowing');
							}
						}
						options.css('padding-top', trigger.outerHeight());
						options.toggleClass('open');
						if (!isiOS && !isAndroid) {
							return sel.focus();
						}
					}
				}
			});
			sel.on('enable', function() {
				sel.prop('disabled', false);
				wrapper.removeClass('disabled');
		return disabled = false;
			});
			sel.on('disable', function() {
				sel.prop('disabled', true);
				wrapper.addClass('disabled');
				return disabled = true;
			});
			sel.on('change', function(e) {
				if (e.originalEvent && e.originalEvent.isTrusted) {
					return e.stopPropagation();
				} else {
					return updateTriggerText();
				}
			});
			sel.on('keydown', function(e) {
				var hovered, newHovered, w;
				w = e.which;
				hovered = options.find('.hover');
				hovered.removeClass('hover');
				if (!options.hasClass('open')) {
					if (w === 13 || w === 32 || w === 38 || w === 40) {
						e.preventDefault();
						return trigger.trigger('click');
					}
				} else {
					if (w === 38) {
						e.preventDefault();
						if (hovered.length && hovered.index() > 0) {
							hovered.prev().addClass('hover');
						} else {
							options.find('li:last-child').addClass('hover');
						}
					} else if (w === 40) {
						e.preventDefault();
						if (hovered.length && hovered.index() < options.find('li').length - 1) {
							hovered.next().addClass('hover');
						} else {
							options.find('li:first-child').addClass('hover');
						}
					} else if (w === 27) {
						e.preventDefault();
						trigger.trigger('click');
					} else if (w === 13 || w === 32) {
						e.preventDefault();
						hovered.trigger('click');
					} else if (w === 9) {
						if (trigger.hasClass('open')) {
							trigger.trigger('close');
						}
					}
					newHovered = options.find('.hover');
					if (newHovered.length) {
						options.scrollTop(0);
						return options.scrollTop(newHovered.position().top - 12);
					}
				}
			});
			options.on('click', 'li', function(e) {
			var value = $(this).data('value');
			sel.find('option').each(function() {
				if (String($(this).val()) == String(value)) {
				 $(this).attr('selected', 'selected');
				} else {
				 $(this).attr('selected', false);
				}
		});
		sel.val($(this).data('value'));
				if (!isiOS && !isAndroid) {
					sel.trigger('blur').trigger('focus');
				}
				options.find('.selected').removeClass('selected');
				$(e.currentTarget).addClass('selected');
				return sel.val($(this).data('value')).trigger('change').trigger('blur').trigger('focus');
			});
			options.on('mouseenter', 'li', function() {
				var hovered, nowHovered;
				nowHovered = $(this);
				hovered = options.find('.hover');
				hovered.removeClass('hover');
				return nowHovered.addClass('hover');
			});
			options.on('mouseleave', 'li', function() {
				return options.find('.hover').removeClass('hover');
			});
		options.on('mousedown', function() {
			inScroll = true;
			return true;
		});
		$('body').on('mouseup', function() {
		 inScroll = false;
			return true;
		});
			copyOptionsToList = function() {
				var selOpts;
				updateTriggerText();
				if ((isiOS && !settings.forceiOS) || (isAndroid && !settings.forceAndroid)) {
					return;
				}
				selOpts = sel.find('option');
				return sel.find('option').each(function(i, opt) {
					opt = $(opt);
					if (opt.val() && !opt.prop('disabled')) {
						var text =  opt.data('rich-text') ? PBX.utils.htmlUnescape(opt.data('rich-text')) : opt.text();
						if (opt.prop('selected')) {
							if(!sel.hasClass('no-selected-option')) {
								return options.append("<li data-value=\"" + (opt.val()) + "\" class=\"selected\">" + text + "</li>");
							}
						} else {
							return options.append("<li data-value=\"" + (opt.val()) + "\">" + text + "</li>");
						}
					}
				});
			};
			sel.on('update', function() {
				wrapper.find('.options').empty();
				return copyOptionsToList();
			});
			return copyOptionsToList();
		});
	};

}).call(this);
