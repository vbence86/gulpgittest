var PBX = window.PBX || {};
PBX.brands = (function (PBX, $) {
    var process = {
        $brands: null,
        $pbxLink: null,
        init: function () {
            var that = this;
            that.$brands = $('#brands');
            that.$pbxLink = that.$brands.find('ul li a[href*="photobox"]');
            that.$pbxLink.closest('li').addClass('current');
        }
    };
	PBX.utils.functionList.push({ test: '#brands', func: process.init });
    return process;
})(PBX, $);
