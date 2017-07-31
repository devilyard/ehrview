$package("sys.data")

$import("app.modules.list.SimpleListView")

sys.data.SolrListView = function(cfg){
	sys.data.SolrListView.superclass.constructor.apply(this, [cfg])
}

Ext.extend(sys.data.SolrListView, app.modules.list.SimpleListView,{
	doSyncSolr:function(){
		Ext.MessageBox.show({
			title : "请稍候",
			msg : "正在同步数据库和索引库...",
			progress : true,
			width : 300
		});
		util.rmi.jsonRequest({
			serviceId:"DB2Solr",
			start:"1"
		},function(code,msg,json){
		},this)
		sys.data.SolrListView.tm = setInterval(this.updateProgress,2000)
	},
	updateProgress:function(){
		util.rmi.jsonRequest({
			serviceId:"DB2Solr"
		},function(code,msg,json){
			var body = json.body;
			if(!body){
				clearInterval(sys.data.SolrListView.tm);
				Ext.MessageBox.updateProgress(0,0+"%");
				Ext.MessageBox.hide();
				return;
			}
			var percent = body.percent;
			if(body.finished){
				clearInterval(sys.data.SolrListView.tm);
				Ext.MessageBox.updateProgress(0,0+"%");
				Ext.MessageBox.hide();
			}else{
				if(percent != 100){
					Ext.MessageBox.updateProgress(percent/100.0,percent+"%");
				}
			}
		},this)
	}
})