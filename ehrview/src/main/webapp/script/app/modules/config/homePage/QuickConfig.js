$package("app.modules.config.homePage")

//$styleSheet("index.indexPage")
$import(
	"app.desktop.Module",
	"app.modules.common",
	"util.rmi.jsonRequest",
	"util.rmi.miniJsonRequestSync"
)

app.modules.config.homePage.QuickConfig = function(cfg){
	this.pfix = ".gif"
	this.saveServiceId = "simpleSave"
	this.serviceId = "quickService"
	this.entryName = "SYS_Quick"
	this.pModules = {}
	Ext.apply(this,app.modules.common)
	app.modules.config.homePage.QuickConfig.superclass.constructor.apply(this,[cfg])
}
Ext.extend(app.modules.config.homePage.QuickConfig, app.desktop.Module,{
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
		
		var fields = ["moduleId",'title','appId','appId_text','catalogId','catalogId_text','iconCls','flag']
		var store = new Ext.data.Store({
	        reader: new Ext.data.JsonReader({},fields),
	        data: data
	    })	
		var dataview = new Ext.DataView({
            store: store,
            tpl:this.getIconTpl(),
		    cls :'qmconf',
            itemSelector: 'input',
            //overClass   : 'mbselect',
            singleSelect: true,
            autoScroll  : true,
            height:300
        })
        this.dataview = dataview
        dataview.on("click",this.onClick,this)
        
		var panel = new Ext.Panel({
			width: 430,
			height: 375,
			border:false,
			frame:false,
			headerStyle:this.initBackground("qm_header.png","height:45px;border:0px;padding-top:10px"),
		    bodyStyle:this.initBackground("qm_body.png","height:310px;padding:5px 10px"),
		    tools:[
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
		var moduleHome = ClassLoader.stylesheetHome + "app/desktop/images/icons"
		var butHome = ClassLoader.stylesheetHome + "index/images"
    	var tpl = this.iconTpl
    	if(!tpl){
    		tpl = new Ext.XTemplate(
    		   '<tpl for=".">',
		          '<dl>',
                    '<dt><img src="'+ moduleHome + '/{iconCls}'+ this.pfix +'" width="32" height="32" /></dt>',
                    '<dt>',
                       '<li><b>{title}</b></li>',
                       '<li>{appId_text}-----{catalogId_text}</li>',
                    '</dt>',
                    '<dt>',
                       '<input type="image" src="'+ butHome + '/{[values.flag=="1"?"qm_del.gif":"qm_add.gif"]}" align="bottom" />',
                    '</dt>',
                 '</dl>',
		      '</tpl>'
            )
			this.iconTpl = tpl;
    	}
    	return tpl;
	},
	
	onClick:function(view,index,node,e){
	     var data = view.store.getAt(index).data
	     var flag = data.flag
	     if(data.flag == '0'){   //添加操作
	     	if(this.opener.viewData){
	     		var pv = this.opener.viewData
	     		if(pv.indexOf(this.opener.add) == -1){
	     			this.messageDialog("错误","快捷方式设置已上限,请先清理不需要快捷应用!",Ext.MessageBox.ERROR)
	     	        return
	     		} 
	     	}
	        this.op = "create"
	        this.doSave(data)    
	     }else{                  //删除操作
	     	this.doRemove(data)	         
	     }
	     
	},
	
	loadData:function(){
		var data = []
	    var re = util.rmi.miniJsonRequestSync({
			  serviceId:this.serviceId,
			  op:"loadAllModules"
		})
		return re
	},
	
	doSave:function(data){
		Ext.Msg.show({
		   title: '保存信息',
		   msg: '将[' + data.title + ']设置为快捷方式，是否继续?',
		   modal:true,
		   width: 300,
		   buttons: Ext.MessageBox.OKCANCEL,
		   multiline: false,
		   icon:Ext.MessageBox.QUESTION,
		   fn: function(btn, text){
		   	 if(btn == "ok"){
		   	 	this.saveToServer(data)
		   	 }
		   },
		   scope:this
		})	
	},
	
	doRemove:function(data){
		if(!data){
		   return
		}
	    Ext.Msg.show({
		   title: '确认删除[' + data.title + ']',
		   msg: '删除操作将无法恢复，是否继续?',
		   modal:true,
		   width: 300,
		   buttons: Ext.MessageBox.OKCANCEL,
		   multiline: false,
		   icon:Ext.MessageBox.WARNING,
		   fn: function(btn, text){
		   	 if(btn == "ok"){
		   	 	this.processRemove(data);
		   	 }
		   },
		   scope:this
		})
	},
	
	processRemove:function(data){
		if(this.panel && this.panel.el){
			this.panel.el.mask("在正删除数据...")
		}
		util.rmi.jsonRequest({
		   serviceId:this.serviceId,
		   op:"remove",
		   fieldValue:data['moduleId']
		},
		function(code,msg,json){
		   if(this.panel && this.panel.el){
			   this.panel.el.unmask()
		   }
		   if(code > 300){
			   this.processReturnMsg(code,msg,this.processRemove,[data])
			   return;
		   }
		   this.reloadViewData(data,"0")				
		},this)
	},
	
	initBackground:function(id, css){
	    var bg = "background:url(" +ClassLoader.stylesheetHome + "index/images/" + id +")"
		if(css){
		   bg = bg + ";" + css
		}
		return bg              
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
				this.reloadViewData(saveData,"1")
			}
			this.op = "update"
		}
	},
	
	reloadViewData:function(data,flag){
	    if(this.viewData){
			var n = this.viewData.length
			for(var i=0; i<n; i++){		   	   
			    var m = this.viewData[i]
			    if(data.moduleId == m.moduleId){
			        m.flag = flag
			        break
			    }
			}
			this.dataview.getStore().loadData(this.viewData)
		    this.fireEvent("loadData",data,flag)
		}
	},
	
	messageDialog:function(title,msg,icon){
		Ext.MessageBox.show({
              title: title,
              msg: msg,
              buttons: Ext.MessageBox.OK,
              icon: icon
        })
	},
	
	getWin: function(){
		var win = this.win
		if(!win){
			win = new Ext.Window({
				frame:false,
			    border:false,
				closable:false,
		        autoWidth: true,
		        //width: 430,
		        resizable:false,
		        autoHeight:true,
		        layout:"fit",
		        closeAction:'hide',
		        shadow:false,
		        plain: true,
		        //items:this.initPanel(),
		        modal:true
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