$package("app.modules.config.homePage")

$import( 
    "util.rmi.jsonRequest",
    "app.modules.config.ImageFieldEx",
	"util.fileUploader.FileUploadField"
)

app.modules.config.homePage.ImageChangePanel = function(cfg) {
	//Ext.apply(this,cfg)
	this.dirType = "imgDirectory"
	this.image = "default.jpg"
	this.pfix = ".jpg"
	this.serviceId = "personnelService"
	this.fileFilter = ['gif','jpg','bmp','jpeg','png']
	app.modules.config.homePage.ImageChangePanel.superclass.constructor.apply(this,[cfg])
}

Ext.extend(app.modules.config.homePage.ImageChangePanel, app.desktop.Module, {
		initPanel : function() {
			var imageField = new app.modules.config.ImageFieldEx({disabled:true})
			this.imageField = imageField
			imageField.setValue(this.mainApp.userPic)
			var panel = new Ext.FormPanel({
				frame: true,
				fileUpload: true,
				labelWidth: 20,
				tbar:[
					{text:'上传',iconCls:'green_up',handler:this.doUpload,scope:this}
		    	],
				labelAlign: 'left',
				defaultType: 'textfield',
				shadow:true,
				bodyStyle: 'padding: 10px 10px 0 10px;',
				items : [
				   imageField,
				   {
					 name:'fileName',
					 inputType:'hidden'
				   },
				   	{   
					    fieldLabel:'文件保存路径',
			            name:'dirType',
						inputType:'hidden',
						value:this.dirType
					},
					{
				   	 width:145,
            		 xtype: 'fileuploadfield',
            		 emptyText: '请选择图片...',
            		 name: 'file',
            		 buttonText: '',
            		 buttonCfg: {iconCls: 'folder_image'}
        		 }]
			})
			this.panel = panel
			return this.panel
		},
		doUpload:function(){
			var form = this.panel
			this.win.setTitle("头像更新")
			if(!this.checkFileType(this.fileFilter)){
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
					var json={};
					try{
						json=eval("json=" + response.responseText)
						code = json["x-response-code"]
				    	msg = json["x-response-msg"]
					}
					catch(e){
						this.fireEvent("uploadException",501,"unknowResponseForm")
					}
					if(code == 200){
						this.doSave()
					}else if(code == 401){
				    	Ext.MessageBox.alert("错误","上传失败:用户未登陆或登录已过期")				
					}else{
				    	Ext.MessageBox.alert("错误",msg)	
					}	
				} 
			}
		},
		doSave:function(){
			var originalImage = this.mainApp.userPic
			var data = {}
			data.personId = this.mainApp.uid
			data.defaultImage = originalImage
			if(originalImage.indexOf(this.image)>0){
				data.defaultImage = ""
			}	
			util.rmi.jsonRequest({
				serviceId:this.serviceId,
				op:"picchange",
				body:data
			},
			function(code,msg,json){
				if(code<300){
					this.mainApp.userPic = json.picPath
					this.imageField.onUpload(200,json.picPath)
					this.win.setTitle("用户["+this.mainApp.uid+"]头像修改成功")
				}
			},this)
		},
		checkFileType:function(filter){
			var f = this.panel.items.item(3).getValue()
			if(!f){
				return false;
			}
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
		getWin: function(){
			var win = this.win
			if(!win){
				win = new Ext.Window({
		        	title: "头像更新",
		        	width: 220,
		        	height:250,
		        	items:this.initPanel(),
		        	iconCls: 'icon-form',
		       		bodyBorder:false,
		        	closeAction:'hide',
		        	layout:"fit",
		        	plain:true,
		        	autoScroll:false,
		       	 	shadow:false,
		        	buttonAlign:'center',
		        	modal:true
            	})
				win.on("show",function(){
				    var FileId = this.mainApp.uid + this.pfix
				    this.panel.items.item(1).setValue(FileId)
				},this)
				this.win = win
			}
			return win;
		}
})