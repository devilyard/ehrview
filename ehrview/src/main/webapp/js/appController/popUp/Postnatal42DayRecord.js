var pregnants = [];
var pregnantObj;

var Postnatal42DayRecord = function(id) {
	$("#" + id).empty();
	var url = "postnatal42Day/getHtmlDocument";
	if (!pregnantObj) {
		pregnantObj = pregnants[0];
	}
	var cnd = {
		"dcId": pregnantObj["DCID"]
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