$package("app.modules.config")

$styleSheet("index.indexPage")
$import(
	"app.desktop.Module",
	"org.ext.ux.TabCloseMenu",
	"app.modules.common",
	"util.dictionary.TreeDicFactory",
	"util.rmi.jsonRequest",
	"app.modules.list.SimpleListView"
)

app.modules.config.UnitTypeForm = function(cfg){
	this.serviceId="organizTypeService"
	this.gridCls = "app.modules.list.SimpleListView"
	this.height = 500
	this.width= 800
	this.pfix = ".png"
	this.dicId = "unitType"
	this.pModules = {}
	this.localDomain = globalDomain
	this.initCmd = "doCreateGrid"
	Ext.apply(this,app.modules.common)
	app.modules.config.UnitTypeForm.superclass.constructor.apply(this,[cfg])
}

Ext.extend(app.modules.config.UnitTypeForm, app.desktop.Module,{
	initPanel:function(){
		
		var combox = util.dictionary.SimpleDicFactory.createDic({
		       id:'domain',
		       width:200,
		       editable:false,
		       emptyText:"请选择域",
		       autoLoad:true
		})
		combox.getStore().on("load",function(s,rs){
		   combox.setValue(globalDomain)
	    },this)
		combox.on("select",this.doNewDic,this)
		
		var tree = util.dictionary.TreeDicFactory.createTree({id:this.dicId,keyNotUniquely:true})
		tree.autoScroll = true
		var form = this.createForm()
		var panel = new Ext.Panel({
			border:false,
			frame:true,
		    layout:'border',
		    width:this.width,
		    height:this.height,
		    tbar:[
		        combox,'-',
		    	{text:'增加',iconCls:'treeInsert',handler:this.doInsertItem,scope:this},
		    	{text:'保存',disabled:true,iconCls:'save',handler:this.doSaveItem,disabled:true,scope:this},
		    	{text:'删除项',disabled:true,iconCls:'treeRemove',handler:this.doRemoveItem,scope:this}
		    ],
		    items: [{
		    	layout:"fit",
		    	split:true,
		    	bodyStyle:'padding:5px 0 0 0',
		        region:'west',
		        width:200,
		        items:tree
		    },{
		    	layout:"fit",
		    	split:true,
		        title: '',
		        region: 'center',
		        width: 300,
		        items:form
		    }]
		});	
		tree.on("click",this.onTreeClick,this)
		tree.expand()
		this.tree = tree;
		this.panel = panel;
		return panel
	},
	createForm:function(){
		var roles = this.getDataView()
		this.roles = roles
	    var form = new Ext.FormPanel({
	        labelWidth: 75, 
	        frame:true,
	        bodyStyle:'padding:2px 20px 0 0',
	        //width: 1000,
	        autoScroll:true,
	        labelAlign:'top',
	        defaultType: 'textfield',
	        items: [
	        	{
	                fieldLabel: '机构类型编码',
	                name: 'key',
	                allowBlank:false,
	                readOnly:true,
	                width:'98%'
	            }, {
	                fieldLabel: '机构类型名称',
	                name: 'text',
	                readOnly:true,
	                allowBlank:false,
	                width:'98%'
	            }, roles
	        ]});
	    this.form = form
       	var grid=this.getProfileList()
	    var panel = new Ext.Panel({
		    height : 400,
		    width:400,
		    frame : true,
		    autoScroll:true,
		    layout : "form",
			items:[
			   {      		     
			     items:[form]
			   },				
			   {
			     layout:'fit',
			     items:[grid]			     
			   }
			]
		})	
	    this.panel = panel
        return panel;
	},
	
	getProfileList:function(){
		var cls = this.gridCls
		var cfg = {}
		cfg.entryName = this.gridEntryName
		cfg.listServiceId=this.serviceId
		cfg.height = 250
		cfg.width= 200
		cfg.disablePagingTbr=true
		cfg.showButtonOnPT=true
		cfg.serverParams={cmd:this.initCmd}
		var module = eval("new " + cls + "(cfg)");
		var schema = {
			items:[
				{"id":"key","alias":"机构类型编码","pkey":"true","width":"190","acValue":"1111","type":"string"},
				{"id":"text","alias":"机构类型名称","width":"210","acValue":"1111","type":"string"}
			]
		}
		var lp = module.initPanel(schema)			
		this.grid = lp
		this.grid.on("rowdblclick",this.onDblClick,this)
		return this.grid;
	},
	onDblClick:function(grid,index,e){
		if(this.cmd=="createItem"){
			var selectedRecord = grid.getSelectionModel().getSelected()
			this.form.getForm().loadRecord(selectedRecord)
			var fields=this.getFields()
		}
	},
	
	getDataView:function(){
		this.itemfields = ['id','title','iconCls']
		var store = new Ext.data.Store({
	        reader: new Ext.data.JsonReader({},this.itemfields),
	        data:[]
	    })
		
		var dataview = new Ext.DataView({
            store: store,
            tpl:this.getIconTpl(),
		    cls :'unitType',
            itemSelector: 'ul',
            overClass   : 'utselect',
            singleSelect: true,
            autoScroll  : true,
            height:90

        })
        this.dataview = dataview

		var rolepanel = new Ext.Panel({
			width:'98%',
			border:false,
			frame:false,
			name:'rolelist',
			tbar:[{text:'增加',iconCls:'add',handler:this.doAddRoles,disabled:true,scope:this},'-',
     	          {text:'删除',iconCls:'remove',handler:this.doDeleteRoles,disabled:true,scope:this}
     	    ],
		    items: dataview
		})
		return rolepanel
	},
	
	getIconTpl:function(){
		var home = ClassLoader.stylesheetHome + "index/images/"
    	var tpl = this.iconTpl
    	if(!tpl){
    		tpl = new Ext.XTemplate(
    		   '<tpl for=".">',
		          '<ul>',
                    '<li><img src="'+ home + '/{iconCls}'+ this.pfix +'" width="32" height="32" /></li>',
                    '<li>{title}</li>',
                  '</ul>',
		       '</tpl>'            
            )
			this.iconTpl = tpl;
    	}
    	return tpl;
	},
	
	doNewDic:function(com){
		var buttons = this.panel.getTopToolbar().items
		buttons.get(3).disable()
		buttons.get(4).disable()
		var tbars  = this.roles.getTopToolbar().items
		tbars.get(0).disable()
		tbars.get(2).disable()
		//角色dataView数据清空
		this.resetDataView()
		this.form.getForm().reset()
		var domain = com.getValue()		
		var dic = this.getDicIdByDomain(domain,this.dicId)//this.dicId
		this.loadTree(this.tree,dic)
		this.domain = domain
	},
	
	resetDataView:function(){
		this.viewData = []
		this.dataview.getStore().loadData([])
	},
	
	loadTree:function(tree, dic){
	    var loader = tree.getLoader()
	    if(!loader.hasListener("loadexception")){
		   loader.on("loadexception",function(){

		   },this)
		}
		loader.url = dic + ".dic"
		loader.dic = {id:dic}
		var node = tree.getRootNode()
		node.reload()
		tree.expandAll()
	},
	
	getDicIdByDomain:function(domain, dic){
	    if(domain != globalDomain){
		    dic = domain + "." + dic
		}
		return dic
	},
	
	doInsertItem:function(){
		var buttons = this.panel.getTopToolbar().items
		buttons.get(3).enable()
		buttons.get(4).disable()
		var tbars = this.roles.getTopToolbar().items
		tbars.get(0).enable()
		tbars.get(2).disable()
		this.cmd = "createItem"
		//角色dataView清空
		this.resetDataView()
		this.form.getForm().reset()
		var fields = this.getFields()
		fields.key.focus()
	},
	doSaveItem:function(){
		if(!this.form.getForm().isValid()){
			return
		}
		if(this.viewData.length == 0){
			Ext.Msg.alert("错误","角色不能为空")
			return
		}
		var fields = this.getFields();
		
		var rs = []
		for(var i=0; i<this.viewData.length; i++){
			var m = this.viewData[i].id
			rs.push(m)
		}		
		var data = {
			dicId:this.dicId,
			key:fields.key.getValue(),
			text:fields.text.getValue(),
			roles:rs.join(",")
		}

		var result = this.saveToServer(this.cmd,data)
		if(result.code == 200){
			if(result.msg == "Created"){
				this.cmd = "updateItem";
				var parent = this.tree.getRootNode()
				var node = parent.appendChild({key:data.key,text:data.text,leaf:true})
				for(var id in data){
			       if(id != "key" || id != "text"){
			          node.attributes[id] = data[id]
			       }
			    }
			    node.select()
			    node.ensureVisible()
			    this.onTreeClick(node)
			}
			if(result.msg == "Update"){
				var node = this.selectedNode
				node.setText(data.text)
				for(var id in data){
			       if(id != "key" || id != "text"){
			          node.attributes[id] = data[id]
			       }
			    }
			    node.select()
			    node.ensureVisible()
			    this.onTreeClick(node)
				
			}
		}		
		else{
			Ext.Msg.alert(result.msg)
		}
	},
	doRemoveItem:function(){
		var node = this.selectedNode
		if(!node){
			return
		}
		var fields = this.getFields();
		var text = fields.text.getValue()
		Ext.Msg.show({
		   title: '确认删除机构类型',
		   msg: '[' + text +']' +'删除将无法回复，是否继续?',
		   modal:false,
		   width: 300,
		   buttons: Ext.MessageBox.OKCANCEL,
		   multiline: false,
		   fn: function(btn, text){
		   	 if(btn == "ok"){
		   	 	this.processItemRemove();
		   	 }
		   },
		   scope:this
		})		
	
	},
	processItemRemove:function(){
		var fields = this.getFields();
		var key = fields.key.getValue()
		var data = {
			dicId:this.dicId,
			key:key
		}
		var cmd = "removeItem"
		var result = this.saveToServer(cmd,data)
		if(result.code == 200){
			var node = this.selectedNode
			if(node){
				this.resetDataView()
				var next = node.nextSibling || node.previousSibling
				var parent = node.parentNode
				parent.removeChild(node)
				if(next){
					next.select()
					next.ensureVisible()
					this.onTreeClick(next)
				}else{
				   var buttons = this.panel.getTopToolbar().items
		           buttons.get(3).disable()
		           buttons.get(4).disable()
		           this.form.getForm().reset();
		           var rbars = this.roles.getTopToolbar().items
		           rbars.get(0).disable()
		           rbars.get(2).disable()
				}
			}				
		}
	},
	onTreeClick:function(node,e){
		var buttons = this.panel.getTopToolbar().items
		buttons.get(3).enable()
		buttons.get(4).enable()
		this.selectedNode = node
		this.cmd = "updateItem"
		this.form.getForm().reset();
		var n = node
		var fields = this.getFields()
		fields.key.setValue(n.attributes.key)
		fields.text.setValue(n.attributes.text)
		//角色操作按钮启用
		var rbars = this.roles.getTopToolbar().items
		rbars.get(0).enable()
		rbars.get(2).enable()
		//设置角色dataView数据
		var data = this.loadRole(node)
		this.viewData = data
		this.dataview.getStore().loadData(data)
	},
	
	loadRole:function(node){
		var cmd = "loadRole"
		var data = {}
		data.roles = node.attributes.roles
		var result = this.saveToServer(cmd,data)
		return result.json.body
	},
	
	getFields:function(){
		var fields = this.fields
		if(!fields){
			var items = this.form.items
			var n = items.getCount()
			var fields = {}
			for(var i = 0; i < n; i ++){
				var f = items.get(i)
				if(f.name)
					fields[f.name] = f
			}
			this.fields = fields
		}
		return fields
	},
	saveToServer:function(cmd,data){
		if(!this.domain){
		   this.domain = this.localDomain
		}
		
		if(this.form && this.form.el){
			this.form.el.mask("在正保存数据...","x-mask-loading")
		}
		var rel = util.rmi.miniJsonRequestSync({
			serviceId:this.serviceId,
			cmd:cmd,
			domain:this.domain,
			body:data
		})
		if(this.form && this.form.el){
			this.form.el.unmask()
		}
		var code = rel.code
		var msg = rel.msg
		if(code > 300){
			this.processReturnMsg(code,msg,this.saveToServer,[cmd,data]);
			return
		}
		return rel;
	},
	
	doAddRoles:function(){
		if(!this.domain){
		   this.domain = this.localDomain
		}
		var cls = "app.modules.config.unit.UnitTypeRoleForm"
		var m = this.pModules["addrole"]
		if(!m){
			$import(cls)
			m = eval("new " + cls + "({})")
			m.setMainApp(this.mainApp)
			m.on("save",this.onSaveRole,this)
			this.pModules["addrole"] = m
		}
		var win = m.getWin()
		if(win){
		   win.show()
		}
		m.domain = this.domain
		m.loadDic()
	},
	
	onSaveRole:function(m,data){
		for(var i=0; i<this.viewData.length; i++){
			if(this.viewData[i].id == data.id){
				Ext.Msg.alert("错误","该角色已经存在")
				return
			}
		}
		this.viewData.push(data)
		this.dataview.getStore().loadData(this.viewData)
		var tbars = this.roles.getTopToolbar().items
		tbars.get(2).enable()
		m.win.hide()
		
	},	
	
	doDeleteRoles:function(){
		var key = this.getFields().key.getValue()
		var views = this.dataview.getSelectedRecords()
		var role = views[0].data
		if(role == null){
		   return
		}
		var data={
		   key : key,
		   roleId : role.id
		}
		Ext.Msg.show({
		   title: '确认删除记录[' + role.title + ']',
		   msg: '删除操作将无法恢复，是否继续?',
		   modal:true,
		   width: 300,
		   buttons: Ext.MessageBox.OKCANCEL,
		   multiline: false,
		   fn: function(btn, text){
		   	 if(btn == "ok"){
				var result = this.saveToServer("removeRole",data)
				if(result.code == 200){
		   	 		for(var i=0; i<this.viewData.length; i++){
		   	 			var m = this.viewData[i]
		   	 			if(m.id == role.id){
		   	 				this.viewData.remove(m)
		   	 			}
		   	 	    }
		   	 	    this.dataview.getStore().loadData(this.viewData)
				}
		   	 }
		   },scope:this
		})	
	},
	
	getWin: function(){
		var win = this.win
		if(!win){
			win = new Ext.Window({
				id: this.id,
		        title: this.title,
		        width: 800,
		        height:500,
		        iconCls: 'icon-grid',
		        shim:true,
		        layout:"fit",
		        animCollapse:true,
		        items:this.initPanel(),
		        closeAction:'hide',
		        constrainHeader:true,
		        shadow:false
            })
		    var renderToEl = this.getRenderToEl()
            if(renderToEl){
            	win.render(renderToEl)
            }
			this.win = win
		}
		return win;
	}	
})