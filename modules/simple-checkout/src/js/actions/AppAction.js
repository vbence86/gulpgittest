'use strict';

import Dispatcher from '../dispatcher/AppDispatcher';
import Constants from '../constants/Constants';

class AppAction {
	submit() {
		Dispatcher.dispatch({
			actionType: Constants.SUBMIT
		});
	}

	back() {
		Dispatcher.dispatch({
			actionType: Constants.BACK
		});
	}

    signIn() {
        Dispatcher.dispatch({
            actionType: Constants.SIGN_IN
        });
    }

    signOut() {
        Dispatcher.dispatch({
            actionType: Constants.SIGN_OUT
        });
    }

	updateItemQuantity(id, quantity){
		Dispatcher.dispatch({
			actionType: Constants.ITEM_UPDATE_QUANTITY,
			id: id,
			quantity: quantity
		});
	}

	removeItem(id){
		Dispatcher.dispatch({
			actionType: Constants.ITEM_REMOVE,
			id: id
		});
	}

	cancelRemovingItem() {
		Dispatcher.dispatch({
			actionType: Constants.ITEM_CANCEL_REMOVING
		});
	}

	confirmRemovingItem() {
		Dispatcher.dispatch({
			actionType: Constants.ITEM_CONFIRM_REMOVING
		});
	}

	setOfferCode(code){
		Dispatcher.dispatch({
			actionType: Constants.SET_OFFER_CODE,
			code: code
		});
	}

	removeOfferCode(){
		Dispatcher.dispatch({
			actionType: Constants.REMOVE_OFFER_CODE
		});
	}

	updateDeliveryMethod(id){
		Dispatcher.dispatch({
			actionType: Constants.UPDATE_DELIVERY_METHOD,
			id: id
		});
	}
}

export default new AppAction();
