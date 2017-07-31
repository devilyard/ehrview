$package("sys.auth.NodeAuthForm")

$import("app.modules.form.TableFormView")

sys.auth.NodeAuthForm = function(cfg){
	
	sys.auth.NodeAuthForm.superclass.constructor.apply(this,[cfg]);
}

Ext.extend(sys.auth.NodeAuthForm,app.modules.form.TableFormView,{
	createButtons:function(){
		if(this.actions && this.actions.length > 0){
			this.actions = this.actions.slice(1);
		}
		return sys.auth.NodeAuthForm.superclass.createButtons.call(this);
	},
	initPanel:function(sc){
		var form =  sys.auth.NodeAuthForm.superclass.initPanel.call(this,sc);
		form.add({
			xtype:"label",
			text:"(修改状态需要重启节点)",
			style:{
				color:"red"
			}
		})
		return form
	}
})