$package("app.modules.list")
$import(
	"app.desktop.Module",
	"util.schema.SchemaLoader"
)
$styleSheet("app.modules.list.IconListView")
app.modules.list.IconListView = function(cfg){
	this.width = 800;
	this.dispProps = ['text','totalPop','lv1','lv2']
	this.jsonData = [];
	app.modules.list.IconListView.superclass.constructor.apply(this,[cfg])
}
Ext.extend(app.modules.list.IconListView, app.desktop.Module,{
	getSchema:function(){
		var schema = null
		if(this.entryName){
			var re = util.schema.loadSync(this.entryName)
			if(re.code == 200){
				schema = re.schema;
			}
		}
		return schema;
	},
	onReady:function(){
		
	},
	initPanel:function(sc){
		if(this.panel){
			return this.panel;
		}
		var schema = sc
		if(!schema){
			schema = this.getSchema()
		}
		var panel = new Ext.Panel({
				height:500,
                layout:'fit',
                autoScroll:true,
                items: this.createDataView()    
        })
        panel.on("render",this.onReady,this)
        this.panel = panel
        return panel;
	},
	createDataView:function(){
		var view = new Ext.DataView({
	            store: this.createStore(),
	            tpl: this.createTemplate(),
	            singleSelect: true,
	            autoScroll:true,
	            cls:"x-icon-list-view",
	            overClass:'x-icon-over',
	            selectedClass:"x-icon-selected",
	            itemSelector:'div.x-icon-wrap'
	       })  
	     view.on("click",this.onIconClick,this)
	     view.on("dblclick",this.onIconDblClick,this)
	     view.on("containercontextmenu",this.onContainerCtxMenu,this)
	     view.on("contextmenu",this.onIconCtxMenu ,this)
	     this.view = view
	     return view;
	},
	createStore:function(){
		var props = this.dispProps;
		var fields = [];
		for(var i = 0; i < props.length; i ++){
			var prop = props[i]
			if(typeof prop == "object"){
				
			}
			else{
				fields.push(prop)
			}
		}
		var store = new Ext.data.Store({
	        reader: new Ext.data.JsonReader({},this.dispProps),
	        data: this.jsonData
	    });
	    this.store = store;
		return store;
	},
	createTemplate:function(){
    	var tpl = this.template
    	if(!tpl){
    		var props = this.dispProps;
    		var propsHtml = "";
    		for(var i = 1;i < props.length; i ++){
    			var prop = props[i]
    			if(typeof prop == "object"){
    				propsHtml += '<span class="x-icon-prop" prop="' + prop.name +'">' + prop.label + ':{' + prop.name + '}</span>'
    			}
    			else{
    				propsHtml += '<span class="x-icon-prop">{' + props[i] + '}</span>'
    			}
    		}
    		tpl =  new Ext.XTemplate(
				'<tpl for=".">',
		            '<div class="x-icon-wrap">',
				    	'<span>{' + props[0] + '}</span>',
				    	'<div class="x-icon-body">',
		            	propsHtml,
		            	'</div>',
				    '</div>',
		        '</tpl>'
			);
			this.template = tpl;
    	}
    	return tpl;
	},
	onIconCtxMenu:function(view,index,node,e){
		e.stopEvent()
	},
	onContainerCtxMenu:function(view,e){
		e.stopEvent()
	},
	onIconClick:function(view,index,node,e){
		var target = Ext.get(e.getTarget());
		var p = target.getAttribute("prop")
		var r = this.store.getAt(index)
		if(p){
			var data = this.jsonData[index]
			this.onPropClick(p,r,data)
		}
		
	},
	onPropClick:function(p,r,data){
	
	},
	onIconDblClick:function(view,index,node,e){
		
	},
	loadData:function(){
		
	},
	getWin: function(){
		var win = this.win
		var closeAction = "close"
		if(!this.mainApp){
			closeAction = "hide"
		}
		if(!win){
			win = new Ext.Window({
				id: this.id,
		        title: this.title,
		        width: this.width,
		        iconCls: 'icon-grid',
		        shim:true,
		        layout:"fit",
		        animCollapse:true,
		        closeAction:closeAction,
		        constrainHeader:true,
		        minimizable: true,
		        maximizable: true,
		        shadow:false,
		        items:this.initPanel()
            })
		    var renderToEl = this.getRenderToEl()
            if(renderToEl){
            	win.render(renderToEl)
            }
			win.on("add",function(){
				this.win.doLayout()
			},this)
			win.on("close",function(){
				this.fireEvent("close",this)
			},this)
			this.win = win
		}
		return win;
	}
})