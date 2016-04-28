//import Constants from '../src/js/constants/Constants';

describe('AppStore', function() {

	it('initializes with basket data from window.SCData.basket', () => {
		window.SCData = {
			basket: {
				test: 'test'
			}
		}
		let AppStore = require('../src/js/store/AppStore').default;
		expect(AppStore.basket).toEqual(window.SCData.basket);
	});

	it('initializes with state = Constants.BASKET_STATE', () => {
		let Constants = require('../src/js/constants/Constants').default;
		let AppStore = require('../src/js/store/AppStore').default;
		expect(AppStore.state).toEqual(Constants.BASKET_STATE);
	});

	it('after submit from BASKET_STATE changes state to PAYMENT_STATE', () => {
		let Constants = require('../src/js/constants/Constants').default;
		let AppAction = require('../src/js/actions/AppAction').default;
		let AppStore = require('../src/js/store/AppStore').default;
		AppAction.submit();
		expect(AppStore.state).toEqual(Constants.PAYMENT_STATE);
	});
});