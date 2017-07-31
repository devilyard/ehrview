/*
 * @(#)SessionListener.java Created on Sep 12, 2012 4:56:48 PM
 *
 * ��Ȩ����Ȩ���� B-Soft ��������Ȩ����
 */
package com.bsoft.ehr.auth;

import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class SessionListener implements HttpSessionListener {

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * javax.servlet.http.HttpSessionListener#sessionCreated(javax.servlet.http
	 * .HttpSessionEvent)
	 */
	@Override
	public void sessionCreated(HttpSessionEvent httpSessionEvent) {
		
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * javax.servlet.http.HttpSessionListener#sessionDestroyed(javax.servlet
	 * .http.HttpSessionEvent)
	 */
	@Override
	public void sessionDestroyed(HttpSessionEvent httpSessionEvent) {
		HttpSessionHolder.remove(httpSessionEvent.getSession().getId());
	}

}
