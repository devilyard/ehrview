$import("util.Logger", "util.rmi.miniJsonRequestSync", "util.CSSHelper",
		"app.desktop.plugins.LoadStateMessenager",
		"app.viewport.WelcomePortal", "org.ext.ux.TabCloseMenu",
		"util.widgets.ItabPanel")

app.viewport.MyDesktop = function(mainApp) {
	this.mainApp = mainApp
	this.activeModules = {}
	this.moduleView = {}
	this.leftTDWidth = 155
	this.leftTDPadding = 5
	this.addEvents({
				'ready' : true,
				'NotLogon' : true
			})
}

Ext.extend(app.viewport.MyDesktop, Ext.util.Observable, {
	getDesktopEl : function() {
		return Ext.get(document.body)
	},

	getWinWidth : function() {
		return Ext.getBody().getWidth()
	},

	getWinHeight : function() {
		return Ext.getBody().getHeight()
	},

	getMainTabWidth : function() {
		/**
		 * <td class=leftmuen> 155px
		 * <td class=leftzkss> 10px
		 * <td class=rightbody> 5px(padding-left) + 5px(padding-right) <div
		 * class=tabkk> border 1px * 2
		 */
		return this.getWinWidth() - 155 - 10 - 10 - 2
	},

	getMainTabHeight : function() {
		/**
		 * <td> padding-bottom: 5px <div class=top> height: 90px
		 */
		return this.getWinHeight() - 76 - 10
	},

	getMainTabDiv : function() {
		if (!this.mainDiv) {
			this.mainDiv = Ext.get('_maintab')
		}
		return this.mainDiv
	},

	setMainTabSize : function() {
		var width = this.getMainTabWidth()
		var div = Ext.fly('_leftDiv')
		if (!div.isDisplayed()) {
			width = width + 155
		}
		this.mainTab.setWidth(width)
		this.mainTab.setHeight(this.getMainTabHeight())
		div.setHeight(this.getMainTabHeight())
	},

	setClass : function(el, removeClass, addClass) {
		el.removeClass(removeClass)
		el.addClass(addClass)
	},

	getWelcomPortalWidth : function() {
		return this.getWinWidth() - 10 - 2
	},

	getWelcomPortalHeight : function() {
		return this.getWinHeight() - 76 - 10 - 5
	},

	setWelcomPortalSize : function() {
		this.welcomPortal.portal.setWidth(this.getWelcomPortalWidth())
		this.welcomPortal.portal.setHeight(this.getWelcomPortalHeight())
	},

	initWelcomePortal : function() {
		if (this.welcomPortal) {
			var p = this.welcomPortal.initPanel()
			if (p) {
				this.refreshWelcomePortal()
			}
			return p
		}
		var myPage = this.mainApp.myPage
		var welcomPortals = []
		var welcomPortalPanels = []
		if (myPage && myPage.length > 0) {
			var welcomPortal = new app.viewport.WelcomePortal({
						myPage : myPage[0],
						height : this.getWelcomPortalHeight()
					})
			welcomPortal.mainApp = this.mainApp
			this.welcomPortal = welcomPortal
			var p = welcomPortal.initPanel()
			if (p) {
				this.refreshWelcomePortal()
			}
			return p
		}
		return ""
	},

	initViewPort : function() {
		var panel = new Ext.Panel({
					region : 'center',
					border : false,
					// autoScroll:true,
					autoLoad : {
						url : "html/main.html",
						nocache : true
					}
				})
		panel.on("afterrender", function() {
					panel.getUpdater().on("update", this.initPanel, this)
				}, this)

		var viewport = new Ext.Viewport({
					layout : 'border',
					hideBorders : true,
					frame : false,
					items : [panel]
				})
		this.viewport = viewport;
		viewport.on("resize", function(e) {
					if (this.mtr && this.mtr.isDisplayed()) {
						this.setMainTabSize()
					}
					if (this.welcomPortal && !this.mtr.isDisplayed()) {
						this.setWelcomPortalSize()
					}
				}, this)

	},

	initPanel : function() {
		if (Ext.isIE6) {
			if ($ct) {
				pngfix()
			}
		}
		var mtr = Ext.get("_middle")
		var btr = Ext.get("_bottom")
		this.mtr = mtr
		this.btr = btr
		// 初始化用户信息显示
		this.initLogininfo()

		// 初始化上面的标签页
		this.initTopTabs()

		// 功能区的伸缩
		var colp = Ext.get('collapse')
		this.colp = colp
		colp.on("click", this.collapsed, this)

		// 生成主面板
		var backgroundUrl = "background:url("
				+ ClassLoader.stylesheetHome
				+ "app/desktop/images/homepage/background.jpg) no-repeat center;"

		var mainTab = new util.widgets.ItabPanel({
					applyTo : '_maintab',
					bodyStyle : 'padding:5px;' + backgroundUrl,
					minTabWidth : 130,
					tabWidth : 130,
					border : false,
					deferredRender : false,
					plugins : new Ext.ux.TabCloseMenu(),
					enableTabScroll : true,
					width : this.getMainTabDiv().getComputedWidth(),
					height : this.getMainTabHeight()
				})
		mainTab.on("tabchange", this.onModuleActive, this)
		this.mainTab = mainTab

	},

	initLogininfo : function() {
		var tpl = new Ext.XTemplate(
				'<ul><li>',
				'<a href="#" style="color:#fff;" id="HP">帮助</a> ｜ ',
				'<a href="#" style="color:#fff;" id="CF">设置</a> ｜ ',
				'<a href="#" style="color:#fff;" id="QF">便捷</a> ｜ ',
				'<a href="#" style="color:#fff;" id="QT">退出</a>',
				'</li></ul>',
				'<dl>',
				'<li><img src="{userPic}" width="29" height="29" /></li>',
				'<li><b>{uname}</b></li>',
				'<li id="MS" class="logininfomail">(<b id="mn">{num}</b>)</li>',
				'<li>{jobtitle}</li>', '</dl>')
		tpl.overwrite('_logininfo', this.mainApp)
		this.tpl = tpl
		var lnkSelectors = ["HP", "CF", "QF", "QT", "MS"]
		for (var i = 0; i < lnkSelectors.length; i++) {
			var lnk = Ext.get(lnkSelectors[i])
			if (lnk) {
				lnk.on("click", this.onTopLnkClick, this)
			}
		}
		// this.doRemind();
		// setInterval(this.doRemind,300000)
	},
	doRemind : function() {
		util.rmi.jsonRequest({
					serviceId : "message",
					schema : "SYS_MESSAGE",
					operate : "showMessage"
				}, function(code, msg, json) {
					if (code == 200) {
						var num = Ext.get("mn").dom
						num.innerHTML = json.num
						if (json.flag == 1) {
							$import("sys.message.MesRemind");
							Ext.messageMsg.msg('提醒:', '您有 (' + json.num
											+ ') 条新的消息', this);
						}
					} else {
						this.mainApp.logon(this.initLogininfo, this)
					}
				}, this)
	},
	doMessage : function() {
		var msWin = this.msWin
		if (!msWin) {
			$import("sys.message.Message");
			msWin = new sys.message.Message({
						mainApp : this.mainApp
					});
			this.msWin = msWin
		} else {
			msWin.getTreeNum()
		}
		if (msWin.selectId) {
			msWin.gridModule.refresh()
		}
		msWin.getWin().show()
	},
	/**
	 * 上部的标签页 初始化
	 */
	initTopTabs : function() {
		var cata = this.mainApp.apps
		var tpl = new Ext.XTemplate('<tpl for=".">',
				'<li><a href="#">{title}</a></li>', '</tpl>');
		var store = new Ext.data.Store({
					reader : new Ext.data.JsonReader({},
							["id", 'title', 'type']),
					data : cata
				});

		var view = new Ext.DataView({
					applyTo : "_topTab",
					store : store,
					tpl : tpl,
					singleSelect : true,
					selectedClass : "select",
					itemSelector : 'a',
					listeners : {
						afterrender : function(view) {
							var id = view.store.getAt(0).data.id
							// this.initNavPanel(id) //选择显示 第一项
							this.onTopTabClick(view, 0)
						},
						scope : this
					}
				})
		view.select(0)
		this.topview = view
		view.on("click", this.onTopTabClick, this)

	},
	/**
	 * 上部的标签页 点击事件
	 */
	onTopTabClick : function(view, index, node, e) {
		var id = view.store.getAt(index).data.id
		var title = view.store.getAt(index).data.title
		var type = view.store.getAt(index).data.type
		if (type == "index") {
			if (this.mtr.isDisplayed()) {
				this.mtr.setDisplayed('none')
				this.btr.setStyle('display', '')
			}
			this.initWelcomePortal()
			return
		}
		if (!this.mtr.isDisplayed()) {
			this.mtr.setStyle('display', '')
			this.btr.setDisplayed('none')
		}

		var div = Ext.fly('_leftDiv')
		// div.update("")
		if (!div.isDisplayed()) {
			this.collapsed()
		}
		this.initNavPanel(id, title)
		if (this.mainTab) {
			this.setMainTabSize()
			this.mainTab.removeAll()
		}
	},
	/**
	 * 初始化 左边功能区菜单
	 */
	initNavPanel : function(id, title) {
		var data = []
		var re = util.rmi.miniJsonRequestSync({
					serviceId : "appConfigLocator",
					id : id
				})
		if (re.code == 200) {
			data = re.json.body.catalogs
		} else {
			if (re.msg == "AuthorizeFailed") {
				window.location.reload()
			}
			if (re.msg == "NotLogon") {
				this.mainApp.logon(this.initNavPanel, this, [id])
			}
		}
		if (data.length == 0) {
			return
		}
		if (!this.navView) {
			var navStore = new Ext.data.Store({
						reader : new Ext.data.JsonReader({}, ["id", 'title']),
						data : data
					})
			var navTpl = new Ext.XTemplate('<h2 class="title">工作计划</h2>',
					'<tpl for=".">', '<ul class="LCatalong">',
					'<li id="{id}">', '<a href="#" class="up">{title}</a>',
					'</li>', '</ul>',
					'<ul id="{id}_module" class="LModule"></ul>', '</tpl>')
			var navView = new Ext.DataView({
						applyTo : "_leftDiv",
						store : navStore,
						tpl : navTpl,
						singleSelect : true,
						autoScroll : true,
						selectedClass : "",
						itemSelector : 'ul.LCatalong'
					})
			navView.select(0)
			this.navView = navView
			navView.on("click", this.onBeforeExpand, this)
		} else {
			this.navView.getStore().loadData(data)
			this.navView.select(0)
		}
		var h2 = Ext.fly("_leftDiv").child("h2")
		h2.dom.innerHTML = title
		// 进入就展开第一层
		this.onBeforeExpand(this.navView, 0)
	},

	onTopLnkClick : function(e) {
		var lnk = e.getTarget();
		var cmd = lnk.id
		switch (cmd) {
			case "LK" :
				this.mainApp.logon();
				break
			case "CF" : // 设置
				this.doSetting(e)
				break;
			case "QF" : // 便捷
				this.doQuickChange(e)
				break;
			case "QT" : // 退出
				util.rmi.jsonRequest({
							serviceId : "logonOut"
						}, function() {
							// window.location.reload()
							window.location.href = "index.html";
						}, this)
				break;
			case "MS" :
				this.doMessage()
				break;
		}
	},

	doQuickChange : function(e) {
		var cls = "app.modules.config.homePage.QuickPanel"
		var m = this.quickChangeModule
		if (!m) {
			$import(cls)
			m = eval("new " + cls + "({})")
			m.setMainApp(this.mainApp)
			this.quickChangeModule = m
			var p = m.initPanel()
			if (!p) {
				return
			}
		}
		var win = m.getWin()
		if (win) {
			win.setPosition(e.getPageX() - 350, e.getPageY() + 12)
			win.show()
		}
	},

	doSetting : function(e) {
		var cls = "app.modules.config.homePage.SettingPanel"
		var m = this.settingModule
		if (!m) {
			$import(cls)
			m = eval("new " + cls + "({})")
			m.setMainApp(this.mainApp)
			this.settingModule = m
			var p = m.initPanel()
			if (!p) {
				return
			}
		}
		var win = m.getWin()
		if (win) {
			win.setPosition(e.getPageX() - 520, e.getPageY() + 12)
			win.show()
			m.loadApps()
		}
	},

	showOnlines : function() {
		var olw = this.olw
		if (!olw) {
			var cfg = {
				width : 980,
				entryName : "SYS_OnlineUser",
				listServiceId : "onlineHandler",
				disablePagingTbr : true
			}
			$import("app.modules.list.SimpleListView")
			var m = new app.modules.list.SimpleListView(cfg)
			olw = m.getWin()
			olw.on("show", function() {
						m.refresh()
					}, this)
			this.olw_m = m
			this.olw = olw
		}
		olw.show()
	},
	refreshOnlines : function() {
		this.getOnlines()
		var target = this
		setInterval(function() {
					target.getOnlines()
				}, 30000)
	},
	getOnlines : function() {
		var re = util.rmi.miniJsonRequestSync({
					serviceId : "onlineHandler",
					op : "count"
				})
		if (re.code == 200) {
			Ext.get("OL").dom.innerHTML = "在线人数：" + re.json.body
			if (this.olw_m) {
				this.olw_m.refresh()
			}
		}
	},
	doChangePsw : function() {
		var m = this.changePswModule
		if (m) {
			if (m.getWin().hidden) {
				m.getWin().show();
			}
		} else {
			$import("app.desktop.plugins.PasswordChanger")
			m = new app.desktop.plugins.PasswordChanger({});
			m.setMainApp(this.mainApp)
			var p = m.initPanel()
			if (p) {
				this.changePswModule = m
				m.getWin().show();
			}

		}
	},

	onReady : function() {
		var messenger = new app.desktop.plugins.LoadStateMessenager({})
		messenger.setMainApp(this.mainApp)
		messenger.getWin()

	},
	onModuleActive : function(tab, panel) {
		if (panel && panel._mId) {
			var m = this.mainApp.taskManager.getModule(panel._mId)
			if (!m) {
				return
			}
			var instance = m.instance
			if (instance && typeof instance.active == "function") {
				instance.active()
			}
			this.changeSelection(panel._mId)
		} else {
			if (this.welcomPortals) {
				for (var i = 0; i < this.welcomPortals.length; i++) {
					this.welcomPortals[i].refresh()
				}
			}
		}
	},

	onExpand : function() {
		this.startExpanding = false;
		this.navView.el.unmask()
	},

	/**
	 * 功能区 --子模块生成
	 */
	onBeforeExpand : function(view, index, node, e) {
		var id = view.store.getAt(index).data.id
		var span = Ext.fly(id).child("a")
		// 显示隐藏子模块
		var pel = this.getNavElement(id) // Ext.fly(mid)
		if (pel.dom.childNodes.length > 0) { // 有子节点,则隐藏
			if (pel.isDisplayed()) {
				pel.setDisplayed('none')
				this.setClass(span, "", "up")
			} else {
				pel.setDisplayed('block')
				this.setClass(span, "up", "")
			}
			return
		}

		this.startExpanding = true;
		this.navView.el.mask("加载中", "x-mask-loading")
		var catalogId = id
		var re = util.rmi.miniJsonRequestSync({
					serviceId : "catalogConfigLocator",
					id : catalogId
				})
		if (re.code < 300) {
			var modules = re.json.body.modules
			for (var i = 0; i < modules.length; i++) {
				var module = modules[i]
				this.mainApp.taskManager.addModuleCfg(module)
			}
			if (modules.length > 0) {
				this.initNavIcons(catalogId, modules)
				this.setClass(span, "up", "")
			}
			this.onExpand()
		} else {
			if (re.msg == "AuthorizeFailed") {
				window.location.reload()
			}
			if (re.msg == "NotLogon") {
				this.navView.el.unmask()
				this.mainApp.logon(this.onBeforeExpand, this, [view, index,
								node, e])
			}
		}
		return true;
	},

	getNavElement : function(id) {
		var mid = id + '_module' // navTpl中定义
		var pel = Ext.fly(mid)
		return pel
	},

	getModuleTpl : function(id) {
		var tpl = this.iconTpl
		if (!tpl) {
			tpl = new Ext.XTemplate('<tpl for=".">', '<li id="' + id
							+ '_module_{id}">', '<a href="#">{title}</a>',
					'</li>', '</tpl>');
			this.iconTpl = tpl;
		}
		return tpl;
	},

	/**
	 * 初始化 module模块
	 */
	initNavIcons : function(catalogId, data) {
		var store = new Ext.data.Store({
					reader : new Ext.data.JsonReader({},
							["id", 'title', 'type']),
					data : data
				});

		var view = new Ext.DataView({
					applyTo : catalogId + '_module',
					store : store,
					tpl : this.getModuleTpl(catalogId),
					singleSelect : true,
					autoScroll : true,
					selectedClass : 'selected',
					itemSelector : 'a'
				})
		view.on("click", this.onNavClick, this)
		this.moduleView[catalogId] = view
	},

	onNavClick : function(view, index, node, e) {
		var id = view.store.getAt(index).data.id
		this.openWin(id)
	},

	openWin : function(id) {
		var find = this.activeModules[id]
		if (find) {
			this.mainTab.activate(find)
			return;
		}
		this.mainTab.el.mask("加载中...", "x-mask-loading")
		this.mainApp.taskManager.loadInstance(id, {
					showButtonOnTop : true,
					autoLoadSchema : false,
					isCombined : true
				}, this.onModuleLoad, this)
	},
	onModuleLoad : function(module) {
		if (module.showWinOnly) {
			var win = module.getWin()
			win._mId = module.id
			win.show();
			win.on("close", this.onCloseWin, this)
			this.mainTab.el.unmask()
			return;
		}
		if (module.initPanel) {
			var panel = module.initPanel()
			if (panel && module.warpPanel) {
				panel = module.warpPanel(panel)
			}
			if (panel) {
				panel.on("destroy", this.onClose, this)
				panel._mId = module.id
				panel.closable = true
				panel.setTitle(module.title)
				this.mainTab.add(panel)
				this.mainTab.activate(panel)
				if (this.mainApp.rendered) {
					this.mainTab.doLayout()
				}
				this.activeModules[panel._mId] = panel;
			}
			this.mainTab.el.unmask()
			return;
		}
		if (module.initHTML) {
			var html = module.initHTML();
			var panel = this.mainTab.add({
						title : module.title,
						closable : true,
						layout : "fit",
						html : html
					})
			panel.on("destroy", this.onClose, this)
			panel._mId = id
			this.mainTab.activate(panel)
			if (this.mainApp.rendered) {
				this.mainTab.doLayout()
			}
			this.activeModules[panel._mId] = panel;
			this.mainTab.el.unmask()
			return;
		}
	},

	onClose : function(panel) {
		var id = panel._mId
		if (id) {
			this.mainApp.taskManager.destroyInstance(id)
			delete this.activeModules[id]
		}
		if (this.mainTab.items.length == 0) {
			this.clearSelection(id)
		}

	},

	onCloseWin : function(win) {
		var id = win._mId
		if (id) {
			this.mainApp.taskManager.destroyInstance(id)
			delete this.activeModules[id]
		}
	},

	changeSelection : function(mid) {
		var store = this.navView.getStore()
		var n = store.getCount()
		for (var i = 0; i < n; i++) {
			var cid = store.getAt(i).data.id
			var view = this.moduleView[cid]
			if (view) {
				var index = view.getStore().indexOfId(mid)
				if (index != -1) {
					if (!view.isSelected(index)) {
						view.select(index)
					}
				} else {
					view.clearSelections()
				}
			}
		}
	},

	clearSelection : function(mid) {
		var store = this.navView.getStore()
		var n = store.getCount()
		for (var i = 0; i < n; i++) {
			var cid = store.getAt(i).data.id
			var view = this.moduleView[cid]
			if (view) {
				var index = view.getStore().indexOfId(mid)
				if (index != -1) {
					if (view.isSelected(index)) {
						view.deselect(index)
					}
					break
				}
			}
		}
	},

	/**
	 * 伸缩条 操作
	 */
	collapsed : function() {
		var div = Ext.fly('_leftDiv')
		var td = div.parent()
		var img = this.colp.dom
		if (div.isDisplayed()) {
			td.setWidth('0px')
			div.setDisplayed('none')
			img.src = "pageImages/rhmp8.png"
			// 设置mainTab宽度
			this.mainTab.setWidth(this.mainTab.getWidth() + 155)
		} else {
			td.setWidth('155px')
			div.setDisplayed('block')
			img.src = "pageImages/rhmp9.png"
			// 设置mainTab宽度
			// this.mainTab.setWidth(this.getMainTabDiv().getComputedWidth()-155)
			this.mainTab.setWidth(this.mainTab.getWidth() - 155)
		}
	},

	refreshWelcomePortal : function() {
		if (this.welcomPortal) {
			this.welcomPortal.refresh()
		}
	}
})