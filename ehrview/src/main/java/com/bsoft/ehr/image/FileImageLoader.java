package com.bsoft.ehr.image;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import com.bsoft.ehr.util.ResourceLocator;

public class FileImageLoader implements IImageLoader {
	private static String imageHome = "image/";
	private static String extFix = ".jpg";

	@Override
	public boolean load(String mpiId, OutputStream outputStream)
			throws IOException {
		BufferedInputStream bis = null;
		BufferedOutputStream bos = null;
		try {
			InputStream is = ResourceLocator.getResourceAsStream(imageHome
					+ mpiId + extFix);
			if (is == null) {
				return false;
			}
			bis = new BufferedInputStream(is);
			byte data[] = new byte[4096];
			int size = 0;
			bos = new BufferedOutputStream(outputStream);
			size = bis.read(data);
			while (size != -1) {
				bos.write(data, 0, size);
				size = bis.read(data);
			}
			bos.flush();// 清空输出缓冲流
			return true;
		} finally {
			if (bis != null) {
				bis.close();
			}
		}
	}
}
