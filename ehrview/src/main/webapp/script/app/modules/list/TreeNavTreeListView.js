$package("app.modules.list")
$import(
	"app.modules.list.TreeNavListView",
	"util.dictionary.TreeDicFactory",
	"org.ext.ux.treegrid.TreeGrid",
	"app.modules.form.TableFormView"
)
app.modules.list.TreeNavTreeListView = function(cfg) {
	app.modules.list.TreeNavTreeListView.superclass.constructor.apply(this, [cfg])
}
Ext.extend(app.modules.list.TreeNavTreeListView, app.modules.list.TreeNavListView, {
	warpPanel : function(grid) {
		if (!this.showNav) {
			return grid
		}
		grid.autoWidth = true;
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
		var formObj = new app.modules.form.TableFormView({
			entryName:this.entryName,
			autoLoadData:false
		});
		this.formObj = formObj;
		this.form = formObj.initPanel();
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
								layout: {
                                    type:'vbox',
                                    padding:'1',
                                    align:'stretch'
                                },
								split : true,
								title : '',
								region : 'center',
								width : 280,
								items : [grid,this.form]
							}]
				});
		this.tree = tf.tree
		grid.__this = this
		tf.tree.on("click", this.onCatalogChanage, this)
		// this.warpPanel = panel
		tf.tree.expand()
		return panel
	},
	onRowClick:function(){
		this.formObj.initFormData({
			Name:'Name',
		    StandardIdentify:'META1',
		    CustomIdentify:'BSOFT_META1',
		    DataType:'1',
		    DataLength:20
		})
	},
	onCatalogChanage : function(node, e) {
		
	},
	initPanel:function(sc){
		var schema = sc
		if(!schema){
			var re = util.schema.loadSync(this.entryName)
			if(re.code == 200){
				schema = re.schema;
			}
			else{
				this.processReturnMsg(re.code,re.msg,this.initPanel)
				return;
			}
		}
		var items = schema.items
		var grid = new Ext.ux.tree.TreeGrid({
	        title: '数据元',
	        width: 500,
	        height: 300,
	        enableDD: true,
			columns:this.getCM(items),
	        dataUrl: 'treegrid-data.json'
	    })
		this.grid = grid
		this.grid.on("click",this.onRowClick,this)
		if(!this.isCombined){
			this.fireEvent("beforeAddToWin",this.grid)
			this.addPanelToWin();
		}
		return this.grid
	}
})
