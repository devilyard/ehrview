$package("app.lang")

$import("app.desktop.Module")

app.lang.WinOpener = function(cfg){
	app.lang.WinOpener.superclass.constructor.apply(this,[cfg]);
}

Ext.extend(app.lang.WinOpener, app.desktop.Module, {
	initPanel:function(){
		var url = this.uri;
		var printWin = window.open(
			url,"",
			"height="+(screen.height-100)+", width="+(screen.width-10)+
			", top=0, left=0, toolbar=no, menubar=yes, scrollbars=yes, resizable=yes,location=no, status=no")
	}
})