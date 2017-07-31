$package("sys.monitor")
$styleSheet("ext.ux.GroupTab")
$import(
	"org.ext.ux.GroupTab", 
	"org.ext.ux.GroupTabPanel",
	"util.rmi.miniJsonRequestSync",
	"sys.monitor.MyChart")

sys.monitor.MonDetail = function(cfg) {
	this.width = 900
	this.height = 500
	Ext.apply(this, cfg)
	this.init()
	sys.monitor.MonDetail.superclass.constructor.apply(this, [cfg]);
}
Ext.chart.Chart.CHART_URL = ClassLoader.appRootOffsetPath+'resources/charts.swf';
Ext.extend(sys.monitor.MonDetail, Ext.util.Observable, {
	getSqlListPanel:function(){
		var url = ClassLoader.serverAppUrl || "";
		var grid = new Ext.grid.GridPanel({
			title : "警告信息",
			height:400,
			autoScroll:true,
			store : new Ext.data.Store({
					autoLoad:true,
					proxy : new Ext.data.HttpProxy({
					url : url + '*.jsonRequest',
					method : 'post',
					jsonData :{serviceId:"monInfo",op:"getSql",domain:this.domain,ip:this.ip}
				}),
				reader : new Ext.data.JsonReader({
					root : 'body',
					fields : ['ExecuteCount','timespan','content']
				})
			}),
			columns : [new Ext.grid.RowNumberer(), {
				header : "SQL描述",
				dataIndex : "content",
				width : 480,
				renderer:function(value){
					return '<div style="white-space: pre-line">'+value+'&nbsp;&nbsp;</div>'
				}
			},{
				header : "执行次数(次)",
				dataIndex : "ExecuteCount",
				width : 80
			},
			{						
				header : "最大耗时(毫秒)",
				dataIndex : "timespan",
				width : 90,
				css : "color: red;"
			}]
		})
		return grid;
	},
	getServiceListPanel:function(){
		var url = ClassLoader.serverAppUrl || "";
		var grid = new Ext.grid.GridPanel({
			title : "service执行信息",
			height:400,
			autoScroll : true,
			store : new Ext.data.Store({
					autoLoad:true,
					proxy : new Ext.data.HttpProxy({
					url : url + '*.jsonRequest',
					method : 'post',
					jsonData :{serviceId:"monInfo",op:"getService",domain:this.domain,ip:this.ip}
				}),
				reader : new Ext.data.JsonReader({
					root : 'body',
					fields : ['id','totalFrequence','maxCostTime','minCostTime','lastCostTime','avgCostTime']
				})
			}),
			columns : [new Ext.grid.RowNumberer(), {
				header : "service名称",
				dataIndex : "id",
				width : 150
			},
			{	
				header : "总执行次数",
				dataIndex : "totalFrequence",
				width : 80
			},
			{
				header : "最长执行时间(ms)",
				dataIndex : "maxCostTime",
				width : 110
			},
			{
				header : "最短消耗时间(ms)",
				dataIndex : "minCostTime",
				width : 110
			},
			{
				header : "最后执行时间(ms)",
				dataIndex : "lastCostTime",
				width : 110
			},
			{
				header : "平均执行时间(ms)",
				dataIndex : "avgCostTime",
				width : 110
			}]
		})
		return grid;
	},
	getAppInfoPanel:function(){
		var r = util.rmi.miniJsonRequestSync({
			serviceId:"monInfo",
			op:"getAppInfo",
			domain:this.domain,
			ip:this.ip
		})
		if(r.code == 200){
			var body = r.json.body
		    var store = new Ext.data.JsonStore({
		        fields: ['season', 'total'],
		        data: [{
		            season: '物理使用内存(GB)',
		            total: Math.round(body["usedPhysicalMemory"]/(1024*1024*1024)*10)/10
		        },{
		            season: '物理空闲用内存(GB)',
		            total: Math.round(body["freePhysicalMemorySize"]/(1024*1024*1024)*10)/10
		        }]
		    });
		    var data1 = [];
		    for(var id in body["dayCycleDataBean"]["onlines"]){
		    	data1.push({date:id,number:body["dayCycleDataBean"]["onlines"][id]})
		    }
		    var store1 = new Ext.data.JsonStore({
		    	fields: ['date', 'number'],
		    	data:data1
		    })
		    var data2 = [];
		    for(var id in body["dayCycleDataBean"]["memory"]){
		    	data2.push({date:id,number:Math.round(body["dayCycleDataBean"]["memory"][id]/(1024*1024)*10)/10})
		    }
		    var store2 = new Ext.data.JsonStore({
		    	fields: ['date', 'number'],
		    	data:data2
		    })
		    var data3 = [];
		    for(var id in body["dayCycleDataBean"]["threads"]){
		    	data3.push({date:id,number:body["dayCycleDataBean"]["threads"][id]})
		    }
		    var store3 = new Ext.data.JsonStore({
		    	fields: ['date', 'number'],
		    	data:data3
		    })
		    
		    var panel = new Ext.Panel({
		    	title:"服务器信息",
		    	items:[{
		    		html:
		    			"<p style='padding:10px'>服务器类型:&nbsp;&nbsp;"+body["osName"]+"&nbsp;&nbsp;"
		    		+"当前在线数:&nbsp;&nbsp;"+body["onLines"]+"&nbsp;&nbsp;"
		    		+"当前线程数:&nbsp;&nbsp;"+body["totalThread"]+"&nbsp;&nbsp;"
		    		+"</p>"+
		    			"<p style='padding:10px'>JVM分配内存:&nbsp;&nbsp;"+Math.round(body["totalMemory"]/(1024*1024)*10)/10+"MB&nbsp;&nbsp;"
		    		+"JVN使用内存:&nbsp;&nbsp;"+Math.round(body["usedMemory"]/(1024*1024)*10)/10+"MB&nbsp;&nbsp;"
		    		+"JVM最大内存:&nbsp;&nbsp;"+Math.round(body["maxMemory"]/(1024*1024)*10)/10+"MB&nbsp;&nbsp;"
		    		+"</p>"
		    	},
		    		sys.monitor.MyChart.getPieChart(store,'total','season'),
		    		sys.monitor.MyChart.getLineChart(store1,'date','number',function(chart, record){return record.get("date") +" "+record.get("number")+"人在线"}),
		    		sys.monitor.MyChart.getLineChart(store2,'date','number',function(chart, record){return record.get("date") +" 内存使用"+record.get("number")+"MB"}), 
		    		sys.monitor.MyChart.getLineChart(store3,'date','number',function(chart, record){return record.get("date") +" 线程数为"+record.get("number")})
		    	]
		    })
		    return panel
		}else{
			return []
		}
	},
	init:function(){
		this.initPanel();
	},
	initPanel : function() {
		var panel = new Ext.Panel({
			layout : 'fit',
			items : [{
				xtype : 'grouptabpanel',
				tabWidth : 130,
				activeGroup : 0,
				items : [{
							mainItem : 0,
							items : [{
										title : '服务器信息',
										layout : 'fit',
										iconCls : 'add',
										tabTip : '服务器信息',
										style : 'padding: 10px;',
										items : this.getAppInfoPanel()
									}, {
										title : '数据源',
										iconCls : 'mail_edit',
										tabTip : '数据源',
										style : 'padding: 10px;',
										layout : 'fit',
										items :this.getDsPanel()
									}, {
										title : 'sql执行',
										iconCls : 'common_query',
										tabTip : 'sql执行',
										style : 'padding: 10px;',
										items:this.getSqlListPanel()
									}]
						}, {
							expanded : true,
							items : [{
										title : '服务器信息',
										iconCls : 'x-icon-configuration',
										tabTip : '服务器信息',
										style : 'padding: 10px;',
										items : this.getServiceListPanel()
									}, {
										title : 'service执行',
										iconCls : 'common_writeOff',
										tabTip : 'service执行',
										style : 'padding: 10px;',
										items:this.getServiceListPanel()
									}]
						}]
			}]
		});
		this.panel = panel
		return panel
	},
	getWin : function() {
		var win = this.win
		if (!win) {
			win = new Ext.Window({
				title : "监控详细",
				width : this.width,
				height : this.height,
				items : this.panel,
				iconCls : 'icon-form',
				bodyBorder : false,
			//	closeAction : 'hide',
				closeAction : 'close',
				maximizable: true,
				layout : "fit",
				modal : true
				})
			win.on("show", function() {
						this.fireEvent("winShow")
					}, this)
			this.win = win
		}
		return win;
	},
	getDsPanel:function(){
		var dataName={Identity:"数据源标识",Name:"数据源名称",DbType:"数据库类型",DriverClassName:"Jdbc驱动的名称 ",URL:"数据源的JdbcURL ",UserName:"用户名",
					FilterClassNames:"过滤器名称",WaitThreadCount:"正在等待获得连接的连接数量",NotEmptyWaitCount:"等待非空次数",NotEmptyWaitMillis:"等待非空耗费的毫秒数",
					PoolingCount:"正在空闲连接的数量 ",PoolingPeak:"可使用连接的峰值",PoolingPeakTime:"可使用连接的最大耗费时间",ActiveCount:"正打开的连接数量",
					ActivePeak:"打开连接数量的峰值",ActivePeakTime:"打开连接时间的峰值",InitialSize:"初始连接池大小",MinIdle:"连接池的最小连接数",MaxActive:"连接池的最大连接数",
					TestOnBorrow:"借出连接时是否测试",TestWhileIdle:"连接空闲时是否测试",LogicConnectCount:"数据源总连接次数",LogicCloseCount:"数据源总关闭连接次数",LogicConnectErrorCount:"数据源总错误连接次数",PhysicalConnectCount:"创建物理连接次数",
					PhysicalCloseCount:"物理连接关闭次数",PhysicalConnectErrorCount:"物理连接错误次数",PSCacheAccessCount:"PerpareStatement使用次数",PSCacheHitCount:"PerpareStatement成功次数",PSCacheMissCount:"PerpareStatement丢失次数",
					StartTransactionCount:"启动事务数量 ",TransactionHistogram:"事务次数柱状图的值[0-10 ms, 10-100 ms, 100-1 s, 1-10 s, 10-100 s, >100 s]",
					ConnectionHoldTimeHistogram:"连接持续时间柱状图的值 [0-1 ms, 1-10 ms, 10-100 ms, 100ms-1s, 1-10 s, 10-100 s, 100-1000 s, >1000 s]",RemoveAbandoned:"关闭已“丢弃”连接"}
		var r = util.rmi.miniJsonRequestSync({
			serviceId:"monInfo",
			op:"getDs",
			domain:this.domain,
			ip:this.ip
		})
		if(r.code==200){
			var items=[]
			var data=r.json.body
			for(var i=0;i<data.length;i++){
				var source={}
				for(var d in data[i]){
					source[dataName[d]]=data[i][d]+""
				}
				var propsGrid = new Ext.grid.PropertyGrid({
					title:source.数据源名称,
      				autoScroll : true
   				});
   				propsGrid.on("beforeedit",function(e){
					e.cancel=true;
					return false;
				})
   				propsGrid.customRenderers.正打开的连接数量=function(value){
					var str='<a href="#"><font color="blue">'+value+'(点击查看详细)</font></a>'
					return str;
   				}
   				propsGrid.on("cellclick",this.cellclick,this)
   				propsGrid.setSource(source)
   				items.push(propsGrid)
			}
		}
		
		var tabPanel=new Ext.TabPanel({
			title:'TabPanel',
			activeTab:0,//默认激活第一个Tab页
			animScroll:true,
			enableTabScroll:true,
			scrollRepeatInterval:500,
			items:items
		})
		return tabPanel
	},
	cellclick:function(grid,rowIndex,columnIndex){
				var key=grid.getStore().getAt(rowIndex).data.name
   					if(columnIndex==1&&key=="正打开的连接数量"){
   						var activeWin=this.activeWin
						if(!activeWin){
   							$import("sys.monitor.ActiveConInfo")
							activeWin=new sys.monitor.ActiveConInfo({domain:this.domain,ip:this.ip});
							this.activeWin=activeWin
						}
						activeWin.getWin().show()
   				}
	},
	freshData:function(domain,ip){
		var win=this.getWin()
		this.domain=domain
		this.ip=ip
		var group1=win.items.item(0).items.item(0).items.item(0)
		group1.items.each(function(item,index){
         	item.removeAll()
         	switch(index){
				case 0: item.add(this.getAppInfoPanel())
						item.doLayout()
				break
				case 1: item.add(this.getDsPanel())
						item.doLayout()
				break
				case 2: item.add(this.getSqlListPanel())
						item.doLayout()
				break
         	}
        }, this)
        var group2=win.items.item(0).items.item(0).items.item(1)
        group2.items.each(function(item,index){
         	item.removeAll()
         	switch(index){
				case 0: item.add(this.getServiceListPanel())
				break
				case 1: item.add(this.getServiceListPanel())
				break
         	}
        }, this)
        win.doLayout()
	}
})