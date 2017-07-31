$package("app.modules.config")

$import("app.desktop.Module",
		"org.ext.ux.TabCloseMenu",
		"app.modules.common",
		"util.dictionary.TreeDicFactory")

app.modules.config.OrgaConfigList = function(cfg){
	this.width = 720
	this.height = 450
	this.title = "机构用户管理"
	this.className = "OrganizationConfig"
	this.childTab = "app.modules.config.user.UserConfigList"
	this.createForm="app.modules.config.OrgaConfigForm"	
	this.autoLoadSchema = true
	this.removeServiceId="configuration"
	this.activeModules = {}
	this.midiMenus = {}
	this.pModules={}
	this.entryName = "SYS_USERS"
	Ext.apply(this,app.modules.common)
	app.modules.config.OrgaConfigList.superclass.constructor.apply(this,[cfg])
}

Ext.extend(app.modules.config.OrgaConfigList, app.desktop.Module, {

	initPanel : function(){

		var tree = util.dictionary.TreeDicFactory.createTree({id:this.dicId})
		tree.autoScroll = true
		tree.on("click",this.onTreeClick,this)
		var actions = this.actions
//		if(actions.length>0){
//			tree.on("contextmenu",this.onContextMenu,this)
//		}		
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
		if(!node.isLeaf()){
		   node.expand()
		}		
		var cnd = []
		var cls = this.childTab
		var id = node.id
		var text=node.text
		var parentNode = node.parentNode
		var parentId = parentNode.id
		if(parentId=='0'){
		   return
		}
		
		if(node.attributes.type){
			var n = id.length
		   	cnd = ['eq',['substring',['s','b.manaUnitId'],1,n],['s',id]]        
		   	
		}else{
		    cnd = ['and',
			        ['eq',['$','b.jobId'],['s',node.attributes.rid]],
			        ['eq',['$','b.manaUnitId'],['s',parentId]]
			
			]
		}		
		
		var p = this.activeModules[id]		
		if(p){
			this.tab.activate(p)
		}else{
			cfg = {}
			cfg.initCnd = cnd
			cfg._rId = node.id
			cfg.title = node.text
			cfg.entryName = this.entryName //"SYS_USERS"
			cfg.exContext = {}
			cfg.actions = this.actions
			cfg.autoLoadSchema = false
			cfg.showButtonOnTop = true
			$require(cls,[function(){
				m = eval("new " + cls + "(cfg)")
				m.setMainApp(this.mainApp)
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
	/*	
		var id = data["id"]
		if(!id){
			return
		}
		var op=op;		
		if(op == "update"){	
			var n = this.tree.getNodeById(id)
			if(n){
				n.setText(data["name"] || n.text)
				if(leaf){
				   Ext.apply(n.attributes,data)
				}
			}	
		}else if(op == "create"){
			var pid = data["parent"]
			var n = this.tree.getNodeById(pid)
			if(n){
				n.leaf = false
				var node = {id:id,text:data["name"]||id,leaf:leaf}
				if(leaf){
				   Ext.applyIf(node,data)
				}
				n.expand(true)
				var cn = n.appendChild(node);
				cn.expand()
				cn.select()				
			}			
		}
		*/
			
	},
	
	onContextMenu:function(node,e){
		if(node.isLeaf()){
		   return
		}
		node.select()		
		var actions = this.actions
		var menu = this.midiMenus["unittreemenu"]
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
			   width:100,
			   items:but
		    })
		    this.midiMenus["unittreemenu"] = menu
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
		}else if(!node.isLeaf() || node.attributes.type){  //机构
			for(var i = 0; i < actions.length; i++){
			    var it = menu.items.itemAt(i)
			    it.show()
			}			
		}
		
		menu.showAt([e.getPageX(),e.getPageY()])
		this.fireEvent("contextmenu",node)
	},
	
	doAction:function(item){
	    var cmd = item.name
	    if(cmd == "create" || cmd == "update"){
	        this.addNew(item)
	    }
	    if(cmd == "remove"){
	        this.doRemove()
	    }
	},
	
	addNew:function(item){
		var node = this.tree.getSelectionModel().getSelectedNode()
		var cls = this.createForm
		var id = node.id
		var title = node.text +'维护'
		if(item.name == "create"){
		    title = "新增部门"
		}
		
		var cmd = "menu"//id +'-menu'
		var p = this.activeModules[cmd]	
		if(p){
			this.openModule(cmd,item,node)
			p.setTitle(title)
			if(this.tab){
			    this.tab.activate(p)
			}			   
		}else{
			cfg = {}
			cfg.width = 600
			cfg.height = 550
			cfg.node = node
			cfg.parent = node.id
			cfg.op = item.name
			cfg._mId = this.panel._mId
			$require(cls,[function(){
				m = eval("new " + cls + "(cfg)")
				m.setMainApp(this.mainApp)
				m.on("save",this.onSave,this)
				var p = m.initPanel()
				if(p){
				  p.on("destroy",this.onClose,this)
				  p._Id = cmd
				  p._mId = this.panel._mId   //module的id
				  p.title = title
				  p.closable = true
				  this.tab.add(p)
				  this.tab.doLayout()
				  this.tab.activate(p)
				  this.activeModules[cmd] = p
				  this.pModules[cmd] = m
				  this.openModule(cmd,item,node)
				}	
			},
			this])
		}
	},
	
	openModule:function(cmd,item,node){		
		var op = item.name
		var m = this.pModules[cmd]
		if(m){
		   if(op == "update"){
		       m.loadData(node)
		   }else if(op == "create"){
		       m.doNew(node)
		   }
		}

	},
	
	doRemove:function(){
		var node = this.tree.getSelectionModel().getSelectedNode()
		if(node == null){
			Ext.Msg.alert('提示','请选择一个节点!')
			return
		}
		if(node.id == "base"){
		   Ext.Msg.alert("提示","不节点不允许删除")
		   return
		}
		Ext.Msg.show({
		   title: '确认删除记录[' + node.text + ']',
		   msg: '删除操作将无法恢复，是否继续?',
		   modal:false,
		   width: 300,
		   buttons: Ext.MessageBox.OKCANCEL,
		   multiline: false,
		   fn: function(btn, text){
		   	 if(btn == "ok"){
		   	 	this.processRemove(node);
		   	 }
		   },
		   scope:this
		})	
	},
	processRemove:function(node){   //树节点的删除操作		
		var parentNode = node.parentNode
		if(!this.fireEvent("beforeRemove","DeptConfig",node)){
			return;
		}
		this.panel.el.mask("在正删除数据...","x-mask-loading")
		util.rmi.jsonRequest({
				serviceId:this.removeServiceId,
				operate:"remove",
				op:"remove",
				body:node.id,
				className:this.className,
				module:this.panel._mId
			},
			function(code,msg,json){
				this.panel.el.unmask()
				if(code < 300){
					this.removePanel(node)
					parentNode.removeChild(node)				
				}
				else{
					this.processReturnMsg(code,msg,this.doRemove)
				}
			},
			this)
	},
	
	removePanel:function(node){

		var id = node.id
		var pid = node.parentNode.id
		var arry = [id,id+"-menu"]
		for(var i=0; i<arry.length; i++){
		   var p = this.activeModules[arry[i]]
		   if(p){
		      this.tab.remove(p)
		   }
		}
		var m = this.pModules[pid+"-menu"]
		if(m && m.initDataId==id){
			var p = this.activeModules[pid+"-menu"]
			this.tab.remove(p)
		}
	},
	
	onClose:function(panel){
		var id = panel._Id
		this.pModules[id].destory()
		delete this.activeModules[id]
		delete this.pModules[id]	
	}
})