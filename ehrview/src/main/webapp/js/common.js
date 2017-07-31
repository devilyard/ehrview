var pageSize = 10;
//@@ 下面两个参数需要跟css里portlet-title，pageBar的设置一致，IE及Chrome下无法从css取到。
var titleHeight = 24;
var pageBarHeight = 28;

function safeString(str) {
	return str ? str : '';
}

function safeDateString(str) {
	return str ? str.substring(0, 10) : '';
}

function safeDateTimeString(str) {
	return str ? str.substring(0, 16) : '';
}

function prePage(appId, modId, refId) {
	var page = Number($('#' + refId).attr('page'));
	eval(appId + '(modId, ' + (page <= 1 ? 1 : page - 1) + ')');
}

function nextPage(appId, modId, refId) {
	var page = Number($('#' + refId).attr('page'));
	eval(appId + '(modId, ' + (page + 1) + ')');
}

function getRecordList(url, page, ulId, appId, htmlTpl, getDocURL) {
	$.getJsonData(url, {
		"start": page && page > 1 ? (page - 1) * pageSize : 0,
		"limit": pageSize
	}).done(function(data) {
		var body = data.body
		var $ttable = $("#" + ulId);
		$ttable.attr('page', page);
		var html = body.length > 0 ? '' : '<li><span>没有更多数据</span></li>';
		for (var i = 0; i < body.length; i++) {
			var bodyItem = body[i];
			html += htmlTpl(bodyItem);
		}
		$ttable.html(html);
		if (body.length == pageSize) {
			$('a[appId=' + appId + '][rel=nextPage]').show();
		} else {
			$('a[appId=' + appId + '][rel=nextPage]').hide();
		}
		if (page <= 1) {
			$('a[appId=' + appId + '][rel=prePage]').hide();
		} else {
			$('a[appId=' + appId + '][rel=prePage]').show();
		}
//		if (type == 'tb') {// @@ 整行选中的风格
//			bindOpenDocumentListener(refId + ' .clickT', docURL);
//		} else {// @@ 点击链接打开的风格
			bindOpenDocumentListener3(ulId, url, getDocURL)
//		}
	});
}

function getVisitList(url, docURL, page, refId, appId, htmlTpl, type) {
	$.getJsonData(url, {
		"start": page && page > 1 ? (page - 1) * pageSize : 0,
		"limit": pageSize
	}).done(function (data) {
		var body = data.body
		var $ttable = $("#" + refId);
		$ttable.attr('page', page);
		var html = body.length > 0 ? '' : '<li><span>没有更多数据</span></li>';
		for (var i = 0; i < body.length; i++) {
			var bodyItem = body[i];
			var htmlStr = htmlTpl(bodyItem);
			html += htmlStr;
		}
		$ttable.html(html);
		if (body.length == pageSize) {
			$('a[appId=' + appId + '][rel=nextPage]').show();
		} else {
			$('a[appId=' + appId + '][rel=nextPage]').hide();
		}
		if (page <= 1) {
			$('a[appId=' + appId + '][rel=prePage]').hide();
		} else {
			$('a[appId=' + appId + '][rel=prePage]').show();
		}
		if (type == 'tb') {// @@ 整行选中的风格
			bindOpenDocumentListener(refId + ' .clickT', docURL);
		} else {// @@ 点击链接打开的风格
			bindOpenDocumentListener2(refId, docURL)
		}
	});
}

function bindOpenDocumentListener(selector, docURL) {
	$("#" + selector).colorbox({
		transition: "true",
		width: "95%",
		height: "95%",
		href: "../partials/popUp/visitPopUp.html",
		onOpen: function () {
			$('body').addClass('hide-body');
		},
		onLoad: function () {

		},
		onComplete: function () {
			var dcId = $(this).attr("dcid");
			$.cachedScript("../js/appController/popUp/PopUp.js").done(function (script, textStatus) {
				getHtmlContent(docURL, dcId)
			});
		},
		onCleanup: function () {

		},
		onClosed: function () {
			$('body').removeClass('hide-body');
		}
	});
}

function bindOpenDocumentListener2(refId, docURL) {
	$('#' + refId).find('a').colorbox({
		transition: "true",
		width: "95%",
		height: "95%",
		href: "../partials/popUp/visitPopUp.html",
		onOpen: function () {
			$('body').addClass('hide-body');
		},
		onLoad: function () {
	
		},
		onComplete: function () {
			var dcId = $(this).attr("dcid");
			$.cachedScript("../js/appController/popUp/PopUp.js").done(function (script, textStatus) {
				getHtmlContent(docURL, dcId);
			});
		},
		onCleanup: function () {
	
		},
		onClosed: function () {
			$('body').removeClass('hide-body');
		}
	});
}

function bindOpenDocumentListener3(refId, url, getDocURL) {
	$('#' + refId).find('a').each(function() {
		var encript = $(this).attr('encript');
		if (encript == 'true') {
			$(this).click(function() {
				$.messagebox.error('提示', '无权浏览！');
				return false;
			});
			return;
		}
		var docURL;
		$(this).colorbox({
			transition: "true",
			width: "95%",
			height: "95%",
			href: "../partials/popUp/visitPopUp.html",
			onOpen: function () {
				docURL = getDocURL ? getDocURL(this) : url;
				$('body').addClass('hide-body');
			},
			onLoad: function () {
				
			},
			onComplete: function () {
				var dcId = $(this).attr("dcid");
				$.cachedScript("../js/appController/popUp/PopUp.js").done(function (script, textStatus) {
					getHtmlContent(docURL, dcId);
				});
			},
			onCleanup: function () {
				
			},
			onClosed: function () {
				$('body').removeClass('hide-body');
			}
		});
	});
}

(function($) {
	$.messagebox = {
		htmlTpl: function(title, message, type) {
			var html = '<div class="mb-frame'
			if (type == 'error') {
				html += ' mb-error';
			} else if (type == 'warn') {
				html += ' mb-warn';
			}
			html += '"><div><span class="mb-title">'
					+ title
					+ '</span><a href="javascript:void(0);" class="mb-close">X</a><span style="height:0;clear:both;"></span></div><div style="height:0;clear:both;"></div><div class="mb-content"><p>'
					+ message + '</p></div></div>';
			return html;
		},
		
		show: function(title, message, type) {
			title = title ? title : '';
			if (!type || type == 'info') {
				$('body').append(this.htmlTpl(title, message));
				$('div.mb-frame').removeClass('mb-error mb-warn');
			} else if (type == 'error') {
				$('body').append(this.htmlTpl(title, message, 'error'));
				$('div.mb-frame').attr('class', 'mb-frame mb-error');
			} else if (type == 'warn') {
				$('body').append(this.htmlTpl(title, message, 'warn'));
				$('div.mb-frame').attr('class', 'mb-frame mb-warn');
			}
			$('div.mb-frame .mb-close').click(function() {
				$('div.mb-frame:last').remove();
				return false;
			});
			$('div.mb-frame:last').animate({top: '10px'}, 'fast').delay(5000).fadeOut(2000, function() {
				$(this).remove();
			});
		},
		
		error: function(title, message) {
			this.show(title, message, 'error');
		},
		
		warn: function(title, message) {
			this.show(title, message, 'warn');
		}
	}
	var $get = $.get;
	$.get = function(url, args, callback) {
		var as = args;
		if (typeof args == 'function') {
			callback = args;
			as = null;
		}
		var cb = function(res, textStatus, xhr) {
			if (res.code === 201) {
				self.location = '../index.html?mpiId=' + mpiId;
			} else {
				callback(res, textStatus, xhr);
			}
		}
		if (as) {
			return $get(url, as, cb);
		} else {
			return $get(url, cb);
		}
	}
})(jQuery);
