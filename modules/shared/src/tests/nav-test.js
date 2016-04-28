
/**
 Navigation Test module
 ====================
 Add Navigation HTML markup to #qunit-fixture,
 If the markup changes, it will need to be updated here.
 **/               
 var headerHTML = '<header class="clear">' +
                    '<nav class="site-nav">' +
                    '<button id="MobileMenuButton" class="site-nav__mobile pbxIcon"></button>' +
                    '<a class="site-nav__home" href="/">' +
                    '<span>Photobox</span>' +
                    '</a>' +
                    '<ul class="site-nav__lang hidden">' +
                    '<li class="site-nav__item"><a href="/en/">EN</a></li>' +
                    '<li class="site-nav__item"><a href="/en/">FR</a></li>' +
                    '</ul>' +
                    '<ul class="site-nav__list">' +
                    '<li class="site-nav__item site-nav__item--userAccount">' +
                    '<a class="site-nav__link site-nav__link--userAccount" href="http://localhost:8080/a/home.photobox.co.uk/login?">' +
                    '<span class="pbxIcon userAccount"><!-- --></span>' +
                    '<span class="label">My Photobox</span>' +
                    '</a>' +
                    '<div class="site-nav__hover">' +
                    '<ul class="site-nav__sub-list">' +
                    '<li class="site-nav__sub-item">' +
                    '<a href="http://www.photobox.co.uk/login?" class="site-nav__btn btn site-nav__log-in" data-target-component="log-in" data-ga-headerlabel="log-in">Log in</a>' +
                    '</li>' +
                    '<li class="site-nav__sub-item">' +
                    '<a href="http://www.photobox.co.uk" class="site-nav__sub-link site-nav__join-now" data-target-component="join-now" data-ga-headerlabel="join-now">Join now</a>' +
                    '</li>' +
                    '<li class="site-nav__sub-item">' +
                    '<a href="http://www.photobox.co.uk/my/account/history/" class="site-nav__sub-link site-nav__wheres-my-order" data-target-component="wheres-my-order" data-ga-headerlabel="wheres-my-order">Where\'s my order</a>' +
                    '</li>' +
                    '<li class="site-nav__sub-item">' +
                    '<a href="http://www.photobox.co.uk/my/album/" class="site-nav__sub-link site-nav__my-temporary-album" data-target-component="my-temporary-album" data-ga-headerlabel="my-temporary-album">My temporary Album</a>' +
                    '</li>' +
                    '</ul>' +
                    '</div>' +
                    '</li>' +
                    '<li class="site-nav__item site-nav__item--help">' +
                    '<a class="site-nav__link site-nav__link--help" href="http://www.photobox.co.uk">' +
                    '<span class="pbxIcon help"><!-- --></span>' +
                    '<span class="label">Help</span>' +
                    '</a>' +
                    '<div class="site-nav__hover">' +
                    '<ul class="site-nav__sub-list">' +
                    '<li class="site-nav__sub-item">' +
                    '<a href="http://www.photobox.co.uk" class="site-nav__sub-link site-nav__wheres-my-order" data-target-component="wheres-my-order" data-ga-headerlabel="wheres-my-order">Where\'s my order?</a>' +
                    '</li>' +
                    '<li class="site-nav__sub-item">' +
                    '<a href="http://www.photobox.co.uk" class="site-nav__sub-link site-nav__frequently-asked-questions" data-target-component="frequently-asked-questions" data-ga-headerlabel="frequently-asked-questions">Frequently asked questions</a>' +
                    '</li>' +
                    '<li class="site-nav__sub-item">' +
                    '<a href="http://www.photobox.co.uk" class="site-nav__sub-link site-nav__contact-us" data-target-component="contact-us" data-ga-headerlabel="contact-us">Contact Us</a>' +
                    '</li>' +
                    '</ul>' +
                    '</div>' +
                    '</li>' +
                    '<li class="site-nav__item site-nav__item--upload">' +
                    '<a class="site-nav__link site-nav__link--upload" href="http://www.photobox.co.uk">' +
                    '<span class="pbxIcon upload"><!-- --></span>' +
                    '<span class="label">Upload</span>' +
                    '</a>' +
                    '</li>' +
                    '<li class="site-nav__item site-nav__item--offers">' +
                    '<a class="site-nav__link site-nav__link--offers" href="http://www.photobox.co.uk/offers">' +
                    '<span class="pbxIcon offers"><!-- --></span>' +
                    '<span class="label">Offers</span>' +
                    '</a>' +
                    '</li>' +
                    '<li class="site-nav__item site-nav__item--basket">' +
                    '<a class="site-nav__link" href="" data-ga-headeraction="Basket">' +
                    '<span class="quantity">0</span>' +
                    '<span class="pbxIcon basket"><!-- --></span>' +
                    '<span class="label">Basket</span>' +
                    '</a>' +
                    '</li>' +
                    '</ul>' +
                    '</nav>' +
                '</header>';
var navProductsHTML = '<nav data-products="Products" class="products"> <ul> <li> <a href="#" class="navItem"> <span>Alle producte</span> </a> <div class="subNav"> <div class="subNavContent clearFix"> <ul class="subNavProducts"> <li> <a href="#"> <span class="productName">Alle producte</span> </a> </li> <li> <a href="#"> <span class="productName">Alle producte</span> </a> </li> <li> <a href="#"> <span class="productName">Alle producte</span> </a> </li> </ul> <div class="subNavMoreOptions"> <h2>Alle Producte</h2> <ul class="navList"> <li> <a href="#">FotoBucher</a> </li> <li> <a href="#">FotoBucher</a> </li> <li> <a href="#">FotoBucher</a> </li> </ul> </div> </div> </div> </li> <li> <a href="#" class="navItem"> <span>Fotobucher</span> </a> <div class="subNav"> <div class="subNavContent clearFix"> <div class="subNavMoreOptions"> <h2>Alle Producte</h2> <ul class="nav-list"> <li> <a href="#">FotoBucher</a> </li> <li> <a href="#">FotoBucher</a> </li> <li> <a href="#">FotoBucher</a> </li> </ul> </div> </div> </div> </li> <li> <a href="#" class="navItem"> <span>Kalender</span> </a> <div class="subNav"> <div class="subNavContent clearFix"> <div class="subNavMoreOptions"> <h2>Alle Producte</h2> <ul class="nav-list"> <li> <a href="#">FotoBucher</a> </li> <li> <a href="#">FotoBucher</a> </li> <li> <a href="#">FotoBucher</a> </li> </ul> </div> </div> </div> </li> <li> <a href="#" class="navItem"> <span>Wanddeko</span> </a> <div class="subNav"> <div class="subNavContent clearFix"> <div class="subNavMoreOptions"> <h2>Alle Producte</h2> <ul class="nav-list"> <li> <a href="#">FotoBucher</a> </li> <li> <a href="#">FotoBucher</a> </li> <li> <a href="#">FotoBucher</a> </li> </ul> </div> </div> </div> </li> <li> <a href="#" class="navItem"> <span>Absuge</span> </a> <div class="subNav"> <div class="subNavContent clearFix"> <div class="subNavMoreOptions"> <h2>Alle Producte</h2> <ul class="nav-list"> <li> <a href="#">FotoBucher</a> </li> <li> <a href="#">FotoBucher</a> </li> <li> <a href="#">FotoBucher</a> </li> </ul> </div> </div> </div> </li> <li> <a href="#" class="navItem"> <span>Mein Conto</span> </a> <div class="subNav"> <div class="subNavContent clearFix"> <div class="subNavMoreOptions"> <h2>Alle Producte</h2> <ul class="nav-list"> <li> <a href="#">FotoBucher</a> </li> <li> <a href="#">FotoBucher</a> </li> <li> <a href="#">FotoBucher</a> </li> </ul> </div> </div> </div> </li> <li> <a href="#" class="navItem"> <span class="productName">Upload</span> </a> <div class="subNav"> <div class="subNavContent clearFix"> <div class="subNavMoreOptions"> <h2>Alle Producte</h2> <ul class="nav-list"> <li> <a href="#">FotoBucher</a> </li> <li> <a href="#">FotoBucher</a> </li> <li> <a href="#">FotoBucher</a> </li> </ul> </div> </div> </div> </li> <li> <a href="#" class="navItem"> <span class="productName">Angebote</span> </a> </li> </ul></nav>';

QUnit.module('Navigation', {
    beforeEach: function() {
        $('#qunit-fixture').append(headerHTML + navProductsHTML);
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
    var $button = $fixture.find('#MobileMenuButton');

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
