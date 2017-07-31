$package("app.desktop.plugins")

app.desktop.plugins.LoadStateMessenager = function(config){
	app.desktop.plugins.LoadStateMessenager.superclass.constructor.apply(this,[config]);
	this.stateMsgs = ["初始化","已连接","读取数据","完成","载入失败"] 
}

Ext.extend(app.desktop.plugins.LoadStateMessenager, app.desktop.Module,{
    
    init: function(){
    	this.openWinInTaskbar = false
    	this.autoRun = true;
    	this.type = "SYSTEM"
    },
    
    getWin: function(){
    		//if(!Ext.get('x-msg')){
			//	Ext.DomHelper.append(this.mainApp.desktop.getDesktopEl(),{tag:"div",id:"x-msg"})
			//}
    		var win = new Ext.Window({
			id:"_desktop_MLSM" + (new Date()).getTime(),
			title:"loading",
			constrainHeader:true,
			height: "50px",
			width: "300px",
			shim:true,
			resizable:false,
			layout:"fit",
			shadow:false,
			items:[
				new Ext.ProgressBar({
			        id:'x-msg-pbar',
			        //renderTo:'x-msg',
			        autoHeight:true
			     })
			]
		})
		return win;
    },
    onLoadStateChange: function(title,state,e){
    	var win =  this.win
 		var stateMsgs = this.stateMsgs
    	var pbar = win.items.get(0)
    	this.logger.debug(title + "," + state)
    	if(state < 3){
			pbar.reset();
			this.setFixPosition()
    		win.setTitle("载入 [" + title + "]...")
    		win.show()
    	}
    	
    	if(state < 5)
    		setTimeout(function(){pbar.updateProgress(state*0.25,stateMsgs[state - 1])},200);
    	
    	if(state == 4){
    		setTimeout(function(){win.hide()},1400)
    	}
    	
    	if(state == 5){
    		if(win.hidden){
    			win.show()
    		}
    		pbar.updateProgress(0.75,stateMsgs[state - 1]);
    		setTimeout(function(){win.hide()},2000)
    	}
    
    },
    
    setFixPosition:function(){
		var x = this.mainApp.desktop.getWinWidth() - 305
		var y = this.mainApp.desktop.getWinHeight() - 55
	
		this.win.setPosition(x,y);
	},
    
    onLoadFailed:function(obj,e){
    	var title = "";
    	if(obj && obj.title){
    		title = obj.title
    	}
    	this.onLoadStateChange(title,5,e)
    },
    
    setMainApp:function(mainApp){
		app.desktop.plugins.LoadStateMessenager.superclass.setMainApp.apply(this,[mainApp])
		var taskm = mainApp.taskManager
    	var desktop = mainApp.desktop
    	this.win = this.getWin();
		this.setFixPosition();
		
    	if(taskm){
    		taskm.on("loadStateChange",this.onLoadStateChange,this)
    		taskm.on("loadModuleFalied",this.onLoadFailed,this)
    	}
    	
    },
    destory: function(){
		app.desktop.plugins.LoadStateMessenager.superclass.destory.call(this)
    	var taskm = this.mainApp.taskManager
    	if(taskm){
    		taskm.un("loadStateChange",this.onLoadStateChange,this)
    		taskm.un("loadModuleFalied",this.onLoadModuleFailed,this)
    	}
    	
    }
});