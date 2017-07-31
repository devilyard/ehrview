$package("app.modules.config")

$import("app.desktop.Module", "org.ext.ux.grid.RowEditor",
		"org.ext.ux.grid.RowExpander", "util.dictionary.SimpleDicFactory",
		"util.schema.SchemaLoader", "app.modules.config.SchemaActionForm")

app.modules.config.SchemaConfigForm = function(cfg) {
	app.modules.config.SchemaConfigForm.superclass.constructor.apply(this,[cfg])
}

Ext.extend(app.modules.config.SchemaConfigForm, app.desktop.Module, {
	initPanel : function() {
		var col = util.schema.loadSync("schemaConfig").schema.items
		var expands = this.getStoreFields(col)
		var SimpleSchemaItem = Ext.data.Record.create(expands);
		this.SimpleSchemaItem = SimpleSchemaItem
		var store = new Ext.data.GroupingStore({
					reader : new Ext.data.JsonReader({
								fields : SimpleSchemaItem
							})
				});
		this.store = store;
		var expander = new Ext.ux.grid.RowExpander({
			tpl : new Ext.XTemplate('<div style="padding-left:50px;"><b>其他详细信息:</b></div>'
							+ '<div style="padding-left:100px;">'
							+ '<tpl if="length">'
							+ '长度：{length};&nbsp&nbsp&nbsp'
							+ '</tpl>'
							+ '<tpl if="width">'
							+ '宽度：{width};&nbsp&nbsp&nbsp'
							+ '</tpl>'
							+ '<tpl if="colspan">'
							+ '跨列：{colspan};&nbsp&nbsp&nbsp'
							+ '</tpl>'
							+ '<tpl if="hidden">'
							+ '是否隐藏：{hidden_text};&nbsp&nbsp&nbsp'
							+ '</tpl>'
							+ '<tpl if="queryable">'
							+ '是否查询：{queryable_text};&nbsp&nbsp&nbsp'
							+ '</tpl>' + '</div>')
		});
		this.expander = expander;
		this.cm = this.getCm(col);
		var grid = new Ext.grid.GridPanel({
					store : this.store,
					region : "center",
					plugins : [expander],
					view : new Ext.grid.GroupingView({
								markDirty : false
							}),
					tbar : [{
								iconCls : 'create',
								text : '新建',
								scope : this,
								handler : this.doAction

							}, {
								iconCls : 'update',
								text : '修改',
								scope : this,
								handler : this.doAction

							}, {
								iconCls : 'remove',
								text : '删 除',
								scope : this,
								handler : this.doAction

							}],
					columns : this.cm
				});
		this.grid = grid
		this.grid.on("rowdblclick", this.onDblClick, this);
		var form = new Ext.FormPanel({
					region : "north",
					bodyStyle : "padding:5px",
					height : 80,
					labelWidth : this.labelWidth || 80,
					border : false,
					frame : true,
					defaultType : 'textfield',
					defaults : {
						anchor : "100%"
					},
					shadow : true,
					items : [{
								name : "id",
								fieldLabel : "标识符",
								allowBlank : false
							}, {
								name : "alias",
								fieldLabel : "别名",
								allowBlank : false
							}]
				})
		this.form = form
		var panel = new Ext.Panel({
					tbar : [{
								text : "保存",
								iconCls : "save",
								handler : this.doSave,
								scope : this
							}],
					layout : "border",
					items : [form, grid]
				})
		this.panel = panel
		return panel
	},
	getCm : function(col) {
		var cm = [this.expander, new Ext.grid.RowNumberer()];
		for (var i = 0; i < col.length; i++) {
			var it = col[i];
			var expand = {
				header : it.alias,
				dataIndex : it.dic ? it.id + "_text" : it.id,
				width : 100,
				sortable : true
			};
			if (it.id == "length" || it.id == "width" || it.id == "hidden"
					|| it.id == "queryable" || it.id == "colspan") {
				expand.hidden = true
			}
			cm.push(expand);
			if (it.dic) {
				expand = {
					header : it.alias + ".hidden",
					dataIndex : it.id,
					width : 100,
					sortable : true,
					hidden : true
				};
				cm.push(expand)
			}

		}
		return cm;
	},
	onDblClick : function() {
		var btn = {
			iconCls : "update"
		}
		this.doAction(btn);
	},
	createSimpleDic : function(dicId, isLoad) {
		var dic = util.dictionary.SimpleDicFactory.createDic({
					id : dicId
				});
		if (isLoad) {
			dic.store.load();
		}
		return dic
	},
	doSave : function() {
		var form = this.form.getForm()
		if (!form.isValid()) {
			return
		}
		if (!this.data) {
			this.data = {}
		}
		
		var node=this.parentNode
		var root=this.tree.getRootNode()
		var scId=node.attributes.key
		while (node.parentNode!=root) {
				node=node.parentNode
				scId=node.attributes.key+"\\"+scId
				}
		this.data["parentId"] = scId
	//	this.data["parentId"] = this.parentNode.attributes.root? "": this.parentNode.id
		this.data["id"] = form.findField("id").getValue()
		this.data["alias"] = form.findField("alias").getValue()
		var items = []
		this.data["items"] = items
		var st = this.grid.getStore()
		for (var i = st.getCount() - 1; i >= 0; i--) {
			var r = st.getAt(i)
			if (!r.data["id"]) {
				st.remove(r)
			}
		}
		var pkCount = 0;
		for (var i = 0; i < st.getCount(); i++) {
			var r = st.getAt(i)
			if (!r.data["dic"]) {
				r.set("dicRender", "")
			}
			items.push(r.data)
			if (r.data["pkey"] == "true") {
				pkCount++;
			}
		}
		if (pkCount == 0) {
			Ext.MessageBox.alert("提示", "必须设置一个主键。")
			return;
		}
		if (pkCount > 1) {
			Ext.MessageBox.alert("提示", "只能设置一项为主键。")
			return;
		}
		for (var i = 0; i < items.length; i++) {
			var it = items[i]
			for (var r in it) {
				if (r.indexOf("_text") > 0)
					delete it[r]
			}
		}
		this.panel.el.mask("在正保存数据...", "x-mask-loading")
		util.rmi.jsonRequest({
					serviceId : "configuration",
					className : "SchemaConfig",
					operate : "save",
					op : this.op,
					body : this.data,
					domain:this.domain,
					isValid : false
				}, function(code, msg, json) {
					this.panel.el.unmask()
					if (code < 300) {
						form.findField("id").disable();
						this.fireEvent("save", this.op, this.data,
								this.parentNode)
						this.op = "update"
						delete util.schema.SchemaPool[this.data["id"]]
					} else {
						this.processReturnMsg(code, msg, this.doSave)
					}
				}, this)
	},
	doRemove : function() {
		var s = this.grid.getSelectionModel().getSelections();
		Ext.Msg.show({
					title : '确认删除记录',
					msg : '删除操作将无法恢复，是否继续?',
					modal : true,
					width : 300,
					buttons : Ext.MessageBox.OKCANCEL,
					multiline : false,
					fn : function(btn, text) {
						if (btn == "ok") {
							for (var i = 0, r; r = s[i]; i++) {
								if (r.data["pkey"] == "true") {
									Ext.MessageBox.alert("提示", "主键不允许删除.")
									continue;
								}
								this.store.remove(r);
							}
						}
					},
					scope : this
				})

	},
	initFormData : function(node) {
		var form = this.form.getForm();
		form.findField("id").disable()
		var store = this.store;
		this.panel.el.unmask("在正加载数据...", "x-mask-loading")
		util.rmi.jsonRequest({
					serviceId : "configuration",
					className : "SchemaConfig",
					operate : "load",
					domain:this.domain,
					pkey : node.attributes.key
				}, function(code, msg, json) {
					this.panel.el.unmask()
					if (code < 300) {
						if (json && json.body) {
							var body = json.body
							form.findField("id").setValue(body["id"])
							form.findField("alias").setValue(body["alias"])
							store.loadData(body.items)
							this.fireEvent("save", this.op, body)
							this.op = "update"
						}
					} else {
						this.processReturnMsg(code, msg, this.initFormData,
								[node])
					}
				}, this)
	},

	getSelectedRecord : function(muli) {
		if (muli) {
			return this.grid.getSelectionModel().getSelections()
		}
		return this.grid.getSelectionModel().getSelected()
	},
	doAction : function(btn) {
		var cmd = btn.iconCls;
		var m = this.midiModules[cmd]
		var r = this.getSelectedRecord();
		if (cmd == "update" && r == null) {
			return
		}
		if (cmd == "remove") {
			this.doRemove()
			return
		}
		if (!m) {
			var module = new app.modules.config.SchemaActionForm();
			this.midiModules[cmd] = module
			module.opener = this
			this.openModule(cmd, r)
		} else {
			this.openModule(cmd, r)
		}
	},
	openModule : function(cmd, r, xy) {
		var module = this.midiModules[cmd]
		if (module) {
			var win = module.getWin()
			win.setTitle(this.panel.title)
			win.show()
			if (!win.hidden) {
				switch (cmd) {
					case "create" :
						module.doNew(r, this.SimpleSchemaItem)
						break;
					case "read" :
					case "update" :
						module.loadData(r, this.SimpleSchemaItem)
				}
			}
		}
	},
	getStoreFields : function(items) {
		var fields = []
		for (var i = 0; i < items.length; i++) {
			var it = items[i]
			var f = {}
			if (it.pkey == "true") {
				pkey = it.id
			}
			f.name = it.id
			fields.push(f)
			if (it.dic) {
				fields.push({
							name : it.id + "_text",
							type : "string"
						})
			}
		}
		return fields
	},
	doNew:function(){
		this.op = "create"
		var f = this.form.getForm()
		var fid = f.findField("id")
		fid.enable()
		fid.focus(500)
		f.reset()
		this.grid.getStore().removeAll()
	}
})