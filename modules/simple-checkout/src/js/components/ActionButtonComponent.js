'use strict';

import React from 'react';

export default class ActionButtonComponent extends React.Component {

	render() {
		return (
            <div class="col-sm-10 col-sm-offset-1 your-details-container">
                <button class="btn btn-default your-details-button" onClick={this.props.callback}>{this.props.label}</button>
            </div>
		);
	}
}
