/*
 * 体检记录
 */
var PhysiqueInspectListInfo = function(modId, page) {
	getVisitList('physiqueInspect/getPhysiqueInspectList',
			'physiqueInspect/getHtmlDocument', page, 'physiqueInspectTable',
			'PhysiqueInspectListInfo', function(bodyItem) {
				return '<tr><td ><a href="#" dcid="' + bodyItem.DCID + '">'
						+ safeString(bodyItem.AuthorOrganization_Text)
						+ '</a></td><td >'
						+ safeDateString(bodyItem.EffectiveTime) + '</td></tr>'
			});
}