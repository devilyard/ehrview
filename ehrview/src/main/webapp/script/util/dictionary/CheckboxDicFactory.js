$package("util.dictionary")
$import("util.dictionary.DictionaryLoader",
		"util.widgets.MyCheckboxGroup"
)

util.dictionary.CheckboxDicFactory = {

	createDic:function(dic){
		var data = util.dictionary.DictionaryLoader.load(dic)
		var columns = []
		var width = 100
		
		var cfg = {
			name:dic.id,
			value:dic.defaultValue,
			items:[]
		}
		if(data && data.items){
			var items = data.items
			var n = items.length
			for(var i = 0; i < n; i ++){
				var item = items[i]
				cfg.items.push({
					inputValue:item.key,
					boxLabel:item.text
				})
			}
			if(n > 4){
				n = 4;
			}
			for(var i = 0; i < n; i ++){
				columns.push(width)
			}				
		}
		cfg.columns = columns
		return new util.widgets.MyCheckboxGroup(cfg)
	}
}