$package("app.desktop.plugins")
$styleSheet("app.desktop.plugins.DebugConsole")

app.desktop.plugins.DebugConsole = function(config){
	app.desktop.plugins.DebugConsole.superclass.constructor.apply(this,[config]);
}

Ext.extend(app.desktop.plugins.DebugConsole, app.desktop.Module,{
	init:function(){
		this.logLevel = {"DEBUG":0,"INFO":1,"WARN":2,"FATAL":3,"ERROR":4}
		this.filter = {level:this.logLevel.DEBUG}
		this.console =  new Ext.Component({xtype:"box",cls:"x-debug-view"})//Ext.get("x-debug-view")
		if(!Ext.get("x-debug-view")){
			Ext.DomHelper.append(document.body,{tag:"div",id:"x-debug-view",'class':"x-debug-view"})
		}
		this.console.applyToMarkup("x-debug-view")
		
		this.tpl = this.getTpl();
		
		this.combox = new Ext.form.ComboBox({
	        			store: new Ext.data.SimpleStore({
	        							fields: ['value', 'text'],
	        					   		data:[[0,"DEBUG"],[1,"INFO"],[2,"WARN"],[3,"FATAL"],[4,"ERROR"]]
									}),
						tpl: '<tpl for="."><div class="x-combo-list-item x-debug-{text}">{text}</div></tpl>',
	        	       	valueField:"value",
	        			displayField:"text",
	        			mode:"local",
	        			width:80,
	        			selectOnFocus:true,
	        			triggerAction: 'all',
	        			emptyText:'等级'
            		  })
       this.combox.on("select",function(combo,record,index){
       		this.filter.level = this.logLevel[record.data.text]
       		this.clear();
       		this.initConsole();
       },this)
       
       this.textfield = new Ext.form.TextField({emptyText:"输入要过滤的class id回车",width:250,selectOnFocus:true})
       this.textfield.on("specialkey",function(field,e){
       		if(e.getKey() == e.ENTER){
       			var value = field.getValue();
       			if(value == ""){
       				this.filter.src = null
       			}
       			else{
       				this.filter.src = value
       			}
       			this.clear();
       			this.initConsole();
       		}
       	
       },this)
       
       this.objectBrowser = null
       this.detailWin = null
       this.contextMenu = null
	},
	getWin:function(){
		var win = new Ext.Window({
			id: this.id || "x-debug-console-win",
			title:"调试控制台",
			width: 700,
			height: 200,
			resizable:true,
			autoScroll:true,
			items:this.console,
			shadow:false,
			tbar:[
			   	{
					text:'清除',
                    tooltip:'清除窗口',
                    iconCls:'remove',
                    handler:this.clear,
                    scope:this
            	},
            	"-",
				this.combox,
				"-",
				this.textfield
            	]
			})
			win.on("show",this.ScrollToBottom,this)
			win.on("resize",this.ScrollToBottom,this)
			win.on("beforeshow",function(win){
				var x = 0
				var y = this.mainApp.desktop.getWinHeight() - 200
				win.setPagePosition(x,y)
				return true
			},this)

			//win.render(this.mainApp.desktop.getDesktopEl())
			this.win  = win
			return win
			
	},
    getTpl:function(){
    	return new Ext.XTemplate(
			'<tpl for=".">',
	            '<div class="x-debug-item" id=_xdi_{id}>',
	            '<div class="x-debug-{type}">{type}</div>',
	            '<div class="x-debug-dt">[{dt}] [{src}]</div>',
			    '<span>{msg}</span></div>',
	        '</tpl>'
		);
	},

	onItemclick:function(e){
		e.stopEvent();
		var node = e.getTarget("div.x-debug-item")
		this.openDetailWin(node.id.substring(5))
	},
	openDetailWin:function(itemId){
		var item = this.mainApp.logger.find(itemId)
		if(item){
			if(!this.detailWin){
				var form = new Ext.FormPanel({
        			frame: true,
        			labelWidth: 75,
        			labelAlign: 'top',
        			width:350,
        			defaults: {width: "98%"},
        			defaultType: 'textfield',
        			shadow:true,
					items: [{
						fieldLabel: '类型',
		                name: 'type',
		                disabled:true
		            },{
		                fieldLabel: '时间',
		                name: 'dt',
		                disabled:true
		            },{
		                fieldLabel: '模块',
		                name: 'src',
		                selectOnFocus:true
		            },{
		                xtype: 'textarea',
		                fieldLabel: '消息',
		                name: 'msg',
		                height:150,
		           		selectOnFocus:true
		            }]
				})
				form.setPosition(100,100)
				
				
				this.detailWin = new Ext.Window({
									closeAction:"hide",
									layout:"fit",
									title:"详细信息",
									width:350,
									height:400,
									items:form,
									tbar: [{
							            text: '复制到剪贴板',
							            handler:function(){
							            	var form = this.detailWin.items.get(0)
							            	var data = form.getForm().findField("msg").getValue()
							            	clipboardData.setData("Text",data)
							            },
							            scope:this
							        },
							        "-",
							        {
							            text: '关闭窗口',
							            handler:function(){this.detailWin.hide()},
							            scope:this
							        },
							        "-",
							        {
							            text: '查看对象',
							            handler:function(){
							            	var form = this.detailWin.items.item(0).getForm()
							            	var value = form.findField("src").getValue()
							            	var id = value.substring(value.lastIndexOf("-") + 1)
											this.openObjectBrowser(id)
							            },
							            scope:this
							        }							       
							        ]
								})
				this.detailWin.render(this.mainApp.desktop.getDesktopEl())
			}

			var form = this.detailWin.items.item(0).getForm()
			form.loadRecord(new Ext.data.Record(item))
			this.detailWin.show();
			
		}
	},
	clear:function(){
		this.console.el.update("")
	},
	ScrollToBottom:function(){
		var ct = this.console.el
		if(ct.isScrollable())
			ct.scrollTo("top",ct.dom.scrollHeight,false)
	},
	addItem:function(item){
		var loglv = this.logLevel
		if((this.filter.level && loglv[item.type] < this.filter.level) || (this.filter.src && item.src != this.filter.src))
			return
		var node = Ext.get(this.tpl.append(this.console.el,item))
		node.on("dblclick",this.onItemclick,this)
		node.on("contextmenu",this.onContextMenu,this)
		this.ScrollToBottom();
	},
	onContextMenu:function(e){
		e.stopEvent()
		if(!this.contextMenu){
			var cmenu = new Ext.menu.Menu({
							items:[
								{id:"_debug_detail",text:"详细信息"},
								{id:"_debug_ob",text:"浏览对象"}
							]
						}) 
			cmenu.on("itemclick",this.onContextMenuItemClick,this)
			this.contextMenu = cmenu
		}

		var node = e.getTarget("div.x-debug-item")
		this.contextMenu._ItemIndex = node.id.substring(5)
		this.contextMenu.showAt([e.getPageX()+5,e.getPageY()+5])
	},
	onContextMenuItemClick:function(item,e){
		var index = this.contextMenu._ItemIndex
		if(item.id == "_debug_detail"){
			this.openDetailWin(index)
		}
		else{
			var item = this.mainApp.logger.find(index)
			if(item){
				var src = item.src
				var id = src.substring(src.lastIndexOf("-") + 1)
				this.openObjectBrowser(id)
			}
			
		}
	},
    setMainApp:function(mainApp){
		app.desktop.plugins.DebugConsole.superclass.setMainApp.apply(this,[mainApp])
		this.initConsole()
	},
	initConsole: function(){
		var cache = this.mainApp.logger.cache
		for(var i = 0; i < cache.length; i ++){
			this.addItem(cache[i])
		}
		this.mainApp.logger.onMessage(this.addItem,this)
	},
	openObjectBrowser:function(id){
	    var module = this.mainApp.taskManager.tasks.item(id)
		
		if(module && module.instance){
    		var ob = this.objectBrowser
    		if(!ob){
    			$import("util.ObjectBrowser")
				ob = new util.ObjectBrowser()
				this.objectBrowser = ob
    		}
	   		ob.setRootObject(module.instance)
			ob.show(this.mainApp.desktop.getDesktopEl())
    	}
	},
	destory: function(){
		app.desktop.plugins.DebugConsole.superclass.destory.call(this)
		this.mainApp.logger.removeListener()
		this.combox = null
		this.textfield = null
		if(this.detailWin){
			this.detailWin.close()
		}
		if(this.objectBrowser){
			this.objectBrowser.destory();
		}
		if(this.contextMenu){
			var el = this.contextMenu.el
			el.remove()
			this.contextMenu.removeAll();
		}
	}
})