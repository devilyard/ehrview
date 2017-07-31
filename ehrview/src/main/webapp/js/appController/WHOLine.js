/*
 * 儿童WHO曲线
 */
$import("lib.jqplotmin",
		"lib.chart.highlighter",
		"lib.chart.cursor",
		"lib.chart.dateAxisRenderer");
var WHOLine = function () {
	$.getJsonData('children/getWHOLine')
		.done(function (data) {
			if (data.code != 200 || data.body.length == 0) {
				return;
			}
			var body = data.body;
			var checkUpdata = body['checkUpdata'];
			var standardData = body['standardData'];
			var WSD3NEG = [];
			var WSD2NEG = [];
			var WSD1NEG = [];
			var WSD0 = [];
			var WSD1 = [];
			var WSD2 = [];
			var WSD3 = [];
			var WEIGHT = [];
			// var CON = [ ];
			// var DIA = [ ];
			for (var i = 0; i < checkUpdata.length; i++) {
				var checkUpdataItem = checkUpdata[i];
				WEIGHT[i] = [checkUpdataItem.CheckupStage, parseFloat(checkUpdataItem.WEIGHT)];
			}

			for (var i = 0; i < standardData.length; i++) {
				var standardDataItem = standardData[i];
				WSD3NEG[i] = [standardDataItem.AGE, parseFloat(standardDataItem.WSD3NEG)];
				WSD2NEG[i] = [standardDataItem.AGE, parseFloat(standardDataItem.WSD2NEG)];
				WSD1NEG[i] = [standardDataItem.AGE, parseFloat(standardDataItem.WSD1NEG)];
				WSD0[i] = [standardDataItem.AGE, parseFloat(standardDataItem.WSD0)];
				WSD1[i] = [standardDataItem.AGE, parseFloat(standardDataItem.WSD1)];
				WSD2[i] = [standardDataItem.AGE, parseFloat(standardDataItem.WSD2)];
				WSD3[i] = [standardDataItem.AGE, parseFloat(standardDataItem.WSD3)];
			}

			var plot1 = $.jqplot('CDH-WHO', [WSD3NEG, WSD2NEG, WSD1NEG, WSD0, WSD1, WSD2, WSD3, WEIGHT], {
				title: '儿童体重别年龄',
				axesDefaults: {
					min: 0,
					tickOptions: {
						markSize: 4
					}
				},

				seriesDefaults: {
					markerOptions: {
						show: false,
						style: 'circle'
					}
				},
				axes: {
					xaxis: { 
						labelRenderer: $.jqplot.CanvasAxisLabelRenderer
					},
					yaxis: {
						labelRenderer: $.jqplot.CanvasAxisLabelRenderer
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
					labels: ["WSD3NEG", "WSD2NEG", "WSD1NEG", "WSD0", "WSD1", "WSD2", "WSD3", "WEIGHT"],
					location: 'ne',
					placement: 'outsideGrid'
				}
			});
		});
}