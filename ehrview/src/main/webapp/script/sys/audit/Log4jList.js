$package("sys.audit")
$import("app.desktop.Module","util.dictionary.TreeDicFactory","sys.audit.Log4jMessage")

sys.audit.Log4jList = function(cfg) {
	this.width = 720
	this.height = 450
	this.title = "日志类别"
	this.gridCls = "sys.audit.Log4jMessage"
	sys.audit.Log4jList.superclass.constructor.apply(this, [cfg])

}

Ext.extend(sys.audit.Log4jList, app.desktop.Module, {
	
	initPanel : function() {
		var grid = this.getMessageList();
		if (!grid) {
			return
		}
		var tree = util.dictionary.TreeDicFactory.createTree({id:this.dicId})
		tree.autoScroll = true
		tree.on("click",this.onTreeClick,this)
		var actions = this.actions	
		tree.expandAll()
		this.tree = tree
		
		 var panel = new Ext.Panel({
		    height : this.height,
			layout : "border",
			items:[
			   { layout:'fit',
			     title : this.title,
			     region:'west',
			     split:true,
		    	 collapsible:true,
			     width : 180,
			     items:[tree]
			   },{ 
			     layout:'fit',
			     region:'center',
			     //frame : true,
			     items:[grid]
			   }
			]
		})
		this.panel = panel	
		return this.panel	
	},
	onTreeClick:function(node,e){
		var id = node.id
		this.initGrid(id)
		this.typeId=id
	},
	getMessageList:function(){
		var cls = this.gridCls
		var cfg = {}		
		cfg.entryName = this.entryName
		cfg.autoLoadSchema = false
		cfg.autoLoadData = false;
		cfg.showButtonOnTop = true
		cfg.isCombined = true
		cfg.actions = this.actions
		var lp = this.midiModules["log"]
		if (!lp) {
			$import(cls)
			var module = eval("new " + cls + "(cfg)");
			module.setMainApp(this.mainApp)
			module.opener = this
			this.gridModule = module
			lp = module.initPanel()			
		}
		this.grid = lp
		return this.grid;
	},
	initGrid:function(id){
		if(this.gridModule){
			if(id==0){
				delete this.gridModule.requestData.cnd;
			    this.gridModule.refresh()
			}
			if(id==1){
				this.gridModule.requestData.cnd = ['eq',['$','Type'],['s','1']]
			    this.gridModule.refresh()
			}
			if(id==2){
				this.gridModule.requestData.cnd = ['eq',['$','Type'],['s','2']]
				//this.gridModule.requestData.cnd =['and',['gt',['$','date'],['date','2012-07-25 15:00:56']],['lt',['$','date'],['date','2012-07-25 15:05:56']]]
				this.gridModule.refresh()
			}
			this.gridModule.typeId=id
		}
		
	}
})