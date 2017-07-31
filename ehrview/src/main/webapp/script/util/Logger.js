$package("util")

util.LoggerFactory = function(){
	var messageListener = {}
	this.count = 0
	this.max   = 1000
	this.cache = []
	this.dateformat = 
	
	this.onMessage = function(func,scope){
		if(typeof func == "function")
			messageListener = {func:func,scope:scope || null}
	}
	
	this.removeListener = function(){
		messageListener = {}
	}
	
	this.createLogger = function(src){
		var logger = new util.Logger(src)
		logger.on("all",onRecv,this)
		return logger
	}
	
	this.find = function(id){
		for(var i = 0 ; i < this.cache.length; i ++){
			var item = this.cache[i] 
			if(item.id == id){
				return item 
			}		
		}
		return null
	}
	
	function onRecv(e,dt,src,msg){
		var cache = this.cache
		if(cache.length == this.max){
			cache.splice(0,1)
		}
		var item = {id: ++ this.count,type:e,dt:dt,src:src,msg:msg}
		cache.push(item)
		
		if(messageListener.func){
			var scope = messageListener.scope || this
			messageListener.func.apply(scope,[item])
		}
	}
}


util.Logger = function(src){
	var src = src || ""
	var listeners = {}
	
	this.on = function(e,func,scope){
		if(typeof func == "function"){
			var ls = listeners[e]
			if(!ls){
				ls = [];
				listeners[e] = ls
			}
			ls.push({func:func,scope:scope || null})
		}
	}
	
	this.un = function(e,func){
		var ls = listeners[e]
		if(ls){
			for(var i = 1; i < ls.length; i ++){
				if(func == ls[i].func){
					ls.splice(i,1)
				}
			}
		}
	}
	
	this.debug = function(msg){
		fire("debug",msg)
	}
	
	this.fatal = function(msg){
		fire("fatal",msg)
	}
	
	this.info = function(msg){
		fire("info",msg)
	}
	
	this.error = function(msg){
		fire("error",msg)
	}
	
	function fire(e,msg){
		var ls = (listeners[e] || []).concat((listeners["all"] || []))
		if(ls){
			var dt = new Date().format(util.Logger.dateformat)
			for(var i = 0; i < ls.length; i ++){
				var func = ls[i].func
				var scope = ls[i].scope || this
				func.apply(scope,[e.toUpperCase(),dt,src,msg])
				//setTimeout(function(){func.apply(scope,[e.toUpperCase(),dt,src,msg])},10)
			}
		}
	}
	
	function callback(ls,e,msg){

	}
}
util.Logger.dateformat = "P l Y-m-d H:i:s u"