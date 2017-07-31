$package("app.biz")

$import("app.desktop.Module")

app.biz.Info = function(cfg){
   app.biz.Info.superclass.constructor.apply(this,[cfg])
}

Ext.extend(app.biz.Info, app.desktop.Module,{
   
	initPanel:function(){
	    Ext.MessageBox.show({
          title: '提示',
          msg: this.msg,
          buttons: Ext.MessageBox.OK,
          icon: Ext.MessageBox.INFO
       })
	}
})