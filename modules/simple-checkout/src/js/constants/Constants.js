'use strict';

export default {
	CHANGE_EVENT: Symbol(),

	BASKET_STATE: Symbol(),
	PAYMENT_STATE: Symbol(),
	ORDER_PROCESSING_STATE: Symbol(),
	ORDER_COMPLETED_STATE: Symbol(),

	SUBMIT: Symbol(),
	BACK: Symbol(),
    SIGN_IN: Symbol(),
    SIGN_OUT: Symbol(),
	ITEM_UPDATE_QUANTITY: Symbol(),
	ITEM_REMOVE: Symbol(),
	ITEM_CANCEL_REMOVING: Symbol(),
	ITEM_CONFIRM_REMOVING: Symbol(),
	SET_OFFER_CODE: Symbol(),
	REMOVE_OFFER_CODE: Symbol(),
	UPDATE_DELIVERY_METHOD: Symbol(),
}
