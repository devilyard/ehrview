/* jqPlot 1.0.8r1250 | (c) 2009-2013 Chris Leonello | jplot.com
   jsDate | (c) 2010-2013 Chris Leonello
 */(function(b){function a(e,d,c){this.bindCustomEvents=function(){this.eventCanvas._elem.bind("vclick",{plot:this},this.onClick);this.eventCanvas._elem.bind("dblclick",{plot:this},this.onDblClick);this.eventCanvas._elem.bind("taphold",{plot:this},this.onDblClick);this.eventCanvas._elem.bind("vmousedown",{plot:this},this.onMouseDown);this.eventCanvas._elem.bind("vmousemove",{plot:this},this.onMouseMove);this.eventCanvas._elem.bind("mouseenter",{plot:this},this.onMouseEnter);this.eventCanvas._elem.bind("mouseleave",{plot:this},this.onMouseLeave);if(this.captureRightClick){this.eventCanvas._elem.bind("vmouseup",{plot:this},this.onRightClick);this.eventCanvas._elem.get(0).oncontextmenu=function(){return false}}else{this.eventCanvas._elem.bind("vmouseup",{plot:this},this.onMouseUp)}};this.plugins.mobile=true}b.jqplot.postInitHooks.push(a)})(jQuery);