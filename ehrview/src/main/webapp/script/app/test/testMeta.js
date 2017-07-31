$styleSheet("ext.ext-all")
$styleSheet("ext.ext-patch")
$styleSheet("app.desktop.Desktop")

$import("org.ext.ext-base",
		"org.ext.ext-all",
		"org.ext.ext-patch",
		"org.ext.ext-lang-zh_CN"
)

Ext.BLANK_IMAGE_URL = ClassLoader.appRootOffsetPath +"resources/s.gif"

Ext.onReady(function(){
	$import("util.rmi.miniJsonRequestSync");
	util.rmi.miniJsonRequestSync({
		serviceId : "logon",
		uid : "system",
		psw : "123"
	});
	var cls = "sys.data.element.DataMain"
	$import(cls)
	var cfg = {
		resDataStandard:'V2011'
	};
	var m = eval("new "+cls+"(cfg)");
	var p = m.initPanel();
	var win = new Ext.Window({
		title:"数据元管理",
		layout:"fit",
		items:p,
		height:600,
		width:600*1.618,
		maximizable:true
	});
	win.show();
//	win.maximize();
})