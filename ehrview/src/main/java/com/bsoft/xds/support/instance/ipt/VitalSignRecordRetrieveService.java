package com.bsoft.xds.support.instance.ipt;

import java.util.List;
import java.util.Map;

import org.springframework.dao.DataAccessException;

import com.bsoft.xds.support.instance.CommonDocumentEntryRetrieveService;

import ctd.service.core.ServiceException;

/**
 * 护理操作记录:生命体征测量记录。
 * 
 */
public class VitalSignRecordRetrieveService extends
		CommonDocumentEntryRetrieveService {

	/**
	 * 获取生命体重测试记录。
	 * 
	 * @param visitId
	 * @return
	 * @throws ServiceException
	 */
	public List<Map<String, Object>> getVitalSignRecord(String visitId)
			throws ServiceException {
		try {
			return getDao().queryForList(recordClassifying,
					"VisitID=? order by StatisticDate asc",
					new Object[] { visitId });
		} catch (DataAccessException e) {
			throw new ServiceException(e);
		}
	}

}
