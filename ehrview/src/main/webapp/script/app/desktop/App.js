
$package("app.desktop")

app.desktop.App = function(cfg){
    Ext.apply(this, cfg);
    this.addEvents({
        'ready' : true,
        'beforeunload' : true
    });
    this.initApp();
    // Ext.onReady(this.initApp, this);
};

Ext.extend(app.desktop.App, Ext.util.Observable, {
    isReady: false,
    taskManager: null,
	
    initApp : function(){

    	Ext.QuickTips.init();
    	//Ext.lib.Ajax.defaultPostHeader += ';charset=utf-8'
    	this.logger = new util.LoggerFactory()
		this.taskManager = new app.desktop.TaskManager(this)
		this.desktop = new app.desktop.Desktop(this);
		Ext.EventManager.on(window, 'beforeunload', this.onUnload, this);
		this.fireEvent('ready', this);
        this.isReady = true;
    },

    getModules : Ext.emptyFn,
    init : Ext.emptyFn,

    onReady : function(fn, scope){
        if(!this.isReady){
            this.on('ready', fn, scope);
        }else{
            fn.call(scope, this);
        }
    },
    
    getDesktop : function(){
        return this.desktop;
    },
    
    logon:function(callback,scope,args){

    	if(this.locked){
    		return
    	}
    	this.locked = true
    	var logon = this.logonModule
    	
    	if(!logon){
			logon = new app.desktop.plugins.LogonWin({forConfig:false,deep:false,uid:this.uid,mainApp:this})
    		this.logonModule = logon
    	}
		logon.on("logonSuccess",function(res){
			var ce = logon.events["logonSuccess".toLowerCase()];
			ce.clearListeners()
			this.locked = false
			if(typeof callback == "function"){
				callback.apply(scope || this,args || [])
			}
		},this)
		logon.getWin().show();
    },
	
	onUnload : function(e){
        if(this.fireEvent('beforeunload', this) === false){
            e.stopEvent();
        }
    }
});