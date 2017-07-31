$package("util.widgets")

util.widgets.MyPagingToolbar = function(cfg) {
	util.widgets.MyPagingToolbar.superclass.constructor.apply(this, [cfg])
	this.addEvents({
		"beforePageChange" : true,
		"pageChange" : true
	})
}
Ext.extend(util.widgets.MyPagingToolbar, Ext.PagingToolbar, {
	initComponent : function() {
		var pages = [5,10,25,50,100];
		data = [];
		for(var i=0;i<pages.length;i++){
			data.push([pages[i],'每页'+pages[i]+'条'])
		}
		var store = new Ext.data.SimpleStore({
			fields : ['value', 'text'],
			data : data
		});
		if (this.requestData.pageSize) {
			this.pageSize = this.requestData.pageSize
		}
		var combox = new Ext.form.ComboBox({
			store : store,
			valueField : "value",
			displayField : "text",
			editable : false,
			selectOnFocus : true,
			triggerAction : 'all',
			mode : 'local',
			emptyText : '',
			width : 80,
			value : this.pageSize
		})
		combox.on("select", function(combo, record, index) {
			var pageSize = parseInt(record.data.value)
			var total = this.store.getTotalCount()
			if (this.pageSize >= total && pageSize > this.pageSize) {
				combox.setValue(this.pageSize)
				return
			}
			this.pageSize = pageSize
			this.doLoad(0);
		}, this)
		this.items = (["-", combox]).concat(this.items || [])
		util.widgets.MyPagingToolbar.superclass.initComponent.call(this);
	},
	updateInfo : function(n) {
		if (this.displayItem) {
			var count = this.store.getCount();
			var end = this.cursor + count
			var total = this.store.getTotalCount()
			if(n){
			   total = n
			}
			if (end > total) {
				end = total
			}
			var msg = count == 0 ? this.emptyMsg : String.format(
					this.displayMsg, this.cursor + 1, end, total);
			this.displayItem.setText(msg);
		}
	},
	doLoad : function(start) {
		var pageSize = this.pageSize
		var pageNo = Math.ceil((start + pageSize) / pageSize)
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
