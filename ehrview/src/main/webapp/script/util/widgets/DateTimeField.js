$package("util.widgets")

$styleSheet("util.widgets.DateTimeField.css.DateTimePicker")

util.widgets.Adapter = function(component, config){
    util.widgets.Adapter.superclass.constructor.call(this, config);
    this.component = component;
};
Ext.extend(util.widgets.Adapter, Ext.menu.BaseItem, {
    // private
    canActivate : true,

    // private
   onRender : function(container, position){
        this.component.render(container);
        this.el = this.component.getEl();
        if(this.ownerCt && this.ownerCt instanceof Ext.menu.Menu){
            this.parentMenu = this.ownerCt;
        }
    },
	
    // private
    activate : function(){
        if(this.disabled){
            return false;
        }
        this.component.focus();
        this.fireEvent("activate", this);
        return true;
    },

    // private
    deactivate : function(){
        this.fireEvent("deactivate", this);
    },

    // private
    disable : function(){
        this.component.disable();
        util.widgets.Adapter.superclass.disable.call(this);
    },

    // private
    enable : function(){
        this.component.enable();
        util.widgets.Adapter.superclass.enable.call(this);
    }

});

util.widgets.DateTimeField = Ext.extend(Ext.form.DateField, {
	
	timeFields:'auto',
	
	// private
	availableTimeFields:['H','h','G','g','i','s'],
	
	// private
	formatMap:{g:'h',G:'H'},
	
	// private
	timeFieldHandlers : null,
	
	initComponent : function(){
		if(Ext.isString(this.minValue)){
            this.minValue = this.safeParse(this.minValue, 'Y-m-d H:i:s');
        }
        if(Ext.isString(this.maxValue)){
            this.maxValue = this.safeParse(this.maxValue, 'Y-m-d H:i:s');
        }
		util.widgets.DateTimeField.superclass.initComponent.call(this);
		
		// Auto detect trigger from format
		if (!this.timeFields || this.timeFields=='auto') {
			this.timeFields = '';
			for(i in this.availableTimeFields){
				var timeField = this.availableTimeFields[i];
				if (this.format.indexOf(timeField)>=0) {
					this.timeFields += timeField;
				}
			}			
		};
		
		// Add date trigger
		var cn = [{tag: "img", src: Ext.BLANK_IMAGE_URL, cls: "x-form-trigger x-form-date-trigger"}];
		
		// Add time triggers
		var validation = this.availableTimeFields.join("");
		for(var i=0;i<this.timeFields.length;i++) {
			var timeField = this.timeFields.charAt(i);
			if (validation.indexOf(timeField)<0) {
				continue;
			}
			timeField = this.formatMap[timeField] || timeField;
			cn.push({tag: "img", src: Ext.BLANK_IMAGE_URL, cls: "x-form-trigger x-form-time-"+timeField+"-trigger"});
		}
		this.triggerConfig = {tag:'span', cls:'x-form-dateTime-triggers',cn:cn};
    },
    
    onResize : function(w, h){
    	Ext.form.TriggerField.superclass.onResize.call(this, w, h);
    	var tw = this.trigger.getWidth() || (17 * (this.timeFields.length+1));
		if(Ext.isNumber(w)){
            this.el.setWidth(w - tw);
        }
        this.wrap.setWidth(this.el.getWidth() + tw);
    },

    getTrigger : function(index){
        return this.triggers[index];
    },
    
    setMinValue : function(dt){
        this.minValue = (typeof dt == "string" ? this.safeParse(dt, 'Y-m-d H:i:s') : dt);
        if(this.menu){
            this.menu.picker.setMinDate(new Date(this.minValue.getTime()));
        }
    },

    setMaxValue : function(dt){
        this.maxValue = (typeof dt == "string" ? this.safeParse(dt, 'Y-m-d H:i:s') : dt);
        if(this.menu){
            this.menu.picker.setMaxDate(new Date(this.maxValue.getTime()));
        }
    },
    
    onTriggerClick : function(){
        if(this.disabled){
            return;
        }
        if(this.menu == null){
            this.menu = new Ext.menu.DateMenu();
        }
        Ext.apply(this.menu.picker,  {
            minDate : this.minValue ? new Date(this.minValue.getTime()) : this.minValue,
            maxDate : this.maxValue ? new Date(this.maxValue.getTime()) : this.maxValue,
            disabledDatesRE : this.ddMatch,
            disabledDatesText : this.disabledDatesText,
            disabledDays : this.disabledDays,
            disabledDaysText : this.disabledDaysText,
            format : this.format,
            showToday : this.showToday,
			todayIsNow : true,
            minText : String.format(this.minText, this.formatDate(this.minValue)),
            maxText : String.format(this.maxText, this.formatDate(this.maxValue))
        });
        this.menu.on(Ext.apply({}, this.menuListeners, {
            scope:this
        }));
        this.menu.picker.setValue(this.getValue() || new Date());
        this.menu.show(this.el, "tl-bl?");
    },

    initTrigger : function(){
        var ts = this.trigger.select('.x-form-trigger', true);
        this.wrap.setStyle('overflow', 'hidden');
        this.timeFieldHandlers = new Array();
        var triggerField = this;        
        ts.each(function(t, all, index){
            t.hide = function(){
                var w = triggerField.wrap.getWidth();
                this.dom.style.display = 'none';
                triggerField.el.setWidth(w-triggerField.trigger.getWidth());
            };
            t.show = function(){
                var w = triggerField.wrap.getWidth();
                this.dom.style.display = '';
                triggerField.el.setWidth(w-triggerField.trigger.getWidth());
            };
            if (index>0) {
            	var timeField = triggerField.timeFields.charAt(index-1);
            	timeField = this.formatMap[timeField] || timeField;
            	var handler = new util.widgets.TimeFieldHandler({parent:this,timeField:timeField});
            	t.on("click", handler.onTriggerClick, handler, {preventDefault:true});
            	triggerField.timeFieldHandlers.push(handler);
            } else {
            	t.on("click", this.onTriggerClick, this, {preventDefault:true});
            }
            t.addClassOnOver('x-form-trigger-over');
            t.addClassOnClick('x-form-trigger-click');
        }, this);
        this.triggers = ts.elements;        
    },
    
    onDestroy : function(){
    	if (this.timeFieldHandlers) {
	        for(var i=this.timeFieldHandlers.length-1;i>=0;i--) {
	        	var handler = this.timeFieldHandlers[i];
	        	handler.destroy();
	        	this.timeFieldHandlers[i]=null;
	        	delete handler;
	        }
	        this.timeFieldHandlers=null;
    	}
        util.widgets.DateTimeField.superclass.onDestroy.call(this);
    },
	
	// private
	validateBlur : function(){
		if (!util.widgets.DateTimeField.superclass.validateBlur.call(this)){
			return false;
		}
		for(var i=this.timeFieldHandlers.length-1;i>=0;i--) {
			if (!this.timeFieldHandlers[i].validateBlur()) {
				return false;
			}
		}
        return true;
    },

 // private
    menuListeners : {
        select: function(m, d){
	    	var v = new Date(d.getTime());
			if (this.getValue()) {
				d.setHours(this.getValue().getHours());
				d.setSeconds(this.getValue().getSeconds());
				d.setMinutes(this.getValue().getMinutes());    			
			}
    		this.setValue(d);
        },
        show : function(){ // retain focus styling
            this.onFocus();
        },
        hide : function(){
            this.focus.defer(10, this);
            var ml = this.menuListeners;
            this.menu.un("select", ml.select,  this);
            this.menu.un("show", ml.show,  this);
            this.menu.un("hide", ml.hide,  this);
        }
    },
    getErrors: function(value) {
        var errors = Ext.form.DateField.superclass.getErrors.apply(this, arguments);

        value = this.formatDate(value || this.processValue(this.getRawValue()));

        if (value.length < 1) { // if it's blank and textfield didn't flag it then it's valid
             return errors;
        }

        var svalue = value;
        value = this.parseDate(value);
        if (!value) {
            errors.push(String.format(this.invalidText, svalue, this.format));
            return errors;
        }

        var time = value.getTime();
        if (this.minValue && time < this.minValue.getTime()) {
            errors.push(String.format(this.minText, this.formatDate(this.minValue)));
        }

        if (this.maxValue && time > this.maxValue.getTime()) {
            errors.push(String.format(this.maxText, this.formatDate(this.maxValue)));
        }

        if (this.disabledDays) {
            var day = value.getDay();

            for(var i = 0; i < this.disabledDays.length; i++) {
                if (day === this.disabledDays[i]) {
                    errors.push(this.disabledDaysText);
                    break;
                }
            }
        }

        var fvalue = this.formatDate(value);
        if (this.disabledDatesRE && this.disabledDatesRE.test(fvalue)) {
            errors.push(String.format(this.disabledDatesText, fvalue));
        }

        return errors;
    }
});
Ext.reg('datetimefield', util.widgets.DateTimeField);

// private
util.widgets.TimeFieldHandler = function (config) {
	Ext.apply(this,config);	
}
Ext.extend(util.widgets.TimeFieldHandler, Ext.util.Observable,{
	parent : null,
	timeField:null,
	menu : null,
	
	onTriggerClick : function(){
		if(this.parent.disabled){
            return;
        }
        if(this.menu == null){
            this.menu = new util.widgets.TimeFieldMenu({timeField:this.timeField});
        }
        Ext.apply(this.menu.picker,  {
            minDate : this.parent.minValue,
            maxDate : this.parent.maxValue,
            minText : String.format(this.parent.minText, this.parent.formatDate(this.parent.minValue)),
            maxText : String.format(this.parent.maxText, this.parent.formatDate(this.parent.maxValue))
        });
        this.menu.on("select",this.select,this);
        this.menu.on("show",this.show,this);
        this.menu.on("hide",this.hide,this);
        this.menu.picker.setValue(this.parent.getValue() || new Date());
        this.menu.show(this.parent.el, "tl-bl?");
    },
	
    select: function(m, d){  
		if (this.parent.getValue()) {
			var v = new Date(this.parent.getValue().getTime());
			m.picker.copyTimeField(d,v);
			this.parent.setValue(v);
		}  else {
			this.parent.setValue(d);
		}
    },
    show : function(){ 
    	this.parent.onFocus();
    },
    hide : function(){
    	this.parent.focus.defer(10, this.parent);
    	this.menu.un("select", this.select,  this);
    	this.menu.un("show", this.show,  this);
    	this.menu.un("hide", this.hide,  this);
    },
    destroy : function(){ 
    	if (this.menu) this.menu.destroy();
    },
	validateBlur : function(){
        return !this.menu || !this.menu.isVisible();
    }
});

util.widgets.TimeFieldMenu = function(config){
    util.widgets.TimeFieldMenu.superclass.constructor.call(this, config);
    this.plain = true;
    var di = new util.widgets.TimeFieldItem(config);
    this.add(di);
    
    this.picker = di.picker;
    
    this.relayEvents(di, ["select"]);

};
Ext.extend(util.widgets.TimeFieldMenu, Ext.menu.Menu, {
    cls:'x-timeField-menu',

    // private
    beforeDestroy : function() {
        this.picker.destroy();
    }
});

util.widgets.TimeFieldItem = function(config){
    util.widgets.TimeFieldItem.superclass.constructor.call(this, Ext.ComponentMgr.create(config,"timepicker"+config.timeField), config);
    
    
    this.picker = this.component;
    this.addEvents('select');
    
    this.picker.on("render", function(picker){
        picker.getEl().swallowEvent("click");
        picker.container.addClass("x-menu-timeField-item");
    });

    this.picker.on("select", this.onSelect, this);
};

Ext.extend(util.widgets.TimeFieldItem, util.widgets.Adapter, {
    // private
    onSelect : function(picker, date){
        this.fireEvent("select", this, date, picker);
        util.widgets.TimeFieldItem.superclass.handleClick.call(this);
    }
});


util.widgets.TimeFieldPicker = Ext.extend(Ext.Component, {
    
    minText : "This date is before the minimum date",
    
    maxText : "This date is after the maximum date",
    
    nowText : "Now",
    
    constrainToViewport : true,
    
    
    
    
    
    
    

    // private
    initComponent : function(){
        util.widgets.TimeFieldPicker.superclass.initComponent.call(this);

        var old = this.value;
        this.value = new Date();
        if (old) {
        	this.value.setTime(old.getTime());
        }
        
        this.addEvents(
            
            'select'
        );

        if(this.handler){
            this.on("select", this.handler,  this.scope || this);
        }

    },

    
    setMinDate : function(dt){
        this.minDate = dt;
        this.update(this.value, true);
    },
    
    
    setMaxDate : function(dt){
        this.maxDate = dt;
        this.update(this.value, true);
    },

    
    setValue : function(value){
        this.value = new Date();
        this.value.setTime(value.getTime());
        if(this.el){
            this.update(this.value,true);
        }
    },

    
    getValue : function(){
        return this.value;
    },

    // private
    focus : function(){
        if(this.el){
            this.update(this.activeDate);
        }
    },

    // private
    onRender : function(container, position){
        var m = [
             '<table cellspacing="0" width="'+this.columns*25+'">',
                '<tr><td class="x-date-middle" align="center">'+this.header+'</td></tr>',
                '<tr><td><table class="x-date-inner" cellspacing="0">'];
        
        m[m.length] = "<tbody><tr>";
        for(var i = 0; i < this.max; i++) {
            if(i % this.columns == 0 && i != 0){
                m[m.length] = "</tr><tr>";
            }
            var txt = (i<10) ? "0"+i : ""+i;
            m[m.length] = '<td><a href="#" hidefocus="on" class="x-date-date" tabIndex="1"><em><span>'+txt+'</span></em></a></td>';
        }
        m.push('</tr></tbody></table></td></tr>', 
                '</table><div class="x-date-mp"></div>');

        var el = document.createElement("div");
        el.className = "x-date-picker";
        el.innerHTML = this.generateContent();

        container.dom.insertBefore(el, position);

        this.el = Ext.get(el);
        this.eventEl = Ext.get(el.firstChild);

        this.eventEl.on("mousewheel", this.handleMouseWheel,  this);

        var kn = new Ext.KeyNav(this.eventEl, {
            "left" : function(e){
                this.update(this.activeDate.add(this.timeField, -1));
            },

            "right" : function(e){
                this.update(this.activeDate.add(this.timeField, 1));
            },

            "up" : function(e){
                this.update(this.activeDate.add(this.timeField, -this.columns));
            },

            "down" : function(e){
                this.update(this.activeDate.add(this.timeField, this.columns));
            },

            "enter" : function(e){
                e.stopPropagation();
                return true;
            },

            scope : this
        });

        this.eventEl.on("click", this.handleDateClick,  this, {delegate: "a.x-date-date"});

        this.el.unselectable();
        
        this.cells = this.el.select("table.x-date-inner tbody td");
        
        if(Ext.isIE){
            this.el.repaint();
        }
        this.update(this.value);
    },
    
    generateContent : function(e) {
    	var m = [
                 '<table cellspacing="0" width="'+this.columns*25+'">',
                    '<tr><td class="x-date-middle" align="center">'+this.header+'</td></tr>',
                    '<tr><td><table class="x-date-inner" cellspacing="0">'];
            
        m[m.length] = "<tbody><tr>";
        for(var i = 0; i < this.max; i++) {
            if(i % this.columns == 0 && i != 0){
                m[m.length] = "</tr><tr>";
            }
            var txt = (i<10) ? "0"+i : ""+i;
            m[m.length] = '<td><a href="#" hidefocus="on" class="x-date-date" tabIndex="1"><em><span>'+txt+'</span></em></a></td>';
        }
        m.push('</tr></tbody></table></td></tr>', 
                '</table><div class="x-date-mp"></div>');
       return m.join("");
    },

    // private
    handleMouseWheel : function(e){
        var delta = e.getWheelDelta();
        if(delta > 0){
        	this.update(this.activeDate.add(this.timeField, 1));
            e.stopEvent();
        } else if(delta < 0){
        	this.update(this.activeDate.add(this.timeField, -1));
            e.stopEvent();
        }
    },

    // private
    handleDateClick : function(e, t){
        e.stopEvent();
        if(t.timeFieldValue!=undefined && !Ext.fly(t.parentNode).hasClass("x-date-disabled")){
        	var v = new Date(this.activeDate.getTime());
        	this.updateTimeField(v,t.timeFieldValue);
        	this.setValue(v);
            this.fireEvent("select", this, this.value);
        }
    },

    // private
    update : function(date, forceRefresh){
        var vd = this.activeDate;
        this.activeDate = date;
        
        // 
        if(!forceRefresh && vd && this.el){
            var t = this.extractTimeField(date);
            this.cells.removeClass("x-date-selected");
            this.cells.each(function(c){
               if(c.dom.firstChild.timeFieldValue == t){
                   c.addClass("x-date-selected");
                   setTimeout(function(){
                        try{c.dom.firstChild.focus();}catch(e){}
                   }, 50);
                   return false;
               }
            });
            return;            
        }
        
        this.cells.removeClass("x-date-selected");
        var cells = this.cells.elements;
        var now = new Date();
        
        // convert everything to numbers so it's fast
        var min = this.minDate ? this.minTime(this.minDate).getTime() : Number.NEGATIVE_INFINITY;
        var max = this.maxDate ? this.maxTime(this.maxDate).getTime() : Number.POSITIVE_INFINITY;
        var d = new Date( date.getTime() );
        var tp = this;
        
        var setCellClass = function(cal, cell){
            cell.title = "";
            var t = d.getTime();
            var h = tp.extractTimeField(d);
            cell.firstChild.timeFieldValue = h;
            if(h == tp.extractTimeField(now)){
                cell.className += " x-date-today";
                cell.title = cal.nowText;
            }
            if(h == tp.extractTimeField(date)){
                cell.className += " x-date-selected";
                setTimeout(function(){
                    try{cell.firstChild.focus();}catch(e){}
                }, 50);
            }
            // disabling
            if(t < min) {
            	cell.className = " x-date-disabled";
                cell.title = cal.minText;
                return;
            }
            if(t > max) {
            	cell.className = " x-date-disabled";
                cell.title = cal.maxText;
                return;
            }            
        };

        for(var i=0; i < this.max; i++) {
        	this.updateTimeField(d,i);
        	cells[i].className = "x-date-active";
            setCellClass(this, cells[i]);
        }

        if(!this.internalRender){
            var main = this.el.dom.firstChild;
            var w = main.offsetWidth;
            this.el.setWidth(w + this.el.getBorderWidth("lr"));
            Ext.fly(main).setWidth(w);
            this.internalRender = true;
            // opera does not respect the auto grow header center column
            // then, after it gets a width opera refuses to recalculate
            // without a second pass
            if(Ext.isOpera && !this.secondPass){
                main.rows[0].cells[1].style.width = (w - (main.rows[0].cells[0].offsetWidth+main.rows[0].cells[2].offsetWidth)) + "px";
                this.secondPass = true;
                this.update.defer(10, this, [date]);
            }
        }
    },
    
    
    updateTimeField : Ext.emptyFn,
    
    
    extractTimeField : Ext.emptyFn,
    
    
    copyTimeField : function (sourceDate, targetDate) {
    	this.updateTimeField(targetDate,this.extractTimeField(sourceDate));
    },
    
    
    minTime : function(date) {
    	return new Date(Math.floor(date.getTime()/this.fieldInMillis)*this.fieldInMillis);
    },
    
    
    maxTime : function(date) {
    	return new Date((Math.floor(date.getTime()/this.fieldInMillis)+1)*this.fieldInMillis-1);
    }

    
});



util.widgets.DateHourPicker = Ext.extend(util.widgets.TimeFieldPicker, {	
	max:24,
	columns:6,
	timeField:'H',
	header:'Hours',
	fieldInMillis:1000*60*60,
	
	updateTimeField : function(date,timeFieldValue){
        date.setHours(timeFieldValue);
    },
    
    extractTimeField : function(date){
        return date.getHours();
    }
	
});

Ext.reg('timepickerH', util.widgets.DateHourPicker);

util.widgets.DateAMPMHourPicker = Ext.extend(util.widgets.DateHourPicker, {	
	timeField:'h',
	
	generateContent : function() {
		var m = [
             '<table cellspacing="0" width="'+this.columns*25+'">',
                '<tr><td class="x-date-middle" align="center">'+this.header+'</td></tr>'];
	
		m.push( this.generateXMContent('AM'));
		m.push( this.generateXMContent('PM'));
		m.push( '</table><div class="x-date-mp"></div>');
		return m.join("");
	},
	
	generateXMContent : function(xm) {
    	var m = ['<tr><td>',
                 '<table class="x-date-inner" cellspacing="0">',
                 '<th colspan="6"><span>'+xm+'</span></th>',
                 '<tbody><tr>'];
        for(var i = 0; i < 12; i++) {
            if(i % this.columns == 0 && i != 0){
                m[m.length] = "</tr><tr>";
            }
            var txt = (i<10) ? "0"+i : ""+i;
            m[m.length] = '<td><a href="#" hidefocus="on" class="x-date-date" tabIndex="1"><em><span>'+txt+'</span></em></a></td>';
        }
        m.push('</tr></tbody></table></td></tr>');
       return m.join("");
    }
	
});

Ext.reg('timepickerh', util.widgets.DateAMPMHourPicker);

util.widgets.DateMinutePicker = Ext.extend(util.widgets.TimeFieldPicker, {
	max:60,
	columns:10,
	timeField:'i',
	header:'Minutes',
	fieldInMillis:1000*60,
	
	updateTimeField : function(date,timeFieldValue){
        date.setMinutes(timeFieldValue);
    },
    
    extractTimeField : function(date){
        return date.getMinutes();
    }
	
});

Ext.reg('timepickeri', util.widgets.DateMinutePicker);

util.widgets.DateSecondPicker = Ext.extend(util.widgets.DateMinutePicker, {
	timeField:'s',
	header:'Seconds',
	fieldInMillis:1000,
	
	updateTimeField : function(date,timeFieldValue){
        date.setSeconds(timeFieldValue);
    },
    
    extractTimeField : function(date){
        return date.getSeconds();
    }
	
});
Ext.reg('timepickers', util.widgets.DateSecondPicker);