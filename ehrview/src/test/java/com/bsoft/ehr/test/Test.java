package com.bsoft.ehr.test;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.context.support.ClassPathXmlApplicationContext;

import ctd.net.rpc.Client;

public class Test {

	public static void main(String[] args) {
		
		ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("com/bsoft/ehr/test/spring-client.xml");
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("idCard","371522195811208263");
//		map.put("beginDate", new Date());
//		map.put("endDate", new Date());
//		map.put("authorOrganizationCode", "");
//		map.put("reportNo", "");
		
		Object result = null;
		Object result1 = null;
		try {
			result = Client.rpcInvoke("ehr22.ptLabExamReportRealtime",
					"getLabExamReportDocuments", new Object[] { map,"Pt_LabReport",1,15 });
			
//			result1 = Client.rpcInvoke("zj_ehrview.ptExamReportRealtime",
//					"getExamReportDocument", new Object[] { "47011661433010211A1001", "1"});
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		System.out.println("30=====>" + result);
		System.out.println("30=====>" + result1);
		context.close();
	}
}
