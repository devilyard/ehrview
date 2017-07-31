/**
 * @include "SimpleListView.js"
 */
$package("app.modules.chart")
$import("app.modules.chart.ChartView", "util.rmi.jsonRequest",
		"util.rmi.miniJsonRequestSync", "org.ext.ux.MonthPicker")

app.modules.chart.DiggerChartView = function(cfg) {
	this.data = [];
	this.digDeepCount = 0
	this.showCndsBar = true
	app.modules.chart.DiggerChartView.superclass.constructor.apply(this, [cfg])
}
Ext.extend(app.modules.chart.DiggerChartView, app.modules.chart.ChartView, {
	onWinShow : function() {
		app.modules.chart.DiggerChartView.superclass.onWinShow.call(this)
		this.initCnds()
	},
	initChartHTML : function() {
		var entryName = this.entryName
		if (entryName && !this.schema) {
			var ret = util.rmi.miniJsonRequestSync({
						serviceId : "reportSchemaLoader",
						schema : entryName
					})
					
			if (ret.code == 200) {
				this.schema = ret.json.body
				this.title = this.schema.title
			} else {
				if (ret.msg == "NotLogon") {
					this.fireEvent("NotLogon", this.loadJsonData, this);
				} else {
					alert(ret.msg)
				}
				return;
			}
		}
		
		this.chartType = this.diggerType || this.schema.chart.chartType
		this.template = this.maximum
				? this.schema.chart.template + "_b"
				: this.schema.chart.template;
		return app.modules.chart.DiggerChartView.superclass.initChartHTML
				.call(this)
	},
	initCnds : function() {
		var schema = this.schema
		if (!schema || !schema.args) {
			return
		}
		var args = schema.args
		if (!args || args.length == 0) {
			this.loadJsonData()
			return;
		}
		var queryParam = this.exQueryParam;

		var tbar = this.panel.getTopToolbar()

		for (var i = 0; i < args.length; i++) {
			var arg = args[i]
			var param = queryParam[arg.id]
			if (param) {
				if (arg.dic) {
					arg.defaultValue = {
						key : param,
						text : queryParam[arg.id + "_text"]
					};
				} else {
					arg.defaultValue = param
				}
			} else {
				if (arg.defaultValue) {
					queryParam[arg.id] = arg.defaultValue
				}
			}
			if (this.showCndsBar) {
				if (!arg.hidden) {
					tbar.add(arg.alias + ":")
					tbar.add(this.createField(arg))
				}
			}
		}
		if (this.showCndsBar) {
			tbar.add("-")
			tbar.add({
						text : "查询",
						iconCls : "query",
						handler : this.doQuery,
						scope : this
					})
			tbar.doLayout();
			if (this.cndHidden && !this.maximum)
				this.setCndVisible(false);
			this._init = true;
		}

		this.loadJsonData()
	},

	setCndVisible : function(visible) {
		var tbar = this.panel.getTopToolbar();
		if (!tbar)
			return;
		tbar.setVisible(visible);
	},

	resetQueryParams : function() {
		var tbar = this.panel.getTopToolbar()
		var queryParam = this.exQueryParam;
		if (!tbar) {
			return;
		}
		tbar.items.each(function(f) {
					if (!f.queryArg) {
						return;
					}
					var id = f.getName();
					var param = queryParam[id]
					var v = null
					if (param) {
						if (queryParam[id + "_text"]) {
							v = {
								key : param,
								text : queryParam[id + "_text"]
							};
						} else {
							v = param
						}
						f.setValue(v)
					}
				}, this)
	},
	createField : function(it) {
		var defaultWidth = 110
		var cfg = {
			queryArg : true,
			name : it.id,
			fieldLabel : it.alias,
			xtype : it.xtype || "textfield",
			width : defaultWidth,
			value : it.defaultValue,
			hidden : it.hidden || false
		}
		if (it.inputType) {
			cfg.inputType = it.inputType
		}
		if (it['not-null']) {
			cfg.allowBlank = false
			cfg.invalidText = "必填字段"
		}

		if (it.dic) {
			// cfg.width = it.width
			cfg.listWidth = defaultWidth
			it.dic.defaultValue = it.defaultValue
			it.dic.width = it.width || defaultWidth
			var combox = this.createDicField(it.dic)
			Ext.apply(combox, cfg)
			return combox;
		}
		if (it.length) {
			cfg.maxLength = it.length;
		}
		switch (it.type) {
			case 'int' :
			case 'double' :
			case 'bigDecimal' :
				cfg.xtype = "numberfield"
				if (it.type == 'int') {
					cfg.decimalPrecision = 0;
					cfg.allowDecimals = false
				} else {
					cfg.decimalPrecision = it.precision || 2;
				}
				if (it.minValue) {
					cfg.minValue = it.minValue;
				}
				if (it.maxValue) {
					cfg.maxValue = it.maxValue;
				}
				break;
			case 'date' :
				cfg.xtype = 'datefield'
				cfg.emptyText = "请选择日期"
				break;
			case 'text' :
				cfg.xtype = "htmleditor"
				cfg.enableSourceEdit = false
				cfg.enableLinks = false
				cfg.width = 300
				break;
			case 'month' :
				cfg.xtype = 'monthfield'
				cfg.emptyText = "请选择日期"
				break;
		}
		return cfg;
	},

	createDicField : function(dic) {
		var cls = "util.dictionary.";
		if (!dic.render) {
			cls += "Simple";
		} else {
			cls += dic.render
		}
		cls += "DicFactory"

		$import(cls)
		var factory = eval("(" + cls + ")")
		var field = factory.createDic(dic)
		return field
	},
	doQuery : function() {
		var tbar = this.panel.getTopToolbar()
		var fields = tbar.items

		var count = fields.getCount()
		for (var i = 0; i < count; i++) {
			var f = fields.item(i)
			if (f.queryArg) {
				if (!f.validate()) {
					return;
				}
				var v = f.getValue()
				if (v == null || v.length == 0) {
					continue;
				}
				if (f.getXType() == "datefield") {
					v = v.format("Y-m-d")
				}
				if (f.getXType() == "monthfield") {
					v = v.format("Y-m")
				}
				this.exQueryParam[f.getName()] = v
			}
		}
		this.reloadUrl()
	},
	reloadUrl : function() {
		var url = this.getUrl()
		try {
			this.chartUtil.setDataURL(url)
			this.loadJsonData()
		} catch (e) {
			this.refresh();
		}
	},

	refresh : function() {
		if (this.cndHidden && !this.maximum) {
			this.setCndVisible(false);
		} else {
			this.setCndVisible(true);
		}
		app.modules.chart.DiggerChartView.superclass.refresh.call(this)
		this.loadJsonData();
	},
	loadJsonData : function() {
		var req = {
			serviceId : this.listServiceId || "simpleReport",
			schema : this.entryName,
			pageSize : 500
		}
		if (this.exQueryParam) {
			for (var name in this.exQueryParam) {
				var v = this.exQueryParam[name]
				if (typeof v == "object") {
					v = v.key
				}
				req[name] = v;
			}
		}
		util.rmi.jsonRequest(req, function(code, msg, json) {
					if (code < 300) {
						if (json.totalCount > 0) {
							this.data = json.body
							this.schema = json.schema
						} else {
							this.data = [];
						}
					} else {
						if (msg == "NotLogon") {
							this.fireEvent("NotLogon", this.loadJsonData, this);
						} else {
							alert(msg)
						}
					}
				}, this)
	},
	onChartClick : function(index, fName, fValue) {
		var r = this.data[index]
		var schema = this.schema
		var target = schema.diggers[fName]
		if (!target) {
			return
		}
		var cfg = {
			entryName : target,
			exQueryParam : {},
			cndHidden : this.cndHidden,
			showCndsBar : this.showCndsBar,
			maximum : this.maximum,
			autoResize : this.autoResize,
			height : this.height
		}

		for (var nm in this.exQueryParam) {
			cfg.exQueryParam[nm] = this.exQueryParam[nm]
		}

		for (var i = 0; i < schema.items.length; i++) {
			var f = schema.items[i]
			if (f.func) {
				continue;
			}
			var id = f.id
			if (f.dic) {
				cfg.exQueryParam[id + "_text"] = r[id + "_text"]
			}
			cfg.exQueryParam[id] = r[id]
		}

		if (fValue && fName.indexOf(',')>-1) {
			var key = fName.split(",")[1]
			cfg.exQueryParam[key] = fValue
		}

		var digModule = this.midiModules[target]
		if (!digModule) {
			digModule = new app.modules.chart.DiggerChartView(cfg);
			digModule.opener = this;
			this.midiModules[target] = digModule;
			if (this.isCombined) {
				this.fireEvent("digDown", this, digModule);
			} else {
				digModule.getWin().show()
			}
		} else {
			for (var nm in cfg.exQueryParam) {
				digModule.exQueryParam[nm] = cfg.exQueryParam[nm]
			}
			digModule.resetQueryParams()
			digModule.refresh()
			if (this.isCombined) {
				this.fireEvent("digDown", this, digModule);
			} else {
				digModule.getWin().show()
			}

		}
	}
});