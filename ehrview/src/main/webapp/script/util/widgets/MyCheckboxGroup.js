$package("util.widgets")
util.widgets.MyCheckboxGroup = Ext.extend(Ext.form.CheckboxGroup,  {   
   getName:function(){
   		return this.name;
   },
	setValue:function(v){
		var array = []
		var values = {};
		
		var v = typeof v == "object" ? v.key : v
		
		if(typeof v == 'string'){
			if(v.indexOf(',') == -1){
				values[v] = true
			}
			else{
				array = v.split(",")
			}
		}
		for(var i = 0; i < array.length; i ++){
			values[array[i]] = true;
		}
		
		if(!this.items.getCount){
			for(var i = 0; i < this.items.length; i ++){
				var item = this.items[i]
				if(values[item.inputValue]){
					item.checked = true
				}
				else{
					item.checked = false
				}
			}
			return;
		}		
		this.items.each(function(item){
            var v = values[item.inputValue]
            if(v){
            	item.setValue(true)
            }
            else{
            	item.setValue(false)
            }
        })		
   },
   getValue:function(){
   		var items = this.items
 	   	if(!items.getCount){
	   		return null;
	   	}  		
   		var n = items.getCount();
   		var values = "";
   		for(var i = 0; i < n; i ++){
   			var item = items.item(i)
   			if(item.getValue())
   				values +="," + item.inputValue;
   		}
   		return values.substring(1)
   },
   initValue : function(){
	    // reference to original value for reset
	    this.originalValue = this.getValue();
	   	if(this.value !== undefined){
	            this.setValue(this.value);
	    }

    }   
});   
Ext.reg('MyCheckboxGroup', util.widgets.MyCheckboxGroup); 