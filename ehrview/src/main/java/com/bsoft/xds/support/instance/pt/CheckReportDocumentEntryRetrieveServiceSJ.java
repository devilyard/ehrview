/*
 * @(#)CheckReportDocumentEntryRetrieveService.java Created on 2014年8月26日 上午10:34:58
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.xds.support.instance.pt;

import java.util.List;
import java.util.Map;

import com.bsoft.xds.exception.DocumentEntryException;

import ctd.net.rpc.Client;
import ctd.service.core.ServiceException;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class CheckReportDocumentEntryRetrieveServiceSJ implements
		ICheckReportDocumentEntryRetrieveService {

	private String remoteServiceName;

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.bsoft.xds.support.instance.pt.ICheckReportDocumentEntryRetrieveService
	 * #getDocList(java.lang.String, int, int)
	 */
	@SuppressWarnings("unchecked")
	@Override
	public List<Map<String, Object>> getDocList(String mpiId, int start,
			int limit) throws DocumentEntryException {
		try {
			return (List<Map<String, Object>>) Client.rpcInvoke(
					remoteServiceName, "getDocList", new Object[] { mpiId,
							start, limit });
		} catch (Exception e) {
			throw new DocumentEntryException(
					DocumentEntryException.UNKNOW_ERROR,
					"Cannot get document list from remote.", e);
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.bsoft.xds.support.instance.pt.ICheckReportDocumentEntryRetrieveService
	 * #getDocumentByRecordId(java.lang.String, java.lang.String)
	 */
	@Override
	public Object getDocumentByRecordId(String dcId, String docFormat)
			throws DocumentEntryException {
		return "<pdf>../checkReport/" + dcId + ".pdf</pdf>";
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.bsoft.xds.support.instance.pt.ICheckReportDocumentEntryRetrieveService
	 * #getRecordByVisitId(java.lang.String, java.lang.String, int, int)
	 */
	@Override
	public List<Map<String, Object>> getRecordByVisitId(String visitId,
			String authorOrganization, int start, int limit)
			throws DocumentEntryException {
		return null;
	}

	/**
	 * @param dcId
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> getDocumentContent(String dcId) throws Exception {
		return (Map<String, Object>) Client.rpcInvoke(remoteServiceName,
				"getDocInfo", new Object[] { dcId });
	}

	/**
	 * @return the remoteServiceName
	 */
	public String getRemoteServiceName() {
		return remoteServiceName;
	}

	/**
	 * @param remoteServiceName
	 *            the remoteServiceName to set
	 */
	public void setRemoteServiceName(String remoteServiceName) {
		this.remoteServiceName = remoteServiceName;
	}

	@Override
	public List<Map<String, Object>> queryCheckReport(String mpiId,
			Map<String, String> args) throws ServiceException {
		// TODO Auto-generated method stub
		return null;
	}

}
