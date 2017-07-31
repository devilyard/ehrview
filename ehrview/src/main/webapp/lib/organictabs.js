// IIFE
( function ( $ ) {

	// Define Plugin
	$.organicTabs = function ( el, options ) {

		// JavaScript native version of this
		var base = this;

		// jQuery version of this
		base.$el = $( el );

		// Navigation for active selector passed to plugin
		base.$nav = base.$el.find( ".nav" );

		// Runs once when plugin called       
		base.init = function ( ) {

			// Pull in arguments
			base.options = $.extend( {}, $.organicTabs.defaultOptions, options );

			// Accessible hiding fix (hmmm, re-look at this, screen readers still run JS)
			$( ".hide" )
				.css( {
					"position": "relative",
					"top": 0,
					"left": 0,
					"display": "none"
				} );

			// When navigation tab is clicked...
			base.$nav.delegate( "a", "click", function ( e ) {

				// no hash links
				e.preventDefault( );

				// Figure out active list via CSS class
				console.log( base.$el.find( "a.active" ) )
				var curList = base.$el.find( "a.active" )
					.attr( "href" )
					.substring( 1 ),

					// List moving to
					$newList = $( this ),

					// Figure out ID of new list
					listID = $newList.attr( "href" )
						.substring( 1 ),

					// Set outer wrapper height to (static) height of active inner list
					$allListWrap = base.$el.find( ".tab-content" ),
					curListHeight = $allListWrap.height( );
				$allListWrap.height( curListHeight );

				if ( ( listID != curList ) && ( base.$el.find( ":animated" )
					.length == 0 ) ) {

					// Fade out active list
					base.$el.find( "#" + curList )
						.fadeOut( base.options.speed, function ( ) {

							// Fade in new list on callback
							base.$el.find( "#" + listID )
								.fadeIn( base.options.speed );

							// Adjust outer wrapper to fit new list snuggly
							var newHeight = base.$el.find( "#" + listID )
								.height( );
							$allListWrap.animate( {
								height: newHeight
							}, base.options.speed );

							// Remove highlighting - Add to just-clicked tab
							base.$el.find( ".nav li a" )
								.removeClass( "active" );
							$newList.addClass( "active" );

							// Change window location to add URL params
							if ( window.history && history.pushState ) {
								// NOTE: doesn't take into account existing params
								history.replaceState( "", "", "?" + base.options.param + "=" + listID );
							}
						} );

				}

			} );

			var queryString = {};
			window.location.href.replace(
				new RegExp( "([^?=&]+)(=([^&]*))?", "g" ),
				function ( $0, $1, $2, $3 ) {
					queryString[ $1 ] = $3;
				}
			);

			if ( queryString[ base.options.param ] ) {

				var tab = $( "a[href='#" + queryString[ base.options.param ] + "']" );

				tab
					.closest( ".nav" )
					.find( "a" )
					.removeClass( "active" )
					.end( )
					.next( ".tab-content" )
					.find( "ul" )
					.hide( );
				tab.addClass( "active" );
				$( "#" + queryString[ base.options.param ] )
					.show( );

			};

		};
		base.init( );
	};
	//www.jq22.com
	$.organicTabs.defaultOptions = {
		"speed": 100,
		"param": "tab"
	};

	$.fn.organicTabs = function ( options ) {
		return this.each( function ( ) {
			( new $.organicTabs( this, options ) );
		} );
	};

} )( jQuery );