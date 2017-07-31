$package("app.modules.form")
$import(
	"util.Accredit",
	"app.modules.form.SimpleFormView"
)
app.modules.form.TableFormView = function(cfg){
	this.colCount = 3;
	this.autoFieldWidth = true
	app.modules.form.TableFormView.superclass.constructor.apply(this,[cfg])
}
Ext.extend(app.modules.form.TableFormView, app.modules.form.SimpleFormView ,{
	onReady:function(){
		app.modules.form.TableFormView.superclass.onReady.call(this)
		if(!this.isCombined){
			if(this.form.rendered){
				//this.form.doLayout()
			}
		}
	},
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
		var table = {
			layout:'table',
			layoutConfig:{
				columns:colCount,
				tableAttrs:{
					//style:"width:100%",
					cellpadding:'2',
					cellspacing:"2"
				}
			},
			items:[]
		}
		var size = items.length
		for(var i = 0; i < size; i ++){
			var it = items[i]
			if((it.display == 0 || it.display == 1)  || !ac.canRead(it.acValue)){
				continue;
			}
			var f = this.createField(it)
			f.index = i;
			if(this.autoFieldWidth){
				delete f.width
				f.anchor = "100%"
			}
			else{
				if(!it.width){
					f.anchor = it.anchor || "100%"
				}
				else{
					if(it.anchor){
						delete f.width
						f.anchor = it.anchor
					}
				}
			}
			
			if(!this.fireEvent("addfield",f,it)){
				continue;
			}
			table.items.push({
				fid:f.fieldLabel,
				layout:'form',
				items:f,
				frame:false,
				colspan:parseInt(it.colspan),
				rowspan:parseInt(it.rowspan),
				layoutConfig:{
					elementStyle:"MARGIN-RIGHT: auto; MARGIN-LEFT: auto;"
				}
			})
		}
		
		var cfg = {
			buttonAlign:'center',
			labelAlign: this.labelAlign || "left",
			labelWidth:this.labelWidth || 80,
			frame: true,
			autoHeight:true,
			autoWidth:true,
			shadow:false,
			border:false,
			collapsible: false,
			floating:false
		}
		if(this.isCombined){
			cfg.frame = true
			cfg.shadow = false
		}
		this.initBars(cfg);
		Ext.apply(table,cfg)
		this.form = new Ext.FormPanel(table)
		this.form.on("afterrender",this.onReady,this)

		this.schema = schema;
		this.setKeyReadOnly(true)
		if(!this.isCombined){
			this.addPanelToWin();
		}
		return this.form
	}
});