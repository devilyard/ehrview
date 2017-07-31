$package( "app.biz.ehrview" )

$import( "app.desktop.Module" )

app.biz.ehrview.RuleConfig = function ( cfg ) {
	app.biz.ehrview.RuleConfig.superclass.constructor.apply( this, [ cfg ] )
}

Ext.extend( app.biz.ehrview.RuleConfig, app.desktop.Module, {
	initPanel: function ( ) {

		var url = "pages/ruleConfig.html";
		var exploreType = this.getExploreType();
		if(exploreType.ie) {//IE 
			feature = "dialogHeight:" + window.screen.height + "px;dialogWidth:" + window.screen.width + "px;status:no;help:no";
			window.showModalDialog( url, null, feature );
		} else if (exploreType.firefox){
			feature = "fullscreen=1,menubar=no,toolbar=no,location=no,";
			feature += "scrollbars=yes,status=no,modal=yes";
			window.open( url, null, feature );
		} else {
			feature = "menubar=no,toolbar=no,location=no,";
			var heightL= window.screen.height-110
			var widthL= window.screen.width-10;
			feature += "width=" + widthL + ",height=" + heightL + ",";
			feature += "scrollbars=yes,status=no,modal=yes";
			window.open( url, null, feature );
		}
	},
	
	refresh: function ( ) {},
	
	getExploreType: function() {
		var sys = {};
		var ua = navigator.userAgent.toLowerCase();
		var s;
		(s = ua.match(/msie ([\d.]+)/)) ? sys.ie = s[1] :
			(s = ua.match(/firefox\/([\d.]+)/)) ? sys.firefox = s[1] :
				(s = ua.match(/chrome\/([\d.]+)/)) ? sys.chrome = s[1] :
					(s = ua.match(/opera.([\d.]+)/)) ? sys.opera = s[1] :
						(s = ua.match(/version\/([\d.]+).*safari/)) ? sys.safari = s[1] : 0;
		return sys;
	}
} );