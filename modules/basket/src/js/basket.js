var BXT = window.BXT || {};
BXT.basketUtil = (function (BXT, $, PBX) {
	var process = {
		/**
		 * Get basket unit id from child id
		 * @param str child id
		 * @returns {string}
		 */
		getUnitId: function(str) {
			var arr =str.split('-');
			return arr[arr.length - 1];
		},
		getProductId: function(str) {
			var arr =str.split('-');
			return arr[arr.length - 2];
		},
		getStyleId: function(str) {
			var arr =str.split('-');
			return arr[arr.length - 1];
		},
		/**
		 * Get basket id
		 * @returns {string}
		 */
		getBasketId: function() {
			return PBX.utils.getIdFromElement('basket');
		},
		/**
		 * return base path for ajax request
		 * @returns {url|string}
		 */
		getBasePath: function() {
			var path = window.location.origin;
			var contextPath = $('#node-'+PBX.utils.getNodeId()).data('ajax-url');
			path = contextPath === '' || contextPath === null ? path : path + contextPath;
			return path + '/basketAjax/basket-ajax/item-ajax?basketId=' + BXT.basketUtil.getBasketId() + '&nid=' +
				$('#basket-' + BXT.basketUtil.getBasketId()).data('node-id');
		},
		getBasePathNew: function() {
			var path = window.location.origin;
			var contextPath = $('#node-'+PBX.utils.getNodeId()).data('ajax-url');
			path = contextPath === '' || contextPath === null ? path : path + contextPath;
			return path + '/basketAjax/basket-ajax/item-ajax-new?basketId=' + BXT.basketUtil.getBasketId() + '&nid=' +
				$('#basket-' + BXT.basketUtil.getBasketId()).data('node-id');
		},
		getBasePathProduct: function() {
			var path = window.location.origin;
			var contextPath = $('#node-'+PBX.utils.getNodeId()).data('ajax-url');
			path = contextPath === '' || contextPath === null ? path : path + contextPath;
			return path + '/basketAjax/basket-ajax/summarised-product-ajax?basketId=' + BXT.basketUtil.getBasketId() + '&nid=' +
				$('#basket-' + BXT.basketUtil.getBasketId()).data('node-id');
		},
		isUnitInLoading: function (id) {
			var unit = $('#basketUnit-' + id);
			return unit.find('.overlay').length || unit.find('#quantityInput-' + id).hasClass('loading') ||
				unit.find('#unit-credit-' + id).hasClass('loading');
		},
		updateBasketView: function (data) {
			var dataMap = {
				itemsTotal : '#items-total .value',
				totalChargeable : '#total-price .value, .basket-summary .total-chargeable',
				minDespatchDate : '#min-despatch-date',
				cashDiscountTotal : '#cash-discount-total .modal-value',
				monetaryDiscountTotal: '#monetary-discount-total .modal-value',
				offerTotal: '#offer-total .modal-value'

			};
			for(var a in data) {
				if (dataMap.hasOwnProperty(a)) {
					$(dataMap[a]).text(data[a]);
				}
			}
			// update header items count
			var itemsCount = $('.basket-summary .items-count');
			var itemsCountText = data.itemsCount + ' ';
			if (data.itemsCount > 1) {
				itemsCountText += itemsCount.data('items-text');
			} else {
				itemsCountText += itemsCount.data('item-text');
			}
			itemsCount.text(itemsCountText);
			$('.basket-quantity-field, #MenuBasket .quantity').text(data.itemsCount);
			// update delivery cost
			that.updateBasketDeliveryCost(data);
			//update delivery method name
			that.updateBasketDeliveryMethod(data);
			// update max despatch date
			var maxDespatchDate = $('#max-despatch-date');
			maxDespatchDate.text(data.maxDespatchDate);
			if (data.maxDespatchDate !== data.minDespatchDate) {
				maxDespatchDate.addClass('hidden');
			} else {
				maxDespatchDate.addClass('remove');
			}
			// update credits
			var hiddenClassName = 'hidden';
			var cashDiscountTotal = $('#cash-discount-total');
			if (!data.cashDiscountTotal) {
				cashDiscountTotal.addClass(hiddenClassName);
			} else {
				cashDiscountTotal.removeClass(hiddenClassName);
			}
			var monetaryDiscountTotal = $('#monetary-discount-total');
			if (!data.monetaryDiscountTotal) {
				monetaryDiscountTotal.addClass(hiddenClassName);
			} else {
				monetaryDiscountTotal.removeClass(hiddenClassName);
			}
			//update offer
			that.updateBasketOffer(data);
			var despatchDate = $('#estimate-date');
			if (data.items && data.items.length) {
				despatchDate.removeClass(hiddenClassName);
				that.setEmptyBasketMode(false);
			} else {
				that.setEmptyBasketMode(true);
				despatchDate.addClass(hiddenClassName);
			}
			// update units
			that.updateBasketUnits(data);
		},
		updateBasketUnits: function (data) {
			var units = $('[id^="basketUnit-"]');

			var l = units.length;
			for(var i = 0; i < l; i++) {
				var unit = $(units[i]);
				var exist = false;
				if (data.items) {
					for (var j = 0; j < data.items.length; j++) {
						var item = data.items[j];
						if (item.id && item.id.toString() === that.getUnitId(unit.attr('id'))) {
							if (!that.isUnitInLoading(item.id)) {
								that.updateBasketUnit(item);
							}
							exist = true;
							data.items.splice(j, 1);
							break;
						}
					}
				}
				if (!exist){
					unit.remove();
				}
			}

			// TO-DO: adding new items
		},
		updateBasketUnit: function (data) {
			var hiddenClassName = 'visuallyhidden';
			var unit = $('#basketUnit-' + data.id);
			if (unit.length) {
				// update unit price
				unit.find('#unitPrice-' + data.id + ' .current').text(data.unitPrice);
				// update unit total price
				unit.find('#price-' + data.id).text(data.total);
				// update unit quantity
				var input = unit.find('#quantityInput-' + data.id);
				input.val(data.quantity);
				input.data('value', data.quantity);
				// update upsell
				that.updateUnitUpsell(data);
				// update unit credit
				var isCredit = ((data.quantityFree > 0) || (!data.creditsAllowed && data.creditsAvailable));
				var unitCredit = unit.find('#unit-credit-' + data.id);
				if (isCredit) {
					unitCredit.removeClass('hidden');
					var value = unitCredit.find('.value');
					if (data.creditsAllowed) {
						value.find('.modal-value').text(data.creditSaving);
						value.removeClass(hiddenClassName);
					} else {
						value.addClass(hiddenClassName);
					}
					var select = unitCredit.find('#item-credits-allowed-' + data.id);
					select.find('option').each(function() {
						if (String($(this).val()) === String(data.creditsAllowed)) {
							$(this).attr('selected', 'selected');
						} else {
							$(this).attr('selected', false);
						}
					});
					select.change();
				} else {
					unitCredit.addClass('hidden');
				}
				// update unit options
				var additionalPriceTree = unit.find('#additional-price-tree-' + data.id);
				var description = unit.find('.description');
				if (data.quantityFree || (!(data.namedOptionsList && data.namedOptionsList.length) &&
					!data.extraPagesOption)) {
					additionalPriceTree.addClass(hiddenClassName);
					description.removeClass('has-options');
				} else {
					additionalPriceTree.removeClass(hiddenClassName);
					description.addClass('has-options');
				}
				var additionalPrice = unit.find('#additional-price-' + data.id);
				if (data.quantityFree) {
					additionalPrice.addClass(hiddenClassName);
				} else {
					additionalPrice.removeClass(hiddenClassName);
				}
			}
		},
		updateBasketOffer: function (data) {
			var totalHiddenClassName = 'hidden';
			var hiddenClassName = 'visuallyhidden';
			if (data) {
				var offerTotal = $('#offer-total');
				var offerSuccess = $('#offer-success');
				var noOfferMessage = $('#no-offer-code-message');
				if (data.currentOffer && data.currentOffer.code && data.offerHasBeenRequested) {
					offerTotal.removeClass(totalHiddenClassName);
					offerSuccess.removeClass(hiddenClassName);
					noOfferMessage.addClass(hiddenClassName);
					offerTotal.find('#offer-code').text(data.currentOffer.code);
					offerSuccess.find('#offer-code-success').text(data.currentOffer.code);
				} else if (data.currentOffer && data.currentOffer.code) {
					offerTotal.removeClass(totalHiddenClassName);
					noOfferMessage.addClass(hiddenClassName);
					offerTotal.find('#offer-code').text(data.currentOffer.code);
				} else {
					offerTotal.addClass(totalHiddenClassName);
					offerSuccess.addClass(hiddenClassName);
					noOfferMessage.removeClass(hiddenClassName);
				}
			}
		},
		updateBasketDeliveryCost : function (data) {
			var estimatedDelivery = $('#estimated-delivery');
			var estimatedDeliveryValue = estimatedDelivery.find('.value');
			var discountClassName = 'discount';
			if (data.freeDelivery) {
				estimatedDelivery.addClass(discountClassName);
				estimatedDeliveryValue.text(estimatedDeliveryValue.attr('data-free-message'));
			} else {
				estimatedDelivery.removeClass(discountClassName);
				estimatedDeliveryValue.text(data.estimatedDeliveryCost);
			}
		},
		updateBasketDeliveryMethod: function (data) {
			var estimatedDeliveryMethod = $('#estimated-delivery .desc');
			if (data.deliveryMethodName !== estimatedDeliveryMethod.text() && data.deliveryMethodName !== '') {
				estimatedDeliveryMethod.text(data.deliveryMethodName);
			}
		},
		/**
		 * update unit upsell view
		 * @param unit data
		 */
		updateUnitUpsell: function (data) {
			var hiddenClassName = 'hidden';
			var unit = $('#basketUnit-' + data.id);
			var edit = unit.find('#edit-' + data.id);
			var editUpsell = unit.find('#edit-upsell-' + data.id);
			var upsell = unit.find('#upsell-' + data.id);
			var upsellPromotionButton = unit.find('#upsell-promotion-button-' + data.id);
			if (data.basketItemUpsell && data.basketItemUpsell.upsell) {
				if (data.basketItemUpsell.upsell.active) {
					edit.addClass(hiddenClassName);
					editUpsell.removeClass(hiddenClassName);
					upsell.removeClass(hiddenClassName);
					upsellPromotionButton.addClass(hiddenClassName);
					upsell.find('.title').text(data.productName);
					upsell.find('.sub-title').text(data.basketItemUpsell.upsell.name);
					upsell.find('.old').text(data.unitPrice);
					upsell.find('.current').text(data.basketItemUpsell.unitPrice);
					upsell.find('.price').text(data.basketItemUpsell.total);
				}
			}
			else if(data.upsell){
				if(!data.upsell.active){
					edit.removeClass(hiddenClassName);
					editUpsell.addClass(hiddenClassName);
					upsell.addClass(hiddenClassName);
					upsellPromotionButton.removeClass(hiddenClassName);

					var upsellPromotionSpan =  upsellPromotionButton.find('.btn-text');
					upsellPromotionSpan.text(upsellPromotionSpan.text().replace('{pbx-upsell-cost}',data.upsell.cost));
					if (upsellPromotionButton[0]){
						upsellPromotionButton[0].href = upsellPromotionButton[0].href.replace('{pbx-upsell-id}',data.upsell.id);
					}
				}
			}
			else {
				edit.removeClass(hiddenClassName);
				editUpsell.addClass(hiddenClassName);
				upsell.addClass(hiddenClassName);
				upsellPromotionButton.addClass(hiddenClassName);
			}
		},
		setEmptyBasketMode: function (empty) {
			var hiddenClassName = 'hidden';
			var emptyBasket = $('.empty-basket');
			var basketComponents = $('.basket-summary, .controls-mobile, .basket');
			if (empty) {
				emptyBasket.removeClass(hiddenClassName);
				basketComponents.addClass(hiddenClassName);
			} else {
				emptyBasket.addClass(hiddenClassName);
				basketComponents.removeClass(hiddenClassName);
			}
		},
		showDeleteConfirmationPopup: function (id) {
			that.showConfirmationPopup(id, $('#upsell-' + id).hasClass('hidden') ? 'removal' : 'removal-with-upsell',
				function () {
					if($('#component-basket').length) {
						that.sendDeleteRequestNew(id);
					} else {
						that.sendDeleteRequest(id);
					}
				});
		},
		showDeleteProductConfirmationPopup: function (productId, styleId) {
			that.showConfirmationPopup('' + productId + styleId, 'removal',
				function () {
					that.sendDeleteProductRequest(productId, styleId);
				});
		},
		showDeleteUpsellConfirmationPopup: function (id, value) {
			var title = $('#basketUnit-' + id + ' .unit-header .title' ).text();
			that.showConfirmationPopup(id ,'upsell',
				function () {
					if($('#component-basket').length) {
						that.sendQuantityChangeRequestNew(id, value);
					} else {
						that.sendQuantityChangeRequest(id, value);
					}
				}, [value + 1, title]
			);
		},
		showConfirmationPopup: function (id, contentId, confirmationCallback, informationVars) {
			var unit = $('#basketUnit-' + id);
			informationVars = informationVars || [];
			var information;

			if (!PBX.utils.isPalm) {
				var modal =  $('#confirmation-modal');
				var title = modal.find('#confirmation-modal-title');
				title.text(title.data(contentId));
				information = modal.find('#confirmation-modal-information');
				modal.modal('show');
				modal.find('#confirmation-modal-confirm').unbind().click(confirmationCallback);
			} else {
				that.removeDeleteNotification();
				var confirmation = $($('#confirmation-notification-tmpl').html());
				confirmation.find('#confirmation-notification-cancel').on('click', function click(e) {
					confirmation.remove();
					return false;
				});
				information = confirmation.find('#confirmation-notification-information');
				confirmation.find('#confirmation-notification-confirm').on('click', function click(e) {
					confirmation.remove();
					confirmationCallback();
					return false;
				});
				confirmation.insertAfter(unit.find('.price + .cf'));
			}
			information.text(PBX.utils.insertValuesIntoString(information.data(contentId), informationVars));
		},
		removeDeleteNotification: function () {
			var deleteConfirmation = $('[id^="basketUnit-"] #confirmation-notification');
			deleteConfirmation.remove();
		},
		sendDeleteRequest: function(id) {
			var $el = $('#basketUnit-' + id);
			$el.prepend('<div class="overlay">');
			var options = {
				type: 'DELETE',
				success: function(data, status, jqXHR) {
					//load the cross sell component async
					if($('#cross-sell-offers').length){
						PBX.asyncLoader.refreshElement('#cross-sell-offers');
					}
					that.updateBasketView(data);
				},
				error: function(jqXHR, status, errorThrown) {
					$('.overlay', $el).remove();
					// TO-DO add error message
				}
			};
			PBX.utils.loadData(BXT.basketUtil.getBasePath() + '&itemId=' + id, options);
		},
		sendDeleteRequestNew: function(id) {
			var $el = $('#basketUnit-' + id);
			$el.prepend('<div class="overlay">');
			var options = {
				data: '{\"id\":' + id +  '}',
				type: 'DELETE',
				success: function(data, status, jqXHR) {
					//load the cross sell component  and basket component async
					if($('header').length) {
						PBX.asyncLoader.refreshElement('header');
					}
					BXT.basketUtil.asyncLoadBasketComponents();
				},
				error: function(jqXHR, status, errorThrown) {
					if($('header').length) {
						PBX.asyncLoader.refreshElement('header');
					}
					BXT.basketUtil.asyncLoadBasketComponents();
					// TO-DO add error message
				}
			};
			PBX.utils.loadData(BXT.basketUtil.getBasePathNew(), options);
		},
		sendDeleteProductRequest: function(productId, styleId) {
			var $el = $('#basketUnit-' + productId + '-' + styleId);
			$el.prepend('<div class="overlay">');
			var options = {
				data: '{\"productId\":' + productId + ', \"styleId\":' + styleId +  '}',
				type: 'DELETE',
				success: function(data, status, jqXHR) {
					//load the cross sell component  and basket component async
					if($('header').length) {
						PBX.asyncLoader.refreshElement('header');
					}
					BXT.basketUtil.asyncLoadBasketComponents();
				},
				error: function(jqXHR, status, errorThrown) {
					if($('header').length) {
						PBX.asyncLoader.refreshElement('header');
					}
					BXT.basketUtil.asyncLoadBasketComponents();
					// TO-DO add error message
				}
			};
			PBX.utils.loadData(BXT.basketUtil.getBasePathProduct(), options);
		},
		sendQuantityChangeRequest: function(id, val) {
			var input = $('#quantityInput-' + id);
			if (!input.hasClass('loading')) {
				input.addClass('loading');
				var options = {
					data: '{\"quantity\":' + val + '}',
					type: 'PUT',
					success: function (data, status, jqXHR) {
						input.removeClass('loading');
						if (input.val() === val.toString()) {
							that.updateBasketView(data);
						} else {
							input.trigger('change');
						}
					},
					error: function (jqXHR, status, errorThrown) {
						input.removeClass('loading');
						if (input.val() === val.toString()) {
							input.val(input.data('value'));
							// TO-DO add error message
						} else {
							input.trigger('change');
						}
					}
				};
				PBX.utils.loadData(BXT.basketUtil.getBasePath() + '&itemId=' + id, options);
			}

		},
		sendQuantityChangeRequestNew: function(id, val) {
			var input = $('#quantityInput-' + id);
			if (!input.hasClass('loading')) {
				input.addClass('loading');
				var options = {
					data: '{\"quantity\":' + val + ', \"id\":' + id +  '}',
					type: 'PUT',
					success: function (data, status, jqXHR) {
						PBX.asyncLoader.refreshElement('#component-basket');
						if($('header').length) {
							PBX.asyncLoader.refreshElement('header');
						}
					},
					error: function (jqXHR, status, errorThrown) {
						PBX.asyncLoader.refreshElement('#component-basket');
						if($('header').length) {
							PBX.asyncLoader.refreshElement('header');
						}
						//TODO: pass the error display handler to refreshelement
					}
				};
				PBX.utils.loadData(BXT.basketUtil.getBasePathNew(), options);
			}

		},
		asyncLoadBasketComponents: function() {
			PBX.asyncLoader.refreshElement('#component-basket');
			PBX.asyncLoader.refreshElement('#cross-sell-offers');
		}
	};
	var that = process;
	return process;
})(BXT, $, PBX);
BXT.basket = (function (BXT, $, PBX) {
	var process = {
		init: function () {
						
			$('a[id^="deleteUnit-"], a[id^="removeIcon-"]').off('click').on('click', function click(e) {
				BXT.basketUtil.showDeleteConfirmationPopup(BXT.basketUtil.getUnitId(e.currentTarget.id));
				return false;
			});
			$('a[id^="deleteProductUnit-"], a[id^="removeProductIcon-"]').off('click').on('click', function click(e) {
				BXT.basketUtil.showDeleteProductConfirmationPopup(BXT.basketUtil.getProductId(e.currentTarget.id), BXT.basketUtil.getStyleId(e.currentTarget.id));
				return false;
			});

			$('#estimate-date-toggle').off('click').on('click', BXT.basket.toggleEstimatedDateInfo);

			//show all modals inside body
			$('.modal').on('show.bs.modal', function (event) {
				$('body').append($(this));
			});
		},

		toggleEstimatedDateInfo: function(e){
			var $estimateDateContainer = $('#estimate-date-container');
			var $infoMessage = $('.info-toggle-message', $estimateDateContainer);

			if($estimateDateContainer.hasClass('open')){
				$estimateDateContainer.removeClass('open');
				$infoMessage.html( $infoMessage.data('show-text') );
			} else{
				$estimateDateContainer.addClass('open');
				$infoMessage.html( $infoMessage.data('hide-text') );
			}
		}
	};
	PBX.utils.functionList.push({ test: '#component-basket', func: process.init, ctx: process });
	return process;
})(BXT, $, PBX);
BXT.basketOptions = (function (BXT, $, PBX) {
	var process = {
		init: function () {
			$('a[id^="options-button-"]').on('click', function click(e) {
				var id = BXT.basketUtil.getUnitId(e.currentTarget.id);
				var buttonIcon = $('#options-button-' + id + ' span');
				if (buttonIcon.hasClass('icon-options-close')) {
					that.hideOptions(id);
				} else {
					that.showOptions(id);
				}
				return false;
			});
		},
		/**
		 * show unit options
		 * @param unit id
		 */
		showOptions: function (id) {
			var $basketUnit = $('#basketUnit-' + id);
			$('.options-vertical-line', $basketUnit).show();
			$('.additional-price', $basketUnit).removeClass('accessibility--palm');
			$('.unit-credit .value', $basketUnit).removeClass('hidden');

			var buttonIcon = $('#options-button-' + id + ' span');
			buttonIcon.addClass('icon-options-close');
			buttonIcon.removeClass('icon-options-open');
		},
		/**
		 * hide unit options
		 * @param unit id
		 */
		hideOptions: function (id) {
			var $basketUnit = $('#basketUnit-' + id);
			$('.options-vertical-line', $basketUnit).hide();
			$('.additional-price', $basketUnit).addClass('accessibility--palm');
			$('.unit-credit .value', $basketUnit).addClass('hidden');

			var buttonIcon = $('#options-button-' + id + ' span');
			buttonIcon.addClass('icon-options-open');
			buttonIcon.removeClass('icon-options-close');
		}
	};
	var that = process;
	PBX.utils.functionList.push({ test: 'a[id^="options-button-"]', func: process.init, ctx: process });
	return process;
})(BXT, $, PBX);
BXT.basketQuantity = (function (BXT, $, PBX) {
	var process = {
		init: function () {
			$('a[id^="quantityMinus-"]').off('click').on('click', function click(e) {
				that.doQuantityMinusClick(e);
				return false;
			});
			$('a[id^="quantityPlus-"]').off('click').on('click', function click(e) {
				that.doQuantityPlusClick(e);
				return false;
			});
			$('body').on('click', '#confirmation-modal-cancel, #confirmation-modal .close, .modal-backdrop', function click(e) {
				that.resetQuantityInput($(this));
			});
			var input = $('input[id^="quantityInput-"]');
			input.prop('readonly', false);
			input.on('change', function click(e) {
				that.doQuantityInputChange(e);
			});
		},
		doQuantityMinusClick: function (e) {
			that.updateQuantityInputValue( BXT.basketUtil.getUnitId(e.target.id), -1, true);
		},
		doQuantityPlusClick: function (e) {
			that.updateQuantityInputValue( BXT.basketUtil.getUnitId(e.target.id), 1, true);
		},
		doQuantityInputChange: function (e) {
			var id = BXT.basketUtil.getUnitId(e.target.id);
			var input = $('#quantityInput-' + id);
			var intRegex = /^\d+$/;
			var val = input.val() || 0;
			if (intRegex.test(val)) {
				that.updateQuantityInputValue(id, val);
			} else {
				input.val(input.data('value'));
			}

		},
		resetQuantityInput: function (e) {
			var id = e.data('upsellid');
			var input = $('#quantityInput-' + id);
			input.val(input.data('value'));
		},
		/**
		 * update quantity input value
		 * @param id unit id
		 * @param val new value
		 * @param [add] if true (old + val)
		 */
		updateQuantityInputValue : function (id, val, add) {
			var input = $('#quantityInput-' + id);
			val = parseInt(val, 10) + (add ? parseInt(input.val(), 10) : 0);
			if (val < 1) {
				val = input.data('value');
				BXT.basketUtil.showDeleteConfirmationPopup(id);
			} else {
				if ($('#upsell-' + id).hasClass('hidden')) {
					if($('#component-basket').length) {
						BXT.basketUtil.sendQuantityChangeRequestNew(id, val);
					} else {
						BXT.basketUtil.sendQuantityChangeRequest(id, val);
					}
					BXT.basketUtil.removeDeleteNotification();
				} else {
					BXT.basketUtil.showDeleteUpsellConfirmationPopup(id, val);
					$('#confirmation-modal-cancel, #confirmation-modal .close, .modal-backdrop').attr('data-upsellid',id);
				}
			}
			input.val(val);
			if($('header').length) {
				PBX.asyncLoader.refreshElement('header');
			}
			//input.attr('data-value', val);
		}
	};
	var that = process;
	PBX.utils.functionList.push({ test: '.basket-component', func: process.init, ctx: process });
	return process;
})(BXT, $, PBX);
BXT.offerCode = (function (BXT, $, PBX) {
	var process = {
		init: function () {
			$('#offer-code-form-button').off('click').on('click', function click(e) {
				that.submitOfferCode(e);
				return false;
			});
			$('#remove-offer-link').off('click').on('click', function click(e) {
				that.removeOfferCode(e);
				return false;
			});
		},
		getBasePath: function() {
			var path = window.location.origin;
			var contextPath = $('#node-'+PBX.utils.getNodeId()).data('ajax-url');
			path = contextPath === '' || contextPath === null ? path : path + contextPath;
			return path + '/basketAjax/basket-ajax/offer?basketId=' + BXT.basketUtil.getBasketId() + '&nid=' +
				$('#basket-' + BXT.basketUtil.getBasketId()).data('node-id');
		},
		displayErrorMessage: function(data) {
			if (data.termsReminder) {
				$('#lio-message').html($.parseHTML(data.termsReminder));
			}
			else if (data.message){
				$('#lio-message').html($.parseHTML(data.message));
			}else {
				$('#lio-message').empty();
			}
			if (data.internalErrorMessage) {
				$('#offer-error .internal').html($.parseHTML(data.internalErrorMessage));
				$('#offer-error .hidden').html($.parseHTML(data.messageFromBackEnd));
			} else {
				$('#offer-error .internal').empty();
			}
			$('#offer-error').removeClass('visuallyhidden');
		},
		displaySuccessMessage: function(data) {
			if (data.offer) {
				$('#offer-code-success').text(data.offer.code);
			}
			if (data.message){
				$('#offer-code-success-message').html($.parseHTML(data.message));
			}
			$('#offer-success').removeClass('visuallyhidden');
		},
		submitOfferCode: function (e) {
			var offerCode = $('#offer-code-form #offerCode').val();
			var offerButtonHtml = $('#offer-code-form-button').html();
			var options = {
				type: 'PUT',
				data: '{\"offerCode\":\"' + offerCode + '\"}',
				success: function(data, status, jqXHR) {
					if ((data.offer && data.offer.code.length !==0) || data.message) {
						//offer code applied successfully
						PBX.asyncLoader.refreshElement('#component-basket', function() {
							BXT.offerCode.displaySuccessMessage(data);
						});
					} else if (data.internalErrorMessage){
						$('#offer-code-form-button').html(offerButtonHtml);
						BXT.offerCode.displayErrorMessage(data);
					}
				},
				error: function(jqXHR, status, errorThrown) {
					//cannot make successful request to back end
					$('#offer-error span').text(errorThrown);
					$('#offer-code-form-button').html(offerButtonHtml);
				}
			};
			if(offerCode && offerCode.length !== 0) {
				//hide success and failure panels
				if(!$('#offer-error').hasClass('visuallyhidden')) {
					$('#offer-error').addClass('visuallyhidden');
				}
				if(!$('#offer-success').hasClass('visuallyhidden')) {
					$('#offer-success').addClass('visuallyhidden');
				}
				PBX.smallLoader.loader('#offer-code-form-button .offer-code-spinner');
				PBX.utils.loadData(BXT.offerCode.getBasePath(), options);
			}
		},
		removeOfferCode: function(e) {
			PBX.smallLoader.loader('#offer-total .desc');
			var options = {
				type: 'DELETE',
				success: function(data, status, jqXHR) {
					if(!data.currentOffer) {
						//remove offer is successful. Refresh the basket component
						PBX.asyncLoader.refreshElement('#component-basket');
					}
				},
				error: function(jqXHR, status, errorThrown) {
					//cannot make successful request to back end
					$('#offer-total .desc').text(errorThrown);
				}
			};
			PBX.utils.loadData(BXT.offerCode.getBasePath(), options);
		}
	};
	var that = process;
	PBX.utils.functionList.push({ test: '#offer-code-form-button', func: process.init, ctx: process });
	return process;
})(BXT, $, PBX);
BXT.basketCredits = (function (BXT, $, PBX) {
	var process = {
		init: function () {
			var selects = $('select[id^="item-credits-allowed-"]');
			selects.change(function (e) {
				that.doSelectChange(e);
				return false;
			});
			selects.each(function(i, val) {
				var select = $(val);
				select.data(that.prevValueDataField, select.val());
			});
		},
		doSelectChange: function (e) {
			var select = $(e.target);
			var value;
			if (select.find(':selected').length) {
				value = select.find(':selected').attr('value');
			} else {
				value = select.find('[selected="selected"]').attr('value');
			}
			var id = BXT.basketUtil.getUnitId(select.attr('id'));
			if($('#component-basket').length) {
				if (String(value) === 'true' && $('#upsell-' + id).length && !$('#upsell-' + id).hasClass('hidden')) {
					select.val('false');
					$('#unit-credit-form-' + id +' .trigger').text(select.find('[value="false"]').text());
					BXT.basketUtil.showConfirmationPopup(id, 'remove-upsell-by-credit',
						function () {
							that.sendCreditsChangeRequestNew(id, value);
						});
				} else {
					that.sendCreditsChangeRequestNew(id, value);
				}
			} else {
				that.sendCreditsChangeRequest(id, value);
			}

		},
		sendCreditsChangeRequest: function(id, val) {
			var unitCredit = $('#unit-credit-' + id);
			var select = $('#item-credits-allowed-' + id);
			unitCredit.addClass('loading');
			select.trigger('disable');
			var options = {
				data: '{\"creditsAllowed\":' + val + '}',
				type: 'PUT',
				success: function(data, status, jqXHR) {
					unitCredit.removeClass('loading');
					select.trigger('enable');
					BXT.basketUtil.updateBasketView(data);
				},
				error: function(jqXHR, status, errorThrown) {
					unitCredit.removeClass('loading');
					select.trigger('enable');
					// TO-DO add error message
				}
			};
			PBX.utils.loadData(BXT.basketUtil.getBasePath() + '&itemId=' + id, options);
		},
		sendCreditsChangeRequestNew: function(id, val) {
			var url = BXT.basketUtil.getBasePathNew();
			var unitCredit = $('#unit-credit-' + id);
			var select = $('#item-credits-allowed-' + id);
			unitCredit.addClass('loading');
			select.trigger('disable');
			var options = {
				data: '{\"creditsAllowed\":' + val + ', \"id\":' + id +'}',
				type: 'PUT',
				success: function(data, status, jqXHR) {
					PBX.asyncLoader.refreshElement('#component-basket');
				},
				error: function(jqXHR, status, errorThrown) {
					PBX.asyncLoader.refreshElement('#component-basket');
					// TO-DO add error message
				}
			};
			if(typeof unitCredit.data('line-item-ids') !== typeof undefined  && unitCredit.data('line-item-ids') !== null) {
				// Credit change is for summarized line items. Hence use the individual line item ids and construct
				// list of items.
				var idsArray = unitCredit.data('line-item-ids').split(',');
				var dataString = '';
				for(var i=0; i < idsArray.length; i++) {
					if(dataString !== null && dataString !== '') {
						dataString += ',';
					}
					dataString = dataString + '{\"creditsAllowed\":' + val + ', \"id\":' + idsArray[i] +'}';
				}
				dataString = '[' + dataString + ']';
				options.data = dataString;
				//change the url of the request
				url = BXT.basketCredits.getManyCreditsPath();
			}
			var upsell = $('#basketUnit-' + id + ' .upsell');
			if (!upsell.hasClass('hidden')){
				url += '&upsellId=' + upsell.data('upsell-id');
			}
			PBX.utils.loadData(url, options);
		},
		getManyCreditsPath: function() {
			var path = window.location.origin;
			var contextPath = $('#node-'+PBX.utils.getNodeId()).data('ajax-url');
			path = contextPath === '' || contextPath === null ? path : path + contextPath;
			return path + '/basketAjax/basket-ajax/many-credits?basketId=' + BXT.basketUtil.getBasketId() + '&nid=' +
				$('#basket-' + BXT.basketUtil.getBasketId()).data('node-id');
		}
	};
	var that = process;
	PBX.utils.functionList.push({ test: 'select[id^="item-credits-allowed-"]', func: process.init, ctx: process });
	return process;
})(BXT, $, PBX);

BXT.upsells = (function (BXT, $, PBX) {
	var process = {
		init: function () {
			$('a[id^="remove-upsell-icon-"], a[id^="remove-upsell-link-"]').off('click').on('click', function click(e) {
				that.doDeactivateUpsell(e);
				return false;
			});
			$('a[id^="upsell-promotion-button-link-"]').off('click').on('click', function (e) {
				that.doActivateUpsell($(this));
				return false;
			});
		},
		getBasePath: function() {
			var path = window.location.origin;
			var contextPath = $('#node-'+PBX.utils.getNodeId()).data('ajax-url');
			path = contextPath === '' || contextPath === null ? path : path + contextPath;
			return path + '/basketAjax/basket-ajax/upsell?basketId=' + BXT.basketUtil.getBasketId() + '&nid=' +
				$('#basket-' + BXT.basketUtil.getBasketId()).data('node-id');
		},
		doDeactivateUpsell: function (e) {
			var id = BXT.basketUtil.getUnitId(e.currentTarget.id);
			var options = {
				type: 'DELETE',
				data: '{\"upsellId\":' + id + '}',
				success: function(data, status, jqXHR) {
					BXT.basketUtil.asyncLoadBasketComponents();
				},
				error: function(jqXHR, status, errorThrown) {
					console.log(errorThrown);
					BXT.basketUtil.asyncLoadBasketComponents();
				}
			};
			PBX.utils.loadData(BXT.upsells.getBasePath(), options);
		},
		doActivateUpsell: function(e) {
			var id = e.data('id');
			var elementId = '#' + e.attr('id');
			var label = $(elementId + ' .btn-text').html();
			PBX.smallLoader.loader(elementId + ' .btn-text', $(this));
			var options = {
				type: 'PUT',
				data: '{"upsellId":' + id + '}',
				success: function(data, status, jqXHR) {
					BXT.basketUtil.asyncLoadBasketComponents();
				},
				error: function(jqXHR, status, errorThrown) {
					$(elementId + ' .btn-text').html(label);
				}
			};
			PBX.utils.loadData(BXT.upsells.getBasePath(), options);
		}
	};
	var that = process;
	PBX.utils.functionList.push({ test: '.basket-component', func: process.init, ctx: process });
	return process;
})(BXT, $, PBX);

BXT.basketDeliveryInfo = (function (BXT, $, PBX) {
	var process = {
		init: function () {
			$('#estimated-delivery-info-icon').on('click', function (e) {
				that.showModal();
			});
		},
		showModal: function () {
			var icon = $('#estimated-delivery-info-icon');
			var modal = $('#estimated-delivery-info-modal');
			var offset = icon.offset();
			var left = offset.left;
			if (!PBX.utils.isPalm) {
				var outerWidth = modal.outerWidth();
				var maxWidth = $(window).width();
				if (left + outerWidth + 20 > maxWidth) {
					left = maxWidth - outerWidth - 20;
				}
			} else {
				left = 0;
			}
			modal.css({
				top: offset.top + icon.height() + 10,
				left: left
			}).modal('show');
		}
	};
	var that = process;
	PBX.utils.functionList.push({ test: '#estimated-delivery-info-modal', func: process.init, ctx: process });
	return process;
})(BXT, $, PBX);

BXT.modifyProducts = (function (BXT, $, PBX) {
	var process = {
		init: function () {
			$('a[id^="modify-product-link-"], a[id^="modify-product-icon-"]').off('click').on('click', function click(e) {
				var $el = $(this);
				var $upsell = $('#upsell-' + $el.data('id'));

				if ($upsell.length && !$upsell.hasClass('hidden')) {
					that.showPopup('#modification-with-upsell');
				} else {
					that.doModifyProduct($(this));
				}
				return false;
			});
		},
		showPopup: function(template){
			var $content;
			if(!template) {
				return;
			}
			$content = $($(template).html());
			PBX.infoPopup.showPopup($content.filter(template +'-header').html(),$content.filter(template +'-text').html());
		},
		getBasePath: function() {
			var path = window.location.origin;
			var contextPath = $('#node-'+PBX.utils.getNodeId()).data('ajax-url');
			path = contextPath === '' || contextPath === null ? path : path + contextPath;
			return path + '/basketAjax/basket-ajax/get-modify-product-url?nid=' +
				$('#basket-' + BXT.basketUtil.getBasketId()).data('node-id');
		},
		doModifyProduct: function ($el) {
			var id = $el.data('id');
			var creationId = $el.data('creation-id');
			var itemType = $el.data('item-type');
			var productId = $el.data('basket-product-id');
			var styleId = $el.data('style-id');
			var elSelector = '#modify-product-link-' + id + ', #modify-product-icon-' + id;
			var linkHTML = $('#modify-product-link-' + id).html();
			PBX.smallLoader.loader(elSelector);
			var options = {
				type: 'POST',
				data: '{\"id\":' + id + ', \"creationId\":' + creationId + ', \"itemType\":\"' + itemType +
					'\", \"productId\":' + productId + ', \"styleId\":' + styleId +'}',
				success: function(data, status, jqXHR) {
					$('#modify-product-icon-' + id).html('');
					$('#modify-product-link-' + id).html(linkHTML);
					window.location.href = data.urlWithParams;
				},
				error: function(jqXHR, status, errorThrown) {
					console.log(errorThrown);
					PBX.asyncLoader.refreshElement('#component-basket');
				}
			};
			PBX.utils.loadData(BXT.modifyProducts.getBasePath(), options);
		}
	};
	var that = process;
	PBX.utils.functionList.push({ test: '.basket-component', func: process.init, ctx: process });
	return process;
})(BXT, $, PBX);

BXT.deliveryViewDetails = (function (BXT, $, PBX) {
	var process = {
		deliveryDetailsPopupId: '#delivery-detail-view-modal',
		init: function () {
			$('#delivery-details-view-link').off('click').on('click', function click(e) {
				that.loadDetailView(e);
				return false;
			});
		},
		loadDetailView: function (e) {
			PBX.modalLoader.show();
			PBX.asyncLoader.refreshElement(that.deliveryDetailsPopupId, function(){
				PBX.modalLoader.hide();
				$(that.deliveryDetailsPopupId).modal('show');
			});
		}
	};
	var that = process;
	PBX.utils.functionList.push({ test: '#delivery-details-view-link', func: process.init, ctx: process });
	return process;
})(BXT, $, PBX);
