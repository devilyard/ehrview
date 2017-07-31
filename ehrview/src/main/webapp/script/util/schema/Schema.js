$package("util.schema")


util.schema.Schema = function(json){
	$apply(this,json)
	this.schemaItems = {};
	
	var itemCount = this.items.length
	for(var i = 0; i < itemCount; i ++){
		var o = new util.schema.SchemaItem(this.items[i])
		this.schemaItems[o.id] = o
	}
	this.itemCount = itemCount
}

$apply(util.schema.Schema.prototype,{
	item : function(i){
		if(typeof i == "string"){
			return this.schemaItems[i]
		}
		else{
			if(i >=0 && i < this.itemCount){
				return this.schemaItems[this.items[i].id]
			}
		}
	}
})


util.schema.SchemaItem = function(json){
	$apply(this,json)
}
$apply(util.schema.SchemaItem.prototype,{
	isCodedValue:function(){
		if(this.dic){
			return true
		}
		return false
	},
	convertToFormField: function(){
	
	}
})

