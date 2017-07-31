$styleSheet("ext.ext-all")
$styleSheet("ext.xtheme-gray")
$styleSheet("ext.ext-patch")
$styleSheet("app.desktop.Desktop")
$styleSheet("app.desktop.TaskBar")
$styleSheet("app.desktop.Logon")
//$styleSheet("app.desktop.styel")
$styleSheet("app.desktop.main")

$import(
	"org.ext.ext-base",
	"org.ext.ext-all-debug",
	"org.ext.ext-lang-zh_CN"
);

Ext.BLANK_IMAGE_URL = ClassLoader.appRootOffsetPath +"resources/s.gif"

//fix IE bug for onReady execute twice
__docRdy = false

Ext.onReady(function(){
	if(__docRdy){
		return
	}
	__docRdy = true
	
	var msgs = ["初始化","已连接","读取数据","完成","打开窗口","载入失败"]

	$require([
			"app.desktop.Module",
			"app.desktop.TaskManager",
			"app.viewport.Logon",
			"app.desktop.plugins.LogonWin"
			],
			function(){
				var logon = new app.viewport.Logon({forConfig:true})	
				logon.on("logonSuccess",function(res){
					var body = Ext.get(document.body)
	                body.update("")
					var apps = res.body
					if(res.layoutCss){
						$styleSheet(res.layoutCss)
					}
					if(apps){
						var appModules = []
						var appMenuItems = []
						var size = apps.length
						var myPage = []
						for(var i = 0; i < size; i ++){
							var ap = apps[i]
							if(!ap){
								continue;
							}
							if(ap.type=="index"){
								myPage.push(ap)
							}
							var modules = ap.modules
							if(!modules){
								continue;
							}
							for(var j = 0; j < modules.length; j ++){
								var module = modules[j]
								if(typeof module != "object"){
									continue;
								}
								module.type = "USER"
								appModules.push(module)
								appMenuItems.push({id:module.id,title:module.title,text:module.title,icon:module.icon})
							}
						}
						var mainCfg = {
							title:res.title,
							uid:res.userId,
							userPic: res.img,
							uname:res.userName,
							dept:res.dept,
							deptId:res.deptId,
							jobtitle:res.jobtitle,
							jobId:res.jobId,
							regionCode : res.regionCode,
							regionText : res.regionText,
							mapSign:res.mapSign,
							catalog:res.catalog,
							apps:apps,
							modules:appModules,
							myPage:myPage,
							serverDate:res.serverDate,
							sessionId:res.sessionId,
							moduleId:res.moduleId
						}
						eval("globalDomain=res.domain")
						document.title = res.title
						var systemModules = [
								{id:"Z0101",type:"SYSTEM",title:"载入状态通知",script:"app.desktop.plugins.LoadStateMessenager",autoRun:true},
								{id:"Z0104",type:"SYSTEM",title:"任务管理器",winState:{pos:[500,100],height:300,width:700},script:"app.desktop.plugins.TaskManagerWindow"},
								{id:"Z0105",type:"SYSTEM",title:"桌面图标",script:"app.desktop.plugins.DesktopIconView",autoRun:true},
								{id:"z0102",type:"SYSTEM",title:"调试控制台",script:"app.desktop.plugins.DebugConsole"},
								{id:"Z0106",type:"SYSTEM",title:"锁定",script:"app.desktop.plugins.Logon"},
								{id:"z0103",type:"SYSTEM",title:"开始菜单",script:"app.desktop.TaskBar",autoRun:true}
							]
						if(res.layout == "desktop"){
							$import(
								"app.desktop.Desktop",
								"app.desktop.App"
							)
							var startMenu = {
								items:[],
					            title: 'Sean220',
					            iconCls: 'user',
					            toolItems: [{
					            	id:'Z0106',
					                text:'锁定',
					                iconCls:'settings',
					                scope:this
					            },'-',{
					                text:'注销',
					                iconCls:'logout',
					                scope:this
					            },'-',{
					            	id:"Z0104",
					            	text:'任务管理器',
					            	iconCls:'settings',
					            	scope:this
					            },'-',{
					            	id:"z0102",
					            	text:'调试控制台',
					            	iconCls:'settings',
					            	scope:this
					            }
					           ]};
					           	startMenu.title = res.userName
								startMenu.items = appMenuItems;				           	
								appModules = systemModules.concat(appModules)
								mainCfg.menu = startMenu
								mainCfg.modules = appModules
								mainCfg.shortcuts = appMenuItems
								mainApp = new app.desktop.App(mainCfg)	//不用var为全局变量
							}
							else{
								$import(
									//"app.viewport.Desktop",
								    "app.viewport.MyDesktop",
									"app.viewport.App"
								)
								mainApp = new app.viewport.App(mainCfg)
							}
						}
				})
			}
	)//require
	
})