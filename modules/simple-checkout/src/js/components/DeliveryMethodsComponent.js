'use strict';

import React from 'react';
import AppAction from '../actions/AppAction';

export default class DeliveryMethodsComponent extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selected: this.props.selected
		}
		this.inputChangeHandler = this.inputChangeHandler.bind(this);
	}

	inputChangeHandler(e) {
		let id = e.target.value;
		this.setState({
			selected: id
		});
		AppAction.updateDeliveryMethod(id);
	}

	render() {
		return (
			<div class="block">
                <div class="row payment-user-details">
                    <div className="col-xs-4">
                        <img src="../src/imgs/gift.png" alt=""/>
                    </div>
                    <div className="col-xs-8 payment-user-name">
                        {this.props.member ? `${this.props.member.first_name} ${this.props.member.last_name}` : ''}
                        <div>
                            37 Ampere House , W3 7NY
                        </div>
                    </div>
                </div>
				{this.props.deliveryMethods.map(item => {
					return <div key={item.id} class="radio row">
								<label class="col-xs-8 col-xs-offset-1">
									<input type="radio" name="delivery" value={item.id} onChange={this.inputChangeHandler} checked={this.state.selected == item.id ? true : false} />
									{item.name}
									<a href="#"> Estimated Arrival 1th May</a>
								</label>
								<div class="col-xs-2 text-right delivery-price">
									{item.price}
								</div>
							</div>
				})}
			</div>

		);
	}
}
