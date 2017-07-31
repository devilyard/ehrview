$package("app.modules.config")

$import(
		"app.desktop.Module",
		"util.dictionary.SimpleDicFactory"
)

app.modules.config.PicUploaderConfig = function(cfg){
    this.fileFilter = "png"    //文件后缀名
    this.dirType = "tempDirectory"
    app.modules.config.PicUploaderConfig.superclass.constructor.apply(this,[cfg])
}
Ext.extend(app.modules.config.PicUploaderConfig, app.desktop.Module,{
	
    initPanel:function(){
    	var combox = util.dictionary.SimpleDicFactory.createDic({id:'picType',width:250,editable:false})
    	combox.name = 'combox'
        combox.fieldLabel = '更新图片选择'
        combox.allowBlank = false
        combox.on("select",this.setFileName,this)
        var fieldSet = new Ext.form.FieldSet({
        	title:"系统图片定义",
            collapsible:true,
			animCollapse:true,
			labelAlign: 'top',
			fileUpload : true,
			width:600,
			defaultType: 'textfield',
			items:[
			       {   fieldLabel:'文件保存路径',
			            name:'dirType',
						inputType:'hidden',
						value:this.dirType
					},{    
					    fieldLabel:'文件名称',
						name:'fileName',
						readOnly:true,
						width: 250,//'85%'
						cls:'x-item-disabled'
					},combox,{
		                fieldLabel: '请选择要上传的文件',
		                name: 'file',
		                inputType:'file',
		                width:300,
		                cls:'x-form-fileupload'
            		}
			]
        })
        
        this.form = new Ext.FormPanel({
			frame:true,
			labelWidth:75,
			bodyStyle:"padding:10px",
			tbar:[{
				text : "开始上传",
				iconCls:"add",
				handler:this.doUpload,
				scope:this
			}],
			items:[fieldSet]
        })
        
        return this.form
    },
    
    setFileName:function(combox){
    	var fileName = combox.getValue()
        var f = this.form.items.itemAt(0).items.itemAt(1)
        if(f){
           f.setValue(fileName)
           this.fileFilter = fileName.substring(fileName.indexOf('.')+1)
        }
    },
    
    doUpload:function(){
		var form = this.form.getForm()
		if(!form.isValid()){
		   return
		}
		var f = this.form.items.itemAt(0).items.itemAt(1)
		if(f && !f.getValue()){
			Ext.Msg.alert("错误","请选择上传文件")
		    return
		}
		if(!this.checkFileType()){
			Ext.Msg.alert("错误","请选择[ "+this.fileFilter+" ]格式的文件")
			return;
		}
		
		var con = new Ext.data.Connection();
		form.el.mask("正在上传请稍候...","x-mask-loading")
		con.request({
			url:"*.uploadForm",
			method:"post",
			isUpload:true,
			callback:complete,
			scope:this,
			//form:form.getForm().el
			form:form.el
		})		
		function complete(ops,sucess,response){
			form.el.unmask()
			var code = 200
		    var msg = ""
			if(sucess){			
				var json = {};
				try{
					json = eval("(" + response.responseText + ")")
					code = json["x-response-code"]
				    msg = json["x-response-msg"]
				}catch(e){
					code = 500
				    msg = "uploadException"
				}
				if(code == 200){
				    //Ext.Msg.alert("提示","上传成功")
				    window.location.reload()
				}else if(code == 401){
				    Ext.MessageBox.alert("错误","上传失败:用户未登陆或登录已过期")				
				}else{
				    Ext.MessageBox.alert("错误",msg)	
				}
			}
		}
	},
	
	checkFileType:function(){
		var form = this.form.getForm()
		var f = form.findField("file")
		if(!f){
			return false;
		}
		var filter = this.fileFilter
		if(!filter){
			return true;
		}
		var v = f.getValue()
		var type = v.substring(v.lastIndexOf(".") + 1)	
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
	}
})
