/*
 * 家族史
 */
var FamilyHistoryList = function(modId, page) {
	getRecordList('summary/getFamilyHistoryList', page, 'familyUl', 'FamilyHistoryList', function(bodyItem) {
		return '<li><span class="title">' + safeString(bodyItem.Diagnosis) + '</span><br />诊断日期：' + safeDateString(bodyItem.DiagnosisDate) + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;诊断机构：' + safeString(bodyItem.DiagnosisUnit_Text) + '</li>';
	});
}