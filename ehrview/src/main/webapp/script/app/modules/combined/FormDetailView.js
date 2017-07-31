$package("app.modules.combined")

$import(
	"app.modules.list.SimpleListView",
	"app.modules.form.MCFormView",
	"util.schema.SchemaLoader"
)

app.modules.combined.FormDetailView = function(cfg){
	this.width = 820;
	this.height = 500;
	this.btnStatus = null
	this.formCls = "app.modules.form.MCFormView"
	this.listCls = "app.modules.list.SimpleListView"
	this.listCreateCls = "app.modules.form.MCFormView"
	this.formHeight = 140
	this.listPageSize = 25
	app.modules.combined.FormDetailView.superclass.constructor.apply(this,[cfg])
}
Ext.extend(app.modules.combined.FormDetailView, app.desktop.Module,{
	init:function(){
		app.modules.combined.FormDetailView.superclass.init.call(this)
		this.on("winShow",function(){
			if(this.op == "create"){
				this.setBtnStatus("forDoNew")
			}
			else{
				this.setBtnStatus("forUpdate")
			}
		},this)
	},
	active:function(){
		this.win.el.focus();
	},
	setBtnStatus:function(status){
		
		switch(status){
			case "forDoNew":
				this.setBtnStatusForDoNew();
				break;
			case "forCreate":
				this.resetButtons()
				this.setBtnStatusForCreate();
				break;
			case "forUpdate":
				this.resetButtons()
				this.setBtnStatusForUpdate()
				break;
		}
	},
	setBtnStatusForDoNew:function(){
		this.resetButtons()
		var details = this.midiModules["details"]
		if(!details){
			return;
		}
		details.clear()
		if(details.grid.el){
			details.grid.el.mask()
		}
		this.disableButtons("details",true)
		this.disableButtons("default",true)
	},
	setBtnStatusForCreate:function(){	
		var details = this.midiModules["details"]
		if(!details){
			return;
		}
		if(details.grid.el){
			details.grid.el.unmask()
		}
		this.disableButtons("details",false)
		var main = this.midiModules["main"]
		this.modifyActions(main.data)
	},
	setBtnStatusForUpdate:function(){
		var details = this.midiModules["details"]
		if(!details){
			return;
		}
		if(details.grid.el){
			details.grid.el.unmask()
		}		
		var main = this.midiModules["main"]
		this.modifyActions(main.data)
	},
	resetButtons:function(){
		if(!this.panel){
			return;
		}
		var tbar = this.panel.getTopToolbar(); 
		tbar.items.each(function(b,index){
			b.enable()
		})		
	},	
	disableButtons:function(taget,status){
		var tbar = this.panel.getTopToolbar(); 
		tbar.items.each(function(b){
			if(b.target == taget){
				if(b.cmd == "new"){
					return;	
				}
				if(status){
					b.disable()
				}
				else{
					b.enable()
				}
			}
		})		
	},
	resetContextId:function(refresh){
		var details = this.midiModules["details"]
		if(!details){
			return;
		}
		Ext.apply(details.exContext,this.exContext)
		details.exContext[this.mainSchema.pkey] = this.initDataId
		details.requestData.cnd = ['eq',['$',this.mainSchema.pkey],['i',this.initDataId]]		
		if(refresh){
			details.refresh();
		}
	},
	loadData:function(){
		var main = this.midiModules["main"]
		if(main){
			main.initDataId = this.initDataId
			main.loadData()
			if(this.win){
				this.win.setTitle(this.title)
			}
		}
	},
	onMainSave:function(entryName,op,json,rec){
		if(op == "create"){
			this.setBtnStatus("forCreate")
			this.op = "update"
			this.initDataId = rec[this.mainSchema.pkey]
			this.resetContextId()
		}
		else{
			this.setBtnStatus("forUpdate")
		}
		this.fireEvent("save",entryName,op,json,rec)
	},
	onMainLoadData:function(entryName,data){
		this.setBtnStatus("forUpdate")
		this.resetContextId(true)
	},
	onDetailsSave:function(entryName,op,json,rec){
		if(!json.update){
			return;
		}
		var main = this.midiModules["main"]
		if(!main){
			return
		}
		var update = json.update[this.mainSchema.id]
		if(!update){
			return;
		}
		var form = main.form.getForm()
		for(s in update){
			var f = form.findField(s)
			if(f){
				f.setValue(update[s])
			}
		}
		this.fireEvent("save",entryName,op,json,rec)
	},
	modifyActions:function(data){
		
	},
	onReady:function(){
		if(this.autoLoadData){
			this.loadData();
		}
		var el = this.win.el
		if(!el){
			return
		}
		var actions = this.actions
		if(!actions){
			return
		}
		var f1 = 112
		var keyMap = new Ext.KeyMap(el)
		keyMap.stopEvent = true
		
		var btnAccessKeys = {}
		var keys = []
		
		var btns = this.panel.getTopToolbar().items; 
		var n = btns.getCount()
		for(var i = 0; i < n; i ++){
			var btn = btns.item(i)
			var key = btn.accessKey
			if(key){
				btnAccessKeys[key] = btn
				keys.push(key)
			}
		}
		
		this.btnAccessKeys = btnAccessKeys
		keyMap.on(keys,this.onAccessKey,this)
		keyMap.on({key:Ext.EventObject.ESC,shift:true},this.onEsc,this)
	},
	onAccessKey:function(key){
		var btn = this.btnAccessKeys[key]
		if(btn.disabled){
			return
		}
		if(btn.enableToggle){
			btn.toggle(!btn.pressed)
		}
		this.doAction(btn)
		var ev = window.event
		try{
			ev.keyCode=0;
			ev.returnValue=false
		}
		catch(e){}
	},
	onEsc:function(){
		this.win.hide()
	},
	initSchema:function(id){
		var schema
		var re = util.schema.loadSync(id)
		if(re.code == 200){
			schema = re.schema;
		}
		else{
			if(re.msg == "NotLogon" && this.mainApp){
				this.mainApp.logon(this.initSchema,this,[id])	
			}
			return;
		}
		return schema
	},
	createWinItems:function(){
		var main = this.midiModules["main"]
		var details = this.midiModules["details"]
		if(!main){
			this.mainSchema = this.initSchema(this.mainEntryName)
			if(!this.mainSchema){
				return;
			}
			var cfg = {}
			cfg.actions = []
			cfg.isCombined = true
			cfg.autoLoadSchema = false
			cfg.autoLoadData = false
			cfg.showButtonOnTop = true
			cfg.initDataId = this.initDataId
			cfg.entryName = this.mainEntryName
			cfg.data= {}
			cfg.data[this.mainSchema.pkey] = this.initDataId			
			cfg.op = this.op
			$import(this.formCls)
			main = eval("new " + this.formCls + "(cfg)");
			main.opener = this
			main.setMainApp(this.mainApp)
			main.on("save",this.onMainSave,this)
			main.on("doNew",this.setBtnStatusForDoNew,this)
			main.on("loadData",this.onMainLoadData,this)
			main.initPanel(this.mainSchema)
			this.midiModules["main"] = main;
		}
		if(!details){
			this.detailsSchema = this.initSchema(this.detailsEntryName)
			if(!this.detailsSchema){
				return;
			}
			var cfg = {}
			cfg.title = this.detailsSchema.alias
			cfg.isCombined = true
			cfg.autoLoadSchema = false
			cfg.autoLoadData = false
			cfg.pageSize = this.listPageSize
			cfg.createCls = cfg.updateCls = this.listCreateCls
			cfg.entryName = this.detailsEntryName
			cfg.exContext = {}
			cfg.exContext[this.mainSchema.pkey] = this.initDataId
			Ext.apply(cfg.exContext,this.exContext)
			details = eval("new " + this.listCls + "(cfg)");
			details.opener = this
			details.setMainApp(this.mainApp)
			details.on("save",this.onDetailsSave,this)
			details.on("remove",this.onDetailsSave,this)
			details.initPanel(this.detailsSchema)
			this.midiModules["details"] = details;			
		}
		return this.warpContainer(main.form,details.grid)
	},
	warpContainer:function(form,grid){
		var panel = new Ext.Panel({
			border:false,
			frame:true,
		    layout:'border',
		    width:this.width,
		    tbar:this.createButtons(),
		    //autoHeight:true,
		    //height:this.height,
		    items: [{
		    	layout:"fit",
		    	split:true,
		    	border:false,
		    	collapsible:true,
		        title: '',
		        region:'north',
		        width:this.width,
		        height:this.formHeight,
		        items:form
		    },{
		    	layout:"fit",
		    	split:true,
		    	border:false,
		        title: '',
		        region: 'center',
		        width:this.width,
		        items:grid
		    }
		    ]
		});	
		this.panel = panel;
		return panel;
	},
	createButtons:function(){
		var actions = this.actions
		var buttons = []
		if(!actions){
			return buttons
		}
		var bag = {
			"main":[],
			"details":[],
			"default":[]
		}
		var f1 = 112;
		for(var i = 0; i < actions.length; i ++){
			var action = actions[i];
			var btn = {
				accessKey : f1 + i,
				text : action.name  + "(F" + (i + 1) + ")",
				ref:action.ref,
				target : action.target || "default",
				cmd : action.delegate || action.id,
				iconCls : action.iconCls || action.id,
				enableToggle : (action.toggle == "true"),
				script :  action.script,
				handler : this.doAction,
				scope : this
			}
			bag[btn.target].push(btn)
		}
		for(s in bag){
			if(bag[s].length == 0 ){
				continue;
			}
			buttons = buttons.concat(bag[s])
			buttons.push("-")
		}
		return buttons
	},
	doNew:function(){
		var main = this.midiModules["main"]
		if(main){
			main.doNew();
		}
		this.setBtnStatus("forDoNew")
	},
	doPrint: function(){
		var m =  this.midiModules["print"]
		var cfg = {
			title:this.mainSchema.alias,
			formEntryName:this.mainEntryName,
			entryName:this.detailsEntryName,
			listServiceId:this.listServiceId,
			initDataId:this.initDataId,
			isCombined:true
		}
		if(!m){
			var cls = this.printCls || "app.modules.print.FormDetailsPrintView"
			$require(cls,[function(){
				var module = eval("new " + cls + "(cfg)")
				module.on("close",this.active,this)
				this.midiModules["print"] = module
				var win = module.getWin()
				win.setPosition(20,20)
				win.show()
			},this])
		}
		else{
			m.initDataId = this.initDataId
			m.loadData()
			m.getWin().show()
		}
	},
	doAction:function(btn,e){
		var target = btn.target || "default"
		var cmd = btn.cmd
		var module = null;
		if(target != "default"){
			module = this.midiModules[target]
			if(!module){
				return;
			}
			if(typeof module.doAction == "function"){
				module.doAction.apply(module,[btn,e]);
				return;
			}
		}
		else{
			module = this;
		}
		cmd = "do" + cmd.charAt(0).toUpperCase() + cmd.substr(1)
		var action = module[cmd]
		if(typeof action == "function"){
			action.apply(module,[btn,e]);
		}

	},
	getWin: function(){
		var win = this.win
		var closeAction = "close"
		if(this.opener){
			closeAction = "hide"
		}
		if(!win){
			win = new Ext.Window({
				id: this.id,
		        title: this.title,
		        width: this.width,
		        height:this.height,
		        iconCls: 'icon-form',
		        shim:true,
		        layout:"fit",
		        animCollapse:true,
		        closeAction:closeAction,
		        constrainHeader:true,
		        minimizable: true,
		        maximizable: true,
		        shadow:false,
		        items:this.createWinItems()
            })
		    var renderToEl = this.getRenderToEl()
            if(renderToEl){
            	win.render(renderToEl)
            }
		    win.on("show",function(){
		    	this.onReady()
		    	this.fireEvent("winShow")
		    },this)            
			win.on("add",function(){
				this.win.doLayout()
			},this)
			win.on("close",function(){
				this.fireEvent("close",this)
			},this)
			win.on("hide",function(){
				this.fireEvent("close",this)
			},this)
			this.win = win
		}
		return win;
	}	
	
});