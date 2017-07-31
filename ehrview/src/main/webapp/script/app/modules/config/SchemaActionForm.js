$package("app.modules.config")

$import("org.ext.ux.layout.TableFormLayout", "app.modules.common",
		"util.Accredit", "util.widgets.ImageField", "util.rmi.jsonRequest",
		"app.desktop.Module", "util.dictionary.SimpleDicFactory",
		"util.widgets.DateTimeField")
app.modules.config.SchemaActionForm = function(cfg) {
	this.colCount = 3;
	this.autoFieldWidth = true
	this.showButtonOnTop = false
	this.actions = [
			{	id : "save",
				name : "保存"
			}]
	if (!this.isCombined)
		this.actions.push({
					id : "cancel",
					name : "取消",
					iconCls : "common_cancel"
				})
	app.modules.config.SchemaActionForm.superclass.constructor.apply(this,
			[cfg])

}

Ext.extend(app.modules.config.SchemaActionForm, app.desktop.Module, {
	init : function() {
		this.initPanel()
	},
	initPanel : function() {
		if (this.form) {
			if (!this.isCombined) {
				this.addPanelToWin();
			}
			return this.form;
		}
		var ac = util.Accredit;
		var defaultWidth = this.fldDefaultWidth || 200
		var items = util.schema.loadSync("schemaConfig").schema.items
		this.items = items
		var colCount = this.colCount;
		var table = {
			layout : 'tableform',
			layoutConfig : {
				columns : colCount,
				tableAttrs : {
					border : 0,
					cellpadding : '2',
					cellspacing : "2"
				}
			},
			items : []
		}
		if (!this.autoFieldWidth) {
			var forceViewWidth = (defaultWidth + (this.labelWidth || 80))
					* colCount
			table.layoutConfig.forceWidth = forceViewWidth
		}
		var size = items.length
		for (var i = 0; i < size; i++) {
			var it = items[i]
			var f = this.createField(it)
			f.index = i;
			f.anchor = it.anchor || "100%"
			delete f.width
			f.colspan = parseInt(it.colspan)
			f.rowspan = parseInt(it.rowspan)

			if (!this.fireEvent("addfield", f, it)) {
				continue;
			}
			table.items.push(f)
		}

		var cfg = {
			buttonAlign : 'center',
			labelAlign : this.labelAlign || "left",
			labelWidth : this.labelWidth || 80,
			frame : true,
			shadow : false,
			border : false,
			collapsible : false,
			autoWidth : true,
			autoHeight : true,
			floating : false
		}

		if (this.isCombined) {
			cfg.frame = true
			cfg.shadow = false
			cfg.width = this.width
			cfg.height = this.height
		} else {
			cfg.autoWidth = true
			cfg.autoHeight = true
		}
		this.initBars(cfg);
		Ext.apply(table, cfg)
		this.form = new Ext.FormPanel(table)
		if (!this.isCombined) {
			this.addPanelToWin();
		}
		return this.form;
	},
	createField : function(it) {
		var ac = util.Accredit;
		var defaultWidth = this.fldDefaultWidth || 200
		var cfg = {
			name : it.id,
			fieldLabel : it.alias,
			xtype : it.xtype || "textfield",
			width : defaultWidth,
			labelSeparator : ":"
		}
		if(it['not-null'] == "1" || it['not-null'] == "true"){
			cfg.allowBlank = false
			cfg.invalidText  = "必填字段"
			cfg.regex = /(^\S+)/
			cfg.regexText = "前面不能有空格字符"
		}
		if (it.dic) {
			var combox = this.createSimpleDic(it.dic.id, true)
			Ext.apply(combox, cfg)
			if(it.id=="pkey"){
				combox.on("select",this.isPkey,this)
			}
			return combox;
		}
		return cfg;
	},
	isPkey:function(){
		var form = this.form.getForm()
		if(form.findField("pkey").getValue()=="true"){
			form.findField("generator").setDisabled(false);
		}else{
			form.findField("generator").setDisabled(true);
		}
	},
	initBars : function(cfg) {

		if (this.showButtonOnTop) {
			cfg.tbar = (this.tbar || []).concat(this.createButtons())
		} else {
			cfg.tbar = this.tbar
			cfg.buttons = this.createButtons()
		}
		if (this.bbar) {
			cfg.bbar = this.bbar
		}

	},
	getWin : function() {
		var win = this.win
		if (!win) {
			win = new Ext.Window({
						id : this.id,
						title : this.title,
						width : 800,
						autoHeight : true,
						iconCls : 'icon-form',
						bodyBorder : false,
						closeAction : 'hide',
						shim : true,
						layout : "fit",
						plain : true,
						autoScroll : false,
						// minimizable: true,
						maximizable : true,
						shadow : false,
						buttonAlign : 'center',
						modal : true

					})
			win.on("show", function() {
						this.fireEvent("winShow")
					}, this)
			win.on("close", function() {
						this.fireEvent("close", this)
					}, this)
			win.on("hide", function() {
						this.fireEvent("close", this)
					}, this)
			win.on("restore", function(w) {
						this.form.onBodyResize()
						this.form.doLayout()
						this.win.doLayout()
					}, this)

			this.win = win
		}
		return win;
	},
	addPanelToWin : function() {
		if (!this.fireEvent("panelInit", this.form)) {
			return;
		};
		var win = this.getWin();
		win.add(this.form)
		if (win.el) {
			win.doLayout()
			win.center();
		}
		this.fireEvent("afterPanelInit", this.form)
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
			var btn = {}
			btn.accessKey = f1 + i, btn.cmd = action.id
			btn.text = action.name + "(F" + (i + 1) + ")", btn.iconCls = action.iconCls
					|| action.id
			btn.script = action.script
			btn.handler = this.doAction;
			btn.scope = this;
			buttons.push(btn)
		}
		return buttons
	},
	doAction : function(item, e) {
		var cmd = item.cmd
		cmd = cmd.charAt(0).toUpperCase() + cmd.substr(1)
		var action = this["do" + cmd]()
		if (action) {
			action.apply(this, [item, e])
		}
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
	loadData : function(r,SimpleSchemaItem) {
		this.op = "update"
		this.win.setTitle(this.win.title+"(修改数据)");
		this.SimpleSchemaItem = SimpleSchemaItem
		if (r) {
			this.exContext = r
			var form = this.form.getForm()
			var items = this.items
			var size = items.length
			for (var i = 0; i < size; i++) {
				var it = items[i]
				if(it.id=="id"){
					form.findField(it.id).setDisabled(true);
				}
				if (it.dic) {
					form.findField(it.id).setValue({
								key : r.get(it.id),
								text : r.get(it.id + "_text")
							});
				
				} else {
					form.findField(it.id).setValue(r.get(it.id))
				}
				this.isPkey()
			}
				
		}
	},
	doCancel : function() {
		var win = this.getWin();
		if (win)
			win.hide();
	},
	doNew : function(r, SimpleSchemaItem) {
		this.SimpleSchemaItem = SimpleSchemaItem
		this.exContext = r
		var form = this.form.getForm()
		form.reset();
		this.isPkey()
		this.op = "create";
		this.win.setTitle(this.win.title+"(新建数据)");
		this.fireEvent("doNew")
		this.form.getForm().isValid();
		
	},
	doSave : function() {
		var form = this.form.getForm()
		if(!form.isValid()){
			return
		}
		var id=form.findField("id").getValue()
		var store = this.opener.grid.getStore()
		var items = this.items
		var size = items.length
			var expand = {};
			for (var i = 0; i < size; i++) {
				var it = items[i]
				expand[it.id] = form.findField(it.id).getValue()
				if (it.dic) {
					expand[it.id + "_text"] = form.findField(it.id).getRawValue()
				}
			}
			var e = new this.SimpleSchemaItem(expand);
		if (this.op == "update") {
			var r = this.exContext
			var n = store.indexOf(r)
			store.remove(r)		    
		    store.insert(n,e)
		    this.opener.grid.getSelectionModel().selectRow(n);
		}
		if (this.op == "create") {  
			if(store.find("id",Ext.util.Format.trim(id))>-1){
				Ext.Msg.alert("提示","标识符已经存在")
			return
			}
			store.insert(0, e);
			this.opener.grid.getView().refresh();
			this.opener.grid.getSelectionModel().selectRow(0);
		}
		var win = this.getWin();
		if (win)
			win.hide()
	},
	doReset : function() {
		var form = this.form.getForm()
		form.reset();
	}

})