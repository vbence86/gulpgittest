'use strict';

import React from 'react';
import MemberComponent from './MemberComponent';
import PurchaseDetailsComponent from './PurchaseDetailsComponent';
import OrderTotalComponent from './OrderTotalComponent'

export default class OrderProcessingComponent extends React.Component {
    showDiscount () {
        let offerName = this.props.basket.value[1].h.value.h.offername;
        let offerValue = this.props.basket.value[1].h.value.h.offer;
        if(!!offerName){
            return (
                <div class="row">
                    <div className="col-xs-3 text-center">
                        <img src="../src/imgs/offer_sign.png" alt=""/>
                    </div>
                    <div className="col-xs-6">
                        {offerName}
                    </div>
                    <div className="col-xs-3">
                        {offerValue}
                    </div>
                </div>
            )
        } else {
            return '';
        }
    }
    render() {
        let basket = this.props.basket;
        let basketTotal = this.props.basket.value[1].h.value.h;
        return (
            <div>
                <MemberComponent member={this.props.member}/>
                <section class="row">
                    <div class="col-xs-12 col-sm-10 col-sm-offset-1 text-center thanks-message">
                        Your order is complete! <br/>
                        Thank you for using
                    </div>
                    <div class="col-xs-8 col-xs-offset-2 text-center">
                        <img class="col-xs-offset-3 col-xs-6 img-responsive" src="../src/imgs/logo.png" alt=""/>
                    </div>
                    <div class="col-xs-12 col-sm-10 col-sm-offset-1">
                        <div class="block">
                            <PurchaseDetailsComponent basket={basket} member={this.props.member} />
                            {this.showDiscount()}
                            <div class="row">
                                <div className="col-xs-3">
                                </div>
                                <div className="col-xs-6">
                                    Order Total
                                </div>
                                <div className="col-xs-3">
                                    £ {basketTotal.total}
                                </div>
                            </div>
                            <div class="row">
                                <div className="col-xs-3">
                                </div>
                                <div className="col-xs-6">
                                    Need help ?
                                </div>
                            </div>
                        </div>
                        <div class="block text-center">
                            Order Number:
                        </div>
                        <div class="block">
                            See your orders
                        </div>
                        <div class="upsell text-center">
                            <img src="../src/imgs/upsell.png" class="img-responsive" alt=""/>
                        </div>
                        <div class="block">
                            Add something else
                        </div>
                    </div>
                </section>
                <footer>
                    <div class="row">

                    </div>
                </footer>

            </div>
        );
    }
}
