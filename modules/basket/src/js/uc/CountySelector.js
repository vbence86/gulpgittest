var uc = uc || {};
uc.CountySelector = (function($) {
    
    function CountySelector(__PARENT) {
        this.__PARENT = __PARENT;
        this.init();
        return this;
    }

    var CountyProto = CountySelector.prototype,
        counties,
        $country_id,
        $countryFieldset,
        $county,
        $countyFieldset;
    
    CountyProto.init = function () {
        var self = this;
        //load in county list
        this.counties = uc.counties;
        //do all the dom lookups
        this.$country_id = $('#countryId');
        this.$countryFieldset = this.$country_id.parent('fieldset');
        //cache original state
        this.cacheDefaultCounty();
        this.setOriginalCounty();
        //listen to the country field
        $('body').on('change', '#countryId', function(e) {
            self.loadCounties();
        });
        this.loadCounties();
    };
    
    CountyProto.cacheDefaultCounty = function() {
        var county = $('#county');
        if( county.length > 0 && !this.counties.defaultDomCache ) {
            this.counties.defaultDomCache = $(county).parent('fieldset');
        } else {
            this.counties.defaultDomCache = ' '; //true-y, can be used in replaceWith. `$()` fails in jquery 1.9.1, fixed in 1.10.x
        }
    };
    
    CountyProto.setOriginalCounty = function() {
        this.counties.originalCounty = $('#original_county').val();
    };
    
    CountyProto.createCountySelect = function(country, county) {
        var self = this,
            hit = false;
        $.each(self.counties, function(country_id, country_params) {
            if(country_id == country.val()) {
                var countyHtml;
                //re-attach county dom object if it exists
                if (country_params.selectDomCache) {
                    countyHtml = country_params.selectDomCache;
                } else {
                    var counties = country_params.counties;
                    countyHtml = $('<fieldset id="county_fieldset" data-country_id="' + country_id + '"><label for="county_id"><span class="required">*</span><strong>' + uc.server.tokens.COUNTY + '</strong></label><select id="county" name="county" required=""><option value=""></option></select></fieldset>');
                    $.each(counties, function(key, value) {
                        //match previously stored value
                        var active = '';
                        if(self.counties.originalCounty == key) {
                            active = 'selected="selected"';
                        }
                        $('select', countyHtml).append('<option value="' + key + '" ' + active + '>' + value + '</option>');
                    });
                }
                
                var countryHash;
                if(county) {
                    var $countyFieldset = county.parent('fieldset');
                    countryHash = self.counties[$countyFieldset.data('country_id')];
                    if(countryHash) {
                        countryHash.selectDomCache = $countyFieldset.replaceWith(countyHtml);
                    } else {
                        $countyFieldset.replaceWith(countyHtml);
                    }
                } else {
                    self.$countryFieldset.before(countyHtml);
                }
                
                hit = true;
                return;
            }
        });
        if(!hit) {
            this.unloadCounties();
        }
    };

    CountyProto.loadCounties = function() {
        var country = this.$country_id,
            self = this;
        if( country.length > 0 ) {
            var county = $('#county');
            if( county.length > 0 ) {
                self.createCountySelect(country, county);
            } else {
                self.createCountySelect(country);
            }
        }
    };
    
    CountyProto.unloadCounties = function() {
        var countyFieldset = $('#county_fieldset');
        if(countyFieldset.length > 0) {
            $('option:selected', countyFieldset).attr({selected:'selected'});

            var countryHash = this.counties[countyFieldset.data('country_id')];
            // if we had a free-text county field before
            if(uc.counties.defaultDomCache) {
                // reinstate that, cache previous node
                countryHash.selectDomCache = $('#county_fieldset').replaceWith(uc.counties.defaultDomCache);
            } else {
                //otherwise remove field outright and cache for later
                countryHash.selectDomCache = $('#county_fieldset').detach();
            }
        }
    };
    
    return CountySelector;

})(jQuery);
    
