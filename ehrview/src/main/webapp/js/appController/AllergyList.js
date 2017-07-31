/*
 *过敏史
 */
var AllergyList = function(modId, page) {
	getRecordList('summary/getAllergyList', page, 'allergyListUl', 'AllergyList', function(bodyItem) {
		return '<li><span class="title">' + safeString(bodyItem.AllergenName) + '</span><br />诊断日期：' + safeDateString(bodyItem.SystemTime) + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;诊断机构：' + safeString(bodyItem.AuthorOrganization_Text) + '</li>';
	});
}