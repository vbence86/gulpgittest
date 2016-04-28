'use strict';

import EventEmitter from 'events';
import Constants from '../constants/Constants'
import AppDispatcher from '../dispatcher/AppDispatcher';
import DataLoader from '../middleware/DataLoader';

let SCData = window.SCData || {};

let _state = Constants.BASKET_STATE;
//let _member = DataLoader.getMember();
let _member = null;
let _basket = SCData.basket || {};
let _itemToRemove = '';

class AppStore extends EventEmitter {

	constructor() {
		super();
	}

	get member() {
		return _member;
	}

	get basket() {
		return _basket;
	}

	get state() {
		return _state;
	}

	get itemToRemove() {
		return _itemToRemove;
	}

	emitChange() {
		this.emit(Constants.CHANGE_EVENT);
	}

	addChangeListener(callback) {
		this.on(Constants.CHANGE_EVENT, callback);
	}

	removeChangeListener(callback) {
		this.removeListener(Constants.CHANGE_EVENT, callback);
	}

	processSubmit() {
        switch(_state) {
			case Constants.BASKET_STATE:
				_state = Constants.PAYMENT_STATE;
				break;
			case Constants.PAYMENT_STATE:
				_state = Constants.ORDER_PROCESSING_STATE;
                setTimeout(() => {
                    _state = Constants.ORDER_COMPLETED_STATE;
                    this.emitChange();
                }, 2000);
				break;
			default:
		}
	}

	processBack() {
		switch(_state) {
			case Constants.PAYMENT_STATE:
				_state = Constants.BASKET_STATE;
				this.emitChange();
				break;
			default:
		}
	}

	actionHandler(action) {
		switch(action.actionType) {
			case Constants.SUBMIT:
				this.processSubmit();
				this.emitChange();
				break;
			case Constants.BACK:
				this.processBack();
				this.emitChange();
				break;
            case Constants.SIGN_IN:
                _member = DataLoader.getMember();
                this.emitChange();
                break;
            case Constants.SIGN_OUT:
                _member = null;
                this.emitChange();
                break;
			case Constants.ITEM_UPDATE_QUANTITY:
				DataLoader.updateItemQuantity(_basket, action.id, action.quantity);
				this.emitChange();
				break;
			case Constants.ITEM_REMOVE:
				_itemToRemove = action.id;
				this.emitChange();
				break;
			case Constants.ITEM_CANCEL_REMOVING:
				_itemToRemove = '';
				this.emitChange();
				break;
			case Constants.ITEM_CONFIRM_REMOVING:
				DataLoader.removeItem(_basket, _itemToRemove);
				_itemToRemove = '';
				this.emitChange();
				break;
			case Constants.SET_OFFER_CODE:
				DataLoader.setOfferCode(_basket, action.code);
				this.emitChange();
				break;
			case Constants.REMOVE_OFFER_CODE:
				DataLoader.removeOfferCode(_basket);
				this.emitChange();
				break;
			case Constants.UPDATE_DELIVERY_METHOD:
				DataLoader.updateDeliveryMethod(_basket, action.id);
				this.emitChange();
				break;
			default:
		}
	}
}

AppStore.dispatchToken = null;

let appStore = new AppStore();

AppDispatcher.register(
	action => appStore.actionHandler(action)
);

export default appStore;
