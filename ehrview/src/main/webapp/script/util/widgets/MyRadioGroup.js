$package("util.widgets")

util.widgets.MyRadioGroup = Ext.extend(Ext.form.RadioGroup,  {
   getName:function(){
   		return this.name;
   },
   setValue:function(v){
   		var value = typeof v == "object" ? v.key : v
   		   		
		if(!this.items.getCount){
			for(var i = 0; i < this.items.length; i ++){
				var item = this.items[i]
				if(item.inputValue == value){
					item.checked = true
				}
				else{
					item.checked = false
				}
			}
			return;
		}
   	
		this.items.each(function(item){
            if(item.inputValue == value){
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
	   	for(var i = 0; i < n; i ++){
	   			var item = items.item(i)
	   			if(item.getValue())
	   				return item.inputValue;
	   		}
   },
   initValue : function(){
	    // reference to original value for reset
	    this.originalValue = this.getValue();
	   	if(this.value !== undefined){
	            this.setValue(this.value);
	    }

    }   
});   
Ext.reg('MyRadioGroup', util.widgets.MyRadioGroup); 