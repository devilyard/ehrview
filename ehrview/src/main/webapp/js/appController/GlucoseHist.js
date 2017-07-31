/*
 * 血糖
 */
$import("lib.jqplotmin",
		"lib.chart.highlighter",
		"lib.chart.cursor",
		"lib.chart.dateAxisRenderer",
		"lib.chart.canvasTextRenderer", 
		"lib.chart.canvasAxisTickRenderer");
var GlucoseHist = function() {
	$.get("../partials/popUp/popModal.html", {}, function(data, textStatus, xhr) {
		var html = $.parseHTML(data);
		$("#GlucoseHist").append(html);
		$("#myModal").attr('id', 'popUp-GlucoseHist');
		$("popUp-GlucoseHist").addClass('width800')
	});

	$.getJsonData('summary/getGlucoseHist').done(function(data) {
		if (data.code != 200 || data.body.length == 0) {
			return;
		}
		var body = data.body;
		var FBS = [];
		var PBS = [];
		for (var i = 0; i < body.length; i++) {
			var bodyItem = body[i];
			FBS[i] = [bodyItem.SystemTime, parseFloat(bodyItem.FBS), bodyItem];
			PBS[i] = [bodyItem.SystemTime, parseFloat(bodyItem.PBS), bodyItem];
		}

		var plot1 = $.jqplot('GlucoseHist', [FBS, PBS], {
			title: '血糖',
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
				labels: ["空腹血糖", "餐后血糖"],
				location: 'ne',
				placement: 'outsideGrid'
			}
		});

		$('#GlucoseHist')
			.bind('jqplotDataClick', function(ev, seriesIndex, pointIndex, data) {
				if (data.length == 3) {
					var d = data[2];
					if (d.SRCEntryName == "MDC_DiabetesVisit") {
						var dcId = d.SRCID;
						var url = "../diabetesVisit/getHtmlDocument?dcId=" + dcId + "&vk=" + vk;
						$.get(url, function(data) {
							var htmlStr = data.body;
							html = $.parseHTML(htmlStr);
							$("#popUp-GlucoseHist .modal-body").empty()
							$("#popUp-GlucoseHist .modal-body").append(html);
							var windowHeight = document.body.clientHeight;
							$('#popUp-GlucoseHist .modal-content').css('padding-bottom', '20px');
							$('#popUp-GlucoseHist .modal-body').css('max-height', windowHeight - 220 + 'px');
							$('#popUp-GlucoseHist').modal();
						});
					}
				}
			});
	});
}