'use strict';

import React from 'react';
import BasketItemComponent from './BasketItemComponent';

export default class BasketItemsListComponent extends React.Component {

	render() {
		return (
			<div>
				{this.props.basketItems.map(item => {
					return <BasketItemComponent item={item} key={item.id} />
				})}
			</div>
		);
	}
}
