$package("sys.data.element")

$import("app.modules.list.SelectListView")

sys.data.element.DataSetSelectListView = function(cfg){
	this.initCnd = ['and',['eq',['$','a.Status'],['s','1']],['eq',['$','b.Status'],['s','1']]]
	sys.data.element.DataSetSelectListView.superclass.constructor.apply(this,[cfg]);
}

Ext.extend(sys.data.element.DataSetSelectListView, app.modules.list.SelectListView, {
	doZip:function(){
		var body = {};
		var dataSets=[]
		var records=this.getSelectedRecords();
		for(var i=0;i<records.length;i++){
			var record=records[i]
			var r={
				Status:record.get("Status"),
				DataSetId:record.get("DataSetId"),
				StandardIdentify:record.get("StandardIdentify"),
				CustomIdentify:record.get("CustomIdentify"),
				DName:record.get("DName"),
				DataStandardId:record.get("DataStandardId")
			}
			dataSets.push(r)
		}
		body={
			dataSets:dataSets
		}
		var url ="*.download?serviceId=downloadDataSetZip&body="+encodeURI(encodeURI(Ext.encode(body)))
		var printWin = window.open(url,"","height="+(screen.height-100)+", width="+(screen.width-10)+", top=0, left=0, toolbar=no, menubar=yes, scrollbars=yes, resizable=yes,location=no, status=no")
	}
})