$package("app.modules.config.user")

$import(
      "app.modules.list.SimpleListView",
       "util.rmi.miniJsonRequestSync"
)

app.modules.config.user.PersonQuery = function(cfg){
	this.cardnum = "cardnum"
	this.loadServiceId = "simpleLoad"
	this.fieldName = "userId"
	this.loadEntryName = "SYS_USERS"
    app.modules.config.user.PersonQuery.superclass.constructor.apply(this,[cfg])
}
Ext.extend(app.modules.config.user.PersonQuery,app.modules.list.SimpleListView,{
	onDblClick:function(grid,index,e){
	    var r = this.getSelectedRecord()
	    var d = r.data
	    var re = util.rmi.miniJsonRequestSync({
			  serviceId:this.loadServiceId,
			  schema:this.loadEntryName,
			  fieldName:this.fieldName,
			  fieldValue:d["personId"]
		})
		if(re.code == 200 && re.json.body){
		   Ext.Msg.alert("错误","用户已经存在，请选择其他人员")
		   return
		}
		
	    var data = {}
	    for(var id in d){
	       if(d[id+"_text"]){
		       data[id] = {key:d[id],text:d[id+"_text"]}
		       continue
		   }
		   if(id.indexOf("_text") != -1){
		       continue
		   }
		   data[id] = d[id]
	    }
	    this.opener.initForm(data)
	    if(this.win){
	       this.win.hide()
	    }
	},
	
	onSave:function(entryName,op,json,rec){
		var cardNo = rec[this.cardnum]
		this.requestData.cnd = ['eq',['$',this.cardnum],['s',cardNo]]
		this.fireEvent("save",entryName,op,json,rec);
		this.refresh()
	},
	
	doCndQuery:function(){
		this.initCnd = null
	    app.modules.config.user.PersonQuery.superclass.doCndQuery.call(this)
	},
	
    getWin: function(){
		var win = this.win
		if(!win){
			win = new Ext.Window({
				id: this.id,
		        title: this.title,
		        width: this.width,
		        iconCls: 'icon-grid',
		        shim:true,
		        layout:"fit",
		        animCollapse:true,
		        closeAction:'hide',
		        constrainHeader:true,
		        minimizable: true,
		        maximizable: true,
		        shadow:false,
		        modal :true
            })
		    var renderToEl = this.getRenderToEl()
            if(renderToEl){
            	win.render(renderToEl)
            }
			win.on("add",function(){
				this.win.doLayout()
			},this)
			win.on("close",function(){
				this.fireEvent("close",this)
			},this)
			this.win = win
		}
		return win;
	}
})