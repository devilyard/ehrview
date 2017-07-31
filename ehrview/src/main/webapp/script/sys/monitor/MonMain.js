$package("sys.monitor")
$styleSheet("sys.monitor.monitor")
$import("app.lang.UIModule",
	"util.dictionary.TreeDicFactory",
	"sys.monitor.MonDetail",
	"util.widgets.MyPagingToolbar",
	"org.plugins.ZeroClipboard.ZeroClipboard")

sys.monitor.MonMain = function(cfg) {
	this.requestData = {
		serviceId : "activeNodeQuery"
	}
	this.infoData={serviceId : "monInfo",op:"getSqlAndService"}
	sys.monitor.MonMain.superclass.constructor.apply(this, [cfg]);
}

Ext.extend(sys.monitor.MonMain, app.lang.UIModule, {
	initPanel : function() {
		var panel = new Ext.Panel({
			items : [{
					layout : "border",
					items :[this.getTbar(), this.getView()],
					region : "center",
					bodyStyle: "background-color:#ffffff;"

				}, 
				this.getWestTree(), 
				this.getList()
			],
			layout : "border"
		});
		this.panel = panel;
		return panel;
	},
	initClip:function(){
		var clip = null;
		clip = new ZeroClipboard.Client();
		this.clip = clip;
		clip.setHandCursor(true);
//		clip.addEventListener('mouseOver', function(client) {
					clip.setText('cool.');
//				});
//		clip.glue('d_clip_button');
	},
	getList : function() {
//		this.initClip();
		var url = ClassLoader.serverAppUrl || "";
		var grid = new Ext.grid.GridPanel({
			title : "警告信息",
			height : 180,
			split:true,
			autoExpandColumn : 3,
			autoScroll : true,
			store : new Ext.data.Store({
				proxy : new Ext.data.HttpProxy({
					url : url + '*.jsonRequest',
					method : 'post',
					jsonData :this.infoData
				}),
				reader : new Ext.data.JsonReader({
					root : 'body',
					fields : ['type','timespan','content']
				})
			}),
			columns : [new Ext.grid.RowNumberer(), {
				header : "信息分类",
				dataIndex : "type",
				width : 100,
				renderer: function(value) {
					var str='<Img align="top" src="resources/css/sys/monitor/images/warn.jpg"/>'
					str +=value
				return str;
				}
			},
			{						
				header : "最大耗时(毫秒)",
				dataIndex : "timespan",
				width : 100,
				css : "color: red;"
			},
			{
				header : "描述",
				dataIndex : "content",
				renderer:function(value){
			//		return '<div style="white-space: pre-line">'+value+'&nbsp;&nbsp;<a href="javascript:void(0)"><Img title="复制" align="top" src="resources/css/sys/monitor/images/copesql.jpg"/></a></div>'
					return '<div style="white-space: pre-line">'+value+'&nbsp;&nbsp;</div>'
				}
			}],
			region : "south"
		})
		this.list = grid;
		return grid;
	},
	getWestTree : function() {
		var tree = util.dictionary.TreeDicFactory.createTree({
					rootVisible : true,
					id : "domain"
				});
		tree.width = 180;
		tree.autoScroll = true;
		tree.region = "west";
		tree.getRootNode().setText("全部");
		this.tree = tree;
		tree.on("click", this.onTreeClick, this);
		return tree;
	},
	onTreeClick : function(node) {
		if (node.isLeaf()) {
			this.requestData.domain = node.id
		} else {
			this.requestData.domain = ""
		}
		this.view.getStore().reload();
	},
	getView : function() {
		var cfg = {
			autoScroll : true,
			singleSelect : true,
			tpl : this.getTemplate(),
			store : this.getStore(),
			itemSelector : "li.app-node",
			overClass : 'app-node-over',
			selectedClass : "app-node-selected",
			loadingText : "正在加载数据..."
		};
		var view = new Ext.DataView(cfg);
		view.on("click", this.onViewClick, this);
		view.on("dblclick", this.onDbViewClick, this);
		view.region="center"
		this.view = view;
		return view;
	},
	onViewClick : function(view, index, node, e) {
		var domain=view.getStore().getAt(index).get("domain_text")
		var ip=view.getStore().getAt(index).get("ip")
		var title = domain + "["+ ip + "]"+"警告信息";
		this.list.setTitle(title);
		var store = this.list.getStore();
		this.infoData.domain=view.getStore().getAt(index).get("domain")
		this.infoData.ip=ip
		store.load();
	},
	onDbViewClick:function(view, index, node, e){
		var mon=this.detailView
		if(!mon){
			var mon=new sys.monitor.MonDetail({
				domain:view.getStore().getAt(index).get("domain"),
				ip:view.getStore().getAt(index).get("ip")
				})
//			this.detailView=mon
		}/*else{
			mon.freshData(view.getStore().getAt(index).get("domain"),view.getStore().getAt(index).get("ip"))
		}*/
		mon.getWin().show()
	},
	getTemplate : function() {
		var tpl = new Ext.XTemplate(
				'<ul>',
				'<tpl for=".">',
				'<li class="app-node" style="float:left" title="{domain_text}">',
				'<div class="app-node-{status}"></div>',
				'<div class="app-node-ip" align="center" style="font-size:8px">{ip}</div>',
				'</li>', '</tpl>', '</ul>');
		return tpl;
	},
	getStore : function() {
		var url = ClassLoader.serverAppUrl || "";
		var store = new Ext.data.Store({
					autoLoad : true,
					proxy : new Ext.data.HttpProxy({
								url : url + '*.jsonRequest',
								method : 'post',
								jsonData : this.requestData
							}),
					reader : new Ext.data.JsonReader({
								root : 'body',
								fields : ['status', 'ip', 'domain',
										'domain_text']
							})
				});
		return store;
	},
	getTbar : function() {
		var sqlField = new Ext.form.NumberField({
							width : 200,
							selectOnFocus : true,
							emptyText : "请输入sql预警值(毫秒)",
							style : 'text-align:left',
							allowDecimals : false,
							minValue : 0
						})
				this.sqlField = sqlField
				var serField = new Ext.form.NumberField({
							width : 200,
							selectOnFocus : true,
							emptyText : "请输入service预警值(毫秒)",
							minValue : 0,
							style : 'text-align:left',
							allowDecimals : false
						})
				this.serField = serField
				var queryBtn = new Ext.Button({
							text:"确定",
							iconCls : "add"
						})
				queryBtn.on("click", this.doSetLevel, this);
				
				var toolbar=new Ext.Toolbar({ width: 60,
   					 height: 30,
   					 items: ['请输入sql预警值(毫秒)：',sqlField, '-','请输入service预警值(毫秒)：',serField, '-', queryBtn]
					})
				toolbar.region = "north";
				return toolbar;
	},
	doSetLevel:function(){
		var sqlLevel = this.sqlField.getValue()
		var serLevel = this.serField.getValue()
		if(sqlLevel===""||serLevel===""){
			Ext.Msg.alert("提示","请输入sql和service预警值")
			return
		}
		var r = util.rmi.miniJsonRequestSync({
			serviceId : "monInfo",
			op : "setWarnningLevel",
			sqlLevel : sqlLevel,
			serLevel : serLevel
		})
		Ext.Msg.alert("提示",r.json["x-response-msg"])
	}
})
