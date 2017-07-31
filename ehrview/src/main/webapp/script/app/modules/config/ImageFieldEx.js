$package("app.modules.config")
$import(
   "app.modules.config.person.ImageFileUploader"
)

app.modules.config.ImageFieldEx = function(config){
	//this.folder = "photo/"
	this.image = "photo/default.jpg"
	this.isUpdate = false
    Ext.apply(this, config);
    app.modules.config.ImageFieldEx.superclass.constructor.call(this);
    this.height = 115
	this.width = 120
};

Ext.extend(app.modules.config.ImageFieldEx, Ext.form.Field, {
	onRender : function(ct, position){
        app.modules.config.ImageFieldEx.superclass.onRender.call(this, ct, position);
  		var src = ClassLoader.appRootOffsetPath + this.image + "?temp=" + new Date().getTime()
        var imgEl = ct.createChild({tag:"img",height:this.height,width:this.width,aglin:"center",src:src})
       	this.el.setStyle('display','none')
       	imgEl.on("contextmenu",this.onContextMenu,this);
       	this.imgEl = imgEl
       	var v = this.value
	    if(v){
			this.setImage(v)
       	}
    },
    
    onContextMenu:function(e){
    	e.stopEvent()
    	if(this.disabled){
    		return;
    	}
    	var cmenu = this.contextMenu
    	if(!cmenu){
    		cmenu = new Ext.menu.Menu({
    			items:[
    				{cmd:"new",text:"上传图片"},
    				{cmd:"update",text:"修改图片"}
    			]
			})
			cmenu.on("itemclick",this.onMenuItemClick,this)
			this.contextMenu = cmenu
    	}
    	if(this.isUpdate){
    		cmenu.items.item(0).disable()
    		cmenu.items.item(1).enable()
    	}else{
    		cmenu.items.item(0).enable()
    		cmenu.items.item(1).disable()
    	}
		cmenu.showAt([e.getPageX()+5,e.getPageY()+5])
    },
    
    onMenuItemClick:function(item,e){
    	if(!this.value){
    		Ext.Msg.alert("错误","请先填写人员编号")
    		return
    	}
    	var cmd = item.cmd
    	var uploader = this.uploader
    	if(!uploader){
    		uploader = new app.modules.config.person.ImageFileUploader(['gif','jpg','jpeg','bmp','png'])
    		uploader.on("uploadSuccess",this.onUpload,this)
    		this.uploader = uploader
    	}
    	uploader.setUpdateFields(this.value)
    	uploader.show(null,[e.getPageX(),e.getPageY()])
    },
    
    onUpload:function(state,id){
    	this.isUpdate = true
    	var src = ClassLoader.appRootOffsetPath + id + "?temp=" + new Date().getTime()
    	if(this.imgEl){
    	    this.imgEl.dom.src = src  	
    	}
    	this.fireEvent("uploadSuccess",200,id)
    },
    
    setValue:function(v){
    	app.modules.config.ImageFieldEx.superclass.setValue.call(this, v);
    	this.value = v;
    	if(this.rendered){
    	    this.setImage(v)
    	}
    },
    
    setImage:function(id){
    	this.isUpdate = true
		var id = this.value		
		if(!id){
			id = this.image
			this.isUpdate = false
		}	
		var src = ClassLoader.appRootOffsetPath + id + "?temp=" + new Date().getTime()
	    if(this.imgEl){		    	
   			this.imgEl.dom.src = src  			
   			var defaultSrc = ClassLoader.appRootOffsetPath + this.image
   			var obj = this
   			this.imgEl.dom.onerror = function(){
   			    this.src = defaultSrc
   			    this.onerror = null
   			    obj.isUpdate = false
   			}
    	}
    },
    
    getName:function(){
   		return this.name;
    },
    
    isDefaultImage:function(){
    	return !this.isUpdate
    },
    
    destory:function(){
		if(this.contextMenu){
			var el = this.contextMenu.el
			el.remove()
			this.contextMenu.removeAll();			
		}
    }
    
});
Ext.reg('imagefieldex', app.modules.config.ImageFieldEx);