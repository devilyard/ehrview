package com.bsoft.xds.support.instance.children;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.springframework.dao.DataAccessException;

import com.bsoft.xds.exception.DocumentEntryException;
import com.bsoft.xds.support.instance.CommonDocumentEntryRetrieveService;

/**
 * 儿童体检
 * 
 */
public class CheckUpDocumentEntryRetrieveService extends
		CommonDocumentEntryRetrieveService {

	private static HashMap<String, String> checkupStageMap = new HashMap<String, String>();
	static {
		checkupStageMap.put("1", "CAST(CheckupStage as int)<13");
		checkupStageMap.put("2", "CAST(CheckupStage as int)>12 and CAST(CheckupStage as int)<25");
		checkupStageMap.put("3", "CAST(CheckupStage as int)>24 and CAST(CheckupStage as int)<37");
	}

	/**
	 * 获取儿童体检列表。
	 * 
	 * @param mpiId
	 * @param checkupStage
	 * @return
	 * @throws DocumentEntryException
	 */
	public List<Map<String, Object>> getCheckUpList(String mpiId,
			String checkupStage) throws DocumentEntryException {
		try {
			return getDao().queryForList(getRecordClassifying(),
				(checkupStageMap.get(checkupStage) == null ? "" : checkupStageMap.get(checkupStage) + "and") + " MPIID=? and EffectiveFlag=?",
					new Object[] { mpiId, "0"});
		} catch (DataAccessException e) {
			throw new DocumentEntryException(
					DocumentEntryException.DATABASE_ACCESS_FAILED, e);
		}
	}

	/**
	 * 获取儿童标准生长曲线数据。
	 * 
	 * @param sexCode
	 * @return
	 * @throws DocumentEntryException
	 */
	public List<Map<String, Object>> getWHOAgeStandard(String sexCode)
			throws DocumentEntryException {
		String where = "SEXCODE=?";
		Object[] params = new Object[] { sexCode };
		try {
			return this.getDao().queryForList("CDH_WhoAge", where,  //CDH_WHOAgeStandard
					params);
		} catch (DataAccessException e) {
			throw new DocumentEntryException(
					DocumentEntryException.DATABASE_ACCESS_FAILED, e);
		}
	}

}
