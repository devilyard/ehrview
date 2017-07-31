/*
 * @(#)GZIPDocumentCompressor.java Created on Jan 15, 2013 2:08:40 PM
 *
 * 版权：版权所有 B-Soft 保留所有权力。
 */
package com.bsoft.xds.support.instance;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;

import com.bsoft.xds.DocumentCompressor;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class GZIPDocumentCompressor implements DocumentCompressor {

	private int buffer = 1024;
	
	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.DocumentCompressor#getAlgorithm()
	 */
	@Override
	public String getAlgorithm() {
		return "gzip";
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.DocumentCompressor#compress(byte[])
	 */
	@Override
	public byte[] compress(byte[] source) throws IOException {
		GZIPOutputStream gos = null;
		try {
			ByteArrayOutputStream baos = new ByteArrayOutputStream();
			gos = new GZIPOutputStream(baos);
			gos.write(source);
			gos.finish();
			gos.flush();
			return baos.toByteArray();
		} finally {
			if (gos != null) {
				gos.close();
			}
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.DocumentCompressor#decompress(byte[])
	 */
	@Override
	public byte[] decompress(byte[] source) throws IOException {
		GZIPInputStream gis = null;
		try {
			ByteArrayInputStream bais = new ByteArrayInputStream(source);
			gis = new GZIPInputStream(bais);
			ByteArrayOutputStream baos = new ByteArrayOutputStream();
			int count = -1;
			byte[] data = new byte[buffer];
			while ((count = gis.read(data, 0, buffer)) != -1) {
				baos.write(data, 0, count);
			}
			return baos.toByteArray();
		} finally {
			if (gis != null) {
				gis.close();
			}
		}
	}

}
