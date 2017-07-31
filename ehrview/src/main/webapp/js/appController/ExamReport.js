/*
 * 检验报告。
 */
var ExamReport = function(modId, page) {
	$.getJsonData('examReport/getExamReport', {
		"start": page && page > 1 ? (page - 1) * pageSize : 0,
		"limit": pageSize
	}).done(function(data) {
		$('#effectiveTime').datepicker({
			format: 'yyyy-mm-dd'
		});
		var body = data.body;
		loadExamReport(body,page);
		
		
			
			$("#" + modId + " #ExamReport table a").bind('click', function(event) {
				var encript = $(this).attr('encript');
				if (encript == 'true') {
					$.messagebox.error('提示', '无权浏览！');
					return false;
				}
				var dcId = $(this).attr('dcid')
				var url = "../examReport/getHtmlDocument?dcId=" + dcId + "&vk=" + vk;
				$.get(url, function(data) {
					var htmlStr = data.body;
					html = $.parseHTML(htmlStr);
					$("#popUp-ExaminationRecord .modal-body").empty()
					$("#popUp-ExaminationRecord .modal-body").append(html);
					$('#popUp-ExaminationRecord').modal();
				});
				return false;
			});
		});
	
	$(".pageBar .btn-success").click(function(){
		
		var typeName = $("#typeName").val();
		var effectiveTime = $("#effectiveTime").val();
		var authorOrganizationName = $("#authorOrganizationName").val();
		var args = {
				"typeName": typeName,
				"effectiveTime": effectiveTime,
				"authorOrganizationName": authorOrganizationName
			};
		$.ajax({
			url: '/ehrview/examReport/queryExamReport/?vk=' + vk,
			data: $.toJSON(args),
			contentType: 'application/json; charset=UTF-8',
			type: 'POST',
			dataType: 'json'
		}).done(function(data) {
			var body = data.body;
			loadExamReport(body,0);
		});
		
		
	});
	
	
}

function loadExamReport(body,page){
	$.get("../partials/popUp/popModal.html", {}, function(data, textStatus, xhr) {
		$(".LabRecordContent").append(data);
		$("#myModal").attr('id', 'popUp-ExaminationRecord');
		$("#popUp-ExaminationRecord").addClass('width800')
	});
	var $ttable = $("#examReportTb")
	$ttable.attr('page', page);
	var html = body.length > 0 ? '' : '<tr><td>没有更多数据</td></tr>';
	for (var i = 0; i < body.length; i++) {
		var bodyItem = body[i];
		var DCID = bodyItem.DCID
		var htmlStr = ' <tr><td rowspan="2" width="60px" align="center"><img src="../img/arrow2.png" width="40px" height="47px" /></td><td colspan="2" width="135px"><a dcid="' + DCID + '" encript="' + bodyItem._encript + '" href="#" class="blue">';
		htmlStr = htmlStr + safeString(bodyItem.JYBGDMC);//TypeName
		htmlStr = htmlStr + '</a></td><td colspan="2" width="155px">&nbsp;</td><td align="right" width="90px"></td><td>';
		htmlStr = htmlStr + '</td></tr><tr><td>检验日期：</td><td >';
		htmlStr = htmlStr + safeDateString(bodyItem.EffectiveTime);
		htmlStr = htmlStr + '</td> <td  align="right"></td><td>';
		htmlStr = htmlStr + '</td><td  align="right">检验机构：</td><td>';
		htmlStr = htmlStr + safeString(bodyItem.AuthorOrganization_TEXT);//AuthorOrganizationName
		htmlStr = htmlStr + '</td></tr><tr><td colspan="7"><hr class="grey" /></td></tr><tr><td colspan="7"></td></tr>';
		html += htmlStr;
	}
	$ttable.html(html);
	if (body.length == pageSize) {
		$('a[appId=ExamReport][rel=nextPage]').show();
	} else {
		$('a[appId=ExamReport][rel=nextPage]').hide();
	}
	if (page <= 1) {
		$('a[appId=ExamReport][rel=prePage]').hide();
	} else {
		$('a[appId=ExamReport][rel=prePage]').show();
	}
	
	if (page == 0) {
		$('a[appId=ExamReport][rel=nextPage]').hide();
		$('a[appId=ExamReport][rel=prePage]').hide();
	}
	
	bindOpenDocumentListener3('ExamReport table', 'examReport/getHtmlDocument');
}