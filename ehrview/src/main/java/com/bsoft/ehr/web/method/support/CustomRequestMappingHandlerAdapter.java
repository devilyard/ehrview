/*
 * @(#)CustomRequestMappingHandlerAdapter.java Created on 2013年11月12日 上午11:08:11
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.web.method.support;

import java.util.ArrayList;
import java.util.List;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
@Configuration
public class CustomRequestMappingHandlerAdapter {

	@Resource
	private RequestMappingHandlerAdapter adapter;

	@PostConstruct
	public void prioritizeCustomArgumentMethodHandlers() {
		List<HandlerMethodArgumentResolver> argumentResolvers = new ArrayList<HandlerMethodArgumentResolver>(
				adapter.getArgumentResolvers().getResolvers());
		List<HandlerMethodArgumentResolver> customResolvers = adapter
				.getCustomArgumentResolvers();
		argumentResolvers.removeAll(customResolvers);
		argumentResolvers.addAll(0, customResolvers);
		adapter.setArgumentResolvers(argumentResolvers);
	}
}
