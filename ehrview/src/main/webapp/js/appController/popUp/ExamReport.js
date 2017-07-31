/*
 * 检验报告。
 */
var ExamReport = function() {
	$.getJsonData('examReport/getExamReport', {
		"start": 0,
		"limit": 20
	})
		.done(function(data) {
			console.log(data)
			var htmlStr = "<table class='table table-hover' id='ptExamRecord' width='100%'></table>";
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
					htmlStr = htmlStr + safeString(bodyItem.TypeName);
					htmlStr = htmlStr + '</a></td><td colspan="2" width="32%">&nbsp;</td><td align="right" width="15%"></td><td>';
					htmlStr = htmlStr + '</td></tr><tr><td>检验日期：</td><td >';
					htmlStr = htmlStr + safeDateString(bodyItem.EffectiveTime);
					htmlStr = htmlStr + '</td> <td  align="right"></td><td>';
					htmlStr = htmlStr + '</td><td  align="right">检验机构：</td><td>';
					htmlStr = htmlStr + safeString(bodyItem.AuthorOrganizationName);
					htmlStr = htmlStr + '</td></tr><tr><td colspan="7"><hr class="grey" /></td></tr><tr><td id="content_' + DCID + '" colspan="7"></td></tr>';
					html = $.parseHTML(htmlStr);
					$("#ptExamRecord")
						.append(html);
				}
				$("#ptExamRecord")
					.find('a')
					.bind('click', function(event) {
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
							var url = "../examReport/getHtmlDocument?dcId=" + dcId + "&vk=" + vk;
							$.get(url, function(data) {
								var htmlStr = data.body;
								html = $.parseHTML(htmlStr);
								$(cId)
									.append(html);
								$(cId)
									.addClass('well')
								$(cId)
									.addClass('hasContent')
								cId.scrollIntoView(false)

							});
						}

					});
			} else {

				$.get("../partials/popUp/popModal.html", {}, function(data, textStatus, xhr) {
					var html = $.parseHTML(data);
					$(".ExaminationRecordContent")
						.append(html);
					$("#myModal")
						.attr('id', 'popUp-ExaminationRecord');
					$("#popUp-ExaminationRecord")
						.addClass('width800')
				});

				$(".LabRecordContent")
					.empty()
				$(".LabRecordContent")
					.append(html);

				for (var i = 0; i < body.length; i++) {
					var bodyItem = body[i];
					var DCID = bodyItem.DCID.trim()
					var htmlStr = ' <tr><td rowspan="2" width="60" align="center"><img src="../img/arrow2.png" width="40" height="47" /></td><td colspan="2" width="22%"><a id=' + DCID + ' class="blue">';
					htmlStr = htmlStr + safeString(bodyItem.TypeName);
					htmlStr = htmlStr + '</a></td><td colspan="2" width="32%">&nbsp;</td><td align="right" width="15%"></td><td>';
					htmlStr = htmlStr + '</td></tr><tr><td>检验日期：</td><td >';
					htmlStr = htmlStr + safeDateString(bodyItem.EffectiveTime);
					htmlStr = htmlStr + '</td> <td  align="right"></td><td>';
					htmlStr = htmlStr + '</td><td  align="right">检验机构：</td><td>';
					htmlStr = htmlStr + safeString(bodyItem.AuthorOrganizationName);
					htmlStr = htmlStr + '</td></tr><tr><td colspan="7"><hr class="grey" /></td></tr><tr><td id="content_' + DCID + '" colspan="7"></td></tr>';
					html = $.parseHTML(htmlStr);
					$("#ptExamRecord")
						.append(html);
				}
				$("#ptExamRecord")
					.find('a')
					.bind('click', function(event) {
						var dcId = this.id
						var cId = "#content_" + this.id;
						$('#popUp-ExaminationRecord')
							.modal();
						var url = "../examReport/getHtmlDocument/?dcId=" + dcId + "&&vk=" + vk + "&&entryNames=ptExamReport";
						$.get(url, function(data) {
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