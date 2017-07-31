/**
* @include "SimpleListView.js"
*/
$package("app.modules.print")
$import(
	"app.modules.print.ListPrintView",
	"util.rmi.jsonRequest",
	"util.rmi.miniJsonRequestSync"
)

app.modules.print.ReportPrintView = function(cfg){
	this.listServiceId = "simpleReport"
	this.exQueryParam = {};
	this.showPrtActionOnBottom = true
	app.modules.print.ReportPrintView.superclass.constructor.apply(this,[cfg])
	app.modules.print.ReportPrintView.instance[this.cellId] = this
}
Ext.extend(app.modules.print.ReportPrintView, app.modules.print.ListPrintView,{
	initCellObjectHtml:function(){
		var html = app.modules.print.ReportPrintView.superclass.initCellObjectHtml.call(this)
		html +="<SCRIPT for="+ this.cellId +"  EVENT=MouseDClick(c,r) LANGUAGE=JavaScript >" +
					"app.modules.print.ReportPrintView.instance['" + this.cellId + "'].onCellDbClick(c,r);</SCRIPT>"
		return html;
	},
	startLoadSchema:function(){
		var entryName = this.entryName
		if(entryName){
			var ret = util.rmi.miniJsonRequestSync({
				serviceId:"reportSchemaLoader",
				schema:entryName
			})
			if(ret.code == 200){
				this.schema = ret.json.body
				this.title = this.schema.title
			}
			else{
				alert(ret.msg)
				return;
			}
		}
		this.initCnds()
		this.initHeaders()
	},
	initCnds:function(){
		var schema = this.schema
		if(!schema || !schema.args){
			return
		}
		var args = schema.args
		if(!args || args.length == 0){
			return;
		}
		var queryParam = this.exQueryParam;
		var tbar = this.panel.getTopToolbar()
		for(var i = 0; i < args.length; i ++){
			var arg = args[i]
			var param = queryParam[arg.id]
			if(param){
				if(arg.dic){
					arg.defaultValue = {key:param,text:queryParam[arg.id+"_text"]};
				}
				else{
					arg.defaultValue = param
				}
			}
			else{
				queryParam[arg.id] = arg.defaultValue
			}
			tbar.add(arg.alias + ":")
			tbar.add(this.createField(arg))
		}
		tbar.add("-")
		tbar.add({text:"查询",iconCls:"query",handler:this.doQuery,scope:this})
	},
	resetQueryParams:function(){
		var tbar = this.panel.getTopToolbar()
		var queryParam = this.exQueryParam;
		
		tbar.items.each(function(f){
			if(!f.queryArg){
				return;
			}
			var id = f.getName();
			var param = queryParam[id]
			var v = null
			if(param){
				if(queryParam[id+"_text"]){
					v = {key:param,text:queryParam[id+"_text"]};
				}
				else{
					v = param
				}
				f.setValue(v)
			}			
		},this)
	},
	createField:function(it){
		var defaultWidth = 110
		var cfg = {
			queryArg:true,
			name:it.id,
			fieldLabel:it.alias,
			xtype:it.xtype || "textfield",
			width:defaultWidth,
			value:it.defaultValue
		}
		if(it.inputType){
			cfg.inputType = it.inputType
		}
		if(it['not-null']){
			cfg.allowBlank = false
			cfg.invalidText  = "必填字段"
		}
		if(it.dic){
			cfg.width = it.width
			it.dic.defaultValue = it.defaultValue
			it.dic.width = it.width || defaultWidth
			var combox = this.createDicField(it.dic)
			Ext.apply(combox,cfg)
			return combox;
		}
		if(it.length){
			cfg.maxLength = it.length;
		}
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
				break;
			case 'date':
				cfg.xtype = 'datefield'
				cfg.emptyText  = "请选择日期"	
				break;
			case 'text':
				cfg.xtype = "htmleditor"
				cfg.enableSourceEdit = false
				cfg.enableLinks = false
				cfg.width = 300
				break;
		}
		return cfg;
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
	doQuery:function(){
		var tbar = this.panel.getTopToolbar()
		var fields = tbar.items
		var count = fields.getCount()
		for(var i = 0; i < count; i ++){
			var f = fields.item(i)
			if(f.queryArg){
				if(!f.validate()){
					return;
				}
				var v = f.getValue()
				if(v == null || v.length == 0){
					continue;
				}
				if(f.getXType() == "datefield"){
					v = v.format("Y-m-d")
				}
				this.exQueryParam[f.getName()] = v
			}
		}
		this.loadData()
	},
	onCellDbClick:function(c,r){
		if(r <= this.headerRowNumber){
			return;
		}
		var v =  this.cell.GetCellString(c,r,0)
		if(v == ""){
			return
		}
		var schema = this.schema
		if(!schema || !schema.diggers){
			return;
		}
		
		var index = r - this.headerRowNumber - 1;
		if(index >= this.data.length){
			return;
		}
		
		var field = null;
		for(var id in this.cm){
			if(this.cm[id].index == c){
				field = this.cm[id]
				break;
			}
		}
		var name = field.id;
		var target = schema.diggers[name]
		if(!target){
			return
		}
		var o = this.data[index]
		var v = o[name]

		var cfg = {
			entryName:target,
			exQueryParam:{},
			isCombined:this.isCombined
		}
		for(var nm in this.exQueryParam){
			cfg.exQueryParam[nm] = this.exQueryParam[nm]
		}
		for(var i = 0; i < schema.items.length; i ++){
			var f = schema.items[i]
			if(f.func){
				continue;
			}
			var id = f.id
			if(f.dic){
				cfg.exQueryParam[id + "_text"] = o[id + "_text"]
			}
			cfg.exQueryParam[id] = o[id]
		}
		var digModule = this.midiModules[name]
		if(!digModule){
			digModule = new app.modules.print.ReportPrintView(cfg);
			digModule.opener = this;
			this.midiModules[name] = digModule;
			//digModule.onWinShow()
			if(this.isCombined){
				this.fireEvent("digDown",this,digModule);
			}
			else{
				digModule.getWin().show()
			}
		}
		else{
			for(var nm in cfg.exQueryParam){
				digModule.exQueryParam[nm] = cfg.exQueryParam[nm]
			}
			digModule.resetQueryParams()
			digModule.doQuery()
			if(this.isCombined){
				this.fireEvent("digDown",this,digModule);
			}
			else{
				digModule.getWin().show()
			}
		}

	},
	feedCellListData:function(json){
		if(!json.body){
			return;
		}
		this.data = json.body
		var rowCount = json.body.length
		var cell = this.cell
		if(rowCount > this.initRows){
			cell.SetRows(rowCount + this.headerRowNumber + 1,0)
		}
		else{
			cell.SetRows(this.initRows + this.headerRowNumber + 1,0)
		}
		var cm = this.cm
		var rs = json.body;
		var r = this.headerRowNumber
		var putData = this.setCellData
		var linkColColor = cell.FindColorIndex(this.toRGBColor(this.linkColColor || "660066"),1)
		var digger = this.schema.diggers
		for(var i = 0; i < rowCount; i ++){
			var o = rs[i]
			r = r + 1
			cell.SetRowHeight(1,20,r,0)
			for(var name in o){
				var cfg = cm[name]
				if(cfg){
					var c = cfg.index
					var v = o[name]
					if(digger && digger[cfg.id]){
						cell.SetCellTextColor(c,r,0,linkColColor)
						cell.SetCellFontStyle(c,r,0,8)
					}
					putData(cell,cfg.type,c,r,v)
				}
			}
		}
	}	
});
app.modules.print.ReportPrintView.instance = {}