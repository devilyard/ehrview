$package("util.widgets")

if('function' !== typeof RegExp.escape) {
	RegExp.escape = function(s) {
		if('string' !== typeof s) {
			return s;
		}
		// Note: if pasting from forum, precede ]/\ with backslash manually
		return s.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
	}; // eo function escape
}

/**
 * @class util.widgets.TreeCheckNodeUI
 * @extends Ext.tree.TreeNodeUI
 * 
 * 对 Ext.tree.TreeNodeUI 进行checkbox功能的扩展,后台返回的结点信息不用非要包含checked属性
 * 
 * 扩展的功能点有： 一、支持只对树的叶子进行选择 只有当返回的树结点属性leaf = true 时，结点才有checkbox可选
 * 使用时，只需在声明树时，加上属性 onlyLeafCheckable: true 既可，默认是false
 * 
 * 二、支持对树的单选 只允许选择一个结点 使用时，只需在声明树时，加上属性 checkModel: "single" 既可
 * 
 * 二、支持对树的级联多选
 * 当选择结点时，自动选择该结点下的所有子结点，或该结点的所有父结点（根结点除外），特别是支持异步，当子结点还没显示时，会从后台取得子结点，然后将其选中/取消选中
 * 使用时，只需在声明树时，加上属性 checkModel: "cascade" 或"parentCascade"或"childCascade"既可
 * 
 * 三、添加"check"事件 该事件会在树结点的checkbox发生改变时触发 使用时，只需给树注册事件,如：
 * tree.on("check",function(node,checked){...});
 * 
 * 默认情况下，checkModel为'multiple'，也就是多选，onlyLeafCheckable为false，所有结点都可选
 * 
 * 使用方法：在loader里加上 baseAttrs:{uiProvider:util.widgets.TreeCheckNodeUI} 既可. 例如： var
 * tree = new Ext.tree.TreePanel({ el:'tree-ct', width:568, height:300,
 * checkModel: 'cascade', //对树的级联多选 onlyLeafCheckable: false,//对树所有结点都可选
 * animate: false, rootVisible: false, autoScroll:true, loader: new
 * Ext.tree.DWRTreeLoader({ dwrCall:Tmplt.getTmpltTree, baseAttrs: { uiProvider:
 * util.widgets.TreeCheckNodeUI } //添加 uiProvider 属性 }), root: new
 * Ext.tree.AsyncTreeNode({ id:'0' }) });
 * tree.on("check",function(node,checked){alert(node.text+" = "+checked)});
 * //注册"check"事件 tree.render();
 * 
 */

util.widgets.TreeCheckNodeUI = function() {
	// 多选: 'multiple'(默认)
	// 单选: 'single'
	// 级联多选: 'cascade'(同时选父和子);'parentCascade'(选父);'childCascade'(选子)
	this.checkModel = 'multiple';

	// only leaf can checked
	this.onlyLeafCheckable = false;

	util.widgets.TreeCheckNodeUI.superclass.constructor.apply(this, arguments);
};

Ext.extend(util.widgets.TreeCheckNodeUI, Ext.tree.TreeNodeUI, {
	
	// private
    onDblClick : function(e){
        e.preventDefault();
        if(this.disabled){
            return;
        }
//      if(this.checkbox){
//          this.toggleCheck();
//      }
        if(!this.animating && this.node.isExpandable()){
            this.node.toggle();
        }
        this.fireEvent("dblclick", this.node, e);
    },

	renderElements : function(n, a, targetNode, bulkRender) {
		var tree = n.getOwnerTree();
		this.checkModel = tree.checkModel || this.checkModel;
		this.onlyLeafCheckable = tree.onlyLeafCheckable || false;

		// add some indent caching, this helps performance when rendering a
		// large tree
		this.indentMarkup = n.parentNode
				? n.parentNode.ui.getChildIndent()
				: '';

		// var cb = typeof a.checked == 'boolean';
		var cb = (!this.onlyLeafCheckable || a.leaf);
		var href = a.href ? a.href : Ext.isGecko ? "" : "#";
		var buf = [
				'<li class="x-tree-node"><div ext:tree-node-id="',
				n.id,
				'" class="x-tree-node-el x-tree-node-leaf x-unselectable ',
				a.cls,
				'" unselectable="on">',
				'<span class="x-tree-node-indent">',
				this.indentMarkup,
				"</span>",
				'<img src="',
				this.emptyIcon,
				'" class="x-tree-ec-icon x-tree-elbow" />',
				'<img src="',
				a.icon || this.emptyIcon,
				'" class="x-tree-node-icon',
				(a.icon ? " x-tree-node-inline-icon" : ""),
				(a.iconCls ? " " + a.iconCls : ""),
				'" unselectable="on" />',
				cb
						? ('<input class="x-tree-node-cb" type="checkbox" ' + (a.checked
								? 'checked />'
								: '/>'))
						: '',
				'<a hidefocus="on" class="x-tree-node-anchor" href="', href,
				'" tabIndex="1" ',
				a.hrefTarget ? ' target="' + a.hrefTarget + '"' : "",
				'><span unselectable="on">', n.text, "</span></a></div>",
				'<ul class="x-tree-node-ct" style="display:none;"></ul>',
				"</li>"].join('');

		var nel;
		if (bulkRender !== true && n.nextSibling
				&& (nel = n.nextSibling.ui.getEl())) {
			this.wrap = Ext.DomHelper.insertHtml("beforeBegin", nel, buf);
		} else {
			this.wrap = Ext.DomHelper.insertHtml("beforeEnd", targetNode, buf);
		}

		this.elNode = this.wrap.childNodes[0];
		this.ctNode = this.wrap.childNodes[1];
		var cs = this.elNode.childNodes;
		this.indentNode = cs[0];
		this.ecNode = cs[1];
		this.iconNode = cs[2];
		var index = 3;
		if (cb) {
			this.checkbox = cs[3];
			// fix for IE6
			if(Ext.isIE6)
				this.checkbox.defaultChecked = this.checkbox.checked;
			//给checkbox 注册事件 click 事件 参数为 null
			Ext.fly(this.checkbox).on('click',this.check.createDelegate(this, [null]));
			index++;
		}
		this.anchor = cs[index];
		this.textNode = cs[index].firstChild;
	},
	
	// private
	check : function(checked) {
		var n = this.node;
		var tree = n.getOwnerTree();
		this.checkModel = tree.checkModel || this.checkModel;

		if (checked === null) {
			checked = this.checkbox.checked;
		} else {
			this.checkbox.checked = checked;
		}
		
		// fix for IE6 !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		if(Ext.isIE6)
			this.checkbox.defaultChecked = checked;

		n.attributes.checked = checked;
		
		//设置组件的值 setValue()
		tree.fireEvent('check', n, checked);

		if (this.checkModel == 'single') {
			var checkedNodes = tree.getChecked();
			for (var i = 0; i < checkedNodes.length; i++) {
				var node = checkedNodes[i];
				if (node.id != n.id) {
					node.getUI().checkbox.checked = false;
					node.attributes.checked = false;
					tree.fireEvent('check', node, false);
				}
			}
		} else if (!this.onlyLeafCheckable) {
			if (this.checkModel == 'cascade'
					|| this.checkModel == 'parentCascade') {
				var parentNode = n.parentNode;
				if (parentNode !== null) {
					this.parentCheck(parentNode, checked);
				}
				this.fixParentStatus(n)
			}
			if (this.checkModel == 'cascade'
					|| this.checkModel == 'childCascade') {
				if (!n.expanded && !n.childrenRendered) {
					n.expand(false, false, this.childCheck);
				} else {
					this.childCheck(n);
				}
				this.fixParentStatus(n)
			}
		}
	},
	//fixed parent indeterminate status,just works in IE
	fixParentStatus:function(node){
		var p = node.parentNode
		if(!p){
			return;
		}
		var cs = p.childNodes;
		var count = cs.length;
		var checked = 0;
		for (var i = 0; i < cs.length; i++) {
			var ck = cs[i].getUI().checkbox;
			if(ck.indeterminate){
				break;
			}			
			if(ck.checked){
				checked ++
			}
		}
		var ck =p.getUI().checkbox
		if(checked < count && checked > 0){
			if(ck){
				ck.indeterminate = true;
			}
			p = p.parentNode
			while(p){
				var c = p.getUI().checkbox
				if(c){
					c.indeterminate = true;
				}
				p = p.parentNode
			}
		}
		else{
			if(ck){
				ck.indeterminate = false
			}
			this.fixParentStatus(p)
		}
	},
	
	// private
	childCheck : function(node) {
		var a = node.attributes;
		if (!a.leaf) {
			var cs = node.childNodes;
			var csui;
			for (var i = 0; i < cs.length; i++) {
				csui = cs[i].getUI();
				if (csui.checkbox.checked ^ a.checked)
					csui.check(a.checked);
			}
		}
	},

	// private
	parentCheck : function(node, checked) {
		var checkbox = node.getUI().checkbox;
		if (typeof checkbox == 'undefined')
			return;
		if (!(checked ^ checkbox.checked))
			return;
		if (!checked && this.childHasChecked(node))
			return;
		checkbox.checked = checked;
		node.attributes.checked = checked;
		node.getOwnerTree().fireEvent('check', node, checked);

		var parentNode = node.parentNode;
		if (parentNode !== null) {
			this.parentCheck(parentNode, checked);
		}
	},

	// private
	childHasChecked : function(node) {
		var childNodes = node.childNodes;
		if (childNodes || childNodes.length > 0) {
			for (var i = 0; i < childNodes.length; i++) {
				if (childNodes[i].getUI().checkbox.checked)
					return true;
			}
		}
		return false;
	},

	toggleCheck : function(value) {
		var cb = this.checkbox;
		if (cb) {
			var checked = (value === undefined ? !cb.checked : value);
			this.check(checked);
		}
	}
});

// {{{
/*
 * 树状多选下拉框组件 
 */
util.widgets.TreeCheckField = function() {
	this.treeId = Ext.id() + '-tree';
	this.maxHeight = arguments[0].maxHeight || arguments[0].height
			|| this.maxHeight;
	this.tpl = new Ext.Template('<tpl for="."><div style="height:'
			+ this.maxHeight + 'px"><div id="' + this.treeId
			+ '"></div></div></tpl>');
	this.store = new Ext.data.SimpleStore({
				fields : [],
				data : [[]]
			});
	this.selectedClass = '';
	this.mode = 'local';
	this.triggerAction = 'all';
	this.onSelect = Ext.emptyFn;
	this.onViewClick = Ext.emptyFn;   //避免点击消失
	this.editable = false;
	this.selectValueModel = 'leaf';

	util.widgets.TreeCheckField.superclass.constructor.apply(this, arguments);
}

Ext.extend(util.widgets.TreeCheckField, Ext.form.ComboBox, {

	reset:function(){
		this.clearValue()
		this.clearChecked()
		util.widgets.TreeCheckField.superclass.reset.call(this);
	},
	checkField : 'checked',
	separator : ',',
	initEvents : function() {
		util.widgets.TreeCheckField.superclass.initEvents.apply(this, arguments);
		this.keyNav.tab = false

	},

	initComponent : function() {
		util.widgets.TreeCheckField.superclass.initComponent.call(this); 
		this.on({
			scope : this
		})		
	},
	expand : function() {
		util.widgets.TreeCheckField.superclass.expand.call(this);
		if (!this.tree.rendered) {
			this.tree.height = this.maxHeight;
			this.tree.border = false;
			this.tree.autoScroll = true;
			if (this.tree.xtype) {
				this.tree = Ext.ComponentMgr.create(this.tree, this.tree.xtype);
			}
			this.tree.render(this.treeId);	
			
			var combox = this;
			this.tree.on('check', function(node, checked){combox.setValue(node)});
			
			var root = this.tree.getRootNode();
			if (!root.isLoaded())
				root.reload();
		}
	},
	
	setRawValue : function(v){
		if(this.el)
        	return this.el.dom.value = (v === null || v === undefined ? '' : v);
    },
    
    arrayDelete:function(array,index){
    	if(index<0 || index>array.length-1){
    		return array
    	}
    	return array.slice(0,index).concat(array.slice(index+1,array.length))
    },
    
    arrayContains:function(array,o){
    	for(var i=0;i<array.length;i++){
    		if(array[i] == o){
    			return i
    		}
    	}
    	return -1
    },
 /*   
	setValue : function(v) {		
		var values = [];
		var texts = [];
		if(v){		
			// 点击树节点时候 增加或者减少一个选中的节点 无需清空所有的已选择的节点状态			
			if(v instanceof Ext.tree.TreeNode){
				if(this.getValue() != ""){
					//把当前的value值保存到values当中
					values = this.getValue().split(",")
				}
				var rawTexts = this.getRawValue() || ""
				if(rawTexts != ""){
					texts = rawTexts.split(",")
				}
				var node = v
				var flag = node.attributes.checked
				var index = this.arrayContains(values,node.id)
				var index_text = this.arrayContains(texts,node.text)
				if(flag){//节点被选中,把值加到values中
					if(index == -1){
						values.push(node.id)
						texts.push(node.text)
					}else{
						if(index_text == -1){
							texts.push(node.text)
						}
					}
				}else{//取消选中,从values中删除该值
					if(index > -1){
						values = this.arrayDelete(values,index)
					}
					if(index_text > -1){
						texts = this.arrayDelete(texts,index_text)
					}
				}
			}
			// 初始化或者赋值的时候 应当清空所有已经选择的节点状态 {key:"",text:""}
			else if(typeof v == "object"){				
				//清空选择
				this.clearChecked()
				this.clearValue()
				//先转为 key .
				var va = v.key
				var tx = v.text
				if(va){
					values = va.split(",")
				}
				if(tx){
					texts = tx.split(",")
				}
				//选中所有展开的节点中有被赋值的节点，节点在factory中被注册展开事件，展开节点过程中选中子节点中有被赋值的节点
				for(var i=0;i<values.length;i++){
					var node = this.tree.getNodeById(values[i])
					if(node){
						node.getUI().check(true)
					}
				}
			}
			// 当赋值的时候值为 String的时候就 默认为key值
			else if(typeof v == "string"){
				this.clearChecked()
				this.clearValue()
				values = v.split(",")
				//how to deal texts ???
				//texts = values
				for(var i=0;i<values.length;i++){
					var node = this.tree.getNodeById(values[i])
					if(node){
						node.getUI().check(true)
					}
				}
			}
		}
		this.value = values.join(this.separator);
		this.setRawValue(texts.join(this.separator));
		this.texts = texts
		if (this.hiddenField) {
			this.hiddenField.value = this.value;
		}
	},
	*/
	
    
	setValue : function(v) {
		var values = [];
		if(this.getValue() != ""){
			values = this.getValue().split(",")
		}
		var rawTexts = this.getRawValue() || ""
		var texts = [];
		if(rawTexts != ""){
			texts = rawTexts.split(",")
		}
		
		if(v){			
			// 点击树节点时候 增加或者减少一个选中的节点 无需清空所有的已选择的节点状态			
			if(v instanceof Ext.tree.TreeNode){
				var node = v
				var flag = node.attributes.checked
				var index = this.arrayContains(values,node.id)
				var index_text = this.arrayContains(texts,node.text)
				if(flag){
					if(index == -1){
						values.push(node.id)
						texts.push(node.text)
					}					
				}else{
					if(index > -1){
						values = this.arrayDelete(values,index)						
					}
					if(index_text > -1){
						texts = this.arrayDelete(texts,index_text)
					}
				}
				
				/*
					if (this.selectValueModel == 'all' //Factory 传入的是 all
							|| (this.selectValueModel == 'leaf' && node.isLeaf())
							|| (this.selectValueModel == 'folder' && !node.isLeaf()))
				*/
			}
			// 初始化或者赋值的时候 应当清空所有已经选择的节点状态
			else if(typeof v == "object"){			
				//清空选择
				this.clearChecked()
				this.clearValue()
				//先转为 key .
				var txs = v.text
				v = v.key

				if(v && v.indexOf(",") != -1){
					values = v.split(",")
				}else if(v){
					values.push(v)
				}else{
				    values=[]
				}
				if(txs && txs.indexOf(",") != -1){
					texts = txs.split(",")
				}else if(txs){
					texts.push(txs)
				}else{
				    texts=[]
				}
				for(var i=0;i<values.length;i++){
					var node = this.tree.getNodeById(values[i])
					if(node){
						if(!txs){
							texts.push(node.text)
						}
						node.getUI().check(true)
					}					
				}
			}
		}
	
		this.value = values.join(this.separator);
		if(texts.length >= 0){
			this.setRawValue(texts.join(this.separator));
		}
		this.validate();
		this.texts = texts
		if (this.hiddenField) {
			this.hiddenField.value = this.value;
		}
	},

	
	clearChecked:function(){
		var checkedNodes = this.tree.getChecked();
		for (var i = 0; i < checkedNodes.length; i++) {
			var node = checkedNodes[i];
			node.getUI().check(false)
		}
	},

	getValue : function() {
		return this.value || '';
	},

	clearValue : function() {
		this.value = '';
		this.setRawValue(this.value);
		if (this.hiddenField) {
			this.hiddenField.value = '';
		}

		this.tree.getSelectionModel().clearSelections();
	}

	
});
// }}}


Ext.reg('treecheckfield', util.widgets.TreeCheckField);