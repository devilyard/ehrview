/*
 * @(#)HttpSessionHolder.java Created on Sep 10, 2012 9:18:08 AM
 *
 * ��Ȩ����Ȩ���� B-Soft ��������Ȩ����
 */
package com.bsoft.ehr.auth;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import javax.servlet.http.HttpSession;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class HttpSessionHolder {

	private static Map<String, HttpSession> sessions = new ConcurrentHashMap<String, HttpSession>();

	public static void add(HttpSession session) {
		sessions.put(session.getId(), session);
	}

	public static HttpSession get(String sessionId) {
		return sessionId == null ? null : sessions.get(sessionId);
	}

	public static void remove(String sessionId) {
		sessions.remove(sessionId);
	}
}
