$package("app.biz.rpcMonitor")

$import("app.desktop.Module", "org.ext.ux.TabCloseMenu", "app.modules.common",
		"util.dictionary.TreeDicFactory", "util.rmi.jsonRequest","util.gis.MapUtil")

app.biz.rpcMonitor.RpcMonitorPanel = function(cfg){
    app.biz.rpcMonitor.RpcMonitorPanel.superclass.constructor.apply(this,[cfg])
}

Ext.extend(app.biz.rpcMonitor.RpcMonitorPanel, app.desktop.Module,{

	
	 initPanel:function(){
		 if(!this.url){
		    var path = window.location.href
            path = path.substring(0,path.lastIndexOf('/')+1)
			this.url = path.replace("ssdev-app","SSDevRpcMonitor")+"client/index.html"
		 }
		 this.url = "http://localhost:8081/SSDevRpcMonitor/client/index.html"
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

