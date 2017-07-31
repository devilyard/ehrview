/*
 * 生育史
 */
var ReproductiveList = function(modId, page) {
	getRecordList('summary/getReproductiveList', page, 'reproductiveUl', 'ReproductiveList', function(bodyItem) {
		return '<li><span class="title">' + safeString(bodyItem.WayStop) + '</span><br />日期：' + safeDateString(bodyItem.StopDate) + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;诊断机构：' + safeString(bodyItem.AuthorOrganization_Text) + '</li>';
	});
}