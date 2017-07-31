$package("app.modules.config.homePage")

$styleSheet("app.desktop.animated")
$import(
	"app.desktop.Module",
	"org.ext.ux.TabCloseMenu",
	"app.modules.common",
	"util.dictionary.TreeDicFactory",
	"util.rmi.jsonRequest",
	"util.dictionary.TreeCheckDicFactory"
)

app.modules.config.homePage.DisplayConfig = function(cfg){
	this.height = 300
	this.saveServiceId = "simpleSave"
	this.entryName = "SYS_HomePage"
	this.op = "create"
	this.pfix = ".gif"
	Ext.apply(this,app.modules.common)
	app.modules.config.homePage.DisplayConfig.superclass.constructor.apply(this,[cfg])
}

Ext.extend(app.modules.config.homePage.DisplayConfig, app.desktop.Module,{
	
	init:function(){
	   this.addEvents({"loadData":true})
	
	},
	initPanel:function(){
		
		var re = util.rmi.miniJsonRequestSync({
			  serviceId:"appConfigLocator",
			  id:this.appId
		})
		if(re.code < 300){
			this.modules = re.json.body.modules
			for(var i = 0; i < this.modules.length;i ++){
				var module = this.modules[i]
				if(module.icon != "default"){
					this.initCssClass(module.id, module.iconCls)
				}		
			}
		}
		
		var store = new Ext.data.Store({
	        reader: new Ext.data.JsonReader({},["id",'title','type']),
	        data: this.modules
	    })
		
		var dataview = new Ext.DataView({
           store: store,
           tpl:this.getIconTpl(), //tpl,
		   cls :'phones',  //使用类样式       
           itemSelector: 'li.phone',
           overClass   : 'phone-hover',
           singleSelect: true,
           autoScroll  : true
        })
        this.dataview = dataview
        dataview.on("dblclick",this.doSaveItem,this)
        //dataview.select(0)
    
		var panel = new Ext.Panel({
			//frame:false,
		    layout:'fit',
		    width:this.width,
		    height:this.height,
		    bodyStyle:'background-color:#99BBE8',		    
		    tbar:[{text:'应用',iconCls:'save',handler:this.doSaveItem,scope:this}],
		    items: dataview
		});	

		this.panel = panel;
		return panel
	},
	
	getIconTpl:function(){
    	var tpl = this.iconTpl
    	if(!tpl){
    		tpl = new Ext.XTemplate(
              '<ul>',
                 '<tpl for=".">',
                     '<li class="phone" id="_desktop_icon_{id}">',
                         //'<img width="64" height="64" src="../photo/phone.png" />',
                         '<dt class="x-shortindex-{id}"></dt>',
                         '<strong>{title}</strong>',
                         '<span>{id}</span>',
                     '</li>',
                 '</tpl>',
              '</ul>'
             
            )
			this.iconTpl = tpl;
    	}
    	return tpl;
	},
	
	initCssClass:function(id, cls){
		if(!cls){
			cls = id
		}
		var cssSelector =  ".x-shortindex-" + id;
		if(!util.CSSHelper.hasRule(cssSelector)){
			var home = ClassLoader.stylesheetHome
			util.CSSHelper.createRule(cssSelector,"height:64px; background:url(" + home + 
			      "app/desktop/images/icons/" + cls + this.pfix + ") no-repeat center;")
		}	
	},

	doSaveItem:function(){
		var views = this.dataview.getSelectedRecords()
		var id = views[0].data.id
		var data = {
		   moduleId : id	   
		}		
		this.saveToServer(data)
	},

	saveToServer:function(saveData){
		if(this.panel && this.panel.el){
			this.panel.el.mask("在正保存数据...","x-mask-loading")
		}
		var rel = util.rmi.miniJsonRequestSync({
			serviceId:this.saveServiceId,
			op:this.op,
			schema:this.entryName,
			body:saveData
		})
		if(this.panel && this.panel.el){
			this.panel.el.unmask()
		}
		var code = rel.code
		var msg = rel.msg
		if(code > 300){			
		    this.processReturnMsg(code,msg,this.saveToServer,[saveData]);
		    return
		}else{
			if(rel.json.body){
			    Ext.apply(saveData,rel.json.body)
			    this.fireEvent("loadData",this.button,saveData)
	            this.win.close()
			}
			
		}
	},
	getWin: function(){
		var win = this.win
		if(!win){
			win = new Ext.Window({
				//id: this.id,
		        title: this.title,
		        width: 605,
		        height:350,
		        iconCls: 'icon-grid',
		        shim:true,
		        //frame:false,
		        layout:"fit",
		        animCollapse:true,
		        items:this.initPanel(),
		        closeAction:'close',
		        constrainHeader:true,
		        shadow:false,
		        modal:true
            })
		    var renderToEl = this.getRenderToEl()
            if(renderToEl){
            	win.render(renderToEl)
            }
			this.win = win
		}
		return win;
	}	
})