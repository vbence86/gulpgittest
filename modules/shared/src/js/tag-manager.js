var SHARED = window.SHARED || {};
var GA = window.GA || {};
SHARED.tagManager = (function (SHARED, $, GA) {

    // HACK: Moved here to work around an issue where this.pushElementsToEAData was
    // returning undefined
    // TODO: This object is duplicated from the basket... remove
    // TODO: Many of the Shared objects are duplicated in Common... review and clean up
    var pushElementsToEAData = function logArrayElements(element, index, array) {
        window.EA_data.push('prdref',element.prdref);
        window.EA_data.push('prdname',element.prdname);
        window.EA_data.push('prdamount',element.prdamount);
        window.EA_data.push('prdquantity',element.prdquantity);
        window.EA_data.push('prdgroup',element.prdgroup);
    };

	var process = {
		init: function () {
			if (GA.dataLayer) {
				var dataLayer = GA.dataLayer[0] || {};
				var path = dataLayer.device + '|' + dataLayer.ctx_path + dataLayer.current_uri + '|' + dataLayer.connected;
				window.EA_data = [
					'uid', dataLayer.uid,
					'from', dataLayer.from,
					'connected', dataLayer.connected,
					'path', path,
					'channel_id', dataLayer.channel_id,
					'device', dataLayer.device,
					'pagetype',dataLayer.page_category
				];

				if(dataLayer.dataLayer_contains_Basket_Block){
					if(dataLayer.ea_product_basket!==undefined){
					    dataLayer.ea_product_basket.forEach(pushElementsToEAData);
						window.EA_data.push('currency',dataLayer.ea_currency);
						window.EA_data.push('amount_basket',dataLayer.ea_amount_basket);
					}
				}

			}
		},

        // NOTE: Leave this code here until you have fixed the HACKS, and TODOS above
		// pushElementsToEAData: function logArrayElements(element, index, array) {
		// 	window.EA_data.push('prdref',element.prdref);
		// 	window.EA_data.push('prdname',element.prdname);
		// 	window.EA_data.push('prdamount',element.prdamount);
		// 	window.EA_data.push('prdquantity',element.prdquantity);
		// 	window.EA_data.push('prdgroup',element.prdgroup);
		// }
	};
	SHARED.utils.functionList.push({ test: '#bxt-data-layer', func: process.init, ctx: process });
	return process;
})(SHARED, $, GA);
