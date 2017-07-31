package com.bsoft.xds.support.instance.children;

import java.io.File;

import org.dom4j.Document;
import org.dom4j.Element;

import com.bsoft.xds.support.instance.CommonThymeleafTemplateFormater;

/**
 * 儿童体检文档HTML转换器。
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class CheckUpThymeleafTemplateFormatter extends
		CommonThymeleafTemplateFormater {

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.support.instance.CommonThymeleafTemplateFormater#
	 * getTemplateFile(java.lang.String, org.dom4j.Document)
	 */
	public String getTemplateFile(String classifying, Document document) {
		Element root = document.getRootElement();
		Element testResultsEle = root.element("CheckupStage");
		int checkupStage = Integer.parseInt(testResultsEle.getTextTrim());
		if (checkupStage < 12) {// @@ 1岁以内
			return acceptableVersion + File.separator + classifying + "_1";
		} else if (checkupStage >= 12 && checkupStage < 36) { // @@ 1~2岁
			return acceptableVersion + File.separator + classifying + "_2";
		} else if (checkupStage >= 36 && checkupStage <= 72) {// @@ 3~6岁
			return acceptableVersion + File.separator + classifying + "_3";
		}
		return null;
	}

}
