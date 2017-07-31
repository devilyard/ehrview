$package("sys.message")
$import("app.modules.list.SelectListView", "app.desktop.Module",
		"util.dictionary.TreeDicFactory")

sys.message.SelectUserView = function(cfg) {
	this.width = 800
	this.height = 400
	this.dicId = "manageUnit"
	this.gridCls = "app.modules.list.SelectListView"
	this.entryName = "SYS_User4ms"
	sys.message.SelectUserView.superclass.constructor.apply(this, [cfg])
}

Ext.extend(sys.message.SelectUserView, app.desktop.Module, {
			init : function() {
				this.initPanel();
			},
			getWin : function() {
				var win = this.win
				if (!win) {
					win = new Ext.Window({
						id : this.id,
						title : "用户选择",
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
										width : 200,
										items : leftItems
									}, {
										layout : 'fit',
										region : 'center',
										items : [grid]
									}]
						})
				this.panel = panel
				return this.panel
			},
			onTreeClick : function(node, e) {
				var id = node.id
				var cnd=['eq', ['$', 'manaUnitId'], ['s',node.id]]
				if(this.gridModule.initCnd){
					cnd=['and',this.gridModule.initCnd,cnd]
				}
				this.gridModule.resetFirstPage()
				this.gridModule.requestData.cnd = cnd
				this.gridModule.refresh()
			},
			getMessageList : function() {
				var cls = this.gridCls
				var cfg = {}
				cfg.entryName = this.entryName
				cfg.autoLoadSchema = true
				cfg.autoLoadData = true;
				cfg.isCombined = true
				cfg.initCnd=['eq', ['$', 'domain'], ['s', 'configuration']]
				var lp = this.midiModules["log"]
				if (!lp) {
					$import(cls)
					var module = eval("new " + cls + "(cfg)");
					this.gridModule = module
					module.opener = this
					lp = module.initPanel()
					module.grid.getTopToolbar().addButton({text:"显示所有用户",
															iconCls:"empi_combination",
															scope:this,
															handler:function(){
																this.gridModule.resetFirstPage()
																this.gridModule.requestData.cnd = ['eq', ['$', 'domain'], ['s', 'configuration']]
																this.gridModule.refresh()
															}
														})
					module.doConfirmSelect = function() {
						this.fireEvent("select", this.getSelectedRecords(),
								this)
						this.clearSelect();
						this.opener.getWin().hide()
					}
				}
				this.grid = lp
				return this.grid;
			},
			getLeftItems : function() {
				var tree = util.dictionary.TreeDicFactory.createTree({
							id : this.dicId
						})
				tree.on("click", this.onTreeClick, this)
				tree.expandAll()
				this.tree = tree
				return tree;
			}
		})