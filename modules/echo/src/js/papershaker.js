var BXT = window.BXT || {};
var PSConfig = window.PSConfig || {};

BXT.PS3dView = (function (BXT, $, PBX) {
	var SHOW_SIDE_CLASSES_FOLDED = ['show-front', 'show-inner-right', 'show-inner-left', 'show-back'];
	var SHOW_SIDE_CLASSES_FLAT = ['show-front', 'show-back'];
	var CLASS = {
		CARD_VIEWPORT: 'card-viewport',
		CARD_PREVIEW_WRAPPER: 'card-preview-wrapper',
		SCRUBBER: 'stepped-scrubber',
		SCRUBBER_HANDLE: 'scrubber-handle',
		SELECTED: 'selected',
		IN_USE: 'in-use'
	};
	var KEY = {
		DATA: {
			IS_OPEN: 'is-open',
			SHOW_SIDE: 'show-side',
			TRANSITION: 'data-transition'
		},
		DIRECTION: {
			LEFT: 'left',
			RIGHT: 'right',
			NONE: 'none'
		}
	};
	var SELECTOR = {
		CARD_PREVIEW_WRAPPER: '.' + CLASS.CARD_PREVIEW_WRAPPER,
		SCRUBBER: '.' + CLASS.SCRUBBER,
		SCRUBBER_HANDLE: '.' + CLASS.SCRUBBER_HANDLE,
		SELECTED: '.' + CLASS.SCRUBBER + ' .' + CLASS.SELECTED,
		STEP: '.' + CLASS.SCRUBBER + ' li'
	};
	var	TRANSITION = {
		GLIDE: 'glide',
		SNAP: 'snap'
	};
	var process = {
		eventsBinded: false,
		supports3D: null,
		currentDesignFolded: false,
		buildView: function (design) {
			var $viewContainerEl = $('#quick-look #quick-look-design-preview');
			var show_side_classes = design.type === 'folded' ? SHOW_SIDE_CLASSES_FOLDED : SHOW_SIDE_CLASSES_FLAT;
			var cardsHtml = '';
			var steppedScrubberItemsHtml = '';

			if ( design.type === 'folded' ) {
				that.currentDesignFolded = true;
			} else {
				that.currentDesignFolded = false;
			}

			for (var i = 0, l = design.previewImages.length; i < l; i++) {
				if (i % 2 === 0) {
					cardsHtml += BXT.templater.buildTemplate($('#3d-view-card-page-template').html(), {data: [
						{index: i, face_class: 'face-front', img: design.previewImages[i].productPageMainUrl},
						{index: i + 1, face_class: 'face-back', img: design.previewImages[i + 1].productPageMainUrl}
					]}, null, [
						{template: $('#3d-view-card-page-face-template').html(), partialName: 'data'}
					]);
				}

				var previewImage = '';
				if ( !that.isSupports3D() ) {
					var actualIndex = i;

					if ( that.currentDesignFolded ) {
						// for folded cards we have to fudge the order in the scrubber to 
						// match the  3d animation sequence.  So card order (pages numbers) 
						// is 1, 3, 2, 4
						actualIndex = (i === 1) ? i + 1 : (i === 2) ? i - 1 : i;
					}
					
					previewImage = '<img src="' + design.previewImages[actualIndex].productPageThumbUrl + '">';
				}
				steppedScrubberItemsHtml +=  BXT.templater.buildTemplate($('#3d-view-stepped-scrubber-item-template').html(),
					{design: design, index: i, selected: i ? '' : 'selected', side: show_side_classes[i], previewImage: design.previewImages[i],
					img: previewImage }, null, []);
			}
			var viewHtml = BXT.templater.buildTemplate($('#3d-view-template').html(), {design: design, cards: cardsHtml},
				null, []);
			if (design.previewImages.length) {
				viewHtml +=  BXT.templater.buildTemplate($('#3d-view-stepped-scrubber-template').html(), {design: design, items: steppedScrubberItemsHtml},
					null, []);
			}

			$viewContainerEl.html(BXT.templater.cleanTemplate(viewHtml));
			setTimeout(function() {
				that.showSide('show-3d');
			}, 10);
			if (!that.eventsBinded) {
				that.check3dSupport();
				that.bindEvents();
			}
		},
		/**
		 * Adjust data-show-side with provided key
		 * @param1 [string]: Show side key
		 */
		showSide: function (side, open) {
			$(SELECTOR.CARD_PREVIEW_WRAPPER).attr({ 'data-show-side': side });

			if ( !that.isSupports3D() ) {
				var index = 0;

				if ( side === 'show-back' ) {
					if ( that.currentDesignFolded ) {
						index = 3;
					} else {
						index = 1;
					}
				} else if ( side === 'show-inner-left' ) {
					index = 1;
				} else if ( side === 'show-inner-right' ) {
					index = 2;
				}

				var len = that.currentDesignFolded ? 4 : 2;

				for ( var i=0; i < len; i++ ) {
					var displayValue = i === index ? 'block' : 'none';
					$('.page-face-' + i).css('display', displayValue);
				}
			}
		},
		/**
		 * Begin the scrubbing! Set initial conditions/measurements about the scrubber at hand
		 * @param1 [number]: X position of the input
		 * @param2 [jQuery object]: The handle being dragged
		*/
		startScrub: function (x, $handle) {
			var handleLeft = $handle.position().left;
			var	$scrubber = $handle.closest(SELECTOR.SCRUBBER);
			var	$slots = $scrubber.find('li');

			that.thisScrub = {
				startX: x,
				startLeft: handleLeft,
				range: $scrubber.width(),
				checkpoints: that.scrapeCheckpoints($slots),
				hasMoved: false,
				$handle: $handle,
				$scrubber: $scrubber
			};

			$handle
				.addClass(CLASS.IN_USE)
				.attr(KEY.DATA.TRANSITION, '');
		},
		/**
		 * Move the handle according to input's X
		 * * @param1 [number]: X of input
		 */
		scrubTo: function (x) {
			var newSide = '';

			that.thisScrub = that.updateScrubProperties(that.thisScrub, x);
			that.thisScrub.$handle.css({
				'transform': 'translate3d(' + that.thisScrub.currentLeft + 'px, 0, 0)',
				'-webkit-transform': 'translate3d(' + that.thisScrub.currentLeft  + 'px, 0, 0)'
			});

			var sideInfo = that.findNearestSlot(that.thisScrub.currentLeft, that.thisScrub.checkpoints);
			if (sideInfo.showSide !== that.thisScrub.showSide) {
				that.showSide(sideInfo.showSide, sideInfo.isOpen);
			}
			that.thisScrub.showSide = newSide;
		},
		/**
		 * Abandon the scrubbening! Choose a slot to move the handle to and delete the thisScrub object
		 * @param1 [number]: X of input
		 */
		endScrub: function (x) {
			that.thisScrub = that.updateScrubProperties(that.thisScrub, x, true);

			if (that.thisScrub.hasMoved) {
				that.moveHandleToNextSlot(that.thisScrub);
			}
			that.thisScrub.$handle.removeClass(CLASS.IN_USE);

			delete that.thisScrub;
		},
		/**
		 * Figure out latest properties of scrub based on new mouse input
		 * @param1 [object]: Object containing scrub data
		 * @param2 [number]: The x coordinate of the mouse
		 * @param3 [boolean]: True if this is a mouseend event
		 * @return [object]: Contains updated scrub data
		 */
		updateScrubProperties: function (scrubProps, mouseX, isEnd) {
			var distance = that.calcDistanceFromOrigin(mouseX, scrubProps.startX);

			scrubProps.previousLeft = scrubProps.currentLeft;
			scrubProps.currentLeft = that.calcNewLeft(scrubProps.startLeft, distance, scrubProps.range);

			if (!isEnd) {
				scrubProps.hasMoved = true;
				scrubProps.direction = that.calcDirection(scrubProps.previousLeft, scrubProps.currentLeft);
			}

			return scrubProps;
		},
		/**
		 * Calculate the direction of mouse travel. If offsetFrom is less than offsetTo, we're travelling right,
		 * if more, left. If neither we default to no direction.
		 * @param1 [number]: Previous X offset
		 * @param2 [number]: New X offset
		 * @return [string]: Key of direction we're travelling
		 */
		calcDirection: function (offsetFrom, offsetTo) {
			var direction = KEY.DIRECTION.NONE;

			direction = (offsetFrom > offsetTo) ? KEY.DIRECTION.LEFT : direction;
			direction = (offsetFrom < offsetTo) ? KEY.DIRECTION.RIGHT : direction;

			return direction;
		},
		/**
		 * Calculate a new left offset for the handle based on its starting left and the overall mouse distance
		 * travelled from its own starting left
		 * @param1 [number]: Origin left offset of handle
		 * @param2 [number]: Distance travelled by mouse away from its starting X
		 * @param3 [number]: The permitted range upper limit (lower = 0)
		 * @return [number]: The new left offset kept within given range
		 */
		calcNewLeft: function (startLeft, distance, range) {
			var newLeft = startLeft + distance;

			return that.limitRange(newLeft, range);
		},
		/**
		 *  Calculate the distance between the new X coordinate and the initial X
		 *  @param1 number: New X coordinate
		 *  @param2 number: Origin X coordinate
		 *  @return number Distance between two (can be negative for left travel)
		 */
		calcDistanceFromOrigin: function (newX, originX) {
			return newX - originX;
		},
		/**
		 *  Return a new offset that restrains the calculated offset to within the scrubber boundaries
		 *  @param1 [number]: Calculated offset of the handle
		 *  @param2 [number]: Upper limit for handle X (derived from width of scrubber bar)
		 *  @return [number]: New offset that has been kept within limits (if necessary)
		 */
		limitRange: function (offset, upperLimit) {
			var lowerLimit = 0;
			var	newOffset = offset;

			newOffset = (newOffset < lowerLimit) ? lowerLimit : newOffset;
			newOffset = (newOffset > upperLimit) ? upperLimit : newOffset;

			return newOffset;
		},
		/**
		 * Finds the nearest slot to the handle and then moves the handle to its coordinates
		 * @param1 [object]: Object with scrub information
		 */
		moveHandleToNextSlot: function (scrub) {
			var nextSlot = {};

			if (scrub.direction === KEY.DIRECTION.NONE) {
				nextSlot = that.findNearestSlot(scrub.currentLeft, scrub.checkpoints);
			} else {
				nextSlot = that.findNextSlot(scrub.currentLeft, scrub.checkpoints, scrub.direction);
			}

			that.animateHandle(scrub.$handle, nextSlot.centre, TRANSITION.SNAP);
			that.showSide(nextSlot.showSide);
		},
		/**
		 *  Calculates the nearest slot to the handle in the direction its travelling
		 *  @parma1 [number]: Current left offset of handle
		 *  @param2 [array]: Array of checkpoint objects
		 *  @return [object]: Checkpoint object nearest to handle
		 */
		findNearestSlot: function (offset, checkpoints) {
			var segmentHalfLength = checkpoints[1].centre / 2;
			var	numberOfSegments = checkpoints.length;
			var	nearestSlot = checkpoints[0];

			for (var i = (numberOfSegments - 1); i >= 0; i--) {
				if (offset <= checkpoints[i].centre + segmentHalfLength) {
					nearestSlot = checkpoints[i];
				}
			}

			return nearestSlot;
		},
		/**
		 *  Finds the next slot to the handle in the direction provided.
		 *  A bit clumsy but couldn't yet think of a better way of architecting this
		 *  @parma1 [number]: Current left offset of handle
		 *  @param2 [array]: Array of checkpoint objects
		 *  @param3 [string]: Direction user is currently travelling
		 *  @return [object]: Checkpoint object nearest to handle
		 */
		findNextSlot: function (offset, checkpoints, direction) {
			var numberOfSegments = checkpoints.length;
			var	nextSlot = {};
			var i = 0;
			if (direction === KEY.DIRECTION.RIGHT) {
				for (i = 0; i < numberOfSegments; i++) {
					if (offset < checkpoints[i].centre) {
						nextSlot = checkpoints[i];
						break;
					}
				}
			} else {
				for (i = (numberOfSegments - 1); i >= 0; i--) {
					if (offset > checkpoints[i].centre) {
						nextSlot = checkpoints[i];
						break;
					}
				}
			}

			return nextSlot;
		},
		/**
		 *  Animate the handle to a destination
		 *  @param1 [jQuery object]: The handle being moved
		 *  @param2 [number]: The left offset to animate to
		 *  @param3 [string]: The transition type we want to use (hooks into CSS)
		 */
		animateHandle: function ($handle, offset, animateType) {
			animateType = animateType || TRANSITION.SNAP;

			$handle
				.attr(KEY.DATA.TRANSITION, animateType)
				.css({
					'transform': 'translate3d(' + offset  + 'px, 0, 0)',
					'-webkit-transform': 'translate3d(' + offset  + 'px, 0, 0)'
				});
		},
		/**
		 *  User has initiated an instant step change, currently by clicking on a step indicator
		 *  @param1 [jQuery object]: The step indicator we want to instantly switch to
		 */
		stepInstant: function ($step) {
			var $scrubber = $step.closest(SELECTOR.SCRUBBER);
			var	$handle = $scrubber.find(SELECTOR.SCRUBBER_HANDLE);
			var	stepData = that.scrapeCheckpoints($step)[0];

			$(SELECTOR.SELECTED).removeClass(CLASS.SELECTED);
			$step.addClass(CLASS.SELECTED);

			that.animateHandle($handle, stepData.centre, TRANSITION.GLIDE);
			that.showSide(stepData.showSide);
		},
		/**
		 *  Create an array of cached data for each slot in the current scrubber
		 *  @param1 [jQuery object]: Collection of slots on the current scrubber
		 *  @return [array]: Array of cached slot data
		 *  centre [number]: The left offset of the slot
		 *  showSide [string]: Class to append to the view container when activated
		 */
		scrapeCheckpoints: function ($slots) {
			var checkpoints = [];

			$slots.each(function (i, el) {
				var $slot = $(el),
					checkpoint = {
						centre: $slot.position().left,
						showSide: $slot.data(KEY.DATA.SHOW_SIDE)
					};

				checkpoints.push(checkpoint);
			});

			return checkpoints;
		},
		bindEvents: function () {
			$('body')
				.on('mousedown', SELECTOR.SCRUBBER_HANDLE, function (e) {
					e.preventDefault();
					that.startScrub(e.pageX, $(this));
				})

				.on('mousemove', function (e) {
					if (that.thisScrub) {
						e.preventDefault();
						that.scrubTo(e.pageX);
					}
				})

				.on('mouseup', function (e) {
					if (that.thisScrub) {
						that.endScrub(e.pageX);
					}
				})

				.on('click touchstart', SELECTOR.STEP, function (e) {
					e.preventDefault();
					that.stepInstant($(this));
				})

				.on('touchstart', SELECTOR.SCRUBBER_HANDLE, function (e) {
					e.preventDefault();
					that.startScrub(e.originalEvent.touches[0].pageX, $(this));
				})

				.on('touchmove', function (e) {
					if (that.thisScrub && e.originalEvent.changedTouches.length === 1) {
						e.preventDefault();
						that.scrubTo(e.originalEvent.changedTouches[0].pageX);
					}
				})

				.on('touchend', function (e) {
					if (that.thisScrub) {
						e.preventDefault();
						that.endScrub(e.originalEvent.changedTouches[0].pageX);
					}
				});
			that.eventsBinded = true;
		},
		isSupports3D: function() {

			if ( that.supports3D === null ) {
				var el = document.createElement('p');
				var	has3d;
				var	transforms = {
					'webkitTransform':'-webkit-transform',
					'OTransform':'-o-transform',
					'msTransform':'-ms-transform',
					'MozTransform':'-moz-transform',
					'transform':'transform'
				};

				document.body.insertBefore(el, null);

				for (var t in transforms) {
					if (el.style[t] !== undefined) {
						el.style[t] = 'translate3d(1px,1px,1px)';
						has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
					}
				}

				document.body.removeChild(el);

				if ( PBX.utils.isAndroid() ) {
					has3d = undefined;
				}

				if (has3d === undefined || !has3d.length || has3d === 'none' || window.ActiveXObject || 'ActiveXObject' in window) {
					that.supports3D = false;
				} else {
					that.supports3D = true;
				}
			}

			return that.supports3D;
		},
		check3dSupport: function () {
			if ( !that.isSupports3D() ) {
				$('.preserve3d').addClass('no-preserve3d').removeClass('preserve3d');
				$('#scrubber-title').remove();
			}
		}
	};
	var that = process;
	return process;
})(BXT, $, PBX);

BXT.PSCatalog = (function (BXT, $, PSConfig, PBX) {
	var openClassName = 'open';
	var selectedClassName = 'selected';
	var invertedClassName = 'inverted';
	var filterIdPrefix = 'filter-select-';
	var optionIdPrefix = 'filter-option-';
	var selectedOptionIdPrefix = 'filter-selected-option-';
	var clearFilterLinkIdPrefix = 'clear-filters-link';
	var designIdPrefix = 'design-';
	var designsIsLoading = false;
	var designsLoadLastCallback = null;
	var isFirstLoad = true;
	var componentSelector = '#papershaker-catalogue';
	var mobileView = PBX.utils.isMobile();
	var lastScrollPos = -1;

	var process = {
		occasion: PSConfig.occasion || '',
		occasionCategory: PSConfig.occasionCategory || '',
		filteredUrlBase: PSConfig.filteredUrlBase || 'filtered',
		limit: PSConfig.limit || 15,
		filters: [],
		selectedFilters: [],
		designs: [],
		totalResults: PSConfig.totalResults || 0,
		selectedDesign: null,
		maxFilterSelectedOptions: PSConfig.maxFilterSelectedOptions || 3,
		studioBaseUrl: PSConfig.studioBaseUrl || '',
		closeWindow: PSConfig.closeWindow,
		designTypesLocalization: {},
		init: function () {
			// reset values
			isFirstLoad = true;
			that.filters = [];
			that.selectedFilters = [];
			that.designs = [];

			that.loadFilters(that.onFiltersLoaded);

			// design types localization
			var $designTemplateEl = $(BXT.templater.cleanTemplate($('#design-template').html())).find('.flat-price');
			var data = $designTemplateEl.data();
			for (var key in data) {
				if (data.hasOwnProperty(key)) {
					that.designTypesLocalization[key] = data[key];
				}
			}

			// check for mobile
			if ( mobileView ) {
				$('main').addClass('mobile');

				var $quickLookEl = $('#quick-look');

				if ( $quickLookEl.length ) {

					var $mobileContainerEl = $('.quick-look-container');

					$mobileContainerEl.prepend($quickLookEl);

					// move the button
					var $personaliseButton = $quickLookEl.find('#personalise-design-link');
					$personaliseButton.removeClass('right-arr');
					$personaliseButton.insertBefore('.more-info');

					// Add close link to the bottom
					if(that.closeWindow) {
						var mobileCloseLink = '<a class="quick-look-close-link">' + that.closeWindow + '>></a>';
						$('.design-wrapper').append(mobileCloseLink);
					}

					$('body').prepend($mobileContainerEl);


					// HACK!
					if ( PBX.utils.isIPad() && $mobileContainerEl.hasClass('tablet') ) {
						$mobileContainerEl.removeClass('tablet');
						$mobileContainerEl.addClass('ipad');
					}
				}

			}
		},
		setupHandlers: function () {
			$('[id^="' + clearFilterLinkIdPrefix + '"]').on('click', function click(event) {
				that.onClearFiltersLinkClick(event);
				return false;
			});

			window.addEventListener('popstate', function(event) {
				that.onURLChanged(event);
			});

			$('#close-quick-look').on('click', function click(event) {
				that.hideQuickLook();
				return true;
			});

			if ( mobileView ) {
				$('.quick-look-close-link').on('click', function click(event) {
					that.hideQuickLook();
					return true;
				});
			}

			$('#quick-look-prev').on('click', function click(event) {
				that.changeSelectedDesign(-1);
				return true;
			});
			$('#quick-look-next').on('click', function click(event) {
				that.changeSelectedDesign(1);
				return true;
			});
			$('#quantity-selector').change(function (event) {
				that.onQuantitySelectorChange(event);
				return true;
			});

			that.initScrollHandling();
			that.updateFiltersElementsPosition();

			PBX.utils.resizeFuncs.push({ ctx: this, func: this.resizeHandler});
		},
		getOptionData: function (filter, option) {
			for (var i = 0, l = that.filters.length; i < l; i++) {
				if (that.filters[i].name === filter) {
					for (var j = 0, sl = that.filters[i].sections.length; j < sl; j++) {
						for (var k = 0, ol = that.filters[i].sections[j].values.length; k < ol; k++) {
							if (that.filters[i].sections[j].values[k].value === option) {
								return that.filters[i].sections[j].values[k];
							}
						}
					}
				}
			}
		},
		getDesignData: function (design) {
			for (var i = 0, l = that.designs.length; i < l; i++) {
				if (that.designs[i].id === design) {
					return that.designs[i];
				}
			}
		},
		/**
		 * return base path for ajax request
		 * @returns {url|string}
		 */
		getBasePath: function(action) {
			var path = window.location.origin;
			var contextPath = $('#node-'+PBX.utils.getNodeId()).data('ajax-url');
			var $catalogueEl = $(componentSelector);
			path = contextPath === '' || contextPath === null ? path : path + contextPath;
			return path + '/.rest/lazycards/v1/' + action + '?nid=' + $catalogueEl.data('node-id') + '&nlocale=' +
				$catalogueEl.data('ajax-locale') + '&bsessioncode=' + $catalogueEl.data('ajax-session-code') + '&bchannelid=' + $catalogueEl.data('ajax-channel-id');
		},
		getFilteredUrl: function (sort) {
			var filters = [];
			for (var i = 0, l = that.filters.length; i < l; i++) {
				var filter = that.filters[i].name;
				var options = [];
				for (var j = 0, sl = that.filters[i].sections.length; j < sl; j++) {
					for (var k = 0, ol = that.filters[i].sections[j].values.length; k < ol; k++) {
						var option = that.filters[i].sections[j].values[k].value;
						if (that.isSelected(filter, option)) {
							options.push(option);
						}
					}
				}
				if (options.length){
					if (sort) {
						options.sort();
					}
					filters.push(filter + '=' + options.join(':'));
				}
			}
			if (sort) {
				filters.sort(function(a, b){
					var bs = b.split('=')[0];
					var as = a.split('=')[0];
					return (as > bs) ? 1 : (as < bs) ? -1 : 0;
				});
			}
			return filters.join(',');
		},
		showLoader: function () {
			$('.cards-loader').removeClass('hidden');
		},
		hideLoader: function () {
			$('.cards-loader').addClass('hidden');
		},
		loadFilters: function (callback) {
			var options = {
				success: callback
			};
			PBX.utils.loadData(that.getBasePath('filters') + '&occasionCategory=' + that.occasionCategory.value +
				'&occasionName=' + that.occasion.value, options);
		},
		loadDesigns: function (callback, force) {
			// We've reached the load limit so don't allow this to go fetch more data,
			// or all designs have been loaded
			if ( !force && that.designs.length >= that.totalResults ) {
				return;
			}

			// TODO: Is this boolean really required? The callback is always the same and without the request
			// it won't have any affect
			if (!designsIsLoading){
				if (!isFirstLoad) {
					that.showLoader();
				}
				designsIsLoading = true;
				var options = {
					success: function (data) {
						designsIsLoading = false;
						if (designsLoadLastCallback) {
							that.loadDesigns(designsLoadLastCallback);
							designsLoadLastCallback = null;
						} else {
							that.hideLoader();
							callback(data);
						}
					}
				};
				var filter = that.selectedFilters.length === 0 ? '' : ('&filter=' + that.getFilteredUrl(true));

				var loadUrl = that.getBasePath('designs') + '&occasionCategory=' + that.occasionCategory.value +
					'&occasionName=' + that.occasion.value + '&skip=' + that.designs.length + '&limit=' + that.limit + filter;

				PBX.utils.loadData(loadUrl, options);
			} else {
				designsLoadLastCallback = callback;
			}
		},
		updateURL: function () {
			if (window.history && window.history.pushState) {
				var href = window.location.href;
				var params = '';
				if (href.indexOf('?') !== -1) {
					var arr = href.split('?');
					href = arr[0];
					params += '?' + arr[1];
				}
				var url = href.split('/' + that.filteredUrlBase)[0] + '/' + that.filteredUrlBase + '/' +
					that.getFilteredUrl(true) + params;

				if (that.selectedFilters.length === 0) {
					url = url.replace('/' + that.filteredUrlBase + '/', '');
				}
				if (url !== href){
					window.history.pushState(null, null, url);
				}
			}
		},
		parseURL: function() {
			var href = window.location.href;
			that.selectedFilters = [];
			if (href.indexOf(that.filteredUrlBase) !== -1) {
				var filters = href.split(that.filteredUrlBase + '/')[1].split('?')[0].split(',');
				for (var i = 0, l = filters.length; i < l; i++) {
					var filter = filters[i].split('=')[0];
					var options = filters[i].split('=')[1].split(':');
					for (var j = 0, ol = options.length; j < ol; j++) {
						that.setSelected(filter, options[j]);
					}
				}
			}
		},
		updateAsyncReloadUrl: function () {
			var $catalogueEl = $(componentSelector);
			var url = $catalogueEl.data('replacement-url');
			$catalogueEl.data('replacement-url', url.split('filter=')[0] + 'filter=' + that.getFilteredUrl(true));
		},
		isSelected: function (filter, option) {
			for (var i = 0, l = that.selectedFilters.length; i < l; i++) {
				if (that.selectedFilters[i].filter === filter && that.selectedFilters[i].option === option) {
					return true;
				}
			}
			return false;
		},
		setSelected: function (filter, option) {
			if (!that.isSelected(filter, option)) {
				that.selectedFilters.push({
					filter: filter,
					option: option
				});
			}
		},
		setUnselected: function (filter, option) {
			for (var i = 0, l = that.selectedFilters.length; i < l; i++) {
				if (that.selectedFilters[i].filter === filter && that.selectedFilters[i].option === option) {
					that.selectedFilters.splice(i, 1);
					return;
				}
			}
		},
		getFilterIdByElement: function ($filterEl) {
			return that.getIdByElement($filterEl, filterIdPrefix);
		},
		getOptionIdByElement: function ($optionEl) {
			return that.getIdByElement($optionEl, optionIdPrefix);
		},
		getSelectedOptionIdByElement: function ($optionEl) {
			return that.getIdByElement($optionEl, selectedOptionIdPrefix);
		},
		getDesignIdByElement: function ($designEl) {
			return that.getIdByElement($designEl, designIdPrefix);
		},
		getIdByElement: function ($element, prefix) {
			return $element.attr('id').substring(prefix.length);
		},
		getElementById: function (id) {
			return $('#' + designIdPrefix + id);
		},
		getNextRowDesignElement: function ($el) {
			var $designsEl = $('#designs');
			var $designs = $designsEl.find('[id^="' + designIdPrefix + '"]');
			var inRow = Math.round($designsEl.width() / $el.width());
			var $nextElement = null;
			$el.nextAll('[id^="' + designIdPrefix + '"]').each(function() {
				var $designEl = $(this);
				var index = $designs.index($designEl);
				if (index % inRow === 0) {
					$nextElement = $designEl;
					return false;
				}
			});
			return $nextElement;
		},
		normalizeDesignsData: function (data) {
			for (var i = 0, l = data.length; i < l; i++) {
				var designItem = data[i];
				designItem.imageUrl = designItem.previewImages[0].cataloguePageThumbUrl;
				designItem.typeName = that.designTypesLocalization[designItem.type];
			}
			return data;
		},
		changeSelectedDesign: function (direction) {
			var $designsEl = $('#designs');
			var $designEl = $designsEl.find('#' + designIdPrefix + that.selectedDesign);
			var $newDesignEl;
			if (direction === 1) {
				$newDesignEl = $designEl.nextAll('[id^="' + designIdPrefix + '"]');
			} else {
				$newDesignEl = $designEl.prev('[id^="' + designIdPrefix + '"]');
			}
			if ($newDesignEl.length) {
				that.selectedDesign = that.getDesignIdByElement($($newDesignEl[0]));
				that.onSelectedDesignChanged();
			}
		},
		prepareFiltersElements: function () {
			$('#filters-list [id^="' + filterIdPrefix + '"]').each(function() {
				var filter = $(this);
				filter.find('.trigger').on('click', function click(event) {
					that.onFilterTriggerClick(filter);
					return true;
				});
				filter.find('.options .option').on('click', function click(event) {
					that.onFilterOptionClick(filter, $(event.currentTarget));
					return true;
				});
			});
			$('body').on('click', function click(event) {
				that.onBodyClick(event);
				return true;
			});
			that.updateFiltersElements();
			that.updateClearFiltersLink();
			that.updateFiltersInfo();
		},
		updateFiltersElementsPosition: function () {
			var $filtersListEl = $('#filters-list');
			var center = $filtersListEl.width() * 0.5;
			$filtersListEl.find('[id^="' + filterIdPrefix + '"]').each(function() {
				var $filterEl = $(this);
				var $filterOptionsEl = $filterEl.find('.options');
				if ($filterEl.position().left > center) {
					$filterOptionsEl.addClass(invertedClassName);
				} else {
					$filterOptionsEl.removeClass(invertedClassName);
				}
			});
		},
		updateFiltersElements: function () {
			$('#filters-list [id^="' + filterIdPrefix + '"]').each(function() {
				var $filterEl = $(this);
				var filter = that.getFilterIdByElement($filterEl);
				$filterEl.find('.options .option').each(function() {
					var $optionEl = $(this);
					var option = that.getOptionIdByElement($optionEl);
					if (that.isSelected(filter, option)){
						$optionEl.addClass(selectedClassName);
					} else {
						$optionEl.removeClass(selectedClassName);
					}
				});
				var $selectedOptionsEl = $filterEl.find('.selected-options');
				$selectedOptionsEl.html('');
				var optionsCount = 0;
				for (var i = 0, l = that.selectedFilters.length; i < l; i++) {
					if (that.selectedFilters[i].filter === filter) {
						if (optionsCount + 1 === that.maxFilterSelectedOptions) {
							$selectedOptionsEl.append($('#filter-select-selected-option-button-template').html());
							break;
						}
						var optionData = that.getOptionData(filter, that.selectedFilters[i].option);
						if (optionData) {
							if (optionData.valueEntryText){
								optionData.displayValue = optionData.valueEntryText;
							}
							if (optionData.imageUrl){
								optionData.displayImage = optionData.imageUrl;
							}
							var optionHtml = BXT.templater.buildTemplate($('#filter-select-selected-option-template').html(),
								optionData, null, []);
							optionHtml = BXT.templater.cleanTemplate(optionHtml);
							$selectedOptionsEl.append(optionHtml);
							optionsCount++;
						}
					}
				}
				$('#' + filterIdPrefix + filter + ' .selected-options .option').on('click', function click(event) {
					that.onFilterSelectedOptionClick($filterEl, $(event.target));
					return false;
				});
				$('#' + filterIdPrefix + filter + ' .selected-options .option-button').on('click', function click(event) {
					that.onFilterMoreButtonClick($filterEl);
					return false;
				});
			});
		},
		updateDesignsElements: function () {
			var $designsEl = $('#designs');
			$designsEl.find('[id^="' + designIdPrefix + '"]').each(function() {
				var $designEl = $(this);
				var design = that.getDesignIdByElement($designEl);
				if (!that.getDesignData(design)) {
					$designEl.remove();
				}
			});
			for (var i = 0, l = that.designs.length; i < l; i++) {
				var designItem = that.designs[i],
					$el,
					$cardWrap,
					$childEl;
				if (!$designsEl.find('[id^="' + designIdPrefix + designItem.id + '"]').length) {
					var designHTML = BXT.templater.buildTemplate($('#design-template').html(),
						that.designs[i], null, []);
					designHTML = BXT.templater.cleanTemplate(designHTML);
					$designsEl.append(designHTML);
					$el = $designsEl.find('#' + designIdPrefix + that.designs[i].id);
					$cardWrap = $el.find('.card-design');
					$childEl = $cardWrap.children();
					$cardWrap.on('click', $childEl, that.onDesignClick);
				}
			}
		},
		removeAllDesignElements: function () {
			$('#designs [id^="' + designIdPrefix + '"]').remove();
		},
		updateClearFiltersLink: function () {
			var $linkEl = $('#clear-filters-link');
			if (that.selectedFilters.length) {
				$linkEl.show();
			} else {
				$linkEl.hide();
			}
		},
		updateFiltersInfo: function () {
			var $appliedEl = $('#filters-info #filters-applied');
			if (that.selectedFilters.length) {
				$appliedEl.text(that.selectedFilters.length + ' ' + $appliedEl.data('applied') + ' - ');
				$appliedEl.show();
			} else {
				$appliedEl.hide();
			}
		},
		updateResultsFoundInfo: function () {
			var $resultsEl = $('#filters-info #results-found');
			$resultsEl.text(that.totalResults + ' ' + $resultsEl.data('results'));
		},
		initScrollHandling: function(){
			$(window).scroll(function(event) {
				that.onScroll();
				return true;
			});
			that.onScroll();
		},
		closeAllFilters: function () {
			$('[id^="' + filterIdPrefix + '"]').each(function() {
				$(this).removeClass(openClassName);
			});
		},
		showQuickLook: function () {
			$('#quick-look').addClass(openClassName);

			if ( mobileView ) {
				var $mobileContainerEl = $('.quick-look-container');
				var bodyEl = $('body')[0];

				// NOTE: This is a hack to work around a limitation on mobile browsers where they assume you haven't
				// considered mobile design by overlaying a static div on top of scrollable content.  (ie the content
				// behind the overlay is still scrollable.)  
				lastScrollPos = bodyEl.scrollTop;
				bodyEl.style.top = (-lastScrollPos) + 'px';

				$mobileContainerEl.removeClass('hidden');
				// stop the page underneath from scrolling
				// TODO: overflow-y should have never been set on the html tag in the first place... but it is what it is 
				$('html').addClass('quick-look__no-scroll');
				$('body').addClass('quick-look__no-scroll');
				$('main').css('display','none');
			
			}
		},
		hideQuickLook: function () {
			$('#quick-look').removeClass(openClassName);

			if ( mobileView ) {
				var $mobileContainerEl = $('.quick-look-container');
				var bodyEl = $('body')[0];

				bodyEl.style.top = 0;
				bodyEl.scrollTop = lastScrollPos;


				$mobileContainerEl.addClass('hidden');
				$('html').removeClass('quick-look__no-scroll');
				$('body').removeClass('quick-look__no-scroll');
				$('main').css('display','block');

			}
		},
		updateQuickLookPosition: function () {
			var $quickLookEl = $('#quick-look');
			var $designEl = that.getElementById(that.selectedDesign);
			var $nextRowEl = that.getNextRowDesignElement($designEl);
			if ($nextRowEl) {
				$($nextRowEl).before($quickLookEl);
			} else {
				$('#designs [id^="' + designIdPrefix + '"]').last().after($quickLookEl);
			}
			that.updateQuickLookArrowPosition(true);
		},
		updateQuickLookArrowPosition: function (animate) {
			var $quickLookArrEl = $('#quick-look-arrow');
			var $designEl = that.getElementById(that.selectedDesign);
			if ($designEl.length) {
				var newPos = $designEl.position().left + $designEl.width() * 0.5;
				if (animate) {
					$quickLookArrEl.animate({left: newPos});
				} else {
					$quickLookArrEl.css('left', newPos);
				}
			}
		},
		updateQuickLookData: function () {
			var $quickLookEl = $('#quick-look');
			var designData = that.getDesignData(that.selectedDesign);
			var $designEl = that.getElementById(that.selectedDesign);
			var $currentDesignPosition = $quickLookEl.find('#current-design-position');
			$currentDesignPosition.text(
				PBX.utils.insertValuesIntoString($currentDesignPosition.data('text'),
					[$('#designs [id^="' + designIdPrefix + '"]').index($designEl) + 1, that.totalResults])
			);
			$quickLookEl.find('#quick-look-design-title').text(designData.designName);
			var $formatEl = $quickLookEl.find('#quick-look-design-format');
			var formatString = $formatEl.data('intro');
			if (formatString) {
				$formatEl.text(formatString.replace('{format}', designData.format).replace('{size}', designData.sizeDescription));
			} else {
				$formatEl.text($formatEl.data('pack') + ' ' + designData.format + ' ' + $formatEl.data('cards') + ', ' + designData.sizeDescription);
			}
			$quickLookEl.find('#quick-look-design-preview img').attr('src', designData.imageUrl);
			var $selectEl = $('#quantity-selector');
			$selectEl.empty();
			var optionsHtml = '';
			for (var i = 0, l = designData.prices.length; i < l; i++) {
				var option = designData.prices[i];
				var oldPriceRich = '';
				var oldPrice = '';
				var priceRich = option.unitPrice;
				if (option.nonPromoUnitPrice ) {
					oldPriceRich = option.nonPromoUnitPrice ? '<span class="old">' + option.nonPromoUnitPrice + '</span> ' : '';
					oldPrice = ' ' + $selectEl.data('was') + ' ' + option.nonPromoUnitPrice + ' ' + $selectEl.data('now');
					priceRich = '<span class="new">' + priceRich + '</span>';
				}
				var richText = '<span class="quantity">' + option.quantity + ' ' + $selectEl.data('cards') + ' <span class="per-card">(' +
					option.price + ' ' + $selectEl.data('per-card') + ')</span></span> <span class="price">' + oldPriceRich + priceRich + '</span>';
				var text = option.quantity + ' ' + $selectEl.data('cards') + '(' + option.price + ' ' + $selectEl.data('per-card') + ')' +
					oldPrice + ' ' + option.unitPrice;
				optionsHtml += '<option value="' + option.quantity + '" data-rich-text="' + PBX.utils.htmlEscape(richText) + '">' + text + '</option>';
			}
			$selectEl.append(optionsHtml);
			$selectEl.trigger('update');
			that.updatePersonalizeDesignURL();
			BXT.PS3dView.buildView(designData);
		},
		updatePersonalizeDesignURL: function () {
			var $catalogueEl = $(componentSelector);
			var $quickLookEl = $('#quick-look');
			var designData = that.getDesignData(that.selectedDesign);

			var $selectEl = $('#quantity-selector');
			var quantity;
			if ($selectEl.find(':selected').length) {
				quantity = $selectEl.find(':selected').attr('value');
			} else {
				quantity = $selectEl.find('[selected="selected"]').attr('value');
			}

			var url = that.studioBaseUrl + '?redirect=' + encodeURIComponent(window.location.href) +
				'&designId=' + designData.id + '&product_id=' + designData.productId +
				'&designType=catalogue&quantity=' + (quantity / 10) +
				'&channelBasedPrices=' + $(componentSelector).data('ajax-channel-based-prices') +
				'&nid=' + $catalogueEl.data('node-id') + '&nlocale=' + $catalogueEl.data('ajax-locale');

			$quickLookEl.find('#personalise-design-link').attr('href', url);
		},
		updateNoDesignsMessage: function () {
			var $noDesignsEl = $('#no-cards');
			if (that.designs.length) {
				$noDesignsEl.addClass('hidden');
			} else {
				$noDesignsEl.removeClass('hidden');
			}
		},
		scrollToQuickLook: function () {
			var $quickLookEl = $('#quick-look');
			$('html, body').scrollTop($quickLookEl.offset().top - ($(window).height() - $quickLookEl.height()) * 0.5);
		},
		onURLChanged: function () {
			that.parseURL();
			that.onFiltersChanged();
		},
		onFiltersLoaded: function (data) {
			that.filters = data;
			that.parseURL();
			that.prepareFiltersElements();
			that.loadDesigns(that.onDesignsLoaded);
		},
		onDesignsLoaded: function (data) {
			if (!that.designs.length) {
				that.removeAllDesignElements();
			}
			that.designs = that.designs.concat(that.normalizeDesignsData(data.designs));
			that.totalResults = data.totalResults;

			that.updateDesignsElements();
			that.updateResultsFoundInfo();
			that.updateNoDesignsMessage();
			
			if (isFirstLoad) {
				that.setupHandlers();
				isFirstLoad = false;
			}

		},
		onFiltersChanged: function() {
			that.hideQuickLook();
			that.updateFiltersElements();
			that.updateClearFiltersLink();
			that.updateFiltersInfo();
			that.updateFiltersElementsPosition();
			that.updateURL();
			that.updateAsyncReloadUrl();
			that.designs = [];

			that.loadDesigns(that.onDesignsLoaded, true);
		},
		onScroll: function () {
			var lastEl = $('#designs [id^="' + designIdPrefix + '"]').last();
			if (lastEl.offset()) {
				var maxScroll = lastEl.offset().top - $(window).height();
				var scroll = $(window).scrollTop();

				if (maxScroll - scroll < 10 && that.totalResults > that.designs.length) {
					that.loadDesigns(that.onDesignsLoaded);
				}
			}
		},
		onSelectedDesignChanged: function() {
			that.updateQuickLookData();
			if ( !mobileView ) {
				// For mobile the view remains in a static position and doesn't require to it's position to be update
				that.updateQuickLookPosition();
			}
			
			that.showQuickLook();
			that.scrollToQuickLook();
		},
		onFilterTriggerClick: function ($filterEl) {
			if ($filterEl.hasClass(openClassName)){
				$filterEl.removeClass(openClassName);
			} else {
				that.closeAllFilters();
				$filterEl.addClass(openClassName);
			}
		},
		onFilterOptionClick: function ($filterEl, $optionEl) {
			var filter = that.getFilterIdByElement($filterEl);
			var option = that.getOptionIdByElement($optionEl);
			if ($optionEl.hasClass(selectedClassName)){
				that.setUnselected(filter, option);
			} else {
				that.setSelected(filter, option);
			}
			that.onFiltersChanged();
		},
		onFilterSelectedOptionClick: function ($filterEl, $optionEl) {
			var filter = that.getFilterIdByElement($filterEl);
			var option = that.getSelectedOptionIdByElement($optionEl);
			that.setUnselected(filter, option);
			that.onFiltersChanged();
		},
		onFilterMoreButtonClick: function ($filterEl) {
			if (!$filterEl.hasClass(openClassName)){
				that.closeAllFilters();
				$filterEl.addClass(openClassName);
			}
		},
		onClearFiltersLinkClick: function(event){
			that.selectedFilters = [];
			that.closeAllFilters();
			that.onFiltersChanged();
		},
		onDesignClick: function (event) {
			var $designItemClicked = $(event.currentTarget).closest('div.design');
			that.selectedDesign = that.getDesignIdByElement($designItemClicked);
			that.onSelectedDesignChanged();
		},
		onQuantitySelectorChange: function (event) {
			that.updatePersonalizeDesignURL();
		},
		onBodyClick: function(event){
			if(!$(event.target).is('[id^="' + filterIdPrefix + '"]') &&
				!$('[id^="' + filterIdPrefix + '"]').has(event.target).length) {
				that.closeAllFilters();
			}
			return true;
		},
		resizeHandler: function () {
			that.updateFiltersElementsPosition();
			that.updateQuickLookArrowPosition();
		}
	};
	var that = process;
	PBX.utils.functionList.push({ test: componentSelector, func: process.init, ctx: process });
	return process;
})(BXT, $, PSConfig, PBX);
