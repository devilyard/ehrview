/*
 * @(#)AbstractHibernateDAOSupoortServcie.java Created on 2013年11月13日 上午10:30:43
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.service;

import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate3.support.HibernateDaoSupport;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public abstract class AbstractHibernateDAOSupoortServcie extends
		HibernateDaoSupport {
	
	@Autowired
	public void setHibernateSessionFactory(SessionFactory mySessionFactory) {
		super.setSessionFactory(mySessionFactory);
	}
}
