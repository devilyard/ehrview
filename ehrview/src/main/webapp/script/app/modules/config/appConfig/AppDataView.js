$package("app.modules.config.appConfig")

$import("app.desktop.Module","util.rmi.miniJsonRequestSync")
$styleSheet("app.desktop.animated")

app.modules.config.appConfig.AppDataView = function(cfg){
	cfg.width = 300
	this.serviceId = "appConfig"
	this.moduleCls = "app.modules.config.appConfig.ModuleConfigForm"
	this.appCls = "app.modules.config.appConfig.AppForm"
	this.moduleData = []
	this.pModules = {}
	this.appIcon = "fold"
	this.pfix = ".gif"
	Ext.apply(this,app.modules.common)
	app.modules.config.appConfig.AppDataView.superclass.constructor.apply(this,[cfg])
}
Ext.extend(app.modules.config.appConfig.AppDataView, app.desktop.Module,{

	initPanel:function(){
	    var store = new Ext.data.Store({
	        reader: new Ext.data.JsonReader({},["id",'title','script','type','iconCls','target']),
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
        dataview.on("dblclick",this.onDblClick,this)
        this.dataview = dataview
     	
     	var panel = new Ext.Panel({
     	    title:'模块列表',
     	    tbar:[{text:'新建',iconCls:'add',handler:this.doModuleSave,scope:this},'-',
     	          {text:'修改',iconCls:'update',handler:this.doModuleUpdate,scope:this},'-',
     	          {text:'删除',iconCls:'remove',handler:this.doModuleRemove,scope:this}
     	    ],
     	    items: dataview
     	})
     	this.panel = panel
     	return panel
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
	
	initFormData:function(data){
		this.parentData = {}
		Ext.apply(this.parentData,data)
		var cmd = "loadAllModules"
		var id = data.id
		var target = data.target
		var d = []
		var type = data.type
		if(typeof data.type == "object"){
		    type = data.type.key
		}
		if(target == "catalog" || type == 'index'){			
		    d = this.getModulesData(id)
		}else{
		    d = this.getAppsData(id,target)
		}
		this.dataview.getStore().loadData(d)		
		
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
			this.viewData = data			
			return data
		}
	},
	
	getAppsData:function(id,target){
	    var re = util.rmi.miniJsonRequestSync({
			  serviceId:this.serviceId,
			  cmd:"loadApps",
			  domain:this.domain,
			  id:id,
			  target:target
		})
		if(re.code < 300){
			var data = re.json.body
			for(var i = 0; i < data.length;i ++){
				var app = data[i]
				var icon = app.iconCls || this.appIcon
				this.initCssClass(app.id, icon)	
			}
			this.viewData = data			
			return data
		}
	},
	
	onDblClick:function(view,index,node,e){
		var data = view.store.getAt(index).data
		var tag = data.target
		if(tag == "module"){
		    return
		}
		this.initFormData(data)
		this.panel.setTitle(data.title)
		this.fireEvent("selectNode",data)		
	},
	
	doModuleSave:function(){
		var cmd = "_appform_"
		var cls = this.appCls
		var tag = this.parentData.target
		if(tag == "catalog" || this.parentData.type == 'index'){
		    cmd = "_moduleform_"
		    cls = this.moduleCls
		}
	    this.showModuleForm("",cls,cmd)
	},
	
	doModuleUpdate:function(){
		var cmd = "_moduleform_"
		var cls = this.moduleCls
		var views = this.dataview.getSelectedRecords()
		var data = views[0].data
		var tag = data.target
		if(tag != "module"){
		    cmd = "_appform_"
		    cls = this.appCls
		}
		this.showModuleForm(data,cls,cmd)	    
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

	showModuleForm:function(data,cls,cmd){
		var title = data?data.title:"新建模块"
		var m = this.pModules[cmd]
		if(!m){
			var cfg = {
				title:title
			}
			$import(cls)
			m = eval("new " + cls + "(cfg)")
			m.setMainApp(this.mainApp)
			m.opener = this
			m.on("save",this.onSaveModule,this)
			this.pModules[cmd] = m
		}
		m.title = title
		m.parentData = this.parentData
		m.domain = this.domain
		this.openWin(data,cmd,100,50)
		return m
	},
	
	openWin:function(data,cmd,xy){
		var module = this.pModules[cmd]
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
		var arry = ['id','title','script','type','iconCls','target']
		for(var i=0; i<arry.length; i++){
		    d[arry[i]] = data[arry[i]]
		}
		if(op == "create"){
			this.initCssClass(d.id,d.iconCls)
			this.viewData.push(d)
		   
		}else{
		   var n = this.viewData.length
		   for(var i=0; i<n; i++){
			  var m = this.viewData[i]
			  if(d.id == m.id){
			      Ext.apply(m,d)
			      this.updateCssClass(m.id,d.iconCls)
			      break
			  }
		   }
		}
	    this.dataview.getStore().loadData(this.viewData)
	    var tag = d.target
		if(tag != "module"){
			this.fireEvent("save",op,data)
		}
	},
	
	processRemove:function(data){
		util.rmi.jsonRequest({
				serviceId:this.serviceId,
				cmd:"remove",
				domain:this.domain,
				body:{
					target:data.target,
					id:data.id
				}
			},
			function(code,msg,json){
				if(code > 300){
					this.processReturnMsg(code,msg,this.processRemove,[data])
					return;
				}
				if(this.viewData){
			        var n = this.viewData.length
			        for(var i=0; i<n; i++){
			           var m = this.viewData[i]
			           if(data.id == m.id){
			              this.viewData.remove(m)
			              break
			           }
			        }
			        this.dataview.getStore().loadData(this.viewData)
			        if(data.target != "module"){
			           this.fireEvent("remove",data)
		            }
		        }				
			},this)
	},
	
	initCssClass:function(id, cls){
		if(!cls){
			cls = id
		}
		var cssSelector =  ".x-appindex-" + id;
		if(!util.CSSHelper.hasRule(cssSelector)){
			var home = ClassLoader.stylesheetHome
			util.CSSHelper.createRule(cssSelector,"height:64px; background:url(" + home + 
			      "app/desktop/images/icons/" + cls + this.pfix + ") no-repeat center;")
		}			
	},
	
	updateCssClass:function(id,cls){
	   if(!cls){
			cls = id
		}
		var cssSelector =  ".x-appindex-" + id;
		if(util.CSSHelper.hasRule(cssSelector)){
			var home = ClassLoader.stylesheetHome
			var value = "url(" + home + "app/desktop/images/icons/" + cls + this.pfix + ") no-repeat scroll center transparent"
			util.CSSHelper.updateRule(cssSelector,'background',value)
		}
	}
})