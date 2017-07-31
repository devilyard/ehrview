/*
 * @(#)SessionIdService.java Created on 2014年5月15日 下午2:35:37
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.service.ssdev;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import com.bsoft.ehr.util.HttpHelper;

import ctd.service.core.Service;
import ctd.service.core.ServiceException;
import ctd.util.context.Context;
import ctd.util.context.ContextUtils;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class SessionIdService implements Service {

	/* (non-Javadoc)
	 * @see ctd.service.core.Service#execute(java.util.Map, java.util.Map, ctd.util.context.Context)
	 */
	@Override
	public void execute(Map<String, Object> req, Map<String, Object> res,
			Context ctx) throws ServiceException {
		HttpServletRequest request = (HttpServletRequest) ContextUtils.get(Context.HTTP_REQUEST);
		String sessionId = HttpHelper.getSessionId(request, null);
		Map<String, Object> data = new HashMap<String, Object>();
		data.put("sessionId", sessionId);
		res.put("body", data);
	}

}
