/*
 * 主界面检查报告。
 */
var CheckReport = function(modId, page) {
	$.getJsonData('checkReport/getCheckReport', {
		"start": page && page > 1 ? (page - 1) * pageSize : 0,
		"limit": pageSize
	}).done(function(data) {
		$('#checkReportDate').datepicker({
			format: 'yyyy-mm-dd'
		});
		var body = data.body;
		loadCheckReport(body,page);
	});
	
	$(".pageBar .btn-success").click(function(){
		
		var checkItmNm = $("#checkItmNm").val();
		var checkReportDate = $("#checkReportDate").val();
		var medicalInstitutions = $("#medicalInstitutions").val();
		var args = {
				"checkItmNm": checkItmNm,
				"checkReportDate": checkReportDate,
				"medicalInstitutions": medicalInstitutions
			};
		$.ajax({
			url: '/ehrview/checkReport/queryCheckReport/?vk=' + vk,
			data: $.toJSON(args),
			contentType: 'application/json; charset=UTF-8',
			type: 'POST',
			dataType: 'json'
		}).done(function(data) {
			var body = data.body;
			loadCheckReport(body,0);
		});
	});
}

$(document).on('click', '.modal-footer button', function(event) {
	var url = $(this).attr("url");
	var exploreType = getExploreType();
	if (exploreType.ie) { //IE 
		feature = "dialogHeight:" + window.screen.height + "px;dialogWidth:" + window.screen.width + "px;status:no;help:no";
		window.showModalDialog(url, null, feature);
	} else if (exploreType.firefox) {
		feature = "fullscreen=1,menubar=no,toolbar=no,location=no,";
		feature += "scrollbars=yes,status=no,modal=yes";
		window.open(url, null, feature);
	} else {
		feature = "menubar=no,toolbar=no,location=no,";
		var heightL = window.screen.height - 110;
		var widthL = window.screen.width - 10;
		feature += "width=" + widthL + ",height=" + heightL + ",";
		feature += "scrollbars=yes,status=no,modal=yes";
		window.open(url, null, feature);
	}
});

var getExploreType = function() {
	var sys = {};
	var ua = navigator.userAgent.toLowerCase();
	var s;
	(s = ua.match(/msie ([\d.]+)/)) ? sys.ie = s[1] :
		(s = ua.match(/firefox\/([\d.]+)/)) ? sys.firefox = s[1] :
		(s = ua.match(/chrome\/([\d.]+)/)) ? sys.chrome = s[1] :
		(s = ua.match(/opera.([\d.]+)/)) ? sys.opera = s[1] :
		(s = ua.match(/version\/([\d.]+).*safari/)) ? sys.safari = s[1] : 0;
	return sys;
};

function loadCheckReport(body,page){
	$.get("../partials/popUp/popModal.html", {}, function(data, textStatus, xhr) {
		$(".ExaminationRecordContent").append(data);
		$('#myModal').attr('id', 'popUpModal-PtCheckRecord');
		$("#popUpModal-PtExamRecord").addClass('width800')
	});
	var $ttable = $("#checkReportTb")
	$ttable.attr('page', page);
	var html = body.length > 0 ? '' : '<tr><td>没有更多数据</td></tr>';
	for (var i = 0; i < body.length; i++) {
		var bodyItem = body[i];
		var DCID = bodyItem.DCID
		var studyUID = bodyItem.StudyUID;
		var htmlStr = ' <tr><td rowspan="2" width="60px" align="center"><img src="../img/arrow2.png" width="40px" height="47px" /></td><td colspan="2" style="width:155px"><a dcid="' + DCID + (studyUID ? '" studyUID="' + studyUID + '"' : '"') + ' encript="' + bodyItem._encript + '" authorOrganization="' + safeString(bodyItem.AuthorOrganization) + '" href="#" class="blue">';
		htmlStr = htmlStr + safeString(bodyItem.JCXMMC);//CheckItmNm
		htmlStr = htmlStr + '</a></td><td colspan="2" width="155px">&nbsp;</td><td align="right" width="90px"></td><td>';
		htmlStr = htmlStr + '</td></tr><tr><td>检查日期：</td><td >';
		htmlStr = htmlStr + safeDateString(bodyItem.JCRQ);//CheckReportDate
		htmlStr = htmlStr + '</td> <td  align="right"></td><td>';
		htmlStr = htmlStr + '</td><td  align="right">检查机构：</td><td>';
		htmlStr = htmlStr + safeString(bodyItem.AuthorOrganization_TEXT);//MedicalInstitutions
		htmlStr = htmlStr + '</td></tr><tr><td colspan="7"><hr class="grey" /></td></tr><tr><td  colspan="7"></td></tr>';
		html += htmlStr;
	}
	$ttable.html(html);
	if (body.length == pageSize) {
		$('a[appId=CheckReport][rel=nextPage]').show();
	} else {
		$('a[appId=CheckReport][rel=nextPage]').hide();
	}
	if (page <= 1) {
		$('a[appId=CheckReport][rel=prePage]').hide();
	} else {
		$('a[appId=CheckReport][rel=prePage]').show();
	}
	
	if(page == 0){
		$('a[appId=CheckReport][rel=nextPage]').hide();
		$('a[appId=CheckReport][rel=prePage]').hide();
	}
	
	$ttable.find('a').bind('click', function(event) {
		var encript = $(this).attr('encript');
		if (encript == 'true') {
			$.messagebox.error('提示', '无权浏览！');
			return false;
		}
		var dcId = $(this).attr('dcId')
		var authorOrganization = $(this).attr("authorOrganization");
		var url = "../checkReport/getScreenageDocument?dcId=" + dcId + "&vk=" + vk + "&authorOrganization=" + authorOrganization;
		var studyUID = $(this).attr('studyUID');
		if (studyUID) {
			 url += "&studyUID=" + studyUID;
		}
		$.get(url, function(res) {
			if (res.code == 200 || res.code == 404 || res.code == 406) {
				var htmlStr = res.body.html;
				$("#popUpModal-PtCheckRecord .modal-body").empty();
				$("#popUpModal-PtCheckRecord .modal-body").append(htmlStr);
				$("#popUpModal-PtCheckRecord .modal-content .modal-footer").remove();
				var windowHeight = document.body.clientHeight;
				if(htmlStr != null && htmlStr.substring(0, 5) == "<pdf>") {
					if (res.code == 404) {
						var height = windowHeight - 220;
					} else if (res.code != 406) {
						height = windowHeight - 260;
					} else {
						height = windowHeight - 220;
					}
					var url = htmlStr.substring(5, htmlStr.length - 6);
					url += "?vk=" + vk;
					new PDFObject({ url: url, height: height + 'px'}).embed("pdf");
				}
				if (res.code == 404) {
					$("#popUpModal-PtCheckRecord .modal-content").append('<div class="modal-footer" style="color: #ff0000;">' + res.message + '</div>');
					$('#popUpModal-PtCheckRecord .modal-body').css('max-height', windowHeight - 220 + 'px');
				} else if (res.code != 406) {
					$("#popUpModal-PtCheckRecord .modal-content").append('<div class="modal-footer"><button type="button" url=' + res.body.url + ' class="btn btn-default" >显示影像</button></div>');
					$('#popUpModal-PtCheckRecord .modal-body').css('max-height', windowHeight - 260 + 'px');
				}
				$('#popUpModal-PtCheckRecord').modal();
			} else {
				$.messagebox.error('错误', res.code + ":" + res.message);
			}
		});
		return false;
	});
}