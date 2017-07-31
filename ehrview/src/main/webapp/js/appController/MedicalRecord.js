/*
 * 用药
 */
var MedicalRecord = function(modId, page) {
	$.getJsonData('summary/getMedicalRecord', {
		"start": page && page > 1 ? (page - 1) * pageSize : 0,
		"limit": pageSize
	}).done(function(data) {
		$('#prescribeDate').datepicker({
			format: 'yyyy-mm-dd'
		});
		var body = data.body;
		loadMedicalRecord(body,page);
	});
	
	$(".pageBar .btn-success").click(function(){
		
		var medicineName = $("#medicineName").val();
		var prescribeDate = $("#prescribeDate").val();
		var medicineWay = $("#medicineWay").val();
		var medicineCategory = $("#medicineCategory").val();
		var args = {
				"medicineName": medicineName,
				"prescribeDate": prescribeDate,
				"medicineWay": medicineWay,
				"medicineCategory": medicineCategory
			};
		$.ajax({
			url: '/ehrview/summary/queryMedicalRecord/?vk=' + vk,
			data: $.toJSON(args),
			contentType: 'application/json; charset=UTF-8',
			type: 'POST',
			dataType: 'json'
		}).done(function(data) {
			var body = data.body;
			loadMedicalRecord(body,0);
		});
		
		
	});
}

function loadMedicalRecord(body,page){
	var $ttable = $("#iptAdviceDetail");
	if (body.length) {
		var html = '<tr>'
			+ '<th style="width: 85px;">开药日期</th>'
			+ '<th>药物名称</th>'
			+ '<th style="width: 60px;">剂量</th>'
			+ '<th style="width: 65px;">使用频率</th>'
			+ '<th style="width: 65px;">用药途径</th>'
			+ '<th style="width: 65px;">药物分类</th>'
			+ '<th style="width: 65px;">用药天数</th>'
			+ '</tr>';
		for (var i = 0; i < body.length; i++) {
			var bodyItem = body[i];
			html += "<tr><td>" + safeDateString(bodyItem.PrescribeDate) + "</td><td style='text-align:left;'>" + safeString(bodyItem.MedicineName) + "</td><td>" + safeString(bodyItem.Dosage) + safeString(bodyItem.DosageUnit) + "</td><td>" + safeString(bodyItem.Frequency) + "</td><td>" + safeString(bodyItem.MedicineWay) + "</td><td>" + safeString(bodyItem.MedicineCategory) + "</td><td>" + safeString(bodyItem.MedicationDays) + "</td></tr>";
		}
	} else {
		var html = '<span>没有更多数据</span>';
	}
	$ttable.attr('page', page);
	$ttable.html(html);
	if (body.length == pageSize) {
		$('a[appId=MedicalRecord][rel=nextPage]').show();
	} else {
		$('a[appId=MedicalRecord][rel=nextPage]').hide();
	}
	if (page <= 1) {
		$('a[appId=MedicalRecord][rel=prePage]').hide();
	} else {
		$('a[appId=MedicalRecord][rel=prePage]').show();
	}
	
	if(page == 0){
		$('a[appId=MedicalRecord][rel=nextPage]').hide();
		$('a[appId=MedicalRecord][rel=prePage]').hide();
	}
	
}