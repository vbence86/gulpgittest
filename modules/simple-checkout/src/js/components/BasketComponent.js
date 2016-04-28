'use strict';

import React from 'react';
import AppAction from '../actions/AppAction';
import ActionButtonComponent from './ActionButtonComponent';
import MemberComponent from './MemberComponent';
import BasketItemsListComponent from './BasketItemsListComponent';
import OrderTotalComponent from './OrderTotalComponent';
import OfferCodeComponent from './OfferCodeComponent';
import DeliveryMethodsComponent from './DeliveryMethodsComponent';
import RemoveItemConfirmationPopupComponent from './RemoveItemConfirmationPopupComponent';

export default class BasketComponent extends React.Component {

	constructor(props) {
		super(props);
		this.submitClickHandler = this.submitClickHandler.bind(this);

	}

	submitClickHandler() {
		AppAction.submit();
	}

	render() {
		let basketItems = this.props.basket.items;
		return (
			<div>
				{(() => {
					if (basketItems && basketItems.length) {
						return (
							<div>
								<section class="row">
									<div class="col-xs-12 col-sm-10 col-sm-offset-1">
										<BasketItemsListComponent basketItems={basketItems} />
									</div>
								</section>
								<footer>
									<div class="row">
										<OrderTotalComponent basket={this.props.basket}/>
										<ActionButtonComponent callback={this.submitClickHandler}
										                       label="Choose Payment"/>
									</div>
								</footer>
							</div>);
					} else {
						return (
                            <div class="row">
                                <div class="col-xs-12 col-sm-10 col-sm-offset-1 text-center">
                                    <h2>Your basket is empty</h2>
                                </div>
                            </div>
						);
					}
				})()}
				<RemoveItemConfirmationPopupComponent itemToRemove={this.props.itemToRemove} />
			</div>
		);
	}
}
