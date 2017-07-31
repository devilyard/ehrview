
$import("org.ext.ext-base",
		"org.ext.ext-all",
		"org.ext.ext-lang-zh_CN",
		"util.rmi.miniJsonRequestSync",
		"util.schema.SchemaLoader",
		"org.ext.ux.layout.TableFormLayout",
		"util.widgets.LookUpField"
);
$styleSheet("ext.ext-all")
$styleSheet("ext.ext-patch")
//$styleSheet("app.desktop.plugins.DesktopIconView")
$styleSheet("app.desktop.Desktop")


__docRdy = false
Ext.onReady(function(){
	if(__docRdy){
		return
	}
	__docRdy = true	

	Ext.BLANK_IMAGE_URL = ClassLoader.appRootOffsetPath +"inc/resources/s.gif"
	
	var table = {
			layout:'tableform',
			layoutConfig:{
				columns:5,
				tableAttrs:{
					//width:800
				}
				//forceWidth:900
			},
			items:[]
		}
	var colspans = [3,2,1,1,1,1,1,1,1,1,1,1,1,1,1]
	var size = 20
	for(var i = 0; i < size; i ++){
		var f = {fieldLabel:"测试" + i,xtype:"textfield"}
		var cs = colspans[i]
		
		
		if(cs > 1){
			f.colspan = cs
			var w = (900 / 5)*cs - 80
			//f.width = 100
			f.anchor = "50%"
			//delete f.width
		}
		else{
			f.anchor = "100%"
			//delete f.width
			//f.width = 120
		}
		
		table.items.push(f)
	}
	var cfg = {
			buttonAlign:'center',
			labelAlign: "left",
			labelWidth:80,
			frame: true,
			autoHeight:true,
			autoWidth:true,
			shadow:false,
			border:false,
			collapsible: false,
			floating:false
		}
	Ext.apply(table,cfg)
	var form = new Ext.FormPanel(table)
	//form.on("afterrender",function(){form.doLayout()})
	//form.render(document.body)
	
	var win  = new Ext.Window({layout:"fit",items:form,width:950,autoHeight:true,shadow:false})
	win.show()
})
