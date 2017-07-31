$package("util.rmi")

util.rmi.jsonRequest = function(jsonData,callback,scope){
	var con = new Ext.data.Connection();
	var url = ClassLoader.serverAppUrl || ""
	con.request({
		url: url + "*.jsonRequest",
		method:"POST",
		callback:complete,
		scope:this,
		jsonData:jsonData,
		timeout:50000
	})
	function complete(ops,sucess,response){
		var json = {}
		var code = 200
		var msg = ""
		
		if(sucess){
			try{
				json = eval("(" + response.responseText + ")")
				code = json["x-response-code"]
				msg = json["x-response-msg"]
			}
			catch(e){
				code = 500
				msg = "ParseResponseError"
			}
		}
		else{
			code = 400
			msg = "ConnectionError"
		}
		if(typeof callback == "function"){
			var ctx = typeof scope == "object" ? scope : this
			callback.call(ctx,code,msg,json,response)
		}
	}
}