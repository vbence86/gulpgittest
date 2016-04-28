var SHARED = window.SHARED || {};
SHARED.footer = (function (SHARED, $) {

	var $footerNavSection = null;
	var $footerNavLinks = null;
	var $footerNav = null;

	var process = {

		init: function (){

			$footerNavSection = $('#FooterNavSection');
			$footerNavLinks = $('ul', $footerNavSection);
			$footerNav = $('.footerNavSection', $footerNavSection);

			_this.initFooter();

			$(window).on('resize orientationchange',function(){
				_this.initFooter();
			});
		},

		initFooter: function(){

			// NB: Run this ONLY for smallScreen device (as determined by our breakpoint) - LA 06/2015
			if(!SHARED.utils.isSmallScreen()){
				if( $footerNavSection !== null || $footerNavSection.hasClass('mobileFooter') ){
					_this.removeNavEvents();
					$footerNavSection.removeClass('mobileFooter');
				}
				return false;
			}

			if( !$footerNavSection.hasClass('mobileFooter') ){
				$footerNavSection.addClass('mobileFooter');
				_this.setIconNavLinks();
				_this.addNavEvents();
			}

		},

		setIconNavLinks: function(){
			$footerNavLinks.each(function( index ) {
				if( $( 'li', this ).hasClass( 'iconList' ) ){
					$( 'li', this ).closest('.footerNavSection').addClass('hasIconLinks');
				}
			});
		},

		removeNavEvents: function(){
			$footerNavSection.off('click', _this.toggleNav);
		},

		addNavEvents: function(){
			$footerNavSection.on('click', _this.toggleNav);
		},

		toggleNav: function(event){
			var $navEl = $(event.target).parent();
			if(!$(event.target).is('a')){
				event.preventDefault();
				if($navEl.hasClass('open')){
					_this.closeAllNav();
				} else if( !$navEl.hasClass('hasIconLinks') ){
					_this.openNav($navEl);
				}
			}
		},

		closeNav: function($navEl){
			$navEl.removeClass('open').find('ul',this).removeAttr('style');
		},

		closeAllNav: function(){
			$footerNav.removeClass('open');
			$footerNavLinks.removeAttr('style');
		},

		openNav: function($navEl){
			var $ul = $navEl.find('ul');
			var $li = $ul.find('li');
			var ulHeight = ($li.outerHeight() * parseInt($ul.data('links'), 10)) + 10 + 'px';

			_this.closeAllNav();
			$navEl.addClass('open');
			$ul.css({'height': ulHeight});
		}

	};
	var _this = process;
	SHARED.utils.functionList.push({ func: process.init });
	return process;
})(SHARED, $);
