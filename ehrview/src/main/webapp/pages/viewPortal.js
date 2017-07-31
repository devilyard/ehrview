$import("lib.respond",
		"lib.JQuery.jquery",
		"lib.bootstrap.bootstrap",
		"lib.jqueryjson",
		"lib.colorboxmin",
		"lib.messengermin",
		"lib.bootstrap-datepicker",
		"js.common",
		"lib.pdfobject");
var layoutId = "";
var templateId = "";

$(function() {
	//防止IE有些版本中String没有trim();
	if (!String.prototype.trim) {
		var TRIM_REG = '/^/s + | /s+$/g';
		String.prototype.trim = function() {
			return this.replace(TRIM_REG, '');
		}
	}
	getVK();
	$.getJsonData('query/UserLogin').done(function(data) {
		if (data.code == 200) {
			$.get('../partials/UserLogonWin.html', function(data) {
				$("#layoutContent").append(data);
				$("#user").append("患者姓名：");
				$("#pwd").append("授权码：");
				$('#myModal').modal();
				
				$.getJsonData('mpi/getBaseInfo').done(function (data) {
					var body = data.body
					$('#logonuser').val(body.personName)
				});
				$('#logonIn').bind('click', function(){
					var pwd = $('#password').val();
					if(pwd ==''){
						alert('请输入授权码');
						return;
					}
					$.getJsonData('login/UserLogin',{"password":pwd}).done(function(data) {
						if (data.code == 200) {
							$('#myModal').hide();
							getMpiId();
							getNavLayout();
							getLayoutId();
						}else{
							alert('密码错误');
							return;
						}
						
					});
					
				});
				
			});
		}else{
			getMpiId();
			getNavLayout();
			getLayoutId();
		}
	});
});


//加载布局
var loadLayout = function(templateId, layoutId) {
	var $content = $("#layoutContent");
	$content.empty();
	$.get('../layoutTemplates/' + templateId + ".html", {}, function(data, textStatus, xhr) { //加载模板
		var html = $.parseHTML(data);
		$content.append(html);
		//加载布局数据
		$.getJsonData('config/getLayoutApp/' + layoutId).done(function(data) {
			if (data.code == 201) {
				var str = "<div class='alert alert-danger'><a class='alert-link' href='../'>" + data.message + "</a></div>";
				var html = $.parseHTML(str);
				$content.append(html);
				return;
			}
			var body = data.body
			var modData = $.parseJSON(body.layoutData);
			for (var modId in modData) {
				if (modId == "LayoutId") {
					continue;
				}
				var $mod;
				if ($("#" + modId).length > 0) {
					$mod = $("#" + modId);
					var apps = modData[modId];
					if (!apps || apps.length == 0) {
						$mod.remove();
					} else {
						loadApps(apps, modId)
					}
				}
			}
			// @@ 当前的视图高亮。
			$('li[layoutid]').each(function() {
				$(this).children('button:first').removeClass('layoutSelected');
				if ($(this).attr('layoutid') == layoutId) {
					$(this).children('button:first').addClass('layoutSelected');
				}
			})
		});
	}).fail(function() {
		$content.append("浏览视图生成失败");
	});
}

//获取布局导航
var getNavLayout = function() {
	var pinStr = "<div id='navPin' class='pin layoutToolBarClose'><ul class='hide layoutUl nav nav-pills nav-stacked'></ul><ul class='nav hide searchUl nav-pills nav-stacked'><li><button type='button' class='btn btn-primary data-toggle='modal' data-target='#seachModal' btn-default navbar-btn'><span class='glyphicon glyphicon-search'></span> 查询</button></li></ul><span class='glyphicon bSpan glyphicon-chevron-right'></span></div>";
	$('body').append(pinStr);
	$.get("../partials/seachPages.html", {}, function(data, textStatus, xhr) { //导航中搜索页
		var html = $.parseHTML(data);
		$('body').append(html);
		$('#seachDate').datepicker({
			format: 'yyyy-mm-dd'
		})
		//搜索项字典加载
		$.getJsonData('config/getMpiDic/').done(function(data) {
			var body = data.body;
			var cardTypeCode = body.cardTypeCode;
			var certificateTypeCode = body.certificateTypeCode;

			for (var i = 0; i < cardTypeCode.length; i++) {
				var item = cardTypeCode[i];
				$("#seachModal .cardType select").append('<option value ="' + item["key"] + '">' + item["text"] + '</option>')
			}

			for (var j = 0; j < certificateTypeCode.length; j++) {
				var item = certificateTypeCode[j];
				$("#seachModal .roleType select").append('<option value ="' + item["key"] + '">' + item["text"] + '</option>')
			}
		})
	})
	$(".pin .bSpan").click(function(event) {
		swithNavPin();
	});
}

// @@ 切换导航块
var swithNavPin = function() {
	var $navPin = $('#navPin');
	if ($navPin.hasClass('layoutToolBarClose')) {
		$navPin.removeClass('layoutToolBarClose').addClass('layoutToolBarShow');
		$navPin.find('ul').removeClass('hide');
		$navPin.find('.bSpan').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-left');
	} else {
		$navPin.removeClass('layoutToolBarShow').addClass('layoutToolBarClose');
		$navPin.find('ul').addClass('hide');
		$navPin.find('.bSpan').removeClass('glyphicon-chevron-left').addClass('glyphicon-chevron-right');
	}
}

//获取布局ID
var getLayoutId = function() {
	$.getJsonData('config/getViewPortalNames/', "", true).done(function(data) {
		var body = data.body;
		if (body.length == 0) {
			alert("浏览视图生成失败");
			window.close();
		}
		for (var i = 0; i < body.length; i++) {
			var layoutId = body[i].layoutId;
			var templateId = body[i].templateId;
			var liStr = "<li layoutId=" + layoutId + " templateId=" + templateId + " ><button type='button' class='btn btn-default navbar-btn'>" + body[i].name + "</button></li>"
			$(".pin .layoutUl").append(liStr);
		}
		loadLayout(body[0].templateId, body[0].layoutId);
	}).fail(function(jqXHR, textStatus, errorThrown) {
		if (jqXHR.status == 4004) {
			alert("无权浏览");
			window.close();
		}
	});
};

//获取用户MPIID
var getMpiId = function() {
	var sUrl = location.href;
	var sReg = "(?:\\?|&){1}" + "vk" + "=([^&]*)";
	var re = new RegExp(sReg, "gi");
	re.exec(sUrl);
	if (RegExp.$1 != "" && RegExp.$1 != "load") {
		mpiId = RegExp.$1;
		var i = vk.lastIndexOf("-");
		if (i > 0) {
			mpiId = mpiId.substring(i + 1);
		}
		mpiId = mpiId.replace(/#/g, "");
	} else {
		mpiId = "";
	}
};


//获取用户VK
var getVK = function() {
	var sUrl = location.href;
	var sReg = "(?:\\?|&){1}" + "vk" + "=([^&]*)";
	var re = new RegExp(sReg, "gi");
	re.exec(sUrl);
	if (RegExp.$1 != "" && RegExp.$1 != "load") {
		vk = RegExp.$1;
		vk = vk.replace(/#/g, "");
//		var i = vk.indexOf("-");
//		if (i > 0) {
//			mpiId = vk.substring(i + 1);
//			mpiId = mpiId.trim();
//		}
	} else {
		vk = "";
	}
};

//加载模块
var loadMod = function(appId, modId, tabFlag) {
	// @@ automatically set the height of modal, and set the overflow attribute to auto. 
	if (tabFlag) {
		var $mod = $("#" + modId);
		if ($("#" + appId).length > 0) {
			if ($("#" + appId).hasClass('active')) {
				return;
			} else {
				$mod.find('.active').removeClass('in active')
				$("#" + appId).removeClass('fade')
				$("#" + appId).addClass('fade in active')
			}
		} else {
			$.get('../partials/' + appId + ".html", function(data) {
				var $html = $(data);
				var height = $mod.parent().height() - $mod.parent().children('ul').height();
				var $pb = $html.children('.pageBar');
				if ($pb.length > 0) {
//					var h = $pb.css('height');
					var ch = height - pageBarHeight;
					$html.children('.content').css('height', ch);
				}
				var tapContentStr = "<div id='" + appId + "' style='height:" + height + "px;' class='tab-pane fade in active'></div>";
				var contentHtml = $.parseHTML(tapContentStr);
				$mod.html(contentHtml);
				var $app = $("#" + appId);
				$app.append($html);
				$app.find(".portlet-title").remove();
				$app.removeClass('content')
				$mod.find('.active').removeClass('in active')
				$("#" + appId).removeClass('fade')
				$("#" + appId).addClass('fade in active')
				$.cachedScript("../js/appController/" + appId + ".js").done(function(script, textStatus) {
					eval(appId + "(modId, 1)")
					$('a[appId=' + appId + '][rel=prePage]').click(function() {
						var refId = $(this).attr('refId');
						prePage(appId, modId, refId);
						return false;
					});
					$('a[appId=' + appId + '][rel=nextPage]').click(function() {
						var refId = $(this).attr('refId');
						nextPage(appId, modId, refId);
						return false;
					});
				}).fail(function() {
					alert(appId + ":加载失败")
				});
			});
		}
	} else {
		$.get('../partials/' + appId + ".html", function(data) {
			var $mod = $("#" + modId);
			var $html = $(data);
			var $title = $html.children('.portlet-title');
			var height;
			if ($title.length > 0) {
//				var lh = $title.css('line-height');
//				var m = $title.css('margin-bottom');
//				height = $mod.height() - Number(lh.substring(0, lh.length - 2)) - Number(m.substring(0, m.length - 2));
				height = $mod.height() - titleHeight;
			}
			var $pb = $html.children('.pageBar');
			if ($pb.length > 0) {
//				var h = $pb.css('height');
				var ch = height - pageBarHeight;
				$html.children('.content').css('height', ch);
			}
			$title.remove();
			height += 2;// @@ the total height must include the height of top and bottom border.
			var d = $('<div style="height:' + height + 'px;border:1px solid #dddddd;overflow:auto;"></div>').append($html);
			$mod.empty().append($title).append(d);
			$.cachedScript("../js/appController/" + appId + ".js").done(function(script, textStatus) {
				eval(appId + "(modId, 1)")
				$('a[appId=' + appId + '][rel=prePage]').click(function() {
					var refId = $(this).attr('refId');
					prePage(appId, modId, refId);
					return false;
				});
				$('a[appId=' + appId + '][rel=nextPage]').click(function() {
					var refId = $(this).attr('refId');
					nextPage(appId, modId, refId);
					return false;
				});
			}).fail(function() {
				alert(appId + ":加载失败")
			})
		});
	}
}



var htmlContent = {};
//加载HTML模板
var setHtmltoPage = function(url, dcId, pageId) {
	var cachedId = url + dcId
	if (!htmlContent[cachedId]) {
		var url = url + "/?dcId=" + dcId + "&&vk=" + vk;
		$.get(url, function(data) {
			var htmlStr = data.body;
			html = $.parseHTML(htmlStr);
			htmlContent[cachedId] = html;

			$("#" + pageId).empty()
			$("#" + pageId).append(htmlContent[cachedId]);
		});
	} else {
		$("#" + pageId).empty()
		$("#" + pageId).append(htmlContent[cachedId]);
	}
}

//加载应用
var loadApps = function(apps, modId) {
	var $mod = $("#" + modId);
	$mod.css('height', $mod.attr('height'));
	if (apps.length == 1) {
		app = apps[0];
		loadMod(app.id, modId, false);
		$mod.addClass('noTab');
	} else {
		var tabStr = '<ul class="nav nav-tabs"></ul>';
		var html = $.parseHTML(tabStr);
		$mod.append(html);
		var $tabUl = $mod.find('.nav-tabs');
		for (var i = 0; i < apps.length; i++) {
			var app = apps[i];
			var liStr = "<li id='li_" + app["id"] + "' href='#" + app['id'] + "' data-toggle='tab' ><a href='#'' onclick='return false'>" + app['name'] + "<button class='close'></button></a></li>"
			var html1 = $.parseHTML(liStr);
			$tabUl.append(html1)
			if (i == 0) {
				$tabUl.find('li').addClass('active')
				$tabUl.find('a').addClass('active')
			}
		}
		var tabContentId = modId + "tap";
		$mod.removeClass('noTab')
		$mod.append(html);
		$mod.find('.nav-tabs li button').remove('.close');
		var tabContentStr = "<div id=" + tabContentId + " class='tab-content tab-content-border'></div>";
		var taphtml = $.parseHTML(tabContentStr);
		$mod.append(taphtml);
		$mod.find('li').each(function(index) {
			if ($(this).hasClass('active')) {
				var appId = $(this).attr('href');
				appId = appId.replace(/#/g, "")
				loadMod(appId, tabContentId, true)
			}
		});

		$('li[data-toggle="tab"]').on('shown.bs.tab', function(e) {
			if ($(e.target).hasClass('active')) {
				return;
			} else {
				$mod.find('.nav-tabs li').removeClass('active')
				$mod.find('.nav-tabs li a').removeClass('active')
				$(e.target).addClass('active')
				$(e.target).find('a').addClass('active')
				var appId = $(e.target).attr('href');
				appId = appId.replace(/#/g, "")
				if (appId) {
					loadMod(appId, tabContentId, true)
				}
			}
		})
	}
};

//获取JSON数据
$.getJsonData = function(url, cnd, async, options) {
	if (!this.contextName) {
		this.contextName = "ehrview"
	}
	if (!async) {
		async = true;
	} else {
		async = false;
	}
	var cndStr = "";
	if (cnd && cnd != "") {
		for (var n in cnd) {
			cndStr = cndStr + "&" + n + "=" + cnd[n]
		}
	}
	options = $.extend(options || {}, {
		dataType: "json",
		cache: false,
		async: async,
		contentType: 'application/json; charset=UTF-8',
		url: "/" + this.contextName + "/" + url + "?vk=" + vk + cndStr,
		success: function(res) {
			if (res.code === 201) {
				self.location = '../index.html?mpiId=' + mpiId;
			}
		}
	});
	return jQuery.ajax(options);
};

//获取HTML数据
$.getHTMLData = function(url, cnd, options) {
	if (!this.contextName) {
		this.contextName = "ehrview"
	}
	var cndStr = "";
	if (cnd) {
		for (var n in cnd) {
			cndStr = cndStr + "&&" + n + "=" + cnd[n]
		}
	}
	options = $.extend(options || {}, {
		cache: false,
		url: "/" + this.contextName + "/" + url + "?vk=" + vk + cndStr
	});
	return jQuery.ajax(options);
};

//获取JS并缓存
$.cachedScript = function(url, options) {
	options = $.extend(options || {}, {
		dataType: "script",
		cache: true,
		ifModified: true,
		url: url
	});
	return jQuery.ajax(options);
};

var isArray = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Array]';
}

//切换布局
$(document).on("click", ".pin .layoutUl button", function() {
	layoutId = $(this).parent().attr("layoutId");
	templateId = $(this).parent().attr("templateId")
	loadLayout(templateId, layoutId);
	swithNavPin();
})

//弹出搜索
$(document).on("click", ".pin .searchUl button", function() {
	$('#seachModal').modal('show');
	swithNavPin();
})

//搜索人员
$(document).on("click", "#seachModal .seachButton", function() {
	var personName = $("#seachModal .uname input").val();
	var cardTypeCode = $("#seachModal .cardType select").val();
	var cardNo = $("#seachModal .card input").val();
	var certificateTypeCode = $("#seachModal .roleType select").val();
	var certificateNo = $("#seachModal .roleNo input")[0].value;
	var sexCode = $("#seachModal .sex input[name='group']:checked").val();
	var birthday = $("#seachDate").val();

	var args = {
		"personName": personName,
		"cardTypeCode": cardTypeCode,
		"cardNo": cardNo,
		"certificateTypeCode": certificateTypeCode,
		"certificateNo": certificateNo,
		"sexCode": sexCode,
		"birthday": birthday
	};
	$.ajax({
		url: '/ehrview/mpi/getMPIList/?vk=' + vk,
		data: $.toJSON(args),
		contentType: 'application/json; charset=UTF-8',
		type: 'POST',
		dataType: 'json'
	}).done(function(data) {
		var body = data.body;
		$('#seachModal .listView table #seachDataTitle').siblings().remove();
		if (!body) {
			return;
		}
		for (var i = 0; i < body.length; i++) {
			var bodyItem = body[i];
			var trStr = "<tr id=" + bodyItem.mpiId + "></tr>"
			$('#seachModal .listView table').append(trStr);
			var $target = $('#' + bodyItem.mpiId);
			$target.append('<td>' + safeString(bodyItem.cardNo) + '</td>')
			$target.append('<td>' + safeString(bodyItem.personName) + '</td>')
			$target.append('<td>' + safeString(bodyItem.idCard) + '</td>')
			$target.append('<td>' + safeString(bodyItem.sexCode_text) + '</td>')
			$target.append('<td>' + safeDateString(bodyItem.birthday) + '</td>')
			$target.append('<td>' + safeString(bodyItem.registeredPermanent_text) + '</td>')
			$target.append('<td>' + safeString(bodyItem.address) + '</td>')
			$target.append('<td>' + safeString(bodyItem.postalCode) + '</td>')
			$target.append('<td>' + safeString(bodyItem.maritalStatusCode_text) + '</td>')
		}
	})
})

//重置搜索
$(document).on("click", "#seachModal .restButton", function() {
	$("#seachModal form")[0].reset();
})

//打开搜索结果
$(document).on("click", "#seachModal .listView table td", function() {
	var nMpiId = $(this).parent().attr("id")
	var sUrl = location.href;
	window.location.href = sUrl.replace(mpiId, nMpiId);
})