var BXT = window.BXT || {};
BXT.float = (function (BXT, $, PBX) {

    var process = {
        floatBreakpoint: 1130,
        $float: null,
        $floats: null,
        $hideFloat: null,

        init: function () {
            if(!$('#Float')){
                return;
            }
            _this.$float = $('#Float');
            _this.$floats = $('.float', _this.$float);
            _this.$hideFloat = $('.hideFloat', _this.$floats);
            _this.$hideFloat.on('click', _this.hideFloatEvent);

            _this.initFloat();
        },

        hideFloatEvent: function(event){
            $(event.target).parent().hide();
            _this.setCookieToHideFloat();
        },

        initFloat: function() {
            if(!_this.isFloatHidden() && PBX.utils.getWindowWidth() >= _this.floatBreakpoint) {
                _this.floatVisibility('show');
            } else {
                _this.floatVisibility('hide');
            }
        },

        setCookieToHideFloat: function() {
            BXT.float.setCookie('sidePromo','hidePromo',0,'/',30);
        },

        isFloatHidden: function(){
            var floatCookie = BXT.float.getCookie('sidePromo');
            if(floatCookie !== '' && floatCookie === 'hidePromo'){
                return true;
            }
            return false;
        },
        floatVisibility: function(state) {
            if(state === 'show'){
                _this.$float.show();
            } else {
                _this.$float.hide();
            }
        },
        getCookie: function(cookieName) {
            var name = cookieName + '=';
            var ca = document.cookie.split(';');
            for(var i=0; i<ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) === ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) === 0) {
                    return c.substring(name.length,c.length);
                }
            }
            return '';
        },

        setCookie: function(cname, cvalue, exdays, path, mins){
            var d = new Date(),
                expires;

            if(mins){
                // set in minutes
                d.setTime(d.getTime() + (mins*60*1000));
                expires = 'expires='+d.toUTCString();
            }else{
                // else set in days...
                d.setTime(d.getTime() + (exdays*24*60*60*1000));
                expires = 'expires='+d.toUTCString();
            }
            document.cookie = cname + '=' + cvalue + '; ' + expires + '; path=' + path;
        }
    };
    var _this = process;
    PBX.utils.functionList.push({ test: 'body', func: process.init, ctx: process });
    return process;

})(BXT, $, PBX);
