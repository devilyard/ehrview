$package("util.rmi")

if(typeof Ext == "undefined"){
	$import("org.ext.JSON")
}

util.rmi.miniRequestAsync = function(url,callback,scope){
	var con = ClassLoader.createNewTransport.apply()
	try{
		con.open("GET", url, true);
		con.onreadystatechange = complete;
		con.setRequestHeader('encoding','utf-8');
		con.setRequestHeader("content-Type",'application/json');
		con.send("");
	}
	catch(e){
		if(typeof callback == "function"){
			var ctx = typeof scope == "object" ? scope : this
			callback.call(ctx,500,"ConnectionError",null,con)
		}
	}
	function complete(){
		var readyState = con.readyState
		if(readyState == 4){
			var json = {}
			var code = 400
			var msg = ""			
			con.onreadystatechange = ClassLoader.emptyFunction
			var status = con.status
				if(status == 200){
					try{
						json = eval("(" + con.responseText + ")")
						code = json["x-response-code"]
						msg = json["x-response-msg"]
					}
					catch(e){
						code = 500
						msg = "ParseResponseError"
					}				
				
				}
				if(typeof callback == "function"){
					var ctx = typeof scope == "object" ? scope : this
					callback.call(ctx,code,msg,json,con)
				}				
		}

	}//complete
}