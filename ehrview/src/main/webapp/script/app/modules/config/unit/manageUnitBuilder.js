$package("app.modules.config.unit")
$import(
		"app.desktop.Module",
		"util.rmi.miniJsonRequestSync",
		"util.dictionary.TreeDicFactory",
		"util.dictionary.SimpleDicFactory"
)
app.modules.config.unit.manageUnitBuilder = function(cfg){
	this.gridCls = "app.modules.list.SimpleListView"
	this.gridEntryName = "SYS_Organization"
	this.officeEntryName = "SYS_Office"
	this.serviceId = "manageService"
	app.modules.config.unit.manageUnitBuilder.superclass.constructor.apply(this,[cfg])
	this.width = 950;
	this.height = 450
	this.localDomain = globalDomain  //config
	this.dicId = "manageUnit"
}

Ext.extend(app.modules.config.unit.manageUnitBuilder,app.desktop.Module,{
	initPanel:function(){		
		var tree = util.dictionary.TreeDicFactory.createTree({id:this.dicId,rootVisible:true})
		tree.autoScroll = true
		tree.on("click",this.onTreeClick,this)
		//tree.expand()
		this.tree = tree;
		
		var combox = util.dictionary.SimpleDicFactory.createDic({
		       id:'domain',
		       width:200,
		       editable:false,
		       autoLoad:true,
		       emptyText:"请选择域"
		})
		combox.getStore().on("load",function(s,rs){
		   combox.setValue(globalDomain)
	    },this)
		combox.on("select",this.doNewDic,this)
		
		var form = this.createForm()
		var panel = new Ext.Panel({
			border:false,
			frame:true,
		    layout:'border',
		    width:this.width,
		    height:this.height,
		    tbar:[
		        combox,'-',
		    	{text:'增加项',disabled:true,iconCls:'treeInsert',handler:this.doInsertItem,scope:this},
		    	{text:'增加子项',disabled:true,iconCls:'treeAppend',handler:this.doAppendItem,scope:this},
		    	{text:'保存项',disabled:true,iconCls:'save',handler:this.doSaveItem,scope:this},
		    	{text:'删除项',disabled:true,iconCls:'treeRemove',handler:this.doRemoveItem,scope:this}//,
		    	//{text:'部门类型维护',iconCls:'update',handler:this.doUpdateType,scope:this}
		    ],
		    items: [{
		    	layout:"fit",
		    	split:true,
		    	//collapsible:true,
		        region:'west',
		        bodyStyle:'padding:5px 0 0 0',
		        width:200,
		        items:tree
		    },{
		    	layout:"fit",
		    	split:true,
		        title: '',
		        region: 'center',
		        width: 280,
		        items:form
		    }]
		});	
		
		this.panel = panel;
		return panel
	},
	createForm:function(){
		var grid = this.getProfileList()
		
		var combox = util.dictionary.SimpleDicFactory.createDic({id:'unitType',width:250,editable:false,defaultValue:'area'})
        combox.name = 'type'
        combox.fieldLabel = '部门类型'
        combox.allowBlank = false
        this.manageType = combox
        combox.on("select",this.initGrid,this)
		
	    var form = new Ext.FormPanel({
	        labelWidth: 80, 
	        //frame:true,
	        bodyStyle:'padding:5px 20px 20px 5px',
	        //autoScroll:true,
	        defaultType: 'textfield',
	        items: [
	        	{
	        		width:'98%',
	                fieldLabel: '上级部门编号',
	                name: 'parentKey',
	                allowBlank:false,
	                disabled:true
	            },{
	            	width:'98%',
	                fieldLabel: '上级部门名称',
	                name: 'parentText',
	                disabled:true
	            },{
	            	width:'98%',
	                fieldLabel: '本部门编号',
	                allowBlank:false,
	                name: 'unitId',
	                readOnly:true
	            },{
	            	width:'98%',
	                fieldLabel: '本部门名称',
	                name: 'organizName',
	                allowBlank:false,
	                readOnly:true
	            },
	            {
	            	width:'98%',
	                fieldLabel: '组织机构代码',
	                allowBlank:false,
	                name: 'organizCode',
	                readOnly:true
	            },
	            {
	            	width:'98%',
	                fieldLabel: '部门拼音码',
	                name: 'pyCode',
	                disabled:true
	            },combox
	        ]});
	    //form.on("afterrender",this.createDropTarget,this)
	    this.form = form
	    
	    var panel = new Ext.Panel({
		    height : 400,
		    width:680,
		    frame : true,
		    autoScroll:true,
		    layout : "form",
			items:[
			   {      		     
			     items:[form]
			   },				
			   {
			     title:'机构列表',
			     layout:'fit',
			     items:[grid]			     
			   }
			]
		})		
	    this.formPanel = panel
        return panel;
	},
	
	getProfileList : function() {
		var cls = this.gridCls
		var cfg = {}
		cfg.gridDDGroup = "gridDDGroup"
		cfg.entryName = this.gridEntryName 
		cfg.autoLoadSchema = false
		cfg.autoLoadData = true;
		cfg.showButtonOnTop = true
		cfg.isCombined = true
		cfg.enableCnd = false
		cfg.height = 250
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
		this.grid.on("rowdblclick",this.onDblClick,this)
		return this.grid;
	},
	
	createDropTarget:function(form){
		var formPanelDropTarget = new Ext.dd.DropTarget(form.container, {
		      ddGroup     : 'gridDDGroup',
		      notifyEnter : function(ddSource, e, data) {
			      form.body.stopFx();
			      form.body.highlight();
		      },
		      notifyDrop  : function(ddSource, e, data){
		      	 var selectedRecord = ddSource.dragData.selections[0];
			     form.getForm().loadRecord(selectedRecord);
			     ddSource.grid.store.remove(selectedRecord);			     
			     return(true);
		    }
	    })	
	},
	
	doNewDic:function(com){
		this.setTreeRoot(com)

		this.resetButtons()
		var buttons = this.panel.getTopToolbar().items
		buttons.get(2).disable()
		buttons.get(3).disable()
		buttons.get(4).disable()
		buttons.get(5).disable()
		this.form.getForm().reset()
		
		var domain = com.getValue()
		var dic = this.getDicIdByDomain(domain,this.dicId)
		this.loadTree(this.tree,dic)

		this.manageType.store.removeAll()
		this.manageType.store.proxy = new Ext.data.HttpProxy({
			  method:"GET",
		      url:this.getDicIdByDomain(domain,'unitType') + ".dic"
		})
		this.manageType.store.load()
		
		this.domain = domain
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
	},
	
	getDicIdByDomain:function(domain, dic){
	    if(domain != globalDomain){
		    dic = domain + "." + dic
		}
		return dic
	},
	

	doInsertItem:function(){
		this.resetButtons()
		var fields = this.getFields();
		var buttons = this.panel.getTopToolbar().items
		buttons.get(2).disable()
		buttons.get(3).disable()
		buttons.get(5).disable()
		this.manageType.enable()
		var parent = null;
		
		fields.unitId.setValue("")
		fields.organizName.setValue("")
		fields.organizCode.setValue("")
		fields.pyCode.setValue("")
		fields.type.setValue({key:"",text:""})
		//fields.unitId.enable()
		this.saveItemOp = "insert"	
	
	},
	
	doAppendItem:function(){
		this.selectedParentNode = this.selectedNode
		this.resetButtons()
		var fields = this.getFields();
		var buttons = this.panel.getTopToolbar().items
		buttons.get(2).disable()
		buttons.get(3).disable()
		buttons.get(5).disable()
		this.manageType.enable()
		
		var count = this.selectedNode.childNodes.length
		if(this.selectedNode.attributes.type=='dic' && count==0){
			fields.unitId.setReadOnly(false)
		}
		var pKey  = fields.unitId.getValue()
		var pText = fields.organizName.getValue()
		fields.parentKey.setValue(pKey)
		fields.parentText.setValue(pText)
		
		fields.unitId.setValue("")
		fields.organizName.setValue("")
		fields.organizCode.setValue("")
		fields.pyCode.setValue("")
		fields.type.setValue({key:"",text:""})
		//fields.unitId.enable()
		this.saveItemOp = "append"
	},
	
	getMaxKey:function(node,flag,codeRule){ // (this.selectedNode,this.saveItemOp,"4,2,3")
		var rules = codeRule.split(",")	//规则数组
		if(node.attributes.type == "dic"){
		    parentKey = ""
		}

		var cruKey = this.fixZero(0,rules[0])
		if(flag == "insert"){
			var parNode = node.parentNode
			var parentKey = parNode.attributes.key
			var lg = parNode.childNodes.length
			for(var i=0;i<lg;i++){
				var k = parNode.childNodes[i].attributes.key
				if(k > cruKey){
					cruKey = k
				}
			}
			return this.fixZero(cruKey*1+1,parentKey.length+this.getFixCodeLength(parentKey,rules))	
		}else if(flag == "append"){
			var parentKey = node.attributes.key
			var lg = node.childNodes.length
			cruKey = parentKey + this.fixZero(1,this.getFixCodeLength(parentKey,rules))
			if(lg == 0){
				return cruKey
			} //没有子节点的情况
			for(var i=0;i<lg;i++){
				if(node.childNodes[i].attributes.key>cruKey){
					cruKey = node.childNodes[i].attributes.key
				}
			}
			return this.fixZero(cruKey*1+1,parentKey.length+this.getFixCodeLength(parentKey,rules))
		}
	},
	
	fixZero:function(num,length){
		var str = num.toString()
		if(str.length < length){
			var fixNum = length - str.length
			for(var i=0;i<fixNum;i++){
				str = "0"+str
			}
		}
		return str
	},
	getFixCodeLength:function(key,rules){
		var len = key.length
		if(len == 0){
			return rules[0]
		}
		var len1 = 0
		for(var i=0;i<rules.length;i++){
			len1 += parseInt(rules[i])
			if(len == len1){
				return parseInt(rules[i+1]) || 2
			}else
				continue
		}
		return 2
	},
	
	doSaveItem:function(){
		var fields = this.getFields();
		var pnode = this.selectedParentNode
		if(!this.validate()){
			return
		}
		if(pnode.attributes.type == 'dic'){
		   fields.parentKey.setValue("")
		}
		var data = {}
		var cmd = "updateItem"
		
		var items = this.form.items
		var n = items.getCount()
		for(var i=0; i<n; i++){
		   var f = items.get(i)
		   if(f.name == "unitId"){
		       data['key'] = f.getValue()
		       continue
		   }
		   if(f.name == "organizName"){
		       data['text'] = f.getValue()
		       continue
		   }
		   if(f.name == "organizCode"){
		       data['ref'] = f.getValue()
		       continue
		   }
		   data[f.name] = f.getValue()
		}
		
		data['dicId'] = this.dicId  //"manageUnit"
		
		if(this.saveItemOp == "insert" || this.saveItemOp == "append"){
			cmd = "createItem"
		}
		
		var result = this.saveToServer(cmd,data)
		if(result.msg == "Created"){
			var parent = null
			if(this.saveItemOp == "insert"){
				parent =  this.selectedNode.parentNode
			}else{
				parent  = this.selectedNode
			}
			parent.leaf = false
			var node = parent.appendChild({id:data.key,text:data.text,leaf:true})
			for(var id in data){
			   if(id != "key" || id != "text"){
			       node.attributes[id] = data[id]
			   }
			}
			parent.expand()
			node.select()
			node.ensureVisible()
			this.onTreeClick(node)
			this.saveItemOp = null;
		}
		else{
			if(result.code == 200){
				var node = this.selectedNode
				if(node){
					node.setText(data.text)
					for(var id in node.attributes){
						if(id=="key"||id=="text"||id=="parent"||id=="leaf"||id=="loader"||id=="id"||id=="folder"){
							continue
						}
						delete node.attributes[id]
					}
					for(var id in data){
			          if(id != "key" || id != "text"){
			             node.attributes[id] = data[id]
			          }
			        }
				}
			}
			else{
				if(result.code == 406){
					alert("字典项目编码重复,新增失败...")
				}
				else{
				 	alert(result.msg)
				}
			}
		}
	},
	
	doRemoveItem:function(){
		var fields = this.getFields();
		var key = fields.unitId.getValue()
		if(key == null){
			return;
		}
		var text = fields.organizName.getValue()
		var node = this.selectedNode
		if(node.childNodes.length > 0){
			Ext.Msg.alert("错误","[" + text + "]" + "包含下级组织机构,不能删除")
		    return
		}
		Ext.Msg.show({
		   title: '确认删除字典项',
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
		var data = {}
		var cmd = "removeItem"
		data.dicId = this.dicId   //"manageUnitDic"
		data.key = fields.unitId.getValue()
		var result = this.saveToServer(cmd,data)
		if(result.code == 200){
			var node = this.selectedNode
			if(node){
				var next = node.nextSibling || node.previousSibling
				var parent = node.parentNode
				parent.removeChild(node)
				if(parent.childNodes.length == 0){
					next = parent
					next.leaf = true
					var t = next.getUI().getIconEl()
					Ext.fly(t).parent().replaceClass("x-tree-node-collapsed","x-tree-node-leaf")
				}
				if(next){
					next.select()
					this.onTreeClick(next)
					next.ensureVisible()
				}
			}				
		}
	},
	
	onTreeClick:function(node,e){
		this.selectedNode = node
		this.form.getForm().reset()
		var fields = this.getFields()
		if(node.attributes.type == 'dic'){
			this.resetButtons()
			var buttons = this.panel.getTopToolbar().items
			buttons.get(2).disable()
			buttons.get(4).disable()
			buttons.get(5).disable()
			fields.unitId.setValue(node.id)
			fields.organizName.setValue(node.text)
		    return
		}
		
		this.selectedParentNode = node.parentNode
		this.resetButtons()
		fields.parentKey.setValue(node.parentNode.id)
	    fields.parentText.setValue(node.parentNode.text)
	    
        var data = {}
        data['key'] = node.id
        data['dicId'] = this.dicId  //"manageUnitDic"

		var cmd = "loadData"
		var result = this.saveToServer(cmd,data)
		if(result.code == 200){
			var body = result.json.body
			for(var id in body){
			   if(id == "key"){
			      fields.unitId.setValue(body[id])
			      fields.unitId.setReadOnly(true)
			      continue
			   }
			   if(id == "text"){
			      fields.organizName.setValue(body[id])
			      continue
			   }
			   if(id == "ref"){
			      fields.organizCode.setValue(body[id])
			      continue
			   }
			   if(fields[id]){
			      fields[id].setValue(body[id])
			   }			   
			}
			this.initGrid()
			this.manageType.disable()
		}
		node.expand()
	},
	resetButtons:function(){
		var buttons = this.panel.getTopToolbar().items
		buttons.each(function(b){
			b.enable()
		})
		this.saveItemOp = ""
	},
	disableAllFields:function(){
		var fields = this.getFields()
		for(var name in fields){
			fields[name].disable()
		}
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
	getWin: function(){
		var win = this.win
		var closeAction = "close"
		if(!this.mainApp){
			closeAction = "hide"
		}
		if(!win){
			win = new Ext.Window({
				id: this.id,
		        title: this.title,
		        width: this.width,
		        iconCls: 'icon-grid',
		        shim:true,
		        layout:"fit",
		        animCollapse:true,
		        items:this.initPanel(),
		        closeAction:closeAction,
		        constrainHeader:true,
		        minimizable: true,
		        maximizable: true,
		        shadow:false
            })
		    var renderToEl = this.getRenderToEl()
            if(renderToEl){
            	win.render(renderToEl)
            }
			this.win = win
		}
		return win;
	},
	
	doUpdateType:function(){
		var cmd = "typess"
		var cls = "app.modules.config.UnitTypeForm"
	    var cfg = {}
	    cfg.title = "部门类型维护"
		cfg.autoLoadSchema = false
		cfg.autoLoadData = false;
		cfg.showButtonOnTop = true
		cfg.isCombined = false
		//cfg.actions = this.actions
		var m = this.midiModules[cmd]
		if (!m) {
			$import(cls)
			var module = eval("new " + cls + "(cfg)");
			module.setMainApp(this.mainApp)
			module.opener = this
			this.midiModules[cmd] = module
			this.openWin(cmd,100,50)
		}else{
		   this.openWin(cmd,100,50)
		}
	},
	
	openWin:function(cmd,xy){
		var module = this.midiModules[cmd]
		if(module){
			var win = module.getWin()
			if(xy){
				win.setPosition(xy[0],xy[1])
			}
			win.setTitle(module.title)
			win.show()
		}
	},
	
	onDblClick:function(grid,index,e){
		var v = this.manageType.getValue()
		if(!v){
		   Ext.Msg.alert("错误","请先选择[部门类型]")
		   return
		}
        if(this.saveItemOp == "insert" || this.saveItemOp == "append"){
        	var r = grid.getSelectionModel().getSelected()
        	if(this.gridEntryName == this.officeEntryName){
        		r.data["organizCode"] = r.data["officeCode"]
        		r.data["organizName"] = r.data["officeName"]
        	}
		    this.form.getForm().loadRecord(r)
		    var v = this.getMaxKey(this.selectedNode,this.saveItemOp,"4,2,3,3")
		    var fields = this.getFields()
		    fields.unitId.setValue(v)
		}		
	},
	
	setTreeRoot:function(com){
	    var root = this.tree.getRootNode()
		root.setId(com.getValue())
		root.setText(com.getRawValue())	
	},
	
	validate:function(){
		return this.form.getForm().isValid();
	},
	
	initGrid:function(com){
		if(!com){
		   com = this.manageType
		}
		var cnd = null
		var re = util.rmi.miniJsonRequestSync({
			serviceId:this.serviceId,
			cmd:"changeType",
			domain:this.domain,
			pkey:com.getValue()
		})
		if(re.code == 200){
			var s = re.json.schema
			var key = re.json.key
			if(this.gridEntryName != s){
				this.gridEntryName = s
				var p = this.formPanel.items.item(1)
				if(this.grid){
					p.remove(this.grid)
					var grid = this.getProfileList()
				    if(grid){
				       p.add(grid)
				       p.doLayout()
				    }
				}	
			}
			if(key){
				cnd = ['eq',['$','organizType'],['s',key]]
			}
			if(this.gridModule){
			    this.gridModule.requestData.cnd = cnd
				this.gridModule.refresh()
			}
		}
	}
})
