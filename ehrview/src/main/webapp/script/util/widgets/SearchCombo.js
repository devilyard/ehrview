$package("util.widgets")

$import("util.widgets.MyCombox")

util.widgets.SearchCombo = Ext.extend(util.widgets.MyCombox,  {
	triggerConfig : {
        tag:'span', cls:'x-form-twin-triggers', cn:[
		  {tag: "img", src: Ext.BLANK_IMAGE_URL, cls: "x-form-trigger x-form-arrow-trigger"},
          {tag: "img", src: Ext.BLANK_IMAGE_URL, cls: "x-form-trigger x-form-search-trigger"}
        ]
    },

	getTrigger : function(index){
        return this.triggers[index];
    },

	initTrigger : function(){
        var ts = this.trigger.select('.x-form-trigger', true);
        var triggerField = this;
        ts.each(function(t, all, index){
            var triggerIndex = 'Trigger'+(index==0?"":index);
            this.mon(t, 'click', this['on'+triggerIndex+'Click'], this, {preventDefault:true});
            t.addClassOnOver('x-form-trigger-over');
            t.addClassOnClick('x-form-trigger-click');
        }, this);
        this.triggers = ts.elements;
    },

	getTriggerWidth : function(){
        var tw = 0;
        Ext.each(this.triggers, function(t, index){
            var triggerIndex = 'Trigger' + (index + 1),
                w = t.getWidth();
            if(w === 0 && !this['hidden' + triggerIndex]){
                tw += this.defaultTriggerWidth;
            }else{
                tw += w;
            }
        }, this);
        return tw;
    },

	onTrigger1Click : function(){
		if(this.disabled){
			return;
		}
		this.fireEvent("lookup",this)
	}
});
Ext.reg('searchcombo', util.widgets.SearchCombo);