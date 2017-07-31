$package("app.modules.config")

$import("app.desktop.Module",
		"org.ext.ux.TabCloseMenu",
		"app.modules.common",
		"util.dictionary.TreeDicFactory")

app.modules.config.ManageUnitConfigPanel = function(cfg){
	this.width = 720
	this.height = 450
	this.title = "机构注册"
	this.gridCls = "app.biz.ehrview.EHRSearchByManageUnit"
	this.formCls = "app.modules.config.unit.ManageUnitForm"
	this.autoLoadSchema = true
	this.activeModules = {}
	this.midiMenus = {}
	this.pModules={}
	this.removeServiceId = "organizationService"
	this.fieldId = "organizCode"
	this.textField = "organizName"
	this.entryName = "SYS_Organization"
	Ext.apply(this,app.modules.common)
	app.modules.config.ManageUnitConfigPanel.superclass.constructor.apply(this,[cfg])
}

Ext.extend(app.modules.config.ManageUnitConfigPanel, app.desktop.Module, {
	
	initPanel : function(){
		var grid = this.getProfileList()
		if(!grid){
		   return
		}
		var tree = util.dictionary.TreeDicFactory.createTree({id:this.dicId,keyNotUniquely:true})
		tree.autoScroll = true
		tree.on("click",this.onTreeClick,this)
		var actions = this.actions	
		//tree.expandAll()
		this.tree = tree
	
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
			   },{ 
			     layout:'fit',
			     region:'center',
			     items:[grid]
			   }
			]
		})
		this.panel = panel	
		return this.panel		
	},
	
	onTreeClick:function(node,e){
		var id = node.id
		var parentNode = node.parentNode
		var parentId = parentNode.id
		if(parentId=='0'){
		   return
		}
		node.expand()
		this.initGrid(node)
		this.gridModule.node = node
	},
	
	getProfileList : function() {
		var cls = this.gridCls
		var cfg = {}		
		cfg.entryName = this.entryName
		cfg.serviceId = this.removeServiceId
		cfg.listServiceId = this.listServiceId
		cfg.fieldId = this.fieldId
		cfg.textField = this.textField
		cfg.title = this.title
		cfg.autoLoadSchema = false
		cfg.autoLoadData = false;
		cfg.showButtonOnTop = true
		cfg.isCombined = true		
		cfg.createCls = this.formCls
	    cfg.updateCls = this.formCls	
		cfg.actions = this.actions
		cfg.id = this.id
		var lp = this.midiModules["gridss"]
		if (!lp) {
			$import(cls)
			var module = eval("new " + cls + "(cfg)");
			module.setMainApp(this.mainApp)
			module.opener = this
			this.gridModule = module
			lp = module.initPanel()			
		}
		this.grid = lp
		return this.grid;
	},
	
	initGrid:function(node){
		var id = node.attributes.key //node.id
		var n = id.length
		if(this.gridModule){
			this.gridModule.requestData.cnd = ['eq', ['$', 'a.createUnit'], ['s', id]]
			this.gridModule.refresh()
		}			
	}
	
})