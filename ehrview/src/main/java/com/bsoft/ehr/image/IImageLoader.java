package com.bsoft.ehr.image;

import java.io.IOException;
import java.io.OutputStream;

public interface IImageLoader {
	
	public static final String responseContentType = "image/jpeg;charset=UTF-8";

	/**
	 * @param empiId
	 * @param outputStream
	 * @return 是否成功加载。
	 * @throws IOException
	 */
	public boolean load(String empiId, OutputStream outputStream) throws IOException;
	
}
