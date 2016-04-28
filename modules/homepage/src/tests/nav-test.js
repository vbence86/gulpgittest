
/**
 Navigation Test module
 ====================
 Add Navigation HTML markup to #qunit-fixture,
 If the markup changes, it will need to be updated here.
 **/
QUnit.module('Navigation', {
    beforeEach: function() {
        $('#qunit-fixture').append('<header> <button id="MenuButton" class="pbxIcon">&#xe604;</button><a href="#" class="headerLogo" title="Photobox">Photobox</a> <div class="extras language"> <ul> <li class="active"> <span><a href="#">FR</a></span> </li> <li> <span><a href="#">NL</a></span> </li> </ul> </div> <ul class="extras"> <li class="myAccount hasExtrasSubNav"> <div class="headerOverlayCenter"> <ul> <li> <a href="#" data-target-component="login" class="btn">Login</a> </li> <li> <a href="#" data-target-component="registration">Registration</a> </li> <li> <a href="#">Where is my order</a> </li> <li> <a href="#">My Temporary Album</a> </li> </ul> </div> <a href="#" class="menuMyAccount"> <div class="pbxIcon">&#xe605;</div> <span class="label">My Account</span> </a> </li> <li class="hasExtrasSubNav"> <div class="headerOverlayCenter"> <ul> <li> <a href="#">Where is my order</a> </li> <li> <a href="#">FAQ</a> </li> <li> <a href="#">Contact us</a> </li> <li class="noLink"> <div>Telephone: 0207 123 4567</div> <div class="subText">9am - 7pm, 7 days a week 1p per minute</div> </li> </ul> </div> <a href="#" class="retro-help"> <div class="pbxIcon">&#xe601;</div> <span class="label">Help</span> </a> </li> <li class="hasExtrasSubNav"> <div class="headerOverlayCenter"> <ul> <li> <a href="#">Upload your photos</a> </li> <li> <a href="#">Old upload method</a> </li> <li> <a href="#">Picasa</a> </li> <li> <a href="#">FTP & iPhoto</a> </li> </ul> </div> <a href="#"> <div class="pbxIcon">&#xe602;</div> <span class="label">Upload</span> </a> </li> <li> <a href="#" class="offers"> <div class="pbxIcon">&#xe603;</div> <span class="label">Offers</span> </a> </li> <li id="MenuBasket"> <div class="headerOverlay"> <div id="MiniBasketFooter"> <div class="miniBasketTotal"> <span>3</span> products <span class="miniBasketPrice">25 $</span> </div> <div class="basketBtn"> <a href="#" class="btn shoppingCart">Basket</a> <a href="#" class="btn checkout">Checkout</a> </div> </div> </div> <a href="#" class="megaBasket"> <span class="quantity">0</span> <div class="pbxIcon">&#xe600;</div> <span class="label">Basket</span> </a> </li> </ul></header><nav data-products="Products" class="products"> <ul> <li> <a href="#" class="navItem"> <span>Alle producte</span> </a> <div class="subNav"> <div class="subNavContent clearFix"> <ul class="subNavProducts"> <li> <a href="#"> <span class="productName">Alle producte</span> </a> </li> <li> <a href="#"> <span class="productName">Alle producte</span> </a> </li> <li> <a href="#"> <span class="productName">Alle producte</span> </a> </li> </ul> <div class="subNavMoreOptions"> <h2>Alle Producte</h2> <ul class="navList"> <li> <a href="#">FotoBucher</a> </li> <li> <a href="#">FotoBucher</a> </li> <li> <a href="#">FotoBucher</a> </li> </ul> </div> </div> </div> </li> <li> <a href="#" class="navItem"> <span>Fotobucher</span> </a> <div class="subNav"> <div class="subNavContent clearFix"> <div class="subNavMoreOptions"> <h2>Alle Producte</h2> <ul class="nav-list"> <li> <a href="#">FotoBucher</a> </li> <li> <a href="#">FotoBucher</a> </li> <li> <a href="#">FotoBucher</a> </li> </ul> </div> </div> </div> </li> <li> <a href="#" class="navItem"> <span>Kalender</span> </a> <div class="subNav"> <div class="subNavContent clearFix"> <div class="subNavMoreOptions"> <h2>Alle Producte</h2> <ul class="nav-list"> <li> <a href="#">FotoBucher</a> </li> <li> <a href="#">FotoBucher</a> </li> <li> <a href="#">FotoBucher</a> </li> </ul> </div> </div> </div> </li> <li> <a href="#" class="navItem"> <span>Wanddeko</span> </a> <div class="subNav"> <div class="subNavContent clearFix"> <div class="subNavMoreOptions"> <h2>Alle Producte</h2> <ul class="nav-list"> <li> <a href="#">FotoBucher</a> </li> <li> <a href="#">FotoBucher</a> </li> <li> <a href="#">FotoBucher</a> </li> </ul> </div> </div> </div> </li> <li> <a href="#" class="navItem"> <span>Absuge</span> </a> <div class="subNav"> <div class="subNavContent clearFix"> <div class="subNavMoreOptions"> <h2>Alle Producte</h2> <ul class="nav-list"> <li> <a href="#">FotoBucher</a> </li> <li> <a href="#">FotoBucher</a> </li> <li> <a href="#">FotoBucher</a> </li> </ul> </div> </div> </div> </li> <li> <a href="#" class="navItem"> <span>Mein Conto</span> </a> <div class="subNav"> <div class="subNavContent clearFix"> <div class="subNavMoreOptions"> <h2>Alle Producte</h2> <ul class="nav-list"> <li> <a href="#">FotoBucher</a> </li> <li> <a href="#">FotoBucher</a> </li> <li> <a href="#">FotoBucher</a> </li> </ul> </div> </div> </div> </li> <li> <a href="#" class="navItem"> <span class="productName">Upload</span> </a> <div class="subNav"> <div class="subNavContent clearFix"> <div class="subNavMoreOptions"> <h2>Alle Producte</h2> <ul class="nav-list"> <li> <a href="#">FotoBucher</a> </li> <li> <a href="#">FotoBucher</a> </li> <li> <a href="#">FotoBucher</a> </li> </ul> </div> </div> </div> </li> <li> <a href="#" class="navItem"> <span class="productName">Angebote</span> </a> </li> </ul></nav>');
    },
    afterEach: function() {
        $('#qunit-fixture').removeData();
    }
});

/**
 Basic requirements:
 ====================
 Contains the assertions that verify jQuery have been loaded.
 **/

QUnit.test('Basic requirements', function(assert) {
    expect(1);
    assert.ok($, 'jQuery is loaded');
});

/**
 Check mobileNav
 ====================
 Contains the assertions that verify is navigation on mobile is working correct.
 **/

QUnit.test('Check mobileNav', function(assert) {
    expect(3);

    var $fixture = $('#qunit-fixture');
    var $button = $fixture.find('#MenuButton');

    assert.ok($('#MobileNav').length , 'MobileNav exist');

    var done1 = assert.async();
    var done2 = assert.async();

    // show MobileNav
    $button.trigger("click");
    setTimeout(function() {
        assert.ok($('#MobileNavContainer').hasClass("mobileNav"), "MobileNav is shown after first click");
        done1();

        // hide MobileNav
        $button.trigger("click");
        setTimeout(function() {
            assert.ok(!$('#MobileNavContainer').hasClass("mobileNav"), "MobileNav is hidden after second click");
            done2();

        }, 0);
    },0);

});


QUnit.test('Check subNav on hover state', function(assert) {
    expect(1);

    var $fixture = $('#qunit-fixture');
    var $navLi = $fixture.find('.products > ul > li').eq(0);
    var $subNav = $fixture.find('.subNav').eq(0);
    var $linkNav = $fixture.find('.navItem').eq(0);

    //Trigger mouseenter event on navigation element.
    $navLi.trigger("mouseenter");

    assert.ok($linkNav.hasClass("subNavSelected"), "SubNav is shown");

});
