
$package("util.gis")
$import("util.gis.MapUtil")

util.gis.Map = function(id, w, h, c){
	if (!document.getElementById) { return; }
	this.swf = this.getOffsetSwf(id) 
	
	var flashvar=[
		"httpURL="+this.getHttpUrl(),
		"config="+this.getHttpUrl()+"configloader?path=assets/configs/config.xml",
		"path="+this.getOffsetPath("gis/"),
		"isCombined=true",
		"mapId="+id
	];
	
	this.param={
		id:id,
		width:w,
		height:h,
		color:c,
		url:this.swf,
		activeurl:this.getOffsetPath("swflash.cab"),
		flashvar:flashvar
	}
}

util.gis.Map.prototype = {
	getOffsetSwf:function(name){ 
		var catalog = 'gis'
		var offsetPath = ClassLoader.appRootOffsetPath
		
		if(name.indexOf('-')>-1){
			name=name.split("-")[0];
		}
		
		if(name.indexOf('.') > -1){
			name = name.split(".")
			catalog = name[0]
			name = name[1]
		}
		
		return offsetPath + "component/" + catalog +  "/" + name + ".swf";
	},
	
	getOffsetPath:function(name){ 
		var offsetPath = ClassLoader.appRootOffsetPath
		return offsetPath + "component/" + name;
	},
	
	getHttpUrl:function(){
		var domain=window.location.href.split("/")[2];
		var serverName=window.location.href.split("/")[3];
		return "http://"+domain+"/"+serverName+"/";
	},
	
	getDomainUrl:function(){
		var domain=window.location.href.split("/")[2];
		if(domain.indexOf(':')>-1){
			domain=domain.split(":")[0]
		}
		if(domain.split(".")[0]=="21"){
			return "http://21.15.245.10:8399/"
		}else if(domain.split(".")[1]=="168"){
			return "http://192.168.10.49:8399/"
		}else{
			return "http://192.26.25.6:8399/"
		}
		//return "http://"+domain+":8399/";
	},

	getSWFHTML: function() {
		var swfNode = "";
		swfNode=util.gis.MapUtil.getMapHtml(this.param);
		return swfNode;
	},
	
	render: function(elementId){
		var n = (typeof elementId == 'string') ? document.getElementById(elementId) : elementId;
		n.innerHTML = this.getSWFHTML();
		return true;		
	},
	
	on:function(evt,callback,scope){
		if(typeof callback != "function"){
			return;
		}
		var mapId = this.param["id"];
		if(this.un(evt,mapId,callback,scope)){}
		var ob = util.gis.Map.observers;
		var list = ob[evt]
		if(list){
			list.push({callback:callback,scope:scope,mapId:mapId})
		}

		
	},
	
	un:function(evt,callback,scope){
		var ob = util.gis.Map.observers;
		var list = ob[evt]
		var mapId = this.param["id"];
		if(list){
			for(var i = 0;i < list.length; i ++){
				var ev = list[i]
				if(ev.callback == callback && ev.scope == scope && ev.mapId == mapId){
					list.splice(i,1)
					return true
				}
			}
		}	
		return false
	}
}

util.gis.Map.observers = {
	"render":[],
	"click":[],
	"logon":[]
}


MAP_fireEvent = function(evt){
	var ob = util.gis.Map.observers;
	var list = ob[evt]
	if(list){
		for(var i = 0;i < list.length; i ++){
			var ev = list[i]
			var mapId=Array.prototype.slice.call(arguments, 1)
			var map = util.gis.MapUtil.getMapObject(mapId[0])
			if(ev.mapId == mapId[0]){
				var args = Array.prototype.slice.call(arguments, 2,3)
				ev.callback.apply(typeof ev.scope == "object" ? ev.scope : map,args)
			}
		}
	}	
}
	
Map_Rendered =function(DOMId){
	MAP_fireEvent("render",DOMId)
}

Map_Click = function(DOMId){
	var args = ["click"]
	args = args.concat(Array.prototype.slice.call(arguments, 0))
	MAP_fireEvent.apply(this,args)
}

Map_Logon = function(DOMId){
	MAP_fireEvent("logon",DOMId)
}

//window.onerror = function(e) { alert(e); }
