$import("util.rmi.miniJsonRequestSync")

var argStr = window.location.search.substring(1);
var args = argStr.split('&');
var parameters = {};
for (var i = 0; i < args.length; i++) {
	var arg = args[i];
	var temp = arg.split('=');
	var s = temp[1].charAt(0);
	var end = temp[1].charAt(temp[1].length);
	if (s != "[" && s != "{" && end != "]" && end != "}") {
		parameters[temp[0]] = temp[1];
	} else {
		parameters[temp[0]] = eval(temp[1]);
	}
}
var result = util.rmi.miniJsonRequestSync({
			serviceId : "logon",
			uid : "system",
			psw : "123"
		})

if (result.code > 300) {
	alert("µÇÂ¼Ê§°Ü£¡");
} else {
	var result = util.rmi.miniJsonRequestSync({
				serviceId : parameters.serviceId,
				serviceAction : parameters.serviceAction || null,
				body : parameters
			})

	alert(Ext.encode(result))
}