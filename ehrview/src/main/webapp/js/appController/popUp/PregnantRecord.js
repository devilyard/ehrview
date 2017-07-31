var pregnants = [];
var pregnantObj;
var PregnantRecord = function(id) {
	$("#" + id).empty();
	var url = "pregnantRecord/getHtmlDocument";
	if(pregnants.length==0){
		removeRunningMask();
		return $("#" + id).html("<div class='text-center'><h1>无记录</h1></div>")
	}
	if (!pregnantObj) {
		pregnantObj = pregnants[0];
	}

	var cnd = {
		"dcId": pregnantObj.DCID
	};
	$.getJsonData(url, cnd).done(function(data) {
		var body = data.body;
		var htmlStr = data.body;
		html = $.parseHTML(htmlStr);
		$("#" + id).empty()
		$("#" + id).append(html);
		idContentFlag[id] = true
		removeRunningMask();
	});
}