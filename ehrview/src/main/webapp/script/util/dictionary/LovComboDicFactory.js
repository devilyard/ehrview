$package("util.dictionary")
$import(
	"util.dictionary.SimpleDicFactory",
	"util.widgets.LovCombo",
	"util.widgets.CustomLovCombo"
)

util.dictionary.LovComboDicFactory = {
	getUrl:util.dictionary.SimpleDicFactory.getUrl,
	getStore:util.dictionary.SimpleDicFactory.getStore,
	getCombox:function(dic){
		var cfg = {
			store : this.getStore(dic),
			valueField : "key",
			displayField : "text",
			editable : (dic.editable != undefined) ? dic.editable : true,
			minChars : 2,
			selectOnFocus : true,
			triggerAction : dic.remote ? "query" : "all",
			emptyText : dic.emptyText || '请选择',
			pageSize : dic.pageSize,
			width : dic.width || 200,
			value : dic.defaultValue
		}
		if(dic.separator){
			cfg.separator = dic.separator;
		}
		var combox;
		if(dic.allowCustom){
			cfg.minChars = 500;
			cfg.queryDelay = 600000;
			combox = new util.widgets.CustomLovCombo(cfg);
		}else{
			combox = new util.widgets.LovCombo(cfg);
		}
    	return combox
	},
	createDic:function(dic){
		var combox = this.getCombox(dic)
		var store = combox.store
		store.on("load",function(){
			if(combox.value){
				combox.setValue(combox.value)
			}
		})
		if(!dic.remote){
			store.load()
			combox.mode = 'local';
		}
    	return combox;
	}
}