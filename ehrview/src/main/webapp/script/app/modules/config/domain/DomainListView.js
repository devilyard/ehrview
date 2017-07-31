$package("app.modules.config.domain")

$import("app.modules.config.RemoveConfigList")

app.modules.config.domain.DomainListView = function(cfg){
	cfg.listServiceId = "domainConfig"
	cfg.serverParams = {op:"query"}
	cfg.createCls = "app.modules.config.domain.DomainForm"
	cfg.updateCls = "app.modules.config.domain.DomainForm"
	Ext.apply(this,app.modules.common)
    app.modules.config.domain.DomainListView.superclass.constructor.apply(this,[cfg])	
}
Ext.extend(app.modules.config.domain.DomainListView,app.modules.config.RemoveConfigList,{
	formatShow:function(v,meta){
		if(v == '1'){
		   meta.attr = 'style="background:#00A600"'   //绿色
		}else if(v == '2'){   //禁用的域, 但连接到zookeeper中, 黄色 警告
		   meta.attr = 'style="background:#F9F900"'    //黄色
		}else{
		   meta.attr = 'style="background:#ff7575"'    //红色
		}
	    return ""
	}
})