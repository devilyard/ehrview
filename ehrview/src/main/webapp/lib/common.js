
//后台请求
function doAjax(u,param,dataType,callback){
    $.ajax({
          type:'POST',
          url:u,
          data:param,
          dataType : dataType,
			cache : false,
			error : function() {
				alert('服务请求失败！！');
	//				var rs = 'error.html';
	//				top.location.href = rs;
				return;
			},
          success:callback
    });
}

//首页布局
function deallayout(data, textStatus){
 	  var str_main = "";
 	  var widgets= new Array();
	  var models= new Array(); 
	   if (data== null) {
			alert("服务请求失败！");
			return
		}
		else{
		//设置布局
		 $(data).find("col").each(function(i){
		 	str_main =str_main + " <div class=" + $(this).attr("class") +">";
		 	$(this).find("widget").each(function(j){
		 		var id = $(this).attr("id");
		 		var model = $(this).attr("model");
		 		var name = $(this).attr("name");
		 		var split_model = (""+model).split(",");
		 		var split_name = (""+name).split(",");
		 		var tab_title = '';
		 		var tab_content = '';
		 		//单页处理
		 		if(split_model.length==1){
		 			if (model!= null){
		 				//个人基本信息
		 				if(model=='PersonalInfo'){
		 					str_main = str_main + '<div class="widget-box" id="'+id+'" style="height:'+$(this).attr("height")+'"></div>';
		 				}
		 				else{
			 				str_main = str_main + '<div class="widget-box" id="'+id+'" style="height:'+$(this).attr("height")+'">';
				 			tab_title = tab_title+'<div class="widget-title"> <span class="icon"><i class="icon-'+split_model[0]+'"></i></span><h5>'+split_name[0]+'</h5></div>';
				 			tab_content= tab_content +'<div class="single-content" style="height:100%"><div id="'+id+'_'+split_model[0]+'" style="height:100%"></div></div></div>';
				 			str_main = str_main + tab_title+tab_content;
		 				}
		 			}
		 			else{
		 				str_main = str_main + '<div class="widget-box" id="'+id+'" style="height:'+$(this).attr("height")+'">';
			 			tab_title = tab_title+'<div class="widget-title"> <span class="icon"><i class="icon-ok"></i></span><h5>'+split_name[0]+'</h5></div>';
			 			str_main = str_main + tab_title+"</div>";
		 			}
		 		}
		 		//页签处理
		 		else{
		 		
		 		for (i = 0; i < split_model.length; i++){
		 			if(i ==0){
		 				tab_title = tab_title+'<li class="active"><a data-toggle="tab" href="#tab_'+id+'_'+split_model[i]+'">'+split_name[i]+'</a></li>';
		 				tab_content= tab_content +'<div id="tab_'+id+'_'+split_model[i]+'" class="tab-pane active"></div>';
		 			}
		 			else{
		 				tab_title = tab_title+'<li><a data-toggle="tab" href="#tab_'+id+'_'+split_model[i]+'">'+split_name[i]+'</a></li>';
		 				tab_content= tab_content +'<div id="tab_'+id+'_'+split_model[i]+'" class="tab-pane"></div>';
		 			}
		 			
		 		}
		 			str_main = str_main + '<div class="widget-box" id="'+id+'" style="height:'+$(this).attr("height")+'"><div class="widget-title"><ul class="nav nav-tabs">';
		 			str_main = str_main + tab_title;
		 			str_main = str_main +'</ul></div>';
		 			str_main = str_main +'<div class="tab-content" style="height:100%">';
		 			str_main = str_main + tab_content;
		 			str_main = str_main +'</div></div>';
		 		}
		 		widgets.push(id);
		 		models.push(model);
		 	});
		 	str_main = str_main +" </div> ";
		  });
		$("#content").html(str_main);
		//处理页签高度
		 $(".tab-content").height(function(index,oldheight){
			    return oldheight-38;
		  });
		 $(".single-content").height(function(index,oldheight){
			    return oldheight-38;
		  });
		//填充模块
	 	 for (var i = 0; i < widgets.length; i++)
	    	{	
	    	 if(models[i]!= null){
	    	 var sub_model = (""+models[i]).split(",");
	    		if(sub_model.length==1){
	    			if(models[i]=='PersonalInfo'){
	    				$("#"+widgets[i]).load("widget/"+models[i]+".html #W_PersonalInfo");
	    			}else{
	    				$("#"+widgets[i]+"_"+models[i]).load("widget/"+models[i]+".html .widget-content");
	    			}
					
				}
	    		//页签处理
				else {
					for(var j = 0; j < sub_model.length; j++){
						if(sub_model[j]!= null){
							$("#tab_"+widgets[i]+"_"+sub_model[j]).load("widget/"+sub_model[j]+".html .widget-content");
							
						}
					}
				}
			  }
			}
	 	
	   }
 }

// the extension functions and options 	
extensionPlugin 	= {
	extPluginOpts	: {
		// speed for the fadeOut animation
		mouseLeaveFadeSpeed	: 500,
		// scrollbar fades out after hovertimeout_t milliseconds
		hovertimeout_t		: 10000,
		// if set to false, the scrollbar will be shown on mouseenter and hidden on mouseleave
		// if set to true, the same will happen, but the scrollbar will be also hidden on mouseenter after "hovertimeout_t" ms
		// also, it will be shown when we start to scroll and hidden when stopping
		useTimeout			: true,
		// the extension only applies for devices with width > deviceWidth
		deviceWidth			: 980
	},
	hovertimeout	: null, // timeout to hide the scrollbar
	isScrollbarHover: false,// true if the mouse is over the scrollbar
	elementtimeout	: null,	// avoids showing the scrollbar when moving from inside the element to outside, passing over the scrollbar
	isScrolling		: false,// true if scrolling
	addHoverFunc	: function() {
		
		// run only if the window has a width bigger than deviceWidth
		if( $(window).width() <= this.extPluginOpts.deviceWidth ) return false;
		
		var instance		= this;
		
		// functions to show / hide the scrollbar
		$.fn.jspmouseenter 	= $.fn.show;
		$.fn.jspmouseleave 	= $.fn.fadeOut;
		
		// hide the jScrollPane vertical bar
		var $vBar= this.getContentPane().siblings('.jspVerticalBar').hide();
		
		/*
		 * mouseenter / mouseleave events on the main element
		 * also scrollstart / scrollstop - @James Padolsey : http://james.padolsey.com/javascript/special-scroll-events-for-jquery/
		 */
		$el.bind('mouseenter.jsp',function() {
			
			// show the scrollbar
			$vBar.stop( true, true ).jspmouseenter();
			
			if( !instance.extPluginOpts.useTimeout ) return false;
			
			// hide the scrollbar after hovertimeout_t ms
			clearTimeout( instance.hovertimeout );
			instance.hovertimeout 	= setTimeout(function() {
				// if scrolling at the moment don't hide it
				if( !instance.isScrolling )
					$vBar.stop( true, true ).jspmouseleave( instance.extPluginOpts.mouseLeaveFadeSpeed || 0 );
			}, instance.extPluginOpts.hovertimeout_t );
			
			
		}).bind('mouseleave.jsp',function() {
			
			// hide the scrollbar
			if( !instance.extPluginOpts.useTimeout )
				$vBar.stop( true, true ).jspmouseleave( instance.extPluginOpts.mouseLeaveFadeSpeed || 0 );
			else {
			clearTimeout( instance.elementtimeout );
			if( !instance.isScrolling )
					$vBar.stop( true, true ).jspmouseleave( instance.extPluginOpts.mouseLeaveFadeSpeed || 0 );
			}
			
		});
		
		if( this.extPluginOpts.useTimeout ) {
			
			$el.bind('scrollstart.jsp', function() {
			
				// when scrolling show the scrollbar
			clearTimeout( instance.hovertimeout );
			instance.isScrolling	= true;
			$vBar.stop( true, true ).jspmouseenter();
			
		}).bind('scrollstop.jsp', function() {
			
				// when stop scrolling hide the scrollbar (if not hovering it at the moment)
			clearTimeout( instance.hovertimeout );
			instance.isScrolling	= false;
			instance.hovertimeout 	= setTimeout(function() {
				if( !instance.isScrollbarHover )
						$vBar.stop( true, true ).jspmouseleave( instance.extPluginOpts.mouseLeaveFadeSpeed || 0 );
				}, instance.extPluginOpts.hovertimeout_t );
			
		});
		
			// wrap the scrollbar
			// we need this to be able to add the mouseenter / mouseleave events to the scrollbar
		var $vBarWrapper	= $('<div/>').css({
			position	: 'absolute',
			left		: $vBar.css('left'),
			top			: $vBar.css('top'),
			right		: $vBar.css('right'),
			bottom		: $vBar.css('bottom'),
			width		: $vBar.width(),
			height		: $vBar.height()
		}).bind('mouseenter.jsp',function() {
			
			clearTimeout( instance.hovertimeout );
			clearTimeout( instance.elementtimeout );
			
			instance.isScrollbarHover	= true;
			
				// show the scrollbar after 100 ms.
				// avoids showing the scrollbar when moving from inside the element to outside, passing over the scrollbar								
			instance.elementtimeout	= setTimeout(function() {
				$vBar.stop( true, true ).jspmouseenter();
			}, 100 );	
			
		}).bind('mouseleave.jsp',function() {
			
				// hide the scrollbar after hovertimeout_t
			clearTimeout( instance.hovertimeout );
			instance.isScrollbarHover	= false;
			instance.hovertimeout = setTimeout(function() {
					// if scrolling at the moment don't hide it
				if( !instance.isScrolling )
						$vBar.stop( true, true ).jspmouseleave( instance.extPluginOpts.mouseLeaveFadeSpeed || 0 );
				}, instance.extPluginOpts.hovertimeout_t );
		});
		$vBar.wrap( $vBarWrapper );
	}
	}
	
};