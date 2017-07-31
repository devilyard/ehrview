/**
* @include "SimpleListView.js"
*/
$package("app.biz.composite")
$import(
	"app.desktop.Module",
	"app.modules.chart.DiggerCardWraper",
	"app.biz.composite.ReportChartView",
	"util.widgets.IconCombo"
)
$styleSheet("util.Gis")
app.biz.composite.ReportDiggerChart = function(cfg){
	this.width = 620
	this.height = 400
	this.viewCount = 0
	this.currentView = null
	this.rootView=null;
	this.chartViews = {}
	this.initCfg=cfg;
	app.biz.composite.ReportDiggerChart.superclass.constructor.apply(this,[cfg])
}
Ext.extend(app.biz.composite.ReportDiggerChart,app.modules.chart.DiggerCardWraper,{
	init:function(){
		if(this.entryName){
			var view =  new app.biz.composite.ReportChartView(this.initCfg);
			this.setRootChartView(view)
		}
	},
	setRootChartView:function(view){
		view.viewIndex = 0;
		view.isCombined = true
		view.on("digDown",this.onGoDown,this)
		this.rootView=view;
		this.chartViews[view.chartId] = view
		this.currentView = view
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
		this.fireEvent("digger", digger.data, digger.exQueryParam);
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
		this.fireEvent("digger", toper.data, toper.exQueryParam);
	},
	
	initPanel:function(){
		if(this.card){
			return this.card;
		}
		var card = new Ext.Panel({
	 	   //title: this.title,
			border:false,
	 	   layout:'card',
	 	   activeItem: 0,
	 	   defaults: {
	 	   		border:false			
	 	   },
	 	   items:this.currentView.initPanel(),
	 	   bbar:[
	 	   	'选择统计图类型:', this.createIconCombo(), 
	 	   	{text:"后退",iconCls:"backward",handler:this.onGoUp,scope:this},
	 	   	{text:"刷新",iconCls:"refresh",handler:this.onGoRefresh,scope:this}
	 	   ]
		})
		this.card = card
		return card;
	},
	
	createIconCombo : function() {
		var icnStore = new Ext.data.SimpleStore({
			fields : ['icon', 'text'],
			data : [['MSColumn3D', '柱形图'],['StackedColumn3D', '堆叠式柱形图']]
		});
		
		var icnCombo = new util.widgets.IconCombo({
			store : icnStore,
			valueField : 'icon',
			displayField : 'text',
			iconClsField : 'icon',
			triggerAction : 'all',
			hiddenName : "menu.iconCls",
			name : "menu.iconCls",
			editable : false,
			mode : 'local',
			id : 'iconCombo',
			listeners : {
				afterRender : function(combo) {
					combo.setValue("MSColumn3D");
				},
				select : {
					fn : this.onViewChange,
					scope : this
				}
			},

			width : 120
		});
		return icnCombo;
	},

	onViewChange : function(combo, r, index) {
		for(var m in this.chartViews){
			this.chartViews[m].diggerType=r.data.icon;
		}
		this.onGoRefresh();
	},
	
	onGoRefresh:function(){
		this.currentView.refresh();	
	},
	
	restoreView:function(){
		this.currentView=this.rootView;
		this.card.getLayout().setActiveItem(this.currentView.viewIndex)
	},
	
	refresh:function(){
		Ext.apply(this.currentView,{
			schema:this.schema,
			data:this.data,
			entryName:this.entryName
		})
		this.currentView.refresh();	
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