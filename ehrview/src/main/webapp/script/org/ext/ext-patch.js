// ******************************* Bugs fix ***********************************   
  
if(Ext.chart){
	Ext.override(Ext.chart.Chart, {   
	    onDestroy: function(){   
	        this.bindStore(null);   
	        var tip = this.tipFnName;   
	        if(!Ext.isEmpty(tip)){   
	            delete window[tip];   
	        }   
	        Ext.chart.Chart.superclass.onDestroy.call(this);   
	    }   
	});
}
  
Ext.override(Ext.form.TextField,{   
    autoSize : function(){   
        if(!this.grow || !this.rendered){   
            return;   
        }   
        if(!this.metrics){   
            this.metrics = Ext.util.TextMetrics.createInstance(this.el);   
        }   
        var el = this.el;   
        var v = el.dom.value;   
        var d = document.createElement('div');   
        d.appendChild(document.createTextNode(v));   
        v = d.innerHTML;   
        Ext.removeNode(d);   
        d = null;   
        v += '&#160;';   
        var w = Math.min(this.growMax, Math.max(this.metrics.getWidth(v) + /* add extra padding */ 10, this.growMin));   
        this.el.setWidth(w);   
        this.fireEvent('autosize', this, w);   
    }   
});   
  
Ext.override(Ext.Component, {   
    onRender : function(ct, position){   
        if(!this.el && this.autoEl){   
            if(Ext.isString(this.autoEl)){   
                this.el = document.createElement(this.autoEl);   
            }else{   
                var div = document.createElement('div');   
                Ext.DomHelper.overwrite(div, this.autoEl);   
                this.el = div.firstChild;   
            }   
            if (!this.el.id) {   
                this.el.id = this.getId();   
            }   
        }   
        if(this.el){   
            this.el = Ext.get(this.el);   
            if(this.allowDomMove !== false){   
                ct.dom.insertBefore(this.el.dom, position);   
                if (div) {   
                    Ext.removeNode(div);   
                    div = null;   
                }   
            }   
        }   
    }   
});   
// ************************* improve **********************   
  
(function(){   
    Ext.util.TextMetrics.Instance = function(bindTo, fixedWidth){   
        var ml = new Ext.Element(document.createElement('div'));   
        document.body.appendChild(ml.dom);   
        ml.position('absolute');   
        ml.setLeftTop(-1000, -1000);   
        ml.hide();   
  
        if(fixedWidth){   
            ml.setWidth(fixedWidth);   
        }   
  
        var instance = {   
            getSize : function(text){   
                ml.update(text);   
                var s = ml.getSize();   
                ml.update('');   
                return s;   
            },   
            bind : function(el){   
                ml.setStyle(   
                    Ext.fly(el).getStyles('font-size','font-style', 'font-weight', 'font-family','line-height', 'text-transform', 'letter-spacing')   
                );   
            },   
            setFixedWidth : function(width){   
                ml.setWidth(width);   
            },   
            getWidth : function(text){   
                ml.dom.style.width = 'auto';   
                return this.getSize(text).width;   
            },   
            getHeight : function(text){   
                return this.getSize(text).height;   
            },   
            // Add by clue   
            destroy :   function(){   
                Ext.destroy(ml);   
                delete ml;   
            }   
        };   
  
        instance.bind(bindTo);   
  
        return instance;   
    };   
})();   
// ******************************* Memory Release *****************************   
  
Ext.override(Ext.Component,{    
    onDestroy   :   function(){    
        if(this.plugins){   
            Ext.destroy(this.plugins);   
        }   
        Ext.destroy(this.el);   
    }   
});   
  
Ext.override(Ext.Panel,{   
    onDestroy : function(){   
        Ext.destroy(   
            this.header,   
            this.tbar,   
            this.bbar,   
            this.footer,   
            this.body,   
            this.bwrap,   
            this.dd   
        );   
        Ext.Panel.superclass.onDestroy.call(this);   
    }   
});   
  
Ext.override(Ext.dd.DragDrop,{    
    onDestroy   :   Ext.emptyFn,   
    destroy : function(){   
        this.onDestroy();   
        this.unreg();   
    }   
});   
  
Ext.override(Ext.dd.DragSource,{    
    onDestroy   :   function(){   
        Ext.destroy(this.proxy);   
        Ext.dd.DragSource.superclass.onDestroy.call(this);   
    }   
});   
  
Ext.override(Ext.grid.GridDragZone,{   
    onDestroy   :   function(){   
        Ext.destroy(this.ddel);   
        Ext.grid.GridDragZone.superclass.onDestroy.call(this);   
    }   
});   
  
Ext.override(Ext.dd.StatusProxy,{    
    onDestroy   :   Ext.emptyFn,   
    destroy : function(){   
        this.onDestroy();   
        Ext.destroy(this.anim,this.el,this.ghost);   
    }   
});   
  
Ext.override(Ext.grid.GridView,{   
    destroy : function(){   
        if(this.colMenu){   
            Ext.menu.MenuMgr.unregister(this.colMenu);   
            this.colMenu.destroy();   
        }   
        if(this.hmenu){   
            Ext.menu.MenuMgr.unregister(this.hmenu);   
            this.hmenu.destroy();   
        }   
        this.initData(null, null);   
        this.purgeListeners();   
  
        if(this.grid.enableColumnMove){   
            delete Ext.dd.DDM.locationCache[this.columnDrag.id];   
            Ext.destroy(this.columnDrag,this.columnDrop);   
        }   
  
        Ext.fly(this.innerHd).removeAllListeners();   
        Ext.removeNode(this.innerHd);   
  
        Ext.destroy(   
            this.el,   
            this.mainWrap,   
            this.mainHd,   
            this.scroller,   
            this.mainBody,   
            this.focusEl,   
            this.resizeMarker,   
            this.resizeProxy,   
            this.activeHdBtn,   
            this.dragZone,   
            this.splitZone,   
            this._flyweight   
        );   
        Ext.EventManager.removeResizeListener(this.onWindowResize, this);   
    }   
});   
  
Ext.override(Ext.tree.TreePanel,{    
    onDestroy : function(){   
        if(this.rendered){   
            this.body.removeAllListeners();   
            Ext.dd.ScrollManager.unregister(this.body);   
            Ext.destroy(this.dropZone,this.dragZone,this.innerCt);   
        }   
        Ext.destroy(this.root);   
        Ext.tree.TreePanel.superclass.onDestroy.call(this);   
    }   
});   
  
Ext.override(Ext.grid.HeaderDropZone,{    
    onDestroy   :   function(){   
        Ext.destroy(this.proxyTop,this.proxyBottom);   
        Ext.grid.HeaderDropZone.superclass.onDestroy.call(this);   
    }   
});   
  
Ext.override(Ext.menu.Menu,{   
    onDestroy : function(){   
        Ext.destroy(this.el);   
        Ext.menu.MenuMgr.unregister(this);   
        Ext.EventManager.removeResizeListener(this.hide, this);   
        if(this.keyNav) {   
            this.keyNav.disable();   
        }   
        var s = this.scroller;   
        if(s){   
            Ext.destroy(s.topRepeater, s.bottomRepeater, s.top, s.bottom);   
        }   
        this.purgeListeners();   
        Ext.menu.Menu.superclass.onDestroy.call(this);   
    }   
});   
  
Ext.override(Ext.TabPanel,{ // Ext.Panel   
    onDestroy   :   function(){   
        Ext.destroy(   
            this.stack,   
            this.stripWrap,   
            this.stripSpacer,   
            this.strip,   
            this.edge,   
            this.leftRepeater,   
            this.rightRepeater   
        );   
        Ext.TabPanel.superclass.onDestroy.call(this);   
    }   
});   
  
Ext.override(Ext.layout.ColumnLayout,{    
    destroy :   function(){   
        Ext.destroy(this.innerCt);   
    }   
});   
  
Ext.override(Ext.form.Field,{    
    onDestroy   :   function(){   
        Ext.destroy(this.errorEl,this.errorIcon);   
        Ext.form.Field.superclass.onDestroy.call(this);   
    }   
});   
  
Ext.override(Ext.form.TextField,{   
    onDestroy   :   function(){   
        Ext.destroy(this.metrics);   
        if(this.validationTask){   
            this.validationTask.cancel();   
            this.validationTask = null;   
        }   
        Ext.form.TextField.superclass.onDestroy.call(this);   
    }   
});  