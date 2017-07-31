/*
 * @(#)PrivacyFilterConfigLocalLoader.java Created on 2013年11月25日 下午4:48:32
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.privacy.config;

import java.util.List;

import org.dom4j.Document;
import org.dom4j.Element;

import ctd.util.converter.ConversionUtils;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class PrivacyFilterConfigLocalLoader {

	/**
	 * @param doc
	 * @return
	 * @throws ControllerException
	 */
	public PrivacyFilter createInstanceFormDoc(Document doc)
			throws ControllerException {
		Element root = doc.getRootElement();
		if (root == null) {
			throw new ControllerException(ControllerException.PARSE_ERROR,
					"root element missing.");
		}
		PrivacyFilter pf = ConversionUtils.convert(root, PrivacyFilter.class);
		@SuppressWarnings("unchecked")
		List<Element> filterEles = root.elements("filter");
		if (filterEles.isEmpty()) {
			return pf;
		}
		for (Element filterEle : filterEles) {
			Filter filter = ConversionUtils.convert(filterEle, Filter.class);
			filter.setEntryName(filterEle.attributeValue("entryName"));
			Element conditionEle = filterEle.element("condition");
			if (conditionEle != null) {
				filter.setCondition(conditionEle.getTextTrim());
			}
			Element preventRolesEle = filterEle.element("preventRoles");
			processPreventRolesSubElement(preventRolesEle, filter);
			Element maskFieldsEle = filterEle.element("maskFields");
			processMaskFieldsSubElement(maskFieldsEle, filter);
			Element variablesEle = filterEle.element("variables");
			processVariablesSubElement(variablesEle, filter);
			pf.addFilter(filter);
		}

		return pf;
	}

	/**
	 * @param variablesEle
	 * @param filter
	 */
	private void processVariablesSubElement(Element element, Filter filter) {
		if (element == null) {
			return;
		}
		@SuppressWarnings("unchecked")
		List<Element> variableEles = element.elements("variables");
		for (Element variableEle : variableEles) {
			Variable v = new Variable();
			v.setName(variableEle.attributeValue("name"));
			v.setValue(variableEle.attributeValue("value"));
			v.setType(getAttributeValue(variableEle, "type", "string"));
			filter.addVariable(v);
		}

	}

	/**
	 * @param element
	 * @param filter
	 */
	private void processPreventRolesSubElement(Element element, Filter filter) {
		if (element == null) {
			return;
		}
		@SuppressWarnings("unchecked")
		List<Element> preventRoleEles = element.elements("preventRole");
		for (Element pre : preventRoleEles) {
			filter.addPreventRole(pre.getText());
		}
	}

	/**
	 * @param element
	 * @param filter
	 */
	private void processMaskFieldsSubElement(Element element, Filter filter) {
		if (element == null) {
			return;
		}
		@SuppressWarnings("unchecked")
		List<Element> fieldEles = element.elements("maskField");
		for (Element fieldEle : fieldEles) {
			MaskField mf = new MaskField();
			mf.setDirect(getAttributeValue(fieldEle, "direct",
					MaskField.DEFAULT_DIRECT));
			mf.setLength(getIntegerAttributeValue(fieldEle, "length"));
			mf.setName(fieldEle.attributeValue("name"));
			mf.setBegin(getIntegerAttributeValue(fieldEle, "begin"));
			mf.addRole(fieldEle.attributeValue("roles"));
			mf.setMaskDic(fieldEle.attributeValue("maskDic"));
			filter.addMaskField(mf);
		}
	}

	/**
	 * @param element
	 * @param name
	 * @param defaultValue
	 * @return
	 */
	private String getAttributeValue(Element element, String name,
			String defaultValue) {
		String value = element.attributeValue(name);
		return value == null ? defaultValue : value;
	}

	/**
	 * @param element
	 * @param name
	 * @return
	 */
	private Integer getIntegerAttributeValue(Element element, String name) {
		String value = element.attributeValue(name);
		return value == null ? null : Integer.valueOf(value);
	}
}
