$package("util.rmi")

if(typeof Ext == "undefined"){
	$import("org.ext2.JSON")
}

util.rmi.loadJson = function(jsonFile){
	var con = ClassLoader.createNewTransport.apply()
	var temp = new Date().getTime();
	
	var url = jsonFile + ".js"
	try{
		con.open("GET", url + "?temp=" + temp, false)
		con.setRequestHeader('encoding','utf-8');
		con.setRequestHeader("content-Type",'application/json');
		con.send("")
	}
	catch(e){
		return {code:500,msg:"ConnectionError"}
	}
	
	var json = {}
	var code = 400
	var msg = ""
	if(con.readyState == 4){			
		var status = con.status
			if(status == 200){
				json = eval("(" + con.responseText + ")")
			}
	}
	return json;
}