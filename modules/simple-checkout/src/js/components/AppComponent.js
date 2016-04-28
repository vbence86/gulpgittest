'use strict';

import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import AppStore from '../store/AppStore';
import Constants from '../constants/Constants';
import BasketComponent from './BasketComponent';
import PaymentComponent from './PaymentComponent';
import OrderProcessingComponent from './OrderProcessingComponent';
import OrderCompletedComponent from './OrderCompletedComponent';
import TitleComponent from './TitleComponent';

export default class AppComponent extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.getState();
		this.callback = this.changeHandler.bind(this);
	}

	getState() {
		return {
			member: AppStore.member,
			basket:	AppStore.basket,
			itemToRemove:	AppStore.itemToRemove,
			state: AppStore.state
		};
	}

	componentDidMount() {
		AppStore.addChangeListener(this.callback);
	}

	componentWillUnmount() {
		AppStore.removeChangeListener(this.callback);
	}

	render() {
		return(
			<div class="row">
				<div class="container-block col-md-6 col-md-offset-3 col-xs-10 col-xs-offset-1">
					<header>
						<TitleComponent state={this.state.state} />
					</header>
					<ReactCSSTransitionGroup transitionName="example" transitionAppear={true} transitionAppearTimeout={500} transitionEnterTimeout={500} transitionLeave={false}>
                        {(() => {
							switch(this.state.state) {
								case Constants.BASKET_STATE:
									return <BasketComponent key="1" member={this.state.member} basket={this.state.basket} itemToRemove={this.state.itemToRemove}/>;
								case Constants.PAYMENT_STATE:
									return <PaymentComponent key="2" member={this.state.member} basket={this.state.basket} />;
								case Constants.ORDER_PROCESSING_STATE:
									return <OrderProcessingComponent key="3" />;
                                case Constants.ORDER_COMPLETED_STATE:
                                    return <OrderCompletedComponent key="4" member={this.state.member} basket={this.state.basket} />
							};
						})()}
					</ReactCSSTransitionGroup>
				</div>
			</div>
		);
	}

	changeHandler() {
		this.setState(this.getState());
	}
}
