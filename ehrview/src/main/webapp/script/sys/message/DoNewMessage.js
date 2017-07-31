$package("sys.message")
$import("app.modules.form.TableFormView", "util.dictionary.TreeCheckDicFactory")

sys.message.DoNewMessage = function(cfg) {
	cfg.createCls = "sys.message.DoNewMessage"
	cfg.actions = [
		{id:"new",name:"新建"},
		{id:"save",name:"发送"},
		{id:"cancel",name:"取消",iconCls:"common_cancel"}
	]
	sys.message.DoNewMessage.superclass.constructor.apply(this, [cfg])
}

Ext.extend(sys.message.DoNewMessage, app.modules.form.TableFormView, {
	createField : function(it) {
		var defaultWidth = this.fldDefaultWidth || 200
		var cfg = {
			name : it.id,
			fieldLabel : it.alias,
			xtype : it.xtype || "textfield",
			vtype : it.vtype,
			width : defaultWidth,
			enableKeyEvents : it.enableKeyEvents,
			labelSeparator : ":"
		}
		cfg.listeners = {
			specialkey : this.onFieldSpecialkey,
			scope : this
		}
		if (it.onblur) {
			var func = eval("this." + it.onblur)
			if (typeof func == 'function') {
				Ext.apply(cfg.listeners, {
							blur : func
						})
			}
		}
		if (it['not-null'] == "1" || it['not-null'] == "true") {
			cfg.allowBlank = false
			cfg.invalidText = "必填字段"
		}
		if(it.fixed == "true"){
			cfg.disabled = true
		}
		if (it.id == "RECEIVER_USERS") {
			cfg.readOnly = true
			cfg.colspan = it.colspan
			cfg.anchor = "100%"
			var cfg1 = new Ext.Toolbar({
				items : [{
						xtype : 'button',
						iconCls : 'mail_recipient',
						text : '添加用户',
						scope:this,
						handler : function() {
							this.getSelectWin();
						}
						}, {
						xtype : 'button',
						text : '添加所有用户',
						iconCls : 'empi_combination',
						scope:this,
						handler : function() {
							this.form.getForm().findField("RECEIVER_USERS").setValue("所有用户")
							this.usersId="allUsers"
						}
						}, {
						xtype : 'button',
						text : '重置',
						iconCls : 'common_reset',
						scope:this,
						handler : function() {
							this.form.getForm().findField("RECEIVER_USERS").reset()
							this.usersId=""
						}
						}]
				})
			return [cfg, cfg1]
		}
		if(it.dic&&it.id != "SENDER"){
			it.dic.src = this.entryName + "." + it.id
			it.dic.defaultValue = it.defaultValue
			it.dic.width = defaultWidth
			var combox = this.createDicField(it.dic)
			Ext.apply(combox,cfg)
			combox.on("specialkey",this.onFieldSpecialkey,this)
			return combox;
		}
		switch (it.type) {
			case 'int' :
			case 'double' :
			case 'bigDecimal' :
				cfg.xtype = "numberfield"
				if (it.type == 'int') {
					cfg.decimalPrecision = 0;
				} else {
					cfg.decimalPrecision = it.precision || 2;
				}
				break;
			case 'date' :
				cfg.xtype = 'datefield'
				cfg.emptyText = "请选择日期"
				cfg.format = 'Y-m-d'
				break;

		}
		if (it.length) {
			cfg.maxLength = it.length;
		}
		return cfg;
	},
	doSave : function() {
		var form = this.form.getForm()
		if (!this.validate()) {
			return
		}
		if (!this.schema) {
			return
		}
		var values = {};
		var items = this.schema.items
		if (items) {
			var n = items.length
			for (var i = 0; i < n; i++) {
				var it = items[i]
				if (it.display == "1" || it.display == "0") {
					continue;
				}
				var f = form.findField(it.id)
				if (f) {
					var v = f.getValue()
				}
				values[it.id] = v;
			}
		}
		if(this.usersId){
			values.RECEIVER_USERS=this.usersId
		}
		if(values.RECEIVER_USERS==""&&values.RECEIVER_ROLES==""&&values.RECEIVER_UNITS==""){
			Ext.Msg.alert("信息提示","用户，角色或部门不能都为空")
			return
		}
		if(!values.PERIOD==""){
			var date=values.PERIOD.setDate(values.PERIOD.getDate()+1)
			if(date<new Date()){
				Ext.Msg.alert("信息提示","有效期应该大于当前日期，请重新选择")
				return
			}
		}
		values.SENDER=this.mainApp.uid
		this.saveToServer(values)
	},
	saveToServer : function(saveData) {
		this.form.el.mask("在正保存数据...", "x-mask-loading")
		util.rmi.jsonRequest({
					serviceId : "message",
					operate : "createMessage",
					schema : "SYS_MESSAGE",
					body : saveData
				}, function(code, msg, json) {
						this.form.el.unmask()
					if(code==200){
						Ext.Msg.alert("信息提示","消息发送成功")
						this.opener.store.reload();
					}else{
						Ext.Msg.alert("信息提示","消息发送失败")
					}
				}, this)
	},
	doNew : function() {
		var form = this.form.getForm()
		form.reset();
		form.findField("SENDER").setValue(this.mainApp.uname)
		this.usersId=""
	},
	getSelectWin : function() {
		var win = this.selectUsers;
		if (!win) {
			$import("sys.message.SelectUserView")
			var selectUsers=new sys.message.SelectUserView();
			selectUsers.gridModule.on("select",this.addUser);
			selectUsers.opener=this
			this.selectUsers=selectUsers
			win = this.selectUsers;
		}
		win.gridModule.requestData.cnd = ['eq', ['$', 'domain'], ['s', 'configuration']]
		win.gridModule.refresh()
		win.getWin().show()
	},
	addUser:function(r){
		if(r==""){
			return
		}
		var userField=this.opener.opener.form.getForm().findField("RECEIVER_USERS")
		var users=userField.getValue()
		outer:
		for(var i=0;i<r.length;i++){
			var newUser=r[i].get("personName")
			var us= users.split(",")
			for(var j=0;j<us.length;j++){
				if(us[j]==newUser){
					continue outer;
				}
			}
			var newUserId=r[i].get("userId")
			if(users==""){
				users=newUser
				this.opener.opener.usersId=newUserId
			}else{
				users+=","+newUser
				this.opener.opener.usersId+=","+newUserId
			}
		}
		userField.setValue(users)
	}
})