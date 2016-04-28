'use strict';

import React from 'react';
import Constants from '../constants/Constants';

export default class OrderProcessingComponent extends React.Component {

    render() {
        return (
            <div>
                <h3 class="text-center">Placing Order ...</h3>
                <img class="spin-image img-responsive center-block" src="../src/imgs/star.png" alt=""/>
                <div class="row">
                    <img class="col-sm-offset-3 col-sm-6 img-responsive" src="../src/imgs/logo.png" alt=""/>
                </div>
            </div>
        );
    }
}
