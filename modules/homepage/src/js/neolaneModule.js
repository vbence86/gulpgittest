var FLEXI = window.FLEXI || {};

FLEXI.neolane = (function (FLEXI, $) {
	var memberID = null;
	var isUserLogged = false;
	var dataTableInteraction = {
		data: [
			{
				id: 'Tiles',
				offerSpace: 'phxMagWebHP4BlocksBottom'
			},
			{
				id: 'Float',
				offerSpace: 'phxMagWebFloat'
			},
			{
				id: 'Hero',
				offerSpace: 'phxMagWebCarousel'
			}
		]
	};

	var PropertyTypes = {
		IMAGE: 'image',
		TITLE: 'title',
		SUBTITLE: 'subtitle',
		CTA: 'cta',
		URL: 'url',
		UPDATE_STATUS_URL: 'unitaryupdatestatusurl'
	};
	
	var process = {

		init: function() {

			// We dont do Neolane interaction for mobile
			// NB: best get this confirmed? LA - 09/09/2015
			if(FLEXI.utils.isMobile()){
				return;
			}
			isUserLogged = FLEXI.neolane.isLogged();

			// LOOGED USERS
			if (isUserLogged) {
				memberID = FLEXI.neolane.getMemberID();
			}else{
				memberID = FLEXI.neolane.getMemberIDFromCookie();
			}

			if(memberID !== null){
				window.interactionTarget = memberID + '|photobox';
				FLEXI.neolane.execInteraction();
			}
		},

		isLogged: function(){
			return (window.dataLayer && window.dataLayer.length && window.dataLayer[0].uid) ? true : false;
		},

		getMemberIDFromCookie: function(){
			var member_id = FLEXI.utils.getCookieString('analytics_member_infos', 'member_id');
			return (member_id) ? member_id : null;
		},

		getMemberID: function(){
			var uid = window.dataLayer[0].uid;
			return (uid) ? uid : null;
		},

		checkInteractionDivs: function(div) {
			var i, nbrDiv = 0;
			for (i = 0; i < div.length; i += 2) {
				if (document.getElementById(div[i])) {
					window.interactionDivs[div[i]] = {
						space: div[i + 1]
					};
					nbrDiv++;
				}
			}
			return nbrDiv;
		},

		parseNodeToJson: function(node) {
			
			var affectedNode = node.getAttribute('div');

			if ( affectedNode === null ) {
				return null;
			}

			var json = {};
			json.affectedNode = affectedNode;
			json.rank = node.getAttribute('rank');
			json.weight = node.getAttribute('weight');
			json.position = json.weight - 1;
			json.space = node.getAttribute('space');

			// based on the structure of the document I'm assuming each <proposition>
			// will only every have 1 <view> node.  Hopefully this assumption is correct.
			// since the rank & weight are applied to a <proposition> level I'm certain it is.
			var view = node.childNodes[0];

			for ( var i=0; i < view.childNodes.length; i++ ) {
				var nextViewNode = view.childNodes[i];
				var nextViewTag = nextViewNode.tagName.toLowerCase();
				var nextViewContent = nextViewNode.textContent;

				if ( !nextViewTag || !nextViewContent ) {
					continue;
				}

				if ( ~nextViewTag.indexOf(PropertyTypes.IMAGE) ) {
					json[PropertyTypes.IMAGE] = nextViewContent;

				} else if ( ~nextViewTag.indexOf(PropertyTypes.SUBTITLE) ) {
					if ( typeof json.subtitles === 'undefined' ) {
						json.subtitles = [];
					}

					// there can be multiple subtitles so we store them in an array
					// they are named subtitle, subtitle2 etc
					var indexString = nextViewTag.match(/\d+$/);
					var index = (indexString !== null && indexString.length ) ? parseInt(indexString[0], 10) : 1;
					
					if ( !isNaN(index) ) {
						index -= 1;
						json.subtitles[index] = nextViewContent;
					}
					

				} else if ( ~nextViewTag.indexOf(PropertyTypes.TITLE) ) {
					json[PropertyTypes.TITLE] = nextViewContent;

				} else if ( ~nextViewTag.indexOf(PropertyTypes.UPDATE_STATUS_URL) ) {
					json.updateStatusUrl = nextViewContent;

				} else if ( ~nextViewTag.indexOf(PropertyTypes.URL) ) {
					json.url = nextViewContent;

					// it's a relative link so let's make it absolute
					if ( !~json.url.indexOf('http') ) {
						var location = window.location;

						var url = location.protocol + '//' + location.hostname;
						url += ( location.port && location.port !== '80' ) ? ':' + location.port : '';
						url += ( location.pathname ) ? location.pathname : '';
						url += json.url;

						// remove double slashes in path
						json.url = url.replace(/([^:]\/)\/+/g, '$1');
					}

				} else if ( ~nextViewTag.indexOf(PropertyTypes.CTA) ) {
					json.cta = nextViewContent;
				}
			}

			return json;
		},

		CallBackFunction: function(strXML) {
			var xmlDoc;

			if (window.DOMParser) {
				var parser = new DOMParser();
				xmlDoc = parser.parseFromString(strXML, 'text/xml');
			} else {
				// for IE
				xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
				xmlDoc.async = false;
				xmlDoc.loadXML(strXML);
			}

			for (var i = 0; i < xmlDoc.documentElement.childNodes.length; i++) {

				var options = FLEXI.neolane.parseNodeToJson(xmlDoc.documentElement.childNodes[i]);
				
				if ( options === null ) {
					continue;
				}
				
				var $element;

				switch ( options.affectedNode ) {
				case 'Hero':
					var $parent = $('#Hero .slides');
					$element = $parent.children().eq(options.position);

					if ( options.position === 0 ) {
						// the first slide is duplicated so in case it is this one we need to
						// get the very last slide as well to make sure the updates are consistent
						var lastIndex = $parent.children().length - 1;
						$element = $element.add($parent.children().eq(lastIndex));
					}

					break;
				case 'Tiles':
					$element = $('#Tiles .tile').eq(options.position);
					break;
				case 'Float':
					$element = $('#Float .float').eq(options.position);
					break;
				default:
					// just in case it's an unrecognised type
					$element = {
						length: 0
					};
				}

				// if the selector returned a valid value
				if ($element.length) {

					// Generic updates that apply to all $element updates
					$element.find('img').attr('src', options.image).attr('srcset', '');
					
					if ( options.affectedNode !== 'Hero') {
						$element.find('a').attr('href', options.url);
					}

					// specific updates
					switch ( options.space ) {
					case 'phxMagWebCarousel':
						
						$element.find('.promoBlock').addClass('hidden');
						
						$element.attr('href', options.url);
						// hide the countdown & expiry timer in case it is visible
						$element.find('.countdown').addClass('hidden');
						$element.find('.expiredOffer').addClass('hidden');

						// update the bottom links
						if ( options.subtitles.length ) {
							$('.pbxCarousel ul li').eq(options.position).text(options.subtitles[0]);
						}

						break;
					case 'phxMagWebFloat':
						// Nothing to do here (yet at least)
						break;
					case 'phxMagWebHP4BlocksBottom':

						$element.find('.title').text(options.title);

						if ( options.subtitles.length ) {
							$element.find('span').eq(0).text(options.subtitles[0]);
						}

						$element.find('span').eq(1).text(options.cta);

						break;
					}
				} else {
					console.warn('interaction weight '+(options.position+1)+' is out of range [element not found]');
				}
			}
		},

		execInteraction: function() {
			var i,
				scriptInteractionNeolane,
				nbrDivInteraction,
				aInteractionData;

			window.interactionDivs = {};
			aInteractionData = [];

			for (i = 0; i < dataTableInteraction.data.length; i++) {
				aInteractionData.push(dataTableInteraction.data[i].id, dataTableInteraction.data[i].offerSpace);
			}

			nbrDivInteraction = FLEXI.neolane.checkInteractionDivs(aInteractionData);

			if (nbrDivInteraction > 0) {
				scriptInteractionNeolane = document.createElement('script');
				scriptInteractionNeolane.src = 'https://photobox-s.neolane.net/nl/interactionProposal.js?env=liveRcp&cb=FLEXI.neolane.CallBackFunction';
				scriptInteractionNeolane.type = 'text/javascript';
				scriptInteractionNeolane.id = 'interactionProposalScript';
				document.body.appendChild(scriptInteractionNeolane);
			}
		}
	};

	FLEXI.utils.functionList.push({ func: process.init });

	return process;

})(FLEXI, $);