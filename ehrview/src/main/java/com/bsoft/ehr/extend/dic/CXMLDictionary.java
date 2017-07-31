/*
 * @(#)CXMLDictionary.java Created on Oct 22, 2012 3:01:38 PM
 *
 * ��Ȩ����Ȩ���� B-Soft ��������Ȩ����
 */
package com.bsoft.ehr.extend.dic;

import java.util.ArrayList;
import java.util.List;

import ctd.dictionary.DictionaryItem;
import ctd.dictionary.XMLDictionary;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class CXMLDictionary extends XMLDictionary {

	private static final long serialVersionUID = -2819002453480359039L;

	/**
	 * @return
	 */
	public List<String> texts() {
		List<String> texts = new ArrayList<String>(items.size());
		for (DictionaryItem item : items.values()) {
			texts.add(item.getText());
		}
		return texts;
	}
}
