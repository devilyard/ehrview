/*
 * 手术
 */
var OperationRecord = function(modId, page) {
	$.getJsonData('operation/getPtOperation', {
		"start": page && page > 1 ? (page - 1) * pageSize : 0,
		"limit": pageSize
	}).done(function(data) {
		$('#operationStartDateTime').datepicker({
			format: 'yyyy-mm-dd'
		});
		var body = data.body;
		loadOperationRecord(body,page);
		
		$(".pageBar .btn-success").click(function(){
			
			var operationName = $("#operationName").val();
			var operationStartDateTime = $("#operationStartDateTime").val();
			var operationPartName = $("#operationPartName").val();
			var authorOrganizationName = $("#authorOrganizationName").val();
			var args = {
					"operationName": operationName,
					"operationStartDateTime": operationStartDateTime,
					"operationPartName": operationPartName,
					"authorOrganizationName": authorOrganizationName
				};
			$.ajax({
				url: '/ehrview/operation/queryPtOperation/?vk=' + vk,
				data: $.toJSON(args),
				contentType: 'application/json; charset=UTF-8',
				type: 'POST',
				dataType: 'json'
			}).done(function(data) {
				var body = data.body;
				loadOperationRecord(body,0);
			});
		});
		
			
//			$ttable.find('a').bind('click', function(event) {
//				var encript = $(this).attr('encript');
//				if (encript == 'true') {
//					$.messagebox.error('提示', '无权浏览！');
//					return false;
//				}
//				var dcId = $(this).attr('dcid');
//				var url = "../operation/getHtmlDocument?dcId=" + dcId + "&vk=" + vk;
//				$.get(url, function(data) {
//					var htmlStr = data.body;
//					html = $.parseHTML(htmlStr);
//					$("#popUp-OperationRecord .modal-body").empty()
//					$("#popUp-OperationRecord .modal-body").html(html);
//					$('#popUp-OperationRecord').modal();
//				});
//				return false;
//			});
		});
}

function loadOperationRecord(body,page){
	$.get("../partials/popUp/popModal.html", {}, function(data, textStatus, xhr) {
		var html = $.parseHTML(data);
		$(".OperationRecordContent").append(html);
		$("#myModal").attr('id', 'popUp-OperationRecord');
		$("#popUp-OperationRecord").addClass('width800')
	});
	var $ttable = $("#operationRecordTb")
	$ttable.attr('page', page);
	var html = (body && body.length > 0) ? '' : '<tr><td>没有更多数据</td></tr>';
	for (var i = 0; i < body.length; i++) {
		var bodyItem = body[i];
		var DCID = bodyItem.DCID;
		var htmlStr = ' <tr><td rowspan="2" width="60px" align="center"><img src="../img/arrow2.png" width="40px" height="47px" /></td><td colspan="2" width="135px"><a dcid="' + DCID + '" encript="' + bodyItem._encript + '" href="#" class="blue">'
					+ safeString(bodyItem.SSMC)//OperationName
					+ '</a></td><td colspan="2" width="155px">&nbsp;</td><td align="right" width="90px">手术部位：</td><td>' + safeString(bodyItem.SSBWMC) + '</td></tr>'//OperationPartName
					+ '<tr><td>手术日期：</td><td >'
					+ safeDateString(bodyItem.SSKSSJ)//OperationStartDateTime
					+ '</td> <td  align="right"></td><td>'
					+ '</td><td  align="right">手术机构：</td><td>'
					+ safeString(bodyItem.AuthorOrganization_text)//AuthorOrganizationName
					+ '</td></tr><tr><td colspan="7"><hr class="grey" /></td></tr><tr><td colspan="7"></td></tr>';
		html += htmlStr;
	}
	$ttable.html(html);
	if (body.length == pageSize) {
		$('a[appId=OperationRecord][rel=nextPage]').show();
	} else {
		$('a[appId=OperationRecord][rel=nextPage]').hide();
	}
	if (page <= 1) {
		$('a[appId=OperationRecord][rel=prePage]').hide();
	} else {
		$('a[appId=OperationRecord][rel=prePage]').show();
	}
	
	if(page == 0){
		$('a[appId=OperationRecord][rel=nextPage]').hide();
		$('a[appId=OperationRecord][rel=prePage]').hide();
	}
	
	bindOpenDocumentListener3('operationRecordTb', 'operation/getHtmlDocument');
}