/*
 *血压
 */
$import("lib.jqplotmin",
		"lib.chart.highlighter",
		"lib.chart.cursor",
		"lib.chart.dateAxisRenderer",
		"lib.chart.canvasTextRenderer", 
		"lib.chart.canvasAxisLabelRenderer", 
		"lib.chart.canvasAxisTickRenderer");
var BloodPress = function() {
	$.get("../partials/popUp/popModal.html", {}, function(data, textStatus, xhr) {
		var html = $.parseHTML(data);
		$("#BloodPress").append(html);
		$("#myModal").attr('id', 'popUp-BloodPress');
		$("popUp-BloodPress").addClass('width800')
	});

	$.getJsonData('summary/getBloodPress').done(function(data) {
		if (data.code != 200 || data.body.length == 0) {
			return;
		}
		var body = data.body;
		var CON = [];
		var DIA = [];
		for (var i = 0; i < body.length; i++) {
			var bodyItem = body[i];
			CON[i] = [bodyItem.SystemTime, parseFloat(bodyItem.CON), bodyItem];
			DIA[i] = [bodyItem.SystemTime, parseFloat(bodyItem.DIA), bodyItem];
		}

		var plot1 = $.jqplot('BloodPress', [DIA, CON], {
			title: '血压',
			axes: {
				xaxis: {
					renderer: $.jqplot.DateAxisRenderer,
					tickRenderer: $.jqplot.CanvasAxisTickRenderer,
		            tickOptions: {
		                angle: 270,
		                fontSize: '12px',
						formatString: '%F',
						labelPosition: 'middle'
					}
				},
				yaxis: {

				}
			},
			highlighter: {
				show: true,
				sizeAdjust: 7.5
			},
			cursor: {
				show: false
			},
			legend: {
				show: true,
				labels: ["舒张压", "收缩压"],
				location: 'ne',
				placement: 'outsideGrid'
			}
		});

		$('#BloodPress').bind('jqplotDataClick', function(ev, seriesIndex, pointIndex, data) {
			if (data.length == 3) {
				var d = data[2];
				if (d.SRCEntryName == "MDC_HypertensionVisit") {
					var dcId = d.SRCID;
					var url = "../hypertensionVisit/getHtmlDocument?dcId=" + dcId + "&vk=" + vk;
					$.get(url, function(data) {
						var htmlStr = data.body;
						html = $.parseHTML(htmlStr);
						$("#popUp-BloodPress .modal-body").empty()
						$("#popUp-BloodPress .modal-body").append(html);
						var windowHeight = document.body.clientHeight;
						$('#popUp-BloodPress .modal-content').css('padding-bottom', '20px');
						$('#popUp-BloodPress .modal-body').css('max-height', windowHeight - 220 + 'px');
						$('#popUp-BloodPress').modal();
					});
				}
			}
		});
	});
}