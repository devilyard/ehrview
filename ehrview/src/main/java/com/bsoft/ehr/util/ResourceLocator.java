/*
 * @(#)ResourceLocator.java Created on 2012-8-24 下午3:28:12
 *
 * 版权：版权所有 B-Soft 保留所有权力。
 */
package com.bsoft.ehr.util;

import java.io.IOException;
import java.io.InputStream;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class ResourceLocator {

	/**
	 * @param path
	 * @return
	 * @throws IOException
	 */
	public static String getResource(String path) throws IOException {
		return ServletContextHolder.get().getResource(path).getFile();
	}

	/**
	 * @param path
	 * @return
	 * @throws IOException
	 */
	public static InputStream getResourceAsStream(String path)
			throws IOException {
		return ServletContextHolder.get().getResourceAsStream(path);
	}
}
