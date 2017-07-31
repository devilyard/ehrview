$package("app.desktop.plugins")
$styleSheet("app.desktop.plugins.DesktopIconView")
$import("util.CSSHelper")
app.desktop.plugins.DesktopIconView = function(config){
	app.desktop.plugins.DesktopIconView.superclass.constructor.apply(this,[config]);
}

Ext.extend(app.desktop.plugins.DesktopIconView, app.desktop.Module,{
    
    init: function(){
    	this.openWinInTaskbar = false
    	this.autoRun = true;
    	this.type = "SYSTEM"
    	this.iconContextMenus = {};
    	this.defaultIconCM = [
	   	 			{id:"_shortcut_open",text:"打开",script:"a.b.c"},
	   	 			{id:"_shortcut_openNew",text:"在新窗口打开"},
	   	 			{id:"_shortcut_remove",text:"删除图标"}
	   	]
	   	this.defaultViewCM = [
	   	   	 	{id:"_iconView_iconSort",text:"排列图标",menu:[
	   	   	 			{id:"title",text:"名称",handler:this.sortIcons,scope:this},
	   	   	 			{id:"type",text:"类型",handler:this.sortIcons,scope:this},
	   	   	 			{id:"id",text:"内码",handler:this.sortIcons,scope:this}
	   	   	 		]},
   	 			{id:"_iconView_saveState",text:"保存设置"},
   	 			{id:"_iconView_refresh",text:"刷新"},
   	 			{id:"_iconView_prop",text:"属性"}
	   	]
	   	this.allDDObj = {}
	   	
    },
    getIconTpl:function(){
    	return new Ext.XTemplate(
			'<tpl for=".">',
	            '<div class="x-shortcut-wrap" id="_desktop_icon_{id}">',
			    '<div class="x-shortcut-{id}"></div>',
			    '<span>{title}</span></div>',
	        '</tpl>',
	        '<div class="x-clear"></div>'
		);
	},
	onIcondbclick:function(view,index,node,e){
		var moduleId = view.store.getAt(index).data.id
		this.mainApp.desktop.openWin(moduleId)
	},
	onIconCotextMenu: function(view,index,node,e){
		   	e.stopEvent();
		    var menu = this.iconContextMenus[node.id]
		    if(!menu){
			   	var items = this.defaultIconCM
			   	for(var i = 0;i < items.length; i ++){
			   		items[i].moduleId = view.store.getAt(index).data.id
			   	}
			   	var menu = new Ext.menu.Menu({
					items:items
		   	 	})
		   	 	this.iconContextMenus[node.id] = menu
		   	 	menu.on("itemclick",function(item,e){
		   	 		switch(item.id){
		   	 			case "_shortcut_open":
		   	 				var _this = this
		   	 				setTimeout(function(){_this.mainApp.desktop.openWin(item.moduleId)},300)
		   	 				break
		   	 			case "_shortcut_remove":
							this.removeShortcut(item.moduleId)
		   	 				break
		   	 		}
		   	 	},this)
		   	}
   	 		menu.showAt([e.getPageX()+5,e.getPageY()+5])
	},
	onViewCotextMenu:function(e){
		e.stopEvent();
		
		var menu = this.viewContextMenu
		if(!menu){
	   	 	menu = new Ext.menu.Menu({
	   	 		items:this.defaultViewCM
	   	 	})
	   	 	menu.on("itemclick",function(item,e){
	   	 		switch(item.id){
	   	 			case "_iconView_saveState":
	   	 				this.saveState();
	   	 				break;
	   	 		}
	   	 		
	   	 	},this)
	   		this.viewContextMenu = menu
	   	}
   	 	menu.showAt([e.getPageX()+5,e.getPageY()+5])
	},
	initViewIcons:function(sorting){
		  var view = this.view
	      var nodes = view.getNodes()
		  var defines = this.mainApp.shortcuts
		  
	      for(var i = 0; i < nodes.length; i ++){
	      		var node = nodes[i]
				this.initDD(node)
				var pos = defines[i].pos
				if(pos && !sorting){
					var el = Ext.get(node)
					el.setXY(pos)
				}
		  }
	},
	sortIcons:function(item,e){
		var view = this.view
		var store = this.view.store
		store.sort(item.id)
		this.destoryDD()	
		this.initViewIcons(true)
	},
	saveState:function(){
		var nodes = this.view.getNodes()
		var defines = this.mainApp.shortcuts
		for(var i = 0; i < nodes.length; i ++){
			var node = nodes[i]
			var el = Ext.get(node)
			defines[i].pos = [el.getX(),el.getY()]
		}
	},
	removeShortcut:function(id){
		var nodeId = "_desktop_icon_" + id
		var node = this.view.getNode(nodeId)
		
		if(!node){
			return;
		}
		var store = this.view.store
		var record = this.view.getRecord(node)
		store.remove(record)
		
		var dd = this.allDDObj[nodeId]
		if(dd){
			dd.proxy.getEl().remove()
			delete this.allDDObj[nodeId]
		}
		var cmenu = this.iconContextMenus[nodeId]
		if(cmenu){
			cmenu.el.remove()
			delete this.iconContextMenus[nodeId]
		}
	},
	addShortcut:function(id){
		var module = this.mainApp.taskManager.getModule(id)
		
		if(module){
			
			var defines = this.mainApp.shortcuts
			var store = this.view.store
			
			if(store.find("id",id) > 0){
				return true
			}

			if(module.icon != "default"){
				this.initCssClass(id)
			}
			var shortcut = {id:module.id,title:module.title,type:module.type}
			defines.push(shortcut)
			store.add(new Ext.data.Record(shortcut))
			var node = this.view.getNode(store.getCount() - 1)
			this.initDD(node)
		}
	},
	initCssClass:function(id){
		var cssSelector =  ".x-shortcut-" + id;
		if(!util.CSSHelper.hasRule(cssSelector)){
			var home = ClassLoader.stylesheetHome 
			util.CSSHelper.createRule(cssSelector,"widthpx:48;height:48px;background:transparent url(" + home + "app/desktop/images/icons/" + id + ".gif) no-repeat !important;")
		}	
	},
	initDD: function(node){
			var DDObjS = new IconDDSource(node)
      		var DDObjT = new IconDDSwitchTarget(node)
			DDObjS.dragData = {module:this}
			this.allDDObj[node.id] = DDObjS
	},
    setMainApp:function(mainApp){
		app.desktop.plugins.DesktopIconView.superclass.setMainApp.apply(this,[mainApp])
		var desktop = this.mainApp.desktop
		
		desktop.on("addShortcut",this.addShortcut,this)
		
		for(var i = 0; i < mainApp.shortcuts.length; i ++){
			var st = mainApp.shortcuts[i]
			if(st.icon == "default"){
				continue;
			}
			this.initCssClass(st.id)
		}
		
	    var store = new Ext.data.Store({
	        reader: new Ext.data.JsonReader({},["id",'title','type']),
	        root: 'images',
	        data: mainApp.shortcuts
	    });

		var ct = desktop.getIconViewEl()
		var view = new Ext.DataView({
				renderTo:ct,
				width:"100%",
				height:desktop.getWinHeight(),
	            store: store,
	            tpl: this.getIconTpl(),
	            multiSelect: true,
	            overClass:'x-shortcut-over',
	            selectedClass:"x-shortcut-selected",
	            itemSelector:'div.x-shortcut-wrap',
				plugins: []
	       })
	     this.view = view
   	 	 this.view.refresh();
   	 	 this.initViewIcons();
   	 	 var DDObjT = new IconDDViewTarget(ct.id)
		 view.on("dblclick",this.onIcondbclick,this);
		 view.on("contextmenu",this.onIconCotextMenu,this);
		 ct.on("contextmenu",this.onViewCotextMenu,this)
		 view.show();
		 
		 Ext.EventManager.onWindowResize(function(){
		 	view.setHeight(desktop.getWinHeight())
		 }, this);
		 
	},
	destoryDD:function(){
		var allDDObj = this.allDDObj
		for(id in allDDObj){
			allDDObj[id].proxy.getEl().remove()
		}
	},
	destory:function(){
		
		this.mainApp.desktop.un("addWinShortcut",this.addWinShortcut,this)
		
		var ct = this.mainApp.desktop.getIconViewEl()
		ct.update("")

		var cmenus = this.iconContextMenus
		
		if(this.viewContextMenu){
			cmenus._x_view_cm = this.viewContextMenu
		}
		
		for(var id in cmenus){
			var menu = cmenus[id]
			menu.el.remove()
			menu.removeAll();
		}
		this.destoryDD()
	}
})

//+--------------------------------------------------------------------------
IconDDSource = function(node){
    this.node = node;
    IconDDSource.superclass.constructor.call(this, node.id, 'IconDD',{animate: false});
    this.scroll = false;
};

Ext.extend(IconDDSource,Ext.dd.DragSource,{

	onStartDrag:function(x,y){
		var ghost = this.proxy.getGhost().dom
		var clone = ghost.firstChild
		ghost.style.backgroundColor = "transparent"
		ghost.style.border = "0px"
        clone.style.position = "static"
    }
})

//+--------------------------------------------------------------------------
IconDDViewTarget  = function(id){
	 IconDDViewTarget.superclass.constructor.call(this, id, 'IconDD',{animate: false});
}
Ext.extend(IconDDViewTarget,Ext.dd.DropTarget,{
	notifyDrop:function(dd,e,data){
		if(data.alreadyDroped){
			data.alreadyDroped = false
			return true
		}
		var dragNode = dd.getEl()
		var o = Ext.get(dragNode)
		o.setXY([e.getPageX() + 15,e.getPageY() + 15],true)
		return true;
	}
}) 

//+--------------------------------------------------------------------------
IconDDSwitchTarget  = function(node){
	 this.node = node
	 IconDDSwitchTarget.superclass.constructor.call(this, node.id, 'IconDD',{animate: false});
}

Ext.extend(IconDDSwitchTarget,Ext.dd.DropTarget,{
	notifyDrop:function(dd,e,data){
		e.stopEvent();
		
		var view = data.module.view
		var dropNode = Ext.get(this.node)
		var dragNode = Ext.get(dd.getEl())
		var record = view.getRecord(dragNode)
		
		var xy = dropNode.getXY()
		dropNode.setXY(dragNode.getXY(),true)
		dragNode.setXY(xy,true)
		data.alreadyDroped = true
	}
})  