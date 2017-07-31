$package("app.modules.sample")
$import("app.modules.list.TreeNavListView")

app.modules.sample.Report = function(cfg){
	this.width = 500
	this.height = 800
	this.showButtonOnTop = true
	app.modules.sample.Report.superclass.constructor.apply(this,[cfg])
}

Ext.extend(app.modules.sample.Report, app.modules.list.TreeNavListView,{
	
	addPanelToWin:function(){
		if(!this.fireEvent("panelInit",this.grid)){
			return;
		};
		var win = this.getWin();
		if(!this.warpInited){
			win.add(this.warpGridPanel(this.grid))
			this.warpInited = true;
		}
		else{
			var p = this.warpPanel.items.get(1)
			p.remove(p.items.get(0))
			p.add(this.grid)
			this.win.doLayout()
		}
	},
	onCatalogChanage:function(node,e){
		if(node.leaf){
			this.requestData.schema = node.id
			this.entryName = node.id;
			this.getSchema()
		}
	}
})