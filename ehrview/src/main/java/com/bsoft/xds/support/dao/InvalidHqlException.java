/*
 * @(#)InvalidHqlException.java Created on 2013年11月29日 上午9:54:30
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.xds.support.dao;

import org.springframework.dao.DataAccessException;

/**
 * 验证HQL时，如果验证失败抛出此异常。
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class InvalidHqlException extends DataAccessException {

	private static final long serialVersionUID = 2774047683103414034L;

	public InvalidHqlException(String message) {
		super(message);
	}

	public InvalidHqlException(String message, Throwable t) {
		super(message, t);
	}
}
