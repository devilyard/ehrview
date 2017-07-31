$package("app.modules.config")
$import(
		"app.desktop.Module",
		"util.rmi.miniJsonRequestSync",
		"util.dictionary.SimpleDicFactory",
		"util.dictionary.TreeDicFactory"
)
app.modules.config.OrgaConfigForm = function(cfg){
    app.modules.config.OrgaConfigForm.superclass.constructor.apply(this,[cfg])
	this.width = 950;
	this.entryName = "OrganizationConfig"
	this.serviceId="configuration"
	this.saveOperate = "save"
	this.findOperate = "loadById"
	this.pyCode = ['py',['$','r.name']]
	this.height = 450
	Ext.apply(this,app.modules.common)
}
Ext.extend(app.modules.config.OrgaConfigForm,app.desktop.Module,{
	
    initPanel: function(){  	
    	var propGrid = this.createPropGrid()
        var combox = util.dictionary.SimpleDicFactory.createDic({id:'unitType',width:250,editable:false})
        combox.name = 'type'
        combox.fieldLabel = '部门类型'
        combox.allowBlank = false
        combox.on("select",this.initPropGrid,this)

	    var form = new Ext.FormPanel({
	        labelWidth: 75, 
	        frame:true,
	        bodyStyle:'padding:8px',
	        width: 400,
	        autoScroll:true,
	        tbar:[{text:'保存项',iconCls:'save',handler:this.doSaveItem,scope:this}],
	        labelAlign:'top',	        
	        defaultType: 'textfield',
	        items: [
	        	{
	        		width:'98%',
	                fieldLabel: '父部门编号',
	                name: 'parentKey',
	                disabled:true
	            },{
	            	width:'98%',
	                fieldLabel: '父部门名称',
	                name: 'parentText',
	                disabled:true
	            },{
	            	width:'98%',
	                fieldLabel: '部门编号',
	                allowBlank:false,
	                name: 'id'
	            },{
	            	width:'98%',
	                fieldLabel: '部门名称',
	                name: 'name',
	                allowBlank:false
	            },
	            {
	            	width:'98%',
	                fieldLabel: '部门拼音码',
	                name: 'pyCode',
	                disabled:true
	            },combox,propGrid
	        ]});
	        
	    this.form = form
        return form;
    },
    
    createPropGrid:function(){
		var propGrid = new Ext.grid.EditorGridPanel({
			title:'机构基本信息',
			tbar:[
				{text:"增加",handler:this.addProp,scope:this,iconCls:"add"},
				{text:"删除",handler:this.removeProp,scope:this,iconCls:"remove"}
			],
			height: 180,
			width:'98%',
			clicksToEdit : 1,
			autoExpandColumn:1,
			cm : new Ext.grid.ColumnModel([{
			  	header : "名称",
				dataIndex : "key",
				width:200,
				editor : new Ext.form.TextField()
			},{
			   	header : "值",
				dataIndex : "text",
				width:400,
				editor : new Ext.form.TextField()
			}]),
			store:new Ext.data.JsonStore({
			   	data:{},
			   	fields:["key","text"]
			})
		})
		this.propGrid = propGrid
		propGrid.on("contextmenu",this.onCellContextMenu,this)
		return this.propGrid
	},
	
	doNew:function(node){
		var pid = node.id
		var ptext = node.text
		this.op = "create"
		if(!this.data){
		    this.data = {}
		}
		var form = this.form.getForm()
		form.reset()		
		var f_pid = form.findField("parentKey")
		var f_ptext = form.findField("parentText")
		f_pid.setValue(pid)
		f_ptext.setValue(ptext)
		var idf = form.findField("id")
		idf.enable()
		this.propGrid.getStore().removeAll()
	},
	
	onCellContextMenu:function(e){
		e.stopEvent()
		var ep = this.propGrid
		var cmenu = this.midiMenus['module_args']
		if(!cmenu){
			var items = [{
				text:"增加参数",
				iconCls:"add",
				handler:this.addProp,
				scope:this
			},{
				text:"删除参数",
				iconCls:"remove",
				handler:this.removeProp,
				scope:this
			}];
			cmenu = new Ext.menu.Menu({items:items})
			this.midiMenus['module_args'] = cmenu
		}
		cmenu.showAt([e.getPageX(),e.getPageY()])
	},
	
	addProp:function(key,value){
		key = typeof(key)!="object"?key:""
		value = typeof(value)!="object"?value:""
		var ep = this.propGrid
		var record = Ext.data.Record.create([
			{name:"key"},
			{name:"text"}
		])
		ep.getStore().add(new record({key:key,text:value}))
		var count = ep.getStore().getCount()
		ep.getSelectionModel().select(count-1,0)
	},
	
	removeProp:function(){
		var cell = this.propGrid.getSelectionModel().getSelectedCell()
		if(cell){
			var row = cell[0]
			var r = this.propGrid.getStore().getAt(row)
			this.propGrid.getStore().remove(r)
		}
	},
	
	doSaveItem:function(){
		var form = this.form.getForm()
		if(!form.isValid()){
		   return
		}	
		var values = {}
		var arry = ['id','name','type','pyCode']
		for(var i=0; i<arry.length; i++){
		    var f = form.findField(arry[i])
		    if(f){
		    	if(arry[i] == 'pyCode'){
		    	   values[arry[i]] = this.pyCode
		    	   continue
		    	}
		        values[arry[i]] = f.getValue()
		    }
		}		
		values['parent'] = form.findField("parentKey").getValue()   //this.parent
		var st = this.propGrid.getStore()
		var props = {}
		for(var num=0;num<st.getCount();num++){
			var r = st.getAt(num)
			if(r.get("key")){
			   props[r.get("key")] = r.get("text")
			}
			values["props"] = props
		}
		this.operateToServer(values,this.saveOperate)
	},
	
	loadData:function(node){		
		if(!this.data){
		    this.data = {}
		}
		this.data['parentKey'] = node.parentNode.id
		this.data['parentText'] = node.parentNode.text
		this.data['name'] = node.text
		Ext.apply(this.data,node.attributes)
		this.operateToServer(node.id, this.findOperate);
	},
	
	initFormData:function(data){
		var form = this.form.getForm()		
		for(var id in data){
		   var v = data[id]
		   if(id == "props"){
		   	  this.propGrid.getStore().removeAll()
		      for(var j=0;j<v.length;j++){
				 this.addProp(v[j].name,v[j].value)
			  }
		   }
		   var f = form.findField(id)
		   if(f){
		      f.setValue(v)
		   }
		}
		var idf = form.findField("id")
		if(idf){
		   idf.setDisabled(true)
		   this.initDataId = idf.getValue()
		}
	},
	
	operateToServer:function(saveData ,operate){
		if(!this.fireEvent("beforeSave",this.entryName,this.op,saveData)){
			return;
		}
		this.saving = true
		this.form.el.mask("正在保存数据...","x-mask-loading")
		util.rmi.jsonRequest({
				serviceId:this.serviceId,
				op:this.op,
				operate:operate,
				className:this.entryName,
				body:saveData,
				module:this._mId,  //增加module的id
				isValid:false
			},
			function(code,msg,json){
				this.form.el.unmask()
				this.saving = false
				if(code > 300){
					this.processReturnMsg(code,msg,this.operateToServer,[saveData,operate]);
					return
				}
				if(json.body){		
					Ext.apply(this.data,json.body);
					if(operate != "loadById"){
					   this.setKeyIdDisable()
					   this.fireEvent("save",saveData,this.op,this.leaf)
					}else{
					   this.initFormData(this.data)
					}					
				}
				this.op = "update"
			},
			this)//jsonRequest
	},

	setKeyIdDisable:function(){
		var form = this.form.getForm()
		var idf = form.findField("id")
		if(idf){
		   idf.setDisabled(true)
		   this.initDataId = idf.getValue()
		}
	}
})