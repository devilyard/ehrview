$package("app.biz.widgets")

$import("util.widgets.ImageField","app.biz.widgets.MyFileUploader")

app.biz.widgets.MyImageField = function(config){
    app.biz.widgets.MyImageField.superclass.constructor.apply(this,[config]);
    this.height = "130"
    this.width = "100"
};

Ext.extend(app.biz.widgets.MyImageField, util.widgets.ImageField, {
	onRender : function(ct, position){
        util.widgets.ImageField.superclass.onRender.call(this, ct, position);
//  		var src = ClassLoader.appRootOffsetPath + "photos/10000.jpg?mpiId=10000&temp=" + new Date().getTime()
        var src = "";
        var imgEl = ct.createChild({tag:"img",width:this.width,height:this.height,aglin:"center",src:src})
       	this.el.setStyle('display','none')
       	imgEl.on("contextmenu",this.onContextMenu,this);
       	this.imgEl = imgEl
       	var v = this.value
	    if(v){
			this.setImage(v)
       	}
    },
    setValue:function(v){
     	if(!v || v == "0" || v == "1"){
     		return
     	}
     	this.value = v;
     	util.widgets.ImageField.superclass.setValue.call(this, v);
    	if(this.rendered){
    		this.setImage(v);
    	}
    },
    onMenuItemClick:function(item,e){
    	var cmd = item.cmd
    	var uploader = this.uploader
    	if(!uploader){
    		uploader = new app.biz.widgets.MyFileUploader(['gif','jpg','jpeg','png'])
    		uploader.on("uploadSuccess",this.onUpload,this)
    		this.uploader = uploader
    	}
 		uploader.setUpdateFileId(this.value)
 		uploader.show(null,[e.getPageX()+5,e.getPageY()+5])
 		
    },
    
    onUpload:function(state,id){
    	this.setValue(id);
    	this.fireEvent("upload");
    },
    setImage:function(id){
    	var src = "";
		if(!id){
			return;
		}
		src = ClassLoader.appRootOffsetPath + "photos/" + id + ".jpg?mpiId="+id+"&temp=" + new Date().getTime()
	    if(this.imgEl){
   			this.imgEl.dom.src = src
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
    						{cmd:"update",text:"修改图片"}
    					]
					})
			cmenu.on("itemclick",this.onMenuItemClick,this)
			this.contextMenu = cmenu
    	}
		cmenu.showAt([e.getPageX()+5,e.getPageY()+5])
    },
	setContextMenuDisable : function(f){
		this.disabled = f;
	}
});
Ext.reg("myImageField",app.biz.widgets.MyImageField);

