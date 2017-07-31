/*
 * 检验报告。
 */
var iptExamReport = function(modId) {
	$.getJsonData('examReport/getExamReportByVisitId', {
		"visitId": modId.JZLSH,
		"authorOrganization": modId.AuthorOrganization,
		"start": 0,
		"limit": 20
	}).done(function(data) {
		var body = data.body;
		if (body.length == 0) {
			$("#PopUpContent").html('<h1 align="center">无记录</h1>');
		} else {
			var htmlStr = "<table class='table table-hover ExamReport' width='100%' style='table-layout:fixed'></table>";
			$("#PopUpContent").empty()
			$("#PopUpContent").append(htmlStr);
			for (var i = 0; i < body.length; i++) {
				var bodyItem = body[i];
//				if (bodyItem.PatientType == '04') {
					var DCID = bodyItem.DCID
					var htmlStr = ' <tr valign="top"><td rowspan="2" width="60" align="center"><img src="../img/arrow2.png" width="40" height="47" /></td><td colspan="2" width="22%" align="left"><a dcid="' + DCID + '" href="#" class="blue">';
					htmlStr = htmlStr + safeString(bodyItem.JYBGDMC);
					htmlStr = htmlStr + '</a></td><td colspan="2" width="32%">&nbsp;</td><td align="right" width="15%"></td><td>';
					htmlStr = htmlStr + '</td></tr><tr valign="top"><td align="left" width="22%" colspan="2" >检验日期：' + safeDateString(bodyItem.EffectiveTime) + '</td>';
					htmlStr = htmlStr + '<td align="right"></td><td>';
					htmlStr = htmlStr + '</td><td align="right">检验机构：</td><td align="left">';
					htmlStr = htmlStr + safeString(bodyItem.AuthorOrganization_TEXT);
					htmlStr = htmlStr + '</td></tr><tr><td colspan="7"><hr class="grey" /></td></tr><tr><td id="content_' + $.trim(DCID) + '" colspan="7"></td></tr>';
					html = $.parseHTML(htmlStr);
					$("#PopUpContent .ExamReport").append(html);
//				}
			}
			$("#PopUpContent .ExamReport").find('a').bind('click', function(event) {
				var dcId = $(this).attr('dcid')
				var cId = "#content_" + dcId.trim();
				if ($(cId).hasClass('hasContent')) {
					if ($(cId).hasClass('hide')) {
						$(cId).removeClass('hide')
						$(cId).show();
					} else {
						$(cId).hide();
						$(cId).addClass('hide')
					}
				} else {
					var url = "../examReport/getHtmlDocument?dcId=" + dcId + "&vk=" + vk;
					$.get(url, function(data) {
						var htmlStr = data.body;
						html = $.parseHTML(htmlStr);
						$(cId).append(html);
						$(cId).addClass('well')
						$(cId).addClass('hasContent')
					});
				}
			});
		}
		removeRunningMask();
	});
}