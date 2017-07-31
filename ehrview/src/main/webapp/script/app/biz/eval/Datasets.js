$package("app.biz.eval")

app.biz.eval.Datasets = function(mpiId,idCard,service,birthday,sexCode){
	this.mpiId = mpiId
	this.idCard = idCard
	this.service = service
	this.birthday = birthday
	this.sexCode = sexCode
	app.biz.eval.Datasets.superclass.constructor.call(this)
	this.init();
}
Ext.extend(app.biz.eval.Datasets, app.modules.list.SimpleListView, {
	init:function(){
		var mpiId = this.mpiId;
		var idCard = this.idCard;
		var service = this.service;
		var age=this.getAge(this.birthday);
		var sexCode = this.sexCode;
		if(age<=0){//婴儿
			var data = [];
		}else if(age>0&&age<=10){//儿童
			var data = [['Birth_Certificate','EHR-DE-02-出生医学证明-T01'],['MHC_BabyVisitRecord','EHR-DE-03-新生儿家庭访视信息-T01'],['CDH_CheckUp','EHR-DE-04-儿童健康检查信息-T01']];
		}else{
			if(sexCode==2){//女性
				var data = [['EHR_HealthRecord','EHR-DE-01-个人基本信息-T01'],['Birth_Certificate','EHR-DE-02-出生医学证明-T01'],['MHC_BabyVisitRecord','EHR-DE-03-新生儿家庭访视信息-T01'],['CDH_CheckUp','EHR-DE-04-儿童健康检查信息-T01'],['MHC_VisitRecord','EHR-DE-05-产前随访服务信息-T01'],['MHC_PostnatalVisitInfo','EHR-DE-07-产后访视服务信息-T01'],
				            ['MHC_Postnatal42DayRecord','EHR-DE-08-产后42天健康检查信息-T01'],['Vaccination_Report','EHR-DE-09-预防接种卡信息-T01'],['InfectiousDisease_Report','EHR-DE-10-传染病报告卡信息-T01'],
				            ['Death_Certificate','EHR-DE-11-死亡医学证明-T01'],['MDC_HypertensionVisit','EHR-DE-12-高血压患者随访信息-T01'],['MDC_DiabetesVisit','EHR-DE-13-2型糖尿病患者随访信息-T01'],['PSY_PsychosisRecord','EHR-DE-14-重性精神疾病患者管理信息-T01'],
				            ['Cu_Register','EHR-DE-16-健康体检信息-T01'],['Opt_Record','EHR-DE-17-门诊摘要信息-T01'],
				            ['Ipt_Record','EHR-DE-18-住院摘要信息-T01'],['EMR_ConsultationRecord','EHR-DE-19-会诊信息-T01'],['EMR_ReferralRecord','EHR-DE-20-转诊（院）信息-T01']];
			}else if(sexCode==1){//男性
				var data = [['EHR_HealthRecord','EHR-DE-01-个人基本信息-T01'],['Birth_Certificate','EHR-DE-02-出生医学证明-T01'],['MHC_BabyVisitRecord','EHR-DE-03-新生儿家庭访视信息-T01'],['CDH_CheckUp','EHR-DE-04-儿童健康检查信息-T01'],['Vaccination_Report','EHR-DE-09-预防接种卡信息-T01'],['InfectiousDisease_Report','EHR-DE-10-传染病报告卡信息-T01'],
				            ['Death_Certificate','EHR-DE-11-死亡医学证明-T01'],['MDC_HypertensionVisit','EHR-DE-12-高血压患者随访信息-T01'],['MDC_DiabetesVisit','EHR-DE-13-2型糖尿病患者随访信息-T01'],['PSY_PsychosisRecord','EHR-DE-14-重性精神疾病患者管理信息-T01'],
				            ['Cu_Register','EHR-DE-16-健康体检信息-T01'],['Opt_Record','EHR-DE-17-门诊摘要信息-T01'],
				            ['Ipt_Record','EHR-DE-18-住院摘要信息-T01'],['EMR_ConsultationRecord','EHR-DE-19-会诊信息-T01'],['EMR_ReferralRecord','EHR-DE-20-转诊（院）信息-T01']];
			}
			
//			if(sexCode==2){//女性
//				var data = [['EHR_HealthRecord','EHR-DE-01-个人基本信息-T01'],['Birth_Certificate','EHR-DE-02-出生医学证明-T01'],['MHC_BabyVisitInfo','EHR-DE-03-新生儿家庭访视信息-T01'],['CDH_CheckUp','EHR-DE-04-儿童健康检查信息-T01'],['MHC_PregnantScreenResult','EHR-DE-05-产前随访服务信息-T01'],['MHC_PostnatalVisitInfo','EHR-DE-07-产后访视服务信息-T01'],
//				            ['MHC_Postnatal42DayRecord','EHR-DE-08-产后42天健康检查信息-T01'],['Vaccination_Report','EHR-DE-09-预防接种卡信息-T01'],['InfectiousDisease_Report','EHR-DE-10-传染病报告卡信息-T01'],
//				            ['JMSWDJ','EHR-DE-11-死亡医学证明-T01'],['MDC_HypertensionVisit','EHR-DE-12-高血压患者随访信息-T01'],['MDC_DiabetesVisit','EHR-DE-13-2型糖尿病患者随访信息-T01'],
//				            ['PSY_PsychosisRecord','EHR-DE-14-重性精神疾病患者管理信息-T01'],['Cu_Register','EHR-DE-16-健康体检信息-T01'],['Opt_Record','EHR-DE-17-门诊摘要信息-T01'],
//				            ['Ipt_Record','EHR-DE-18-住院摘要信息-T01'],['EMR_ConsultationRecord','EHR-DE-19-会诊信息-T01'],['EMR_ReferralRecord','EHR-DE-20-转诊（院）信息-T01']];
//			}else if(sexCode==1){//男性
//				var data = [['EHR_HealthRecord','EHR-DE-01-个人基本信息-T01'],['Vaccination_Report','EHR-DE-09-预防接种卡信息-T01'],['InfectiousDisease_Report','EHR-DE-10-传染病报告卡信息-T01'],
//				            ['JMSWDJ','EHR-DE-11-死亡医学证明-T01'],['MDC_HypertensionVisit','EHR-DE-12-高血压患者随访信息-T01'],['MDC_DiabetesVisit','EHR-DE-13-2型糖尿病患者随访信息-T01'],
//				            ['PSY_PsychosisRecord','EHR-DE-14-重性精神疾病患者管理信息-T01'],['Cu_Register','EHR-DE-16-健康体检信息-T01'],['Opt_Record','EHR-DE-17-门诊摘要信息-T01'],
//				            ['Ipt_Record','EHR-DE-18-住院摘要信息-T01'],['EMR_ConsultationRecord','EHR-DE-19-会诊信息-T01'],['EMR_ReferralRecord','EHR-DE-20-转诊（院）信息-T01']];
//			}
		}
	var ds = new Ext.data.Store({
		    proxy: new Ext.data.MemoryProxy(data),
		    reader: new Ext.data.ArrayReader({id:0}, [{
		        name:'recordname',mapping:1},{name:'record',mapping:0}])
		});
		ds.load();
			 
		var cm = new Ext.grid.ColumnModel([new Ext.grid.CheckboxSelectionModel ({singleSelect : false}),{
	        header: '业务名称',
	        dataIndex: 'recordname',
	        width: 737
	    }]);
		var sm = new Ext.grid.CheckboxSelectionModel ({
      	  singleSelect : false,
    	  handleMouseDown :function(g, rowIndex, e){  
    		  var isSelected = this.isSelected(rowIndex);
    		  if(isSelected){  
    		        this.deselectRow(rowIndex);  
    		  }else{
    			  this.selectRow(rowIndex,true);  
    		  }
    		  var tolCounts=g.getStore().getCount()
    		  var selCounts=g.getSelectionModel().getSelections().length
    		  var hd_checker = g.getEl().select('div.x-grid3-hd-checker');
			  var hd = hd_checker.first();
			  if(hd!=null){
	    		  if(selCounts<tolCounts){
    				  hd.addClass('x-grid3-hd-checker-on');
					  hd.removeClass('x-grid3-hd-checker-on');
	    		  }else if(selCounts==tolCounts){
	    			  hd.addClass('x-grid3-hd-checker-on');
	    		  }
			  }
    	  }
		});
		
		this.grid = new Ext.grid.GridPanel({
              region: 'north',
              store: ds,
              cm: cm,
			  sm: sm,
              selModel: new Ext.grid.RowSelectionModel({singleSelect:false}),
              width: 790,
              frame: true,
              height: 450,
              id:'recordsGrid',
              buttons:[{
            	  text:"下载",
            	  handler:function(){
            		  var s = Ext.getCmp("recordsGrid").getSelectionModel().getSelections(); 
        			  var str=""; 
        			  if(0<s.length){ 
	        			  for (var i = 0;i< s.length; i++) { 
	        				  str=str+s[i].get('record')+","; 
	        			  } 
        			  var selRecords=str.substring(0,str.length-1);
					  window.open("tableDocForm.ehr?MPIID=" + mpiId+ "&service=" + service + "&idCard=" + idCard
								+ "&selRecords="+ selRecords);
        			  }else{
        				  Ext.MessageBox.alert("提示", "请选择需要下载的文档!",
												function() {
													this.win.close()
												}, this);
        			  }
            	  }
              },
              {
            	  text:"重置",  
            	  handler:function(){
					  var grid = Ext.getCmp("recordsGrid");
					  var hd_checker = grid.getEl().select('div.x-grid3-hd-checker');
					  var hd = hd_checker.first();
					  if(hd != null){  
						  hd.addClass('x-grid3-hd-checker-on');
						  hd.removeClass('x-grid3-hd-checker-on');
						  grid.getSelectionModel().clearSelections(); 
					  }
            	  }
              }]
        });
	},
	
	getAge:function(strBirthday){
		var returnAge;
	    var strBirthdayArr=strBirthday.split("-");
	    var birthYear = strBirthdayArr[0];
	    var birthMonth = strBirthdayArr[1];
	    var birthDay = strBirthdayArr[2].split(" ")[0];
	    
	    d = new Date();
	    var nowYear = d.getFullYear();
	    var nowMonth = d.getMonth() + 1;
	    var nowDay = d.getDate();
	    
	    if(nowYear == birthYear){
	        returnAge = 0;//同年 则为0岁
	    }else{
	        var ageDiff = nowYear - birthYear ; //年之差
	        if(ageDiff > 0){
	            if(nowMonth == birthMonth){
	                var dayDiff = nowDay - birthDay;//日之差
	                if(dayDiff < 0){
	                    returnAge = ageDiff - 1;
	                }else{
	                    returnAge = ageDiff ;
	                }
	            }else{
	                var monthDiff = nowMonth - birthMonth;//月之差
	                if(monthDiff < 0){
	                    returnAge = ageDiff - 1;
	                }else{
	                    returnAge = ageDiff ;
	                }
	            }
	        }else{
	            returnAge = -1;//返回-1 表示出生日期输入错误 晚于今天
	        }
	    }
	    return returnAge;//返回周岁年龄
	},
	
	show:function(renderTo,xy){
		var win =  new Ext.Window({
					title:"数据集",
					layout:"form",
					width:800,
					height:500,
					closeAction:"close",
					shadow:false,
					modal:true,
					items:this.grid,
					buttonAlign:'center'
				})
			 win.on("close",function(){
					this.fireEvent("close",this)
				},this)
			this.win = win
		if(xy){
			win.setPosition(xy[0],xy[1])
		}
		win.show()
//		Ext.onReady(function(){
//			
//		},this);
	},
	
	close:function(){
		if(this.win){
			this.win.close();
		}
		
	}
	
})