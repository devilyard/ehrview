/*
 * @(#)LogonInterfaceServlet.java Created on Nov 30, 2012 11:45:04 AM
 *
 * ��Ȩ����Ȩ���� B-Soft ��������Ȩ����
 */
package com.bsoft.ehr.api.sso;

import java.io.IOException;
import java.io.OutputStream;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.bsoft.ehr.controller.support.ServiceCode;
import com.bsoft.ehr.controller.support.logon.EHRViewAspectLogon;
import com.bsoft.ehr.util.HttpHelper;

import ctd.accredit.User;
import ctd.accredit.UsersController;
import ctd.service.core.Service;
import ctd.util.JSONUtils;
import ctd.util.MD5StringUtil;
import ctd.util.ServletUtils;
import ctd.util.collect.OnlineUserInfo;
import ctd.util.context.Context;
import ctd.util.context.ContextUtils;
import ctd.util.context.UserContext;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class LogonInterfaceServlet extends HttpServlet {

	private static final long serialVersionUID = 2976143999869481731L;

	private static final Logger logger = LoggerFactory
			.getLogger(LogonInterfaceServlet.class);
	private EHRViewAspectLogon aspectLogon = new EHRViewAspectLogon();

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * javax.servlet.http.HttpServlet#doGet(javax.servlet.http.HttpServletRequest
	 * , javax.servlet.http.HttpServletResponse)
	 */
	@Override
	public void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException {
		Map<String, Object> resData = new HashMap<String, Object>();
		resData.put(Service.RES_CODE, ServiceCode.OK);
		resData.put(Service.RES_MESSAGE, "succeed");
		Map<String, Object> body = new HashMap<String, Object>();
		resData.put("body", body);
		Map<String, Object> params = new HashMap<String, Object>();
		Enumeration<String> names = request.getParameterNames();
		while (names.hasMoreElements()) {
			String name = names.nextElement();
			params.put(name, request.getParameter(name));
		}
		process(request, response, params, resData);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * javax.servlet.http.HttpServlet#doPost(javax.servlet.http.HttpServletRequest
	 * , javax.servlet.http.HttpServletResponse)
	 */
	@SuppressWarnings("unchecked")
	@Override
	public void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException {
		Map<String, Object> resData = new HashMap<String, Object>();
		resData.put(Service.RES_CODE, ServiceCode.OK);
		resData.put(Service.RES_MESSAGE, "succeed");
		Map<String, Object> body = new HashMap<String, Object>();
		resData.put("body", body);
		Map<String, Object> params;
		try {
			params = JSONUtils.parse(request.getInputStream(), HashMap.class);
		} catch (IOException e1) {
			resData.put(Service.RES_CODE, ServiceCode.SERVICE_PROCESS_FAILED);
			resData.put(Service.RES_MESSAGE,
					"Failed to parse input parameters.");
			jsonOutput(response, resData);
			return;
		}
		process(request, response, params, resData);
	}

	/**
	 * @param request
	 * @param response
	 * @param params
	 * @param resData
	 */
	private void process(HttpServletRequest request,
			HttpServletResponse response, Map<String, Object> params,
			Map<String, Object> resData) {
		HttpSession session = HttpHelper.getSession(request, null);
		if (session != null) {
			resData.put(HttpHelper.SESSIONID_KEY_NAME, session.getId());
			jsonOutput(response, resData);
			return;
		}
		String uid = (String) params.get("user");
		String pwd = (String) params.get("password");
		String rid = (String) params.get("roleId");
		if (StringUtils.isEmpty(uid) || StringUtils.isEmpty(pwd)
				|| StringUtils.isEmpty(rid)) {
			resData.put(Service.RES_CODE, ServiceCode.SERVICE_PROCESS_FAILED);
			resData.put(Service.RES_MESSAGE,
					"user, roleId, password(case sensitive) is mandantory.");
			jsonOutput(response, resData);
			return;
		}
		User user = UsersController.instance().getUser(uid);
		if (user == null) {
			resData.put(Service.RES_CODE, ServiceCode.TARGET_NOT_FOUND);
			resData.put(Service.RES_MESSAGE, "User not found.");
			jsonOutput(response, resData);
			return;
		}
		if (!user.validatePassword(MD5StringUtil.MD5Encode(pwd))) {
			resData.put(Service.RES_CODE, ServiceCode.TARGET_NOT_FOUND);
			resData.put(Service.RES_MESSAGE, "User/password not match.");
			jsonOutput(response, resData);
			return;
		}
		session = request.getSession(); // create session now
		session.setAttribute(OnlineUserInfo.CLIENT_IP, request.getRemoteAddr());
		session.setAttribute("uid", uid);
		try {
			resData.put(HttpHelper.SESSIONID_KEY_NAME, session.getId());
			ContextUtils.setContext(new Context());
			ContextUtils.put(Context.HTTP_REQUEST, request);
			ContextUtils.put("user", new UserContext(user));
			aspectLogon.afterLogon(resData);
			jsonOutput(response, resData);
		} finally {
			ContextUtils.clear();
		}
	}

	/**
	 * @param response
	 * @param resData
	 */
	protected void jsonOutput(HttpServletResponse response, Object resData) {
		response.setContentType(ServletUtils.JSON_TYPE);
		response.setCharacterEncoding("UTF-8");
		OutputStream os;
		try {
			os = response.getOutputStream();
			JSONUtils.write(os, resData);
		} catch (IOException e) {
			logger.error("Write http response error.", e);
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
		}
	}

}
