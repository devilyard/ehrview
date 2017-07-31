/*
 * 住院
 */
var TreatmentRecord = function(modId, page) {
	$.getJsonData('iptRecordHome/getInpatientRecord', {
		"start": page && page > 1 ? (page - 1) * pageSize : 0,
		"limit": pageSize
	}).done(function(data) {
		$('#dateTime').datepicker({
			format: 'yyyy-mm-dd'
		});
		var body = data.body
		loadTreatmentRecord(body,page);
	});
	
	$(".pageBar .btn-success").click(function(){
		
		var masterDiseaseName = $("#masterDiseaseName").val();
		var dateTime = $("#dateTime").val();
		var medicalInstitutions = $("#medicalInstitutions").val();
		var args = {
				"masterDiseaseName": masterDiseaseName,
				"dateTime": dateTime,
				"medicalInstitutions": medicalInstitutions
			};
		$.ajax({
			url: '/ehrview/iptRecordHome/queryInpatientRecord/?vk=' + vk,
			data: $.toJSON(args),
			contentType: 'application/json; charset=UTF-8',
			type: 'POST',
			dataType: 'json'
		}).done(function(data) {
			var body = data.body;
			loadTreatmentRecord(body,0);
		});
		
		
	});
}



function loadTreatmentRecord(body,page){
	var $ttable = $("#treatmentTable");
	$ttable.attr('page', page);
	var html = body.length > 0 ? '' : '<tr><td>没有更多数据</td></tr>';
	var mapData = {};
	for (var i = 0; i < body.length; i++) {
		var bodyItem = body[i];
		mapData[bodyItem.DCID] = bodyItem;
		var htmlStr = ' <tr><td rowspan="2" width="60px" align="center"><img src="../img/arrow2.png" width="40px" height="47px" /></td><td colspan="2" width="135px"><a id="' + bodyItem.DCID + '" encript="' + bodyItem._encript + '" href="../partials/popUp/IptPopUpView.html" class="blue">';
		htmlStr = htmlStr + safeString(bodyItem.ICD10_Text);//MasterDiseaseName
		htmlStr = htmlStr + '</a></td><td colspan="2" width="155px">&nbsp;</td><td width="90px" align="right">出院科室：</td><td>';
		htmlStr = htmlStr + safeString(bodyItem.CYKSBM_Text);//DischargeDepartment
		htmlStr = htmlStr + '</td></tr><tr><td>入院日期：</td><td >';
		htmlStr = htmlStr + safeDateString(bodyItem.RYSJ);//AdmissionDateTime
		htmlStr = htmlStr + '</td> <td  align="right">出院日期：</td><td>';
		htmlStr = htmlStr + safeDateString(bodyItem.CYSJ);//DischargeDateTime
		htmlStr = htmlStr + '</td><td  align="right">就诊机构：</td><td>';
		htmlStr = htmlStr + safeString(bodyItem.AuthorOrganization_Text);//MedicalInstitutions
		htmlStr = htmlStr + '</td></tr><tr><td colspan="7"><hr class="grey" /></td></tr>';
		html += htmlStr;
	}
	$ttable.html(html);
	if (body.length == pageSize) {
		$('a[appId=TreatmentRecord][rel=nextPage]').show();
	} else {
		$('a[appId=TreatmentRecord][rel=nextPage]').hide();
	}
	if (page <= 1) {
		$('a[appId=TreatmentRecord][rel=prePage]').hide();
	} else {
		$('a[appId=TreatmentRecord][rel=prePage]').show();
	}
	
	if(page==0){
		$('a[appId=TreatmentRecord][rel=nextPage]').hide();
		$('a[appId=TreatmentRecord][rel=prePage]').hide();
	}
	
	$ttable.find('a').click(function() {
		var encript = $(this).attr('encript');
		if (encript == 'true') {
			$.messagebox.error('提示', '无权浏览！');
			return false;
		}
		$(this).colorbox({
			transition: "true",
			width: "95%",
			height: "95%",
			onOpen: function() {
				
			},
			onLoad: function() {
			},
			onComplete: function() {
				var DCID = this.id
				$.cachedScript("../js/appController/popUp/PopUp.js").done(function(script, textStatus) {
					var data = mapData[DCID];
					if (!data.AuthorOrganization) {
						data.AuthorOrganization = data.MedicalOrgnationCode;
					}
					onPopUp(mapData[DCID]);
				});
			},
			onCleanup: function() {

			},
			onClosed: function() {

			}
		});
	});
}