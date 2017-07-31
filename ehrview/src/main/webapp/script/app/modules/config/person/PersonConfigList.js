$package("app.modules.config.person")

$import("app.modules.list.SimpleListView")

app.modules.config.person.PersonConfigList = function(cfg){
	cfg.removeServiceId = "personnelService"
	this.personId = "personId"
	this.name = "personName"
	Ext.apply(this,app.modules.common)
    app.modules.config.person.PersonConfigList.superclass.constructor.apply(this,[cfg])	
}
Ext.extend(app.modules.config.person.PersonConfigList,app.modules.list.SimpleListView,{
	
	active:function(obj){
		//alert(obj.op)
		if(!this.selectedIndex){
			this.selectRow(0)
		}
		else{
			this.selectRow(this.selectedIndex);
		}
	},
	
	doRemove:function(){
		var r = this.getSelectedRecord()
		if(r == null){
			return
		}
		Ext.Msg.show({
		   title: '确认删除用户[' + r.data[this.name] + ']',
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
				serviceId:this.removeServiceId,
				op:"remove",
				fieldName:this.personId,
				fieldValue:r.data[this.personId],				
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