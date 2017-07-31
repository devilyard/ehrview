$package("util.widgets")
$styleSheet("util.lovCombo")

// add RegExp.escape if it has not been already added
if('function' !== typeof RegExp.escape) {
	RegExp.escape = function(s) {
		if('string' !== typeof s) {
			return s;
		}
		// Note: if pasting from forum, precede ]/\ with backslash manually
		return s.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
	}; // eo function escape
}

 
/**
 *
 * @class util.widgets.CustomLovCombo
 * @extends Ext.form.ComboBox
 */
util.widgets.CustomLovCombo = Ext.extend(Ext.form.ComboBox, {

	// {{{
    // configuration options
	/**
	 * @cfg {String} checkField name of field used to store checked state.
	 * It is automatically added to existing fields.
	 * Change it only if it collides with your normal field.
	 */
	 checkField:'checked'

	/**
	 * @cfg {String} separator separator to use between values and texts
	 */
    ,separator:','

	/**
	 * @cfg {String/Array} tpl Template for items. 
	 * Change it only if you know what you are doing.
	 */
	// }}}
    // {{{
    ,initComponent:function() {
        
		// template with checkbox
		if(!this.tpl) {
			this.tpl = 
				 '<tpl for=".">'
				+'<div class="x-combo-list-item">'
				+'<img src="' + Ext.BLANK_IMAGE_URL + '" '
				+'class="ux-lovcombo-icon ux-lovcombo-icon-'
				+'{[values.' + this.checkField + '?"checked":"unchecked"' + ']}">'
				+'<div class="ux-lovcombo-item-text">{' + (this.displayField || 'text' )+ '}</div>'
				+'</div>'
				+'</tpl>'
			;
		}
 
        // call parent
        util.widgets.CustomLovCombo.superclass.initComponent.apply(this, arguments);

		// install internal event handlers
		this.on({
			 scope:this
			,beforequery:this.onBeforeQuery
//			,blur:this.onRealBlur
		});

		// remove selection from input field
		this.onLoad = this.onLoad.createSequence(function() {
			if(this.el) {
				var v = this.el.dom.value;
				this.el.dom.value = '';
				this.el.dom.value = v;
			}
		});
 
    } // e/o function initComponent
    // }}}
	// {{{
	/**
	 * Disables default tab key bahavior
	 * @private
	 */
	,initEvents:function() {
		util.widgets.CustomLovCombo.superclass.initEvents.apply(this, arguments);

		// disable default tab handling - does no good
		this.keyNav.tab = false;

	} // eo function initEvents
	// }}}
	// {{{
	/**
	 * clears value
	 */
	,clearValue:function() {
		this.value = '';
		if(!this.rendered){
			return;	
		}
		this.setRawValue(this.value);
		this.store.clearFilter();
		this.store.each(function(r) {
			r.set(this.checkField, false);
		}, this);
		if(this.hiddenField) {
			this.hiddenField.value = '';
		}
		this.applyEmptyText();
	} // eo function clearValue
	// }}}
	// {{{
	/**
	 * @return {String} separator (plus space) separated list of selected displayFields
	 * @private
	 */
	,getCheckedDisplay:function() {
		var re = new RegExp(this.separator, "g");
		return this.getCheckedValue(this.displayField).replace(re, this.separator + ' ');
	} // eo function getCheckedDisplay
	// }}}
	// {{{
	/**
	 * @return {String} separator separated list of selected valueFields
	 * @private
	 */
	,getCheckedValue:function(field) {
		field = field || this.valueField;
		var c = [];

		// store may be filtered so get all records
		var snapshot = this.store.snapshot || this.store.data;

		snapshot.each(function(r) {
			if(r.get(this.checkField)) {
				c.push(r.get(field));
			}
		}, this);

		return c.join(this.separator);
	} // eo function getCheckedValue
	// }}}
	// {{{
	/**
	 * beforequery event handler - handles multiple selections
	 * @param {Object} qe query event
	 * @private
	 */
	,onBeforeQuery:function(qe) {
		qe.query = qe.query.replace(new RegExp(this.getCheckedDisplay() + '[ ' + this.separator + ']*'), '');
	} // eo function onBeforeQuery
	// }}}
	// {{{
	/**
	 * blur event handler - runs only when real blur event is fired
	 */
	,onRealBlur:function() {
		return;
		this.list.hide();
		
		var rv = this.getRawValue();
		
		var rva = rv.split(new RegExp(RegExp.escape(this.separator) + ' *'));
		var va = [];
		var snapshot = this.store.snapshot || this.store.data;

		// iterate through raw values and records and check/uncheck items
		Ext.each(rva, function(v) {
			snapshot.each(function(r) {
				if(v === r.get(this.displayField)) {
					va.push(r.get(this.valueField));
				}
			}, this);
		}, this);
		
		this.setValue(va.join(this.separator));
		//this.store.clearFilter();
	} // eo function onRealBlur
	// }}}
	// {{{
	,arrayDelete:function(array,index){
    	if(index<0 || index>array.length-1){
    		return array
    	}
    	return array.slice(0,index).concat(array.slice(index+1,array.length))
    }
    
    ,arrayContains:function(array,o){
    	for(var i=0;i<array.length;i++){
    		if(array[i] == o){
    			return i
    		}
    	}
    	return -1
    }
	/**
	 * Combo's onSelect override
	 * @private
	 * @param {Ext.data.Record} record record that has been selected in the list
	 * @param {Number} index index of selected (clicked) record
	 */
	,onSelect:function(record, index) {
        if(this.fireEvent('beforeselect', this, record, index) !== false){
			
			// toggle checked field
        	var checked = record.get(this.checkField);
			record.set(this.checkField, !checked);

			
			// display full list
			//if(this.store.isFiltered()) {
			//	this.doQuery(this.allQuery);
			//}
			
			// set (update) value and fire event
			var cv = record.get(this.valueField);
			this.value = this.value || '';
			var vs = this.value.split(this.separator);
			if(checked){
				vs = this.arrayDelete(vs,this.arrayContains(vs, cv));
			}else{
//				if(this.arrayContains(vs, cv) == -1){
					vs.push(cv);
//				}
			}
			this.value = vs.join(this.separator);
			this.setValue(this.value);
            this.fireEvent('select', this, record, index);
        }
	} // eo function onSelect
	// }}}
	// {{{
	/**
	 * Sets the value of the CustomLovCombo
	 * @param {Mixed} v value
	 */
	,setValue:function(v) {
		if(v) {
			if(typeof v == "object"){
				v = v.key
			}
			v = '' + v;
			
			if(this.valueField) {
				var count = this.store.getCount()
				if(count == 0){
					this.value = v
					return
				}
				//this.store.clearFilter();
				this.store.each(function(r) {
					var checked = !(!v.match(
						 '(^|' + this.separator + ')' + RegExp.escape(r.get(this.valueField))
						+'(' + this.separator + '|$)'))
					;
					r.set(this.checkField, checked);
				}, this);
				
//				var vv = v.replace(/，/g,this.separator);
				var vs = v.split(this.separator);
				var ts = [];
				for(var i=0;i<vs.length;i++){
					var vi = Ext.util.Format.trim(vs[i]);
					var num = this.store.find(this.valueField, vi);
					if(num > -1){
						ts.push(this.store.getAt(num).get(this.displayField));
					}else{
						ts.push(vi);
					}
				}
				this.lastSelectionText = ts.join(this.separator + " ");
				if(this.hiddenField) {
					this.hiddenField.value = this.value;
				}
				util.widgets.CustomLovCombo.superclass.setValue.call(this, this.lastSelectionText);
				this.value = v;
			}
			else {
				this.value = v;
				this.setRawValue(v);
				if(this.hiddenField) {
					this.hiddenField.value = v;
				}
			}
			if(this.el) {
				this.el.removeClass(this.emptyClass);
			}
		}
		else {
			this.clearValue();
		}
		
	} // eo function setValue
	// }}}
	// {{{
	,getValue:function(){
		var rawValue = this.getRawValue().replace(/，/g,this.separator);
		var rvs = rawValue.split(this.separator);
		var tv = [];
		for(var i=0;i<rvs.length;i++){
			var rv = Ext.util.Format.trim(rvs[i]);
			if(!rv){
				continue;
			}
			var num = this.store.find(this.displayField, rv);
			alert(this.store.getCount()+"=="+this.store.find(this.displayField, '2011年卫生部标准'));
			if(num > -1){
				tv.push(this.store.getAt(num).get(this.valueField));
			}else{
				tv.push(rv);
			}
		}
		return tv.join(this.separator);
	}
	/**
	 * Selects all items
	 */
	,beforeBlur:function(){
		//do not remove this code
	}
	,selectAll:function() {
        this.store.each(function(record){
            // toggle checked field
            record.set(this.checkField, true);
        }, this);

        //display full list
        this.doQuery(this.allQuery);
        this.setValue(this.getCheckedValue());
    } // eo full selectAll
	// }}}
	// {{{
	/**
	 * Deselects all items. Synonym for clearValue
	 */
    ,deselectAll:function() {
    	
		this.clearValue();
    } // eo full deselectAll 
	// }}}

}); // eo extend
 
// register xtype
Ext.reg('customLovCombo', util.widgets.CustomLovCombo); 

