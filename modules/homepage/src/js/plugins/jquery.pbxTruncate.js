(function ($) {
	
	$.pbxTruncate = function(element,options) {

		var settings = $.extend({
			buffer: 42,
			ellipsis: '...',
			truncateElement: 'h2',
			word: true
		}, options );

		var Plugin = this,
			$el = $(element),
			$elementsToTruncate,
			_fontSize = '20px',
			$ruler;
		
		Plugin.init = function(){

			$elementsToTruncate = $el.find(settings.truncateElement);

			setFontSize();

			addRuler();

			truncateElements();

		}

		var setFontSize = function(){
			_fontSize = $(settings.truncateElement, $el).css('fontSize');
		};

		var addRuler = function(){
			$ruler = $('<span id="ruler"/>')
				.css({'font-size': _fontSize, 'visibility': 'hidden', 'white-space': 'nowrap'})
				.appendTo('body');
		};

		var showRuler = function(){
			$ruler.removeClass('hidden');
		};

		var hideRuler = function(){
			$ruler.addClass('hidden');
			$ruler.html('');
		};

		var getVisualLength = function(text){
			$ruler.html(text);
			return $ruler[0].offsetWidth;
		};

		var trimToPx = function(text, length){
			var tmp = text;
			var trimmed = text;

			if (getVisualLength(tmp) > length){
				trimmed += settings.ellipsis;
				while(getVisualLength(trimmed) > length){
					if(settings.word){
						tmp = tmp.substring(0, tmp.length-1).split(' ').slice(0, -1).join(' ');
					}else{
						tmp = tmp.substring(0, tmp.length-1);
					}
					if(tmp === ''){
						return '';
					}
					trimmed = tmp + settings.ellipsis;
				}
			}
			return trimmed;
		};

		var truncateElements = function(){

			$elementsToTruncate.each(function(){

				var $thisEl = $(this),
					iFontSize = parseInt(_fontSize, 10),
					trimTo = ( $thisEl.width()*2 ) - (settings.buffer + iFontSize);

				$thisEl.html(trimToPx( $thisEl.html(), trimTo ));

			});

			hideRuler();

		};

		Plugin.init();
	};

	$.fn.pbxTruncate = function(options) {

		return this.each(function() {
			if (undefined === $(this).data('pbxTruncate')) {
				var Plugin = new $.pbxTruncate(this, options);
				$(this).data('pbxTruncate', Plugin);
			}
		});
	};

}(jQuery));