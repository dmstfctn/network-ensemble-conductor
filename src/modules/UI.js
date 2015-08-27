var $ = require( 'jquery' );
//var gui = require('nw.gui');

//console.log( gui );

var UI = function(){
	this.persistentUI();
};

UI.prototype = {
	persistentUI: function(){
		var $header = $('.app--header');
		var $close = $('.close', $header );
		$close.on('click',function(){
			window.close();
		});
	},
	populateConfigOSCPort: function( port, callback ){
		var $container = $('.config--osc-port');
		var $input = $('input', $container );
		console.log( 'PORT: ', port );
		$input[0].value = port;
		$input.on('change', function(){
			if( typeof callback === 'function' ) callback( parseInt($input[0].value) );
		});
	},
	populateStartPage: function( _interfaces, callback ){
		var interfaces = [].concat( _interfaces );
		var $container = $('.app--page__start');
		var $select = $('select[name="interfaces"]', $container );
		$select.empty();
		$select.append( $('<option value="none">-</option>') );
		for( var i = 0; i < interfaces.length; i++ ){
			$select.append( $('<option value="' + interfaces[i] + '">' + interfaces[i] + '</option>'))
		}
		$select.on( 'change', function(e){
			console.log( 'change select' );
			var $options = $(this).find('option');

			$options.each( function(){
				console.log( 'option: ', this.selected );
				if( this.selected ){
					if( typeof callback === 'function' ) callback( this.value );
				}
			});
		});
	},
	enableStartButton: function(){
		var that = this;
		var $button = $('.app--page__start button');
		$button.attr('disabled', false);
		$button.on('click', function(){			
			that._onStart();
		});
	},
	hideStartPage: function( callback ){
		var $page = $('.app--page__start');
		$page.addClass('hidden');
		setTimeout(function(){
			if( typeof callback === 'function' ) callback();
		}, 500 );
	},
	enablePacketFilters: function( callback ){
		var $page = $('.app--page__main');
		var $container = $('.main--filter', $page);
		var $checkboxes = $('input[type="checkbox"]', $container);
		$( '.packet--mass__all', $container).on( 'click', function(){
			var result =[];
			$checkboxes.each(function(){
				this.checked = true;
				result.push( $(this).attr('name').replace('packet-','') );
			});
			if( typeof callback === 'function' ) callback( result )
			//$checkboxes.change();
		});
		$( '.packet--mass__none', $container ).on( 'click', function(){
			$checkboxes.each(function(){
				this.checked = false;
			});
			if( typeof callback === 'function' ) callback([]);
			//s$checkboxes.change();
		});
		$checkboxes.on('change', function(){
			var result =[];
			$checkboxes.each(function(){
				if( this.checked ){
					result.push( $(this).attr('name').replace('packet-','') );
				}
			});
			if( typeof callback === 'function' ) callback( result )
		});

		$( '.packet--mass__all', $container).click();
	},
	enableModeSelection: function( callback ){
		var $page = $('.app--page__main');
		var $container = $('.main--mode', $page);
		var $selectors = $('.modes--mode');
		$selectors.on('click', function(){
			var result = [];
			$(this).toggleClass('active');
			if( $(this).attr('data-mode') === 'raw' ){
				$(this).siblings('[data-mode="packets"]').removeClass('active');
			}
			if( $(this).attr('data-mode') === 'packets' ){
				$(this).siblings('[data-mode="raw"]').removeClass('active');
			}
			$selectors.each( function(){
				if( $(this).hasClass('active') ){
					result.push( $(this).attr('data-mode') );
				}
			});
			if( typeof callback === 'function' ) callback( result )
		});

	},
	enableRawSpeed: function( callback ){
		var $page = $('.app--page__main');
		var $container = $('.main--configuration .raw-speed', $page);
		var $range = $('input[type="range"]', $container );
		$range.on( 'mousemove', function( e ){
			var val = this.value / parseInt(this.max);
			if( typeof callback === 'function' ) callback( val );
		});
	},
	showMainPage: function( callback ){
		var $page = $('.app--page__main');
		$page.removeClass('hidden');
		setTimeout(function(){
			if( typeof callback === 'function' ) callback();
		}, 500 );
	},
	onStart: function(){ /* ... override ... */ },
	_onStart: function(){
		if( typeof this.onStart === 'function' ){
			this.onStart();
		}
	},
	onStop: function(){ /* ... override ... */ },
	_onStop: function(){
		if( typeof this.onStop === 'function' ){
			this.onStop();
		}
	}
}

module.exports = UI;