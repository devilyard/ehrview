$package("app.viewport")
$import(
        "util.rmi.miniJsonRequestSync")

app.viewport.Logon = function(config){
	this.forConfig = false
	this.deep = false
	this.photoHome = "photo/"
	app.viewport.Logon.superclass.constructor.apply(this,[config]);
}

Ext.extend(app.viewport.Logon, app.desktop.Module,{
	init:function(){			
	   	this.dataMap = new Ext.util.MixedCollection();
	   	this.addEvents({
			"logonSuccess":true,
			"logonCancel":true
		})		
		this.initPanel()			
	},
	
	initPanel:function(){	
		var user = this.createUserCombox();
		user.focus(200);
	    this.user = user	    
	    var role = this.createRoleCombox()
	    this.role = role
		//user.setValue("system");
//		role.setValue("system");
	    var pwdEL = Ext.get("pwd")
		this.pwdEL = pwdEL
		pwdEL.on("blur",this.loadRole,this)
		
		user.on("keypress",function(f,e){
			if(e.getKey() == e.ENTER){
				var raw = user.getRawValue()
				if(raw){
					user.beforeBlur()
				    this.pwdEL.focus(true)			   
				}				
			}			
		},this)		
		
		pwdEL.on("keypress",function(e){
			if(e.getKey() == e.ENTER){
				if(pwdEL.getValue()){
				   this.role.focus(true)
				}				
			}			
		},this)
		
		role.on("keypress",function(f,e){
			if(e.getKey() == e.ENTER){
				this.doLogon();
			}
		},this)
		
		var logon = Ext.get("logon")		
		logon.on("click",this.doLogon,this)
		//var cancle = Ext.get("cancle")
		//cancle.on("click",this.doCancel,this)  
		
	},
	
	createUserCombox:function(){
		var data = this.getCookieValue()

		var store = new Ext.data.JsonStore({
              root:'body',
              id:'userId',
              data:data,
              fields:['userId','userName','userPic']
        })
		
		var tpl = new Ext.XTemplate(
			'<tpl for=".">'+
            '<ul class="u" onmouseover="this.className=\'us\';" onmouseout="this.className=\'u\';">'+
            '<li><img src="{userPic}" width="30" height="30" /></li>'+
            '<li>{userName}</li>'+
            '<span id="{userId}">X</span>'+
            '</ul></tpl>'
		)

		var userCombox = new Ext.form.ComboBox({
		 	    tpl:tpl,
                store:store,         
                minChars:2,
                selectOnFocus:true,
                enableKeyEvents:true,
                editable:true,
                valueField:'userId',
                displayField:'userName',
                triggerAction: "all",
                mode: 'local',
				itemSelector:"ul",
                width: 155,
                renderTo :"usertext"
        })

        userCombox.on("expand",function(){
        	for(var i=0; i<data.body.length; i++){
        		var img = data.body[i].userId       	    
        	    if(!this.dataMap.containsKey(img)){
        	        var el = Ext.get(img)
        	        el.on("click",this.deleteUserCache,this)
        	        this.dataMap.add(img,el)
        	    }        	    
        	}
        },this)  
        userCombox.on("blur",this.loadRole,this)

        return userCombox
	},
	
	setUserImg:function(pic){
	   	var img = Ext.fly("pop").dom
	   	img.src = pic
	   	
	},
	
	createRoleCombox:function(){
		var com = new Ext.form.ComboBox({
			 width: 155,
			 displayField:'text',
			 valueField:'key',
			 autoSelect:true,
			 editable:false,
			 mode: 'local',
			 triggerAction: 'all',
			 renderTo :'select-role',
			 enableKeyEvents :true,
             store:new Ext.data.JsonStore({
		          root:"body",
		          data:{body:[]},
		          fields: ['key','text']	
		     })
		})
		com.store.on("load",function(s,rs){
			com.setValue(rs[0].data.key)
		},this)
		return com
	},
	
	loadRole:function(){
		var uid = this.user.getValue();
		var pwd = this.pwdEL.getValue();
		if(!uid || !pwd){
		    return
		}
		var key = uid + pwd
	//先有缓存中读取	
		if(this.dataMap.containsKey(key)){
		   var data = this.dataMap.get(key)
		   this.role.setRawValue("")
		   this.role.getStore().loadData(data)
		   this.forbid = false
           return
		}
		var json = util.rmi.miniJsonRequestSync({
		     serviceId:'roleLocator',
		     uid:uid,
		     psw:pwd
		})
		if(json.code == 200){
			var rec = json.json
			this.role.setRawValue("")
			this.role.getStore().loadData(rec)
			this.dataMap.add(key, rec)

			this.setUserImg(rec.img)
			this.forbid = false
		}else{
			this.role.clearValue()
			this.role.getStore().removeAll()
			if(json.code == 407 || json.code == 406){
				this.forbid = true
				this.messageDialog("错误","用户不存在或已禁用",Ext.MessageBox.ERROR)
			}else if(json.code == 408){
			    this.messageDialog("错误","密码错误",Ext.MessageBox.ERROR)
			}
		}
		
	},
	
	createCombox:function(r, rec){
	    r.length = 0
	    for(var i=0; i<rec.length; i++){
	       var p = document.createElement("option")
	       p.value = rec[i]['key']
	       p.text = rec[i]['text']
	       r.options.add(p)
	    }
	},
	
	doLogon:function(){
		var uid = this.user.getValue().trim()
		var uname = this.user.getRawValue().trim()
		var pwd = this.pwdEL.getValue();
		var urole = this.role.getValue()

		if(this.mainApp){
		   urole = this.mainApp.jobId
		}
		if(!uid || !pwd || this.forbid){
			return;
		}
		
		if(!urole){
			this.messageDialog("错误","请选择登陆角色!",Ext.MessageBox.ERROR)
		    return
		}
		
		this.deep = false
		var url = ClassLoader.serverAppUrl || ""
		var queryString = ''
		// @@ 截取url里的参数
		if (location.href.indexOf("?") != -1) {
			queryString = location.href.substring(location.href.indexOf("?"))
		}
		var con = new Ext.data.Connection();
			con.request({
				url:url + "*.jsonRequest" + queryString,
				method:"POST",
				callback:complete,
				scope:this,
				jsonData:{deep:this.deep,forConfig:this.forConfig,serviceId:'logon',uid:uid,psw:pwd,urole:urole}
			})
			
			function complete(ops,sucess,response){
				var msg = "";
				
				if(!sucess){
					msg = "通讯错误"
				}
				else{					
					var res = eval("(" + response.responseText + ")")
					var code = res['x-response-code']
					if(code == 504){
						msg =  "该用户不存在"
						this.user.focus(true);
					}
					if(code == 501){
						msg =  "密码不正确"
						this.pwdEL.focus(true);
					}
					if(code == 200){
						//res.layout = layout
						this.addCookie(uid,res.userName,res.img)
						this.fireEvent("logonSuccess",res);
					}
					if(code == 402){
						msg =  "没有权限"					
					}
					// @@ added by chinnsii, 如果gotoViewPortal=true表示url里带mpiId参数，这时登录后直接到EHRView浏览界面。
					if (res.gotoViewPortal) {
						window.location = "pages/viewPortal.html?vk=" + res.vk;
					}
					// @@ end
				}
				if(msg.length > 0){
					Ext.Msg.alert("提示","登录" + "[" + msg +"]");
				}
			}
	},
	
	getCookieValue:function(){
		var data = {body:[]}
	    var cookie = this.getCookie()
	    var cs = cookie.split(";")
	    for(var i=0; i<cs.length; i++){
	    	var v = cs[i].split("=")
	    	if(v.length == 1){
	    	   break
	    	}
	    	var uid = v[0].trim()
	    	var temp = v[1].split("@")
	    	if(temp.length != 2){
	    	    continue
	    	}	    	
	    	var uname = unescape(temp[0])
	    	if(uname == "del"){
	    	    continue
	    	}
	    	var upic = temp[1]
	    	var o = {userId:uid,userName:uname,userPic:upic}
	    	data.body.push(o)
	    }
	    return data
	},
	
	addCookie:function(userId, userName, userPic){
	    var date = new Date()
	    date.setTime(date.getTime() + 30*24*3600*1000)
	    document.cookie = userId + "=" + escape(userName) +"@"+ userPic +"; expires=" + date.toGMTString()
	},
	
	getCookie:function(){
	    return document.cookie;	    
	},
	
	deleteCookie:function(userId){
        var date=new Date();
        date.setTime(date.getTime()-100000);
        document.cookie=userId +"=del@del; expire="+date.toGMTString();
	},
	
	deleteUserCache:function(e,element){
	    var uid = element.id
	    var store = this.user.getStore()
	    var r = store.getById(uid)
	    store.remove(r)
	    this.deleteCookie(uid)
	    this.dataMap.remove(uid)
	    
	},
		
	doCancel:function(){
	   alert("cancle")
	   this.deleteCookie("system")
	},
	
	messageDialog:function(title,msg,icon){
		Ext.MessageBox.show({
              title: title,
              msg: msg,
              buttons: Ext.MessageBox.OK,
              icon: icon
        })
	}
	
})