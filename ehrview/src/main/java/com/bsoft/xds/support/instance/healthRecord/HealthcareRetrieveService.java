package com.bsoft.xds.support.instance.healthRecord;

import java.util.List;
import java.util.Map;

import org.hibernate.HibernateException;

import com.bsoft.xds.support.instance.CommonDocumentEntryRetrieveService;

import ctd.service.core.ServiceException;

/**
 * 公共卫生服务记录。
 * 
 * @author <a href="mailto:lisc@bsoft.com.cn">lisc</a>
 */
public class HealthcareRetrieveService extends
		CommonDocumentEntryRetrieveService {

	/**
	 * @param mpiId
	 * @param start
	 * @param limit
	 * @return
	 */
	public List<Map<String, Object>> getHealthcareServiceRecords(String mpiId, int start,
			int limit) throws ServiceException {
		String hql = "from " + getRecordClassifying()
				+ " where MPIID=? order by SystemTime desc";
		try {
			return getDao().queryForPage(hql, start, limit,
					new Object[] { mpiId });
		} catch (HibernateException e) {
			throw new ServiceException(e);
		}
	}
}
