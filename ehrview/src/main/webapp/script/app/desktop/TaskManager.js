$package("app.desktop")
$import("util.rmi.miniJsonRequestSync")
app.desktop.TaskManager = function(mainApp){
	this.addEvents({
    		"beforeLoadModule":true,
    		"loadStateChange":true,
    		"afterloadModule":true,
    		"loadModuleFalied":true,
    		"afterDestoryModule":true
    })
    this.mainApp = mainApp
	this.modules = mainApp.modules
	this.logger = mainApp.logger.createLogger("app.desktop.TaskManager")
    this.tasks = new Ext.util.MixedCollection();
    
    mainApp.on("ready",function(){
    	this.win = null;
    	this.count = 0;
    	var modules = this.modules
    	for(var i = 0; i< modules.length; i ++){
    		var module         = modules[i]
    		module.pid         = ++ this.count;
    		module.instance = null
    		module.mainApp = this.mainApp
    		this.tasks.add(module.id,module)
    		if(module.autoRun){
				this.loadInstance(module.id)
    		}
    	}
    	
    },this)
    app.desktop.TaskManager.superclass.constructor.call(this);
}

Ext.extend(app.desktop.TaskManager, Ext.util.Observable, {
    addModuleCfg: function(module){

    	if(!this.tasks.item(module.id)){
    		var pid = this.count ++
    		module.pid      = pid;
    		module.instance = null
    		this.tasks.add(module.id,module);
    		if(module.autoRun){
    			this.getModuleInstance(module.id)
    		}
    	}
    	
    },
    
    getModule: function(id){
    	return this.tasks.item(id)
    },
    
    loadInstance:function(id,exCfg,fCallback,scope){
    	var module = this.tasks.item(id)
    	if(!module){
    		var res = this.loadModuleCfg(id);
    		if(res.code != 200){
    		    if(res.msg = "NotLogon"){
    		         this.mainApp.logon(this.loadInstance,this,[id,exCfg,fCallback,scope])    		         
    		    }
    		    return
    		}
    		module = res.json.body
    		if(module){
    			this.addModuleCfg(module)
    		}
    		else{
    			this.fireEvent("loadModuleFalied",module);
    			return;
    		}
    	}
    	Ext.apply(module,exCfg)
    	if(module){
    		var obj = module.instance
    		if(obj == null){
    			var script = module.script
					this.fireEvent("beforeLoadModule",id,script);
					$require(script,[function(){
    					try{
    						var obj = eval("new " + script + "(module)");
    						obj.on("NotLogon",this.mainApp.logon,this.mainApp)
    						module.instance = obj
    						if(typeof fCallback == "function"){
    							if(typeof scope == "object"){
    								obj.opener = scope
    								obj.setMainApp(this.mainApp)
    							}
    							fCallback.apply(scope,[obj,'remote'])
    						}
    						this.fireEvent("afterLoadModule",module)
    					}
    					catch(e){
    						throw e
    						this.logger.error("new module instance [" + script + "] failed:" + e)
    						this.fireEvent("loadModuleFalied",module,e);
    					}
    				},this],
    				[function(state,cls,status,e){
    					this.fireEvent("loadStateChange",module.title,state)
    					if(e || status > 300){
    						this.logger.error("load module [" + module.id + "] failed:" + e)
    						this.fireEvent("loadModuleFalied",module,e);
    					}
    				},this]
    			)//$require
    		}//if(obj == null)
    		else{
				if(typeof fCallback == "function"){
					if(typeof scope == "object")
						obj.opener = scope
					fCallback.apply(scope,[obj,"local"])
					
					if(obj.win && obj.win.isVisible()){
						obj.win.toFront()
					}
				}
			}
    	}//if(modlue)
    	else{
    		this.logger.error("module [" + id + "] config not found")
    		this.fireEvent("loadModuleFalied",{title:id},null)
    		return null
    	}
    },
    
    destroyInstance:function(id){
    	var module = this.tasks.item(id)
		if(module && module.instance){
			module.instance.destory();
			module.instance = null;
			this.tasks.removeKey(id)
			this.fireEvent("afterDestoryModule",module)
		}
	},
	
	loadModuleCfg:function(id){
		var cfg = this.tasks.item(id)
		if(cfg){
			return cfg
		}
		var result = util.rmi.miniJsonRequestSync({
			serviceId:"moduleConfigLocator",
			id:id
		})
		return result
	}

});