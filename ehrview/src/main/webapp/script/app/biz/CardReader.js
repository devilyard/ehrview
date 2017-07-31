$package("app.biz")


app.biz.CardReader = {
	
	init:function(){
		if(!Ext.get('ICCInterCtl')){
			var codebase = ClassLoader.appRootOffsetPath + "inc/component/LB.CAB";
			var html = '<OBJECT id="ICCInterCtl"  align="CENTER" WIDTH="0" HEIGHT="0" codeBase="' + codebase + '#version=1,0,0,0" classid="CLSID:CBA5D514-3544-4E87-80D2-F1582FA87841"></OBJECT>'
			var el = Ext.DomHelper.insertHtml('beforeEnd',document.body,html)
		}
		if(!app.biz.CardReader.agent){
			try{
				//var agent =  new ActiveXObject("ICCINTERACTIVEXLib.ICCInterCtl")
//				alert("init")
				app.biz.CardReader.agent = Ext.getDom('ICCInterCtl')
				//app.biz.CardReader.agent = ICCInterCtl
			}
			catch(e){
				alert("读卡器控件初始化失败:" + e)
			}
		}
	},
	wrapMessage:function(ret,str){
		var n = str.length
		var fields = app.biz.CardReader.fields
		var p = n;
		fields[7].end = p
		p = p - 6
		fields[7].start = p
		
		fields[6].end = p
		p = p - 10
		fields[6].start = p
		
		fields[5].end = p
		p = p - 1
		fields[5].start = p
		
		fields[4].end = p
		
		
		for(var i = 0; i < fields.length; i ++){
			var f = fields[i]
			ret[f.id] = str.substring(f.start,f.end)
		}
		ret.name = ret.name.trim()
		
	}
}

if(Ext.isIE){
	app.biz.CardReader.readCardInfo = function(){
		var agent = app.biz.CardReader.agent
		var ret = {
			code:0
		}
		if(!agent){
			ret.code = -99
			ret.msg = "控件未初始化"
			return ret
		}
		var status = 0;
		try{

			var str = agent.ReadCard()
			this.wrapMessage(ret,str)
			return ret;
		}
		catch(e){
			ret.code = -98
			ret.msg = "读卡发生异常"
			return ret
		}
		
	}
}
else{
	
	app.biz.CardReader.readCardInfo = function(){
		try{
			netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
		}
		catch(e){
			alert("请更改火狐浏览器设置,在地址栏里输入 about:config 回车，\r\n找到 signed.applets.codebase_principal_support 项，双击更改设置为 ture,再重试")
		}
		var ret = {
			code:0
		}
		var mycom = null;
		try {
			mycom = Components.classes["@bsoft.com/XPCOM/ICCInter;1"].createInstance();
		}
		catch (e) {
		  ret.code = -99
		  ret.msg = "控件未初始化:" + e
		  window.open("iccinter.xpi")	
		  return ret;
		}
		try{
			var agent = mycom.QueryInterface(Components.interfaces.ICCInter_XPCom);
			var str = agent.readCard();
			this.wrapMessage(ret,str)
			return ret
		}
		catch (e) {
		  ret.code = -99
		  ret.msg = "控件错误:" + e
		  return ret;
		}
	}
}

app.biz.CardReader.statusText = {
	0:"正常",
	1:"卡片类型不正确",
	2:"卡尚未插入",
	3:"卡尚未取出",
	4:"卡片无应答",
	5:"接口设备故障",
	6:"不支持该命令",
	7:"命令长度错误",
	8:"命令参数错误",
	9:"访问权限不满足",
	10:"信息校验和出错",
	11:"密码键盘获取密码错误"
}
app.biz.CardReader.fields = [
	{id:"cardIdt",start:0,end:32},
	{id:"cardId",start:32,end:41},
	{id:"cityCode",start:41,end:47},
	{id:"sId",start:47,end:65},
	{id:"name",start:65,end:93},
	{id:"sex",start:93,end:94},
	{id:"birth",start:94,end:104},
	{id:"maCode",start:104,end:110}
]