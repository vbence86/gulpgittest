'use strict';
var SHARED = window.SHARED || {};
SHARED.utils = (function (SHARED, $) {
    var ua = window.navigator.userAgent.toLowerCase();
    var process = {
        mobileBreakpoint: 767,
        functionList: [],
        resizeFuncs: [],
        prevPageParamName: 'previousPage',
        getWindowWidth: function () {
            return window.innerWidth;
        },
        getWindowHeight: function () {
            return window.innerHeight;
        },
        isIOS: function () {
            return navigator.userAgent.match(/iPad|iPhone/i) !== null;
        },
        isIPad: function() {
            return navigator.userAgent.match(/iPad/i) !== null;
        },
        isAndroid: function () {
            return navigator.userAgent.match(/Android/i) !== null;
        },
        isIE: function () {
            return navigator.userAgent.indexOf('MSIE ') > -1 || navigator.userAgent.indexOf('Trident/') > -1;
        },
        isMobile: function(){
            return ua.indexOf('mobile') !== -1 || ua.indexOf('android') !== -1;
        },
        isLandscape: function(){
            var that = this;
            return (that.getWindowHeight() < that.getWindowWidth());
        },
        isSmallScreen: function(){
            var that = this;
            return (that.getWindowWidth() <= that.mobileBreakpoint) ? true : false;
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
        /**
         * [setCookie - sets a cookie]
         * @param {String} cname  [name of cookie]
         * @param {String} cvalue [value of cookie]
         * @param {Number} exdays [use days to set expiry time]
         * @param {String} path   [what path the cookie belongs to]
         * @param {Number} mins   [use minutes to set expiry time]
         */
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
        },
        /**
         * Get id from element id
         * @param str prefix
         * @returns {string}
         */
        getIdFromElement: function (prefix) {
            var element = $('[id^="' + prefix + '-"]');
            return element.length ? element.attr('id').substring(prefix.length + 1) : '';
        },
        /**
         * Get node id
         * @returns {string}
         */
        getNodeId: function() {
            return SHARED.utils.getIdFromElement('node');
        },
        getWindowLocation: function () {
            return window.location;
        },
        getWindowOrigin: function(){
            var winLoc = SHARED.utils.getWindowLocation();
            return (winLoc.origin) ? winLoc.origin : winLoc.protocol + '//' + winLoc.hostname + (winLoc.port ? ':' + winLoc.port: '');
        },
        functionInitialiser: function () {
            var obj;
            var i = 0;
            var iLen = SHARED.utils.functionList.length;

            for (i = 0; i < iLen; i++) {
                obj = SHARED.utils.functionList[i];
                obj.func.call(obj.func);
            }

            iLen = null;
            obj = null;
        },
        getJson: function(url) {
            var options = {
                type: 'GET',
                dataType: 'json',
                url: url,
                headers: {
                    'Accept' : 'application/json',
                    'Content-Type': 'application/json'
                }
            };
            return $.ajax(options);
        },
        getURLParameter: function(paramName) {
            var sPageURL = window.location.search.substring(1);
            var sURLVariables = sPageURL.split('&');
            for (var i = 0; i < sURLVariables.length; i++)
            {
                var sParameterName = sURLVariables[i].split('=');
                if (sParameterName[0] === paramName)
                {
                    return sParameterName[1];
                }
            }
        },
        getPreviousPage: function() {
            var searchString = window.location.search;
            var previousPage = SHARED.utils.getURLParameter(SHARED.utils.prevPageParamName);
            if(previousPage && SHARED.utils.isUrlInSameDomain(previousPage)){
                previousPage = decodeURIComponent(previousPage);
            } else {
                previousPage = window.location.pathname.replace(/register|login|my\/password/,'');
            }
            if(previousPage.indexOf('?') > -1){
                searchString = '&' + window.location.search.substr(1);
            }
            return previousPage + searchString;
        },
        isUrlInSameDomain: function(url){
            var previousPageHostName = $('<a>').prop('href', decodeURIComponent(url)).prop('hostname');
            return previousPageHostName === window.location.hostname;
        }
    };
    return process;
})(SHARED, $);
