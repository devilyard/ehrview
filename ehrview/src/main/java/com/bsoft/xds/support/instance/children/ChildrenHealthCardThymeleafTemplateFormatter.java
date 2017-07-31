/*
 * @(#)DebilityChildrenRecordThymeleafDocumentFormatter.java Created on 2014年1月6日 下午7:08:03
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.xds.support.instance.children;

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
 * 儿童档案HTML转换器。
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class ChildrenHealthCardThymeleafTemplateFormatter extends
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
			String[] parentMPIID = healthRecordService.getParentMPIID(mpiId);
			if (parentMPIID != null) {// @@ 获取父亲的个人信息
				if (parentMPIID.length > 0 && parentMPIID[0] != null) {
					Map<String, Object> fatherMPI = mpiProvider
							.getMPI(parentMPIID[0]);
					if (fatherMPI != null) {
						extraData.put("father_personName",
								fatherMPI.get("personName"));
						extraData.put("father_birthday",
								fatherMPI.get("birthday"));
						extraData.put("father_work",
								fatherMPI.get("workCode_text"));
						extraData.put("father_workPlace",
								fatherMPI.get("workPlace"));
						extraData.put("father_contactNo",
								fatherMPI.get("contactNo"));
					}
				}
				if (parentMPIID.length > 1 && parentMPIID[1] != null) {// @@ 获取母亲的个人信息。
					Map<String, Object> motherMPI = mpiProvider
							.getMPI(parentMPIID[1]);
					if (motherMPI != null) {
						extraData.put("mother_personName",
								motherMPI.get("personName"));
						extraData.put("mother_birthday",
								motherMPI.get("birthday"));
						extraData.put("mother_work",
								motherMPI.get("workCode_text"));
						extraData.put("mother_workPlace",
								motherMPI.get("workPlace"));
						extraData.put("mother_contactNo",
								motherMPI.get("contactNo"));
					}
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
