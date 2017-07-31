$package("app.modules.config")

$import("app.modules.list.SimpleListView")

app.modules.config.RemoveConfigList = function(cfg){
	this.serviceId = "personnelService"
	this.fieldId = "personId"
	this.textField = "name"
	Ext.apply(this,app.modules.common)
    app.modules.config.RemoveConfigList.superclass.constructor.apply(this,[cfg])	
}
Ext.extend(app.modules.config.RemoveConfigList,app.modules.list.SimpleListView,{
	
	doRemove:function(){
		var r = this.getSelectedRecord()
		if(r == null){
			return
		}
		Ext.Msg.show({
		   title: '确认删除[' + r.data[this.textField] + ']',
		   msg: '删除操作将无法恢复，是否继续?',
		   modal:true,
		   width: 300,
		   buttons: Ext.MessageBox.OKCANCEL,
		   multiline: false,
		   fn: function(btn, text){
		   	 if(btn == "ok"){
		   	 	this.processRemove();
		   	 }
		   },
		   scope:this
		})	
	},
	
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
				serviceId:this.serviceId,
				op:"remove",
				fieldName:this.fieldId,
				fieldValue:r.data[this.fieldId],				
				schema:this.entryName
			},
			function(code,msg,json){
				this.unmask()
				if(code < 300){
					this.store.remove(r)
					this.updatePagingInfo()
					this.fireEvent("remove",this.entryName,'remove',json,r.data)					
				}
				else{
					this.processReturnMsg(code,msg,this.doRemove)
				}
			},this)
	}
})