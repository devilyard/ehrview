/*
 * @(#)PrivacyFilterConfigWriter.java Created on 2014年3月4日 下午3:32:30
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.privacy.config;

import java.io.File;
import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.springframework.core.io.Resource;

import ctd.resource.ResourceCenter;
import ctd.util.xml.XMLHelper;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class PrivacyFilterConfigWriter {

	/**
	 * @param pf
	 * @return
	 * @throws IOException
	 */
	public File save(PrivacyFilter pf) throws IOException {
		Collection<Filter> filters = pf.getFilters();
		Document doc = DocumentHelper.createDocument();
		Element rootElement = DocumentHelper.createElement("filters");
		doc.setRootElement(rootElement);
		if (filters != null && !filters.isEmpty()) {
			for (Filter filter : filters) {
				Element filterElement = rootElement.addElement("filter");
				filterElement.addAttribute("entryName", filter.getEntryName());
				List<String> preventRoles = filter.getPreventRoles();
				if (preventRoles != null && !preventRoles.isEmpty()) {
					Element preventRolesElement = filterElement
							.addElement("preventRoles");
					for (String pr : preventRoles) {
						Element preventRoleElement = preventRolesElement
								.addElement("preventRole");
						preventRoleElement.setText(pr);
					}
				}
				Map<String, MaskField> maskFields = filter.getMaskFields();
				if (maskFields != null && !maskFields.isEmpty()) {
					Element maskFieldsElement = filterElement
							.addElement("maskFields");
					for (MaskField mf : maskFields.values()) {
						Element maskFieldElement = maskFieldsElement
								.addElement("maskField");
						maskFieldElement.addAttribute("name", mf.getName());
						maskFieldElement.addAttribute("begin",
								String.valueOf(mf.getBegin()));
						if (mf.getLength() != null) {
							maskFieldElement.addAttribute("length",
									String.valueOf(mf.getLength()));
						}
						maskFieldElement.addAttribute("direct", mf.getDirect());
						if (mf.getRoles() != null
								&& mf.getRoles().isEmpty() == false) {
							StringBuilder sb = new StringBuilder();
							for (String role : mf.getRoles()) {
								sb.append(",").append(role);
							}
							maskFieldElement.addAttribute("roles",
									sb.substring(1));
						}
						if (StringUtils.isNotEmpty(mf.getMaskDic())) {
							maskFieldElement.addAttribute("maskDic",
									mf.getMaskDic());
						}
					}
				}
				String condition = filter.getCondition();
				if (StringUtils.isNotEmpty(condition)) {
					Element conditionElement = filterElement
							.addElement("filter");
					conditionElement.setText(filter.getCondition());
				}
				Map<String, Variable> variables = filter.getVariables();
				if (variables != null && !variables.isEmpty()) {
					Element variablesElement = filterElement
							.addElement("variables");
					for (Variable v : variables.values()) {
						Element variableElement = variablesElement
								.addElement("variable");
						variableElement.addAttribute("name", v.getName());
						variableElement.addAttribute("value", v.getValue());
						variableElement.addAttribute("type", v.getType());
					}
				}
			}
		}
		Resource r = ResourceCenter.load("WEB-INF/config/dataFilter.xml");
		XMLHelper.putDocument(r.getFile(), doc);
		return r.getFile();
	}
}
