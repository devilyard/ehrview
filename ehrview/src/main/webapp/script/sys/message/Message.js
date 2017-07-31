$package("sys.message")
$import("app.modules.list.SimpleListView", "app.desktop.Module",
		"util.dictionary.TreeDicFactory")

sys.message.Message = function(cfg) {
	this.mainApp = cfg
	this.width = 1000
	this.height = 500
	this.dicId = "messageType"
	this.gridCls = "sys.message.MessageList"
	this.entryName = "SYS_MESSAGE"
	sys.message.Message.superclass.constructor.apply(this, [cfg])

}

Ext.extend(sys.message.Message, app.desktop.Module, {
	init : function() {
		this.initPanel();
	},
	getWin : function() {
		var win = this.win
		if (!win) {
			win = new Ext.Window({
				id : this.id,
				title : "消息系统",
				width : this.width,
				height : this.height,
				items : this.panel,
				iconCls : 'icon-form',
				bodyBorder : false,
				closeAction : 'hide',// closeAction:枚举值为：close(默认值)，当点击关闭后，关闭window窗口
				// hide,关闭后，只是hidden窗口
				shim : true,
				layout : "fit",
				plain : true, // true则主体背景透明，false则主体有小差别的背景色，默认为false
				autoScroll : false,
				maximizable : true,
				shadow : false,
				buttonAlign : 'center',
				modal : true
					// :true为模式窗口，后面的内容都不能操作，默认为false
				})
			win.on("show", function() {
						this.fireEvent("winShow")
					}, this)
			win.on("close", function() {
						this.fireEvent("close", this)
					}, this)
			win.on("hide", function() {
						this.fireEvent("close", this)
					}, this)
			this.win = win
		}
		return win;
	},
	initPanel : function() {
		var grid = this.getMessageList();
		if (!grid) {
			return
		}
		var leftItems = this.getLeftItems();
		var panel = new Ext.Panel({
					height : 300,
					layout : "border",
					items : [{
								title : this.title,
								region : 'west',
								split : true,
								width : 160,
								items : leftItems
							}, {
								layout : 'fit',
								region : 'center',
								items : [grid]
							}]
				})
		this.panel = panel
		this.initGrid(1)

		return this.panel
	},
	onTreeClick : function(node, e) {
		var id = node.id
		this.initGrid(id)
	},
	getMessageList : function() {
		var cls = this.gridCls
		var cfg = {}
		cfg.entryName = this.entryName
		cfg.autoLoadSchema = false
		cfg.autoLoadData = false;
		cfg.showButtonOnTop = true
		cfg.isCombined = true
		cfg.title = "消息"
		cfg.actions = [{
					id : "create",
					name : "发送消息",
					iconCls : "mail_edit"
				}, {
					id : "toDo",
					name : "待办事件处理",
					iconCls : "app"
				}, {
					id : "remove",
					name : "删除"
				}]
		var lp = this.midiModules["log"]
		if (!lp) {
			$import(cls)
			var module = eval("new " + cls + "(cfg)");
			this.gridModule = module
			module.opener = this
			module.setMainApp(this.mainApp)
			lp = module.initPanel()
	//		module.store.on("load",function(){this.getTreeNum()},this)
			if (this.mainApp.jobId.split("@")[1] != 'system') {
				this.gridModule.grid.getTopToolbar().get(6).hide()
			}
		}
		this.grid = lp
		return this.grid;
	},

	initGrid : function(id) {
		this.getTreeNum()
		this.selectId = id
		if (this.gridModule) {
			if (id == 1) {
				this.gridModule.grid.getTopToolbar().get(7).hide()
				this.gridModule.requestData.cnd = [
						'and',
						['eq', ['$', 'RECEIVER_USERS'], ['s', this.mainApp.uid]],
						['isNull', ['s', 'is'], ['$', 'BACKLOG']],
						['eq', ['$', 'DELFLAG'], ['i', 0]]						]
				this.gridModule.getPagingToolbar(this.gridModule.store)
						.doLoad(0)
			}
			if (id == 2) {
				this.gridModule.grid.getTopToolbar().get(7).show()
				this.gridModule.requestData.cnd = [
						'and',
						['eq', ['$', 'RECEIVER_USERS'], ['s', this.mainApp.uid]],
						['isNull', ['s', 'not'], ['$', 'BACKLOG']],
						['eq', ['$', 'DELFLAG'], ['i', 0]]]
				this.gridModule.getPagingToolbar(this.gridModule.store)
						.doLoad(0)
			}
			if (id == 3) {
				this.gridModule.grid.getTopToolbar().get(7).hide()
				this.gridModule.requestData.cnd = ['and',['eq', ['$', 'SYS_DELFLAG'], ['i', 0]],['eq', ['$', 'SENDER'],['s', this.mainApp.uid]]]
				this.gridModule.getPagingToolbar(this.gridModule.store)
						.doLoad(0)
			}
		}
	},
	getLeftItems : function() {
		var userRole = this.mainApp.jobId.split("@")[1]
		var tree = util.dictionary.TreeDicFactory.createTree({
					id : this.dicId
				})
		tree.autoScroll = true
		tree.on("click", this.onTreeClick, this)
		tree.expandAll()
		tree.on("load", function() {
					tree.filter.filterBy(function(n) {
								if (n.id == 3 && userRole != "system") {
									return false;
								} else {
									return true;
								}
							});
				})
		tree.on("expandnode", function(n) {
					if (n.id == 3) {
						this.getTreeNum()
					}
				}, this)
		this.tree = tree
		return tree;
	},
	getTreeNum : function() {
		util.rmi.jsonRequest({
					serviceId : "message",
					schema : "SYS_MESSAGE",
					operate : "treeNum"
				}, function(code, msg, json) {
					if (code == 200) {
						this.setText(1, json.message)
						this.setText(2, json.backlog)
					}
				}, this)
	},
	setText : function(id, num) {
		var mes = this.tree.getNodeById(id)
		if (num == 0) {
			mes.setText(mes.text.split("(")[0])
		} else {
			mes.setText(mes.text.split("(")[0] + "(" + num + ")")
		}
	}
})