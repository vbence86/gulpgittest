var SHARED = window.SHARED || {};
SHARED.registration = (function (SHARED, $, PBX) {
	var process = {
		isOverlayComponent: false,
		callbacksArr: [],
		init: function () {
			that.isOverlayComponent = $('#hidden-area #registration').length > 0;
			if (that.isOverlayComponent) {
				that.loginLink = $('#register .error a');
				$('*[data-target-component="registration"]').on('click', function click(event) {
					if (!SHARED.utils.isSmallScreen()) {
						that.onRegistrationLinkClick();
						return false;
					}
				});
				if(that.loginLink.closest('div').not('hidden')){
					that.loginLink.on('click', function(event){
						if (!SHARED.utils.isSmallScreen()) {
							PBX.overlayComponents.showComponent('login');
							return false;
						}
					});
				}
			}
			$('#registration form').submit(function (event) {
				return that.onRegistrationSubmit(event);
			});
			$('#registration form').on('keyup change', function (event) {
				if( $(event.target).hasClass('inputError') ){
					SHARED.validation.runValidation( $(this) );
				}
			});
		},

		setCallback: function (callback){
			that.callbacksArr.push(callback);
		},
		resetFields: function(){
			var $formEl = $('#registration form');
			$formEl.find('.register-error').addClass('hidden');
			SHARED.validation.hideMessages($formEl);
			SHARED.validation.clearFormFields($formEl);
		},
		getBasePath: function() {
			var path = PBX.utils.getWindowOrigin();
			var contextPath = $('#node-'+SHARED.utils.getNodeId()).data('ajax-url');
			path = contextPath === '' || contextPath === null ? path : path + contextPath;
			return path + '/userAjax/user-ajax/register?nid=' + $('#registration').data('node-id');
		},
		sendRegistrationRequest: function($formEl) {
			PBX.modalLoader.show();
			var data  = {};
			$formEl.find('input[id], select[id]').each(function(){
				var $el = $(this);
				var key = $el.attr('id');
				var value = $el.attr('type') === 'checkbox' ? (this.checked ? 'true' : 'false' ) : $el.val();
				data[key] = value;
			});
			var options = {
				type: 'POST',
				data: data,
				dataType: 'json',
				success: function(data, status, jqXHR) {
					PBX.smallLoader.loader('.login li');
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
				error: function(jqXHR, status, errorThrown) {
					PBX.modalLoader.hide();
					var responseText = $.parseJSON(jqXHR.responseText).toString();
					if(responseText === 'email-already-registered'){
						$('#registration .register-error').removeClass('hidden');
					} else {
						$('#registration #' + responseText +'Err').removeClass('not-valid');
					}
				}
			};
			SHARED.asyncLoader.loadData(that.getBasePath(), options, true);
		},
		onRegistrationLinkClick: function() {
			that.resetFields();
			PBX.overlayComponents.showComponent('registration');
		},
		onRegistrationSubmit: function(event) {
			var $formEl = $(event.target);
            var submitButtonEl = document.getElementById('submit');
            submitButtonEl.disabled = true;
			var isValid = SHARED.validation.runValidation($formEl);
			if (isValid) {
				if (that.isOverlayComponent){
					that.sendRegistrationRequest($formEl);
					return false;
				} else {
					return true;
				}
			} else {
                submitButtonEl.disabled = false;
				return false;
			}
		}
	};
	var that = process;
	SHARED.utils.functionList.push({ test: '#registration', func: process.init });
	return process;
})(SHARED, $, PBX);
