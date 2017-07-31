$package("app.desktop.plugins")
$import(
	"util.rmi.jsonRequest"
)
app.desktop.plugins.PasswordChanger = function(config){
	this.forConfig = false
	this.deep = false
	app.desktop.plugins.PasswordChanger.superclass.constructor.apply(this,[config]);
}

Ext.extend(app.desktop.plugins.PasswordChanger, app.desktop.Module,{
	initPanel:function(){
		var form = new Ext.FormPanel({
			frame: true,
			labelWidth: 75,
			labelAlign: 'top',
			defaults: {width: '95%'},
			defaultType: 'textfield',
			shadow:true,
			items: [
			{
				fieldLabel: '请输入原密码',
                name: 'psw',
                inputType:'password'
            },{
                fieldLabel: '请输入新密码',
                name: 'newPsw',
                inputType:'password'
            },{
                fieldLabel: '请重输新密码',
                name: 'rePsw',
                inputType:'password'
            }
            ]
		})
		var fldPsW = form.items.item(0)
		var fldNewPsw = form.items.item(1)
		var fldRePsw = form.items.item(2)
		
		fldPsW.on("specialkey",function(f,e){
			if(e.getKey() == e.ENTER){
				if(f.getValue){
					form.items.item(1).focus(true);
				}
			}
			
		},this)
		fldNewPsw.on("specialkey",function(f,e){
			if(e.getKey() == e.ENTER){
				form.items.item(2).focus(true);
			}
			
		},this)
		fldRePsw.on("specialkey",function(f,e){
			if(e.getKey() == e.ENTER){
				this.doPasswordChange()
			}
		},this)
		
		this.form = form
		this.addPanelToWin()		
		return this.form
	},
	
	addPanelToWin:function(){
	    var win = this.getWin();
		win.add(this.form)
		if(win.el){
			win.doLayout()
		}
	},
	
	getWin:function(){
		var win = this.win
		if(!win){
			win = new Ext.Window({
					layout:"form",
					title:this.title || '修改密码',
					width:400,
					height:235,
					resizable:true,
					modal:true,
					iconCls: 'x-logon-win',
					closeAction:'hide',
					constrainHeader:true,
					shim:true,
					//items:this.form,
					buttonAlign:'center',
					closable:true,
					buttons: [
					{
			            text: '确定',
			            handler:this.doPasswordChange,
			            scope:this
			        },
			        {
			            text: '取消',
			            handler:this.doCancel,
			            scope:this
			        }						       
			        ]
				})
				win.on("show",this.onWinShow,this)
				this.win = win;
		}
		win.doLayout();
		return win
	},
	doCancel:function(){
		this.win.hide()
	},
	onWinShow:function(){
		this.form.getForm().reset()
		var items = this.form.items
		items.item(0).focus(true,500)
		
		var form = this.form.getForm()
		var psw = form.findField("psw")
		var newPsw = form.findField("newPsw")
		var rePsw = form.findField("rePsw")
		psw.markInvalid("原密码不能为空")
		newPsw.markInvalid("新密码不能为空")
		rePsw.markInvalid("新密码重复输入不一致");
		
/*		
		var items = this.form.items
		items.item(0).focus(true,500)
		*/
	},
	doPasswordChange:function(){
		var form = this.form.getForm()
		var psw = form.findField("psw")
		var newPsw = form.findField("newPsw")
		var rePsw = form.findField("rePsw")
		if(psw.getValue() == ""){
			psw.markInvalid("原密码不能为空")
			return
		}
		if(newPsw.getValue() != rePsw.getValue()){
			rePsw.markInvalid("新密码重复输入不一致");
			return;
		}
		this.win.el.mask("正在修改密码...")
		util.rmi.jsonRequest({
			serviceId:"passwordChanger",
			psw:psw.getValue(),
			newPsw:newPsw.getValue()
		},
		function(code,msg,json){
			this.win.el.unmask()
			if(code == 200){
				this.mainApp.locked = false
				this.win.hide();
			}
			else{
				if(msg == "NotLogon"){
				     this.mainApp.logon(this.doPasswordChange,this,[])
				     return
			    }  
				var msg = "";
				if(code == 501){
					msg = "修改密码:原密码错误"
				}
				if(code == 500){
					msg = "修改密码:数据操作失败"
				}
				this.win.setTitle(msg)
			}
		},this)
	}
})
