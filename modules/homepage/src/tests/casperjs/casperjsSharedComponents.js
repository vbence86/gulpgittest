// Testing shared-components
casper.test.begin('User see shared-components in edit mode and does not see in preview mode', 3, function suite(test) {
	var x = require('casper').selectXPath;
	var sharedComponents = x('//*[@class="v-text"][text()="Show shared components"]');
	var titleSharedComponents = x('//*[@class="v-actionbar-section-title"][text()="Shared Components"]');
	var previewPage = x('//*[@class="v-text"][text()="Preview page"]');
	var editPage = x('//*[@class="v-text"][text()="Edit page"]');

	casper.start("http://localhost:8080/boxtop-homepage-webapp/.magnolia/admincentral", function() {
		
		casper.fill('#loginForm', { 
			mgnlUserId: 'boxtop', 
			mgnlUserPSWD: 'OtRx9Ps5pE'
		}, true);

	});

	casper.then( function() {
		
		casper.waitForSelector(".icon-webpages-app").thenClick(".icon-webpages-app");

	    casper.waitForSelector(".v-table-table", function() {
	      	casper.click(".v-table-table input[type='checkbox']");
	    });

	    casper.wait(1000, function() {
			casper.click(editPage);
	    });

	    casper.waitForSelector(sharedComponents, function() {
	      	casper.test.assertVisible(sharedComponents, "Action 'show shared-components' exists in Edit mode");
	      	casper.click(sharedComponents);
	    });

	    casper.wait(1000, function() {
    		casper.test.assertVisible(titleSharedComponents, "Shared-components page is open");
	    });

	});

	casper.thenOpen("http://localhost:8080/boxtop-homepage-webapp/.magnolia/admincentral#app:pages:detail;/photobox.co.uk:view", function() {
		
		casper.wait(1000, function() {
			casper.test.assertNotVisible(x('//*[@class="v-text"][text()="Show shared components"]/..'), "Action 'show shared-components' doesn't exist in Preview mode");
	    });

	});

	casper.run(function() {
		test.done();
	});
});