$package("app.modules.config.user")

$import("app.modules.config.ManageUnitConfigPanel")
		
app.modules.config.user.UserConfigPanel = function(cfg){
	cfg.title = "用户注册"
	cfg.entryName = "SYS_USERS"
	cfg.formCls = "app.modules.config.user.UserConfigForm"
	cfg.gridCls = "app.modules.config.user.RemoveUserList"
	cfg.removeServiceId = "userService"
	cfg.fieldId = "userId"
	cfg.textField = "userId"
	cfg.unitDicId = "manageUnit"
    app.modules.config.user.UserConfigPanel.superclass.constructor.apply(this,[cfg])
}
Ext.extend(app.modules.config.user.UserConfigPanel, app.modules.config.ManageUnitConfigPanel, {
	initPanel : function(){
		var grid = this.getProfileList()
		if(!grid){
		   return
		}
		var roleTree = this.createTree({id:this.dicId,keyNotUniquely:true})
		var unitTree = this.createTree({id:this.unitDicId,rootVisible:true,keyNotUniquely:true})
		this.roleTree = roleTree
		this.unitTree = unitTree

		var combox = util.dictionary.SimpleDicFactory.createDic({
		       id:'domain',
		       width:195,
		       editable:false,
		       autoLoad:true,
		       emptyText:"请选择域"
		})
		combox.getStore().on("load",function(s,rs){
		   combox.setValue(globalDomain)
	    },this)
		combox.on("select",this.doNewDic,this)
	
		var tabs = new Ext.TabPanel({
			tabPosition:'bottom',
			defaults : {
				autoScroll : true
			},
			layoutOnTabChange : true,
			resizeTabs : true,
			minTabWidth : 60,
			tabWidth : 80,
			activeTab:0,
			items: [{
	   		   layout:'fit',
			   title : "组织列表",
			   name : "unit",
			   tbar:[combox],
			   items:[unitTree]
		    },{
			   layout:'fit',
			   title : "角色列表",
			   name : "role",
			   items:[roleTree]
		    }]
		})
		this.tabs = tabs
		this.tabs.on("tabChange",this.changeTab,this)
	
	    var panel = new Ext.Panel({
		    height : this.height,
			layout : "border",
			items:[
			   { layout:'fit',
			     title : this.title,
			     region:'west',
		    	 collapsible:true,
		    	 width : 200,
			     items:[tabs]
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
	
	createTree:function(dic){
		var tree = util.dictionary.TreeDicFactory.createTree(dic)
		tree.autoScroll = true
		tree.on("click",this.onTreeClick,this)
		return tree
	},
	
	onTreeClick:function(node){
		node.expand()
		this.initGrid(node)
		var tabType = this.tabs.getActiveTab().name
		this.gridModule.node = node
		if(tabType == "unit"){
			this.gridModule.domain = this.domain
		}
		this.gridModule.tabType = tabType
	},
	
    initGrid:function(node){
    	var tabType = this.tabs.getActiveTab().name
    	var sql = "select userId from SYS_UserProp where domain='{1}'"
    	var id = node.attributes.key   	
    	if(tabType == "role"){
    	   if(node.isLeaf()){
    	      id = this.formatValue(id)
    	      var pnode = node.parentNode
    	      domainId = pnode.attributes.key
    	      sql = "select userId from SYS_UserProp where domain='{1}' and jobId='{2}'"
    	      sql = sql.replace('{1}',domainId).replace('{2}',id)
    	   }else{
    	   	  sql = sql.replace('{1}',id)
    	   }
    	}
    	if(tabType == "unit"){
    	   var domainId = this.domain
    	   if(node.attributes.type == "dic"){
    	   	  sql = sql.replace('{1}',domainId)
    	   }else{
    	      //sql = "select userId from SYS_UserProp where domain='{1}' and manaUnitId='{2}'"
    	      //sql = sql.replace('{1}',domainId).replace('{2}',id)
    	   	  sql = "select userId from SYS_UserProp where domain='{1}' and substring(manaUnitId,1,{2})='{3}'"
    	      sql = sql.replace('{1}',domainId).replace('{2}',id.length).replace('{3}',id)
    	   }
    	}
		if(this.gridModule){			
			this.gridModule.requestData.cnd = ['in',['$','userId'],[sql],'d']
		    this.gridModule.refresh()
		}			
	},
	
	formatValue:function(v){
	    var i = v.indexOf("-")
	    if(i != -1){
	       return v.substring(i+1)
	    }
	    return v
	},
	
	doNewDic:function(com){
		this.setTreeRoot(com)
		this.gridModule.store.removeAll()		
		var domain = com.getValue()
		var dic = this.getDicIdByDomain(domain,this.unitDicId)
		this.loadTree(this.unitTree,dic)
		this.domain = domain
	},
	
	getDicIdByDomain:function(domain, dic){
	    if(domain != globalDomain){
		    dic = domain + "." + dic
		}
		return dic
	},
	
	loadTree:function(tree, dic){
	    var loader = tree.getLoader()
		loader.url = dic + ".dic"
		loader.dic = {id:dic}
		var node = tree.getRootNode()
		node.reload()
	},
	
	setTreeRoot:function(com){
	    var root = this.unitTree.getRootNode()
		root.setId(com.getValue())
		root.setText(com.getRawValue())	
	},
	
	changeTab:function(tabPanel,tab){
		this.gridModule.store.removeAll()
		var node = tab.items.item(0).getSelectionModel().getSelectedNode()
		if(node){
		   this.onTreeClick(node)
		}
	}
	
})