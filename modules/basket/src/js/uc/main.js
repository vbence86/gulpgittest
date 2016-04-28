var uc = uc || {};

function getParamValue (param) {
    return decodeURI(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURI(param).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
}

/**
 * Helper function to populate the global config object
 * @param  {Object} glb [description]
 * @return {[type]}     [description]
 */
uc.populateGLB = function(glb) {
    $.each(['session_code','member_id','basket_id','basket_subtotal','delivery_address_id','delivery_product_id', 'payment_id'],function(ind,val) {    
        glb.member[val] = $('#babel_member').data(val);
    });
    $.each(['in_store_delivery_product_id','in_store_enabled'],function(ind,key) {
        var val = $('#babel_member').data(key);
        if (val === 'true' || val === 'false') {
            val = (val ==='true')? true : false;
        }
        glb.delivery.in_store[key.replace(/in_store_/,'')] = $('#babel_member').data(key);
    });
    return glb;
};

/**
 * Guess the device type
 * This is very primitive, and taken from the main Photobox.co.uk code.
 * 
 * @return {[type]} [description]
 */
uc.deviceType = function() {
    //to know the device
    var userAgent = navigator.userAgent.toLowerCase();
    var device = userAgent.search('mobile');
    var winW = 0;

    //To know the width between tablet/mobile
    if (document.body && document.body.offsetWidth) {
        winW = document.body.offsetWidth;
    }
    if (document.compatMode=='CSS1Compat' && document.documentElement && document.documentElement.offsetWidth) {
        winW = document.documentElement.offsetWidth;
    }
    if (window.innerWidth) {
        winW = window.innerWidth;
    }

    if (device == -1) {
        device = 'desktop';
    }
    else if((userAgent.search('ipad') > -1) || (winW > 480)) {
        device = 'tablet';
    }
    else{
        device = 'mobile';
    }

    return device;
};

uc.instance = false;

$.webshims.setOptions('waitReady', false);

/**
 * Main startup function
 */
$(function() {
	uc.instance = new uc.Checkout().setConfig(uc.populateGLB({
        debug: 1, // Set to 1 to display debug messages to the console
        babel_endpoint: servicesURL,
        member: {
            session_code: '',
            member_id: 0,
            basket_id: 0,
            session_id:    0,
            channel_id:    0,
            delivery_product_id: 0,
            delivery_address_id: 0,
            basket_subtotal: 0.00,
            payment_id: 0
        },
        delivery: {
            in_store: {
                enabled: false,
                delivery_product_id: 0
            }
        }
    }));

    uc.instance.initPage($('#uc').attr('class').replace(/[\n,\r]/g, ''));
});


/**
 * Safe debug logging
 * @return {[type]} [description]
 */
function xlog() {
    if(typeof console !== 'undefined' && console.log && console.log.apply) {
        console.log.apply(console,arguments);
    }
}
