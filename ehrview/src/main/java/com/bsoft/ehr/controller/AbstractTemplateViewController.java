/*
 * @(#)AbstractTemplateViewController.java Created on 2013年12月18日 上午10:55:45
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.bsoft.ehr.controller.support.ControllerResponse;
import com.bsoft.xds.exception.DocumentEntryException;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public abstract class AbstractTemplateViewController {

	private static final Logger logger = LoggerFactory
			.getLogger(AbstractTemplateViewController.class);

	/**
	 * @param dcId
	 * @return
	 * @throws DocumentEntryException
	 */
	protected abstract Object getDocument(String dcId)
			throws DocumentEntryException;

	/**
	 * @param dcId
	 * @return
	 */
	public ControllerResponse getHtmlDocument(String dcId) {
		ControllerResponse res = new ControllerResponse();
		String doc = null;
		Object data;
		try {
			data = getDocument(dcId);
		} catch (DocumentEntryException e) {
			logger.error("Cannot get document for {}", dcId, e);
			res.setStatus(e.getCode(), e.getMessage());
			return res;
		}
		if (data == null) {
			doc = getNoRecordStr();
		} else {
			doc = (String) data;
		}
		res.setBody(doc);
		return res;
	}

	/**
	 * 返回无记录时或异常时html内容。
	 * 
	 * @return
	 */
	protected String getNoRecordStr() {
		return "<html xmlns=\"http://www.w3.org/1999/xhtml\"><body><h1 align=\"center\">无记录</h1></body></html>";
	}
}
