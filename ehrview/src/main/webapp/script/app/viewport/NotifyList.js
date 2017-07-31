$package("app.viewport")

$import(
	"app.desktop.Module",
	"util.rmi.jsonRequest"
)

app.viewport.NotifyList = function(cfg){
	app.viewport.NotifyList.superclass.constructor.apply(this,[cfg])
}
Ext.extend(app.viewport.NotifyList, app.desktop.Module,{
	initPanel:function(sc){
		if(this.grid){
			return this.grid
		}
 		var cm = this.initCM()
 		var reader = new Ext.data.ArrayReader({
 			fields:this.initRecord()
 		})
 		var store = new Ext.data.Store({
 			data:[],
 			reader:reader
 		})
 		this.gridStore = store
	    var grid = new Ext.grid.GridPanel({
	        store: store,
	        cm: cm,
	        width:300,
	        height:130
	    })
	    grid.on("celldblclick",this.onDbClick,this)
	    grid.on("keydown",function(e){
			if(e.getKey() == e.ENTER){
				e.stopEvent()
				var r = this.grid.getSelectionModel().getSelected()
				if(r && r.data.refModule){
					var desktop = this.mainApp.desktop
					desktop.openWin(r.data.refModule);
				}
				return;
			}
		},this)
	    this.grid = grid
	    return grid;
	},
	onDbClick:function(grid,r,c,e){
		var rs = this.data
		var desktop = this.mainApp.desktop
		if(rs && r < rs.length){
			var id = rs[r].refModule
			if(id){
				desktop.openWin(id);
			}
		}
	},
	loadData:function(){
		if(this.loading){
			return
		}
		var req = {
			serviceId:"getNotifyInfo"
		}
		if(this.grid.el){
			this.grid.el.mask("正在加载数据...")
		}
		this.loading = true
		util.rmi.jsonRequest(req,function(code,msg,json){
			if(this.grid.el){
				this.grid.el.unmask()
			}
			this.loading = false;
			if(code == 200){
				this.feedData(json)
			}
			else{
				alert(msg)
			}
		},this)
	},
	feedData:function(json){
		var store = this.gridStore
		var rs = json.body
		this.data = rs
		store.removeAll();
		if(rs && rs.length > 0){
			for(var i = 0; i < rs.length; i ++){
				var r = new this.Record(rs[i])
				store.add(r)
			}
		}
		this.selectFirstRow()
	},
	selectFirstRow:function(){
		if(this.grid){
			var sm = this.grid.getSelectionModel()
			if(sm.selectRow){
				sm.selectRow(0)
			}
			else if(sm.select){
				sm.select(0,0)
			}
			if(!this.grid.hidden){
				try{
					this.grid.getView().getRow(0).focus(true,true)
				}
				catch(e){}
			}
		}	
	},	
	initCM:function(){
	  var cm =new Ext.grid.ColumnModel([
			{
	           header: "标题",
	           dataIndex: 'eventName',
	           width: 100,
	           css : "font-weight:bold;"
	        },{
	           header: "内容",
	           dataIndex: 'eventValue',
	           width: 350
	        }
	    ]);	
	    return cm;
	},
	initRecord:function(){
	    this.Record = Ext.data.Record.create([
	           {name: 'eventName', type: 'string'},
	           {name: 'eventValue', type: 'string'},
	           {name: 'refModule',type:'string'}
	      ]);
	      return this.Record;
	},
	getWin: function(){
		var win = this.win
		var closeAction = "close"
		if(!this.mainApp){
			closeAction = "hide"
		}
		if(!win){
			win = new Ext.Window({
				id: this.id,
		        title: this.title,
		        width: this.width,
		        iconCls: 'icon-grid',
		        shim:true,
		        layout:"fit",
		        animCollapse:true,
		        closeAction:closeAction,
		        constrainHeader:true,
		        minimizable: true,
		        maximizable: true,
		        shadow:false,
		        items:this.initPanel()
            })
		    var renderToEl = this.getRenderToEl()
            if(renderToEl){
            	win.render(renderToEl)
            }
			win.on("add",function(){
				this.win.doLayout()
			},this)
			this.win = win
		}
		return win;
	}	
});