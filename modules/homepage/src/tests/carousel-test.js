/**
	Carousel Test module 
	====================
	Add Carousel HTML markup to #qunit-fixture,
	If the markup changes, it will need to be updated here. 
**/
QUnit.module('Carousel', {
	beforeEach: function() {
		// $('#qunit-fixture').append('<section id="Hero" class="row pbxCarousel" data-type="carousel" data-timer="3000"></section>');
		$('#qunit-fixture').append('<section id="Hero" class="row pbxCarousel" data-type="carousel" data-timer="3000"><div class="slides" style="left: 0%;"><a href="http://photobox.co.uk"><img src="../img/iPhone-Cases.jpg" data-title ="iPhone 6 translucent cases" alt="alt for image"></a><a href="http://photobox.co.uk"><img src="../img/Canvas-Prints.jpg" data-title="Canvas prints from £7" alt="alt for canvas"></a><a href="http://photobox.co.uk"><img src="../img/Poster-Prints.jpg" data-title="up to 70% off poster prints" alt="alt for poster"></a></div></section>');
	},
	teardown: function() {
		$('#qunit-fixture').removeData();
	}
});

/**
	Basic requirements: 
	====================
	Contains the assertions that verify jQuery and any dependants have been loaded.
**/

QUnit.test('Basic requirements', function(assert) {
	expect(1);
	assert.ok($, 'jQuery is loaded');
});

/**
	Initialization: 
	====================
	Tests for initialisation and setup of plugin;
**/
QUnit.test('Initialization', function(assert) {
	expect(5);

	var $fixture = $('#qunit-fixture');
	var $carouselEl = $fixture.find('[data-type="carousel"]');
	var $carousel = $carouselEl.pbxCarousel();
	var $slides = $('img',$carouselEl);
	var $nav = $carouselEl.find('ul');

	var navLength = $nav.find('li').length + 1;
	var numberOfSlides = $slides.length;

	assert.ok($.fn.pbxCarousel, 'The pbxCarousel plugin is loaded correctly');
	assert.ok($carousel, 'Carousel is initialized');
	assert.ok(numberOfSlides, 'Carousel has slides');
	assert.ok($nav, 'Carousel nav exists');
	assert.strictEqual(navLength, numberOfSlides, 'Carousel nav is equal to the number of slides');
});