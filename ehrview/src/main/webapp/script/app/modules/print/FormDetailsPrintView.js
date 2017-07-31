/**
* @include "SimpleListView.js"
*/
$package("app.modules.print")
$import(
	"app.modules.print.ListPrintView",
	"util.schema.SchemaLoader",
	"util.rmi.jsonRequest",
	"util.rmi.miniJsonRequestSync"
)

app.modules.print.FormDetailsPrintView = function(cfg){
	this.maxColCount = 255
	this.maxLineCol = 6
	this.formCols = {}
	app.modules.print.FormDetailsPrintView.superclass.constructor.apply(this,[cfg])

}
Ext.extend(app.modules.print.FormDetailsPrintView, app.modules.print.ListPrintView,{
	loadFormSchema:function(){
		var formSchema = this.formSchema
		if(!formSchema){
			var re = util.schema.loadSync(this.formEntryName)
			if(re.code == 200){
				this.formSchema = re.schema;
			}
			else{
				this.processReturnMsg(re.code,re.msg,this.initPanel)
			}
		}
		this.initFormFields()
	},
	loadData:function(){
		var formData = this.loadFormData()
		if(!formData){
			return;
		}
		var cell = this.cell
		var formCols = this.formCols
		var putData = this.setCellData
		for(var name in formCols){
			var cfg = formCols[name]
			var v = cfg.dic ?  formData[name].text : formData[name]
			putData(cell,cfg.type,cfg.c,cfg.r,v,33)
		}
		app.modules.print.FormDetailsPrintView.superclass.loadData.call(this)
	},
	loadFormData:function(){
		var re = util.rmi.miniJsonRequestSync({
			serviceId:"simpleLoad",
			schema:this.formEntryName,
			pkey:this.initDataId
		})
		var formData = {}
		if(re.code == 200){
			formData = re.json.body
		}
		var formSchema = this.formSchema
		this.initCnd = ['eq',['$',formSchema.pkey],['i',formData[formSchema.pkey]]]
		return formData;
	},
	initFormFields:function(){
		var formSchema = this.formSchema
		if(!formSchema){
			return;
		}
		var formData = this.loadFormData()
		if(!formData){
			return;
		}
		var cell = this.cell
		var n = formSchema.items.length
		var r = 2;
		var c = 1;
		var putData = this.setCellData
		var count = n;
		cell.ShowGridLine(0,0)
		for(var i = 0; i < n; i ++){
			var it = formSchema.items[i]
			if(it.hidden){
				count --;
				continue
			}
			this.formCols[it.id] = {c:c + 1,r:r,type:it.type,dic:it.dic}
			cell.S(c,r,0,it.alias)
			cell.SetCellAlign(c,r,0,33)
			cell.SetCellFontStyle(c,r,0,2)	
			cell.SetRowHeight(1,25,2,0)	
			if(i == n - 1){
				cell.MergeCells(c + 1,r, this.maxColCount,r)
			}
			else{
				cell.MergeCells(c + 1,r, c + 2,r)
			}
			
			var type = it.dic ? "string" : it.type
			var v = it.dic ?  formData[it.id].text : formData[it.id]
			putData(cell,type,c + 1,r,v,33)
			if(c + 3 > this.maxLineCol){
				r ++
				c = 1
			} 
			else{
				c += 3
			}
		}
		var needRows = parseInt(count / (this.maxLineCol / 3))
		this.headerRowNumber = needRows + 3
		app.modules.print.FormDetailsPrintView.superclass.initHeaders.call(this)
	},
	initHeaders:function(){
		if(!this.initDataId){
			return;
		}
		var schema = this.schema
		if(!schema){
			return;
		}
		var n = 1
		for(var i = 0; i < schema.items.length; i ++){
			if(schema.items[i].hidden){
				continue
			}
			n ++ 
		}
		this.maxColCount = this.maxLineCol > n ? this.maxLineCol : n
		var formCols = {}
		this.loadFormSchema()
	},
	clear:function(){
		
		app.modules.print.FormDetailsPrintView.superclass.clear.call(this)
	}
});