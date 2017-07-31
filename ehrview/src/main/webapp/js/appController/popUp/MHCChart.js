$import("lib.jqplotmin",
		"lib.chart.highlighter",
		"lib.chart.cursor",
		"lib.chart.dateAxisRenderer",
		"lib.chart.canvasTextRenderer", 
		"lib.chart.canvasAxisTickRenderer");
var pregnants = [];
var pregnantObj;
var tenth = [];
var fiveth = [];
var nineth = [];
var HeightFundusUterus = [];
var dcids = {};
var MHCChart = function(id) {
	$("#" + id).empty();
	var url = "pregnantVisit/getVisitRecord";
	var chartStr = "<div id='MHCChartView' style='height: 400px;'></div>";
	var html = $.parseHTML(chartStr);
	if ($("#" + id).length > 0) {
		$("#" + id).html(html)
	}

	if (!pregnantObj) {
		pregnantObj = pregnants[0];
	}
	var cnd = {
		"pregnantId": pregnantObj.pregnantId
	};
	$.getJsonData(url, cnd).done(function(data) {
		var body = data.body;
		var visitData = body["visitData"];
		var pregnancyStandardData = body["pregnancyStandardData"];
		for (var j = 0; j < pregnancyStandardData.length; j++) {
			var o = pregnancyStandardData[j];
			tenth[j] = [
				o.WEEK, o.TENTH
			];
			fiveth[j] = [
				o.WEEK, o.FIVETH
			];
			nineth[j] = [
				o.WEEK, o.NINETH
			];
		}

		for (var i = 0; i < visitData.length; i++) {
			var bodyItem = visitData[i];
			dcids[bodyItem.CheckWeek] = bodyItem.DCID;
			HeightFundusUterus[i] = [bodyItem.CheckWeek, bodyItem.HeightFundusUterus];
		}

		$.get("../partials/popUp/popModal.html", {}, function(data, textStatus, xhr) {
			var html = $.parseHTML(data);
			$("#" + id).append(html);
			$('#myModal').attr('id', 'popUpModal-' + id);
		});

		var plot1 = $.jqplot('MHCChartView', [tenth, fiveth, nineth, HeightFundusUterus], {
			title: '妊娠图',
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
				labels: ["tenth", "fiveth", "nineth", "宫高"]
			}
		});
		$('#MHCChartView')
			.bind('jqplotDataClick', function(ev, seriesIndex, pointIndex, data) {
				if (seriesIndex != 3) {
					return;
				}
				onChartClick(data, id)
			});
		idContentFlag[id] = true
	});
	removeRunningMask();
}

var onChartClick = function(data, id) {
	var url = "pregnantVisit/getHtmlDocument";
	var cnd = {
		"dcId": dcids[data[0]]
	};

	$.getJsonData(url, cnd)
		.done(function(data) {
			var body = data.body;
			var htmlStr = data.body;
			html = $.parseHTML(htmlStr);
			$(".modal-body").empty()
			$(".modal-body").append(html);
			$('#popUpModal-' + id).modal();
		});
}