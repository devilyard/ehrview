$package("util.expression")
$styleSheet("util.expression")

$import(
	"util.expression.Catalog",
	"util.Expression.Runner"
)
util.expression.TreeBuilder = function(){
	
	this.init = function(id){
		
		if(!this.treePanel){
			this.initTree();	
		}else{
			this.clearTree();
		}
		
		if(typeof id == "string"){
			this.initRootId(id)
		}else{
			this.initJsonExp(id)
		}
		
		if(!this.mitems){
			var mitems = []
			var types = util.Expression.types
			this.initTypes(mitems,types)
			mitems.push({id:'_exp_delete',text:'删除表达式',handler:this.onMenuClick,scope:this})
			mitems.push({id:'_exp_value',text:'设置值',handler:this.onMenuClick,scope:this})
			this.mitems = mitems
		}
	}
	
	this.initTypes = function(items,tps){
		for(var i = 0; i < tps.length; i ++){
			var item = {id:tps[i].id,text:tps[i].text,handler:this.onMenuClick,scope:this}
			items.push(item)
			
			var exps = util.Expression.usages[item.id]
			
			if(typeof exps == "object"){
				item.menu = {items:[]}
				for(var j = 0; j < exps.length;j ++){
					exps[j].handler = this.onMenuClick
					exps[j].scope = this
					item.menu.items.push(exps[j])
				}
			}
			
			if(tps[i].items){
				item.menu = {items:[]}
				this.initTypes(item.menu.items,tps[i].items)
			}
		}
	}
	
	
	this.initCMenuItems = function(){
		var mitems = []
		var types = util.Expression.types
		for(var i = 0; i < types.length; i ++){
			mitems.push(this.initTypes(types[i]))
		}
		mitems.push({id:'_exp_delete',text:'删除表达式',handler:this.onMenuClick,scope:this})
		mitems.push({id:'_exp_value',text:'设置值',handler:this.onMenuClick,scope:this})
		this.mitems = mitems
	}
	
	this.initJsonExp = function(json,node){
			var id = json[0]
			var usage = util.Expression.findById(id)
			if(!usage){
				return
			}
			var cfg = {text:usage.text}
			if(usage.datatype){
				cfg.text = usage.text + ":" + json[1]
				var pnode = new Ext.tree.TreeNode(cfg)
				pnode._exp = id
				pnode._expValue = json[1]
				if(node){
					node.appendChild(pnode)
				}
				else{
					this.treePanel.setRootNode(node)
				}
				return
			}
			else{
				cfg.expandable = true
				var pnode = new Ext.tree.TreeNode(cfg)
				pnode._exp = id
				if(node){
					node.appendChild(pnode)
				}
				else{
					this.treePanel.setRootNode(pnode)
				}
				for(var i = 1; i < json.length; i ++){
					this.initJsonExp(json[i],pnode)
				}
			}
	}
	
	this.initRootId = function(id){
		var usage = util.Expression.findById(id)
		if(!usage){
			return
		}
		var root = new Ext.tree.TreeNode({expandable:true,text:usage.text,iconCls:"x-debbug-tnode-obj"})
		root._exp = id
		this.treePanel.setRootNode(root)
	}
	
	this.initTree = function(){
		var Tree = Ext.tree
		var treePanel = new Tree.TreePanel({
							id:"x-expr-treebuilder",
							autoScroll:true,
							width:'auto',
							height:200
						})
		this.treePanel = treePanel
		this.treePanel.on("contextmenu",this.onContextMenu,this)
		this.treePanel.on("click",this.onNodeClick,this)
		this.ta = new Ext.form.TextArea({height:60,width:'98%'})
		
	}
	
	this.clearTree = function(){
		if(this.treePanel.el)
			this.treePanel.el.update("")
	}
	
	this.onMenuClick = function(item,e){
		var id = item.id
		var node = this.contextMenu.__node
		
		if(id == "_exp_delete"){
			node.remove()
			return
		}
		
		if(id == "_exp_value"){
			Ext.MessageBox.prompt('参数值', '请输入参数[' + node.text + "]的值", function(btn, text){
				if(btn == 'ok' && text.length > 0){
					var usage = util.Expression.findById(node._exp)
					node.setText(usage.text + ":" + text)
					node._expValue = text
				}
			})
			return
		}
		
		var usage = util.Expression.findById(id)
		if(!usage){
			return
		}
		var cfg = {text:item.text,draggable:true}
		
		if(usage.datatype){
			cfg.expandable = false
			Ext.MessageBox.prompt('参数值', '请输入参数[' + usage.text + "]的值", function(btn, text){
				if(btn != 'ok' || text.length == 0){
					return
				}
				cfg.text = usage.text + ":" + text
				var pnode = new Ext.tree.TreeNode(cfg)
				pnode._exp = item.id
				pnode._expValue = text
				node.appendChild(pnode)
				node.expand()
			});
		}
		else{
			cfg.expandable = true
			var pnode = new Ext.tree.TreeNode(cfg)
			pnode._exp = item.id
			node.appendChild(pnode)
			node.expand()
		}
	}
	
	this.onNodeClick = function(node,e){
		node.cascade(function(n){
			var usage = util.Expression.findById(n._exp)
			if(!usage){
				return
			}
			if(usage.datatype){
				n._expObj = [n._exp,n._expValue]
			}
			else{
				n._expObj = [n._exp]
			}
			if(n.parentNode){
				if(n.parentNode._expObj)
					n.parentNode._expObj.push(n._expObj)
			}
		},this)
		
		this.ta.setValue(util.Expression.Runner.toString(node._expObj,null))
	}
	
	this.onContextMenu =function(node,e){
		var usages = util.Expression.usages
		var id = node._exp
		
		var menu = this.contextMenu
		if(!menu){
			menu = new Ext.menu.Menu({
				items:this.mitems
			})
			this.contextMenu = menu
		}
		menu.__node = node
		

		var usage = util.Expression.findById(id)
		if(usage){
			var lmt = {datatype:usage.datatype,blist:usage.blist,wlist:usage.wlist,args:usage.args}
			menu._lmt = lmt
			menu.items.each(this.doEachMenuItem,this)
		}
		menu.showAt([e.getPageX(),e.getPageY()])
	}

	this.doEachMenuItem = function(item){
		var menu = this.contextMenu
		var node = menu.__node
		
		item.enable()
		if(item.id == "_exp_delete"){
			return
		}

		if(menu._lmt){
			var lmt = menu._lmt
			if(lmt.datatype){
				if(item.id != "_exp_value"){
					item.disable()
					return
				}
			}
			else{
				if(item.id == "_exp_value"){
					item.disable()
					return
				}	
			}
			
			if(lmt.args){
				var n = node.childNodes.length
				if(n == lmt.args.length){
					item.disable()
					return
				}
				var arg = lmt.args[n]
				if(arg.wlist){
					if(!lmt.wlist){
						lmt.wlist = []
					}
					for(var i = 0;i < arg.wlist.length; i ++){
						lmt.wlist.push(arg.wlist[i])
					}
				}
				else{
					if(!lmt.blist){
						lmt.blist = []
					}
					for(var i = 0;i < arg.blist.length; i ++){
						lmt.blist.push(arg.blist[i])
					}
				}
			}
			
			if(lmt.wlist){
				var find = false
				for(var i = 0 ; i < lmt.wlist.length; i ++){
					var type = lmt.wlist[i]
					if(item.id == type){
						find = true
						item.enable()
						return
					}
				}
				if(!find){
					item.disable()
				}
			}
			if(lmt.blist){
				var find = false
				for(var i = 0 ; i < lmt.blist.length; i ++){
					var type = lmt.blist[i]
					if(item.id.indexOf(type) != -1){
						find = true
						item.disable()
						return
					}
				}
				if(!find){
					item.enable()
				}
			}
		}
		
		if(item.menu){
			item.menu.items.each(this.doEachMenuItem,this)
		}
	}
	
	this.show = function(renderTo,xy){
		var win = this.win
		if(!win){
			win = new Ext.Window({
					title:"表达式构造器",
					id:"x-expr-treebuilder-win-" + (new Date()).getTime(),
					frame:true,
					width:350,
					closeAction:"hide",
					shadow:false,
					items:[this.treePanel,this.ta],
					bbar:[{text:"保存"},"-",{text:"取消"}]
				})
			win.on("hide",this.hide,this)
			this.win = win
		}
		if(xy){
			win.setPosition(xy[0],xy[1])
		}
		if(renderTo){
			win.render(renderTo)	
		}
		if(win.isVisible()){
			win.hide() //for refresh bug
		}
		win.show()
	}
	
	this.hide = function(){
		if(this.detailWin){
			this.detailWin.hide()
		}
	}
	
	this.destory = function(){
		if(this.win){
			this.win.close()
		}
		if(this.detailWin){
			this.detailWin.close()
		}
		this.detailWin = null
		this.win = null
	}

}