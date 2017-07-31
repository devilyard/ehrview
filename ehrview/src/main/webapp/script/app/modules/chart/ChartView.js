$package("app.modules.chart")
$import(
	"app.desktop.Module" ,
	"util.rmi.loadXMLAsync",
	"util.chart.FusionCharts"
)

app.modules.chart.ChartView = function(cfg){
	this.chartType = 'Line'
	this.width = 620
	this.chartId = "chart-" + Ext.id()
	this.exQueryParam = cfg.exQueryParam || {};
	this.initData  = false
	this.addEvents({
			"digDown":true
	})
	this.autoResize = true
	app.modules.chart.ChartView.superclass.constructor.apply(this,[cfg])
}

Ext.extend(app.modules.chart.ChartView, app.desktop.Module,{
	initPanel:function(){
		if(this.panel){
			return this.panel
		}
		var cfg = {
			layout:"fit",
			width : this.width,
			height : this.height,
			border:false,
			html:this.initChartHTML()
		}
		if(this.showPrtActionOnBottom){
			if(this.showCndsBar){
				cfg.tbar = [];
			}
			cfg.bbar = this.createButtons()
		}
		else{
			if(this.showCndsBar){
				cfg.tbar = this.createButtons()
			}
		}
		var panel = new Ext.Panel(cfg)
		if(this.isCombined){
			panel.on("render",this.onWinShow,this)
		}
		this.panel = panel
		return panel;
	},
	initChartHTML:function(){
		if(this.chartUtil){
			this.chartUtil.un("render",this.onChartRender,this)
			this.chartUtil.un("click",this.onChartClick,this)	
		}
		var h = this.height - 10
		var exactFit = null
		if(this.autoResize){
			h = "100%"
			exactFit = "exactFit"
		}
		
		var chart = new FusionCharts(this.chartType, this.chartId, "100%", h, "0", "1","FFFFFF", exactFit);
		var url = this.getUrl()
		chart.setDataURL(url);
		chart.on("render",this.onChartRender,this)
		chart.on("click",this.onChartClick,this)	
		var html = chart.getSWFHTML()
		this.chartUtil = chart;
		return html
	},
	getUrl:function(){
		var entryname=arguments[0] || this.entryName;
		var href=this.href || "chart";
		var url = window.location.href
		var n = url.lastIndexOf("/")
		url = url.substring(0,n) + "/"
		url +=  entryname + "."+href+"?q=" + this.getQueryParams()
		return url;
	},
	getHttpUrl:function(){
		var domain=window.location.href.split("/")[2];
		var serverName=window.location.href.split("/")[3];
		return "http://"+domain+"/"+serverName+"/";
	},
	onWinResize:function(win,w,h){
		var chart = this.getObject()
		if(!chart){
			return;
		}
		if(h){
			chart.height = h - 20
		}
	},
	onWinShow:function(){

	},
	onChartRender:function(){
		
	},
	refresh:function(){
		this.panel.body.update(this.initChartHTML())
	},
	onChartClick:function(index,fName,fValue){
		
	},
	getQueryParams:function(){
		var q = []
		this.exQueryParam["chartId"] = this.chartId
		this.exQueryParam["template"]= this.template   //added by zhouz
		for(var name in this.exQueryParam){
			var v = this.exQueryParam[name]
			if(typeof v == "object"){
				v = v.key
			}
			q.push(name +";"+ encodeURIComponent(v))
		}
		return q.join("@")
	},
	getObject:function(){
		return util.chart.FusionChartsUtil.getChartObject(this.chartId)
	},
	createButtons:function(){
		var actions = this.actions
		var buttons = []
		if(!actions){
			return buttons
		}
		for(var i = 0; i < actions.length; i ++){
			var action = actions[i];
			var btn = {
				text : action.name,
				ref:action.ref,
				cmd : action.delegate || action.id,
				iconCls : action.iconCls || action.id,
				enableToggle : (action.toggle == "true"),
				script :  action.script,
				handler : this.doAction,
				scope : this
			}
			buttons.push(btn)
		}
		return buttons		
	},
	getWin:function(){
		var win = this.win
		if(!win){
			var cfg = {
				id: this.id,
		        title: this.title,
		        width: this.width,
		        height: this.height,
		        iconCls: 'bogus',
		        shim:true,
		        layout:"fit",
		        items:this.initPanel(),
		        animCollapse:true,
		        constrainHeader:true,
		        minimizable: true,
		        maximizable: true,
		        shadow:false
            }
            if(!this.mainApp){
            	cfg.closeAction = 'hide'
            }
			win = new Ext.Window(cfg)
			win.on("resize",this.onWinResize,this)
			win.on("show",this.onWinShow,this)
		    var renderToEl = this.getRenderToEl()
            if(renderToEl){
            	win.render(renderToEl)
            }
            this.win = win
		}
		return win
	}
})