SHARED.validation = (function (SHARED, $) {
	var process = {
		passLength: 6,
		clearFormFields: function ($formEl) {
			var formEl = $(':input', $formEl);
			var formLen = formEl.length;
			var fieldType;
			for(var i = 0; i < formLen; i++){
				fieldType = formEl[i].type.toLowerCase();
				switch(fieldType){
				case 'text':
				case 'password':
					formEl[i].value = '';
					break;
				case 'radio':
				case 'checkbox':
					if(formEl[i].checked){
						formEl[i].checked = false;
					}
					break;
				default:
					break;
				}
			}
		},
		emailRegEx: /[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9]{2,4}(?:[a-zA-Z0-9-]*[a-zA-Z0-9])?/g,
		createValidationObject: function ($formEl) {
			var obj = {
				requiredFields: $formEl.find('input[data-mandatory="true"]'),
				matchFields: $formEl.find('input[id*="Confirmation"]'),
				emailFields: $formEl.find('input[id*="email"]'),
				userNameFields: $formEl.find('#j_username'),
				userPasswordFields: $formEl.find('#j_password'),
				passwordFields: $formEl.find('input[id*="password"]'),
				doEmailValidate: $formEl.data('validate-email'),
				doPassLengthValidate: $formEl.data('validate-passlength')
			};
			return obj;
		},
		runValidation: function ($formEl) {
			var isValid = true;
			var validationObject =  that.createValidationObject($formEl);
			var noOfMandatoryFields = validationObject.requiredFields.length;
			var noOfMatchFields = validationObject.matchFields.length;
			var noOfEmailFields = validationObject.emailFields.length;
			var noOfUserNameFields = validationObject.userNameFields.length;
			var noOfUserPasswordFields = validationObject.userPasswordFields.length;
			var noOfPasswordFields = validationObject.passwordFields.length;
			var i = 0;
			that.hideMessages($formEl);
			if (noOfUserNameFields > 0) {
				for (i = 0; i < noOfUserNameFields; i++) {
					isValid = that.emailValidator(validationObject.userNameFields[i], $formEl, isValid);
				}
			}
			if (validationObject.doPassLengthValidate && noOfUserPasswordFields > 0) {
				for (i = 0; i < noOfUserPasswordFields; i++) {
					isValid = that.passLengthValidator(validationObject.userPasswordFields[i], $formEl, isValid);
				}
			}
			if (noOfMandatoryFields > 0) {
				for (i = 0; i < noOfMandatoryFields; i++) {
					isValid = that.mandatoryValidator(validationObject.requiredFields[i], $formEl, isValid);
				}
			}
			if (noOfMatchFields > 0) {
				for (i = 0; i < noOfMatchFields; i++) {
					isValid = that.matchValidator(validationObject.matchFields[i], $formEl, isValid);
				}
			}
			if (validationObject.doEmailValidate || validationObject.doEmailValidate === 'true') {
				if (noOfEmailFields > 0) {
					for (i = 0; i < noOfEmailFields; i++) {
						isValid = that.emailValidator(validationObject.emailFields[i], $formEl, isValid);
					}
				}
			}
			if (validationObject.doPassLengthValidate || validationObject.doPassLengthValidate === 'true') {
				if (noOfPasswordFields > 0) {
					for (i = 0; i < noOfPasswordFields; i++) {
						isValid = that.passLengthValidator(validationObject.passwordFields[i], $formEl, isValid);
					}
				}
			}
			return isValid;
		},
		mandatoryValidator: function (fieldToCheck, $formEl, isValid) {
			if (fieldToCheck.value === '' && fieldToCheck.type !== 'checkbox') {
				isValid = false;
				that.showMessage(fieldToCheck, $formEl);
			} else if (!fieldToCheck.checked && fieldToCheck.type === 'checkbox' && fieldToCheck.getAttribute('data-inverted') === 'false') {
				isValid = false;
				that.showMessage(fieldToCheck, $formEl);
			} else if (fieldToCheck.checked && fieldToCheck.type === 'checkbox' && fieldToCheck.getAttribute('data-inverted') === 'true') {
				isValid = false;
				that.showMessage(fieldToCheck, $formEl);
			}
			return isValid;
		},
		matchValidator: function (fieldToCheck, $formEl, isValid) {
			var fieldToMatchId = fieldToCheck.id.replace('Confirmation', '');
			isValid = that.mandatoryValidator(fieldToCheck, $formEl, isValid);
			if (fieldToCheck.value !== $formEl.find('input[id="' + fieldToMatchId + '"]').val()) {
				isValid = false;
				that.showMessage(fieldToCheck, $formEl);
			}
			return isValid;
		},
		emailValidator: function (fieldToCheck, $formEl, isValid) {
			if (fieldToCheck.value.search(that.emailRegEx) < 0) {
				isValid = false;
				that.showMessage(fieldToCheck, $formEl);
			}
			return isValid;
		},
		passLengthValidator: function (fieldToCheck, $formEl, isValid) {
			if (fieldToCheck.value.length < that.passLength) {
				isValid = false;
				that.showMessage(fieldToCheck, $formEl);
			}
			return isValid;
		},
		showMessage: function (fieldToCheck, $formEl) {
			$formEl.find('#' + fieldToCheck.id).addClass('inputError');
			$formEl.find('.error').removeClass('hidden');
			$formEl.find('#' + fieldToCheck.id + 'Err').removeClass('not-valid');
		},
		hideMessages: function ($formEl) {
			$formEl.find('div[id*="Err"]').addClass('not-valid');
			$formEl.find('input').removeClass('inputError');
			$formEl.find('.error').addClass('hidden');
		}
	};
	var that = process;
	return process;
})(SHARED, $);

SHARED = window.SHARED || {};
SHARED.asyncLoader = (function (SHARED, $) {
	var process = {
		reloadContent: function () {
			var allAsyncContainers = $('[data-async="true"]');
			allAsyncContainers.each(function (i) {
				var $that = $(this);
				SHARED.asyncLoader.fetchContent($that.data('replacement-url'), $that);
			});
		},
        refreshElement: function(elementId, callback, params) {
			var element = $(elementId);
			if (element.length) {
				var elementUrl = element.data('replacement-url');
				SHARED.asyncLoader.fetchContent(elementUrl, element, callback, params);
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
						SHARED.asyncLoader.populateContent(data, cont);
						if (typeof callback !== typeof undefined && callback !== null) {
							callback.call();
						}
					},
					error: function (xhr, status, err) {
						SHARED.asyncLoader.errorContent(err, cont);
					}
				});
			}
		},
		populateContent: function (data, cont) {
			cont.replaceWith(data);
			SHARED.asyncLoader.checkLoader($(data));
		},
		errorContent: function (err, cont) {},
		checkLoader: function (cont) {
			var obj = '';
			for(var i = 0, iLen = SHARED.utils.functionList.length; i < iLen; i++) {
				obj = SHARED.utils.functionList[i];
				if (cont.is(obj.test) || cont.find(obj.test).length) {
					obj.func.call(obj.ctx);
				}
			}
		},
		loadData: function (url, options, noJsonHeaders) {
			options = $.extend(options, {
				url: url
			});
			if (!noJsonHeaders){
				options = $.extend(options, {
					headers: {
						Accept : 'application/json',
						'Content-Type': 'application/json'
					}
				});
			}
			$.ajax(options);
		}
	};
	return process;
})(SHARED, $);
