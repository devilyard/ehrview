package com.bsoft.ehr.webservice;

@javax.jws.WebService(targetNamespace = "http://webservice.ehr.bsoft.com/", serviceName = "GetDsDetailService", portName = "GetDsDetailPort")
public class GetDsDetailDelegate {

	com.bsoft.ehr.webservice.GetDsDetail getDsDetail = new com.bsoft.ehr.webservice.GetDsDetail();

	public String getDsDetail3301(String param) {
		return getDsDetail.getDsDetail3301(param);
	}

}