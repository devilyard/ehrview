/*
 * @(#)HttpSession.java Created on 2013年11月11日 下午4:42:22
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.web.method.support;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface LogonSession {

}
