$package("app.modules.config.appConfig")

$import("app.desktop.Module","util.rmi.miniJsonRequestSync")

app.modules.config.appConfig.AppForm = function(cfg){
	cfg.width = 300
	this.serviceId = "appConfig"
	this.moduleCls = "app.modules.config.appConfig.ModuleConfigForm"
	this.moduleData = []
	this.pModules = {}
	this.appIcon = "fold"
	app.modules.config.appConfig.AppForm.superclass.constructor.apply(this,[cfg])
}

Ext.extend(app.modules.config.appConfig.AppForm, app.desktop.Module,{
	initPanel:function(){
		var type = util.dictionary.SimpleDicFactory.createDic({id:'appType',width:250,editable:false})
		type.name = "type"
		type.fieldLabel = "类型"
		
		var form = new Ext.FormPanel({
			tbar:[{text:"保存",iconCls:"save",handler:this.doSave,scope:this}],
			bodyStyle:"padding:10px",
			labelWidth:this.labelWidth || 60,
			border:false,
			frame: true,
			autoWidth:true,
			defaultType: 'textfield',
			defaults:{
				anchor: "95%"
			},
			shadow:true,
			items:[{
				fieldLabel:"标识",
				name:"id",
				allowBlank:false,
				regex:/(^[\S]+$)/,
				regexText:"标识不能包含空值"
			},{
				fieldLabel:"名称",
				name:"title",
				allowBlank:false,
				regex:/(^\S+)/
			},type]
		})
		this.form = form
		return form
	},
	
	doNew:function(){
		this.op = "create"
		var f = this.form.getForm()
		var fid = f.findField("id")
		fid.enable()
		f.reset()
	},
	
	initFormData:function(data){
		this.op = "update"
	    var form = this.form.getForm()
		var fid = form.findField("id")
		fid.disable()
		fid.setValue(data.id)
		form.findField("title").setValue(data.title)
		form.findField("type").setValue(data.type)
		this.target = data.target
	},
	
	doSave:function(){
	    var form = this.form.getForm()
		if(!form.isValid()){
			return
		}
		var values = {}
		values['id'] = form.findField("id").getValue()
		values['title'] = form.findField("title").getValue()
		values['type'] = form.findField("type").getValue()
		var ptag = this.parentData.target
		if(ptag == "app"){
		    values['target'] = "catalog"
		    values['parentId'] = this.parentData.id
		}else{
		    values['target'] = "app"		
		}
		values['iconCls'] = this.appIcon
		this.saveToServer(values)
	},
	
	saveToServer:function(saveData){
		this.saving = true
		this.form.el.mask("在正保存数据...","x-mask-loading")
		saveData['op'] = this.op
		util.rmi.jsonRequest({
				serviceId:this.serviceId,
				cmd:"saveApp",
				domain:this.domain,
				body:saveData
			},
			function(code,msg,json){
				this.form.el.unmask()
				this.saving = false
				if(code > 300){
					this.processReturnMsg(code,msg,this.saveToServer,[saveData]);
					return
				}
				if(json.body){
					this.win.hide()
					this.form.setTitle(saveData.title)
					this.fireEvent("save",this.op,saveData)
				}
				this.op = "update"
			},
			this)
	},
	
	getWin: function(){
		var win = this.win
		if(!win){
			win = new Ext.Window({
				id: this.id,
		        title: this.title,
		        width: 550,
		        height:200,
		        iconCls: 'icon-form',
		        shim:true,
		        layout:"fit",
		        animCollapse:true,
		        items:this.initPanel(),
		        closeAction:'hide',
		        //maximizable: true,
		        constrain:true,
		        shadow:false,
		        modal:true
            })
		    var renderToEl = this.getRenderToEl()
            if(renderToEl){
            	win.render(renderToEl)
            }
			this.win = win
		}
		return win;
	}
})