'use strict';

import React from 'react';
import Constants from '../constants/Constants';
import AppAction from '../actions/AppAction';

export default class TitleComponent extends React.Component {

	constructor(props) {
		super(props);
		this.backIconClickHandler = this.backIconClickHandler.bind(this);
	}

	backIconClickHandler() {
		AppAction.back();
	}
    renderBackHandler(){
        return this.props.state === Constants.PAYMENT_STATE ? <span class="glyphicon glyphicon-chevron-left back-icon" onClick={this.backIconClickHandler}></span> : "";
    }
	render() {
		return (
			<div class="title row">
                {this.renderBackHandler()}
                { (() => {
                    switch (this.props.state) {
                        case Constants.BASKET_STATE:
                            return 'Basket';
                        case Constants.PAYMENT_STATE:
                            return 'Payment Options';
                        case Constants.ORDER_PROCESSING_STATE:
                            return 'Placing Order...';
                        case Constants.ORDER_COMPLETED_STATE:
                            return 'Order Completed';
                    }
                })()
                }
			</div>
		);
	}
}
