$import(
	"org.ext.ext-base",
	"org.ext.ext-all",
	"org.ext.ext-patch",
	"org.ext.ext-lang-zh_CN",
	"util.rmi.miniJsonRequestAsync",
	"org.ext.ux.layout.TableFormLayout"
)
$styleSheet("ext.ext-all")
$styleSheet("ext.ext-patch")
//$styleSheet("ext.xtheme-access")
Ext.BLANK_IMAGE_URL = ClassLoader.appRootOffsetPath +"resources/s.gif"
var __docRdy = false
Ext.onReady(function(){
	if(__docRdy){
		return
	}
	__docRdy = true

	var f1 = new Ext.form.NumberField({
		fieldLabel:"numfield"
	})
	
	var f2 = new Ext.form.TextField({
		fieldLabel:"textField"
	})
	
	var f3 = new Ext.form.DateField({
		fieldLabel:"dateField"
	})
	
	//var cf = new Ext.form.CompositeField({
	//	fieldLabel:"CompField",
		//align:"stretch",
	//	items:[f1,f3,f2]
	//})
	
	var fsCfg1 = {
		title:"基本信息",
		collapsible: true,
		layout:"tableform",
		layoutConfig:{
				columns:5
		},
		defaults: {
            anchor: '-20' // leave room for error icon
        }
	}	
	var colspans = [3,2,1,1,1,1,1,1,1,1,1,1,1,1,1]
	fsCfg1.items = genFields(colspans)
	var fs1 = new Ext.form.FieldSet(fsCfg1)
	
	var fsCfg2 = {
		title:"扩展信息",
		//collapsible: true,
		layout:"tableform",
		layoutConfig:{
				columns:5
		},
		defaults: {
            anchor: '-20' // leave room for error icon
        }
	}	
	var colspans = [1,1,1,1,1,3,2,1,1,1,1,1,1,1,1]
	fsCfg2.items = genFields(colspans)
	var fs2 = new Ext.form.FieldSet(fsCfg2)
	
	
	var form = new Ext.form.FormPanel({
		labelWidth:50,
		items:[fs1,fs2],
		border:false,
		frame:true
	})
	
	/*
	util.rmi.miniJsonRequestAsync({
		serviceId:"renderService",
		msg:"中华人民共和国"
	},
	function(code,msg,json){
		alert(code + "," + msg)
		alert(Ext.encode(json));
	})*/
	var win = new Ext.Window({
		width:800,
		shadow:false,
		border:false,
		autoScroll:true,
		title:"测试",
		items:form
	})
	win.render(document.body);
	win.show()
})


function genFields(colspans){
	var size = colspans.length
	var items = []
	for(var i = 0; i < size; i ++){
		var f = {fieldLabel:"测试" + i,xtype:"textfield"}
		var cs = colspans[i]
		f.colspan = cs
		f.anchor = "100%"
		items.push(f)
	}
	return items
}
