(function ($) {
	
	$.pbxCarousel = function(element,options) {

		var settings = $.extend({
			transitionSpeed: 350
		}, options );

		var Plugin = this;
		var $carousel = $(element);
		var delayTimer = $carousel.data('timer');
		var $slides = $('img',$carousel);
		var numberOfSlides = $slides.length;
		var promoImgs = $('[data-end-date]:not([data-end-date=""])', $carousel);
		var currentSlide = 0;
		var timer;
		var slides;
		var slideWidth = 0;
		Plugin.init = function(){

			if(numberOfSlides === 1 ){
				// TODO: The slide Width needs to be recalculated for orientation changes even if there is only 
				// one slide.  Need to refactor this code to remove the duplication.
				setSlideWidth();
				startCountdown();
				moveCountdownDown();

				$(window).on('resize orientationchange',function(){
					setSlideWidth();
				});
				return;
			}
			// NOTE: set slide widths here to fix nexus and safari retina sized images displaying waaaay too big
			// remove if issue solved
			cloneFirstSlide();//make the slider cyclical
			setSlideWidth();
			generateNavigation();
			startCountdown();

			animateSlide(currentSlide);

			$('.promoBlock',$carousel).click(function(e){
				e.stopPropagation();
				e.preventDefault();
			});

			$('li',$carousel).click(function(){
				goToSlide($(this));
				return false;
			});

            $slides.hammer().bind('swipeleft', nextSlide );
            $slides.hammer().bind('swiperight', previousSlide );

			$(window).on('resize orientationchange',function(){
				setSlideWidth();
			});

		};

		var setSlideWidth = function(){
			slideWidth = $carousel.innerWidth();
			$slides.css('width', slideWidth);
		};
		var cloneFirstSlide = function() {
			$('.slides > a:first',$carousel).clone().appendTo('.slides');
			$slides = $('img',$carousel);
			promoImgs = $('[data-end-date]:not([data-end-date=""])', $carousel);
		}

		var previousSlide = function(event) {
			animateSlide(currentSlide-1);
		};

		var nextSlide = function(event) {
			animateSlide(currentSlide+1);
		};

		var animateSlide = function(newSlide){

			if ( newSlide !== currentSlide ) {

				if ( timer ) {
					clearTimeout(timer);
				}

				if ( newSlide < 0 ) {
					newSlide = numberOfSlides - 1;  
				} else if  (newSlide > numberOfSlides ) {
					// not sure if this will ever happen
					// leaving it here just in case
					newSlide = 0;
				}

				var newPosition = newSlide > 0 ? newSlide * -100 + '%' : 0;

				// animate it
				$('.slides',$carousel).animate({left: newPosition},settings.transitionSpeed, 'swing', function() {
					
					if ( newSlide === numberOfSlides ) {
						// in order to faciliate seamless animations in a single direction,
						// we added cloned tile with cloneFirstSlide()
						// so technically the length is length+1 but we don't increase the 
						// length to ensure consistency with the navigation.
						// However, after we have animated to the final slide we need to
						// reset the position of the tiles so the animation will continue
						// to behave as expected.

						$('.slides',$carousel).css({left: 0});

						// ensure the index if what we expect (ie the first tile)
						newSlide = 0;
					}

					// make the new slide active
					$('li',$carousel).removeClass('active').eq(newSlide).addClass('active');

					currentSlide = newSlide;
				});

			}

			if ( delayTimer > 0) {
				// TODO: Add polyfill for Function.prototype.bind() for IE8
				//timer = setTimeout(animateSlide.bind(this, currentSlide+1), delayTimer);
				timer = setTimeout(function() {
					animateSlide(currentSlide+1);			
				}, delayTimer);	
			}
		};

		var generateNavigation = function() {
			var navList = '';

			for (i=0; i<numberOfSlides; i++){

				var activeClass = '';
				if(i === 0){
					activeClass = ' class="active"';
				}

				navList += '<li'+activeClass+'>'+$slides.eq(i).data('title')+'</li>';

			}

			if (numberOfSlides > 4) {
				slides = ' class=slides5';
			} else {
				slides = ' class=' + 'slides' + numberOfSlides;
			}
			$carousel.append('<ul' + slides + '/>');
			$('ul',$carousel).html(navList);
		};

		var getCountdown = function(element) {
			var counter = null;
			var seconds;
			var minutes;
			var hours;
			var days;
			var count;
			var dateNow = new Date();
			var endData = element.data('end-date');

			endData = endData.replace(/-/g, ' '); // convert date in appropriate format for FireFox
			count = new Date(endData).getTime() - dateNow.getTime();
			
			if (count >= 0){
				count = Math.floor(count/1000);//take out milliseconds
				seconds = addZero(Math.floor(count % 60));
				count = count/60;
				minutes = addZero(Math.floor(count % 60));
				count = count/60;
				hours = addZero(Math.floor(count % 24));
				days = addZero(Math.floor(count/24));
				counter = {
					days:days,
					hours:hours,
					minutes:minutes,
					seconds:seconds
				};
			} 
			return counter;
		};

		var updateCountdown = function() {
			var countDown;

			for (var i=0; i<promoImgs.length; i++){

				var nextPromo = promoImgs.eq(i);
				countDown = getCountdown(nextPromo);				
				
				var slide = nextPromo.parent();

				if (countDown === null) {

					promoImgs.splice(i,1);					

					$('.countdown', slide).remove();
					$('.expired-offer', slide).removeClass('hidden');
					
					i--;

				} else {

					$('.countdown-value__day', slide).html(countDown.days);
					$('.countdown-value__hour', slide).html(countDown.hours);
					$('.countdown-value__minute', slide).html(countDown.minutes);
					$('.countdown-value__second', slide).html(countDown.seconds);
				}
			}

			if(promoImgs.length > 0){
				setTimeout(updateCountdown, 1000);
			}
		};

		var startCountdown = function(){
			updateCountdown();
		};

		var addZero = function(number){
			var result;
			if (number < 10){
				result = "0" + number;
			} else {
				result = number;
			}
			return result;
		};

		var moveCountdownDown = function() {
			$('.countdown-wrapper').addClass('one-slide-carousel');
		};

		var goToSlide = function(_thisClick) {
			var slideIndex = _thisClick.index();
			animateSlide(slideIndex);
		};

		Plugin.init();
	};

	$.fn.pbxCarousel = function(options) {

		return this.each(function() {
			if (undefined === $(this).data('carousel')) {
				var Plugin = new $.pbxCarousel(this, options);
				$(this).data('carousel', Plugin);
			}
		});
	};

}(jQuery));