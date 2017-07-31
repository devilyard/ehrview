$package("app.modules.form")
$import(
	"util.Accredit",
	"app.modules.form.SimpleFormView"
)
app.modules.form.MCFormView = function(cfg){
	this.colCount = 3;
	this.width = 800;
	app.modules.form.MCFormView.superclass.constructor.apply(this,[cfg])
}
Ext.extend(app.modules.form.MCFormView, app.modules.form.SimpleFormView ,{
	initPanel:function(sc){
		if(this.form){
			if(!this.isCombined){
				this.addPanelToWin();
			}			
			return this.form;
		}
		var schema = sc
		if(!schema){
			var re = util.schema.loadSync(this.entryName)
			if(re.code == 200){
				schema = re.schema;
			}
			else{
				this.processReturnMsg(re.code,re.msg,this.initPanel)
				return;
			}
		}
		var ac =  util.Accredit;
		var defaultWidth = this.fldDefaultWidth || 200
		var items =  schema.items
		var colCount = this.colCount;
		var colAnchor= parseFloat(1/colCount).toFixed(2);
		var col = [];
		for(var i = 0; i < colCount; i ++){
			col.push({
				columnWidth:colAnchor,
                layout: 'form',
                border:false,
				frame: false,
				defaultType: 'textfield',
				autoHeight:true,
                items:[]
			})
		}
		var sw = 0;
		var size = items.length
		for(var i = 0; i < size; i ++){
			var it = items[i]
			if((it.display == 0 || it.display == 1)  || !ac.canRead(it.acValue)){
				continue;
			}
			var f = this.createField(it)
			f.index = i;
			delete f.width
			f.anchor = '98%'
			if(!this.fireEvent("addfield",f,it)){
				continue;
			}
			col[sw].items.push(f)
			sw ++;
			if(sw == colCount){
				sw = 0;
			}
		}
		var cfg = {
			buttonAlign:"center",
			labelAlign:"left",
			labelWidth:this.labelWidth || 80,
			frame: true,
			autoHeight:true,
			autoWidth:true,
			shadow:true,
			items:{layout:'column',items:col,autoWidth:true}
		}
		if(this.isCombined){
			cfg.frame = true
			cfg.border = false
			cfg.shadow = false
		}
		this.initBars(cfg);
		this.form = new Ext.FormPanel(cfg)
		this.form.on("render",this.onReady,this)

		this.schema = schema;
		this.setKeyReadOnly(true)
		if(!this.isCombined){
			this.addPanelToWin();
		}
		return this.form
	}
});