/*
 * @(#)ServletContextHolder.java Created on 2012-9-2 下午2:42:39
 *
 * 版权：版权所有 B-Soft 保留所有权力。
 */
package com.bsoft.ehr.util;

import javax.servlet.ServletContext;

import org.springframework.context.ApplicationContext;
import org.springframework.web.context.WebApplicationContext;

import ctd.util.AppContextHolder;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class ServletContextHolder {

	private static ServletContext servletContext;

	public static void setServletContext(ServletContext servletContext) {
		ServletContextHolder.servletContext = servletContext;
	}

	public static ServletContext get() {
		if (servletContext == null) {
			ApplicationContext ac = AppContextHolder.get();
			if (ac != null && WebApplicationContext.class.isInstance(ac)) {
				WebApplicationContext wac = (WebApplicationContext) ac;
				servletContext = wac.getServletContext();
			}
		}
		return servletContext;
	}
}
