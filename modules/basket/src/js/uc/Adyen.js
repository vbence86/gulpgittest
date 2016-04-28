var UC = (function () {
	var STATIC_CONTAINER_PADDING = 20;

	var __ = function (token, el, attr) {
		var tokenAttr = 'data-token-' + token;
		var tokenEl =  document.querySelector('[' + tokenAttr + ']');
		if (tokenEl) {
			var tokenValue = tokenEl.getAttribute(tokenAttr)
			if (typeof el === 'string') {
				el = document.getElementById(el);
			}
			if (el && !attr) {
				el.innerHTML = tokenValue;
			} else if (el && attr) {
				el[attr] = tokenValue;
			}
			return tokenValue;
		} else {
			if (console && console.log) {
				console.log('token not defined ' + token);
			}
		}
	};

	var setHeight = function(el, newHeight) {
		if (el) {
			el.style.height = newHeight + 'px';
		}
	};

	var hideElement = function (el) {
		if (el) {
			el.style.display = 'none';
		}
	};

	var hideCVCDetails = function (el, details) {
		if(el.offsetHeight) {
			var detailsHeight = details.offsetHeight - el.offsetHeight - STATIC_CONTAINER_PADDING;
			setHeight(details, detailsHeight);
			hideElement(el);
		}
	};

	var hidePopupDetails = function (details, cvcInfoEl) {
		oneClickComponent.hideDetails();
		hideCVCDetails(cvcInfoEl, details);
	};

	var paymentTitleHandler = function (details, cvcInfoEl) {
		return function (event) {
			event.preventDefault();
			hidePopupDetails(details, cvcInfoEl);
			if(collapsecard) {
				show(collapsecard, 'completeCard.shtml', 'card', 'brandCodeUndef');
			}
		};
	};

	var toggleDetailsHeight = function (info,  details, initialInfoHeight) {
		var infoHeight = info.offsetHeight,
			detailsCurrentHeight = details.offsetHeight,
			detailsHeight = !infoHeight ? (detailsCurrentHeight - initialInfoHeight - STATIC_CONTAINER_PADDING) :
				(infoHeight + detailsCurrentHeight + STATIC_CONTAINER_PADDING);

		setHeight(details, detailsHeight);
	};

	var cvcTitleHandler = function (info, details) {
		return function (event) {
			var initialInfoHeight = info.offsetHeight;
			event.preventDefault();
			event.stopPropagation();
			toggleElement( 'card.cvcFrame' );
			toggleDetailsHeight(info, details, initialInfoHeight);
		};

	};

	var deviceType = function () {
		//to know the device
		var userAgent = navigator.userAgent.toLowerCase(),
			device = userAgent.search('mobile'),
			winW = 0
			;

		//To know the width between tablet/mobile
		if (document.body && document.body.offsetWidth) {
			winW = document.body.offsetWidth;
		}
		if (document.compatMode=='CSS1Compat' && document.documentElement && document.documentElement.offsetWidth) {
			winW = document.documentElement.offsetWidth;
		}
		if (window.innerWidth) {
			winW = window.innerWidth;
		}

		if (device == -1) {
			device = 'desktop';
		} else if ((userAgent.search('ipad') > -1) || (winW > 480)) {
			device = 'tablet';
		} else {
			device = 'mobile';
		}
		return device;
	};

	var apply_html_blocks = function () {
		var edit = document.getElementsByClassName('edit');
		if (page_data && page_data.blocks) {
			for (i in page_data.blocks) {
				if (document.getElementById(i) && page_data.blocks[i].body) {
					document.getElementById(i).innerHTML = page_data.blocks[i].body;
				}
			}
			if(document.getElementById('paymentMethods')){
				document.getElementById('paymentMethods').insertAdjacentHTML('afterend', '<div id="payment_additional_info"></div>');
				__('TOKENS.PAYMENT_ADDITIONAL_INFO',document.getElementById('payment_additional_info'));
			}

		}

		for(var i=0; i< edit.length; i++){
			edit[i].href = document.referrer.split( '/' ).slice(0,3).join('/') + edit[i].getAttribute('href');
		}

	};

	var setBodyClass = function (cssClass) {
		if (cssClass) {
			document.body.className += cssClass;
		}
	};

	var setInitialCollapse = function () {
		if (collapsecard) {
			show(collapsecard, 'completeCard.shtml', 'card', 'brandCodeUndef');
		}
	};

	//TODO Not sure what is this, is it really needed?
	var someCrazyHack = function (details) {
		var nua = navigator.userAgent,
			detailsInitial = details.offsetHeight;

		if ((nua.indexOf('Mozilla/5.0') > -1 && nua.indexOf('Android ') > -1 && nua.indexOf('AppleWebKit') > -1) && !(nua.indexOf('Chrome') > -1)) {
			setHeight(details, detailsInitial + 50);
			toggleElement( 'card.cvcFrame' );
		}
	};

	var addListeners = function (listeners) {
		var listenersLen = listeners.length;
		while (listenersLen--) {
			var listener = listeners[listenersLen];
			if (listener && listener.el && listener.event && listener.handler) {
				listener.el[listener.event] = listener.handler;
			}
		}
	};

	var clearElAttributes = function (elements, atribbute) {
		var elementsLength = elements.length;
		while (elementsLength--) {
			var element = elements[elementsLength];
			element.removeAttribute(atribbute);
		}
	};

	var init = function () {
		var title = document.querySelector('.pmBcard'),
			cvv = document.getElementById('card.cvcWhatIs'),
			frame = document.getElementById('card.cvcFrame'),
			details = document.querySelector("[id^='pmmdetails-']"),
			oneClickEl = document.querySelector('input[id="card.storeOcDetails"]');

		oneClickComponent.init(oneClickEl, details);
	};

	/* One click component */
	var oneClickComponent = (function() {

		var getConfig = function (oneClickEl, paymentDetailsEl) {
			return {
				oneClickLabel: {
					parentEl: oneClickEl ? oneClickEl.parentNode : null,
					el: 'span',
					klass: 'oneClickWhatIs',
					text: __('one-click-what-is-this')
				},
				oneClickPopup: {
					parentEl: paymentDetailsEl,
					el: 'div',
					klass: 'popupMsg',
					attrs: {
						style: 'display: none;'
					},
					elements: [{
						el: 'h3',
						klass: 'oneClickPopupHeader',
						text: __('one-click-popup-header')
					},{
						el: 'p',
						klass: 'oneClickPopupText',
						text: __('one-click-popup-text')
					}]
				}
			};
		};

		var oneClickComponent = {
			createElement: function(options) {
				var newEl = document.createElement(options.el);
				this.setClass(newEl,options.klass);
				this.setText(newEl, options.text);
				this.setAttrs(newEl, options.attrs);
				this.createChildren(options.elements, newEl);
				options.parentEl.appendChild(newEl);
				return newEl;
			},
			setOneClickCheckbox: function (checkbox) {
				if (checkbox &&  UC.__('one-click-checkbox') === 'unchecked') {
					checkbox.checked = false;
				}
			},
			setAttrs: function(el, attrs) {
				if (attrs) {
					for(var attr in attrs) {
						el.setAttribute(attr, attrs[attr]);
					}
				}
				return el;
			},
			setText: function(el, txt) {
				if (txt) {
					el.innerHTML = txt;
				}
				return el;
			},
			setClass: function(el, klass) {
				if (klass) {
					el.className = klass;
				}
				return el;
			},
			hideInfo: function() {
				var popUpHeight = this.infoPopup.offsetHeight,
					detailsHeight = this.popupParent.offsetHeight,
					newHeight = detailsHeight - popUpHeight - STATIC_CONTAINER_PADDING;

				this.infoPopup.style.display = 'none';
				this.isVisible = false;
				if (popUpHeight) {
					setHeight(this.popupParent, newHeight);
				}
			},
			showInfo: function() {
				this.initialParentHeight = this.popupParent.offsetHeight;
				this.infoPopup.style.display = 'block';
				setHeight(this.popupParent, this.initialParentHeight + this.infoPopup.offsetHeight + STATIC_CONTAINER_PADDING);
				this.isVisible = true;
			},
			toggleInfo: function() {
				if (this.isVisible) {
					this.hideInfo();
				} else {
					this.showInfo();
				}
			},
			onInfoClick: function(e) {
				this.toggleInfo();
			},
			addListeners: function() {
				var self = this;
				this.labelEl.onclick = function(e) {
					self.onInfoClick.call(self, e);
				};
			},
			createChildren: function(children, parent) {
				if (children) {
					for (var i = 0, len = children.length; i < len; i++) {
						var el = children[i];
						el.parentEl = parent;
						this.createElement(el);
					}
				}
			},
			init: function(options, oneClickEl) {
				this.labelEl = this.createElement(options.oneClickLabel);
				this.infoPopup = this.createElement(options.oneClickPopup);
				this.popupParent = options.oneClickPopup.parentEl;
				this.setOneClickCheckbox(oneClickEl);
				this.addListeners();
			}
		};

		//Api for one click component
		return {
			init: function (oneClickEl, paymentDetailsEl) {
				if (oneClickEl && paymentDetailsEl) {
					var config = getConfig(oneClickEl, paymentDetailsEl);
					oneClickComponent.init(config, oneClickEl);
				}
			},
			hideDetails: function() {
				oneClickComponent.hideInfo.call(oneClickComponent);
			}
		};

	})();

	//Api
	return {
		deviceType: deviceType,
		__: __,
		init: init
	};
})();
UC.init();