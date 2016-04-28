var SHARED = window.SHARED || {};
var GA = window.GA || {};
SHARED.login = (function (SHARED, $, PBX) {
	var process = {
		isOverlayComponent: false,
		callbacksArr: [],
		init: function () {
			that.isOverlayComponent = $('#hidden-area #login').length > 0;
			if (that.isOverlayComponent) {
				$('*[data-target-component="login"]').on('click', function click(event) {
					if (!SHARED.utils.isSmallScreen()) {
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
			SHARED.validation.hideMessages($formEl);
			SHARED.validation.clearFormFields($formEl);
		},
		showLogin: function () {
			if (that.isOverlayComponent) {
				PBX.overlayComponents.showComponent('login');
			}
		},
		getBasePath: function() {
			var path = SHARED.utils.getWindowOrigin();
			var contextPath = $('#node-'+SHARED.utils.getNodeId()).data('ajax-url');
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
					if(GA.stkSiteData.pageName === 'basket'){
						PBX.largeLoader.loader('#component-basket');
					}
					PBX.smallLoader.loader('.login li');
					PBX.smallLoader.loader('.myAccount .link');
					PBX.modalLoader.hide();
					if(that.isOverlayComponent){
						if(PBX.overlayComponents.hasPreviousPage()){
							PBX.overlayComponents.goToInitialPage();
						} else {
							SHARED.asyncLoader.reloadContent();
							location.reload();
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
			SHARED.asyncLoader.loadData(that.getBasePath(), options, true);
		},
		onLoginLinkClick: function() {
			that.resetFields();
			that.showLogin();
		},
		onLoginSubmit: function(event) {
			var $formEl = $(event.target);
			SHARED.validation.hideMessages($formEl);
			var isValid = SHARED.validation.runValidation($formEl);
			if (isValid) {
				that.sendLoginRequest($formEl);
			}
			return false;
		}
	};
	var that = process;
	SHARED.utils.functionList.push({ test: '#login', func: process.init });
	return process;
})(SHARED, $, PBX);
