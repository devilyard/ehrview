/*
 * 产后访视。
 */
var pregnants = [];
var pregnantObj;
var cnd = {};
var VisitRecord = function(id) {
	$("#" + id).empty();
	var url = "postnatal/getVisitRecord";
	var docUrl = "postnatal/getHtmlDocument";
	var timeField = "EffectiveTime";
	if(pregnants.length==0){
		removeRunningMask();
		return $("#" + id).html("<div class='text-center'><h1>无记录</h1></div>")
	}
	if (!pregnantObj) {
		pregnantObj = pregnants[0];
	}
	cnd["PregnantID"] = pregnantObj.pregnantId;
	var pId = pregnantObj.pregnantId;
	$.getJsonData(url, cnd)
		.done(function(data) {
			var body = data.body;
			var dataNavBarStr = "<ul id='dataNavBar-" + id + "-" + pId + "' class='nav nav-tabs nav-justified autoScrll'></ul>";
			var html = $.parseHTML(dataNavBarStr);
			$("#" + id)
				.append(html);
			var dataContentStr = "<div id='content-" + id + "' class='tab-content tab-content-border'></div>";
			var html = $.parseHTML(dataContentStr);
			$("#" + id)
				.append(html);
			idContentFlag[id] = true
			setUlNav(body, id, pId)
			removeRunningMask();
		});
}

var setUlNav = function(body, id, pId) {
	var url = "postnatal/getVisitRecord";
	var docUrl = "postnatal/getHtmlDocument";

	var timeField = "EffectiveTime";
	$("#dataNavBar-" + id + "-" + pId)
		.empty()
	$("#content-" + id)
		.empty()
	if (body.length == 0) {
		return $("#" + id).html("<div class='text-center'><h1>无记录</h1></div>")
	}
	for (var i = 0; i < body.length; i++) {
		var bodyItem = body[i];

		var time = bodyItem[timeField];
		time = time.substr(0, 10)
		var navItemStr = "<li><a id='" + bodyItem["DCID"] + "' href=#" + time + " data-toggle='tab'>" + time + "</a></li>";
		var html = $.parseHTML(navItemStr);
		$("#dataNavBar-" + id + "-" + pId)
			.append(html)
		var contentStr = "<div id='" + time + "' class='tab-pane'></div>";
		$("#content-" + id)
			.append(contentStr)

	}

	$('#dataNavBar-' + id + '-' + pId + ' a:first')
		.tab('show')
	var contentId = $('#dataNavBar-' + id + '-' + pId + ' a:first')
		.attr('href');
	contentId = contentId.replace(/#/g, "");

	var url = "../" + docUrl;
	setHtmltoPage(url, $('#dataNavBar-' + id + '-' + pId + ' a:first')
		.attr('id'), contentId)

	$('#dataNavBar-' + id + '-' + pId + ' a[data-toggle="tab"]')
		.on('shown.bs.tab', function(e) {
			var contentId = $(e.target)
				.attr('href');
			contentId = contentId.replace(/#/g, "");
			var url = "../" + docUrl;
			setHtmltoPage(url, e.target.id, contentId)
		})
}