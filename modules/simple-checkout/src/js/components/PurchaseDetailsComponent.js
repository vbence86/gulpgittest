'use strict';

import React from 'react';

export default class PurchaseDetailsComponent extends React.Component {
    render() {
        let basketItems = this.props.basket.value[2].h.value;
        let basketTotal = this.props.basket.value[1].h.value.h;
        let deliveryMethods = this.props.basket.value[5].h.value;
        let deliveryMethod = deliveryMethods.find(x => x.id == basketTotal.delivery_product_id);
        return (
            <div>
                {basketItems.map( item => {
                    return  (<div class="row" key={item.id}>
                        <div className="col-xs-3 item-quantity text-center">
                            {item.props.quantity} x
                        </div>
                        <div className="col-xs-6">
                            {item.props.product_name}
                            <div class="item-description">{item.props.creation_name}</div>
                        </div>
                        <div className="col-xs-3">
                            £ {item.props.line_price_inc}
                        </div>
                    </div>)
                })
                }
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
                <div class="row">
                    <div className="col-xs-3">
                    </div>
                    <div className="col-xs-6">
                        {deliveryMethod.name} - Estimated Arrival 5th May
                    </div>
                    <div className="col-xs-3">
                        £ {deliveryMethod.price}
                    </div>
                </div>
            </div>
        )
    }
}
