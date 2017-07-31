/*
 * @(#)PrivacyFilter.java Created on 2013年11月26日 下午4:50:10
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.privacy.config;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.bsoft.ehr.util.UserUtil;

import ctd.config.ElementConfig;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class PrivacyFilter extends ElementConfig {

	private static final long serialVersionUID = 8142818424171786312L;

	private Map<String, Filter> filters = new HashMap<String, Filter>();

	/**
	 * @param entryName
	 * @return
	 */
	public boolean isPrevented(String entryName) {
		Filter filter = getFilter(entryName);
		String roleId = getRoleId();
		return filter == null ? false : filter.isPrevented(roleId);
	}

	/**
	 * 
	 * 
	 * @param entryName
	 * @return
	 */
	public String getFilterCondition(String entryName) {
		Filter filter = getFilter(entryName);
		return filter == null ? null : filter.getCondition();
	}

	/**
	 * @param entryName
	 * @return
	 */
	public Map<String, Object> getVariables(String entryName) {
		Filter filter = getFilter(entryName);
		return filter == null ? null : filter.getConvertedVariables();
	}

	/**
	 * @param entryName
	 * @return
	 */
	public List<Object> getVariableList(String entryName) {
		Filter filter = getFilter(entryName);
		return filter == null ? null : filter.getConvertedVariableList();
	}

	/**
	 * @param entryName
	 * @param fieldName
	 * @return
	 */
	public MaskField getMaskField(String entryName, String fieldName) {
		Filter filter = getFilter(entryName);
		String roleId = getRoleId();
		return filter == null ? null : filter.getMaskField(roleId, fieldName);
	}

	/**
	 * @param entryName
	 * @return
	 */
	public Map<String, MaskField> getMaskFields(String entryName) {
		Filter filter = getFilter(entryName);
		String roleId = getRoleId();
		return filter == null ? null : filter.getMaskFIelds(roleId);
	}

	/**
	 * @return
	 */
	public Collection<Filter> getFilters() {
		return filters.values();
	}

	/**
	 * 根据角色id获取过滤信息。
	 * 
	 * @param entryName
	 * @return
	 */
	public Filter getFilter(String entryName) {
		return filters.get(entryName);
	}

	/**
	 * 
	 * @return
	 */
	public String getRoleId() {
		// @@ TODO 目前RPC服务调用没有用户认证，所以没有用户时只能不作控制。
		return UserUtil.getRoleId();
	}

	/**
	 * @param roleId
	 * @param filter
	 */
	public void addFilter(Filter filter) {
		this.filters.put(filter.getEntryName(), filter);
	}
}
