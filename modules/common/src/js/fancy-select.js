var PBX = window.PBX || {};
PBX.fancySelect = (function (PBX, $) {
    var process = {
        init: function () {
            // iOS hack: Add an optgroup to every select in order to avoid truncating the content
            if (!!navigator.userAgent.match(/iP(hone|od|ad)/i)) {
                var $selects = $('select');
                $selects.append('<optgroup/>');
            }

            $('.bxt-fancy-select').fancySelect();
        }
    };
	PBX.utils.functionList.push({ test: '.bxt-fancy-select', func: process.init, ctx: process });

    return process;
})(PBX, $);