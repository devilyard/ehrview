/*
 * 住院医嘱
 */
var InpatientAdvice = function (bodyItem,page) {
	var bodyItemTreatMent = bodyItem;
	pageSize=20;
	var tableStr = "<table width='100%' class='table text-center table-bordered table-hover' id='iptAdviceDetail'><tbody><tr><th width='85px'>开嘱时间</th><th width='85px'>停嘱时间</th><th width='65px'>开嘱医生</th><th style='text-align:center;'>医嘱内容</th><th width='60px'>剂量</th><th width='60px'>数量</th><th width='60px'>频次</th><th width='80px'>给药途径</th><th width='80px'>医嘱类别</th></tr></tbody></table>";// 暂不显示 <th width='65px'>用药天数</th>
	var html = $.parseHTML( tableStr );
	$( "#PopUpContent" ).empty( )
	$( "#PopUpContent" ).append( html );
	$.getJsonData( 'iptAdviceDetail/getIptAdviceDetail', {
		"visitId": bodyItem.JZLSH,
		"authorOrganization": bodyItem.AuthorOrganization,
		"start": page && page > 1 ? (page - 1) * pageSize : 0,
		"limit": pageSize
	}).done( function ( data ) {
		var body = data.body;
		$.ajaxSetup({ async : false });
		for ( var i = 0; i < body.length; i++ ) {
			var bodyItem = body[ i ];
			var dcId = bodyItem.DCID
			var url = "../iptAdviceDetail/getHtmlDocument?dcId=" + dcId + "&vk=" + vk;
			$.get(url, function(data) {
				var htmlStr = data.body;
				html = $.parseHTML(htmlStr);
				$( "#PopUpContent #iptAdviceDetail" ).append( html );
				
//				$(cId).append(html);
			});
//			var trStr = "<tr><td>" + safeDateTimeString(bodyItem.AdvicePlanStartTime).replace(' ', '<br>') + "</td><td>" + safeDateTimeString(bodyItem.AdvicePlanEndTime).replace(' ', '<br>') + "</td><td>" + safeString(bodyItem.AdviceOpenerSign) + "</td><td style='text-align:left;'>" + safeString(bodyItem.AdviceItem) + "</td><td>" + safeString(bodyItem.OnceDosage) + safeString(bodyItem.DosageUnit) + "</td><td>" + safeString(bodyItem.OnceTotalNumber) + safeString(bodyItem.TotalNumberUnit) + "</td><td>" + safeString(bodyItem.UsageFrequency) + "</td><td>" + safeString(bodyItem.AdministrationRoute_Text) + "</td><td>" + safeString(bodyItem.AdviceType) + "</td><td>" + safeString(bodyItem.AdviceStatus_Text) + "</td><td>" + safeString(bodyItem.StopAdviceDoctor) + "</td></tr>";
//			var html = $.parseHTML( trStr );
//			$( "#PopUpContent #iptAdviceDetail" ).append( html );
		}
		
		var pageBarStr = '<div class="pageBar">';
		pageBarStr = pageBarStr + '<a href="#" rel="prePage" refId="iptAdviceDetailTable" appId="IptAdviceDetail" style="display:none;">上一页</a>&nbsp;&nbsp;';
		pageBarStr = pageBarStr + '<a href="#" rel="nextPage" refId="iptAdviceDetailTable" appId="IptAdviceDetail" style="display:none;">下一页</a>';
		pageBarStr = pageBarStr + '</div>';
		html = $.parseHTML(pageBarStr);
		$( "#PopUpContent" ).append( html );
		
		var $ttable = $("#iptAdviceDetail");
		$ttable.attr('page', page);
		
		if (body.length == pageSize) {
			$('a[appId=IptAdviceDetail][rel=nextPage]').show();
		} else {
			$('a[appId=IptAdviceDetail][rel=nextPage]').hide();
		}
		if (page <= 1) {
			$('a[appId=IptAdviceDetail][rel=prePage]').hide();
		} else {
			$('a[appId=IptAdviceDetail][rel=prePage]').show();
		}
		
		if(page==0){
			$('a[appId=IptAdviceDetail][rel=nextPage]').hide();
			$('a[appId=IptAdviceDetail][rel=prePage]').hide();
		}
		
		$('a[appId=IptAdviceDetail][rel=prePage]').click(function() {
			InpatientAdvice(bodyItemTreatMent,page-1);
		});
		$('a[appId=IptAdviceDetail][rel=nextPage]').click(function() {
			InpatientAdvice(bodyItemTreatMent,page+1);
		});
		
		removeRunningMask();
	} );
}