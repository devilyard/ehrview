/*
 * 
 */
package com.bsoft.ehr.config.labexam;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.dom4j.Element;

import ctd.config.ElementConfig;

/**
 * 
 * 
 */
public class Filter extends ElementConfig {

	private static final long serialVersionUID = -3721448518168971937L;

	private String entryName;
	private List<String> preventRoles = new ArrayList<String>();
	private Map<String, MaskField> maskFields = new HashMap<String, MaskField>();
	private String condition;

	
	public Filter(Element define) {
		setDefineElement(define);
	}

	public void setDefineElement(Element define) {
		super.setDefineElement(define);
		entryName = define.attributeValue("entryName");
		@SuppressWarnings("unchecked")
		List<Element> fieldEles = define.element("maskFields").selectNodes("maskField");
		for (Element fieldEle : fieldEles) {
			MaskField mf = new MaskField();
			mf.setName(fieldEle.attributeValue("name"));
			mf.setMaskDic(fieldEle.attributeValue("maskDic"));
			mf.setResDataStandard(fieldEle.attributeValue("resDataStandard"));
			mf.setStatus(fieldEle.attributeValue("status"));
			addMaskField(mf);
		}
	}
	
	/**
	 * @param entryName
	 * @return
	 */
	public boolean isPrevented(String roleId) {
		if (preventRoles == null || preventRoles.isEmpty()) {
			return false;
		}
		return preventRoles.contains(entryName);
	}

	public String getEntryName() {
		return entryName;
	}

	public void setEntryName(String entryName) {
		this.entryName = entryName;
	}

	public List<String> getPreventRoles() {
		return preventRoles;
	}

	public void setPreventRoles(List<String> preventRoles) {
		this.preventRoles = preventRoles;
	}

	public void addPreventRole(String roleId) {
		this.preventRoles.add(roleId);
	}

	public Map<String, MaskField> getMaskFields() {
		return maskFields;
	}

	public void setMaskFields(Map<String, MaskField> maskFields) {
		this.maskFields = maskFields;
	}

	public void addMaskField(MaskField maskField) {
		this.maskFields.put(maskField.getName(), maskField);
	}

	public String getCondition() {
		return condition;
	}

	public void setCondition(String condition) {
		this.condition = condition;
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
