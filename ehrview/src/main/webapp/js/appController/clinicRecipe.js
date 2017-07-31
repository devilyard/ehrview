/*
 * 门诊处方
 */
var clinicRecipe = function(item) {
	var tableStr = '<table id="ptLabReport" width="100%" class="table text-center table-bordered table-hover" style="table-layout:fixed"><tr>'
			+ '<th style="width: 120px;">开方日期</th>'
			+ '<th style="width: 100px;">药物名称</th>'
			+ '<th style="width: 100px;">剂量</th>'
			+ '<th style="width: 100px;">使用频率</th>'
			+ '<th style="width: 100px;">给药途径</th>'
			+ '<th style="width: 100px;">药物总剂量</th>'
			+ '<th style="width: 100px;">用药天数</th>'
			+ '</tr></table>';
	$("#PopUpContent").html(tableStr);
	$.getJsonData('clinic/getRecipe', {
		"visitId": item.JZLSH,//VisitID
		"authorOrganization": item.AuthorOrganization,
		"start": 0,
		"limit": 50
	}).done(function(data) {
		var body = data.body;
		var html = '';
		for (var i = 0; i < body.length; i++) {
			var bodyItem = body[i];
			var dcId = bodyItem.DCID
			var cId = "#content_" + dcId.trim();
//			html += "<tr><td>" + safeDateString(bodyItem.KFSJ) + "</td><td style='text-align:left;'>"//PrescriptionDate
//				 + safeString(bodyItem.DrugName) + "</td><td>" + safeString(bodyItem.DrugUseDose) 
//				 + safeString(bodyItem.DrugUseDoseUnit) + "</td><td>" + safeString(bodyItem.DrugUsingRate) + "</td><td>" 
//				 + safeString(bodyItem.DrugUsePathway) + "</td><td>" + safeString(bodyItem.DrugUseTotalDose) + "</td><td>" 
//				 + safeString(bodyItem.DrugUseDays) + "</td></tr>";
			var url = "../clinic/getHtmlDocument?dcId=" + dcId + "&vk=" + vk;
			$.get(url, function(data) {
				var htmlStr = data.body;
				html = $.parseHTML(htmlStr);
				$("#ptLabReport").append(html);
//				$(cId).append(html);
			});
		}
//		$("#ptLabReport").append(html);
		removeRunningMask();
	});
	
	

}