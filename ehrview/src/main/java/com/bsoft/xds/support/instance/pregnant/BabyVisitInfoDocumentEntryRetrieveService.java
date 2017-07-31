package com.bsoft.xds.support.instance.pregnant;

import java.util.Map;

import com.bsoft.xds.support.instance.CommonDocumentEntryRetrieveService;

import ctd.annotation.RpcService;

/**
 * 新生儿基本信息
 * 
 */
public class BabyVisitInfoDocumentEntryRetrieveService extends
		CommonDocumentEntryRetrieveService {

	/**
	 * 获取一个新生儿信息。
	 * 
	 * @param mpiId
	 * @param babyID
	 * @return
	 */
	@RpcService
	public Map<String, Object> getBabyInfo(final String mpiId,
			final String babyID) {
		return getDao().queryForMap(recordClassifying,
				" MPIID=? and BabyID=? and EffectiveFlag=?",
				new Object[] { mpiId, babyID, "0" });
	}

	/**
	 * @param babyID
	 * @return
	 */
	public Map<String, Object> getBabyInfoByBabyId(final String babyID) {
		return getDao().queryForMap(recordClassifying,
				"BabyID=? and EffectiveFlag=?", new Object[] { babyID, "0" });
	}
}
