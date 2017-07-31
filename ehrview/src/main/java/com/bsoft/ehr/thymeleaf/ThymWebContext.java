/*
 * @(#)ThymWebContext.java Created on 2012-9-2 下午2:39:37
 *
 * 版权：版权所有 B-Soft 保留所有权力。
 */
package com.bsoft.ehr.thymeleaf;

import java.util.Calendar;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.thymeleaf.context.AbstractContext;
import org.thymeleaf.context.IContextExecutionInfo;
import org.thymeleaf.context.IWebContext;
import org.thymeleaf.context.VariablesMap;
import org.thymeleaf.context.WebContextExecutionInfo;

import com.bsoft.ehr.util.ServletContextHolder;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class ThymWebContext extends AbstractContext implements IWebContext {

	public ThymWebContext() {
		super();
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see org.thymeleaf.context.IWebContext#getHttpServletRequest()
	 */
	@Override
	public HttpServletRequest getHttpServletRequest() {
		return null;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see org.thymeleaf.context.IWebContext#getHttpSession()
	 */
	@Override
	public HttpSession getHttpSession() {
		return null;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see org.thymeleaf.context.IWebContext#getServletContext()
	 */
	@Override
	public ServletContext getServletContext() {
		return ServletContextHolder.get();
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see org.thymeleaf.context.IWebContext#getRequestParameters()
	 */
	@Override
	public VariablesMap<String, String[]> getRequestParameters() {
		return null;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see org.thymeleaf.context.IWebContext#getRequestAttributes()
	 */
	@Override
	public VariablesMap<String, Object> getRequestAttributes() {
		return null;
	}
	
	/* (non-Javadoc)
	 * @see org.thymeleaf.context.IWebContext#getHttpServletResponse()
	 */
	
	public HttpServletResponse getHttpServletResponse() {
		return null;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see org.thymeleaf.context.IWebContext#getSessionAttributes()
	 */
	@Override
	public VariablesMap<String, Object> getSessionAttributes() {
		return null;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see org.thymeleaf.context.IWebContext#getApplicationAttributes()
	 */
	@Override
	public VariablesMap<String, Object> getApplicationAttributes() {
		return null;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.thymeleaf.context.AbstractContext#buildContextExecutionInfo(java.
	 * lang.String)
	 */
	@Override
	protected IContextExecutionInfo buildContextExecutionInfo(
			String templateName) {
		Calendar now = Calendar.getInstance();
		return new WebContextExecutionInfo(templateName, now);
	}

}
