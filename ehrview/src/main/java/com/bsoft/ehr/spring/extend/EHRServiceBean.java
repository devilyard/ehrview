/*
 * @(#)EHRServiceBean.java Created on 2013年11月19日 上午9:36:30
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.spring.extend;

import ctd.net.rpc.beans.ServiceBean;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class EHRServiceBean<T> extends ServiceBean<T> {

	private static final long serialVersionUID = 2563264085834251692L;

	@Override
	public Class<?> getObjectType() {
		return Object.class;
	}
}
