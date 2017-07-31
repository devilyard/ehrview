$package("util.dictionary")
$import(
		"app.desktop.Module",
		"util.rmi.miniJsonRequestSync",
		"util.dictionary.TreeDicFactory"
)
util.dictionary.DictionaryBuilder = function(cfg){
	util.dictionary.DictionaryBuilder.superclass.constructor.apply(this,[cfg])
	this.width = 950;
	this.height = 450
}

Ext.extend(util.dictionary.DictionaryBuilder,app.desktop.Module,{
	errMsg:{
		ParentNotFoundOrKeyDul:"找不到父节点或者该节点的key已经存在。",
		DicLookupFailed:"字典查找失败，可能已被删除。"
	},
	initPanel:function(){
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
		    	{text:'新建字典',iconCls:"add",handler:this.doNewDic,scope:this},
		    	{text:'保存字典',disabled:true,iconCls:"save",handler:this.doSaveDic,scope:this},
		    	{text:'删除字典',disabled:true,iconCls:"remove",handler:this.doRemoveDic,scope:this},
		    	'-',
		    	{text:'增加项',disabled:true,iconCls:'treeInsert',handler:this.doInsertItem,scope:this},
		    	{text:'增加子项',disabled:true,iconCls:'treeAppend',handler:this.doAppendItem,scope:this},
		    	{text:'保存项',disabled:true,iconCls:'save',handler:this.doSaveItem,scope:this},
		    	{text:'删除项',disabled:true,iconCls:'treeRemove',handler:this.doRemoveItem,scope:this}
		    ],
		    items: [{
		    	layout:"fit",
		    	split:true,
		    	collapsible:true,
		        title: '',
		        region:'west',
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
		if(this.title){
			panel.setTitle(this.title);
		}
		tree.on("click",this.onTreeClick,this)
		tree.expand()
		this.tree = tree;
		this.panel = panel;
		return panel
	},
	createForm:function(){
		var propGrid = this.createPropGrid()
	    var form = new Ext.FormPanel({
	        labelWidth: 75, 
	        frame:true,
	        bodyStyle:'padding:2px 20px 0 0',
	        width: 580,
	        defaults: {width: '98%'},
	        autoScroll:true,
	        labelAlign:'top',
	        defaultType: 'textfield',
	        items: [
	        		{
	                fieldLabel: '字典编码',
	                allowBlank:false,
	                name: 'dicId',
	                disabled:true
	            },{
	                fieldLabel: '字典名称',
	                name: 'dicAlias',
	                disabled:true,
	                allowBlank:false
	            },{
	        		fieldLabel: '编码规则',
	                name: 'codeRule',
	                disabled:true
	        	},{
	                fieldLabel: '父节点编码',
	                name: 'parentKey',
	                disabled:true
	            },{
	                fieldLabel: '父节点名称',
	                name: 'parentText',
	                disabled:true
	            }, {
	                fieldLabel: '节点编码',
	                allowBlank:false,
	                name: 'key',
	                allowBlank:false
	            }, {
	                fieldLabel: '节点名称',
	                allowBlank:false,
	                name: 'text',
	                allowBlank:false
	            }, propGrid
	        ]});
	    this.form = form
        return form;
	},
	createPropGrid:function(){
		var propGrid = new Ext.grid.EditorGridPanel({
			height: 190,
//			width:"480",
			hidden:true,
			clicksToEdit : 1,
			autoExpandColumn:"dic_prop_value",
			cm : new Ext.grid.ColumnModel([{
			  	header : "属性",
				dataIndex : "p_key",
				width:220,
				editor : new Ext.form.TextField()
			},{
				id:"dic_prop_value",
			   	header : "值",
				dataIndex : "p_value",
				width:480,
				editor : new Ext.form.TextField()
			}]),
			store:new Ext.data.JsonStore({
			   	fields:["p_key","p_value"]
			}),
			tbar:[
				{text:"增加属性",iconCls:"add",handler:this.addProp,scope:this},
				{text:"删除属性",iconCls:"remove",handler:this.removeProp,scope:this},
				{text:"增加速记码",iconCls:"add",handler:this.addMCode,scope:this}
			]
		})
		propGrid.on("rowcontextmenu",this.onContextMenu,this)
		this.propGrid = propGrid
		return propGrid
	},
	
	onContextMenu:function(grid,index,e){
		e.stopEvent()
		this.propGrid.getSelectionModel().select(index,0)
		var cmenu = this.midiMenus['dic_props']
		if(!cmenu){
			var items = [{
				text:"增加属性",
				iconCls:"add",
				handler:this.addProp,
				scope:this
			},{
				text:"删除属性",
				iconCls:"remove",
				handler:this.removeProp,
				scope:this
			}];
			cmenu = new Ext.menu.Menu({items:items})
			this.midiMenus['dic_props'] = cmenu
		}
		cmenu.showAt([e.getPageX(),e.getPageY()])
	},
	addMCode:function(){
		var hasMCode = false
		var propStore = this.propGrid.getStore()
		propStore.each(function(r){
			if(r.data["p_key"] == "速记码"){
				hasMCode = true
				return false
			}
		})
		if(!hasMCode){
			this.addProp("速记码","")
		}		
	},
	addProp:function(key,value){
		var record = Ext.data.Record.create([
			{name:"p_key"},
			{name:"p_value"}
		])
		var r = new record({p_key:typeof(key)=="string"?key:"",p_value:typeof(value)=="string"?value:""})
		this.propGrid.getStore().add(r)
		var count = this.propGrid.getStore().getCount()
		if(key == "速记码"){
			this.propGrid.startEditing(count-1,1)
		}else
			this.propGrid.startEditing(count-1,0)
	},
	removeProp:function(){
		var cell = this.propGrid.getSelectionModel().getSelectedCell()
		if(cell){
			var row = cell[0]
			var r = this.propGrid.getStore().getAt(row)
			this.propGrid.getStore().remove(r)
		}
	},
	doNewDic:function(){
		this.resetButtons()
		this.form.getForm().reset()
		this.disableAllFields()
		var fields = this.getFields();
		var buttons = this.panel.getTopToolbar().items
		buttons.get(1).enable()
		buttons.get(4).disable()
		buttons.get(5).disable()
		buttons.get(6).disable()
		buttons.get(7).disable()
		fields.dicId.enable()
		fields.dicAlias.enable()
		this.form.getForm().isValid()
	},
	doSaveDic:function(){
		var fields = this.getFields();
		var data = {}
		fields.dicId.setValue(Ext.util.Format.trim(fields.dicId.getValue()));
		fields.dicAlias.setValue(Ext.util.Format.trim(fields.dicAlias.getValue()));
		if(!fields.dicId.isValid() || !fields.dicAlias.isValid()){
			return
		}
		data.key = fields.dicId.getValue()
		data.text = fields.dicAlias.getValue()
		var result = this.saveToServer("saveDic",data)
		if(result.msg == "Created"){
			var root = this.tree.getRootNode()
			var node = root.appendChild({key:data.key,text:data.text,type:'dic'})
			node.expand()
			node.select()
			node.ensureVisible()
			this.onTreeClick(node)
		}
		else{
			node  = this.selectedNode
			node.setText(data.text)
		}
	},
	doRemoveDic:function(){
		var fields = this.getFields();
		var dicId = fields.dicId.getValue()
		var dicText = fields.dicAlias.getValue()
		if(dicId == ""){
			return;
		}
		var text = fields.text.getValue()
		Ext.Msg.show({
		   title: '确认删除字典',
		   msg: '删除[' + dicText + ']将无法回复，是否继续?',
		   modal:false,
		   width: 300,
		   buttons: Ext.MessageBox.OKCANCEL,
		   multiline: false,
		   fn: function(btn, text){
		   	 if(btn == "ok"){
		   	 	this.processDicRemove();
		   	 }
		   },
		   scope:this
		})		
	},
	processDicRemove:function(){
		var fields = this.getFields();
		var id = fields.dicId.getValue()
		if(id == ""){
			return;
		}
		var result = this.saveToServer("removeDic",{key:id})
		if(result.code == 200){
			var node = this.selectedNode
			if(node){
				var next = node.nextSibling || node.previousSibling
				node.parentNode.removeChild(node)
				this.form.getForm().reset()
				if(next){
					this.onTreeClick(next)
					next.ensureVisible()
				}
			}
		}
	},
	doInsertItem:function(){
		this.resetButtons()
		this.disableAllFields()
		var fields = this.getFields();
		var buttons = this.panel.getTopToolbar().items
		buttons.get(0).disable()
		buttons.get(1).disable()
		buttons.get(2).disable()
		buttons.get(5).disable()
		buttons.get(7).disable()
		var parent = null;
		if(this.selectedNode.attributes.type){
			fields.parentKey.setValue("")
			fields.parentText.setValue("")
		}
		else{
			parent =  this.selectedNode.parentNode;
			if(!parent.attributes.type){
				var pKey = parent.attributes.key
				var pText = parent.attributes.text
				fields.parentKey.setValue(pKey)
				fields.parentText.setValue(pText)
			}
		}
		fields.key.setValue("")
		fields.text.setValue("")
		var codeRule = fields.codeRule.getValue()
		fields.text.enable()	
		if(codeRule.length == 0){
			fields.key.enable()
			fields.key.focus()
		}else{
			var nextKey = this.getMaxKey(this.selectedNode.parentNode,"insert",codeRule)
			fields.key.setValue(nextKey)
			fields.text.focus()
		}			
		this.propGrid.getStore().removeAll()
		this.saveItemOp = "insert"	
		this.form.getForm().isValid()
	},
	doAppendItem:function(){
		this.resetButtons()
		this.disableAllFields()
		var fields = this.getFields();
		var buttons = this.panel.getTopToolbar().items
		buttons.get(0).disable()
		buttons.get(1).disable()
		buttons.get(4).disable()
		buttons.get(5).disable()
		buttons.get(2).disable()
		buttons.get(7).disable()
		var pKey  = fields.key.getValue()
		var pText = fields.text.getValue()
		fields.parentKey.setValue(pKey)
		fields.parentText.setValue(pText)
		fields.key.setValue("")
		fields.text.setValue("")
		var codeRule = fields.codeRule.getValue()
		fields.text.enable()
		if(codeRule.length == 0){
			fields.key.enable()
			fields.key.focus()
		}else{
			var nextKey = this.getMaxKey(this.selectedNode,"append",codeRule)
			fields.key.setValue(nextKey)
			fields.text.focus()
		}		
		this.propGrid.getStore().removeAll()
		this.saveItemOp = "append"
		this.form.getForm().isValid()
	},
	getMaxKey:function(node,flag,codeRule){
		var rules = codeRule.split(",")						//规则数组 		
		var parentKey = node.attributes.key
		if(node.attributes.type){
				parentKey = ""
		}
		var cruKey = this.fixZero(0,rules[0])
		var lg = node.childNodes.length
		if(flag == "insert"){
			for(var i=0;i<lg;i++){
				var k = node.childNodes[i].attributes.key
				if(k > cruKey){
					cruKey = k
				}
			}
			return this.fixZero(cruKey*1+1,parentKey.length+this.getFixCodeLength(parentKey,rules))	
		}else if(flag == "append"){
			cruKey = this.fixZero(1,this.getFixCodeLength(parentKey,rules))
			if(lg == 0){
				return parentKey+cruKey
			} //没有子节点的情况
			
			cruKey = this.fixZero(0,this.getFixCodeLength(parentKey,rules))
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
		fields.key.setValue(Ext.util.Format.trim(fields.key.getValue()));
		fields.text.setValue(Ext.util.Format.trim(fields.text.getValue()));
		if(!fields.key.isValid() || !fields.text.isValid()){
			return
		}
		var data = {}
		var cmd = "updateItem"
		data.dicId = fields.dicId.getValue()
		data.parentKey = fields.parentKey.getValue()
		data.key = fields.key.getValue()
		data.text = fields.text.getValue()
		if(this.saveItemOp == "insert" || this.saveItemOp == "append"){
			cmd = "createItem"
		}
		data.props = []
		var propStore = this.propGrid.getStore()
		propStore.each(function(r){
			if(r.data["p_key"].length>0){
				if(r.data["p_key"]=="速记码"){
					r.data["p_key"] = "mCode"
				}
				if(r.data["p_key"]=="拼音码"){
					r.data["p_key"] = "pyCode"
				}
				data.props.push({name:r.data["p_key"],value:r.data["p_value"]})
			}
		})
		var result = this.saveToServer(cmd,data)
		if(result.msg == "Created"){
			var parent = null
			if(this.saveItemOp == "insert"){
				if(this.selectedNode.attributes.type){
					parent =  this.selectedNode;
				}
				else{
					parent  = this.selectedNode.parentNode
				}
			}
			else{
				parent  = this.selectedNode
			}
			parent.leaf = false
			var node = parent.appendChild({key:data.key,text:data.text,leaf:true})
			for(var i=0;i<data.props.length;i++){
				node.attributes[data.props[i].name] = data.props[i].value
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
					for(var i=0;i<data.props.length;i++){
						node.attributes[data.props[i].name] = data.props[i].value
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
		var dicText = fields.dicAlias.getValue()
		var key = fields.key.getValue()
		if(key == null){
			return;
		}
		var text = fields.text.getValue()
		Ext.Msg.show({
		   title: '确认删除字典项',
		   msg: '[' + dicText + '].[' + text +']' +'删除将无法回复，是否继续?',
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
		data.dicId = fields.dicId.getValue()
		data.key = fields.key.getValue()
		var result = this.saveToServer(cmd,data)
		if(result.code == 200){
			var node = this.selectedNode
			if(node){
				var next = node.nextSibling || node.previousSibling
				var parent = node.parentNode
				parent.removeChild(node)
				if(parent.childNodes.length == 0){
					next = parent
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
		var n = node
		while(n){
			if(n.attributes.type){
				break
			}
			n = n.parentNode
		}
		this.resetButtons()
		this.form.getForm().reset()
		this.disableAllFields()
		var buttons = this.panel.getTopToolbar().items
		var fields = this.getFields()
		fields.dicId.setValue(n.attributes.key)
		fields.dicAlias.setValue(n.attributes.text)
		fields.codeRule.setValue(n.attributes.codeRule)
		this.propGrid.getStore().removeAll()
		if(node == n){
			fields.dicId.disable()
			fields.dicAlias.enable()
			buttons.get(1).enable()
			buttons.get(2).enable()
			buttons.get(4).disable()		
			buttons.get(5).enable()
			buttons.get(6).disable()
			buttons.get(7).disable()
			this.propGrid.hide()
		}
		else{
			buttons.get(1).disable()
			buttons.get(2).disable()
			buttons.get(4).enable()
			buttons.get(5).enable()
			buttons.get(6).enable()	
			buttons.get(7).enable()			
			fields.key.setValue(node.attributes.key)
			fields.text.setValue(node.attributes.text)	
			//fields.key.enable()
			fields.text.enable()
			if(node.parentNode.attributes.type != "dic"){
				fields.parentKey.setValue(node.parentNode.attributes.key)
				fields.parentText.setValue(node.parentNode.text)
			}
			fields.dicId.setValue(n.attributes.key)
			this.propGrid.show()
			var attributes = this.selectedNode.attributes
			for(var id in attributes){
				if(id=="key"||id=="text"||id=="parent"||id=="leaf"||id=="loader"||id=="id"||id=="folder"){
					continue
				}
				var _id = id
				if(id=="pyCode"){
					_id="拼音码"
				}
				if(id=="mCode"){
					_id="速记码"
				}
				this.addProp(_id,attributes[id])
			}
		}
		node.expand()
	},
	resetButtons:function(){
		var buttons = this.panel.getTopToolbar().items
		buttons.each(function(b){
			b.enable()
		})
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
		if(this.form && this.form.el){
			this.form.el.mask("在正保存数据...","x-mask-loading")
		}
		var url = this.tree.getLoader().url;
		var folder = url.substring("dictionaries.".length);
		folder = folder.substring(0,folder.length-".dic".length).replace(".","/");
		var rel = util.rmi.miniJsonRequestSync({
			serviceId:'dictionaryUtil',
			cmd:cmd,
			body:data,
			folder:folder
		})
		if(this.form && this.form.el){
			this.form.el.unmask()
		}
		var code = rel.code
		var msg = rel.msg
		if(code > 300){
			this.processReturnMsg(code,msg,this.saveToServer,[cmd,data],this.errMsg);
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
	}	
})
