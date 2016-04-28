/**
 * Helper class for Universal Checkout functinos
 * @return {[type]}                [description]
 */
var uc    = uc || {};

uc.Checkout = (function($) {

	var postcode_lookup = { 'GB' : true };
	var POLL_TIMEOUT = 10000;

	function CheckoutHelper() {
		this.cache = {
			deliveryXHR: false
		};
		this.listeners();
		return this;
	}

	var UCProto = CheckoutHelper.prototype = new uc.MicroEvent();

	/**
	 * Set instance glb
	 * @param {[type]} glb [description]
	 */
	UCProto.setConfig = function(glb) {
		this.glb = glb;
		return this;
	};

	/**
	 * Return instance glb
	 * @return {[type]} [description]
	 */
	UCProto.getConfig = function() {
		return this.glb || false;
	};

	/**
	 * Disable the checkout (ie prevent from being submitted)
	 * @return {[type]} [description]
	 */
	UCProto.disableCheckout = function() {
		$('.submitter').attr('disabled', 'disabled');
		return this;
	};

	/**
	 * Enable the checkout submit button
	 * @return {[type]} [description]
	 */
	UCProto.enableCheckout = function() {
		$('.submitter').removeAttr('disabled');
		return this;
	};

	/**
	 * Disable changing of delivery methods
	 * @return {[type]} [description]
	 */
	UCProto.lockDeliveryMethods = function() {
		var $deliveryAddresses = $('input[type=radio][name=delivery_address]');
		$deliveryAddresses.attr('disabled', 'disabled');
		return this;
	};

	/**
	 * Enable user selections of delivery methods
	 * @return {[type]} [description]
	 */
	UCProto.unlockDeliveryMethods = function() {
		var $deliveryAddresses = $('input[type=radio][name=delivery_address]');
		$deliveryAddresses.removeAttr('disabled');
		return this;
	};

	/*
	 * Show / Hide the postcode-lookup based on the country selected
	 */
	UCProto.checkPostCode = function() {
		var country = $('#countryId').get(0);
		if ( country ) {
			var code = $(country.options[country.selectedIndex]).data('code');
			if ( postcode_lookup[code] ) {
				$('.postcode-lookup').removeClass('invisible');
				if($('#uc').hasClass('address-delivery')) {
					$('input#postcode').addClass('lookup');
				}
			} else {
				$('.postcode-lookup').addClass('invisible');
				if($('#uc').hasClass('address-delivery')) {
					$('input#postcode').removeClass('lookup');
				}
			}
		}
	};

	/**
	 * Set up page-specific handlers
	 * TODO: Make this nicer.
	 *
	 * @param  {[type]} section [description]
	 * @return {[type]          [description]
     */
	UCProto.initPage = function(page) {
		if ($('#ucError').length) {
			$('#ucComponents').hide();
		} else {
			if (page === 'login') {
				$('form.address').submit(function() {
					$('.submitter').attr('disabled', 'disabled');
				});
			}

			if (page != 'login') {
				$('.breadcrumb.done').not('.disabled').click(function() {
					var href = $(this).children('a').attr('href');
					window.location.href = href;
				});
			}

			if (page !== 'address-delivery' && page !== 'review') {
				$.webshims.polyfill('forms');
			}

			if (page.indexOf('address') > -1 || page.indexOf('register') > -1) {
				$('form.address').submit(function(e) {
					$('#submit').attr('disabled', 'disabled');
				});

				var showManual = function() {
					$('#postcode-lookup').addClass('hidden');
					$('#manual-address').removeClass('hidden');
				};

				var showLookup = function() {
					$('#postcode-lookup').removeClass('hidden');
					$('#manual-address').addClass('hidden');
					$('#address-lookup #query').val($('#postcode').val());
					$('#chosen-address').removeClass('hidden');
				};

				if($('#street').val()) {
					showManual();
				}
				$('#show-lookup').bind('click', function(e) {
					e.preventDefault();
					e.stopPropagation();
					showLookup();
				});

				$('#manual-input').bind('click', function(e) {
					e.preventDefault();
					e.stopPropagation();
					showManual();
				});

			}

			if (page.indexOf('address') > -1) {
				this.checkPostCode();

				var self = this;
				$('body').on('change', '#countryId', function(e) {
					var sel = $(this).get(0);
					var opt = sel.options[sel.selectedIndex];
					$('#postcode').attr( 'pattern', $(opt).data('pattern') ? $(opt).data('pattern') : null );
					$('#country_code').val( $(opt).data('code') );
					self.checkPostCode();
				} );
			}

			// Reset the postcode pattern based on the selected country on load
			if (page == 'address address-billing') {
				this.countySelector = new uc.CountySelector(this);
				var sel = $('#countryId').get(0);
				var opt = sel.options[sel.selectedIndex];
				var $chosenAddress = $('#chosen-address');
				$('#postcode').attr( 'pattern', $(opt).data('pattern') ? $(opt).data('pattern') : null );
				$('#country_code').val( $(opt).data('code') );

				$('#postcode-lookup-btn').on('click', function(e) {
					e.preventDefault();
					e.stopPropagation();
					var postcode = $('#query').val();
					$('#postcode-lookup fieldset').addClass('results');
					if ( postcode && ( ! $('#query').data('last') || $('#query').data('last').toUpperCase() != postcode.toUpperCase() ) ) {
						$('#query').data('last', postcode);
						var url = '/proxy/address/lookup?address=' + postcode;
						var format_address = function( address ) {
							var formatted = [ address.street, address.posttown, address.county, address.postcode ].join(', ');
							return '<tr><td class="address_result" data-street="' + address.street + '" data-town="' + address.posttown + '" data-county="' + address.county + '" data-postcode="' + address.postcode + '" data-country_code="' + address.countrycode + '">' +formatted+ '</td></tr>';
						};
						var format_select = function( address ) {
							var formatted = [ address.street, address.posttown, address.county, address.postcode ].join(', ');
							return '<option data-street="' + address.street + '" data-town="' + address.posttown + '" data-county="' + address.county + '" data-postcode="' + address.postcode + '" data-country_code="' + address.countrycode + '">' +formatted+ '</option>';
						};

						$.getJSON(url, function (data) {
							$('#results').empty();
							$('#results-select').addClass('hidden').empty();
							$('#postcode-success').addClass('hidden');
							$('#postcode-error').addClass('hidden');
							if ( data.meta.status == "OK" ) {
								$('#results-select').removeClass('hidden').append( '<option value="">'+ uc.server.tokens.SELECT_YOUR_ADDRESS + '</option>' );
								if ( data.address.length ) {
									$.each(data.address, function( i, item ) {
										$.each( data.base_address, function( key, value ) {
											item[key] = value;
										} );
										$('#results').append( format_address( item ) );
										$('#results-select').append( format_select( item ) );
									} );
									$('#postcode-success').removeClass('hidden');
								} else {
									$('#postcode-error').removeClass('hidden').text( uc.server.tokens.LOOKUP_INVALID_VALUE );
								}
								$('#results td').bind('click', function(e) {
									e.preventDefault();
									e.stopPropagation();
									var target = $(e.target);
									$('#results td').removeClass('active');
									target.addClass('active');
									$('#street').val(target.data('street'));
									$('#town').val(target.data('town'));
									$('#county').val(target.data('county'));
									$('#postcode').val(target.data('postcode'));
									$chosenAddress.removeClass('hidden');
								});
								$('#results-select').bind('change', function(e) {
									e.preventDefault();
									e.stopPropagation();
									var target = $(this).children("option:selected");
									if ( target.val() ) {
										target.addClass('active');
										$('#street').val(target.data('street'));
										$('#town').val(target.data('town'));
										$('#county').val(target.data('county'));
										$('#postcode').val(target.data('postcode'));
									}
									$('#chosen-address').removeClass('hidden');
								});
								$chosenAddress.bind('click', function(e) {
									e.preventDefault();
									e.stopPropagation();
									if($('*').hasClass('active').toString() === 'true') {
										showManual();
										$('.active').removeClass('active');
									}
								});
							} else {
								$('#postcode-error').removeClass('hidden').text( uc.server.tokens.LOOKUP_INVALID_VALUE );
							}
						});
					}
				});
			}

			if (page === 'address address-delivery') {

				// If a product is addded to the basket, which is in-illegible and no delivery address is selected then trigger a selection on the billing address by default.
				if ($('.address .selected').length === 0) {
					$('.billing.address').trigger('click');
				}

				$('#skipDelivery').change(function(e) {
					if ($(this).is(':checked')) {
						$('#address-fields').addClass('hide-fields').find('input, select, textarea').each(function(i, o) {
							if ($(this).attr('required')) {
								$(this).removeAttr('required').data('required', 'required');
							}
						});
					} else {
						$('#address-fields').removeClass('hide-fields').find('input, select, textarea').each(function(i, o) {
							if ($(this).data('required')) {
								$(this).attr('required', 'required');
							}
						});
					}
				});

				$('body').on('click tap', '#postcode-lookup-btn', function(e) {
					e.preventDefault();
					e.stopPropagation();
					var postcode = $('#postcode').val();
					if ( postcode && ( ! $('#postcode').data('last') || $('#postcode').data('last').toUpperCase() != postcode.toUpperCase() ) ) {
						$('#postcode').data('last', postcode);
						var url = '/proxy/address/lookup?address=' + postcode;
						var format_address = function( address ) {
							var formatted = [ address.street, address.posttown, address.county, address.postcode ].join(', ');
							return '<option class="address_result" data-street="' + address.street + '" data-town="' + address.posttown + '" data-county="' + address.county + '" data-postcode="' + address.postcode + '" data-country_code="' + address.countrycode + '">' +formatted+ '</option>';
						};

						$.getJSON(url, function (data) {
							$('#results').addClass('hidden').empty();
							$('#postcode').parent().find('.error').remove();
							if ( data.meta.status == "OK" ) {
								if ( data.address.length ) {
									$('#results').removeClass('hidden').append( '<option value="">'+ uc.server.tokens.SELECT_YOUR_ADDRESS + '</option>' );
									$.each(data.address, function( i, item ) {
										$.each( data.base_address, function( key, value ) {
											item[key] = value;
										} );
										$('#results').append(format_address( item ));
									} );
								} else {
									$('#results').addClass('hidden');
									$('#postcode').parent().append( "<div class='error'>" + uc.server.tokens.LOOKUP_INVALID_VALUE + "</div>" );
								}
								$('#results').bind('change', function(e) {
									e.preventDefault();
									e.stopPropagation();
									var target = $(this).children("option:selected");
									if ( target.val() ) {
										$('#street').val(target.data('street'));
										$('#town').val(target.data('town'));
										$('#county').val(target.data('county'));
										$('#postcode').val(target.data('postcode'));
									}
								});
							} else {
								$('#postcode').parent().append( "<div class='error'>" + uc.server.tokens.LOOKUP_TOO_MANY_RESULTS + "</div>" );
							}
						});
					}
				});

				$('#save_delivery_address').on('click', $.proxy(function(e) {
					var url = $('#save_delivery_address').attr('href');

					this.addressEditor = new uc.AddressEditor(this, url);
					var addAddress = this.addressEditor.openAddAddress();

					// $.webshims.polyfill('forms');
					/*this.addressEditor.addressLightbox.bind('onOpen', function() {
					 var tab_content = $('.tab-content');
					 var nav = $('.nav');
					 if ($('.tab-content .store').length === 0) { tab_content.show(); }
					 tab_content.children('div').hide().first().show();

					 $.each([ "first_name", "last_name", "telephone" ], function( i, v ) {
					 if ($('#address-container #' + v).val() === '') {
					 $('#address-container #' + v).val( $('.billing.address').data(v) );
					 }
					 });

					 nav.children('li').click(function() {
					 var indexer = $(this).index(); //gets the current index of (this) which is .nav li;

					 nav.find('a').removeClass("active");
					 $(this).find('a').addClass("active");
					 tab_content.children('div').hide();
					 tab_content.children('div').eq(indexer).fadeIn(); //uses whatever index the link has to open the corresponding box
					 if (!$("html").hasClass("lt-ie9")) {
					 var content = window.getComputedStyle(document.body,':after').getPropertyValue('content');
					 if ( content.indexOf('desktop') === -1 ) {
					 nav.css('display', 'none');
					 tab_content.fadeIn();
					 $('.lightbox-close')
					 .bind('click', function(e) {
					 e.preventDefault();
					 e.stopPropagation();
					 tab_content.css('display', 'none');
					 nav.fadeIn();
					 $(this).unbind('click');
					 });
					 }
					 }

					 });

					 var $store_locator = $('#store-locator');

					 var callback = function(location) {
					 // servicesURL
					 $.getJSON('/proxy/store/' + brand + '/nearby?lat=' + location.lat + '&lng=' + location.lng + '&limit=' + uc.server.in_store_delivery.limit + '&radius=' + uc.server.in_store_delivery.radius, function(data) {
					 $store_locator = $('#store-locator');
					 $store_locator.find('table tbody tr').remove();
					 $.each(data.stores, function(i, item) {
					 var $item = $('<tr id="store-search-' +item.store_id+ '"><td><strong>' + item.store_name + '</strong><address>' + item.full_address + '</address></td><td><strong>' + parseFloat(item.dist).toFixed(1) + 'km</strong></td></tr>');
					 $.each(item, function(i, v) {
					 $item.data(i, v);
					 });
					 $store_locator.find('table tbody').append($item);
					 $store_locator.find('table tfoot tr').remove();
					 });
					 if (data.stores.length === 0) {
					 $store_locator.find('table tfoot').html('<tr><td>' + uc.server.tokens.STORE_NOT_FOUND.replace(/%RADIUS%/, uc.server.in_store_delivery.radius) + '</td></tr>');
					 }
					 });
					 };

					 if($('div').hasClass('carrefour') && $('div').hasClass('address')) {
					 if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) && navigator.geolocation) {
					 navigator.geolocation.getCurrentPosition(function(location) {
					 callback({ lat: location.coords.latitude, lng: location.coords.longitude });
					 }, function(e) {
					 console.log(e);
					 });
					 }
					 }

					 $store_locator.on('submit', function(e) {
					 e.preventDefault();
					 // To sort
					 var address = $('#search_address').val() + ( $.trim($('#search_address').val()).match(/^\d{5}$/)? ', France' : '');
					 setTimeout(function() {
					 if ($("html").hasClass("lt-ie9")) {
					 jQuery.support.cors = true;
					 $.getJSON('/proxy/store/' + uc.server.brand + '/nearby?address=' + address, function(data) {
					 callback(data);
					 });
					 } else {
					 var endpoint_geocode = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&sensor=true';
					 $.getJSON(endpoint_geocode, function(geocode) {
					 $store_locator = $('#store-locator');
					 if (geocode.status == 'ZERO_RESULTS') {
					 $store_locator.find('table tbody tr, table tfoot tr').remove();
					 $store_locator.find('table tfoot').html('<tr><td>' + uc.server.tokens.STORE_NOT_FOUND.replace(/%RADIUS%/, uc.server.in_store_delivery.radius) + '</td></tr>');
					 } else {
					 // Should be an autocomplete
					 var location = geocode.results[0].geometry.location;
					 callback(location);
					 }
					 }).fail(function(jqxhr, textStatus, error) {
					 //alert(textStatus);
					 //alert(error);
					 });
					 }
					 }, 100);
					 });
					 $('#store-locator table tbody').on('click', $.proxy(function(e) {
					 var $row = $(e.target).closest('tr');
					 var $el;
					 if ($('#store-' + $row.data('store_id')).length !== 0) {
					 $el = $('#store-' + $row.data('store_id'));
					 } else {
					 $el = $('#store-address-template').clone().removeAttr('style').attr('id', 'store-' + $row.data('store_id')).appendTo('.custom-skin');
					 var $el_data = $('#store-' + $row.data('store_id')).find('.store-routing-details');
					 $.each(['frequency', 'store_name', 'address', 'city', 'country', 'post_code', 'telephone'], function(i, v) {
					 $el.find(".store-"+v).html($row.data(v));
					 });
					 $el.data('store-frequency', $row.data('frequency') );
					 // Duplicate data to child element
					 $.each($row.data(), function(i, v) { $el_data.data(i, v); });
					 }
					 $el.trigger('click');
					 this.addressLightbox.close();

					 }, addAddress));
					 });*/

					this.addressEditor.bind('onAddressSave', $.proxy(function onEditorClose($form, data) {
						this.selectAddress(this, $('<div id="address-' + data.id + '">new</div>'), true);
					}, this));

					e.preventDefault();
				}, this));

				//this.fetchDeliveryProducts();
				this.bind('deliveryMethodsLoaded', $.proxy(function onDeliveryProductsLoaded(data, error) {
					$('.delivery-method input').on('change', $.proxy(function() {
						this.disableCheckout().lockDeliveryMethods();
						var instance = this;
						var url = instance.getBasePath('patch');
						if (PBX) {
							var $checkedEl = $('#delivery-products input:checked');
							var options = {
								success: function () {
									instance.unlockDeliveryMethods();
									instance.enableCheckout();
									instance.updateDisplayTotals();
									$('#delivery-products .question').addClass('hidden');
									var $question = $checkedEl.parents().eq(2).next();
									if($("fieldset", $question).length) {
										$question.removeClass('hidden');
									}
								},
								error: function () {
									// TO-DO: show error
								},
								type: 'POST',
								data: JSON.stringify({deliveryCategoryId: $checkedEl.val()})
							};
							PBX.utils.loadData(url, options);
						}



						/*var deliveryProductHash = {
						 delivery_product_id: $('#delivery-products input:checked').val()
						 };

						 this.updateBabelBasket(deliveryProductHash).then($.proxy(function() {
						 this.unlockDeliveryMethods();
						 this.enableCheckout();
						 }, this));*/

					}, this));
					if (!$('.delivery-method input:checked').length) {
						$('.delivery-method input:first').trigger('click');
					}
				}, this));

				this.trigger('deliveryMethodsLoaded');

				/**
				 * Action Buttons on Delivery Page.
				 * Show buttons, Edit, Delete.
				 *
				 * @param  {[type]} section [description]
				 * @return {[type]          [description]
            */
				$('div[role="main"]').delegate('.toggle-button', 'click', $.proxy(function() {
					var showActions = $('.toggle-button');
					var actionButton = $('.toggle-object');
					var selectedAddress = $('.custom.address').children('.selected');

					function hideUnusedButtons() {
						actionButton.hide();
						selectedAddress.toggle();
						showActions.removeClass('active');
						$('.custom.address').unbind('click');
					}

					actionButton.toggle();
					selectedAddress.toggle();
					showActions.toggleClass('active');

					$('.custom.address').bind('click', $.proxy(function onEditAddressClick(e) {
						var target = $(e.target).prop('tagName').toLowerCase();
						var el = $(e.target).closest('.address');
						var addressID = el.attr('id');
						var url = $('#' + addressID + ' a:first').attr('href');

						if(target == 'div' || target == 'h4' || target == 'p') {
							e.stopPropagation();
						}
						this.addressEditor = new uc.AddressEditor(this, url);

						if (target != 'i') {
							this.addressEditor.openAddAddress(addressID.split('-').pop());
						}
						this.addressEditor.bind('onAddressSave', $.proxy(function onEditorClose($form) {
							var address = $('#' + addressID);
							var selectable = $('.address.selectable');

							address.find('.name').html($form.find('#firstName').val() + ' ' + $form.find('#lastName').val());
							$.each(['street', 'town', 'county', 'postcode'], function(i, v) {
								address.find('.' + v).html($form.find('#' +v).val());
							});

							selectable.find('i.selected').remove();
							selectable.removeClass('active');
							address.last().append('<i class="selected"></i>').addClass('active');

							var selectedCountry = address.closest('.address').data('country');

							if (this.cache.delivery_country !== selectedCountry) {
								this.cache.delivery_country = selectedCountry;
							}

							this.glb.member.delivery_address_id = addressID.toString().replace(/address-/g,'');

							this.selectAddress(this, address);
						}, this));
						hideUnusedButtons();

					}, this));

					$(document).on('click', function(e) {
						var target = $(e.target).prop('class');
						var classes = ["custom-skin","wrapper", "address", "default", "uc-info-container", "delivery-products"];
						if($.inArray(target, classes) > -1) {
							hideUnusedButtons();
						}
					});

				}, this));

			}
			if (page === 'review') {
				var terms = $('#terms');
				var instance = this;
				if (terms.is('[required]') === true){
					terms.bind('click', function() {
						if(terms.is(':checked') === true) {
							instance.enableCheckout();
						} else {
							instance.disableCheckout();
						}
					});
					if (terms.is(':checked') !== true) {
						instance.disableCheckout();
					} else {
						instance.enableCheckout();
					}
				} else {
					instance.enableCheckout();
				}

			}

			if (page === 'thanks') {
				var $orderConfirmation = $('.order-confirmation');
				if (this.getConfig() && ($orderConfirmation.hasClass('processing') || $orderConfirmation.hasClass('success'))) {
					this.pollOrderStatus();
				}
			}
		}

		return this;
	};


	/**
	 * Make a call to Babel
	 * @param  {[type]}   pat      [description]
	 * @param  {Function} callback [description]
	 * @param  {[type]}   method   [description]
	 * @param  {[type]}   postdata [description]
	 * @return {[type]}            [description]
	 */
	UCProto.babel = function(path, callback, method, postdata, onFail) {
		var promise;
		var endpoint = this.glb.babel_endpoint;

		if (!Modernizr.cors) {
			// proxy it via the server
			endpoint = '/babel?e=';
		}
		else {
			path += ( (path.indexOf('?') === -1)? '?' : '&') + 'session_code=' + this.glb.member.session_code;
		}


		if(!method || method==='get') {
			promise = $.get(endpoint + path, function babelSuccessCallback(data) {
				callback(data);
			},'json');
		}
		else if(method === 'post') {
			promise = $.post(endpoint + path, {properties: JSON.stringify(postdata)}, function babelSuccessCallback(data) {
				callback(data);
			}, 'text');
		}
		else if(method === 'put') {
			promise = $.ajax({
				type: 'PUT',
				url: endpoint + path,
				data: postdata,
				success: function babelSuccessCallback(data) {
					callback(data);
				},
				dataType:    'json'
			});
		}

		promise.fail(function() {
			xlog("API call failed with: " , arguments);

			if (typeof onFail === 'function') {
				onFail.apply(promise, arguments);
			}
		});

		return promise;
	};

	/**
	 * Refresh the basket
	 * @return {[type]} [description]
	 */
	UCProto.updateBabelBasket = function(hash) {
		if (typeof hash == 'undefined') {
			hash = {
				delivery_product_id: this.glb.member.delivery_product_id,
				delivery_address_id: this.glb.member.delivery_address_id
			};
		}
		var instance = this;

		return this.babel('/basket/' + this.glb.member.basket_id, function() {}, 'post', hash, function(xhr, type, msg) {
			var handled = false;
			if (xhr.status == 400) {
				try {
					var json = $.parseJSON( xhr.responseText );
					if (json.babelErrorCode === 638) {
						console.log("Channel ID " + $('#babel_member').data('channel_id') + " is incorrectly configured for delivery option selected. Delivery Product ID: " + instance.glb.member.delivery_product_id);
						console.log(xhr.responseText);
						alert(uc.server.tokens.CHANNEL_CONFIGURATION_ERROR || 'There was an error on our side, please try again.');
						handled = true;
					}
				} catch(e) {
				}
			}
			if (!handled) {
				alert(uc.server.tokens.ERROR);
			}
		});
	};

	/**
	 * Update figures on the UI based on user selections
	 * @return {[type]} [description]
	 */
	UCProto.updateDisplayTotals = function() {
		if (PBX) {
			if (PBX.asyncLoader) {
				PBX.asyncLoader.refreshElement('.summary');
			}
		}
		/*var selected_delivery = $('#delivery-container input:checked');
		 this.glb.member.delivery_product_id = selected_delivery.val();

		 var raw_total = parseFloat($('.raw_total').data('raw_total_without_delivery')),
		 calculated_total = ( raw_total + parseFloat(selected_delivery.data('raw_price')) ).toFixed(2),
		 currency = $('.raw_total').data('currency_symbol'),
		 formatted_total = $('.raw_total').data('token_total') + ': ' + ( ( $('.raw_total').data('currency_position') === 'BEFORE')? currency + calculated_total : calculated_total + currency)
		 ;

		 $('.raw_total').text(formatted_total);
		 $('.raw_total').data('raw_total', calculated_total);
		 $('.raw_total').data('raw_total_delivery', selected_delivery.data('raw_price'));*/

		return this;
	};

	UCProto.getBasePath = function(action) {
		var path = window.location.origin;
		var contextPath = $('#node-'+PBX.utils.getNodeId()).data('ajax-url');
		path = contextPath === '' || contextPath === null ? path : path + contextPath;
		var $el = $('#uc');
		return path + '/.rest/checkout/v1/baskets?sessionCode=' + $el.data('ajax-session-code') + '&basketId=' +
			$el.data('ajax-basket-id') + '&action=' + action;
	};

	/**
	 * Update selected address upon edition
	 * @return {[type]} [description]
	 */
	UCProto.selectAddress = function (instance, address, reload) {
		//var delivery = new uc.AddressDelivery(instance);
		//var store_id = address.attr('id').replace(/store-/,'').replace(/address-/,'');
		var delivery_address_id = address.attr('id').replace(/address-/,'');
		//var promise;

		//this.updateDisplayTotals();

		/*if (address.is('.store')) {
		 instance.babel('/member/' + instance.glb.member.member_id + '/stores/add?store_id=' + store_id + '&brand=' + uc.server.brand + '&selected=' + store_id + '&selection_type=' + (address.hasClass('closest')? 'closest' : 'nearby') + '&basket_id=' + this.glb.member.basket_id + '&delivery_address_id=' + delivery_address_id, function() { }, 'get', {});

		 var basket = {delivery_address_id: 0 };

		 if (instance.glb.delivery.in_store) {
		 var store_details = address.find('.store-routing-details:first').data();
		 basket.delivery_product_id = instance.glb.delivery.in_store.delivery_product_id;
		 basket.delivery_extra_fields = {
		 delivery_product_id: instance.glb.delivery.in_store.delivery_product_id,
		 fields: { }
		 };
		 $.each(store_details, function( key, value ) {
		 if (key.indexOf('partner') != -1) {
		 basket.delivery_extra_fields.fields[key] = value;
		 }
		 });
		 // partner_(location_(ref|name)|(first|last)_name|street|town|county|postcode|country(code)?)
		 }

		 promise = instance.updateBabelBasket(basket);
		 } else {*/
		var url = instance.getBasePath('patch');
		if (PBX) {
			var options = {
				success: function () {
					if (reload) {
						window.location.reload();
					} else {
						instance.fetchDeliveryProducts();
					}
				},
				error: function () {
					// TO-DO: show error
				},
				type: 'POST',
				data: JSON.stringify({deliveryAddressId: delivery_address_id})
			};
			PBX.utils.loadData(url, options);
		}
		//promise = instance.babel('/member/' + instance.glb.member.member_id + '/stores/add?selected=0&brand=' + uc.server.brand + '&basket_id=' + instance.glb.member.basket_id + '&delivery_address_id=' + delivery_address_id, function() { }, 'get', {});
		//}
		/*promise.done(function() {
		 instance.fetchDeliveryProducts();
		 instance.updateDisplayTotals();
		 });*/

	};

	/**
	 * Various event listeners
	 * @return {[type]} [description]
	 */
	UCProto.listeners = function() {

		/*this.bind('deliveryMethodsLoaded', $.proxy(function onDeliveryProductsLoaded(data, error) {
		 $('.uc-info-container.delivery-products').html(data);

		 $('.checkbox, .checkbox *').on('click', function() {
		 var submitter = $('.submitter'),
		 disabled = $('.submitter[disabled]');
		 if(disabled.length !== 0) {
		 submitter.removeAttr('disabled');
		 } else {
		 submitter.attr('disabled','disabled');
		 }
		 });

		 var el = $('.raw_total'),
		 total = el.data('raw_total'),
		 prevDelivery = el.data('prev_delivery'),
		 currDelivery = $('input:checked').data('raw_price'),
		 parseCost = parseFloat(total) - parseFloat(currDelivery),
		 cost = parseCost.toFixed(2);

		 if(!prevDelivery) {
		 el.attr('data-prev_delivery', 1);
		 el.attr('data-cost', cost);
		 } else {
		 var parseTotal = parseFloat(el.data('cost')) + parseFloat(currDelivery),
		 newTotal = parseTotal.toFixed(2),
		 currency = el.data('currency_symbol'),
		 position =  el.data('currency_position'),
		 tokenTotal = el.data('token_total'),
		 before = tokenTotal + ': ' + currency + newTotal,
		 after = tokenTotal + ': ' + newTotal + currency,
		 string = (position === 'BEFORE') ? before : after
		 ;
		 el.data('raw_total', newTotal);
		 el.text(string);
		 }
		 if (!error) {
		 $('input[type=radio][name=delivery_product][value=' + this.glb.member.delivery_product_id + ']').attr('checked','checked');

		 var terms = $('#terms');
		 var instance = this;
		 if (terms.is('[required]') === true && terms.is(':checked') !== true) {
		 terms.bind('click', function() {
		 if(terms.is(':checked') === true) {
		 instance.enableCheckout();
		 } else {
		 instance.disableCheckout();
		 }
		 });
		 } else {
		 instance.enableCheckout();
		 }
		 if(terms.length === 0 || terms.is(':checked') === true) {
		 this.enableCheckout();
		 }

		 }

		 this.updateDisplayTotals();
		 }, this));*/

		$('div[role="main"]').
			delegate('input[type=radio][name=delivery_address]', 'change', $.proxy(function onDeliveryAddressChange(e) {
				var thisDeliveryCountry = $(e.target).data('country');
				this.glb.member.delivery_address_id = $(e.target).attr('value');

				if (this.cache.delivery_country !== thisDeliveryCountry) {
					this.cache.delivery_country = thisDeliveryCountry;
					this.fetchDeliveryProducts();
				}

			}, this)).

			delegate('input[type=radio][name=delivery_product]', 'change', $.proxy(function onDeliveryProductChange() {
				this.updateDisplayTotals();

			}, this)).

			delegate('#button_make_payment', 'click', $.proxy(function onSubmitPaymentClick(e) {
				if (PBX && PBX.smallLoader) {
					this.disableCheckout();
					PBX.smallLoader.loader('#button_make_payment');
				} else {
					$('#button_make_payment').hide();
					$('.loader.submit').show();
				}

				this.updateMemberNews();
				this.makePayment();
				e.preventDefault();
			}, this)).

			delegate('#submitDelivery', 'click', $.proxy(function onSubmitPaymentClick(e) {
				var id = $("#delivery-products input:checked").val();
				var fields = $('input[id^="delivery_answer_'+ id +'"]');
				if (fields.length) {
					UCProto.submitDeliveryAnswers(fields, id);
				} else {
					$('input[id^="delivery_answer_"]').remove();
					UCProto.onSubmitButtonClickHendler(e);
				}
				e.preventDefault();
			}, this)).

			delegate('#edit_address', 'click', $.proxy(function onEditAddressClick(e) {
				this.showAddressEditor($(e.target).attr('href'));
				e.preventDefault();
			}, this)).

			delegate('#button_process_manual', 'click', $.proxy(function onSubmitManualOrderClick(e) {
				$('#button_process_manual').hide();
				$('.loader.submit').show();

				this.makeManualOrder();
				e.preventDefault();
			}, this)).

			delegate('.address .edit', 'click', $.proxy(function onEditAddressClick(e) {
				var url = $(e.target).parent().attr('href');
				var addressID = $(e.target).parents(':eq(1)').attr('id');

				//$.webshims.polyfill('forms');
				e.stopPropagation();
				e.preventDefault();

				this.addressEditor = new uc.AddressEditor(this, url);
				this.addressEditor.openAddAddress(addressID.split('-').pop());
				this.addressEditor.bind('onAddressSave', $.proxy(function onEditorClose($form) {
					var address = $('#' +addressID);
					var selectable = $('.address.selectable');
					address.find('.name').html($form.find('#firstName').val() + ' ' + $form.find('#lastName').val());
					$.each(['street', 'town', 'county', 'postcode'], function(i, v) {
						var $el = address.find('.' + v);
						var val = $form.find('#' +v).val();
						var textNode = $el.contents().first()[0];
						if (textNode) {
							textNode.textContent = val;
						} else {
							$el.prepend(val);
						}
					});
					address.find('.country').contents().first()[0].textContent = $form.find('#countryId option:selected').text();
					selectable.find('i.selected').remove();
					selectable.removeClass('active');
					address.last().append('<i class="selected"></i>').addClass('active');

					var selectedCountry = address.closest('.address').data('country');

					if (this.cache.delivery_country !== address.closest('.address').data('country')) {
						this.cache.delivery_country = address.closest('.address').data('country');
					}

					this.glb.member.delivery_address_id = addressID.toString().replace(/address-/g,'');

					this.selectAddress(this, address);

				}, this));
			}, this)).

			delegate('.address.selectable', 'click', $.proxy(function onEditAddressClick(e) {
				if($(e.target).attr('class') != 'edit') {
					e.preventDefault();
					e.stopPropagation();

					$('.address.selectable').find('i.selected').remove();
					$('.address.selectable').removeClass('active');

					var address = $(e.target).closest('.address.selectable');
					var addressID = address.attr('id') || "";

					var selectedCountry = address.closest('.address').data('country');

					if (this.cache.delivery_country !== selectedCountry) {
						this.cache.delivery_country = selectedCountry;
					}

					address.last().append('<i class="selected"></i>').addClass('active');
					//this.glb.member.delivery_address_id = addressID.toString().replace(/address-/g,'');

					this.selectAddress(this, address);
				}
			}, this)).

			delegate('.address .delete', 'click', $.proxy(function onRemoveAddressClick(e) {
				var address = $(e.target).closest('.address.selectable'),
					address_id = address.attr('id').replace(/address-/,'').replace(/store-/,''),
					currentAddressId = $('.address i.selected').closest('.address').attr('id').replace(/address-/,'').replace(/store-/,'')
					;
				var instance = this;
				e.preventDefault();
				e.stopPropagation();

				if (confirm(uc.server.tokens.CONFIRM_DELETE || 'Are you sure you want to remove this address?')) {
					if (address.is('.store')) {
						var delivery = new uc.AddressDelivery(this);
						var storeId = address.attr('id').toString().replace(/store-/,'');
						delivery.removeStore(storeId);

						instance.babel('/member/' + instance.glb.member.member_id + '/stores/delete?store_id=' + address.attr('id').replace(/store-/,'') + '&brand=' + uc.server.brand, function() { }, 'get', {});
						address.remove();

					} else {
						this.addressEditor = new uc.AddressEditor(this, $(e.target).parent().attr('href'));
						this.addressEditor.removeAddress(this.addressEditor.getBasePath('delete') + '&addressId=' +
							$(e.target).parent().attr('href').split('-').pop());
					}

					// Only select default address if deleting the currently selected address
					if(currentAddressId == address_id) {
						$('#address-0').click();
					}
				}

			}, this)).

			delegate('button#submit', 'click', $.proxy(UCProto.onSubmitButtonClickHendler, this));

		return this;
	};

	/**
	 * Update fields and send user on to Adyen
	 * @return {[type]}   [description]
	 */
	UCProto.makePayment = function() {
		if (PBX) {
			if (PBX.asyncLoader) {
				var data = {createOrder: true};
				if ( $('input[type=checkbox][name=newsletter]').length && $('input[type=checkbox][name=newsletter]').get(0).checked) {
					data.subscribedToNews = true;
				}
				PBX.asyncLoader.refreshElement('#order_form', function() {
					$('#order_form').submit();
				}, data)
			}
		}
		return this;
	};

	/*
	 * Checks if the news checkbox exists on the review page, if so and it differs from the cached value send an ajax update call.
	 *
	 */
	UCProto.updateMemberNews = function() {
		if ( $('input[type=checkbox][name=news]').length ) {
			var news = $('input[type=checkbox][name=news]').get(0).checked;
			if ( news !== this.cache.news ) {
				// Empty callbacks, this is firing off just before the basket is being submitted, don't want that being held up for setting the news toggle.
				return this.babel('/member/' + this.glb.member.member_id, function() { }, 'post', { 'news' : news ? 1 : 0 }, function() {} );
			}
		}
	};

	UCProto.submitDeliveryAnswers = function ($inputs, productId) {
		if (BXT) {
			var answers = {};
			$inputs.each(function () {
				var $el = $(this);
				answers[$el.attr('name')] = $el.val();
			});
			if (BXT.smallLoader) {
				UCProto.disableCheckout();
				$('#submitDelivery').append('<span id="nextLoader">');
				BXT.smallLoader.loader('#nextLoader');
			} else {
				$('#button_make_payment').hide();
				$('.loader.submit').show();
			}
			var url = UCProto.getBasePath('patch');
			var options = {
				success: function (data) {
					if (BXT.smallLoader) {
						UCProto.enableCheckout();
						$('#nextLoader').remove();
					} else {
						$('#button_make_payment').show();
						$('.loader.submit').hide();
					}
					$('input[id^="delivery_answer_"]').each(function () {
						this.setCustomValidity('');
					});
					for(var i = 0; i < data.length; i++){
						var item = data[i];
						var $input = $('input[id="delivery_answer_'+ productId +'_' + item.questionId + '"]');
						$input[0].setCustomValidity(item.failedValidationMessage);
					}
					UCProto.onSubmitButtonClickHendler({target: $('#submitDelivery')[0]});
				},
				error: function () {
					// TO-DO: show error
				},
				type: 'POST',
				data: JSON.stringify({deliveryAnswers: answers})
			};
			BXT.utils.loadData(url, options);
		}
	}

	/**
	 * Submit page form
	 * @param e
	 */

	UCProto.onSubmitButtonClickHendler = function(e) {
		var $form = $(e.target).parents('form');
		var $actualSubmit = $form.find('.input-submit');
		if ($actualSubmit.length) {
			$actualSubmit.click();
		}
		$('.error').hide();
	};


	/**
	 * Make a manual order
	 * Used for baskets that don't need payment taken
	 *
	 * @return {[type]} [description]
	 */
	UCProto.makeManualOrder = function() {
		this.updateBabelBasket().then($.proxy(function updateBabelBasketCallback(data, state) {
			if (state !== "success") {
				alert(uc.server.tokens.ERROR || 'There was an error on our side, please try again.');
				$('#button_process_manual').show();
				$('.loader.submit').hide();
			}

			window.location = '/thanks.html';
		}, this));

		return this;
	};

	/**
	 * Grab the add/edit address partial via ajax
	 * @return {[type]} [description]
	 */
	UCProto.showAddressEditor = function(url) {
		this.addressEditor = new uc.AddressEditor(this, url);
		return this.addressEditor.open();
	};

	/**
	 * AJAX call for delivery products (as this is currently a very slow call)
	 * @return {[type]}        [description]
	 */
	UCProto.fetchDeliveryProducts = function(done) {
		var instance = this;
		if (PBX) {
			if (PBX.asyncLoader) {
				var $loading = $('.delivery-products-loading');
				$loading.removeClass('hidden');
				$('#delivery-products').remove();
				PBX.asyncLoader.refreshElement('#delivery-products-component', function() {
					$loading.addClass('hidden');
					instance.updateDisplayTotals();
					instance.trigger('deliveryMethodsLoaded');
				});
			}
		}
		/*var path = '/partials/deliverymethods';
		 var countryID = $('input[type=radio][name=delivery_address]:checked').data('country') || $('.address .selected').closest('.address').data('country');

		 var $products = $('.delivery-products');
		 var $loading = $('.delivery-products-loading');

		 var type = $('body').is('.review') ? 'current' : 'list';
		 var currentAddress = $('.address').find('i.selected:first').closest('.address');
		 var address_type = (currentAddress.hasClass('store'))? 'store' : 'default';

		 $products.hide();
		 $loading.show();

		 if (this.cache.deliveryXHR !== false && this.cache.deliveryXHR.hasOwnProperty('abort')) {
		 if (this.cache.delivery_country !== $('.address.selectable.active').data('country') ) {
		 if (this.cache.deliveryXHR.readyState == 4) {
		 this.cache.deliveryXHR = false;
		 } else {
		 this.cache.deliveryXHR.abort();
		 }
		 }
		 }

		 this.cache.deliveryXHR = $.get(path + '?country_id=' + countryID + '&type=' + type + '&address_type=' + address_type + '&page=' + $('#uc').attr('class') + uc.server['RAW_TOKENS_amp'], $.proxy(function GetDeliveryProducts(data) {

		 $products.show();
		 $loading.hide();
		 this.unlockDeliveryMethods();

		 this.trigger('deliveryMethodsLoaded', data);
		 if (typeof done === 'function') {
		 done(data);
		 }

		 if ( $('div.store.active').length ) {
		 var frequency = $('div.store.active').data('store-frequency');
		 $products.find('.information label').attr( 'title', frequency ).html( frequency );
		 }

		 }, this)).fail($.proxy(function FailDeliveryProducts() {
		 this.trigger('deliveryMethodsLoaded', '<p class="error">' + (uc.server.tokens.ERROR || "Unable to load delivery methods") + '.</p>', true);
		 }, this));*/

	};

	/**
	 * Poll the /payment/ service back end to check order status
	 * @return {[type]} [description]
	 */
	UCProto.pollOrderStatus = function() {
		var $orderConfirmation = $('.order-confirmation'),
			confirmationTimeout = false
			;
		var confirmationRedirect = function(delay) {
			delay = (delay === true)? 5000 : ( parseInt(delay, 10) || 0);
			var confirmationEndpoint;
			if($orderConfirmation.attr('data-confirmation-endpoint')) {
				confirmationEndpoint = $orderConfirmation.attr('data-confirmation-endpoint').replace("%s", payment.order_ref);
			}
			if (!confirmationTimeout && confirmationEndpoint) {
				confirmationTimeout = window.setTimeout(function() {
					window.location.href = confirmationEndpoint;
				}, delay);
			}
		};

		var googleGTMcallback = function (data) {
			window.dataLayer = window.dataLayer || [];
			if (data.fields.order.fields.valid == '1') {
				var transaction_data = {
					order_amount_ati:         data.fields.order.fields.total_gross,
					order_amount_tf:          data.fields.order.fields.total_net,
					order_tax_amount:         data.fields.order.fields.total_vat,
					order_shipping_cost_ati:  data.fields.order.fields.total_delivery_gross,
					order_shipping_cost_tf:   data.fields.order.fields.total_delivery_net
				};
				$.extend(transaction_data, window.globalDataLayerProperties);
				transaction_data.Transaction_Data = [
					[
						data.fields.order.id,
						uc.server.brand,
						data.fields.order.fields.total_net,
						data.fields.order.fields.total_delivery_gross,
						data.fields.order.fields.total_vat,
						uc.server.currencySymbolISO
					]
				];
				$.each(data.fields.order.fields.items, function(index, item) {
					var line_quantity = parseInt(item.fields.quantity, 10);
					transaction_data.Transaction_Data.push([
						data.fields.order.id,
						item.fields.product_name,
						item.fields.product_id,
						'', // category
						parseFloat(item.fields.line_price_net_adjusted),
						item.fields.quantity,
						uc.server.currencySymbolISO
					]);
				});
				dataLayer.push(transaction_data);
				dataLayer.push({ event: 'transactionLoaded'});

				dataLayer.push({ event: 'transactionAccepted'});
			} else if (data.fields.order.fields.status == 'error') {
				dataLayer.push({ event: 'transactionFailed'});
			} else {
				//unlikely event; push event to measure how often it happens
				dataLayer.push({ event: 'transactionInvalid'});
			}
		};

		// don't need to poll if we have a result already.
		if ($orderConfirmation.hasClass('success')) {
			confirmationRedirect(true);
			return;
		}

		return this.babel('/payment/' + this.glb.member.payment_id, $.proxy(function OrderStatusCallback(data) {
			var pollAgain = false;
			if (typeof data.fields.order.fields === 'undefined' || typeof data.fields.order.fields.valid === 'undefined' || data.fields.order.fields.status == 'new' || data.fields.order.fields.status == 'unpaid') {
				pollAgain = true;
			} else if (data.fields.order.fields.valid == '0') {
				_gaq.push(['_trackEvent', 'payment-failed', 'processing payment', 'failed to accept payment' ]);
				$orderConfirmation.removeClass('fail processing success').addClass('fail');
				googleGTMcallback(data);
				//dataLayer.push({ event: 'transactionFailed'});
			} else if (data.fields.order.fields.valid == '1') {
				googleGTMcallback(data);

				// RENDER THE TAGGING!
				if (typeof EA_collector !== 'undefined' && typeof dataForEA !== 'undefined') {
					var profile = (data.fields.order.fields.first_order == '1') ? "NEW_CUSTOMER" : "OLD_CUSTOMER";
					dataForEA.push('ref', data.fields.order.fields.order_refcode);
					dataForEA.push('amount', data.fields.order.fields.web_total_inc);
					dataForEA.push('shippingcost', data.fields.order.fields.total_delivery_gross);
					dataForEA.push('profile', profile);
					dataForEA.push('type', uc.deviceType() + '|' + profile);

					// send it over
					EA_collector(dataForEA);

					// send ga tags
					_gaq.push(['_setCustomVar', 1, 'profile', profile]);

					_gaq.push(['_addTrans',
						data.fields.order.fields.order_refcode,
						'',
						data.fields.order.fields.web_total_inc,
						'',
						data.fields.order.fields.total_delivery_gross
					]);
					_gaq.push(['_trackTrans']);
				}

				if ($orderConfirmation.attr('data-confirmation-endpoint')) {
					payment.is_valid = parseInt(data.fields.order.fields.valid, 10);
					payment.order_ref = data.fields.order.fields.order_refcode;
					confirmationRedirect(true);
				} else {
					$orderConfirmation.removeClass('fail processing success').addClass('success');
					$('#orderid').html(data.fields.order.fields.order_refcode);
				}
			}

			if (pollAgain) {
				setTimeout($.proxy(function() {
					this.pollOrderStatus();
				}, this), POLL_TIMEOUT);
			}
		}, this), 'get', {}, function onPollFailure(xhr, type, statusText) {
			if (xhr.status === 400) {
				$orderConfirmation.removeClass('fail processing success').addClass('fail');
				try {
					var json = $.parseJSON( xhr.responseText );
					$orderConfirmation.find('div.wrapper .fail').append('<p>' + uc.server.tokens.ERROR_CODE + json.babelErrorCode  + '</p>');
					_gaq.push(['_trackEvent', 'payment-failed', 'processing payment', 'Babel Error Code : ' + json.babelErrorCode ]);
					dataLayer.push({ event: 'poller_error'});
				} catch(e) {
				}

			} else {
				$orderConfirmation.removeClass('fail processing success').addClass('fail');
				$orderConfirmation.find('div.wrapper .fail').append('<p>' + uc.server.tokens.ERROR_STATUS + xhr.status + ' - ' + statusText + '</p>');
				_gaq.push(['_trackEvent', 'payment-failed', 'processing payment',  'Error status : ' + uc.server.tokens.ERROR_STATUS ]);
				dataLayer.push({ event: 'poller_error'});

			}
		});
	};

	return CheckoutHelper;

})(jQuery);

