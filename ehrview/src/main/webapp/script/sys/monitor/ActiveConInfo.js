$package("sys.monitor.ActiveConInfo")
$import("app.modules.list.SimpleListView","app.desktop.Module","util.dictionary.TreeDicFactory","org.ext.ux.grid.RowExpander")

sys.monitor.ActiveConInfo=function(cfg){
	this.width = 800
	this.height =500
	Ext.apply(this, cfg)
	sys.monitor.ActiveConInfo.superclass.constructor.apply(this,[cfg])
	
}

Ext.extend(sys.monitor.ActiveConInfo,app.desktop.Module,{
	init:function(){
		this.initPanel();
	},
	getWin: function(){
		var win = this.win
		if(!win){
			win = new Ext.Window({
		        title: "活动连接查看",
		        width: this.width,
		        height:this.height,
		        items:this.grid,
		        iconCls: 'icon-form',
		        bodyBorder:false,
		        closeAction:'hide',//closeAction:枚举值为：close(默认值)，当点击关闭后，关闭window窗口   hide,关闭后，只是hidden窗口
		        layout:"fit",
		        autoScroll:false,
		        maximizable: true,
		        shadow:false,
		        modal:true  //:true为模式窗口，后面的内容都不能操作，默认为false
            })
		    win.on("show",function(){
		    	this.fireEvent("winShow")
		    },this)
		    win.on("close",function(){
				this.fireEvent("close",this)
			},this)
		    win.on("hide",function(){
				this.fireEvent("close",this)
			},this)
			this.win = win
		}
		return win;
	},
	initPanel : function() {
		var expander = new Ext.ux.grid.RowExpander({
			tpl : new Ext.XTemplate('<div style="padding-left:50px;"><b>{content}</b></div>')
		});
		var url = ClassLoader.serverAppUrl || "";
		var grid = new Ext.grid.GridPanel({
			plugins : [expander],
			autoScroll : true,
			store : new Ext.data.Store({
					autoLoad:true,
					proxy : new Ext.data.HttpProxy({
					url : url + '*.jsonRequest',
					method : 'post',
					jsonData :{serviceId:"monInfo",op:"getActiveConInfo",domain:this.domain,ip:this.ip}
				}),
				reader : new Ext.data.JsonReader({
					root : 'body',
					fields : ['info',"content"]
				})
			}),
			columns : [expander,new Ext.grid.RowNumberer(), {
				header : "正在活动连接的详细信息",
				dataIndex : "info",
				width : 800
			}]
		})
		this.grid=grid
		return grid;
	}
})