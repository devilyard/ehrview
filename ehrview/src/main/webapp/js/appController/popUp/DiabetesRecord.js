var DiabetesRecord = function ( id ) {
	var url = "diabetesRecord/getHtmlDocument";
	var cnd = {
		"dcId": getRecordId( )
	};
	$.getJsonData( url, cnd ).done( function ( data ) {
		var body = data.body;
		var htmlStr = data.body;
		html = $.parseHTML( htmlStr );
		$( "#" + id ).empty( )
		$( "#" + id ).append( html );
		idContentFlag[ id ] = true
		removeRunningMask();
	});
}