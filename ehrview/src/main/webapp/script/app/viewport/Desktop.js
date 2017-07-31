$package("app.viewport")
$import(
	"util.Logger",
	"util.rmi.miniJsonRequestSync",
	"util.CSSHelper",
	"app.desktop.plugins.LoadStateMessenager",
	"app.viewport.WelcomePortal",
	"org.ext.ux.TabCloseMenu"
)
$styleSheet("app.desktop.plugins.DesktopIconView")

app.viewport.Desktop = function(mainApp){
	this.mainApp = mainApp
	this.activeModules = {}
	this.addEvents({
        'ready' : true,
        'NotLogon' : true
    })
}

Ext.extend(app.viewport.Desktop, Ext.util.Observable, {
	getDesktopEl:function(){
		return Ext.get(document.body)
	},
	getWinWidth:function(){
		return Ext.get(document.body).getWidth()
	},
	getWinHeight:function(){
		return Ext.get(document.body).getHeight()
	},
	initViewPort:function(){
		var myPage = this.mainApp.myPage
		var welcomPortals = []
		var welcomPortalPanels = []
		if(myPage && myPage.length > 0){
			for(var i=0;i<myPage.length;i++){
				var wp = new app.viewport.WelcomePortal({
					myPage:myPage[i]
				})
				wp.mainApp = this.mainApp
				welcomPortals.push(wp)
				welcomPortalPanels.push(wp.initPanel())
			}
			this.welcomPortals = welcomPortals
		}		
		var mainTab = new Ext.TabPanel({
					border:false,
                    region:'center',
                    deferredRender:false,
                    plugins:new Ext.ux.TabCloseMenu(),
                    enableTabScroll:true,
                    activeTab:0,
                    items:welcomPortalPanels
        })
        mainTab.on("tabchange",this.onModuleActive,this)
        this.mainTab = mainTab
        //var logoBannerUrl = ClassLoader.appRootOffsetPath + "inc/resources/css/app/desktop/images/logobanner.png"
        var topPanel = new Ext.Panel({
        	region:'north',
            height: 87,
            html:"<div class='x-titlelogo-bg'>"+
            		"<div class='x-titlelogo-banner'>"+
	            		"<div style='float:right;position:relative'>"+
	            			"<div class='x-top-lnkCP' id='CP'></div>"+
	            			"<div class='x-top-lnkLK' id='LK'></div>"+
	            			"<div class='x-top-lnkQT' id='QT'></div>"+
	            			"<div class='x-top-lnkOL' id='OL'></div>"+
	            		"</div>"+
            		"</div>"+
            	 "</div>",
            minSize: 87,
            maxSize: 87,
            border:false,
			split:false,
			collapsible: false
        })
        topPanel.on("afterrender",function(){
        	var lnkSelectors = ['x-top-lnkCP','x-top-lnkLK','x-top-lnkQT','x-top-lnkOL']
			for(var i = 0;i < lnkSelectors.length; i ++){
				var sel = lnkSelectors[i]
				var lnk = this.topPanel.body.child("div." + sel)
				if(lnk){
					lnk.on("click",this.onTopLnkClick,this)
				}
			}
//			this.refreshOnlines()
        },this)
        this.topPanel = topPanel
        var navListeners = {
                        	beforeexpand:this.onBeforeExpand,
                        	expand:this.onExpand,
                        	scope:this
                        }
        var appsItems = []
        var apps = this.mainApp.apps
        var n = apps.length
        for(var i =  0; i < n; i ++){
        	var ap = apps[i]
        	// {{{ add by wuk
        	if(ap.type=="index"){
        		continue
        	}
        	// }}}
        	var cfg = {
        				id:ap.id,
                        title:ap.title,
                        border:false,
                        iconCls:'nav',
                        collapsed:true,
                        layout:'fit',
                        iconCls:'option',
                        animate:true,
                        autoScroll:true,
                        listeners:navListeners
                    }
            appsItems.push(new Ext.Panel(cfg))
        }
        var navPanel = new Ext.Panel({
                    region:'west',
                    title:'功能区',
                    split:true,
                    width: 130,
                    minSize: 130,
                    maxSize: 150,
                    collapsible: true,
                    layout:'accordion',
                    border:false,
                    layoutConfig:{
                        animate:true
                    },
                    items: appsItems
                       
        })
        var n = appsItems.length
        if(n > 0){
			appsItems[n - 1].on("render",function(panel){
				var an = true
				if(n == 1){
        			an = false
				}
				appsItems[0].expand(an)
				this.navPanel.el.focus()
        	},this)        
        }
        this.navPanel = navPanel
 		navPanel.on("render",this.onReady,this)
        
        var viewport = new Ext.Viewport({
            layout:'border',
            hideBorders:true,
			frame:true,
            items:[
            	topPanel,
            	navPanel,
            	mainTab
              ]
        })
		this.viewport = viewport;
	},
	initKeyMap:function(){
		var e = Ext.EventObject;
		var el = Ext.get(document.body)
		var keyMap = new Ext.KeyMap(el)
		keyMap.on(e.UP,this.goPrevIcon,this)
		keyMap.on(e.DOWN,this.goNextIcon,this)
		keyMap.on(e.PAGE_DOWN,this.goNextNavBar,this)
		keyMap.on(e.PAGE_UP,this.goPrevNavBar,this)
		keyMap.on(e.HOME,this.switchNavBar,this)
		keyMap.on(e.ENTER,this.onEnter,this)
		keyMap.on({key:e.ESC,shift:true},this.closeCurrentTab,this)
		keyMap.on({key:e.TAB,shift:true},this.shiftTab,this)
		keyMap.on(e.CONTEXT_MENU,function(){
			Ext.EventObject.stopEvent()
			return false
		},this)
	},
	switchNavBar:function(e){
		try{
			Ext.EventObject.stopEvent()
		}
		catch(e){}
		
		if(this.mainApp.locked){
			return;
		}
		
		var status = this.navPanel.isVisible()
		if(status){
			this.navPanel.collapse()
			var mainTab = this.mainTab
			var panel = mainTab.getActiveTab()
			
			if(panel){
				this.onModuleActive(mainTab,panel)
			}
		}
		else{
			this.navPanel.expand()
			this.navPanel.el.focus()
		}
	},
	shiftTab:function(){
		if(this.mainApp.locked){
			return;
		}
		
		Ext.EventObject.stopEvent()
		var mainTab = this.mainTab
		var items = mainTab.items
		var index = items.indexOf(mainTab.getActiveTab())
		var n = items.getCount()
		if(n == 1){
			if(this.welcomPortal){
				this.welcomPortal.refresh()
				return;
			}			
		}
		index ++;
		if(index == n){
			index = 0
		}
		mainTab.activate(items.item(index))
	},
	closeCurrentTab:function(){
		if(this.mainApp.locked){
			return;
		}
		var mainTab = this.mainTab
		var act = mainTab.getActiveTab()
		if(act && act._mId){
			mainTab.remove(act)
		}
	},
	getCurrentNavBar:function(){
		var nav = this.navPanel.getLayout()
		return nav.activeItem
	},
	goNextNavBar:function(){
		if(this.startExpanding || this.mainApp.locked){
			return
		}
		var status = this.navPanel.isVisible()
		if(!status){
			return;
		}
		var items  = this.navPanel.items
		var nav = this.navPanel.getLayout()
		var index = items.indexOf(nav.activeItem) + 1
		var n = items.getCount()
		if(index >= n){
			return
		}
		var nav = items.item(index)
		nav.expand()
		this.navPanel.el.focus()
	},
	goPrevNavBar:function(){
		if(this.startExpanding || this.mainApp.locked){
			return
		}
		var status = this.navPanel.isVisible()
		if(!status){
			return;
		}		
		var items  = this.navPanel.items
		var nav = this.navPanel.getLayout()
		var index = items.indexOf(nav.activeItem) - 1
		var n = items.getCount()
		if(index < 0){
			return
		}
		var nav = items.item(index)
		nav.expand()
		this.navPanel.el.focus()
	},	
	goNextIcon:function(){
		if(this.mainApp.locked){
			return;
		}
		var status = this.navPanel.isVisible()
		if(!status){
			return;
		}
		var panel = this.getCurrentNavBar()
		var view = panel.view
		var indexes = view.getSelectedIndexes()
		var index = 0
		if(indexes.length > 0){
			index = indexes[0] + 1
		}
		var n = view.getNodes().length
		if(index >= n){
			return
		}
		view.select(index)
		view.getNode(index).scrollIntoView(view.el)
	},
	goPrevIcon:function(){
		if(this.mainApp.locked){
			return;
		}
		var status = this.navPanel.isVisible()
		if(!status){
			return;
		}			
		var view = this.getCurrentNavBar().view
		var indexes = view.getSelectedIndexes()
		var index = 0
		if(indexes.length > 0){
			index = indexes[0] - 1
		}
		var n = view.getNodes().length
		if(index < 0){
			return
		}
		view.select(index)	
		view.getNode(index).scrollIntoView(view.el)
	},
	onTopLnkClick:function(e){
		var lnk = e.getTarget();
		var cmd = lnk.id
		switch(cmd){
			case "CP":
				this.doChangePsw()
				break
			case "LK":
				this.mainApp.logon();
				break
			case "QT":
				util.rmi.jsonRequest({
						serviceId:"logonOut"
					},function(){
						window.location.reload()
					},this)
				break;
			case "OL":
				this.showOnlines()
				break;
		}
	},
	showOnlines:function(){
		var olw = this.olw
		if(!olw){
			var cfg = {
				width:980,
				entryName:"SYS_OnlineUser",
				listServiceId:"onlineHandler",
				disablePagingTbr:true
			}
			$import("app.modules.list.SimpleListView")
			var m = new app.modules.list.SimpleListView(cfg)
			olw = m.getWin()
			olw.on("show",function(){
				m.refresh()
			},this)
			this.olw_m = m
			this.olw = olw
		}
		olw.show()
	},
	refreshOnlines:function(){
		this.getOnlines()
		var target = this
		setInterval(function(){target.getOnlines()} ,30000)
	},
	getOnlines:function(){
		var re = util.rmi.miniJsonRequestSync({
			serviceId:"onlineHandler",
			op:"count"
		})
		if(re.code == 200){
			Ext.get("OL").dom.innerHTML = "在线人数：" + re.json.body
			if(this.olw_m){
				this.olw_m.refresh()
			}
		}
	},
	doChangePsw:function(){
		var m = this.changePswModule
		if(m){
		   	if(m.getWin().hidden){
		   	    m.getWin().show();
		   	}		     
		}else{
		   	$import("app.desktop.plugins.PasswordChanger")
			m = new app.desktop.plugins.PasswordChanger({});
			m.setMainApp(this.mainApp)
			var p = m.initPanel()
			if(p){
			   this.changePswModule = m	
			   m.getWin().show();
			}
			
		}
	},
	onReady:function(){
		var messenger = new app.desktop.plugins.LoadStateMessenager({})
		messenger.setMainApp(this.mainApp)
		messenger.getWin()
		this.initKeyMap()
		
	},
	onModuleActive:function(tab,panel){
		
		if(panel && panel._mId){
			var m = this.mainApp.taskManager.getModule(panel._mId)
			if(!m){
				return
			}
			var instance = m.instance
			if(instance && typeof instance.active == "function"){
				instance.active()
			}
		}
		else{
			if(this.welcomPortals){
				for(var i=0;i<this.welcomPortals.length;i++){
					this.welcomPortals[i].refresh()
				}
			}			
		}
	},
	onEnter:function(){
		if(this.mainApp.locked){
			return;
		}
		var status = this.navPanel.isVisible()
		if(!status){
			return;
		}
		var view = this.getCurrentNavBar().view
		var indexes = view.getSelectedIndexes()
		var index = 0
		if(indexes.length > 0){
			index = indexes[0]
		}
		this.onNavClick(view,index)
	},
	onClose:function(panel){
		var id = panel._mId
		if(id){
			this.mainApp.taskManager.destroyInstance(id)
			delete this.activeModules[id]
		}
	},
	onExpand:function(){
		this.startExpanding = false;
		this.navPanel.el.unmask()
	},
	onBeforeExpand:function(panel,reLogon){
		this.startExpanding = true;
		if(panel.__modInited){
			return;
		}
		if(!reLogon){
			this.navPanel.el.mask("加载中","x-mask-loading")
		}
		var appId = panel.id
		var re = util.rmi.miniJsonRequestSync({
			serviceId:"appConfigLocator",
			id:appId
		})
		
		if(re.code < 300){
			var modules = re.json.body.modules
			for(var i = 0; i < modules.length;i ++){
				var module = modules[i]
				this.mainApp.taskManager.addModuleCfg(module)
				if(module.icon != "default"){
					this.initCssClass(module.id, module.iconCls)
				}		
			}
			var view = this.initNavIcons(panel.body,modules)
			panel.__modInited = true;
			panel.view = view
		}
		else{
			if(re.msg == "AuthorizeFailed"){
				window.location.reload()
			}
			if(re.msg == "NotLogon"){
				this.navPanel.el.unmask()
				this.mainApp.logon(this.onBeforeExpand,this,[panel,true])
			}
		}
		return true;
	},
    getIconTpl:function(){
    	var tpl = this.iconTpl
    	if(!tpl){
    		tpl =  new Ext.XTemplate(
			'<tpl for=".">',
	            '<div style="float:none" class="x-shortcut-wrap" id="_desktop_icon_{id}">',
			    	'<div class="x-shortcut-{id}"></div>',
			    	'<span>{title}</span>',
			    '</div>',
	        '</tpl>',
	        '<div class="x-clear"></div>'
			);
			this.iconTpl = tpl;
    	}
    	return tpl;
	},
	initNavIcons:function(ct,data){
		var store = new Ext.data.Store({
	        reader: new Ext.data.JsonReader({},["id",'title','type']),
	        data: data
	    });
		var view = new Ext.DataView({
				applyTo:ct,
	            store: store,
	            tpl: this.getIconTpl(),
	            singleSelect: true,
	            autoScroll:true,
	            cls:"x-view-nav",
	            // style:{'background-color':'#666666',"margin-right":'auto','margin-left':'auto'},
	            overClass:'x-shortcut-over',
	            selectedClass:"x-shortcut-selected",
	            itemSelector:'div.x-shortcut-wrap'
	       })
	     view.select(0)  
	     view.on("click",this.onNavClick,this) 
	     return view;
	},
	onNavClick:function(view,index,node,e){
		var id = view.store.getAt(index).data.id
		this.openWin(id)
	},
	openWin:function(id){
		var find = this.activeModules[id]
		if(find){
			this.mainTab.activate(find)
			return;
		}
		this.mainTab.el.mask("加载中...","x-mask-loading")
		this.mainApp.taskManager.loadInstance(id,{
			showButtonOnTop:true,
			autoLoadSchema:false,
			isCombined:true
		},
		this.onModuleLoad,this)		
	},
	onModuleLoad:function(module){
//		this.switchNavBar()
		if(module.showWinOnly){
			var win = module.getWin()
			win._mId = module.id
			win.show();
			win.on("close",this.onClose,this)
			this.mainTab.el.unmask()
			return;
		}
		if(module.initPanel){
			var panel = module.initPanel()

			if(panel && module.warpPanel){
				panel = module.warpPanel(panel)
			}
			if(panel){
				panel.on("destroy",this.onClose,this)
				panel._mId = module.id
				panel.closable = true
				panel.setTitle(module.title)
				this.mainTab.add(panel)
				this.mainTab.activate(panel)
				if(this.mainApp.rendered){
					//this.mainTab.doLayout()
				}
				this.activeModules[panel._mId] = panel;
				
			}
			this.mainTab.el.unmask()
			return;
		}
		if(module.initHTML){
			var html = module.initHTML();
			var panel = this.mainTab.add({title:module.title,closable:true,layout:"fit",html:html})
			panel.on("destroy",this.onClose,this)
			panel._mId = id
			this.mainTab.activate(panel)
			if(this.mainApp.rendered){
				//this.mainTab.doLayout()
			}
			this.activeModules[panel._mId] = panel;
			this.mainTab.el.unmask()
			return;
		}
		
	},
	initCssClass:function(id, cls){
		if(!cls){
			cls = id
		}
		var cssSelector =  ".x-shortcut-" + id;
		if(!util.CSSHelper.hasRule(cssSelector)){
			var home = ClassLoader.stylesheetHome 
			util.CSSHelper.createRule(cssSelector,"width:48px;height:48px;background:transparent url(" + home + "app/desktop/images/icons/" + cls + ".gif) no-repeat !important;")
		}	
	}	
})

/*
__docRdy = false

Ext.onReady(function(){
	if(__docRdy){
		return
	}
	__docRdy = true
	Ext.QuickTips.init();
	var main = new app.desktop.TraditionView()
	main.initViewPort()
})*/
