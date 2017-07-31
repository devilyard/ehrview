package com.bsoft.xds.support.instance.pt.app;


import com.bsoft.xds.DocumentEntryRetrieveService;
import com.bsoft.xds.exception.DocumentEntryException;

import ctd.annotation.RpcService;

public interface IAppPtLabExamReportService extends DocumentEntryRetrieveService {


	/**
	 * 
	 * @param idCard
	 * @param cardNo
	 * @param cardTypeCode
	 * @param name
	 * @param page
	 * @param limit
	 * @return
	 * @throws DocumentEntryException
	 */
	@RpcService
	public String getLabExamReport(String idCard,
			String cardNo,
			String cardTypeCode, 
			String name,
			int page, 
			int limit
			)throws DocumentEntryException;
	
	
	@RpcService
	public String getDocumentById(String id)throws DocumentEntryException;
}
