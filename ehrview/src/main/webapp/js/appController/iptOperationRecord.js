/*
 * 手术
 */
var iptOperationRecord = function(modId) {
	$.getJsonData('operation/getPtOperationsByVisitId', {
		"visitId": modId.JZLSH,
		"authorOrganization": modId.AuthorOrganization,
		"start": 0,
		"limit": 20
	}).done(function(data) {
		var body = data.body;
		if (body.length == 0) {
			$("#PopUpContent").html('<h1 align="center">无记录</h1>');
		} else {
			var htmlStr = "<table class='table table-hover' width='100%' style='table-layout:fixed'></table>";
			var html = $.parseHTML(htmlStr);
			$("#PopUpContent").empty()
			$("#PopUpContent").append(html);
			for (var i = 0; i < body.length; i++) {
				var bodyItem = body[i];
				if (bodyItem.PatientType == '04') {
					var DCID = bodyItem.DCID
					var htmlStr = ' <tr valign="top"><td rowspan="2" width="60px" align="center"><img src="../img/arrow2.png" width="40px" height="47px" /></td><td colspan="2" width="22%" align="left"><a dcid="' + DCID + '" encript="' + bodyItem._encript + '" href="#" class="blue">'
								+ safeString(bodyItem.SSMC)
								+ '</a></td><td colspan="2" width="32%">&nbsp;</td><td align="right" width="15%">手术部位：</td><td align="left">' + safeString(bodyItem.SSBWMC) + '</td></tr>'
								+ '<tr valign="top"><td align="left" colspan="2" width="22%">手术日期：' + safeDateString(bodyItem.SSKSSJ) + '</td> <td  align="right"></td><td>'
								+ '</td><td  align="right">手术机构：</td><td align="left">'
								+ safeString(bodyItem.AuthorOrganization_text)
								+ '</td></tr><tr><td colspan="7"><hr class="grey" /></td></tr><tr><td colspan="7"></td></tr><tr><td id="content_' + $.trim(DCID) + '" colspan="7"></td></tr>';
					$("#PopUpContent table").append(htmlStr);
				}
			}
			$("#PopUpContent table").find('a').bind('click', function(event) {
				var encript = $(this).attr('encript');
				if (encript == 'true') {
					$.messagebox.error('提示', '无权浏览！');
					return false;
				}
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
					var url = "../operation/getHtmlDocument?dcId=" + dcId + "&vk=" + vk;
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