/**
 * @include "ReportCard.js"
 */

$package("app.biz.composite")

$import("app.desktop.Module", "util.dictionary.TreeCheckDicFactory",
		"util.dictionary.DictionaryLoader", "app.biz.composite.ReportListView",
		"app.modules.gis.MapView")

$styleSheet("util.Gis")

app.biz.composite.CompositeReportView = function(cfg) {
	this.width = 620;
	this.westWidth = 200;
	this.northHeight = 30;
	this.currentIndex = 0;
	this.maxCount = 10;
	this.cnd = [];
	this.serviceId = cfg.serviceId || "compositeReportService";
	this.locateServiceId = cfg.locateServiceId || "locateService";
	this.queryFiled = cfg.queryField || "KPICode";
	this.entryName = cfg.entryName || "Composite";
	this.exQueryParam = {
		schema : this.entryName,
		serviceId : this.serviceId
	};
	this.addEvents({
		"loaded" : true
	});
	app.biz.composite.CompositeReportView.superclass.constructor.apply(this,
			[cfg])
}

Ext.extend(app.biz.composite.CompositeReportView, app.desktop.Module, {
	initPanel : function() {
		if (this.panel) {
			return this.panel
		}
		this.exQueryParam["navDic"] = this.navDic;
		var tr = util.dictionary.TreeCheckDicFactory.createDic({
			id : this.navDic,
			checkModel : "childCascade",
			tbar : ['搜索 : ', {
				xtype : 'textfield',
				enableKeyEvents : true,
				tree : this,
				emptyText : '输入关键字后按回车键搜索',
				listeners : {
					specialkey : this.doFilter
				}
			}]
		})
		Ext.apply(tr.tree, {
			region : 'center',
			autoScroll : true
		});
		tr.tree.on('contextmenu', this.onContextMenu, this);

		var list = new Ext.tree.TreePanel({
			region : 'north',
			autoScroll : true,
			onlyLeafCheckable : false,
			animate : true,
			rootVisible : false,
			height : 160,
			hlColor : "red",
			frame : false,
			selModel : new Ext.tree.MultiSelectionModel(),
			border : false,
			// bodyStyle:'border:1px #99BBE8 solid;padding:4 4 4 0',
			split : false,
			root : new Ext.tree.TreeNode({
				text : 'root'
			}),
			bbar : [new Ext.SplitButton({
				text : '移除列表',
				iconCls : "gis-remove-icon",
				listeners : {
					click : {
						fn : this.removeAll,
						scope : this
					}
				},
				menu : new Ext.menu.Menu({
					id : 'mainMenu',
					items : [{
						text : '移除选中',
						listeners : {
							click : {
								fn : this.removeSelect,
								scope : this
							}
						}
					}, {
						text : '移除所有',
						listeners : {
							click : {
								fn : this.removeAll,
								scope : this
							}
						}
					}]
				})
			})],
			containerScroll : true
		});
		this.list = list;
		var items = [];
		items.push({
			layout : "border",
			split : true,
			collapsible : true,
			title : '专题栏',
			region : 'west',
			width : this.westWidth,
			items : [list, tr.tree]
		});
		var tabpanel = this.createTabPanel();
		items.push(tabpanel);
		var cfg = {
			layout : 'border',
			width : this.width,
			height : this.height,
			border : false,
			frame : false,
			items : items
		}

		// cfg.buttons = this.createButtons()
		var panel = new Ext.Panel(cfg)
		tr.tree.on("click", this.onTreeItemClick, this)
		tr.tree.on("check", this.onTreeItemChecked, this)
		this.initCnds()
		this.panel = panel
		this.tree = tr.tree
		return panel
	},

	expandAll : function() {
		this.tree.root.expandChildNodes();
	},

	collapseAll : function() {
		this.tree.collapseAll();
	},

	onContextMenu : function(node, e) {
		if (!this.menu) { // create context menu on first right click
			this.menu = new Ext.menu.Menu([{
				text : '展开全部',
				iconCls : 'expandall',
				handler : this.expandAll,
				scope : this
			}, {
				text : '收缩全部',
				iconCls : 'app',
				handler : this.collapseAll,
				scope : this
			}]);
		}
		this.menu.showAt(e.getXY());
	},

	initCnds : function() {
		var ret = util.rmi.miniJsonRequestSync({
			serviceId : "reportSchemaLoader",
			schema : this.entryName
		})
		if (ret.code == 200) {
			var schema = ret.json.body
			if (!schema || !schema.args) {
				return
			}
			var args = schema.args
			var queryParam = this.exQueryParam;

			var tbar = this.mainTab.getTopToolbar()

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
				if (!arg.hidden) {
					tbar.add(arg.alias + ":")
					tbar.add(this.createField(arg))
				}
			}
			tbar.add("-")
			tbar.add({
				text : "查询",
				iconCls : "query",
				handler : this.doQuery,
				scope : this
			})
			tbar.doLayout();
		} else {
			if (ret.msg == "NotLogon") {
				this.fireEvent("NotLogon");
			} else {
				alert(ret.msg)
			}
			return;
		}
	},

	createTabPanel : function() {
		if (this.mainTab) {
			return this.mainTab;
		}

		var tabitem = [{
			viewType : "list",
			layout : "fit",
			title : "列表视图",
			exCfg : {
				script : "app.biz.composite.ReportListView",
				showButtonOnPT : true
			}
		}, {
			viewType : "chart",
			layout : "fit",
			title : "统计图",
			exCfg : {
				script : "app.biz.composite.ReportChartView",
				entryName : this.entryName,
				cndHidden : true
			}
		}, {
			viewType : "gis",
			layout : "fit",
			title : "电子地图",
			exCfg : {
				script : "app.biz.composite.ReportMapView",
				serviceId : this.serviceId
			}
		}]

		// var combox = this.createDicField({
		// id : "statisticalReportType",
		// render : "Tree",
		// defaultValue : {
		// text : '按管理单元',
		// key : 'manageUnit'
		// }
		// });
		//
		// combox.on("change", this.onReportTypeChange, this);
		//
		// Ext.apply(combox, {
		// width : 150,
		// queryArg : true
		// });

		var tabpanel = new Ext.TabPanel({
			tbar : [], // '选择视图:', this.createIconCombo(), ' '
			border : true,
			region : 'center',
			activeTab : 0,
			enableTabScroll : true,
			animScroll : true,
			tabPosition : 'bottom',
			items : tabitem,
			defaults : {
				border : false,
				style : {
					position : !Ext.isIE ? 'absolute' : 'absolute'
				},
				hideMode : !Ext.isIE ? 'visibility' : 'visibility'
			}
		});
		tabpanel.on("tabchange", this.onTabChange, this);
		this.mainTab = tabpanel
		return tabpanel;
	},

	onTabChange : function(tabPanel, newTab, curTab) {
		var viewType = newTab.viewType
		if (newTab._inited) {
			var m = this.midiModules[viewType]
			if(viewType=="chart"){
				Ext.apply(m, {
				data : this.data,
				entryName : this.entryName,
				exQueryParam : this.exQueryParam
				})
			}else{
				Ext.apply(m, {
				codeList:this.codeList,
				schema : this.schema,
				data : this.data,
				entryName : this.entryName,
				exQueryParam : this.exQueryParam
				})
			}
			if (m && m.refresh) {
				if (m.reload && Ext.isIE) {
					m.reload();
				} else {
					m.refresh()
				}
			}
			return;
		}
		var exCfg = newTab.exCfg
		var cfg = {
			showButtonOnTop : false,
			showCndsBar : false,
			autoLoadSchema : false,
			isCombined : true,
			data : this.data || [],
			schema : this.schema || [],
			exQueryParam : this.exQueryParam,
			codeList : this.codeList
		}
		Ext.apply(cfg, exCfg);
		
		var ref = exCfg.ref
		if (ref) {
			var result = util.rmi.miniJsonRequestSync({
				serviceId : "moduleConfigLocator",
				id : ref
			})
			if (result.code == 200) {
				Ext.apply(cfg, result.json.body)
			}
		}
		var cls = cfg.script
		if (!cls) {
			return;
		}

		this.panel.el.mask("加载中...", "x-mask-loading");
		$require(cls, [function() {
			var m = eval("new " + cls + "(cfg)")
			m.setMainApp(this.mainApp)
			m.on("digger", this.onModuleDigger, this);
			m.on("loaded", this.onModuleLoad, this)
			// m.mainTab=this.mainTab;
			this.midiModules[viewType] = m;
			var p = m.initPanel();
			newTab.add(p);
			newTab._inited = true
			this.mainTab.doLayout()
			this.panel.el.unmask();
		}, this])
	},

	onModuleLoad : function(m) {
		m.refresh();
	},

	onModuleDigger : function(ds, ex) {
		var tbar = this.mainTab.getTopToolbar()
		var queryParam = ex;
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

		var viewType = this.mainTab.getActiveTab().viewType;
		if (viewType == "list") {
			this.exQueryParam[this.pkey] = ex[this.pkey];
			this.loadJsonData();
			Ext.apply(this.midiModules[viewType], {
				data : this.data,
				schema : this.schema,
				exQueryParam : this.exQueryParam
			})
			this.midiModules[viewType].refresh();
		} else if (viewType == "chart") {
			this.data = ds || [];
			this.loadCodeList(queryParam[this.pkey])
		}
	},
	
	loadCodeList:function(id){
		var requestData = {
			serviceId : this.locateServiceId,
			op : "getCodeList"
		}
		requestData[this.pkey]=id;
		var ret = util.rmi.miniJsonRequestSync(requestData);
		if (ret.code == 200) {
			this.exQueryParam.mapSign = ret.json.mapSign;
			this.codeList = ret.json.codeList;
		}
	},

	createCnd : function(selectedItems) {
		var cnd = ['or'];
		var cols = [];
		if (this.selectedItems.length == 1) {
			cnd = ['eq', ['$', this.queryFiled],
					['s', this.selectedItems[0].id]];
			cols.push(this.selectedItems[0].id);
		} else {
			for (var i = 0; i < this.selectedItems.length; i++) {
				cnd.push(['eq', ['$', this.queryFiled],
						['s', this.selectedItems[i].id]]);
				cols.push(this.selectedItems[i].id);
			}
		}
		this.exQueryParam["columns"] = cols;
		this.exQueryParam["cnd"] = cnd;
	},

	createSchema : function(sc) {
		var schemaItems = sc.items || [];
		var renderIndex = 0;
		if (schemaItems.length > 0)
			renderIndex = schemaItems[schemaItems.length - 1].renderIndex;
		for (var i = 0; i < this.selectedItems.length; i++) {
			var item = {
				id : this.selectedItems[i].id,
				alias : this.selectedItems[i].text,
				type : this.selectedItems[i].type || "double",
				func : "sum",
				renderer : this.selectedItems[i].renderer,
				renderIndex : ++renderIndex
			};
			if (!item.renderer) {
				if (id.indexOf("_") > -1
						&& id.split("_")[0].indexOf("PER") > -1) {
					item.renderer = "percentRender";
				}
			}
			schemaItems.push(item);
		}
		sc.items = schemaItems;
		this.schema = sc;
	},

	loadJsonData : function() {
		var requestData = {}
		for (var k in this.exQueryParam) {
			requestData[k] = this.exQueryParam[k];
		}
		var ret = util.rmi.miniJsonRequestSync(requestData)
		if (ret.code == 200) {
			this.data = ret.json.body
			this.createSchema(ret.json.schema)
			this.codeList = ret.json.codeList
			this.exQueryParam["mapSign"] = ret.json.mapSign
			if(this.schema.items.length>0){
				this.pkey=this.schema.items[0].id;
			}
		} else {
			if (ret.msg == "NotLogon" && this.mainApp) {
				this.fireEvent("NotLogon", this.loadJsonData, this);
			} else {
				alert(ret.msg)
			}
			return;
		}
	},

	doQuery : function() {
		this.selectedItems = this.list.getRootNode().childNodes;
		if (this.selectedItems.length == 0) {
			Ext.Msg.alert("提示", "请先选择专题");
			return;
		}

		this.createCnd();
		var tbar = this.mainTab.getTopToolbar()
		var fields = tbar.items
		var tdate;
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

				if (f.getXType() == "treeField") {
					this.exQueryParam[f.getName() + "_text"] = f.text;
				}

				if (f.getXType() == "datefield" || f.getXType() == "monthfield") {
					v = v.format("Y-m")
					if (!tdate)
						tdate = v;
					else {
						if (tdate > v) {
							alert("起始日期不能大于截止日期");
							return;
						}
					}
				}

				this.exQueryParam[f.getName()] = v
			}
		}

		var viewType = this.mainTab.getActiveTab().viewType;
		this.loadJsonData();
		Ext.apply(this.midiModules[viewType], {
			data : this.data,
			schema : this.schema,
			codeList : this.codeList,
			exQueryParam : this.exQueryParam
		})

//		if (this.midiModules[viewType].restoreView){
//			this.midiModules[viewType].restoreView()
//		}
		this.midiModules[viewType].refresh();
	},

	doFilter : function(field, e) {
		if (field.getValue().length == 0) {
			this.tree.tree.root.cascade(function(n) {
				n.ui.show();
			});
			return;
		}
		if (e.getKey() != Ext.EventObject.ENTER)
			return;
		this.tree.tree.root.expandChildNodes();
		this.tree.tree.root.cascade(function(n) {
			n.ui.show();
		});
		this.tree.tree.root.cascade(function(n) {
			if (n.text.length < field.getValue().length)
				return;
			var fl = true;
			for (var i = 0; i < n.text.length - field.getValue().length + 1; i++) {
				if (n.text.substr(i, field.getValue().length) == field
						.getValue()) {
					fl = false;
					break;
				}
			}
			if (fl && (n.id.indexOf("_") > -1 && n.id.split("_").length == 2)) {
				n.ui.hide();
			}
		});
	},

	expandAll : function() {
		this.tree.root.expandChildNodes();
	},

	collapseAll : function() {
		this.tree.collapseAll();
	},

	createField : function(it) {
		var defaultWidth = 100
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
			cfg.listWidth = it.width || defaultWidth
			cfg.width = it.width || defaultWidth
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
				cfg.width = 150
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

	onTreeItemClick : function(node, e) {
		// if (node.leaf) {
		// this.doHighLight(node);
		// }
	},

	onTreeItemChecked : function(node, checked) {
		if (node.leaf) {
			if (checked) {
				if (this.list.getRootNode().childNodes.length > this.maxCount) {
					if (!node.parentNode.getUI().isChecked()) {
						alert("最多只能同时选中" + this.maxCount + "个指标查询");
						this.errored = true;
					}
					node.getUI().toggleCheck(false);
					return;
				}

				if (!node.hidden) {
					this.addChild(node);
				}
				if (this.isAllChecked(node)) {
					node.parentNode.getUI().check(true);
				}
			} else {
				if (!this.hasChildChecked(node)) {
					node.parentNode.getUI().check(false);
				}
				this.removeChild(node);
			}
		} else {
			if (checked) {
				this.currentNode = node.id;
				for (var i = 0; i < this.tree.getRootNode().childNodes.length; i++) {
					var n = this.tree.getRootNode().childNodes[i];
					if (n.id != node.id) {
						n.getUI().toggleCheck(false);
					}
				}
			}
		}
	},

	hasChildChecked : function(node) {
		var check = false;
		if (!node.parentNode)
			return;
		for (var i = 0; i < node.parentNode.childNodes.length; i++) {
			if (node.parentNode.childNodes[i].getUI().isChecked()) {
				check = true;
				break;
			}
		}
		return check;
	},

	isAllChecked : function(node) {
		var check = true;
		if (!node.parentNode)
			return;
		for (var i = 0; i < node.parentNode.childNodes.length; i++) {
			if (!node.parentNode.childNodes[i].getUI().isChecked()) {
				check = false;
				break;
			}
		}
		return check;
	},

	removeAll : function() {
		var node = this.list.getRootNode();
		while (node.hasChildNodes()) {
			var n = this.tree.getNodeById(node.firstChild.id);
			if (n) {
				n.getUI().toggleCheck(false);
			}
		}
	},

	removeSelect : function() {
		var sel = this.list.getSelectionModel().getSelectedNodes();
		if (sel.length == 0) {
			Ext.Msg.alert("提示", "请先选择专题");
			return;
		}
		var ids = [];
		for (var i = 0; i < sel.length; i++) {
			ids.push(sel[i].id);
		}
		for (var j = 0; j < ids.length; j++) {
			var node = this.tree.getNodeById(ids[j]);
			if (node) {
				node.getUI().toggleCheck(false);
			}
		}
	},

	addChild : function(child) {
		var c = this.list.getNodeById(child.id);
		if (c)
			return;
		var n = new Ext.tree.TreeNode({
			text : child.text,
			id : child.id
		});
		// n.attributes["mid"] = child.attributes["mid"];
		// n.attributes["kpicode"] = child.attributes["kpicode"];
		// if (this.list.getRootNode().childNodes.length > 5) {
		// var node = this.list.getRootNode().firstChild;
		// this.tree.getNodeById(node.id).getUI().toggleCheck(false);
		// }
		this.list.getRootNode().appendChild(n);
	},

	removeChild : function(child) {
		var n = this.list.getNodeById(child.id);
		if (n) {
			this.list.getRootNode().removeChild(n);
		};
	},

	getTitle : function() {
		var child = this.list.getRootNode().childNodes;
		var title = (child.length == 1 ? child[0].text : child[0].text + "-"
				+ child[child.length - 1].text);
		title += "(" + this.mainTab.getTopToolbar().items.item(1).getRawValue()
				+ ")";
		return title;
	},

	initCnd : function(param, isRefresh) {
		var list = param.module || this.midiModules[param.moduleId];
		var cnd = this.getCnd(param);
		var queryCnd = list.queryCnd
		if (queryCnd) {
			cnd = ['and', cnd]
			cnd.push(queryCnd)
		}

		list.requestData.cnd = cnd;
		list.requestData.pageNo = 1
		if (isRefresh)
			list.refresh()
	},

	getCnd : function(param) {
		var initCnd = ["eq", ["$", "a.status"], ["s", "0"]]
		// var cnd = ['like', ['$', this.listField], ['s', param.regionCode +
		// '%']]
		var cnd = [
				'eq',
				['substring', ['$', this.listField], ['s', '0'],
						['s', param.regionCode.length]],
				['s', param.regionCode]]
		if (this.queryField) {
			cnd = ['and', cnd]
			cnd.push(['eq', ['$', this.queryField], ['s', param.value]]);
		}
		cnd = ['and', cnd]
		cnd.push(initCnd)
		return cnd;
	},

	createButtons : function() {
		var actions = this.actions
		var buttons = []
		if (!actions) {
			return buttons
		}
		for (var i = 0; i < actions.length; i++) {
			var action = actions[i];
			var btn = {
				text : action.name,
				ref : action.ref,
				cmd : action.delegate || action.id,
				iconCls : action.iconCls || action.id,
				enableToggle : (action.toggle == "true"),
				script : action.script,
				handler : this.doAction,
				scope : this
			}
			buttons.push(btn)
		}
		return buttons
	},

	doAction : function(item, e) {
		var cmd = item.cmd
		var script = item.script
		cmd = cmd.charAt(0).toUpperCase() + cmd.substr(1)
		if (script) {
			$require(script, [function() {
				eval(script + '.do' + cmd + '.apply(this,[item,e])')
			}, this])
		} else {
			var action = this["do" + cmd]
			if (action) {
				action.apply(this, [item, e])
			}
		}
	},

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