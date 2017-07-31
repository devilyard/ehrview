var InpatientAdvice = function () {
	var tableStr = "<table width='100%' class='table text-center table-bordered table-hover' id='iptAdviceDetail'><thead><tr><th width='70'>开始时间</th><th width='70'>停止时间</th><th width='50%'>医嘱内容</th><th width='60'>药品规格</th><th width='60'>服用剂量</th><th width='60'>服用间隔</th><th width='60'>给药途径</th><th width='60'>医嘱类别</th></tr><thead/></table>";
	var html = $.parseHTML( tableStr );
	$( "#PopUpContent" )
		.empty( )
	$( "#PopUpContent" )
		.append( html );
	$.getJsonData( 'iptAdviceDetail/getIptAdviceDetail', {
		"start": 0,
		"limit": 20
	} )
		.done( function ( data ) {
			var body = data.body;
			for ( var i = 0; i < body.length; i++ ) {
				var bodyItem = body[ i ];
				var trStr = "<tr><td>" + bodyItem.AdvicePlanStartTime + "</td><td>" + bodyItem.AdvicePlanEndTime + "</td><td>" + bodyItem.AdviceItem + "</td><td>" + bodyItem.DrugstoreSpec + "</td><td>" + bodyItem.OnceDosage + bodyItem.DosageUnit + "</td><td>" + bodyItem.UsageFrequency + "</td><td>" + bodyItem.AdministrationRoute + "</td><td>" + bodyItem.AdviceTypeCode + "</td></tr>";
				var html = $.parseHTML( trStr );
				$( "#PopUpContent #iptAdviceDetail" )
					.append( html );
			}
		} );
}