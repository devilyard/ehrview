package com.bsoft.xds.support.instance.summary;

import java.util.List;
import java.util.Map;

import org.hibernate.HibernateException;

import com.bsoft.xds.support.instance.CommonDocumentEntryRetrieveService;

import ctd.service.core.ServiceException;

/**
 * 既往史_过敏史
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class AllergyService extends CommonDocumentEntryRetrieveService {

	/**
	 * @param mpiId
	 * @param start
	 * @param limit
	 * @return
	 */
	public List<Map<String, Object>> getAllergys(String mpiId, int start,
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
