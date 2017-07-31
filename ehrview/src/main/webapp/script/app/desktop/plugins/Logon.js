$package("app.desktop.plugins")
$import("util.widgets.MyRadioGroup",
"util.rmi.miniJsonRequestSync")

app.desktop.plugins.Logon = function(config){
	this.forConfig = false
	this.deep = false
	app.desktop.plugins.Logon.superclass.constructor.apply(this,[config]);
}

Ext.extend(app.desktop.plugins.Logon, app.desktop.Module,{
	init:function(){
			
		this.dataMap = new Ext.util.MixedCollection();
		this.addEvents({
			"logonSuccess":true,
			"logonCancel":true
		})
		
	    if(!Ext.get('x-logo')){
			Ext.DomHelper.append(document.body,{tag:"div",id:"x-logo"})
		}
		var cg = new util.widgets.MyRadioGroup({
						hideLabel:true,
						width: '95%',
		                value:'viewport',
		                items: [
		                  	{boxLabel: '角色登录', name: 'cb-col-1',inputValue:'roleJob'},
		                    {boxLabel: '默认登录', name: 'cb-col-1',inputValue:'viewport'}
		                ]   	
		    })
		cg.on("change",this.createRoleField,this)
		this.layout = cg
		this.logo = new Ext.BoxComponent({el:'x-logo',cls:'x-logon-winlogo',height:85})
		this.form = new Ext.FormPanel({
			frame: true,
			labelWidth: 75,
			labelAlign: 'top',
			//defaults: {width: '95%'},
			defaultType: 'textfield',
			shadow:true,
			items: [
			{
				fieldLabel: '用户名',
                name: 'uid',
                width: '95%',
                value: 'system'
            },{
                fieldLabel: '密码',
                name: 'psw',
                inputType:'password', 
                width: '95%',
                value: '123'
            },cg
            ]
		})
		var fldUid = this.form.items.item(0)
		var fldPsw = this.form.items.item(1)
				
		fldUid.on("blur",this.loadRole,this)		
		fldPsw.on("blur",this.loadRole,this)
		
		fldUid.on("specialkey",function(f,e){
			if(e.getKey() == e.ENTER){
				if(f.getValue){
					this.form.items.item(1).focus(true);
				}
			}
			
		},this)
		fldPsw.on("specialkey",function(f,e){
			if(e.getKey() == e.ENTER){
				this.doLogon();
			}
			
		},this)
		if(this.mainApp){
			this.uid = this.mainApp.uid
		}
		if(this.uid){
			fldUid.setValue(this.uid)
			fldUid.disable()
			cg.disable()
		}
	},
	getWin:function(){
		if(this.win){
			return this.win;
		}
		var win = new Ext.Window({
				layout:"form",
				title:this.title || '系统登录',
				width:400,
				autoHeight:true,
				resizable:true,
				modal:true,
				iconCls: 'x-logon-win',
				constrainHeader:true,
				shim:true,
				items:[this.logo,this.form],
				buttonAlign:'center',
				closable:false,
				buttons: [
				{
		            text: '确定',
		            handler:this.doLogon,
		            scope:this
		        },
		        {
		            text: '取消',
		            handler:this.doCancel,
		            scope:this
		        }						       
		        ]
			})
			//win.render(document.body)
			win.doLayout();
			win.on("close",this.doCancel,this);
			win.on("show",this.onWinShow,this)
			this.win = win;
			return win
			
	},
	onWinShow:function(){
		var items = this.form.items
		if(!items.item(0).getValue()){
			items.item(0).focus(true,500)
		}
		else{
			items.item(1).focus(true,500)
		}
		if(this.mainApp){
			this.mainApp.desktop.fireEvent("winLock")
		}
	},
	doLogon:function(){
		
		var form = this.form.getForm()
		var uid = form.findField("uid").getValue();
		var psw = form.findField("psw").getValue();
		var urole = ""
		if(this.mainApp){
		   urole = this.mainApp.jobId
		}
		if(form.findField("role")){
		   urole = form.findField("role").getValue()
		}
		var layout = this.layout.getValue()
		if(!uid || !psw){
			return;
		}
		if(layout == "desktop"){
			this.deep = true
		}
		else{
			this.deep = false
		}
		var url = ClassLoader.serverAppUrl || ""
		var con = new Ext.data.Connection();
			con.request({
				url:url + "*.jsonRequest",
				method:"POST",
				callback:complete,
				scope:this,
				jsonData:{deep:this.deep,forConfig:this.forConfig,serviceId:'logon',uid:uid,psw:psw,urole:urole}
			})
			
			function complete(ops,sucess,response){
				var msg = "";
				
				if(!sucess){
					msg = "通讯错误"
				}
				else{					
					var res = eval("(" + response.responseText + ")")
					var code = res['x-response-code']
					if(code == 504){
						msg =  "该用户不存在"
						this.form.items.item(0).focus(true);
					}
					if(code == 501){
						msg =  "密码不正确"
						this.form.items.item(1).focus(true);
					}
					if(code == 200){
						res.layout = layout
						form.findField("psw").reset()
						this.win.hide()
						this.fireEvent("logonSuccess",res);
					}
					if(code == 402){
						msg =  "没有权限"					
					}
				}
				if(msg.length > 0){
					this.win.setTitle(this.title || "登录" + "[" + msg +"]")
				}
			}

	},
	doCancel:function(){
		if(this.mainApp){
			this.mainApp.desktop.fireEvent("winUnlock")
		}
		this.fireEvent("logonCancel")
		return true;
	},
	
	createRoleField:function(rg){
	   	var value = rg.getValue()
	   	var uid = this.form.items.item(0).getValue()
	   	var psw = this.form.items.item(1).getValue()
	   	var key = uid + psw
		if(value == "roleJob"){
		    var com = new Ext.form.ComboBox({
		    	fieldLabel: '角色选择',
		    	name:'role',
				displayField:'text',
				valueField:'key',
				mode: 'local',
				triggerAction: 'all',
                store:new Ext.data.JsonStore({
		            root:"body",
		            data:{body:[]},
		            fields: ['key','text']	
		        })
			})
		    this.form.add(com)
            this.form.doLayout()
            if(this.dataMap.containsKey(key)){
            	var data = this.dataMap.get(key)
                com.getStore().loadData(data)
            }else{
               this.loadRole()
            }          
		 }else{
		    var n = this.form.items.length
		    if(n == 4){
		        this.form.remove(this.form.items.itemAt(n-1))
		    }
		 }
	},
	
	loadRole:function(){

		var form = this.form.getForm()
	   	var uid = this.form.items.item(0).getValue()
	   	var psw = this.form.items.item(1).getValue()
		var com = this.form.items.item(3)
		if(!uid || !psw || !com){
		    return
		}
		var key = uid + psw
		if(this.dataMap.containsKey(key)){
		   var data = this.dataMap.get(key)
           com.getStore().loadData(data)
           return
		}
		var json = util.rmi.miniJsonRequestSync({
		     serviceId:'roleLocator',
		     uid:uid,
		     psw:psw
		})
		if(json.code == 200){
			this.dataMap.add(key, json.json);
			com.getStore().loadData(json.json)
		}else{
		    com.getStore().removeAll()
		}
		
	}
})
