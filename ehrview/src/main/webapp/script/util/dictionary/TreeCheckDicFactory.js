$package("util.dictionary")

$import(
	"util.dictionary.TreeLoader",
	"util.widgets.TreeCheckField"
)

util.dictionary.TreeCheckDicFactory = {

	createTree:function(dic){
		var dataUrl = ClassLoader.serverAppUrl || ""
		var Tree = Ext.tree
		var tree = new Tree.TreePanel({
			checkModel: dic.checkModel || 'multiple',   //有三种模式 single,cascade,multiple selection
			onlyLeafCheckable: dic.onlyLeafCheckable||false,					//all nodes with checkboxes 所有节点都有checkbox
			animate: true,
			rootVisible: false,
//			autoScroll:true,
            containerScroll: true,
			border:false,
			loader:new util.dictionary.TreeLoader({
				url: dataUrl + dic.id + ".dic",
				keyNotUniquely:dic.keyNotUniquely,
				dataUrl:dataUrl,
				dic:dic,
				baseAttrs: { uiProvider: util.widgets.TreeCheckNodeUI }
//				,preloadChildren:true	//预加载所有节点
			})
		})
		var root = new Tree.AsyncTreeNode({
			text:"",
			key: dic.parentKey || "",
			expandable:true
		})
	    tree.setRootNode(root)
	    return tree
	},
	createDic:function(dic){
		var tree = this.createTree(dic)
		var cfg = {
			maxHeight:260,
			width: dic.width || 220,
			tree:tree,
			selectValueModel:'all'
		}
		if(dic.separator){
			cfg.separator = dic.separator;
		}
		var treeField = new util.widgets.TreeCheckField(cfg);
		tree.on("expandnode",function(node){		
			//values []
	    	var values = treeField.getValue().split(",")
	    	for(var c=0;c<values.length;c++){
	    		var node = tree.getNodeById(values[c])
	    		if(node){
	    			node.getUI().check(true)
	    		}
	    	}
	    },this)
		return treeField	
	}
}