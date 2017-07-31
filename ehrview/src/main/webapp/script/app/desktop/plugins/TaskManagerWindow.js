$package("app.desktop.plugins")

$import("util.ObjectBrowser")
app.desktop.plugins.TaskManagerWindow = function(config){
	app.desktop.plugins.TaskManagerWindow.superclass.constructor.apply(this,[config])
}
Ext.extend(app.desktop.plugins.TaskManagerWindow, app.desktop.Module,{
	getWin: function(){
		var win = new Ext.Window({
			id: this.id,
	        title: this.title,
	        width: 700,
	        iconCls: 'bogus',
	        shim:true,
	        layout:"fit",
	        animCollapse:true,
	        constrainHeader:true,
	        minimizable: true,
	        maximizable: true,
	        shadow:false,
	        items: new Ext.grid.GridPanel({
                        border:false,
                        ds: new Ext.data.Store({
                            reader: new Ext.data.JsonReader({}, [
                               {name: 'pid'},
                               {name: 'id', type: 'string'},
                               {name: 'type', type: 'string'},
                               {name: 'title', type: 'string'},
                               {name: 'script', type: 'string'},
                               {name:'instance',type:"string"}
                            ]),
                            data: this.mainApp.taskManager.modules
                        }),
                        cm: new Ext.grid.ColumnModel([
                            new Ext.grid.RowNumberer(),
                            {header: "任务ID", width: 20, sortable: true, dataIndex: 'pid'},
                            {header: "模块ID", width: 25, sortable: true,  dataIndex: 'id'},
                            {header: "模块类型", width: 25, sortable: true,  dataIndex: 'type'},
                            {header: "模块名称",  width: 50,sortable: true, dataIndex: 'title'},
                            {header: "脚本", width: 80, sortable: true, dataIndex: 'script'},
                            {header: "实例", width: 40,sortable: true, dataIndex: 'instance'}
                        ]),

                        viewConfig: {
                            forceFit:true
                        },

                        tbar:[
                        {	text:'加载',
                            tooltip:'加载任务',
                            iconCls:'add',
                            handler:this.run,
                            scope:this
                        },
                        {
                            text:'新任务',
                            tooltip:'添加新任务',
                            iconCls:'add',
                            handler:this.addNew,
                            scope:this
                        },
                        {
                        	text:'查看对象',
                        	tooltip:'浏览对象',
                        	iconCls:'option',
                        	handler:this.detail,
                        	scope:this
                        },
                        '-', 
                        {
                            text:'刷新',
                            tooltip:'刷新任务',
                            iconCls:'option',
                            handler:this.refresh,
                            scope:this
                        },'-',{
                            text:'删除实例',
                            tooltip:'删除实例后需要重新加载脚本',
                            iconCls:'remove',
                            handler:this.remove,
                            scope:this
                        }]
                    })
		})
			
		this.win = win
		return win;
	},
	setMainApp: function(mainApp){
		app.desktop.plugins.TaskManagerWindow.superclass.setMainApp.apply(this,[mainApp])
		this.mainApp.taskManager.on("afterloadModule",this.refresh,this)
		this.mainApp.taskManager.on("afterDestoryModule",this.refresh,this)
	},
	run:function(){
		if(!this.win){
			return
		}
        var rc = this.win.items.get(0).getSelectionModel().getSelected()
        if(rc){
        	this.mainApp.desktop.openWin(rc.data.id)
        }
    },
    detail:function(){
    	if(!this.win){
			return
		}
        var rc = this.win.items.get(0).getSelectionModel().getSelected()
        if(rc){
        	
        	var module = this.mainApp.taskManager.tasks.item(rc.data.id)
			
        	if(module && module.instance){
        		var ob = this.objectBrowser
        		if(!ob){
					ob = new util.ObjectBrowser()
					this.objectBrowser = ob
        		}
		   		ob.setRootObject(module.instance)
				ob.show(this.mainApp.desktop.getDesktopEl())
        	}
        }
    },
	refresh:function(){
		if(!this.win){
			return
		}
		var grid = this.win.items.get(0)
		grid.getStore().loadData(this.mainApp.taskManager.modules);
        grid.getView().refresh(true);
		
	},
	remove:function(){
        if(!this.win){
        	return;
        }
        var rc = this.win.items.get(0).getSelectionModel().getSelected()
    	if(rc){
    		var id = rc.data.id
    		var module = this.mainApp.taskManager.tasks.item(id)
    		
			if(module && module.instance){
				if(module.type == "SYSTEM"){
    				return;
    			}
    			module.instance.destory();
    			module.instance = null
    			$destory(module.script)
    			this.refresh();	
    		}
    		
    	}
	},
	addNew:function(){
	
	
	},
    destory: function(){
		app.desktop.plugins.TaskManagerWindow.superclass.destory.call(this)
		if(this.objectBrowser){
			this.objectBrowser.destory()
		}
		this.mainApp.taskManager.un("afterloadModule",this.refresh,this)
		this.mainApp.taskManager.un("afterDestoryModule",this.refresh,this)
	}
});
