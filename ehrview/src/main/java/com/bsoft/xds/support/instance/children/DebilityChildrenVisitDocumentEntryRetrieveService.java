package com.bsoft.xds.support.instance.children;

import java.util.List;
import java.util.Map;

import com.bsoft.xds.support.instance.CommonDocumentEntryRetrieveService;

import ctd.annotation.RpcService;

/**
 * 体弱儿随访
 * 
 */
public class DebilityChildrenVisitDocumentEntryRetrieveService extends
		CommonDocumentEntryRetrieveService {

	/**
	 * 获取某一份体弱儿童档案的所有随访数据。
	 * 
	 * @param recordId
	 *            体弱儿童档案号。
	 * @return
	 */
	@RpcService
	public List<Map<String, Object>> getVisitDocumentList(String recordId) {
		String hql = "select b.DocContent as docContent from "
				+ getRecordClassifying()
				+ " a, "
				+ getRecordDocClassifying()
				+ " b where a.DebilityChildRecordID=? and a.EffectiveFlag=? order by a.EffectiveTime";
		return getDao().queryForList(hql, new Object[] { recordId, "0" });
	}
}
