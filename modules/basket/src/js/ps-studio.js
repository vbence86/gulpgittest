var BXT = window.BXT || {};
BXT.psStudioUtil = (function (BXT, $, PBX) {
	var process = {
		getBasePath: function(action, nodeId) {
			var path = window.location.origin;
			var contextPath = $('#node-'+PBX.utils.getNodeId()).data('ajax-url');
			path = contextPath === '' || contextPath === null ? path : path + contextPath;
			if (action === 'basket') {
				path += '/basketAjax/basket-ajax/item-ajax';
			} else {
				path += '/userAjax/user-ajax/pasha';
			}
			return path + '?nid=' + nodeId;
		},
		addCreationToBasket: function(creationId, quantity, nodeId, successCallback, errorCallback) {
			var options = {
				type: 'POST',
				success: successCallback,
				error: errorCallback
			};
			PBX.utils.loadData(that.getBasePath('basket', nodeId) + '&creationId=' + creationId + '&quantity=' +
				quantity, options);
		},
		loadUserData: function (nodeId, successCallback, errorCallback) {
			var options = {
				type: 'GET',
				success: successCallback,
				error: errorCallback
			};
			PBX.utils.loadData(that.getBasePath('user', nodeId), options);
		}
	};
	var that = process;
	return process;
})(BXT, $, PBX);
BXT.psStudio = (function (BXT, $, PBX) {
	var studioContainerId = 'studio';
	var disabledClass = 'disabled';
	var process = {
		isAuthenticated: false,
		addToBasketAfterSave: false,
		saveAfterLogin: false,
		init: function () {
			$('#studio-header-next-button').on('click', function click(e) {
				if (!$(e.target).hasClass(disabledClass)) {
					that.onNextButtonClick();
				}
				return false;
			});
			
			$(window).load(function(){
				$('html, body').animate({scrollTop: $('#studio-header').offset().top},1000);
			});

			$(window).css('overflow-y','scroll');

			$('#studio-header-back-button').on('click', function click(e) {
				if ($(e.target).hasClass(disabledClass)) {
					return false;
				}
			});

			that.isAuthenticated = $('#studio-header').data('authenticated');

			BXT.login.setCallback(that.onLogin);
			BXT.registration.setCallback(that.onLogin);

			window.studio = {
				saveDesign: that.saveDesign,
				updatePageTitle: that.updatePageTitle
			};
		},
		getQuantity: function() {
			var quantity = parseInt($('.studio-container').data('quantity'), 10);
			return (!isNaN(quantity) && quantity > 0) ? quantity : 1;
		},
		getNodeId: function() {
			return $('.studio-container').data('node-id');
		},
		callStudioSave: function () {
			var studio = $('#' + studioContainerId)[0];
			studio.saveCreation('BXT.psStudio.onCreationSaved');
			studio.tabIndex = 0;
			studio.focus();
		},
		callStudioSetUserIds: function (userId, babelMemberId) {
			var studio = $('#' + studioContainerId)[0];
			studio.setUserIds(userId, babelMemberId);
		},
		disableButtons: function () {
			$('#studio-header-next-button, #studio-header-back-button').addClass(disabledClass);
		},
		enableButtons: function () {
			$('#studio-header-next-button, #studio-header-back-button').removeClass(disabledClass);
		},
		saveDesign: function () {
            that.addToBasketAfterSave = false;
			that.callStudioSave();
		},
		updatePageTitle: function (nameOfCreation, escapeHTML) {
			if (escapeHTML !== false) {
				nameOfCreation = nameOfCreation.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
			}
			$('#studio-header .design-name').html(nameOfCreation);
		},
		onNextButtonClick: function () {
			that.addToBasketAfterSave = true;
			that.callStudioSave();
		},
		onCreationSaved: function(designId, creationId) {
			if (that.addToBasketAfterSave) {
				that.disableButtons();
				PBX.modalLoader.show();
				BXT.psStudioUtil.addCreationToBasket(creationId, that.getQuantity(), that.getNodeId(),
					function (data, status, jqXHR) {
						window.location.href = $('#studio-header-next-button').attr('href');
					},
					function (data, status, jqXHR) {
						// TO-DO add error message
						that.enableButtons();
						PBX.modalLoader.hide();
					}
				);
			}
		},
		onLogin: function() {
			that.disableButtons();
			PBX.modalLoader.show();
			BXT.psStudioUtil.loadUserData(
				that.getNodeId(),
				function(data, status, jqXHR) {
					PBX.modalLoader.hide();
					that.enableButtons();
					that.callStudioSetUserIds(data.pashaMemberId, data.babelMemberId);
					that.isAuthenticated = true;
					if (that.saveAfterLogin) {
						that.callStudioSave();
					}
				},
				function(jqXHR, status, errorThrown) {
					PBX.modalLoader.hide();
					that.enableButtons();
					// TO-DO add error message
				}
			);
		}
	};
	var that = process;
	PBX.utils.functionList.push({ test: '.studio-container', func: process.init, ctx: process });
	return process;
})(BXT, $, PBX);
BXT.psMStudio = (function (BXT, $, PBX) {
	var process = {
		init: function () {
			if ('onhashchange' in window) {
				window.onhashchange = function () {
					that.onHashChanged(window.location.hash);
				};
			} else {
				var storedHash = window.location.hash;
				window.setInterval(function () {
					if (window.location.hash !== storedHash) {
						storedHash = window.location.hash;
						that.onHashChanged(storedHash);
					}
				}, 100);
			}

			BXT.login.setCallback(that.onLogin);
			BXT.registration.setCallback(that.onLogin);
		},
		getNodeId: function() {
			return $('#mstudio-container').data('node-id');
		},
		getQuantity: function() {
			var quantity = parseInt($('#mstudio-container').data('quantity'), 10);
			return (!isNaN(quantity) && quantity > 0) ? quantity : 1;
		},
		onHashChanged: function(hash) {
			if (hash.indexOf('add-to-basket') !== -1) {
				var creationId = hash.split('/')[1];
				that.onCreationSaved(creationId);
			}
		},
		onCreationSaved: function(creationId) {
			BXT.psStudioUtil.addCreationToBasket(creationId, that.getQuantity(), that.getNodeId(),
				function (data, status, jqXHR) {
					window.location.href = $('#mstudio-container').data('basket-url');
				},
				function (data, status, jqXHR) {
					window.location.href = $('#mstudio-container').data('basket-url');
				}
			);
		},
		onLogin: function() {
			PBX.modalLoader.show();
			BXT.psStudioUtil.loadUserData(
				that.getNodeId(),
				function(data, status, jqXHR) {
					var BXTmStudioBridge = window.BXTmStudioBridge;
					PBX.modalLoader.hide();
					if (BXTmStudioBridge) {
						if (BXTmStudioBridge.user && typeof BXTmStudioBridge.user.setBabelMemberId === 'function' &&
							typeof BXTmStudioBridge.user.setUserId === 'function') {
							BXTmStudioBridge.user.setBabelMemberId(data.babelMemberId.toString());
							BXTmStudioBridge.user.setUserId(data.pashaMemberId);
						}
						if (BXTmStudioBridge.studio) {
							if (typeof BXTmStudioBridge.studio.setUser === 'function'){
								BXTmStudioBridge.studio.setUser();
							}
							if (typeof BXTmStudioBridge.studio.saveTypeActionAfterLogin === 'function') {
								BXTmStudioBridge.studio.saveTypeActionAfterLogin();
							}
						}
					}
				},
				function(jqXHR, status, errorThrown) {
					PBX.modalLoader.hide();
					// TO-DO add error message
				}
			);
		}
	};
	var that = process;
	PBX.utils.functionList.push({ test: '#mstudio-container', func: process.init, ctx: process });
	return process;
})(BXT, $, PBX);
