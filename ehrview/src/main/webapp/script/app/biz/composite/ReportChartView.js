/**
 * @include "SimpleListView.js"
 */
$package("app.biz.composite")
$import("util.rmi.jsonRequest",
		"app.modules.chart.DiggerChartView",
		"util.rmi.miniJsonRequestSync", "org.ext.ux.MonthPicker",
		"util.widgets.IconCombo")

app.biz.composite.ReportChartView = function(cfg) {
	this.data = cfg.data || [];
	this.digDeepCount = 0
	app.biz.composite.ReportChartView.superclass.constructor.apply(this, [cfg])
}
Ext.extend(app.biz.composite.ReportChartView , app.modules.chart.DiggerChartView, {
	onWinShow : function() {
		//app.biz.composite.ReportChartView.superclass.onWinShow.call(this)
		//this.initCnds()
		this.loadJsonData();
	},
	
	initPanel:function(){
		if(this.panel){
			return this.panel
		}
		var cfg = {
			layout:"fit",
			width : this.width,
			height : this.height,
			border:false,
			html:this.initChartHTML(),
			bbar:[
	 	   	'选择统计图类型:', this.createIconCombo(), 
	 	   	//{text:"后退",iconCls:"backward",handler:this.onGoUp,scope:this},
	 	   	{text:"刷新",iconCls:"refresh",handler:this.onGoRefresh,scope:this}
	 	   ]
		}
		var panel = new Ext.Panel(cfg)
		if(this.isCombined){
			panel.on("render",this.onWinShow,this)
		}
		this.panel = panel
		return panel;
	},
	
	initChartHTML : function() {
		if(!this.schema || !this.schema.chart)return;
		//this.chartType = this.newType || this.schema.chart.chartType
		return app.biz.composite.ReportChartView.superclass.initChartHTML
				.call(this)
	},
	
	onGoDown:function(toper,digger){
		this.refresh();
		this.fireEvent("digger", this.data, this.exQueryParam);
	},
	
	onGoUp:function(){
		if(this.lastDigger){
			Ext.apply(this,this.lastDigger)
		}
		this.refresh();
		this.fireEvent("digger", this.data, this.exQueryParam);
	},
	
	onGoRefresh:function(){
		this.refresh();
		this.fireEvent("digger", this.data, this.exQueryParam);
	},
	
	onViewChange : function(combo, r, index) {
		this.diggerType=r.data.icon;
		this.onGoRefresh();
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

	setCndVisible : function(visible) {
		var tbar = this.panel.getTopToolbar();
		if (!tbar)
			return;
		tbar.setVisible(visible);
	},
	
	refresh : function() {
		app.modules.chart.DiggerChartView.superclass.refresh.call(this)
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
	
	getQueryParams:function(){
		var q = []
		this.exQueryParam["chartId"] = this.chartId
		this.exQueryParam["template"]= this.template   //added by zhouz
		for(var name in this.exQueryParam){
			var v = this.exQueryParam[name]
			if(typeof(v)=="object"){
				v=Ext.encode(v).replace("[","%5B").replace("]","%5D").replace("+","%2B");
			}
			q.push(name +";"+ encodeURIComponent(v))
		}
		return q.join("@")
	},
	
	onChartClick : function(index, fName, fValue) {
		var r = this.data[index]
		var schema = this.schema
		var target = schema.diggers[fName]
		if (!target) {
			return
		}
		this.lastDigger={
			exQueryParam:{},
			entryName:this.entryName
		}
		this.entryName=target;
		for(var k in this.exQueryParam){
			this.lastDigger.exQueryParam[k]=this.exQueryParam[k];
			if(r[k]){
				this.exQueryParam[k]=r[k];
			}
		}
		this.refresh();
		this.loadJsonData();
		this.fireEvent("digger", this.data, this.exQueryParam);
	},
	
	loadJsonData : function() {
		var req = {
			serviceId : this.listServiceId || "simpleReport",
			schema : this.entryName,
			pageSize : 500
		}
		if (this.exQueryParam) {
			for (var name in this.exQueryParam) {
				req[name] = this.exQueryParam[name];
			}
		}
		
		var ret = util.rmi.miniJsonRequestSync(req)
		if (ret.code == 200) {
			this.data = ret.json.body
		} else {
			if (ret.msg == "NotLogon" && this.mainApp) {
				this.fireEvent("NotLogon", this.loadJsonData, this);
			} else {
				alert(ret.msg)
			}
			this.data=[]
		}
//		
//		util.rmi.jsonRequest(req, function(code, msg, json) {
//					if (code < 300) {
//						if (json.totalCount > 0) {
//							this.data = json.body
//						} else {
//							this.data = [];
//						}
//					} else {
//						if (msg == "NotLogon") {
//							this.fireEvent("NotLogon", this.loadJsonData, this);
//						} else {
//							alert(msg)
//						}
//					}
//				}, this)
	}
});