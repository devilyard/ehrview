 $package("util.chart")
 util.chart.FusionChartsUtil = {};
 // ------------ Fix for Out of Memory Bug in IE in FP9 ---------------//
/* Fix for video streaming bug */
util.chart.FusionChartsUtil.cleanupSWFs = function() {
	if (window.opera || !document.all) return;
	var objects = document.getElementsByTagName("OBJECT");
	for (var i=0; i < objects.length; i++) {
		objects[i].style.display = 'none';
		for (var x in objects[i]) {
			if (typeof objects[i][x] == 'function') {
				objects[i][x] = function(){};
			}
		}
	}
}
// Fixes bug in fp9
util.chart.FusionChartsUtil.prepUnload = function() {
	__flash_unloadHandler = function(){};
	__flash_savedUnloadHandler = function(){};
	if (typeof window.onunload == 'function') {
		var oldUnload = window.onunload;
		window.onunload = function() {
			util.chart.FusionChartsUtil.cleanupSWFs();
			oldUnload();
		}
	} else {
		window.onunload = util.chart.FusionChartsUtil.cleanupSWFs;
	}
}

if (typeof window.onbeforeunload == 'function') {
	var oldBeforeUnload = window.onbeforeunload;
	window.onbeforeunload = function() {
		util.chart.FusionChartsUtil.prepUnload();
		oldBeforeUnload();
	}
} else {
	window.onbeforeunload = util.chart.FusionChartsUtil.prepUnload;
}

/* Function to return Flash Object from ID */
util.chart.FusionChartsUtil.getChartObject = function(id)
{
  if (window.document[id]) {
      return window.document[id];
  }
  if (navigator.appName.indexOf("Microsoft Internet")==-1) {
    if (document.embeds && document.embeds[id])
      return document.embeds[id]; 
  } 
  else {
    return document.getElementById(id);
  }
}