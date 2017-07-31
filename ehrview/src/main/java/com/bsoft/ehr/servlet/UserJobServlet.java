package com.bsoft.ehr.servlet;

import java.io.IOException;
import java.io.OutputStreamWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang.StringUtils;
import org.dom4j.Document;
import org.dom4j.Element;

import com.bsoft.ehr.util.HttpHelper;

import ctd.accredit.ManageUnit;
import ctd.accredit.Organization;
import ctd.accredit.RoleAlias;
import ctd.accredit.RolesController;
import ctd.accredit.UserFormat;
import ctd.accredit.UsersController;
import ctd.service.core.Service;
import ctd.util.AppContextHolder;
import ctd.util.MD5StringUtil;
import ctd.util.MapperUtil;
import ctd.util.context.Context;

public class UserJobServlet extends HttpServlet {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * javax.servlet.http.HttpServlet#doGet(javax.servlet.http.HttpServletRequest
	 * , javax.servlet.http.HttpServletResponse)
	 */
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
	@SuppressWarnings("unchecked")
	public void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException {
		HttpSession session = HttpHelper.getSession(request, null);
		Map<String, Object> res = new HashMap<String, Object>();
		if (session != null) {
			HttpHelper.writeJSON(session.getId(), response);
			return;
		}

		Context ctx = createContext(request);
		ctx.put("_httpRequest", request);
		ctx.put("_httpResponse", response);

		String uid = request.getParameter("user");
		String pwd = MD5StringUtil.MD5Encode(request.getParameter("password"));
		if (StringUtils.isEmpty(uid) || StringUtils.isEmpty(pwd)) {
			res.put(Service.RES_CODE, 405);
			res.put(Service.RES_MESSAGE, "password emtry");
			return;
		}

		Document doc = UsersController.instance().getUserDoc(uid);
		if (doc == null) {
			res.put(Service.RES_CODE, 406);
			res.put(Service.RES_MESSAGE, "user not found");
			return;
		}
		Element root = doc.getRootElement();
		String password = root.attributeValue("password", "");
		if (pwd.equals(password)) {
			List<Element> roles = root.selectNodes("roles/role");
			List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
			for (Element rel : roles) {
				Map<String, Object> body = new HashMap<String, Object>();
				String rid = rel.attributeValue("id");
				String unit = rel.attributeValue("unit");

				if (!StringUtils.isEmpty(rid) && !StringUtils.isEmpty(unit)) {
					ManageUnit mu = Organization.instance().getUnit(unit);
					if (mu != null) {
						RoleAlias ra = mu.getRoleAlias(rid);
						body.put("key", UserFormat.convertToManageRole(unit, rid));
						body.put("text", ra.getName());
						list.add(body);
					} else if (Organization.instance().isEmpty()) {
						Document r = RolesController.instance().getConfigDoc(
								rid);
						if (r != null) {
							body.put("key", UserFormat.convertToManageRole(unit, rid));
							body.put(
									"text",
									r.getRootElement().attributeValue("name",
											rid));
							list.add(body);
						}

					}
				}
			}
			try {
				writeToResponse(response, list);
			} catch (IOException e) {

			}
		} else {
			res.put(Service.RES_CODE, 408);
			res.put(Service.RES_MESSAGE, "password error");
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
		ctx.put("_webSession", session);
		return ctx;
	}

	private void writeToResponse(HttpServletResponse response,
			List<Map<String, Object>> list) throws IOException {
		response.addHeader("content-type", "text/javascript");
		OutputStreamWriter out = new OutputStreamWriter(
				response.getOutputStream(), "UTF-8");
		MapperUtil.write(out, list);
	}

}
