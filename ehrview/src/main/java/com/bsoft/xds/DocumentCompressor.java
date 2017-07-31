/*
 * @(#)DocumentCompressor.java Created on Jan 15, 2013 10:17:08 AM
 *
 * 版权：版权所有 B-Soft 保留所有权力。
 */
package com.bsoft.xds;

import java.io.IOException;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public interface DocumentCompressor {

	/**
	 * @return 压缩算法的名称。
	 */
	public String getAlgorithm();
	
	/**
	 * 压缩数据。
	 * 
	 * @param source
	 * @return
	 * @throws IOException
	 */
	public byte[] compress(byte[] source) throws IOException;
	
	/**
	 * 解压数据。
	 * 
	 * @param source
	 * @return
	 * @throws IOException
	 */
	public byte[] decompress(byte[] source)  throws IOException;
}
