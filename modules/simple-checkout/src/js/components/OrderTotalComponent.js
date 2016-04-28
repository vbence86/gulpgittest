'use strict';

import React from 'react';

export default class OrderTotalComponent extends React.Component {

	render() {
		return (
			<div class="col-sm-10 col-sm-offset-1">
				<div class="row">
					<div class="col-sm-5 col-sm-offset-1 text-center order-total">
						Order Total:
					</div>
					<div class="col-sm-5 col-sm-offset-1 text-center order-total-value">
						{this.props.basket.total}
					</div>
				</div>
			</div>
		);
	}
}
