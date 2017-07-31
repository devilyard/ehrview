$import(
	"util.rmi.miniJsonRequestSync"
)

util.rmi.miniJsonRequestSync({
	serviceId:"logon",
	uid:"system",
	rid:"system",
	psw:"123"
})
document.write("loading...")
var searchContent = location.search;
/* for example
	http://localhost:8080/ssdev-app/s.jshtml?serviceId=logon&uid=wuk&pwd=123
 	即执行serviceId为logon的service，且传入参数uid和pwd分别为wuk和123
*/

if(searchContent){
	var params = searchContent.substring(1).split("&");
	var cfg = {};
	for(var i=0;i<params.length;i++){
		var p = params[i].split("=");
		cfg[p[0]] = p[1];
	}
	var result = util.rmi.miniJsonRequestSync(cfg);
	document.write(Ext.encode(result))
}