import React from 'react';
import adyenEncrypt from 'script!adyen-cse-js/js/adyen.encrypt.min';
import adyenCardType from 'script!adyen-cse-js/js/addOns/adyen.cardtype.min';
import adyenCSS from 'adyen-cse-js/js/addOns/adyen.cardtype.css';

export default class CreditCardPaymentComponent extends React.Component{

    componentDidMount() {
        if (window.adyen) {
            let form = document.getElementById('adyen-encrypted-form');
            let key = "your key as retrieved from the Adyen Customer Area Web Service User page"
            let options = {};
            let encryptedForm =  window.adyen.encrypt.createEncryptedForm(form, key, options);
            encryptedForm.addCardTypeDetection(document.getElementById('cardType'));
        }
    }

    render() {
      return (
           <form method="POST" action="#handler" id="adyen-encrypted-form">
               <div class="payment-card-details-container">
                   <div>
                       Pay By Credit Card
                   </div>
                   <div class="form-group">
                       <div class="input-group">
                           <span class="input-group-addon">
                               <span class="glyphicon glyphicon-credit-card"></span>
                           </span>
                           <input type="text" class="form-control" placeholder="Card Number" size="20" autoComplete="off" data-encrypted-name="number"/>
                           <span class="input-group-addon">
                               <div id="cardType"></div>
                           </span>
                       </div>
                   </div>
                   <div class="form-group">
                       <div class="input-group">
                           <span class="input-group-addon">
                               <span class="glyphicon glyphicon-user"></span>
                           </span>
                           <input type="text" class="form-control" placeholder="Holder Name" size="20" autoComplete="off" data-encrypted-name="holderName"/>
                       </div>
                   </div>
                   <div className="row">
                       <div class="form-group col-sm-6">
                           <div class="input-group">
                               <span class="input-group-addon">
                                   <span class="glyphicon glyphicon-calendar"></span>
                               </span>
                               <input class="form-control" type="text" placeholder="MM" size="2" maxLength="2" autoComplete="off" data-encrypted-name="expiryMonth"/>
                               <span class="input-group-addon">/</span>
                               <input class="form-control" type="text" placeholder="YYYY" size="4" maxLength="4" autoComplete="off" data-encrypted-name="expiryYear"/>
                           </div>
                       </div>
                       <div class="form-group col-sm-6">
                           <div class="input-group">
                               <span class="input-group-addon">
                                   <span class="glyphicon glyphicon-lock"></span>
                               </span>
                               <input class="form-control" type="text" placeholder="CVC" size="4" maxLength="4" autoComplete="off" data-encrypted-name="cvc"/>
                           </div>
                       </div>
                   </div>
               </div>
               <input type="hidden" value="generate-this-server-side" data-encrypted-name="generationtime" />
               <input type="hidden" value="Pay" />
           </form>
       )
    }
}
