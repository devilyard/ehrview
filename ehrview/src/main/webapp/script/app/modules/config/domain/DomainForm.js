$package("app.modules.config.domain")

$import("app.modules.form.TableFormView")
		
app.modules.config.domain.DomainForm = function(cfg){
	app.modules.config.domain.DomainForm.superclass.constructor.apply(this,[cfg])
}
Ext.extend(app.modules.config.domain.DomainForm, app.modules.form.TableFormView,{
	doSave:function(){
		var form = this.form.getForm()
		var status = form.findField("Status")
		var url = form.findField("DomainUrl")
		if("1" == status.getValue()){
			if(!url.getValue()){
			    url.markInvalid("独立启用时不能为空")
			    return
			}
		}
		app.modules.config.domain.DomainForm.superclass.doSave.call(this)
	}
})