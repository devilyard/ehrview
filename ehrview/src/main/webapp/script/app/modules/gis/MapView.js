$package("app.modules.gis")

$import("app.desktop.Module", "util.gis.Map",
		"util.dictionary.TreeCheckDicFactory",
		"util.dictionary.DictionaryLoader")

$styleSheet("util.Gis")

app.modules.gis.MapView = function(cfg) {
	var defcfg = {
		mapid : 'index-' + Ext.id(),
		width : 620,
		westWidth : 200,
		northHeight : 30,
		navDic : 'gissubject',
		listField : "regionCode",
		intergrated : false
	}
	Ext.apply(this, defcfg)
	this.addEvents({
				"loaded" : true,
				"dispatchevent":true
			});
	app.modules.gis.MapView.superclass.constructor.apply(this, [cfg])
}

Ext.extend(app.modules.gis.MapView, app.desktop.Module, {
	initPanel : function() {
		if (this.panel) {
			return this.panel
		}
		var navDic = this.navDic
		var tr = util.dictionary.TreeCheckDicFactory.createDic({
					id : navDic,
					checkModel : "childCascade"
				})
		Ext.apply(tr.tree, {
					region : 'center'
				});

		if (!this.date) {
			this.date = new Ext.form.DateField({
						format : 'Y-m-d',
						width : 125
					});
		}

		var list = new Ext.tree.TreePanel({
			title : '专题栏',
			region : 'north',
			autoScroll : true,
			onlyLeafCheckable : false,
			animate : true,
			rootVisible : false,
			height : 250,
			hlColor : "red",
			frame : false,
			selModel : new Ext.tree.MultiSelectionModel(),
			border : false,
			// bodyStyle:'border:1px #99BBE8 solid;padding:4 4 4 0',
			collapsible : true,
			split : true,
			root : new Ext.tree.TreeNode({
						text : 'root'
					}),
			tbar : ['统计日期', ' ', this.date],
			bbar : [{
						xtype : 'button',
						text : '专题分析',
						iconCls : 'gis-subject-icon',
						listeners : {
							click : {
								fn : this.highLightAll,
								scope : this
							}
						}
					}, "-", new Ext.SplitButton({
								text : '移除列表',
								iconCls : "gis-remove-icon",
								listeners : {
									click : {
										fn : this.removeSelect,
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
		if (!this.isMapModule) {
			items.push({
						layout : "border",
						split : true,
						collapsible : true,
						title : '',
						region : 'west',
						width : this.westWidth,
						items : [list, tr.tree]
					});
		}
		items.push({
					id : "mapContainer",
					layout : "fit",
					frame : false,
					split : false,
					border:false,
					title : '',
					region : 'center',
					html : this.initMap()
				});
		var cfg = {
			layout : 'border',
			width : this.width,
			height : this.height,
			border : false,
			frame : false,
			items : items
		}
//		if(this.actions){
//			cfg.buttons = this.createButtons()
//		}
		var panel = new Ext.Panel(cfg)
		panel.on("render", this.onMapLoad, this)
		tr.tree.on("click", this.onTreeItemClick, this)
		tr.tree.on("check", this.onTreeItemChecked, this)
		this.panel = panel
		this.tree = tr.tree
		if (!this.isMapModule)
			this.tree.expandAll()
		return panel
	},

	onTreeItemClick : function(node, e) {
		if (node.leaf) {
			this.doHighLight(node);
		}
	},

	onTreeItemChecked : function(node, checked) {
		if (node.leaf) {
			if (checked) {
				this.addChild(node);
			} else {
				if (!this.hasChildChecked(node)) {
					node.parentNode.getUI().check(false);
				}
				this.removeChild(node);
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
			} else {
				check = false;
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
		n.attributes["mid"] = child.attributes["mid"];
		n.attributes["kpicode"] = child.attributes["kpicode"];
		if (this.list.getRootNode().childNodes.length > 5) {
			var node = this.list.getRootNode().firstChild;
			this.tree.getNodeById(node.id).getUI().toggleCheck(false);
		}
		this.list.getRootNode().appendChild(n);
	},

	removeChild : function(child) {
		var n = this.list.getNodeById(child.id);
		if (n) {
			this.list.getRootNode().removeChild(n);
		};
	},

	doHighLight : function(node, subjects, dics) {
		var name = node.id;
		var username = this.mainApp.uid
		if (!subjects) {
			subjects = {}
			subjects[name] = {
				mid : node.attributes["mid"],
				kpicode : node.attributes["kpicode"]
			}
		}
		if (!dics) {
			dics = {};
			dics[name] = node.text;
		}
		var obj = {
			username : username,
			current : name,
			subjects : subjects,
			alias : dics,
			date : this.date.value,
			operationId : "LogicThematic",
			mapSign : this.mainApp.mapSign
		}
		this.getObject().query(obj)
	},

	refresh : function() {
		if (this.isMapModule) {
			try {
				this.highLightSelect();
			} catch (e) {
				this.reload();
			}
			return;
		}
		this.reload();
	},

	reload : function() {
		if (!this.panel.findById("mapContainer"))
			this.panel.body.update(this.initMap());
		else
			this.panel.findById("mapContainer").body.update(this.initMap());

	},

	highLightAll : function() {
		var sel = this.list.getSelectionModel().getSelectedNodes();
		var child = this.list.getRootNode().childNodes;
		if (child.length == 0) {
			Ext.Msg.alert("提示", "请先选择专题");
			return;
		}
		var subjects = {};
		var dics = {};
		if (sel.length == 0) {
			sel = child[0];
		} else {
			sel = sel[0];
		}
		for (var i = 0; i < child.length; i++) {
			subjects[child[i].id] = {
				mid : child[i].attributes["mid"],
				kpicode : child[i].attributes["kpicode"]
			}
			dics[child[i].id] = child[i].text;
		}
		try {
			this.doHighLight(sel, subjects, dics);
		} catch (e) {
			this.refresh();
		}
	},

	doLocate : function(param) {
		var ret = util.rmi.miniJsonRequestSync({
					serviceId : "locateService",
					regionCode : param.data.regionCode.length>=16?param.data.regionCode.substring(0,16):param.data.regionCode
				})
		if (ret.code == 200) {
			if (!ret.json.body.mapSign) {
				alert("无法定位该用户");
			} else {
				var obj = {
					username : this.mainApp.uid,
					body : param,
					regionCode : param.data.regionCode,
					mapSign : ret.json.body.mapSign,
					operationId : "LogicLocate"
				}
				try{
					this.getObject().query(obj);
				}catch(e){
				 	this.reload();
				}
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

	highLightSelect : function() {
		if (!this.mapSign)
			return;
		var act = this.mainApp.desktop.mainTab.activeTab;
		var dic = util.dictionary.DictionaryLoader.load({
					id : this.navDic
				})
		var subjects = {};
		var node;
		var dics = {};

		for (var i = 0; i < dic.items.length; i++) {
			var it = dic.items[i]
			if (!it.mid)
				continue;
			if (it.mid.substring(0, 1) == act._mId.substring(0, 1)) {
				subjects[it.key] = {
					mid : it.mid,
					kpicode : it.kpicode
				}
				dics[it.key] = it.text;
				var mid = it.mid.substring(0, 3);
				if (act._mId == mid) {
					node = it;
				}
			}
		}

		if (!node)
			return;
		var obj = {
			username : this.mainApp.uid,
			current : node.key,
			subjects : subjects,
			alias : dics,
			schema : "GridGis_" + act._mId.substring(0, 1),
			regionCode : this.regionCode,
			mapSign : this.mapSign,
			operationId : "LogicGrid"
		}
		this.getObject().query(obj);
	},

	openWin : function(param) {
		var de = this.mainApp.desktop
		var id = param.moduleId
		if (!id)
			return;
		var find = this.midiModules[id]
		if (find) {
			find.getWin().show();
			this.initCnd(param, true);
			return;
		}
		de.mainTab.activateTab().el.mask("加载中...", "x-mask-loading")
		this.mainApp.taskManager.loadInstance(id, {
					showButtonOnTop : true,
					autoLoadSchema : false,
					isCombined : false,
					cnds : this.getCnd(param, true),
					closeAction : 'hide'
				}, this.onModuleLoad, this)
	},

	onModuleLoad : function(module) {
		var de = this.mainApp.desktop;

		this.midiModules[module.id] = module;
		if (module.initPanel) {
			var panel = module.initPanel()
			if (panel) {
				var win = module.getWin()
				win._mId = module.id
				if (module && module.winState) {
					var state = module.winState
					win.setPosition(
							(document.documentElement.clientWidth - win.width)
									/ 2, 80)
					if (state.width || state.height) {
						win.setWidth(state.width)
						win.setHeight(state.height)
					}
				}
				win.show()
				win.doLayout()
				this.mainApp.desktop.mainTab.el.unmask();
			}
			return;
		}

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

	onMapLoad : function() {
		if (this.getObject()) {
			this.refresh();
		}
	},

	onMapLogon : function() {
		this.mainApp.logon();
	},

	onMapClick : function() {
		if (!Array.prototype.slice.call(arguments, 1))
			return;
		var m = arguments[0];
		if (this.isMapModule) {
			// this.selectTreeNode(this.listNode,m.regionCode);
			m.module = this.combinedView.midiModules["list"];
			this.initCnd(m, false)
			this.combinedView.listTab.activate(0);
			return;
		}
		this.openWin(m);
	},

	selectTreeNode : function(node, id) {
		var tr = node.getOwnerTree();
		tr.getNodeById(id).select();
		tr.getNodeById(id).expand();
		// tr.getSelectionModel().clearSelections();
		// alert(node.getPath("mapSign")+"/"+id,"mapSign")
		// tr.selectPath(node.getPath("mapSign") + "/" + id, "mapSign",
		// this.onTreeExpand);
	},

	onTreeExpand : function(n) {
		// alert(n)
	},
	
	doQuery: function(param){
		Ext.apply(param,{
				username : this.mainApp.uid,
				mapSign : param.mapSign || this.mainApp.mapSign
				
		});
		try{
			this.getObject().query(param)
		}catch(e){
			//alert(e.description)
			//this.reload();
		}
	},

	onMapRender : function() {
		if (this.isMapModule) {
			this.highLightSelect();
			this.fireEvent("loaded",this)
			return;
		}

		if (this.getObject()) {
			this.getObject().query({
						username : this.mainApp.uid,
						mapSign : this.mainApp.mapSign,
						operationId : "LogicSimpleQuery"
					})
		}
		
		this.fireEvent("loaded",this)
	},

	initMap : function() {
		if (this.mapUtil) {
			this.mapUtil.un("click", this.onMapClick, this)
			this.mapUtil.un("render", this.onMapRender, this)
			this.mapUtil.un("logon", this.onMapLogon, this)
			this.mapUtil.un("dispatchevent",this.onMapFireEvent,this)
		}
		var m = new util.gis.Map(this.mapid);
		m.on("render", this.onMapRender, this)
		m.on("click", this.onMapClick, this)
		m.on("logon", this.onMapLogon, this)
		m.on("dispatchevent",this.onMapDispatchEvent,this)
		var html = m.getSWFHTML()
		this.mapUtil = m;
		return html
	},
	
 	onMapDispatchEvent:function(){
 		this.fireEvent("dispatchevent",arguments[0])
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
								eval(script + '.do' + cmd
										+ '.apply(this,[item,e])')
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
				closeAction:this.closeAction,
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
	},

	getObject : function() {
		return util.gis.MapUtil.getMapObject(this.mapid);
	}
})