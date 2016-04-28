var BXT = window.BXT || {};
BXT.tagManager = (function (BXT, $, PBX) {
    var process = {
        init: function () {
                var dataLayer = BXT.dataLayer[0];

                var path = dataLayer.device + '|' + dataLayer.ctx_path + dataLayer.current_uri + '|' + dataLayer.connected;
                window.EA_data = [
                    'uid', dataLayer.uid,
                    'from', dataLayer.ea_from,
                    'connected', dataLayer.connected,
                    'path', path,
                    'channel_id', dataLayer.channel_id,
                    'device', dataLayer.device,
                    'pagetype',dataLayer.page_category,
                    'scart','1',
                    'scartcumul','0'
                ];

                if(dataLayer.dataLayer_contains_Basket_Block){
                    if(dataLayer.ea_product_basket!==undefined){
                        dataLayer.ea_product_basket.forEach(this.pushElementsToEAData);
                        window.EA_data.push('currency',dataLayer.ea_currency);
                        window.EA_data.push('amount_basket',dataLayer.ea_amount_basket);
                    }
                }
        },
        pushElementsToEAData: function logArrayElements(element, index, array) {
            window.EA_data.push('prdref',element.prdref);
            window.EA_data.push('prdname',element.prdname);
            window.EA_data.push('prdamount',element.prdamount);
            window.EA_data.push('prdquantity',element.prdquantity);
            window.EA_data.push('prdgroup',element.prdgroup);
        }
    };
    PBX.utils.functionList.push({ test: '#bxt-data-layer', func: process.init, ctx: process });
    return process;
})(BXT, $, PBX);
