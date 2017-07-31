/*
 * 生命周期
 */
var Lifecycle = function() {
	var nqKey = ["gerontic", "middleAge", "adolescence", "boyhood", "childhood", "babyhood"];
	var planType = {
		"Ipt_MedicalRecordPage_View": "zy",
		"Opt_Record": "mz",
		"Pt_ExamReport": "jc",
		"Pt_Operation": "ss"
	};
	for (var i = 0; i < nqKey.length; i++) {
		var timeSlot = nqKey[i]
		$.getJsonData('app/getLifecycle', {
			"timeSlot": timeSlot,
			"start": 0,
			"limit": pageSize
		}, true).done(function(data) {
			var body = data.body;
			var ulStr = "<ul class='nav nav-pills nav-stacked'></ul>";
			$("#" + timeSlot + " .panel-body").append(ulStr);
			var i = 0,
				l = body.length;
			$('#' + timeSlot + ' .title1 .num').html(l);
			$("#" + timeSlot + " .mz .panel-body ul").append("<d class='nodata'>无此年龄段数据</d>");
			$("#" + timeSlot + " .zy .panel-body ul").append("<d class='nodata'>无此年龄段数据</d>");
			$("#" + timeSlot + " .jc .panel-body ul").append("<d class='nodata'>无此年龄段数据</d>");
			$("#" + timeSlot + " .ss .panel-body ul").append("<d class='nodata'>无此年龄段数据</d>");
			for (; i < l; i++) {
				var o = body[i];
				var liStr = "<li><a href='#' " + (o.StudyUID ? 'studyUID="' + o.StudyUID + '" ' : '') + (o.AuthorOrganization ? 'authorOrganization="' + o.AuthorOrganization + '" ' : '') + "data-toggle='pill' RecordDCID='" + o.RecordDCID + "' encript='" + o._encript + "' ContingencyTable='" + o.ContingencyTable + "'><span class='text-left'><strong>" + safeString(o.RecordName) + "</strong></span><span class='text-right'> " + safeDateString(o.TIME) + "</span></a></li>";
				if (planType[o.ContingencyTable] == "mz") {
					$("#" + timeSlot + " .mz .panel-body ul .nodata").remove();
					$("#" + timeSlot + " .mz .panel-body ul").append(liStr);
				} else if (planType[o.ContingencyTable] == "zy") {
					$("#" + timeSlot + " .zy .panel-body ul .nodata").remove();
					$("#" + timeSlot + " .zy .panel-body ul").append(liStr);
				} else if (planType[o.ContingencyTable] == "jc") {
					$("#" + timeSlot + " .jc .panel-body ul .nodata").remove();
					$("#" + timeSlot + " .jc .panel-body ul").append(liStr);
				} else if (planType[o.ContingencyTable] == "ss") {
					$("#" + timeSlot + " .ss .panel-body ul .nodata").remove();
					$("#" + timeSlot + " .ss .panel-body ul").append(liStr);
				}
			}
			find(l,timeSlot);
			var l = $("#" + timeSlot + " .mz .panel-body ul li").length;
			$("#" + timeSlot + " .mz.title2 .num").html(l);
			var l = $("#" + timeSlot + " .zy .panel-body ul li").length;
			$("#" + timeSlot + " .zy.title2 .num").html(l);
			var l = $("#" + timeSlot + " .jc .panel-body ul li").length;
			$("#" + timeSlot + " .jc.title2 .num").html(l);
			var l = $("#" + timeSlot + " .ss .panel-body ul li").length;
			$("#" + timeSlot + " .ss.title2 .num").html(l);
		});
	}
	$.get("../partials/popUp/popModal.html", {}, function(data, textStatus, xhr) {
		var html = $.parseHTML(data);
		$("#Lifecycle").append(html)
		$("#Lifecycle .modal").attr("id", "Lifecycle-popUp")
	})
}

function nPage(timeSlot) {
	var page = Number($("#" + timeSlot + " .pageBar").attr('page'))+1;
	query(timeSlot,page);
}

function pPage(timeSlot) {
	var page = Number($("#" + timeSlot + " .pageBar").attr('page'));
	page = page <= 1 ? 1 : page - 1;
	query(timeSlot,page);
}

function find(l,timeSlot){
	$("#" + timeSlot + " .pageBar").attr('page', 1);
	if (l == pageSize) {
		$("#" + timeSlot + " .pageBar a[rel=nextPage]").show();
	} else {
		$("#" + timeSlot + " .pageBar a[rel=nextPage]").hide();
	}
	$("#" + timeSlot + " .pageBar a[rel=nextPage]").click(function() {
		var appId = $(this).attr('appId');
		nPage(appId);
		return false;
	});
	
	$("#" + timeSlot + " .pageBar a[rel=prePage]").click(function() {
		var appId = $(this).attr('appId');
		pPage(appId);
		return false;
	});
}


function query(timeSlot,page){
	
	var planType = {
			"Ipt_MedicalRecordPage_View": "zy",
			"Opt_Record": "mz",
			"Pt_ExamReport": "jc",
			"Pt_Operation": "ss"
			//"EMR_InpatientRecordHome": "zy",
			//"OPT_Record": "mz",
			//"PT_CheckReport": "jc",
			//"EMR_OperationRecord": "ss"
		};
	$.getJsonData('app/getLifecycle', {
		"timeSlot": timeSlot,
		"start": page && page > 1 ? (page - 1) * pageSize : 0,
		"limit": pageSize
	}, true).done(function(data) {
		var body = data.body;
		var i = 0,
			l = body.length;
		$('#' + timeSlot + ' .title1 .num').empty();
		$('#' + timeSlot + ' .title1 .num').html(l);
		
		$("#" + timeSlot + " .pageBar").attr('page', page);
		
		if (l == pageSize) {
			$("#" + timeSlot + " .pageBar a[rel=nextPage]").show();
		} else {
			$("#" + timeSlot + " .pageBar a[rel=nextPage]").hide();
		}
		if (page <= 1) {
			$("#" + timeSlot + " .pageBar a[rel=prePage]").hide();
		} else {
			$("#" + timeSlot + " .pageBar a[rel=prePage]").show();
		}
		
		$("#" + timeSlot + " .mz .panel-body ul").html("<d class='nodata'>无此年龄段数据</d>");
		$("#" + timeSlot + " .zy .panel-body ul").html("<d class='nodata'>无此年龄段数据</d>");
		$("#" + timeSlot + " .jc .panel-body ul").html("<d class='nodata'>无此年龄段数据</d>");
		$("#" + timeSlot + " .ss .panel-body ul").html("<d class='nodata'>无此年龄段数据</d>");
		
		for (; i < l; i++) {
			var o = body[i];
			var liStr = "<li><a href='#' " + (o.StudyUID ? 'studyUID="' + o.StudyUID + '" ' : '') + (o.AuthorOrganization ? 'authorOrganization="' + o.AuthorOrganization + '" ' : '') + "data-toggle='pill' RecordDCID='" + o.RecordDCID + "' encript='" + o._encript + "' ContingencyTable='" + o.ContingencyTable + "'><span class='text-left'><strong>" + safeString(o.RecordName) + "</strong></span><span class='text-right'> " + safeDateString(o.TIME) + "</span></a></li>";
			if (planType[o.ContingencyTable] == "mz") {
				$("#" + timeSlot + " .mz .panel-body ul .nodata").remove();
				$("#" + timeSlot + " .mz .panel-body ul").append(liStr);
			} else if (planType[o.ContingencyTable] == "zy") {
				$("#" + timeSlot + " .zy .panel-body ul .nodata").remove();
				$("#" + timeSlot + " .zy .panel-body ul").append(liStr);
			} else if (planType[o.ContingencyTable] == "jc") {
				$("#" + timeSlot + " .jc .panel-body ul .nodata").remove();
				$("#" + timeSlot + " .jc .panel-body ul").append(liStr);
			} else if (planType[o.ContingencyTable] == "ss") {
				$("#" + timeSlot + " .ss .panel-body ul .nodata").remove();
				$("#" + timeSlot + " .ss .panel-body ul").append(liStr);
			}
		}
		
		var l = $("#" + timeSlot + " .mz .panel-body ul li").length;
		$("#" + timeSlot + " .mz.title2 .num").html(l);
		var l = $("#" + timeSlot + " .zy .panel-body ul li").length;
		$("#" + timeSlot + " .zy.title2 .num").html(l);
		var l = $("#" + timeSlot + " .jc .panel-body ul li").length;
		$("#" + timeSlot + " .jc.title2 .num").html(l);
		var l = $("#" + timeSlot + " .ss .panel-body ul li").length;
		$("#" + timeSlot + " .ss.title2 .num").html(l);
	});
}


$(document).on("click", " .panel-body ul li a", function() {
	var encript = $(this).attr('encript');
	if (encript == 'true') {
		$.messagebox.error('提示', '无权浏览！');
		return false;
	}
	var ContingencyTable = $(this).attr("ContingencyTable")
	var RecordDCID = $(this).attr("RecordDCID")
	var url = "";
	switch (ContingencyTable) {
		case "Ipt_MedicalRecordPage_View":
			url = "../iptRecordHome/getHtmlDocument?dcId=" + RecordDCID + "&vk=" + vk;
			break;
		case "Opt_Record":
//			url = "false";
//			$("#Lifecycle-popUp .modal-body").empty();
//			$.getJsonData('medical/ClinicRecordByDCID', {
//				"DCID": RecordDCID
//			}, true).done(function(data) {
//				var body = data.body;
//				var trStr = "<h1 style='text-align:center'>就诊信息</h1><table class='table'><tr><td align='left'>就诊流水号:" + safeString(body.VisitID) + "</td><td align='left'>就诊日期:" + safeDateString(body.JZRQ) + "</td></tr><tr><td align='left'>卡号:" + safeString(body.KH) + "</td><td align='left'>卡类型:" + safeString(body.KH) + "</td></tr><tr><td align='left'>就诊机构:" + safeString(body.KLX) + "</td><td align='left'>就诊科室:" + safeString(body.JZKSMC) + "</td></tr><tr><td align='left'>诊断编码:" + safeString(body.ZDBM) + "</td><td align='left'>诊断名称:" + safeString(body.ZDMC) + "</td></tr><tr><td align='left'>主诉:" + safeString(body.ZS) + "</td><td align='left'>症状描述:" + safeString(body.ZZMS) + "</td></tr><tr><td></td><td></td></tr></table>"
//				$("#Lifecycle-popUp .modal-body").append(trStr);
//				var windowHeight = document.body.clientHeight;
//				$('#Lifecycle-popUp .modal-content').css('padding-bottom', '20px');
//				$('#Lifecycle-popUp .modal-body').css('max-height', windowHeight - 220 + 'px');
//				$("#Lifecycle-popUp").modal();
//			})
			
			url = "../medical/getHtmlDocument?dcId=" + RecordDCID + "&vk=" + vk;
			break;
		case "Pt_ExamReport":
			var authorOrganization = $(this).attr('authorOrganization');
			url = "../checkReport/getScreenageDocument/?dcId=" + RecordDCID + "&vk=" + vk + "&authorOrganization=" + authorOrganization;
			var studyUID = $(this).attr('studyUID');
			if (studyUID) {
				url += "&studyUID=" + studyUID;
			}
			break;
		case "Pt_Operation":
			url = "../operation/getHtmlDocument?dcId=" + RecordDCID + "&vk=" + vk;;
			break;
		default:
			url = "false";
	}
	if (url == "false") {
		return false;
	} else {
		$.get(url, function(res) {
			if (ContingencyTable == 'Pt_ExamReport') {
				if (res.code == 200 || res.code == 404 || res.code == 406) {
					var htmlStr = res.body.html;
					$("#Lifecycle-popUp .modal-body").html(htmlStr);
					if (!$("#Lifecycle-popUp div").hasClass("modal-footer")) {
						if (res.code == 404) {
							$("#Lifecycle-popUp .modal-body").append('<div class="modal-footer" style="color: #ff0000;">' + res.message + '</div>');
						} else if (res.code != 406) {
							$("#Lifecycle-popUp .modal-body").append('<div class="modal-footer"><button type="button" url=' + res.body.url + ' class="btn btn-default" >显示影像</button></div>');
						}
					}
					if (res.code == 406) {
						$("#Lifecycle-popUp .modal-body .modal-footer").remove();
					}
				} 
			} else {
				var htmlStr = res.body;
				$("#Lifecycle-popUp .modal-body").html(htmlStr);
			}
			var windowHeight = document.body.clientHeight;
			$('#Lifecycle-popUp .modal-content').css('padding-bottom', '20px');
			$('#Lifecycle-popUp .modal-body').css('max-height', windowHeight - 220 + 'px');
			$("#Lifecycle-popUp").modal();
		})
	}
	return false;
})