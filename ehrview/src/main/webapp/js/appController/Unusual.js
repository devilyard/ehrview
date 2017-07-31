/*
 * 异常指标
 */
var Unusual = function() {
	$.getJsonData('exam/getExamDetailUnusual', {
		"start": 0,
		"limit": 6
	})
		.done(function(data) {
			var body = data.body
			var $ttable = $("#unsualTable");
			for (var i = 0; i < body.length; i++) {
				var bodyItem = body[i];
				var htmlStr = '<tr><td>' + safeDateString(bodyItem.EffectiveTime) + '</td><td>' + safeString(bodyItem.MedicalInstitutions) + '</td><td>' + safeString(bodyItem.ExamItemName) + '</td> <td>' + safeString(bodyItem.ExamResult) + '</td><td>' + safeString(bodyItem.ExamUnits) + '</td><td>' + safeString(bodyItem.ReferenceScope) + '</td></tr>'
				html = $.parseHTML(htmlStr);
				$ttable.append(html)
			}
		});
}