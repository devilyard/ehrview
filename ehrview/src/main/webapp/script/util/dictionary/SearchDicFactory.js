$package("util.dictionary")
$import(
	"util.dictionary.SimpleDicFactory",
	"util.widgets.SearchCombo"
)

util.dictionary.SearchDicFactory = {
	getUrl:util.dictionary.SimpleDicFactory.getUrl,
	getStore:util.dictionary.SimpleDicFactory.getStore,
	getCombox:function(dic){
		var combox = new util.widgets.SearchCombo({
    			store: this.getStore(dic),
    	       	valueField:"key",
    			displayField:"text",
    			searchField:dic.searchField || "mCode",
    			editable:(dic.editable!=undefined)?dic.editable:true,
    			minChars:2,
    			selectOnFocus:true,
    			triggerAction: dic.remote ? "query" : "all",
    			emptyText:dic.emptyText || '请选择',
    			pageSize:dic.pageSize,
    			width:dic.width || 200,
    			value:dic.defaultValue,
    			forceSelection:dic.forceSelection || false
    		  })
    	return combox
	},
	createDic:function(dic){
		var combox = this.getCombox(dic)
		if(!dic.remote){
			if(dic.autoLoad){
				combox.store.load()
			}
		}
    	return combox;
	}
}