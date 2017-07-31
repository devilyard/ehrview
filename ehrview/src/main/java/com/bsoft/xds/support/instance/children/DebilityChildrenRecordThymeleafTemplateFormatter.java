/*
 * @(#)DebilityChildrenRecordThymeleafDocumentFormatter.java Created on 2014年1月6日 下午7:08:03
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.xds.support.instance.children;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.Element;
import org.springframework.beans.factory.annotation.Autowired;

import com.bsoft.ehr.util.ByteArrayUtils;
import com.bsoft.ehr.util.MPIProxy;
import com.bsoft.ehr.util.XMLHelper;
import com.bsoft.mpi.server.MPIServiceException;
import com.bsoft.mpi.server.rpc.IMPIProvider;
import com.bsoft.xds.exception.DocumentEntryException;
import com.bsoft.xds.support.instance.CommonThymeleafTemplateFormater;
import com.bsoft.xds.support.instance.healthRecord.HealthRecordDocumentEntryRetrieveService;

import ctd.util.context.ContextUtils;

/**
 * 体弱儿童档案HTML文档转换器。
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class DebilityChildrenRecordThymeleafTemplateFormatter extends
		CommonThymeleafTemplateFormater {

	@Autowired
	private DebilityChildrenVisitDocumentEntryRetrieveService debilityVisitService;
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
			Element root = document.getRootElement();
			Element recordIdEle = root.element("RecordID");
			String recordId = recordIdEle.getTextTrim();
			List<Map<String, Object>> recordList = debilityVisitService
					.getVisitDocumentList(recordId);
			List<Element> visitList = new ArrayList<Element>();
			Map<String, Object> extraData = new HashMap<String, Object>();
			if (recordList != null && recordList.isEmpty() == false) {
				extraData.put("visitData", visitList);
				for (Map<String, Object> record : recordList) {
					byte[] content = (byte[]) record.get("docContent");
					if (content != null && content.length > 0) {
						InputStream ins = new ByteArrayInputStream(content);
						Document dd=XMLHelper.getDocument(ins,
								ByteArrayUtils.guessEncoding(content));
						visitList.add(dd.getRootElement());
					}
				}
			}
			String mpiId = (String) ContextUtils.get("mpiId");
			Map<String, Object> mpi = MPIProxy.getBaseMPI(mpiId);
			if (mpi != null) {
				extraData.putAll(mpi);
			}
			String[] parentMPIID = healthRecordService.getParentMPIID(mpiId);
			if (parentMPIID[0] != null) {
				Map<String, Object> fatherMPI = mpiProvider
						.getMPI(parentMPIID[0]);
				if (fatherMPI != null) {
					extraData.put("fatherName", fatherMPI.get("personName"));
				}
			}
			if (parentMPIID[1] != null) {
				Map<String, Object> motherMPI = mpiProvider
						.getMPI(parentMPIID[1]);
				if (motherMPI != null) {
					extraData.put("motherName", motherMPI.get("personName"));
				}
			}
			return getTemplate(getTemplateFile(classifying, document),
					document, extraData, getTemplateEngine());
		} catch (DocumentException e) {
			throw new DocumentEntryException(
					DocumentEntryException.DOCUMENT_FORMAT_FAILED, e);
		} catch (MPIServiceException e) {
			throw new DocumentEntryException(
					DocumentEntryException.DOCUMENT_FORMAT_FAILED, e);
		}
	}

}
