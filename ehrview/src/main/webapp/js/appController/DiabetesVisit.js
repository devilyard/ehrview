/*
 * 门诊
 */
var DiabetesVisit = function(modId, page) {
	getVisitList('diabetesVisit/getDiabetesVisit',
			'diabetesVisit/getHtmlDocument', page, 'diabetesVisitTable',
			'DiabetesVisit', function(bodyItem) {
				return '<li class="clickT" dcid="' + bodyItem.DCID + '">'
						+ safeDateString(bodyItem.VisitDate) + '&nbsp;&nbsp;'
						+ safeString(bodyItem.VisitWay_Text) + '<br/>'
						+ safeString(bodyItem.VisitUnit) + '&nbsp;&nbsp;'
						+ safeString(bodyItem.VisitDoctor) + '</li>';
			}, 'tb');
}