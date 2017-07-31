$package( "app.biz.ehrview" )
$import(
	"util.Accredit",
	"app.modules.form.SimpleFormView",
	"org.ext.ux.layout.TableFormLayout",
	"app.modules.form.TableFormView"
)
app.biz.ehrview.UpdateTemplate = function(cfg){
	this.colCount = 3;
	this.autoFieldWidth = true
	app.biz.ehrview.UpdateTemplate.superclass.constructor.apply(this,[cfg])
}
Ext.extend(app.biz.ehrview.UpdateTemplate, app.modules.form.TableFormView ,{
	
	doChange: function() {
		alert(2);
	},
	loadData: function(){
		
	}
	
	
});