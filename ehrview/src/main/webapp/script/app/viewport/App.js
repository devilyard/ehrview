$import("app.desktop.App")
$package("app.viewport")

app.viewport.App = function(cfg){
    Ext.apply(this, cfg);
    this.addEvents({
        'ready' : true,
        'beforeunload' : true
    });
    this.initApp();
    // Ext.onReady(this.initApp, this);
};

Ext.extend(app.viewport.App, app.desktop.App, {
    isReady: false,
    taskManager: null,
	
    initApp : function(){
    	this.menu = this.menu || {
			iconCls: 'user',
			height: 300,
			shadow: true,
			title: 'Sean220',
			width: 300
    	}

    	Ext.QuickTips.init();
    	this.logger = new util.LoggerFactory()
		this.taskManager = new app.desktop.TaskManager(this)
		this.desktop = new app.viewport.MyDesktop(this);
		this.desktop.initViewPort()
		Ext.EventManager.on(window, 'beforeunload', this.onUnload, this);
		this.fireEvent('ready', this);
        this.isReady = true;
    }
});