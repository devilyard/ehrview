package com.bsoft.xds;

import com.bsoft.xds.exception.DocumentEntryException;

public interface TemplateFormater {

	/**
	 * 能支持的文档版本。
	 * 
	 * @return
	 */
	public String getAcceptableVersion();

	/**
	 * @return 源文档的格式。
	 */
	public String getSourceFormat();

	/**
	 * @return 转换后的格式。
	 */
	public String getDestFormat();

	/**
	 * 执行转换。
	 * 
	 * @param input
	 * @return
	 * @throws DocumentEntryException
	 */
	public Object run(byte[] input) throws DocumentEntryException;
}
