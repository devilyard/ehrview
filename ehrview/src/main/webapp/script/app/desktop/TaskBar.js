$package("app.desktop")
$styleSheet("app.desktop.TaskBar")
app.desktop.TaskBar = function(config){
    app.desktop.TaskBar.superclass.constructor.apply(this,[config]);
}

Ext.extend(app.desktop.TaskBar, app.desktop.Module, {
	init:function(){
		this.openWinInTaskbar = false;
		this.autoRun = true
		
		if(!Ext.get('ux-taskbar')){
			Ext.DomHelper.append(document.body,{tag:"div",id:"ux-taskbar",children:[
				{tag:"div",id:"ux-taskbar-start"},
				{tag:"div",id:"ux-taskbuttons-panel"},
				{tag:"div","class":"x-clear"}
			]})
		}
	},
	initStartMenu: function(){
		this.startMenu = new app.desktop.StartMenu(Ext.apply({
			iconCls: 'user',
			height: 300,
			shadow: true,
			title: '',
			width: 300
		}, this.mainApp.menu));
		
		this.startMenu.on("itemclick",
			function(item,e){
				var id = item.getId()
				this.mainApp.desktop.openWin(id);
			},
			this
		)
		
		this.startBtn = new Ext.Button({
            text: 'Start',
            id: 'ux-startbutton',
            iconCls:'start',
            menu: this.startMenu,
            menuAlign: 'bl-tl',
            renderTo: 'ux-taskbar-start',
            clickEvent: 'mousedown',
            template: new Ext.Template(
				'<table cellspacing="0" class="x-btn {3}"><tbody><tr>',
				'<td class="ux-startbutton-left"><i>&#160;</i></td>',
                '<td class="ux-startbutton-center"><em class="{5} unselectable="on">',
                    '<button class="x-btn-text {2}" type="{1}" style="height:30px;">{0}</button>',
                '</em></td>',
                '<td class="ux-startbutton-right"><i>&#160;</i></td>',
				"</tr></tbody></table>")
        });
        
       var width = this.startBtn.getEl().getWidth()+10;
        
        var sbBox = new Ext.BoxComponent({
			el: 'ux-taskbar-start',
	        id: 'TaskBarStart',
	        minWidth: width,
			region:'west',
			split: true,
			width: width
		});
		
		this.tbPanel = new app.desktop.TaskButtonsPanel({
			el: 'ux-taskbuttons-panel',
			id: 'TaskBarButtons',
			region:'center'
		});
				
        this.container = new app.desktop.TaskBarContainer({
			el: 'ux-taskbar',
			layout: 'border',
			items: [sbBox,this.tbPanel]
		});
		
		this.mainApp.taskManager.tasks.each(function(m){
			if(m.instance && m.instance.openWinInTaskbar){
				var win = m.instance.win
				if(win){
					this.onWinInit(win)
				}
			}
		},this)
		
		var desktop = this.mainApp.desktop
		desktop.on("winActive",this.onWinActive,this)
		desktop.on("winClose",this.onWinClose,this)
		desktop.on("winInactive",this.onWinInactive,this)
		desktop.on("winInit",this.onWinInit,this)
		desktop.on("winLock",this.onWinLock,this)
		desktop.on("winUnlock",this.onWinUnlock,this)
		desktop.setTaskbarHeight(Ext.get("ux-taskbar").getHeight())
		desktop.layout()
		
	},
    setMainApp : function(mainApp){
		app.desktop.TaskBar.superclass.setMainApp.apply(this,[mainApp])
		//this.initStartMenu()
		$require("app.desktop.StartMenu",[this.initStartMenu,this])

    },
    
    onWinLock:function(){
    	this.container.el.mask();
    },
    
    onWinUnlock:function(){
    	this.container.el.unmask();
    },
    
    onWinActive:function(win){
    	this.setActiveButton(win.taskButton);
		Ext.fly(win.taskButton.el).addClass('active-win');
    },
    
    onWinClose:function(win){
		this.removeTaskButton(win.taskButton);
    },
    
    onWinInactive:function(win){
    	Ext.fly(win.taskButton.el).removeClass('active-win');
    },
    
    onWinInit:function(win){
		win.taskButton = this.addTaskButton(win);
		win.animateTarget = win.taskButton.el;    	
    },
    
    addTaskButton : function(win){
		return this.tbPanel.addButton(win, 'ux-taskbuttons-panel');
	},
	
	removeTaskButton : function(btn){
		this.tbPanel.removeButton(btn);
	},
	
	setActiveButton : function(btn){
		this.tbPanel.setActiveButton(btn);
	},
	
	destory:function(){
		app.desktop.TaskBar.superclass.destory.call(this)
		if(this.startMenu.el)
			this.startMenu.el.remove()
		this.container.el.remove()
		var desktop = this.mainApp.desktop
		desktop.un("winActive",this.onWinActive,this)
		desktop.un("winClose",this.onWinClose,this)
		desktop.un("winInactive",this.onWinInactive,this)
		desktop.un("winInit",this.onWinInit,this)
	}
});



/**
 * @class app.desktop.TaskBarContainer
 * @extends Ext.Container
 */
app.desktop.TaskBarContainer = Ext.extend(Ext.Container, {
    initComponent : function() {
        app.desktop.TaskBarContainer.superclass.initComponent.call(this);
        
        this.el = Ext.get(this.el) || Ext.getBody();
        this.el.setHeight = Ext.emptyFn;
        this.el.setWidth = Ext.emptyFn;
        this.el.setSize = Ext.emptyFn;
        this.el.setStyle({
            overflow:'hidden',
            margin:'0',
            border:'0 none'
        });
        this.el.dom.scroll = 'no';
        this.allowDomMove = false;
        this.autoWidth = true;
        this.autoHeight = true;
        Ext.EventManager.onWindowResize(this.fireResize, this);
        this.renderTo = this.el;
    },

    fireResize : function(w, h){
        this.fireEvent('resize', this, w, h, w, h);
    }
});



/**
 * @class app.desktop.TaskButtonsPanel
 * @extends Ext.BoxComponent
 */
app.desktop.TaskButtonsPanel = Ext.extend(Ext.BoxComponent, {
	activeButton: null,
	enableScroll: true,
	scrollIncrement: 0,
    scrollRepeatInterval: 400,
    scrollDuration: .35,
    animScroll: true,
    resizeButtons: true,
    buttonWidth: 168,
    minButtonWidth: 118,
    buttonMargin: 2,
    buttonWidthSet: false,
	
	initComponent : function() {
        app.desktop.TaskButtonsPanel.superclass.initComponent.call(this);
        this.on('resize', this.delegateUpdates);
        this.items = [];
        
        this.stripWrap = Ext.get(this.el).createChild({
        	cls: 'ux-taskbuttons-strip-wrap',
        	cn: {
            	tag:'ul', cls:'ux-taskbuttons-strip'
            }
		});
        this.stripSpacer = Ext.get(this.el).createChild({
        	cls:'ux-taskbuttons-strip-spacer'
        });
        this.strip = new Ext.Element(this.stripWrap.dom.firstChild);
        
        this.edge = this.strip.createChild({
        	tag:'li',
        	cls:'ux-taskbuttons-edge'
        });
        this.strip.createChild({
        	cls:'x-clear'
        });
	},
	
	addButton : function(win){
		var li = this.strip.createChild({tag:'li'}, this.edge); // insert before the edge
        var btn = new app.desktop.TaskBar.TaskButton(win, li);
		
		this.items.push(btn);
		
		if(!this.buttonWidthSet){
			this.lastButtonWidth = btn.container.getWidth();
		}
		
		this.setActiveButton(btn);
		return btn;
	},
	
	removeButton : function(btn){
		var li = document.getElementById(btn.container.id);
		btn.destroy();
		li.parentNode.removeChild(li);
		
		var s = [];
		for(var i = 0, len = this.items.length; i < len; i++) {
			if(this.items[i] != btn){
				s.push(this.items[i]);
			}
		}
		this.items = s;
		
		this.delegateUpdates();
	},
	
	setActiveButton : function(btn){
		this.activeButton = btn;
		this.delegateUpdates();
	},
	
	delegateUpdates : function(){
		/*if(this.suspendUpdates){
            return;
        }*/
        if(this.resizeButtons && this.rendered){
            this.autoSize();
        }
        if(this.enableScroll && this.rendered){
            this.autoScroll();
        }
    },
    
    autoSize : function(){
        var count = this.items.length;
        var ow = this.el.dom.offsetWidth;
        var aw = this.el.dom.clientWidth;

        if(!this.resizeButtons || count < 1 || !aw){ // !aw for display:none
            return;
        }
        
        var each = Math.max(Math.min(Math.floor((aw-4) / count) - this.buttonMargin, this.buttonWidth), this.minButtonWidth); // -4 for float errors in IE
        var btns = this.stripWrap.dom.getElementsByTagName('button');
        
        this.lastButtonWidth = Ext.get(btns[0].id).findParent('li').offsetWidth;
        
        for(var i = 0, len = btns.length; i < len; i++) {            
            var btn = btns[i];
            
            var tw = Ext.get(btns[i].id).findParent('li').offsetWidth;
            var iw = btn.offsetWidth;
            
            btn.style.width = (each - (tw-iw)) + 'px';
        }
    },
    
    autoScroll : function(){
    	var count = this.items.length;
        var ow = this.el.dom.offsetWidth;
        var tw = this.el.dom.clientWidth;
        
        var wrap = this.stripWrap;
        var cw = wrap.dom.offsetWidth;
        var pos = this.getScrollPos();
        var l = this.edge.getOffsetsTo(this.stripWrap)[0] + pos;
        
        if(!this.enableScroll || count < 1 || cw < 20){ // 20 to prevent display:none issues
            return;
        }
        
        wrap.setWidth(tw); // moved to here because of problem in Safari
        
        if(l <= tw){
            wrap.dom.scrollLeft = 0;
            //wrap.setWidth(tw); moved from here because of problem in Safari
            if(this.scrolling){
                this.scrolling = false;
                this.el.removeClass('x-taskbuttons-scrolling');
                this.scrollLeft.hide();
                this.scrollRight.hide();
            }
        }else{
            if(!this.scrolling){
                this.el.addClass('x-taskbuttons-scrolling');
            }
            tw -= wrap.getMargins('lr');
            wrap.setWidth(tw > 20 ? tw : 20);
            if(!this.scrolling){
                if(!this.scrollLeft){
                    this.createScrollers();
                }else{
                    this.scrollLeft.show();
                    this.scrollRight.show();
                }
            }
            this.scrolling = true;
            if(pos > (l-tw)){ // ensure it stays within bounds
                wrap.dom.scrollLeft = l-tw;
            }else{ // otherwise, make sure the active button is still visible
				this.scrollToButton(this.activeButton, true); // true to animate
            }
            this.updateScrollButtons();
        }
    },

    createScrollers : function(){
        var h = this.el.dom.offsetHeight; //var h = this.stripWrap.dom.offsetHeight;
		
        // left
        var sl = this.el.insertFirst({
            cls:'ux-taskbuttons-scroller-left'
        });
        sl.setHeight(h);
        sl.addClassOnOver('ux-taskbuttons-scroller-left-over');
        this.leftRepeater = new Ext.util.ClickRepeater(sl, {
            interval : this.scrollRepeatInterval,
            handler: this.onScrollLeft,
            scope: this
        });
        this.scrollLeft = sl;

        // right
        var sr = this.el.insertFirst({
            cls:'ux-taskbuttons-scroller-right'
        });
        sr.setHeight(h);
        sr.addClassOnOver('ux-taskbuttons-scroller-right-over');
        this.rightRepeater = new Ext.util.ClickRepeater(sr, {
            interval : this.scrollRepeatInterval,
            handler: this.onScrollRight,
            scope: this
        });
        this.scrollRight = sr;
    },
    
    getScrollWidth : function(){
        return this.edge.getOffsetsTo(this.stripWrap)[0] + this.getScrollPos();
    },

    getScrollPos : function(){
        return parseInt(this.stripWrap.dom.scrollLeft, 10) || 0;
    },

    getScrollArea : function(){
        return parseInt(this.stripWrap.dom.clientWidth, 10) || 0;
    },

    getScrollAnim : function(){
        return {
        	duration: this.scrollDuration,
        	callback: this.updateScrollButtons,
        	scope: this
        };
    },

    getScrollIncrement : function(){
    	return (this.scrollIncrement || this.lastButtonWidth+2);
    },
    
    /* getBtnEl : function(item){
        return document.getElementById(item.id);
    }, */
    
    scrollToButton : function(item, animate){
    	item = item.el.dom.parentNode; // li
        if(!item){ return; }
        var el = item; //this.getBtnEl(item);
        var pos = this.getScrollPos(), area = this.getScrollArea();
        var left = Ext.fly(el).getOffsetsTo(this.stripWrap)[0] + pos;
        var right = left + el.offsetWidth;
        if(left < pos){
            this.scrollTo(left, animate);
        }else if(right > (pos + area)){
            this.scrollTo(right - area, animate);
        }
    },
    
    scrollTo : function(pos, animate){
        this.stripWrap.scrollTo('left', pos, animate ? this.getScrollAnim() : false);
        if(!animate){
            this.updateScrollButtons();
        }
    },
    
    onScrollRight : function(){
        var sw = this.getScrollWidth()-this.getScrollArea();
        var pos = this.getScrollPos();
        var s = Math.min(sw, pos + this.getScrollIncrement());
        if(s != pos){
        	this.scrollTo(s, this.animScroll);
        }        
    },

    onScrollLeft : function(){
        var pos = this.getScrollPos();
        var s = Math.max(0, pos - this.getScrollIncrement());
        if(s != pos){
            this.scrollTo(s, this.animScroll);
        }
    },
    
    updateScrollButtons : function(){
        var pos = this.getScrollPos();
        this.scrollLeft[pos == 0 ? 'addClass' : 'removeClass']('ux-taskbuttons-scroller-left-disabled');
        this.scrollRight[pos >= (this.getScrollWidth()-this.getScrollArea()) ? 'addClass' : 'removeClass']('ux-taskbuttons-scroller-right-disabled');
    }
});



/**
 * @class app.desktop.TaskBar.TaskButton
 * @extends Ext.Button
 */
app.desktop.TaskBar.TaskButton = function(win, el){
	this.win = win;
    app.desktop.TaskBar.TaskButton.superclass.constructor.call(this, {
        iconCls: win.iconCls,
        text: Ext.util.Format.ellipsis(win.title, 12),
        renderTo: el,
        handler : function(){
            if(win.minimized || win.hidden){
                win.show();
            }else if(win == win.manager.getActive()){
                win.minimize();
            }else{
                win.toFront();
            }
        },
        clickEvent:'mousedown',
        template: new Ext.Template(
			'<table cellspacing="0" class="x-btn {3}"><tbody><tr>',
			'<td class="ux-taskbutton-left"><i>&#160;</i></td>',
            '<td class="ux-taskbutton-center"><em class="{5} unselectable="on">',
                '<button class="x-btn-text {2}" type="{1}" style="height:28px;">{0}</button>',
            '</em></td>',
            '<td class="ux-taskbutton-right"><i>&#160;</i></td>',
			"</tr></tbody></table>")            
    });
};

Ext.extend(app.desktop.TaskBar.TaskButton, Ext.Button, {
    onRender : function(){
        app.desktop.TaskBar.TaskButton.superclass.onRender.apply(this, arguments);

        this.cmenu = new Ext.menu.Menu({
            items: [{
                text: '恢复',
                handler: function(){
                    if(!this.win.isVisible()){
                        this.win.show();
                    }else{
                        this.win.restore();
                    }
                },
                scope: this
            },{
                text: '最小化',
                handler: this.win.minimize,
                scope: this.win
            },{
                text: '最大化',
                handler: this.win.maximize,
                scope: this.win
            }, '-', {
                text: '关闭',
                handler: this.closeWin.createDelegate(this, this.win, true),
                scope: this.win
            }]
        });

        this.cmenu.on('beforeshow', function(){
            var items = this.cmenu.items.items;
            var w = this.win;
            items[0].setDisabled(w.maximized !== true && w.hidden !== true);
            items[1].setDisabled(w.minimized === true);
            items[2].setDisabled(w.maximized === true || w.hidden === true);
        }, this);

        this.el.on('contextmenu', function(e){
            e.stopEvent();
            if(!this.cmenu.el){
                this.cmenu.render();
            }
            var xy = e.getXY();
            xy[1] -= this.cmenu.el.getHeight();
            this.cmenu.showAt(xy);
        }, this);
    },
    
    closeWin : function(cMenu, e, win){
		if(!win.isVisible()){
			win.show();
		}else{
			win.restore();
		}
		win.close();
	}
});