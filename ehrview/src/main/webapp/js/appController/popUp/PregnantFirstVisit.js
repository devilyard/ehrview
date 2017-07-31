var pregnants = [];
var pregnantObj;
var PregnantFirstVisit = function(id) {
	$("#" + id).empty();
	var url = "pregnantFirstVisit/getHtmlDocument";
	if (!pregnantObj) {
		pregnantObj = pregnants[0];
	}
	var cnd = {
		"dcId" : pregnantObj["DCID"]
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