$package("app.modules.list")
$import(
	"app.desktop.Module",
	"util.widgets.TreeField"
)

app.modules.list.QueryWin = function(cfg) {
	this.items = []
	this.width = 640
	this.height = 260
	this.signs = {
		gt:{index:1,id:"gt",name:"大于"},
		ge:{index:2,id:"ge",name:"大于等于"},
		eq:{index:3,id:"eq",name:"等于"},
		lt:{index:4,id:"lt",name:"小于"},
		le:{index:5,id:"le",name:"小于等于"}
	}
	this.MyRecord = Ext.data.Record.create([
		{name:"condition"},
		{name:"description"}
	])
	this.historyRecord = Ext.data.Record.create([
		{name:"name"},
		{name:"description"}
	])
	app.modules.list.QueryWin.superclass.constructor.apply(this, [cfg])
}
Ext.extend(app.modules.list.QueryWin, app.desktop.Module, {
	initPanel:function(){
		this.initConditionPanel()
		this.initConditionGrid()
		this.initHistoryPanel()
		var panel = new Ext.Panel({
			border:false,
			frame:true,
			layout:"border",
			height:this.height,
			items:[
				{
					border:false,
					region:"center",
					layout:"border",
					items:[this.CP,this.CG]
				},
				this.HP
			]
		})
		return panel
	},
	initConditionPanel:function(){
		if(!this.CP){
			this.CP = new Ext.Panel({
				region:"north",
				border:false,
				height:30,
				layout:"card",
				activeItem:0,
				defaults:{
					layout:"hbox",
					layoutConfig:{
						align:"top"
					}
				},
				items:[
					{id:"list_query_dic"},
					{id:"list_query_str"},
					{id:"list_query_date"},
					{id:"list_query_num"}
				]
			})
		}
	},
	initConditionGrid:function(){
		if(!this.CG){
			this.orOrAnd = this.createCombbox([{value:"and",text:"并且"},{value:"or",text:"或者"}])
			this.CG = new Ext.grid.GridPanel({
				border:false,
				region:"center",
				tbar:['<b>列表中各条件关系:</b>',this.orOrAnd,'->','-',{
					text:"清 空",
					handler:this.clearCon,
					scope:this,
					iconCls:"remove"
				},'-'],
				cm:new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(),{
					header:"条件",
					dataIndex:"description",
					width:520
				},{
					header:" ",
					dataIndex:"remove",
					renderer:function(){
						return "<span style='color:red'><b>X</b></span>"
					},
					width:25
				}]),
				store:new Ext.data.JsonStore({
					fields: ['condition','description','remove'],
		       	 	data : [] 
				})
			})
			this.CG.on("cellclick",this.onCellClick,this)
			this.addToolTipToGridRow(this.CG,"description")
		}
	},
	initHistoryPanel:function(){
		if(!this.HP){
			this.HP = new Ext.grid.GridPanel({
				region:"east",
				border:false,
				title:"历史查询条件",
				collapsible: true,
				collapsed:true,
				width:140,
				autoExpandColumn: 0,
				cm:new Ext.grid.ColumnModel([{
					header:"历史查询条件",
					dataIndex:"name",
					width:110
				},{
					header:" ",
					dataIndex:"orOrAnd",
					hidden:true
				},{
					header:" ",
					dataIndex:"remove",
					renderer:function(){
						return "<span style='color:red'><b>X</b></span>"
					},
					width:25
				}]),
				store:new Ext.data.JsonStore({
					fields: ['name','description','remove','orOrAnd'],
		       	 	data : []
				}),
				autoScroll:true
			})
			this.HP.on("cellclick",this.onCellClick,this)
			this.HP.on("rowdblclick",this.onRowdblclick,this)
			this.HP.on("expand",function(p){p.getStore().loadData(this.getHistoryDataFromCookie())},this)
			this.HP.on("render",function(grid){
				var store = grid.getStore()
	    		var view = grid.getView()
	    		this.HP.tip = new Ext.ToolTip({  
			        target: view.mainBody,
			        delegate: '.x-grid3-row',
			        trackMouse: true,
			        renderTo: document.body,
			        listeners: {
			            beforeshow: function updateTipBody(tip) {
			                var rowIndex = view.findRowIndex(tip.triggerElement)
			                var st = store.getAt(rowIndex).data["description"]
			                var description = ""
			                for(var i=0;i<st.length;i++){
								var r = st[i]
								description += (r["description"]+"<br>")
							}
			                tip.body.dom.innerHTML = description
			            }
			        }
			    })
			},this)
		}	
	},
	clearCon:function(){
		this.CG.getStore().removeAll();
		this.list.queryBtn.setTooltip("");
	},
	getHistoryDataFromCookie:function(){
		var history = Ext.decode(this.getCookie("queryWin_history"))
		if(!history){
			history = {}
		}
		if(!history[this.list.id]){
			history[this.list.id] = {}
		}
		var his_data = []
		for(var id in history[this.list.id]){
			if(id.indexOf("_orOrAnd") !=  -1){
				continue;
			}
			his_data.push({name:id,description:history[this.list.id][id],orOrAnd:history[this.list.id][id+"_orOrAnd"]})
		}
		return his_data
	},
	onRowdblclick:function(grid,rowIndex,e){
		this.CG.getStore().removeAll()
		this.CG.getStore().loadData(grid.getStore().getAt(rowIndex).get("description"))
		this.orOrAnd.setValue(grid.getStore().getAt(rowIndex).get("orOrAnd") || 'and')
	},
	initCndCombo:function(){
		if(!this.combox){
			var items = this.items
			var fields = []
			for(var i=0;i<items.length;i++){
				var it = items[i]
				if(!it.queryable){
					continue
				}
				fields.push({
					value:it.id,
					text:it.alias
				})	
			}
			var store = new Ext.data.JsonStore({
		        fields: ['value', 'text'],
		        data : fields 
		    });
			this.combox = new Ext.form.ComboBox({
		        store: store,
	    	    valueField:"value",
	    		displayField:"text",
		        mode: 'local',
		        triggerAction: 'all',
		        emptyText:'字段选择',
		        selectOnFocus:true,
		        width:180
		    })
		    this.combox.on("select",this.defineCondition,this)
		}		
	},
	defineCondition:function(c,record,index){
		var id = record.data["value"]
		if(!id || id.length == 0){
			return
		}
		var items = this.items
		var item
		for(var i=0;i<items.length;i++){
			if(id == items[i].id){
				item = items[i]
				break
			}
		}
		if(!item){
			return
		}
		this.item = item
		this.processConditionPanel(item)
	},
	getCleanPanel:function(index){
		this.CP.items.itemAt(index).removeAll()
		return this.CP.items.itemAt(index)
	},
	processConditionPanel:function(item){
		var cp = this.CP
		var layout = cp.getLayout()
		var isDic = item.dic != undefined
		if(isDic){
			var p = this.getCleanPanel(0)
			var dicField = this.getField(item)
			if(dicField instanceof util.widgets.TreeField){
				p.add(this.getContainsComb(true))
			}else{
				p.add(this.getContainsComb())
			}
			p.add(dicField)
			layout.setActiveItem(0)
		}else{
			var type = item.type
			if(type == "string" || type == "character"){
				var p = this.getCleanPanel(1)
				var strField = this.getField(item)
				p.add(this.getContainsComb(true))
				p.add(strField)
				layout.setActiveItem(1)
			}else if(type == "date"||type=="timestamp"||type=="time"){
				var p = this.getCleanPanel(2)
				p.add(this.getFlagCombo(true))
				p.add(this.getFlagCardPanel(true))
				layout.setActiveItem(2)
			}else if(type == "int"||type=="bigDecimal"||type=="long"||type=="short"||type=="float"||type=="double"){
				var p = this.getCleanPanel(3)
				p.add(this.getFlagCombo())
				p.add(this.getFlagCardPanel())
				layout.setActiveItem(3)
			}
		}
		this.CP.doLayout()
	},
	saveCondition:function(){
		if(!this.item){
			return
		}
		var g = this.CG;
		var st = g.getStore();
		var r = this.getConditionRecord(st);
		if(r){
			if(st.find("condition",r.get("condition")) == -1){
				st.add(r)
			}
		}
		
	},
	getConditionRecord:function(st){
		var item = this.item
		var MyRecord = this.MyRecord
		var cp = this.CP
		if(cp.disabled){
			var tbs = this.win.getTopToolbar().items
			var btn_null = tbs.itemAt(3)
			var btn_notnull = tbs.itemAt(5)
			var cnd,s
			if(btn_null.pressed){
				cnd = ['isNull',['s','is'],['$',item.id]]
				s= "为空值"
			}
			if(btn_notnull.pressed){
				cnd = ['isNull',['s','not'],['$',item.id]]
				s= "不为空"
			}
			return new MyRecord({condition:cnd,description:item.alias+s})
		}
		var p = cp.getLayout().activeItem
		var pid = p.id
		if(pid == "list_query_dic"){		//dic
			var contains = p.items.itemAt(0)
			var f = p.items.itemAt(1)
			var aa = ""
			var cnd
			var eq = "="
			if(contains.getValue() == 2){
				cnd = this.getCnd(f,true)
				aa = "[包含子级]"
			}else if(contains.getValue() == 3){
				cnd = this.getNECnd(f)
				eq = "!="
			}else 
				cnd = this.getCnd(f)
			if(cnd){
				return new MyRecord({condition:cnd,description:item.alias+eq+f.getRawValue()+aa})
			}
		}else if(pid == "list_query_str"){		//string
			var f = p.items.itemAt(1)
			var contains = p.items.itemAt(0)
			var eq = "="
			var q = ""
			var cnd
			if(contains.getValue() == 3){
				cnd = this.getNECnd(f)
				eq = "!="
			}else{
				q = contains.getValue()==2?"[模糊]":"[精确]"
				var isFuzzy = contains.getValue()==2?true:false
				cnd = this.getCnd(f,isFuzzy)
			}
			if(cnd){
				return new MyRecord({condition:cnd,description:item.alias+eq+f.getRawValue()+q})
			}
		}else if(pid == "list_query_date"){		//date
			var flag = p.items.itemAt(0).getValue()
			var pp = p.items.itemAt(1).getLayout().activeItem
			if(0 == flag){		// 等于=
				var f = pp.items.itemAt(0)
				var cnd = this.getCnd(f)
				if(cnd){
					return new MyRecord({condition:cnd,description:item.alias+"="+f.getRawValue()})
				}
			}else if(1 == flag){		// 大于>
				var sign = pp.items.itemAt(1)
				var f = pp.items.itemAt(0)
				var cnd = this.getCnd(f)
				if(cnd){
					cnd[0] = sign.pressed?"ge":"gt"
					var aa = ""
					if(sign.pressed) 
						aa = "(包括)"
					return new MyRecord({condition:cnd,description:item.alias+"在 "+f.getRawValue()+" 之后"+aa})
				}
			}else if(2 == flag){		// 小于<
				var sign = pp.items.itemAt(1)
				var f = pp.items.itemAt(0)
				var cnd = this.getCnd(f)
				if(cnd){
					cnd[0] = sign.pressed?"le":"lt"
					var aa = ""
					if(sign.pressed) 
						aa = "(包括)"
					return new MyRecord({condition:cnd,description:item.alias+"在 "+f.getRawValue()+" 之前"+aa})
				}
			}else if(3 == flag){		// <大于小于>
				var sign1 = pp.items.itemAt(1)
				var sign2 = pp.items.itemAt(4)
				var f1 = pp.items.itemAt(0)
				var f2 = pp.items.itemAt(3)
				var cnd = ['and']
				var cnd1 = this.getCnd(f1)
				var cnd2 = this.getCnd(f2)
				if(cnd1 && cnd2){
					cnd1[0] = sign1.pressed?"ge":"gt"
					cnd2[0] = sign2.pressed?"le":"lt"
					var aa="",bb=""
					if(sign1.pressed)aa="[包括]"
					if(sign2.pressed)bb="[包括]"
					cnd.push(cnd1)
					cnd.push(cnd2)
					return new MyRecord({condition:cnd,description:item.alias+"在 "+f1.getRawValue()+aa+" 与 "+f2.getRawValue()+bb+" 之间"})
				}
			}else if(4 == flag){
				var f = pp.items.itemAt(1)
				var cnd1 = this.getCnd(f)
				var cnd2 = this.getCnd(f)
				var days = pp.items.itemAt(4).getValue()
				if(cnd1){
					var refAlias = item.refAlias || "a"
					var sign1 = pp.items.itemAt(3)
					var sign2 = pp.items.itemAt(2).pressed
					var aa = sign2?"[包括]":""
					if(1 == sign1.getValue()){
						if(days == ""){
							cnd1[0] = sign2?"le":"lt"
							return new MyRecord({condition:cnd1,description:item.alias+"在 "+f.getRawValue()+aa+" "+sign1.getRawValue()})
						}else{
							cnd = ['and']
							cnd1[0] = "ge"
							cnd1[2] =	['date',new Date(f.getValue().setDate(f.getValue().getDate()-days))]
							cnd2[0] = sign2?"le":"lt"
							cnd.push(cnd1)
							cnd.push(cnd2)
							return new MyRecord({condition:cnd,description:item.alias+"在 "+f.getRawValue()+aa+" "+sign1.getRawValue()+days+"天"})
						}						
					}else if(2 == sign1.getValue()){
						if(days == ""){
							cnd1[0] = sign2?"ge":"gt"
							return new MyRecord({condition:cnd1,description:item.alias+"在 "+f.getRawValue()+aa+" "+sign1.getRawValue()})
						}else{
							cnd = ['and']
							cnd1[0] = "le"
							cnd1[2] =	['date',new Date(f.getValue().setDate(f.getValue().getDate()+days))]
							cnd2[0] = sign2?"ge":"gt"
							cnd.push(cnd1)
							cnd.push(cnd2)
							return new MyRecord({condition:cnd,description:item.alias+"在 "+f.getRawValue()+aa+" "+sign1.getRawValue()+days+"天"})
						}						
					}					
				}				
			}else if(5==flag){
				var f = pp.items.itemAt(0)
				var cnd = this.getNECnd(f)
				if(cnd){
					return new MyRecord({condition:cnd,description:item.alias+"!="+f.getRawValue()})
				}
			}
		}else if(pid == "list_query_num"){		//number
			var flag = p.items.itemAt(0).getValue()
			var pp = p.items.itemAt(1).getLayout().activeItem
			if(0 == flag){		// 等于=
				var f = pp.items.itemAt(0)
				var cnd = this.getCnd(f)
				if(cnd){
					return new MyRecord({condition:cnd,description:item.alias+"="+f.getRawValue()})
				}
			}else if(1 == flag){		// 大于>
				var sign = pp.items.itemAt(1)
				var f = pp.items.itemAt(0)
				var cnd = this.getCnd(f)
				if(cnd){
					cnd[0] = sign.pressed?"ge":"gt"
					var aa = sign.pressed?"大于等于":"大于"
					return new MyRecord({condition:cnd,description:item.alias+aa+f.getRawValue()})
				}
			}else if(2 == flag){		// 小于<
				var sign = pp.items.itemAt(1)
				var f = pp.items.itemAt(0)
				var cnd = this.getCnd(f)
				if(cnd){
					cnd[0] = sign.pressed?"le":"lt"
					var aa = sign.pressed?"小于等于":"小于"
					return new MyRecord({condition:cnd,description:item.alias+aa+f.getRawValue()})
				}
			}else if(3 == flag){		// <大于小于>
				var sign1 = pp.items.itemAt(1)
				var sign2 = pp.items.itemAt(4)
				var f1 = pp.items.itemAt(0)
				var f2 = pp.items.itemAt(3)
				var cnd = ['and']
				var cnd1 = this.getCnd(f1)
				var cnd2 = this.getCnd(f2)
				if(cnd1 && cnd2){
					cnd1[0] = sign1.pressed?"ge":"gt"
					cnd2[0] = sign2.pressed?"le":"lt"
					var aa = sign1.pressed?"大于等于":"大于"
					var bb = sign2.pressed?"小于等于":"小于"
					cnd.push(cnd1)
					cnd.push(cnd2)
					return new MyRecord({condition:cnd,description:item.alias+aa+f1.getRawValue()+" 并且 "+bb+f2.getRawValue()})
				}
			}else if(4==flag){
				var f = pp.items.itemAt(0)
				var cnd = this.getNECnd(f)
				if(cnd){
					return new MyRecord({condition:cnd,description:item.alias+"!="+f.getRawValue()})
				}
			}
		}
	},
	doCndQuery:function(){
		var g = this.CG
		var st = g.getStore()
		var cnd = [this.orOrAnd.getValue() || 'and']
//		if(this.list.initCnd){
//			cnd.push(this.list.initCnd)
//		}
		var description = ""
		for(var i=0;i<st.getCount();i++){
			var r = st.getAt(i)
			cnd.push(r.data.condition)
			description += (r.data.description+"<br>")
		}
		if(cnd.length == 1){
			return
		}
		if(this.list.initCnd){
			cnd = ['and',this.list.initCnd,cnd]
		}
		this.list.resetFirstPage()		
		this.list.requestData.cnd = cnd
		this.list.queryBtn.setTooltip(description)
		this.win.hide()
		this.list.refresh()		
	},
	getNECnd:function(f){
		var it = this.item
		if(!it){
			return
		}
		var v = f.getValue()
		if(v == null || ""+v == ""){
			return
		}
		var refAlias = it.refAlias || "a"		
		var cnd = ['ne',['$',refAlias + "." + it.id]]
		if(it.dic){
			cnd.push(['s',v])
		}
		else{
			switch(it.type){
				case 'int':
					cnd.push(['i',v])
					break;
				case 'double':
				case 'bigDecimal':
					cnd.push(['d',v])
					break;
				case 'string':
					cnd.push(['s',v])
					break;
				case "date":
					v = v.format("Y-m-d")
					cnd[1] = ['$', "str(" + refAlias + "." + it.id + ",'yyyy-MM-dd')"]
					cnd.push(['s',v])
					break;
			}
		}
		return cnd
	},
	getCnd:function(f,isFuzzy){
		var it = this.item
		if(!it){
			return
		}
		var v = f.getValue()
		if(v == null || ""+v == ""){
			return
		}
		var refAlias = it.refAlias || "a"		
		var cnd = ['eq',['$',refAlias + "." + it.id]]
		if(it.dic){
			if(it.dic.render == "Tree"){
				var node =  f.selectedNode
				if(isFuzzy){
					cnd[0] = 'like'
					cnd.push(['s',v + '%'])					
				}else{
					cnd.push(['s',v])
				}
			}
			else{
				cnd.push(['s',v])
			}
		}
		else{
			switch(it.type){
				case 'int':
					cnd.push(['i',v])
					break;
				case 'double':
				case 'bigDecimal':
					cnd.push(['d',v])
					break;
				case 'string':
					cnd[0] = 'like'
					if(isFuzzy){						
						cnd.push(['s','%' + v + '%'])
					}else
						cnd.push(['s',v])
					break;
				case "date":
					v = v.format("Y-m-d")
					cnd[1] = ['$', "str(" + refAlias + "." + it.id + ",'yyyy-MM-dd')"]
					cnd.push(['s',v])
					break;
			}
		}
		return cnd
	},
	getField:function(item,hideLabel){
		var dic = item.dic
		var f
		if(dic){
			dic.src = this.entryName + "." + item.id
			dic.defaultValue = item.defaultValue
			dic.width = 180
			f = this.createDicField(dic)
		}else{
			f = this.createNormalField(item)
		}
		f.hideLabel = true
		if(hideLabel){			
			f.width = 140
		}
		return f	
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
		dic.onlySelectLeaf  = false
		var field = factory.createDic(dic)
		field.fieldLabel = "请选择"
		return field
	},
	createNormalField:function(it){
		var cfg = {
			name:it.id,
			fieldLabel:it.alias,
			width:180,
			value:it.defaultValue
		}
		var field;
		switch(it.type){
			case 'int':
			case 'double':
			case 'bigDecimal':
				cfg.xtype = "numberfield"
				if(it.type == 'int'){
					cfg.decimalPrecision = 0;
					cfg.allowDecimals = false
				}
				else{
					cfg.decimalPrecision = it.precision || 2;
				}
				if(it.minValue){
					cfg.minValue = it.minValue;
				}
				if(it.maxValue){
					cfg.maxValue = it.maxValue;
				}
				field = new Ext.form.NumberField(cfg)
				break;
			case 'date':
				cfg.xtype = 'datefield'
				cfg.emptyText  = "请选择日期"	
				field = new Ext.form.DateField(cfg)
				break;
			case 'string':
				field = new Ext.form.TextField(cfg)
				break;
		}
		return field;
	},
	saveQueryCondition:function(){
		if(!this.list.id){
			Ext.MessageBox.alert("提示","该模块暂不支持保存历史功能.")
			return;
		}
//		this.setCookie("queryWin_history",Ext.encode({}))	//clean cookie
//		alert(Ext.encode(this.getCookie("queryWin_history")))
		var g = this.CG
		var st = g.getStore()
		if(st.getCount() == 0){
			return
		}
		Ext.Msg.prompt("保存","为该查询条件取个名字.",function(btn,txt){
			if(btn == "ok"){
				if(txt.length == 0){
					return
				}
				var rs = []
				for(var i=0;i<st.getCount();i++){
					rs.push(st.getAt(i).data)
				}
				var history = Ext.decode(this.getCookie("queryWin_history"))
				if(!history){
					history = {}
				}
				if(!history[this.list.id]){
					history[this.list.id] = {}
				}
				history[this.list.id][txt] = rs
				history[this.list.id][txt+"_orOrAnd"] = this.orOrAnd.getValue() || 'and'
				this.setCookie("queryWin_history",Ext.encode(history))
				this.HP.getStore().add(new this.historyRecord({name:txt,description:rs,orOrAnd:history[this.list.id][txt+"_orOrAnd"]}))
			}
		},this)
	},
	doNullQuery:function(btn,e){
		var tbs = this.win.getTopToolbar().items
		var btn_null = tbs.itemAt(3)
		var btn_notnull = tbs.itemAt(5)
		if(btn.pressed){
			if(btn == btn_null){
				btn_notnull.setDisabled(true)
			}else{
				btn_null.setDisabled(true)
			}
			this.CP.disable()
		}else{
			btn_notnull.setDisabled(false)
			btn_null.setDisabled(false)
			this.CP.enable()
		}
	},
	setCookie:function(key,value){
		var date=new Date()
		var expireDays=100
		date.setTime(date.getTime()+expireDays*24*3600*1000)
		document.cookie=key+"="+escape(value)+";expires="+date.toGMTString();
	},
	getCookie:function(key){
		var strCookies=document.cookie
		var arrCookies=strCookies.split(";")
		for(var i=0;i<arrCookies.length;i++){
			var arrCookie=arrCookies[i].split("=")
			if(this.lefttrim(arrCookie[0]) == key){
				return unescape(arrCookie[1])
			}
		}
	},
	lefttrim:function(str){
		var index = 0
		for(var i=0;i<str.length;i++){
			if(str[i] != " "){
				index = i
				break
			}
		}
		return str.substring(index)
	},
	onCellClick:function(grid,rowIndex,colIndex,e){
		if(grid.getColumnModel().getDataIndex(colIndex) == "remove"){
			if(grid.title == "历史查询条件"){
				var history = Ext.decode(this.getCookie("queryWin_history"))
				if(!history){
					history = {}
				}
				if(!history[this.list.id]){
					history[this.list.id] = {}
				}
				var name = grid.getStore().getAt(rowIndex).get("name")
				if(history[this.list.id][name]){
					delete history[this.list.id][name]
					delete history[this.list.id][name+"_orOrAnd"]
					this.setCookie("queryWin_history",Ext.encode(history))
				}
			}
			grid.getStore().removeAt(rowIndex)
			this.updateTipToQueryBtn();
		}
	},
	updateTipToQueryBtn:function(){
		var g = this.CG;
		var st = g.getStore();
		var description = "";
		for(var i=0;i<st.getCount();i++){
			var r = st.getAt(i);
			description += (r.data.description+"<br>");
		}
		this.list.queryBtn.setTooltip(description);
	},
	getSignCombo:function(sg){
		var sgs
		var defaultVal ="lt"
		if(sg == "g"){
			defaultVal = "gt"
			sgs =  [
				{value:"gt",text:">"},
			   	{value:"ge",text:">="}
			]
		}else{
			sgs =  [
				{value:"lt",text:"<"},
			   	{value:"le",text:"<="}
			]
		}
		var store = new Ext.data.JsonStore({
	        fields: ['value', 'text'],
	        data : sgs 
	    })
	    var combox = new Ext.form.ComboBox({
	        store: store,
    	    valueField:"value",
    		displayField:"text",
	        mode: 'local',
	        triggerAction: 'all',
	        emptyText:'选择',
	        selectOnFocus:true,
	        width:40,
	        value:defaultVal,
	        hideLabel:true
	    })
	    return combox
	},
	getFlagCombo:function(isDate){
		var flags = [
			{value:0,text:"等于"},
		   	{value:1,text:"大于"},
		   	{value:2,text:"小于"},
		   	{value:3,text:"之间"}
		]
		if(isDate){
			flags.push({value:4,text:"范围"})
			flags.push({value:5,text:"不等于"})
		}else
			flags.push({value:4,text:"不等于"})
		var store = new Ext.data.JsonStore({
	        fields: ['value', 'text'],
	        data : flags 
	    })
	    var combox = new Ext.form.ComboBox({
	    	fieldLabel:"符号选择",
	    	hideLabel:true,
	        store: store,
    	    valueField:"value",
    		displayField:"text",
	        mode: 'local',
	        triggerAction: 'all',
	        emptyText:'请选择',
	        selectOnFocus:true,
	        value:0,
	        width:60
	    })
	    combox.on("select",this.changeFlag,this)
	    return combox
	},
	changeFlag:function(c,record,index){
		var val = record.data["value"]
		var p = this.CP.getLayout().activeItem.items.itemAt(1)
		p.getLayout().setActiveItem(val)
	},
	getFlagCardPanel:function(isDate){
		if(!this.item){
			return
		}
		var item = this.item
		var panels = [{
				items:this.getField(item)
			},{
				items:[
					this.getField(item,true),
					{xtype:"button",text:"包括",enableToggle:true}
					]
			},{
				items:[
					this.getField(item,true),
					{xtype:"button",text:"包括",enableToggle:true}
					]
			},{
				items:[
					this.getField(item,true),
					{xtype:"button",text:"包括",enableToggle:true},
					{xtype:"displayfield",value:"&nbsp;至&nbsp;"},
					this.getField(item,true),
					{xtype:"button",text:"包括",enableToggle:true}
					]
			}]
		if(isDate){
			panels.push({items:[
				{xtype:"displayfield",value:"&nbsp;&nbsp;在&nbsp;"},
				this.getField(item,true),
				{xtype:"button",text:"包括",enableToggle:true},
				this.getLateOrEarlyComb(),
				{xtype:"numberfield",decimalPrecision:0,allowDecimals:false,width:80},
				{xtype:"displayfield",value:"&nbsp;天&nbsp;"}
				
			]})
		}
		panels.push({items:this.getField(item)})
		var p = new Ext.Panel({
			border:false,
			width:"100%",
			height:40,
			layout:"card",
			activeItem:0,
			defaultType:"panel",
			defaults:{
				layout:"hbox",
				layoutConfig:{
					align:"top"
				}
			},
			items:panels
		})
		return p
	},
	getLateOrEarlyComb:function(){
		var flags = [
			{value:1,text:"之前"},
		   	{value:2,text:"之后"}
		]
		var store = new Ext.data.JsonStore({
	        fields: ['value', 'text'],
	        data : flags 
	    })
	    var combox = new Ext.form.ComboBox({
	    	fieldLabel:"选择",
	    	hideLabel:true,
	        store: store,
    	    valueField:"value",
    		displayField:"text",
	        mode: 'local',
	        triggerAction: 'all',
	        emptyText:'请选择',
	        selectOnFocus:true,
	        value:1,
	        width:60
	    })
	    return combox
	},
	getContainsComb:function(isContains){
		var flags = [
			{value:1,text:"等于"}
		]
		if(isContains){
			flags.push({value:2,text:"包含"})
		}
		flags.push({value:3,text:"不等于"})
		var store = new Ext.data.JsonStore({
	        fields: ['value', 'text'],
	        data : flags 
	    })
	    var combox = new Ext.form.ComboBox({
	    	fieldLabel:"选择",
	    	hideLabel:true,
	        store: store,
    	    valueField:"value",
    		displayField:"text",
	        mode: 'local',
	        triggerAction: 'all',
	        emptyText:'请选择',
	        selectOnFocus:true,
	        value:1,
	        width:60
	    })
	    return combox
	},
	addToolTipToGridRow:function(g,column){
		g.on("render",function(grid){
			var store = grid.getStore()
    		var view = grid.getView()
    		g.tip = new Ext.ToolTip({  
		        target: view.mainBody,
		        delegate: '.x-grid3-row',
		        trackMouse: true,
		        renderTo: document.body,
		        listeners: {
		            beforeshow: function updateTipBody(tip) {
		                var rowIndex = view.findRowIndex(tip.triggerElement)
		                tip.body.dom.innerHTML = store.getAt(rowIndex).data[column]
		            }
		        }
		    })
		},this)
	},
	createCombbox:function(options,width){
	    return new Ext.form.ComboBox({
	    	fieldLabel:"选择",
	    	hideLabel:true,
	        store:new Ext.data.JsonStore({
		        fields: ['value', 'text'],
		        data : options
		    }),
    	    valueField:"value",
    		displayField:"text",
	        mode: 'local',
	        triggerAction: 'all',
	        emptyText:'请选择',
	        selectOnFocus:true,
	        value:options[0]["value"],
	        width:width || 60
	    })
	},
	getWin:function(){
		this.initCndCombo()
		var win = this.win
		if(!win){
			win = new Ext.Window({
				title:this.title||"高级查询",
				width:this.width,
				closeAction:"hide",
				layout:"fit",
				modal:true,
				items:this.initPanel(),
				tbar:['&nbsp;',this.combox,'-',{
					text:"为空",
					iconCls:"empi_lock",
					enableToggle:true,
					handler:this.doNullQuery,
					scope:this
				},'-',{
					text:"不为空",
					iconCls:"empi_lock",
					enableToggle:true,
					handler:this.doNullQuery,
					scope:this
				},'-',{
					text:"添加至列表",
					iconCls:"add",
					handler:this.saveCondition,
					scope:this
				}],
				buttonAlign:"center",
				buttons:[{
					text:"确  定",
					iconCls:"archiveMove_commit",
					handler:this.doCndQuery,
					scope:this
				},{
					text:"取  消",
					iconCls:"common_cancel",
					handler:function(){
						this.win.hide()	
					},
					scope:this
				},{
					text:"保  存",
					iconCls:"save",
					handler:this.saveQueryCondition,
					scope:this
				}]
			})
			var renderToEl = this.getRenderToEl()
			if (renderToEl) {
				win.render(renderToEl)
			}
			win.on("add", function() {
				this.win.doLayout()
			}, this)
			this.win = win
		}
		return win
	}
})