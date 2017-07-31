package com.bsoft.xds.support.instance.pregnant;

import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;

import com.bsoft.xds.support.dao.IDAO;
import com.bsoft.xds.support.instance.CommonDocumentEntryRetrieveService;

/**
 * 孕妇档案
 * 
 */
public class PregnantRecordDocumentEntryRetrieveService extends
		CommonDocumentEntryRetrieveService {

	/**
	 * 获取孕妇档案
	 * 
	 * @param mpiId
	 * @return
	 */
	public List<Map<String, Object>> getPregnantIdByMpiId(String mpiId) {
		List<Map<String, Object>> l = null;
		IDAO dao = getDao();
		String where = "EffectiveFlag=?";
		Object[] params = new Object[] { "0" };
		if (!StringUtils.isEmpty(mpiId)) {
			params = new Object[] { mpiId, "0"};
			where = "MPIID=? and EffectiveFlag=?";
		}
		l = dao.queryForList(recordClassifying, where, params);
		return l;
	}

}
