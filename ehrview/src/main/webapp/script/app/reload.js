$import("util.rmi.miniJsonRequestSync")


var result = util.rmi.miniJsonRequestSync({
	serviceId:"logon",
	uid:"system",
	psw:"123"
})

var result = util.rmi.miniJsonRequestSync({
	serviceId:"reloadContext"
})
if(result.code == 200){
//	window.location.href = "index.html"
	document.write("<p>reload success!</p> " +
			"reload again:<button onclick='window.location.reload();'}>reload</button><br>"+
			"or goto index <a href='index.html'>index</a>");
}