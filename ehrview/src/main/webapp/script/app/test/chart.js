$import("org.ext.ext-base",
		"org.ext.ext-all",
		"org.ext.ext-lang-zh_CN",
		"app.modules.chart.ChartView"
);
$styleSheet("ext.ext-all")
$styleSheet("ext.ext-patch")
$styleSheet("app.desktop.Desktop")

var inited = false
Ext.onReady(function(){
	if(inited){
		return;
	}
	inited = true
	Ext.lib.Ajax.defaultPostHeader += ';charset=utf-8'
	Ext.QuickTips.init();
	Ext.BLANK_IMAGE_URL = ClassLoader.appRootOffsetPath +"inc/resources/s.gif"
	$require("app.modules.chart.DiggerChartView",function(){
		var result = util.rmi.miniJsonRequestSync({
			serviceId:"logon",
			uid:"system",
			psw:"123"
		})
		var cfg = {}

		cfg.title = "高血压图表"
		cfg.chartType = "MSLine"
		cfg.width = "900"
		
		cfg.url = "../desktop/data/3.xml"
		cfg.showCndsBar = false
		
		var chart = new app.modules.chart.ChartView(cfg)

		var win = chart.getWin()
		win.show()
	

	})
})

/*
$import("util.chart.FusionCharts")

FC_Rendered = function(DOMId){
	var chart = getChartFromId("chart001")
	chart.setData(10)
}

window.onload = function(){
	var chart = new FusionCharts("gadgets.HLED", "chart001", "700", "350", "0", "1");
	
	chart.setDataURL("chartDrawing.xml?temp=" + new Date().getTime())
	chart.render("dvchart")
}*/
