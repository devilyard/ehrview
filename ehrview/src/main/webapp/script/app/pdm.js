$import("util.rmi.miniJsonRequestSync")


var result = util.rmi.miniJsonRequestSync({
	serviceId:"logon",
	uid:"system",
	psw:"123"
})

//var result = util.rmi.miniJsonRequestSync({
//	serviceId:"testEventService"
//})
var result = util.rmi.miniJsonRequestSync({
	serviceId:"pdm2schema"
})
//alert(Ext.encode(result))