package com.bsoft.xds.support.instance.summary;

import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.springframework.dao.DataAccessException;

import com.bsoft.xds.support.dao.IDAO;
import com.bsoft.xds.support.instance.CommonDocumentEntryRetrieveService;

import ctd.service.core.ServiceException;

/**
 * 生命周期
 * 
 */
public class LifeCycleService extends CommonDocumentEntryRetrieveService {

	/**
	 * 获取生命周期诊疗数据。
	 * 
	 * @param mpiId
	 * @param timeSlot
	 * @param start
	 * @param limit
	 * @return
	 * @throws ServiceException 
	 */
	public List<Map<String, Object>> getLifeCycle(String mpiId,
			String timeSlot, int start, int limit) throws ServiceException {
		IDAO dao = getDao();
		String where = null;
		Object[] params = null;
		if(StringUtils.isEmpty(timeSlot)){
			params = new Object[] { mpiId };
			where = "MPIID=? ";
		}else {
			params = new Object[] { mpiId, timeSlot };
			where = "MPIID=? and TimeSlot=?";
		}
		
		try {
			return dao.queryForPage(recordClassifying, where, start, limit,
					params);
		} catch (DataAccessException e) {
			throw new ServiceException("Failed to get life cycle.", e);
		}
	}
}
