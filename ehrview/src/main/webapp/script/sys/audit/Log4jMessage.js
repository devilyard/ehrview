$package("sys.audit")
$import("app.modules.list.SimpleListView","sys.audit.SqlAndSerLog")

sys.audit.Log4jMessage=function(cfg){
	sys.audit.Log4jMessage.superclass.constructor.apply(this,[cfg])
	
}

Ext.extend(sys.audit.Log4jMessage,app.modules.list.SimpleListView,{
	getCM:function(items){
		var cm = sys.audit.Log4jMessage.superclass.getCM.call(this,items);
		for(var i=0;i<cm.length;i++){
			if(cm[i].dataIndex=="Level"){
				cm[i].width=100;
			}
			if(cm[i].dataIndex=="Date"){
				cm[i].width=200;
			}
			if(cm[i].dataIndex=="Class"){
				cm[i].width=400;
			}
			if(cm[i].dataIndex=="Type_text"){
				cm[i].width=120;
			}
			if(cm[i].dataIndex=="RowNumber"){
				cm[i].width=100;
			}
		}
		this.cm=cm
		return this.cm
	},
	doCndQuery:function(){
		var initCnd=this.initCnd
		if(this.typeId==1||this.typeId==2){
			initCnd = ['eq',['$','Type'],['s',this.typeId]]
		}
		var index = this.cndFldCombox.getValue()
		var it = this.schema.items[index]
		if(!it){
			return;
		}
		this.resetFirstPage()
		var f = this.cndField;
		var v = f.getValue()
		if(v == null || v == ""){
			this.queryCnd = null;
			this.requestData.cnd = initCnd
			this.refresh()
			return
		}
		var refAlias = it.refAlias || "a"
		var cnd = ['eq',['$',refAlias + "." + it.id]]
		if(it.dic){
			if(it.dic.render == "Tree"){
				var node =  this.cndField.selectedNode
				if(!node.isLeaf()){
					cnd[0] = 'like'
					cnd.push(['s',v + '%'])
				}
				else{
					cnd.push(['s',v])
				}
			}
			else{
				cnd.push(['s',v])
			}
		}
		else{
			switch(it.type){
				case 'string':
					cnd[0] = 'like'
					cnd.push(['s','%'+v + '%'])
					break;
				case "datetime":
					if(v.format){
				       v = v.format("Y-m-d H:i:s")
				    }
					cnd = ['ge',['$', it.id],['date',v]]
				    var f1 = this.cndField1;
					var v1 = f1.getValue()
					if(v1 == null || v1 == ""){
						break;
					}else{
						var cnd1=['le',['$',it.id],['date',v1]]
						break;
					}
			}
		}
		this.queryCnd = cnd
		if(initCnd){
			cnd = ['and',cnd,initCnd]
		}
		if(cnd1){
			cnd = ['and',cnd,cnd1]
		}
		if(initCnd&&cnd1){
			cnd = ['and',cnd,cnd1,initCnd]
		}
		this.requestData.cnd = cnd
		this.refresh()
	},
	onCndFieldSelect: function(item,record,e){
		var tbar = this.grid.getTopToolbar()
		var tbarItems = tbar.items.items
		var index = record.data.value
		var it = this.schema.items[index]
		var field = this.cndField
		field.hide()
		var f = this.midiComponents[it.id]
		if(!f){
			if(it.dic){
				it.dic.src = this.entryName + "." + it.id
				it.dic.defaultValue = it.defaultValue
				it.dic.width = 150
				f = this.createDicField(it.dic)	
			}
			else{
				f = this.createNormalField(it)
			}
			f.on("specialkey",this.onQueryFieldEnter,this)
			this.midiComponents[it.id] = f
		}
		else{
			f.show()
			f.on("specialkey",this.onQueryFieldEnter,this)
		//	f.rendered = false
		}
		tbarItems[2] = f
		var field1 = this.cndField1
		if(it.type=="datetime"){
			if(!field1){
				var cndField1 = this.createNormalField(it)
				cndField1.emptyText  = "请选择截止日期时间"	
				tbarItems[3]=cndField1
				this.cndField1=cndField1
				var field1 = this.cndField1
			}
			field1.show();
		}else{
			if(field1){
				field1.hide();
			}
		}
		tbar.doLayout()
		this.cndField = f
	},
	doSql:function(){
		var mon=new sys.audit.SqlAndSerLog({activeTab:0})
		mon.getWin().show()
	},
	doService:function(){
		var mon=new sys.audit.SqlAndSerLog({activeTab:1})
		mon.getWin().show()
	}
})