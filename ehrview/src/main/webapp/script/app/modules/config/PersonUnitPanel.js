$package("app.modules.config")

$import("app.desktop.Module",
		"org.ext.ux.TabCloseMenu",
		"app.modules.common",
		"util.dictionary.TreeDicFactory")

app.modules.config.PersonUnitPanel = function(cfg){
	this.width = 720
	this.height = 450
	this.title = "人员注册"
	this.childTab = "app.modules.config.person.PersonConfigList"
	this.formCls = "app.modules.config.person.PersonConfigForm"
	this.autoLoadSchema = true
	this.activeModules = {}
	this.midiMenus = {}
	this.pModules={}
	this.entryName = "SYS_Personnel"
	Ext.apply(this,app.modules.common)
	app.modules.config.PersonUnitPanel.superclass.constructor.apply(this,[cfg])
}

Ext.extend(app.modules.config.PersonUnitPanel, app.desktop.Module, {

	initPanel : function(){
		var tree = util.dictionary.TreeDicFactory.createTree({id:this.dicId})
		tree.autoScroll = true
		tree.on("click",this.onTreeClick,this)
		var actions = this.actions	
		//tree.expandAll()
		this.tree = tree
		
		var tab = new Ext.TabPanel({
			region : "center",
			enableTabScroll : true,
			defaults : {
				autoScroll : true
			},
			layoutOnTabChange : true,
			margins : '0 4 4 0',
			resizeTabs : true,
			tabWidth : 100,
			minTabWidth : 100,
			plugins : new Ext.ux.TabCloseMenu()
		})
		this.tab = tab
		this.tab.on("tabchange",function(tab, panel){
			if(!panel){
			   return
			}
			var id = panel._Id
			var m = this.pModules[id]
			if(m && m.refresh){
			   m.refresh()
			}
		},this)
	
	   var panel = new Ext.Panel({
		    height : this.height,
			layout : "border",
			items:[
			   { layout:'fit',
			     title : this.title,
			     region:'west',
			     split:true,
		    	 collapsible:true,
			     width : 180,
			     items:[tree]
			   },tab
			]
		})
		this.panel = panel	
		return this.panel
		
	},
	
	onTreeClick:function(node,e){
		var cls = this.childTab
		var id = node.id
		var text=node.text
		var parentNode = node.parentNode
		var parentId = parentNode.id
		if(parentId=='0'){
		   return
		}
		node.expand()
		var n = id.length
		var cnd = ['eq',['substring',['s','organizCode'],1,n],['s',id]]        	
		
		var p = this.activeModules[id]		
		if(p){
			this.tab.activate(p)
		}else{
			cfg = {}
			cfg.initCnd = cnd
			cfg._rId = node.id
			cfg.title = this.title
			cfg.entryName = this.entryName
			cfg.createCls = this.formCls
			cfg.updateCls = this.formCls
			cfg.actions = this.actions
			cfg.autoLoadSchema = false
			cfg.showButtonOnTop = true
			cfg.node = node
			cfg.id = this.id
			$require(cls,[function(){
				m = eval("new " + cls + "(cfg)")
				m.setMainApp(this.mainApp)
				//m.on("save",this.onSave,this)
				var p = m.initPanel()
				if(p){
				   p.on("destroy",this.onClose,this)
				   p._Id = id
				   p._mId = this.panel._mId   //module的id
				   p.title = node.text
				   p.closable = true
				   this.tab.add(p)
				   this.tab.doLayout()
				   this.tab.activate(p)
				   this.activeModules[id] = p
				   this.pModules[id] = m
				}
			},
			this])
		}
	},

 //修改机构树	
	onSave:function(data,op,leaf){	
		this.tree.getRootNode().reload()
		this.tree.expandAll()			
	},
	
	onClose:function(panel){
		var id = panel._Id
		this.pModules[id].destory()
		delete this.activeModules[id]
		delete this.pModules[id]	
	}
})