/*
 * @(#)LogonInterceptor.java Created on 2013年9月1日下午9:54:28
 * 
 * 版权：版权所有 chinnsii 保留所有权力。
 */
package com.bsoft.ehr.auth;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import com.alibaba.fastjson.JSON;
import com.bsoft.ehr.controller.support.ControllerResponse;
import com.bsoft.ehr.controller.support.ServiceCode;

import ctd.accredit.User;
import ctd.accredit.UsersController;
import ctd.util.context.Context;
import ctd.util.context.ContextUtils;
import ctd.util.context.UserContext;

/**
 * 
 * @author <a href="mailto:rishyonn@gmail.com">zhengshi</a>
 */
public class LogonInterceptor implements HandlerInterceptor {

	private static final Logger logger = LoggerFactory
			.getLogger(LogonInterceptor.class);

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.springframework.web.servlet.HandlerInterceptor#preHandle(javax.servlet
	 * .http.HttpServletRequest, javax.servlet.http.HttpServletResponse,
	 * java.lang.Object)
	 */
	@Override
	public boolean preHandle(HttpServletRequest request,
			HttpServletResponse response, Object handler) throws Exception {
		if (!(handler instanceof HandlerMethod)) {
			return true;
		}
		HandlerMethod method = (HandlerMethod) handler;
		LogonValidation logonValidation = method.getBean().getClass()
				.getAnnotation(LogonValidation.class);
		logonValidation = (logonValidation == null ? method
				.getMethodAnnotation(LogonValidation.class) : logonValidation);
		if (logonValidation == null) {
			return true;
		}
		String key = request.getParameter("vk");
		// if (StringUtils.isEmpty(key)) {
		// BufferedReader reader = new BufferedReader(new
		// InputStreamReader(request.getInputStream()));
		// String param = reader.readLine();
		// @SuppressWarnings("unchecked")
		// Map<String, Object> params = (Map<String, Object>) JSON.parse(param);
		// if (params != null) {
		// key = (String) params.get("vk");
		// }
		// }
		HttpSession session = StringUtils.isEmpty(key) ? null
				: HttpSessionHolder.get(new VisitKey(key).getSessionId());
		if (session == null) {
			logger.info("Not logon...");
			ControllerResponse cres = new ControllerResponse();
			cres.setCode(ServiceCode.NOT_LOGON);
			cres.setMessage("登录超时，请重新登录");
			String json = JSON.toJSONString(cres);
			response.setCharacterEncoding("UTF-8");
			response.setContentType("application/json");
			response.getWriter().write(json);
			return false;
		}
		User user = getUser(session);
		if (ContextUtils.getContext() == null) {
			ContextUtils.setContext(new Context());
		}
		ContextUtils.put("user", new UserContext(user));
		ContextUtils.put(Context.HTTP_REQUEST, request);
		ContextUtils.put(Context.WEB_SESSION, session);
		return true;
	}

	/**
	 * @param session
	 * @return
	 */
	private User getUser(HttpSession session) {
		if (session == null) {
			return null;
		}
		String uid = (String) session.getAttribute("uid");
		if (uid == null) {
			return null;
		}
		return UsersController.instance().getUser(uid);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.springframework.web.servlet.HandlerInterceptor#postHandle(javax.servlet
	 * .http.HttpServletRequest, javax.servlet.http.HttpServletResponse,
	 * java.lang.Object, org.springframework.web.servlet.ModelAndView)
	 */
	@Override
	public void postHandle(HttpServletRequest arg0, HttpServletResponse arg1,
			Object arg2, ModelAndView arg3) throws Exception {

	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.springframework.web.servlet.HandlerInterceptor#afterCompletion(javax
	 * .servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse,
	 * java.lang.Object, java.lang.Exception)
	 */
	@Override
	public void afterCompletion(HttpServletRequest arg0,
			HttpServletResponse arg1, Object arg2, Exception arg3)
			throws Exception {
		ContextUtils.clear();
	}
}
