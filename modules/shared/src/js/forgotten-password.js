var SHARED = window.SHARED || {};
SHARED.forgottenPassword = (function (SHARED, $, PBX) {
	var process = {
		isOverlayComponent: false,
		$formEl: null,
		init: function () {
			that.isOverlayComponent = $('#hidden-area #forgotten-password').length > 0;
			that.$formEl = $('#forgotten-password form');
			if (that.isOverlayComponent) {
				$('#form-register').data('validate-email','true');
				$('*[data-target-component="forgotten-password"]').on('click', function click(event) {
					if (!SHARED.utils.isSmallScreen()) {
						that.onForgottenLinkClick();
						return false;
					}
				});
			}
			$('#forgotten-password form').submit(function (event) {
				return that.onForgottenSubmit(event);
			});
		},
		getBasePath: function() {
			var path = PBX.utils.getWindowOrigin();
			var contextPath = $('#node-'+SHARED.utils.getNodeId()).data('ajax-url');
			path = contextPath === '' || contextPath === null ? path : path + contextPath;
			return path + '/userAjax/user-ajax/reset-password?nid=' + $('#forgotten-password').data('node-id');
		},
		sendForgottenRequest: function($formEl) {
			PBX.modalLoader.show();
			var options = {
				type: 'POST',
				data: {
					email: $formEl.find('#email').val()
				},
				dataType: 'json',
				success: function(data, status, jqXHR) {
					that.isOverlayComponent = $('#hidden-area #forgotten-password').length > 0;
					if (that.isOverlayComponent) {
						PBX.modalLoader.hide();
						that.showResetMessage(options.data.email);
						PBX.overlayComponents.showComponent('login');
						location.reload();
					} else {
						var previousPage = SHARED.utils.getPreviousPage();
						if(previousPage === undefined){
							window.location.replace($('#forgotten-password').data('login-url')+'?afterForgottenPassword=true&email='+$('#email').val());
						}
						else{
							window.location.replace($('#forgotten-password').data('login-url')+'?afterForgottenPassword=true&email='+$('#email').val() + '&previousPage=' + encodeURIComponent(previousPage) );
						}
					}
				},
				error: function(jqXHR, status, errorThrown) {
					PBX.modalLoader.hide();
					$('#forgotten-password  .errorMsg').removeClass('not-valid');
				}
			};
			SHARED.asyncLoader.loadData(that.getBasePath(), options, true);
		},
		resetFields: function(){
			SHARED.validation.hideMessages(that.$formEl);
			SHARED.validation.clearFormFields(that.$formEl);
		},
		showResetMessage: function(email){
			that.resetFields();
			$('#login .header .title').addClass('hidden');
			$('#login .header .reset-title').removeClass('hidden');
			$('#loginForm .reset-message.top-message').removeClass('hidden');
			$('#loginForm .error').addClass('hidden');
			$('#j_username').val(email);
			$('#j_password').val('');
		},
		onForgottenLinkClick: function() {
			that.resetFields();
			PBX.overlayComponents.showComponent('forgotten-password');
		},
		onForgottenSubmit: function(event) {
			var $formEl = $(event.target);
			var isValid = SHARED.validation.runValidation($formEl);
			if (isValid) {
				that.sendForgottenRequest($formEl);
				return false;
			} else {
				return false;
			}
		}
	};
	var that = process;
	SHARED.utils.functionList.push({ test: '#forgotten-password', func: process.init });
	return process;
})(SHARED, $, PBX);
