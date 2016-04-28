var BXT = window.BXT || {};
BXT.registrationValidator = (function (BXT) {
	var process = {
		// DOM elements
		form: $('#form-register'),
		container: $('#address-fields'),

		// objects to validate
		firstNameValidator: {
			name: 'firstNameValidator',
			inputSelector: '[name="firstName"]',
			validateCallback: 'required',
			errorContainer: '#firstNameErr'
		},
		lastNameValidator: {
			name: 'lastNameValidator',
			inputSelector: '[name="lastName"]',
			validateCallback: 'required',
			errorContainer: '#lastNameErr'
		},
		emailValidator: {
			name: 'emailValidator',
			inputSelector: '[name="email"]',
			validateCallback: 'validEmail',
			errorContainer: '#emailErr'
		},
		emailConfirmValidator: {
			name: 'confirmEmailValidator',
			inputSelector: '[name="confirmEmail"]',
			validateCallback: 'validEmail',
			errorContainer: '#email-confirm-error'
		},
		passwordMin: {
			name: 'passwordMin',
			inputSelector: '[name="password"]',
			validateCallback: 'passwordMinReach',
			errorContainer: '#psswdMinErr'
		},
		passwordConfirmValidator: {
			name: 'passwordConfirmValidator',
			inputSelector: '[name="confirmPassword"]',
			validateCallback: 'required',
			errorContainer: '#confPsswdMinErr'
		},
		passwordDontMatch: {
			name: 'passwordDontMatch',
			inputSelector: '[name="confirmPassword"]',
			validateCallback: 'confirmPasswordMatch',
			errorContainer: '#psswdDontMutchErr'
		},
		emailDontMatch: {
			name: 'emailDontMatch',
			inputSelector: '[name="confirmEmail"]',
			validateCallback: 'confirmEmailMatch',
			errorContainer: '#email-dont-match-error'
		},

		// validators
		defaultVlidators: {
			required: function (value) {
				return value && value.length > 0;
			},
			validEmail: function (value) {
				var emailRegex = /[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9]{2,4}(?:[a-zA-Z0-9-]*[a-zA-Z0-9])?/;
				return value && value.length > 0 && emailRegex.exec(value) && emailRegex.exec(value)[0] === value;
			},
			passwordMinReach: function (value) {
				var min = 6;
				return value && value.length >= min;
			},
			confirmPasswordMatch: function (value) {
				var passwordOrigin = $('#form-register [name="password"]').val();
				return value && value.length > 0 && value === passwordOrigin;
			},
			confirmEmailMatch: function (value) {
				var emailOrigin = $('#form-register [name="email"]').val();
				return value && value.length > 0 && value === emailOrigin;
			}
		},
		// validation process
		validateForm: function (form, validationObjects) {
			var that = this;
			var valid = true;
			var value;
			var i;
			var validStates = {};
			for (i = 0; i < validationObjects.length; i++) {
				var obj = validationObjects[i];
				var input = form.find(obj.inputSelector);
				var msgContainer = form.find(obj.errorContainer);
				if (input.length > 0) {

					value = input.val();

					var validator = this.defaultVlidators[obj.validateCallback];
					var result = validator(value);
					validStates[obj.name] = result;

					// condition to prevent show two errors
					if (validStates.passwordConfirmValidator === false && validStates.passwordDontMatch === false) {
						$('#psswdDontMutchErr').hide();
					}
					if(form.find('#confirm-email').length > 0){
						if (validStates.emailConfirmValidator === false && validStates.emailDontMatch === false) {
							$('#email-dont-match-error').hide();
						}
					}else{
						validStates.emailConfirmValidator = true;
						validStates.emailDontMatch = true;
					}
					// check result
					if (!result) {
						valid = false;
						input.addClass('inputError');
						msgContainer.css('display', 'inline-block');
					} else {
						input.removeClass('inputError');
						msgContainer.hide();
					}
				} else {
					input.removeClass('inputError');
					msgContainer.hide();
				}

			}

			var checkboxes = that.form.find('input[type=checkbox]');
			for (i = 0; i < checkboxes.length; i++) {
				var checkbox = $(checkboxes[i]);
				var errorMessage = $('#' + checkbox.attr('name') + '-errors');
				if (checkbox.data('mandatory') && ((checkbox.prop('checked') && checkbox.prop('inverted')) ||
					(!checkbox.prop('checked') && !checkbox.prop('inverted')))) {
					valid = false;
					errorMessage.removeClass('not-valid');
				} else {
					errorMessage.addClass('not-valid');
				}
			}

			if (!valid) {
				this.container.addClass('invalidForm');
			} else {
				this.container.removeClass('invalidForm');
			}
			return valid;
		},
		init: function () {
			var that = this;
			this.form.submit(function () {
				return that.validateForm(that.form, [ that.firstNameValidator, that.lastNameValidator, that.emailValidator, that.passwordMin, that.passwordConfirmValidator, that.passwordDontMatch, that.emailConfirmValidator, that.emailDontMatch ]);
			});
		}
	};
	return process;
})(BXT);
BXT.validation = (function (BXT, $) {
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
})(BXT, $);