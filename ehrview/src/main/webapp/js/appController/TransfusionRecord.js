/*
 * 输血
 */
var TransfusionRecord = function(modId, page) {
	$.getJsonData('transfusion/getPtTransfusion', {
		"start": page && page > 1 ? (page - 1) * pageSize : 0,
		"limit": pageSize
	}).done(function(data) {
		$('#bloodTransfusionDateTime').datepicker({
			format: 'yyyy-mm-dd'
		});
		var body = data.body;
		loadTransfusionRecord(body,page);
		
		$(".pageBar .btn-success").click(function(){
			
			var aBOBloodCode_Text = $("#aBOBloodCode_Text").val();
			var bloodTransfusionDateTime = $("#bloodTransfusionDateTime").val();
			var authorOrganizationName = $("#authorOrganizationName").val();
			var args = {
					"aBOBloodCode_Text": aBOBloodCode_Text,
					"bloodTransfusionDateTime": bloodTransfusionDateTime,
					"authorOrganizationName": authorOrganizationName
				};
			$.ajax({
				url: '/ehrview/transfusion/queryPtTransfusion/?vk=' + vk,
				data: $.toJSON(args),
				contentType: 'application/json; charset=UTF-8',
				type: 'POST',
				dataType: 'json'
			}).done(function(data) {
				var body = data.body;
				loadTransfusionRecord(body,0);
			});
		});
		
		
//		$ttable.find('a').bind('click', function(event) {
//			var encript = $(this).attr('encript');
//			if (encript == 'true') {
//				$.messagebox.error('提示', '无权浏览！');
//				return false;
//			}
//			var dcId = $(this).attr('dcid');
//			var url = "../transfusion/getHtmlDocument?dcId=" + dcId + "&vk=" + vk;
//			$.get(url, function(data) {
//				var htmlStr = data.body;
//				html = $.parseHTML(htmlStr);
//				$("#popUp-TransfusionRecord .modal-body").empty()
//				$("#popUp-TransfusionRecord .modal-body").append(html);
//				$('#popUp-TransfusionRecord').modal();
//			});
//			return false;
//		});
	});
}

function loadTransfusionRecord(body,page){
	$.get("../partials/popUp/popModal.html", {}, function(data, textStatus, xhr) {
		var html = $.parseHTML(data);
		$(".TransfusionRecordContent").append(html);
		$("#myModal").attr('id', 'popUp-TransfusionRecord');
		$("#popUp-TransfusionRecord").addClass('width800')
	});
	var $ttable = $("#transfusionRecordTb")
	$ttable.attr('page', page);
	var html = body.length > 0 ? '' : '<tr><td>没有更多数据</td></tr>';
	for (var i = 0; i < body.length; i++) {
		var bodyItem = body[i];
		var DCID = bodyItem.DCID
		var htmlStr = ' <tr><td rowspan="2" width="60px" align="center"><img src="../img/arrow2.png" width="40px" height="47px" /></td><td colspan="2" width="135px"><a dcid="' + DCID + '" encript="' + bodyItem._encript + '" href="#" class="blue">'
					+ safeString(bodyItem.SXLX_TEXT) + '&nbsp;&nbsp;' + safeString(bodyItem.SXL) + safeString(bodyItem.BloodTransfusionMeasurementUni)//ABOBloodCode_Text BloodTransfusionVolume BloodTransfusionMeasurementUni
					+ '</a></td><td colspan="2" width="155px">&nbsp;</td><td align="right" width="90px">输血反应：</td><td>' + safeString(bodyItem.SXFY_TEXT) + '</td></tr>'//TransfusionRectionType_Text
					+ '<tr><td>输血日期：</td><td >'
					+ safeDateString(bodyItem.SXSJ)//BloodTransfusionDateTime
					+ '</td><td colspan="2" width="155px">&nbsp;</td><td align="right">输血机构：</td><td>' + safeString(bodyItem.AuthorOrganization_Text) + '</td></tr>'//AuthorOrganizationName
					+ '<tr><td colspan="7"><hr class="grey" /></td></tr><tr><td colspan="7"></td></tr>';
		html += htmlStr;
	}
	$ttable.html(html);
	if (body.length == pageSize) {
		$('a[appId=TransfusionRecord][rel=nextPage]').show();
	} else {
		$('a[appId=TransfusionRecord][rel=nextPage]').hide();
	}
	if (page <= 1) {
		$('a[appId=TransfusionRecord][rel=prePage]').hide();
	} else {
		$('a[appId=TransfusionRecord][rel=prePage]').show();
	}
	
	if(page == 0){
		$('a[appId=TransfusionRecord][rel=nextPage]').hide();
		$('a[appId=TransfusionRecord][rel=prePage]').hide();
	}
	
	bindOpenDocumentListener3('transfusionRecordTb', 'transfusion/getHtmlDocument');
}