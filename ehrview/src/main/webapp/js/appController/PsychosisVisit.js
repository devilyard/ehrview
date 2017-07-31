/*
 * 精神病随访
 */
var PsychosisVisit = function(modId, page) {
	getVisitList('psychosisVisit/getPsychosisVisit',
			'psychosisVisit/getHtmlDocument', page, 'psychosisVisitTable',
			'PsychosisVisit', function(bodyItem) {
				return '<li class="clickT" dcid="' + bodyItem.DCID + '">'
						+ safeDateString(bodyItem.VisitDate) + '&nbsp;&nbsp;'
						+ safeString(bodyItem.VisitWay) + '<br/>'
						+ safeString(bodyItem.VisitUnit) + '&nbsp;&nbsp;'
						+ safeString(bodyItem.VisitDoctor) + '</li>';
			}, 'tb');
}