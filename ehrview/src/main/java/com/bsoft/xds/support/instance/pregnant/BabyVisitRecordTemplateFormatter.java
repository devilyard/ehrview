package com.bsoft.xds.support.instance.pregnant;

import java.util.HashMap;
import java.util.Map;

import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.Element;
import org.springframework.beans.factory.annotation.Autowired;

import com.bsoft.xds.exception.DocumentEntryException;
import com.bsoft.xds.support.instance.CommonThymeleafTemplateFormater;

import ctd.util.context.ContextUtils;

public class BabyVisitRecordTemplateFormatter extends
CommonThymeleafTemplateFormater{
	
	@Autowired
	private BabyVisitInfoDocumentEntryRetrieveService babyVisitInfo ;
	
	public Object run(byte[] input) throws DocumentEntryException {
		try {
			String classifying = (String) ContextUtils.get("classifying"); 
			Document document = getDocument(input);
			Element root = document.getRootElement();
			Element babyIdEle = root.element("BabyID");
			String babyId = babyIdEle.getTextTrim();
			Map<String, Object> babyMap=babyVisitInfo.getBabyInfoByBabyId(babyId);
			String infoDcId=(String)babyMap.get("DCID");
			byte[]  infoInput=(byte[])babyVisitInfo.getDefaultDocumentByRecordId(infoDcId);
			HashMap<String, Object> m=new HashMap<String, Object>();
			m.put("doc1",  getDocument(infoInput).getRootElement());
			return getTemplate(getTemplateFile(classifying, document),document,m,getTemplateEngine());
		} catch (DocumentException e) {
			throw new DocumentEntryException(
					DocumentEntryException.DOCUMENT_FORMAT_FAILED, e);
		}

		
	}

}
