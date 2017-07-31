$package("util.dictionary")
$import(
	"util.widgets.MyCombox",
	"util.dictionary.DictionaryLoader"
)

util.dictionary.SimpleDicFactory = {
	getUrl:util.dictionary.DictionaryLoader.getUrl,
	getStore:function(dic){
		var url = this.getUrl(dic);
		var proxy = new Ext.data.HttpProxy({
			method:"GET",	//make cache,upper
			url:url
		});
		var store = new Ext.data.JsonStore({
			proxy:proxy,
			totalProperty:'result',
			root:'items',
			fields: dic.fields || ['key','text',dic.searchField || "mCode"]
		})
		return store
	},
	getCombox:function(dic){
		var combox = new util.widgets.MyCombox({
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
    			value:dic.defaultValue || dic.value,
    			forceSelection:dic.forceSelection || false
    		  })
    	return combox
	},
	createDic:function(dic){
		var combox = this.getCombox(dic)
		if(!dic.remote){
			//combox.mode = 'local';
			//combox.minChars = 99;
			if(dic.autoLoad){
				combox.store.load();
			}
		}
    	return combox;
	},
	createLocalStore:function(dic){
		var store = new Ext.data.JsonStore({
			fields: ['key','text'],
			data:dic.data || []
		})
		return store
	},
	createLocalDic:function(dic){
		var comb = new util.widgets.MyCombox({
			store:this.createLocalStore(dic),
			valueField:"key",
    		displayField:"text",
    		mode:"local",
    		triggerAction:"all",
    		emptyText:dic.emptyText || "请选择",
    		value:dic.value,
    		selectOnFocus:dic.selectOnFocus || false,
    		editable:dic.editable || true,
    		width:dic.width || 120
		});
		return comb
	}
}