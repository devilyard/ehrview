package com.bsoft.ehr.image;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;

public class HttpImageLoader implements IImageLoader {
//	private static String imageHome = "image/";
//	private static String extFix = ".jpg";

	@Override
	public boolean load(String PhotosUrl, OutputStream outputStream)
			throws IOException {
		BufferedInputStream bis = null;
		BufferedOutputStream bos = null;
		try {
			URL url = new URL(PhotosUrl);
			InputStream imageIn = url.openStream();// 文件流
			bis = new BufferedInputStream(imageIn);
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
			if (bos != null) {
				bos.close();
			}
		}
	}
}
