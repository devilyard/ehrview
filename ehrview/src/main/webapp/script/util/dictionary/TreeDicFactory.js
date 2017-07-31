$package("util.dictionary")

$import(
	"util.dictionary.SimpleDicFactory",
	"util.dictionary.TreeLoader",
	"util.widgets.TreeField"
)

util.dictionary.TreeDicFactory = {
	createTree:function(dic){
		var dataUrl = ClassLoader.serverAppUrl || "";
		var url = dataUrl + dic.id + ".dic";
		var Tree = Ext.tree;
		var cfg = {
			autoScroll:false,
            animate:true,
            containerScroll: false,
			rootVisible:false,
			border:false,
			loader:new util.dictionary.TreeLoader({
				url: url,
				keyNotUniquely:dic.keyNotUniquely,
				dic:dic
			})
		}
		if(dic.title){
			cfg.title = dic.title;
		}
		var root = new Tree.AsyncTreeNode({
			text:dic.parentText || "",
			type:'dic',
			key: dic.parentKey || "",
			expandable:true,
			root:true
		})
		if(dic.rootVisible){
			cfg.rootVisible = true
			root.expanded = true
		}
		if(dic.dropConfig){
			cfg.enableDrop = true
			cfg.dropConfig = dic.dropConfig
		}
		var tree = new Tree.TreePanel(cfg)
	    tree.setRootNode(root);
	    var filter = new Ext.tree.TreeFilter(tree, {
			clearBlank: true,
			autoClear: true
		});
		tree.filter = filter
	    return tree;
	},
	createDic:function(dic){
		var tree = this.createTree(dic)
		var store = util.dictionary.SimpleDicFactory.getStore(dic)
		var treeField = new util.widgets.TreeField({
			onlySelectLeaf:dic.onlySelectLeaf == "true" || dic.onlySelectLeaf == true || false,
			listHeight:dic.width || 200,
			width: dic.width || 200,
			tree:tree,
			minChars:dic.minChars || 2,
			value:dic.defaultValue,
			editable:(dic.editable!=undefined)?dic.editable:true,
			store:store
		})
		return treeField
	}
}