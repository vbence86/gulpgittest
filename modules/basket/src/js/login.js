var BXT = window.BXT || {};
BXT.login = (function (BXT, $, PBX) {
	var process = {
		isOverlayComponent: false,
		callbacksArr: [],
		init: function () {
			that.isOverlayComponent = $('#hidden-area #login').length > 0;
			if (that.isOverlayComponent) {
				$('*[data-target-component="login"]').on('click touchstart', function click(event) {
					if (!PBX.utils.isPalm) {
						that.onLoginLinkClick();
						return false;
					}
				});
			}
			$('#loginForm').submit(function (event) {
				return that.onLoginSubmit(event);
			});
		},
		setCallback: function (callback){
			that.callbacksArr.push(callback);
		},
		resetFields: function(){
			var $formEl = $('#login form');
			BXT.validation.hideMessages($formEl);
			BXT.validation.clearFormFields($formEl);
		},
		showLogin: function () {
			if (that.isOverlayComponent) {
				PBX.overlayComponents.showComponent('login');
			} else {
				alert('you should be logged in for this action');
				// TO-DO add popup with localized message 
			}
		},
		getBasePath: function() {
			var path = window.location.origin;
			var contextPath = $('#node-' + PBX.utils.getNodeId()).data('ajax-url');
			path = contextPath === '' || contextPath === null ? path : path + contextPath;
			return path + '/userAjax/user-ajax/login?nid=' + $('#login').data('node-id');
		},
		sendLoginRequest: function($formEl) {
			PBX.modalLoader.show();
			var options = {
				type: 'POST',
				data: {
					email: $formEl.find('#j_username').val(),
					password: $formEl.find('#j_password').val(),
					rememberMe: ($formEl.find('#rememberMe1').checked ? 'true' : 'false' )
				},
				success: function (data, status, jqXHR) {
					if(BXT.stkSiteData && BXT.stkSiteData.pageName === 'basket'){
						PBX.largeLoader.loader('#component-basket');
					}
					PBX.smallLoader.loader('.login li');
					PBX.smallLoader.loader('.myAccount .link');
					PBX.modalLoader.hide();
					if(that.isOverlayComponent){
						if(PBX.overlayComponents.hasPreviousPage()) {
							PBX.overlayComponents.goToInitialPage();
						} else {
							PBX.asyncLoader.reloadContent();
							for (var i = 0, l = that.callbacksArr.length; i < l; i++) {
								that.callbacksArr[i]();
							}
							PBX.overlayComponents.hideComponent('login');
						}
					} else {
						PBX.overlayComponents.goToInitialPage();
					}
				},
				error: function (jqXHR, status, errorThrown) {
					PBX.modalLoader.hide();
					$('#login .error').removeClass('hidden');
				}
			};
			PBX.utils.loadData(that.getBasePath(), options, true);
		},
		onLoginLinkClick: function() {
			that.resetFields();
			that.showLogin();
		},
		onLoginSubmit: function(event) {
			var $formEl = $(event.target);
			BXT.validation.hideMessages($formEl);
			var isValid = BXT.validation.runValidation($formEl);
			if (isValid) {
				if (that.isOverlayComponent){
					that.sendLoginRequest($formEl);
					return false;
				} else {
					return true;
				}
			} else {
				return false;
			}
		}
	};
	var that = process;
	PBX.utils.functionList.push({ test: '#login', func: process.init });
	return process;
})(BXT, $, PBX);
