'use strict';

import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import AppAction from '../actions/AppAction';

export default class MemberComponent extends React.Component {
    signIn() {
        AppAction.signIn();
    }
    signOut() {
        AppAction.signOut();
    }
   renderSignIn() {
       return (
               <div class="block">
                   <div class="row">
                       <div class="col-xs-6 text-left">
                           Have you used <br/> Photobox before?
                       </div>
                       <div class="col-xs-6 text-right">
                           <button class="btn btn-default sign-in" onClick={this.signIn} >SIGN IN</button>
                       </div>
                   </div>
               </div>
       )
   }

    renderUserDetails() {
        return (
            <ReactCSSTransitionGroup transitionName="example" transitionAppear={true} transitionAppearTimeout={500} transitionEnterTimeout={500} transitionLeave={false}>
                <div class="block">
                    <div class="row">
                        <div class="col-xs-2 text-left">
                            <img src="../src/imgs/user.png" alt=""/>
                        </div>
                        <div class="col-xs-6 text-left">
                            <div>{this.props.member.first_name} {this.props.member.last_name}</div>
                            <div>{this.props.member.email}</div>
                        </div>
                        <div className="col-xs-4 text-center">
                            <button class="btn btn-default" onClick={this.signOut}>SIGN OUT</button>
                        </div>
                    </div>
                </div>
            </ReactCSSTransitionGroup>
            )
    }

	render() {
		return (
			<div class="row">
				<div class="col-xs-12 col-sm-10 col-sm-offset-1">
                    {this.props.member ? this.renderUserDetails() : this.renderSignIn()}
				</div>
			</div>
		);
	}
}
