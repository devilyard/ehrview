$package("app.modules.list")

$import(
	"app.modules.list.SimpleListView",
	"util.dictionary.DictionaryLoader",
	"util.widgets.MyEditorGrid"
	)

app.modules.list.EditorListView = function(cfg){
	cfg.gridCreator = util.widgets.MyEditorGrid
	app.modules.list.EditorListView.superclass.constructor.apply(this,[cfg])
}
Ext.extend(app.modules.list.EditorListView, app.modules.list.SimpleListView,{
	initPanel:function(sc){
		var grid = app.modules.list.EditorListView.superclass.initPanel.call(this,sc)
		grid.on("afteredit",this.afterCellEdit,this)
		grid.on("beforeedit",this.beforeCellEdit,this)
		return grid
	},
	beforeCellEdit:function(e){
		var f = e.field
		var record = e.record
		var op = record.get("_opStatus")
		var cm = this.grid.getColumnModel()
		var c = cm.config[e.column]
		var enditor = cm.getCellEditor(e.column)
		var it = c.schemaItem
		var ac =  util.Accredit;
		if(op == "create"){
			if(!ac.canCreate(it.acValue)){
				return false
			}
		}
		else{
			if(!ac.canUpdate(it.acValue)){
				return false
			}				
		}
		if(it.dic){
			e.value = {key:e.value,text:record.get(f + "_text")}
		}
		if(this.fireEvent("beforeCellEdit",it,record,enditor.field,e.value)){
			return true
		}
	},
	afterCellEdit:function(e){
		var f = e.field
		var v = e.value
		var record = e.record
		var cm = this.grid.getColumnModel()
		var enditor = cm.getCellEditor(e.column,e.row)
		var c = cm.config[e.column]
		var it = c.schemaItem
		var field = enditor.field
		if(it.dic){
			record.set(f + "_text",field.getRawValue())
		}
		if(it.type == "date"){
			var dt = new Date(v)
			v = dt.format('Y-m-d')
			record.set(f,v)
		}
		this.fireEvent("afterCellEdit",it,record,field,v)		
	},
	getCM:function(items){
		var cm = []
		var fm = Ext.form
		var ac =  util.Accredit;
		for(var i = 0; i <items.length; i ++){
			var it = items[i]
			if(it.noList || it.hidden || !ac.canRead(it.acValue)){
				continue
			}			
			var width = parseInt(it.width || it.length || 80)
			if(width < 80){width = 80}
			var c = {
				header:it.alias,
				width:width,
				sortable:true,
				dataIndex: it.id,
				schemaItem:it
			}
			if(it.renderer){
				c.renderer = it.renderer
			}
			var editable = true;
			
			if((it.pkey && it.generator == 'auto')|| it.fixed){
				editable = false
			}
			if(it.evalOnServer && ac.canRead(it.acValue)){
				editable = false
			}
			var notNull = !(it['not-null'] == 'true')
			
			
			var editor = null;
			var dic = it.dic
			if(dic){
				dic.src = this.entryName + "." + it.id
				dic.defaultValue = it.defaultValue
				dic.width = width
				if(dic.render == "Radio" || dic.render == "Checkbox"){
					dic.render = ""
				}
				c.renderer = function(v, params, record,r,c,store){
					var cm = _ctx.grid.getColumnModel()
					var f = cm.getDataIndex(c)
					return record.get(f + "_text")
				}
				if(editable){
					editor = this.createDicField(dic)
					editor.isDic = true
					var _ctx = this
					c.isDic = true				
				}
			}
			else{
				if(!editable){
					cm.push(c);
					continue;
				}
				editor = new fm.TextField({allowBlank: notNull});
				var fm = Ext.form;
				switch(it.type){
					case 'string':
					case 'text':
						var cfg = {
							allowBlank:notNull,
							maxLength:it.length
						}
						if(it.inputType){
							cfg.inputType = it.inputType
						}
						editor = new fm.TextField(cfg)
	           			break;
	           		case 'date':
	           			var cfg = {
	           				allowBlank:notNull,
	           				emptyText:"请选择日期",
	           				format:'Y-m-d'
	           			}
						editor = new fm.DateField(cfg)
						break;
					case 'double':
					case 'bigDecimal':
					case 'int':
						if(!it.dic){
							c.css = "color:#00AA00;font-weight:bold;"
							c.align = "right"
						}					
						var cfg = {}
						if(it.type == 'int'){
							cfg.decimalPrecision = 0;
							cfg.allowDecimals = false
						}
						else{
							cfg.decimalPrecision = it.precision || 2;
						}
						if(it.min){
							cfg.minValue = it.min;
						}
						if(it.max){
							cfg.maxValue = it.max;
						}
						cfg.allowBlank = notNull
						editor = new fm.NumberField(cfg)
						break;
				}
			}
			c.editor = editor;
			cm.push(c);
		}
		return cm;
	},
	getStoreFields:function(items){
		var o = app.modules.list.EditorListView.superclass.getStoreFields.call(this,items)		
		o.fields.push({name:"_opStatus"})
		return o
	},
	createDicField:function(dic){
		var cls = "util.dictionary.";
		if(!dic.render){
			cls += "Simple";
		}
		else{
			cls += dic.render
		}
		cls += "DicFactory"
		$import(cls)
		var factory = eval("(" + cls + ")")
		var field = factory.createDic(dic) 
		
		return field
	},
	doCreate:function(item,e){
		var store = this.grid.getStore();
		var o = this.getStoreFields(this.schema.items)
		var Record = Ext.data.Record.create(o.fields)
		var items = this.schema.items
		var factory = util.dictionary.DictionaryLoader
		var data = {'_opStatus':'create'}
		for(var i = 0; i <items.length; i ++){
			var it = items[i]
			var v = null
			
			if(it.defaultValue){
				v = it.defaultValue
				data[it.id] =v
				var dic = it.dic
				if(dic){
					var o = factory.load(dic)
					if(o){
						var di = o.wraper[v]
						if(di){
							data[it.id + "_text"] = di.text
						}
					}
				}
			}
		}
		var r = new Record(data)
		store.add([r])
	},
	doSave:function(item,e){
		var store = this.grid.getStore();
		var n = store.getCount()
		var data = []
		for(var i = 0;i < n; i ++){
			var r = store.getAt(i)
			if(r.dirty){
				var o = r.getChanges()
				o[this.schema.pkey] = r.id
				o['_opStatus'] = r.get('_opStatus')
				data.push(o)
				continue
			}
			var items = this.schema.items
			for(var j = 0; j < items.length;j ++){
				var it = items[j]
				if(it['not-null'] && r.get(it.id) == ""){
					return
				}
			}
			if(r.get('_opStatus') == "create"){
				data.push(r.data)
			}
		}
	},
	doAction:function(item,e){
		var cmd = item.cmd
		var script = item.script
		cmd = cmd.charAt(0).toUpperCase() + cmd.substr(1)
		if(script){
			$require(script,[function(){
				eval(script + '.do' +cmd +'.apply(this,[item,e])')	
			},this])
		}
		else{
			var action =  this["do"+cmd]
			if(action){
				action.apply(this,[item,e])
			}
		}
	},
	getSelectedRecord:function(muli){
		try{
			var cell =  this.grid.getSelectionModel().getSelectedCell()
			return this.grid.store.getAt(cell[0])
		}catch(e){
			
		}
	}	
});