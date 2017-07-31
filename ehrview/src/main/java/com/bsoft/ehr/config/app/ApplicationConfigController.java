/*
 * @(#)ModuleConfigController.java Created on Oct 22, 2012 5:27:10 PM
 *
 * ��Ȩ����Ȩ���� B-Soft ��������Ȩ����
 */
package com.bsoft.ehr.config.app;

import java.io.IOException;

import org.dom4j.Document;
import org.springframework.core.io.Resource;

import com.bsoft.ehr.privacy.config.ControllerException;

import ctd.config.SingleConfigController;
import ctd.util.AppContextHolder;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
@SuppressWarnings("serial")
public class ApplicationConfigController extends SingleConfigController {

	private static ApplicationConfigController instance;

	private ApplicationConfigController() throws IOException {
		Resource res = AppContextHolder.get().getResource("WEB-INF/config/application-config.xml");
		setDefineDoc(res.getFile().getPath());
		instance = this;
	}

	public static ApplicationConfigController instance() {
		return instance;
	}

	public Application getApplication() {
		return (Application) cache.get("ehr.application-config");
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see ctd.config.ConfigController#setDefineDoc(org.dom4j.Document)
	 */
	@Override
	public void setDefineDoc(Document doc) {
		try {
			Application app = new ApplicationConfigLocalLoader()
					.createInstanceFormDoc(doc);
			cache.put("ehr.application-config", app);
		} catch (ControllerException e) {
			e.printStackTrace();
		}
	}
}
