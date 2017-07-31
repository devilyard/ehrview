/*
 * 体温单
 */
var SignsRecord = function (bodyItem) {
	$("#PopUpContent").empty();
	$("#PopUpContent").append('<img id="jfcpg" width="1200" height="1000" />');
	$('#jfcpg').attr('src', "../inpatient/getSignsRecord?visitId=" + bodyItem.JZLSH + "&vk=" + vk);
	removeRunningMask();
	
//	var url = "../inpatient/getSignsRecord?visitId=" + bodyItem.VisitID + "&vk=" + vk;
//	$.get(url, function (data) {
//		var htmlStr = data.body['html'];
//		html = $.parseHTML(htmlStr);
//		$("#PopUpContent").empty()
//		$("#PopUpContent").append(html);
//		removeRunningMask();
//	});
}