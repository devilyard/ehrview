/**
* @include "SimpleListView.js"
*/
$package("app.modules.chart")
$import(
	"app.desktop.Module",
	"app.modules.chart.DiggerChartView",
	"app.modules.list.ChartListView"
)
$styleSheet("util.Gis")
app.modules.chart.DiggerCardWraper = function(cfg){
	this.width = 620
	this.height = 400
	this.viewCount = 0
	this.currentView = null
	this.chartViews = {}
	this.listViews={}
	app.modules.chart.DiggerCardWraper.superclass.constructor.apply(this,[cfg])
}
Ext.extend(app.modules.chart.DiggerCardWraper,app.desktop.Module,{
	init:function(){
		if(this.entryName){
			var view =  new app.modules.chart.DiggerChartView({
				entryName:this.entryName,
				exQueryParam:this.exQueryParam,
				cndHidden:this.cndHidden
			});
			this.setRootChartView(view)
		}
	},
	setRootChartView:function(view){
		view.viewIndex = 0;
		view.isCombined = true
		view.on("digDown",this.onGoDown,this)
		this.chartViews[view.chartId] = view
		this.currentView = view
	},
	initPanel:function(){
		if(this.card){
			return this.card;
		}
		var card = new Ext.Panel({
	 	   //title: this.title,
	 	   layout:'card',
	 	   activeItem: 0,
	 	   defaults: {
	 	   		border:false			
	 	   },
	 	   items:this.currentView.initPanel(),
	 	   bbar:[
	 	    {text:"列表视图",iconCls:"list",handler:this.onChangeView,scope:this},
	 	   	{text:"后退",iconCls:"backward",handler:this.onGoUp,scope:this},
	 	   	{text:"刷新",iconCls:"refresh",handler:this.onGoRefresh,scope:this}
	 	   ]
		})
		this.card = card
		return card;
	},
	onGoRefresh:function(){
		this.currentView.refresh();	
	},
	
	onChangeView:function(t){
		if(t.iconCls=="list"){
			t.setIconClass("gis-subject-icon");
			t.setText("图表视图");
			
		var module = this.listViews[this.currentView.chartId]
		if(!module || this.currentView.schema.items.length != module.schema.items.length){
			var view =  new app.modules.list.ChartListView({
				showButtonOnPT:true,
				schema:this.currentView.schema,
				data : this.currentView.data,
				title:this.title.substr(0,this.title.indexOf("(")),
				entryName:this.currentView.entryName
			});
			this.viewCount ++;
			view.viewIndex = this.viewCount;
			view.isCombined = true;
			this.card.add(view.initPanel())
			this.listViews[this.currentView.chartId] = view
			module = view
		}else{
			Ext.apply(module,{
				schema:this.currentView.schema,
				data : this.currentView.data,
				title:this.title.substr(0,this.title.indexOf("(")),
				entryName:this.currentView.entryName
			});
			module.refresh();
		}
		this.lastView=this.currentView
		this.currentView = module
		this.card.getLayout().setActiveItem(module.viewIndex)
		}else{
			t.setIconClass("list");
			t.setText("列表视图");
			this.lastView.data=this.currentView.data;
			this.lastView.refresh();
			this.card.getLayout().setActiveItem(this.lastView.viewIndex)
			this.currentView=this.lastView;
		}
	},
	
	onGoDown:function(toper,digger){
		var chartId = digger.chartId
		var module = this.chartViews[chartId]
		if(!module){
			this.viewCount ++;
			digger.viewIndex = this.viewCount;
			digger.isCombined = true;
			digger.on("digDown",this.onGoDown,this)
			this.card.add(digger.initPanel())
			this.chartViews[chartId] = digger
			module = digger
		}
		this.currentView = module
		this.card.getLayout().setActiveItem(module.viewIndex)
	},
	onGoUp:function(){
		var current = this.currentView
		if(!current.opener || !current.opener.chartId){
			return
		}
		var toper = current.opener
		toper.refresh()
		this.card.getLayout().setActiveItem(toper.viewIndex)
		this.currentView = toper
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
		    var renderToEl = this.getRenderToEl()
            if(renderToEl){
            	win.render(renderToEl)
            }
            this.win = win
		}
		return win
	}	
	
});