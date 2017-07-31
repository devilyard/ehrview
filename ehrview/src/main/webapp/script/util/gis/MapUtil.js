 $package("util.gis")
 
 
 util.gis.MapUtil={}
 
 util.gis.MapUtil.getMapHtml=function(param){
 		var width=param.width || '100%'
 		var height=param.height || '100%'
 		var color=param.color || '#fff'
 		var domainURL=param.domainURL;
 		var httpURL=param.httpURL;
 		var flashVars=param.flashvar.join("&");
 	    var model={
			tag:'object',
			id:param.id,
			name:param.id,
			classid:'clsid:D27CDB6E-AE6D-11cf-96B8-444553540000',
			width:width,
			height:height,
			codebase:param.activeurl || "http://fpdownload.macromedia.com/get/flashplayer/current/swflash.cab",
			children:[{tag:'param',name:'movie',value:param.url},
					 {tag:'param',name:'quality',value:'high'},
					 {tag:'param',name:'bgcolor',value:color},
					 {tag:'param',name:'wmode',value:'Opaque'},
					 {tag:'param',name:'allowFullScreen',value:'true'},
					 {tag:'param',name:'allowScriptAccess',value:'always'},
					 {tag:'param',name:'FlashVars',value:flashVars},
					 {tag:'embed',
					  id:param.id,
					  src:param.url,
					  quality:'high',
					  bgcolor:color,
					  width:width,
					  height:height,
					  allowFullScreen:true,
					  align:'middle',
					  wmode:'Opaque',
					  play:'true',
					  loop:'false',
					  FlashVars:flashVars,
					  allowScriptAccess:'always',
					  type:'application/x-shockwave-flash',
					  pluginspage:'http://www.adobe.com/go/getflashplayer'
					 }
			]
		}
 	   return Ext.DomHelper.markup(model)
 }
 
 
 
 util.gis.MapUtil.getMapObject = function(id) {
	if (navigator.appName.indexOf("Microsoft Internet") == -1) {
		if (document.embeds && document.embeds[id])
			return document.embeds[id];
	} else {
		return document.getElementById(id);
	}
 }
	   		
