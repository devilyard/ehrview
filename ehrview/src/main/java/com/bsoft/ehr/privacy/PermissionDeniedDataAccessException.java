/*
 * @(#)PermissionDeniedDataAccessException.java Created on 2013年11月27日 上午9:40:27
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.privacy;

import org.springframework.dao.DataAccessException;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class PermissionDeniedDataAccessException extends DataAccessException {

	private static final long serialVersionUID = -3899648278433908327L;

	/**
	 * @param msg
	 */
	public PermissionDeniedDataAccessException(String msg) {
		super(msg);
	}

	/**
	 * @param msg
	 * @param t
	 */
	public PermissionDeniedDataAccessException(String msg, Throwable t) {
		super(msg, t);
	}
}
