/**
 Float Test module
 ====================
 Add Float HTML markup to #qunit-fixture,
 If the markup changes, it will need to be updated here.
 **/
 var floatHTML = '<section id="Float" data-ga-category="Float">' +
				'<div class="float">' +
				'<a href="http://www.photobox.com" data-ga-action="Float 1">' +
				'<img src="img/bigandbold.png" alt="Big and Bold">' +
				'</a>' +
				'<button class="hideFloat" title="Close"></button>' +
				'</div>' +
				'</section>';

QUnit.module('Float', {
	beforeEach: function () {
		$('#qunit-fixture').append(floatHTML);
	},
	afterEach: function () {
		SHARED.utils.setCookie('sidePromo',true,0,'/');
		$('#qunit-fixture').removeData();
	}
});

/**
 Basic requirements:
 ====================
 Verify jQuery has been loaded.
 **/
QUnit.test('Basic requirements', function (assert) {
	expect(1);
	assert.ok($, 'jQuery is loaded');
});

/**
 Check Hiding Float
 ====================
 Test hiding the float.
 **/
QUnit.test('Check float', function (assert) {
	expect(1);

	var $fixture = $('#qunit-fixture');
	var $floatContainer = $fixture.find('#Float');
	var $float = $fixture.find('.float', $floatContainer);
	var $hideFloatButton = $fixture.find('.hideFloat', $float);

	var done1 = assert.async();

	//initialise float js
	SHARED.float.init();
	$hideFloatButton.trigger("click");

	setTimeout(function () {
		assert.equal($float .css('display'), "none", "Float is hidden" + $hideFloatButton);
		done1();
	}, 5);
});

/**
 Check Cookie setting 
 ====================
 Test cookie is not set before click.
 **/
QUnit.test('Check cookie is not set before click', function (assert) {
	expect(1);

	var $fixture = $('#qunit-fixture');

	//initialise float js
	SHARED.float.init();

	assert.equal(SHARED.float.isFloatHidden(), false, "Cookie is not set before click");
});

/**
 Check Cookie setting 
 ====================
 Test cookie gets set after click.
 **/
QUnit.test('Check cookie is set after click', function (assert) {
	expect(1);

	var $fixture = $('#qunit-fixture');
	var $button = $fixture.find('.hideFloat', '#Float .float');

	//initialise float js
	SHARED.float.init();
	$button.trigger("click");

	assert.equal(SHARED.float.isFloatHidden(), true, "Cookie is set after click");
});