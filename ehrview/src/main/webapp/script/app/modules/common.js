$package("app.modules")
$import("util.schema.SchemaLoader");

app.modules.common = {
	doNotLogon:function(callback,args){
		if(this.mainApp){
			this.mainApp.logon(callback,this,args)
			return
		}
		if(mainApp){
			this.mainApp = mainApp
			this.mainApp.logon(callback,this,args)
		}
	},
	getSchema: function(id){
		util.schema.load(this.entryName || id,function(code,msg,schema){
				if(code > 300){
					this.processReturnMsg(code,msg,this.getSchema)
				}
				else{
					this.fireEvent("loadSchema",schema)
					this.initPanel(schema)
				}
			},
			this)
	},
	processReturnMsg:function(code,msg,callback,args,data){
		if(msg == "NotLogon"){
			this.doNotLogon(callback,args)
			return
		}
		if(msg == "ConnectionError"){
			var count = 0
			var execute = true
			Ext.Msg.show({
			   title: '网络问题',
			   msg: '网络连接失败或服务器忙，是否重试?',
			   modal:false,
			   width: 300,
			   progress:true,
			   buttons: Ext.MessageBox.OKCANCEL,
			   multiline: false,
			   fn: function(btn, text){
			   	count = 5;
			   	 if(btn == "ok"){
			   	 	execute = true
			   	 	if(typeof callback == "function"){
			   	 		callback.apply(this,args || [])
					}
			   	 }
			   	 else{
			   	 	execute = false
			   	 }
			   },
			   scope:this
			});
			var _ctx = this
			var updateText = function(){
				if(count >= 5){
			   	 	if(execute && typeof callback == "function"){
						callback.apply(_ctx,args || [])
					}
					Ext.Msg.hide()
					return;
				}
				Ext.Msg.updateProgress(count * 0.20,5 - count + "秒后自动重试");
				count ++
				setTimeout(updateText,900)
			}
			updateText();
			return
		}
		if(msg == "ValidateFailed"){
			var validMsg = data
			if(!validMsg){
				return
			}
			validMsg = Ext.decode(validMsg)
			 var form 
			 if(this.form){
			 	form = this.form.getForm()
			 }
			 var id = validMsg["id"]
			 var alias = validMsg["alias"]
			 var msg = validMsg["validMsg"]
			 if(!id){
			 	Ext.Msg.alert("错误", msg);
			 	return;
			 }
			 msg = alias+msg
			 if(form){
			 	 var f = form.findField(id)
			 	 if(f){
			 	 	f.markInvalid(msg)
			 	 }else{
			 	 	Ext.Msg.alert("错误", msg);
			 	 }
			 }else{
			 	Ext.Msg.alert("错误", msg);
			 }
		     return
		}
		if(msg == "NoSuchSchema"){
			Ext.MessageBox.alert("错误","该表尚不存在")
			return
		}
		if(code > 300){
			//alert(msg)
			if(data && data[msg]){
				Ext.MessageBox.alert("错误",data[msg])
			}else
				Ext.MessageBox.alert("错误",msg)
		}
	}
}