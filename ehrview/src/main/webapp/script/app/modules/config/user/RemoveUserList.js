$package("app.modules.config.user")

$import("app.modules.list.SimpleListView")

app.modules.config.user.RemoveUserList = function(cfg){
	Ext.apply(this,app.modules.common)
    app.modules.config.user.RemoveUserList.superclass.constructor.apply(this,[cfg])	
}
Ext.extend(app.modules.config.user.RemoveUserList,app.modules.list.SimpleListView,{
	
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
		var data = this.parseData()
		this.mask("在正删除数据...")
		util.rmi.jsonRequest({
				serviceId:this.serviceId,
				op:"remove",
				body:data
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
	},
	
	parseData:function(){
	    var data = {}
		var type = this.tabType
		var key = this.node.attributes.key
		var domainId = this.domain
		if(type == "role"){
			domainId = key
			if(this.node.isLeaf()){				
				var pn = this.node.parentNode
				data.queryField = "jobId"
			 	data["jobId"] = this.formatValue(key)
			 	domainId = pn.attributes.key
		   	}
		}
		if(type == "unit"){
			if(this.node.attributes.type != "dic"){
				data.queryField = "manaUnitId"
				data["manaUnitId"] = key
			}
		}
		var r = this.getSelectedRecord()
		data.userId = r.data[this.fieldId]
		data.domain = domainId
		return data
		
	},
	
	formatValue:function(v){
	    var i = v.indexOf("-")
	    if(i != -1){
	       return v.substring(i+1)
	    }
	    return v
	}
})