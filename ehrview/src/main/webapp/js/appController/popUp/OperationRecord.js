var OperationRecord = function() {
	$.getJsonData('operation/getPtOperation', {
		"start": 0,
		"limit": 20
	})
		.done(function(data) {
			console.log(data)
			var htmlStr = "<table class='table table-hover' id='ptOperation' width='100%'></table>";
			var html = $.parseHTML(htmlStr);
			var body = data.body;

			$("#PopUpContent")
				.empty()
			$("#PopUpContent")
				.append(html);
			for (var i = 0; i < body.length; i++) {
				var bodyItem = body[i];
				console.log(bodyItem)
				var DCID = bodyItem.DCID.trim()
				var htmlStr = ' <tr><td rowspan="2" width="60px" align="center"><img src="../img/arrow2.png" width="40px" height="47px" /></td><td colspan="2" width="22%"><a id=' + DCID + ' class="blue">';
				htmlStr = htmlStr + safeString(bodyItem.OperationName);
				htmlStr = htmlStr + '</a></td><td colspan="2" width="32%">&nbsp;</td><td align="right" width="15%"></td><td>';
				htmlStr = htmlStr + '</td></tr><tr><td>手术日期：</td><td >';
				htmlStr = htmlStr + safeDateString(bodyItem.OperationStartDateTime);
				htmlStr = htmlStr + '</td> <td  align="right"></td><td>';
				htmlStr = htmlStr + '</td><td  align="right">手术部位：</td><td>';
				htmlStr = htmlStr + safeString(bodyItem.OperationPartName);
				htmlStr = htmlStr + '</td></tr><tr><td colspan="7"><hr class="grey" /></td></tr><tr><td id="content_' + DCID + '" colspan="7"></td></tr>';
				html = $.parseHTML(htmlStr);
				$("#ptOperation")
					.append(html);
			}
			$("#ptOperation")
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
						var url = "../operation/getHtmlDocument?dcId=" + dcId + "&vk=" + vk;
						$.get(url, function(data) {
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
		});
}