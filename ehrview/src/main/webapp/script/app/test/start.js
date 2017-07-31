$import(
	"org.ext.ext-base",
	"org.ext.ext-all",
	"org.ext.ext-patch",
	"org.ext.ext-lang-zh_CN",
	"util.rmi.miniJsonRequestAsync",
	"util.CSSHelper"
)
$styleSheet("ext.ext-all")
$styleSheet("ext.ext-patch")
//$styleSheet("app.desktop.Desktop")
Ext.BLANK_IMAGE_URL = ClassLoader.appRootOffsetPath +"resources/s.gif"
var __docRdy = false
Ext.onReady(function(){
	if(__docRdy){
		return
	}
	__docRdy = true
	/*
	 * 
	util.rmi.miniJsonRequestAsync({
		serviceId:"renderService",
		msg:"中华人民共和国"
	},
	function(code,msg,json){
		alert(code + "," + msg)
		alert(Ext.encode(json));
	})*/
	
	
	var p = new Ext.Panel({
		layout:"vbox",
		width:100,
		height:300,
		frame:true,
		layoutConfig:{
			align:'center',
			padding: 5
		},
		defaults:{margins:'0 0 10 0'},
		items:[
			{   iconCls:addIconCls("D01"),
				text:"我的电脑",
				xtype:"button",
				scale:"large",
				align:'center',
				iconAlign: 'top'
				
			},{
				iconCls:addIconCls("D02"),
				text:"网络设置高",
				xtype:"button",
				scale:"large",
				align:'center',
				iconAlign: 'top'
			},{
				iconCls:addIconCls("D03"),
				text:"我的文档",
				xtype:"button",
				scale:"large",
				align:'center',
				iconAlign: 'top'
			}
		]
	})
	var win = new Ext.Window({
		width:500,
		height:300,
		shadow:false,
		title:"测试",
		items:p
	})
	win.render(document.body);
	win.show()
})

function addIconCls(id){
	var cssSelector =  ".x-" + id;
	var home = ClassLoader.stylesheetHome 
	util.CSSHelper.createRule(cssSelector,"background:transparent url(" + home + "app/desktop/images/icons/" + id + ".gif) no-repeat !important;")
	return cssSelector.substring(1);
}

