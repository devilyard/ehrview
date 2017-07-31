$package("app.test")

$import("app.desktop.Module","util.rmi.jsonRequest")


app.test.today = function(cfg){
	this.name = "wuk"
	app.test.today.superclass.constructor.apply(this,[cfg])
}

Ext.extend(app.test.today, app.desktop.Module,{
	initPanel:function(){
		var cfg = {
			title:"test",
			html:"some thing.",
			tbar:this.createButtons()
		}
		var panel = new Ext.Panel(cfg);
		this.panel = panel;
		return panel;
	},
	doRequest:function(){
		util.rmi.jsonRequest({
			serviceId:"myRequest",
			name:this.name,
			age:27,
			address:"wen san lu"
		},function(code,msg,json){
			alert(code+"="+msg)
			alert(Ext.encode(json))
		},this)
	},
	doSayhi:function(){
		alert(this.name)
	},
	doAction: function(item,e){
		var cmd = item.cmd
		var ref = item.ref
		
		if(ref){
			this.loadRemote(ref,item)
			return;
		}
		var script = item.script
		if(cmd == "create"){
			if(!script){
				script = this.createCls
			}
			this.loadModule(script,this.entryName,item)
			return
		}
		if(cmd == "update" || cmd == "read"){
			var r = this.getSelectedRecord()
			if(r == null){
				return
			}
			if(!script){
				script = this.updateCls
			}
			this.loadModule(script,this.entryName,item,r)
			return
		}
		cmd = cmd.charAt(0).toUpperCase() + cmd.substr(1)
		if(script){
			$require(script,[function(){
				eval(script + '.do' +cmd +'.apply(this,[item,e])')	
			},this])
		}
		else{
			var action =  this["do"+cmd]
			if(action){
				action.apply(this,[item,e])
			}
		}
	},
	createButtons:function(){
		var actions = this.actions
		var buttons = []
		if(!actions){
			return buttons
		}
		var f1 =  112
		for(var i = 0; i < actions.length; i ++){
			var action = actions[i];
			if(action.hide){
				continue
			}
			var btn = {
				accessKey: f1 + i,
				text : action.name + "(F" + (i + 1) + ")",
				ref:action.ref,
				target : action.target,
				cmd : action.delegate || action.id,
				iconCls : action.iconCls || action.id,
				enableToggle : (action.toggle == "true"),
				script :  action.script,
				handler : this.doAction,
				scope : this
			}
			buttons.push(btn)
		}
		return buttons
	}
})