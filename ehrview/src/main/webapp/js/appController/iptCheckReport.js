/*
 * 检查报告。
 */
var iptCheckReport = function(modId) {
	$.getJsonData('checkReport/getCheckReportsByVisitId', {
		"visitId": modId.JZLSH,
		"authorOrganization": modId.AuthorOrganization,
		"start": 0,
		"limit": 20
	}).done(function(data) {
		var body = data.body;
		if (body.length == 0) {
			$("#PopUpContent").html('<h1 align="center">无记录</h1>');
		} else {
			var htmlStr = "<table class='table table-hover CheckReport'  width='100%' style='table-layout:fixed'></table>";
			$("#PopUpContent").empty()
			$("#PopUpContent").append(htmlStr);
			for (var i = 0; i < body.length; i++) {
				var bodyItem = body[i];
//				if (bodyItem.ClinicFlag == '2') {
					var DCID = bodyItem.DCID
					var studyUID = bodyItem.StudyUID;
					var htmlStr = ' <tr valign="top"><td rowspan="2" width="60" align="center"><img src="../img/arrow2.png" width="40" height="47" /></td><td colspan="2" width="22%" align="left"><a dcid="' + DCID + (studyUID ? '" studyUID="' + studyUID + '"' : '"') + ' authorOrganization=' + safeString(bodyItem.AuthorOrganization) + ' href="#"  class="blue">';
					htmlStr = htmlStr + safeString(bodyItem.JCXMMC);
					htmlStr = htmlStr + '</a></td><td colspan="2" width="32%">&nbsp;</td><td align="right" width="15%"></td><td>';
					htmlStr = htmlStr + '</td></tr><tr valign="top"><td align="left" colspan="2" width="22%">检查日期：' + safeDateString(bodyItem.JCRQ) + '</td>';
					htmlStr = htmlStr + '<td  align="right"></td><td>';
					htmlStr = htmlStr + '</td><td  align="right">检查机构：</td><td align="left">';
					htmlStr = htmlStr + safeString(bodyItem.AuthorOrganization_TEXT);
					htmlStr = htmlStr + '</td></tr><tr><td colspan="7"><hr class="grey" /></td></tr><tr><td id="content_' + $.trim(DCID) + '" colspan="7"></td></tr>';
					html = $.parseHTML(htmlStr);
					$("#PopUpContent .CheckReport").append(html);
//				}
			}
			$("#PopUpContent .CheckReport").find('a').bind('click', function(event) {
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
					var authorOrganization = $(this).attr("authorOrganization");
					var url = "../checkReport/getScreenageDocument?dcId=" + dcId + "&vk=" + vk + "&authorOrganization=" + authorOrganization;
					var studyUID = $(this).attr('studyUID');
					if (studyUID) {
						 url += "&studyUID=" + studyUID;
					}
					$.get(url, function(res) {
						if (res.code == 200 || res.code == 404 || res.code == 406) {
							var htmlStr = res.body.html;
							$(cId).append(htmlStr);
							$(cId).addClass('well')
							$(cId).addClass('hasContent')
							if (res.code == 404) {
								$(cId).append('<div class="modal-footer" style="color: #ff0000;">' + res.message + '</div>');
							} else if (res.code != 406) {
								$(cId).append('<div class="modal-footer"><button type="button" url=' + res.body.url + ' class="btn btn-default" >显示影像</button></div>');
							}
						}
					});
				}
			});
		}
		removeRunningMask();
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