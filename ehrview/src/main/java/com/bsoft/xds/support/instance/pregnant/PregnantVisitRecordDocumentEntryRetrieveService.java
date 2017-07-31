package com.bsoft.xds.support.instance.pregnant;

import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.springframework.dao.DataAccessException;

import com.bsoft.xds.exception.DocumentEntryException;
import com.bsoft.xds.support.dao.IDAO;
import com.bsoft.xds.support.instance.CommonDocumentEntryRetrieveService;

/**
 * 孕妇随访记录
 * 
 */
public class PregnantVisitRecordDocumentEntryRetrieveService extends
		CommonDocumentEntryRetrieveService {

	/**
	 * 根据MPIID获取孕妇随访记录。
	 * 
	 * @param mpiId
	 * @param start
	 * @param limit
	 * @return
	 * @throws DocumentEntryException
	 */
	public List<Map<String, Object>> getPregnantVisitList(String mpiId, int start, int limit)
			throws DocumentEntryException {
		String where = "MPIID=? and EffectiveFlag=? order by EffectiveTime desc";
		Object[] params = new Object[] {mpiId, "0" };
		IDAO dao = getDao();
		try {
			return dao.queryForPage(getRecordClassifying(), where, start,
					limit, params);
		} catch (DataAccessException e) {
			throw new DocumentEntryException(
					DocumentEntryException.DATABASE_ACCESS_FAILED, e);
		}
	}

	/**
	 * 根据孕妇档案号获取孕妇随访记录。
	 * 
	 * @param pregnantId
	 * @return
	 * @throws DocumentEntryException
	 */
	public List<Map<String, Object>> getPregnantVisitList(String pregnantId)
			throws DocumentEntryException {
		String where = "EffectiveFlag=? order by EffectiveTime desc";
		Object[] params = new Object[] { "0" };
		if (!StringUtils.isEmpty(pregnantId)) {
			params = new Object[] { pregnantId, "0" };
			where = "PregnantID=? and EffectiveFlag=? order by EffectiveTime desc";
		}
		IDAO dao = getDao();
		try {
			return dao.queryForList(getRecordClassifying(), where, params);
		} catch (DataAccessException e) {
			throw new DocumentEntryException(
					DocumentEntryException.DATABASE_ACCESS_FAILED, e);
		}
	}

	/**
	 * 获取妊娠标准曲线数据。
	 * 
	 * @return
	 * @throws DocumentEntryException
	 */
	public List<Map<String, Object>> getPregnancyStandard()
			throws DocumentEntryException {
		IDAO dao = getDao();
		try {
			return dao.queryForList("MHC_PregnancyStandard", null,
					(Object[]) null);
		} catch (DataAccessException e) {
			throw new DocumentEntryException(
					DocumentEntryException.DATABASE_ACCESS_FAILED, e);
		}
	}

}
