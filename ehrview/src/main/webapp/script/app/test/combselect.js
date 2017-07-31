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
	var createDicField = function(dic) {
			var cls = "util.dictionary.";
			if (!dic.render) {
				cls += "Simple";
			} else {
				cls += dic.render
			}
			cls += "DicFactory"
			$import(cls)
			var factory = eval("(" + cls + ")")
			dic.onlySelectLeaf = dic.onlySelectLeaf || false
			dic.width = dic.width || 320
			var field = factory.createDic(dic)
			field.fieldLabel = dic.alias || "请选择"
			field.name = dic.name
			return field
		}
		var u2 = createDicField({
//			id:"manageUnit2",
			id:"organizationDic",
			alias:"机构"
//			,render:"Tree"
//			，filter:['eq',['s','1'],['s','1']],
//			layerConfig:{
//				layer:1,
//				length:4
//			}
//			lengthLimit:9,
//			querySliceType:0
		})
		u2.on("change",function(){
			alert(11)
		},this)

	var f = new Ext.FormPanel({
		frame:true,
		labelWidth:200,
		items:[
			u2
		],
		tbar:[{text:"getValue",handler:function(){
			alert(u2.getValue())
		}}]
	})
	var w = new Ext.Window({
		title:"TableDic",
		border:false,
		height:220,
		width:560,
		layout:"fit",
		items:f
	})
	w.show()
	w.getEl().slideIn('b')
})
