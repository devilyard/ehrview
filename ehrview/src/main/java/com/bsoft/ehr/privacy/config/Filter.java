/*
 * @(#)Filter.java Created on 2013年11月25日 下午4:31:34
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.privacy.config;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class Filter implements Serializable, Cloneable {

	private static final long serialVersionUID = -3721448518168971937L;

	private String entryName;
	private List<String> preventRoles = new ArrayList<String>();
	private Map<String, MaskField> maskFields = new HashMap<String, MaskField>();
	private String condition;
	private Map<String, Variable> variables = new HashMap<String, Variable>();

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

	/**
	 * @param entryName
	 * @param fieldName
	 * @return
	 */
	public MaskField getMaskField(String roleId, String fieldName) {
		if (maskFields == null || maskFields.isEmpty()) {
			return null;
		}
		MaskField mf = maskFields.get(fieldName);
		return mf == null ? null : mf.matchRole(roleId) ? mf : null;
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

	/**
	 * @param roleId
	 * @return
	 */
	public Map<String, MaskField> getMaskFIelds(String roleId) {
		Map<String, MaskField> fields = new HashMap<String, MaskField>();
		for (MaskField mf : maskFields.values()) {
			if (mf.matchRole(roleId)) {
				fields.put(mf.getName(), mf);
			}
		}
		return fields;
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

	public Map<String, Variable> getVariables() {
		return variables;
	}

	public void setVariables(Map<String, Variable> variables) {
		this.variables = variables;
	}

	public void addVariable(Variable variable) {
		variable.setIndex(this.variables.size());
		this.variables.put(variable.getName(), variable);
	}

	/**
	 * @return
	 */
	public Map<String, Object> getConvertedVariables() {
		if (variables == null || variables.isEmpty()) {
			return null;
		}
		Map<String, Object> cvs = new HashMap<String, Object>();
		for (Entry<String, Variable> entry : variables.entrySet()) {
			cvs.put(entry.getKey(), entry.getValue().getConvertedValue());
		}
		return cvs;
	}

	/**
	 * @return
	 */
	public List<Object> getConvertedVariableList() {
		if (variables == null || variables.isEmpty()) {
			return null;
		}
		List<Variable> values = new ArrayList<Variable>(variables.values());
		Collections.sort(values, new Comparator<Variable>() {
			@Override
			public int compare(Variable o1, Variable o2) {
				return o2.getIndex() - o1.getIndex();
			}
		});
		List<Object> list = new ArrayList<Object>(values.size());
		for (Variable v : values) {
			list.add(v.getConvertedValue());
		}
		return list;
	}
}
