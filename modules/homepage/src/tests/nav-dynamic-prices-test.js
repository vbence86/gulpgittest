QUnit.module('Navigation (dynamic prices)');

QUnit.test('Fetch a single product id from nav bar', function(assert) {
    expect(1);

    $('#qunit-fixture').append('<span class="productPrice" data-product-id="7"></span>');

    var pids = FLEXI.megaNav.getProductsIds();

    assert.deepEqual(pids, ["7"], "One product Id returned");
});


QUnit.test('Fetch multiple product ids from nav bar', function(assert) {
    expect(1);

    $('#qunit-fixture').append('<span class="productPrice" data-product-id="5"></span>');
    $('#qunit-fixture').append('<span class="productPrice" data-product-id="12"></span>');
    $('#qunit-fixture').append('<span class="productPrice" data-product-id="34"></span>');

    var pids = FLEXI.megaNav.getProductsIds();

    assert.deepEqual(pids, ["5","12","34"], "All product Ids returned");
});

QUnit.test('Fetch no product ids from nav bar', function(assert) {
    expect(1);

    var pids = FLEXI.megaNav.getProductsIds();

    assert.deepEqual(pids, [], "No product Id returned");
});


QUnit.test('Render single regular price', function(assert) {
    expect(1);

    $('#qunit-fixture').append('<span class="productPrice" data-product-id="5"></span>');

    var price = "\u00a364.99";
    var jsonResponse = {
        "productsInfos": {
            "5": {
                "promoPrice": null,
                "undiscountedPrice": price
            }
        }
    };

    FLEXI.megaNav.renderDynamicPrices(jsonResponse);

    assert.deepEqual($('#qunit-fixture > span > span.subNavBasePrice').text(), price, "Price not found where expected");
});


QUnit.test('Render multiple regular prices', function(assert) {
    expect(2);

    $('#qunit-fixture').append('<span class="productPrice" data-product-id="7"></span>');
    $('#qunit-fixture').append('<span class="productPrice" data-product-id="5"></span>');

    var price = "\u00a364.99";
    var jsonResponse = {
        "productsInfos": {
            "5": {
                "promoPrice": null,
                "undiscountedPrice": price
            },
            "7": {
                "promoPrice": null,
                "undiscountedPrice": "\u00a312.99"
            }
        }
    };

    FLEXI.megaNav.renderDynamicPrices(jsonResponse);

    assert.deepEqual($('#qunit-fixture > span[data-product-id="5"] > span.subNavBasePrice').text(), price, "Price not found where expected");
    assert.deepEqual($('#qunit-fixture > span[data-product-id="7"] > span.subNavBasePrice').text(), "\u00a312.99", "Price not found where expected");
});


QUnit.test('Render dynamic price with no promo price', function(assert) {

    var info = {
        "promoPrice": null,
        "undiscountedPrice": '£12.34'
    };

    var data = {
        'priceLabel': 'The price is'
    };

    var content = FLEXI.megaNav.createDynamicPriceContent(info, data);

    assert.deepEqual(content, 'The price is <span class="subNavBasePrice">£12.34</span>')
});


QUnit.test('Render dynamic price with promo price', function(assert) {

    var info = {
        "promoPrice": '£19.99',
        "undiscountedPrice": '£23.45'
    };

    var data = {
        'undiscountedLabel': 'Was:',
        'discountedLabel': 'Now:'
    };

    var content = FLEXI.megaNav.createDynamicPriceContent(info, data);

    assert.deepEqual(content,
            '<p>Was: <span class="subNavOldPrice">£23.45</span></p>' +
            '<p>Now: <span class="subNavPromoPrice">£19.99</span></p>');
});


QUnit.test('Render no dynamic price when product info is empty', function(assert) {

    var info = undefined;
    var data = {};

    var content = FLEXI.megaNav.createDynamicPriceContent(info, data);

    assert.deepEqual(content, '')
});


QUnit.test('build product infos URI with one product id', function(assert) {
    $('#qunit-fixture').append('<nav id="Nav" data-product-details-url="/product-details"></nav>');

    var uri = FLEXI.megaNav.getProductDetailsUrl([1], '777');
    assert.deepEqual(uri, '/product-details?productIds=1&bsessioncode=777', 'Wrong URI returned');
});

QUnit.test('build product infos URI with multiple product ids', function(assert) {
    $('#qunit-fixture').append('<nav id="Nav" data-product-details-url="/product-details"></nav>');

    var uri = FLEXI.megaNav.getProductDetailsUrl([1, 7, 56], '666');
    assert.deepEqual(uri, '/product-details?productIds=1%2C7%2C56&bsessioncode=666', 'Wrong URI returned');
});

QUnit.test('retrieve session code from markup', function(assert) {
    $('#qunit-fixture').append('<div id="Bxt" data-ajax-session-code="999">');

    var sessionCode = FLEXI.megaNav.getApiSessionCode();
    assert.deepEqual(sessionCode, 999, 'Session code comparison failed');
});
