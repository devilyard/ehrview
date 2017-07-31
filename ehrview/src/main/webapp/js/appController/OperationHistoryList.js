$import("lib.messengermin");
/*
 * 手术史
 */
var OperationHistoryList = function(modId, page) {
	getRecordList('summary/getOperationHistoryList', page, 'diseaseUl', 'DiseaseHistoryList', function(bodyItem) {
		$.get("../partials/popUp/popModal.html", {}, function(data, textStatus, xhr) {
			var html = $.parseHTML(data);
			$("#diseaseUl").append(html)
			$("#diseaseUl .modal").attr("id", "diseaseHist-popUp")
		})
		var html = '<li>';
		html += '<span class="title" SRCEntryName="' + bodyItem.SRCEntryName + '">' + safeString(bodyItem.OPERATIONUNIT_TEXT) + '</span>';
		return html + '<br/>诊断日期：' + safeDateString(bodyItem.OPERATIONDATETIME) + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;诊断机构：' + safeString(bodyItem.AUTHORORGANIZATION) + '</li>';
	});
}
