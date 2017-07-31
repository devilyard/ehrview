$import("lib.messengermin");
/*
 * 外伤史
 */
var TraumatismHistoryList = function(modId, page) {
	getRecordList('summary/getTraumatismHistoryList', page, 'diseaseUl', 'DiseaseHistoryList', function(bodyItem) {
		$.get("../partials/popUp/popModal.html", {}, function(data, textStatus, xhr) {
			var html = $.parseHTML(data);
			$("#diseaseUl").append(html)
			$("#diseaseUl .modal").attr("id", "diseaseHist-popUp")
		})
		var html = '<li>';
		html += '<span class="title" SRCEntryName="' + bodyItem.SRCEntryName + '">' + safeString(bodyItem.TRAUMATISMNAME) + '</span>';
		return html + '<br/>诊断日期：' + safeDateString(bodyItem.DIAGNOSISDATE) + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;诊断机构：' + safeString(bodyItem.DIAGNOSISUNITTEXT) + '</li>';
	});
}
