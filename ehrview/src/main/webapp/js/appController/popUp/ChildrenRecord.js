var ChildrenRecord = function ( id ) {
	var url = "childrenHealthCard/getHtmlDocument";
	var cnd = {
		"dcId": getRecordId( )
	};
	$.getJsonData( url, cnd ).done( function ( data ) {
		removeRunningMask();
		var body = data.body;
		var htmlStr = data.body;
		html = $.parseHTML( htmlStr );
		$( "#" + id ).empty( )
		$( "#" + id ).append( html );
		idContentFlag[ id ] = true
	});
}