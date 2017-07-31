var PsychosisVisitPop = function ( id ) {
	var url = "psychosisVisit/getPsychosisVisit";
	var cnd = {
		"effectiveTime": getSysTime( )
	};

	var docUrl = "psychosisVisit/getHtmlDocument";
	var timeField = "EffectiveTime";
	$.getJsonData( url, cnd ).done( function ( data ) {
		var body = data.body;
		var $nav = $( "#EHRNav" );
		dateP( $nav, id )
		var dataNavBarStr = "<ul id='dataNavBar-" + id + "' class='nav nav-tabs nav-justified autoScrll'></ul>";
		var html = $.parseHTML( dataNavBarStr );
		$( "#" + id )
			.append( html );
		var dataContentStr = "<div id='content-" + id + "' class='tab-content tab-content-border'></div>";
		var html = $.parseHTML( dataContentStr );
		$( "#" + id )
			.append( html );
		setUlNav( body, id )
		idContentFlag[ id ] = true
		removeRunningMask();
	} );
}

var setUlNav = function ( body, id ) {
	var url = "psychosisVisit/getPsychosisVisit";
	var cnd = {
		"effectiveTime": getSysTime( )
	};

	var docUrl = "psychosisVisit/getHtmlDocument";
	var timeField = "EffectiveTime";
	$( "#dataNavBar-" + id )
		.empty( )
	$( "#content-" + id )
		.empty( )
	if ( body.length == 0 ) {
		return $( "#content-" + id ).html( "<div class='text-center'><h1>无记录</h1></div>" )
	}
	for ( var i = 0; i < body.length; i++ ) {
		var bodyItem = body[ i ];
		var time = bodyItem[ timeField ];
		time = time.substr( 0, 10 )
		var navItemStr = "<li><a id='" + bodyItem[ "DCID" ] + "' href=#" + time + " data-toggle='tab'>" + time + "</a></li>";
		var html = $.parseHTML( navItemStr );
		$( "#dataNavBar-" + id )
			.append( html )
		var contentStr = "<div id='" + time + "' class='tab-pane'></div>";
		$( "#content-" + id )
			.append( contentStr )
	}

	$( '#dataNavBar-' + id + ' a:first' )
		.tab( 'show' )
	var contentId = $( '#dataNavBar-' + id + ' a:first' )
		.attr( 'href' );
	contentId = contentId.replace( /#/g, "" );

	var url = "../" + docUrl;
	setHtmltoPage( url, $( '#dataNavBar-' + id + ' a:first' )
		.attr( 'id' ), contentId )

	$( '#dataNavBar-' + id + ' a[data-toggle="tab"]' )
		.on( 'shown.bs.tab', function ( e ) {
			var contentId = $( e.target )
				.attr( 'href' );
			contentId = contentId.replace( /#/g, "" );
			var url = "../" + docUrl;
			setHtmltoPage( url, e.target.id, contentId )
		} )
}

var dateP = function ( $nav, id ) {
	var url = "psychosisVisit/getPsychosisVisit";
	var cnd = {
		"effectiveTime": getSysTime( )
	};
	$( '#dateP' ).remove()
	var docUrl = "psychosisVisit/getHtmlDocument";
	var timeField = "EffectiveTime";
	var d = new Date( );
	var vYear = d.getFullYear( );
	var dateStr = '<li></li><li><div id="navPanel-' + id + '" class="navPanel form-group"><label class="control-label input-sm" for="dateP">年份</label><input id="dateP" type="text" class="form-control input-sm" value=' + vYear + '></div></li>';
	var dateHtml = $.parseHTML( dateStr )
	$nav.append( dateHtml );
	$( '#dateP' )
		.datepicker( {
			format: "yyyy",
			startView: 1,
			minViewMode: 2,
			endDate: d,
			orientation: "top auto"
		} )
		.on( 'changeDate', function ( e ) {
			addRunningMask();
			cnd[ "effectiveTime" ] = e.date.getFullYear( );
			$.getJsonData( url, cnd )
				.done( function ( data ) {
					var body = data.body;
					setUlNav( body, id )
					removeRunningMask();
				} )
		} )
}