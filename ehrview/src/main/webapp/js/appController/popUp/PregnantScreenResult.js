var PregnantScreenResult = function ( id ) {
	var url = "pregnantScreenResult/getPregnantScreenResult";
	var cnd = "";
	$.getJsonData( url, cnd ).done( function ( data ) {
		removeRunningMask();
		if(!data.body){
			return $("#" + id).html("<div class='text-center'><h1>无记录</h1></div>")
		}
		var body = data.body;
		setUlNav( body, id )
	});
}

var setUlNav = function ( body, id ) {
	var url = "pregnantScreenResult/getHtmlDocument";
	var cnd = {
		"dcId": body.DCID
	};
	$.getJsonData( url, cnd ).done( function ( data ) {
		var body = data.body;
		var htmlStr = data.body;
		html = $.parseHTML( htmlStr );
		$( "#" + id ).empty( )
		$( "#" + id ).append( html );
		idContentFlag[ id ] = true
	});
}