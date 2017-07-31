$package("app.modules.config.appConfig")

$import("app.desktop.Module","util.rmi.miniJsonRequestSync")
$styleSheet("app.desktop.animated")

app.modules.config.appConfig.AppConfigForm = function(cfg){
	cfg.width = 300
	this.serviceId = "appConfig"
	this.moduleCls = "app.modules.config.appConfig.ModuleConfigForm"
	this.moduleData = []
	this.pModules = {}
	app.modules.config.appConfig.AppConfigForm.superclass.constructor.apply(this,[cfg])
}

Ext.extend(app.modules.config.appConfig.AppConfigForm, app.desktop.Module,{
	
     initPanel:function(){
     	var panel = this.createDataViewPanel()
     	this.panel = panel
		var form = new Ext.FormPanel({
			tbar:[{text:"保存",iconCls:"save",handler:this.doSave,scope:this}],
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
				fieldLabel:"标识",
				name:"id",
				allowBlank:false,
				regex:/(^[\S][\S]*[\S]$)/,
				regexText:"标识不能包含空值"
			},{
				fieldLabel:"名称",
				name:"title",
				allowBlank:false
			},{
				fieldLabel:"类型",
				name:"type"
			},panel]
		})
		this.form = form
		return form
	},
	
	getIconTpl:function(){
    	var tpl = this.iconTpl
    	if(!tpl){
    		tpl = new Ext.XTemplate(
              '<ul>',
                 '<tpl for=".">',
                     '<li class="phone" id="_appconfig_icon_{id}">',
                         '<dt class="x-appindex-{id}"></dt>',
                         '<strong>{title}</strong>',
                         '<span>{id}</span>',
                     '</li>',
                 '</tpl>',
              '</ul>'
             
            )
			this.iconTpl = tpl;
    	}
    	return tpl;
	},
	
	createDataViewPanel:function(){
	    var store = new Ext.data.Store({
	        reader: new Ext.data.JsonReader({},["id",'title','script','type','iconCls','parentId']),
	        data:[]
	    })		
		var dataview = new Ext.DataView({
           store: store,
           tpl:this.getIconTpl(),
		   cls :'phones',       
           itemSelector: 'li.phone',
           overClass   : 'phone-hover',
           singleSelect: true,
           autoScroll  : true
        })
        this.dataview = dataview
     	
     	var panel = new Ext.Panel({
     	    title:'模块列表',
     	    tbar:[{text:'新建',iconCls:'save',handler:this.doModuleSave,scope:this},'-',
     	          {text:'修改',iconCls:'update',handler:this.doModuleUpdate,scope:this},'-',
     	          {text:'删除',iconCls:'remove',handler:this.doModuleRemove,scope:this}
     	    ],
     	    items: dataview
     	})
     	return panel
	},
	
	initCssClass:function(id, cls){
		if(!cls){
			cls = id
		}
		var cssSelector =  ".x-appindex-" + id;
		if(!util.CSSHelper.hasRule(cssSelector)){
			var home = ClassLoader.stylesheetHome
			util.CSSHelper.createRule(cssSelector,"height:64px; background:url(" + home + 
			      "app/desktop/images/icons/" + cls + ".gif) no-repeat center;")
		}			
	},
	
	updateCssClass:function(id,cls){
	   if(!cls){
			cls = id
		}
		var cssSelector =  ".x-appindex-" + id;
		if(util.CSSHelper.hasRule(cssSelector)){
			var home = ClassLoader.stylesheetHome
			var value = "url(" + home + "app/desktop/images/icons/" + cls + ".gif) no-repeat scroll center transparent"
			util.CSSHelper.updateRule(cssSelector,'background',value)
		}
	},
	
	doNew:function(){
		this.op = "create"
		var f = this.form.getForm()
		var fid = f.findField("id")
		fid.enable()
		f.reset()
		this.panel.hide()
	},
	
	initFormData:function(data){
		this.appId = data.id
		var form = this.form.getForm()
		var fid = form.findField("id")
		fid.disable()
		fid.setValue(data.id)
		form.findField("title").setValue(data.title)
		form.findField("type").setValue(data.type)
		
		if(this.isApp && data.type != 'index'){
		   this.panel.hide()
		}else{
		   var appId = data.id	   
	       var d = this.getModulesData(appId)
	       if(d){
	           this.dataview.getStore().loadData(d)
	       }
		   this.panel.show()		   
		}
	},
	
	doSave:function(){
		var target = "app"
	    var form = this.form.getForm()
		if(!form.isValid()){
			return
		}
		var values = {}
		values['id'] = form.findField("id").getValue()
		values['title'] = form.findField("title").getValue()
		values['type'] = form.findField("type").getValue()
		if(!this.isApp){
		    target = "catalog"
		    values['parentId'] = this.appId
		}
		values['target'] = target
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
					this.initFormData(json.body)
					this.form.setTitle(saveData.title)
					this.fireEvent("save",this.op,saveData)
				}
				this.op = "update"
			},
			this)
	},
	
	doModuleSave:function(){
	    this.showModuleForm()
	},
	
	doModuleUpdate:function(){
		var views = this.dataview.getSelectedRecords()
		var data = views[0].data
		this.showModuleForm(data)	    
	},
	
	doModuleRemove:function(){
		var views = this.dataview.getSelectedRecords()
		var data = views[0].data
		if(data == null){
		   return
		}
		Ext.Msg.show({
		   title: '确认删除记录[' + data.title + ']',
		   msg: '删除操作将无法恢复，是否继续?',
		   modal:true,
		   width: 300,
		   buttons: Ext.MessageBox.OKCANCEL,
		   multiline: false,
		   fn: function(btn, text){
		   	 if(btn == "ok"){
		   	 	this.processRemove(data);
		   	 }
		   },
		   scope:this
		})	
	},
	
	processRemove:function(data){
		var target = "module"
		util.rmi.jsonRequest({
				serviceId:this.serviceId,
				cmd:"remove",
				domain:this.domain,
				body:{
					target:target,
					id:data.id
				}
			},
			function(code,msg,json){
				if(code > 300){
					this.processReturnMsg(code,msg,this.processRemove,[data])
					return;
				}
				if(this.moduleData){
			        var n = this.moduleData.length
			        for(var i=0; i<n; i++){
			           var m = this.moduleData[i]
			           if(data.id == m.id){
			              this.moduleData.remove(m)
			              break
			           }
			        }
			        this.dataview.getStore().loadData(this.moduleData)
		        }				
			},
			this)
	},
	
	getModulesData:function(id){
	    var re = util.rmi.miniJsonRequestSync({
			  serviceId:this.serviceId,
			  cmd:"loadAllModules",
			  domain:this.domain,
			  id:id
		})
		if(re.code < 300){
			var data = re.json.body
			for(var i = 0; i < data.length;i ++){
				var module = data[i]
				if(module.icon != "default"){
					this.initCssClass(module.id, module.iconCls)
				}		
			}
			this.moduleData = data			
			return data
		}
	},
	
	showModuleForm:function(data){
		var title = data?data.title:"新建模块"
		var m = this.pModules["_moduleform_"]
		if(!m){
			var cfg = {
				title:title
			}
			var cls = this.moduleCls
			$import(cls)
			m = eval("new " + cls + "(cfg)")
			m.setMainApp(this.mainApp)
			m.opener = this
			m.on("save",this.onSaveModule,this)
			this.pModules["_moduleform_"] = m
		}
		m.title = title
		m.parentId = this.appId
		m.domain = this.domain
		this.openWin(data,100,50)
		return m
	},
	
	openWin:function(data,xy){
		var module = this.pModules["_moduleform_"]
		if(module){
			module.op = data?"update":"create"
			var win = module.getWin()
			if(xy){
				win.setPosition(xy[0],xy[1])
			}
			win.setTitle(module.title)
			win.show()
			if(!win.hidden){
				switch(module.op){
					case "create":
						module.doNew()
						break;
					case "update":
						module.initFormData(data)
				}
			}
		}
	},
	
	onSaveModule:function(op,data){
		var d = {}
		var arry = ['id','title','script','type','iconCls']
		for(var i=0; i<arry.length; i++){
		    d[arry[i]] = data[arry[i]]
		}
		var v = this.moduleData
		if(op == "create"){
			this.initCssClass(d.id,d.iconCls)
			this.moduleData.push(d)
		   
		}else{
		   var n = this.moduleData.length
		   for(var i=0; i<n; i++){
			  var m = this.moduleData[i]
			  if(d.id == m.id){
			      Ext.apply(m,d)
			      this.updateCssClass(m.id,m.iconCls)
			      break
			  }
		   }
		}
	    this.dataview.getStore().loadData(this.moduleData)
	},
	
	setfieldLabel:function(){
		var form = this.form.getForm()
		var fid = form.findField("id")
		var ftitle = form.findField("title")
		var ftype = form.findField("type")
		var typeLabel = ftype.getEl().parent().parent().first()
		typeLabel.dom.innerHTML = ""
		
	}
})