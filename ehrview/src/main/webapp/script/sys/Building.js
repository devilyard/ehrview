$package("sys")

$import("app.desktop.Module","util.CSSHelper")

sys.Building = function(cfg){
	this.width = 500;
	this.height = 260;
	sys.Building.superclass.constructor.apply(this, [cfg])
}

Ext.extend(sys.Building, app.desktop.Module,{
	initPanel:function(){
		var cssSelector = ".app-building"
//		if(!util.CSSHelper.hasRule(cssSelector)){
//			var home = ClassLoader.stylesheetHome 
//			util.CSSHelper.createRule(cssSelector,"width:320px;height:320px;background:transparent url(" + home + "sys/building.gif) no-repeat !important;float:left")
//		}
		var text = "<div class='app-building'></div><div style='padding-top:1px'><h1>该模块未上线..</h1></div>";
//		var text = "<div class='app-building'></div><div style='padding-top:120px'><h1>正在建设中..</h1></div>";
		var cfg = {
			width:this.width,
			height:this.height,
			html:text
		}
		var panel = new Ext.Panel(cfg);
		return panel;
	}
})