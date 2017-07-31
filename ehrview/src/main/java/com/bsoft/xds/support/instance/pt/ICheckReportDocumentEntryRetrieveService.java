/*
 * @(#)CheckReportDocumentEntryRetrieveService.java Created on 2014年8月25日 下午3:31:48
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.xds.support.instance.pt;

import java.util.List;
import java.util.Map;

import com.bsoft.xds.exception.DocumentEntryException;

import ctd.annotation.RpcService;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public interface ICheckReportDocumentEntryRetrieveService {

	/**
	 * @param mpiId
	 * @param start
	 * @param limit
	 * @return
	 * @throws DocumentEntryException
	 */
	@RpcService
	public abstract List<Map<String, Object>> getDocList(String mpiId,
			int start, int limit) throws DocumentEntryException;

	/**
	 * @param dcId
	 * @param docFormat
	 * @return
	 * @throws DocumentEntryException
	 */
	@RpcService
	public Object getDocumentByRecordId(String dcId, String docFormat)
			throws DocumentEntryException;

	/**
	 * @param visitId
	 * @param authorOrganization
	 * @param start
	 * @param limit
	 * @return
	 * @throws DocumentEntryException
	 */
	@RpcService
	public List<Map<String, Object>> getRecordByVisitId(String visitId,
			String authorOrganization, int start, int limit)
			throws DocumentEntryException;
	
	@RpcService
	public  List<Map<String, Object>> queryCheckReport(String mpiId,Map<String, String> args) throws Exception;
}