/*
 * @(#)ZIPDocumentCompressor.java Created on Jan 18, 2013 10:05:54 AM
 *
 * 版权：版权所有 B-Soft 保留所有权力。
 */
package com.bsoft.xds.support.instance;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

import com.bsoft.xds.DocumentCompressor;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class ZIPDocumentCompressor implements DocumentCompressor {

	private int buffer = 1024;

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.DocumentCompressor#getAlgorithm()
	 */
	@Override
	public String getAlgorithm() {
		return "zip";
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bsoft.xds.DocumentCompressor#compress(byte[])
	 */
	@Override
	public byte[] compress(byte[] source) throws IOException {
		ZipOutputStream zos = null;
		try {
			ByteArrayOutputStream baos = new ByteArrayOutputStream();
			zos = new ZipOutputStream(baos);
			zos.write(source);
			zos.finish();
			zos.flush();
			return baos.toByteArray();
		} finally {
			if (zos != null) {
				zos.close();
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
		ZipInputStream zis = null;
		try {
			ByteArrayInputStream bais = new ByteArrayInputStream(source);
			zis = new ZipInputStream(bais);
			ByteArrayOutputStream baos = new ByteArrayOutputStream();
			int count = -1;
			byte[] data = new byte[buffer];
			while ((count = zis.read(data, 0, buffer)) != -1) {
				baos.write(data, 0, count);
			}
			return baos.toByteArray();
		} finally {
			if (zis != null) {
				zis.close();
			}
		}
	}

}
