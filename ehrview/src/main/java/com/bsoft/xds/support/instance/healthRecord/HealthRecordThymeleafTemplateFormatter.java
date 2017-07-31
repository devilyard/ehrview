/*
 * @(#)DebilityChildrenRecordThymeleafDocumentFormatter.java Created on 2014年1月6日 下午7:08:03
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.xds.support.instance.healthRecord;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.Element;

import com.bsoft.ehr.util.MPIProxy;
import com.bsoft.mpi.server.MPIServiceException;
import com.bsoft.xds.exception.DocumentEntryException;
import com.bsoft.xds.support.instance.CommonThymeleafTemplateFormater;

import ctd.util.context.ContextUtils;

/**
 * 健康档案文档HTML转换器。
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class HealthRecordThymeleafTemplateFormatter extends
		CommonThymeleafTemplateFormater {

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
			Element root = document.getRootElement();
			Map<String, Object> extraData = new HashMap<String, Object>();
			String mpiId = (String) ContextUtils.get("mpiId");
			Map<String, Object> mpi = MPIProxy.getBaseMPI(mpiId);
			if (mpi != null) {
				extraData.putAll(mpi);
			}
			@SuppressWarnings("unchecked")
			List<Element> phEles = root.elements("EHR_PastHistory");
			if (phEles != null && phEles.isEmpty() == false) {
				for (Element ele : phEles) {
					Element pastHistoryCodeEle = ele.element("PastHistoryCode");
					Element diseaseTextEle = ele.element("DiseaseText");
					extraData.put(
							"PastHistoryCode"
									+ pastHistoryCodeEle.getTextTrim(),
							diseaseTextEle.getTextTrim());
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
