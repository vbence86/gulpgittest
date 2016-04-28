var BXT = window.BXT || {};
BXT.forgottenPassword = (function (BXT, $, PBX) {
	var process = {
		isOverlayComponent: false,
		$formEl: null,
		init: function () {
			that.isOverlayComponent = $('#hidden-area #forgotten-password').length > 0;
			that.$formEl = $('#forgotten-password form');
			if (that.isOverlayComponent) {
				$('#form-register').data('validate-email','true');
				$('*[data-target-component="forgotten-password"]').on('click', function click(event) {
					if (!PBX.utils.isPalm) {
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
			var contextPath = $('#node-'+PBX.utils.getNodeId()).data('ajax-url');
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
					if (that.isOverlayComponent) {
						PBX.modalLoader.hide();
						that.showResetMessage(options.data.email);
						PBX.overlayComponents.showComponent('login');
					} else {
						var previousPage = PBX.utils.getPreviousPage();
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
					var responseText = $.parseJSON(jqXHR.responseText).toString();
					$('#forgotten-password  #' + responseText +'Err').removeClass('not-valid');
				}
			};
			PBX.utils.loadData(that.getBasePath(), options, true);
		},
		resetFields: function(){
			BXT.validation.hideMessages(that.$formEl);
			BXT.validation.clearFormFields(that.$formEl);
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
			var isValid = BXT.validation.runValidation($formEl);
			if (isValid) {
				if (that.isOverlayComponent){
					that.sendForgottenRequest($formEl);
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
	PBX.utils.functionList.push({ test: '#forgotten-password', func: process.init });
	return process;
})(BXT, $, PBX);
