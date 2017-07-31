$package("app.biz.widgets")

app.biz.widgets.MyPagingToolbar = function(cfg) {
	app.biz.widgets.MyPagingToolbar.superclass.constructor.apply(this, [cfg])
}
Ext.extend(app.biz.widgets.MyPagingToolbar, util.widgets.MyPagingToolbar, {
	doLoad : function(start) {
		var pageSize = this.pageSize
		var pageNo = Math.ceil((start + pageSize) / pageSize)
		if(pageNo > 100){
			Ext.MessageBox.show({
				title : "提示",
				msg : "页码过大,请添加查询条件进行过滤查询!",
				buttons : Ext.MessageBox.OK
			})
			return;
		}
		this.requestData.pageSize = pageSize
		this.requestData.pageNo = pageNo
		var o = {}, pn = this.getParams();
		o[pn.start] = start;
		o[pn.limit] = pageSize;
		this.store.load({
			params : o
		});
	}
	
})