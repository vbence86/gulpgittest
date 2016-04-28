var BXT = window.BXT || {};
BXT.templater = (function (BXT, $) {
	var process = {
		buildTemplate: function (template, data, parent, partials) {
			var html = template, partialCache = [], that = this;
			var a = (parent) ? parent + '.' : '';
			var b = (parent) ? parent + '\\.' : '';
			function writePartial(objectName, thePartial, objectPartial) {
				partialCache = [];
				var prop = new RegExp('{{i}}', 'g'), altProp = new RegExp('{{#applyAlt}}', 'g'), parthtml = '', altClass='';
				for (var x = 0, xLen = objectPartial.length; x < xLen; x++) {
					if (typeof objectPartial[x] === 'string') {
						parthtml = thePartial.template;
						if (parthtml.match(prop)) {
							parthtml = parthtml.replace(prop, objectPartial[x]);
							if (parthtml.match(altProp)) {
								altClass = x % 2 === 0 ? '' : 'alt';
								parthtml = parthtml.replace(altProp, altClass);
							}
							partialCache.push(parthtml);
						}
					} else {
						parthtml = thePartial.template;
						if (parthtml.match(altProp)) {
							altClass = x % 2 === 0 ? 'alt' : '';
							parthtml = parthtml.replace(altProp, altClass);
						}
						partialCache.push(that.buildTemplate(parthtml, objectPartial[x]));
					}
				}
				var partialReplace = new RegExp('{{<' + objectName + '}}', 'g');
				html = html.replace(partialReplace, partialCache.join(''));
				partialCache = null;
				partialReplace = null;
			}

			for (var name in data) {
				if (typeof name === 'string') {
					var property = new RegExp('{{' + b + name + '}}', 'g');
					if (typeof data[name] === 'object') {
						if (Object.prototype.toString.call(data[name]) === '[object Array]') {
							var hasPartial = false;
							var partialItem = '';
							if (typeof partials !== 'undefined') {
								for (var x = 0, xLen = partials.length; x < xLen; x++) {
									if (partials[x].partialName === b + name) {
										hasPartial = true;
										partialItem = partials[x];
										break;
									}
								}
								if (hasPartial) {
									writePartial(b + name, partialItem, data[name]);
								}
							}
						}
						else {
							html = that.buildTemplate(html, data[name], a + name, partials);
						}
					} else {
						if (html.match(property)) {
							html = html.replace(property, data[name]);
						}
						//does it have a tolower modifier
						var modifierProp = new RegExp('{{' + b + name + '#tolower}}', 'g');
						if (html.match(modifierProp)) {
							html = html.replace(modifierProp, data[name].toLowerCase());
						}
						modifierProp = new RegExp('{{' + b + name + '#tolowerstrip}}', 'g');
						if (html.match(modifierProp)) {
							var strippedString = data[name].toLowerCase().replace(/[^\w]/g, '');
							html = html.replace(modifierProp, strippedString);
						}
						modifierProp = null;
					}
					property = null;
				}
			}
			return html;
		},
		cleanTemplate: function (template) {
			var unmatchedData = new RegExp('{{(.*?)}}', 'g'),
                found = template.match(unmatchedData),
                cleanTemplate = '';
			if (found !== null) {
				if (typeof console !== 'undefined') {
					console.warn('The following data was not matched: ' + found);
				}
				cleanTemplate = template.replace(unmatchedData, '');
			} else {
				cleanTemplate = template;
			}
			return cleanTemplate;
		}
	};
	return process;
})(BXT, $);