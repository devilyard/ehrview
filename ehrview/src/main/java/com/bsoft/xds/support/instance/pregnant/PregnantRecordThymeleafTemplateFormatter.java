/*
 * @(#)DebilityChildrenRecordThymeleafDocumentFormatter.java Created on 2014年1月6日 下午7:08:03
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.xds.support.instance.pregnant;

import java.util.HashMap;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.Element;
import org.springframework.beans.factory.annotation.Autowired;

import com.bsoft.ehr.util.MPIProxy;
import com.bsoft.mpi.server.MPIServiceException;
import com.bsoft.mpi.server.rpc.IMPIProvider;
import com.bsoft.xds.exception.DocumentEntryException;
import com.bsoft.xds.support.instance.CommonThymeleafTemplateFormater;
import com.bsoft.xds.support.instance.healthRecord.HealthRecordDocumentEntryRetrieveService;

import ctd.util.context.ContextUtils;

/**
 * 孕妇档案文档HTML转换器。
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class PregnantRecordThymeleafTemplateFormatter extends
		CommonThymeleafTemplateFormater {

	@Autowired
	private IMPIProvider mpiProvider;
	@Autowired
	private HealthRecordDocumentEntryRetrieveService healthRecordService;
	
	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.bsoft.xds.support.instance.AbstractThymeleafTemplateFormater#run(
	 * byte[])
	 */
	public Object run(byte[] input) throws DocumentEntryException {
		try {
			String classifying = (String) ContextUtils.get("classifying");
			Document document = getDocument(input);
			Map<String, Object> extraData = new HashMap<String, Object>();
			String mpiId = (String) ContextUtils.get("mpiId");
			Map<String, Object> mpi = MPIProxy.getBaseMPI(mpiId);
			if (mpi != null) {
				extraData.putAll(mpi);
			}
			String partnerMPIID = healthRecordService.getPartnerMPIID(mpiId);
			if (!StringUtils.isEmpty(partnerMPIID)) {
				Map<String, Object> partner = mpiProvider.getMPI(partnerMPIID);
				if (partner != null && partner.isEmpty() == false) {
					extraData.put("partner_personName", partner.get("personName"));
					extraData.put("partner_birthday", partner.get("birthday"));
					extraData.put("partner_idCard", partner.get("idCard"));
					extraData.put("partner_workCode_text", partner.get("workCode_text"));
					extraData.put("partner_educationCode_text", partner.get("educationCode_text"));
					extraData.put("partner_nationCode_text", partner.get("nationCode_text"));
					extraData.put("partner_contactNo", partner.get("contactNo"));
					extraData.put("partner_workPlace", partner.get("workPlace"));
				}
			}
			return getTemplate(getTemplateFile(classifying, document),
					document, extraData, getTemplateEngine());
		} catch (DocumentException e) {
			throw new DocumentEntryException(
					DocumentEntryException.DOCUMENT_FORMAT_FAILED, e);
		} catch (MPIServiceException e) {
			e.printStackTrace();
			throw new DocumentEntryException(
					DocumentEntryException.DOCUMENT_FORMAT_FAILED, e);
		}
	}

}
