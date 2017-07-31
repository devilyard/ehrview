$package("app.modules.config")

$import("app.desktop.Module")

app.modules.config.ModuleConfigForm = function(cfg){
	this.serviceId = "configuration"
	app.modules.config.ModuleConfigForm.superclass.constructor.apply(this,[cfg])
}

Ext.extend(app.modules.config.ModuleConfigForm, app.desktop.Module, {
	initPanel:function(){
		var form = new Ext.FormPanel({
			tbar:[{
				text:"保存",
				iconCls:"save",
				handler:this.doSave,
				scope:this
			}],
			bodyStyle:"padding:5px",
			labelWidth:this.labelWidth || 80,
			border:false,
			frame: true,
			autoWidth:true,
			defaultType: 'textfield',
			defaults:{
				anchor: "100%"
			},
			shadow:true,
			items:[{
				fieldLabel:"模块标识",
				name:"id",
				allowBlank:false
			},{
				fieldLabel:"模块名称",
				name:"title",
				allowBlank:false
			},{
				fieldLabel:"运行脚本",
				name:"script"
			},{
				fieldLabel:"图标样式",
				name:"iconClz"
			},this.createEditPanel(),
			this.createEditPanel_a()]
		})
		this.form = form
		return form
	},
	doSave:function(){
		if(this.saving){
			return
		}
		var form = this.form.getForm()
		if(!form.isValid()){
			return
		}
		if(!this.data){
			this.data = {}
		}
		this.data["op"] = this.op
		this.data["parentId"] = this.parentNode.id
		this.data["id"] = form.findField("id").getValue()
		this.data["title"] = form.findField("title").getValue()
		this.data["script"] = form.findField("script").getValue()
		this.data["iconClz"] = form.findField("iconClz").getValue()
		var args = []
		var actions = []
		var st1 = this.propPanel.getStore()
		var st2 = this.actionPanel.getStore()
		for(var i=0;i<st1.getCount();i++){
			var r = st1.getAt(i)
			if(!r.data["name"]){
				continue;
			}
			args.push(r.data)
		}
		for(var i=0;i<st2.getCount();i++){
			var r = st2.getAt(i)
			if(!r.data["id"]){
				continue;
			}
			actions.push(r.data)
		}
		this.data["args"] = args
		this.data["actions"] = actions
		this.saving = true
		this.form.el.mask("在正保存数据...","x-mask-loading")
		util.rmi.jsonRequest({
				serviceId:"configuration",
				className:"ApplicationConfig",
				operate:"saveModule",
				body:this.data
			},
			function(code,msg,json){
				this.form.el.unmask()
				this.saving = false
				if(code < 300){
					form.findField("id").disable()
					this.fireEvent("save",this.op,this.data)
					this.op = "update"
					this.form.setTitle(this.data["title"])
				}else{
					this.processReturnMsg(code,msg,this.doSave)
				}
			},
			this)
	},
	initFormData:function(node){
		this.doNew()
		var f = this.form.getForm()
		var fid = f.findField("id")
		fid.disable()
		fid.setValue(node.id)
		f.findField("title").setValue(node.text)
		f.findField("script").setValue(node.attributes.script)
		f.findField("iconClz").setValue(node.attributes.iconClz)
		util.rmi.jsonRequest({
				serviceId:this.serviceId,
				className:"ApplicationConfig",
				operate:"loadArgsAndActions",
				pkey:node.id
			},function(code,msg,json){
				if(code<300){
					var body = json.body
					if(body){
						var args = body.args
						if(args){
							for(var id in args){
								this.addRecord(id,args[id])
							}
						}
						var actions = body.actions
						if(actions){
							for(var id in actions){
								this.addRecord_a(id,actions[id][0],actions[id][1])
							}
						}
					}
				}else{
					this.processReturnMsg(code,msg,this.initFormData,[node])
				}
			},this)
	},
	doNew:function(){
		this.op = "create"
		var f = this.form.getForm()
		var fid = f.findField("id")
		fid.enable()
		f.reset()
		this.propPanel.getStore().removeAll()
		this.actionPanel.getStore().removeAll()
	},
	createEditPanel:function(){
		var propPanel = new Ext.grid.EditorGridPanel({
			title:'模块初始化参数',
			tbar:[
				{text:"增加",handler:this.addRecord,scope:this,iconCls:"add"},
				{text:"删除",handler:this.removeRecord,scope:this,iconCls:"remove"}
			],
			height: 180,
			width: 350,
			clicksToEdit : 1,
			autoExpandColumn:1,
			cm : new Ext.grid.ColumnModel([{
			  	header : "名称",
				dataIndex : "name",
				width:200,
				editor : new Ext.form.TextField()
			},{
			   	header : "值",
				dataIndex : "text",
				width:400,
				editor : new Ext.form.TextField()
			}]),
			store:new Ext.data.JsonStore({
			   	data:{},
			   	fields:["name","text"]
			})
		})
		this.propPanel = propPanel
		propPanel.on("contextmenu",this.onCellContextMenu,this)
		return propPanel
	},
	onCellContextMenu:function(e){
		e.stopEvent()
		var ep = this.propPanel
		var cmenu = this.midiMenus['module_args']
		if(!cmenu){
			var items = [{
				text:"增加参数",
				iconCls:"add",
				handler:this.addRecord,
				scope:this
			},{
				text:"删除参数",
				iconCls:"remove",
				handler:this.removeRecord,
				scope:this
			}];
			cmenu = new Ext.menu.Menu({items:items})
			this.midiMenus['module_args'] = cmenu
		}
		cmenu.showAt([e.getPageX(),e.getPageY()])
	},
	addRecord:function(key,value){
		key = typeof(key)!="object"?key:""
		value = typeof(value)!="object"?value:""
		var ep = this.propPanel
		var record = Ext.data.Record.create([
			{name:"name"},
			{name:"text"}
		])
		ep.getStore()	.add(new record({name:key,text:value}))
		var count = ep.getStore().getCount()
		ep.getSelectionModel().select(count-1,0)
	},
	removeRecord:function(){
		var ep = this.propPanel
		var cell = ep.getSelectionModel().getSelectedCell()
		if(cell){
			var row = cell[0]
			var r = ep.getStore().getAt(row)
			ep.getStore().remove(r)
		}
	},
	createEditPanel_a:function(){
		var actionPanel = new Ext.grid.EditorGridPanel({
			title:'动作事件',
			tbar:[
				{text:"增加",handler:this.addRecord_a,scope:this,iconCls:"add"},
				{text:"删除",handler:this.removeRecord_a,scope:this,iconCls:"remove"}
			],
			height: 180,
			width: 350,
			clicksToEdit : 1,
			autoExpandColumn:2,
			cm : new Ext.grid.ColumnModel([{
			  	header : "标识",
				dataIndex : "id",
				width:200,
				editor : new Ext.form.TextField()
			},{
			   	header : "名称",
				dataIndex : "name",
				width:300,
				editor : new Ext.form.TextField()
			},{
			   	header : "图标",
				dataIndex : "iconCls",
				width:400,
				editor : new Ext.form.TextField()
			}]),
			store:new Ext.data.JsonStore({
			   	data:{},
			   	fields:["id","name","iconCls"]
			})
		})
		this.actionPanel = actionPanel
		actionPanel.on("contextmenu",this.onCellContextMenu_a,this)
		return actionPanel
	},
	onCellContextMenu_a:function(e){
		e.stopEvent()
		var ep = this.actionPanel
		var cmenu = this.midiMenus['module_actions']
		if(!cmenu){
			var items = [{
				text:"增加参数",
				iconCls:"add",
				handler:this.addRecord_a,
				scope:this
			},{
				text:"删除参数",
				iconCls:"remove",
				handler:this.removeRecord_a,
				scope:this
			}];
			cmenu = new Ext.menu.Menu({items:items})
			this.midiMenus['module_actions'] = cmenu
		}
		cmenu.showAt([e.getPageX(),e.getPageY()])
	},
	addRecord_a:function(key,value,icon){
		key = typeof(key)!="object"?key:""
		value = typeof(value)!="object"?value:""
		icon = typeof(icon)!="object"?icon:""
		var ep = this.actionPanel
		var record = Ext.data.Record.create([
			{name:"id"},
			{name:"name"},
			{name:"iconCls"}
		])
		ep.getStore()	.add(new record({id:key,name:value,iconCls:icon}))
		var count = ep.getStore().getCount()
		ep.getSelectionModel().select(count-1,0)
	},
	removeRecord_a:function(){
		var ep = this.actionPanel
		var cell = ep.getSelectionModel().getSelectedCell()
		if(cell){
			var row = cell[0]
			var r = ep.getStore().getAt(row)
			ep.getStore().remove(r)
		}
	}
})