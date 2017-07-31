$package("app.modules.list")
$import(
	"app.modules.list.SimpleListView",
	"util.dictionary.TreeDicFactory"
)
app.modules.list.TreeNavListView = function(cfg) {
	this.mutiSelect = true
	this.westWidth = cfg.westWidth || 150 // add by huangpf.
	this.gridDDGroup = 'gridDDGroup'
	this.saveServiceId = "simpleSave"
	this.showNav = true
	app.modules.list.TreeNavListView.superclass.constructor.apply(this, [cfg])
	this.width = 950;
	this.height = 450
}
Ext.extend(app.modules.list.TreeNavListView, app.modules.list.SimpleListView, {
			warpPanel : function(grid) {
				if(!this.showNav){
					return grid
				}
				var navDic = this.navDic
				var tf = util.dictionary.TreeDicFactory.createDic({
							dropConfig : {
								ddGroup : 'gridDDGroup',
								notifyDrop : this.onTreeNotifyDrop,
								scope : this
							},
							id : navDic,
							parentKey : this.navParentKey,
							rootVisible : this.rootVisible || false
						})
				var panel = new Ext.Panel({
							border : false,
							frame : true,
							layout : 'border',
							width : this.width,
							height : this.height,
							items : [{
										layout : "fit",
										split : true,
										collapsible : true,
										title : '',
										region : 'west',
										width : this.westWidth,
										items : tf.tree
									}, {
										layout : "fit",
										split : true,
										title : '',
										region : 'center',
										width : 280,
										items : grid
									}]
						});
				this.tree = tf.tree
				grid.__this = this
				tf.tree.on("click", this.onCatalogChanage, this)
				// this.warpPanel = panel
				tf.tree.expand()
				return panel
			},
			onCatalogChanage : function(node, e) {
				var navField = this.navField
				var initCnd = this.initCnd
				var queryCnd = this.queryCnd

				var cnd;
				if (node.leaf) {
					cnd = ['eq', ['$', navField], ['s', node.id]]
				} else {
					cnd = ['like', ['$', navField], ['s', node.id + '%']]
				}

				this.navCnd = cnd
				if (initCnd || queryCnd) {
					cnd = ['and', cnd]
					if (initCnd) {
						cnd.push(initCnd)
					}
					if (queryCnd) {
						cnd.push(queryCnd)
					}
				}
				this.resetFirstPage()
				this.requestData.cnd = cnd
				this.refresh()
			},
			doCndQuery : function() {
				var initCnd = this.initCnd
				var navCnd = this.navCnd
				var index = this.cndFldCombox.getValue()
				var it = this.schema.items[index]

				if (!it) {
					return;
				}
				var v = this.cndField.getValue()
				this.requestData.pageNo = 1
				var pt = this.grid.getBottomToolbar()
				if(pt){
					pt.cursor = 0;
				}
				if (v == null || v == "") {
					var cnd = [];

					this.queryCnd = null;
					if (navCnd) {
						if (initCnd) {
							cnd.push("and")
							cnd.push(navCnd)
							cnd.push(initCnd)
						} else {
							cnd = navCnd
						}
					}
					this.requestData.cnd = cnd
					this.refresh()
					return
				}
				var refAlias = it.refAlias || "a"
				var cnd = ['eq', ['$', refAlias + "." + it.id]]
				if (it.dic) {
					if (it.dic.render == "Tree") {
						var node = this.cndField.selectedNode
						if (!node.isLeaf()) {
							cnd[0] = 'like'
							cnd.push(['s', v + '%'])
						} else {
							cnd.push(['s', v])
						}
					} else {
						cnd.push(['s', v])
					}
				} 
				else {
					switch (it.type) {
						case 'int' :
							cnd.push(['i', v])
							break;
						case 'double' :
						case 'bigDecimal' :
							cnd.push(['d', v])
							break;
						case 'string' :
							cnd[0] = 'like'
							cnd.push(['s', v + '%'])
							break;
						case "date":
							v = v.format("Y-m-d")
							cnd[1] = ['$', "str(" + refAlias + "." + it.id + ",'yyyy-MM-dd')"]
							cnd.push(['s',v])
							break;
					}
				}
				this.queryCnd = cnd
				if (initCnd || navCnd) {
					cnd = ['and', cnd]
					if (initCnd) {
						cnd.push(initCnd)
					}
					if (navCnd) {
						cnd.push(navCnd)
					}
				}
				this.requestData.cnd = cnd
				this.refresh()
			},
			onTreeNotifyDrop : function(dd, e, data) {
				var n = this.getTargetFromEvent(e);
				var r = dd.dragData.selections[0];
				var node = n.node
				var ctx = dd.grid.__this

				if (!node.leaf || node.id == r.data[ctx.navField]) {
					return false
				}
				var updateData = {}
				updateData[ctx.schema.pkey] = r.id
				updateData[ctx.navField] = node.attributes.key
				ctx.saveToServer(updateData, r)
				// node.expand()
			},
			addPanelToWin : function() {
				if (!this.fireEvent("panelInit", this.grid)) {
					return;
				};
				var win = this.getWin();
				win.add(this.warpPanel(this.grid))
				win.doLayout()
			},
			saveToServer : function(saveData, r) {
				var entryName = this.schema.id

				if (!this
						.fireEvent("beforeSave", entryName, "uptate", saveData)) {
					return;
				}
				this.tree.el.mask("在正保存数据...", "x-mask-loading")
				util.rmi.jsonRequest({
							serviceId : this.saveServiceId,
							op : "update",
							schema : entryName,
							body : saveData
						}, function(code, msg, json) {
							this.tree.el.unmask()
							if (code > 300) {
								this.processReturnMsg(code, msg,
										this.saveToServer, [saveData]);
								return
							} else {
								this.grid.store.remove(r)
								this.fireEvent("save", entryName, json.body,
										this.op)
							}
						}, this)// jsonRequest
			}
		})
