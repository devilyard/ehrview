$package("app.modules.config.person")
$import(
		"app.modules.form.TableFormView",
		"app.modules.config.ImageFieldEx"
		
)
app.modules.config.person.PersonConfigForm = function(cfg){   
	this.title="人员注册"
	cfg.saveServiceId = "personnelService"
	this.folder = "photo/"
	this.image = "default.jpg"
	this.personId = "personId"
	this.organizCode = "organizCode"
	this.pfix = ".jpg"
	Ext.apply(this,app.modules.common)
	app.modules.config.person.PersonConfigForm.superclass.constructor.apply(this,[cfg])
}
Ext.extend(app.modules.config.person.PersonConfigForm,app.modules.form.TableFormView,{
	doNew: function(){
		app.modules.config.person.PersonConfigForm.superclass.doNew.call(this)
		var form = this.form.getForm()
		var organizField = form.findField(this.organizCode)
		var node = this.opener.node
		if(organizField && node){
			organizField.setValue({key:node.id,text:node.text})
		}
		var personField = form.findField(this.personId)
		if(!personField.hasListener("blur")){		
		    personField.on("blur",this.changeValue,this)
		}
		var cardnum = form.findField("cardnum")
		if(!cardnum.hasListener("blur")){
		    cardnum.on("blur",this.setBirthday,this)
		}
		var img = form.findField("img")
		if(!img.hasListener("uploadSuccess")){
		    img.on("uploadSuccess",function(){
		       personField.disable()
		    },this)
		}
	},

	changeValue:function(field){		
		var v = field.getValue()
		if(v){
			var form = this.form.getForm()
		    form.findField("img").setValue(this.setImageName(v))
		    //field.disable()
		}
	},
	
	setBirthday:function(f){
	    var cardnum = f.getValue()
	    if(cardnum.length == 18){
	        var y = cardnum.substring(6,10)
	        var m = cardnum.substring(10,12)
	        var d = cardnum.substring(12,14)
	        var form = this.form.getForm()
	        form.findField("birthday").setValue(y+"-"+m+"-"+d)
	    }
	},
	
	initFormData:function(data){
		var img = data["img"]
		if(img && img.indexOf(this.image) != -1){  //判断数据库中是否为默认图片
		    data["img"] = this.setImageName(data[this.personId])
		}
	    app.modules.config.person.PersonConfigForm.superclass.initFormData.call(this,data)
	},

	saveToServer:function(saveData){
		var form = this.form.getForm()
		var f = form.findField("img")
		if(f && f.isDefaultImage()){
			saveData["img"] = this.folder + this.image
		}
		app.modules.config.person.PersonConfigForm.superclass.saveToServer.call(this,saveData)	
	},
	
	setImageName:function(v){
	    return this.folder + v + this.pfix
	}
})