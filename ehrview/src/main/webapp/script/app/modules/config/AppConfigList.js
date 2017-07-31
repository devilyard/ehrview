$package("app.modules.config")

$import(
	"app.desktop.Module",
	"org.ext.ux.TabCloseMenu",
	"app.modules.common",
	"util.dictionary.TreeDicFactory",
	"util.rmi.jsonRequest"
)

app.modules.config.AppConfigList = function(cfg){
	this.width = 720
	this.height = 450
	this.serviceId="appConfig"
	this.activeModules = {}
	this.pModules = {}
	this.domain = globalDomain
	Ext.apply(this,app.modules.common)
	app.modules.config.AppConfigList.superclass.constructor.apply(this,[cfg])
}

Ext.extend(app.modules.config.AppConfigList,app.desktop.Module,{
	initPanel : function(){		
		var combox = util.dictionary.SimpleDicFactory.createDic({
		       id:'domain',
		       width:175,
		       editable:false,
		       autoLoad:true,
		       emptyText:"请选择域"
		})
		combox.getStore().on("load",function(s,rs){
		   combox.setValue(globalDomain)   
	    },this)
		combox.on("select",this.doNewDic,this)
		
		var tree = util.dictionary.TreeDicFactory.createTree({id:this.dicId})
		tree.autoScroll = true
		tree.on("click",this.onTreeClick,this)
		//tree.expandAll()
		this.tree = tree
		var propPanel = this.getPropPanel()
		this.propPanel = propPanel
		propPanel.on("contextmenu",this.onCellContextMenu,this)
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
			items:propPanel,
			activeTab:0
		})
		this.tab = tab
	   var panel = new Ext.Panel({
		    height : this.height,
			layout : "border",
			items:[
			   { layout:'fit',
			    // title : "应用模块列表",
			     region:'west',
			     tbar:[combox],
			     split:true,
			     width : 180,
			     items:[tree]
			   },tab
			]
		})
		this.panel = panel
		if(!this.isCombined){
			this.addPanelToWin();
		}
		return this.panel
	},
	loadProp:function(){
		util.rmi.jsonRequest({
				serviceId:this.serviceId,
				cmd:"loadProps",
				domain:this.domain
			},function(code,msg,json){
				if(code<300){
					var body = json.body
					if(body){
						this.propPanel.getStore().removeAll()
						for(var id in body){
							this.addRoleProp(id,body[id])
						}
					}
				}else{
					this.processReturnMsg(code,msg,this.loadProp);
				}
			},this)
	},
	saveAppProps:function(){
		var pp = this.propPanel
		pp.el.mask("在正保存数据...","x-mask-loading")
		var st = pp.getStore()
		var saveData = []
		for(var i=0;i<st.getCount();i++){
			var r = st.getAt(i)
			if(!r.data["p_key"]){
				continue;
			}
			saveData.push(r.data)
		}
		util.rmi.jsonRequest({
				serviceId:this.serviceId,
				cmd:"saveProps",
				domain:this.domain,
				body:saveData
			},
			function(code,msg,json){
				pp.el.unmask()
				if(code > 300){
					this.processReturnMsg(code,msg,this.saveAppProps)
				}
			},
			this)
	},
	getPropPanel:function(){
		var propPanel = new Ext.grid.EditorGridPanel({
			tbar : [{
				text : "保存",
				iconCls : "save",
				handler : this.saveAppProps,
				scope : this
			}],
			title : "系统属性",
			height : 80,
			width : 350,
			clicksToEdit : 1,
			autoExpandColumn:1,
			cm : new Ext.grid.ColumnModel([{
				header : "属性",
				dataIndex : "p_key",
				width : 200,
				editor : new Ext.form.TextField()
			}, {
				header : "值",
				dataIndex : "p_value",
				width : 300,
				editor : new Ext.form.TextField()
			}]),
			store : new Ext.data.JsonStore({
				data : {},
				fields : ["p_key", "p_value"]
			})
		})
		this.loadProp()
		return propPanel
	},
	
	onSave:function(op,data){
	    if(data.target == "app"){
	        this.onSaveApp(op,data)
	    }else{
	        this.onSaveCalalog(op,data)
	    }
	},
	
	onSaveApp:function(op,data){
		if(op == "create"){
			var root = this.tree.getSelectionModel().getSelectedNode()//this.tree.getNodeById(this.domain)
			root.appendChild({
				id:data.id,
				text:data.title,
				iconCls:"app",
				target:data.target,
				type:data.type,
				leaf:true
			})
		}
		if(op == "update"){
			var n = this.tree.getNodeById(data.id)
			if(n){
				n.setText(data.title)
			}
		}
	},
	onSaveCalalog:function(op,data){
		if(op == "create"){
			//var pnode = this.tree.getNodeById(data.parentId)
			var pnode = this.tree.getSelectionModel().getSelectedNode()
			pnode.leaf = false
			var n = pnode.appendChild({
				id:data.id,
				text:data.title,
				iconCls:"module",
				target:data.target,
				leaf:true
			})
			pnode.expand()
		}
		if(op == "update"){
			var n = this.tree.getNodeById(data.id)
			if(n){
				n.setText(data.title)
			}
		}		
	},
	
	onSelect:function(data){
	   var n = this.tree.getNodeById(data.id)
	   n.select()
	   n.expand()
	},
	
	onRemove:function(data){
		var id = data.parentId || this.domain
		//var pnode = this.tree.getNodeById(id)
		var pnode = this.tree.getSelectionModel().getSelectedNode()
		var n = this.tree.getNodeById(data.id)
		pnode.removeChild(n)
	},
	
	showAppForm:function(node){
		var title = node?node.text:"新建应用"
		var m = this.pModules["_appform_"]
		if(!m){
			var cfg = {
				autoLoadSchema:false,
				showButtonOnTop:true
			}
			var cls = "app.modules.config.appConfig.AppDataView"
			$import(cls)
			m = eval("new " + cls + "(cfg)")
			m.on("save",this.onSave,this)
			m.on("remove",this.onRemove,this)
			m.on("selectNode",this.onSelect,this)
			var p = m.initPanel()
			p.title = title
			p.autoHeight = false
			this.tab.add(p)
			this.tab.doLayout()
			this.tab.activate(p)
			this.activeModules["_appform_"] = p
			this.pModules["_appform_"] = m
		}else{
			var p = this.activeModules["_appform_"]
			p.setTitle(title)
			this.tab.activate(p)
		}
		m.domain = this.domain
		if(node){
			var data = {
			    id:node.id,
			    title:title,
			    type:node.attributes.type,
			    target:node.attributes.target
			}
			m.initFormData(data)
			m.op = "update"
		}		
		return m
	},
	
	onTreeClick:function(node,e){
		var id = node.id
		var text = node.text
		node.expand()	
		this.showAppForm(node)
	},
	
	onCellContextMenu:function(e){
		e.stopEvent()
		var ep = this.propPanel
		var cmenu = this.midiMenus['app_props']
		if(!cmenu){
			var items = [{
				text:"增加属性",
				iconCls:"add",
				handler:this.addRoleProp,
				scope:this
			},{
				text:"删除属性",
				iconCls:"remove",
				handler:function(){
					var cell = ep.getSelectionModel().getSelectedCell()
					if(cell){
						var row = cell[0]
						var r = ep.getStore().getAt(row)
						ep.getStore().remove(r)
					}
				},
				scope:this
			}];
			cmenu = new Ext.menu.Menu({items:items})
			this.midiMenus['app_props'] = cmenu
		}
		cmenu.showAt([e.getPageX(),e.getPageY()])
	},
	
	addRoleProp:function(key,value){
		var ep = this.propPanel
		var record = Ext.data.Record.create([
			{name:"p_key"},
			{name:"p_value"}
		])		
		ep.getStore()
			.add(new record({p_key:typeof(key)!="object"?key:"",p_value:typeof(value)!="object"?value:""}))
		var count = ep.getStore().getCount()
		ep.getSelectionModel().select(count-1,0)
	},
	
	doNewDic:function(com){
		var domain = com.getValue()	
		var dic = this.dicId
		if(domain != globalDomain){
		    dic = domain + "." +this.dicId
		}
		var loader = this.tree.getLoader()
		loader.url = dic + ".dic"
		loader.dic = {id:dic}
		var node = this.tree.getRootNode()
		node.reload()
		//this.tree.expandAll()
		this.domain = domain
		if(this.tab.items.item(1)){
		    this.tab.remove(this.tab.items.item(1))
		    delete this.pModules["_appform_"]
		}
		this.loadProp()
	}
})