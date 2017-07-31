$package("app.modules.config.unit")

$import("app.modules.list.SimpleListView")

app.modules.config.unit.ManageUnitQuery = function(cfg){
	app.modules.config.unit.ManageUnitQuery.superclass.constructor.apply(this,[cfg])
}

Ext.extend(app.modules.config.unit.ManageUnitQuery, app.modules.list.SimpleListView, {
	
	onDblClick:function(grid,index,e){
	    var r = this.getSelectedRecord()
	    if(this.opener){
	       this.opener.initDataId = r.id
	       this.opener.loadData()
	    }  
	}
	
})