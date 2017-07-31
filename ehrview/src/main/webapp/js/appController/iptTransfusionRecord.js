/*
 * 输血
 */
var iptTransfusionRecord = function(modId) {
	$.getJsonData('transfusion/getPtTransfusionsByVisitId', {
		"visitId": modId.JZLSH,
		"authorOrganization": modId.AuthorOrganization,
		"start": 0,
		"limit": 20
	}).done(function(data) {
		var body = data.body;
		if (body.length == 0) {
			$("#PopUpContent").html('<h1 align="center">无记录</h1>');
		} else {
			var htmlStr = "<table width='100%' class='TransfusionRecord' style='table-layout:fixed'><tbody></tbody></table>";
			$("#PopUpContent").empty()
			$("#PopUpContent").append(htmlStr);
			for (var i = 0; i < body.length; i++) {
				var bodyItem = body[i];
				if (bodyItem.PatientType == '04') {
					var DCID = bodyItem.DCID
					var htmlStr = ' <tr valign="top"><td rowspan="2" width="60px" align="center"><img src="../img/arrow2.png" width="40px" height="47px" /></td><td colspan="2" width="22%" align="left"><a dcid="' + DCID + '" encript="' + bodyItem._encript + '" href="#" class="blue">'
								+ safeString(bodyItem.SXLX_TEXT) + '&nbsp;&nbsp;' + safeString(bodyItem.SXL) + safeString(bodyItem.BloodTransfusionMeasurementUni)
								+ '</a></td><td colspan="2" width="32%">&nbsp;</td><td align="right" width="15%">输血反应：</td><td align="left">' + safeString(bodyItem.SXFY_TEXT) + '</td></tr>'
								+ '<tr valign="top"><td align="left" colspan="2" width="22%">输血日期：' + safeDateString(bodyItem.SXSJ) + '</td>'
								+ '<td colspan="2">&nbsp;</td><td align="right">输血机构：</td><td align="left">' + safeString(bodyItem.AuthorOrganization_Text) + '</td></tr>'
								+ '<tr><td colspan="7"><hr class="grey" /></td></tr><tr><td id="content_' + $.trim(DCID) + '" colspan="7"></td></tr>';
					$("#PopUpContent .TransfusionRecord").append(htmlStr);
				}
			}
			$("#PopUpContent .TransfusionRecord").find('a').bind('click', function(event) {
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
					var url = "../transfusion/getHtmlDocument?dcId=" + dcId + "&vk=" + vk;
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