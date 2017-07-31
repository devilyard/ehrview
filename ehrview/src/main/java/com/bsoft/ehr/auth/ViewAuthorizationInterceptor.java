/*
 * @(#)ViewAuthorizationInterceptor.java Created on 2014年3月4日 下午5:26:58
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.auth;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang3.StringUtils;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import com.bsoft.ehr.controller.support.ServiceCode;
import com.bsoft.ehr.service.MPILevelService;
import com.bsoft.ehr.util.DictionariesUtil;
import com.bsoft.ehr.util.UserUtil;

import ctd.dictionary.Dictionaries;
import ctd.dictionary.Dictionary;
import ctd.dictionary.DictionaryItem;
import ctd.util.context.ContextUtils;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class ViewAuthorizationInterceptor implements HandlerInterceptor {

	@Resource
	private MPILevelService mpiLevelService;

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
		HttpSession session = StringUtils.isEmpty(key) ? null
				: HttpSessionHolder.get(new VisitKey(key).getSessionId());
		if (session == null) {
			return true;
		}
		VisitKey vk = new VisitKey(key);
		ContextUtils.put("mpiId", vk.getMpiId());
		String roleId = UserUtil.getRoleId();
		Dictionary dic = DictionariesUtil.getDic("commonRoles");
		DictionaryItem di = dic.getItem(roleId);
		if (di == null) {
			dic = DictionariesUtil.getDic("authorizedRoles");
			di = dic.getItem(roleId);
		}
		if (di != null) {
			if (mpiLevelService.isPrivacy(vk.getMpiId())) {
				response.setStatus(ServiceCode.ACCESS_UNAUTHORIZED);
				return false;
			}
		}
		return true;
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
	public void postHandle(HttpServletRequest request,
			HttpServletResponse response, Object handler,
			ModelAndView modelAndView) throws Exception {

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
	public void afterCompletion(HttpServletRequest request,
			HttpServletResponse response, Object handler, Exception ex)
			throws Exception {

	}

}
