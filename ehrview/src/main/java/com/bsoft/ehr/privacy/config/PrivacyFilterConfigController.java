/*
 * @(#)PrivacyFilterConfigController.java Created on 2013年11月25日 下午4:44:25
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.privacy.config;

import java.io.File;
import java.io.IOException;

import org.dom4j.Document;
import org.springframework.core.io.Resource;

import ctd.config.SingleConfigController;
import ctd.util.AppContextHolder;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
@SuppressWarnings("serial")
public class PrivacyFilterConfigController extends SingleConfigController {

	private static PrivacyFilterConfigController instance;

	private PrivacyFilterConfigController() throws IOException {
		Resource res = AppContextHolder.get().getResource("WEB-INF/config/dataFilter.xml");
		setDefineDoc(res.getFile().getPath());
		instance = this;
	}

	public static PrivacyFilterConfigController instance() {
		return instance;
	}

	/**
	 * @return
	 * @throws ControllerException
	 */
	public PrivacyFilter getPrivacyFilter() {
		return (PrivacyFilter) cache.get("ehr.dataFilter");
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see ctd.config.ConfigController#setDefineDoc(org.dom4j.Document)
	 */
	@Override
	public void setDefineDoc(Document doc) {
		try {
			PrivacyFilter pf = new PrivacyFilterConfigLocalLoader()
					.createInstanceFormDoc(doc);
			cache.put("ehr.dataFilter", pf);
		} catch (ControllerException e) {
			e.printStackTrace();
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see ctd.config.SingleConfigController#saveCtrlFile()
	 */
	public File saveCtrlFile() {
		PrivacyFilter pf = getPrivacyFilter();
		if (pf == null) {
			return null;
		}
		try {
			return new PrivacyFilterConfigWriter().save(pf);
		} catch (IOException e) {
			e.printStackTrace();
		}
		return null;
	}
}
