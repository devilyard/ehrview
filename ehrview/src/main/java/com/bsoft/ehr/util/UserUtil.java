/*
 * @(#)UserUtil.java Created on 2014年8月26日 上午9:43:01
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.util;

import ctd.accredit.User;
import ctd.util.context.ContextUtils;
import ctd.util.context.UserContext;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class UserUtil {

	/**
	 * @return
	 */
	public static User getCurrentUser() {
		User user = (User) ContextUtils.get("user.instance");
		if (user != null) {
			return user;
		}
		UserContext uc = (UserContext) ContextUtils.get("user");
		if (uc != null) {
			user = (User) uc.get("instance");
		}
		return user;
	}

	/**
	 * @return
	 */
	public static String getUserId() {
		User user = getCurrentUser();
		return user == null ? null : user.getId();
	}
	
	/**
	 * @return
	 */
	public static String getManageUnitId() {
		User user = getCurrentUser();
		return user == null ? null : user.get("manageUnit.id");
	}

	/**
	 * @return
	 */
	public static String getRoleId() {
		User user = getCurrentUser();
		return user == null ? null : user.get("role.id");
	}
}
