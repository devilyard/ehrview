
$package("app.desktop")
$import("util.Logger")

app.desktop.Desktop = function(mainApp){
	
	var taskbarHeight = 30
	if(!Ext.get('x-desktop')){
		
		Ext.DomHelper.append(document.body,{tag:"div",id:"x-desktop",children:[
			{tag:"div",id:"ux-icon-view"}
		]})
	}
	var desktopEl  = Ext.get('x-desktop')
	var iconViewEl = Ext.get('ux-icon-view');
	var windowGroup;
    var activeWindow;
	
    function init(){
    	windowGroup = Ext.WindowMgr;
    	
    	this.mainApp = mainApp
    	this.mainApp.taskManager.on("afterloadModule",onLoadModule,this)
		this.taskbarHeight = 0
		this.addEvents({
    		"winInit":true,
    		"winOpen":true,
    		"winClose":true,
    		"winMinisize":true,
    		"winActive":true,
    		"winInactive":true,
    		"winLock":true,
    		"winUnlock":true,
    		"addShortcut":true,
    		"message":true
    		}
    	)
    	this.startPosX = 10
    	this.startPosY = 10
	}
	
	function minimizeWin(win){
        win.minimized = true;
        this.fireEvent("winMinisize",win)
        win.hide();
    }

    function markActive(win){
    	
        if(activeWindow && activeWindow != win){
            markInactive.apply(this,[activeWindow]);
        }
        this.fireEvent("winActive",win)
        activeWindow = win;
        win.minimized = false;
    }

    function markInactive(win){
        if(win == activeWindow){
        	this.fireEvent("winInactive",win)
        	activeWindow = null;
        }
    }

    function removeWin(win){
    	this.fireEvent("winClose",win)
    	this.mainApp.taskManager.destroyInstance(win.id)
        layout();
    }

    function layout(){
		desktopEl.setHeight(Ext.lib.Dom.getViewHeight()-taskbarHeight);
    }
    Ext.EventManager.onWindowResize(layout);

 	function onLoadModule(module){
 		if(module == null){
    		return;
    	}
    	var obj = module.instance
    	
    	if(obj == null){
    		return
    	}
    	obj.setMainApp(this.mainApp);
		if(obj.openWinInTaskbar){
    		var win = obj.getWin();
    		initWin.apply(this,[win])
    	}
    }
    
    function fixedWinState(){
    	var desktop = this.selfInDesktop
    	var state = {}
    	var id = this.id
    	state.pos = this.getPosition
    	state.height = this.getInnerHeight()
    	state.width = this.getInnerWidth()
    	
    	var module = desktop.mainApp.taskManager.tasks.item(id)
    	if(module){
    		module.winState = state
    	}
    }
    
    function addWinShortcut(){
    	this.selfInDesktop.fireEvent("addShortcut",this.id)
    }
    
    function initWin(win){

		if(win == null){
    		return
    	}

    	win.render(desktopEl);
    	win.cmenu = new Ext.menu.Menu({
            items: [
            	{text:"设置为桌面快捷方式",handler:addWinShortcut,scope:win},
            	{text:"下次启动时保持窗口状态",handler:fixedWinState,scope:win}
            ]
        });
        win.selfInDesktop = this
        win.on({
        	'activate': {
        		fn: markActive,
        		scope:this
        	},
        	'beforeshow': {
        		fn: markActive,
        		scope:this
        	},
        	'deactivate': {
        		fn: markInactive,
        		scope:this
        	},
        	'minimize': {
        		fn: minimizeWin,
        		scope:this
        	},
        	'close': {
        		fn: removeWin,
        		scope:this
        	}
        });
		
		win.addTool({id:"gear",handler:function(e){this.cmenu.showAt(e.getXY())},scope:win})
		this.fireEvent("winInit",win)
		var module = this.mainApp.taskManager.tasks.item(win.id)
    	if(module && module.winState){
    		var state = module.winState
    		win.setPosition(state.pos[0],state.pos[1])
    		win.setHeight(state.height)
    		win.setWidth(state.width)
    	}
    	        
     	if(module && module.fullScreen){
 			win.on("show",win.maximize)
    	}
		
		win.show()
        layout();    
     }
    
    this.layout = layout
	
	this.openWin = function(id){
    	var win = this.getWindow(id)
    	if(win){
    		win.toFront();
    		win.show();
			return;
    	}
    	this.mainApp.taskManager.loadInstance(id)
    };
	
	this.getManager = function(){
        return windowGroup;
    };

    this.getWindow = function(id){
		return windowGroup.get(id);
    }
    
    this.setTaskbarHeight = function(height){
    	taskbarHeight = height
    }
    
    this.getTaskbarHeight = function(){
    	return taskbarHeight
    }
    
	this.getWinWidth = function(){
		var width = Ext.lib.Dom.getViewWidth();
		return width < 200 ? 200 : width;
	}
		
	this.getWinHeight = function(){
		var height = (Ext.lib.Dom.getViewHeight() - taskbarHeight);
		return height < 100 ? 100 : height;
	}
		
	this.getWinX = function(width){
		return (Ext.lib.Dom.getViewWidth() - width) / 2
	}
		
	this.getWinY = function(height){
		return (Ext.lib.Dom.getViewHeight() - taskbarHeight - height) / 2;
	}
	
	this.getDesktopEl = function(){
		return desktopEl
	}
	
	this.getIconViewEl = function(){
		return iconViewEl
	}
	
	this.mask = function(msg){
		Ext.get(document.body).mask(msg)
	}
	
	this.unmask = function(){
		Ext.get(document.body).unmask()
	}
    
    layout();
	init.apply(this);
 }
 
 Ext.extend(app.desktop.Desktop, Ext.util.Observable);

