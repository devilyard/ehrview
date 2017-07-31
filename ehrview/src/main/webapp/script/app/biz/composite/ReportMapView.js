$package("app.biz.gis")

$import("app.modules.gis.MapView", "util.gis.Map")

$styleSheet("util.Gis")

app.biz.composite.ReportMapView = function(cfg) {
	var defcfg = {
		mapid : 'index-' + Ext.id(),
		width : 620,
		westWidth : 200,
		northHeight : 30,
		navDic : 'gissubject',
		listField : "regionCode",
		pkey:"manaUnitId",
		intergrated : false
	}
	Ext.apply(this, defcfg)
	app.biz.composite.ReportMapView.superclass.constructor.apply(this, [cfg])
}

Ext.extend(app.biz.composite.ReportMapView, app.modules.gis.MapView, {
	// override
	initPanel : function() {
		if (this.panel) {
			return this.panel
		}
		var cfg = {
			layout : 'border',
			width : this.width,
			height : this.height,
			border : false,
			frame : false,
			items : {
					id : "mapContainer",
					layout : "fit",
					frame : false,
					split : true,
					border:false,
					title : '',
					region : 'center',
					html : this.initMap()
				}
		}

		//cfg.buttons = this.createButtons()
		var panel = new Ext.Panel(cfg)
		panel.on("render", this.onMapLoad, this)
		this.panel = panel
		return panel
	},
	
	// override
	refresh : function() {
		this.doQuery({
			serviceId:this.serviceId,
			operationId : "LogicIntegrated",
			body:this.data,
			pkey:this.pkey,
			current:this.exQueryParam["columns"][0],
			exQueryParam:this.exQueryParam,
			mapSign:this.exQueryParam.mapSign,
			codeList:this.codeList || {},
			schema:this.schema
		});
	},

	// override
	doHighLight : function(sel, subjects, dics, mapSign,regionCode,date) {
		var param={};
		var m = mapSign;
		if (m.indexOf(",") == -1)
			m = this.mainApp.mapSign;
		Ext.apply(param, {
					operationId : "LogicIntegrated",
					username : this.mainApp.uid,
					mapSign : m,
					serviceId:"integratedService",
					current:sel.id,
					subjects:subjects,
					date:date,
					regionCode:regionCode
				});
			this.getObject().query(param);
	},
	
	//override
	onMapRender : function() {
		this.fireEvent("loaded",this);
	},

	// override
	onMapClick : function() {
		if (!Array.prototype.slice.call(arguments, 1))
			return;
		var m = arguments[0];
		m.moduleId = this.mid;
		this.openWin(m);
	},

	// override
	getWin : function() {
		var win = this.win
		if (!win) {
			var cfg = {
				id : this.id,
				title : this.title,
				width : this.width,
				height : this.height,
				iconCls : 'bogus',
				shim : true,
				layout : "fit",
				items : this.initPanel(),
				animCollapse : true,
				constrainHeader : true,
				minimizable : true,
				maximizable : true,
				shadow : false
			}
			if (!this.mainApp) {
				cfg.closeAction = 'hide'
			}
			win = new Ext.Window(cfg)
			win.on("resize", this.onWinResize, this)
			win.on("show", function() {
						jsReady = true;
					});
			// win.on("show",this.initMap,this)
			var renderToEl = this.getRenderToEl()
			if (renderToEl) {
				win.render(renderToEl)
			}
			this.win = win
		}
		return win
	},
	onWinResize : function() {
		
	}

})
