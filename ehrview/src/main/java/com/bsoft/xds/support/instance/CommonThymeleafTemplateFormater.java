/*
 * @(#)CommonThymeleafTemplateFormater.java Created on Feb 1, 2013 5:34:49 PM
 *
 * 版权：版权所有 B-Soft 保留所有权力。
 */
package com.bsoft.xds.support.instance;

import java.io.File;
import java.util.Map;

import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.thymeleaf.TemplateEngine;

import com.bsoft.ehr.thymeleaf.ThymWebContext;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class CommonThymeleafTemplateFormater extends
		AbstractThymeleafTemplateFormater {

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.bsoft.xds.support.instance.AbstractThymeleafTemplateFormater#getTemplate
	 * (java.lang.String, org.dom4j.Document, java.util.Map,
	 * org.thymeleaf.TemplateEngine)
	 */
	protected String getTemplate(String tplName, Document document,
			Map<String, Object> data, TemplateEngine engine)
			throws DocumentException {
		ThymWebContext ctx = new ThymWebContext();
		ctx.setVariable("doc", document.getRootElement());
		if (data != null) {
			ctx.setVariables(data);
		}
		return engine.process(tplName, ctx);
	}

	/**
	 * @return 
	 */
	public String getTemplateFile(String classifying, Document document) {
		return acceptableVersion + File.separator + classifying;
	}
}
