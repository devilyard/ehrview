/*
 * @(#)DataMaskException.java Created on 2013年12月3日 下午3:32:17
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.xds.support.dao;

import org.springframework.dao.DataAccessException;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class DataMaskException extends DataAccessException {

	private static final long serialVersionUID = -4718501980515012025L;

	/**
	 * @param msg
	 * @param cause
	 */
	public DataMaskException(String msg, Throwable cause) {
		super(msg, cause);
	}

	/**
	 * @param msg
	 */
	public DataMaskException(String msg) {
		super(msg);
	}
}
