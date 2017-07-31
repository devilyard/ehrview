$import("lib.messengermin");
/*
 * 住院史
 */
var HospitalHistoryList = function(modId, page) {
	getRecordList('summary/getHospitalHistoryList', page, 'diseaseUl', 'HospitalHistoryList', function(bodyItem) {
		$.get("../partials/popUp/popModal.html", {}, function(data, textStatus, xhr) {
			var html = $.parseHTML(data);
			$("#diseaseUl").append(html)
			$("#diseaseUl .modal").attr("id", "diseaseHist-popUp")
		})
		var html = '<li>';
		if (bodyItem.SRCID) {
			html += '<a href="#" encript="' + bodyItem._encript + '" dcid="' + bodyItem.SRCID + '" SRCEntryName="' + bodyItem.SRCEntryName + '" class="blue">' + safeString(bodyItem.DIAGNOSIS) + '</a>';
		} else {
			html += '<span class="title" SRCEntryName="' + bodyItem.SRCEntryName + '">' + safeString(bodyItem.DIAGNOSIS) + '</span>';
		}
		return html + '<br/>诊断日期：' + safeDateString(bodyItem.DIAGNOSISDATE) + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;诊断机构：' + safeString(bodyItem.DIAGNOSISUNIT_TEXT) + '</li>';
	}, getDocURL);
}

function getDocURL(me) {
	var RecordDCID = $(me).attr("dcid")
	var ContingencyTable = $(me).attr("SRCEntryName")
	switch (ContingencyTable) {
	case "MDC_HypertensionVisit":
		return "hypertensionVisit/getHtmlDocument";
	case "MDC_DiabetesVisit":
		return "diabetesVisit/getHtmlDocument";
	case "PSY_PsychosisVisit":
		return "psychosisVisit/getHtmlDocument";
	}
}

//$(document).on("click", "#diseaseUl a", function() {
//	var encript = $(this).attr('encript');
//	if (encript == 'true') {
//		$.messagebox.error('提示', '无权浏览！');
//		return false;
//	}
//	var ContingencyTable = $(this).attr("SRCEntryName")
//	var RecordDCID = $(this).attr("SRCID")
//	var url;
//	switch (ContingencyTable) {
//		case "MDC_HypertensionVisit":
//			url = "../hypertensionVisit/getHtmlDocument?dcId=" + RecordDCID + "&vk=" + vk;
//			break;
//		case "MDC_DiabetesVisit":
//			url = "../diabetesVisit/getHtmlDocument?dcId=" + RecordDCID + "&vk=" + vk;
//			break;
//		case "PSY_PsychosisVisit":
//			url = "../psychosisVisit/getHtmlDocument?dcId=" + RecordDCID + "&vk=" + vk;;
//			break;
//		default:
//			break;
//	}
//	if (!url) {
//		return false;
//	} else {
//		$.get(url, function(data) {
//			var htmlStr = data.body;
//			$("#diseaseHist-popUp .modal-body").empty();
//			$("#diseaseHist-popUp .modal-body").append(htmlStr);
//			$("#diseaseHist-popUp").modal();
//		});
//	}
//	return false;
//})