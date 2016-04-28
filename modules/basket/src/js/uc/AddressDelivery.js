var uc = uc || {};
uc.AddressDelivery = (function($) {

    function AddressDelivery(__PARENT) {
        this.__PARENT = __PARENT;
        this.preferences = this.getPreferences();
        return this;
    }

    var AddressProto = AddressDelivery.prototype = new uc.MicroEvent();

    /**
     * Get preferences
     * @return {[type]} [description]
     */
    AddressProto.getPreferences = function() {
        if (typeof this.preferences == 'undefined') {
            // populate with the address if this is a store, otherwise empty it
            try {
                this.preferences = $.parseJSON($('#babel_member').data('prefs').replace(/\\u([\d\w]{4})/gi, function (match, grp) { return String.fromCharCode(parseInt(grp, 16)); } )) || {};
            } catch(e) {
                this.preferences = {};
            } 
            this.preferences = $.extend(true, (function() {
                var ret = {stores: {} };
				if (!window.brand)
				{
					var brand = 'default';
				}
                ret.stores[brand] = {};
                ret.stores[brand].selected = { store_id: false, type: false };
                return ret;
            }()), this.preferences);
        }
        return this.preferences;
    };

    /**
     * Set preferences
     * @return {[type]} [description]
     */
    AddressProto.setPreferences = function() {
        var addresses = [];
        $('.store-routing-details').map(function(i) {
            if ($(this).data('store_id')) {
                var row = { store_id: $(this).data('store_id'), type: $(this).data('type') };
                addresses.push(row);
            }
        });

        var selected = $('.store.address.selectable .selected').parent().find('.store-routing-details') || false;
        var prefsHash = $.extend(true, this.preferences, (function() {
            var ret = { stores: { } };
            ret.stores[brand] = { selected: {}, stores: {} };
            ret.stores[brand || 'default'].selected = { store_id: selected.data('store_id') || false, type: selected.data('type') || false };
            ret.stores[brand || 'default'].stores = addresses;
            return ret;
        }()));
        this.preferences = prefsHash;

        return this;
    };

    /**
     * Add store
     * @return {[type]} [description]
     */
    AddressProto.addStore = function(storeId) {
    };

    /**
     * Remove store from preference
     * @return {[type]} [description]
     */
    AddressProto.removeStore = function(storeId) {
    };


    return AddressDelivery;

})(jQuery);

