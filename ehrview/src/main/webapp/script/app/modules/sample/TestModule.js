$package("app.modules.sample")
$import("app.modules.list.SimpleListView")

app.modules.sample.TestModule = function(cfg){
	this.width = 500
	this.height = 600
	this.showButtonOnTop = true
	app.modules.sample.TestModule.superclass.constructor.apply(this,[cfg])
}

Ext.extend(app.modules.sample.TestModule, app.modules.list.SimpleListView,{
	doMappingMeak:function(){
		var body = {};
		body.catalog = "CTDS"
		body.entryName = "JB"
		this.saveToServer(body)
	},
	saveToServer:function(body){
		this.mask("在正保存数据...")
		util.rmi.jsonRequest({
				serviceId:"makeMappingFile",
				catalog:body.catalog,
				entryName:body.entryName
			},
			function(code,msg,json){
				this.unmask()
				if(code < 300){
					this.fireEvent("saveToServer",json)
					alert(msg)
				}
				else{
					this.processReturnMsg(code,msg,this.saveToServer)
				}
				
			},
			this)
	},	
	doPrint:function(){
		var exSelect = this.midiModules["exSelect"]
		if(!exSelect){
			className = "app.modules.list.SelectListView"
			$require(className,[function(){
				var cfg = {}
				cfg.title = "选择"
				cfg.mutiSelect = false
				cfg.entryName = "Ehrbaseinfo"
				cfg.autoInit = false
				exSelect = eval("(new " +  className + "(cfg))")
				exSelect.opener = this
				exSelect.on("select",this.onExSelected,this)
				exSelect.init()
				var win = exSelect.getWin()
				win.setPosition(200,50)
				win.show()
				this.midiModules["exSelect"] = exSelect;
				
			},this])
		}
		else{
			exSelect.refresh()
			var win = exSelect.getWin()
			win.setPosition(200,50)
			win.show()
		}		
	},
	onExSelected:function(r){
		alert(Ext.encode(r[0].data))
	}
})