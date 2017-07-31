$package( "app.biz.ehrview" )
$import(
	"util.Accredit",
	"app.modules.form.SimpleFormView",
	"org.ext.ux.layout.TableFormLayout",
	"app.modules.form.TableFormView"
)
app.biz.ehrview.LabExamSetFormView = function(cfg){
	this.colCount = 3;
	this.autoFieldWidth = true
	app.biz.ehrview.LabExamSetFormView.superclass.constructor.apply(this,[cfg])
	this.on("beforeSave",this.checkUniquely,this)
}
Ext.extend(app.biz.ehrview.LabExamSetFormView, app.modules.form.TableFormView ,{
	
	
	checkUniquely:function(){
		if(this.op == 'update'){
			return true;
		}
		var form = this.form.getForm()
		var items = this.schema.items
		var tab = this.schema.id
		var it = items[0]
		var sid = it.id
		var f = form.findField(sid)
		var sidv = f.getValue()
		var r = util.rmi.miniJsonRequestSync({
							serviceId : "simpleQuery",
							schema:this.entryName,
							cnd:["eq", ["$", "a."+it.id], ["s", sidv]]
						})
		if(r.json.body.length>0){
			var dic = util.dictionary.DictionaryLoader.load({id:'title'});
			if(dic.items && dic.items.length > 0){
				for (var i = 0; i < dic.items.length; i++) {
					var item = dic.items[i]
					if (item.key== sidv) {
						Ext.Msg.alert("警告", it.alias+"【<font color='red'>"+item.text+"</font>】已存在!");
						return false;
					}
				}
			}
			Ext.Msg.alert("警告", it.alias+"【"+sidv+"】已存在!");
			return false;
		}
		return true;
	}
});