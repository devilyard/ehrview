$package("app.modules.config.homePage")

$styleSheet("index.indexPage")
$import(
	"app.desktop.Module",
	"app.modules.common",
	"util.rmi.miniJsonRequestSync"
)

app.modules.config.homePage.QuickPanel = function(cfg){
	this.pfix = ".gif"
	this.pModules = {}
	this.limit = 8
	this.add = {moduleId:'quickAdd',title:"请添加",iconCls:"quickAdd"}
	Ext.apply(this,app.modules.common)
	app.modules.config.homePage.QuickPanel.superclass.constructor.apply(this,[cfg])
}
Ext.extend(app.modules.config.homePage.QuickPanel, app.desktop.Module,{
	init:function(){
	   this.addEvents({"loadData":true})	
	},
	
	initPanel:function(){
		var data = []
		var re = this.loadData()
		if(re.code != 200){
		    if(re.msg == "NotLogon"){
				this.mainApp.logon(this.initPanel,this,[])
			}
			return null
		}
		data = re.json.body		
		this.viewData = data
		if(data.length < this.limit){
		    data.push(this.add)
		}else if(data.length > this.limit){
		    data = data.slice(0,this.limit)
		}
		this.fields = ["moduleId",'title','appId','catalogId','iconCls']
		var store = new Ext.data.Store({
	        reader: new Ext.data.JsonReader({},this.fields),
	        data: data
	    })
		
		var dataview = new Ext.DataView({
            store: store,
            tpl:this.getIconTpl(),
		    cls :'quick',
            itemSelector: 'ul',
            overClass   : 'mbselect',
            singleSelect: true,
            autoScroll  : true,
            height:180
        })
        this.dataview = dataview
        dataview.on("click",this.onNavClick,this)
        
		var panel = new Ext.Panel({
			width: 360,
			border:false,
			frame:false,
			headerStyle:this.initBackground("quick_header.png","height:30px;border:0px"),
		    bodyStyle:this.initBackground("quick_body.png","height:200px;padding:0px 20px"),
		    tools:[
		      {id:'conf',handler:this.showModulesForm,scope:this},
		      {id:'closed',handler:function(){
				this.win.hide()
			},scope:this}],
		    items: dataview
		});	

		this.panel = panel;

		this.addPanelToWin()
		return panel
	},
	
	addPanelToWin:function(){
	    var win = this.getWin();
		win.add(this.panel)
		if(win.el){
			win.doLayout()
		}
	},
	
	getIconTpl:function(){
		var home = ClassLoader.stylesheetHome + "app/desktop/images/icons"
    	var tpl = this.iconTpl
    	if(!tpl){
    		tpl = new Ext.XTemplate(
    		   '<tpl for=".">',
		          '<ul>',
                    '<li><img src="'+ home + '/{iconCls}'+ this.pfix +'" width="32" height="32" /></li>',
                    '<li>{title}</li>',
                  '</ul>',
		       '</tpl>'            
            )
			this.iconTpl = tpl;
    	}
    	return tpl;
	},
	
	loadData:function(){
	    var re = util.rmi.miniJsonRequestSync({
			  serviceId:"quickService",
			  op:"loadData"
		})
		return re
	},
	
	initBackground:function(id, css){
	    var bg = "background:url(" +ClassLoader.stylesheetHome + "index/images/" + id +")"
		if(css){
		   bg = bg + ";" + css
		}
		return bg              
	},
	
	showModulesForm:function(){
		var cmd = "qm_conf"
		var cls = "app.modules.config.homePage.QuickConfig"
		var m = this.pModules[cmd]
		if(!m){
			var cfg = {}
			$import(cls)
			m = eval("new " + cls + "(cfg)")
			m.setMainApp(this.mainApp)
			m.opener = this
			m.on("loadData",this.doAction,this)
			this.pModules[cmd] = m
			var p = m.initPanel()
			if(!p){
			   return
			}
		}
		var win = m.getWin()
		if(win){
		   win.show()
		}
	},
	
	onNavClick:function(view,index,node,e){
		var data = view.store.getAt(index).data
		var moduleId = data.moduleId
		if(moduleId == "quickAdd"){
			this.showModulesForm()
		    return
		}
		
		var appId = data.appId
		var catalogId = data.catalogId
		
		if(this.mainApp){
		    var desktop = this.mainApp.desktop
		    var topview = desktop.topview
		    var i = topview.getStore().indexOfId(appId)
		    if(!topview.isSelected(i)){
		        desktop.onTopTabClick(topview,i)
		        topview.select(i)		    
		    }
		    var navView = desktop.navView
		    i = navView.getStore().indexOfId(catalogId) 		   
		    var pel = desktop.getNavElement(catalogId)
		    if(!navView.isSelected(i) && pel.dom.childNodes.length == 0){
		        desktop.onBeforeExpand(navView,i)		        
		    }
		    navView.select(i)		    
		    var moduleView = desktop.moduleView[catalogId]
		    i = moduleView.getStore().indexOfId(moduleId)	    
		    desktop.onNavClick(moduleView,i)
		    moduleView.select(i)
		    if(this.win){
		        this.win.hide()
		    }
		}
	},
	
	doAction:function(data,flag){		
	    if(flag == "1"){  //保存操作
	    	var d = {}
	        for(var i=0; i<this.fields.length; i++){	            
	            d[this.fields[i]] = data[this.fields[i]]	            
	        }
	        this.viewData.pop()
	        this.viewData.push(d)
	        if(this.viewData.length < this.limit){
	            this.viewData.push(this.add)
	        }
	    }else{ //删除操作
	    	var n = this.viewData.length
			for(var i=0; i<n; i++){
			    var m = this.viewData[i]
			    if(data.moduleId == m.moduleId){
			        this.viewData.remove(m)			            
			        break
			    }
			}
			if(this.viewData.length < this.limit && this.viewData.indexOf(this.add) == -1){
			    this.viewData.push(this.add)
			}
	    }
	    this.dataview.getStore().loadData(this.viewData)
	},

	getWin: function(){
		var win = this.win
		if(!win){
			win = new Ext.Window({
				frame:false,
			    border:false,
				closable:false,
		        autoWidth: true,
				//width: 360,
		        resizable:false,
		        autoHeight:true,
		        layout:"fit",
		        closeAction:'hide',
		        shadow:false,
		        plain: true//,
		        //items:this.initPanel()
            })
            win.on("show",function(){
		    	this.fireEvent("winShow")
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