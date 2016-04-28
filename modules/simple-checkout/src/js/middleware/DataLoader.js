'use strict';

class DataLoader {
	updateItemQuantity(basket, id, quantity) {
		return basket;
	}

	removeItem (basket, id) {
		return basket;
	}

	updateBasketTotal(basket) {
		return basket;
	}

	setOfferCode(basket, code) {
		this.updateBasketTotal(basket);
	}

	removeOfferCode(basket) {
		this.updateBasketTotal(basket);
	}

	updateDeliveryMethod(basket, id) {
		this.updateBasketTotal(basket);
	}

	getTotalFromBasket (basket) {
		return basket.value[1].h.value.h;
	}

	getItemsFromBasket(basket) {
		return basket.value[2].h.value;
	}

	normalizePrice(price) {
		return Math.round(price * 100) / 100;
	}

	getMember() {
		return {};
	}

	getBasket() {
		return {};
	}
}

export default new DataLoader();
