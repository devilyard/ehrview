/**
* @include "SimpleListView.js"
*/
$package("app.modules.print")
$import(
	"app.desktop.Module",
	"util.schema.SchemaLoader",
	"util.rmi.jsonRequest"
)

app.modules.print.ListPrintView = function(cfg){
	this.width = 800;
	this.height = 350;
	this.initRows = 0
	this.actions = [
			{id:"printSetup",name:"打印预览",iconCls:"print"},
			{id:"exportToExcel",name:"导出EXCEL",iconCls:"add"},
			{id:"showSideLabel",name:"调整行列宽高",iconCls:"option"}
	]
	this.exQueryParam = {};
	this.cellId = Ext.id();
	this.headerRowNumber = 2
	app.modules.print.ListPrintView.superclass.constructor.apply(this,[cfg])
	
}
Ext.extend(app.modules.print.ListPrintView, app.desktop.Module,{
	init:function(){
		this.addEvents({
			"print":true
		})
		app.modules.print.ListPrintView.superclass.init.call(this)
	},
	onWinShow:function(){
		if(this.cell){
			return;
		}
		var cell = this.getObject()
		this.cell = cell
		if(!cell){
			var _ctx = this
			var func = this.onWinShow
			setTimeout(function(){func.call(_ctx)},200)
			return
		}
		if(cell.Login("BSHAIS","","13040269","2260-1411-7763-1005") == 0){
			alert("表格控件注册失败")
		}
		else{
			cell.LocalizeControl(0x804)
		}
		cell.ResetContent()
		cell.WndBkColor = this.toRGBColor("ffffff")
		cell.ShowSheetLabel(0,0)
		if(typeof this.printOrient != "undefined"){
			cell.PrintSetOrient(this.printOrient)
		}
		else{
			cell.PrintSetOrient(1)
		}
		cell.Border = 0
		cell.ShowSideLabel(0,0)
		cell.ShowTopLabel(0,0)
		cell.WorkbookReadonly = true
		this.startLoadSchema()

	},
	startLoadSchema:function(){
		var schema = this.schema
		if(!schema){
			var re = util.schema.loadSync(this.entryName)
			if(re.code == 200){
				this.schema = re.schema;
			}
			else{
				this.processReturnMsg(re.code,re.msg,this.initPanel)
			}
		}
		this.initHeaders()
	},
	initTitle:function(){
		var cell = this.cell
		cell.MergeCells(1,1,this.maxColCount,1)
		cell.SetCellAlign(1,1,0,36)
		cell.SetRowHeight(1,30,1,0)
		cell.SetCellFontStyle(1,1,0,2)
	    cell.S(1,1,0,this.title)	
	    cell.PrintSetTopTitle(1,this.headerRowNumber) 
    	cell.SetFixedRow(1,this.headerRowNumber)
    	cell.ShowFixedLines(0,0)
    	//cell.ProtectSheet(0,0)
	},
	initHeaders:function(){
		var schema = this.schema
		if(!schema){
			return;
		}
		var cell = this.cell
		var items = schema.items
		var n = items.length
		var colCount = 0;
		var cols = {}
		var r = this.headerRowNumber
		var bgColor = cell.FindColorIndex(this.toRGBColor(this.headerBgColor || "c0c0c0"),1)
		
		for(var i = 0;i < n; i ++){
			var it = items[i]
			if(it.hidden){
				continue;
			}
			var c = colCount + 1
			var cfg = {
				id:it.id,
				index:c,
				type:it.type,
				dic:it.dic
			}
			if(it.dic){
				cols[it.id + "_text"] = cfg
				cfg.type = "string"
			}
			else{
				cols[it.id] = cfg
			}
			var width = parseInt(it.width) || 80;
			cell.S(c,r,0,it.alias)
			cell.SetCellAlign(c,r,0,36)
			cell.SetCellFontStyle(c,r,0,2)
			//cell.SetCellBackColor(c,r,0,bgColor)
			cell.SetColWidth(1,width+15,c,0)
			
			colCount ++
		}
		cell.SetRowHeight(1,20,2,0)
		if(!this.maxColCount){
			this.maxColCount = colCount
		}
		cell.setCols(this.maxColCount + 1,0)
		
		this.cm = cols
		
		this.initTitle()
    	var maxRows = this.initRows + this.headerRowNumber + 1
		cell.setRows(maxRows,0)
		var color = cell.FindColorIndex(this.toRGBColor(this.borderColor || "8db2e3"),1)
		cell.DrawGridLine(1,this.headerRowNumber,this.maxColCount,maxRows,0,2,color)
		this.loadData()
	},
	clear:function(){
		var cell = this.cell
		this.data = []
		cell.setRows(this.headerRowNumber + 1,0)
	},
	loadData:function(){
		this.clear();
		this.panel.el.mask("正在载入数据...","x-mask-loading")
		var req = {
				serviceId:this.listServiceId || "simpleQuery",
				schema:this.entryName,
				cnd:this.initCnd,
				pageSize:500,
				queryCndsType:this.queryCndsType
			}
		if(this.exQueryParam){
			for(var name in this.exQueryParam){
				var v = this.exQueryParam[name]
				if(typeof v == "object"){
					v = v.key;
				}
				req[name] = v
			}
		}
		
		util.rmi.jsonRequest(req,
			function(code,msg,json){
				this.panel.el.unmask()
				if(code < 300){
					this.feedCellListData(json)
				}
				else{
					alert(msg)
				}
			},
			this)		
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
		for(var i = 0; i < rowCount; i ++){
			var o = rs[i]
			r = r + 1
			cell.SetRowHeight(1,20,r,0)
			for(var name in o){
				var cfg = cm[name]
				if(cfg){
					var c = cfg.index
					var v = o[name]
					putData(cell,cfg.type,c,r,v)
				}
			}
		}
	},
	setCellData:function(cell,type,c,r,v,a){
		switch(type || 'string'){
			case 'int':
			case 'double':
			case 'bigDecimal':
				cell.D(c,r,0,v)
				cell.SetCellAlign(c,r,0,a || 34)
				break;
			case 'date':
			case 'timestamp':
			case 'text':
			case 'string':
				cell.S(c,r,0,v)
				cell.SetCellAlign(c,r,0,a || 33)						
			 	break;
		}
		cell.SetCellFontStyle(c,r,0,0)
	},	
	toRGBColor:function(hex){
		var b  = parseInt(hex.substr(0,2),16)
		var g  = parseInt(hex.substr(2,2),16)
		var r  = parseInt(hex.substr(4,2),16)
		return b + (g * 256) + (r * 65536)
	},
	onWinResize:function(win,w,h){
		var cell = this.getObject()
		if(cell){
			if(w){
				cell.Width = w - 12
			}
			if(h){
				cell.Height = h
			}
		}
	},
	initCellObjectHtml:function(){
		return '<OBJECT id='+ this.cellId +' height="100%"  width="100%" classid="clsid:3F166327-8030-4881-8BD2-EA25350E574A" CODEBASE="../inc/component/cellweb5.cab"><PARAM NAME="_Version" VALUE="65536"><PARAM NAME="_ExtentX" VALUE="9710"><PARAM NAME="_ExtentY" VALUE="4842"><PARAM NAME="_StockProps" VALUE="0"></OBJECT>'	
	},
	initPanel:function(){
		if(this.panel){
			return this.panel
		}
		var cfg = {
			layout:"fit",
			width : this.width,
			height : this.height,
			border:false,
			html : this.initCellObjectHtml()
		}
		if(this.showPrtActionOnBottom){
			cfg.tbar = [];
			cfg.bbar = this.createButtons()
		}
		else{
			cfg.tbar = this.createButtons()
		}
		var panel = new Ext.Panel(cfg)
		if(this.isCombined){
			panel.on("show",this.onWinShow,this)
		}
		this.panel = panel
		return panel;
	},
	getObject:function(){
		var id = this.cellId;
		if (window.document[id]) {
			return window.document[id];
		}
		if (navigator.appName.indexOf("Microsoft Internet")==-1) {
			if (document.embeds && document.embeds[id])
	      		return document.embeds[id]; 
	  	} 
		else {
	    	return document.getElementById(id);
	  	}
		
	},
	createButtons:function(){
		var actions = this.actions
		var buttons = []
		if(!actions){
			return buttons
		}
		for(var i = 0; i < actions.length; i ++){
			var action = actions[i];
			var btn = {
				text : action.name,
				ref:action.ref,
				cmd : action.delegate || action.id,
				iconCls : action.iconCls || action.id,
				enableToggle : (action.toggle == "true"),
				script :  action.script,
				handler : this.doAction,
				scope : this
			}
			buttons.push(btn)
		}
		return buttons
	},	
	doExportToExcel:function(){
		this.cell.ExportExcelDlg()
	},
	doPrintSetup:function(){
		this.cell.PrintPreview(0,0)
	},
	doShowSideLabel:function(){
		var status = 1;
		if(this.showSideLabel){
			status = 0;
			this.showSideLabel = false
		}
		else{
			this.showSideLabel = true
		}
		this.cell.ShowSideLabel(status,0)
		this.cell.ShowTopLabel(status,0)
	},
	doAction:function(btn,e){
		var cmd = btn.cmd
		cmd = "do" + cmd.charAt(0).toUpperCase() + cmd.substr(1)
		var action = this[cmd]
		if(typeof action == "function"){
			action.apply(this,[btn,e]);
		}
	},	
	getWin: function(){
		var win = this.win
		var closeAction = "hide"
		if(!win){
			win = new Ext.Window({
				id: this.id,
		        title: this.title,
		        width: this.width,
		        iconCls: 'icon-grid',
		        shim:true,
		        layout:"fit",
		        animCollapse:true,
		        closeAction:closeAction,
		        constrainHeader:true,
		        minimizable: true,
		        maximizable: true,
		        shadow:false,
		        items:this.initPanel()
            })
		    var renderToEl = this.getRenderToEl()
            if(renderToEl){
            	win.render(renderToEl)
            }
            win.on("close",function(){
				this.fireEvent("close",this)
			},this)
		    win.on("hide",function(){
				this.fireEvent("close",this)
			},this)
			win.on("show",this.onWinShow,this)
			win.on("resize",this.onWinResize,this)
			this.win = win
		}
		return win;
	}	
});