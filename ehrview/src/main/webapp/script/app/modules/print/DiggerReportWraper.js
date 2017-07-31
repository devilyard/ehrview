/**
* @include "SimpleListView.js"
*/
$package("app.modules.print")
$import(
	"app.desktop.Module",
	"app.modules.print.ReportPrintView"
)

app.modules.print.DiggerReportWraper = function(cfg){
	this.width = 620
	this.height = 400
	this.viewCount = 0
	this.currentView = null
	this.reportViews = {}
	app.modules.print.DiggerReportWraper.superclass.constructor.apply(this,[cfg])
}
Ext.extend(app.modules.print.DiggerReportWraper,app.desktop.Module,{
	init:function(){
		if(this.entryName){
			var view =  new app.modules.print.ReportPrintView({
				entryName:this.entryName,
				showPrtActionOnBottom:true
			});
			this.setRootChartView(view)
		}
	},
	onWinShow:function(){
		this.currentView.onWinShow()
		this.currentView.isCombined = true
	},
	setRootChartView:function(view){
		view.viewIndex = 0;
		//view.isCombined = true
		view.on("digDown",this.onGoDown,this)
		
		this.reportViews[view.entryName] = view
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
	 	   	{text:"后退",handler:this.onGoUp,scope:this}
	 	   ]
		})
		if(this.isCombined){
			card.on("show",this.onWinShow,this)
		}
		this.card = card
		return card;
	},
	onGoDown:function(toper,digger){
		var entryName = digger.entryName
		var module = this.reportViews[entryName]
		if(!module){
			this.viewCount ++;
			digger.viewIndex = this.viewCount;
			digger.isCombined = true;
			digger.on("digDown",this.onGoDown,this)
			this.card.add(digger.initPanel())
			this.reportViews[entryName] = digger
			module = digger
		}
		this.currentView = module
		this.card.getLayout().setActiveItem(module.viewIndex)
	},
	onGoUp:function(){
		var current = this.currentView
		if(!current.opener || !current.opener.entryName){
			return
		}
		var toper = current.opener
		
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
            win.on("show",this.onWinShow,this)
            this.win = win
		}
		return win
	}	
	
});