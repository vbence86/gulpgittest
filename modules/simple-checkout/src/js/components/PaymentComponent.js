'use strict';

import React from 'react';
import ActionButtonComponent from './ActionButtonComponent';
import MemberComponent from './MemberComponent';
import AppAction from '../actions/AppAction';
import OrderTotalComponent from './OrderTotalComponent';
import PurchaseDetailsComponent from './PurchaseDetailsComponent';
import CreditCardPaymentFormComponent from './CreditCardPaymentFormComponent';

export default class PaymentComponent extends React.Component {
	buttonClickHandler() {
		AppAction.submit();
	}

	render() {
        return (
			<div>
                <section class="row">
                    <div class="col-xs-12 col-sm-10 col-sm-offset-1">
                        <CreditCardPaymentFormComponent />
                    </div>
                </section>
                <footer>
                    <div class="row">
	                    <OrderTotalComponent basket={this.props.basket}/>
                        <ActionButtonComponent callback={this.buttonClickHandler.bind(this)} label="Pay Now" />
                    </div>
                </footer>
			</div>
		);
	}
}
