/**
 Cookie Banner Test module
 ====================
 Add cookie banner HTML markup to #qunit-fixture,
 If the markup changes, it will need to be updated here.
 **/
QUnit.module('CookieBanner', {
	beforeEach: function () {
		$('#qunit-fixture').append('<section id="CookieBanner"><div class="container"><div class="cookieInfo"><p class="mainText">This site uses cookies. Continuing to use the site without changing your cookie settings means that you consent to those cookies</p><div class="subText"><p>Find out about the&nbsp;<a href="http://www.photobox.co.uk/content/legal/privacy?cid=cookieprivacy#cookies-policy">cookies</a>&nbsp;|&nbsp;How to change your&nbsp;<a href="http://www.photobox.co.uk/content/legal/privacy?cid=cookiesettings#cookies-settings">settings</a></p></div></div><div class="cookiesInfoMobile"><a href="">Learn more</a></div><button class="btn btn-default" id="CookieBannerClose">Okay, got it</button></div></section>');
	},
	afterEach: function () {
		FLEXI.utils.setCookie('optcookieinfo',true,0,'/');
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
 Check Cookie Banner
 ====================
 Contains the assertions about hiding the cookie banner and displaying the banner.
 **/

QUnit.test('Check cookie banner', function (assert) {
	expect(1);

	var $fixture = $('#qunit-fixture');
	var $button = $fixture.find('#CookieBannerClose');

	//initialise cookie banner js
	FLEXI.cookieBanner.init();
	$button.trigger("click");

	assert.equal($('#CookieBanner').css('display'), "none", "Cookie banner is hidden");
});

QUnit.test('Check cookie is not set before click', function (assert) {
	expect(1);

	var $fixture = $('#qunit-fixture');
	
	//initialise cookie banner js
	FLEXI.cookieBanner.init();
	
	assert.equal(FLEXI.cookieBanner.isCookiePolicyAccepted(), false, "Cookie is not set before click");

});

QUnit.test('Check cookie is set after click', function (assert) {
	expect(1);

	var $fixture = $('#qunit-fixture');
	var $button = $fixture.find('#CookieBannerClose');

	//initialise cookie banner js
	FLEXI.cookieBanner.init();
	$button.trigger("click");

	assert.equal(FLEXI.cookieBanner.isCookiePolicyAccepted(), true, "Cookie is set after click");

});
