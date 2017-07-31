$package("app.modules.config.homePage")

$styleSheet("index.indexPage")
$import(
	"app.desktop.Module",
	"app.modules.common",
	"util.rmi.miniJsonRequestSync",
	"util.SSOHelper"
)

app.modules.config.homePage.SettingPanel = function(cfg){
	this.pfix = ".png"
	this.serviceId = "settingService"
	this.pModules = {}
	Ext.apply(this,app.modules.common)
	app.modules.config.homePage.SettingPanel.superclass.constructor.apply(this,[cfg])
}
Ext.extend(app.modules.config.homePage.SettingPanel, app.desktop.Module,{
	init:function(){
	   this.addEvents({"loadData":true})	
	},
	
	initPanel:function(){
		var leftData = [
		    {id:'app',title:'应用切换',iconCls:'app'},
		    {id:'psw',title:'密码修改',iconCls:'lock'},		    
		    {id:'pic',title:'头像修改',iconCls:'pic'}
		]	
		var leftView = this.getDataView(leftData)
        leftView.on("click",this.onLeftViewClick,this)
   
        var topView = this.getDataView([],{width:70,height:90})
        topView.on("click",this.onTopViewClick,this)
        this.topView = topView
        
        var bottomView = this.getDataView([],{width:70,height:90})
        bottomView.on("click",this.onLogon,this)
        this.bottomView = bottomView

		var panel = new Ext.Panel({
			width: 527,
			height: 253,
			border:false,
			frame:false,
			headerStyle:this.initBackground("setting_header.png","height:25px;border:0px;padding-top:10px"),
		    bodyStyle:this.initBackground("setting_body.png","height:214px;padding:0px 20px"),
		    tools:[
		      {id:'sclosed',handler:function(){
				  this.win.hide()
			},scope:this}],
			layout : 'table',
			layoutConfig : { columns : 2 },
			defaults : {
				bodyStyle:'background:none;padding-left:2px;overflow-y:hidden;overflow-x:auto;', 
				border:false,
				frame:false
			},
			items:[
			    {
				   bodyStyle:'background:none;padding:0 20px 0 10px',
				   rowspan : 2,
				   height : 200,
				   width:190,
				   items:leftView
				},{
				   width:300,
				   height:100,
				   items:topView
				},{
				   width:300,
				   height:100,
				   items:bottomView
				}
			]			
		});	
		this.panel = panel;
		return panel
	},
	
	getIconTpl:function(){
		var home = ClassLoader.stylesheetHome + "index/images/"
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
	
	getDataView:function(data,exCfg){
	    var store = new Ext.data.Store({
	        reader: new Ext.data.JsonReader({},["id",'title','iconCls']),
	        data: data
	    })
	    var cfg = {
            store: store,
            tpl:this.getIconTpl(),
		    cls :'setbody',
            itemSelector: 'ul',
            overClass   : 'mbselect',
            singleSelect: true
        }
        if(exCfg){
           Ext.apply(cfg,exCfg)
        }
	    return new Ext.DataView(cfg)	    
	},
	
	onLeftViewClick:function(view,index,node,e){
		var id = view.store.getAt(index).data.id
		switch(id){
			case "app":
				this.doSwitchApp()
				break
			case "psw":
				this.doChangePsw()
				break			
			case "pic":
			    this.doSettingPic()
			    break;	
		}	
	},
	
	doSwitchApp:function(){
	    var topData = this.loadData("loadApp")
	    if(topData.length == 0){
	    	this.messageDialog("提示","当前没有其他在线的应用服务器, 请稍后查看!",Ext.MessageBox.INFO)
	        return
	    }
        this.topView.setWidth(topData.length*70)
        this.topView.getStore().loadData(topData)
	},
	
	loadApps:function(){
	    var topData = this.loadData("loadApp")
	    if(topData.length == 0){
	        return
	    }
        this.topView.setWidth(topData.length*70)
        this.topView.getStore().loadData(topData)
	},
	
	doChangePsw:function(){
		var m = this.pModules['psw']
		if(!m){
		   	$import("app.desktop.plugins.PasswordChanger")
			m = new app.desktop.plugins.PasswordChanger({});
			m.setMainApp(this.mainApp)
			this.pModules['psw'] = m	
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
	
	doSettingPic:function(){
		var cls = "app.modules.config.homePage.ImageChangePanel"
		var m = this.pModules['pic']
		if(!m){
			$import(cls)
			m = eval("new " + cls + "({})")
			m.setMainApp(this.mainApp)
			this.pModules['pic'] = m
		}
		var win = m.getWin()
		if(win){
		   win.show()
		}
	},
	
	onTopViewClick:function(view,index,node,e){
		this.bottomView.getStore().removeAll()
	    var domain = view.store.getAt(index).data.id
	    this.selectApp = domain
	    var data = this.loadData("loadRoles",domain)
	    if(data.length > 0){
	       this.bottomView.setWidth(data.length*70)
           this.bottomView.getStore().loadData(data)
	    }
	    
	},
	
	onLogon:function(view,index,node,e){
		var id = view.store.getAt(index).data.id
		var data = this.loadData("loadDomainInfo",this.selectApp)
		if(data){
			if(!data.url){
				Ext.Msg.alert("错误","应用服务器路径未设置!")
				return
			}
		    data.urole = id
		    var cfg = {
		      url: data.url,
		      uid: data.uid,
		      psw: data.psw,
		      urole:data.urole
		    }
		    util.SSOHelper(cfg)
		}	
	},
	
	loadData:function(cmd,domain){
	    var re = util.rmi.miniJsonRequestSync({
			  serviceId:this.serviceId,
			  op:cmd,
			  domain:domain
		})
		if(re.code != 200){
			if(re.msg == "NotLogon"){
				this.mainApp.logon(this.loadData,this,[cmd,domain])
			}
			return null;
		}
		return re.json.body
	},
	
	initBackground:function(id, css){
	    var bg = "background:url(" +ClassLoader.stylesheetHome + "index/images/" + id +")"
		if(css){
		   bg = bg + ";" + css
		}
		return bg              
	},
	
	messageDialog:function(title,msg,icon){
		Ext.MessageBox.show({
              title: title,
              msg: msg,
              buttons: Ext.MessageBox.OK,
              icon: icon
        })
	},
	
	initDataView:function(){
	    this.topView.setWidth(70)
        this.topView.getStore().loadData([])
        this.bottomView.setWidth(70)
        this.bottomView.getStore().loadData([])
	},
	
	getWin: function(){
		var win = this.win
		if(!win){
			win = new Ext.Window({
				frame:false,
			    border:false,
				closable:false,
		        autoWidth: true,
				//width: 527,
		        autoHeight:true,
		        resizable:false,
		        layout:"fit",
		        closeAction:'hide',
		        shadow:false,
		        plain: true,
		        items:this.initPanel(),
		        modal:true
            })
            win.on("show",function(){
            	this.initDataView()
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