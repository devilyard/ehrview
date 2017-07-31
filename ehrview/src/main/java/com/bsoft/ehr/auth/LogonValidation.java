/*
 * @(#)LogonValidation.java Created on 2013年9月2日上午12:08:24
 * 
 * 版权：版权所有 chinnsii 保留所有权力。
 */
package com.bsoft.ehr.auth;

/**
 * 
 * @author <a href="mailto:rishyonn@gmail.com">zhengshi</a>
 */
@java.lang.annotation.Target(value = { java.lang.annotation.ElementType.METHOD,
		java.lang.annotation.ElementType.TYPE })
@java.lang.annotation.Retention(value = java.lang.annotation.RetentionPolicy.RUNTIME)
@java.lang.annotation.Inherited
@java.lang.annotation.Documented
public @interface LogonValidation {

}
