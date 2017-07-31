/*
 * @(#)AbstractTemplateFormater.java Created on 2013年12月2日 下午3:07:29
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.xds.support;

import com.bsoft.xds.TemplateFormater;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public abstract class AbstractTemplateFormater implements TemplateFormater {

	protected String acceptableVersion = "2011";
	protected String sourceFormat;
	protected String destFormat;
	
	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.TemplateFormater#getAcceptableVersion()
	 */
	@Override
	public String getAcceptableVersion() {
		return acceptableVersion;
	}

	/**
	 * @param acceptableVersion
	 */
	public void setAcceptableVersion(String acceptableVersion) {
		this.acceptableVersion = acceptableVersion;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.TemplateFormater#getSourceFormat()
	 */
	@Override
	public String getSourceFormat() {
		return sourceFormat;
	}

	/**
	 * @param sourceFormat
	 */
	public void setSourceFormat(String sourceFormat) {
		this.sourceFormat = sourceFormat;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.TemplateFormater#getDestFormat()
	 */
	@Override
	public String getDestFormat() {
		return destFormat;
	}

	/**
	 * @param destFormat
	 */
	public void setDestFormat(String destFormat) {
		this.destFormat = destFormat;
	}
}
