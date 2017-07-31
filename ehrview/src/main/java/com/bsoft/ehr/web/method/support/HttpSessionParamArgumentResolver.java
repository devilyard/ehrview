/*
 * @(#)HttpSessionParamArgumentResolver.java Created on 2013年11月11日 下午4:43:31
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.web.method.support;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang3.StringUtils;
import org.springframework.core.MethodParameter;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import com.bsoft.ehr.auth.VisitKey;
import com.bsoft.ehr.util.HttpHelper;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class HttpSessionParamArgumentResolver implements
		HandlerMethodArgumentResolver {

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.springframework.web.method.support.HandlerMethodArgumentResolver#
	 * supportsParameter(org.springframework.core.MethodParameter)
	 */
	@Override
	public boolean supportsParameter(MethodParameter parameter) {
		Class<?> paramType = parameter.getParameterType();
		return parameter.hasParameterAnnotation(LogonSession.class)
				&& HttpSession.class.isAssignableFrom(paramType);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.springframework.web.method.support.HandlerMethodArgumentResolver#
	 * resolveArgument(org.springframework.core.MethodParameter,
	 * org.springframework.web.method.support.ModelAndViewContainer,
	 * org.springframework.web.context.request.NativeWebRequest,
	 * org.springframework.web.bind.support.WebDataBinderFactory)
	 */
	@Override
	public Object resolveArgument(MethodParameter parameter,
			ModelAndViewContainer mavContainer, NativeWebRequest webRequest,
			WebDataBinderFactory binderFactory) throws Exception {
		HttpServletRequest request = webRequest
				.getNativeRequest(HttpServletRequest.class);
		String vk = request.getParameter("vk");
		VisitKey visitKey = StringUtils.isEmpty(vk) ? null : new VisitKey(vk);
		return HttpHelper.getSession(request, visitKey);
	}

}
