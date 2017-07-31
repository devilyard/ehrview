$package("util.widgets")

$styleSheet("ext.mytab")
util.widgets.ItabPanel = function(config) {
    config.baseCls = 'x-mytab-panel'
	config.autoTabSelector = 'div.x-tab'
	config.itemCls = 'x-tab-item'
    util.widgets.ItabPanel.superclass.constructor.call(this, config);
 	
}
 

// extend
Ext.extend(util.widgets.ItabPanel, Ext.TabPanel, {

	onRender : function(ct, position){
        Ext.TabPanel.superclass.onRender.call(this, ct, position);

        if(this.plain){
            var pos = this.tabPosition == 'top' ? 'header' : 'footer';
            this[pos].addClass('x-mytab-panel-'+pos+'-plain');
        }

        var st = this[this.stripTarget];

        this.stripWrap = st.createChild({cls:'x-mytab-strip-wrap', cn:{
            tag:'ul', cls:'x-mytab-strip x-mytab-strip-'+this.tabPosition}});

        var beforeEl = (this.tabPosition=='bottom' ? this.stripWrap : null);
        st.createChild({cls:'x-mytab-strip-spacer'}, beforeEl);
        this.strip = new Ext.Element(this.stripWrap.dom.firstChild);

        // create an empty span with class x-tab-strip-text to force the height of the header element when there's no tabs.
        this.edge = this.strip.createChild({tag:'li', cls:'x-tab-edge', cn: [{tag: 'span', cls: 'x-mytab-strip-text', cn: '&#160;'}]});
        this.strip.createChild({cls:'x-clear'});

        this.body.addClass('x-tab-panel-body-'+this.tabPosition);

        if(!this.itemTpl){
            var tt = new Ext.Template(
                 '<li class="{cls}" id="{id}"><a class="x-mytab-strip-close"></a>',
                 '<a class="x-mytab-right" href="#"><em class="x-mytab-left">',
                 '<span class="x-mytab-strip-inner"><span class="x-mytab-strip-text {iconCls}">{text}</span></span>',
                 '</em></a></li>'
            );
            tt.disableFormats = true;
            tt.compile();
            util.widgets.ItabPanel.prototype.itemTpl = tt;
        }

        this.items.each(this.initTab, this);
    },
	
	findTargets : function(e){
        var item = null,
            itemEl = e.getTarget('li:not(.x-tab-edge)', this.strip);

        if(itemEl){
            item = this.getComponent(itemEl.id.split(this.idDelimiter)[1]);
            if(item.disabled){
                return {
                    close : null,
                    item : null,
                    el : null
                };
            }
        }
        return {
            close : e.getTarget('.x-mytab-strip-close', this.strip),
            item : item,
            el : itemEl
        };
    },
	
	initTab : function(item, index){
        var before = this.strip.dom.childNodes[index],
            p = this.getTemplateArgs(item),
            el = before ?
                 this.itemTpl.insertBefore(before, p) :
                 this.itemTpl.append(this.strip, p),
            cls = 'x-mytab-strip-over',
            tabEl = Ext.get(el);

        tabEl.hover(function(){
            if(!item.disabled){
                tabEl.addClass(cls);
            }
        }, function(){
            tabEl.removeClass(cls);
        });

        if(item.tabTip){
            tabEl.child('span.x-mytab-strip-text', true).qtip = item.tabTip;
        }
        item.tabEl = el;

        // Route *keyboard triggered* click events to the tab strip mouse handler.
        tabEl.select('a').on('click', function(e){
            if(!e.getPageX()){
                this.onStripMouseDown(e);
            }
        }, this, {preventDefault: true});

        item.on({
            scope: this,
            disable: this.onItemDisabled,
            enable: this.onItemEnabled,
            titlechange: this.onItemTitleChanged,
            iconchange: this.onItemIconChanged,
            beforeshow: this.onBeforeShowItem
        });
    },

	getTemplateArgs : function(item) {
        var cls = item.closable ? 'x-mytab-strip-closable' : '';
        if(item.disabled){
            cls += ' x-item-disabled';
        }
        if(item.iconCls){
            cls += ' x-tab-with-icon';
        }
        if(item.tabCls){
            cls += ' ' + item.tabCls;
        }

        return {
            id: this.id + this.idDelimiter + item.getItemId(),
            text: item.title,
            cls: cls,
            iconCls: item.iconCls || ''
        };
    },
	
	onItemTitleChanged : function(item){
        var el = this.getTabEl(item);
        if(el){
            Ext.fly(el).child('span.x-mytab-strip-text', true).innerHTML = item.title;
        }
    },

    //private
    onItemIconChanged : function(item, iconCls, oldCls){
        var el = this.getTabEl(item);
        if(el){
            el = Ext.get(el);
            el.child('span.x-mytab-strip-text').replaceClass(oldCls, iconCls);
            el[Ext.isEmpty(iconCls) ? 'removeClass' : 'addClass']('x-tab-with-icon');
        }
    },
	
	autoSizeTabs : function(){
        var count = this.items.length,
            ce = this.tabPosition != 'bottom' ? 'header' : 'footer',
            ow = this[ce].dom.offsetWidth,
            aw = this[ce].dom.clientWidth;

        if(!this.resizeTabs || count < 1 || !aw){ // !aw for display:none
            return;
        }

        var each = Math.max(Math.min(Math.floor((aw-4) / count) - this.tabMargin, this.tabWidth), this.minTabWidth); // -4 for float errors in IE
        this.lastTabWidth = each;
        var lis = this.strip.query('li:not(.x-tab-edge)');
        for(var i = 0, len = lis.length; i < len; i++) {
            var li = lis[i],
                inner = Ext.fly(li).child('.x-mytab-strip-inner', true),
                tw = li.offsetWidth,
                iw = inner.offsetWidth;
            inner.style.width = (each - (tw-iw)) + 'px';
        }
    },
	
	setActiveTab : function(item){
        item = this.getComponent(item);
        if(this.fireEvent('beforetabchange', this, item, this.activeTab) === false){
            return;
        }
        if(!this.rendered){
            this.activeTab = item;
            return;
        }
        if(this.activeTab != item){
            if(this.activeTab){
                var oldEl = this.getTabEl(this.activeTab);
                if(oldEl){
                    Ext.fly(oldEl).removeClass('x-mytab-strip-active');
                }
            }
            if(item){
                var el = this.getTabEl(item);
                Ext.fly(el).addClass('x-mytab-strip-active');
                this.activeTab = item;
                this.stack.add(item);

                this.layout.setActiveItem(item);
                if(this.scrolling){
                    this.scrollToTab(item, this.animScroll);
                }
            }
            this.fireEvent('tabchange', this, item);
        }
    }
 
}); // end of extend

Ext.reg('mytabpanel', util.widgets.ItabPanel);

util.widgets.ItabPanel.prototype.activate = util.widgets.ItabPanel.prototype.setActiveTab;

// private utility class used by TabPanel
util.widgets.ItabPanel.AccessStack = function(){
    var items = [];
    return {
        add : function(item){
            items.push(item);
            if(items.length > 10){
                items.shift();
            }
        },
        remove : function(item){
            var s = [];
            for(var i = 0, len = items.length; i < len; i++) {
                if(items[i] != item){
                    s.push(items[i]);
                }
            }
            items = s;
        },

        next : function(){
            return items.pop();
        }
    };
};
 
// end of file