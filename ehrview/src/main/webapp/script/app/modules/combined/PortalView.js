$package("app.modules.combined")
$import(
		"org.ext2.ux.portal.Portal",
		"app.desktop.Module"
);
app.modules.combined.PortalView = function(cfg){
	this.portlets = {}
	this.colCount = 2;
	this.width = 800
	this.height = 600
	app.modules.combined.PortalView.superclass.constructor.apply(this,[cfg])
}
Ext.extend(app.modules.combined.PortalView, app.desktop.Module,{
	initPanel:function(){
		var colCount  = this.colCount;
		var colAnchor = parseFloat(1/colCount).toFixed(2);
		var cols = [];
		for(var i = 0; i < colCount;i ++){
			var column = {
                columnWidth:colAnchor,
                style:'padding:2px 2px 0px 2px',
                items:[]
			}
			cols.push(column)
		}
		
		var actions = this.actions
		var sw = 0;
		var colCount = this.colCount
		for(var i = 0; i < actions.length; i ++){
			var ac = actions[i]
			var portalet = this.createPortalet(ac.name,ac.height)
			portalet.acIndex = i;
			cols[sw].items.push(portalet)
			sw ++;
			if(sw == colCount){
				sw = 0;
			}
		}
		var cfg = {	
			items:cols
		}
		this.panel =  new Ext.ux.Portal(cfg)
		return this.panel;
	},
	createPortalet:function(title,height){
		var portlet = new Ext.ux.Portlet({
			title:title,
			height:height || 240,
		    anchor: '100%',
		    frame:true,
		    border:false,
		    collapsible:true,
		    draggable:true,
		    cls:'x-portlet',
		    layout:"fit",
		    autoScroll:"false",
		    html:""
		})
		portlet.on("afterrender",this.onPortaletRender,this)
		return portlet
	},
	onPortaletRender:function(p){
		if(p.__inited){
			return;
		}
		var ac = this.actions[p.acIndex]
		var ref = ac.ref
		var cfg = {
			showButtonOnTop:true,
			autoLoadSchema:false,
			isCombined:true
		}
		Ext.apply(cfg,ac)
		if(ref){
			var result = util.rmi.miniJsonRequestSync({
				serviceId:"moduleConfigLocator",
				id:ref
			})
			if(result.code == 200){
				Ext.apply(cfg,result.json.body)
			}
		}
		if(!this.fireEvent("beforeload",cfg)){
			return;
		}
		var cls = cfg.script
		if(!cls){
			return;
		}
		$require(cls,[function(){
			var m = eval("new " + cls + "(cfg)")
			this.midiModules[ac.id] = m;
			var item = m.initPanel();
			item.border = false
			item.frame = false
			p.__inited = true
			p.add(item)
			p.doLayout()
		},this])
	},
	getWin:function(){
		var win = this.win
		if(!win){
			var cfg = {
				id: this.id,
		        title: this.title,
		        width: this.width,
		        height: this.height,
		        iconCls: 'bogus',
		        shim:true,
		        layout:"fit",
		        items:this.initPanel(),
		        animCollapse:true,
		        constrainHeader:true,
		        minimizable: true,
		        maximizable: true,
		        shadow:false
            }
            if(!this.mainApp){
            	cfg.closeAction = 'hide'
            }
			win = new Ext.Window(cfg)
		    var renderToEl = this.getRenderToEl()
            if(renderToEl){
            	win.render(renderToEl)
            }
            this.win = win
		}
		return win
	}
})