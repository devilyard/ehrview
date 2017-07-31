$package("app.modules.config")

$import("app.desktop.Module", "org.ext.ux.TabCloseMenu", "app.modules.common",
		"util.dictionary.TreeDicFactory", "util.rmi.jsonRequest",
		"app.modules.form.SimpleFormView")

app.modules.config.SchemaConfigList = function(cfg) {
	this.width = 720
	this.height = 450
	this.serviceId = "configuration"
	this.activeModules = {}
	this.pModules = {}
	this.domain = globalDomain
	Ext.apply(this, app.modules.common)
	app.modules.config.SchemaConfigList.superclass.constructor.apply(this,
			[cfg])
}

Ext.extend(app.modules.config.SchemaConfigList, app.desktop.Module, {
			initPanel : function() {
				var combox = util.dictionary.SimpleDicFactory.createDic({
		    	     id:'domain',
		   		     width:175,
		  	    	 editable:false,
		   	   	     emptyText:"请选择域",
		   	 		 autoLoad:true
				})
				combox.getStore().on("load",function(s,rs){
		  			 combox.setValue(globalDomain)
	    		},this)
				combox.on("select",this.doNewDic,this)
				
				var tree = util.dictionary.TreeDicFactory.createTree({
							id : this.dicId,
							keyNotUniquely : true
						})
				tree.autoScroll = true
				tree.on("click", this.onTreeClick, this)
				tree.on({
							"contextmenu" : this.onContextMenu,
							containercontextmenu : this.containercontextmenu,
							scope : this
						})
				tree.expandAll()
				this.tree = tree
				tree.getRootNode().reload();

				/*
				 * this.treeEditer = new Ext.tree.TreeEditor(tree,{
				 * allowBlank:false, blankText : '请输入名称', selectOnFocus : true
				 * }); this.treeEditer.on("beforestartedit",
				 * function(treeEditer) { var tempNode = treeEditer.editNode; if
				 * (tempNode.isLeaf()) { return false; } else { return true; }
				 * }); this.treeEditer.on("complete", function(treeEditer) {
				 * alert(treeEditer.editNode.text); });
				 */
				var tab = new Ext.TabPanel({
							region : "center",
							enableTabScroll : true,
							defaults : {
								autoScroll : true
							},
							layoutOnTabChange : true,
							margins : '0 4 4 0',
							resizeTabs : true,
							tabWidth : 100,
							minTabWidth : 100,
							plugins : new Ext.ux.TabCloseMenu(),
							items : []
						})
				this.tab = tab
				var panel = new Ext.Panel({
							height : this.height,
							layout : "border",
							items : [{
										layout : 'fit',
										title : "数据结构描述",
										region : 'west',
										split : true,
										collapsible : true,
										width : 180,
										tbar:[combox],
										items : [tree]
									}, tab]
						})
				this.panel = panel
				if (!this.isCombined) {
					this.addPanelToWin();
				}
				return this.panel
			},
			
			doNewDic:function(com){
				var domain = com.getValue()
				var dic = this.dicId
				if(domain != globalDomain){
				    dic = domain + "." +this.dicId
				}
				var loader = this.tree.getLoader()
				if(!loader.hasListener("loadexception")){
				   loader.on("loadexception",function(){
				   },this)
				}
				loader.url = dic + ".dic"
				loader.dic = {id:dic}
				var node = this.tree.getRootNode()
				node.reload()
				this.tree.expandAll()
				this.domain = domain
				this.tab.removeAll()
			},
			
			getSchemaFrom : function(node) {
				var id = node ? node.attributes.key : "__schemaForm__"
				var title = node ? node.text : "新建数据结构描述"
				var m = this.pModules[id]
				if (!m) {
					var cfg = {
						tree : this.tree
					}
					cfg.domain = this.domain
					var cls = "app.modules.config.SchemaConfigForm"
					$import(cls)
					m = eval("new " + cls + "(cfg)")
					m.on("save", this.onSave, this)
					var p = m.initPanel()
					p._mId = id
					p.on("destroy", this.onClose, this)
					p.title = title
					p.closable = true
					this.tab.add(p)
					this.tab.doLayout()
					this.tab.activate(p)
					this.activeModules[id] = p
					this.pModules[id] = m
				} else {
					var p = this.activeModules[id]
					this.tab.activate(p)
				}
				if (node) {
					m.initFormData(node)
				}
				return m
			},
			onSave : function(op, data, pn) {
				if (op == "create") {
					if (pn) {
						var node = pn.appendChild({
									text : data.alias,
									leaf : true
								});
						node.attributes.key = data.id;
						node.select()
					}
				}
				if (op == "update") {
					var n = this.tree.getSelectionModel().getSelectedNode()
					if (n) {
						n.setText(data.alias)
					}
				}
			},
			onClose : function(panel) {
				var id = panel._mId
				this.pModules[id].destory()
				delete this.activeModules[id]
				delete this.pModules[id]
			},
			onTreeClick : function(node, e) {
				if (node.isLeaf()) {
					var m = this.getSchemaFrom(node)
					m.parentNode = node.parentNode
				}
			},
			addNew : function() {
				var m = this.getSchemaFrom()
				m.doNew()
				m.form.getForm().isValid()
				var n = this.tree.getSelectionModel().getSelectedNode();
				m.parentNode = n
			},
			addFolder : function() {
				var writeForm = this.writeForm.getForm();
				if(!writeForm.isValid()){
					return
				}
				var win = this.writeWin;
				win.hide();
				var folderName = writeForm.findField("text")
						.getValue()
				var node = this.selectedNode;
				var root = this.tree.getRootNode()
				if (node == root) {
					var pkey = "\\" + folderName
				} else {
					var pkey = "\\" + node.attributes.key + "\\" + folderName
					while (node.parentNode != root) {
						node = node.parentNode
						pkey = "\\" + node.attributes.key + pkey
					}
				}
				node = this.selectedNode;
				if (node) {
					// this.treeEditer.triggerEdit(node)
					util.rmi.jsonRequest({
								serviceId : "configuration",
								className : "SchemaConfig",
								operate : "addFolder",
								domain:this.domain,
								pkey : pkey
							}, function(code, msg, json) {
								if (code == 200) {
									var n = node.appendChild({
												id : folderName,
												text : folderName
											})
									n.attributes.key=folderName
									n.select()
									n.expand()
								} else {
									alert("新建失败")
								}
							}, this)

				}

			},
			getParent : function() {
				this.selectedNode = this.selectedNode.parentNode
				this.getWriteForm();
			},
			getWriteForm : function() {
				var form = this.writeForm;
				if (!form) {
					form = new Ext.form.FormPanel({
								defaultType : 'textfield',
								labelAlign : 'righe',
								buttonAlign : "center",
								frame : true,
								width : 100,
								items : [{
											fieldLabel : '输入目录名字',
											name : 'text',
											allowBlank:false,
											invalidText :"必填字段"
										}],
								buttons : [{
											text : '确定',
											handler : this.addFolder,
											scope : this
										}]
							})
					this.writeForm = form;
				}
				form.getForm().reset();
				var win = this.writeWin;
				if (!win) {
					win = new Ext.Window({
								title : this.title,
								width : 300,
								height : 100,
								iconCls : 'icon-form',
								layout : "fit",
								closeAction : 'hide',
								buttonAlign : 'center'
							})
					win.add(form)
					this.writeWin = win
				}
				win.show();
				form.getForm().isValid()
			},
			doRemove : function() {
				// Ext.MessageBox.alert("提示","不允许删除.");
				var node = this.tree.getSelectionModel().getSelectedNode()

				if (node == null) {
					return
				}
				if (node.childNodes.length > 0) {
					Ext.MessageBox.alert("提示", "该应用下还有模块配置，不允许删除.");
					return;
				}
				Ext.Msg.show({
							title : '确认删除[' + node.text + ']',
							msg : '删除操作将无法恢复，是否继续?',
							modal : false,
							width : 300,
							buttons : Ext.MessageBox.OKCANCEL,
							multiline : false,
							fn : function(btn, text) {
								if (btn == "ok") {
									this.processRemove(node);
								}
							},
							scope : this
						})
			},
			processRemove : function(node) {
				var pkey = node.attributes.key
				if (!node.isLeaf()) {
					var root = this.tree.getRootNode()
					pkey = "\\" + node.attributes.key
					while (node.parentNode != root) {
						node = node.parentNode
						pkey = "\\" + node.attributes.key + pkey
					}
				}
				node = this.selectedNode;
				util.rmi.jsonRequest({
							serviceId : "configuration",
							className : "SchemaConfig",
							operate : "remove",
							domain:this.domain,
							pkey : pkey
						}, function(code, msg, json) {
							if (code > 300) {
								this.processReturnMsg(code, msg,
										this.processRemove, [node])
								return;
							}
							node.remove();
						}, this)

			},
			containercontextmenu : function(tree,e) {
				e.stopEvent();
				this.selectedNode = this.tree.getRootNode();
				var cmenu = this.midiMenus['westTreeContainerMenu']
				if (!cmenu) {
					cmenu = new Ext.menu.Menu({
								items : [{
											text : "增加",
											iconCls : "add",
											menu : {
												items : [{
															text : "目录",
															iconCls : "add",
															scope : this,
															handler : this.getWriteForm
														}]
											}
										}]
							});
				this.midiMenus['westTreeContainerMenu'] = cmenu
				}
				cmenu.showAt([e.getPageX(), e.getPageY()]);
			},
			onContextMenu : function(node, e) {
				node.select()
				this.selectedNode = node;
				var menu = this.midiMenus["_tree_"]
				if (!menu) {
					menu = new Ext.menu.Menu({
								width : 100,
								items : [{
											text : "增加",
											iconCls : "add",
											menu : {
												items : [{
															text : "目录",
															iconCls : "add",
															scope : this,
															handler : this.getParent
														}, {
															text : "子目录",
															iconCls : "add",
															scope : this,
															handler : this.getWriteForm
														}, {
															text : "新建数据",
															iconCls : "add",
															handler : this.addNew,
															scope : this
														}]
											}
										}, {
											text : "删除",
											iconCls : "remove",
											handler : this.doRemove,
											scope : this
										}]
							})
					this.midiMenus["_tree_"] = menu
				}

				if (node.isLeaf()) {
					menu.items.itemAt(0).hide()
					menu.items.itemAt(1).show()

				} else {
					menu.items.itemAt(0).show()
					menu.items.itemAt(1).show()
				}

				menu.showAt([e.getPageX(), e.getPageY()])
			}
		})
