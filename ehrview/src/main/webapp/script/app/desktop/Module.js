$package("app.desktop")

$import("app.modules.common")

app.desktop.Module = function(config){
	this.opener  = null;
	this.mainApp = null
	this.openWinInTaskbar = true;
	this.autoRun = false
	this.autoInit = true
	this.type = "USER"
	Ext.apply(this,app.modules.common);
    Ext.apply(this, config);
    app.desktop.Module.superclass.constructor.call(this);
    this.addEvents({
    	"NotLogon":true
    })
   	this.classId = this.script + "-" + this.id
	this.midiModules = {}
	this.midiWins = {}
	this.midiMenus = {}
	this.midiComponents = {}
	if(this.autoInit){
    	this.init();
	}
}

Ext.extend(app.desktop.Module, Ext.util.Observable, {
    init : function(){},
    getWin: function(){return null},
    setMainApp:function(mainApp){
    	this.mainApp = mainApp;
    	if(!mainApp){
    		return
    	}
    	this.logger = mainApp.logger.createLogger(this.classId)
    	this.renderToEl = mainApp.desktop.getDesktopEl()
    },
    getRenderToEl:function(){
    	if(this.mainApp){
    		return this.mainApp.desktop.getDesktopEl();
    	}
    	if(this.opener && this.opener.getRenderToEl){
    		return this.opener.getRenderToEl();
    	}
    	return null;
    },
    destory: function(){
    	var win  = this.win
    	if(win){
			if(win.cmenu && win.cmenu.el){
				win.cmenu.el.remove()
			}
			//if(win.isVisible()){
				win.close()
			//}
			//else{
			//	setTimeout(function(){
			//		win.destroy()
			//	},50)
			//}
			this.win = null
		}
		for(var id in this.midiModules){
			this.midiModules[id].destory()
		}
		this.midiModules = {};
		for(var id in this.midiWins){
			var win = this.midiWins[id]
			//if(win.isVisible()){
				win.close()
			//}
			//else{
			//	setTimeout(function(){
			//		win.destroy()
			//	},50)
			//}
		}
		this.midiWins = {};
		for(var id in this.midiMenus){
			var m = this.midiMenus[id]
			m.destroy();
		}
		this.midiMenus = {};
		for(var id in this.midiComponents){
			var c = this.midiComponents[id]
			if(c.destroy){
				delete c.ownerCt
				c.destroy()
			}
		}
		this.midiComponents = {};
    }

});