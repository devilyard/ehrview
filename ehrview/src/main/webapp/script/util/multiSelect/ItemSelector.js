$package("util.multiSelect")
$import("util.multiSelect.MultiSelect")
$styleSheet("util.widgets.multiSelect.css.multiSelect")
util.multiSelect.ItemSelector = Ext.extend(Ext.form.Field,  {
    hideNavIcons:false,
    imagePath:"",
    iconUp:"up2.gif",
    iconDown:"down2.gif",
    iconLeft:"left2.gif",
    iconRight:"right2.gif",
    iconTop:"top2.gif",
    iconBottom:"bottom2.gif",
    drawUpIcon:true,
    drawDownIcon:true,
    drawLeftIcon:true,
    drawRightIcon:true,
    drawTopIcon:true,
    drawBotIcon:true,
    delimiter:',',
    bodyStyle:null,
    border:false,
    defaultAutoCreate:{tag: "div"},
    /**
     * @cfg {Array} multiselects An array of {@link Ext.ux.form.MultiSelect} config objects, with at least all required parameters (e.g., store)
     */
    multiselects:null,
    items:null,
    nodes:[],
    types:["app","catalog","module","action"],
	flag:null,
	isLeaf:false,
	
    initComponent: function(){
        util.multiSelect.ItemSelector.superclass.initComponent.call(this);
        this.addEvents({
            'rowdblclick' : true,
            'change' : true
        });
    },

    onRender: function(ct, position){
        util.multiSelect.ItemSelector.superclass.onRender.call(this, ct, position);

        // Internal default configuration for both multiselects
        var msConfig = [{
            legend: '可选权限',
            draggable: true,
            droppable: true,
            width: 100,
            height: 100
        },{
            legend: '已选权限',
            droppable: true,
            draggable: true,
            width: 100,
            height: 100
        }];

        this.flag = this.items[1].flag
        
        this.toMultiselect = new util.multiSelect.MultiSelect(Ext.applyIf(this.items[1], msConfig[1]));
        //this.toMultiselect.on('dblclick', this.onRowDblClick, this);
        this.iconLeft = this.items[1].iconCls;
        
		this.fromMultiselect = new util.multiSelect.MultiSelect(Ext.applyIf(this.items[0], msConfig[0]));
        //this.fromMultiselect.on('dblclick', this.onRowDblClick, this);
		this.iconRight = this.items[0].iconCls;
        
		if(this.flag == 'tree'){
			this.toTree = this.toMultiselect.store;
			this.fromTree = this.fromMultiselect.store;
			this.toMultiselect.on('load',this.initRightNode,this);
			//this.toMultiselect.on('expand',this.expandNodes,this);
			this.fromMultiselect.on('click', this.initLeftNode, this); 
		}
		
        var p = new Ext.Panel({
            bodyStyle:this.bodyStyle,
            border:this.border,
            layout:"table",
            layoutConfig:{columns:3}
        });

        p.add(this.fromMultiselect);
        
        var button = new Ext.Button({ 
        	iconCls: this.iconRight,
        	handler:this.fromTo,
        	autoHeight:true,
        	autoWidth:true,
            scope:this
		});
		var button2 = new Ext.Button({ 
        	iconCls: this.iconLeft,
        	handler:this.toFrom,
        	autoHeight:true,
        	autoWidth:true,
        	style:"margin-top:5px;",
            scope:this
		});
		var actions = new Ext.form.FormPanel({
        	border:false,
        	layout:"form",
        	items:[button,button2]
        })
        p.add(actions);
        p.add(this.toMultiselect);
        p.render(this.el);
        p.addClass('item-space')
        var tb = p.body.first();
        this.el.setWidth(p.body.first().getWidth());
        p.body.removeClass();

        this.hiddenName = this.name;
        var hiddenTag = {tag: "input", type: "hidden", value: "", name: this.name};
        this.hiddenField = this.el.createChild(hiddenTag);
    },
    
    doLayout: function(){
        if(this.rendered){
            this.fromMultiselect.fs.doLayout();
            this.toMultiselect.fs.doLayout();
        }
    },

    afterRender: function(){
    	util.multiSelect.ItemSelector.superclass.afterRender.call(this);
       	this.toStore = this.toMultiselect.store;
    	if(this.flag != 'tree'){
    		this.toStore.on('afterrender', this.valueChanged, this);
        	this.toStore.on('remove', this.valueChanged, this);
        	this.toStore.on('load', this.valueChanged, this);
        	this.valueChanged(this.toStore);
    	}
    },

    toTop : function() {
        var selectionsArray = this.toMultiselect.view.getSelectedIndexes();
        var records = [];
        if (selectionsArray.length > 0) {
            selectionsArray.sort();
            for (var i=0; i<selectionsArray.length; i++) {
                record = this.toMultiselect.view.store.getAt(selectionsArray[i]);
                records.push(record);
            }
            selectionsArray = [];
            for (var i=records.length-1; i>-1; i--) {
                record = records[i];
                this.toMultiselect.view.store.remove(record);
                this.toMultiselect.view.store.insert(0, record);
                selectionsArray.push(((records.length - 1) - i));
            }
        }
        this.toMultiselect.view.refresh();
        this.toMultiselect.view.select(selectionsArray);
    },

    toBottom : function() {
        var selectionsArray = this.toMultiselect.view.getSelectedIndexes();
        var records = [];
        if (selectionsArray.length > 0) {
            selectionsArray.sort();
            for (var i=0; i<selectionsArray.length; i++) {
                record = this.toMultiselect.view.store.getAt(selectionsArray[i]);
                records.push(record);
            }
            selectionsArray = [];
            for (var i=0; i<records.length; i++) {
                record = records[i];
                this.toMultiselect.view.store.remove(record);
                this.toMultiselect.view.store.add(record);
                selectionsArray.push((this.toMultiselect.view.store.getCount()) - (records.length - i));
            }
        }
        this.toMultiselect.view.refresh();
        this.toMultiselect.view.select(selectionsArray);
    },

    up : function() {
        var record = null;
        var selectionsArray = this.toMultiselect.view.getSelectedIndexes();
        selectionsArray.sort();
        var newSelectionsArray = [];
        if (selectionsArray.length > 0) {
            for (var i=0; i<selectionsArray.length; i++) {
                record = this.toMultiselect.view.store.getAt(selectionsArray[i]);
                if ((selectionsArray[i] - 1) >= 0) {
                    this.toMultiselect.view.store.remove(record);
                    this.toMultiselect.view.store.insert(selectionsArray[i] - 1, record);
                    newSelectionsArray.push(selectionsArray[i] - 1);
                }
            }
            this.toMultiselect.view.refresh();
            this.toMultiselect.view.select(newSelectionsArray);
        }
    },

    down : function() {
        var record = null;
        var selectionsArray = this.toMultiselect.view.getSelectedIndexes();
        selectionsArray.sort();
        selectionsArray.reverse();
        var newSelectionsArray = [];
        if (selectionsArray.length > 0) {
            for (var i=0; i<selectionsArray.length; i++) {
                record = this.toMultiselect.view.store.getAt(selectionsArray[i]);
                if ((selectionsArray[i] + 1) < this.toMultiselect.view.store.getCount()) {
                    this.toMultiselect.view.store.remove(record);
                    this.toMultiselect.view.store.insert(selectionsArray[i] + 1, record);
                    newSelectionsArray.push(selectionsArray[i] + 1);
                }
            }
            this.toMultiselect.view.refresh();
            this.toMultiselect.view.select(newSelectionsArray);
        }
    },

    fromTo : function() {
    	if(this.items[0].flag=="tree"){
        	var node = this.fromMultiselect.store.getSelectionModel().getSelectedNode()
        	if(!node){
       			Ext.Msg.alert("错误","请选择菜单")
        	}
        	this.treeFromTo(node)
    	}else{
        	var selectionsArray = this.fromMultiselect.view.getSelectedIndexes();
        	var records = [];
        	if (selectionsArray.length > 0) {
            	for (var i=0; i<selectionsArray.length; i++) {
                	record = this.fromMultiselect.view.store.getAt(selectionsArray[i]);
                	records.push(record);
            	}
            	if(!this.allowDup)selectionsArray = [];
            	for (var i=0; i<records.length; i++) {
                	record = records[i];
                	if(this.allowDup){
                    	var x=new Ext.data.Record();
                    	record.id=x.id;
                    	delete x;
                    	this.toMultiselect.view.store.add(record);
                	}else{
                    	this.fromMultiselect.view.store.remove(record);
                    	this.toMultiselect.view.store.add(record);
                    	selectionsArray.push((this.toMultiselect.view.store.getCount() - 1));
                	}
            	}
       	 	}
        	this.toMultiselect.view.refresh();
        	this.fromMultiselect.view.refresh();
        	var si = this.toMultiselect.store.sortInfo;
        	if(si){
            	this.toMultiselect.store.sort(si.field, si.direction);
        	}
        	this.toMultiselect.view.select(selectionsArray);
    	}
    },

    toFrom : function() {
    	if(this.items[1].flag=="tree"){
	    	var node = this.toMultiselect.store.getSelectionModel().getSelectedNode()
	    	this.deleteNodes(node)
	    	this.reset()
    	}else{
        	var selectionsArray = this.toMultiselect.view.getSelectedIndexes();
        	var records = [];
        	if (selectionsArray.length > 0) {
            	for (var i=0; i<selectionsArray.length; i++) {
                	record = this.toMultiselect.view.store.getAt(selectionsArray[i]);
                	records.push(record);
            	}
            	selectionsArray = [];
            	for (var i=0; i<records.length; i++) {
                	record = records[i];
                	this.toMultiselect.view.store.remove(record);
                	if(!this.allowDup){
                    	this.fromMultiselect.view.store.add(record);
                    	selectionsArray.push((this.fromMultiselect.view.store.getCount() - 1));
                	}
           	 	}
        	}
        	this.fromMultiselect.view.refresh();
        	this.toMultiselect.view.refresh();
        	var si = this.fromMultiselect.store.sortInfo;
        	if (si){
            	this.fromMultiselect.store.sort(si.field, si.direction);
        	}
        	this.fromMultiselect.view.select(selectionsArray);
    	}
    },
    
    treeFromTo:function(node){
    	var leftRoot = this.fromTree.getRootNode()
    	var rightRoot = this.toTree.getRootNode()
    	this.getParentNodes(node)
    	var count = this.nodes.length
    	var newNode = new Ext.tree.TreeNode({id:node.id,text:node.attributes.text,key:node.attributes.key,iconCls:node.attributes.iconCls});
    	this.newNode = newNode
    	//判断点选的节点是否有子节点，有则添加“所有”子节点
		newNode = this.checkChildNodes(node,newNode)
    	//将点选节点与它的父节点组装成树
    	if(count != 0){
    		for(var i = 0;i < count;i++){
    			var n = new Ext.tree.TreeNode({id:this.nodes[i].id,text:this.nodes[i].attributes.text,key:this.nodes[i].attributes.key,iconCls:this.nodes[i].attributes.iconCls});
    			var d=this.toTree.getNodeById(n.id)
    			//选定节点的父节点在右边树上存在
    			if(d){
    				//如果当前选择的节点在右边树里已经存在，重新加入该节点
    				x = this.toTree.getNodeById(newNode.id)
    				if(x){
    					d.removeChild(x)
    				}
    				//d.appendChild(newNode)
    				d.insertBefore(newNode,this.getRefNode(newNode,this.nodes[i]))
    				//如果上级菜单包含所有子菜单，则替换所有子菜单为“所有”
					this.check(this.newNode.parentNode,this.nodes[0])
					this.reset()
    				return
    			}
    			n.appendChild(newNode)
    			newNode = n
    		}
    	}
    	if(this.toTree.getNodeById(newNode.id)){
    		rightRoot.removeChild(this.toTree.getNodeById(newNode.id))
    	}
    	//rightRoot.appendChild(newNode)
    	rightRoot.insertBefore(newNode,this.getRefNode(newNode,leftRoot))
    	if(count>0){this.check(this.newNode.parentNode,this.nodes[0])}
    	else       {this.check(rightRoot,leftRoot)}
    	this.reset()
    },
    
    checkChildNodes: function(node,newNode){
    	if(node.hasChildNodes()){
    		node.eachChild(function(d){
    			if(!d.isLeaf()){
    				d.expand(false, false, function(x){
    					this.checkChildNodes(x,null)
    				},this)
    			}
    			this.addClass(d)
    		},this)
    		this.addClass(node)
    		//var nodeId = node.id+".others"
    		var nodeId = this.getOtherNodeId(node)
    		if(newNode){newNode.appendChild({id:nodeId,text:"所有",key:nodeId,leaf:true})}
    	}else{
    		this.addClass(node)
    		if(node.parentNode.getDepth() == 0){
    			var nodeId = this.getOtherNodeId(node)
    			if(newNode){newNode.appendChild({id:nodeId,text:"所有",key:nodeId,leaf:true})}
    		}
    	}
    	return newNode != null ? newNode : null
    },
    
    check: function(toNode,fromNode){
    	var s = null
    	var arr = toNode.childNodes
    	for(var i = 0;i < arr.length;i++){
    		if(arr[i].childNodes.length>0){
    			if(arr[i].firstChild.id.indexOf("others")<0){
    				s = arr[i]
    				break
    			}
    		}
    	}
    	if(!s){
    		this.replace(toNode,fromNode)
    	}
    },
    
    replace:function(toNode,fromNode){
    	if(toNode.childNodes.length == fromNode.childNodes.length){
    		toNode.removeAll()
    		//var nodeId = fromNode.id+'.others'
    		var nodeId = this.getOtherNodeId(fromNode)
    		if(fromNode.getDepth() == 0){
    			nodeId = "app.others"
    		}
    		toNode.appendChild({id:nodeId,text:"所有",key:nodeId,leaf:true})
    		this.addClass(fromNode)
    		if(fromNode.parentNode){
    			this.check(toNode.parentNode,fromNode.parentNode)
    		}
    	}
    },
    
    getOtherNodeId:function(node){
    	var t = node.id.substring(0,node.id.indexOf("."))
    	for(var i=0;i<this.types.length;i++){
    		if(t == this.types[i]){
    			t = this.types[i+1]
    			break
    		}
    	}
    	return t+"."+node.id.substr(node.id.lastIndexOf(".")+1)+'.others'
    },
    
    deleteNodes:function(node){
    	var parent = node.parentNode
    	if(parent){
	    	if(node.hasChildNodes()){
	    		this.removeFolderClass(node)
	    	}else{
	    		if(node.id.indexOf('others')>0){
	    			this.removeLeafClass(node.parentNode)
	    		}
	    		var x = this.fromTree.getNodeById(node.id)
	    		if(x){
	    			this.removeClass(x)
	    		}
	    	}
	    	parent.removeChild(node)
    		if(parent.childNodes.length==0){
    			this.deleteNodes(parent)
    		}
    	}
    },
    
    removeFolderClass: function(node){
    	node.eachChild(function(d){
	    	var x = null
	    	if(d.id.indexOf('others')>0){
				this.removeLeafClass(node)
				var fromNode = this.fromTree.getNodeById(node.id)
				if(fromNode){
					this.removeClass(fromNode)
				}
	    	}else{
	    		x = this.fromTree.getNodeById(d.id)
	    		if(x){
	    			this.removeClass(x)
	    		}
	    		if(d.hasChildNodes()){
	    			this.removeFolderClass(d)
	    		}
	    	}
	    },this)
    },
    
    removeLeafClass: function(node){
    	x = this.fromTree.getNodeById(node.id)
    	if(node.getDepth() == 0){
    		x = this.fromTree.getRootNode()
    	}
	    if(x){
	    	x.eachChild(function(d){
	    	this.removeClass(d)
	    	if(!d.isLeaf()){
	    		this.removeLeafClass(d)
	    	}
	    	},this)
	    }
    },
    
    getParentNodes:function(node){
    	var parent = node.parentNode
    	if(parent.getDepth() != 0){
    		this.nodes.push(parent)
    		this.getParentNodes(parent)
    	}
    },
    
    getChildNodes : function(node) {
    	var arr = node.childNodes
    	var count = arr.length
    	if(count>0){
    		for(var i=0;i<count;i++){
    			this.nodes.push(arr[i])
    			this.getChildNodes(arr[i])
    		}
    	}
    },
    
    getRefNode: function(node,parent){
    	node = this.fromTree.getNodeById(node.id)
    	refNode = null
    	if(parent){
    		var index = parent.indexOf(node)
    		var count = parent.childNodes.length
    		for(var i = index+1;i<count;i++){
    			node = parent.item(i)
    			if(node){
    				refNode = this.toTree.getNodeById(node.id)
    				if(refNode){
    					break
    				}
    			}	
    		}
    	}
    	return refNode
    },
	
    valueChanged: function(store) {
        var record = null;
        var values = [];
        for (var i=0; i<store.getCount(); i++) {
            record = store.getAt(i);
            values.push(record.get(this.toMultiselect.valueField));
        }
        this.hiddenField.dom.value = values.join(this.delimiter);
        this.fireEvent('change', this, this.getValue(), this.hiddenField.dom.value);
    },
    

    getValue : function() {
    	if(this.flag == 'tree'){
    		var root = this.toTree.getRootNode()
    		this.getChildNodes(root)
    		var count = this.nodes.length
    		var apps = ""
    		for(var i=0;i<count;i++){
    			apps = apps + "," +this.nodes[i].id 
    		}
    		apps = apps.substr(1)
    		this.reset()
    		this.toTree.expandAll()
    		return apps
    	}
    	var array = []
    	this.toMultiselect.view.store.each(function(record){
    		array.push(record.data)
    	})
    	return array
        //return this.hiddenField.dom.value;
    },
    
    setValue : function(v) {
    	if(this.flag == 'tree'){
    		var root = new Ext.tree.AsyncTreeNode({
    			children:v
    		})
    		this.toTree.setRootNode(root)
    		this.toTree.expandAll()
    	}
    },
    
 /**
    onRowDblClick : function(vw, index, node, e) {
        if (vw == this.toMultiselect.view){
            this.toFrom();
        } else if (vw == this.fromMultiselect.view) {
            this.fromTo();
        }
        return this.fireEvent('rowdblclick', vw, index, node, e);
    },
*/
/**
    onRowDblClick : function(node, e) {
    	this.treeFromTo(node);
        return this.fireEvent('rowdblclick',node, e);
    },
 */   
    initRightNode: function(node){
    	if(node.hasChildNodes()){
    		this.childCheck(this.fromTree.getRootNode())
    	}
    },
    
    initLeftNode : function(node){
    	this.childCheck(node)
    },
 
    childCheck: function(node){
    	var toNode = this.toTree.getNodeById(node.id)
    	if(node.getDepth() == 0){
    		toNode = this.toTree.getRootNode()
    	}
		if(toNode && toNode.hasChildNodes()){
			if(toNode.firstChild.id.indexOf("others")>0){
				if(node.hasChildNodes()){
					node.eachChild(function(d){
						this.addClass(d)
					},this)
					return
				}
			}
		}
    	
		if(node.hasChildNodes()){
			if(node.disabled){
				node.eachChild(function(d){this.addClass(d)},this)
				return
			}
			node.eachChild(function(d){
				toNode = this.toTree.getNodeById(d.id)
				if(toNode){
					if(d.isLeaf()){
						this.addClass(d)
					}else if(toNode.firstChild){
						if(toNode.firstChild.id.indexOf('others')>0){this.addClass(d)}
					}
				}
			},this)
		}
    },
    
    expandNodes: function(tree,parent,node){
    	alert(node.id)
    },
    
    removeClass: function(node){
    	node.getUI().removeClass('complete')
    	node.enable()
    },
    
    addClass: function(node){
    	node.getUI().addClass('complete')
		node.disable()
    },
    
    reset: function(){
    	if(this.flag == 'tree'){
    		this.nodes = []
    	}else{
        	range = this.toMultiselect.store.getRange();
        	this.toMultiselect.store.removeAll();
        	this.fromMultiselect.store.add(range);
        	var si = this.fromMultiselect.store.sortInfo;
        	if (si){
            	this.fromMultiselect.store.sort(si.field, si.direction);
        	}
        	this.valueChanged(this.toMultiselect.store);
    	}
    }
});

Ext.reg('itemselector', util.multiSelect.ItemSelector);
