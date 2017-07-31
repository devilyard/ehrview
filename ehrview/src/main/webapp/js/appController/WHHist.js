/*
 * BMI
 */
$import("lib.jqplotmin",
		"lib.chart.highlighter",
		"lib.chart.cursor",
		"lib.chart.dateAxisRenderer",
		"lib.chart.canvasTextRenderer", 
		"lib.chart.canvasAxisTickRenderer");
var WHHist = function() {
	$.get("../partials/popUp/popModal.html", {}, function(data, textStatus, xhr) {
		var html = $.parseHTML(data);
		$("#WHHist")
			.append(html);
		$("#myModal")
			.attr('id', 'popUp-WHHist');
		$("popUp-WHHist")
			.addClass('width800')
	});
	$.getJsonData('summary/getWHHist')
		.done(function(data) {
			if (data.code != 200 || data.body.length == 0) {
				return;
			}
			var body = data.body;
			var BMI = [];
			for (var i = 0; i < body.length; i++) {
				var bodyItem = body[i];
				BMI[i] = [bodyItem.SystemTime, parseFloat(bodyItem.BMI), bodyItem];
			}

			var plot1 = $.jqplot('WHHist', [BMI], {
				title: 'BMI',
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
					labels: ["BMI"],
					location: 'ne',
					placement: 'outsideGrid'
				}
			});

			$('#WHHist')
				.bind('jqplotDataClick', function(ev, seriesIndex, pointIndex, data) {
					if (data.length == 3) {
						var d = data[2];
						if (d.SRCEntryName == "MDC_DiabetesVisit") {
							var dcId = d.SRCID;
							var url = "../diabetesVisit/getHtmlDocument?dcId=" + dcId + "&vk=" + vk;
							$.get(url, function(data) {
								var htmlStr = data.body;
								html = $.parseHTML(htmlStr);
								$("#popUp-WHHist .modal-body").empty()
								$("#popUp-WHHist .modal-body").append(html);
								var windowHeight = document.body.clientHeight;
								$('#popUp-WHHist .modal-content').css('padding-bottom', '20px');
								$('#popUp-WHHist .modal-body').css('max-height', windowHeight - 220 + 'px');
								$('#popUp-WHHist').modal();
							});
						}
					}
				});
		});
}