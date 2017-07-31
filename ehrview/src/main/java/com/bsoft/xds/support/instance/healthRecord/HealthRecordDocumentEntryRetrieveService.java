package com.bsoft.xds.support.instance.healthRecord;

import java.io.ByteArrayInputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.Element;
import org.springframework.dao.DataAccessException;

import com.bsoft.ehr.util.ByteArrayUtils;
import com.bsoft.ehr.util.XMLHelper;
import com.bsoft.xds.exception.DocumentEntryException;
import com.bsoft.xds.support.instance.CommonDocumentEntryRetrieveService;

import ctd.annotation.RpcService;

/**
 * 个人健康档案
 * 
 */
public class HealthRecordDocumentEntryRetrieveService extends
		CommonDocumentEntryRetrieveService {

	/**
	 * 获取一份健康档案的管辖机构以及责任医生。
	 * 
	 * @param mpiId
	 * @return
	 */
	@RpcService
	public Map<String, Object> getManageInfo(final String mpiId)
			throws DocumentEntryException {
		String hql = "select ManaUnit_Text as manaUnit_Text,ManaDoctor_Text as manaDoctor_text from "
				+ recordClassifying + " where MPIID=? and EffectiveFlag=?";
		try {
			return getDao().queryForMap(hql, new Object[] { mpiId, "0" });
		} catch (DataAccessException e) {
			throw new DocumentEntryException(
					DocumentEntryException.DATABASE_ACCESS_FAILED, e);
		}
	}

	/**
	 * 获取生活习惯。
	 * 
	 * @param mpiId
	 * @return
	 * @throws DocumentEntryException
	 */
	@RpcService
	public Map<String, Object> getLivingHabits(String mpiId)
			throws DocumentEntryException {
		String hql = "select DCID as DCID from " + recordClassifying
				+ " where MPIID=? and EffectiveFlag=?";
		Map<String, Object> map = null;
		try {
			map = getDao().queryForMap(hql, new Object[] { mpiId, "0" });
		} catch (DataAccessException e) {
			throw new DocumentEntryException(
					DocumentEntryException.DATABASE_ACCESS_FAILED, e);
		}
		if (map == null) {
			return null;
		}
		String dcId = (String) map.get("DCID");
		byte[] content = (byte[]) getDefaultDocumentByRecordId(dcId);
		if (content == null) {
			return null;
		}
		try {
			ByteArrayInputStream bais = new ByteArrayInputStream(content);
			Document doc = XMLHelper.getDocument(bais,
					ByteArrayUtils.guessEncoding(content));
			return getHabits(doc);
		} catch (DocumentException e) {
			throw new DocumentEntryException(
					DocumentEntryException.DOCUMENT_FORMAT_ERROR, e);
		}
	}

	/**
	 * 
	 * @param doc
	 * @return
	 */
	private Map<String, Object> getHabits(Document doc) {
		Element root = doc.getRootElement();
		Element lifeStyleEle = root.element("EHR_LIFESTYLE");
		if (lifeStyleEle == null) {
			return null;
		}
		Map<String, Object> lifeStyle = new HashMap<String, Object>();
		Element smokeFlagEle = lifeStyleEle.element("SmokeFlag");
		if (smokeFlagEle != null) {// @@ 是否吸烟
			String smokeFlag = smokeFlagEle.getText();
			if (smokeFlag.equals("2")) {
				lifeStyle.put("smoke", true);
			} else if (smokeFlag.equals("1")) {
				lifeStyle.put("smoke", false);
			}
		}
		Element drinkFlagEle = lifeStyleEle.element("DrinkFlag");
		if (drinkFlagEle != null) {// @@ 是否饮酒
			String drinkFlag = drinkFlagEle.getText();
			if (drinkFlag.equals("1")) {
				lifeStyle.put("drink", false);
			} else if (drinkFlag.equals("2") || drinkFlag.equals("3")
					|| drinkFlag.equals("4")) {
				lifeStyle.put("drink", true);
			}
		}
		Element trainFreqCodeEle = lifeStyleEle.element("TrainFreqCode");
		if (trainFreqCodeEle != null) {// @@ 是否有锻炼
			String trainFreqCode = trainFreqCodeEle.getText();
			if (trainFreqCode.equals("4")) {
				lifeStyle.put("train", false);
			} else if (trainFreqCode.equals("2") || trainFreqCode.equals("3")
					|| trainFreqCode.equals("1")) {
				lifeStyle.put("train", true);
			}
		}
		Element eateHabitEle = lifeStyleEle.element("EateHabit");
		if (eateHabitEle != null) {
			String eateHabit = eateHabitEle.getText();
			if (eateHabit.contains("1")) {// @@ 偏咸
				lifeStyle.put("salt", true);
			}
			if (eateHabit.contains("2")) {// @@ 偏甜
				lifeStyle.put("sweet", true);
			}
			if (eateHabit.contains("3")) {// @@ 偏油腻
				lifeStyle.put("oil", true);
			}
			if (eateHabit.contains("4")) {// @@ 偏辣
				lifeStyle.put("spicy", true);
			}
			if (eateHabit.contains("5")) {// @@ 偏酸
				lifeStyle.put("sour", true);
			}
		}
		return lifeStyle;
	}

	/**
	 * 获取父母的MPIID。
	 * 
	 * @param mpiId
	 * @return 第一个是父亲的mpiId，第二个母亲的mpiId，如果没有就是null。
	 */
	@RpcService
	public String[] getParentMPIID(String mpiId) throws DocumentEntryException {
		String hql = "select MotherID as motherId,FatherID as fatherId from "
				+ recordClassifying + " where MPIID=? and EffectiveFlag=?";
		Map<String, Object> data = null;
		try {
			data = getDao().queryForMap(hql, new Object[] { mpiId, "0" });
		} catch (DataAccessException e) {
			throw new DocumentEntryException(
					DocumentEntryException.DATABASE_ACCESS_FAILED, e);
		}
		if (data == null) {
			return null;
		}
		String[] mpiIds = new String[2];
		mpiIds[0] = (String) data.get("motherId");
		mpiIds[1] = (String) data.get("fatherId");
		return mpiIds;
	}

	/**
	 * 获取配偶的MPIID。
	 * 
	 * @param mpiId
	 * @return
	 * @throws DocumentEntryException
	 */
	@RpcService
	public String getPartnerMPIID(String mpiId) throws DocumentEntryException {
		String hql = "select PartnerID as partnerId from " + recordClassifying
				+ " where MPIID=? and EffectiveFlag=?";
		Map<String, Object> data = null;
		try {
			data = getDao().queryForMap(hql, new Object[] { mpiId, "0" });
		} catch (DataAccessException e) {
			throw new DocumentEntryException(
					DocumentEntryException.DATABASE_ACCESS_FAILED, e);
		}
		if (data == null) {
			return null;
		}
		return (String) data.get("partnerId");
	}

	/**
	 * 获取父母以及配偶的MPIID。
	 * 
	 * @param mpiId
	 * @return 第一个是父亲的mpiId，第二个母亲的mpiId，第三个是配偶的mpiId，如果没有就是null。
	 * @throws DocumentEntryException
	 */
	@RpcService
	public String[] getRelationMPIID(String mpiId)
			throws DocumentEntryException {
		String hql = "select MotherID as motherId,FatherID as fatherId,PartnerID as partnerId from "
				+ recordClassifying + " where MPIID=? and EffectiveFlag=?";
		Map<String, Object> data = null;
		try {
			data = getDao().queryForMap(hql, new Object[] { mpiId, "0" });
		} catch (DataAccessException e) {
			throw new DocumentEntryException(
					DocumentEntryException.DATABASE_ACCESS_FAILED, e);
		}
		if (data == null) {
			return null;
		}
		String[] mpiIds = new String[3];
		mpiIds[0] = (String) data.get("motherId");
		mpiIds[1] = (String) data.get("fatherId");
		mpiIds[2] = (String) data.get("partnerId");
		return mpiIds;
	}

	/**
	 * 查找一个mpiId对应的人的所有孩子的mpiId
	 * 
	 * @param mpiId
	 *            本人的mpiId。
	 * @param sexCode
	 *            本人的性别。
	 * @return 本人所有孩子的mpiId。
	 * @throws DocumentEntryException
	 */
	@RpcService
	public List<String> getChildrenMPIID(String mpiId, String sexCode)
			throws DocumentEntryException {
		String hql = "select MPIID as mpiId from " + recordClassifying;
		Object[] params = null;
		if ("1".equals(sexCode)) {
			hql += " where FatherID=?";
			params = new Object[] { mpiId, "0" };
		} else if ("2".equals(sexCode)) {
			hql += " where MotherID=?";
			params = new Object[] { mpiId, "0" };
		} else {
			hql += " where FatherID=? or MotherID=?";
			params = new Object[] { mpiId, mpiId, "0" };
		}
		hql += " and EffectiveFlag=?";
		List<Map<String, Object>> data = null;
		try {
			data = getDao().queryForList(hql, params);
		} catch (DataAccessException e) {
			throw new DocumentEntryException(
					DocumentEntryException.DATABASE_ACCESS_FAILED, e);
		}
		if (data == null || data.isEmpty()) {
			return null;
		}
		List<String> mpiIds = new ArrayList<String>(data.size());
		for (Map<String, Object> d : data) {
			mpiIds.add((String) d.get("mpiId"));
		}
		return mpiIds;
	}
}
