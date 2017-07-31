$package("app.modules.config.user")

$import("app.modules.list.SimpleListView")

app.modules.config.user.UserConfigList = function(cfg){
	cfg.createCls = "app.modules.config.user.UserConfigForm"//"app.modules.config.UserManageModule"
	cfg.updateCls = "app.modules.config.user.UserConfigForm"
	this.userId = "userId"
	this.serviceId = "userService"
	Ext.apply(this,app.modules.common)
    app.modules.config.user.UserConfigList.superclass.constructor.apply(this,[cfg])	
}
Ext.extend(app.modules.config.user.UserConfigList,app.modules.list.SimpleListView,{
	
	getStoreFields:function(items){
		var fields = []
		var ac =  util.Accredit;
		var pkey = "";
		for(var i = 0; i <items.length; i ++){
			var it = items[i]
			var f = {}
			f.name = it.id
			switch(it.type){
	           		case 'date':
						break;
					case 'int':
						f.type = "int"
						break
					case 'double':
					case 'bigDecimal':
						f.type = "float"						
						break
					case 'string':
						f.type = "string"
			}
			fields.push(f)
			if(it.dic){
				fields.push({name:it.id + "_text",type:"string"})
			}
		}
		return {fields:fields}
	},
	
	doRemove:function(){
		var r = this.getSelectedRecord()
		if(r == null){
			return
		}
		Ext.Msg.show({
		   title: '确认删除用户[' + r.data[this.userId] + ']',
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
				body:r.data,
				cmd:"remove"
			},
			function(code,msg,json){
				this.unmask()
				if(code < 300){
					this.store.remove(r)
					this.fireEvent("remove",this.entryName,'remove',json,r.data)					
				}
				else{
					this.processReturnMsg(code,msg,this.doRemove)
				}
			},
			this)
	}

})
