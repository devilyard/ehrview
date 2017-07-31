/*
 * @(#)Variable.java Created on 2013年11月27日 下午4:05:03
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.privacy.config;

import java.io.Serializable;
import java.util.Date;

import com.bsoft.ehr.util.UserUtil;

import ctd.util.converter.ConversionUtils;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class Variable implements Serializable, Cloneable {

	private static final long serialVersionUID = 6375166708176724480L;

	private String name;
	private String value;
	private String type;
	private int index;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getValue() {
		return value;
	}

	public void setValue(String value) {
		this.value = value;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public int getIndex() {
		return index;
	}

	public void setIndex(int index) {
		this.index = index;
	}

	/**
	 * 内置4个变量，用户角色，用户机构，管辖机构，系统时间。
	 * 
	 * @return
	 */
	public Object getConvertedValue() {
		if (value.startsWith("$")) {
			value = value.substring(1);
			if (value.equalsIgnoreCase("roleId")) {
				return UserUtil.getRoleId();
			}
//			if (value.equalsIgnoreCase("orgnizationId")) {
//				return user == null ? null : urt.getOrganId();
//			}
			if (value.equalsIgnoreCase("manaUnitId")) {
				return UserUtil.getManageUnitId();
			}
			if (value.equalsIgnoreCase("serverDate")) {
				return new Date();
			}
		}
		return ConversionUtils.convert(value, getTargetType());
	}

	/**
	 * @return
	 */
	private Class<?> getTargetType() {
		if (type.equalsIgnoreCase("int") || type.equalsIgnoreCase("integer")) {
			return Integer.class;
		}
		if (type.equalsIgnoreCase("long")) {
			return Long.class;
		}
		if (type.equalsIgnoreCase("date")) {
			return Date.class;
		}
		if (type.equalsIgnoreCase("double")) {
			return Double.class;
		}
		if (type.equalsIgnoreCase("float")) {
			return Float.class;
		}
		return String.class;
	}
}
