$package("app.biz.ehrview")

$import("app.biz.eval.Sharedocs", "app.biz.eval.Datasets", "app.lang.UIModule")

app.biz.ehrview.TemplateSearch = function(cfg) {
	app.biz.ehrview.TemplateSearch.superclass.constructor.apply(this, [ cfg ])
	this.showButtonOnTop = true
}

// textarea
var tx;

// nodeName
var nodeN;

Ext.extend(app.biz.ehrview.TemplateSearch, app.lang.UIModule, {

	initPanel : function() {
		if (this.panel) {
			return this.panel
		}

		// HTML模板菜单树
		var tree = this.createTree();
		this.tree = tree;

		// HTML内容展示FORM
		var form = this.createForm();

		// tabPanel
		var tabPanel = this.createTabPanel(tree, form);

		// 主Panel
		var panel = this.cratePanel(tabPanel);

		this.panel = panel
		return panel
	},
	createTree : function() {
		// 从后台获取模板列表
		var r = util.rmi.miniJsonRequestSync({
			serviceId : this.listServiceId,
			schema : this.entryName
		})

		// 把获取到的模板列表放到tree菜单里
		var root = new Ext.tree.AsyncTreeNode({
			children : Ext.decode(r.json.body)
		});

		var tree = new Ext.tree.TreePanel({
			rootVisible : false,
			root : root,
			border : false,
			autoHeight : true,
			autoScroll : true,// 显示滚动条
			animate : true,// 是否使用动画展开或折叠
			enableDD : false,// 允许子节点拖动
			containerScroll : true,// 登记本容器ScrollManager
			loader : new Ext.tree.TreeLoader()
		});

		tree.on('click', this.select);

		tree.title = "页面模板";
		return tree;
	},
	createForm : function() {
		var subBtn = new Ext.Button({
			text : "保存",
			width : 60
		});

		tx = new Ext.form.TextArea({
			frame : true,
			fieldLabel : "html",
			width : 700,
			height : 400
		});

		subBtn.on('click', this.saveHtml);

		var form = new Ext.form.FormPanel({
			items : [ tx ],
			buttons : [ subBtn ]
		})
		return form;
	},
	createTabPanel : function(tree, form) {
		var tabitems = [];

		tabitems.push({
			region : "center",
			width : 900,
			split : true,
			border : false,
			collapsible : false,
			autoScroll : true,// 显示滚动条
			items : tree
		});

		tabitems.push({
			region : "east",
			width : 900,
			split : true,
			border : false,
			autoScroll : true,// 显示滚动条
			collapsible : false,
			items : form
		});

		var panelinner = new Ext.Panel({
			layout : 'border',
			items : tabitems
		});

		panelinner.title = "页面模板";

		var tabPanel = new Ext.TabPanel({
			region : "center",
			activeTab : 0,
			resizeTabs : true,
			border : false,
			items : panelinner
		});
		return tabPanel;
	},
	cratePanel : function(tabPanel) {
		var pnlcfg = {
			tbar : [ '文件名查询:', {
				xtype : 'textfield',
				width : 180,
				emptyText : '请输入文件名搜索',
				id : 'searchName'
			}, {
				xtype : 'button',
				iconCls : 'query',
				scope : this,
				handler : this.searchTree
			} ],
			layout : 'border',
			items : tabPanel
		}

		var panel = new Ext.Panel(pnlcfg);
		return panel;
	},
	saveHtml : function() {
		var r = util.rmi.miniJsonRequestSync({
			serviceId : "pageConfigService",
			html : tx.getValue(),
			nodename : nodeN
		})
		Ext.MessageBox.alert("提示", "保存成功");
	},
	searchTree : function() {

		var tr = this.tree;

		var timeOutId = null;

		tr.expandAll();

		// 获取输入框的值  
		var text = Ext.getCmp("searchName").getValue();

		// 根据输入制作一个正则表达式，'i'代表不区分大小写  
		var re = new RegExp(Ext.escapeRe(text), 'i');

		tr.getRootNode().eachChild(function(chdnode) {
			chdnode.eachChild(function(chdnodeCd) {
				// 显示上次被隐藏的节点
				chdnodeCd.ui.show();
				if (text != "" && !re.test(chdnodeCd.attributes.text)) {
					chdnodeCd.ui.hide();
				}
			})
		})

		// 查询条件为空时缩起目录树
		if (text == "") {
			tr.collapseAll();
		}

	},
	select : function(node) {
		var r = util.rmi.miniJsonRequestSync({
			serviceId : "pageConfigService",
			nodename : node.attributes.text
		})
		nodeN = node.attributes.text;
		tx.setValue(r.json.html);
	}
});
