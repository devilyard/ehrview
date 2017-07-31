$package("sys.subject")

$import("app.modules.list.SimpleListView")

sys.subject.subjectList = function(cfg) {
	this.width = 500;
	this.height = 260;
	this.listData = {
		serviceId : "topicUtil",
		op : "getListData"
	}
	cfg.listServiceId = "topicUtil"
	cfg.disablePagingTbr = true
	cfg.serverParams = {
		op : "getTopics"
	}
	sys.subject.subjectList.superclass.constructor.apply(this, [cfg])
}

Ext.extend(sys.subject.subjectList, app.modules.list.SimpleListView, {
	getCM : function(items) {
		var cm = sys.subject.subjectList.superclass.getCM.call(this, items)
		var c = {
			header : "订阅列表",
			width : 150,
			dataIndex : "list",
			renderer : function(value, metadata, record, rowIndex, colIndex) {
				var str = '<button style="width:80px;" title="订阅列表" onclick="doList()"/>订阅列表</button>';
				return str;
			}
		}
		cm.push(c)
		var a = this
		doList = function() {
			a.doList()
		}
		return cm
	},
	doList : function() {
		var r = this.getSelectedRecord()
		this.listData.enName = r.get("enName")
		var win = this.listWin
		if (!win) {
			win = new Ext.Window({
						title : "详细列表",
						width : 600,
						height : 400,
						items : [this.getListPanel()],
						iconCls : 'icon-form',
						maximizable : true,
						closeAction : 'hide',
						layout : "fit",
						modal : true
					})
			this.listWin = win
		}
		this.list.getStore().load()
		win.show()
	},
	getListPanel : function() {
		var url = ClassLoader.serverAppUrl || "";
		var grid = new Ext.grid.GridPanel({
					height : 180,
					split : true,
					autoExpandColumn : 2,
					autoScroll : true,
					store : new Ext.data.Store({
								proxy : new Ext.data.HttpProxy({
											url : url + '*.jsonRequest',
											method : 'post',
											jsonData : this.listData
										}),
								reader : new Ext.data.JsonReader({
											root : 'body',
											fields : ['domain', 'ip']
										})
							}),
					columns : [new Ext.grid.RowNumberer(), {
								header : "域",
								dataIndex : "domain",
								width : 150
							}, {
								header : "节点信息",
								dataIndex : "ip"
							}]
				})
		this.list = grid;
		return grid;
	},
	loadModule : function(cls, entryName, item, r) {
		if (this.loading) {
			return
		}
		var cmd = item.cmd
		var cfg = {}
		cfg._mId = this.grid._mId // 增加module的id
		cfg.title = this.title + '-' + item.text
		cfg.entryName = entryName
		cfg.op = cmd
		cfg.exContext = {}
		cfg.width = 450
		Ext.apply(cfg.exContext, this.exContext)
		cfg.saveServiceId = this.listServiceId;
		cfg.loadServiceId = this.listServiceId
		var m = this.midiModules[cmd]
		if (!m) {
			this.loading = true
			$require(cls, [function() {
								this.loading = false
								cfg.autoLoadData = false;
								var module = eval("new " + cls + "(cfg)")
								module.on("save", this.onSave, this)
								module.on("close", this.active, this)
								module.opener = this
								module.setMainApp(this.mainApp)
								this.midiModules[cmd] = module
								this.fireEvent("loadModule", module)
								this.openModule(cmd, r, 100, 50)
							}, this])
		} else {
			Ext.apply(m, cfg)
			this.openModule(cmd, r)
		}
	},
	onSave : function(entryName, op, json, rec) {
		if (this.midiModules["create"]) {
			this.midiModules["create"].doCancel()
		}
		this.fireEvent("save", entryName, op, json, rec);
		var store = this.grid.getStore()
		store.load({
					callback : function() {
						var index = this.grid.getStore().find("enName",
								rec.enName)
						if (index > 0) {
							this.grid.getSelectionModel().selectRow(index)
						}
					},
					scope :this
				})

	}
})