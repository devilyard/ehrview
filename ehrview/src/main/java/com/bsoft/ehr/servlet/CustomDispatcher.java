package com.bsoft.ehr.servlet;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.bsoft.ehr.auth.HttpSessionHolder;
import com.bsoft.ehr.auth.VisitKey;
import com.bsoft.ehr.util.HttpHelper;
import com.bsoft.ehr.util.ServletContextHolder;

import ctd.accredit.User;
import ctd.service.core.Service;
import ctd.service.core.ServiceExecutor;
import ctd.servlet.Dispatcher;
import ctd.util.CodeTool;
import ctd.util.collect.ServiceInfoCollector;
import ctd.util.context.Context;
import ctd.util.context.ContextUtils;
import ctd.util.context.UserContext;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
@SuppressWarnings("serial")
public class CustomDispatcher extends Dispatcher {

	private static final Logger LOGGER = LoggerFactory
			.getLogger(Dispatcher.class);

	private static final long SERVICE_INVOKE_TIMECOST_WARNNING_LEVEL = 3000;
	private static final String CONTENT_TYPE_JSON = "application/json";
	private static final int UNKNOW_REQUEST_CODE = 400;
	private static final String UNKNOW_REQUEST_MSG = "UnknowRequest";
	private static final String SERVICE = "serviceId";

	/*
	 * (non-Javadoc)
	 * 
	 * @see ctd.servlet.Dispatcher#init(javax.servlet.ServletConfig)
	 */
	public void init(ServletConfig cfg) throws ServletException {
		super.init(cfg);
		ServletContextHolder.setServletContext(cfg.getServletContext());
	}

	@Override
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) {
		if (request.getContentType().indexOf(CONTENT_TYPE_JSON) == -1) {
			setResponseHeaders(response, UNKNOW_REQUEST_CODE,
					UNKNOW_REQUEST_MSG);
			return;
		}
		Map<String, Object> req = parseRequest(request);
		String serviceId = null;
		Map<String, Object> res = new HashMap<String, Object>();
		Date startDt = new Date();
		try {
			if (!req.containsKey(SERVICE)) { // missing service id.
				setCodeToResponse(res, 401);
			} else {
				serviceId = (String) req.get("serviceId");
				res.put("serviceId", serviceId);
				User user = getUser(request);
				Context ctx = createContext(request);
				ContextUtils.setContext(ctx);
				ctx.put(Context.HTTP_REQUEST, request);
				ctx.put(Context.HTTP_RESPONSE, response);
				HttpSession session = HttpSessionHolder.get(HttpHelper.getSessionId(request, null));
				if(session == null){
					HttpSessionHolder.add(request.getSession(false));
				}
				if (user != null) { // 宸茬粡鐧诲綍
					Context userCtx = new UserContext(user);
					ctx.putCtx("user", userCtx); // create ctx with user
					ServiceExecutor.execute(serviceId, req, res, ctx);

				} else { // 鏈櫥褰曪紝鎴栫櫥褰曞凡杩囨湡
					if (serviceId.equals("logon")
							|| serviceId.equals("ssologon")
							|| serviceId.equals("roleLocator")) {
						ServiceExecutor.execute(serviceId, req, res, ctx);
					} else { // 閫氱煡瀹㈡埛绔湭鐧诲綍锛屾垨鐧诲綍宸茶繃鏈�
						setCodeToResponse(res, 403);
					}
				}
			}
			writeToResponse(response, res);
		} catch (Exception e) {
			setCodeToResponse(res, 500, e.getMessage());
		} finally {
			ContextUtils.clear();
			Date endDt = new Date();
			long timeCost = endDt.getTime() - startDt.getTime();
			ServiceInfoCollector.instance().add(serviceId, timeCost, startDt);
			String reqStr = req != null ? req.toString() : "";
			if (timeCost >= SERVICE_INVOKE_TIMECOST_WARNNING_LEVEL) {
				LOGGER.warn("service[" + serviceId + "] call time is too long:"
						+ timeCost + "\r\nrequestJSON:" + reqStr);
			}
		}
		int code = (Integer) res.get(Service.RES_CODE);
		String msg = (String) res.get(Service.RES_MESSAGE);
		setResponseHeaders(response, code, msg);
	}

	/**
	 * @param res
	 * @param code
	 * @param message
	 */
	private void setCodeToResponse(Map<String, Object> res, int code,
			String message) {
		CodeTool.setCodeToResponse(res, code, message);
		res.put("code", code);
		res.put("msg", message);
	}

	/**
	 * @param res
	 * @param code
	 */
	private void setCodeToResponse(Map<String, Object> res, int code) {
		CodeTool.setCodeToResponse(res, code);
		res.put("code", code);
	}

	/**
	 * @param response
	 * @param code
	 * @param msg
	 */
	private void setResponseHeaders(HttpServletResponse response, int code,
			String msg) {
		response.setHeader(Service.RES_CODE, String.valueOf(code));
		response.setHeader(Service.RES_MESSAGE, msg);
	}
}
