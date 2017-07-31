$import("org.ext.ext-base", 
		"org.ext.ext-all", 
		"org.ext.ext-patch",
		"org.ext.ext-lang-zh_CN",
		"app.desktop.Module",
		"app.desktop.TaskManager", 
		"app.desktop.plugins.Logon",
		"app.viewport.Desktop", 
		"app.viewport.App"
);

$styleSheet("ext.ext-all")
$styleSheet("ext.ext-patch")
$styleSheet("app.desktop.Desktop")

Ext.BLANK_IMAGE_URL = ClassLoader.appRootOffsetPath + "resources/s.gif"

var __docRdy = false
Ext.onReady(function() {
	if (__docRdy) {
		return
	}
	__docRdy = true
	
	$import("util.rmi.miniJsonRequestSync")
	util.rmi.miniJsonRequestSync({
		serviceId:"logon",
		uid:"system",
		psw:"123"
	})
	
	var cfg = {
		entryName:"SYS_ServiceInfo",
		disablePagingTbr:true,
		listServiceId:"serviceInfoHandler"
	}
	$import("app.modules.list.SimpleListView")
	var m = new app.modules.list.SimpleListView(cfg)
	olw = m.getWin()
	olw.on("show",function(){
		m.refresh()
	},this)
	olw.show()
	olw.maximize()
//	olw.center()
	/*
	var w = new Ext.Window({
		title:"aa",
		height:300,
		width:500,
		items:[u3]
	})
	w.show()
	w.getEl().slideIn('b')
	*/
	
	
})
