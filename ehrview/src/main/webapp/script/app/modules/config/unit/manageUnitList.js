$package("app.modules.config.unit")

$import("app.modules.list.SimpleListView")

app.modules.config.unit.manageUnitList = function(cfg){
	cfg.removeServiceId = "manageService"
	cfg.createCls = "app.modules.config.unit.manageUnitForm"
	cfg.updateCls = "app.modules.config.unit.manageUnitForm"
	app.modules.config.unit.manageUnitList.superclass.constructor.apply(this,[cfg])
}

Ext.extend(app.modules.config.unit.manageUnitList, app.modules.list.SimpleListView, {
	
	processRemove:function(){
		var r = this.getSelectedRecord()
		if(r == null){
			return
		}		
		if(!this.fireEvent("beforeRemove",this.entryName,r)){
			return;
		}
		this.mask("在正删除数据...")
		util.rmi.jsonRequest({
				serviceId:this.removeServiceId,
				pkey:r.id,
				op:"remove",
				schema:this.entryName
			},
			function(code,msg,json){
				this.unmask()
				if(code < 300){
					this.store.remove(r)
					this.fireEvent("save",this.entryName,'remove',json,r.data)					
				}
				else{
					this.processReturnMsg(code,msg,this.doRemove)
				}
			},
			this)
	}
})