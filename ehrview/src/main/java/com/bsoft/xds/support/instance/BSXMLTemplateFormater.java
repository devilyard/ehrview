/*
 * @(#)BSXMLTemplateFormater.java Created on Jan 11, 2013 2:21:49 PM
 *
 * 版权：版权所有 B-Soft 保留所有权力。
 */
package com.bsoft.xds.support.instance;

import java.io.ByteArrayInputStream;
import java.io.UnsupportedEncodingException;

import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.io.SAXReader;

import com.bsoft.xds.exception.DocumentEntryException;
import com.bsoft.xds.support.AbstractTemplateFormater;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class BSXMLTemplateFormater extends AbstractTemplateFormater {

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.TemplateFormater#run(byte[])
	 */
	@Override
	public byte[] run(byte[] input) throws DocumentEntryException {
		ByteArrayInputStream bais = new ByteArrayInputStream(input);
		Document doc;
		try {
			doc = new SAXReader().read(bais);
		} catch (DocumentException e) {
			throw new DocumentEntryException(
					DocumentEntryException.DOCUMENT_FORMAT_FAILED, e);
		}
		doc.getRootElement().addAttribute("docFormat", getDestFormat());
		try {
			return doc.asXML().getBytes("UTF-8");
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
			return null;
		}
	}

}
