/*
 * @(#)TestFilePath.java Created on 2014年3月7日 上午10:19:16
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.test;

import java.io.File;
import java.net.URL;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class TestFilePath {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		URL url = ClassLoader.getSystemResource("ehr/dataFilter.xml");
		File f = new File(url.getFile());
		System.out.println("22-------->" + f.exists() + ":" + f.getAbsolutePath());
	}

}
