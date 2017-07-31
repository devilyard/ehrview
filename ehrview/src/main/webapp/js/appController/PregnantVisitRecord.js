/*
 * 孕妇随访
 */
var PregnantVisitRecord = function(modId, page) {
	getVisitList('pregnantVisit/getVisitRecordList',
			'pregnantVisit/getHtmlDocument', page, 'pregnantVisitTable',
			'PregnantVisitRecord', function(bodyItem) {
				return '<li class="clickT" dcid="' + bodyItem.DCID + '">'
						+ safeDateString(bodyItem.VisitDate) + '&nbsp;&nbsp;'
						+ safeString(bodyItem.VisitMode_Text) + '<br/>'
						+ safeString(bodyItem.VisitUnit)
						+ '&nbsp;&nbsp;' + safeString(bodyItem.VisitDoctor)
						+ '</li>';
			}, 'tb');
}