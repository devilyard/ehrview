var ClinicPopUp = function(bodyItem) {
	var $active = $(".popUpNav > .active > a");
	var ename = $active[0].className;
	var action = getAction($active);
	addPopUpContent(ename, bodyItem, action)
	$(".popUpNav > li").bind('click', function(event) {
		if ($(this).hasClass('active')) {
			return;
		} else {
			$(".popUpNav > li").removeClass('active');
			$(this).addClass('active');
			$active = $(".popUpNav > .active > a");
			ename = $(this).find('a')[0].className;
			var action = getAction($active);
			addPopUpContent(ename, bodyItem, action);
		}
	});
}

var getAction = function($e) {
	if ($e.attr('action')) {
		return ($e.attr('action'))
	} else {
		return ""
	}
}

var addPopUpContent = function(name, bodyItem, action) {
	if (action == "html") {
		getHtmlContent(name, bodyItem.DCID)
	} else {
		loadJSContent(name, bodyItem)
	}
}

var htmlContent = {};

var getHtmlContent = function(url, dcId) {
	var cachedId = url + dcId
	if (!htmlContent[cachedId]) {
		var url = "../" + url + "?dcId=" + dcId + "&vk=" + vk;
		addRunningMask();
		$.get(url, function(data) {
			var htmlStr = data.body;
			html = $.parseHTML(htmlStr);
			htmlContent[cachedId] = html;
			$("#PopUpContent").empty()
			$("#PopUpContent").append(htmlContent[cachedId]);
			removeRunningMask();
		});
	} else {
		$("#PopUpContent").empty()
		$("#PopUpContent").append(htmlContent[cachedId]);
	}
}

var loadJSContent = function(name, bodyItem) {
	addRunningMask();
	$("#PopUpContent").empty()
	$.cachedScript("../js/appController/" + name + ".js").done(function(script, textStatus) {
		eval(name + "( bodyItem )")
	});
}