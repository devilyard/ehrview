$package("util.rmi")


if(typeof Ext == "undefined"){
	$import("org.ext2.JSON")
}

util.rmi.loadXMLAsync = function(jsonData,callback,scope){
	var con = ClassLoader.createNewTransport.apply()
	var temp = new Date().getTime();
	var url = jsonData.url
	try{
		con.open(jsonData.httpMethod || "POST", url + "?temp=" + temp, true)
		con.onreadystatechange = complete
		con.setRequestHeader('encoding','utf-8');
		con.setRequestHeader("content-Type",'application/json');
		con.send(Ext.encode(jsonData))
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
			var xmlData = ""
			var code = 400
			var msg = ""			
			con.onreadystatechange = ClassLoader.emptyFunction
			var status = con.status
				if(status == 200){
					try{
						code = 200
						msg = "Success"
						xmlData = con.responseText
					}
					catch(e){
						code = 500
						msg = "ParseResponseError"
					}				
				
				}
				con.abort()
				if(typeof callback == "function"){
					var ctx = typeof scope == "object" ? scope : this
					callback.call(ctx,code,msg,xmlData,con)
				}
				
		}

	}//complete
}