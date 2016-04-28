/**
 * Helper class for lightboxes
 * Will respond to mobile/desktop styles
 *
 * Bindable events:
 * 
 * - onOpen
 * - onClose
 */

var uc = uc || {};
uc.Lightbox = (function($, window) {

    function Lightbox(opts) {
        var defaults = {
            content: '<p>Please provide content or a URL for the lightbox.</p>',
            ajax: false,
            url: null,
            appendTarget: 'body',
            maxWidth: 750,
            minHeight: 250,
            destroyOnClose: true
        };

        this.locked = false;
        this.isOpen = false;
        this.opts = $.extend({}, defaults, opts);

        return this.listeners();
    }

    var LightboxProto = Lightbox.prototype = new uc.MicroEvent();

    /**
     * Open it up :)
     * @return {[type]} [description]
     */
    LightboxProto.open = function() {
        this._refreshing = false;

        this.create(function() {
            // do this to ensure dom ready after insert
            setTimeout($.proxy(function OpenLightbox() {
                $('body').addClass('locked');
                this.$scaffold.addClass('open');
                this.trigger('onOpen');
            }, this));

        });    

        return this;
    };


    /**
     * Close it down :(
     * @return {[type]} [description]
     */
    LightboxProto.close = function() {
        if (this.locked) {
            return this;
        }

        $('body').removeClass('locked');
        this.$scaffold.removeClass('open');
        this.trigger('onClose');

        return this;
    };

    /**
     * Helper to close, get latest content and re-open
     * @return {[type]} [description]
     */
    LightboxProto.refresh = function() {
        this._refreshing = true;
        return this.close().destroy().open();
    };


    /**
     * Create the thing (and fetch content if necessary)
     * Safe to run multple times
     * @return {[type]} [description]
     */
    LightboxProto.create = function(done) {
        function callback() {
            if (!this.$scaffold) {
                this.generateScaffolding();
            }

            if (!this.$lightbox) {
                this.addContentToScaffold();
            }

            done.call(this);
        }

        if (!this.$lightbox && this.opts.ajax && this.opts.url) {
            if (!this.$scaffold) {
                this.generateScaffolding();
            }

            $.get(this.opts.url, $.proxy(function onLightboxFetch(data) {
                this.opts.content = data;
                callback.call(this);
            }, this));
        }
        else {
            callback.call(this);
        }
    };


    /**
     * Destroy the thing
     * @return {[type]} [description]
     */
    LightboxProto.destroy = function() {
        if (this.$scaffold) {
            this.$scaffold.remove();
        }

        this.$scaffold = null;
        this.$lightbox = null;

        return this;
    };


    /**
     * Give this lightbox some ears
     * @return {[type]} [description]
     */
    LightboxProto.listeners = function() {
        this.bind('onOpen', $.proxy(function() {
            $(window).resize();

            this.$scaffold.delegate('.lightbox-close, a#edit_address_close', 'click', $.proxy(function(e) {
                this.close();
                e.preventDefault();
            }, this));

            this.isOpen = true;

            this.$scaffold.addClass('ready');
        }, this));

        this.bind('onClose', $.proxy(function() {
            this.$scaffold.undelegate('.lightbox-close, a#edit_address_close', 'click');

            if (this.opts.destroyOnClose) {
                this.destroy();
            }

            this.isOpen = false;
        }, this));

        return this;
    };

    /**
     * Generate the scaffolding HTML (including loader, excluding content)
     * @return {[type]} [description]
     */
    LightboxProto.generateScaffolding = function() {
        this.$scaffold = $('<div class="lightbox-cover"><div class="lightbox-loading"><img src="/img/ajax-loader-large.gif"></div></div>').appendTo(this.opts.appendTarget);
        return this;
    };

    /**
     * MUST be run after generateScaffolding()
     */
    LightboxProto.addContentToScaffold = function() {
        var html = '<div class="lightbox" style="max-width:' + this.opts.maxWidth + 'px; min-height:' + this.opts.minHeight + 'px;">';
        html += '<div class="lightbox-content">' + this.opts.content + '</div>';
        html += '<a href="#" class="lightbox-close">X</a>';
        html += '</div>';

        this.$lightbox = $(html).appendTo(this.$scaffold);

        if($(document).has('ul.nav').length === 0) {
            var elements = $('body .lightbox, body .lightbox .carrefour, body .lightbox .carrefour article, body .lightbox .carrefour .wrapper');
            elements.css('background-color', '#fff');
        }
        return this;
    };


    return Lightbox;

})(jQuery, window);