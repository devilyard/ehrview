var Transfusion = function ( ) {
	$.getJsonData( 'transfusion/getPtTransfusion', {
		"start": 0,
		"limit": 20
	} )
		.done( function ( data ) {
			var htmlStr = "<table id='ptTransfusion' width='100%'><tbody id='ptTransfusionTableBody'></tbody></table>";
			var html = $.parseHTML( htmlStr );
			var maoStr = '<a name="anchor"></a>';
			var maohtml = $.parseHTML( htmlStr );
			var body = data.body;
			$( "#PopUpContent").empty( )
			$( "#PopUpContent").append( html );

			for ( var i = 0; i < body.length; i++ ) {
				var bodyItem = body[ i ];
				var DCID = bodyItem.DCID.trim( )
				var htmlStr = ' <tr><td rowspan="2" width="60px" align="center"><img src="../img/arrow2.png" width="40px" height="47px" /></td><td colspan="2" width="22%"><a id=' + DCID + ' class="blue">';
				htmlStr = htmlStr + safeString(bodyItem.ABOBloodCode_Text);
				htmlStr = htmlStr + '</a></td><td colspan="2" width="32%">&nbsp;</td><td align="right" width="15%"></td><td>';
				htmlStr = htmlStr + '</td></tr><tr><td>输血日期：</td><td >';
				htmlStr = htmlStr + safeDateString(bodyItem.BloodTransfusionDateTime);
				htmlStr = htmlStr + '</td> <td  align="right"></td><td>';
				htmlStr = htmlStr + '</td><td  align="right">输血量：</td><td>';
				htmlStr = htmlStr + safeString(bodyItem.BloodTransfusionVolume) + safeString(bodyItem.BloodTransfusionMeasurementUni);
				htmlStr = htmlStr + '</td></tr><tr><td colspan="7"><hr class="grey" /></td></tr><tr><td colspan="7"><div id="content_' + DCID + '" ></div></td></tr>';
				html = $.parseHTML( htmlStr );
				$( "#ptTransfusionTableBody" )
					.append( html );
			}

			$( "#ptTransfusion" )
				.find( 'a' )
				.bind( 'click', function ( event ) {
					var dcId = this.id;
					var cId = "#content_" + this.id;
					if ( $( cId )
						.hasClass( 'hasContent' ) ) {
						if (
							$( cId )
							.hasClass( 'hide' ) ) {
							$( cId )
								.removeClass( 'hide' )
							$( cId )
								.show( );
						} else {
							$( cId )
								.hide( );
							$( cId )
								.addClass( 'hide' )
						}
					} else {
						var url = "../transfusion/getHtmlDocument?dcId=" + dcId + "&vk=" + vk;
						$.get( url, function ( data ) {
							var htmlStr = data.body;
							html = $.parseHTML( htmlStr );
							$( cId )
								.append( html );
							$( cId )
								.addClass( 'well' )
							$( cId )
								.addClass( 'hasContent' )
							cId.scrollIntoView( false )

						} );
					}
				} );

		} );
}