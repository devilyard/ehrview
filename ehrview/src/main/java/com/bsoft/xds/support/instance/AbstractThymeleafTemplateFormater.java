/*
 * @(#)AbstractThymeleafTemplateFormater.java Created on Feb 1, 2013 5:05:09 PM
 *
 * 版权：版权所有 B-Soft 保留所有权力。
 */
package com.bsoft.xds.support.instance;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.Date;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.Element;
import org.thymeleaf.TemplateEngine;

import com.bsoft.ehr.util.ByteArrayUtils;
import com.bsoft.ehr.util.DateUtils;
import com.bsoft.ehr.util.MPIProxy;
import com.bsoft.ehr.util.XMLHelper;
import com.bsoft.mpi.server.MPIServiceException;
import com.bsoft.xds.exception.DocumentEntryException;
import com.bsoft.xds.support.AbstractTemplateFormater;

import ctd.util.context.ContextUtils;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public abstract class AbstractThymeleafTemplateFormater extends
		AbstractTemplateFormater implements ThymeleafTemplateFormater {

	private TemplateEngine templateEngine;

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.TemplateFormater#run(byte[])
	 */
	@Override
	public Object run(byte[] input) throws DocumentEntryException {
		try {
			String classifying = (String) ContextUtils.get("classifying");
			Document document = getDocument(input);
//			Element root = document.getRootElement();
//			Element mpiIdEle = root.element("MPIID");
			String mpiId = (String) ContextUtils.get("mpiId");;
			Map<String, Object> mpi = MPIProxy.getBaseMPI(mpiId);
//			if (mpiIdEle != null && StringUtils.isNotEmpty(mpiIdEle.getText())) {
//				mpiId = mpiIdEle.getTextTrim();
//			}
			if (mpi != null) {
				Date birth = (Date) mpi.get("birthday");
				if (birth != null) {
					mpi.put("age", DateUtils.getAnniversary(birth, new Date()));
				}
			}
			return getTemplate(getTemplateFile(classifying, document),
					document, mpi, getTemplateEngine());
		} catch (DocumentException e) {
			throw new DocumentEntryException(
					DocumentEntryException.DOCUMENT_FORMAT_FAILED, e);
		} catch (MPIServiceException e) {
			throw new DocumentEntryException(
					DocumentEntryException.DOCUMENT_FORMAT_FAILED, e);
		}
	}

	/**
	 * 转换模板，子类需要覆盖本方法，可在此进行查询个人信息等操作。
	 * 
	 * @param tplName
	 * @param document
	 *            文档数据
	 * @param data
	 *            非文档中的附加数据，比如个人信息。
	 * @param engine
	 * @return
	 * @throws DocumentException
	 */
	protected abstract String getTemplate(String tplName, Document document,
			Map<String, Object> data, TemplateEngine engine)
			throws DocumentException;

	/**
	 * @param xml
	 * @return
	 * @throws DocumentException
	 */
	protected Document getDocument(byte[] xml) throws DocumentException {
		InputStream ins = new ByteArrayInputStream(xml);
		return XMLHelper.getDocument(ins, ByteArrayUtils.guessEncoding(xml));
	}

	/**
	 * @return
	 */
	public TemplateEngine getTemplateEngine() {
		return templateEngine;
	}

	/**
	 * @param templateEngine
	 */
	public void setTemplateEngine(TemplateEngine templateEngine) {
		this.templateEngine = templateEngine;
	}

}
