/*
 * @(#)MPIController.java Created on 2013年11月8日 上午11:29:16
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.bsoft.ehr.auth.LogonValidation;
import com.bsoft.ehr.auth.VisitKey;
import com.bsoft.ehr.controller.support.ControllerResponse;
import com.bsoft.ehr.controller.support.ServiceCode;
import com.bsoft.ehr.extend.dic.DocumentFormat;
import com.bsoft.ehr.service.PublicHealthInfoService;
import com.bsoft.mpi.server.MPIServiceException;
import com.bsoft.mpi.server.rpc.IMPIProvider;
import com.bsoft.xds.exception.DocumentEntryException;
import com.bsoft.xds.support.instance.healthRecord.HealthRecordDocumentEntryRetrieveService;

import ctd.service.core.ServiceException;

/**
 * 基本健康档案。
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
@Controller
@LogonValidation
public class HealthRecordController extends AbstractTemplateViewController {

	private static final Logger logger = LoggerFactory
			.getLogger(HealthRecordController.class);

	@Resource
	private IMPIProvider mpiProvider;
	@Resource
	private HealthRecordDocumentEntryRetrieveService healthRecordDocumentEntryRetrieveService;
	@Resource
	private PublicHealthInfoService publicHealthInfoService;

	/**
	 * @param visitKey
	 * @return
	 */
	@RequestMapping(value = "/healthRecord/getLivingHabitsInfo", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse getLivingHabitsInfo(VisitKey visitKey) {
		String mpiId = visitKey.getMpiId();
		ControllerResponse res = new ControllerResponse();
		try {
			Map<String, Object> habits = healthRecordDocumentEntryRetrieveService
					.getLivingHabits(mpiId);
			res.setBody(habits);
		} catch (DocumentEntryException e) {
			logger.error("Cannot get living habits for : {}", mpiId, e);
			res.setCode(ServiceCode.DATA_ACCESS_FAILED);
			res.setMessage("获取生活习惯信息失败。");
		}
		return res;
	}

	/**
	 * 获取家族谱信息
	 * 
	 * @param request
	 * @param response
	 * @param uuid
	 */
	@RequestMapping("/healthRecord/getFamilyTree")
	@ResponseBody
	public ControllerResponse getFamilyTree(VisitKey vk) {
		String mpiId = vk.getMpiId();
		ControllerResponse response = new ControllerResponse();
		try {
			String[] relationIds = healthRecordDocumentEntryRetrieveService
					.getRelationMPIID(mpiId);
			Map<String, Object> familyData = new HashMap<String, Object>();
			Map<String, String> myself = getPersonInfo(mpiId);
			familyData.put("myself", myself);
			String sex = myself.get("sex");
			familyData.put("childrenInfos", getChildrenInfo(mpiId, sex));// 获取子女信息
			if (relationIds != null) {
				familyData.put("sessionId", vk.getSessionId());
				String fatherId = relationIds[0];
				if (fatherId != null) {// 父方信息
					familyData.put("father", getPersonInfo(fatherId));
					setGrandParentsInfo(familyData, fatherId, "1");
				}
				String motherId = relationIds[1];
				if (motherId != null) {// 母方信息
					familyData.put("mother", getPersonInfo(motherId));
					setGrandParentsInfo(familyData, motherId, "2");
				}
				String partnerId = relationIds[2];
				if (partnerId != null) {// 配偶信息
					familyData.put("partner", getPersonInfo(partnerId));
				}
			}
			response.setBody(familyData);
		} catch (DocumentEntryException e) {
			response.setStatus(ServiceCode.DATA_ACCESS_FAILED, e.getMessage());
		} catch (ServiceException e) {
			response.setStatus(ServiceCode.SERVICE_PROCESS_FAILED,
					e.getMessage());
		}
		return response;
	}

	/**
	 * 获取个人信息
	 * 
	 * @param mpiId
	 * @param map
	 * @throws ServiceException
	 */
	private Map<String, String> getPersonInfo(String mpiId)
			throws ServiceException {
		Map<String, String> perInfo = new HashMap<String, String>();
		Map<String, Object> mpi;
		try {
			mpi = mpiProvider.getMPI(mpiId);
		} catch (MPIServiceException e) {
			throw new ServiceException(e);
		}
		if (mpi != null) {
			perInfo.put("mpiId", mpiId);
			perInfo.put("name", (String) mpi.get("personName"));
			perInfo.put("sex", (String) mpi.get("sexCode"));
		}
		setPersonSickInfo(mpiId, perInfo);
		return perInfo;
	}

	/**
	 * @param mpiId
	 * @param perInfo
	 * @throws ServiceException
	 */
	private void setPersonSickInfo(String mpiId, Map<String, String> perInfo)
			throws ServiceException {
		List<Map<String, Object>> sicks = publicHealthInfoService
				.getHealthRecordInfo(mpiId);
		boolean hasDiabetes = false;
		boolean hasHypertension = false;
		for (Map<String, Object> sick : sicks) {
			if (sick.get("SRCEntryName").equals("MDC_Diabetes")) {
				hasDiabetes = true;
			} else if (sick.get("SRCEntryName").equals("MDC_Hypertension")) {
				hasHypertension = true;
			}
		}
		String sickCode = null;
		String sickName = null;
		if (hasDiabetes && hasHypertension) {
			sickCode = "3";
			sickName = "糖尿病、高血压";
		} else if (hasDiabetes) {
			sickCode = "2";
			sickName = "糖尿病";

		} else if (hasHypertension) {
			sickCode = "1";
			sickName = "高血压";
		}
		perInfo.put("sickCode", sickCode);
		perInfo.put("sickName", sickName);
	}

	/**
	 * 获得祖辈信息
	 * 
	 * @param familyData
	 * @param mpiId
	 * @param num
	 * @throws ServiceException
	 * @throws DocumentEntryException
	 */
	private void setGrandParentsInfo(Map<String, Object> familyData,
			String mpiId, String num) throws ServiceException,
			DocumentEntryException {
		String[] parentIds = healthRecordDocumentEntryRetrieveService
				.getParentMPIID(mpiId);
		if (parentIds != null && parentIds.length > 0) {
			if (parentIds[0] != null) {
				familyData
						.put("grandfather" + num, getPersonInfo(parentIds[0]));
			}
			if (parentIds[1] != null) {
				familyData
						.put("grandmother" + num, getPersonInfo(parentIds[1]));
			}
		}
	}

	/**
	 * 获取子女信息
	 * 
	 * @param mpiId
	 * @param map
	 * @throws ServiceException
	 */
	private List<Map<String, String>> getChildrenInfo(String mpiId, String sex)
			throws ServiceException {
		List<String> children;
		try {
			children = healthRecordDocumentEntryRetrieveService
					.getChildrenMPIID(mpiId, sex);
		} catch (DocumentEntryException e) {
			throw new ServiceException(e);
		}
		if (children == null || children.isEmpty()) {// @@ 没有子女。
			return null;
		}
		List<Map<String, String>> childrenInfos = new ArrayList<Map<String, String>>();
		for (String childId : children) {
			Map<String, String> childInfo = new HashMap<String, String>();
			childInfo.put("mpiId", childId);
			Map<String, Object> info;
			try {
				info = mpiProvider.getMPI(childId);
			} catch (MPIServiceException e) {
				throw new ServiceException(e);
			}
			String childSex = "";
			if (info != null) {
				String childName = info.get("personName").toString();
				childSex = (String) info.get("sexCode");
				childInfo.put("name", childName);
				childInfo.put("sex", childSex);
			}
			setPersonSickInfo(childId, childInfo);
			childrenInfos.add(childInfo);
			// if ("2".equals(childSex)) {
			// girls.add(childInfo);
			// } else {
			// boys.add(childInfo);
			// }
		}
		// childrenInfos.addAll(boys);
		// childrenInfos.addAll(girls);
		return childrenInfos;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.bsoft.ehr.controller.AbstractTemplateViewController#getHtmlDocument
	 * (java.lang.String)
	 */
	@RequestMapping("/healthRecord/getHtmlDocument")
	@ResponseBody
	@Override
	public ControllerResponse getHtmlDocument(String dcId) {
		return super.getHtmlDocument(dcId);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.bsoft.ehr.controller.AbstractTemplateViewController#getDocument(java
	 * .lang.String)
	 */
	@Override
	protected Object getDocument(String dcId) throws DocumentEntryException {
		return healthRecordDocumentEntryRetrieveService.getDocumentByRecordId(
				dcId, DocumentFormat.HTML);
	}
}
