/*
 * @(#)ControllerResponse.java Created on 2013年11月8日 下午1:49:34
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.controller.support;

import java.io.Serializable;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class ControllerResponse implements Serializable {

	private static final long serialVersionUID = 4459723513108115362L;

	private int code = ServiceCode.OK;
	private String message;
	private Object body;

	public int getCode() {
		return code;
	}

	public void setCode(int code) {
		this.code = code;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public Object getBody() {
		return body;
	}

	public void setBody(Object body) {
		this.body = body;
	}

	public void setStatus(int code, String message) {
		setCode(code);
		setMessage(message);
	}
}
