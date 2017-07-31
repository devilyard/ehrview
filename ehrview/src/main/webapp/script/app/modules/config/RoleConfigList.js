$package("app.modules.config")

$import("app.modules.config.OrgaConfigList")

app.modules.config.RoleConfigList = function(cfg){
	cfg.childTab = "app.modules.config.RoleConfigForm"
	cfg.title = "角色列表"
	cfg.className = "RoleConfig"
	cfg.removeServiceId="roleConfig"
	this.domain = globalDomain
	app.modules.config.RoleConfigList.superclass.constructor.apply(this,[cfg])
}

Ext.extend(app.modules.config.RoleConfigList, app.modules.config.OrgaConfigList, {
	
	initPanel : function(){

		var combox = util.dictionary.SimpleDicFactory.createDic({
		       id:'domain',
		       width:175,
		       editable:false,
		       emptyText:"请选择域",
		       autoLoad:true
		})
		combox.getStore().on("load",function(s,rs){
		   combox.setValue(globalDomain)
	    },this)
		combox.on("select",this.doNewDic,this)
		
		
		var tree = util.dictionary.TreeDicFactory.createTree({id:this.dicId})
		tree.autoScroll = true
		tree.on("click",this.onTreeClick,this)
		var actions = this.actions
		if(actions.length>0){
			tree.on("contextmenu",this.onContextMenu,this)
		}		
		tree.expandAll()
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
			     //title : this.title,
			     region:'west',
			     split:true,
		    	 //collapsible:true,
			     width : 180,
			     tbar:[combox],
			     items:[tree]
			   },tab
			]
		})
		this.panel = panel	
		return this.panel
		
	},
	
	doNewDic:function(com){
		var domain = com.getValue()
		
		var dic = this.dicId
		if(domain != globalDomain){
		    dic = domain + "." +this.dicId
		}
		var loader = this.tree.getLoader()
		if(!loader.hasListener("loadexception")){
		   loader.on("loadexception",function(){
		      //alert(123)
		   },this)
		}
		loader.url = dic + ".dic"
		loader.dic = {id:dic}
		var node = this.tree.getRootNode()
		node.reload()
		this.tree.expandAll()
		this.domain = domain
		this.tab.removeAll()
		
	},

	onTreeClick:function(node,e){
		if (!node.isLeaf()) {
			return
		}
//		if(!this.checkActions()){
//		    Ext.Msg.alert("提示","没有update操作权限")
//		    return
//		}
		
		this.op = "update"		
		this.createRoleForm(node)
	},
	
	onSave:function(data,op){
		var id = data["id"]
		if(!id){
			return
		}
		var op=op;
		if(op == "update"){	
			var n = this.tree.getNodeById(id)
			if(n){
				n.setText(data["name"] || n.text)
			}	
		}else if(op == "create"){
			var m=this.pModules['base-menu']
			var p=this.activeModules['base-menu']
			this.activeModules[id+'-menu']=p
			this.pModules[id+'-menu']=m
			p._Id = id+'-menu'
			var pid = data["parent"]
			var n = this.tree.getNodeById(pid)
			if(n){
				n.leaf = false
				n.expand(true)
				var cn = n.appendChild({id:id,text:data["name"]||id,leaf:true,iconCls:"user"})
				cn.expand()
				cn.select()
			}			
		}
			
	},
	
	onContextMenu:function(node,e){
		node.select()
		var actions = this.actions
		var menu = this.midiMenus["roletreemenu"]
		if(!menu){
			var but = []
		    var n = actions.length;
		    for(var i = 0; i < n; i ++){
			   var action = actions[i];
			   var button = {
			      text: action.name,
			      name: action.id,
			      iconCls: action.iconCls || action.id,
			      handler: this.doAction,
			      hidden:true,
			      scope:this
			   }
			   but.push(button)
		    }
			menu = new Ext.menu.Menu({
				items:but
			})
			this.midiMenus["roletreemenu"] = menu
		}
		if(node.id == "base"){
			for(var i = 0; i < actions.length; i++){
			    var it = menu.items.itemAt(i)
			    if(it.name == "create"){
			       it.show()
			    }else{
			       it.hide()
			    }			    
			}
		}else{
		   	for(var i = 0; i < actions.length; i++){
			    var it = menu.items.itemAt(i)
			    if(it.name == "create"){
			       it.hide()
			    }else{
			       it.show()
			    }			    
			}
		}
		menu.showAt([e.getPageX(),e.getPageY()])
		this.fireEvent("contextmenu",node)
	},
	
	addNew:function(item){
		var node = this.tree.getSelectionModel().getSelectedNode()
		this.op = item.name
		if(this.op == "create"){
		   if (node.isLeaf() && node.id!="base") {
			  Ext.Msg.alert("提示","本节点不允许增加子节点!")
			  return
		   }
		   //this.op = "create"		   
		}
		this.createRoleForm(node)

	},
	
	createRoleForm:function(node){
		var cls = this.childTab
		var id = node.id
		var parent = id
		id = id +'-menu'
		if(this.op == "update"){
		   parent = node.attributes.parent
		}
		var m = this.activeModules[id]
		
		if(m && id!="base-menu"){
			this.tab.activate(m)
		}else{
			cfg = {}
			cfg.domain = this.domain
			cfg.parent = parent
			cfg.initDataId = node.id
			cfg.title = node.text
			cfg.autoLoadSchema = false
			cfg.op = this.op
			cfg.actions = this.actions
			cfg._mId = this.panel._mId   //module的id
			$require(cls,[function(){
				m = eval("new " + cls + "(cfg)")
				m.setMainApp(this.mainApp)
				m.on("save",this.onSave,this)
				var p = m.initPanel()
				if(p){
				  p.on("destroy",this.onClose,this)
				  p._Id = id				  
				  p.title = m.title
				  p.closable = true
				  this.tab.add(p)
				  this.tab.doLayout()
				  this.tab.activate(p)
				  this.activeModules[id] = p
				  this.pModules[id] = m
				  this.initModule(id,this.op)
				}	
			},
			this])
		}	
	},
	
	initModule:function(id, op){
		var module = this.pModules[id]
		if(module){
			switch(op){
				case "create":
					module.doNew()
					break;
				case "read":
				case "update":
					module.loadData()
			}
		}
	},
	
	processRemove:function(node){   //树节点的删除操作		
		var parentNode = node.parentNode
		if(parentNode){
			this.parentNode=parentNode
		}
		if(!this.fireEvent("beforeRemove","DeptConfig",node)){
			return;
		}
		this.panel.el.mask("在正删除数据...","x-mask-loading")
		util.rmi.jsonRequest({
				serviceId:this.removeServiceId,
				cmd:"remove",
				body:node.id,
				domain:this.domain,
				module:this.panel._mId
			},
			function(code,msg,json){
				this.panel.el.unmask()
				if(code < 300){
					this.removePanel(node)
					this.parentNode.removeChild(node)				
				}
				else{
					this.processReturnMsg(code,msg,this.doRemove)
				}
			},
			this)
	},
	
	checkActions:function(){
	   	var actions = this.actions
		var n = actions.length;
		for(var i = 0; i < n; i ++){
		   var action = actions[i];
		   if(action.id == "update"){
		   	   return true
		   }
		}
		return false
	}
})