/*
 * @(#)ControllerException.java Created on 2014年8月25日 下午4:55:20
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.privacy.config;


/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
@SuppressWarnings("serial")
public class ControllerException extends Exception {
	
	public static final int INSTANCE_NOT_FOUND = 404;
	public static final int IO_ERROR = 409;
	public static final int PARSE_ERROR = 401;
	
	private int code;
	
	public ControllerException(int code) {
		super();
		setCode(code);
	}

	public ControllerException(String msg) {
		super(msg);
	}

	public ControllerException(int code, String msg) {
		super(msg);
		setCode(code);
	}

	public ControllerException(Throwable e) {
		super(e);
	}

	public ControllerException(Throwable e, int code) {
		super(e);
		setCode(code);
	}

	public ControllerException(String msg, Throwable e) {
		super(msg, e);
	}

	public ControllerException(int code, String msg, Throwable e) {
		super(msg, e);
		setCode(code);
	}
	
	public boolean isInstanceNotFound(){
		return code == INSTANCE_NOT_FOUND;
	}

	/**
	 * @return the code
	 */
	public int getCode() {
		return code;
	}

	/**
	 * @param code the code to set
	 */
	public void setCode(int code) {
		this.code = code;
	}

}

