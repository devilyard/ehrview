$package("app.lang")

$import("app.desktop.Module")

app.lang.UIModule = function(cfg){
	app.lang.UIModule.superclass.constructor.apply(this,[cfg]);
}

Ext.extend(app.lang.UIModule, app.desktop.Module, {
	mask:function(msg){
		var panel = arguments[1] || this.panel;
		if(panel && panel.el){
			panel.el.mask(msg,"x-mask-loading");
		}
	},
	unmask:function(){
		var panel = arguments[0] || this.panel;
		if(panel && panel.el){
			panel.el.unmask();
		}	
	},
	doAction: function(item,e){
		var cmd = item.cmd;
		var ref = item.ref;
		if(ref){
			this.loadRemote(ref,item);
			return;
		}
		var script = item.script
		cmd = cmd.charAt(0).toUpperCase() + cmd.substr(1);
		if(script){
			$require(script,[function(){
				eval(script + '.do' +cmd +'.apply(this,[item,e])');
			},this])
		}
		else{
			var action =  this["do"+cmd];
			if(action){
				action.apply(this,[item,e]);
			}
		}
	},
	createButtons:function(){
		var actions = this.actions;
		var buttons = [];
		if(!actions){
			return buttons;
		}
		var f1 =  112;
		for(var i = 0; i < actions.length; i ++){
			var action = actions[i];
			if(action.hide){
				continue;
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