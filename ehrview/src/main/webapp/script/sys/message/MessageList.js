$package("sys.message")
$import("app.modules.list.SelectListView", "org.ext.ux.grid.RowExpander")

sys.message.MessageList = function(cfg) {
	cfg.createCls = "sys.message.DoNewMessage"
	sys.message.MessageList.superclass.constructor.apply(this, [cfg])
}

Ext.extend(sys.message.MessageList, app.modules.list.SelectListView, {
	getCM : function(items) {
		var expander = new Ext.ux.grid.RowExpander({
			tpl : new Ext.XTemplate('<div style="padding:5px 5px 5px 62px;"><b>内容摘要:{CONTENT}</b> {content}</div>')
		});
		this.rowExpander = expander
		var sm = new Ext.grid.CheckboxSelectionModel();
		this.sm = sm
		sm.on("rowselect", function(sm, rowIndex, record) {
					if (this.mutiSelect) {
						this.selects[record.id] = record
					} else {
						this.singleSelect = record
					}
				}, this)
		sm.on("rowdeselect", function(sm, rowIndex, record) {
					if (this.mutiSelect) {
						delete this.selects[record.id]
					}
				}, this)
		var cm = [sm, expander]
		for (var i = 0; i < items.length; i++) {
			var it = items[i]
			if (it.display <= 0 || it.display == 2) {
				continue
			}
			if (it.expand) {
				continue
			}
			var width = parseInt(it.width || 80)
			var c = {
				header : it.alias,
				width : width,
				sortable : true,
				dataIndex : it.dic ? it.id + "_text" : it.id
			}
			if (it.id == "READFLAG") {
				c.renderer = function(value) {
					var str = ''
					if (value == 0) {
						str += '<Img Title="未读" src="resources/css/app/desktop/images/shared/icons/message/mail_box.png"/>'
					} else {
						str += '<Img Title="已读" src="resources/css/app/desktop/images/shared/icons/message/mail_open.png"/>';
					}
					return str;
				}
			}
			if (!this.isCompositeKey && it.pkey == "true") {
				c.id = it.id
			}
			cm.push(c)
		}
		return cm
	},

	doToDo : function() {
		var r = this.getSelectedRecord()
		if (r == null) {
			return
		}
		try {
			var backlog = eval("(" + r.get("BACKLOG") + ")");
			var desktop = this.mainApp.desktop
			if (backlog.app) {
				var topIndex = desktop.topview.store.indexOfId(backlog.app)
				desktop.onTopTabClick(desktop.topview, topIndex)
				desktop.topview.select(topIndex)
			}
			if (backlog.module) {
				var navIndex = desktop.moduleView[backlog.catalogId].store
						.indexOfId(backlog.module)
				desktop.onNavClick(desktop.moduleView[backlog.catalogId],
						navIndex)
			}
		} catch (e) {
			alert("无此模块待办事件")
			return
		}
		var win = this.opener;
		win.getWin().hide()
	},
	doReadded : function(r) {
		var r = this.getSelectedRecord()
		if (r == null) {
			return
		}
		util.rmi.jsonRequest({
					serviceId : "message",
					schema : "SYS_MESSAGE",
					operate : "readMessage",
					messageId : r.get("ID")
				}, function(code, msg, json) {
					Ext.get("mn").dom.innerHTML = json.num
					r.set("READFLAG", 1)
					r.commit()
					this.opener.getTreeNum()
				}, this)
	},
	doRemove : function() {
		var r = this.getSelectedRecord()
		if (r == null) {
			return
		}
		Ext.Msg.show({
					title : '确认删除记录',
					msg : '删除操作将无法恢复，是否继续?',
					modal : true,
					width : 300,
					buttons : Ext.MessageBox.OKCANCEL,
					multiline : false,
					fn : function(btn, text) {
						if (btn == "ok") {
							this.processRemove();
						}
					},
					scope : this
				})
	},
	processRemove : function() {
		var messageId = []
		var records = this.getSelectedRecords();
		if (records == null) {
			return
		}
		for (var i = 0; i < records.length; i++) {
			var record = records[i]
			messageId.push(record.get("ID"))
		}
		this.mask("在正删除数据...");
		util.rmi.jsonRequest({
					serviceId : "message",
					schema : "SYS_MESSAGE",
					operate : "deleteMessages",
					messageId : messageId,
					type:this.opener.selectId
				}, function(code, msg, json) {
					this.unmask()
					if (code < 300) {
						for (var i = 0; i < records.length; i++) {
							var record = records[i]
							this.store.remove(record)
						}
					} else {
						this.processReturnMsg(code, msg, this.doRemove)
					}
				}, this)
	},
	getCndBar : function(items) {
		var fields = [];
		for (var i = 0; i < items.length; i++) {
			var it = items[i]
			if (!(it.queryable == "true")) {
				continue
			}
			fields.push({
						value : i,
						text : it.alias
					})
		}
		if (fields.length == 0) {
			return fields;
		}
		var store = new Ext.data.JsonStore({
					fields : ['value', 'text'],
					data : fields
				});
		var combox = new Ext.form.ComboBox({
					store : store,
					valueField : "value",
					displayField : "text",
					mode : 'local',
					triggerAction : 'all',
					emptyText : '选择查询字段',
					selectOnFocus : true,
					editable : false,
					width : 120
				});
		combox.on("select", this.onCndFieldSelect, this)
		this.cndFldCombox = combox
		var textField = new Ext.form.TextField({
					name:"text",
					width : 200,
					selectOnFocus : true
				})
		var dateField = new Ext.form.DateField({
					name:"date",
					width : 200,
					emptyText  : "请选择日期",
					format : 'Y-m-d',
					hidden:true
				})
		this.textField = textField
		this.dateField = dateField
		var queryBtn = new Ext.Toolbar.Button({
					iconCls : "query"					
				})
		this.queryBtn = queryBtn;
		queryBtn.on("click", this.doCndQuery, this);
		return [combox, '-', textField,dateField, '-', queryBtn]
	},
	onCndFieldSelect : function(item, record, e) {
		var tbar = this.grid.getTopToolbar()
		var index = record.data.value
		var it = this.schema.items[index]
		if(it.id=="SENDDATE"){
			var field = this.dateField
			field.show()
			this.textField.hide()
		}else{
			var field = this.textField
			field.show()
			this.dateField.hide()
		}
		this.cndField = field
	},
	doCndQuery : function() {
		var f = this.cndField;
		var v = f.getValue()
		if (v == "") {
			return
		}
		var cnds={userCnd:['eq',['$','RECEIVER_USERS'],['s',this.mainApp.uid]],
				  notBL:['isNull',['s','is'],['$','BACKLOG']],
				  isBL:['isNull',['s','not'],['$','BACKLOG']],
				  send: ['eq',['$','SENDER'],['s',this.mainApp.uid]],
				  del:['eq', ['$', 'DELFLAG'], ['i', 0]],
				  sysDel:['eq', ['$', 'SYS_DELFLAG'], ['i', 0]]
				}
		if(f.name=="text"){
			var cnd = [['like',['$','SUBJECT'],['s',v+'%']]]
		}
		if(f.name=="date"){
			var v1=v.format("Y-m-d")
			v.setDate(v.getDate()+1)
			v = v.format("Y-m-d")
			var cnd = ['lt',['$','SENDDATE'],['date',v]]
			var cnd1= ['gt',['$','SENDDATE'],['date',v1]]
			cnd=[cnd,cnd1]
		}
		var d=this.opener.selectId
		switch(true){
			case d==1:	cnd=['and',cnds.del,cnds.userCnd,cnds.notBL].concat(cnd)
				break
			case d==2:	cnd=['and',cnds.del,cnds.userCnd,cnds.isBL].concat(cnd)
				break
			case d==3:  cnd=['and',cnds.sysDel,cnds.send].concat(cnd)
			    break;
		}
			this.requestData.cnd = cnd
			this.refresh()
	},
	onRowClick : function() {
		if (this.opener.selectId == 3) {
			return
		}
		var r = this.getSelectedRecord()
		if (r.get("READFLAG") == 0) {
			this.doReadded(r)
		}
	},

	onDblClick : function() {
		if (this.opener.selectId == 2) {
			this.doToDo()
		}
	},
	beforeLayout : function(tbar) {
		tbar.get(5).hide()
	}

})