var uc = uc || {};
uc.AddressEditor = (function($) {

	function AddressEditor(__PARENT, url) {
		this.__PARENT = __PARENT;
		this.url = url;
		this.changesMade = false;
		this.deletedAddresses = [];
	}

	var AddressProto = AddressEditor.prototype = new uc.MicroEvent();

	/**
	 * Open the Address editor lightbox
	 * @return {[type]} [description]
	 */
	AddressProto.open = function() {


		$('#modal-edit-addresses').modal('show');

		/*this.editorLightbox = new uc.Lightbox({
		 ajax: true,
		 url: this.url
		 });

		 this.editorLightbox.bind('onOpen', $.proxy(this.onEditorOpened, this));
		 this.editorLightbox.open();*/

		return this;
	};

	/**
	 * Returns base path for ajax requests
	 * @param {string} action
	 * @returns {string}
	 */
	AddressProto.getBasePath = function(action) {
		var path = window.location.origin;
		var contextPath = $('#node-'+PBX.utils.getNodeId()).data('ajax-url');
		path = contextPath === '' || contextPath === null ? path : path + contextPath;
		var $el = $('#uc');
		return path + '/.rest/checkout/v1/addresses?sessionCode=' + $el.data('ajax-session-code') + '&memberId=' +
			$el.data('ajax-member-id') + '&action=' + action;
	};

	/**
	 * Helper for generating JSON data from form fields
	 * @param  {Object} $form jQuery reference for form
	 * @return {Object}       JSON object for babel endpoint
	 */
	AddressProto.getFormData = function($form) {
		var data = {};

		$form.find('input, textarea, select').each(function(i, o) {
			var $input = $(this);
			if ( $input.attr('name') ) {
				data[$input.attr('name')] = $input.val();
			}
		});

		return data;
	};

	/**
	 * Crudely validate the form
	 * TODO: Improve validation BIG TIME
	 * @param  {[type]}  $form [description]
	 * @return {Boolean}       [description]
	 */
	AddressProto.isValidated = function($form) {
		var valid = false;

		try {
			valid = $form.get(0).checkValidity();
		} catch(e) {
			valid = $form.checkValidity();
		}

		return valid;
	};

	/**
	 * Once the editor has been created & opened by the Lightbox class
	 * Initiate event listeners
	 *
	 * @param  {Lightbox} editorLightbox The lightbox containing main address edit screen
	 * @return {[type]}                [description]
	 */
	AddressProto.onEditorOpened = function() {
		this.editorLightbox.$lightbox.
			delegate('#btn-add', 'click', $.proxy(function onAddNewAddressClick(e) {
				this.openAddAddress(this.editorLightbox.$lightbox.find('#btn-add').attr('href'));
				e.preventDefault();
			}, this)).

			delegate('.icon-edit', 'click', $.proxy(function onEditAddressClick(e) {
				this.openAddAddress($(e.target).attr('href'));

				e.preventDefault();
			}, this)).

			delegate('.icon-remove', 'click', $.proxy(function onRemoveAddressClick(e) {
				if (confirm(uc.server.tokens.CONFIRM_DELETE || 'Are you sure you want to remove this address?')) {
					this.removeAddress(this.getBasePath('delete') + '&addressId=' + $(e.target).attr('href').split('-').pop());
				}

				e.preventDefault();
			}, this));

		this.editorLightbox.bind('onClose', $.proxy(function onEditorClose() {
			if (this.changesMade && !this.editorLightbox._refreshing) {
				location.reload();
			}
		}, this));

		return this;
	};

	/**
	 * Open the add address screen
	 * @param  {[type]} url [description]
	 * @return {[type]}     [description]
	 */
	AddressProto.openAddAddress = function(id) {
		/*this.addressLightbox = new uc.Lightbox({
		 ajax: true,
		 url: url,
		 maxWidth: 565,
		 maxHeight: 575
		 });

		 this.addressLightbox.bind('onOpen', $.proxy(this.onAddAddressOpened, this));
		 this.addressLightbox.open();*/

		var addressForm = '#address-form-component';

		$(addressForm).html('');
		if (PBX) {
			if (PBX.asyncLoader) {
				PBX.asyncLoader.refreshElement(addressForm, $.proxy(this.onAddAddressOpened, this), id ? {deliveryAddressId: id} : undefined)
			}
			if (PBX.modalLoader) {
				PBX.modalLoader.show();
			}
		}

		return this;
	};


	/**
	 * Once the Add Address page has been created & opened,
	 * set up the relevant event listeners
	 *
	 * @param  {Lightbox} addressLightbox
	 * @return {[type]}                 [description]
	 */
	AddressProto.onAddAddressOpened = function() {
		var $modal = $('#modal-edit-addresses');
		$modal.modal('show');
		if (PBX) {
			if (PBX.modalLoader) {
				PBX.modalLoader.hide();
			}
		}
		var $submitter = $modal.find('#submitter');
		var $form = $modal.find('form.address');

		// Set the postcode pattern based on the country
		var sel = $("#countryId").get(0);
		var opt = sel.options[sel.selectedIndex];
		$('#postcode').attr( 'pattern', $(opt).data('pattern') ? $(opt).data('pattern') : null );
		$('#country_code').val( $(opt).data('code') );
		this.__PARENT.checkPostCode();
		$form.on('submit', $.proxy(function(e) {
			this.submitAddAddress(e, $submitter);
		}, this));

		this.countySelector = new uc.CountySelector(this);

		return this;
	};

	/**
	 * Submit the add address form (AJAX)
	 * @param  {Event} e Submit event
	 * @return {[type]}   [description]
	 */
	AddressProto.submitAddAddress = function(e, $submitter) {
		//var $form = this.addressLightbox.$lightbox.find('form.address');
		var $form = $('#address-form-component');

		var action = $form.attr('action');
		var formData = this.getFormData($form);

		// normalize line breaks to \r\n
		// this is due to a bug in the babel back-end where just \n breaks the Adyen hash
		formData.street = formData.street.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n");

		if (this.isValidated($form)) {
			//this.addressLightbox.locked = true;
			$submitter.attr('disabled', 'disabled');

			var url = this.getBasePath(action);
			if (action == 'edit') {
				url += '&addressId=' + $form.data('address-id');
			}
			if (PBX) {
				var options = {
					success: $.proxy(this.onAddressSubmitSuccess, this, action),
					error: $.proxy(this.onAddressSubmitFail, this),
					type: 'POST',
					data: JSON.stringify(formData)
				};
				PBX.utils.loadData(url, options);
			}
			//$.post(action, formData, $.proxy(this.onAddressSubmitSuccess, this)).fail($.proxy(this.onAddressSubmitFail, this));
			// this.__PARENT.babel(action, $.proxy(this.onAddressSubmitSuccess, this), 'post', formData, $.proxy(this.onAddressSubmitFail, this));
		}
		else {
			$form.checkValidity();
			$submitter.removeAttr('disabled');
		}

		e.preventDefault();
	};

	/**
	 * Callback for address form submission
	 * @param  {Object} data Response from endpoint
	 * @return {[type]}      [description]
	 */
	AddressProto.onAddressSubmitSuccess = function(action, data) {
		function done() {
			// changes have been made to the user's add,ress book
			this.changesMade = true;

			// unlock the lightbox so we can close it
			if (this.addressLightbox) {
				this.addressLightbox.locked = false;
			}

			var serverData = data

			// refresh the main one
			this.handleDeletions(function() {
				var $modal = $('#modal-edit-addresses');
				if ($modal.hasClass('in')) {
					$modal.modal('hide');
					var $form = $modal.find('form.address');
					this.trigger('onAddressSave', $form, serverData);
				}

				// close the add lightbox
				if (this.addressLightbox && this.addressLightbox.isOpen) {
					this.addressLightbox.close();
				}
				if (typeof this.editorLightbox !== 'undefined') {
					this.editorLightbox.refresh();
				}
			});
		}

		if (action === 'delete') {
			this.deletedAddresses.push(data);
			$('#address-'+data).fadeOut().remove();
		}

		// we have a new address, update the user's address book to use this one
		/*if (data.id) {
		 // update the local copy of what the current address is:
		 this.__PARENT.glb.member.delivery_address_id = data.id;

		 var $form = this.addressLightbox.$lightbox.find('form.address');
		 this.__PARENT.babel('/basket/' + $form.attr('data-basket-id'), $.proxy(done, this), 'post', { delivery_address_id: data.id });
		 } else {
		 done.call(this);
		 }*/
		done.call(this, data);
	};

	/**
	 * XHR Error handler
	 * TODO: Improve!
	 * @param  {[type]} jqXHR       [description]
	 * @param  {[type]} textStatus  [description]
	 * @param  {[type]} errorThrown [description]
	 * @return {[type]}             [description]
	 */
	AddressProto.onAddressSubmitFail = function(jqXHR, textStatus, errorThrown) {
		var error = jqXHR;
		xlog(error);
		alert('Error adding address');
		$('#address-form-component #submitter').removeAttr('disabled');
	};

	/**
	 * Remove an address
	 * @param  {[type]} url [description]
	 * @return {[type]}     [description]
	 */
	AddressProto.removeAddress = function(url) {
		//$.get(url, $.proxy(this.onAddressSubmitSuccess, this)).fail($.proxy(this.onAddressSubmitFail, this));
		if (PBX) {
			var options = {
				success: $.proxy(this.onAddressSubmitSuccess, this, 'delete'),
				error: $.proxy(this.onAddressSubmitFail, this),
				type: 'POST',
				data: JSON.stringify({})
			};
			PBX.utils.loadData(url, options);
		}

		return this;
	};

	/**
	 * Loop through the deleted addresses and make sure none of them were the current delivery address
	 * @return {[type]} [description]
	 */
	AddressProto.handleDeletions = function(done) {
		var matched = false;

		for (var i = this.deletedAddresses.length - 1; i >= 0; i--) {
			if (this.deletedAddresses[i] == this.__PARENT.glb.member.delivery_address_id) {
				matched = true;
				break;
			}
		}

		if (matched) {
			this.__PARENT.glb.member.delivery_address_id = '0';
			this.__PARENT.disableCheckout().lockDeliveryMethods().updateBabelBasket().then($.proxy(function() {
				this.__PARENT.unlockDeliveryMethods().enableCheckout();
				done.call(this);
			}, this));
		}
		else {
			done.call(this);
		}
	};

	return AddressEditor;

})(jQuery);