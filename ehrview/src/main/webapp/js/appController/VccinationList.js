/*
 * 接种
 */
var VccinationList = function(modId, page) {
	getRecordList('summary/getVccinationList', page, 'vccinationUl', 'VccinationList', function(bodyItem) {
		return '<li><span class="title">' + safeString(bodyItem.VaccineName) + '</span><br />接种日期：' + safeDateString(bodyItem.VaccineDate) + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;诊断机构：' + safeString(bodyItem.AuthorOrganization_Text) + '</li>';
	});
}