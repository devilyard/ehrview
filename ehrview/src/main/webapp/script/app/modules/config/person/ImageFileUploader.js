$package("app.modules.config.person")

app.modules.config.person.ImageFileUploader = function(filter){
	this.fileFilter = filter
	app.modules.config.person.ImageFileUploader.superclass.constructor.call(this)
	this.init();
}
Ext.extend(app.modules.config.person.ImageFileUploader, Ext.util.Observable, {
	init:function(){
		this.form = new Ext.FormPanel({
			frame: true,
			labelWidth: 75,
			labelAlign: 'top',
			defaults: {width: '95%'},
			defaultType: 'textfield',
			shadow:true,
			items: [{   fieldLabel:'文件编码',
						name:'fileName',
						inputType:'hidden'
					},{
		                fieldLabel: '请选择要上传的文件',
		                name: 'file',
		                inputType:'file',
		                cls:'x-form-fileupload'
            		}]
		})		
		this.addEvents({
			"uploadSuccess":true,
			"uploadException":true
		})
	},
	
	getFileName:function(){
	    var f = this.form.items.item(0)
	    if(f){
	       return f.getValue()
	    }
	    return ""
	},
	
	setUpdateFields:function(v){
		var fs = v.split('/')
		if(fs.length == 2){
		   this.updateFileId = fs[1]
		}
		
	},
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
					modal:true,
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
					form.findField("fileName").setValue(this.updateFileId)
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
	},
	doUpload:function(){
		var form = this.form
		
		if(!this.checkFileType()){
			this.win.setTitle("上传文件:请选择允许的文件类型")
			return;
		}
		
		var con = new Ext.data.Connection();
		this.win.el.mask("正在上传请稍候...","x-mask-loading")
		con.request({
			url:"*.uploadPhoto",
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
				if(!json.body){
					if(json.exceptionCode == 401){
						this.win.setTitle("上传失败:用户未登陆或登录已过期")
					}
					if(json.exceptionCode == 402){
						this.win.setTitle("上传失败:用户空间已满或无权限")
					}
					if(json.exceptionCode == 403){
						this.win.setTitle("上传失败:单文件大小限制或其他错误")
					}
					this.fireEvent("uploadException",json.exceptionCode || 500,json.exception || "unknowError")
					return
				}
				var desc = json.body
				if(!desc){
					this.win.setTitle("上传失败:未知错误")
					this.fireEvent("uploadException",502,"unknowError")
					return
				}
				var id = desc.fileName
				this.fireEvent("uploadSuccess",200,id)
			}
			else{
				this.fireEvent("uploadException",500,"unknowError")
			}
			this.win.hide()
		}//func complete
	},//func doUpload
	checkFileType:function(){
		var f = this.form.items.item(1).getValue()
		if(!f){
			return false;
		}
		var filter = this.fileFilter
		if(!filter){
			return true;
		}
		
		var type = f.substring(f.lastIndexOf(".") + 1)
		
		type = type.toLowerCase();
		if(typeof filter == "string"){
			return type == filter.toLowerCase();
		}
		
		if(typeof filter == "object" && filter.length > 0){
			for(var i = 0; i < filter.length; i ++){
				
				if(type == filter[i].toLowerCase()){
					return true;
				}
			}
		}

	},
	close:function(){
		if(this.win){
			this.win.close();
		}
		
	}
})