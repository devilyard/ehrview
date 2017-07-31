/**
* @include "../../modules/list/SimpleListView.js"
*/
$package("app.dev.rd.ProductBackLogList")
$import("app.modules.list.SimpleListView")
app.dev.rd.ProductBackLogList = function(cfg){
	var a = new app.modules.list.SimpleListView(cfg)
	app.dev.rd.ProductBackLogList.superclass.constructor.apply(this,[cfg])
	this.viewConfig = {
		//forceFit:true,
       // enableRowBody:true
	}
}

Ext.extend(app.dev.rd.ProductBackLogList, app.modules.list.SimpleListView,{
	getRowClass:function(record,rowIndex,rowParams,store){
		//rowParams.body = '<p>'+record.data.demo+'</p>';
        //return 'x-grid3-row-expanded';
	},
	fmtPostDt:function(value, params, record){
		return value
	}
})