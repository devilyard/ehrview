package com.bsoft.xds.support.instance.ipt;

import java.util.List;
import java.util.Map;

import org.springframework.dao.DataAccessException;

import com.bsoft.xds.support.instance.CommonDocumentEntryRetrieveService;

import ctd.service.core.ServiceException;

/**
 * 护理操作记录:生命体征
 * 
 */
public class VitalSignRetrieveService extends
		CommonDocumentEntryRetrieveService {

	/**
	 * 获取生命体征记录。
	 * 
	 * @param visitId
	 * @return
	 * @throws ServiceException
	 */
	public List<Map<String, Object>> getVitalSign(String visitId)
			throws ServiceException {
		try {
			return getDao()
					.queryForList(
							recordClassifying,
							"VisitID=? and EffectiveFlag=? order by TemperatureRecordDateTime asc",
							new Object[] { visitId, "0" });
		} catch (DataAccessException e) {
			throw new ServiceException(e);
		}
	}

}