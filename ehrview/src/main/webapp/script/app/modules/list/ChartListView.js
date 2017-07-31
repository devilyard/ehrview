/**
 * @include "../../desktop/Module.js"
 * @include "../common.js"
 * @include "../../../util/Accredit.js"
 * 
 */
$package("app.modules.list")
$import("app.desktop.Module", "app.modules.common", "util.Accredit",
		"util.dictionary.SimpleDicFactory", "util.widgets.MyPagingToolbar",
		"util.widgets.MyRowExpander", "util.rmi.jsonRequest",
		"util.rmi.miniJsonRequestSync", "util.widgets.MyRadioGroup")

app.modules.list.ChartListView = function(cfg) {
	this.width = 620;
	this.height = 350
	this.selectFirst = true
	this.enableCnd = true
	this.autoLoadData = true
	this.cnds = cfg.cnds || this.initCnd;
	this.listServiceId = "simpleQuery"
	this.removeServiceId = "simpleRemove"
	this.createCls = "app.modules.form.MCFormView"
	this.updateCls = "app.modules.form.MCFormView"
	this.gridCreator = Ext.grid.GridPanel
	this.exContext = {}
	this.modal = false; // add by huangpf
	this.queryCndsType = null
	Ext.apply(this, app.modules.common)
	app.modules.list.ChartListView.superclass.constructor.apply(this, [cfg])
}
Ext.extend(app.modules.list.ChartListView, app.desktop.Module, {
			init : function() {
				this.addEvents({
							"loadData" : true
						})
						
				this.requestData = {
					serviceId : "simpleReport",
					schema : this.entryName
				}
				if (this.exQueryParam) {
					for (var name in this.exQueryParam) {
						var v = this.exQueryParam[name]
						if (typeof v == "object") {
							v = v.key
						}
						this.requestData[name] = v;
					}
				}
			},
			initPanel : function() {
				if (this.grid) {
					if (!this.isCombined) {
						this.fireEvent("beforeAddToWin", this.grid)
						this.addPanelToWin();
					}
					return this.grid;
				}

				var schema = this.schema
				if (!schema && this.entryName) {
					var ret = util.rmi.miniJsonRequestSync({
								serviceId : "reportSchemaLoader",
								schema : this.entryName
							})
					if (ret.code == 200) {
						this.schema = ret.json.body
						this.title = this.schema.title
					} else {
						alert(ret.msg)
						return;
					}
				}
				
				var items = schema.items
				if (!items) {
					return;
				}

				this.store = this.getStore(items)
				this.cm = new Ext.grid.ColumnModel(this.getCM(items))
				var cfg = {
					border : false,
					store : this.store,
					cm : this.cm,
					autoSizeColumns : true,
					loadMask : {
						msg : '正在加载数据...',
						msgCls : 'x-mask-loading'
					},
					buttonAlign : 'center',
					clicksToEdit : true,
					frame : false,
					plugins : this.rowExpander,
					// stripeRows : true,
					viewConfig : {
						// forceFit : true,
						getRowClass : this.getRowClass
					}
				}

				if (this.gridDDGroup) {
					cfg.ddGroup = this.gridDDGroup;
					cfg.enableDragDrop = true
				}
				var cndbars = this.getCndBar(items)

				if (!this.showButtonOnPT) {
					if (this.showButtonOnTop) {
						cfg.tbar = (cndbars.concat(this.tbar || []))
								.concat(this.createButtons())
					} else {
						cfg.tbar = cndbars.concat(this.tbar || [])
						//cfg.buttons = this.createButtons()
					}
				}

				this.grid = new this.gridCreator(cfg)
				this.grid.on("afterrender", this.onReady, this)
				this.grid.on("contextmenu", function(e) {
							e.stopEvent()
						})
				this.grid.on("rowcontextmenu", this.onContextMenu, this)
				this.grid.on("rowdblclick", this.onDblClick, this)
				this.grid.on("rowclick", this.onRowClick, this)
				this.grid.on("keydown", function(e) {
							if (e.getKey() == e.PAGEDOWN) {
								e.stopEvent()
								this.pagingToolbar.nextPage()
								return
							}
							if (e.getKey() == e.PAGEUP) {
								e.stopEvent()
								this.pagingToolbar.prevPage()
								return
							}
						}, this)

				if (!this.isCombined) {
					this.fireEvent("beforeAddToWin", this.grid)
					this.addPanelToWin();
				}
				//this.initCnds();
				return this.grid
			},
			setCndVisible : function(visible) {
				var tbar = this.grid.getTopToolbar();
				if (!tbar)
					return;
				tbar.setVisible(visible);
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
				
				if(!queryParam) return;

				var tbar = this.grid.getTopToolbar()

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
			active : function() {
				if (!this.selectedIndex) {
					this.selectRow(0)
				} else {
					this.selectRow(this.selectedIndex);
				}
			},
			onReady : function() {
				if (this.autoLoadData) {
					this.loadData();
				}
				var el = this.grid.el
				if (!el) {
					return
				}
				var actions = this.actions
				if (!actions) {
					return
				}

			},
			onAccessKey : function(key, e) {

				e.stopEvent()
				var btn = this.btnAccessKeys[key]
				if (!btn.disabled) {
					if (btn.enableToggle) {
						btn.toggle(!btn.pressed)
					}
					this.doAction(btn)
				}
				var ev = window.event
						? window.event
						: arguments.callee.caller.arguments[0]
				try {
					ev.keyCode = 0;
					ev.returnValue = false
					return false
				} catch (e) {
					alert(e)
				}

			},
			addPanelToWin : function() {
				if (!this.fireEvent("panelInit", this.grid)) {
					return;
				};
				var win = this.getWin();
				win.add(this.grid)
			},
			getRowClass : function(record, rowIndex, rowParams, store) {
					//if(record.data.manageUnit<100){   
                     //   return 'store-input-text';   
                   // }else{   
                        return '';   
                    //} 
			},
			getCndBar : function(items) {
				var fields = [];
				if (!this.enableCnd) {
					return []
				}
				for (var i = 0; i < items.length; i++) {
					var it = items[i]
					if (!it.queryable) {
						continue
					}
					fields.push({
								value : i,
								text : it.alias
							})
				}

				if (fields.length == 0) {
					return [];
				}
				var store = new Ext.data.JsonStore({
							fields : ['value', 'text'],
							data : fields
						});
				var combox = new Ext.form.ComboBox({
							store : store,
							valueField : "value",
							displayField : "text",
							mode : 'local',
							triggerAction : 'all',
							emptyText : '选择查询字段',
							selectOnFocus : true,
							width : 100
						});
				combox.on("select", this.onCndFieldSelect, this)
				this.cndFldCombox = combox

				var cndField = new Ext.form.TextField({
							width : 150,
							selectOnFocus : true,
							name : "dftcndfld"
						})
				this.cndField = cndField

				var queryBtn = new Ext.Toolbar.SplitButton({
							text : '',
							iconCls : "query",
							notReadOnly : true, // ** add by yzh **
							menu : new Ext.menu.Menu({
										items : {
											text : "高级查询",
											iconCls : "common_query",
											handler : this.doAdvancedQuery,
											scope : this
										}
									})
						})
				this.queryBtn = queryBtn
				queryBtn.on("click", this.doCndQuery, this);
				return [combox, '-', cndField, '-', queryBtn]
			},
			onCndFieldSelect : function(item, record, e) {
				var tbar = this.grid.getTopToolbar()
				var tbarItems = tbar.items.items
				var index = record.data.value
				var it = this.schema.items[index]

				var field = this.cndField
				// field.destroy()
				field.hide();
				var f = this.midiComponents[it.id]
				if (!f) {
					if (it.dic) {
						it.dic.src = this.entryName + "." + it.id
						it.dic.defaultValue = it.defaultValue
						it.dic.width = 150
						f = this.createDicField(it.dic)
					} else {
						f = this.createNormalField(it)
					}
					f.on("specialkey", this.onQueryFieldEnter, this)
					this.midiComponents[it.id] = f
				} else {
					f.on("specialkey", this.onQueryFieldEnter, this)
					// f.rendered = false
					f.show();
				}
				this.cndField = f
				tbarItems[2] = f
				tbar.doLayout()
			},
			onQueryFieldEnter : function(f, e) {
				if (e.getKey() == e.ENTER) {
					e.stopEvent()
					this.doCndQuery()
				}
			},
			createNormalField : function(it) {
				var cfg = {
					name : it.id,
					fieldLabel : it.alias,
					width : 150,
					value : it.defaultValue
				}
				var field;
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
						field = new Ext.form.NumberField(cfg)
						break;
					case 'date' :
						cfg.xtype = 'datefield'
						cfg.emptyText = "请选择日期"
						field = new Ext.form.DateField(cfg)
						break;
					case 'string' :
						field = new Ext.form.TextField(cfg)
						break;
				}
				return field;
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
			doCndQuery : function() {
				alert("tt")
				var initCnd = this.initCnd
				var index = this.cndFldCombox.getValue()
				var it = this.schema.items[index]

				if (!it) {
					return;
				}
				this.resetFirstPage()
				var v = this.cndField.getValue()

				if (this.cndField.getXType() == "datefield") {
					v = v.format("Y-m-d")
				}
				if (v == null || v == "") {
					this.queryCnd = null;
					this.requestData.cnd = initCnd
					this.refresh()
					return
				}
				var refAlias = it.refAlias || "a"

				var cnd = ['eq', ['$', refAlias + "." + it.id]]
				if (it.dic) {
					if (it.dic.render == "Tree") {
						var node = this.cndField.selectedNode
						// @@ modified by chinnsii 2010-02-28, add "!node"
						if (!node || !node.isLeaf()) {
							cnd[0] = 'like'
							cnd.push(['s', v + '%'])
						} else {
							cnd.push(['s', v])
						}
					} else {
						cnd.push(['s', v])
					}
				} else {
					switch (it.type) {
						case 'int' :
							cnd.push(['i', v])
							break;
						case 'double' :
						case 'bigDecimal' :
							cnd.push(['d', v])
							break;
						case 'string' :
							cnd[0] = 'like'
							cnd.push(['s', v + '%'])
							break;
						case "date" :
							v = v.format("Y-m-d")
							cnd[1] = [
									'$',
									"str(" + refAlias + "." + it.id
											+ ",'yyyy-MM-dd')"]
							cnd.push(['s', v])
							break;
					}
				}
				this.queryCnd = cnd
				if (initCnd) {
					cnd = ['and', initCnd, cnd]
				}
				this.requestData.cnd = cnd
				this.refresh()
			},
			getPagingToolbar : function(store) {
				var cfg = {
					pageSize : 25,
					store : store,
					requestData : this.requestData,
					displayInfo : true,
					emptyMsg : "无相关记录"
				}
				if (this.showButtonOnPT) {
					cfg.items = this.createButtons();
				}
				var pagingToolbar = new util.widgets.MyPagingToolbar(cfg)
				this.pagingToolbar = pagingToolbar
				return pagingToolbar
			},
			getStoreFields : function(items) {
				var fields = []
				var ac = util.Accredit;
				var pkey = "";
				for (var i = 0; i < items.length; i++) {
					var it = items[i]
					var f = {}
					if (it.pkey) {
						pkey = it.id
					}
					f.name = it.id
					switch (it.type) {
						case 'date' :
							// f.type = "date"
							break;
						case 'int' :
							f.type = "int"
							break
						case 'double' :
						case 'bigDecimal' :
							f.type = "float"
							break
						case 'string' :
							f.type = "string"
					}
					fields.push(f)
					if (it.dic) {
						fields.push({
									name : it.id + "_text",
									type : "string"
								})
					}
				}
				return {
					pkey : pkey,
					fields : fields
				}
			},
			getStore : function(items) {
				var o = this.getStoreFields(items)
				var reader = new Ext.data.JsonReader({
							root : (this.data? '' : 'body'),
							totalProperty : 'totalCount',
							id : o.pkey,
							fields : o.fields
						})
				var url = ClassLoader.serverAppUrl || "";
				var proxy = this.data?
							new Ext.data.MemoryProxy(this.data):
							new Ext.data.HttpProxy({
							url : url + '*.jsonRequest',
							method : 'post',
							jsonData : this.requestData
						})
				this.proxy=proxy;
				proxy.on("loadexception", function(proxy, o, response, arg, e) {
							if (response.status == 200) {
								var json = eval("(" + response.responseText
										+ ")")
								if (json) {
									var code = json["x-response-code"]
									var msg = json["x-response-msg"]
									this.processReturnMsg(code, msg,
											this.refresh)
								}
							} else {
								this.processReturnMsg(404, 'ConnectionError',
										this.refresh)
							}
						}, this)
				var store = new Ext.data.Store({
							proxy : proxy,
							reader : reader
						})
				store.on("load", this.onStoreLoadData, this)
				store.on("beforeload", this.onStoreBeforeLoad, this)
				return store

			},
			selectFirstRow : function() {
				this.selectRow(0)
			},
			selectRow : function(v) {
				if (!this.grid.hidden) {
					this.grid.el.focus()
				}
				try {
					if (this.grid && this.selectFirst) {
						var sm = this.grid.getSelectionModel()
						if (sm.selectRow) {
							sm.selectRow(v)
						}
						if (!this.grid.hidden) {
							var view = this.grid.getView()
							if (this.store.getCount() > 0) {
								view.getRow(0).focus()
							} else {
								var el = this.grid.el
								setTimeout(function() {
											el.focus()
										}, 300)
							}
						}
						this.fireEvent("firstRowSelected", this)
					}
				} catch (e) {
				}
			},
			onStoreLoadData : function(store, records, ops) {
				if (records.length == 0) {
					return
				}
				this.fireEvent("loadData", store)
				if (!this.selectedIndex) {
					this.selectRow(0)
				} else {
					this.selectRow(this.selectedIndex);
					this.selectedIndex = 0;
				}
			},
			onStoreBeforeLoad : function(store, op) {
				var r = this.getSelectedRecord()
				var n = this.store.indexOf(r)
				if (n > -1) {
					this.selectedIndex = n
				}
			},
			getExpander : function(items) {
				var template = '<p><b>{0}:</b>{{1}}';
				var src = ClassLoader.appRootOffsetPath + 'image/{{1}}.jpg'
				var imgTemplate = '<p><img title={0} src=' + src
						+ ' height=100/>'
				var tpls = []
				for (var i = 0; i < items.length; i++) {
					var it = items[i]
					if (it.xtype == 'imagefield') {
						template = imgTemplate
					}
					tpls.push(String.format(template, it.alias, it.id))
				}
				var tpl = new Ext.Template(tpls.join("<br/>"))
				return new util.widgets.MyRowExpander({
							enableCaching : false,
							tpl : tpl
						})
			},
			getCM : function(items) {
				var cm = []
				var ac = util.Accredit;
				var expands = []
				for (var i = 0; i < items.length; i++) {
					var it = items[i]
					if ((it.display <= 0 || it.display == 2)) {
						continue
					}
					if (it.expand) {
						var expand = {
							id : it.dic ? it.id + "_text" : it.id,
							alias : it.alias,
							xtype : it.xtype
						}
						expands.push(expand)
						continue
					}
					
					var width = parseInt(it.width || 120)
					// if(width < 80){width = 80}
					var c = {
						header : it.alias.length == 0 ? this.title : it.alias,
						sortable : true,
						width:width,
						dataIndex : it.dic ? it.id + "_text" : it.id
					}
					if (it.pkey) {
						c.id = it.id
					}
					switch (it.type) {
						case 'int' :
						case 'double' :
						case 'bigDecimal' :
							if (!it.dic) {
								c.css = "color:#00AA00;font-weight:bold;"
								c.align = "center"
							}
							break
						case 'timestamp' :
							// c.renderer = Ext.util.Format.dateRenderer('Y-m-d
							// HH:m:s')
					}
					if (it.renderer) {
						var func
						func = eval("this." + it.renderer)
						if (typeof func == 'function') {
							c.renderer = func
						}
					}
					if (this.fireEvent("addfield", c, it)) {
						cm.push(c)
					}
				}
				if (expands.length > 0) {
					this.rowExpander = this.getExpander(expands)
					cm = [this.rowExpander].concat(cm)
				}
				return cm
			},
			
			percentRender:function (v){ 
				return v+"%";
			} ,
			
			getWin : function() {
				var win = this.win
				var closeAction = "close"
				if (!this.mainApp || this.closeAction) {
					closeAction = "hide"
				}
				if (!win) {
					win = new Ext.Window({
						id : this.id,
						title : this.title,
						width : this.width,
						iconCls : 'icon-grid',
						shim : true,
						layout : "fit",
						animCollapse : true,
						closeAction : closeAction,
						constrainHeader : true,
						minimizable : true,
						maximizable : true,
						shadow : false,
						modal : this.modal || false
							// add by huangpf.
						})
					var renderToEl = this.getRenderToEl()
					if (renderToEl) {
						win.render(renderToEl)
					}
					win.on("show", function() {
								this.fireEvent("winShow")
							}, this)
					win.on("add", function() {
								this.win.doLayout()
							}, this)
					win.on("close", function() {
								this.fireEvent("close", this)
							}, this)
					this.win = win
				}
				return win;
			},
			createButtons : function() {
				var actions = this.actions
				var buttons = []
				if (!actions) {
					return buttons
				}
				var f1 = 112
				for (var i = 0; i < actions.length; i++) {
					var action = actions[i];
					if (action.hide) {
						continue
					}

					// ** add by yzh **
					var btnFlag;
					if (action.notReadOnly)
						btnFlag = false
					else
						btnFlag = this.readOnly || false

					var btn = {
						accessKey : f1 + i,
						text : action.name + "(F" + (i + 1) + ")",
						ref : action.ref,
						target : action.target,
						cmd : action.delegate || action.id,
						iconCls : action.iconCls || action.id,
						enableToggle : (action.toggle == "true"),

						// ** add by yzh **
						disabled : btnFlag,
						notReadOnly : action.notReadOnly,

						script : action.script,
						handler : this.doAction,
						scope : this
					}
					buttons.push(btn)
				}
				return buttons

			},
			resetButtons : function() { // ** add by yzh **
				if (this.showButtonOnTop) {
					var btns = this.grid.getTopToolbar().items;
					var n = btns.getCount()
					for (var i = 0; i < n; i++) {
						var btn = btns.item(i)
						if (btn.type != "button")
							continue;
						if (btn.notReadOnly)
							btn.enable();
						else {
							if (this.readOnly)
								btn.disable()
							else
								btn.enable()
						}
					}
				} else {
					var btns = this.grid.buttons
					for (var i = 0; i < btns.length; i++) {
						var btn = btns[i]
						if (btn.notReadOnly)
							btn.enable();
						else {
							if (this.readOnly)
								btn.disable()
							else
								btn.enable()
						}
					}
				}
			},
			onEnterKey : function() {
				Ext.EventObject.stopEvent()
				this.onDblClick(this.grid)
			},
			onContextMenu : function(grid, rowIndex, e) {
				if (e) {
					e.stopEvent()
				}
				if (this.disableContextMenu) {
					return
				}
				this.grid.getSelectionModel().selectRow(rowIndex)
				var cmenu = this.midiMenus['gridContextMenu']
				if (!cmenu) {
					var items = [];
					var actions = this.actions
					if (!actions) {
						return;
					}
					for (var i = 0; i < actions.length; i++) {
						var action = actions[i];
						var it = {}
						it.cmd = action.id
						it.ref = action.ref
						it.iconCls = action.iconCls || action.id
						it.script = action.script
						it.text = action.name
						it.handler = this.doAction
						it.scope = this
						items.push(it)
					}
					cmenu = new Ext.menu.Menu({
								items : items
							})
					this.midiMenus['gridContextMenu'] = cmenu
				}
				cmenu.showAt([e.getPageX() + 5, e.getPageY() + 5])
			},
			onDblClick : function(grid, index, e) {
				var actions = this.actions
				if (!actions) {
					return;
				}
				var item = {};
				for (var i = 0; i < actions.length; i++) {
					var action = actions[i]
					var cmd = action.id
					if (cmd == "update" || cmd == "read") {
						item.text = action.name
						item.cmd = action.id
						item.ref = action.ref
						item.script = action.script
						if (cmd == "update") {
							break
						}
					}
				}
				if (item.cmd) {
					this.doAction(item, e)
				}
			},
			getSelectedRecord : function(muli) {
				if (muli) {
					return this.grid.getSelectionModel().getSelections()
				}
				return this.grid.getSelectionModel().getSelected()
			},
			doAdvancedQuery : function() {
				if (!this.schema) {
					return
				}
				var items = this.schema.items
				var qWin = this.midiModules["qWin"]
				var cfg = {
					list : this,
					entryName : this.entryName,
					items : items
				}
				if (!qWin) {
					$import("app.modules.list.QueryWin")
					qWin = new app.modules.list.QueryWin(cfg)
					this.midiModules["qWin"] = qWin
				} else {
					Ext.apply(qWin, cfg)
				}
				qWin.getWin().show()
			},
			doPrint : function() {
				var pWin = this.midiModules["printView"]
				if (pWin) {
					Ext.apply(pWin, {
								title : this.title,
								requestData : this.requestData
							})
					pWin.getWin().show()
					return
				}
				pWin = new app.modules.list.PrintWin({
							title : this.title,
							requestData : this.requestData
						})
				this.midiModules["printView"] = pWin
				pWin.getWin().show()

				/*
				 * var m = this.midiModules["print"] var cfg = {
				 * title:this.title, entryName:this.entryName,
				 * listServiceId:this.listServiceId,
				 * initCnd:this.requestData.cnd,
				 * queryCndsType:this.queryCndsType } if(!m){ var cls =
				 * this.printCls || "app.modules.print.ListPrintView"
				 * $require(cls,[function(){ var module = eval("new " + cls +
				 * "(cfg)") this.midiModules["print"] = module
				 * module.getWin().show() },this]) } else{ m.initCnd =
				 * this.requestData.cnd m.queryCndsType = this.queryCndsType
				 * m.loadData() m.getWin().show() }
				 */
			},
			doAction : function(item, e) {
				var cmd = item.cmd
				var ref = item.ref

				if (ref) {
					this.loadRemote(ref, item)
					return;
				}
				var script = item.script
				if (cmd == "create") {
					if (!script) {
						script = this.createCls
					}
					this.loadModule(script, this.entryName, item)
					return
				}
				if (cmd == "update" || cmd == "read") {
					var r = this.getSelectedRecord()
					if (r == null) {
						return
					}
					if (!script) {
						script = this.updateCls
					}
					this.loadModule(script, this.entryName, item, r)
					return
				}
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
			loadRemote : function(ref, btn) {
				if (this.loading) {
					return
				}
				var r = this.getSelectedRecord()
				var cmd = btn.cmd
				if (cmd == "update" || cmd == "read") {
					if (r == null) {
						return
					}
				}
				var cfg = {}
				cfg.title = this.title + '-' + btn.text
				cfg.op = cmd
				cfg.openWinInTaskbar = false
				cfg.autoLoadData = false;
				cfg.exContext = {}
				Ext.apply(cfg.exContext, this.exContext)
				if (cmd != 'create') {
					cfg.initDataId = r.id
					cfg.exContext[this.entryName] = r
				} else {
					cfg.initDataId = null;
				}
				var module = this.midiModules[cmd]
				if (module) {
					Ext.apply(module, cfg)
					this.openModule(cmd, r)
				} else {
					this.loading = true
					this.mainApp.taskManager.loadInstance(ref, cfg, function(m,
									from) {
								this.loading = false
								m.on("save", this.onSave, this)
								m.on("close", this.active, this)
								this.midiModules[cmd] = m
								if (from == "local") {
									Ext.apply(m, cfg)
								}
								this.fireEvent("loadModule", m)
								this.openModule(cmd, r, 100, 50)
							}, this)
				}
			},
			loadModule : function(cls, entryName, item, r) {
				if (this.loading) {
					return
				}
				var cmd = item.cmd
				var cfg = {}
				cfg.title = this.title + '-' + item.text
				cfg.entryName = entryName
				cfg.op = cmd
				cfg.readOnly = this.readOnly // ** add by yzh **
				cfg.exContext = {}
				Ext.apply(cfg.exContext, this.exContext)

				if (cmd != 'create') {
					cfg.initDataId = r.id
					cfg.exContext[entryName] = r
				}
				if (this.saveServiceId) {
					cfg.saveServiceId = this.saveServiceId;
				}
				var m = this.midiModules[cmd]
				if (!m) {
					this.loading = true
					$require(cls, [function() {
										this.loading = false
										cfg.autoLoadData = false;
										var module = eval("new " + cls
												+ "(cfg)")
										module.on("save", this.onSave, this)
										module.on("close", this.active, this)
										module.opener = this
										module.setMainApp(this.mainApp)
										this.midiModules[cmd] = module
										this.fireEvent("loadModule", module)
										this.openModule(cmd, r, 100, 50)
									}, this])
				} else {
					Ext.apply(m, cfg)
					this.openModule(cmd, r)
				}
			},
			openModule : function(cmd, r, xy) {
				var module = this.midiModules[cmd]
				if (module) {
					var win = module.getWin()
					if (xy) {
						win.setPosition(xy[0], xy[1])
					}
					win.setTitle(module.title)
					win.show()
					if (!win.hidden) {
						switch (cmd) {
							case "create" :
								module.doNew()
								break;
							case "read" :
							case "update" :
								module.loadData()
						}
					}
				}
			},
			doRemove : function() {
				var r = this.getSelectedRecord()
				if (r == null) {
					return
				}
				Ext.Msg.show({
							title : '确认删除记录[' + r.id + ']',
							msg : '删除操作将无法恢复，是否继续?',
							modal : true,
							width : 300,
							buttons : Ext.MessageBox.OKCANCEL,
							multiline : false,
							fn : function(btn, text) {
								if (btn == "ok") {
									this.processRemove();
								}
							},
							scope : this
						})
			},
			processRemove : function() {
				var r = this.getSelectedRecord()
				if (r == null) {
					return
				}
				if (!this.fireEvent("beforeRemove", this.entryName, r)) {
					return;
				}
				this.mask("正在删除数据...")
				util.rmi.jsonRequest({
							serviceId : this.removeServiceId,
							pkey : r.id,
							schema : this.entryName
						}, function(code, msg, json) {
							this.unmask()
							if (code < 300) {
								this.store.remove(r)
								this.fireEvent("remove", this.entryName,
										'remove', json, r.data)
							} else {
								this.processReturnMsg(code, msg, this.doRemove)
							}
						}, this)
			},
			onRowClick : function() {

			},
			mask : function(msg) {
				if (this.grid && this.grid.el) {
					this.grid.el.mask(msg, "x-mask-loading")
				}
			},
			unmask : function() {
				if (this.grid && this.grid.el) {
					this.grid.el.unmask()
				}
			},
			onSave : function(entryName, op, json, rec) {
				this.fireEvent("save", entryName, op, json, rec);
				this.refresh()
			},
			refresh : function() {
				this.fireEvent("refresh")
				if(this.data){
					this.proxy.data=this.data
				}
				this.loadData();
			},
			clear : function() {
				if (this.store)
					this.store.removeAll()
			},
			loadData : function() {
				if (this.store) {
					//if (this.disablePagingTbr) {
					this.store.load()
					//	} else {
					//	var pt = this.grid.getBottomToolbar()
					//	pt.doLoad(pt.cursor)
					//}
				}
				// ** add by yzh **
				//this.resetButtons();
			},
			resetFirstPage : function() {
				var pt = this.grid.getBottomToolbar()
				if (pt) {
					pt.cursor = 0;
				} else {
					this.requestData.pageNo = 1;
				}
			},
			validate : function() {
				return true;
			}
		});
