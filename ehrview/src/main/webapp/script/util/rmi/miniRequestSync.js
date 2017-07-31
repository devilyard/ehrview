$package("util.rmi")

if(typeof Ext == "undefined"){
	$import("org.ext.JSON")
}

util.rmi.miniRequestSync = function(url){
	var con = ClassLoader.createNewTransport.apply()
	try{
		con.open("GET", url, false);
		con.setRequestHeader('encoding','utf-8');
		con.setRequestHeader("content-Type",'application/json');
		con.send("");
	}
	catch(e){
		return {code:500,msg:"ConnectionError"}
	}
	var json = {};
	var code = 400;
	var msg = "";
	if(con.readyState == 4){			
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
	}
	return {code:code,msg:msg,json:json}
}