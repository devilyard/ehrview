$package("sys.audit")
$styleSheet("ext.ux.GroupTab")
$import("org.ext.ux.GroupTab", "org.ext.ux.GroupTabPanel",
		"util.rmi.miniJsonRequestSync")

sys.audit.SqlAndSerLog = function(cfg) {
	// this.mainItem=1
	this.width = 820
	this.height = 500
	Ext.apply(this, cfg)
	this.init()
	sys.audit.SqlAndSerLog.superclass.constructor.apply(this, [cfg]);
}
Ext.extend(sys.audit.SqlAndSerLog, Ext.util.Observable, {
	init : function() {
		this.initPanel();
	},
	initPanel : function() {
		var panel = new Ext.TabPanel({
					title : 'TabPanel',
					activeTab : this.activeTab,// 默认激活第一个Tab页
					animScroll : true,
					enableTabScroll : true,
					scrollRepeatInterval : 500,
					tbar : this.getCndBar(),
					items : [this.getSqlListPanel(), this.getServiceListPanel()]
				})
		/*
		 * var panel = new Ext.Panel({ layout : 'fit', items : [{ xtype :
		 * 'grouptabpanel', tabWidth : 130, activeGroup : this.activeGroup,
		 * items : [{ items : [{ title : 'sql执行', tabTip : 'sql执行', style :
		 * 'padding: 10px;', items:this.getSqlListPanel() }] },{ expanded:true,
		 * items : [{ title : 'service执行', tabTip : 'service执行', style :
		 * 'padding: 10px;', items:this.getServiceListPanel() }] }] }] });
		 */
		this.panel = panel
	},
	getSqlListPanel : function() {
		var url = ClassLoader.serverAppUrl || "";
		var grid = new Ext.grid.GridPanel({
			title : "SQL执行信息",
			height : 560,
			autoScroll : true,
			autoScroll : true,
			store : new Ext.data.Store({
						autoLoad : true,
						proxy : new Ext.data.HttpProxy({
									url : url + '*.jsonRequest',
									method : 'post',
									jsonData : {
										serviceId : "sqlAndSerInfo",
										op : "getSql"
									}
								}),
						reader : new Ext.data.JsonReader({
									root : 'body',
									fields : ['ExecuteCount', 'timespan',
											'content']
								})
					}),
			columns : [new Ext.grid.RowNumberer(), {
				header : "SQL描述",
				dataIndex : "content",
				width : 500,
				renderer : function(value) {
					return '<div style="white-space: pre-line">'
							+ value
							+ '&nbsp;&nbsp;</div>'
				}
			}, {
				header : "执行次数(次)",
				dataIndex : "ExecuteCount",
				width : 100
			}, {
				header : "最大耗时(毫秒)",
				dataIndex : "timespan",
				width : 100,
				css : "color: red;"
			}]
		})
		this.sqlGrid = grid
		return grid;
	},
	getServiceListPanel : function() {
		var url = ClassLoader.serverAppUrl || "";
		var grid = new Ext.grid.GridPanel({
					title : "service执行信息",
					height : 560,
					autoScroll : true,
					store : new Ext.data.Store({
								autoLoad : true,
								proxy : new Ext.data.HttpProxy({
											url : url + '*.jsonRequest',
											method : 'post',
											jsonData : {
												serviceId : "sqlAndSerInfo",
												op : "getService"
											}
										}),
								reader : new Ext.data.JsonReader({
											root : 'body',
											fields : ['id', 'totalFrequence',
													'maxCostTime',
													'minCostTime',
													'lastCostTime',
													'avgCostTime']
										})
							}),
					columns : [new Ext.grid.RowNumberer(), {
								header : "service名称",
								dataIndex : "id",
								width : 150
							}, {
								header : "总执行次数(次)",
								dataIndex : "totalFrequence",
								width : 100
							}, {
								header : "最长执行消耗时间(毫秒)",
								dataIndex : "maxCostTime",
								width : 140
							}, {
								header : "最短执行消耗时间(毫秒)",
								dataIndex : "minCostTime",
								width : 140
							}, {
								header : "最后执行时间(毫秒)",
								dataIndex : "lastCostTime",
								width : 120
							}, {
								header : "平均执行时间(毫秒)",
								dataIndex : "avgCostTime",
								width : 120
							}]
				})
		this.serGrid = grid
		return grid;
	},
	getWin : function() {
		var win = this.win
		if (!win) {
			win = new Ext.Window({
						title : "信息详细",
						width : this.width,
						height : this.height,
						items : this.panel,
						iconCls : 'icon-form',
						bodyBorder : false,
						closeAction : 'close',
						maximizable : true,
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
	getCndBar : function() {
		var fields = [{
					value : 1,
					text : '执行次数'
				}, {
					value : 2,
					text : '最大执行耗时'
				}];
		var store = new Ext.data.JsonStore({
					fields : ['value', 'text'],
					data : fields
				});
		var combox = new Ext.form.ComboBox({
					store : store,
					valueField : "value",
					displayField : "text",
					mode : 'local',
					triggerAction : 'all',
					emptyText : '选择查询字段',
					selectOnFocus : true,
					editable : false,
					width : 120
				});
		combox.on("select", this.onCndFieldSelect, this)
		this.cndCombox = combox

		var cndField = new Ext.form.NumberField({
					width : 200,
					selectOnFocus : true,
					emptyText : "输入指定预警值",
					allowDecimals : false,
					minValue : 1,
					style : 'text-align:left'

				})
		this.cndField = cndField
		var queryBtn = new Ext.Toolbar.Button({
					iconCls : "query"
				})

		var clearBtn = new Ext.Toolbar.Button({
					text:"重置数据",
					iconCls : "common_reset"
				})
		this.queryBtn = queryBtn;
		queryBtn.on("click", this.doCndQuery, this);
		clearBtn.on("click", this.doClear, this);
		return ['指定预警值查询：', combox, '-', cndField, '-', queryBtn, '-', clearBtn]
	},

	doCndQuery : function() {
		var num = this.cndField.getValue()
		var type = this.cndCombox.getValue()
		if (num == "" || type == "") {
			return
		}
		if (this.panel.getActiveTab().title == "SQL执行信息") {
			if (type == 1) {
				type = "ExecuteCount"
			} else {
				type = "timespan"
			}
			var filter = function(record, id) {
				if (record.get(type) >= num) {
					return true;
				} else {
					return false;
				}
			};
			this.sqlGrid.store.filterBy(filter);
		} else {
			if (type == 1) {
				type = "totalFrequence"
			} else {
				type = "maxCostTime"
			}
			var filter = function(record, id) {
				if (record.get(type) >= num) {
					return true;
				} else {
					return false;
				}
			};
			this.serGrid.store.filterBy(filter);
		}
	},
	doClear : function() {
		if (this.panel.getActiveTab().title == "SQL执行信息") {
			this.sqlGrid.store.clearFilter()
		} else {
			this.serGrid.store.clearFilter()
		}
	}

})