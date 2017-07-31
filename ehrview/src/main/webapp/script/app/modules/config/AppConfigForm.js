$package("app.modules.config")

$import("app.modules.form.TableFormView")

app.modules.config.AppConfigForm = function(cfg){
	cfg.actions = [
		{id:"save",name:"保存"}
	]
	cfg.width = 300
	app.modules.config.AppConfigForm.superclass.constructor.apply(this,[cfg])
}

Ext.extend(app.modules.config.AppConfigForm, app.modules.form.TableFormView,{
	initPanel:function(){
		var sc = {items:[
			{id:"id",alias:"应用标识",acValue:"1111",update:"false",colspan:3,"not-null":1},
			{id:"title",alias:"应用名称",acValue:"1111",colspan:3,"not-null":1}
		]}
		return app.modules.config.AppConfigForm.superclass.initPanel.call(this,sc)
	},
	saveToServer:function(saveData){
		this.saving = true
		this.form.el.mask("在正保存数据...","x-mask-loading")
		saveData.op = this.op
		util.rmi.jsonRequest({
				serviceId:"configuration",
				className:"ApplicationConfig",
				operate:"saveApp",
				body:saveData
			},
			function(code,msg,json){
				this.form.el.unmask()
				this.saving = false
				if(code > 300){
					this.processReturnMsg(code,msg,this.saveToServer,[saveData]);
					return
				}
				Ext.apply(this.data,saveData);
				if(json.body){
					this.initFormData(json.body)
					this.form.setTitle(json.body.title)
					this.fireEvent("save",this.op,this.data)
				}
				this.op = "update"
			},
			this)
	}
})