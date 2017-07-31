$package("app.modules.config.unit")

$import("app.desktop.Module",
		"org.ext.ux.TabCloseMenu",
		"app.modules.common",
		"app.modules.form.SimpleFormView",
		"util.dictionary.TreeDicFactory")

app.modules.config.unit.ManageUnitForm = function(cfg){
	this.width = 700
	this.height = 520
	this.formCls = "app.modules.form.TableFormView"	
	this.autoLoadSchema = true
	this.activeModules = {}
	this.midiMenus = {}
	this.pModules={}
	this.cfgCls = [
	       {id:'highLevel',script:'app.modules.config.unit.ManageUnitQuery',title:'上级部门',entryName:'SYS_Organization'},
	       {id:'lowerLevel',script:'app.modules.config.unit.ManageUnitQuery',title:'下级部门',entryName:'SYS_Organization'},
	       {id:'office',script:'app.modules.list.SimpleListView',title:'包含科室',entryName:'SYS_Office'}
	]
	cfg.saveServiceId = "organizationService"
	Ext.apply(this,app.modules.common)
	app.modules.config.unit.ManageUnitForm.superclass.constructor.apply(this,[cfg])
}

Ext.extend(app.modules.config.unit.ManageUnitForm, app.modules.form.SimpleFormView, {
	
	initPanel : function() {	
		if(this.panel){
		   return this.panel
		}
  //避免session失效后 出现异常
        var tabPanel = this.createTabPanel()

		var panel = new Ext.Panel({
		    height : this.height,//520,
		    width: this.width,//700,
		    frame : true,
			layout : "border",
			tbar:[
		    	{text:'保存',iconCls:'save',handler:this.doSave,scope:this},'-',
		    	{text:'取消',iconCls:"common_cancel",handler:this.doCancel,scope:this},'-',
		    	{text:'新建',iconCls:'add',handler:this.doNew,scope:this}
		    ],
			items:[
			   { layout:'fit',
			     region:'north',
			     //frame : true,
			     autoHeight:true,
			     items:[this.getForm()]
			   },{ 
			     layout:'fit',
			     region:'center',
			     items:[tabPanel]
			   }
			]
		})
		this.panel = panel	

		return this.panel;

	},
	
	getForm : function() {		
		var cls = this.formCls
		var cfg = {}
		cfg.entryName = this.entryName
		cfg.saveServiceId = this.saveServiceId
		cfg.autoLoadSchema = false
		cfg.autoLoadData = false;
		cfg.isCombined = true
		//cfg.labelWidth = 60
	    cfg.actions = [] 
	    var p = this.midiModules["formss"]
	    if(!p){
			$import(cls)
			var module = eval("new " + cls + "(cfg)");			
			module.setMainApp(this.mainApp)
			this.formModule = module
			p = module.initPanel()
	    }
	    this.schema = this.formModule.schema
		this.form = p
		return this.form;
	},
	
	createTabPanel : function() {
		var items = []
		this.tableItems = []
		var tab = new Ext.TabPanel({
			region : "center",
			enableTabScroll : true,
			defaults : {
				autoScroll : true
			},
			layoutOnTabChange : true,
			margins : '0 4 4 0',
			resizeTabs : true,
			tabWidth : 100,
			minTabWidth : 100,
			activeTab:0,
			plugins : new Ext.ux.TabCloseMenu(),
			items:this.getTableItems()
		})
		this.tab = tab;
		this.tab.on("tabchange",this.tabChange,this)
		return tab;
	},
	
	getTableItems : function(){
	    var cfgCls = this.cfgCls
	    var items = []
	    for(var i=0; i<cfgCls.length; i++){
	       var it = cfgCls[i]
	       var m = this.getModule(it)
	       items.push(m)	       
	    }
	    return items
	},
	
	getModule : function(it) {
		var cls = it.script
		var cfg = {
		   title: it.title,
		   entryName : it.entryName,
		   autoLoadSchema : false,
		   autoLoadData : false,
		   showButtonOnTop : true,
		   isCombined : true,
		   enableCnd : false
		   //initCnd:['eq',['$','organizCode'],['s',pid]]
		}
		var m = this.midiModules[it.id]
		if(!m){
		   $import(cls)
		   var m = eval("new " + cls + "(cfg)");
		   m.setMainApp(this.mainApp)
		   m.opener = this
		   this.midiModules[it.id] = m
		}
		var p = m.initPanel()
		p._Id = it.id
		p.setTitle(it.title)
		return  p			
	},
	
	tabChange:function(tab, panel){
	    var form = this.form.getForm()
		var v = form.findField("organizCode").getValue()
		var pv = form.findField("parentId").getValue()
		if(!v || !panel){
		   return
		}
		var cnd = null
		var id = panel._Id
		if(id == "highLevel"){
		   cnd = ['eq',['$','organizCode'],['s',pv]]
		}else if(id == "lowerLevel"){
		   cnd = ['eq',['$','parentId'],['s',v]]
		}else{
		   cnd = ['eq',['$','organizCode'],['s',v]]
		}
		var m = this.midiModules[id]
		if(m && m.refresh){
			m.requestData.cnd = cnd
			m.refresh()
		}
	},
	
	doNew:function(){
		this.op = "create"
		this.formModule.doNew.call(this)
	//选择上级部门	
		var form = this.form.getForm()		
		var f = form.findField("parentId")
		if(f && !f.hasListener("select")){
		    f.on("select",this.parentManageCheck,this)
		}
		var ff = form.findField("adminDivision")		
		var node = this.opener.node
		if(ff && node){
		    ff.setValue({key:node.attributes.key,text:node.text})
		}
		
		this.tab.disable()
		var p = this.tab.items.item(0)
		var store = p.getStore()
	    if(store.getCount() > 0){
	        store.removeAll()
	    }
	},
	
	doSave: function(){
		this.formModule.doSave.call(this)
	},
	
/*	
	saveToServer:function(saveData){
		if(!this.fireEvent("beforeSave",this.entryName,this.op,saveData)){
			return;
		}
		this.saving = true
		this.panel.el.mask("在正保存数据...","x-mask-loading")
		util.rmi.jsonRequest({
				serviceId:this.serviceId,
				//op:this.op,
				cmd:this.op,
				body:saveData
			},
			function(code,msg,json){
				this.panel.el.unmask()
				this.saving = false
				if(code > 300){
					this.processReturnMsg(code,msg,this.saveToServer,[saveData],json.body);
					return
				}
				Ext.apply(this.data,saveData);
				if(json.body){
					this.initFormData(json.body)
					this.fireEvent("save",this.entryName,this.op,json,this.data)
				}
				this.op = "update"
			},
			this)//jsonRequest
	},
	*/
	
	initFormData:function(data){
	    this.formModule.initFormData.call(this,data)
	    this.tab.enable()
	    var p = this.tab.getActiveTab()
	    this.tabChange(this.tab,p)
	    
	},
	
	doCancel:function(){
	   var win = this.getWin();
	   if(win){
	      win.hide();
	   }		
	},
	
	getWin: function(){
		var win = this.win
		if(!win){
			win = new Ext.Window({
				id:this.id,
		        title: this.title,
		        autoWidth: true,
		        autoHeight:true,
		        iconCls: 'icon-form',
		        bodyBorder:false,
		        closeAction:'hide',
		        shim:true,
		        layout:"fit",
		        plain:true,
		        autoScroll:false,
		        //minimizable: true,
		        //maximizable: true,
		        shadow:false,
		        items:this.initPanel(),
		        constrain:true,
		        modal:true		        
            })
		    win.on("show",function(){
		    	this.fireEvent("winShow")
		    },this)
		    win.on("hide",function(){
				this.fireEvent("close",this)
			},this)
			win.on("restore",function(w){		
			    this.win.doLayout()
			},this)
			
		    var renderToEl = this.getRenderToEl()
            if(renderToEl){
            	win.render(renderToEl)
            }
			this.win = win
		}
		return win;
	},

	onClose:function(panel){
		var id = panel._Id
		this.pModules[id].destory()
		delete this.activeModules[id]
		delete this.pModules[id]	
	},
		
	parentManageCheck:function(com,record,index){
		var id = com.getValue();
		var parentNodeId = record.attributes.parent
	    var form = this.form.getForm()
		var f = form.findField("organizCode")
		if(f){
		   var codeId = f.getValue()
		   if(codeId == id){
		   	   Ext.Msg.alert("错误","不能选择自己部门")
		   	   com.clearValue()
		   }
		   this.checkParentNode(record,codeId,com)
		}
	},
	checkParentNode:function(node,codeId,com){
		 var parent = node.parentNode
		 if(parent){
		   	if(parent.id==codeId){
		   		Ext.Msg.alert("错误","不能选择是本科室的下级科室")
		   	   	com.clearValue()
		   	}else{
		   		this.checkParentNode(parent,codeId,com)	
		   	}
		 }
	}
})