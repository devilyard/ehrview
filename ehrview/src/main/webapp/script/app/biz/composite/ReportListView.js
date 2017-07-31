/**
 * @include "../../desktop/Module.js"
 * @include "../common.js"
 * @include "../../../util/Accredit.js"
 * 
 */
$package("app.biz.composite")
$import("app.desktop.Module", "app.modules.common", "util.Accredit",
		"util.dictionary.SimpleDicFactory",
		"util.widgets.MyPagingToolbar",
		"util.widgets.MyRowExpander", 
		"util.rmi.jsonRequest",
		"util.rmi.miniJsonRequestSync",
		"app.modules.list.ChartListView")

app.biz.composite.ReportListView = function(cfg) {
	this.width = 620;
	this.height = 350
	this.selectFirst = true
	this.enableCnd = true
	this.autoLoadData = true
	this.cnds = cfg.cnds || this.initCnd;
	this.listServiceId = "simpleQuery"
	this.removeServiceId = "simpleRemove"
	this.createCls = "app.modules.form.MCFormView"
	this.updateCls = "app.modules.form.MCFormView"
	this.gridCreator = Ext.grid.GridPanel
	this.exContext = {}
	this.modal = false; // add by huangpf
	this.queryCndsType = null
	app.biz.composite.ReportListView.superclass.constructor.apply(this, [cfg])
}
Ext.extend(app.biz.composite.ReportListView, app.modules.list.ChartListView, {
			init : function() {
				this.addEvents({
							"loadData" : true
						})
				this.requestData = {
					serviceId : "simpleReport",
					schema : this.entryName
				}
				if (this.exQueryParam) {
					for (var name in this.exQueryParam) {
						var v = this.exQueryParam[name]
						if (typeof v == "object") {
							v = v.key
						}
						this.requestData[name] = v;
					}
				}
			},
			initPanel : function() {
				if (this.grid) {
					if (!this.isCombined) {
						this.fireEvent("beforeAddToWin", this.grid)
						this.addPanelToWin();
					}
					return this.grid;
				}

				var schema = this.schema
				if (!schema && this.entryName) {
					var ret = util.rmi.miniJsonRequestSync({
								serviceId : "reportSchemaLoader",
								schema : this.entryName
							})
					if (ret.code == 200) {
						this.schema = ret.json.body
						this.title = this.schema.title
					} else {
						alert(ret.msg)
						return;
					}
				}
				
				var items =schema.items||[];
				this.store = this.getStore(items)
				this.cm = new Ext.grid.ColumnModel(this.getCM(items))
				var cfg = {
					border : false,
					store : this.store,
					cm : this.cm,
					autoSizeColumns : true,
					loadMask : {
						msg : '正在加载数据...',
						msgCls : 'x-mask-loading'
					},
					buttonAlign : 'center',
					clicksToEdit : true,
					frame : false,
					singleSelect:true,
					plugins : this.rowExpander,
					// stripeRows : true,
					viewConfig : {
						// forceFit : true,
						getRowClass : this.getRowClass
					}
				}

				if (this.gridDDGroup) {
					cfg.ddGroup = this.gridDDGroup;
					cfg.enableDragDrop = true
				}
				var cndbars = this.getCndBar(this.schema)

				if (!this.showButtonOnPT) {
					if (this.showButtonOnTop) {
						cfg.tbar = (cndbars.concat(this.tbar || []))
								.concat(this.createButtons())
					} else {
						cfg.tbar = cndbars.concat(this.tbar || [])
						//cfg.buttons = this.createButtons()
					}
				}

				this.grid = new this.gridCreator(cfg)
				this.grid.on("afterrender", this.onReady, this)
				this.grid.on("contextmenu", function(e) {
							e.stopEvent()
						})
				this.grid.on("rowcontextmenu", this.onContextMenu, this)
				this.grid.on("rowdblclick", this.onDblClick, this)
				this.grid.on("rowclick", this.onRowClick, this)
				this.grid.on("keydown", function(e) {
							if (e.getKey() == e.PAGEDOWN) {
								e.stopEvent()
								this.pagingToolbar.nextPage()
								return
							}
							if (e.getKey() == e.PAGEUP) {
								e.stopEvent()
								this.pagingToolbar.prevPage()
								return
							}
						}, this)

				if (!this.isCombined) {
					this.fireEvent("beforeAddToWin", this.grid)
					this.addPanelToWin();
				}
				//this.initCnds();
				return this.grid
			},
			
			onDblClick:function(grid, rowindex, e){
				var r=this.getSelectedRecord();
				if(r == null || !this.schema || !this.schema.diggers
				 || this.schema.items.length==0 ){
					return
				}
				var pkey=this.schema.items[0].id;
				var target=this.schema.diggers[pkey];
				var diggerParam={};
				diggerParam[pkey]=r.data[pkey];
				if(r.data[pkey]=="sum" || !r.data[pkey]) return;
				diggerParam[pkey+"_text"]=r.data[pkey+"_text"];
				diggerParam.schema=target;
				this.fireEvent("digger", this, diggerParam)
			},
			
			doCndQuery : function() {
				var initCnd = this.initCnd
				var index = this.cndFldCombox.getValue()
				var it = this.schema.items[index]

				if (!it) {
					return;
				}
				this.resetFirstPage()
				var v = this.cndField.getValue()

				if (this.cndField.getXType() == "datefield") {
					v = v.format("Y-m-d")
				}
				if (v == null || v == "") {
					this.queryCnd = null;
					this.requestData.cnd = initCnd
					this.refresh()
					return
				}
				var refAlias = it.refAlias || "a"

				var cnd = ['eq', ['$', refAlias + "." + it.id]]
				if (it.dic) {
					if (it.dic.render == "Tree") {
						var node = this.cndField.selectedNode
						// @@ modified by chinnsii 2010-02-28, add "!node"
						if (!node || !node.isLeaf()) {
							cnd[0] = 'like'
							cnd.push(['s', v + '%'])
						} else {
							cnd.push(['s', v])
						}
					} else {
						cnd.push(['s', v])
					}
				} else {
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
						case "date" :
							v = v.format("Y-m-d")
							cnd[1] = [
									'$',
									"str(" + refAlias + "." + it.id
											+ ",'yyyy-MM-dd')"]
							cnd.push(['s', v])
							break;
					}
				}
				this.queryCnd = cnd
				if (initCnd) {
					cnd = ['and', initCnd, cnd]
				}
				this.requestData.cnd = cnd
				this.refresh()
			},
			
			refresh:function(){
				this.store = this.getStore(this.schema.items)
				this.cm = new Ext.grid.ColumnModel(this.getCM(this.schema.items))
				this.grid.reconfigure(this.store, this.cm);
				app.biz.composite.ReportListView.superclass.refresh.call(this)
			}
		});
