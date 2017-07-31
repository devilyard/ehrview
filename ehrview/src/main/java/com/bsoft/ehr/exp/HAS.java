/*
 * @(#)HAS.java Created on 2014年1月17日 下午12:21:55
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.exp;

import java.util.List;

import ctd.util.context.Context;
import ctd.util.exp.ExpException;
import ctd.util.exp.ExpRunner;
import ctd.util.exp.Expression;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class HAS extends Expression {

	public HAS() {
		symbol = "has";
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see ctd.util.exp.Expression#run(java.util.List,
	 * ctd.util.context.Context)
	 */
	@Override
	public Object run(List<?> exp, Context context) throws ExpException {
		@SuppressWarnings("unchecked")
		List<Object> range = (List<Object>) ExpRunner.run((List<?>) exp.get(1),
				context);
		if (range == null) {
			return false;
		}
		Object o = ExpRunner.run((List<?>) exp.get(2), context);
		return range.contains(o);
	}

}
