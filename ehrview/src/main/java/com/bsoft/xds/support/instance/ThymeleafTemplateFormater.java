/*
 * @(#)ThymeleafTemplateFormater.java Created on Feb 1, 2013 4:56:04 PM
 *
 * 版权：版权所有 B-Soft 保留所有权力。
 */
package com.bsoft.xds.support.instance;

import org.dom4j.Document;

import com.bsoft.xds.TemplateFormater;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public interface ThymeleafTemplateFormater extends TemplateFormater {

	/**
	 * 获取数据集文档对应的模板。
	 * 
	 * @param classifying
	 * @return
	 */
	public String getTemplateFile(String classifying, Document document);

}
