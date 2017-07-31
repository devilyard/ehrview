$package("app.modules.config")

$import("app.modules.config.ManageUnitConfigPanel")

app.modules.config.OfficeConfigPanel = function(cfg){
	cfg.fieldId = "officeCode"
	cfg.textField = "officeName"
	app.modules.config.OfficeConfigPanel.superclass.constructor.apply(this,[cfg])
}
Ext.extend(app.modules.config.OfficeConfigPanel, app.modules.config.ManageUnitConfigPanel,{
     initGrid:function(node){
		var id = node.attributes.key //node.id
		var n = id.length
		if(this.gridModule){
			this.gridModule.requestData.cnd = ['eq',['$','organizCode'],['s',id]]
		    this.gridModule.refresh()
		}			
	}
})

