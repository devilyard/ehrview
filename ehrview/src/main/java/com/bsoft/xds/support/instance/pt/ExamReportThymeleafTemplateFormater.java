/*
 * @(#)LabReportThymeleafTemplateFormater.java Created on 2013年12月17日 下午3:49:30
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.xds.support.instance.pt;

import java.io.File;

import org.apache.commons.lang.StringUtils;
import org.dom4j.Document;
import org.dom4j.Element;

import com.bsoft.xds.support.instance.CommonThymeleafTemplateFormater;

/**
 * 检验报告单转HTML转换器。
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class ExamReportThymeleafTemplateFormater extends
		CommonThymeleafTemplateFormater {

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.instance.CommonThymeleafTemplateFormater#
	 * getTemplateFile(java.lang.String, org.dom4j.Document)
	 */
//	public String getTemplateFile(String classifying, Document document) {
//		Element root = document.getRootElement();
//		Element testResultsEle = root.element("TestResults");
//		String snr = testResultsEle.element("TestResult").elementText(
//				"SampleNO_Result");
//		if (StringUtils.isNotEmpty(snr)) {// @@ 常规报告。
//			return acceptableVersion + File.separator + classifying;
//		}
//		// @@ 微生物培养报告。
//		return acceptableVersion + File.separator + classifying + "_Anti";
//	}
}
