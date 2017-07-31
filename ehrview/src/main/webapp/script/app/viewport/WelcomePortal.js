$package("app.viewport")
$import(
			 "org.ext.ux.portal.Portal",
			 "app.modules.list.SimpleListView", 
			 "app.modules.chart.DiggerChartView",
			 "util.rmi.jsonRequest"
			 )
app.viewport.WelcomePortal = function(cfg) {
	this.portlets = {}
	this.portletModules = {}
	this.count = 4
	this.colCount = 2; //列数(竖)
	this.rowCount = 2; //行数(横)
	this.midiModules = {}
	this.removeServiceId = "simpleRemove"
	this.entryName = "SYS_HomePage"
	this.actions  = [
		{text:"2格布局",iconCls:"laytwo",count:2,row:1},
		{text:"3格布局",iconCls:"laythree",count:3,row:2},
		{text:"4格布局",iconCls:"layfour",count:4,row:2},
		{text:"5格布局",iconCls:"layfive",count:5,row:2},
		{text:"6格布局",iconCls:"laysix",count:6,row:2}	
	]
	
	//this.title = "我的首页"
	app.viewport.WelcomePortal.superclass.constructor.apply(this,[cfg])
}
Ext.extend(app.viewport.WelcomePortal, app.desktop.Module, {

	initPanel : function() {
		if(this.portal){
		    return this.portal		
		}
		var dataview = this.initPagingBar()	
		var items = this.initMenuItems()
		var laybut = new Ext.Toolbar.SplitButton({
			text : '',
			iconCls : "setlay",
			notReadOnly : true,
			menu : new Ext.menu.Menu({
				items :items
			})
		})
	
		var cfg = {
		   renderTo:'_index',
		   border:false,
           height:this.height,
		   buttonAlign : 'center',
		   fbar : [laybut,dataview],
		   items : []
		}
		this.portal = new Ext.ux.Portal(cfg)		
		this.addPortalItems()

		return this.portal;
	},
	
	initPagingBar:function(){
		var data = this.getPages()
	    var tpl =  new Ext.XTemplate(
			   '<tpl for=".">',
	             '<a href="#">{page}</a>',
			   '</tpl>'
		)
		var store = new Ext.data.Store({
	        reader: new Ext.data.JsonReader({},['page']),
	        data: data
	    })
	    
		var dataview = new Ext.DataView({
           store: store,
           tpl:tpl,  
		   cls:'manu2',
           itemSelector: 'a',
           singleSelect: true,
		   selectedClass:"current"
           //autoScroll  : true
        })
        dataview.on("click",this.nextPage,this)
        this.dataview = dataview
        return dataview
        
	},
	
	initMenuItems:function(){
		var actions = this.actions
	    var buttons = []
	    if(!actions){
			return buttons
		}
		
		for(var i = 0; i < actions.length; i ++){
			var action = actions[i]
			var btn = {
			     handler:this.changeLayout,
			     scope:this			
		    }
			Ext.apply(btn,action)
			buttons.push(btn)
		}
		return buttons
	},
	
	getPages:function(){
		var modules = this.getAllModuleId()
		var cellNum = this.count
		var pages = Math.ceil(modules.length/cellNum)
	//若总数刚好一整页,就增加一个空白页面
		if(modules.length%cellNum == 0){
		    pages = pages + 1
		}
		var data = []
		for(var i=0; i<pages; i++){
		    data.push({page:i+1})
		}
		return data
	
	},
	
	nextPage:function(view,index,node,e){
		var page = view.store.getAt(index).data.page
		this.portal.removeAll()
		this.addPortalItems(page)
		this.portal.doLayout()
		this.refresh()		
	},
	
	addPortalItems:function(pageNo){
		this.portlets = {}
	    this.portletModules = {}
	    
		var modules = this.getAllModuleId()
		if(!pageNo){
		    pageNo = 1
		}
		var pageSize = this.count
		var first = pageSize * (pageNo-1)
		var end = pageSize * pageNo
		var ms = modules.slice(first,end);
	    var portlets = this.portlets
		this.initPortlets(ms);
		
		var col = 0
		var row = 0
		var num = Math.floor(this.count/this.rowCount)
		for (var i = 0; i < this.count; i++) {
		    var column = {
				columnWidth : 1/num,
				style : 'padding:5px 5px 0px 5px',
				items : []
			}
			var index = col + "." + row
			var p = portlets[index]
			if(p){
				column.items.push(p)
			}
			this.portal.add(column)
			if(++row >= num){
			    row = 0
			    col++
			    if(this.count%this.rowCount != 0){
		       	   num = Math.ceil(this.count/this.rowCount)
		       }
			}			
		}
	},
	
	initPortlets:function(modules){
		if(!modules){
			return
		}
		var portlets = this.portlets  //{}		
		var col = 0
		var row = 0

		var n = this.count
		var num = Math.floor(this.count/this.rowCount)
		for(var i=0; i<n; i++){
			var mod = modules[i]
			if(mod){
			   var pkey = mod.id
			   mod = this.loadModuleCfg(mod.moduleId)
			   if(mod != null){
			       mod.pkey = pkey
			   }			   
			}			
			var m = this.createModule(mod)
			var p = this.getPortlet(m)
			portlets[col+"."+row] = p 
			if(m){
			   this.portletModules[col+"."+row] = m
			}

		    if(++row >= num){
		       row = 0
		       col++
		       if(this.count%this.rowCount != 0){
		       	   num = Math.ceil(this.count/this.rowCount)
		       }
		    }
		}
	},

	getPortlet:function(module){
		var backgroundUrl = "background-image: url(" +ClassLoader.stylesheetHome 
		               + "app/desktop/images/homepage/titlebg.jpg);border:1px solid #FFFFFF;"
		if(module){
		   var p =  module.initPanel()
		   p.frame = false
		   p.border = false
		   var cfg = {
		   	  title : module.title,
		   	  pkey : module.pkey,
		   	  headerStyle:backgroundUrl,
		   	  border:false,
		   	  bodyStyle:'padding:1px;',
		   	  style:'border: 1px solid #CCCCCC;margin-bottom: 5px',
		      height : Math.ceil((this.height-60)/this.rowCount), //Math.ceil(430/this.rowCount),//240,
			  frame:false,
			  collapsible:false,  //去掉伸缩
			  draggable:false, //拖拽
			  autoScroll : false,
			  width : '110%',
			  layout : "fit",
			  tools : [{id:'close',handler:this.removePortlet,scope:this}],
			  items: [p]
		   }		   
		   return new Ext.ux.Portlet(cfg)
		}else{
		   return this.emptyPortlet()
		}
	},
	
	emptyPortlet:function(){
	   var cfg = {
		    height : Math.ceil((this.height-60)/this.rowCount),//Math.ceil(430/this.rowCount),//240
			frame:false,
			border:false,
			collapsible:false,  //去掉伸缩
			draggable:false, //拖拽
			width : '110%',
			style : 'border: 1px dashed #99BBE8;margin-bottom: 5px',   //边框虚线化
		    bodyStyle : 'background-color:#ECECEC',
		    layout : {
		      type:'hbox',
		      align:'middle',
              pack:'center'
		    },
			items: [new Ext.Button({text:'',iconCls:'add',handler:this.doNew,scope:this})]
		}
		return new Ext.ux.Portlet(cfg)
	},
	
	
	addNewPortlet:function(button,data){
		var portlet = button.ownerCt
		var pc = portlet.ownerCt     //portletColumn
		pc.remove(portlet,true)
		
		var mod = this.loadModuleCfg(data.moduleId)
		if(mod == null){
		   return
		}
		mod.pkey = data.id
		var m = this.createModule(mod)
		if(m){
		   this.portletModules[mod.id] = m
		   var p = this.getPortlet(m)
		   if(p){
		   	  pc.add(p)
		   }		   
		   pc.doLayout()
		   if(m.loadData){
		       m.loadData()		   
		   }
		   this.clearCacheModules()
		}
		delete portlet	
	},
	
	changeLayout:function(item){
		this.portal.removeAll()
		this.count = item.count
		this.rowCount = item.row
	    this.addPortalItems()
		var data = this.getPages()
		this.dataview.getStore().loadData(data)
		this.portal.doLayout()
		this.refresh()
	   
	},
	
	removePortlet:function(e, target, panel){
		Ext.MessageBox.show({
              title: '确认删除[' + panel.title + ']',
              msg: '删除操作将无法恢复，是否继续?',
              buttons: Ext.MessageBox.OKCANCEL,
              icon: Ext.MessageBox.WARNING,
              fn: function(btn, text){
		   	     if(btn == "ok"){
		   	 	   this.processRemove(panel);
		   	     }
		      },
		      scope:this
              
        }) 
    },
    
    processRemove:function(panel){
    	this.portal.el.mask("在正删除数据...")
		util.rmi.jsonRequest({
				serviceId:this.removeServiceId,
				pkey:panel.pkey,
				schema:this.entryName
			},
			function(code,msg,json){
				this.portal.el.unmask()
				if(code < 300){
		            var pc = panel.ownerCt	
                    pc.remove(panel, true)  
                    var portlet = this.emptyPortlet()
                    pc.add(portlet)
		            pc.doLayout()
		            this.clearCacheModules()
					this.fireEvent("remove",this.entryName,'remove',json)					
				}else{
					this.processReturnMsg(code,msg,this.removePortlet)
					return
				}
		},this)   
    },
	
	refresh:function(){
		this.loadData()	
	},
	
	loadData:function(){
		var ms = this.portletModules
		for(var m in ms){
			if(ms[m] && ms[m].loadData){
				ms[m].loadData()
			}
		}
	},
	
	loadModuleCfg:function(id){
		var result = util.rmi.miniJsonRequestSync({
			serviceId:"moduleConfigLocator",
			id:id
		})
		if(result.code != 200){
			if(result.msg == "NotLogon"){
				this.mainApp.logon(this.loadModuleCfg,this,[id])
			}
			return null;
		}
		return result.json.body;
	},
	
	createModule:function(mod){
		var m = ""
	    if(mod && mod.script){
		    $import(mod.script)
		    Ext.apply(mod,{
			    enableCnd:false,
				autoLoadSchema:false,
				autoLoadData:false,
				isCombined:true,
				disablePagingTbr:true,
				showButtonOnTop:true,
				actions : []   //去掉按钮
			})
			m = eval("new "+mod.script+"(mod)")
	    }
	    return m
	},
	
	clearCacheModules:function(){
	    this.modules = ""
	},
	
	getAllModuleId:function(){
		if(this.modules){
		    return this.modules
		}
		var modules = ""
		if(this.mainApp){
		    var uid = this.mainApp.uid
		    var re = util.rmi.miniJsonRequestSync({
				serviceId:"simpleQuery",
				schema:this.entryName,
				cnd:['eq',['$','userId'],['s',uid]]
			})
			if(re.code == 200){
			    modules = re.json.body
			    this.modules = modules
			}else{
			    this.processReturnMsg(re.code,re.msg,this.getAllModuleId);
			}			
		}
		return modules
	},

	doNew:function(button){
		var cls = "app.modules.config.homePage.DisplayConfig"
	    var cfg = {
	        title : "首页添加",
	        appId : this.myPage.id,
	        button : button        
	    }
		$import(cls)
		var module = eval("new " + cls + "(cfg)");
		module.on("loadData",this.addNewPortlet,this)
		module.setMainApp(this.mainApp)
		module.opener = this
		this.openWin(module,100,50)
	},
	
	openWin:function(module,xy){
		if(module){
			var win = module.getWin()
			if(xy){
				win.setPosition(xy[0],xy[1])
			}
			win.setTitle(module.title)
			win.show()
		}
	}
	
	
})