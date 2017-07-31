$package("app.biz.rpcMonitor")

$import("app.desktop.Module", "org.ext.ux.TabCloseMenu", "app.modules.common",
		"util.dictionary.TreeDicFactory", "util.rmi.jsonRequest","util.gis.MapUtil")

app.biz.rpcMonitor.RpcMonitor = function(cfg) {
	this.width = 720
	this.height = 450
	this.serviceId = "configuration"
	this.activeModules = {}
	this.pModules = {}
	Ext.apply(this, app.modules.common)
	app.biz.rpcMonitor.RpcMonitor.superclass.constructor.apply(this, [cfg])
}

Ext.extend(app.biz.rpcMonitor.RpcMonitor, app.desktop.Module, {
	
	 initPanel:function(){
		 if(!this.url){
		    var path = window.location.href
            path = path.substring(0,path.lastIndexOf('/')+1)
			this.url = path.replace("ssdev-app","CTDS-ETL")+"RpcMonitor.html"
		 }
		 if(this.param){
		  this.url+=this.param;
		 }
	     var panel = new Ext.Panel({
	      frame:false,
	      autoScroll:true,
	      html:"<iframe src="+ this.url + " width='100%' height='100%' frameborder='no'></iframe>"  
	  })
	  this.panel = panel
	  return this.panel 
	 }
})
