$package("util.widgets")

$import("util.widgets.MyPagingToolbar")

util.widgets.MyCombox = Ext.extend(Ext.form.ComboBox,  {
	onFocus : function(){
        util.widgets.MyCombox.superclass.onFocus.call(this);
		if(this.store.getCount() == 0 || this.mode == 'local'){
			this.store.load()		//异步的有问题
			this.focusLoad = true
		}
    },
    onLoad : function(){
    	if(this.focusLoad){
    		this.focusLoad = false
    		return;
    	}
    	util.widgets.MyCombox.superclass.onLoad.call(this);
    },
	assertValue:function(){
		var val = this.getRawValue(),
            rec;

        if(this.forceSelection){
            if(val.length > 0 && val != this.emptyText){
                this.el.dom.value = Ext.value(this.lastSelectionText, '');
                this.applyEmptyText();
            }else{
                this.clearValue();
            }
        }else{
        	rec = this.findRecord(this.displayField, val);
            if(rec){
                val = {key:rec.get(this.valueField),text:rec.get(this.displayField)};
            }
            this.setValue(val);
        }
	},
	onSelect : function(record, index){
        if(this.fireEvent('beforeselect', this, record, index) !== false){
            this.setValue(record.data);
            this.collapse();
            this.fireEvent('select', this, record, index);
        }
    },
    findRecord : function(prop, value){
    	this.store.clearFilter(true);
     	return util.widgets.MyCombox.superclass.findRecord.apply(this,[prop, value]);
    },
   	setValue:function(v){
   		var needFireSelect = false;
        var text = v;
        if(typeof v == "object"){
        	text = v[this.displayField]
        	v = v[this.valueField]
        }else{
	        if(this.valueField){
	        	var r;
	        	if(v){
	        		if(this.searchField){
	        			r = this.findRecord(this.searchField, v);
	        			if(r){
	        				v = r.data[this.valueField]
	        			}
	        		}
	        		if(!r){
	            		r = this.findRecord(this.valueField, v);
	        		}
	        	}
	            if(r){
	                text = r.data[this.displayField];
	                needFireSelect = true;
	            }
	            else{
	                if(this.rendered){
	                	this.clearValue()
	                }
	                return;
	            }
	        }
	    }
        this.lastSelectionText = text;
        if(this.hiddenField){
            this.hiddenField.value = v;
        }
       
       	Ext.form.ComboBox.superclass.setValue.call(this, text);
        this.value = v;   
        if(needFireSelect){
        	this.fireEvent("select",this,r);			//也是选中了，级联产生的问题
        }
   },
   fixDelayQuery:function(qe){
   		return false;
   },
   initList:function(){
		if(!this.list){
            var cls = 'x-combo-list',
                listParent = Ext.getDom(this.getListParent() || Ext.getBody());
            this.list = new Ext.Layer({
                parentEl: listParent,
                shadow: this.shadow,
                cls: [cls, this.listClass].join(' '),
                constrain:false,
                zindex: this.getZIndex(listParent)
            });
            var lw = this.listWidth || Math.max(this.wrap.getWidth(), this.minListWidth);
            this.list.setSize(lw, 0);
            this.list.swallowEvent('mousewheel');
            this.assetHeight = 0;
            if(this.syncFont !== false){
                this.list.setStyle('font-size', this.el.getStyle('font-size'));
            }
            if(this.title){
                this.header = this.list.createChild({cls:cls+'-hd', html: this.title});
                this.assetHeight += this.header.getHeight();
            }
            this.innerList = this.list.createChild({cls:cls+'-inner'});
            this.mon(this.innerList, 'mouseover', this.onViewOver, this);
            this.mon(this.innerList, 'mousemove', this.onViewMove, this);
            this.innerList.setWidth(lw - this.list.getFrameWidth('lr'));
            if(this.pageSize){
                this.footer = this.list.createChild({cls:cls+'-ft'});
                this.pageTb = new util.widgets.MyPagingToolbar({
                    store: this.store,
                    requestData:this.requestData,
                    displayInfo: true,
					emptyMsg:"无相关记录",
                    renderTo:this.footer
                });
                this.assetHeight += this.footer.getHeight();
            }
            if(!this.tpl){
                this.tpl = '<tpl for="."><div class="'+cls+'-item">{' + this.displayField + '}</div></tpl>';
            }
            this.view = new Ext.DataView({
                applyTo: this.innerList,
                tpl: this.tpl,
                singleSelect: true,
                selectedClass: this.selectedClass,
                itemSelector: this.itemSelector || '.' + cls + '-item',
                emptyText: this.listEmptyText,
                deferEmptyText: false
            });

            this.mon(this.view, {
                containerclick : this.onViewClick,
                click : this.onViewClick,
                scope :this
            });
            this.bindStore(this.store, true);
            if(this.resizable){
                this.resizer = new Ext.Resizable(this.list,  {
                   pinned:true, handles:'se'
                });
                this.mon(this.resizer, 'resize', function(r, w, h){
                    this.maxHeight = h-this.handleHeight-this.list.getFrameWidth('tb')-this.assetHeight;
                    this.listWidth = w;
                    this.innerList.setWidth(w - this.list.getFrameWidth('lr'));
                    this.restrictHeight();
                }, this);
                this[this.pageSize?'footer':'innerList'].setStyle('margin-bottom', this.handleHeight+'px');
            }
        }
	}
});   
Ext.reg('mycombox', util.widgets.MyCombox); 