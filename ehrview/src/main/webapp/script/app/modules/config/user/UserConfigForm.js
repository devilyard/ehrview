$package("app.modules.config.user")

$import(
       "util.dictionary.TreeDicFactory",
       "util.widgets.LookUpField",
       "app.modules.form.SimpleFormView",
       "app.modules.config.ImageFieldEx"
       )

app.modules.config.user.UserConfigForm = function(cfg) {
	this.width = 600
	this.height = 400
	this.midiModules = {}
	this.data = {};
	this.loadServiceId = "simpleLoad"	
	this.formCls = "app.modules.form.TableFormView"
	this.gridCls = "app.modules.config.user.UserPropList"
	this.entryName = "SYS_USERS"
	this.gridEntryName = "SYS_UserProp"
	this.personEntryName = "SYS_Personnel"
	this.userId = "userId"
	this.personId = "personId"
	this.cardnum = "cardnum"
	cfg.saveServiceId = "userService"
	Ext.apply(this, app.modules.common)
	app.modules.config.user.UserConfigForm.superclass.constructor.apply(this, [cfg])
}
Ext.extend(app.modules.config.user.UserConfigForm, app.modules.form.SimpleFormView, {

	initPanel : function() {		
		if(this.panel){
		   return this.panel
		}
  //避免session失效后 出现异常		
		var grid = this.getProfileList()
		if(!grid){
		   return
		}
		
		var panel = new Ext.Panel({
		    height : 400,
		    width:680,
		    frame : true,
			layout : "border",
			tbar:[
		    	{text:'保存',iconCls:'save',handler:this.doSave,scope:this},'-',
		    	{text:'取消',iconCls:"common_cancel",handler:this.doCancel,scope:this}
		    ],
			items:[
			   { layout:'fit',
			     region:'north',
			     autoHeight:true,
			     items:[this.getUserForm()]
			   },{ 
			     layout:'fit',
			     title:'用户属性',
			     region:'center',
			     items:[grid]
			   }
			]
		})
		this.panel = panel	
		
		if(!this.isCombined){
			//this.addPanelToWin();
		}	
		return this.panel;

	},
	
	doNew: function(){
		this.op = "create"
		this.formModule.doNew.call(this)
		var form = this.form.getForm()
		
		var f = form.findField(this.cardnum)
	    if(f){
	    	if(!f.hasListener("lookup")){
	    	    f.on("lookup",this.doLookup,this)
	    	}	    	
	        f.enable()
	    }
	   
	//清空grid	
	    var store = this.grid.getStore()
	    if(store.getCount() > 0){
	        store.removeAll()
	    }
	    this.grid.disable()    
	},
		
	getUserForm : function() {		
		var cls = this.formCls
		var cfg = {}
		cfg.entryName = this.entryName
		cfg.autoLoadSchema = false
		cfg.autoLoadData = false;
		cfg.isCombined = true
		cfg.labelWidth = 60
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
	
	getProfileList : function() {
		var cls = this.gridCls
		var cfg = {}		
		cfg.entryName = this.gridEntryName //"SYS_UserProp"
		cfg.autoLoadSchema = false
		cfg.autoLoadData = false;
		cfg.showButtonOnTop = true
		cfg.isCombined = true
		//cfg.actions = this.actions
		var lp = this.midiModules["gridss"]
		if (!lp) {
			$import(cls)
			var module = eval("new " + cls + "(cfg)");
			module.on("change",this.doChange,this)
			module.setMainApp(this.mainApp)
			module.opener = this
			this.gridModule = module
			lp = module.initPanel()	
			//this.midiModules["gridss"] = lp
		}
		this.grid = lp
		return this.grid;
	},
	
	initFormData:function(data){
		this.isGridOperate = false
		this.initForm(data)		
		this.initGrid()	
	},
	
	initForm:function(data){
		Ext.apply(this.data,data)
		this.setPersonData(data)		
		this.initDataId = this.data[this.userId] || data[this.personId]
		if(!data[this.userId]){
		    data[this.userId] = this.initDataId
		}
		
		this.formModule.initFormData.call(this,data)
		this.grid.enable()
	},
	
	initGrid:function(){
		if(this.gridModule){
			this.gridModule.requestData.cnd = ['eq',['$','userId'],['s',this.initDataId]]
		    this.gridModule.refresh()
		}			
	},
	
	doSave:function(){
		if(this.saving){
			return
		}
		var form = this.form.getForm()
		if(!this.formModule.validate()){
			return
		}
		var ac =  util.Accredit;
		var values = {};
		var items = this.schema.items		
		Ext.apply(this.data,this.exContext)
	
		var pkey = ""
		var userId = ""
		if(items){
			var n = items.length
			for(var i = 0; i < n; i ++){
				var it = items[i]
				if(this.op == "create" && !ac.canCreate(it.acValue)){
					continue;
				}				
				var v = it.defaultValue || this.data[it.id]							
				if(v != null && typeof v == "object"){
					v = v.key
				}
				var f = form.findField(it.id)
				if(f){
					v = f.getValue()
				}
				if(it.pkey){
					pkey = it.id
					userId = v
				}
				if(v == null || v === ""){
					if((it.pkey == "true") && (it["not-null"]=="1"||it['not-null'] == "true") && !it.ref){
						Ext.Msg.alert("错误",it.alias +　"不能为空")
						return;
					}
				}
				values[it.id] = v;
			}
		}		

  //获取grid信息
		var store = this.grid.getStore()
		var n = store.getCount()
		if(n == 0){
			Ext.Msg.alert("错误", "用户属性没有数据,不允许保存");
			return
		}
		var prop = this.getGridData(pkey,userId)		
		values["prop"] = prop
		Ext.apply(this.data,values);		
		this.saveToServer(values)		
	},
	
	getGridData:function(pkey,userId){
		var prop = []				
	    if(this.op == "update" && !this.isGridOperate){ //判断用户属性表 是否有操作
		   return []
	    }
	    var store = this.grid.getStore()
	    var n = store.getCount()
		for(var i=0; i<n; i++){
		    var rr = store.getAt(i)
		    rr.data[pkey] = userId
		    prop.push(rr.data)
		}
		return prop
	},
	
/**
 * 设置SYS_Personnel的数据
 **/
	setPersonData:function(data){
		var r = this.exContext[this.entryName]
		if(r){
		   var d = r.data
		   var items = this.schema.items
		   var n = items.length
		   for(var i = 0; i < n; i ++){
		       var it = items[i]
		       if(it.ref){
		       	   var id = it.id
		           if(d[id+"_text"]){
		               data[id] = {key:d[id],text:d[id+"_text"]}
		               continue
		           }
		           data[id] = d[id]
		       }
		   }
		   data[this.userId] = d[this.userId]
		}	
	},
	
	doLookup:function(field){
		var v = field.getValue()
	/*	
		if(!v){
		   Ext.Msg.alert("错误", "请输入证件号码");
		   field.focus(true)
		   return
		}
		*/
		this.loadPersonList(v)
		
		
	},
	
	loadModuleCfg : function(id) {
		var result = util.rmi.miniJsonRequestSync({
					serviceId : "moduleConfigLocator",
					id : id
				})
		if (result.code != 200) {
			if (result.msg = "NotLogon") {
				this.mainApp.logon(this.loadModuleCfg, this, [id])
			}
			return null;
		}
		return result.json.body;
	},
	
	loadPersonList:function(v){
		var cnd = null
		if(v){
		   cnd = ['eq',['$',this.cardnum],['s',v]]
		}		
		var cmd = "gridlist"
		var cfg = {
		   title : "人员信息",
		   entryName : this.personEntryName,
		   autoLoadSchema : false,
		   autoLoadData : true,
		   showButtonOnTop : true,
		   createCls : "app.modules.config.person.PersonConfigForm",
		   updateCls : "app.modules.config.person.PersonConfigForm",
		   initCnd : cnd,
		   actions:[{id:"create", name:"新建",iconCls:"add"},
		            {id:"update", name:"修改"}		   
		   ]  
		}

		var cls = "app.modules.config.user.PersonQuery"
		var m =  this.midiModules[cmd]
		if(!m){
			$require(cls,[function(){
				var module = eval("new " + cls + "(cfg)")
				module.opener = this			
				module.setMainApp(this.mainApp)
				this.midiModules[cmd] = module
				var lp = module.initPanel()
				this.openWin(cmd,100,50)
			},this])
		}else{
		   m.requestData.cnd = cnd
		   m.refresh()
		   this.openWin(cmd,100,50)
		}
	},
	
	openWin:function(cmd,xy){
		var module = this.midiModules[cmd]
		if(module){
			var win = module.getWin()
			if(xy){
				win.setPosition(xy[0],xy[1])
			}
			win.setTitle(module.title)
			win.show()
		}
	},
	
	doChange:function(o){
	   this.isGridOperate = true   //判断是否对grid有操作
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
		        buttonAlign:'center',
		        items:this.initPanel(),
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
	}
})