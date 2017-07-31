$package("util.widgets")
/**  
 * Ext JS Library 2.0 extend  
 * Version : 1.1  
 * Author : ftss  
 * Date : 2008-1-29  
 * E-mail : gx80@qq.com  
 * HomePage : http://www.gx80.cn  
 */  
util.widgets.TreeField = Ext.extend(Ext.form.TriggerField,  {   
    /**  
     * @cfg {Boolean} readOnly  
     * 设置为只读状态  
     *   
     */  
	selectedClass: 'x-combo-selected',
	
    readOnly : false ,   
    /**  
     * @cfg {String} displayField  
     * 用于显示数据的字段名  
     *   
     */  
    displayField : 'text',   
    /**  
     * @cfg {String} valueField  
     * 用于保存真实数据的字段名  
     */  
    valueField : 'key',   
    /**  
     * @cfg {String} hiddenName  
     * 保存真实数据的隐藏域名  
     */  
    hiddenName : null,   
    /**  
     * @cfg {Integer} listWidth  
     * 下拉框的宽度  
     */  
    listWidth : null,   
    /**  
     * @cfg {Integer} minListWidth  
     * 下拉框最小宽度  
     */  
    minListWidth : 100,   
    /**  
     * @cfg {Integer} listHeight  
     * 下拉框高度  
     */  
    listHeight : 100,   
    /**  
     * @cfg {Integer} minListHeight  
     * 下拉框最小高度  
     */  
    listAlign : "tl-bl?",
    
    minListHeight : null,   
    /**  
     * @cfg {String} dataUrl  
     * 数据地址  
     */  
    dataUrl : null,   
    /**  
     * @cfg {Ext.tree.TreePanel} tree  
     * 下拉框中的树  
     */  
    minChars:1,
    tree : null,   
    /**  
     * @cfg {String} value  
     * 默认值  
     */  
    value : null,   
    /**  
     * @cfg {String} displayValue  
     * 用于显示的默认值  
     */  
    displayValue : null,   
    /**  
     * @cfg {Object} baseParams  
     * 向后台传递的参数集合  
     */  
    baseParams : {},   
    /**  
     * @cfg {Object} treeRootConfig  
     * 树根节点的配置参数  
     */  
    treeRootConfig : {   
        key:'',
        text : 'please select...',   
        draggable:false  
        },   
    /**  
     * @cfg {String/Object} autoCreate  
     * A DomHelper element spec, or true for a default element spec (defaults to  
     * {tag: "input", type: "text", size: "24", autocomplete: "off"})  
     */  
    defaultAutoCreate : {tag: "input", type: "text", size: "24", autocomplete: "off"},   
  
    supportOnKeyQuery : true,
    
    initComponent : function(){   
        util.widgets.TreeField.superclass.initComponent.call(this);   
        this.addEvents(   
                'select',   
                'expand',   
                'collapse',   
                'beforeselect'        
        );   
        if(!this.store){
			this.store = new Ext.data.JsonStore({
	            'id': 0,
	            fields: [this.valueField, this.displayField],
	            data : []
	        });
        }
        this.selectedIndex = -1
    },   
    initEvents : function(){
       util.widgets.TreeField.superclass.initEvents.call(this);
	   var e = Ext.EventObject;
	   var keyMap = new Ext.KeyMap(this.el)
	   keyMap.on([e.ENTER,e.UP,e.DOWN,e.LEFT,e.RIGHT,e.ESC,e.SPACE],this.onKeyUp,this)
	   if(this.supportOnKeyQuery){
		   	Ext.EventManager.on(this.el,'keydown',this.onKeyDownQuery,this,{buffer:800});
	   }
    },
    onKeyDownQuery:function(e){
    	var k = e.getKey();
    	if(k>=48&&k<=57 || k>=65&&k<=90 || k==8){
    		if(!this.comboList){
        		this.initComboList()
        	}
    		var q = this.getRawValue();
			if (q == "" || q == this.text) {
				return true
			}
			this.collapse()
			this.comboCollapse()
			this.doQuery()
    	}
    },
    onKeyUp:function(key,e){
    	switch(key){
    		case e.SPACE:
    		case e.ENTER:
            	if(!this.comboList){
            		this.initComboList()
            	}
            	if(this.isComboExpanded()){
            		this.onViewClick();
            	}
                else{
                	if(this.isExpanded()){
	                	var sm = this.tree.getSelectionModel()
	                	var node = sm.getSelectedNode()
	                	if(node){
	                		this.select(node)
	                	}
                	}
                	else{
                		var q = this.getRawValue();
                		if(q == "" || q == this.text){
                			return true
                		}
                		this.comboCollapse()
                		this.doQuery()
                	}
                }  
            	break;
            case e.UP:
            	if(this.isComboExpanded()){
                	this.inKeyMode = true;
                	this.comboSelectPrev();
            	}
            	else{
            		if(this.isExpanded()){
            			var sm = this.tree.getSelectionModel()
                		var node = sm.getSelectedNode()
                		var next = null
                		if(!node){
                			var root = this.tree.root
                			if(root && root.firstChild){
								next = root.firstChild
                			}
                		}
                		else{
                			if(node.parentNode && node.parentNode.firstChild == node){
                				next = node.parentNode
                			}
                			else{
	                			next = node.previousSibling
                			}
	                		if(!next){
	                			next = node.parentNode.previousSibling
	                		}
                		}
                		if(next && next != this.tree.root){
                			sm.select(next)
                			next.ensureVisible()
                		}
                	}
                	else{
                		this.expand()
                	}
            	}
                break;
            case e.DOWN:
                 if(this.isComboExpanded()){
                    this.inKeyMode = true;
                    this.comboSelectNext();
                }
                else{
                	if(this.isExpanded()){
                		var sm = this.tree.getSelectionModel()
                		var node = sm.getSelectedNode()
                		var next = null
                		if(!node){
                			var root = this.tree.root
                			if(root && root.firstChild){
                				next = root.firstChild
                			}
                		}
                		else{
                			if(node.isExpanded()){
	                			next = node.firstChild
	                		}
	                		else{
	                			next = node.nextSibling
	                		}
	                		if(!next){
	                			next = node.parentNode.nextSibling
	                		}
                		}
                		if(next){
                			sm.select(next)
                			next.ensureVisible()
                		}
                	}
                	else{
                		this.expand()
                	}
                }
                break
           case e.RIGHT:
           		if(this.isExpanded()){
           			var sm = this.tree.getSelectionModel()
                	var node = sm.getSelectedNode()
                	if(node && !node.leaf && !node.isExpanded()){
                		node.expand()
                	}
           		}
           		break
           case e.LEFT:
           		if(this.isExpanded()){
           			var sm = this.tree.getSelectionModel()
                	var node = sm.getSelectedNode()
                	if(node && node.isExpanded()){
                		node.collapse()
                	}
           		}
           		break           		
           case e.ESC:
           		if(e.shiftKey){
    				return	
    			}
           		if(this.isComboExpanded()){
           			this.comboCollapse();
           		}
           		else{
           			this.collapse()
           		}
           		break;
    	}

    	if(window.event){
			var ev = window.event
			try{
				ev.keyCode=0;
				ev.returnValue=false
			}
			catch(e){}
			    	
    	}
    	e.stopEvent()
    	e.preventDefault()
    },
    doQuery:function(){
    	var q = this.getRawValue();
    	if(q.length < this.minChars){
    		return;
    	}
        this.selectedIndex = -1;
        this.store.removeAll();
        var params = {
        	query:q
        }
        if(this.tree.getLoader().dic.querySliceType > -1){
        	params.sliceType = this.tree.getLoader().dic.querySliceType;
        }
        this.fireEvent("beforeQuery",params);
        this.store.load({
            params:params
        });
        this.store.on('beforeload', this.onComboBeforeLoad, this);
        this.store.on('load', this.onComboLoad, this);
        this.store.on('loadexception', this.comboCollapse, this);
    },
    onComboLoad:function(store,rs,op){
    	if(rs.length == 0){
    		this.comboCollapse()
    		return;	
    	}
    	for(var i=0;i<rs.length;i++){
    		var r = rs[i];
    		if((this.tree.getLoader().dic.onlySelectLeaf=="true" || this.tree.getLoader().dic.onlySelectLeaf==true)
    			&& this.tree.getLoader().dic.lengthLimit && this.tree.getLoader().dic.lengthLimit!=r.get("key").length){
    			store.remove(r);
    		}
    	}
    	this.comboInnerList.setHeight(0);
    	this.comboExpand();
        this.restrictHeight();
		if(rs.length == 1){
			this.onComboSelect(rs[0],0)
		}
		else{
			this.comboSelectNext()
		}    
    },
     onComboBeforeLoad : function(){
        if(!this.hasFocus){
            return;
        }
        this.comboInnerList.update(this.loadingText ?
               '<div class="loading-indicator">加载中</div>' : '');
        this.restrictHeight();
        this.selectedIndex = -1;
    },   
    comboCollapse:function(){
        if(!this.isComboExpanded()){
            return;
        }
        this.comboList.hide();
        Ext.getDoc().un('mousewheel', this.collapseIf, this);
        Ext.getDoc().un('mousedown', this.collapseIf, this);
        this.fireEvent('collapse', this);    	
    },
    isComboExpanded:function(){
		return this.comboList && this.comboList.isVisible();    
    },
    comboExpand : function(){
        if(this.isComboExpanded() || !this.hasFocus){
            return;
        }
        this.comboList.alignTo.apply(this.comboList, [this.el].concat(this.listAlign));
        this.comboList.show();
        this.comboInnerList.setOverflow('auto'); // necessary for FF 2.0/Mac
        Ext.getDoc().on('mousewheel', this.comboCollapseIf, this);
        Ext.getDoc().on('mousedown', this.comboCollapseIf, this);
        this.fireEvent('expand', this);
    },    
    comboCollapseIf:function(e){
         if(!e.within(this.wrap) && !e.within(this.comboList)){
            this.comboCollapse();
        }   	
    },
    initComboList : function(){
        if(!this.comboList){
            var cls = 'x-combo-list';

            this.comboList = new Ext.Layer({
                shadow: this.shadow, cls: [cls, this.listClass].join(' '), constrain:false
            });

            var lw = this.listWidth || Math.max(this.wrap.getWidth(), this.minListWidth);
            this.comboList.setWidth(lw);
            this.comboList.swallowEvent('mousewheel');
            this.assetHeight = 0;

            if(this.title){
                this.header = this.comboList.createChild({cls:cls+'-hd', html: this.title});
                this.assetHeight += this.header.getHeight();
            }

            this.comboInnerList = this.comboList.createChild({cls:cls+'-inner'});
            this.comboInnerList.on('mouseover', this.onViewOver, this);
            this.comboInnerList.on('mousemove', this.onViewMove, this);
            this.comboInnerList.setWidth(lw - this.comboList.getFrameWidth('lr'));
 			//this.comboInnerList.setHeight(this.listHeight || this.minListHeight);
            if(this.pageSize){
                this.footer = this.comboList.createChild({cls:cls+'-ft'});
                this.pageTb = new Ext.PagingToolbar({
                    store:this.store,
                    pageSize: this.pageSize,
                    renderTo:this.footer
                });
                this.assetHeight += this.footer.getHeight();
            }

            if(!this.tpl){
                this.tpl = '<tpl for="."><div class="'+cls+'-item">{' + this.displayField + '}</div></tpl>';
            }
            this.view = new Ext.DataView({
                applyTo: this.comboInnerList,
                tpl: this.tpl,
                singleSelect: true,
                selectedClass: this.selectedClass,
                itemSelector: this.itemSelector || '.' + cls + '-item'
            });

            this.view.on('click', this.onViewClick, this);

            this.view.setStore(this.store);

            if(this.resizable){
                this.resizer = new Ext.Resizable(this.comboList,  {
                   pinned:true, handles:'se'
                });
                this.resizer.on('resize', function(r, w, h){
                    this.maxHeight = h-this.handleHeight-this.comboList.getFrameWidth('tb')-this.assetHeight;
                    this.listWidth = w;
                    this.comboInnerList.setWidth(w - this.comboList.getFrameWidth('lr'));
                    this.restrictHeight();
                }, this);
                this[this.pageSize?'footer':'innerList'].setStyle('margin-bottom', this.handleHeight+'px');
            }
        }
    },
    restrictHeight : function(){
        this.innerList.dom.style.height = '';
        var inner = this.comboInnerList.dom;
        var pad = this.comboList.getFrameWidth('tb')+(this.resizable?this.handleHeight:0)+this.assetHeight;
        var h = Math.max(inner.clientHeight, inner.offsetHeight, inner.scrollHeight);
        var ha = this.getPosition()[1]-Ext.getBody().getScroll().top;
        var hb = Ext.lib.Dom.getViewHeight()-ha-this.getSize().height;
        var space = Math.max(ha, hb, this.minHeight || 0)-this.comboList.shadowOffset-pad-5;
        h = Math.min(h, space, this.maxHeight || 200);
        this.comboInnerList.setHeight(h);
        this.comboList.beginUpdate();
        this.comboList.setHeight(h+pad);
        this.comboList.alignTo(this.wrap, this.listAlign);
        this.comboList.endUpdate();
    },    
    // private
    onViewMove : function(e, t){
        this.inKeyMode = false;
    },

    // private
    onViewOver : function(e, t){
        if(this.inKeyMode){ // prevent key nav and mouse over conflicts
            return;
        }
        var item = this.view.findItemFromChild(t);
        if(item){
            var index = this.view.indexOf(item);
            this.comboSelect(index, false);
        }
    },

    // private
    onViewClick : function(doFocus){
        var index = this.view.getSelectedIndexes()[0];
        var r = this.store.getAt(index);
        if(r){
            this.onComboSelect(r, index);
        }
        if(doFocus !== false){
            this.el.focus();
        }
    },
    comboSelect:function(index, scrollIntoView){
        this.selectedIndex = index;
        this.view.select(index);
        if(scrollIntoView !== false){
            var el = this.view.getNode(index);
            if(el){
                this.comboInnerList.scrollChildIntoView(el, false);
            }
        }   
    },
     // private
    comboSelectNext : function(){
        var ct = this.store.getCount();
        if(ct > 0){
            if(this.selectedIndex == -1){
                this.comboSelect(0);
            }else if(this.selectedIndex < ct-1){
                this.comboSelect(this.selectedIndex+1);
            }
        }
    },

    // private
    comboSelectPrev : function(){
        var ct = this.store.getCount();
        if(ct > 0){
            if(this.selectedIndex == -1){
                this.comboSelect(0);
            }else if(this.selectedIndex != 0){
                this.comboSelect(this.selectedIndex-1);
            }
        }
    },   
    onComboSelect:function(record, index){
        if(this.fireEvent('beforeselect', this, record, index) !== false){
        	var node = this.wrapComboSelect(record,index)
            this.setValue(node);
           	this.comboCollapse();
            this.fireEvent('select', this, node);
        }    
    },
    wrapComboSelect:function(record,index){
     	var node = {
       		attributes:{}
    	}
    	node[this.displayField] = record.data[this.displayField]
    	node['id'] = record.data[this.valueField]
    	Ext.apply(node.attributes,this.store.reader.jsonData.items[index])
    	return node;
    },
    getListParent : function() {
        return document.body;
    },
    getParentZIndex : function(){
        var zindex;
        if (this.ownerCt){
            this.findParentBy(function(ct){
                zindex = parseInt(ct.getPositionEl().getStyle('z-index'), 10);
                return !!zindex;
            });
        }
        return zindex;
    },
    initList : function(){
    	
        if(!this.list){   
           var cls = 'x-combo-list',
                listParent = Ext.getDom(this.getListParent() || Ext.getBody()),
                zindex = parseInt(Ext.fly(listParent).getStyle('z-index'), 10);

            if (!zindex) {
                zindex = this.getParentZIndex();
            }

            this.list = new Ext.Layer({
                parentEl: listParent,
                shadow: this.shadow,
                cls: [cls, this.listClass].join(' '),
                constrain:false,
                zindex: (zindex || 12000) + 5
            });
        	/*
        	//var cls = 'x-treefield-list';   
  			var cls ="x-combo-list"
            this.list = new Ext.Layer({   
                shadow: this.shadow, cls: [cls, this.listClass].join(' '), constrain:false  
            });   
  			*/
            var lw = this.listWidth || Math.max(this.wrap.getWidth(), this.minListWidth);   
            this.list.setWidth(lw);   
            this.list.swallowEvent('mousewheel');   
            
            this.innerList = this.list.createChild({cls:cls+'-inner'});   
            this.innerList.setWidth(lw - this.list.getFrameWidth('lr'));   
            this.innerList.setHeight(this.listHeight || this.minListHeight);   
            if(!this.tree){   
                this.tree = this.createTree(this.innerList);       
            }
            else{
            	//this.tree.renderTo(this.innerList)
            }
            this.tree.setHeight(this.listHeight || this.minListHeight);
            this.tree.autoScroll = true;
            this.tree.on('click',this.select,this); 
            this.tree.render(this.innerList);   
        }   
    },   
    onRender : function(ct, position){   
        util.widgets.TreeField.superclass.onRender.call(this, ct, position);   
        if(this.hiddenName){   
            this.hiddenField = this.el.insertSibling({tag:'input',    
                                                     type:'hidden',    
                                                     name: this.hiddenName,    
                                                     id: (this.hiddenId||this.hiddenName)},   
                    'before', true);   
            this.hiddenField.value =   
                this.hiddenValue !== undefined ? this.hiddenValue :   
                this.value !== undefined ? this.value : '';   
            this.el.dom.removeAttribute('name');   
        }   
        if(Ext.isGecko){   
            this.el.dom.setAttribute('autocomplete', 'off');   
        }   
  
        this.initList();   
    },   
    select : function(node){
    	if(!node.leaf && this.onlySelectLeaf){
    		return false
    	}
        if(this.fireEvent('beforeselect', node, this)!= false){  
        	this.selectedNode = node
            this.onSelect(node);  
            this.fireEvent('select', this, node);   
        	this.el.focus();
        }   
    },   
    onSelect:function(node){   
        this.setValue(node);
        this.selectedNode = node
        this.collapse();   
    },   
    createTree:function(el){   
        var Tree = Ext.tree;   
        var tree = new Tree.TreePanel({   
            el:el,   
            autoScroll:false,   
            animate:true,
            containerScroll: false,    
            loader: new Tree.TreeLoader({   
                dataUrl : this.dataUrl,   
                baseParams : this.baseParams   
            })   
        });   
        var root = new Tree.AsyncTreeNode(this.treeRootConfig);   
        tree.setRootNode(root);   
        return tree;   
    },
    getValue : function(){    	
        if(this.valueField){   
            return typeof this.value != 'undefined' ? this.value : '';   
        }else{   
            return util.widgets.TreeField.superclass.getValue.call(this);   
        }   
    },   
    setValue : function(node){
        var text,value;   
        if(!node){
        	text = "";
        	value = ""
        }
        else{
        	if(typeof node == 'object'){   
	            text = node[this.displayField];   
	            value = node[this.valueField || this.displayField];
	            if(!value && node.attributes){
	            	value = node.attributes[this.valueField]
	            }
	        }
	        else{
	        	var n = this.tree.getNodeById(node)
	        	if(n){
	        		text = n.text; 	
	        	}
	            else{
	            	text = node
	            }  
	            value = node;
	        }   
        }
        if(this.hiddenField){   
            this.hiddenField.value = value;   
        }
        util.widgets.TreeField.superclass.setValue.call(this, text);   
        this.value = value; 
        this.text = text;
    },   
    onResize: function(w, h){   
        util.widgets.TreeField.superclass.onResize.apply(this, arguments);   
        if(this.list && this.listWidth == null){   
            var lw = Math.max(w, this.minListWidth);   
            this.list.setWidth(lw);   
            this.innerList.setWidth(lw - this.list.getFrameWidth('lr'));   
        }   
    },   
    validateBlur : function(){   
    	return !this.list || !this.list.isVisible();
    },   
    onDestroy : function(){   
        if(this.list){   
            this.list.destroy();   
        }   
        if(this.wrap){   
            this.wrap.remove();   
        }   
        util.widgets.TreeField.superclass.onDestroy.call(this);   
    },   
    collapseIf : function(e){   
        if(!e.within(this.wrap) && !e.within(this.list)){   
            this.collapse();   
        }   
    },   
  
    collapse : function(){   
        if(!this.isExpanded()){   
            return;   
        }   
        this.list.hide();   
        Ext.getDoc().un('mousewheel', this.collapseIf, this);   
        Ext.getDoc().un('mousedown', this.collapseIf, this);   
        this.fireEvent('collapse', this);   
    },   
     beforeBlur : function() {
		this.assertValue();
	},
	
	//addby tianj 2011-10-17  增加了一个判断是否清空的标记:forceSelection
    assertValue : function() {
    	if(this.forceSelection &&(!(this.value == this.getValue() && this.text == this.getRawValue()))){
    		this.clearValue();
    	}
	},
	clearValue:function(){
		if(this.hiddenField){
            this.hiddenField.value = '';
        }
        this.setRawValue('');
        this.lastSelectionText = '';
        this.applyEmptyText();
        this.value = '';
        this.text = '';
	}, 
    expand : function(){  
    	
        if(this.isExpanded() || !this.hasFocus){   
            return;   
        }   
        this.onExpand(); 
        
        this.list.alignTo.apply(this.list, [this.el].concat(this.listAlign));
       // this.(this.wrap, this.listAlign);   
        var listParent = Ext.getDom(this.getListParent() || Ext.getBody()),
            zindex = parseInt(Ext.fly(listParent).getStyle('z-index') ,10);
        if (!zindex){
            zindex = this.getParentZIndex();
        }
        if (zindex) {
            this.list.setZIndex(zindex + 5);
        }
        this.list.show(); 
        if(Ext.isGecko2){
            this.innerList.setOverflow('auto'); // necessary for FF 2.0/Mac
        }
        this.mon(Ext.getDoc(), {
            scope: this,
            mousewheel: this.collapseIf,
            mousedown: this.collapseIf
        });
       // Ext.getDoc().on('mousewheel', this.collapseIf, this);   
       // Ext.getDoc().on('mousedown', this.collapseIf, this);   
        this.fireEvent('expand', this);   
    },   
    onExpand : function(){ 
    },   
    isExpanded : function(){   
        return this.list && this.list.isVisible();   
    },   
    onTriggerClick : function(){   
        if(this.disabled){   
            return;   
        }   
		if(this.isComboExpanded()){
			this.comboCollapse()
		}        
        if(this.isExpanded()){   
            this.collapse();   
        }else {   
            this.onFocus({});   
            this.expand();   
        }   
        this.el.focus(); 
        
    }   
});   
Ext.reg('treeField', util.widgets.TreeField); 