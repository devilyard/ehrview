/*
 * @(#)MaskField.java Created on 2013年11月25日 下午4:38:34
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.privacy.config;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class MaskField implements Serializable, Cloneable {

	private static final long serialVersionUID = 3970939859069622074L;
	public static final String DEFAULT_DIRECT = "+";

	private String name;
	private Integer begin;
	private Integer length;
	private String direct = DEFAULT_DIRECT;
	private String maskDic;
	private List<String> roles = new ArrayList<String>();

	/**
	 * @param roleId
	 * @return
	 */
	public boolean matchRole(String roleId) {
		return (roles == null || roles.isEmpty()) ? true : roles
				.contains(roleId);
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Integer getBegin() {
		return begin;
	}

	public void setBegin(Integer begin) {
		this.begin = begin;
	}

	public Integer getLength() {
		return length;
	}

	public void setLength(Integer length) {
		this.length = length;
	}

	public String getDirect() {
		return direct;
	}

	public void setDirect(String direct) {
		this.direct = direct;
	}

	public String getMaskDic() {
		return maskDic;
	}

	public void setMaskDic(String maskDic) {
		this.maskDic = maskDic;
	}

	public List<String> getRoles() {
		return roles;
	}

	public void setRoles(List<String> roles) {
		this.roles = roles;
	}

	/**
	 * @param roleId
	 */
	public void addRole(String roleId) {
		String[] roles = roleId.split(",");
		for (String role : roles) {
			this.roles.add(role);
		}
	}
}
