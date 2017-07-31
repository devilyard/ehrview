$package("util.dictionary")
$import("util.dictionary.DictionaryLoader",
		"util.widgets.MyRadioGroup"
)

util.dictionary.RadioDicFactory = {

	createDic:function(dic){
		var data = util.dictionary.DictionaryLoader.load(dic)
		var columns = []
		var width = dic.colWidth || 100
		var cfg = {
			name:dic.id,
			value:dic.defaultValue,
			//columns:[100,100,100,100],
			items:[]
		}	
		if(data && data.items){
			var items = data.items
			var n = items.length
			for(var i = 0; i < n; i ++){
				var item = items[i]
				cfg.items.push({
					name:dic.id,
					inputValue:item.key,
					boxLabel:item.text
				})
			}
			if(n > 5){
				n = 5;
			}
			for(var i = 0; i < n; i ++){
				columns.push(width)
			}			
		}
		cfg.columns = columns
		return new util.widgets.MyRadioGroup(cfg)
	}
}