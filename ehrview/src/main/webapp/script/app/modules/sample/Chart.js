$package("app.modules.sample")
$import("app.modules.chart.ChartView")

app.modules.sample.Chart = function(cfg){
	this.width = 300
	this.height = 600
	this.showButtonOnTop = true
	app.modules.sample.Chart.superclass.constructor.apply(this,[cfg])
}

Ext.extend(app.modules.sample.Chart, app.modules.chart.ChartView,{
	initChartHtml:function(){
		var html = app.modules.sample.Chart.superclass.initChartHtml.call(this)
		this.chartUtil.on("click",this.onChartClick,this)
		return html
	},
	onChartClick:function(index){
		var digChart = this.midiModules["digChart"]
		var chartType = ['MSColumn3D','MSColumn2D','MSColumn2D','MSColumn2D','Pie3D']
		
		if(index == 5){
			this.showList()
			return;
		}		
		if(!digChart){
			var cfg = {}
			cfg.chartId = "chart-A10" + index
			cfg.dataUrl = "desktop/data/chartData" + index + ".xml"
			cfg.chartType = chartType[index]
			digChart = new app.modules.sample.Chart(cfg)
			digChart.opener = this
			this.midiModules["digChart"] = digChart
			var win = digChart.getWin()
			win.setPosition(index * 100,index * 50)
			win.show()
		}
		else{
			digChart.getWin().show()
		}
	},
	showList:function(){
		var list = this.midiModules["list"]
		if(!list){
			$require("app.modules.list.SimpleListView",function(){
				var cfg = {}
				cfg.title = "张家港市2008年7月份结报明细记录"
				cfg.entryName = "JB";
				cfg.listServiceId = "randJsonData";
				list =new app.modules.list.SimpleListView(cfg)
				list.getWin().show()
			},this)
		}
		else{
			list.getWin().show()
		}
	},
	destory: function(){
		this.chartUtil.un("click",this.onChartClick,this)
		app.modules.chart.ChartView.superclass.destory.call(this)
	}		
})