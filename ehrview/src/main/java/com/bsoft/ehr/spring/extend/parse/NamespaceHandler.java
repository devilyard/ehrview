/*
 * @(#)NamespaceHandler.java Created on 2013年11月14日 下午2:53:56
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.spring.extend.parse;

import org.springframework.beans.factory.xml.NamespaceHandlerSupport;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class NamespaceHandler extends NamespaceHandlerSupport {

	/* (non-Javadoc)
	 * @see org.springframework.beans.factory.xml.NamespaceHandler#init()
	 */
	@Override
	public void init() {
		registerBeanDefinitionParser("service", new ServiceDefinitionParser());
	}

}
