$package("app.modules.combined")
$import(
	"app.desktop.Module",
	"util.rmi.miniJsonRequestSync"
)

app.modules.combined.TabModule = function(cfg){
	this.width = 1100
	this.height = 600
	this.showButtonOnTop = true
	app.modules.combined.TabModule.superclass.constructor.apply(this,[cfg])
}

Ext.extend(app.modules.combined.TabModule,app.desktop.Module,{
	initPanel:function(){
		if(this.tab){
			return this.tab;
		}
		var tabItems = []
		var actions = this.actions
		for(var i = 0; i < actions.length; i ++){
			var ac = actions[i];
			tabItems.push({
				layout:"fit",
				title:ac.title,
				exCfg:ac,
				id:ac.id
			})
		}
		var tab = new Ext.TabPanel({
			title:" ",
			border:false,
			width:this.width,
            activeTab:0,
            frame:true,
    		autoHeight:true,
            defaults:{border:false,autoHeight:true,autoWidth:true},
            items:tabItems
		})
		tab.on("tabchange",this.onTabChange,this);
		tab.activate(this.activateId)
		this.tab = tab
		return tab;
	},
	onTabChange:function(tabPanel,newTab,curTab){
		if(newTab.__inited){
			return;
		}
		var exCfg = newTab.exCfg
		var cfg = {
			showButtonOnTop:true,
			autoLoadSchema:false,
			isCombined:true
		}
		Ext.apply(cfg,exCfg);
		var ref = exCfg.ref
		if(ref){
			var result = util.rmi.miniJsonRequestSync({
				serviceId:"moduleConfigLocator",
				id:ref
			})
			if(result.code == 200){
				Ext.apply(cfg,result.json.body)
			}
		}
		var cls = cfg.script
		if(!cls){
			return;
		}
		
		if(!this.fireEvent("beforeload",cfg)){
			return;
		}
		$require(cls,[function(){
			var m = eval("new " + cls + "(cfg)")
			this.midiModules[newTab.id] = m;
			var p = m.initPanel();
			m.on("save",this.onSuperFormRefresh,this)
			newTab.add(p);
			newTab.__inited = true
			//this.tab.doLayout()
		},this])
		
	},
	getWin:function(){
		var win = this.win
		if(!win){
			win = new Ext.Window({
				id:this.id,
		        title: this.title,
		        width: this.width,
		        autoHeight:true,
		        iconCls: 'icon-form',
		        closeAction:'hide',
		        shim:true,
		        layout:"fit",
		        plain:true,
		        minimizable: true,
		        maximizable: true,
		        shadow:false,
		        buttonAlign:'center',
		        items:this.initPanel()
            })
		    win.on("show",function(){
		    	this.fireEvent("winShow")
		    },this)
		    win.on("close",function(){
				this.fireEvent("close",this)
			},this)
		    win.on("hide",function(){
				this.fireEvent("close",this)
			},this)			
		    var renderToEl = this.getRenderToEl()
            if(renderToEl){
            	win.render(renderToEl)
            }
			this.win = win
		}
		return win;		
	}
})
