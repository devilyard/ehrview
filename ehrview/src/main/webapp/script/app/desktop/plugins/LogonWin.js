$package("app.desktop.plugins")
$import("util.rmi.miniJsonRequestSync")

app.desktop.plugins.LogonWin = function(config){
	this.forConfig = false
	this.deep = false
	app.desktop.plugins.LogonWin.superclass.constructor.apply(this,[config]);
}

Ext.extend(app.desktop.plugins.LogonWin, app.desktop.Module,{

	getWin:function(){
		if(this.win){
			return this.win;
		}
		var win = new Ext.Window({
			autoWidth:true,
			frame:false,
			border:false,
			autoHeight:true,
			resizable:false,
			modal:true,
			shim:true,
			closable:false,
			html: '<div class="syslogin">'+
                   '<div class="syslogincon">'+
                     '<table width="100%" border="0" cellspacing="0" cellpadding="0"><tr>'+
					   '<td align="center"><label for="textfield" style="color:#FFF">用户：</label></td>'+
                         '<td height="50"><input type="text" name="logonuser" id="logonuser" disabled style="width:175px;height:22px"/>'+
	                      '</td></tr><tr>'+
                          '<td align="center"><label for="textfield" style="color:#FFF">密码：</label></td>'+
                          '<td height="50"><input type="password" name="password" id="password" style="width:175px;height:22px"/>'+
                          '</td></tr><tr><td>&nbsp;</td>'+
                          '<td height="50">'+
						  '<input type="image" name="logonIn" id="logonIn" src="pageImages/loginbut2.png" style="margin-top:10px;"/></td>'+
                       '</tr></table>'+
					'</div></div>'
		})
		win.doLayout();
		win.on("afterrender",this.initCmp,this)
		//win.on("close",this.doCanel,this);
		win.on("show",this.onWinShow,this)
		this.win = win;
		return win
			
	},
	
	initCmp:function(win){		
	    var user = Ext.fly("logonuser")  
	    if(this.mainApp){
			this.uid = this.mainApp.uid
		}
		if(this.uid){
		   user.dom.value = this.uid
		}
		
		var pws = Ext.fly("password")
		pws.dom.value = ""
		pws.dom.focus()
		
		var logon = Ext.fly("logonIn")
		logon.on("click",this.doLogon,this)
  
	},
	
	onWinShow:function(){
		var pws = Ext.fly("password")
		pws.dom.value = ""
		if(this.mainApp){
			this.mainApp.desktop.fireEvent("winLock")
		}
	},
	
	doLogon:function(){
		var uid = Ext.fly("logonuser").dom.value
		var psw = Ext.fly("password").dom.value
		var urole = ""
		if(this.mainApp){
		   urole = this.mainApp.jobId
		}
		if(!uid || !psw || !urole){
			return;
		}
		this.deep = false

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
					}
					if(code == 501){
						msg =  "密码不正确"
						Ext.fly("password").focus(true);
					}
					if(code == 200){
						//res.layout = layout
						this.win.hide()
						if (this.mainApp && res.body) {// @@ 重新登录后，需要更新客户端从服务端取过来的参数。
							this.mainApp.serverDate = res.body.serverDate;
							this.mainApp.sessionId = res.body.sessionId;
						}
						this.fireEvent("logonSuccess",res);
					}
					if(code == 402){
						msg =  "没有权限"					
					}
				}
				if(msg.length > 0){
					Ext.Msg.alert("错误",msg)
				}
			}

	},
	
	doCanel:function(){
		if(this.mainApp){
			this.mainApp.desktop.fireEvent("winUnlock")
		}
		this.fireEvent("logonCancel")
		return true;
	}

})
