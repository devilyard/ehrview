/*
 * 门诊
 */
var ClinicRecord = function (modId, page) {
	$.getJsonData('medical/ClinicRecord', {
		"start": page && page > 1 ? (page - 1) * pageSize : 0,
		"limit": pageSize
	}).done(function (data) {
		$('#jzrq').datepicker({
			format: 'yyyy-mm-dd'
		});
		var body = data.body
		loadClinicRecord(body, page);
	});
	
	$(".pageBar .btn-success").click(function(){
			var zdmc = $("#zdmc").val();
			var jzrq = $("#jzrq").val();
			var jzksmc = $("#jzksmc").val();
			var jgdmtext = $("#jgdmtext").val();
			var args = {
					"zdmc":zdmc,
					"jzrq": jzrq,
					"jzksmc": jzksmc,
					"jgdmtext": jgdmtext
				};
			$.ajax({
				url: '/ehrview/medical/queryClinicRecord/?vk=' + vk,
				data: $.toJSON(args),
				contentType: 'application/json; charset=UTF-8',
				type: 'POST',
				dataType: 'json'
			}).done(function(data) {
				var body = data.body;
				loadClinicRecord(body,0);
			});
			
			
		});
}

function loadClinicRecord(body,page){
	var $ttable = $("#ClinicRecordTable");
	$ttable.attr('page', page);
	var html = body.length > 0 ? '' : '<tr><td>没有更多数据</td></td>';
	var mapData = {};
	for (var i = 0; i < body.length; i++) {
		var bodyItem = body[i];
		mapData[bodyItem.DCID] = bodyItem;
		var htmlStr = ' <tr><td rowspan="2" width="60px" align="center"><img src="../img/arrow2.png" width="40px" height="47px" /></td><td colspan="2" width="135px"><a id="' + bodyItem.DCID + '" encript="' + bodyItem._encript + '" href="../partials/popUp/ClinicPopUpView.html" class="blue">';
		htmlStr = htmlStr + safeString(bodyItem.ZDMC);
		htmlStr = htmlStr + '</a></td><td colspan="2" width="155px">&nbsp;</td><td align="right" width="90px"></td><td>';
		htmlStr = htmlStr + '</td></tr><tr><td>诊断日期：</td><td >';
		htmlStr = htmlStr + safeDateString(bodyItem.JZRQ);
		htmlStr = htmlStr + '</td> <td  align="right">诊断科室：</td><td>';
		htmlStr = htmlStr + safeString(bodyItem.JZKSMC);
		htmlStr = htmlStr + '</td><td  align="right">诊断机构：</td><td>';
		htmlStr = htmlStr + safeString(bodyItem.AuthorOrganization_text);//JGDMTEXT
		htmlStr = htmlStr + '</td></tr><tr><td colspan="7"><hr class="grey" /></td></tr>';
		html += htmlStr;
	}
	$ttable.html(html);
	if (body.length == pageSize) {
		$('a[appId=ClinicRecord][rel=nextPage]').show();
	} else {
		$('a[appId=ClinicRecord][rel=nextPage]').hide();
	}
	if (page <= 1) {
		$('a[appId=ClinicRecord][rel=prePage]').hide();
	} else {
		$('a[appId=ClinicRecord][rel=prePage]').show();
	}

	if(page==0){
		$('a[appId=ClinicRecord][rel=nextPage]').hide();
		$('a[appId=ClinicRecord][rel=prePage]').hide();
	}
	
	$ttable.find('a').click(function() {
		var encript = $(this).attr('encript');
		if (encript == 'true') {
			$.messagebox.error('提示', '无权浏览！');
			return false;
		}
		$(this).colorbox({
			transition: "true",
			width: "95%",
			height: "95%",
			onOpen: function () {
				
			},
			onLoad: function () {
				
			},
			onComplete: function () {
				var DCID = this.id
				$.cachedScript("../js/appController/popUp/ClinicPopUp.js").done(function (script, textStatus) {
					var data = mapData[DCID];
					if (!data.AuthorOrganization) {
						data.AuthorOrganization = data.JGDM;
					}
					ClinicPopUp(mapData[DCID]);
				});
			},
			onCleanup: function () {

			},
			onClosed: function () {

			}
		});
	})
}