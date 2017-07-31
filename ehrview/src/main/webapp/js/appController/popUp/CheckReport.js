/*
 * 检查报告。
 */
var CheckReport = function () {
	$.getJsonData('checkReport/getCheckReport', {
		"start": 0,
		"limit": 20
	})
		.done(function (data) {
			var htmlStr = "<table class='table table-hover' id='ptLabReport' width='100%'></table>";
			var html = $.parseHTML(htmlStr);
			var body = data.body;
			if ($("#PopUpContent")
				.length > 0) {
				$("#PopUpContent")
					.empty()
				$("#PopUpContent")
					.append(html);
				for (var i = 0; i < body.length; i++) {
					var bodyItem = body[i];
					var DCID = bodyItem.DCID.trim()
					var htmlStr = ' <tr><td rowspan="2" width="60px" align="center"><img src="../img/arrow2.png" width="40px" height="47px" /></td><td colspan="2" width="22%"><a id=' + DCID + ' class="blue">';
					htmlStr = htmlStr + safeString(bodyItem.CheckItmNm);
					htmlStr = htmlStr + '</a></td><td colspan="2" width="32%">&nbsp;</td><td align="right" width="15%"></td><td>';
					htmlStr = htmlStr + '</td></tr><tr><td>检查日期：</td><td >';
					htmlStr = htmlStr + safeDateString(bodyItem.CheckReportDate);
					htmlStr = htmlStr + '</td> <td  align="right"></td><td>';
					htmlStr = htmlStr + '</td><td  align="right">检查机构：</td><td>';
					htmlStr = htmlStr + safeString(bodyItem.MedicalInstitutions);
					htmlStr = htmlStr + '</td></tr><tr><td colspan="7"><hr class="grey" /></td></tr><tr><td id="content_' + DCID + '" colspan="7"></td></tr>';
					html = $.parseHTML(htmlStr);
					$("#ptLabReport")
						.append(html);
				}
				$("#ptLabReport")
					.find('a')
					.bind('click', function (event) {
						var dcId = this.id
						var cId = "#content_" + this.id;

						if ($(cId)
							.hasClass('hasContent')) {
							if (
								$(cId)
								.hasClass('hide')) {
								$(cId)
									.removeClass('hide')
								$(cId)
									.show();
							} else {
								$(cId)
									.hide();
								$(cId)
									.addClass('hide')
							}
						} else {
							var url = "../checkReport/getHtmlDocument/?dcId=" + dcId + "&&vk=" + vk + "&&entryNames=ptExamReport";
							$.get(url, function (data) {
								var htmlStr = data.body;
								html = $.parseHTML(htmlStr);
								$(cId)
									.append(html);
								$(cId)
									.addClass('well')
								$(cId)
									.addClass('hasContent')

							});
						}

					});
			} else {
				$.get("../partials/popUp/popModal.html", {}, function (data, textStatus, xhr) {
					var html = $.parseHTML(data);
					$(".ExaminationRecordContent")
						.append(html);
					$('#myModal')
						.attr('id', 'popUpModal-PtExamRecord');
					$("#popUpModal-PtExamRecord")
						.addClass('width800')
				});
				$(".ExaminationRecordContent")
					.empty()
				$(".ExaminationRecordContent")
					.append(html);
				for (var i = 0; i < body.length; i++) {
					var bodyItem = body[i];
					var DCID = bodyItem.DCID.trim()
					var htmlStr = ' <tr><td rowspan="2" width="60" align="center"><img src="../img/arrow2.png" width="40" height="47" /></td><td colspan="2" width="22%"><a id=' + DCID + ' class="blue">';
					htmlStr = htmlStr + safeString(bodyItem.CheckItmNm);
					htmlStr = htmlStr + '</a></td><td colspan="2" width="32%">&nbsp;</td><td align="right" width="15%"></td><td>';
					htmlStr = htmlStr + '</td></tr><tr><td>检查日期：</td><td >';
					htmlStr = htmlStr + safeDateString(bodyItem.CheckReportDate);
					htmlStr = htmlStr + '</td> <td  align="right"></td><td>';
					htmlStr = htmlStr + '</td><td  align="right">检查机构：</td><td>';
					htmlStr = htmlStr + safeString(bodyItem.MedicalInstitutions);
					htmlStr = htmlStr + '</td></tr><tr><td colspan="7"><hr class="grey" /></td></tr><tr><td id="content_' + DCID + '" colspan="7"></td></tr>';
					html = $.parseHTML(htmlStr);
					$("#ptLabReport")
						.append(html);
				}
				$("#ptLabReport")
					.find('a')
					.bind('click', function (event) {
						$('#popUpModal-PtExamRecord')
							.modal();

						var dcId = this.id

						var url = "../checkReport/getHtmlDocument/?dcId=" + dcId + "&&vk=" + vk + "&&entryNames=ptExamReport";
						$.get(url, function (data) {
							var htmlStr = data.body;
							html = $.parseHTML(htmlStr);
							$(".modal-body")
								.empty()
							$(".modal-body")
								.append(html);

						});


					});
			}

		});
}