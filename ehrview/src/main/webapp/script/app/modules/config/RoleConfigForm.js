$package("app.modules.config")

$import("app.desktop.Module",
		"util.dictionary.TreeCheckDicFactory",
		"util.dictionary.LovComboDicFactory",
		"util.rmi.jsonRequest",
		"app.modules.common",
		"util.rmi.miniJsonRequestSync",
		"util.multiSelect.ItemSelector"
		)
app.modules.config.RoleConfigForm = function(cfg){
	this.autoLoadSchema = true
	this.entryName = "RoleConfig"
	this.serviceId="roleConfig"
	this.subWindows = {}
	Ext.apply(this,app.modules.common)
	app.modules.config.RoleConfigForm.superclass.constructor.apply(this,[cfg])
}

Ext.extend(app.modules.config.RoleConfigForm,app.desktop.Module,{
	
	initPanel:function(){
		var baseFS = new Ext.form.FieldSet({
			title:"基本信息",
			defaultType:"textfield",
			collapsible:true,
			animCollapse:true,
			autoHeight:true,
			width:800,
			items:[{
				fieldLabel:"角色编号",
				value:this.initDataId,
				width:450,
				allowBlank:false,
				blankText:"此项不能为空！",
				regex:/(^\S+)/,
				name:"id"
			},{
				fieldLabel:"中文名称",
				value:this.title=="新建角色"?"":this.title,
				allowBlank:false,
				regex:/(^\S+)/,
				width:450,
				name:"name"
			}]
		})
		
		var appId = "applist"
		if(this.domain && this.domain != globalDomain){
		    appId = this.domain + "." + appId
		}
		var apps1 = util.dictionary.TreeDicFactory.createTree({id:appId,rootVisible:false})
		var apps2 = new Ext.tree.TreePanel({
    		loader:new Ext.tree.TreeLoader(),
    		rootVisible:false
    	})
    	apps2.setRootNode({id:'root'})
		this.apps1 = apps1
		this.apps2 = apps2
		
		var appsFS = new Ext.form.FieldSet({
			title:"菜单权限",
			defaultType:"textfield",
			collapsible:true,
			animCollapse:true,
			autoHeight:true,
			width:800,
			items:[{
            	   xtype: 'itemselector',
            	   name: 'itemselector',
            	   fieldLabel: '菜单选择',
            	   items: [{
                	 width: 250,
                	 height: 300,
                	 store: apps1,
                	 iconCls:"add-button",
                	 flag: 'tree'
            	   },{
               	 	 width: 250,
                	 height: 300,
                	 store: apps2,
                	 iconCls:"remove-button",
                	 flag: 'tree'
            	   }]
        		}
			]
		})
		this.appsFS = appsFS
		var tbar = this.initBars()
  	
		var panel = new Ext.FormPanel({
			frame:true,
			labelWidth:100,
//			labelAlign:"left",
			bodyStyle:"padding:10px",
			tbar:tbar,
			items:[baseFS,appsFS]
		})
		this.panel = panel				
		return panel
	},
	
	doSave:function(){
		var panel = this.panel
		var baseFS = panel.items.itemAt(0)
		var id = baseFS.items.itemAt(0).getValue()
		var name=baseFS.items.itemAt(1).getValue()
		if(id == ""){
			baseFS.items.itemAt(0).isValid()
			return;
		}
		if(name==""){
			baseFS.items.itemAt(1).isValid()
			return;
		}
		var values = {}
		values["id"] = id
			
		values["name"] = baseFS.items.itemAt(1).getValue()
		if(this.parent){
			values["parent"] = this.parent
		}
		
		values["apps"] = this.appsFS.items.item(0).getValue()
		this.saveToServer(values)
		
	},

	doNew:function(){
		this.op = "create"
		this.initDataId = ""
		this.panel.items.itemAt(0).items.itemAt(0).setDisabled(false)
		this.panel.items.itemAt(0).items.itemAt(0).setValue("")
		this.panel.items.itemAt(0).items.itemAt(1).setValue("")
	},
	
	loadData:function(){	
		//this.doNew()
		if(!this.initDataId){
			return
		}
		this.initLoad(this.initDataId)
	},
	initLoad:function(pkey){
		if(this.panel && this.panel.el){
			this.panel.el.mask("正在保存数据...","x-mask-loading")
		}
		var data={}
		data['pkey']=pkey
		util.rmi.jsonRequest({
				serviceId:this.serviceId,
				cmd:"loadById",
				domain:this.domain,
				module:this._mId,  //增加module的id
				body:data
			},
			function(code,msg,json){
				if(this.panel && this.panel.el){
					this.panel.el.unmask()
				}
				if(code > 300){
					this.processReturnMsg(code,msg,this.initLoad,[pkey])
					return
				}
				if(json.body){
					this.op = "loadById"
					this.initFormData(json.body)
				}
				if(this.op == 'create'){
					this.op = "update"
				}
			},
			this)//jsonRequest
	},
	initFormData:function(data){ //显示数据到combox
		for(var id in data){
			var v = data[id]
			if(id == "apps"){
				if(this.op == "loadById"){
					this.op = "update"
					this.appsFS.items.item(0).setValue(v)
				}
				continue
			}
		}
		var idf = this.panel.items.itemAt(0).items.itemAt(0)
		if(idf){
		    idf.setDisabled(true)
		    this.initDataId = idf.getValue()		    
		}
		var idt = this.panel.items.itemAt(0).items.itemAt(1)
		if(idt){
		    this.panel.setTitle(idt.getValue())
		}
	},
	
	doRemote:function(){
		this.serviceId = "testConfig"
		this.saveToServer()
	},
	
	saveToServer:function(saveData){
	
		if(!this.fireEvent("beforeSave",this.entryName,this.op,saveData)){
			return;
		}
		if(this.initDataId == null){
			this.op = "create";
		}
		this.saving = true
		this.panel.el.mask("正在保存数据...","x-mask-loading")
		util.rmi.jsonRequest({
				serviceId:this.serviceId,
				cmd:this.op,
				domain:this.domain,
				body:saveData,
				isValid:false,
				module:this._mId  //增加module的id
			},
			function(code,msg,json){
				this.panel.el.unmask()
				this.saving = false
				if(code > 300){
					this.processReturnMsg(code,msg,this.saveToServer,[saveData]);
					return
				}
				if(json.body){
					this.initFormData(json.body)
					this.fireEvent("save",json.body,this.op)
				}
				this.op = "update"
			},
			this)//jsonRequest
	},
		
	initBars:function(){
		var tbar = []
	    var actions = this.actions
	    if(actions){
	       	var n = actions.length;
		    for(var i = 0; i < n; i ++){
			   var action = actions[i];
			   if(action.id == "create" || action.id == "update"){
			      var button = {
			         text: "保存",
			         name: action.id,
			         iconCls: action.iconCls || action.id,
			         handler: this.doSave,
			         scope:this
			      }
			      tbar.push(button)
			      break
			   }
		    }		    
	    }
	    return tbar
	}
})