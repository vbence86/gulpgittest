'use strict';

import React from 'react';
import AppAction from '../actions/AppAction';

export default class RemoveItemConfirmationPopupComponent extends React.Component {

	constructor(props) {
		super(props);
		this.cancelRemovingButtonClickHandler = this.cancelRemovingButtonClickHandler.bind(this);
		this.confirmRemovingButtonClickHandler = this.confirmRemovingButtonClickHandler.bind(this);
	}

	cancelRemovingButtonClickHandler() {
		AppAction.cancelRemovingItem();
	}

	confirmRemovingButtonClickHandler() {
		AppAction.confirmRemovingItem();
	}

	render() {
		if (this.props.itemToRemove) {
			return (
				<div class="static-modal" tabIndex="-1" role="dialog">
					<div class="modal-dialog" role="document">
						<div class="modal-content">
							<div class="modal-header">
								<h4 class="modal-title">Remove this item from your basket</h4>
							</div>
							<div class="modal-body">
								Are you sure you want to remove the selected item(s)?
							</div>
							<div class="modal-footer">
								<button type="button" class="btn btn-default"
								        onClick={this.cancelRemovingButtonClickHandler}>Cancel
								</button>
								<button type="button" class="btn btn-primary"
								        onClick={this.confirmRemovingButtonClickHandler}>Remove
								</button>
							</div>
						</div>
					</div>
				</div>
			);
		} else {
			return null;
		}
	}
}