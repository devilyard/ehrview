$package("app.biz.widgets")

$import("util.fileUploader.SingleFileUploader")

app.biz.widgets.MyFileUploader = function(filter){
	app.biz.widgets.MyFileUploader.superclass.constructor.apply(this,[filter])
}
Ext.extend(app.biz.widgets.MyFileUploader, util.fileUploader.SingleFileUploader, {
	doUpload:function(){
		var form = this.form
		
		if(!this.checkFileType()){
			this.win.setTitle("上传文件:请选择允许的文件类型")
			return;
		}
		var v = this.form.getForm().findField("fileId").getValue();
		var con = new Ext.data.Connection();
		this.win.el.mask("正在上传请稍候...","x-mask-loading")
		con.request({
			url:"*.uploadForm",
			method:"post",
			isUpload:true,
			callback:complete,
			scope:this,
			form:form.getForm().el
		})
		function complete(ops,sucess,response){
			this.win.el.unmask()
			if(sucess){
				var json;
				try{
					eval("json=" + response.responseText)
				}
				catch(e){
					this.fireEvent("uploadException",501,"unknowResponseForm")
				}
				if(json["x-response-code"] == 200){
					this.fireEvent("uploadSuccess",200,v)
					this.win.hide()
				}
				if(!json.body){
					if(json["x-response-code"] == 401){
						this.win.setTitle("上传失败:用户未登陆或登录已过期")
					}
					if(json["x-response-code"] == 402){
						this.win.setTitle("上传失败:用户空间已满或无权限")
					}
					if(json["x-response-code"] == 403){
						this.win.setTitle("上传失败:单文件大小限制或其他错误")
					}
					this.fireEvent("uploadException",json.exceptionCode || 500,json.exception || "unknowError")
					return
				}
				var desc = json.body[0]
				if(!desc){
					this.win.setTitle("上传失败:未知错误")
					this.fireEvent("uploadException",502,"unknowError")
					return
				}
				if(desc.exception){
					this.fireEvent("uploadException",desc.exceptionCode,desc.exception)
					this.win.setTitle("上传失败:保存文件异常")
					return
				}
				var id = desc.fileId
				this.fireEvent("uploadSuccess",201,id)
			}
			else{
				this.fireEvent("uploadException",500,"unknowError")
			}
			this.win.hide()
		}//func complete
	},//func doUpload	
	show:function(renderTo,xy){
		var win = this.win
		if(!win){
			win = new Ext.Window({
					title:"文件上传",
					id:"x-single-file-upload-" + (new Date()).getTime(),
					layout:"form",
					width:300,
					height:130,
					closeAction:"hide",
					shadow:false,
					modal : true,
					items:this.form,
					buttonAlign:'center',
					buttons:[
						{
		            		text: '开始上传',
		            		handler:this.doUpload,
		            		scope:this
						}
						]
				})
			win.on("show",function(){
					var form = this.form.getForm()
					form.findField("fileId").setValue(this.updateFileId)
			},this)
			this.win = win
		}
		if(xy){
			win.setPosition(xy[0],xy[1])
		}
		if(renderTo){
			win.render(renderTo)	
		}
		if(win.isVisible()){
			win.hide() //for refresh bug
		}
		win.doLayout()
		win.show()
	}
	
})