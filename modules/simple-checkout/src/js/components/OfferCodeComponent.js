'use strict';

import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import AppAction from '../actions/AppAction';

export default class OfferCodeComponent extends React.Component {

	constructor(props) {
		super(props);
		this.state = {initial: true};
		this.initialClickHandler = this.initialClickHandler.bind(this);
		this.offerCodeInputSubmitHandler = this.offerCodeInputSubmitHandler.bind(this);
		this.changeClickHandler = this.changeClickHandler.bind(this);
	}

	initialClickHandler(e) {
		this.setState({initial: false});
	}

	changeClickHandler(e) {
		AppAction.removeOfferCode();
	}

	offerCodeInputSubmitHandler(e) {
		if(e.key == 'Enter'){
			AppAction.setOfferCode(e.target.value);
		}
	}

	render() {
		return (
			<div class="block">
				<ReactCSSTransitionGroup transitionName="example" transitionAppear={true} transitionAppearTimeout={500} transitionEnterTimeout={500} transitionLeave={false}>
					{(() => {
						if (this.props.total.offer) {
							return <div key="1" class="row">
										<div class="col-sm-6">
											{this.props.total.offername}
										</div>
										<div class="col-sm-5 col-sm-offset-1 text-right delivery-price">
											- £ {this.props.total.offer} 	&nbsp;
											<a href="#"  onClick={this.changeClickHandler}>Change</a>
										</div>
									</div>

						} else {
							if (this.state.initial) {
								return <a key="2" href="#" onClick={this.initialClickHandler}>Do you have an offer code ?</a>
							} else {
								return <input key="3" onKeyPress={this.offerCodeInputSubmitHandler} placeholder="Enter Code" class="form-control" type="text" />
							}
						}
					})()}
				</ReactCSSTransitionGroup>
			</div>
		);
	}
}
