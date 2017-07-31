var HypertensionRecord = function ( id ) {
	var url = "hypertensionRecord/getHtmlDocument";
	var cnd = {
		"dcId": getRecordId( )
	};
	$.getJsonData( url, cnd ).done( function ( data ) {
		var body = data.body;
		var htmlStr = data.body;
		html = $.parseHTML( htmlStr );
		$( "#PopUpContent #" + id ).empty( )
		$( "#PopUpContent #" + id ).append( html );
		idContentFlag[ id ] = true
		removeRunningMask();
	} );
}