package com.bsoft.ehr.util;

import java.io.InputStream;

import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.io.SAXReader;

public class XMLHelper extends ctd.util.xml.XMLHelper {

	/**
	 * 使用指定的编码解析xml。
	 * 
	 * @param ins
	 * @param encoding
	 * @return
	 * @throws DocumentException
	 */
	public static Document getDocument(InputStream ins, String encoding)
			throws DocumentException {
		SAXReader oReader = new SAXReader();
		oReader.setEncoding(encoding);
		return oReader.read(ins);
	}

}
