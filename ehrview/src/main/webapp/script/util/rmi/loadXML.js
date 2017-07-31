$package("util.rmi")

if(typeof Ext == "undefined"){
	$import("org.ext2.JSON")
}

util.rmi.loadXML = function(jsonData){
	var con = ClassLoader.createNewTransport.apply()
	var temp = new Date().getTime();
	
	var url = jsonData.url
	try{
		con.open(jsonData.httpMethod || "POST", url + "?temp=" + temp, false)
		con.setRequestHeader('encoding','utf-8');
		con.setRequestHeader("content-Type",'application/json');
		con.send("")
	}
	catch(e){
		return {code:500,msg:"ConnectionError"}
	}
	
	var xmlData = ""
	var code = 400
	var msg = ""
	if(con.readyState == 4){			
		var status = con.status
			if(status == 200){
				xmlData =  con.responseText
			}
	}
	return xmlData;
}