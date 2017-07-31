/*
 * 高血压随访
 */
var HypertensionVisit = function(modId, page) {
	getVisitList('hypertensionVisit/getHypertensionVisit',
			'hypertensionVisit/getHtmlDocument', page,
			'hypertensionVisitTable', 'HypertensionVisit', function(bodyItem) {
				return '<li class="clickT" dcid="' + bodyItem.DCID + '">'
						+ safeDateString(bodyItem.VisitDate) + '&nbsp;&nbsp;'
						+ safeString(bodyItem.VisitWay_Text) + '<br/>'
						+ safeString(bodyItem.VisitUnit) + '&nbsp;&nbsp;'
						+ safeString(bodyItem.VisitDoctor) + '</li>';
			}, 'tb');
}