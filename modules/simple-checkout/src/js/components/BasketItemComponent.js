'use strict';

import React from 'react';
import AppAction from '../actions/AppAction';

export default class BasketItemComponent extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			quantity: props.item.quantity
		};
		this.inputChangeHandler = this.inputChangeHandler.bind(this);
		this.plusButtonHandler = this.plusButtonHandler.bind(this);
		this.minusButtonHandler = this.minusButtonHandler.bind(this);
	}

	updateQuantity(value) {
		if (value > 0) {
			this.setState({quantity: value});
			AppAction.updateItemQuantity(this.props.item.id, value);
		} else {
			this.setState({quantity: this.state.quantity});
			AppAction.removeItem(this.props.item.id);
		}
	}

	inputChangeHandler(e) {
		this.updateQuantity(e.target.value);
	}

	plusButtonHandler() {
		this.updateQuantity(1 + Number(this.refs.input.value));
	}

	minusButtonHandler() {
		this.updateQuantity(this.refs.input.value - 1);
	}

	render() {
		let item = this.props.item;
		return (
			<div class="block row">
				<div class="col-xs-3">
					<div class="row">
						<div class="col-xs-12 text-center">
							<img class="img-responsive" src={item.thumbnailUrl} alt="" />
						</div>
						<div class="col-xs-12 text-center">
							<a href="#">edit</a>
						</div>
					</div>
				</div>
				<div class="col-sm-9">
					<div class="row">
						<div class="col-sm-12">
							<div class="row">
								<div class="item-name col-sm-8">{item.title}</div>
								{item.quantity > 1 ? <div class="unit-price col-sm-3 text-right">{item.unitPrice}</div> : null}
								<div class="item-description col-sm-12">{item.subtitle}</div>
							</div>
							<div class="controls row">
								<button class="col-xs-1 btn" onClick={this.minusButtonHandler}>-</button>
								<input ref="input" class="col-xs-1" type="text" onChange={this.inputChangeHandler} value={this.state.quantity} />
								<button class="col-xs-1 btn" onClick={this.plusButtonHandler}>+</button>
								<div class="col-xs-8 text-right item-price">{item.itemPrice}</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

