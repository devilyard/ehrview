$package("app.modules.config.user")

$import("app.modules.list.SimpleListView")

app.modules.config.user.UserPropList = function(cfg){
	cfg.createCls = "app.modules.config.user.UserPropForm"
	cfg.updateCls = "app.modules.config.user.UserPropForm"
	this.disablePagingTbr = true
	this.title = "用户属性"
	this.actions = [
		 {id:"create",name:"增加",iconCls:"add"},
		 {id:"update",name:"修改"},
		 {id:"remove",name:"删除"}
    ]
    app.modules.config.user.UserPropList.superclass.constructor.apply(this,[cfg])	
}
Ext.extend(app.modules.config.user.UserPropList,app.modules.list.SimpleListView,{
	
	doRemove:function(){
		var r = this.getSelectedRecord()
		if(r == null){
			return
		}
		Ext.Msg.show({
		   title: '确认删除记录',
		   msg: '删除操作是否继续?',
		   modal:true,
		   width: 250,
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
		this.store.remove(r)
		this.fireEvent("change",this)
	},

	onSave:function(o){
		this.fireEvent("change",this)
	}

})