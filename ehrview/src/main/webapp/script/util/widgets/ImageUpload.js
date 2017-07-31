$package("util.widgets")
$import("util.fileUploader.SingleFileUploader")
util.widgets.ImageUpload = function(config) {
	// this.hideLabel = true
	this.width = 120
	this.labelSeparator = ""
	this.height = 115
	Ext.apply(this, config);
	util.widgets.ImageUpload.superclass.constructor.call(this);
};

Ext.extend(util.widgets.ImageUpload, Ext.form.Field, {
	onRender : function(ct, position) {
	    util.widgets.ImageUpload.superclass.onRender.call(this, ct,position);
		var src = ClassLoader.appRootOffsetPath + "image/0.jpg?temp=" + new Date().getTime()
		var imgEl = ct.createChild({
							tag : "img",
							height : this.height,
							width : this.width,
							aglin : "center",
							src : src
						})
				this.el.setStyle('display', 'none')
				imgEl.on("contextmenu", this.onContextMenu, this);
				this.imgEl = imgEl
				var v = this.value
				if (v) {
					this.setImage(v)
				}
			},
			
			onContextMenu : function(e) {
				e.stopEvent()
				if (this.disabled) {
					return;
				}
				var cmenu = this.contextMenu
				if (!cmenu) {
					cmenu = new Ext.menu.Menu({
								items : [{
											cmd : "new",
											text : "上传图片"
										}, {
											cmd : "update",
											text : "修改图片"
										}]
							})
					cmenu.on("itemclick", this.onMenuItemClick, this)
					this.contextMenu = cmenu
				}
				if (this.value) {
					cmenu.items.item(0).disable()
					cmenu.items.item(1).enable()
				} else {
					cmenu.items.item(0).enable()
					cmenu.items.item(1).disable()
				}
				cmenu.showAt([e.getPageX() + 5, e.getPageY() + 5])
			},
			onMenuItemClick : function(item, e) {
				var cmd = item.cmd
				var uploader = this.uploader
				if (!uploader) {
					uploader = new util.fileUploader.SingleFileUploader(['jpg', 'jpeg'])
					uploader.on("uploadSuccess", this.onUpload, this)
					this.uploader = uploader
				}
				if (cmd == "new") {
					uploader.setUpdateFileId("")
					uploader.show(null, [e.getPageX() + 5, e.getPageY() + 5])
				}
				if (cmd == "update") {
					uploader.setUpdateFileId(this.value)
					uploader.show(null, [e.getPageX() + 5, e.getPageY() + 5])
				}
			},
			onUpload : function(state, id) {
				this.setValue("photo/"+id);
			},
			setValue : function(v) {
				util.widgets.ImageUpload.superclass.setValue.call(this, v);
				this.value = v;
				if (this.rendered) {
					this.setImage(v)
				}
			},
			setImage : function(id) {
				var src = "";
				var id = this.value
				if (!id) {
					id = "default.jpg";
					src = ClassLoader.appRootOffsetPath + "photo/" + id
							+ "?temp=" + new Date().getTime()
				} else {
					src = ClassLoader.appRootOffsetPath + id
							+ "?temp=" + new Date().getTime()
				}
				if (this.imgEl) {
					this.imgEl.dom.src = src
				}
			},
			getName : function() {
				return this.name;
			},
			destory : function() {
				if (this.contextMenu) {
					var el = this.contextMenu.el
					el.remove()
					this.contextMenu.removeAll();
				}
			}

		});
Ext.reg('imageupload', util.widgets.ImageUpload);