/**
 * 
 */
package com.bsoft.ehr.controller.support.logon;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang3.StringUtils;

import com.bsoft.ehr.auth.HttpSessionHolder;
import com.bsoft.ehr.controller.support.ServiceCode;
import com.bsoft.ehr.util.HttpHelper;

import ctd.service.core.Logon;
import ctd.service.core.Service;
import ctd.util.context.Context;
import ctd.util.context.ContextUtils;

/**
 * @author chinnsii
 * 
 */
public class EHRViewAspectLogon extends Logon {

	/*
	 * (non-Javadoc)
	 * 
	 * @see ctd.service.core.Logon#execute(java.util.Map, java.util.Map,
	 * ctd.util.context.Context)
	 */
	@Override
	public void execute(Map<String, Object> req, Map<String, Object> res,
			Context ctx) {
		super.execute(req, res, ctx);
		afterLogon(res);
	}

	/**
	 * @param res
	 */
	public void afterLogon(Map<String, Object> res) {
		HttpServletRequest request = (HttpServletRequest) ContextUtils
				.get(Context.HTTP_REQUEST);
		Integer code = (Integer) res.get(Service.RES_CODE);
		if (code != null && code == ServiceCode.OK) {
			processExtendOperation(request, res);
		}
	}

	/**
	 * @param request
	 * @param body
	 */
	private void processExtendOperation(HttpServletRequest request,
			Map<String, Object> res) {
		HttpSession httpSession = request.getSession(false);
		if (httpSession == null) {
			return;
		}
		res.put(HttpHelper.SESSIONID_KEY_NAME, httpSession.getId());
		// String uid = (String) httpSession
		// .getAttribute(UserRoleTokenUtils.SESSION_UID_KEY);
		// if (uid == null) {
		// return;
		// }
		request.setAttribute(HttpHelper.SESSIONID_KEY_NAME, httpSession.getId());
		HttpSessionHolder.add(httpSession);
		// User user;
		// try {
		// user = AccountCenter.getUser(uid);
		// } catch (ControllerException e) {
		// // TODO Auto-generated catch block
		// e.printStackTrace();
		// }
		// httpSession.setAttribute("user", user);

		// @@ 如果url里带了mpiId参数，登录后直接跳转到EHRView浏览界面。
		String mpiId = request.getParameter("mpiId");
		if (!StringUtils.isEmpty(mpiId)) {
			res.put("gotoViewPortal", true);
			res.put("vk", httpSession.getId() + "-" + mpiId);
		}
	}
}
