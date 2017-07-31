/*
 * @(#)LogonInterfaceServlet.java Created on Nov 30, 2012 11:45:04 AM
 *
 * ��Ȩ����Ȩ���� B-Soft ��������Ȩ����
 */
package com.bsoft.ehr.servlet;

import java.io.IOException;
import java.io.OutputStreamWriter;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.bsoft.ehr.auth.HttpSessionHolder;
import com.bsoft.ehr.util.HttpHelper;

import ctd.service.core.Service;
import ctd.service.core.ServiceExecutor;
import ctd.util.AppContextHolder;
import ctd.util.JSONUtils;
import ctd.util.context.Context;
import ctd.util.context.ContextUtils;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class LogonInterfaceServlet extends HttpServlet {

	private static final long serialVersionUID = 2976143999869481731L;

	private static final Logger logger = LoggerFactory
			.getLogger(LogonInterfaceServlet.class);

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
		this.doPost(request, response);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * javax.servlet.http.HttpServlet#doPost(javax.servlet.http.HttpServletRequest
	 * , javax.servlet.http.HttpServletResponse)
	 */
	@Override
	public void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException {
		HttpSession session = HttpHelper.getSession(request, null);
		if (session != null) {
			HttpHelper.writeJSON(session.getId(), response);
			return;
		}
		Context ctx = createContext(request);
		ctx.put(Context.HTTP_REQUEST, request);
		ctx.put(Context.HTTP_RESPONSE, response);
		ContextUtils.setContext(ctx);

		String uid = (String) request.getParameter("user");
		String pwd = (String) request.getParameter("password");
		String rid = (String) request.getParameter("roleId");

		Map<String, Object> req = new HashMap<String, Object>(3);
		req.put("uid", uid);
		req.put("urole", rid);
		req.put("psw", pwd);
		Map<String, Object> res = new HashMap<String, Object>();

		ServiceExecutor.execute("logon", req, res, ctx);

		int code = (Integer) res.get(Service.RES_CODE);
		if (code == 200 || code == 20) {
			session = HttpHelper.getSession(request, null);
			if (session == null) {
				HttpSessionHolder.add(request.getSession());
			}
			res.put(HttpHelper.SESSIONID_KEY_NAME, request.getSession().getId());
		}
		try {
			writeToResponse(response, res);
		} catch (IOException e) {
			logger.error("Write http response error.", e);
			for (Entry<String, Object> entry : res.entrySet()) {
				response.addHeader(entry.getKey(), entry.getValue().toString());
			}
		}
	}

	public static Context createContext(HttpServletRequest request) {
		Context ctx = new Context();
		HttpSession session = request.getSession(false);
		if (session == null) {
			return ctx;
		}
		ctx.put("_applicationContext", AppContextHolder.get());
		// session.setAttribute("_SERVER_IP", SystemInitialize.getSERVER_IP());
		session.setAttribute("_SERVER_PORT",
				String.valueOf(request.getLocalPort()));
		session.setAttribute("_CLIENT_IP", request.getRemoteAddr());
		session.setAttribute("_USER_AGENT", request.getHeader("user-agent"));
		session.setAttribute("psw", request.getParameter("password"));
		session.setAttribute("userId", request.getParameter("user"));
		ctx.put("_webSession", session);
		return ctx;
	}

	private void writeToResponse(HttpServletResponse response,
			Map<String, Object> res) throws IOException {
		response.addHeader("content-type", "text/javascript");
		OutputStreamWriter out = new OutputStreamWriter(
				response.getOutputStream(), "UTF-8");
		JSONUtils.write(out, res);
	}

}
