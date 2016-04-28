/**
 Float Test module
 ====================
 Add Float HTML markup to #qunit-fixture,
 If the markup changes, it will need to be updated here.
 **/
QUnit.module('Float', {
	beforeEach: function () {
		$('#qunit-fixture').append('<section id="Float"> <a href="" alt=""> </a> <button id=hideFloat title=Close><span>X</span></button> </section>');
	},
	afterEach: function () {
		$('#qunit-fixture').removeData();
	}
});
/**
 Basic requirements:
 ====================
 Contains the assertions that verify jQuery have been loaded.
 **/

QUnit.test('Basic requirements', function (assert) {
	expect(1);
	assert.ok($, 'jQuery is loaded');
});
/**
 Check Float
 ====================
 Contains the assertions about hiding the float.
 **/

QUnit.test('Check float', function (assert) {
	expect(1);

	var $fixture = $('#qunit-fixture');
	var $button = $fixture.find('#hideFloat');
	var done1 = assert.async();

	//initialise float js
	FLEXI.float.init();
	$button.trigger("click");

	setTimeout(function () {
		assert.equal($('#Float').css('display'), "none", "Float is hidden" + $button);
		done1();
	}, 5);
});
