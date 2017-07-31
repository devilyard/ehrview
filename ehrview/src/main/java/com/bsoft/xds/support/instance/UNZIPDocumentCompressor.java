/*
 * @(#)UNZIPDocumentCompressor.java Created on 2014年9月1日 上午11:20:51
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.xds.support.instance;

import java.io.IOException;

import com.bsoft.xds.DocumentCompressor;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class UNZIPDocumentCompressor implements DocumentCompressor {

	/* (non-Javadoc)
	 * @see com.bsoft.xds.DocumentCompressor#getAlgorithm()
	 */
	@Override
	public String getAlgorithm() {
		return "UNZIP";
	}

	/* (non-Javadoc)
	 * @see com.bsoft.xds.DocumentCompressor#compress(byte[])
	 */
	@Override
	public byte[] compress(byte[] source) throws IOException {
		return source;
	}

	/* (non-Javadoc)
	 * @see com.bsoft.xds.DocumentCompressor#decompress(byte[])
	 */
	@Override
	public byte[] decompress(byte[] source) throws IOException {
		return source;
	}

}
